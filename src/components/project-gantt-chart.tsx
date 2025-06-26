
"use client";

import * as React from 'react';
import type { Category } from '@/contexts/ProjectsContext';
import { differenceInDays, addDays, format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type GanttChartProps = {
  categories: Category[];
};

export function ProjectGanttChart({ categories }: GanttChartProps) {
  const categoriesWithDates = React.useMemo(() => 
    categories
      .filter(c => c.startDate && c.endDate && c.endDate >= c.startDate)
      .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime()), 
    [categories]
  );

  const { projectStartDate, projectEndDate, totalDurationInDays } = React.useMemo(() => {
    if (categoriesWithDates.length === 0) {
      return { projectStartDate: new Date(), projectEndDate: addDays(new Date(), 30), totalDurationInDays: 31 };
    }

    const startDates = categoriesWithDates.map(c => c.startDate!);
    const endDates = categoriesWithDates.map(c => c.endDate!);

    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
    
    const pStartDate = startOfWeek(minDate, { locale: es });
    const pEndDate = endOfWeek(maxDate, { locale: es });

    const duration = Math.max(1, differenceInDays(pEndDate, pStartDate) + 1);
    
    return { projectStartDate: pStartDate, projectEndDate: pEndDate, totalDurationInDays: duration };
  }, [categoriesWithDates]);

  const timelineHeader = React.useMemo(() => {
    const header: { name: string; days: number }[] = [];
    let currentDate = new Date(projectStartDate);
    
    while(currentDate <= projectEndDate) {
        const monthName = format(currentDate, 'MMMM yyyy', { locale: es });
        const lastMonth = header[header.length - 1];
        if (lastMonth && lastMonth.name === monthName) {
            lastMonth.days += 1;
        } else {
            header.push({ name: monthName, days: 1 });
        }
        currentDate = addDays(currentDate, 1);
    }
    return header;
  }, [projectStartDate, projectEndDate]);


  if (categoriesWithDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-lg">
        Añade fechas de inicio y fin a tus categorías para ver el diagrama de Gantt.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: '150px 1fr' }}>
          {/* Header Left Pane (empty) */}
          <div className="font-semibold p-2 border-b border-r">Categoría</div>

          {/* Header Right Pane (Timeline) */}
          <div className="overflow-x-auto">
             <div className="relative flex border-b h-10">
                {timelineHeader.map((month, index) => (
                <div 
                    key={index} 
                    className="flex-shrink-0 flex items-center justify-center text-sm font-semibold capitalize border-r last:border-r-0 px-2"
                    style={{ width: `${month.days * 40}px` }} // e.g. 40px per day
                >
                    <span className="truncate">{month.name}</span>
                </div>
                ))}
             </div>
          </div>

          {/* Body Left Pane (Category Names) */}
          <div className="border-r">
            {categoriesWithDates.map((category) => (
              <div key={category.name} className="flex items-center h-10 p-2 border-b text-sm truncate">
                {category.name}
              </div>
            ))}
          </div>

          {/* Body Right Pane (Gantt Bars) */}
          <div className="overflow-x-auto">
            <div className="relative" style={{ width: `${totalDurationInDays * 40}px` }}>
              {/* Grid Lines */}
              <div className="absolute inset-0 grid h-full" style={{ gridTemplateColumns: `repeat(${totalDurationInDays}, minmax(0, 1fr))` }}>
                {Array.from({ length: totalDurationInDays }).map((_, i) => (
                    <div key={i} className={cn("border-r", (i + 1) % 7 === 0 && "bg-muted/30")}></div>
                ))}
              </div>
              
              {/* Category Bars */}
              <div className="relative space-y-px py-1">
                 {categoriesWithDates.map((category) => {
                  const offset = differenceInDays(category.startDate!, projectStartDate);
                  const duration = differenceInDays(category.endDate!, category.startDate!) + 1;

                  return (
                    <div key={category.name} className="h-9 flex items-center relative">
                      <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute h-8 bg-primary/20 rounded"
                              style={{
                                left: `${offset * 40}px`,
                                width: `${duration * 40}px`,
                              }}
                            >
                              <div
                                className={cn(
                                  "h-full bg-primary rounded text-primary-foreground text-xs flex items-center px-2 overflow-hidden",
                                  "hover:opacity-80 transition-opacity"
                                )}
                                style={{ width: `${category.progress ?? 0}%` }}
                              >
                              <span className="truncate">{`${category.name} (${category.progress ?? 0}%)`}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-bold">{category.name}</p>
                            <p>Progreso: {category.progress ?? 0}%</p>
                            <p>Inicio: {format(category.startDate!, 'd MMM yyyy', { locale: es })}</p>
                            <p>Fin: {format(category.endDate!, 'd MMM yyyy', { locale: es })}</p>
                            <p>Duración: {duration} días</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>
                  );
                 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
