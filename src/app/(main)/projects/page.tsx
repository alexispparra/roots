"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useProjects } from "@/contexts/ProjectsContext";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import type { Project, UpdateProjectData } from "@/contexts/ProjectsContext";
import { useAuth } from "@/contexts/AuthContext";


export default function ProjectsPage() {
  const { projects, updateProject } = useProjects();
  const { user } = useAuth();
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleUpdateProject = (data: UpdateProjectData) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    }
    setEditingProject(null);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Mis Proyectos</CardTitle>
            <CardDescription>Gestiona todos tus emprendimientos desde un solo lugar.</CardDescription>
          </div>
          <CreateProjectDialog />
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => {
          const participant = project.participants.find(p => p.email === user?.email);
          const canEdit = participant?.role === 'admin' || participant?.role === 'editor';

          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-xl">{project.name}</CardTitle>
                  <div className="flex items-center gap-2">
                      <Badge variant={project.status === 'Completado' ? 'secondary' : 'default'} className={project.status === 'En Curso' ? 'bg-blue-500/20 text-blue-700' : project.status === 'Próximo' ? 'bg-amber-500/20 text-amber-700' : ''}>{project.status}</Badge>
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProject(project)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground pt-2">{project.description}</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Inversión</span>
                  <span className="font-semibold">${project.investment}</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección</span>
                  <span className="font-medium truncate max-w-[150px] text-right">{project.address}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Participantes</span>
                  <div className="flex -space-x-2">
                    {project.participants.map((p, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-card">
                        <AvatarImage src={p.src} />
                        <AvatarFallback>{p.fallback || p.name.substring(0,2)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/project-detail?id=${project.id}`}>Ver Detalles</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <EditProjectDialog
        isOpen={!!editingProject}
        onOpenChange={(isOpen) => !isOpen && setEditingProject(null)}
        project={editingProject}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
}
