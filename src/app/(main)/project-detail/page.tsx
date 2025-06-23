"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"

import { Users, DollarSign, Target, Landmark } from "lucide-react";

const project = {
  name: "Lanzamiento App Móvil",
  status: "En Curso"
};

const summaryData = [
  { metric: "Gasto Total", value: "$7,000", icon: <DollarSign /> },
  { metric: "Presupuesto Restante", value: "$5,000", icon: <Target /> },
  { metric: "Participantes", value: "3", icon: <Users /> },
  { metric: "Fondos", value: "$10,000", icon: <Landmark /> },
];

const spendingData = [
  { category: "Desarrollo", amount: 3500, fill: "var(--color-dev)" },
  { category: "Diseño UI/UX", amount: 2000, fill: "var(--color-design)" },
  { category: "Marketing", amount: 1500, fill: "var(--color-marketing)" },
]

const spendingConfig = {
  amount: { label: "Monto" },
  dev: { label: "Desarrollo", color: "hsl(var(--chart-1))" },
  design: { label: "Diseño UI/UX", color: "hsl(var(--chart-2))" },
  marketing: { label: "Marketing", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const participants = [
    { name: "Ana García", contribution: 5000, share: 50, avatar: 'https://placehold.co/40x40.png', fallback: 'AG' },
    { name: "Luis Torres", contribution: 3000, share: 30, avatar: 'https://placehold.co/40x40.png', fallback: 'LT' },
    { name: "Carlos Ruiz", contribution: 2000, share: 20, avatar: 'https://placehold.co/40x40.png', fallback: 'CR' },
]

export default function ProjectDetailPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
              <CardDescription>Detalles del emprendimiento y su estado financiero.</CardDescription>
            </div>
            <Badge className="text-base">{project.status}</Badge>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map(item => (
            <Card key={item.metric}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.metric}</CardTitle>
                    <div className="text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{item.icon}</div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-headline">{item.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Participantes y Aportes</CardTitle>
            <CardDescription>Inversión individual y participación en el proyecto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Participante</TableHead>
                        <TableHead className="text-right">Aporte</TableHead>
                        <TableHead className="text-right">Participación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participants.map(p => (
                        <TableRow key={p.name}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={p.avatar} />
                                        <AvatarFallback>{p.fallback}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{p.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">${p.contribution.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">{p.share}%</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Gastos por Categoría</CardTitle>
                 <CardDescription>Distribución de los gastos actuales del proyecto.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={spendingConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                        <Pie data={spendingData} dataKey="amount" nameKey="category" innerRadius={50} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
