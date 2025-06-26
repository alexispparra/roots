
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { getFirebaseInstances } from '@/lib/firebase';

// --- Base Type Definitions (Using standard JS Date) ---
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
  startDate?: Date | null;
  endDate?: Date | null;
  dependencies?: string[];
};

export type Event = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
};

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  date: Date;
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
  createdAt: Date;
};


// --- Zod Schemas & Input/Form Types (Single Source of Truth) ---

export const AddProjectFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida."),
  googleSheetId: z.string().optional(),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold']),
});
export type AddProjectData = z.infer<typeof AddProjectFormSchema>;


export const UpdateProjectFormSchema = AddProjectFormSchema;
export type UpdateProjectData = z.infer<typeof UpdateProjectFormSchema>;

// --- Expense Schemas ---
const BaseExpenseFormSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida." }),
  description: z.string().min(1, "La descripción es requerida."),
  category: z.string().min(1, "La categoría es requerida."),
  user: z.string().min(1, "El usuario es requerido."),
  paymentMethod: z.string().min(1, "El medio de pago es requerido."),
  amountARS: z.coerce.number().min(0, "El monto no puede ser negativo."),
  exchangeRate: z.coerce.number().min(0, "El cambio no puede ser negativo.").default(1),
  amountUSD: z.coerce.number().min(0, "El monto no puede ser negativo."),
  attachmentDataUrl: z.string().optional(),
});
const expenseRefinement = (data: { amountARS: number, amountUSD: number }) => data.amountARS > 0 || data.amountUSD > 0;
const expenseRefinementMessage = {
  message: "Debes ingresar un monto en AR$ o U$S.",
  path: ["amountARS"],
};

export const AddExpenseFormSchema = BaseExpenseFormSchema.refine(expenseRefinement, expenseRefinementMessage);
export type AddExpenseInput = z.infer<typeof AddExpenseFormSchema>;

export const UpdateExpenseFormSchema = BaseExpenseFormSchema.extend({ id: z.string() }).refine(expenseRefinement, expenseRefinementMessage);
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseFormSchema>;


// --- Income Schemas ---
const BaseIncomeFormSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida." }),
  description: z.string().min(1, "La descripción es requerida."),
  amountARS: z.coerce.number().min(0, "El monto no puede ser negativo."),
  exchangeRate: z.coerce.number().min(0, "El cambio no puede ser negativo.").default(1),
  amountUSD: z.coerce.number().min(0, "El monto no puede ser negativo."),
});
const incomeRefinement = (data: { amountARS: number, amountUSD: number }) => data.amountARS > 0 || data.amountUSD > 0;
const incomeRefinementMessage = {
  message: "Debes ingresar un monto en AR$ o U$S.",
  path: ["amountARS"],
};

export const AddIncomeFormSchema = BaseIncomeFormSchema.refine(incomeRefinement, incomeRefinementMessage);
export type AddIncomeInput = z.infer<typeof AddIncomeFormSchema>;

export const UpdateIncomeFormSchema = BaseIncomeFormSchema.extend({ id: z.string() }).refine(incomeRefinement, incomeRefinementMessage);
export type UpdateIncomeInput = z.infer<typeof UpdateIncomeFormSchema>;


// --- Category Schemas ---
const BaseCategoryFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  budget: z.coerce.number().min(0, "El presupuesto debe ser un número positivo."),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});
const categoryDateRefinement = (data: { startDate?: Date | null, endDate?: Date | null }) => {
    if (data.startDate && data.endDate) return data.endDate >= data.startDate
    return true
};
const categoryDateRefinementMessage = { message: "La fecha de fin no puede ser anterior a la de inicio.", path: ["endDate"] };

export const AddCategoryFormSchema = BaseCategoryFormSchema.refine(categoryDateRefinement, categoryDateRefinementMessage);
export type AddCategoryInput = z.infer<typeof AddCategoryFormSchema>;

const UpdateCategoryBaseSchema = BaseCategoryFormSchema.extend({
    icon: z.string().optional().nullable(),
    progress: z.coerce.number().min(0).max(100).optional().nullable(),
    dependencies: z.array(z.string()).optional(),
});
export const UpdateCategoryFormSchema = UpdateCategoryBaseSchema.refine(categoryDateRefinement, categoryDateRefinementMessage);
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryFormSchema>;


// --- Event Schemas ---
export const AddEventFormSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  date: z.date({ required_error: "La fecha es requerida." }),
});
export type AddEventInput = z.infer<typeof AddEventFormSchema>;


export const UpdateEventFormSchema = AddEventFormSchema.extend({
    completed: z.boolean().optional(),
});
export type UpdateEventInput = z.infer<typeof UpdateEventFormSchema>;


// --- Context Definition ---

type ProjectsContextType = {
  projects: Project[];
  loading: boolean;
  addProject: (projectData: AddProjectData) => Promise<string | null>;
  getProjectById: (id: string | null) => Project | undefined;
  getUserRoleForProject: (projectId: string) => UserRole | null;
  updateProject: (projectId: string, projectData: UpdateProjectData) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTransaction: (projectId: string, transactionData: AddExpenseInput | AddIncomeInput, type: 'income' | 'expense') => Promise<void>;
  updateTransaction: (projectId: string, transactionId: string, transactionData: UpdateExpenseInput | UpdateIncomeInput) => Promise<void>;
  deleteTransaction: (projectId: string, transactionId: string) => Promise<void>;
  addCategory: (projectId: string, categoryData: AddCategoryInput, predefinedIcon?: string | null) => Promise<void>;
  updateCategory: (projectId: string, oldName: string, categoryData: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (projectId: string, categoryName: string) => Promise<void>;
  addEvent: (projectId: string, eventData: AddEventInput) => Promise<void>;
  updateEvent: (projectId: string, eventId: string, eventData: UpdateEventInput) => Promise<void>;
  deleteEvent: (projectId: string, eventId: string) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);


// --- Production-Ready Firebase Projects Provider ---
export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Helper to convert Firestore Timestamps to JS Dates ---
  const convertFirestoreDataToProject = (docData: any): Project => {
      const data = docData.data();
      return {
          id: docData.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          categories: (data.categories || []).map((c: any) => ({
              ...c,
              startDate: c.startDate ? c.startDate.toDate() : null,
              endDate: c.endDate ? c.endDate.toDate() : null,
          })),
          transactions: (data.transactions || []).map((t: any) => ({
              ...t,
              date: t.date.toDate(),
          })),
          events: (data.events || []).map((e: any) => ({
              ...e,
              date: e.date.toDate(),
          })),
      } as Project;
  }

  useEffect(() => {
    const firebase = getFirebaseInstances();
    if (!user || !firebase) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: () => void;

    Promise.all([
      import('firebase/firestore'),
    ]).then(([{ collection, query, where, onSnapshot }]) => {
        const q = query(
          collection(firebase.db, "projects"), 
          where("participantsEmails", "array-contains", user.email)
        );

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const userProjects: Project[] = [];
          querySnapshot.forEach((doc) => {
              userProjects.push(convertFirestoreDataToProject(doc));
          });
          userProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
    }).catch(error => {
        console.error("Failed to load Firebase modules for projects", error);
        setLoading(false);
    });

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
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
    const firebase = getFirebaseInstances();
    if (!user || !firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible. No se puede crear el proyecto." });
      return null;
    }
    
    try {
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      const newProjectRef = await addDoc(collection(firebase.db, "projects"), {
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
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const projectRef = doc(firebase.db, 'projects', projectId);
      await updateDoc(projectRef, projectData as any);
      toast({ title: "Proyecto Actualizado", description: "Los detalles del proyecto se han guardado." });
    } catch (error) {
        console.error("Error updating project: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el proyecto." });
    }
  };

  const deleteProject = async (projectId: string) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }

    try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const projectRef = doc(firebase.db, 'projects', projectId);
        await deleteDoc(projectRef);
        toast({ title: "Proyecto eliminado" });
    } catch (error) {
      console.error("Error deleting project: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el proyecto." });
    }
  };
  
  const addTransaction = async (projectId: string, transactionData: AddExpenseInput | AddIncomeInput, type: 'income' | 'expense') => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }
    
    try {
        const { doc, updateDoc, arrayUnion, Timestamp, collection } = await import('firebase/firestore');
        const projectRef = doc(firebase.db, 'projects', projectId);
        const transactionForDb = {
            ...transactionData,
            type: type,
            date: Timestamp.fromDate(transactionData.date),
            category: type === 'income' ? 'Ingreso' : (transactionData as AddExpenseInput).category,
        };
        
        await updateDoc(projectRef, { 
            transactions: arrayUnion({ ...transactionForDb, id: doc(collection(firebase.db, 'dummy')).id })
        });
        toast({ title: "Transacción Añadida" });
    } catch (error) {
        console.error("Error adding transaction: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la transacción." });
    }
  };

  const updateTransaction = async (projectId: string, transactionId: string, transactionData: UpdateExpenseInput | UpdateIncomeInput) => {
      const firebase = getFirebaseInstances();
      if (!firebase) {
        toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
        return;
      }

      try {
          const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore');
          const projectRef = doc(firebase.db, 'projects', projectId);
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          
          const rawProjectData = convertFirestoreDataToProject(projectDoc);
          
          const newTransactions = rawProjectData.transactions.map(t => 
              t.id === transactionId ? { ...t, ...transactionData, id: t.id } : t
          );
          
          const transactionsForDb = newTransactions.map(t => ({...t, date: Timestamp.fromDate(t.date)}));

          await updateDoc(projectRef, { transactions: transactionsForDb });
          toast({ title: "Transacción Actualizada" });
      } catch (error) {
          console.error("Error updating transaction: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la transacción." });
      }
  };

  const deleteTransaction = async (projectId: string, transactionId: string) => {
      const firebase = getFirebaseInstances();
      if (!firebase) {
        toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
        return;
      }

      try {
          const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore');
          const projectRef = doc(firebase.db, 'projects', projectId);
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const rawProjectData = convertFirestoreDataToProject(projectDoc);
          const newTransactions = rawProjectData.transactions.filter(t => t.id !== transactionId);
          const transactionsForDb = newTransactions.map(t => ({...t, date: Timestamp.fromDate(t.date)}));
          await updateDoc(projectRef, { transactions: transactionsForDb });
          toast({ title: "Transacción Eliminada" });
      } catch (error) {
          console.error("Error deleting transaction: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la transacción." });
      }
  };

  const addCategory = async (projectId: string, categoryData: AddCategoryInput, predefinedIcon?: string | null) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }
    
    try {
        const { doc, updateDoc, arrayUnion, Timestamp } = await import('firebase/firestore');
        const projectRef = doc(firebase.db, 'projects', projectId);
        
        const categoryForDb = {
            name: categoryData.name,
            icon: predefinedIcon || 'Building',
            budget: categoryData.budget ?? 0,
            startDate: categoryData.startDate ? Timestamp.fromDate(categoryData.startDate) : null,
            endDate: categoryData.endDate ? Timestamp.fromDate(categoryData.endDate) : null,
            progress: 0, 
            dependencies: []
        };

        await updateDoc(projectRef, { 
            categories: arrayUnion(categoryForDb)
        });
        toast({ title: "Categoría Añadida" });
    } catch (error) {
        console.error("Error adding category: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la categoría." });
    }
  };
  
  const updateCategory = async (projectId: string, oldName: string, categoryData: UpdateCategoryInput) => {
      const firebase = getFirebaseInstances();
      if (!firebase) {
        toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
        return;
      }

      try {
          const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore');
          const projectRef = doc(firebase.db, 'projects', projectId);
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const rawProjectData = convertFirestoreDataToProject(projectDoc);

          const newCategories = rawProjectData.categories.map(c => 
              c.name === oldName ? { ...c, ...categoryData } : c
          );

          let newTransactions = rawProjectData.transactions;
          if (categoryData.name && categoryData.name !== oldName) {
            newTransactions = rawProjectData.transactions.map(t => 
                t.category === oldName ? { ...t, category: categoryData.name } : t
            );
          }

          const categoriesForDb = newCategories.map(c => ({
              ...c,
              startDate: c.startDate ? Timestamp.fromDate(c.startDate) : null,
              endDate: c.endDate ? Timestamp.fromDate(c.endDate) : null,
          }));
          const transactionsForDb = newTransactions.map(t => ({...t, date: Timestamp.fromDate(t.date)}));
          
          await updateDoc(projectRef, { categories: categoriesForDb, transactions: transactionsForDb });
          toast({ title: "Categoría Actualizada" });
      } catch (error) {
          console.error("Error updating category: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la categoría." });
      }
  };

  const deleteCategory = async (projectId: string, categoryName: string) => {
      const firebase = getFirebaseInstances();
      if (!firebase) {
        toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
        return;
      }

       try {
          const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore');
          const projectRef = doc(firebase.db, 'projects', projectId);
          const projectDoc = await getDoc(projectRef);
          if (!projectDoc.exists()) throw new Error("Project not found");
          const rawProjectData = convertFirestoreDataToProject(projectDoc);
          const newCategories = rawProjectData.categories.filter(c => c.name !== categoryName);
          const categoriesForDb = newCategories.map(c => ({
              ...c,
              startDate: c.startDate ? Timestamp.fromDate(c.startDate) : null,
              endDate: c.endDate ? Timestamp.fromDate(c.endDate) : null,
          }));

          await updateDoc(projectRef, { categories: categoriesForDb });
          toast({ title: "Categoría Eliminada" });
      } catch (error) {
          console.error("Error deleting category: ", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la categoría." });
      }
  };

  const addEvent = async (projectId: string, eventData: AddEventInput) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }

    try {
        const { doc, updateDoc, arrayUnion, Timestamp, collection } = await import('firebase/firestore');
        const projectRef = doc(firebase.db, 'projects', projectId);
        const eventForDb = {
            title: eventData.title,
            date: Timestamp.fromDate(eventData.date),
            completed: false,
            id: doc(collection(firebase.db, 'dummy')).id
        };

        await updateDoc(projectRef, { 
            events: arrayUnion(eventForDb)
        });
        toast({ title: "Evento Añadido" });
    } catch (error) {
        console.error("Error adding event: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el evento." });
    }
  };

  const updateEvent = async (projectId: string, eventId: string, eventData: UpdateEventInput) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }
    
    try {
        const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore');
        const projectRef = doc(firebase.db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) throw new Error("Project not found");

        const rawProjectData = convertFirestoreDataToProject(projectDoc);
        const newEvents = rawProjectData.events.map(e => e.id === eventId ? { ...e, ...eventData, id: e.id } : e);
        const eventsForDb = newEvents.map(e => ({ ...e, date: Timestamp.fromDate(e.date) }));
        
        await updateDoc(projectRef, { events: eventsForDb });
    } catch (error) {
        console.error("Error updating event: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el evento." });
    }
  };

  const deleteEvent = async (projectId: string, eventId: string) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error de Configuración", description: "La base de datos no está disponible." });
      return;
    }

    try {
        const { doc, updateDoc, getDoc, Timestamp } = await import('firebase/firestore');
        const projectRef = doc(firebase.db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) throw new Error("Project not found");
        const rawProjectData = convertFirestoreDataToProject(projectDoc);
        const newEvents = rawProjectData.events.filter(e => e.id !== eventId);
        const eventsForDb = newEvents.map(e => ({ ...e, date: Timestamp.fromDate(e.date) }));

        await updateDoc(projectRef, { events: eventsForDb });
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
