"use client"

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link";
import { Users, DollarSign, Target, Landmark } from "lucide-react";
import { CreateExpenseDialog } from "@/components/create-expense-dialog";
import { CreateCategoryDialog } from "@/components/create-category-dialog";

// --- MOCK DATA ---
const projectsData = {
  'PROJ-001': {
    name: "Lanzamiento App Móvil",
    status: "En Curso",
    summaryData: [
      { metric: "Gasto Total", value: "$7,000", icon: <DollarSign /> },
      { metric: "Presupuesto Restante", value: "$5,000", icon: <Target /> },
      { metric: "Participantes", value: "3", icon: <Users /> },
      { metric: "Fondos", value: "$10,000", icon: <Landmark /> },
    ],
    spendingData: [
      { category: "Desarrollo", amount: 3500, fill: "var(--color-dev)" },
      { category: "Diseño UI/UX", amount: 2000, fill: "var(--color-design)" },
      { category: "Marketing", amount: 1500, fill: "var(--color-marketing)" },
    ],
    spendingConfig: {
      amount: { label: "Monto" },
      dev: { label: "Desarrollo", color: "hsl(var(--chart-1))" },
      design: { label: "Diseño UI/UX", color: "hsl(var(--chart-2))" },
      marketing: { label: "Marketing", color: "hsl(var(--chart-3))" },
    } satisfies ChartConfig,
    participants: [
        { name: "Ana García", contribution: 5000, share: 50, avatar: 'https://placehold.co/40x40.png', fallback: 'AG' },
        { name: "Luis Torres", contribution: 3000, share: 30, avatar: 'https://placehold.co/40x40.png', fallback: 'LT' },
        { name: "Carlos Ruiz", contribution: 2000, share: 20, avatar: 'https://placehold.co/40x40.png', fallback: 'CR' },
    ],
    transactions: [
      { id: 'T001', date: '2024-07-28', description: 'Servidores AWS', category: 'Desarrollo', user: 'Ana García', montoARS: 525000, cambio: 1050, medioDePago: 'Banco'},
      { id: 'T002', date: '2024-07-27', description: 'Licencia Figma', category: 'Diseño UI/UX', user: 'Ana García', montoARS: 157500, cambio: 1050, medioDePago: 'Banco'},
      { id: 'T003', date: '2024-07-26', description: 'Campaña Google Ads', category: 'Marketing', user: 'Luis Torres', montoARS: 840000, cambio: 1050, medioDePago: 'Factura'},
      { id: 'T004', date: '2024-07-25', description: 'Compra de dominio', category: 'Desarrollo', user: 'Carlos Ruiz', montoARS: 26250, cambio: 1050, medioDePago: 'Efectivo'},
      { id: 'T005', date: '2024-07-24', description: 'Servicios de contabilidad', category: 'Administrativo', user: 'Ana García', montoARS: 525000, cambio: 1050, medioDePago: 'Otro'},
    ],
    categories: [
      { name: "Desarrollo", spent: 3525, budget: 6000 },
      { name: "Diseño UI/UX", spent: 2150, budget: 3000 },
      { name: "Marketing", spent: 2300, budget: 2500 },
      { name: "Administrativo", spent: 500, budget: 1000 },
    ]
  },
  'PROJ-003': {
    name: "Campaña Marketing Q3",
    status: "En Curso",
    summaryData: [
      { metric: "Gasto Total", value: "$4,200", icon: <DollarSign /> },
      { metric: "Presupuesto Restante", value: "$3,300", icon: <Target /> },
      { metric: "Participantes", value: "3", icon: <Users /> },
      { metric: "Fondos", value: "$7,500", icon: <Landmark /> },
    ],
    spendingData: [
      { category: "Publicidad", amount: 2800, fill: "var(--color-dev)" },
      { category: "Contenido", amount: 1400, fill: "var(--color-design)" },
    ],
    spendingConfig: {
      amount: { label: "Monto" },
      dev: { label: "Publicidad", color: "hsl(var(--chart-1))" },
      design: { label: "Contenido", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
    participants: [
        { name: "Fernanda Gómez", contribution: 4000, share: 53, avatar: 'https://placehold.co/40x40.png', fallback: 'FG' },
        { name: "Hugo Iglesias", contribution: 2000, share: 27, avatar: 'https://placehold.co/40x40.png', fallback: 'HI' },
        { name: "Julia Ponce", contribution: 1500, share: 20, avatar: 'https://placehold.co/40x40.png', fallback: 'JP' },
    ],
    transactions: [
      { id: 'T006', date: '2024-07-28', description: 'Anuncios en Meta', category: 'Publicidad', user: 'Fernanda Gómez', montoARS: 210000, cambio: 1050, medioDePago: 'Banco'},
      { id: 'T007', date: '2024-07-27', description: 'Redacción de artículos', category: 'Contenido', user: 'Hugo Iglesias', montoARS: 105000, cambio: 1050, medioDePago: 'Efectivo'},
    ],
    categories: [
      { name: "Publicidad", spent: 4000, budget: 5000 },
      { name: "Contenido", spent: 2000, budget: 2500 },
    ]
  }
}

export default function ProjectDetailPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id') as keyof typeof projectsData | null;
  
  // Fallback to the first project if no ID is provided or ID is invalid
  const project = (projectId && projectsData[projectId]) ? projectsData[projectId] : projectsData['PROJ-001'];
  
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyecto no encontrado</CardTitle>
          <CardDescription>El proyecto que buscas no existe o no tienes acceso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
              {project.summaryData.map(item => (
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
                          {project.participants.map(p => (
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
                      <ChartContainer config={project.spendingConfig} className="mx-auto aspect-square max-h-[250px]">
                          <PieChart>
                              <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                              <Pie data={project.spendingData} dataKey="amount" nameKey="category" innerRadius={50} />
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
              <CreateExpenseDialog categories={project.categories} participants={project.participants} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Medio de Pago</TableHead>
                    <TableHead className="text-right">Monto (AR$)</TableHead>
                    <TableHead className="text-right">Cambio</TableHead>
                    <TableHead className="text-right">Monto (U$S)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                      <TableCell>{t.user}</TableCell>
                      <TableCell><Badge variant="secondary">{t.medioDePago}</Badge></TableCell>
                       <TableCell className="text-right font-medium text-destructive font-mono">
                        -${t.montoARS.toLocaleString('es-AR')}
                      </TableCell>
                       <TableCell className="text-right font-mono text-muted-foreground text-sm">
                        {t.cambio.toLocaleString('es-AR')}
                       </TableCell>
                       <TableCell className="text-right font-medium text-destructive font-mono">
                        -${(t.montoARS / t.cambio).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
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
                <CreateCategoryDialog />
              </CardHeader>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {project.categories.map((category) => (
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
