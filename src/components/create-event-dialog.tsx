
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, CalendarPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AddEventFormSchema, type AddEventInput } from "@/lib/types"

type CreateEventDialogProps = {
  onAddEvent: (data: AddEventInput) => void;
  defaultDate?: Date;
  trigger?: React.ReactNode;
}

export function CreateEventDialog({ onAddEvent, defaultDate, trigger }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<AddEventInput>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      title: "",
      date: defaultDate ?? new Date(),
    },
  })
  
  useEffect(() => {
    if (open && defaultDate) {
      form.setValue("date", defaultDate);
    } else if (open) {
      form.setValue("date", new Date());
    }
  }, [open, defaultDate, form]);

  function onSubmit(values: AddEventInput) {
    onAddEvent(values);
    setOpen(false)
    form.reset({ title: "", date: defaultDate ?? new Date() })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
            <Button variant="outline" size="sm">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Añadir Evento
            </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Evento</DialogTitle>
          <DialogDescription>
            Añade un recordatorio o tarea simple a tu calendario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid gap-4">
               <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Llamar al plomero" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Evento</FormLabel>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Añadir Evento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
