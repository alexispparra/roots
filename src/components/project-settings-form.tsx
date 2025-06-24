"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useProjects } from "@/contexts/ProjectsContext"
import type { Project } from "@/contexts/ProjectsContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida."),
  googleSheetId: z.string().optional(),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold']),
})

type ProjectSettingsFormProps = {
  project: Project;
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const { updateProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        address: project.address,
        googleSheetId: project.googleSheetId,
        status: project.status,
      })
    }
  }, [project, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await updateProject(project.id, values);
    setIsSubmitting(false);
  }

  return (
     <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle className="font-headline">Configuración del Proyecto</CardTitle>
                    <CardDescription>Actualiza los detalles de tu proyecto.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
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
                                value={field.value ?? ""}
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
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                            <Input placeholder="Ej: Av. Corrientes 123, CABA" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="googleSheetId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID de la Hoja de Google Sheets (Opcional)</FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="Pega aquí el ID de tu hoja de cálculo" 
                                {...field} 
                                value={field.value ?? ""}
                            />
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
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Cambios
                    </Button>
                </CardFooter>
            </form>
        </Form>
     </Card>
  )
}
