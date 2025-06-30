
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

const renderLegend = (props: any) => {
  const { payload } = props;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="break-all">{entry.value}</span>
        </div>
      ))}
    </div>
  );
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
                                <Legend content={renderLegend} />
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
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="w-[110px] text-right">Monto (U$S)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {latestTransactions.length > 0 ? (
                                latestTransactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell className="break-words">
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
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Ingresos vs. Gastos</CardTitle>
              <CardDescription>Resumen financiero del proyecto.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={(value) => setTimeframe(value as 'monthly' | 'annual')}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
              {timeframe === 'monthly' && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
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
