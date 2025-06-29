
"use client"

import { useMemo, useState } from "react"
import { type Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from '@/components/ui/progress'
import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'
import { ArrowUpRight, ArrowDownLeft, Scale, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const ProjectMapClient = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function ProjectSummary({ project }: { project: Project }) {
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());

  const totalIncome = project.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amountUSD, 0);

  const totalExpenses = project.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amountUSD, 0);

  const balance = totalIncome - totalExpenses;

  const totalProgress = project.categories.reduce((sum, category) => sum + (category.progress ?? 0), 0);
  const overallProgress = project.categories.length > 0 ? totalProgress / project.categories.length : 0;

  const expensesByCategory = project.transactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      const category = t.category!;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += t.amountUSD;
      return acc;
    }, {} as Record<string, number>);

  const categoryChartData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Show top 5 categories

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  
  const latestTransactions = [...project.transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
    
  const { yearlyData, monthlyData, availableYears } = useMemo(() => {
    const yearlySummary: { [year: string]: { year: string, income: number, expense: number } } = {}
    const monthlySummaryForYear: { [month: string]: { month: string, income: number, expense: number } } = {}
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    for (let i = 0; i < 12; i++) {
        monthlySummaryForYear[i] = { month: monthNames[i], income: 0, expense: 0 };
    }

    project.transactions.forEach(t => {
      const year = t.date.getFullYear().toString()
      const month = t.date.getMonth()

      // Yearly aggregation
      if (!yearlySummary[year]) {
        yearlySummary[year] = { year, income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        yearlySummary[year].income += t.amountUSD
      } else {
        yearlySummary[year].expense += t.amountUSD
      }

      // Monthly aggregation for selected year
      if (year === selectedYear) {
        if (t.type === 'income') {
            monthlySummaryForYear[month].income += t.amountUSD
        } else {
            monthlySummaryForYear[month].expense += t.amountUSD
        }
      }
    })
    
    const allYears = Object.keys(yearlySummary).sort((a, b) => parseInt(b) - parseInt(a));
    if (allYears.length > 0 && !allYears.includes(selectedYear)) {
      // This is a side-effect in a memo, which is not ideal, but acceptable for this case.
      // A better solution would use a separate useEffect.
      Promise.resolve().then(() => setSelectedYear(allYears[0]));
    }

    return {
      yearlyData: Object.values(yearlySummary).sort((a, b) => parseInt(a.year) - parseInt(b.year)),
      monthlyData: Object.values(monthlySummaryForYear),
      availableYears: allYears
    }
  }, [project.transactions, selectedYear]);

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
                  <CardTitle className="text-sm font-medium">Avance Total</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{`${overallProgress.toFixed(1)}%`}</div>
                  <Progress value={overallProgress} className="mt-2" />
              </CardContent>
            </Card>
       </div>
      
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                    <CardDescription>Distribución de los gastos totales del proyecto.</CardDescription>
                </CardHeader>
                <CardContent>
                    {categoryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            No hay gastos registrados para mostrar un gráfico.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Últimas Transacciones</CardTitle>
                    <CardDescription>Los 5 movimientos más recientes del proyecto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Monto (U$S)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {latestTransactions.length > 0 ? (
                                latestTransactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="font-medium">{t.description}</div>
                                            <div className="text-sm text-muted-foreground">{t.date.toLocaleDateString('es-ES')}</div>
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                                            {t.type === 'income' ? '+' : ''}{formatCurrency(t.amountUSD)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                        No hay transacciones registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle>Ingresos vs. Gastos (Mensual)</CardTitle>
                        <CardDescription>Resumen mensual para el año seleccionado.</CardDescription>
                    </div>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full sm:w-[120px]">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="income" name="Ingresos" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Gastos" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ingresos vs. Gastos (Anual)</CardTitle>
                    <CardDescription>Resumen de toda la vida del proyecto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="income" name="Ingresos" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Gastos" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>


      {project.address && (
        <Card>
          <CardHeader>
            <CardTitle>Ubicación del Proyecto</CardTitle>
            <CardDescription>{project.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectMapClient address={project.address} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
