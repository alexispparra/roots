"use client"

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link";
import { Users, DollarSign, Target, Landmark, MapPin, Loader2, AlertCircle } from "lucide-react";
import { CreateExpenseDialog } from "@/components/create-expense-dialog";
import { CreateCategoryDialog } from "@/components/create-category-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProjects } from "@/contexts/ProjectsContext";
import type { Category as ProjectCategory } from "@/contexts/ProjectsContext";


// --- TYPES ---
type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  user: string;
  paymentMethod: string;
  amountARS: number;
  exchangeRate: number;
  amountUSD: number;
};

type CategoryWithSpent = ProjectCategory & {
  spent: number;
  budget: number;
}


const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


export default function ProjectDetailPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const { getProjectById } = useProjects();
  const project = getProjectById(projectId);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryWithSpent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      setIsLoading(false);
      return;
    }
    
    if (!project.googleSheetId || project.googleSheetId.includes('YOUR_SHEET_ID_HERE') || project.googleSheetId.includes('12345_your_sheet_id_here')) {
      setError("Aún necesitas conectar este proyecto a una hoja de cálculo. Edita el proyecto para añadir un ID de Google Sheet válido.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sheets/${project.googleSheetId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        
        const transactionsWithUSD = data.transactions.map((t: any, index: number) => ({
          ...t,
          id: `T${index}`,
          amountUSD: t.amountARS / t.exchangeRate
        }));

        const categoriesWithSpent = data.categories.map((cat: any) => {
          const spent = transactionsWithUSD
            .filter((t: Transaction) => t.category === cat.name)
            .reduce((sum: number, t: Transaction) => sum + t.amountUSD, 0);
          return { name: cat.name, budget: cat.budget, spent };
        });

        setTransactions(transactionsWithUSD);
        setCategories(categoriesWithSpent);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project]);

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyecto no encontrado</CardTitle>
          <CardDescription>El proyecto que buscas no existe o el ID es incorrecto.</CardDescription>
        </CardHeader>
         <CardContent>
          <Button asChild variant="outline">
            <Link href="/projects">Volver a Proyectos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const remainingBudget = totalBudget - totalSpent;
  const totalContribution = project.participants.reduce((sum, p) => sum + (p.contribution || 0), 0);

  const spendingData = categories.map(cat => ({
    category: cat.name,
    amount: cat.spent,
    fill: `var(--color-${cat.name.toLowerCase().replace(/ /g, '-')})`
  }));
  
  const spendingConfig = categories.reduce((acc, category, index) => {
    acc[category.name.toLowerCase().replace(/ /g, '-')] = {
      label: category.name,
      color: CHART_COLORS[index % CHART_COLORS.length]
    };
    return acc;
  }, { amount: { label: "Monto" } } as ChartConfig);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4">Cargando datos desde Google Sheets...</p>
        </div>
      );
    }

    if (error) {
       return (
         <Alert variant="destructive" className="mt-6">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error al cargar los datos</AlertTitle>
           <AlertDescription>
             No se pudieron obtener los datos de Google Sheets. Verifica la configuración.
             <p className="font-mono text-xs mt-2 bg-destructive-foreground/10 p-2 rounded">
                {error}
             </p>
           </AlertDescription>
         </Alert>
       )
    }
    
    return (
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold font-headline">${totalSpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Presupuesto Restante</CardTitle>
                      <Target className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold font-headline">${remainingBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Participantes</CardTitle>
                      <Users className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold font-headline">{project.participants.length}</div>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Fondos Totales</CardTitle>
                      <Landmark className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold font-headline">${totalContribution.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
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
                                              <AvatarImage src={p.src} />
                                              <AvatarFallback>{p.fallback}</AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium">{p.name}</span>
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-right font-mono">${(p.contribution || 0).toLocaleString()}</TableCell>
                                  <TableCell className="text-right font-mono">{p.share || 0}%</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">Gastos por Categoría</CardTitle>
                      <CardDescription>Distribución de los gastos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={spendingConfig} className="mx-auto aspect-square max-h-[250px]">
                          <PieChart>
                              <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                              <Pie data={spendingData} dataKey="amount" nameKey="category" innerRadius={50}>
                                {spendingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                          </PieChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
               <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Ubicación del Proyecto
                    </CardTitle>
                    <CardDescription>{project.address}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full rounded-lg bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">Mapa no disponible</p>
                    </div>
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
                  Historial de ingresos y gastos del proyecto desde Google Sheets.
                </CardDescription>
              </div>
              <CreateExpenseDialog categories={categories} participants={project.participants} />
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
                  {transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                      <TableCell>{t.user}</TableCell>
                      <TableCell><Badge variant="secondary">{t.paymentMethod}</Badge></TableCell>
                       <TableCell className="text-right font-medium text-destructive font-mono">
                        -${t.amountARS.toLocaleString('es-AR')}
                      </TableCell>
                       <TableCell className="text-right font-mono text-muted-foreground text-sm">
                        {t.exchangeRate.toLocaleString('es-AR')}
                       </TableCell>
                       <TableCell className="text-right font-medium text-destructive font-mono">
                        -${t.amountUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
              {categories.map((category) => (
                <Card key={category.name}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{category.name}</span>
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">Ver detalle</Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="text-3xl font-bold">${category.spent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <p className="text-xs text-muted-foreground">de ${category.budget.toLocaleString()} presupuestados</p>
                        <Progress value={(category.spent / category.budget) * 100} className="h-2 mt-2" />
                    </CardContent>
                </Card>
              ))}
            </div>
           </div>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            <Badge className="text-base">{project.status}</Badge>
          </div>
        </CardHeader>
      </Card>
      {renderContent()}
    </div>
  );
}
