
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, Timestamp, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
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
  icon?: string | null;
  progress?: number; // From 0 to 100
  startDate?: Timestamp | null;
  endDate?: Timestamp | null;
  dependencies?: string[];
};

export type Event = {
  id: string;
  title: string;
  date: Timestamp;
  completed: boolean;
};

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  date: Timestamp;
  description: string;
  amountARS: number;
  exchangeRate: number;
  attachmentDataUrl?: string;
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
  events: Event[];
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


// --- Input Type Definitions for functions ---
// These types use JS Date objects for easier handling in components.
// The context will handle the conversion to Firestore Timestamps.

type AddTransactionInput = Omit<Transaction, 'id' | 'date'> & { date: Date };
type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'type' | 'date'>> & { date?: Date };
type AddCategoryInput = Omit<Category, 'startDate' | 'endDate' | 'budget' | 'dependencies'> & {
    budget?: number;
    dependencies?: string[];
    startDate?: Date | null;
    endDate?: Date | null;
};
type UpdateCategoryInput = Partial<Omit<Category, 'startDate' | 'endDate'>> & {
    startDate?: Date | null;
    endDate?: Date | null;
};
type AddEventInput = Omit<Event, 'id' | 'date'> & { date: Date };
type UpdateEventInput = Partial<Omit<Event, 'id' | 'date'>> & { date?: Date };


// --- Context Definition ---

type ProjectsContextType = {
  projects: Project[];
  loading: boolean;
  addProject: (projectData: AddProjectData) => Promise<string | null>;
  getProjectById: (id: string | null) => Project | undefined;
  getUserRoleForProject: (projectId: string) => UserRole | null;
  updateProject: (projectId: string, projectData: UpdateProjectData) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTransaction: (projectId: string, transactionData: AddTransactionInput) => Promise<void>;
  updateTransaction: (projectId: string, transactionId: string, transactionData: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (projectId: string, transactionId: string) => Promise<void>;
  addCategory: (projectId: string, categoryData: AddCategoryInput) => Promise<void>;
  updateCategory: (projectId: string, oldName: string, categoryData: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (projectId: string, categoryName: string) => Promise<void>;
  addEvent: (projectId: string, eventData: AddEventInput) => Promise<void>;
  updateEvent: (projectId: string, eventId: string, eventData: UpdateEventInput) => Promise<void>;
  deleteEvent: (projectId: string, eventId: string) => Promise<void>;
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
            ...data,
            events: data.events || [], // Ensure events array exists
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
        events: [],
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
        events: [],
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

  const deleteProject = async (projectId: string) => {
    if (USE_MOCK_DATA) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({ title: "Proyecto Eliminado (Modo Prueba)" });
      return;
    }
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
      await deleteDoc(projectRef);
      toast({ title: "Proyecto eliminado" });
    } catch (error) {
      console.error("Error deleting project: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el proyecto." });
    }
  };
  
  const addTransaction = async (projectId: string, transactionData: AddTransactionInput) => {
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
        const transactionForDb = {
            ...transactionData,
            date: Timestamp.fromDate(transactionData.date),
            id: doc(collection(db, 'dummy')).id 
        };
        await updateDoc(projectRef, { transactions: arrayUnion(transactionForDb) });
        toast({ title: "Transacción Añadida" });
    } catch (error) {
        console.error("Error adding transaction: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la transacción." });
    }
  };

  const updateTransaction = async (projectId: string, transactionId: string, transactionData: UpdateTransactionInput) => {
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      try {
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          
          const dataForDb = { ...transactionData } as any;
          if (transactionData.date) {
              dataForDb.date = Timestamp.fromDate(transactionData.date);
          }

          const project = projectDoc.data() as Project;
          const newTransactions = project.transactions.map(t => t.id === transactionId ? { ...t, ...dataForDb } : t);
          await updateDoc(projectRef, { transactions: newTransactions });
          toast({ title: "Transacción Actualizada" });
      } catch (error) {
          console.error("Error updating transaction: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la transacción." });
      }
  };

  const deleteTransaction = async (projectId: string, transactionId: string) => {
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

  const addCategory = async (projectId: string, categoryData: AddCategoryInput) => {
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    
    const categoryForDb: Category = {
        name: categoryData.name,
        icon: categoryData.icon || 'Building',
        budget: categoryData.budget ?? 0,
        progress: categoryData.progress ?? 0,
        dependencies: categoryData.dependencies ?? [],
        startDate: categoryData.startDate ? Timestamp.fromDate(categoryData.startDate) : null,
        endDate: categoryData.endDate ? Timestamp.fromDate(categoryData.endDate) : null,
    };

    try {
        await updateDoc(projectRef, { categories: arrayUnion(categoryForDb) });
        toast({ title: "Categoría Añadida" });
    } catch (error) {
        console.error("Error adding category: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la categoría." });
    }
  };
  
  const updateCategory = async (projectId: string, oldName: string, categoryData: UpdateCategoryInput) => {
      if (!db) return;
      const projectRef = doc(db, 'projects', projectId);
      try {
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          
          const dataForDb = { ...categoryData } as any;
          if (categoryData.startDate) {
              dataForDb.startDate = Timestamp.fromDate(categoryData.startDate);
          }
          if (categoryData.endDate) {
              dataForDb.endDate = Timestamp.fromDate(categoryData.endDate);
          }
          if (categoryData.startDate === null) dataForDb.startDate = null;
          if (categoryData.endDate === null) dataForDb.endDate = null;

          const project = projectDoc.data() as Project;
          const newCategories = project.categories.map(c => c.name === oldName ? { ...c, ...dataForDb } : c);
          
          let newTransactions = project.transactions;
          if (dataForDb.name && dataForDb.name !== oldName) {
            newTransactions = project.transactions.map(t => 
                t.category === oldName ? { ...t, category: dataForDb.name } : t
            );
          }
          await updateDoc(projectRef, { categories: newCategories, transactions: newTransactions });
          toast({ title: "Categoría Actualizada" });
      } catch (error) {
          console.error("Error updating category: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la categoría." });
      }
  };

  const deleteCategory = async (projectId: string, categoryName: string) => {
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

  const addEvent = async (projectId: string, eventData: AddEventInput) => {
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);

    const eventForDb: Event = {
        ...eventData,
        date: Timestamp.fromDate(eventData.date),
        id: doc(collection(db, 'dummy')).id
    };

    try {
        await updateDoc(projectRef, { events: arrayUnion(eventForDb) });
        toast({ title: "Evento Añadido" });
    } catch (error) {
        console.error("Error adding event: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el evento." });
    }
  };

  const updateEvent = async (projectId: string, eventId: string, eventData: UpdateEventInput) => {
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) throw new Error("Project not found");

        const dataForDb = { ...eventData } as any;
        if (eventData.date) {
            dataForDb.date = Timestamp.fromDate(eventData.date);
        }

        const project = projectDoc.data() as Project;
        const newEvents = project.events.map(e => e.id === eventId ? { ...e, ...dataForDb } : e);
        await updateDoc(projectRef, { events: newEvents });
    } catch (error) {
        console.error("Error updating event: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el evento." });
    }
  };

  const deleteEvent = async (projectId: string, eventId: string) => {
    if (!db) return;
    const projectRef = doc(db, 'projects', projectId);
    try {
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) throw new Error("Project not found");
        const project = projectDoc.data() as Project;
        const newEvents = project.events.filter(e => e.id !== eventId);
        await updateDoc(projectRef, { events: newEvents });
        toast({ title: "Evento Eliminado" });
    } catch (error) {
        console.error("Error deleting event: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el evento." });
    }
  };


  const contextValue: ProjectsContextType = {
    projects,
    loading,
    addProject,
    getProjectById,
    getUserRoleForProject,
    updateProject,
    deleteProject,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addEvent,
    updateEvent,
    deleteEvent,
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
