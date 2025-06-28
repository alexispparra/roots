"use client"

import { type Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from '@/components/ui/progress'
import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'
import { ArrowUpRight, ArrowDownLeft, Scale, Percent } from 'lucide-react'

const ProjectMapClient = dynamic(() => import('@/components/project-map-client'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function ProjectSummary({ project }: { project: Project }) {
  const totalIncome = project.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amountUSD, 0);

  const totalExpenses = project.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amountUSD, 0);

  const balance = totalIncome - totalExpenses;

  const totalProgress = project.categories.reduce((sum, category) => sum + (category.progress ?? 0), 0);
  const overallProgress = project.categories.length > 0 ? totalProgress / project.categories.length : 0;

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
