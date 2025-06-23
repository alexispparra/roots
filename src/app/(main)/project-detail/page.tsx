
"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart, Cell, Bar, BarChart, XAxis, YAxis, CartesianGrid, Label, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link";
import { ArrowLeft, Users, DollarSign, Target, Landmark, MapPin, Loader2, AlertCircle, ChevronDown, Calendar as CalendarIcon, MoreVertical, Edit, Trash2 } from "lucide-react";
import { CreateExpenseDialog } from "@/components/create-expense-dialog";
import { CreateIncomeDialog } from "@/components/create-income-dialog";
import { CreateCategoryDialog } from "@/components/create-category-dialog";
import { EditCategoryDialog } from "@/components/edit-category-dialog";
import { EditExpenseDialog } from "@/components/edit-expense-dialog";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProjects } from "@/contexts/ProjectsContext";
import type { Category as ProjectCategory, ProjectStatus, UpdateProjectData } from "@/contexts/ProjectsContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label as UiLabel } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";


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
  type: 'income' | 'expense';
};

type CategoryWithSpent = ProjectCategory & {
  spent: number;
}

// --- MOCK DATA for projects without a real Google Sheet ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'MI-1', date: '2024-07-15', description: 'Aporte inicial', category: 'Inversión', user: 'Ana García', paymentMethod: 'Banco', amountARS: 5000000, exchangeRate: 1000, amountUSD: 5000, type: 'income' },
  { id: 'MT-1', date: '2024-07-20', description: 'Licencia de software', category: 'Desarrollo', user: 'Ana García', paymentMethod: 'Banco', amountARS: 150000, exchangeRate: 1000, amountUSD: 150, type: 'expense' },
  { id: 'MT-2', date: '2024-07-21', description: 'Diseño de logo', category: 'Diseño UI/UX', user: 'Luis Torres', paymentMethod: 'Factura', amountARS: 80000, exchangeRate: 1000, amountUSD: 80, type: 'expense' },
  { id: 'MI-2', date: '2024-06-10', description: 'Aporte inicial', category: 'Inversión', user: 'Luis Torres', paymentMethod: 'Banco', amountARS: 3000000, exchangeRate: 1050, amountUSD: 2857.14, type: 'income' },
  { id: 'MT-3', date: '2024-06-22', description: 'Campaña en redes', category: 'Marketing', user: 'Carlos Ruiz', paymentMethod: 'Efectivo', amountARS: 120000, exchangeRate: 1050, amountUSD: 114.28, type: 'expense' },
  { id: 'MT-4', date: '2024-06-23', description: 'Servidor de pruebas', category: 'Desarrollo', user: 'Ana García', paymentMethod: 'Banco', amountARS: 50000, exchangeRate: 1050, amountUSD: 47.62, type: 'expense' },
  { id: 'MT-5', date: '2023-12-15', description: 'Compra de dominio', category: 'Desarrollo', user: 'Ana García', paymentMethod: 'Banco', amountARS: 25000, exchangeRate: 900, amountUSD: 27.78, type: 'expense' },
];


const MOCK_CATEGORIES = [
    { name: "Desarrollo", budget: 5000 },
    { name: "Diseño UI/UX", budget: 2000 },
    { name: "Marketing", budget: 3000 },
    { name: "Inversión", budget: 0 },
    { name: "Albañilería", budget: 10000 },
];


const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


export default function ProjectDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const projectId = searchParams.get('id');
  const { getProjectById, updateProjectStatus, addCategoryToProject, updateCategoryInProject, deleteCategoryFromProject, updateProject } = useProjects();
  const project = getProjectById(projectId);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ user: "Todos", category: "Todas" });
  const [transactionsYear, setTransactionsYear] = useState<number>(new Date().getFullYear());

  const [cashflowDateRange, setCashflowDateRange] = useState<DateRange | undefined>();
  const [cashflowCategoryFilter, setCashflowCategoryFilter] = useState<string>("Todas");
  const [cashflowYear, setCashflowYear] = useState<number>(new Date().getFullYear());
  const [allYears, setAllYears] = useState<number[]>([]);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') ? decodeURIComponent(searchParams.get('category')!) : null);
  
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ProjectCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Transaction | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    const category = searchParams.get('category');
    setActiveTab(tab);
    setSelectedCategory(category ? decodeURIComponent(category) : null);
  }, [searchParams]);


  useEffect(() => {
     if (!project) {
        setIsLoading(false);
        return;
    }

    const processDataAndSetYears = (txns: Transaction[], allCategories: ProjectCategory[]) => {
        setTransactions(txns);
        setCategories(allCategories);

        const years = [...new Set(txns.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
        if (years.length > 0) {
            setAllYears(years);
            const currentYear = new Date().getFullYear();
            if(years.includes(currentYear)) {
                setCashflowYear(currentYear);
                setTransactionsYear(currentYear);
            } else {
                setCashflowYear(years[0]);
                setTransactionsYear(years[0]);
            }
        } else {
            const currentYear = new Date().getFullYear();
            setAllYears([currentYear]);
            setCashflowYear(currentYear);
            setTransactionsYear(currentYear);
        }

        setIsLoading(false);
        setError(null);
    }

    if (!project.googleSheetId) {
        processDataAndSetYears(MOCK_TRANSACTIONS, project.categories || MOCK_CATEGORIES);
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
          amountUSD: t.amountARS / t.exchangeRate,
          type: t.amountARS > 0 ? 'expense' : 'income' 
        }));

        processDataAndSetYears(transactionsWithUSD, data.categories);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project]);
  
  const handleUpdateProject = (data: UpdateProjectData) => {
    if (project) {
      updateProject(project.id, data);
      toast({
          title: "Proyecto Actualizado",
          description: "Los detalles del proyecto han sido guardados.",
      });
    }
    setIsEditingProject(false);
  }

  const handleAddCategory = (data: { name: string; budget: number }) => {
      if (project) {
        addCategoryToProject(project.id, data);
        toast({
          title: "Categoría Añadida",
          description: `La categoría "${data.name}" ha sido creada.`,
        });
      }
  };

  const handleUpdateCategory = (data: { name: string; budget: number }) => {
    if (project) {
      updateCategoryInProject(project.id, data.name, { budget: data.budget });
      toast({
          title: "Categoría actualizada",
          description: `La categoría "${data.name}" ha sido actualizada.`,
      });
    }
    setEditingCategory(null);
  }

  const handleDeleteCategoryRequest = (category: ProjectCategory) => {
    const isCategoryInUse = transactions.some(t => t.category === category.name && t.type === 'expense');
    if (isCategoryInUse) {
        toast({
            variant: "destructive",
            title: "No se puede eliminar la categoría",
            description: `La categoría "${category.name}" está siendo utilizada por una o más transacciones.`,
        });
    } else {
        setDeletingCategory(category);
    }
  };

  const confirmDeleteCategory = () => {
      if (project && deletingCategory) {
          deleteCategoryFromProject(project.id, deletingCategory.name);
          toast({
              title: "Categoría eliminada",
              description: `La categoría "${deletingCategory.name}" ha sido eliminada.`,
          })
      }
      setDeletingCategory(null);
  }


  const handleAddExpense = (data: any) => {
    const newTransaction: Transaction = {
        id: `TX-${Date.now()}`,
        date: format(data.date, 'yyyy-MM-dd'),
        description: data.description,
        category: data.categoryId,
        user: data.userId,
        paymentMethod: data.paymentMethod,
        amountARS: data.amountARS,
        exchangeRate: data.exchangeRate,
        amountUSD: data.amountARS / data.exchangeRate,
        type: 'expense',
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Gasto Registrado",
      description: "El nuevo gasto ha sido añadido al proyecto.",
    });
  };
  
  const handleUpdateExpense = (data: any) => {
    const updatedTransaction: Transaction = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        amountUSD: data.amountARS / data.exchangeRate,
        type: 'expense',
    };
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingExpense(null);
    toast({
        title: "Gasto actualizado",
        description: "El gasto ha sido modificado correctamente."
    })
  };

  const confirmDeleteExpense = () => {
    if (deletingExpense) {
        setTransactions(prev => prev.filter(t => t.id !== deletingExpense!.id));
        toast({
            title: "Gasto eliminado",
            description: "El gasto ha sido eliminado correctamente."
        })
    }
    setDeletingExpense(null);
  }

  const handleAddIncome = (data: any) => {
    const newTransaction: Transaction = {
        id: `TX-${Date.now()}`,
        date: format(data.date, 'yyyy-MM-dd'),
        description: data.description,
        category: 'Ingreso',
        user: 'N/A',
        paymentMethod: 'N/A',
        amountARS: data.amountARS,
        exchangeRate: data.exchangeRate,
        amountUSD: data.amountARS / data.exchangeRate,
        type: 'income',
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Ingreso Registrado",
      description: "El nuevo ingreso ha sido añadido al proyecto.",
    });
  };


  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    if (tab !== 'categories') {
      params.delete('category');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectCategory = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'categories');
    params.set('category', encodeURIComponent(categoryName));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeselectCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    router.push(`${pathname}?${params.toString()}`);
  };


  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const yearMatch = new Date(t.date).getFullYear() === transactionsYear;
      const userMatch = filters.user === 'Todos' || t.user === filters.user;
      const categoryMatch = filters.category === 'Todas' || t.category === filters.category;
      return yearMatch && userMatch && categoryMatch;
    });
  }, [transactions, filters, transactionsYear]);
  
  const monthlyGroupedTransactions = useMemo(() => {
    const grouped: Record<string, {
        transactions: Transaction[];
        userTotals: Record<string, number>;
        monthTotal: number;
    }> = {};

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const monthKey = format(new Date(t.date), 'yyyy-MM');
        if (!grouped[monthKey]) {
            grouped[monthKey] = { transactions: [], userTotals: {}, monthTotal: 0 };
        }
        grouped[monthKey].transactions.push(t);
        
        if (!grouped[monthKey].userTotals[t.user]) {
            grouped[monthKey].userTotals[t.user] = 0;
        }
        grouped[monthKey].userTotals[t.user] += t.amountUSD;
        grouped[monthKey].monthTotal += t.amountUSD;
    });

    Object.keys(grouped).forEach(month => {
        const sortedUserTotals = Object.entries(grouped[month].userTotals)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
        grouped[month].userTotals = sortedUserTotals;
    });

    return grouped;
}, [filteredTransactions]);


  const filteredCashflowTransactions = useMemo(() => {
    return transactions.filter(t => {
      const categoryMatch = cashflowCategoryFilter === 'Todas' || t.category === cashflowCategoryFilter;
      const dateMatch = !cashflowDateRange?.from || (new Date(t.date) >= cashflowDateRange.from && new Date(t.date) <= (cashflowDateRange.to || new Date()));
      return categoryMatch && dateMatch;
    });
  }, [transactions, cashflowCategoryFilter, cashflowDateRange]);

  const cashflowTotal = useMemo(() => {
    return filteredCashflowTransactions.reduce((total, t) => {
        const sign = t.type === 'income' ? 1 : -1;
        return total + t.amountUSD * sign;
    }, 0);
  }, [filteredCashflowTransactions]);


  const cashflowCategoryTotals = useMemo(() => {
    if (!filteredCashflowTransactions.length) return [];
    
    const totals = filteredCashflowTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amountUSD;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredCashflowTransactions]);

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
  
  const projectCategories = project.googleSheetId ? categories : project.categories;

  const totalSpent = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountUSD, 0), [transactions]);
  const totalBudget = useMemo(() => projectCategories.reduce((sum, cat) => sum + cat.budget, 0), [projectCategories]);
  const remainingBudget = totalBudget - totalSpent;
  const totalContribution = project.participants.reduce((sum, p) => sum + (p.contribution || 0), 0);

  const spendingByCategoryData = useMemo(() => projectCategories.map(cat => ({
    name: cat.name,
    value: transactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((acc, t) => acc + t.amountUSD, 0),
  })).filter(d => d.value > 0), [transactions, projectCategories]);
  
  const spendingConfig: ChartConfig = useMemo(() => ({
    ...spendingByCategoryData.reduce((acc, entry, index) => {
      acc[entry.name] = {
        label: entry.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig),
    value: {
      label: 'Monto',
    },
  }), [spendingByCategoryData]);
  
  const monthlyFlowData = useMemo(() => {
      const monthlyTotals: {[key: string]: { month: string, Gastos: number, Ingresos: number }} = {};
      const selectedYear = cashflowYear;
      
      transactions.forEach(t => {
          const transactionDate = new Date(t.date);
          if (transactionDate.getFullYear() === selectedYear) {
              const monthKey = format(transactionDate, 'yyyy-MM');
              const monthName = format(transactionDate, 'MMM', { locale: es });
              if (!monthlyTotals[monthKey]) {
                  monthlyTotals[monthKey] = { month: monthName, Gastos: 0, Ingresos: 0 };
              }
              if (t.type === 'expense') {
                  monthlyTotals[monthKey].Gastos += t.amountUSD;
              } else {
                  monthlyTotals[monthKey].Ingresos += t.amountUSD;
              }
          }
      });

      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      return months.map((monthName, index) => {
        const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
        return monthlyTotals[monthKey] || { month: monthName, Gastos: 0, Ingresos: 0 };
      });
  }, [transactions, cashflowYear]);
  
  const barChartConfig = {
    Gastos: { label: "Gastos", color: "hsl(var(--chart-2))" },
    Ingresos: { label: "Ingresos", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig

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
             {error}
           </AlertDescription>
         </Alert>
       )
    }
    
    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="cashflow">Resumen Financiero</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gasto Total (U$S)</CardTitle>
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold font-headline">${totalSpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Presupuesto Restante (U$S)</CardTitle>
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
                      <CardTitle className="text-sm font-medium">Fondos Totales (U$S)</CardTitle>
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
                  <CardTitle className="font-headline">Gastos por Categoría</CardTitle>
                  <CardDescription>Distribución de los gastos en U$S.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {spendingByCategoryData.length > 0 ? (
                    <div className="h-[250px] w-full">
                      <ChartContainer config={spendingConfig} className="h-full w-full">
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                          <Pie data={spendingByCategoryData} dataKey="value" nameKey="name" innerRadius={50}>
                            {spendingByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="flex h-[250px] w-full items-center justify-center rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">No hay datos de gastos para mostrar.</p>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-right">Monto Gastado (U$S)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spendingByCategoryData.length > 0 ? (
                          spendingByCategoryData.map((item, index) => (
                            <TableRow key={item.name}>
                              <TableCell>
                                <div className="flex items-center gap-2 font-medium">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                  />
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                              No hay gastos registrados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right font-mono">
                            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="font-headline">Participantes y Aportes</CardTitle>
                  <CardDescription>Inversión individual y participación en el proyecto.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Participante</TableHead>
                              <TableHead className="text-right">Aporte (U$S)</TableHead>
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
                                  <TableCell className="text-right font-mono">${(p.contribution || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                  <TableCell className="text-right font-mono">{p.share || 0}%</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
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

        <TabsContent value="cashflow" className="mt-6 grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline">Resumen de Flujo de Caja Anual ({cashflowYear})</CardTitle>
                    <CardDescription>Análisis de gastos e ingresos (U$S) del proyecto a lo largo del tiempo.</CardDescription>
                  </div>
                   <div className="grid gap-1.5 w-32">
                        <UiLabel htmlFor="cashflow-year">Año</UiLabel>
                        <Select value={String(cashflowYear)} onValueChange={(val) => setCashflowYear(Number(val))}>
                            <SelectTrigger id="cashflow-year">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {allYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
              </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                    <BarChart data={monthlyFlowData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="var(--color-Ingresos)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="var(--color-Gastos)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle className="font-headline">Movimientos del Proyecto</CardTitle>
                  <CardDescription>Historial de ingresos y gastos. Filtra para ver totales por categoría.</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <CreateIncomeDialog onAddIncome={handleAddIncome} />
                  <CreateExpenseDialog categories={projectCategories} participants={project.participants} onAddExpense={handleAddExpense} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid gap-1.5">
                  <UiLabel>Rango de Fechas</UiLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="cashflowDate"
                        variant={"outline"}
                        className={cn(
                        "w-[260px] justify-start text-left font-normal",
                        !cashflowDateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {cashflowDateRange?.from ? (
                        cashflowDateRange.to ? (
                            <>
                            {format(cashflowDateRange.from, "LLL dd, y", { locale: es })} -{" "}
                            {format(cashflowDateRange.to, "LLL dd, y", { locale: es })}
                            </>
                        ) : (
                            format(cashflowDateRange.from, "LLL dd, y", { locale: es })
                        )
                        ) : (
                        <span>Elige un rango</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={cashflowDateRange?.from}
                        selected={cashflowDateRange}
                        onSelect={setCashflowDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-1.5">
                  <UiLabel>Categoría</UiLabel>
                  <Select value={cashflowCategoryFilter} onValueChange={setCashflowCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por categoría" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Todas">Todas las categorías</SelectItem>
                          {projectCategories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cashflowCategoryTotals.length > 0 && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="mb-2 font-medium text-sm">Resumen de Gastos del Período (U$S)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cashflowCategoryTotals.map(cat => (
                      <div key={cat.name}>
                        <p className="text-xs text-muted-foreground">{cat.name}</p>
                        <p className="font-bold text-lg font-mono">
                          ${cat.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto (U$S)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCashflowTransactions.length > 0 ? (
                    filteredCashflowTransactions.map(t => (
                    <TableRow key={t.id}>
                       <TableCell>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</TableCell>
                       <TableCell className="font-medium">{t.description}</TableCell>
                       <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                       <TableCell className={cn(
                          "text-right font-medium font-mono",
                          t.type === 'income' ? 'text-emerald-600' : 'text-destructive'
                        )}>
                        {t.type === 'income' ? '+' : '-'}${t.amountUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                  ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No hay resultados.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                 <TableFooter>
                  <TableRow className="font-bold bg-muted/50 hover:bg-muted/80">
                    <TableCell colSpan={3} className="text-right">Neto del Período (U$S)</TableCell>
                    <TableCell className={cn(
                      "text-right font-mono",
                      cashflowTotal >= 0 ? 'text-emerald-600' : 'text-destructive'
                    )}>
                      {cashflowTotal >= 0 ? '+' : '-'}${Math.abs(cashflowTotal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle className="font-headline">Transacciones del Proyecto</CardTitle>
                    <CardDescription>
                      Historial detallado de gastos, agrupado por mes.
                    </CardDescription>
                  </div>
                  <CreateExpenseDialog categories={projectCategories} participants={project.participants} onAddExpense={handleAddExpense}/>
              </div>
              <div className="flex items-center gap-4">
                  <div className="grid gap-1.5">
                    <UiLabel>Año</UiLabel>
                     <Select value={String(transactionsYear)} onValueChange={(val) => setTransactionsYear(Number(val))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent>
                            {allYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <UiLabel>Usuario</UiLabel>
                    <Select value={filters.user} onValueChange={(value) => setFilters(prev => ({ ...prev, user: value }))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Todos">Todos los usuarios</SelectItem>
                            {project.participants.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <UiLabel>Categoría</UiLabel>
                     <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Todas">Todas las categorías</SelectItem>
                            {projectCategories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
             {(() => {
                const sortedMonths = Object.keys(monthlyGroupedTransactions).sort((a,b) => b.localeCompare(a));
                if (sortedMonths.length === 0) {
                    return (
                        <div className="h-48 flex items-center justify-center text-center text-muted-foreground">
                            <p>No hay transacciones de gastos que coincidan con los filtros seleccionados.</p>
                        </div>
                    );
                }
                return (
                    <Accordion type="single" collapsible className="w-full" defaultValue={sortedMonths[0]}>
                        {sortedMonths.map((monthKey) => {
                            const data = monthlyGroupedTransactions[monthKey];
                            const [year, month] = monthKey.split('-').map(Number);
                            const monthDate = new Date(year, month - 1);
                            const monthYearDisplay = format(monthDate, 'MMMM yyyy', { locale: es });

                            return (
                                <AccordionItem value={monthKey} key={monthKey}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4 items-center">
                                            <span className="font-headline text-lg capitalize">{monthYearDisplay}</span>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Gasto Total del Mes</p>
                                                <p className="font-bold text-lg font-mono text-destructive">
                                                    -${data.monthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <h4 className="font-semibold mb-2 text-sm">Gastos por Usuario (U$S)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(data.userTotals).map(([user, total]) => (
                                                    <div key={user}>
                                                        <p className="text-xs text-muted-foreground">{user}</p>
                                                        <p className="font-bold font-mono text-base">
                                                            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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
                                                <TableHead className="text-right">Acciones</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.transactions.map(t => (
                                                  <TableRow key={t.id}>
                                                    <TableCell>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</TableCell>
                                                    <TableCell className="font-medium">{t.description}</TableCell>
                                                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                                                    <TableCell>{t.user}</TableCell>
                                                    <TableCell><Badge variant="secondary">{t.paymentMethod}</Badge></TableCell>
                                                    <TableCell className="text-right font-mono">
                                                      -${t.amountARS.toLocaleString('es-AR')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-muted-foreground text-sm">
                                                      {t.exchangeRate.toLocaleString('es-AR')}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium font-mono">
                                                      -${t.amountUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onSelect={() => setEditingExpense(t)}>
                                                                  <Edit className="mr-2 h-4 w-4" />
                                                                  Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => setDeletingExpense(t)} className="text-destructive">
                                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                                  Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                );
             })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {!selectedCategory ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-headline">Categorías de Gastos</CardTitle>
                    <CardDescription>Gestiona y visualiza los gastos por categoría.</CardDescription>
                  </div>
                  <CreateCategoryDialog onAddCategory={handleAddCategory} />
                </CardHeader>
              </Card>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projectCategories.map((category) => {
                  const categorySpent = transactions
                    .filter((t) => t.category === category.name && t.type === 'expense')
                    .reduce((sum, t) => sum + t.amountUSD, 0)
                  const progress = category.budget > 0 ? (categorySpent / category.budget) * 100 : 0
                  return (
                    <Card key={category.name}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="truncate pr-2">{category.name}</span>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleSelectCategory(category.name)}>
                                  Ver Detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setEditingCategory(category)}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteCategoryRequest(category)} className="text-destructive">
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-2">
                        <div className="text-3xl font-bold">${categorySpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">de ${category.budget.toLocaleString()} presupuestados</p>
                        <Progress value={progress} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            (() => {
              const category = projectCategories.find((c) => c.name === selectedCategory)
              if (!category) return null

              const categoryTransactions = transactions.filter(
                (t) => t.category === selectedCategory && t.type === 'expense'
              );
              const categorySpent = categoryTransactions.reduce((sum, t) => sum + t.amountUSD, 0);
              const categoryTotals = categoryTransactions.reduce((acc, t) => {
                  acc.ars += t.amountARS;
                  acc.usd += t.amountUSD;
                  return acc;
              }, {ars: 0, usd: 0});
              
              const otherSpent = totalSpent - categorySpent;
              const percentageOfTotal = totalSpent > 0 ? (categorySpent / totalSpent) * 100 : 0;
              
              const categoryVsTotalData = [
                  { name: category.name, value: categorySpent, fill: 'hsl(var(--chart-1))' },
                  { name: 'Otros Gastos', value: otherSpent, fill: 'hsl(var(--muted))' }
              ].filter(d => d.value > 0);
          
              const categoryVsTotalChartConfig: ChartConfig = {
                  value: { label: "Monto" },
                  [category.name]: { label: category.name, color: "hsl(var(--chart-1))" },
                  "Otros Gastos": { label: "Otros Gastos", color: "hsl(var(--muted))" }
              };

              return (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col items-start">
                          <Button variant="ghost" size="sm" className="mb-2 -ml-3" onClick={handleDeselectCategory}>
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Volver a Categorías
                          </Button>
                          <CardTitle className="font-headline text-3xl">{category.name}</CardTitle>
                          <CardDescription>Análisis detallado de los gastos en esta categoría.</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-3">
                      <Card className="lg:col-span-1">
                          <CardHeader>
                              <CardTitle>Gasto vs. Total del Proyecto</CardTitle>
                          </CardHeader>
                           <CardContent className="grid gap-4 place-content-center text-center">
                              {categoryVsTotalData.length > 0 ? (
                                  <div className="h-[200px] w-full">
                                    <ChartContainer
                                        config={categoryVsTotalChartConfig}
                                        className="h-full w-full"
                                    >
                                      <PieChart>
                                          <ChartTooltip
                                              cursor={false}
                                              content={<ChartTooltipContent hideLabel />}
                                          />
                                          <Pie
                                              data={categoryVsTotalData}
                                              dataKey="value"
                                              nameKey="name"
                                              innerRadius={60}
                                              strokeWidth={2}
                                          >
                                              <Label
                                                  content={({ viewBox }) => {
                                                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                          return (
                                                              <text
                                                                  x={viewBox.cx}
                                                                  y={viewBox.cy}
                                                                  textAnchor="middle"
                                                                  dominantBaseline="middle"
                                                              >
                                                                  <tspan
                                                                      x={viewBox.cx}
                                                                      y={viewBox.cy}
                                                                      className="fill-foreground text-3xl font-bold"
                                                                  >
                                                                      {percentageOfTotal.toFixed(0)}%
                                                                  </tspan>
                                                              </text>
                                                          )
                                                      }
                                                  }}
                                              />
                                              {categoryVsTotalData.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                              ))}
                                          </Pie>
                                      </PieChart>
                                    </ChartContainer>
                                  </div>
                              ) : (
                                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-muted/50 mx-auto">
                                      <p className="text-sm text-muted-foreground">Sin gastos.</p>
                                  </div>
                              )}
                              <div>
                                <p className="text-2xl font-bold">${categorySpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                <p className="text-sm text-muted-foreground">de un total de ${totalSpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                              </div>
                          </CardContent>
                      </Card>
                      <Card className="lg:col-span-2">
                          <CardHeader>
                              <CardTitle>Movimientos en {category.name}</CardTitle>
                              <CardDescription>Todos los gastos registrados para esta categoría.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Fecha</TableHead>
                                          <TableHead>Descripción</TableHead>
                                          <TableHead className="text-right">Monto (AR$)</TableHead>
                                          <TableHead className="text-right">Cambio</TableHead>
                                          <TableHead className="text-right">Monto (U$S)</TableHead>
                                          <TableHead className="text-right">Acciones</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {categoryTransactions.length > 0 ? (
                                        categoryTransactions.map(t => (
                                          <TableRow key={t.id}>
                                              <TableCell>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</TableCell>
                                              <TableCell className="font-medium">{t.description}</TableCell>
                                              <TableCell className="text-right font-mono text-destructive">
                                                  -${t.amountARS.toLocaleString('es-AR')}
                                              </TableCell>
                                              <TableCell className="text-right font-mono text-muted-foreground text-sm">
                                                  {t.exchangeRate.toLocaleString('es-AR')}
                                              </TableCell>
                                              <TableCell className="text-right font-mono text-destructive">
                                                  -${t.amountUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                                              <MoreVertical className="h-4 w-4" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                          <DropdownMenuItem onSelect={() => setEditingExpense(t)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem onSelect={() => setDeletingExpense(t)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                          </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                              </TableCell>
                                          </TableRow>
                                      ))
                                      ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No hay gastos en esta categoría.
                                            </TableCell>
                                        </TableRow>
                                      )}
                                  </TableBody>
                                  <TableFooter>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell colSpan={2} className="text-right">Total Gastado</TableCell>
                                        <TableCell className="text-right font-mono text-destructive">
                                            -${categoryTotals.ars.toLocaleString('es-AR')}
                                        </TableCell>
                                        <TableCell className="text-right" />
                                        <TableCell className="text-right font-mono text-destructive">
                                            -${categoryTotals.usd.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                  </TableFooter>
                              </Table>
                          </CardContent>
                      </Card>
                  </div>
                </div>
              )
            })()
          )}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsEditingProject(true)}>
                <Edit className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-base transition-colors hover:bg-muted">
                    <Badge 
                      className={
                        "pointer-events-none text-base " + 
                        (project.status === 'En Curso' ? 'bg-blue-500/20 text-blue-700' : 
                         project.status === 'Próximo' ? 'bg-amber-500/20 text-amber-700' : '')
                      } 
                      variant={project.status === 'Completado' ? 'secondary' : 'default'}
                    >
                      {project.status}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => updateProjectStatus(project.id, 'Próximo')}>
                  Próximo
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => updateProjectStatus(project.id, 'En Curso')}>
                  En Curso
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => updateProjectStatus(project.id, 'Completado')}>
                  Completado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
      {renderContent()}

      <EditProjectDialog
        isOpen={isEditingProject}
        onOpenChange={setIsEditingProject}
        project={project}
        onUpdateProject={handleUpdateProject}
      />

      <EditCategoryDialog
        isOpen={!!editingCategory}
        onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}
        category={editingCategory}
        onUpdateCategory={handleUpdateCategory}
      />
      
      <AlertDialog open={!!deletingCategory} onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "{deletingCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditExpenseDialog
        isOpen={!!editingExpense}
        onOpenChange={(isOpen) => !isOpen && setEditingExpense(null)}
        expense={editingExpense}
        onUpdateExpense={handleUpdateExpense}
        categories={projectCategories}
        participants={project.participants}
      />

       <AlertDialog open={!!deletingExpense} onOpenChange={(isOpen) => !isOpen && setDeletingExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el gasto: "{deletingExpense?.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExpense} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
