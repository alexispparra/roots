
"use client"

import { useState, useMemo } from "react"
import { useProjects } from "@/contexts/ProjectsContext"
import type { Project, Transaction, AddExpenseInput, AddIncomeInput, UpdateExpenseInput, UpdateIncomeInput } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash2, Paperclip } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { CreateIncomeDialog } from "@/components/create-income-dialog"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { EditIncomeDialog } from "./edit-income-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProjectTransactionsTabProps = {
  project: Project;
  canEdit: boolean;
}

export function ProjectTransactionsTab({ project, canEdit }: ProjectTransactionsTabProps) {
    const { addTransaction, updateTransaction, deleteTransaction } = useProjects()

    const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
    const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [monthFilter, setMonthFilter] = useState<string>('all');

    const sortedTransactions = useMemo(() => 
        [...project.transactions].sort((a, b) => b.date.getTime() - a.date.getTime()), 
    [project.transactions]);

    const availableYears = useMemo(() => 
        [...new Set(sortedTransactions.map(t => t.date.getFullYear()))].sort((a,b) => b - a), 
    [sortedTransactions]);
    
    const availableMonths = useMemo(() => {
        const months = new Set<number>();
        sortedTransactions.forEach(t => {
            if (yearFilter === 'all' || t.date.getFullYear() === parseInt(yearFilter, 10)) {
                months.add(t.date.getMonth());
            }
        });
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return Array.from(months).map(m => ({ value: String(m), label: monthNames[m] }));
    }, [sortedTransactions, yearFilter]);


    const filteredTransactions = useMemo(() => sortedTransactions.filter(t => {
        const date = t.date;
        const yearMatch = yearFilter === 'all' || date.getFullYear() === parseInt(yearFilter, 10);
        const monthMatch = monthFilter === 'all' || date.getMonth() === parseInt(monthFilter, 10);
        return yearMatch && monthMatch;
    }), [sortedTransactions, yearFilter, monthFilter]);

    const userMonthlySummary = useMemo(() => {
        if (filteredTransactions.length === 0) {
            return [];
        }

        const summary: { [key: string]: { name: string, total: number } } = {};

        project.participants.forEach(p => {
            summary[p.name] = { name: p.name, total: 0 };
        });

        filteredTransactions.forEach(t => {
            if (t.type === 'expense' && t.user && summary[t.user]) {
                summary[t.user].total += t.amountUSD;
            }
        });

        return Object.values(summary).filter(s => s.total > 0).sort((a, b) => b.total - a.total);
    }, [filteredTransactions, project.participants]);


    const handleAddExpense = (data: AddExpenseInput) => {
        addTransaction(project.id, data, "expense");
    }

    const handleAddIncome = (data: AddIncomeInput) => {
        addTransaction(project.id, data, "income");
    }

    const handleEditClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);

        if (transaction.type === 'expense') {
            setIsEditExpenseDialogOpen(true)
        } else {
            setIsEditIncomeDialogOpen(true)
        }
    }

    const handleUpdateTransaction = (data: UpdateExpenseInput | UpdateIncomeInput) => {
        if (selectedTransaction) {
            updateTransaction(project.id, selectedTransaction.id, data);
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
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

  return (
    <>
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2 grid gap-6 min-w-0">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline">Transacciones</CardTitle>
                            <CardDescription>Todos los ingresos y gastos registrados en el proyecto.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="flex gap-2">
                                <Select value={yearFilter} onValueChange={(val) => { setYearFilter(val); setMonthFilter('all'); }}>
                                    <SelectTrigger className="w-full sm:w-[120px]">
                                        <SelectValue placeholder="Año" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={monthFilter} onValueChange={setMonthFilter}>
                                    <SelectTrigger className="w-full sm:w-[130px]">
                                        <SelectValue placeholder="Mes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {availableMonths.map(month => (
                                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {canEdit && <div className="flex gap-2 pt-2 sm:pt-0">
                                <CreateIncomeDialog onAddIncome={handleAddIncome} />
                                <CreateExpenseDialog
                                    onAddExpense={handleAddExpense}
                                    categories={project.categories}
                                    participants={project.participants}
                                />
                            </div>}
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
                                    <TableHead>Adjunto</TableHead>
                                    <TableHead className="text-right">Monto (U$S)</TableHead>
                                    {canEdit && <TableHead className="w-[50px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.date.toLocaleDateString('es-ES')}</TableCell>
                                            <TableCell className="font-medium">{t.description}</TableCell>
                                            <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
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
                                            <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                                                {t.type === 'income' ? '+' : ''}{formatCurrency(t.amountUSD)}
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
                                        <TableCell colSpan={canEdit ? 7 : 6} className="h-24 text-center text-muted-foreground">
                                            No hay transacciones para el período seleccionado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Resumen del Período</CardTitle>
                        <CardDescription>Total gastado por usuario en el período seleccionado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userMonthlySummary.length > 0 ? (
                            <ul className="space-y-4">
                                {userMonthlySummary.map(user => (
                                    <li key={user.name} className="flex justify-between items-center">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="font-semibold text-destructive">
                                            -{user.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground py-10 text-center">No hay gastos para mostrar.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        
        {canEdit && selectedTransaction && selectedTransaction.type === 'expense' && (
            <EditExpenseDialog
                isOpen={isEditExpenseDialogOpen}
                onOpenChange={setIsEditExpenseDialogOpen}
                expense={selectedTransaction}
                onUpdateExpense={handleUpdateTransaction}
                categories={project.categories}
                participants={project.participants}
            />
        )}

        {canEdit && selectedTransaction && selectedTransaction.type === 'income' && (
            <EditIncomeDialog
                isOpen={isEditIncomeDialogOpen}
                onOpenChange={setIsEditIncomeDialogOpen}
                income={selectedTransaction}
                onUpdateIncome={handleUpdateTransaction}
            />
        )}
        
        {canEdit && <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            title="¿Estás seguro de que quieres eliminar esta transacción?"
            description="Esta acción no se puede deshacer. Se eliminará la transacción de forma permanente."
        />}
    </>
  )
}

    
