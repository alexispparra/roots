"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { ProjectsList } from "@/components/projects-list";


export default function ProjectsPage() {
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
      <ProjectsList />
    </div>
  );
}
