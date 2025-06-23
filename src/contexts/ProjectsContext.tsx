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
};

export type Project = {
    id: string;
    name: string;
    description: string;
    address: string;
    status: 'En Curso' | 'Completado' | 'Próximo';
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
        googleSheetId: '12345_your_sheet_id_here_1',
        participants: [
            { name: 'Ana García', contribution: 5000, share: 50, src: 'https://placehold.co/40x40.png', fallback: 'AG' },
            { name: 'Luis Torres', contribution: 3000, share: 30, src: 'https://placehold.co/40x40.png', fallback: 'LT' },
            { name: 'Carlos Ruiz', contribution: 2000, share: 20, src: 'https://placehold.co/40x40.png', fallback: 'CR' },
        ],
        categories: [
            { name: "Desarrollo" },
            { name: "Diseño UI/UX" },
            { name: "Marketing" },
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
        googleSheetId: 'YOUR_SHEET_ID_HERE_2',
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
        googleSheetId: 'YOUR_SHEET_ID_HERE_3',
        participants: [
            { name: 'Fernanda Gómez', contribution: 4000, share: 53, src: 'https://placehold.co/40x40.png', fallback: 'FG' },
            { name: 'Hugo Iglesias', contribution: 2000, share: 27, src: 'https://placehold.co/40x40.png', fallback: 'HI' },
            { name: 'Julia Ponce', contribution: 1500, share: 20, src: 'https://placehold.co/40x40.png', fallback: 'JP' },
        ],
        categories: [
            { name: "Publicidad" },
            { name: "Contenido" },
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
        googleSheetId: 'YOUR_SHEET_ID_HERE_4',
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

    return (
        <ProjectsContext.Provider value={{ projects, addProject, getProjectById }}>
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
