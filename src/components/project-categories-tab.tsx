
"use client"

import { useState } from "react"
import { useProjects } from "@/contexts/ProjectsContext"
import type { Project, Category, AddCategoryInput, UpdateCategoryInput } from "@/lib/types"
import type { PredefinedCategory } from "@/lib/predefined-categories"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddCategoryDialog } from "@/components/create-category-dialog"
import { EditCategoryDialog } from "@/components/edit-category-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { CategoryIcon } from "./category-icon"
import { Progress } from "@/components/ui/progress"

type ProjectCategoriesTabProps = {
  project: Project;
  canEdit: boolean;
}

export function ProjectCategoriesTab({ project, canEdit }: ProjectCategoriesTabProps) {
  const { addCategory, updateCategory, deleteCategory } = useProjects()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleAddCustomCategory = (data: AddCategoryInput) => {
    addCategory(project.id, data)
  }
  
  const handleAddPredefinedCategories = (categories: PredefinedCategory[]) => {
    categories.forEach(category => {
      addCategory(project.id, { name: category.name, budget: 0, startDate: null, endDate: null }, category.icon);
    });
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = (data: UpdateCategoryInput) => {
    if (selectedCategory) {
      updateCategory(project.id, selectedCategory.name, data)
      setIsEditDialogOpen(false)
      setSelectedCategory(null)
    }
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteCategory(project.id, selectedCategory.name)
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
    }
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Categorías de Gastos</CardTitle>
              <CardDescription>Gestiona las categorías, presupuestos y progreso para los gastos de tu proyecto.</CardDescription>
            </div>
            {canEdit && <AddCategoryDialog 
              onAddCustomCategory={handleAddCustomCategory} 
              onAddPredefinedCategories={handleAddPredefinedCategories}
              existingCategoryNames={project.categories.map(c => c.name)}
              defaultStartDate={project.createdAt}
            />}
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nombre</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead className="text-right">Presupuesto</TableHead>
                    {canEdit && <TableHead className="w-[50px] pr-6"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.categories.length > 0 ? (
                    project.categories.map((category) => (
                      <TableRow key={category.name}>
                        <TableCell className="font-medium pl-6">
                          <div className="flex items-center gap-3">
                            <CategoryIcon name={category.icon ?? undefined} className="h-5 w-5 text-muted-foreground" />
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={category.progress ?? 0} className="h-2 w-24" />
                            <span className="text-xs text-muted-foreground">{category.progress ?? 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>Inicio: {category.startDate ? category.startDate.toLocaleDateString('es-ES') : 'N/A'}</div>
                            <div>Fin: {category.endDate ? category.endDate.toLocaleDateString('es-ES') : 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${category.budget.toLocaleString('es-AR')}</TableCell>
                        {canEdit && <TableCell className="pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(category)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center">
                        No hay categorías.
                        {canEdit && " ¡Añade la primera!"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List */}
            <div className="block md:hidden p-4 space-y-4">
              {project.categories.length > 0 ? (
                project.categories.map((category) => (
                  <Card key={category.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-3">
                          <CategoryIcon name={category.icon ?? undefined} className="h-5 w-5 text-muted-foreground" />
                          <span className="flex-1 truncate">{category.name}</span>
                        </div>
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(category)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Progreso</span>
                            <span className="text-muted-foreground">{category.progress ?? 0}%</span>
                          </div>
                          <Progress value={category.progress ?? 0} />
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium">Presupuesto</span>
                          <span className="font-semibold">${category.budget.toLocaleString('es-AR')}</span>
                        </div>
                        <div>
                          <span className="font-medium">Fechas</span>
                          <div className="text-muted-foreground">
                            <p>Inicio: {category.startDate ? category.startDate.toLocaleDateString('es-ES') : 'N/A'}</p>
                            <p>Fin: {category.endDate ? category.endDate.toLocaleDateString('es-ES') : 'N/A'}</p>
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="h-24 text-center flex items-center justify-center">
                    No hay categorías.
                    {canEdit && " ¡Añade la primera!"}
                  </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {canEdit && <>
        <EditCategoryDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          category={selectedCategory}
          onUpdateCategory={handleUpdateCategory}
          allCategories={project.categories}
        />
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="¿Estás seguro de que quieres eliminar esta categoría?"
          description="Esta acción no se puede deshacer. Se eliminará la categoría de forma permanente."
        />
      </>}
    </>
  )
}
