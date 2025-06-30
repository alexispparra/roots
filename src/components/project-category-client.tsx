
"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from "react"
import { useProjects } from '@/contexts/ProjectsContext'
import type { Project, Transaction, Category, AddExpenseInput, UpdateExpenseInput } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertTriangle, MoreHorizontal, Pencil, Trash2, Paperclip } from "lucide-react"
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { CategorySpendingChart } from '@/components/category-spending-chart'
import { Progress } from './ui/progress'

export default function ProjectCategoryClient() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const categoryName = searchParams.get('categoryName')
  const { getProjectById, loading, updateTransaction, deleteTransaction, addTransaction, getUserRoleForProject } = useProjects()

  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  const project = getProjectById(projectId)
  const category = useMemo(() => 
    project?.categories.find(c => c.name === categoryName),
    [project, categoryName]
  );
  
  const userRole = project ? getUserRoleForProject(project.id) : null;
  const canEdit = userRole === 'admin' || userRole === 'editor';

  const categoryTransactions = useMemo(() => {
    if (!project || !categoryName) return [];
    return project.transactions
      .filter(t => t.type === 'expense' && t.category === categoryName)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [project, categoryName])

  const categorySpent = useMemo(() => 
    categoryTransactions.reduce((acc, t) => acc + t.amountUSD, 0),
    [categoryTransactions]
  );
  
  const totalProjectExpenses = useMemo(() => {
    if (!project) return 0;
    return project.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amountUSD, 0);
  }, [project]);


  const handleAddExpense = (data: AddExpenseInput) => {
    if (!project || !category) return;
    addTransaction(project.id, data, 'expense');
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditExpenseDialogOpen(true)
  }

  const handleUpdateTransaction = (data: UpdateExpenseInput) => {
    if (selectedTransaction && project) {
        updateTransaction(project.id, selectedTransaction.id, data);
        setIsEditExpenseDialogOpen(false)
        setSelectedTransaction(null)
    }
  }

  const handleDeleteClick = (transaction: Transaction) => {
      setSelectedTransaction(transaction)
      setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
      if (selectedTransaction && project) {
          deleteTransaction(project.id, selectedTransaction.id)
          setIsDeleteDialogOpen(false)
          setSelectedTransaction(null)
      }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project || !category) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">No Encontrado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-64 gap-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <p className="text-muted-foreground">
            El proyecto o la categoría que buscas no existe.
          </p>
          <Button asChild>
            <Link href="/projects">Volver a Proyectos</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{category.name}</CardTitle>
          <CardDescription>
             <Link href={`/project-detail?id=${project.id}`} className="hover:underline text-base">
                Proyecto: {project.name}
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 flex flex-col gap-6">
          <CategorySpendingChart 
            categorySpent={categorySpent} 
            totalProjectExpenses={totalProjectExpenses} 
            categoryName={category.name}
          />
           <Card>
              <CardHeader>
                <CardTitle>Detalles de Tarea</CardTitle>
                <CardDescription>Progreso, fechas y dependencias de esta categoría.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progreso</span>
                    <span className="text-sm text-muted-foreground">{category.progress ?? 0}%</span>
                  </div>
                  <Progress value={category.progress ?? 0} />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Fechas Clave</h4>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Inicio:</strong> {category.startDate ? category.startDate.toLocaleDateString('es-ES') : 'No definida'}</p>
                    <p><strong>Fin:</strong> {category.endDate ? category.endDate.toLocaleDateString('es-ES') : 'No definida'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Dependencias</h4>
                  <div className="text-sm text-muted-foreground">
                    {category.dependencies && category.dependencies.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {category.dependencies.map(dep => <li key={dep}>{dep}</li>)}
                      </ul>
                    ) : (
                      <p>Esta tarea no tiene dependencias.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gastos Registrados</CardTitle>
                <CardDescription>Todos los gastos para la categoría "{category.name}".</CardDescription>
              </div>
              {canEdit && 
                <CreateExpenseDialog
                    onAddExpense={handleAddExpense}
                    categories={[category]} // Only allow adding to the current category
                    participants={project.participants}
                />
              }
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Adjunto</TableHead>
                                <TableHead className="text-right">Monto (U$S)</TableHead>
                                {canEdit && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoryTransactions.length > 0 ? (
                                categoryTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.date.toLocaleDateString('es-ES')}</TableCell>
                                        <TableCell className="font-medium break-all">{t.description}</TableCell>
                                        <TableCell>{t.user}</TableCell>
                                        <TableCell>
                                            {t.attachmentDataUrl && (
                                                <Button asChild variant="ghost" size="icon">
                                                    <a href={t.attachmentDataUrl} target="_blank" rel="noopener noreferrer" title="Ver adjunto">
                                                        <Paperclip className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-destructive">
                                          -{formatCurrency(t.amountUSD)}
                                        </TableCell>
                                        {canEdit && <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(t)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(t)} className="text-destructive">
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
                                    <TableCell colSpan={canEdit ? 6 : 5} className="h-24 text-center text-muted-foreground">
                                        No hay gastos en esta categoría.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Mobile Card List */}
                <div className="block md:hidden space-y-4">
                    {categoryTransactions.length > 0 ? (
                        categoryTransactions.map((t) => (
                            <Card key={t.id}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-base font-medium leading-snug">{t.description}</CardTitle>
                                        <CardDescription>{t.date.toLocaleDateString('es-ES')}</CardDescription>
                                    </div>
                                    {canEdit && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-2">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(t)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(t)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Monto</span>
                                        <span className="font-semibold text-destructive">
                                            -{formatCurrency(t.amountUSD)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Usuario</span>
                                        <span className="font-medium">{t.user}</span>
                                    </div>
                                    {t.attachmentDataUrl && (
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-muted-foreground">Adjunto</span>
                                            <Button asChild variant="outline" size="sm">
                                                <a href={t.attachmentDataUrl} target="_blank" rel="noopener noreferrer">
                                                    <Paperclip className="mr-2 h-3 w-3" /> Ver
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
                            No hay gastos en esta categoría.
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
       
      {canEdit && selectedTransaction && (
          <EditExpenseDialog
              isOpen={isEditExpenseDialogOpen}
              onOpenChange={setIsEditExpenseDialogOpen}
              expense={selectedTransaction}
              onUpdateExpense={handleUpdateTransaction}
              categories={[category]}
              participants={project.participants}
          />
      )}
      
      {canEdit && <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="¿Estás seguro de que quieres eliminar este gasto?"
          description="Esta acción no se puede deshacer. Se eliminará el gasto de forma permanente."
      />}
    </div>
  )
}
