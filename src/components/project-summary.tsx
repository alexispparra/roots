
"use client"

import { useMemo, useState } from "react"
import { type Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { ProjectFinancialSummary } from "./project-financial-summary"


const ProjectMapClient = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function ProjectSummary({ project }: { project: Project }) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());

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
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlySummaryForYear: { [month: string]: { month: string, income: number, expense: number } } = {}
    for (let i = 0; i < 12; i++) {
        monthlySummaryForYear[i] = { month: monthNames[i], income: 0, expense: 0 };
    }

    project.transactions.forEach(t => {
      const year = t.date.getFullYear().toString()
      const month = t.date.getMonth()

      if (!yearlySummary[year]) {
        yearlySummary[year] = { year, income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        yearlySummary[year].income += t.amountUSD
      } else {
        yearlySummary[year].expense += t.amountUSD
      }
      
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
      Promise.resolve().then(() => setSelectedYear(allYears[0]));
    }

    return {
      yearlyData: Object.values(yearlySummary).sort((a, b) => parseInt(a.year) - parseInt(b.year)),
      monthlyData: Object.values(monthlySummaryForYear),
      availableYears: allYears
    }
  }, [project.transactions, selectedYear]);

  const chartData = timeframe === 'monthly' ? monthlyData : yearlyData;
  const xAxisKey = timeframe === 'monthly' ? 'month' : 'year';
  
  const chartConfig = {
      income: {
        label: "Ingresos",
        color: "hsl(var(--chart-2))",
      },
      expense: {
        label: "Gastos",
        color: "hsl(var(--chart-1))",
      },
  }

  return (
    <div className="grid gap-6">
       <ProjectFinancialSummary project={project} />
      
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
                                    label={({ percent }) =>
                                      new Intl.NumberFormat("default", {
                                        style: "percent",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }).format(percent)
                                    }
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
                <CardContent className="p-0 md:p-6 md:pt-0">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
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
                    </div>
                    {/* Mobile Card List */}
                    <div className="block md:hidden space-y-4 p-4">
                      {latestTransactions.length > 0 ? (
                        latestTransactions.map(t => (
                          <div key={t.id} className="flex items-center gap-4 rounded-lg border p-3 text-sm">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{t.description}</p>
                                <p className="text-xs text-muted-foreground">{t.date.toLocaleDateString('es-ES')}</p>
                            </div>
                            <div className={`shrink-0 font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountUSD)}
                            </div>
                          </div>
                        ))
                      ) : (
                          <div className="py-10 text-center text-muted-foreground">
                              No hay transacciones registradas.
                          </div>
                      )}
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <CardTitle>Ingresos vs. Gastos</CardTitle>
                <CardDescription>Resumen financiero del proyecto.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Select value={timeframe} onValueChange={(value) => setTimeframe(value as 'monthly' | 'annual')}>
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="annual">Anual</SelectItem>
                  </SelectContent>
                </Select>
                {timeframe === 'monthly' && (
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey={xAxisKey} tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Tooltip
                    cursor={false}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Ingresos" fill="var(--color-income)" radius={4} />
                  <Bar dataKey="expense" name="Gastos" fill="var(--color-expense)" radius={4} />
                </BarChart>
              </ChartContainer>
          </CardContent>
        </Card>


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
