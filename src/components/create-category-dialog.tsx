
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { predefinedCategories, type PredefinedCategory } from "@/lib/predefined-categories"
import { CategoryIcon } from "./category-icon"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { AddCategoryFormSchema, type AddCategoryInput } from "@/contexts/ProjectsContext"

type AddCategoryDialogProps = {
  onAddCustomCategory: (data: AddCategoryInput) => void;
  onAddPredefinedCategories: (categories: PredefinedCategory[]) => void;
  existingCategoryNames: string[];
  trigger?: React.ReactNode;
  defaultStartDate?: Date | null;
}

export function AddCategoryDialog({ 
  onAddCustomCategory, 
  onAddPredefinedCategories, 
  existingCategoryNames, 
  trigger, 
  defaultStartDate = null 
}: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({})
  
  const form = useForm<AddCategoryInput>({
    resolver: zodResolver(AddCategoryFormSchema),
    defaultValues: {
      name: "",
      budget: 0,
      startDate: defaultStartDate,
      endDate: null,
    },
  })

  // When dialog opens, reset form values, especially the start date.
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        budget: 0,
        startDate: defaultStartDate,
        endDate: null,
      });
    }
  }, [open, defaultStartDate, form]);


  function handleCustomSubmit(values: AddCategoryInput) {
    onAddCustomCategory(values)
    setOpen(false)
  }

  function handlePredefinedSubmit() {
    const categoriesToAdd = predefinedCategories.filter(c => selectedCategories[c.name]);
    if (categoriesToAdd.length > 0) {
      onAddPredefinedCategories(categoriesToAdd)
    }
    setOpen(false)
  }

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedCategories({});
    }
    setOpen(isOpen);
  };


  const availablePredefinedCategories = predefinedCategories.filter(
    (pc) => !existingCategoryNames.includes(pc.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Categoría
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Categoría</DialogTitle>
          <DialogDescription>
            Elige de una lista predefinida o crea una personalizada.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="predefined">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Predefinidas</TabsTrigger>
            <TabsTrigger value="custom">Personalizada</TabsTrigger>
          </TabsList>
          <TabsContent value="predefined">
            <div className="py-4">
              <ScrollArea className="h-72 w-full">
                <div className="space-y-2 pr-4">
                {availablePredefinedCategories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
                  >
                    <Checkbox
                      id={category.name}
                      checked={!!selectedCategories[category.name]}
                      onCheckedChange={(checked) => {
                        setSelectedCategories(prev => ({
                          ...prev,
                          [category.name]: !!checked
                        }))
                      }}
                    />
                    <label
                      htmlFor={category.name}
                      className="flex flex-1 cursor-pointer items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <CategoryIcon name={category.icon} className="h-5 w-5 text-muted-foreground" />
                      <span>{category.name}</span>
                    </label>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button onClick={handlePredefinedSubmit}>Añadir Seleccionadas</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="custom">
             <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCustomSubmit)}>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Marketing Digital" {...field} />
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
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover>
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
                        <Popover>
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
                <DialogFooter>
                  <Button type="submit">Añadir Categoría</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
