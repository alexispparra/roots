
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    doc, 
    updateDoc, 
    Timestamp,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// --- TYPES ---
export type Participant = {
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    src?: string;
    fallback?: string;
    contribution?: number;
    share?: number;
};

export type Category = {
    name: string;
    budget: number;
};

export type ProjectStatus = 'En Curso' | 'Completado' | 'Próximo';

export type Project = {
    id: string;
    name: string;
    description: string;
    address: string;
    status: ProjectStatus;
    investment: string;
    googleSheetId?: string;
    participants: Participant[];
    participantEmails: string[];
    progress: number;
    categories: Category[];
    createdAt: Timestamp;
};

export type AddProjectData = {
    name: string;
    description?: string;
    address: string;
    googleSheetId?: string;
}

export type UpdateProjectData = {
    name: string;
    description?: string;
    address: string;
    googleSheetId?: string;
}

type ProjectsContextType = {
    projects: Project[];
    loading: boolean;
    addProject: (project: AddProjectData) => Promise<void>;
    getProjectById: (id: string | null) => Project | undefined;
    updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
    addCategoryToProject: (projectId: string, category: Category) => Promise<void>;
    updateCategoryInProject: (projectId: string, categoryName: string, newCategoryData: { budget: number }) => Promise<void>;
    deleteCategoryFromProject: (projectId: string, categoryName: string) => Promise<void>;
    updateProject: (projectId: string, projectData: UpdateProjectData) => Promise<void>;
    updateParticipantRole: (projectId: string, participantEmail: string, newRole: 'admin' | 'editor' | 'viewer') => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAppAdmin } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        // If there's no user or the database isn't configured, don't try to fetch data.
        if (!user || !db) {
            setProjects([]);
            setLoading(false);
            return;
        };

        setLoading(true);

        let q;
        const projectsCol = collection(db, 'projects');

        if (isAppAdmin) {
            // App admin can see all projects
            q = query(projectsCol);
        } else {
            // For regular users, we MUST have an email to build the query.
            // If the user object exists but email is not yet available, we wait.
            if (!user.email) {
                setProjects([]);
                setLoading(false);
                return;
            }
            q = query(projectsCol, where("participantEmails", "array-contains", user.email));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => {
                const data = doc.data();
                // Sanitize data to prevent crashes from malformed db entries
                return {
                    id: doc.id,
                    ...data,
                    participants: data.participants || [],
                    participantEmails: data.participantEmails || [],
                    categories: data.categories || [],
                } as Project;
            });
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            toast({
                title: "Error al Cargar Proyectos",
                description: "No se pudieron cargar los datos de los proyectos. Inténtalo de nuevo.",
                variant: "destructive",
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAppAdmin, toast]);
    
    const addProject = async (projectData: AddProjectData) => {
        if (!user || !user.email) {
            toast({ title: "No autenticado", description: "Debes iniciar sesión para crear un proyecto.", variant: "destructive" });
            return;
        }
        if (!db) {
            toast({ title: "Modo Demostración", description: "La creación de proyectos requiere configuración de Firebase.", variant: "destructive" });
            return;
        }

        const newProject = {
            ...projectData,
            status: 'Próximo' as ProjectStatus,
            progress: 0,
            participants: [
                {
                    name: user.displayName || user.email,
                    email: user.email,
                    role: 'admin' as const,
                    src: user.photoURL || undefined,
                    fallback: user.displayName?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase(),
                }
            ],
            participantEmails: [user.email],
            categories: [],
            investment: '0',
            description: projectData.description || "Sin descripción.",
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, 'projects'), newProject);
            toast({ title: "¡Proyecto Creado!", description: `El proyecto "${projectData.name}" ha sido creado.` });
        } catch (error) {
            console.error("Error creating project:", error);
            toast({ title: "Error", description: "No se pudo crear el proyecto.", variant: "destructive" });
        }
    };
    
    const getProjectById = useCallback((id: string | null): Project | undefined => {
        if (!id) return undefined;
        return projects.find(p => p.id === id);
    }, [projects]);

    const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
        if (!db) {
            toast({ title: "Modo Demostración", description: "Esta función requiere configuración de Firebase.", variant: "destructive" });
            return;
        }
        const projectRef = doc(db, 'projects', projectId);
        try {
            await updateDoc(projectRef, { status: newStatus });
            toast({ title: "Estado Actualizado", description: "El estado del proyecto ha sido actualizado." });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
        }
    };
    
    const updateProject = async (projectId: string, projectData: UpdateProjectData) => {
        if (!db) {
            toast({ title: "Modo Demostración", description: "Esta función requiere configuración de Firebase.", variant: "destructive" });
            return;
        }
        const projectRef = doc(db, 'projects', projectId);
        try {
            await updateDoc(projectRef, projectData);
            toast({ title: "Proyecto Actualizado", description: "Los datos del proyecto han sido guardados." });
        } catch (error) {
            console.error("Error updating project:", error);
            toast({ title: "Error", description: "No se pudo actualizar el proyecto.", variant: "destructive" });
        }
    };

    const addCategoryToProject = async (projectId: string, category: Category) => {
        if (!db) {
            toast({ title: "Modo Demostración", description: "Esta función requiere configuración de Firebase.", variant: "destructive" });
            return;
        }
        const projectRef = doc(db, 'projects', projectId);
        try {
            const projectSnap = await getDoc(projectRef);
            if(projectSnap.exists()){
                const projectData = projectSnap.data();
                const newCategories = [...(projectData.categories || []), category];
                await updateDoc(projectRef, { categories: newCategories });
                toast({ title: "Categoría Añadida" });
            }
        } catch (error) {
            console.error("Error adding category:", error);
            toast({ title: "Error", description: "No se pudo añadir la categoría.", variant: "destructive" });
        }
    };

    const updateCategoryInProject = async (projectId: string, categoryName: string, newCategoryData: { budget: number }) => {
        if (!db) {
            toast({ title: "Modo Demostración", description: "Esta función requiere configuración de Firebase.", variant: "destructive" });
            return;
        }
        const projectRef = doc(db, 'projects', projectId);
        try {
            const projectSnap = await getDoc(projectRef);
            if(projectSnap.exists()){
                const projectData = projectSnap.data();
                const updatedCategories = (projectData.categories || []).map((c: Category) => 
                    c.name === categoryName ? { ...c, budget: newCategoryData.budget } : c
                );
                await updateDoc(projectRef, { categories: updatedCategories });
                toast({ title: "Categoría Actualizada" });
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast({ title: "Error", description: "No se pudo actualizar la categoría.", variant: "destructive" });
        }
    };

    const deleteCategoryFromProject = async (projectId: string, categoryName: string) => {
        if (!db) {
            toast({ title: "Modo Demostración", description: "Esta función requiere configuración de Firebase.", variant: "destructive" });
            return;
        }
        const projectRef = doc(db, 'projects', projectId);
        try {
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                const projectData = projectSnap.data();
                const updatedCategories = (projectData.categories || []).filter((c: Category) => c.name !== categoryName);
                await updateDoc(projectRef, { categories: updatedCategories });
                toast({ title: "Categoría Eliminada" });
            }
        } catch (error) {
             console.error("Error deleting category:", error);
            toast({ title: "Error", description: "No se pudo eliminar la categoría.", variant: "destructive" });
        }
    };

    const updateParticipantRole = async (projectId: string, participantEmail: string, newRole: 'admin' | 'editor' | 'viewer') => {
        if (!db) {
            toast({ title: "Modo Demostración", description: "Esta función requiere configuración de Firebase.", variant: "destructive" });
            return;
        }
        const projectRef = doc(db, 'projects', projectId);
        try {
             const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                const projectData = projectSnap.data();
                const updatedParticipants = (projectData.participants || []).map((p: Participant) => 
                    p.email === participantEmail ? { ...p, role: newRole } : p
                );
                await updateDoc(projectRef, { participants: updatedParticipants });
                toast({ title: "Rol Actualizado", description: `El rol de ${participantEmail} ha sido actualizado.` });
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "Error", description: "No se pudo actualizar el rol del participante.", variant: "destructive" });
        }
    };

    const contextValue = {
        projects,
        loading,
        addProject,
        getProjectById,
        updateProjectStatus,
        addCategoryToProject,
        updateCategoryInProject,
        deleteCategoryFromProject,
        updateProject,
        updateParticipantRole,
    };

    return (
        <ProjectsContext.Provider value={contextValue}>
            {children}
        </ProjectsContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectsContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectsProvider');
    }
    return context;
};

    

    
