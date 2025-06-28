"use client"

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { type Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownLeft, Scale, Percent, Loader2, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

const ProjectMap = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg bg-muted">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Cargando mapa...</p>
      </div>
  ),
});


type ProjectSummaryProps = {
  project: Project
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function ProjectSummary({ project }: ProjectSummaryProps) {
  const { totalIncome, totalExpenses, balance, expensesByCategory, recentTransactions, overallProgress } = useMemo(() => {
    const income = project.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amountUSD, 0)

    const expenses = project.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amountUSD, 0)

    const bal = income - expenses

    const catExpenses: { [key: string]: number } = {}
    project.transactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        const category = t.category!
        if (!catExpenses[category]) {
          catExpenses[category] = 0
        }
        catExpenses[category] += t.amountUSD
      })
    
    const expByCategory = Object.entries(catExpenses)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const recTransactions = [...project.transactions]
        .sort((a, b) => b.date.getTime() - a.createdAt.getTime())
        .slice(0, 5)

    const totalProgress = project.categories.reduce((sum, category) => sum + (category.progress ?? 0), 0);
    const progress = project.categories.length > 0 ? totalProgress / project.categories.length : 0;


    return { 
      totalIncome: income,
      totalExpenses: expenses,
      balance: bal,
      expensesByCategory: expByCategory,
      recentTransactions: recTransactions,
      overallProgress: progress,
    }
  }, [project])

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  return (
    <div className="grid gap-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>{formatCurrency(balance)}</div>
            </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avance Total de Obra</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{`${overallProgress.toFixed(1)}%`}</div>
                  <Progress value={overallProgress} className="mt-2" />
              </CardContent>
            </Card>
       </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Gastos por Categoría</CardTitle>
                <CardDescription>Distribución de los gastos del proyecto.</CardDescription>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Separator className="my-4" />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Gasto (U$S)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesByCategory.map((category) => (
                        <TableRow key={category.name}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
                 ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No hay gastos para mostrar.
                </div>
              )}
            </CardContent>
         </Card>
         <Card className="md:col-span-2 lg:col-span-1">
             <CardHeader>
                <CardTitle className="font-headline">Últimas Transacciones</CardTitle>
                <CardDescription>Los 5 movimientos más recientes.</CardDescription>
             </Header>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Monto (U$S)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <div className="font-medium">{t.description}</div>
                                        <div className="text-xs text-muted-foreground">{t.date.toLocaleDateString('es-ES')}</div>
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountUSD)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                    No hay transacciones.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </CardContent>
         </Card>
       </div>
       
       {project.address && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapPin /> Ubicación del Proyecto
              </CardTitle>
              <CardDescription>{project.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectMap address={project.address} />
            </CardContent>
          </Card>
       )}
    </div>
  );
}
