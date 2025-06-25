
"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from "react"
import { useProjects } from '@/contexts/ProjectsContext'
import type { Project, Transaction, Category } from "@/contexts/ProjectsContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { CategorySpendingChart } from '@/components/category-spending-chart'

export default function ProjectCategoryClient() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const categoryName = searchParams.get('categoryName')
  const { getProjectById, loading, updateTransaction, deleteTransaction, addTransaction } = useProjects()

  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  const project = getProjectById(projectId)
  const category = useMemo(() => 
    project?.categories.find(c => c.name === categoryName),
    [project, categoryName]
  );
  
  // TODO: Get user role to determine if they can edit
  const canEdit = true; // Placeholder

  const categoryTransactions = useMemo(() => {
    if (!project || !categoryName) return [];
    return project.transactions
      .filter(t => t.type === 'expense' && t.category === categoryName)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis());
  }, [project, categoryName])

  const categorySpent = useMemo(() => 
    categoryTransactions.reduce((acc, t) => acc + t.amountARS, 0),
    [categoryTransactions]
  );
  
  const totalProjectExpenses = useMemo(() => {
    if (!project) return 0;
    return project.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amountARS, 0);
  }, [project]);


  const handleAddExpense = (data: any) => {
    if (!project) return;
    addTransaction(project.id, { ...data, type: "expense", category: categoryName })
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditExpenseDialogOpen(true)
  }

  const handleUpdateTransaction = (data: any) => {
    if (selectedTransaction && project) {
        updateTransaction(project.id, selectedTransaction.id, data)
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
          <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
          <CardDescription>Detalle de la categoría: <span className="font-semibold">{category.name}</span></CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <CategorySpendingChart 
            categorySpent={categorySpent} 
            totalProjectExpenses={totalProjectExpenses} 
            categoryName={category.name}
          />
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
               <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead className="text-right">Monto (U$S)</TableHead>
                            {canEdit && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categoryTransactions.length > 0 ? (
                            categoryTransactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.date.toDate().toLocaleDateString('es-ES')}</TableCell>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell>{t.user}</TableCell>
                                    <TableCell className="text-right font-medium text-destructive">
                                      -${(t.amountARS / t.exchangeRate).toFixed(2)}
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
                                <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center text-muted-foreground">
                                    No hay gastos en esta categoría.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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
