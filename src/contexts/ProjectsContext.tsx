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
    serverTimestamp,
    getDoc,
    type Timestamp 
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

// A safe, static timestamp for mock data to avoid Firebase dependencies during recovery mode.
const MOCK_TIMESTAMP = { seconds: 1672531200, nanoseconds: 0 } as Timestamp;

// --- MOCK DATA FOR RECOVERY MODE ---
const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj_1',
        name: 'Proyecto de Recuperación',
        description: 'La app está en modo de recuperación. Los datos en vivo no se están cargando.',
        address: 'Calle Falsa 123',
        status: 'En Curso',
        investment: '10000',
        googleSheetId: '',
        participants: [
            { name: 'Usuario de Demo', email: 'demo@example.com', role: 'admin', contribution: 10000, share: 100, fallback: 'UD' },
        ],
        participantEmails: ['demo@example.com'],
        progress: 75,
        categories: [
            { name: 'Desarrollo', budget: 5000 },
            { name: 'Marketing', budget: 3000 },
        ],
        createdAt: MOCK_TIMESTAMP,
    },
    {
        id: 'proj_2',
        name: 'Emprendimiento Inmobiliario (Demo)',
        description: 'Un segundo proyecto para visualizar el funcionamiento de la app.',
        address: 'Av. Siempre Viva 742',
        status: 'Completado',
        investment: '50000',
        participants: [
            { name: 'Usuario de Demo', email: 'demo@example.com', role: 'admin', contribution: 25000, share: 50, fallback: 'UD' },
            { name: 'Otro Inversor', email: 'otro@example.com', role: 'viewer', contribution: 25000, share: 50, fallback: 'OI' },
        ],
        participantEmails: ['demo@example.com', 'otro@example.com'],
        progress: 100,
        categories: [
            { name: 'Construcción', budget: 40000 },
            { name: 'Permisos', budget: 5000 },
        ],
        createdAt: MOCK_TIMESTAMP,
    },
];


export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
    // --- RECOVERY MODE STATE ---
    // We initialize with mock data to prevent any server crash.
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [loading, setLoading] = useState(false); // Start with loading false.
    const { user, isAppAdmin } = useAuth();
    const { toast } = useToast();

    // --- FIRESTORE CONNECTION (TEMPORARILY DISABLED) ---
    // The following useEffect is commented out to prevent the app from crashing.
    // Once the app is stable, we can re-enable this to debug the live data issue.
    /*
    useEffect(() => {
        if (!user || !db) {
            setProjects([]);
            setLoading(false);
            return;
        };

        setLoading(true);

        let q;
        const projectsCol = collection(db, 'projects');

        if (isAppAdmin) {
            q = query(projectsCol);
        } else {
            if (!user.email) {
                setProjects([]);
                setLoading(false);
                return;
            }
            q = query(projectsCol, where("participantEmails", "array-contains", user.email));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => {
                try {
                    const data = doc.data();
                    
                    const participants = (data.participants || []).map((p: any) => ({
                        name: String(p.name || 'Usuario Anónimo'),
                        email: p.email || '',
                        role: p.role || 'viewer',
                        src: p.src,
                        fallback: p.fallback || (p.name ? String(p.name).substring(0, 2) : '??'),
                        contribution: p.contribution || 0,
                        share: p.share || 0,
                    }));

                    return {
                        id: doc.id,
                        name: data.name || 'Proyecto sin nombre',
                        description: data.description || 'Sin descripción.',
                        address: data.address || 'Sin dirección',
                        status: data.status || 'Próximo',
                        investment: data.investment || '0',
                        googleSheetId: data.googleSheetId,
                        participants: participants,
                        participantEmails: data.participantEmails || [],
                        progress: data.progress || 0,
                        categories: data.categories || [],
                        createdAt: data.createdAt,
                    } as Project;
                } catch (e) {
                    console.error(`Error processing project document with ID: ${doc.id}`, e);
                    return null;
                }
            }).filter((project): project is Project => project !== null);

            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            toast({
                title: "Error al Cargar Proyectos",
                description: "No se pudieron cargar los datos de los proyectos. Se ha cargado un modo de demostración.",
                variant: "destructive",
            });
            setProjects(MOCK_PROJECTS); // Fallback to mock data on error
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAppAdmin, toast]);
    */

    const showRecoveryToast = () => {
         toast({
            variant: "destructive",
            title: "Modo de Recuperación Activo",
            description: "La aplicación está en modo de solo lectura. Los cambios no se guardarán.",
        });
    }
    
    const addProject = async (projectData: AddProjectData) => {
        showRecoveryToast();
    };
    
    const getProjectById = useCallback((id: string | null): Project | undefined => {
        if (!id) return undefined;
        return projects.find(p => p.id === id);
    }, [projects]);

    const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
        showRecoveryToast();
    };
    
    const updateProject = async (projectId: string, projectData: UpdateProjectData) => {
       showRecoveryToast();
    };

    const addCategoryToProject = async (projectId: string, category: Category) => {
        showRecoveryToast();
    };

    const updateCategoryInProject = async (projectId: string, categoryName: string, newCategoryData: { budget: number }) => {
        showRecoveryToast();
    };

    const deleteCategoryFromProject = async (projectId: string, categoryName: string) => {
       showRecoveryToast();
    };

    const updateParticipantRole = async (projectId: string, participantEmail: string, newRole: 'admin' | 'editor' | 'viewer') => {
        showRecoveryToast();
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
