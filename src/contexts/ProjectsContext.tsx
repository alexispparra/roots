"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- TYPES ---
export type Participant = {
    name: string;
    src?: string; // For avatar image
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
    googleSheetId: string;
    participants: Participant[];
    progress: number;
    categories: Category[];
};

type AddProjectData = {
    name: string;
    description?: string;
    address: string;
    googleSheetId: string;
}

type ProjectsContextType = {
    projects: Project[];
    addProject: (project: AddProjectData) => void;
    getProjectById: (id: string | null) => Project | undefined;
    updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
    addCategoryToProject: (projectId: string, category: Category) => void;
    updateCategoryInProject: (projectId: string, categoryName: string, newCategoryData: { budget: number }) => void;
    deleteCategoryFromProject: (projectId: string, categoryName: string) => void;
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// --- MOCK DATA (Single Source of Truth) ---
const PROJECTS_MOCK_DATA: Project[] = [
    { 
        id: 'PROJ-001', 
        name: 'Lanzamiento App Móvil', 
        description: 'Desarrollo y lanzamiento de una nueva aplicación móvil para iOS y Android.',
        address: 'Av. Libertador 498, Buenos Aires',
        status: 'En Curso',
        investment: '10,000',
        progress: 75,
        googleSheetId: '',
        participants: [
            { name: 'Ana García', contribution: 5000, share: 50, src: 'https://placehold.co/40x40.png', fallback: 'AG' },
            { name: 'Luis Torres', contribution: 3000, share: 30, src: 'https://placehold.co/40x40.png', fallback: 'LT' },
            { name: 'Carlos Ruiz', contribution: 2000, share: 20, src: 'https://placehold.co/40x40.png', fallback: 'CR' },
        ],
        categories: [
            { name: "Desarrollo", budget: 5000 },
            { name: "Diseño UI/UX", budget: 2000 },
            { name: "Marketing", budget: 3000 },
            { name: "Albañilería", budget: 10000 },
        ]
    },
    { 
        id: 'PROJ-002', 
        name: 'Rediseño Web Corporativa', 
        description: 'Actualización completa del sitio web de la empresa con un nuevo diseño y CMS.',
        address: 'Calle Falsa 123, Springfield',
        status: 'Completado',
        investment: '25,000',
        progress: 100,
        googleSheetId: '',
        participants: [
            { name: 'DE', src: 'https://placehold.co/40x40.png', fallback: 'DE' },
        ],
        categories: []
    },
    { 
        id: 'PROJ-003', 
        name: 'Campaña Marketing Q3', 
        description: 'Campaña publicitaria digital para el tercer trimestre del año.',
        address: 'Av. Siempre Viva 742, Springfield',
        status: 'En Curso',
        investment: '7,500',
        progress: 40,
        googleSheetId: '',
        participants: [
            { name: 'Fernanda Gómez', contribution: 4000, share: 53, src: 'https://placehold.co/40x40.png', fallback: 'FG' },
            { name: 'Hugo Iglesias', contribution: 2000, share: 27, src: 'https://placehold.co/40x40.png', fallback: 'HI' },
            { name: 'Julia Ponce', contribution: 1500, share: 20, src: 'https://placehold.co/40x40.png', fallback: 'JP' },
        ],
        categories: [
            { name: "Publicidad", budget: 5000 },
            { name: "Contenido", budget: 2500 },
        ]
    },
    { 
        id: 'PROJ-004', 
        name: 'Investigación de Mercado', 
        description: 'Estudio de mercado para identificar nuevas oportunidades de negocio.',
        address: '1st Street, Washington D.C.',
        status: 'Próximo',
        investment: '3,000',
        progress: 0,
        googleSheetId: '',
        participants: [
            { name: 'LM', src: 'https://placehold.co/40x40.png', fallback: 'LM' },
        ],
        categories: []
    },
];

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>(PROJECTS_MOCK_DATA);

    const addProject = (projectData: AddProjectData) => {
        const newProject: Project = {
            ...projectData,
            id: `PROJ-${String(projects.length + 1).padStart(3, '0')}`,
            status: 'Próximo',
            progress: 0,
            participants: [],
            categories: [],
            investment: '0',
            description: projectData.description || "Sin descripción.",
        };
        setProjects(prevProjects => [...prevProjects, newProject]);
    };
    
    const getProjectById = (id: string | null): Project | undefined => {
        if (!id) return undefined;
        return projects.find(p => p.id === id);
    };

    const updateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
        setProjects(prevProjects => 
            prevProjects.map(p => 
                p.id === projectId ? { ...p, status: newStatus } : p
            )
        );
    };

    const addCategoryToProject = (projectId: string, category: Category) => {
        setProjects(prevProjects => 
            prevProjects.map(p => 
                p.id === projectId 
                    ? { ...p, categories: [...p.categories, category] } 
                    : p
            )
        );
    };

    const updateCategoryInProject = (projectId: string, categoryName: string, newCategoryData: { budget: number }) => {
        setProjects(prevProjects =>
            prevProjects.map(p => {
                if (p.id === projectId) {
                    const updatedCategories = p.categories.map(c =>
                        c.name === categoryName ? { ...c, budget: newCategoryData.budget } : c
                    );
                    return { ...p, categories: updatedCategories };
                }
                return p;
            })
        );
    };

    const deleteCategoryFromProject = (projectId: string, categoryName: string) => {
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectId
                    ? { ...p, categories: p.categories.filter(c => c.name !== categoryName) }
                    : p
            )
        );
    };

    return (
        <ProjectsContext.Provider value={{ projects, addProject, getProjectById, updateProjectStatus, addCategoryToProject, updateCategoryInProject, deleteCategoryFromProject }}>
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
