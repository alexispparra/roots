"use client"

import { useProjects } from "@/contexts/ProjectsContext";
import { Loader2, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/create-project-dialog";

export function ProjectsList() {
    const { projects, loading } = useProjects();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 gap-4">
                        <Briefcase className="h-16 w-16" />
                        <h3 className="text-xl font-semibold text-foreground">No tienes proyectos todavía</h3>
                        <p>¡Crea tu primer proyecto para empezar a gestionar tus finanzas!</p>
                        <CreateProjectDialog />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Card key={project.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2 h-[40px]">{project.description || "Sin descripción."}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                       <Badge variant="secondary" className="capitalize">{project.status}</Badge>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href={`/project-detail?id=${project.id}`}>
                                Ver Proyecto
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
