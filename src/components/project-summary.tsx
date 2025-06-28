"use client"

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { type Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownLeft, Scale, Percent } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'

const ProjectMapClient = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
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
];

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function ProjectSummary({ project }: ProjectSummaryProps) {
  
  const data = useMemo(() => {
    const income = project.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amountUSD, 0);

    const expenses = project.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amountUSD, 0);

    const balance = income - expenses;

    const expensesByCategory: { [key: string]: number } = {};
    project.transactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        const category = t.category!;
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += t.amountUSD;
      });
    
    const expensesByCategoryChartData = Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const recentTransactions = [...project.transactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

    const totalProgress = project.categories.reduce((sum, category) => sum + (category.progress ?? 0), 0);
    const overallProgress = project.categories.length > 0 ? totalProgress / project.categories.length : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: balance,
      expensesByCategory: expensesByCategoryChartData,
      recentTransactions: recentTransactions,
      overallProgress: overallProgress,
    };
  }, [project]);

  return (
    <div className="grid gap-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(data.totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(data.totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${data.balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>{formatCurrency(data.balance)}</div>
            </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avance Total de Obra</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{`${data.overallProgress.toFixed(1)}%`}</div>
                  <Progress value={data.overallProgress} className="mt-2" />
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
              {data.expensesByCategory.length > 0 ? (
                <>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.expensesByCategory.map((entry, index) => (
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
                      {data.expensesByCategory.map((category) => (
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
                        {data.recentTransactions.length > 0 ? (
                            data.recentTransactions.map((t) => (
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
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ubicación del Proyecto</CardTitle>
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
