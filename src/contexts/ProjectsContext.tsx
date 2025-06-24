"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// --- MINIMAL RECOVERY TYPES ---
// Using 'any' to avoid any potential import issues during recovery.
export type Participant = any;
export type Category = any;
export type ProjectStatus = any;
export type Project = any;
export type AddProjectData = any;
export type UpdateProjectData = any;

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

const recoveryModeWarn = () => {
    console.warn("RECOVERY MODE: Database operations are temporarily disabled.");
    // Temporarily disabling alert to avoid being disruptive.
    // alert("La aplicación está en modo de recuperación. Las operaciones de la base de datos están desactivadas temporalmente.");
};

const dummyContextValue: ProjectsContextType = {
    projects: [],
    loading: false,
    getProjectById: () => undefined,
    addProject: async () => recoveryModeWarn(),
    updateProject: async () => recoveryModeWarn(),
    updateProjectStatus: async () => recoveryModeWarn(),
    updateParticipantRole: async () => recoveryModeWarn(),
    addCategoryToProject: async () => recoveryModeWarn(),
    updateCategoryInProject: async () => recoveryModeWarn(),
    deleteCategoryFromProject: async () => recoveryModeWarn(),
};

const ProjectsContext = createContext<ProjectsContextType>(dummyContextValue);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
    // This provider now does nothing but serve the dummy context value.
    // It has no useEffect, no state, and no connection to Firebase.
    // This is guaranteed not to crash the server.
    return (
        <ProjectsContext.Provider value={dummyContextValue}>
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
