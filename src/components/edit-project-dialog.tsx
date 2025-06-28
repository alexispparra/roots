
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjects } from "@/contexts/ProjectsContext"
import { type Project, UpdateProjectFormSchema, type UpdateProjectData } from "@/lib/types"

type EditProjectDialogProps = {
  project: Project | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateProject: (data: UpdateProjectData) => void;
}

export function EditProjectDialog({ project, isOpen, onOpenChange, onUpdateProject }: EditProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<UpdateProjectData>({
    resolver: zodResolver(UpdateProjectFormSchema),
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
        address: project.address ?? "",
        status: project.status,
      })
    }
  }, [project, form, isOpen])

  function onSubmit(values: UpdateProjectData) {
    setIsSubmitting(true);
    onUpdateProject(values);
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Proyecto</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de tu proyecto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Proyecto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tienda E-commerce" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe brevemente tu proyecto."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Av. Corrientes 123, CABA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Estado del Proyecto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="planning">Planeación</SelectItem>
                              <SelectItem value="in-progress">En Progreso</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                              <SelectItem value="on-hold">En Pausa</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
            </div>
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
