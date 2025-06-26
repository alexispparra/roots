
"use client"

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjects } from '@/contexts/ProjectsContext';
import type { Project, UpdateProjectData } from "@/contexts/ProjectsContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, Briefcase, BarChart2, List, Users, MoreVertical, Pencil, Trash2, CalendarDays } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCategoriesTab } from '@/components/project-categories-tab';
import { ProjectTransactionsTab } from '@/components/project-transactions-tab';
import { ProjectSummary } from '@/components/project-summary';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EditProjectDialog } from '@/components/edit-project-dialog';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { ProjectCalendarTab } from './project-calendar-tab';

export default function ProjectDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('id');
  const { getProjectById, getUserRoleForProject, loading, updateProject, deleteProject } = useProjects();
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const project = getProjectById(projectId);
  const userRole = project ? getUserRoleForProject(project.id) : null;
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || userRole === 'editor';

  const handleUpdateProject = (data: UpdateProjectData) => {
    if (project) {
        updateProject(project.id, data);
        setIsEditDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (project) {
        await deleteProject(project.id);
        setIsDeleteDialogOpen(false);
        router.push('/projects');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Proyecto no Encontrado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-64 gap-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <p className="text-muted-foreground">
            El proyecto que buscas no existe o no tienes permiso para verlo.
          </p>
          <Button asChild>
            <Link href="/projects">Volver a Proyectos</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
            <CardDescription>{project.description || "Este proyecto no tiene una descripción."}</CardDescription>
          </div>
           {isAdmin && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <span className="sr-only">Abrir menú del proyecto</span>
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Proyecto
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Proyecto
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="grid gap-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="dashboard"><BarChart2 className="mr-2 h-4 w-4" />Resumen</TabsTrigger>
          <TabsTrigger value="transactions"><List className="mr-2 h-4 w-4" />Transacciones</TabsTrigger>
          <TabsTrigger value="categories"><Briefcase className="mr-2 h-4 w-4" />Categorías</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="mr-2 h-4 w-4" />Calendario</TabsTrigger>
          {isAdmin && <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" />Equipo</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard">
          <ProjectSummary project={project} />
        </TabsContent>

        <TabsContent value="transactions">
           <ProjectTransactionsTab project={project} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="categories">
           <ProjectCategoriesTab project={project} canEdit={canEdit} />
        </TabsContent>
        
        <TabsContent value="calendar">
          <ProjectCalendarTab project={project} canEdit={canEdit} />
        </TabsContent>

        {isAdmin && <TabsContent value="team">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Equipo del Proyecto</CardTitle>
                <CardDescription>Gestiona los participantes y sus permisos en este proyecto.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Users className="h-4 w-4" />
                    <AlertTitle>Función en Desarrollo</AlertTitle>
                    <AlertDescription>
                        La capacidad para añadir, editar y eliminar miembros del equipo y gestionar sus permisos estará disponible en una futura actualización.
                    </AlertDescription>
                </Alert>
            </CardContent>
          </Card>
        </TabsContent>}

      </Tabs>
      
      {isAdmin && (
        <>
            <EditProjectDialog
                project={project}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onUpdateProject={handleUpdateProject}
            />
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="¿Estás seguro de que quieres eliminar este proyecto?"
                description="Esta acción no se puede deshacer. Se eliminarán permanentemente el proyecto y todos sus datos asociados, como transacciones y categorías."
            />
        </>
      )}

    </div>
  )
}
