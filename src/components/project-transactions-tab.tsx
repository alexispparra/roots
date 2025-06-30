
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
            <CardContent>
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
                 {/* Mobile Card List */}
                 <div className="block md:hidden space-y-4">
                     {userSpendingSummary.length > 0 ? (
                        userSpendingSummary.map((item) => (
                            <Card key={item.user} className="data-card-theme">
                                <CardContent className="p-3 flex justify-between items-center text-sm">
                                    <p className="font-medium">{item.user}</p>
                                    <p className="font-semibold text-destructive">
                                        -{formatCurrency(item.amount)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
                            No hay gastos de usuarios en este período.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className="data-card-theme">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="font-headline">Transacciones</CardTitle>
                  <CardDescription>Todos los ingresos y gastos registrados en el proyecto.</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <Select value={yearFilter} onValueChange={(val) => { setYearFilter(val); setMonthFilter('all'); }}>
                    <SelectTrigger className="w-full sm:w-auto md:w-[120px] bg-secondary text-secondary-foreground border-sidebar-border">
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
                    <SelectTrigger className="w-full sm:w-auto md:w-[120px] bg-secondary text-secondary-foreground border-sidebar-border">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableMonths.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   {canEdit && (
                    <>
                      <CreateIncomeDialog onAddIncome={handleAddIncome} />
                      <CreateExpenseDialog
                        onAddExpense={handleAddExpense}
                        categories={project.categories}
                        participants={project.participants}
                      />
                    </>
                  )}
                </div>
              </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="w-[120px] text-right">Monto (U$S)</TableHead>
                    {canEdit && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.date.toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="font-medium break-all">{t.description}</TableCell>
                        <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                        <TableCell>{t.user}</TableCell>
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
                              {t.attachmentDataUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={t.attachmentDataUrl} target="_blank" rel="noopener noreferrer">
                                    <Paperclip className="mr-2 h-4 w-4" /> Ver Adjunto
                                  </a>
                                </DropdownMenuItem>
                              )}
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
                      <TableCell colSpan={canEdit ? 6 : 5} className="h-24 text-center">
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
                        <Card key={t.id} className="data-card-theme">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div>
                                    <CardTitle className="text-sm font-medium leading-snug break-all">{t.description}</CardTitle>
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
                                            {t.attachmentDataUrl && (
                                                <DropdownMenuItem asChild>
                                                    <a href={t.attachmentDataUrl} target="_blank" rel="noopener noreferrer">
                                                        <Paperclip className="mr-2 h-4 w-4" /> Ver Adjunto
                                                    </a>
                                                </DropdownMenuItem>
                                            )}
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
                            <CardContent className="pt-2 text-sm">
                                <div className="flex justify-between items-center border-t pt-2 mt-2">
                                    <span className="text-muted-foreground">Monto</span>
                                    <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountUSD)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-muted-foreground">Categoría</span>
                                    <Badge variant="outline" className="font-medium">{t.category}</Badge>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-muted-foreground">Usuario</span>
                                    <span className="font-medium">{t.user}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
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
