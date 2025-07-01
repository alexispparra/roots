
"use client"

import { useState, useMemo } from "react"
import { useProjects } from "@/contexts/ProjectsContext"
import type { Project, Transaction, AddExpenseInput, AddIncomeInput, UpdateExpenseInput, UpdateIncomeInput } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash2, Paperclip, Users } from "lucide-react"
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
        return Array.from(months).sort((a,b) => a - b).map(m => ({ value: String(m), label: monthNames[m] }));
    }, [sortedTransactions, yearFilter]);


    const filteredTransactions = useMemo(() => sortedTransactions.filter(t => {
        const date = t.date;
        const yearMatch = yearFilter === 'all' || date.getFullYear() === parseInt(yearFilter, 10);
        const monthMatch = monthFilter === 'all' || date.getMonth() === parseInt(monthFilter, 10);
        return yearMatch && monthMatch;
    }), [sortedTransactions, yearFilter, monthFilter]);

    const userSpendingSummary = useMemo(() => {
        const spending = filteredTransactions
            .filter(t => t.type === 'expense' && t.user)
            .reduce((acc, t) => {
                const user = t.user!;
                if (!acc[user]) {
                    acc[user] = 0;
                }
                acc[user] += t.amountUSD;
                return acc;
            }, {} as Record<string, number>);
        
        return Object.entries(spending)
            .map(([user, amount]) => ({ user, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [filteredTransactions]);


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
      <div className="grid gap-6">
        <Card className="data-card-theme">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Gastos por Usuario (Período)</CardTitle>
                <CardDescription>Resumen de gastos por usuario para el período seleccionado.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead className="text-right">Monto Gastado (U$S)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userSpendingSummary.length > 0 ? (
                                userSpendingSummary.map(item => (
                                    <TableRow key={item.user}>
                                        <TableCell className="font-medium">{item.user}</TableCell>
                                        <TableCell className="text-right font-medium text-destructive">
                                            -{formatCurrency(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                        No hay gastos de usuarios en este período.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Mobile List */}
                <div className="block md:hidden space-y-2 p-4">
                    {userSpendingSummary.length > 0 ? (
                        userSpendingSummary.map(item => (
                             <div key={item.user} className="flex justify-between items-center rounded-lg border p-3 text-sm">
                                <span className="font-medium">{item.user}</span>
                                <span className="font-semibold text-destructive">-{formatCurrency(item.amount)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-muted-foreground">
                            No hay gastos de usuarios.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className="data-card-theme">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="font-headline">Transacciones</CardTitle>
                  <CardDescription>Todos los ingresos y gastos registrados en el proyecto.</CardDescription>
                </div>
                {canEdit && (
                <div className="grid grid-cols-2 w-full sm:w-auto gap-2">
                    <CreateIncomeDialog onAddIncome={handleAddIncome} />
                    <CreateExpenseDialog
                    onAddExpense={handleAddExpense}
                    categories={project.categories}
                    participants={project.participants}
                    />
                </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 mt-4 border-t border-border/50">
                <span className="text-sm font-medium text-muted-foreground mr-2">Filtrar por:</span>
                <div className="flex w-full sm:w-auto gap-2">
                    <Select value={yearFilter} onValueChange={(val) => { setYearFilter(val); setMonthFilter('all'); }}>
                        <SelectTrigger className="h-9 flex-1 sm:flex-none sm:w-[120px] bg-secondary text-secondary-foreground border-sidebar-border">
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
                        <SelectTrigger className="h-9 flex-1 sm:flex-none sm:w-[120px] bg-secondary text-secondary-foreground border-sidebar-border">
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
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                      <TableCell colSpan={canEdit ? 7 : 6} className="h-24 text-center">
                        No hay transacciones para el período seleccionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Card List */}
            <div className="block md:hidden space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <Card key={t.id}>
                    <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-medium leading-snug truncate">{t.description}</CardTitle>
                        <CardDescription>{t.date.toLocaleDateString('es-ES')}</CardDescription>
                      </div>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-2 shrink-0">
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
                    <CardContent className="p-4 pt-2 text-sm">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="text-muted-foreground">Monto</div>
                        <div className={`font-semibold text-right ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountUSD)}
                        </div>

                        <div className="text-muted-foreground">Categoría</div>
                        <div className="text-right"><Badge variant="outline" className="font-normal">{t.category}</Badge></div>

                        <div className="text-muted-foreground">Usuario</div>
                        <div className="font-medium text-right">{t.user}</div>
                      </div>
                      {t.attachmentDataUrl && (
                        <div className="flex justify-between items-center pt-3 mt-3 border-t">
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
                <div className="h-24 text-center flex items-center justify-center">
                  No hay transacciones para el período seleccionado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
