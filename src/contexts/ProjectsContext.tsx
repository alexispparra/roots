"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// --- Type Definitions ---

export type Participant = {
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
};

export type Category = {
  name: string;
  budget: number;
};

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  date: Timestamp;
  description: string;
  amountARS: number;
  exchangeRate: number;
  // Expense-specific fields
  category?: string;
  user?: string;
  paymentMethod?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  address: string;
  googleSheetId?: string;
  ownerEmail: string;
  participants: Participant[];
  categories: Category[];
  transactions: Transaction[];
  status: ProjectStatus;
  createdAt: Timestamp;
};

export type AddProjectData = {
  name: string;
  description?: string;
  address: string;
  googleSheetId?: string;
};

export type UpdateProjectData = Partial<Omit<Project, 'id' | 'ownerEmail' | 'participants' | 'createdAt'>>;

// --- Context Definition ---

type ProjectsContextType = {
  projects: Project[];
  loading: boolean;
  addProject: (projectData: AddProjectData) => Promise<string | null>;
  getProjectById: (id: string | null) => Project | undefined;
  updateProject: (projectId: string, projectData: UpdateProjectData) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// --- Provider Component ---

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // This query requires a composite index in Firestore on (participantsEmails, createdAt)
    const q = query(
      collection(db, "projects"), 
      where("participantsEmails", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userProjects: Project[] = [];
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          // Robust validation to prevent crashes from malformed data
          if (!data.name || !data.ownerEmail || !data.participants) {
            console.warn("Skipping malformed project document:", doc.id);
            return;
          }

          userProjects.push({
            id: doc.id,
            name: data.name,
            description: data.description || '',
            address: data.address || '',
            googleSheetId: data.googleSheetId || '',
            ownerEmail: data.ownerEmail,
            participants: (data.participants || []).map((p: any) => ({
                email: p.email || '',
                name: String(p.name || 'Usuario'), // Ensure name is a string
                role: p.role || 'viewer',
            })).filter((p: Participant) => p.email), // Filter out invalid participants
            categories: data.categories || [],
            transactions: data.transactions || [],
            status: data.status || 'planning',
            createdAt: data.createdAt || Timestamp.now(),
          });
        } catch (e) {
          console.error("Error parsing project document:", doc.id, e);
        }
      });
      
      // Sort projects by creation date, newest first
      userProjects.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setProjects(userProjects);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudieron cargar los proyectos. Revisa tu conexión a internet o la configuración de Firestore.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const getProjectById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return projects.find(p => p.id === id);
  }, [projects]);

  const addProject = async (projectData: AddProjectData): Promise<string | null> => {
    if (!user || !db) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para crear un proyecto." });
      return null;
    }

    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        ownerEmail: user.email,
        participants: [{ email: user.email, name: user.displayName || 'Propietario', role: 'admin' }],
        participantsEmails: [user.email], // For querying
        categories: [],
        transactions: [],
        status: 'planning',
        createdAt: Timestamp.now(),
      });
      toast({ title: "¡Proyecto Creado!", description: `El proyecto "${projectData.name}" ha sido creado.` });
      return newProjectRef.id;
    } catch (error) {
      console.error("Error creating project: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo crear el proyecto." });
      return null;
    }
  };

  const updateProject = async (projectId: string, projectData: UpdateProjectData) => {
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
      await updateDoc(projectRef, projectData);
      toast({ title: "Proyecto Actualizado", description: "Los detalles del proyecto se han guardado." });
    } catch (error) {
        console.error("Error updating project: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el proyecto." });
    }
  };

  const contextValue: ProjectsContextType = {
    projects,
    loading,
    addProject,
    getProjectById,
    updateProject,
  };

  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
};

// --- Custom Hook ---

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
