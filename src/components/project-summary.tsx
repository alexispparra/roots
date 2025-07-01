
"use client"

import { useMemo } from "react"
import { type Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProjectFinancialSummary } from "./project-financial-summary"


const ProjectMapClient = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

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

