
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, GanttChartSquare, CalendarPlus } from "lucide-react";
import { type Project, type Category } from "@/contexts/ProjectsContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { AddCategoryDialog } from "@/components/create-category-dialog";
import { useProjects } from "@/contexts/ProjectsContext";
import { type PredefinedCategory } from "@/lib/predefined-categories";

// Helper to generate a Google Calendar "Add Event" link
function generateGoogleCalendarLink(category: Category, project: Project): string {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(`[${project.name}] ${category.name}`);
    
    const startDate = category.startDate?.toDate();
    if (!startDate) return '#';

    // For all-day events, Google Calendar uses YYYYMMDD format for start and end dates.
    // The end date is exclusive, so we add one day to the actual end date.
    const startDateFormat = format(startDate, "yyyyMMdd");
    const endDate = category.endDate?.toDate();
    const endDateFormat = endDate 
        ? format(new Date(endDate.getTime() + 24 * 60 * 60 * 1000), "yyyyMMdd") 
        : format(new Date(startDate.getTime() + 24 * 60 * 60 * 1000), "yyyyMMdd");
    
    const dates = encodeURIComponent(`${startDateFormat}/${endDateFormat}`);
    const details = encodeURIComponent(`Tarea: ${category.name}\nProyecto: ${project.name}\n\nEste evento fue generado desde Roots.`);
    const location = encodeURIComponent(project.address);

    return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}

type EventCategory = Category & { color: string };

const customFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  budget: z.coerce.number().min(0, "El presupuesto debe ser un número positivo."),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

type ProjectCalendarViewProps = {
  project: Project;
  canEdit: boolean;
};

function ProjectCalendarView({ project, canEdit }: ProjectCalendarViewProps) {
  const { addCategory } = useProjects();
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();

  const events = useMemo(() => {
    const colors = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];
    return project.categories
      .filter(c => c.startDate)
      .map((c, index) => ({
        ...c,
        color: `hsl(var(${colors[index % colors.length]}))` 
      }));
  }, [project.categories]);

  const eventDays = useMemo(() => {
    const days: Date[] = [];
    events.forEach(event => {
      let current = event.startDate!.toDate();
      const end = event.endDate?.toDate() ?? current;
      
      let loopGuard = 0; // Avoid infinite loops
      while (current <= end && loopGuard < 365) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
        loopGuard++;
      }
    });
    return days;
  }, [events]);

  const eventsByDay = useMemo(() => {
    const byDay: Record<string, EventCategory[]> = {};
    events.forEach(event => {
      let current = event.startDate!.toDate();
      const end = event.endDate?.toDate() ?? current;
      
      let loopGuard = 0;
      while (current <= end && loopGuard < 365) {
        const dayKey = format(current, 'yyyy-MM-dd');
        if (!byDay[dayKey]) byDay[dayKey] = [];
        byDay[dayKey].push(event);
        
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);
        current = nextDay;
        loopGuard++;
      }
    });
    return byDay;
  }, [events]);

  const selectedDayEvents = selectedDay ? eventsByDay[format(selectedDay, 'yyyy-MM-dd')] ?? [] : [];

  const handleAddCustomCategory = (data: z.infer<typeof customFormSchema>) => {
    addCategory(project.id, { ...data, icon: 'Building', progress: 0, dependencies: [] });
  };

  const handleAddPredefinedCategories = (categories: PredefinedCategory[]) => {
      categories.forEach(category => {
          addCategory(project.id, {
              name: category.name,
              icon: category.icon,
              budget: 0,
              progress: 0,
              startDate: selectedDay,
              endDate: null,
              dependencies: [],
          });
      });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 flex justify-center">
            <Calendar
                locale={es}
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDay}
                onSelect={setSelectedDay}
                modifiers={{
                    hasEvent: eventDays
                }}
                modifiersClassNames={{
                    hasEvent: 'day-with-event'
                }}
                className="rounded-md border w-full sm:w-auto"
            />
        </div>
        <div className="md:col-span-1">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                          {selectedDay ? format(selectedDay, "d 'de' MMMM", { locale: es }) : "Actividades"}
                      </CardTitle>
                      <CardDescription>Eventos programados.</CardDescription>
                    </div>
                     {canEdit && (
                        <AddCategoryDialog
                            onAddCustomCategory={handleAddCustomCategory}
                            onAddPredefinedCategories={handleAddPredefinedCategories}
                            existingCategoryNames={project.categories.map(c => c.name)}
                            defaultStartDate={selectedDay}
                            trigger={
                                <Button variant="outline" size="sm">
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Añadir Actividad
                                </Button>
                            }
                        />
                    )}
                </CardHeader>
                <CardContent className="min-h-[240px]">
                    {selectedDayEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {selectedDayEvents.map((event) => (
                                <li key={event.name} className="flex flex-col p-2 rounded-md" style={{ borderLeft: `4px solid ${event.color}` }}>
                                    <span className="font-semibold text-sm">{event.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {format(event.startDate!.toDate(), "d MMM", { locale: es })}
                                        {event.endDate ? ` - ${format(event.endDate.toDate(), "d MMM", { locale: es })}` : ''}
                                    </span>
                                    <Button size="sm" variant="ghost" asChild className="mt-1 -ml-1 justify-start h-auto p-1 text-xs w-fit">
                                        <a href={generateGoogleCalendarLink(event, project)} target="_blank" rel="noopener noreferrer">
                                            <CalendarPlus className="mr-1.5 h-3 w-3"/>
                                            Añadir a Google
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground text-center py-10">
                                {selectedDay ? 'No hay actividades para este día.' : 'Selecciona un día en el calendario.'}
                            </p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
    </div>
  );
}

export function ProjectCalendarTab({ project, canEdit }: { project: Project, canEdit: boolean }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarDays /> Calendario de Actividades
          </CardTitle>
          <CardDescription>
            Visualiza las actividades y fechas clave del proyecto en un calendario mensual. Haz clic en un día para ver los detalles o añadir una nueva actividad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectCalendarView project={project} canEdit={canEdit} />
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
