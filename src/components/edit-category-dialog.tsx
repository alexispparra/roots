"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
import type { Category } from "@/contexts/ProjectsContext"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  budget: z.coerce.number().min(0, "El presupuesto debe ser un número positivo."),
})

type EditCategoryDialogProps = {
  category: Category | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateCategory: (data: z.infer<typeof formSchema>) => void;
}

export function EditCategoryDialog({ category, isOpen, onOpenChange, onUpdateCategory }: EditCategoryDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      budget: 0,
    },
  })

  useEffect(() => {
    if (category) {
      form.reset(category)
    }
  }, [category, form, isOpen])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdateCategory(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>
                Actualiza el presupuesto para esta categoría. El nombre no se puede cambiar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Categoría</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
