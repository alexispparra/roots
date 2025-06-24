
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';

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
    name:string;
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

const defaultContextValue: ProjectsContextType = {
    projects: [],
    loading: true,
    addProject: async () => console.warn("Context not ready"),
    getProjectById: () => undefined,
    updateProjectStatus: async () => console.warn("Context not ready"),
    addCategoryToProject: async () => console.warn("Context not ready"),
    updateCategoryInProject: async () => console.warn("Context not ready"),
    deleteCategoryFromProject: async () => console.warn("Context not ready"),
    updateProject: async () => console.warn("Context not ready"),
    updateParticipantRole: async () => console.warn("Context not ready"),
};

const ProjectsContext = createContext<ProjectsContextType>(defaultContextValue);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Absolutely do not proceed if there's no user or no db connection.
        if (!user || !db) {
            setProjects([]);
            setLoading(false);
            return;
        }

        let unsubscribe: (() => void) | undefined;

        try {
            const q = query(collection(db, 'projects'), where('participantEmails', 'array-contains', user.email));
            
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const projectsData: Project[] = [];
                querySnapshot.forEach((doc) => {
                    try {
                        const data = doc.data();

                        // Paranoid-level data validation
                        if (!data || typeof data !== 'object' || !data.name) {
                            console.warn(`Skipping malformed project document (ID: ${doc.id}): data is not a valid object or name is missing.`);
                            return;
                        }

                        const participants = (data.participants && Array.isArray(data.participants) ? data.participants : []).map((p: any) => {
                            if (!p || typeof p.email !== 'string') return null;
                            const nameStr = String(p.name || 'Usuario Desconocido');
                            return {
                                name: nameStr,
                                email: p.email,
                                role: p.role || 'viewer',
                                src: p.src || '',
                                fallback: nameStr.split(' ').map((n: string) => n[0]).join('') || '?',
                                contribution: p.contribution || 0,
                                share: p.share || 0,
                            };
                        }).filter((p: Participant | null): p is Participant => p !== null);

                        const project: Project = {
                            id: doc.id,
                            name: data.name,
                            description: data.description || '',
                            address: data.address || 'Sin dirección',
                            status: data.status || 'Próximo',
                            investment: data.investment || '$0',
                            googleSheetId: data.googleSheetId || '',
                            participants: participants,
                            participantEmails: data.participantEmails && Array.isArray(data.participantEmails) ? data.participantEmails : [],
                            progress: data.progress || 0,
                            categories: data.categories && Array.isArray(data.categories) ? data.categories : [],
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
                        };
                        projectsData.push(project);
                    } catch (e) {
                        console.error(`Error processing a single project document (ID: ${doc.id}). Skipping it.`, e);
                    }
                });
                setProjects(projectsData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching projects from Firestore snapshot: ", error);
                setProjects([]);
                setLoading(false);
            });

        } catch (e) {
             console.error("A critical error occurred while setting up the projects listener. The app will continue without project data.", e);
             setProjects([]);
             setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    const getProjectById = (id: string | null) => {
        if (!id) return undefined;
        return projects.find(p => p.id === id);
    };
    
    const addProject = async (projectData: AddProjectData) => {
        if (!user || !db) return;
        const newProject = {
            ...projectData,
            status: 'Próximo',
            investment: '$0',
            progress: 0,
            categories: [],
            participants: [{ name: user.displayName || 'Admin', email: user.email, role: 'admin', fallback: user.displayName?.split(' ').map(n => n[0]).join('') }],
            participantEmails: [user.email],
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'projects'), newProject);
    };
    
    const updateProject = async (projectId: string, projectData: UpdateProjectData) => {
        if (!db) return;
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, projectData);
    };

    const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
        if (!db) return;
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { status: newStatus });
    };

    const updateParticipantRole = async (projectId: string, participantEmail: string, newRole: 'admin' | 'editor' | 'viewer') => {
        if (!db) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedParticipants = project.participants.map(p =>
            p.email === participantEmail ? { ...p, role: newRole } : p
        );

        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { participants: updatedParticipants });
    };

    const addCategoryToProject = async (projectId: string, category: Category) => {
        if (!db) return;
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
            categories: arrayUnion(category)
        });
    };

    const updateCategoryInProject = async (projectId: string, categoryName: string, newCategoryData: { budget: number }) => {
        if (!db) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedCategories = project.categories.map(c =>
            c.name === categoryName ? { ...c, ...newCategoryData } : c
        );

        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { categories: updatedCategories });
    };

    const deleteCategoryFromProject = async (projectId: string, categoryName: string) => {
        if (!db) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const categoryToDelete = project.categories.find(c => c.name === categoryName);

        if (categoryToDelete) {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                categories: arrayRemove(categoryToDelete)
            });
        }
    };
    
    return (
        <ProjectsContext.Provider value={{
            projects,
            loading,
            addProject,
            getProjectById,
            updateProject,
            updateProjectStatus,
            updateParticipantRole,
            addCategoryToProject,
            updateCategoryInProject,
            deleteCategoryFromProject
        }}>
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

    