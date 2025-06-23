"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Sector, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import React from "react"

const spendingData = [
  { key: "food", category: "Comida y Bebida", amount: 850, fill: "var(--color-food)" },
  { key: "shopping", category: "Compras", amount: 600, fill: "var(--color-shopping)" },
  { key: "transport", category: "Transporte", amount: 350, fill: "var(--color-transport)" },
  { key: "housing", category: "Vivienda", amount: 1200, fill: "var(--color-housing)" },
  { key: "other", category: "Otros", amount: 400, fill: "var(--color-other)" },
]

const spendingConfig = {
  amount: {
    label: "Monto",
  },
  food: { label: "Comida y Bebida", color: "hsl(var(--chart-1))" },
  shopping: { label: "Compras", color: "hsl(var(--chart-2))" },
  transport: { label: "Transporte", color: "hsl(var(--chart-3))" },
  housing: { label: "Vivienda", color: "hsl(var(--chart-4))" },
  other: { label: "Otros", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const cashflowData = [
  { month: "Ene", income: 2500, expenses: 1800 },
  { month: "Feb", income: 2800, expenses: 2000 },
  { month: "Mar", income: 3200, expenses: 2400 },
  { month: "Abr", income: 2900, expenses: 2100 },
  { month: "May", income: 3500, expenses: 2600 },
  { month: "Jun", income: 3100, expenses: 2300 },
];

const cashflowConfig = {
  income: { label: "Ingresos", color: "hsl(var(--chart-1))" },
  expenses: { label: "Gastos", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const netWorthData = [
  { date: "2024-01-01", value: 10500 },
  { date: "2024-02-01", value: 11200 },
  { date: "2024-03-01", value: 12000 },
  { date: "2024-04-01", value: 12800 },
  { date: "2024-05-01", value: 13700 },
  { date: "2024-06-01", value: 14500 },
];

const netWorthConfig = {
  value: {
    label: "Patrimonio Neto",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
    const [activeIndex, setActiveIndex] = React.useState(0)
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Reportes Financieros</CardTitle>
          <CardDescription>
            Visualización de tus indicadores financieros clave.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Gastos por Categoría</CardTitle>
            <CardDescription>Distribución de tus gastos del mes actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={spendingConfig} className="mx-auto aspect-square max-h-[300px]">
               <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="category" />}
                />
                <Pie
                  data={spendingData}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  activeShape={({ outerRadius = 0, ...props }) => (
                     <Sector {...props} outerRadius={outerRadius + 10} />
                  )}
                  onMouseOver={(_, index) => setActiveIndex(index)}
                />
                 <ChartLegend
                  content={<ChartLegendContent nameKey="key" />}
                  className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ingresos vs. Gastos</CardTitle>
            <CardDescription>Comparación de ingresos vs. gastos por mes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cashflowConfig} className="h-[300px] w-full">
              <BarChart data={cashflowData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Tendencia del Patrimonio Neto</CardTitle>
          <CardDescription>Tendencia mensual de tu patrimonio neto total.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={netWorthConfig} className="h-[300px] w-full">
                <LineChart
                    data={netWorthData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { month: 'short' })}/>
                    <YAxis unit="$" tickFormatter={(value) => (value / 1000) + 'k'}/>
                    <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                    <ChartLegend />
                    <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
