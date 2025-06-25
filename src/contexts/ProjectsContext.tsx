
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, Timestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { USE_MOCK_DATA, mockProjects } from '@/lib/mock-data';

// --- Type Definitions ---
export type UserRole = 'admin' | 'editor' | 'viewer';

export type Participant = {
  email: string;
  name: string;
  role: UserRole;
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
  name:string;
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
  status: ProjectStatus;
};

export type UpdateProjectData = Partial<Omit<Project, 'id' | 'ownerEmail' | 'participants' | 'createdAt'>>;

// --- Context Definition ---

type ProjectsContextType = {
  projects: Project[];
  loading: boolean;
  addProject: (projectData: AddProjectData) => Promise<string | null>;
  getProjectById: (id: string | null) => Project | undefined;
  getUserRoleForProject: (projectId: string) => UserRole | null;
  updateProject: (projectId: string, projectData: UpdateProjectData) => Promise<void>;
  addTransaction: (projectId: string, transactionData: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (projectId: string, transactionId: string, transactionData: Partial<Omit<Transaction, 'id' | 'type'>>) => Promise<void>;
  deleteTransaction: (projectId: string, transactionId: string) => Promise<void>;
  addCategory: (projectId: string, categoryData: Category) => Promise<void>;
  updateCategory: (projectId: string, categoryName: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (projectId: string, categoryName: string) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// --- Provider Component ---

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If using mock data, load it and bypass Firebase.
    if (USE_MOCK_DATA) {
      setProjects(mockProjects);
      setLoading(false);
      return;
    }
    
    // Original logic for Firebase
    if (!user || !db) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "projects"), 
      where("participantsEmails", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userProjects: Project[] = [];
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          userProjects.push({
            id: doc.id,
            ...data
          } as Project);
      });
      userProjects.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setProjects(userProjects);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudieron cargar los proyectos.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const getProjectById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return projects.find(p => p.id === id);
  }, [projects]);

  const getUserRoleForProject = useCallback((projectId: string): UserRole | null => {
    if (!user) return null;
    const project = getProjectById(projectId);
    if (!project) return null;
    const participant = project.participants.find(p => p.email === user.email);
    return participant ? participant.role : null;
  }, [projects, user, getProjectById]);

  const addProject = async (projectData: AddProjectData): Promise<string | null> => {
    if (USE_MOCK_DATA) {
      const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        ownerEmail: 'testing@roots.app',
        participants: [{ email: 'testing@roots.app', name: 'Usuario de Prueba', role: 'admin' }],
        categories: [],
        transactions: [],
        createdAt: Timestamp.now(),
      };
      setProjects(prev => [newProject, ...prev]);
      toast({ title: "Proyecto Añadido (Modo Prueba)" });
      return newProject.id;
    }

    if (!user || !db) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para crear un proyecto." });
      return null;
    }
    // Real Firebase logic...
    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        ownerEmail: user.email,
        participants: [{ email: user.email, name: user.displayName || 'Propietario', role: 'admin' }],
        participantsEmails: [user.email],
        categories: [],
        transactions: [],
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
     if (USE_MOCK_DATA) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...projectData } as Project : p));
      toast({ title: "Proyecto Actualizado (Modo Prueba)" });
      return;
    }
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
  
  const addTransaction = async (projectId: string, transactionData: Omit<Transaction, 'id'>) => {
    if (USE_MOCK_DATA) {
        const newTransaction = { ...transactionData, id: `trans-${Date.now()}` };
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, transactions: [newTransaction as Transaction, ...p.transactions] };
            }
            return p;
        }));
        toast({ title: "Transacción Añadida (Modo Prueba)" });
        return;
    }
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
        const newTransaction = { ...transactionData, id: doc(collection(db, 'dummy')).id };
        await updateDoc(projectRef, { transactions: arrayUnion(newTransaction) });
        toast({ title: "Transacción Añadida" });
    } catch (error) {
        console.error("Error adding transaction: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la transacción." });
    }
  };

  const updateTransaction = async (projectId: string, transactionId: string, transactionData: Partial<Omit<Transaction, 'id' | 'type'>>) => {
      if (USE_MOCK_DATA) {
          setProjects(prev => prev.map(p => {
              if (p.id === projectId) {
                  const newTransactions = p.transactions.map(t => t.id === transactionId ? { ...t, ...transactionData } : t);
                  return { ...p, transactions: newTransactions };
              }
              return p;
          }));
          toast({ title: "Transacción Actualizada (Modo Prueba)" });
          return;
      }
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      try {
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const project = projectDoc.data() as Project;
          const newTransactions = project.transactions.map(t => t.id === transactionId ? { ...t, ...transactionData } : t);
          await updateDoc(projectRef, { transactions: newTransactions });
          toast({ title: "Transacción Actualizada" });
      } catch (error) {
          console.error("Error updating transaction: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la transacción." });
      }
  };

  const deleteTransaction = async (projectId: string, transactionId: string) => {
      if (USE_MOCK_DATA) {
          setProjects(prev => prev.map(p => {
              if (p.id === projectId) {
                  return { ...p, transactions: p.transactions.filter(t => t.id !== transactionId) };
              }
              return p;
          }));
          toast({ title: "Transacción Eliminada (Modo Prueba)" });
          return;
      }
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      try {
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const project = projectDoc.data() as Project;
          const newTransactions = project.transactions.filter(t => t.id !== transactionId);
          await updateDoc(projectRef, { transactions: newTransactions });
          toast({ title: "Transacción Eliminada" });
      } catch (error) {
          console.error("Error deleting transaction: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la transacción." });
      }
  };

  const addCategory = async (projectId: string, categoryData: Category) => {
      if (USE_MOCK_DATA) {
          setProjects(prev => prev.map(p => {
              if (p.id === projectId) {
                  return { ...p, categories: [...p.categories, categoryData] };
              }
              return p;
          }));
          toast({ title: "Categoría Añadida (Modo Prueba)" });
          return;
      }
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      try {
          await updateDoc(projectRef, { categories: arrayUnion(categoryData) });
          toast({ title: "Categoría Añadida" });
      } catch (error) {
          console.error("Error adding category: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la categoría." });
      }
  };
  
  const updateCategory = async (projectId: string, categoryName: string, categoryData: Partial<Category>) => {
      if (USE_MOCK_DATA) {
          setProjects(prev => prev.map(p => {
              if (p.id === projectId) {
                  const newCategories = p.categories.map(c => c.name === categoryName ? { ...c, ...categoryData } : c);
                  return { ...p, categories: newCategories };
              }
              return p;
          }));
          toast({ title: "Categoría Actualizada (Modo Prueba)" });
          return;
      }
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      try {
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const project = projectDoc.data() as Project;
          const newCategories = project.categories.map(c => c.name === categoryName ? { ...c, ...categoryData } : c);
          await updateDoc(projectRef, { categories: newCategories });
          toast({ title: "Categoría Actualizada" });
      } catch (error) {
          console.error("Error updating category: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la categoría." });
      }
  };

  const deleteCategory = async (projectId: string, categoryName: string) => {
      if (USE_MOCK_DATA) {
          setProjects(prev => prev.map(p => {
              if (p.id === projectId) {
                  return { ...p, categories: p.categories.filter(c => c.name !== categoryName) };
              }
              return p;
          }));
          toast({ title: "Categoría Eliminada (Modo Prueba)" });
          return;
      }
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
       try {
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const project = projectDoc.data() as Project;
          const newCategories = project.categories.filter(c => c.name !== categoryName);
          await updateDoc(projectRef, { categories: newCategories });
          toast({ title: "Categoría Eliminada" });
      } catch (error) {
          console.error("Error deleting category: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la categoría." });
      }
  };


  const contextValue: ProjectsContextType = {
    projects,
    loading,
    addProject,
    getProjectById,
    getUserRoleForProject,
    updateProject,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
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
