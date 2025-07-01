
"use client"

import { useMemo, useState, useEffect } from "react"
import { type Project, type Transaction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProjectFinancialSummary } from "./project-financial-summary"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const ProjectMapClient = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Component for the responsive bar chart, now with interactive filters
function IncomeVsExpensesChart({ transactions }: { transactions: Transaction[] }) {
  const availableYears = useMemo(() => 
      [...new Set(transactions.map(t => t.date.getFullYear()))].sort((a, b) => b - a), 
  [transactions]);

  const [chartView, setChartView] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0]?.toString() ?? new Date().getFullYear().toString());

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(parseInt(selectedYear))) {
        setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  const chartData = useMemo(() => {
    if (chartView === 'annual') {
      const yearlyData: Record<string, { income: number, expenses: number }> = {};
      
      transactions.forEach(t => {
        const year = t.date.getFullYear().toString();
        if (!yearlyData[year]) {
          yearlyData[year] = { income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          yearlyData[year].income += t.amountUSD;
        } else {
          yearlyData[year].expenses += t.amountUSD;
        }
      });

      return Object.entries(yearlyData)
        .map(([year, data]) => ({ label: year, ...data }))
        .sort((a, b) => parseInt(a.label, 10) - parseInt(b.label, 10));
    }

    // Monthly view
    const yearToFilter = parseInt(selectedYear, 10);
    const monthlyData: { label: string, income: number, expenses: number }[] = [];

    for (let i = 0; i < 12; i++) {
        const monthName = format(new Date(yearToFilter, i, 1), 'MMM', { locale: es });
        monthlyData.push({
            label: monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.', ''),
            income: 0,
            expenses: 0,
        });
    }

    transactions
      .filter(t => t.date.getFullYear() === yearToFilter)
      .forEach(t => {
        const monthIndex = t.date.getMonth();
        if (t.type === 'income') {
          monthlyData[monthIndex].income += t.amountUSD;
        } else {
          monthlyData[monthIndex].expenses += t.amountUSD;
        }
      });
    
    return monthlyData;
  }, [transactions, chartView, selectedYear]);

  const chartDescription = chartView === 'annual' 
    ? "Comparativa anual de ingresos vs. gastos."
    : `Comparativa mensual para el año ${selectedYear}.`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <CardTitle>Ingresos vs. Gastos</CardTitle>
                <CardDescription>{chartDescription}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={chartView} onValueChange={(v) => setChartView(v as any)}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                </Select>
                {chartView === 'monthly' && (
                    <Select value={selectedYear} onValueChange={setSelectedYear} disabled={availableYears.length === 0}>
                        <SelectTrigger className="w-full sm:w-[100px]">
                             <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.length > 0 ? (
                              availableYears.map(y => (
                                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value={new Date().getFullYear().toString()} disabled>
                                {new Date().getFullYear()}
                              </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 0,
                left: -20,
                bottom: 5,
              }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="label"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (typeof value === 'number' && value >= 1000) return `$${value / 1000}k`;
                      return `$${value}`;
                    }}
                />
                <Tooltip
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                    formatter={(value: number, name: string) => {
                      const formattedName = name === 'income' ? 'Ingresos' : 'Gastos';
                      return [formatCurrency(value), formattedName];
                    }}
                />
                <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
                <Bar dataKey="income" name="Ingresos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


export function ProjectSummary({ project }: { project: Project }) {
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
    
  return (
    <div className="grid gap-6">
       <ProjectFinancialSummary project={project} />

       <IncomeVsExpensesChart transactions={project.transactions} />
      
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
                    {/* Mobile Card List - REBUILT to be responsive */}
                    <div className="block md:hidden space-y-4 p-4">
                      {latestTransactions.length > 0 ? (
                        latestTransactions.map(t => (
                          <Card key={t.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium leading-snug">{t.description}</CardTitle>
                                <CardDescription>{t.date.toLocaleDateString('es-ES')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Monto</span>
                                    <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountUSD)}
                                    </span>
                                </div>
                            </CardContent>
                          </Card>
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
