
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle } from "lucide-react"

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

const customFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  budget: z.coerce.number().min(0, "El presupuesto debe ser un número positivo."),
})

type AddCategoryDialogProps = {
  onAddCustomCategory: (data: z.infer<typeof customFormSchema>) => void;
  onAddPredefinedCategories: (categories: PredefinedCategory[]) => void;
  existingCategoryNames: string[];
}

export function AddCategoryDialog({ onAddCustomCategory, onAddPredefinedCategories, existingCategoryNames }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({})
  
  const form = useForm<z.infer<typeof customFormSchema>>({
    resolver: zodResolver(customFormSchema),
    defaultValues: {
      name: "",
      budget: 0,
    },
  })

  function handleCustomSubmit(values: z.infer<typeof customFormSchema>) {
    onAddCustomCategory(values)
    setOpen(false)
    form.reset()
  }

  function handlePredefinedSubmit() {
    const categoriesToAdd = predefinedCategories.filter(c => selectedCategories[c.name]);
    if (categoriesToAdd.length > 0) {
      onAddPredefinedCategories(categoriesToAdd)
    }
    setOpen(false)
    setSelectedCategories({})
  }

  const availablePredefinedCategories = predefinedCategories.filter(
    (pc) => !existingCategoryNames.includes(pc.name)
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            form.reset();
            setSelectedCategories({});
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Categoría
        </Button>
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
