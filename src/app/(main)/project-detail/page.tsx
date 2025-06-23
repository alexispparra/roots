"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link";


import { Users, DollarSign, Target, Landmark, PlusCircle } from "lucide-react";

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

const transactions = [
  { id: 'T001', date: '2024-07-28', description: 'Servidores AWS', category: 'Desarrollo', user: 'Ana García', amount: 500 },
  { id: 'T002', date: '2024-07-27', description: 'Licencia Figma', category: 'Diseño UI/UX', user: 'Ana García', amount: 150 },
  { id: 'T003', date: '2024-07-26', description: 'Campaña Google Ads', category: 'Marketing', user: 'Luis Torres', amount: 800 },
  { id: 'T004', date: '2024-07-25', description: 'Compra de dominio', category: 'Desarrollo', user: 'Carlos Ruiz', amount: 25 },
  { id: 'T005', date: '2024-07-24', description: 'Servicios de contabilidad', category: 'Administrativo', user: 'Ana García', amount: 500 },
];

const categories = [
  { name: "Desarrollo", spent: 3525, budget: 6000 },
  { name: "Diseño UI/UX", spent: 2150, budget: 3000 },
  { name: "Marketing", spent: 2300, budget: 2500 },
  { name: "Administrativo", spent: 500, budget: 1000 },
];


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

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="grid gap-6">
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
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle className="font-headline">Transacciones del Proyecto</CardTitle>
                <CardDescription>
                  Historial de ingresos y gastos del proyecto.
                </CardDescription>
              </div>
              <Button size="sm" className="ml-auto gap-1">
                <PlusCircle className="h-4 w-4" />
                Registrar Gasto
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                      <TableCell>{t.user}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">-${t.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
           <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Categorías de Gastos</CardTitle>
                  <CardDescription>Gestiona y visualiza los gastos por categoría.</CardDescription>
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Categoría
                </Button>
              </CardHeader>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.name}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{category.name}</span>
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">Ver detalle</Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="text-3xl font-bold">${category.spent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">de ${category.budget.toLocaleString()} presupuestados</p>
                        <Progress value={(category.spent / category.budget) * 100} className="h-2 mt-2" />
                    </CardContent>
                </Card>
              ))}
            </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
