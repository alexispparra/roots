
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, GanttChartSquare, CalendarPlus, MoreHorizontal, Trash2, Bell } from "lucide-react";
import { type Project, type Category, type Event, type AddEventInput } from "@/contexts/ProjectsContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useProjects } from "@/contexts/ProjectsContext";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProjectGanttChart } from "./project-gantt-chart";


function generateGoogleCalendarLinkForCategory(category: Category, project: Project): string {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(`[${project.name}] ${category.name}`);
    
    const startDate = category.startDate;
    if (!startDate) return '#';

    const startDateFormat = format(startDate, "yyyyMMdd");
    const endDate = category.endDate;
    const endDateFormat = endDate 
        ? format(new Date(endDate.getTime() + 24 * 60 * 60 * 1000), "yyyyMMdd") 
        : format(new Date(startDate.getTime() + 24 * 60 * 60 * 1000), "yyyyMMdd");
    
    const dates = encodeURIComponent(`${startDateFormat}/${endDateFormat}`);
    const details = encodeURIComponent(`Tarea: ${category.name}\nProyecto: ${project.name}\n\nEste evento fue generado desde Roots.`);
    const location = encodeURIComponent(project.address);

    return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}

function generateGoogleCalendarLinkForEvent(event: Event, project: Project): string {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(`[${project.name}] ${event.title}`);
    
    const startDate = event.date;
    const startDateFormat = format(startDate, "yyyyMMdd");
    const endDateFormat = format(new Date(startDate.getTime() + 24 * 60 * 60 * 1000), "yyyyMMdd")
    
    const dates = encodeURIComponent(`${startDateFormat}/${endDateFormat}`);
    const details = encodeURIComponent(`Evento: ${event.title}\nProyecto: ${project.name}\n\nEste evento fue generado desde Roots.`);
    const location = encodeURIComponent(project.address);

    return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}


type CalendarCategory = Category & { color: string };
type CalendarEvent = Event;

type CalendarItem = 
    | { type: 'category'; data: CalendarCategory }
    | { type: 'event'; data: CalendarEvent };


type ProjectCalendarViewProps = {
  project: Project;
  canEdit: boolean;
};

function ProjectCalendarView({ project, canEdit }: ProjectCalendarViewProps) {
  const { addEvent, updateEvent, deleteEvent } = useProjects();
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState<CalendarEvent | null>(null);

  const itemsByDay = useMemo(() => {
    const byDay: Record<string, CalendarItem[]> = {};
    const colors = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];

    // Process categories
    project.categories
      .filter(c => c.startDate)
      .forEach((category, index) => {
        const calendarCategory: CalendarCategory = { ...category, color: `hsl(var(${colors[index % colors.length]}))` };
        let current = category.startDate!;
        const end = category.endDate ?? current;
        
        let loopGuard = 0;
        while (current <= end && loopGuard < 365) {
          const dayKey = format(current, 'yyyy-MM-dd');
          if (!byDay[dayKey]) byDay[dayKey] = [];
          byDay[dayKey].push({ type: 'category', data: calendarCategory });
          
          const nextDay = new Date(current);
          nextDay.setDate(nextDay.getDate() + 1);
          current = nextDay;
          loopGuard++;
        }
      });

    // Process events
    (project.events || []).forEach(event => {
        const dayKey = format(event.date, 'yyyy-MM-dd');
        if (!byDay[dayKey]) byDay[dayKey] = [];
        byDay[dayKey].push({ type: 'event', data: event });
    });

    return byDay;
  }, [project.categories, project.events]);

  const eventDays = useMemo(() => {
    return Object.keys(itemsByDay).map(dayKey => new Date(dayKey + 'T12:00:00'));
  }, [itemsByDay]);

  const selectedDayItems = selectedDay ? itemsByDay[format(selectedDay, 'yyyy-MM-dd')] ?? [] : [];
  const selectedDayCategories = selectedDayItems.filter(item => item.type === 'category') as Extract<CalendarItem, {type: 'category'}>[];
  const selectedDayEvents = selectedDayItems.filter(item => item.type === 'event') as Extract<CalendarItem, {type: 'event'}>[];

  const handleAddEvent = (data: AddEventInput) => {
    addEvent(project.id, data);
  };
  
  const handleToggleEventCompletion = (event: CalendarEvent) => {
    updateEvent(project.id, event.id, { title: event.title, date: event.date, completed: !event.completed });
  };

  const handleDeleteEventClick = (event: CalendarEvent) => {
    setSelectedItemToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItemToDelete) {
      deleteEvent(project.id, selectedItemToDelete.id);
      setIsDeleteDialogOpen(false);
      setSelectedItemToDelete(null);
    }
  };


  return (
    <>
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
                className="rounded-md border w-full sm:w-auto light-data-card"
            />
        </div>
        <div className="md:col-span-1">
             <Card className="light-data-card">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                          {selectedDay ? format(selectedDay, "d 'de' MMMM", { locale: es }) : "Actividades"}
                      </CardTitle>
                      <CardDescription>Eventos y tareas.</CardDescription>
                    </div>
                     {canEdit && (
                        <CreateEventDialog
                            onAddEvent={handleAddEvent}
                            defaultDate={selectedDay}
                        />
                    )}
                </CardHeader>
                <CardContent className="min-h-[240px] max-h-[500px] overflow-y-auto">
                    {selectedDayItems.length > 0 ? (
                        <div className="space-y-4">
                            {selectedDayEvents.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Eventos del Día</h4>
                                    <ul className="space-y-2">
                                        {selectedDayEvents.map(({ data: event }) => (
                                            <li key={event.id} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                                                {canEdit ? (
                                                    <Checkbox 
                                                        id={`event-${event.id}`} 
                                                        checked={event.completed} 
                                                        onCheckedChange={() => handleToggleEventCompletion(event)}
                                                    />
                                                ) : (
                                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <label htmlFor={`event-${event.id}`} className={cn("flex-1", event.completed && "line-through text-muted-foreground")}>
                                                    {event.title}
                                                </label>
                                                {canEdit && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleDeleteEventClick(event)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                                <Button size="sm" variant="ghost" asChild className="h-auto p-1 text-xs w-fit">
                                                    <a href={generateGoogleCalendarLinkForEvent(event, project)} target="_blank" rel="noopener noreferrer">
                                                        <CalendarPlus className="mr-1.5 h-3 w-3"/>
                                                    </a>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedDayCategories.length > 0 && selectedDayEvents.length > 0 && <Separator />}

                            {selectedDayCategories.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Tareas de Proyecto</h4>
                                    <ul className="space-y-3">
                                        {selectedDayCategories.map(({ data: category }) => (
                                            <li key={category.name} className="flex flex-col p-2 rounded-md" style={{ borderLeft: `4px solid ${category.color}` }}>
                                                <span className="font-semibold text-sm">{category.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {category.startDate ? format(category.startDate, "d MMM", { locale: es }) : ''}
                                                    {category.endDate ? ` - ${format(category.endDate, "d MMM", { locale: es })}` : ''}
                                                </span>
                                                <Button size="sm" variant="ghost" asChild className="mt-1 -ml-1 justify-start h-auto p-1 text-xs w-fit">
                                                    <a href={generateGoogleCalendarLinkForCategory(category, project)} target="_blank" rel="noopener noreferrer">
                                                        <CalendarPlus className="mr-1.5 h-3 w-3"/>
                                                        Añadir a Google
                                                    </a>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground text-center py-10">
                                {selectedDay ? 'No hay nada programado para este día.' : 'Selecciona un día en el calendario.'}
                            </p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
    </div>
    {canEdit && (
        <DeleteConfirmationDialog 
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            title="¿Eliminar este evento?"
            description="Esta acción no se puede deshacer. El evento se eliminará permanentemente del calendario del proyecto."
        />
    )}
    </>
  );
}

export function ProjectCalendarTab({ project, canEdit }: { project: Project, canEdit: boolean }) {
  return (
    <div className="grid gap-6">
      <Card className="light-data-card">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarDays /> Calendario de Actividades
          </CardTitle>
          <CardDescription>
            Visualiza las actividades y fechas clave del proyecto. Haz clic en un día para ver los detalles o añadir un nuevo evento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectCalendarView project={project} canEdit={canEdit} />
        </CardContent>
      </Card>
      <Card className="light-data-card">
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
    </div>
  )
}
