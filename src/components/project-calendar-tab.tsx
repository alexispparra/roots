
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarDays, GanttChartSquare } from "lucide-react"

export function ProjectCalendarTab() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarDays /> Calendario de Actividades
          </CardTitle>
          <CardDescription>
            Visualiza las actividades y fechas clave del proyecto en un calendario mensual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CalendarDays className="h-4 w-4" />
            <AlertTitle>Función en Desarrollo</AlertTitle>
            <AlertDescription>
              La vista de calendario para gestionar actividades diarias estará disponible en una futura actualización.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <GanttChartSquare /> Diagrama de Gantt
          </CardTitle>
          <CardDescription>
            Planifica la duración y dependencias de cada categoría para estimar la duración total de la obra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <GanttChartSquare className="h-4 w-4" />
            <AlertTitle>Función en Desarrollo</AlertTitle>
            <AlertDescription>
              El diagrama de Gantt interactivo para la planificación de tareas y dependencias estará disponible próximamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
