"use client"

import { useState } from "react"
import { useProjects } from "@/contexts/ProjectsContext"
import type { Project, Transaction } from "@/contexts/ProjectsContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { CreateIncomeDialog } from "@/components/create-income-dialog"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { EditIncomeDialog } from "./edit-income-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"

type ProjectTransactionsTabProps = {
  project: Project;
}

export function ProjectTransactionsTab({ project }: ProjectTransactionsTabProps) {
    const { addTransaction, updateTransaction, deleteTransaction } = useProjects()

    const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
    const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

    const handleAddExpense = (data: any) => {
        addTransaction(project.id, { ...data, type: "expense" })
    }

    const handleAddIncome = (data: any) => {
        addTransaction(project.id, { ...data, type: "income", category: 'Ingreso', user: 'N/A', paymentMethod: 'N/A' })
    }

    const handleEditClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        if (transaction.type === 'expense') {
            setIsEditExpenseDialogOpen(true)
        } else {
            setIsEditIncomeDialogOpen(true)
        }
    }

    const handleUpdateTransaction = (data: any) => {
        if (selectedTransaction) {
            updateTransaction(project.id, selectedTransaction.id, data)
            setIsEditExpenseDialogOpen(false)
            setIsEditIncomeDialogOpen(false)
            setSelectedTransaction(null)
        }
    }

    const handleDeleteClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (selectedTransaction) {
            deleteTransaction(project.id, selectedTransaction.id)
            setIsDeleteDialogOpen(false)
            setSelectedTransaction(null)
        }
    }
    
    const sortedTransactions = [...project.transactions].sort((a, b) => b.date.toMillis() - a.date.toMillis());

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-headline">Transacciones</CardTitle>
                    <CardDescription>Todos los ingresos y gastos registrados en el proyecto.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <CreateIncomeDialog onAddIncome={handleAddIncome} />
                    <CreateExpenseDialog
                        onAddExpense={handleAddExpense}
                        categories={project.categories}
                        participants={project.participants}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Medio de Pago</TableHead>
                            <TableHead className="text-right">Monto (AR$)</TableHead>
                            <TableHead className="text-right">Monto (U$S)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.date.toDate().toLocaleDateString('es-ES')}</TableCell>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                                    <TableCell>{t.user}</TableCell>
                                    <TableCell>{t.paymentMethod}</TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                                      {t.type === 'income' ? '+' : '-'}${t.amountARS.toLocaleString('es-AR')}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                                      {t.type === 'income' ? '+' : '-'}${(t.amountARS / t.exchangeRate).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No hay transacciones. ¡Registra la primera!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        {selectedTransaction && selectedTransaction.type === 'expense' && (
            <EditExpenseDialog
                isOpen={isEditExpenseDialogOpen}
                onOpenChange={setIsEditExpenseDialogOpen}
                expense={selectedTransaction}
                onUpdateExpense={handleUpdateTransaction}
                categories={project.categories}
                participants={project.participants}
            />
        )}

        {selectedTransaction && selectedTransaction.type === 'income' && (
            <EditIncomeDialog
                isOpen={isEditIncomeDialogOpen}
                onOpenChange={setIsEditIncomeDialogOpen}
                income={selectedTransaction}
                onUpdateIncome={handleUpdateTransaction}
            />
        )}
        
        <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            title="¿Estás seguro de que quieres eliminar esta transacción?"
            description="Esta acción no se puede deshacer. Se eliminará la transacción de forma permanente."
        />
    </>
  )
}