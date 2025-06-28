
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseInstances } from '@/lib/firebase';
import {
    type Project,
    type AddProjectData,
    type UpdateProjectData,
    type AddExpenseInput,
    type AddIncomeInput,
    type UpdateExpenseInput,
    type UpdateIncomeInput,
    type AddCategoryInput,
    type UpdateCategoryInput,
    type AddEventInput,
    type UpdateEventInput,
    type UserRole,
    type Participant
} from '@/lib/types';

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
        transactions: (data.transactions || []).map((t: any) => {
            return {
                ...t,
                date: t.date.toDate(),
                amountUSD: t.amountUSD ?? 0,
                amountARS: t.amountARS ?? 0,
                exchangeRate: t.exchangeRate ?? 1,
            }
        }),
        events: (data.events || []).map((e: any) => ({
            ...e,
            date: e.date.toDate(),
        })),
    } as Project;
}


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
  addParticipantToProject: (projectId: string, email: string, role: UserRole) => Promise<void>;
  updateParticipantRoleInProject: (projectId: string, participantEmail: string, newRole: UserRole) => Promise<void>;
  removeParticipantFromProject: (projectId: string, participantEmail: string) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);


// --- Production-Ready Firebase Projects Provider ---
export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const firebase = getFirebaseInstances();
    
    // Explicitly wait for auth to finish before doing anything.
    if (authLoading) {
        setLoading(true);
        return;
    }
    
    // If auth is done and there's no user, clear projects and stop.
    if (!user || !user.email) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: () => void;
    
    const normalizedUserEmail = user.email.trim().toLowerCase();

    Promise.all([
      import('firebase/firestore'),
    ]).then(([{ collection, query, where, onSnapshot }]) => {
        const q = query(
          collection(firebase.db, "projects"), 
          where("participantsEmails", "array-contains", normalizedUserEmail)
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
  }, [user, authLoading, toast]);

  const getProjectById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return projects.find(p => p.id === id);
  }, [projects]);

  const getUserRoleForProject = useCallback((projectId: string): UserRole | null => {
    if (!user || !user.email) return null;
    const project = getProjectById(projectId);
    if (!project) return null;
    
    const normalizedUserEmail = user.email.trim().toLowerCase();
    const participant = project.participants.find(p => p.email.trim().toLowerCase() === normalizedUserEmail);
    return participant ? participant.role : null;
  }, [projects, user, getProjectById]);

  const addProject = async (projectData: AddProjectData): Promise<string | null> => {
    const firebase = getFirebaseInstances();
    if (!user || !user.email) {
      toast({ variant: "destructive", title: "Error de Autenticación", description: "Debes iniciar sesión para crear un proyecto." });
      return null;
    }
    
    try {
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      const normalizedEmail = user.email.trim().toLowerCase();

      const newProjectRef = await addDoc(collection(firebase.db, "projects"), {
        ...projectData,
        address: projectData.address || "",
        ownerEmail: normalizedEmail,
        participants: [{ email: normalizedEmail, name: user.displayName || 'Propietario', role: 'admin' }],
        participantsEmails: [normalizedEmail],
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
      await updateDoc(projectRef, {
        ...projectData,
        address: projectData.address || ""
      } as any);
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
            icon: predefinedIcon || null,
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
          
          let newCategories = rawProjectData.categories;
          let newTransactions = rawProjectData.transactions;
          const nameHasChanged = categoryData.name && categoryData.name !== oldName;

          // Update the category itself
          newCategories = newCategories.map(c => 
              c.name === oldName ? { ...c, ...categoryData } : c
          );
          
          // If the name changed, cascade the update to transactions and other categories' dependencies
          if (nameHasChanged) {
            const newName = categoryData.name!;
            
            // Cascade to transactions
            newTransactions = newTransactions.map(t => 
                t.category === oldName ? { ...t, category: newName } : t
            );

            // Cascade to dependencies
            newCategories = newCategories.map(c => {
              if (c.dependencies && c.dependencies.includes(oldName)) {
                return {
                  ...c,
                  dependencies: c.dependencies.map(dep => dep === oldName ? newName : dep)
                };
              }
              return c;
            });
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

          // Filter out the deleted category AND remove it from other categories' dependencies
          const newCategories = rawProjectData.categories
            .filter(c => c.name !== categoryName)
            .map(c => {
              if (c.dependencies && c.dependencies.includes(categoryName)) {
                return {
                  ...c,
                  dependencies: c.dependencies.filter(dep => dep !== categoryName)
                };
              }
              return c;
            });

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
  
  const addParticipantToProject = async (projectId: string, email: string, role: UserRole) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error", description: "La base de datos no está disponible." });
      return;
    }
    try {
      const { doc, updateDoc, arrayUnion, getDoc } = await import('firebase/firestore');
      const projectRef = doc(firebase.db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) throw new Error("Project not found");
      const projectData = projectDoc.data() as Project;
      
      const normalizedEmail = email.trim().toLowerCase();
      if (projectData.participants.some(p => p.email.trim().toLowerCase() === normalizedEmail)) {
        toast({ variant: "destructive", title: "Usuario ya existente", description: "Este usuario ya es miembro del proyecto." });
        return;
      }
      
      const newParticipant: Participant = { email: normalizedEmail, name: normalizedEmail, role };
      
      await updateDoc(projectRef, {
        participants: arrayUnion(newParticipant),
        participantsEmails: arrayUnion(normalizedEmail)
      });
      toast({ title: "Usuario añadido", description: `${normalizedEmail} ha sido añadido al proyecto.` });
    } catch (error) {
      console.error("Error adding participant: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo añadir al usuario." });
    }
  };
  
  const updateParticipantRoleInProject = async (projectId: string, participantEmail: string, newRole: UserRole) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error", description: "La base de datos no está disponible." });
      return;
    }
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      const projectRef = doc(firebase.db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) throw new Error("Project not found");
      const projectData = projectDoc.data() as Project;
      
      const normalizedEmail = participantEmail.trim().toLowerCase();
      const newParticipants = projectData.participants.map(p => 
        p.email.trim().toLowerCase() === normalizedEmail ? { ...p, role: newRole } : p
      );
      
      await updateDoc(projectRef, { participants: newParticipants });
      toast({ title: "Rol actualizado", description: `El rol de ${normalizedEmail} ha sido actualizado.` });
    } catch (error) {
      console.error("Error updating participant role: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el rol." });
    }
  };
  
  const removeParticipantFromProject = async (projectId: string, participantEmail: string) => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      toast({ variant: "destructive", title: "Error", description: "La base de datos no está disponible." });
      return;
    }
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      const projectRef = doc(firebase.db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) throw new Error("Project not found");
      const projectData = projectDoc.data() as Project;
      
      const normalizedEmail = participantEmail.trim().toLowerCase();
      
      const admins = projectData.participants.filter(p => p.role === 'admin');
      if (admins.length === 1 && admins[0].email.trim().toLowerCase() === normalizedEmail) {
        toast({ variant: "destructive", title: "Acción no permitida", description: "No se puede eliminar al último administrador del proyecto." });
        return;
      }
      
      const newParticipants = projectData.participants.filter(p => p.email.trim().toLowerCase() !== normalizedEmail);
      const newParticipantEmails = projectData.participantsEmails.filter(email => email.trim().toLowerCase() !== normalizedEmail);
      
      await updateDoc(projectRef, {
        participants: newParticipants,
        participantsEmails: newParticipantEmails
      });
      toast({ title: "Usuario eliminado", description: `${normalizedEmail} ha sido eliminado del proyecto.` });
    } catch (error) {
      console.error("Error removing participant: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar al usuario." });
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
    addParticipantToProject,
    updateParticipantRoleInProject,
    removeParticipantFromProject,
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
