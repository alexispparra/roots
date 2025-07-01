
"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { type Category, UpdateCategoryFormSchema, type UpdateCategoryInput } from "@/lib/types"
import { ScrollArea } from "./ui/scroll-area"
import { Checkbox } from "./ui/checkbox"

type EditCategoryDialogProps = {
  category: Category | null;
  allCategories: Category[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateCategory: (data: UpdateCategoryInput) => void;
}

export function EditCategoryDialog({ category, allCategories, isOpen, onOpenChange, onUpdateCategory }: EditCategoryDialogProps) {
  const form = useForm<UpdateCategoryInput>({
    resolver: zodResolver(UpdateCategoryFormSchema),
    defaultValues: {
      name: "",
      budget: 0,
      icon: null,
      startDate: null,
      endDate: null,
      dependencies: [],
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        ...category,
        dependencies: category.dependencies ?? [],
        startDate: category.startDate,
        endDate: category.endDate,
      })
    }
  }, [category, form, isOpen])

  function onSubmit(values: UpdateCategoryInput) {
    onUpdateCategory(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de la categoría. El progreso se calcula automáticamente.
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
                    <FormLabel>Nombre de la Categoría</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                 <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Inicio</FormLabel>
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
                                selected={field.value ?? undefined}
                                onSelect={field.onChange}
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Fin</FormLabel>
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
                                selected={field.value ?? undefined}
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
                 <FormField
                    control={form.control}
                    name="dependencies"
                    render={() => (
                        <FormItem>
                        <FormLabel>Dependencias</FormLabel>
                        <FormDescription>
                            Selecciona las tareas que deben completarse antes de que esta pueda comenzar.
                        </FormDescription>
                        <ScrollArea className="h-32 w-full rounded-md border">
                            <div className="p-4">
                            {allCategories
                                .filter((c) => c.name !== category?.name)
                                .map((depCategory) => (
                                <FormField
                                    key={depCategory.name}
                                    control={form.control}
                                    name="dependencies"
                                    render={({ field }) => {
                                    return (
                                        <FormItem
                                        key={depCategory.name}
                                        className="flex flex-row items-start space-x-3 space-y-0 py-1"
                                        >
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(depCategory.name)}
                                            onCheckedChange={(checked) => {
                                                const currentDeps = field.value ?? [];
                                                return checked
                                                ? field.onChange([
                                                    ...currentDeps,
                                                    depCategory.name,
                                                ])
                                                : field.onChange(
                                                    currentDeps?.filter(
                                                        (value: string) => value !== depCategory.name
                                                    )
                                                    );
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {depCategory.name}
                                        </FormLabel>
                                        </FormItem>
                                    );
                                    }}
                                />
                                ))}
                                {allCategories.filter((c) => c.name !== category?.name).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay otras categorías para establecer dependencias.</p>
                                )}
                            </div>
                        </ScrollArea>
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
