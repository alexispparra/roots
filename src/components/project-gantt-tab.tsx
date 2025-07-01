
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GanttChartSquare } from "lucide-react";
import { ProjectGanttChart } from "./project-gantt-chart";
import type { Project } from "@/lib/types";

type ProjectGanttTabProps = {
    project: Project;
}

export function ProjectGanttTab({ project }: ProjectGanttTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <GanttChartSquare /> Diagrama de Gantt
                </CardTitle>
                <CardDescription>
                    Visualiza la línea de tiempo de tus categorías de proyecto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProjectGanttChart categories={project.categories} />
            </CardContent>
        </Card>
    )
}
