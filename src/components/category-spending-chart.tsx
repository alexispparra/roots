"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type CategorySpendingChartProps = {
  spent: number;
  budget: number;
  categoryName: string;
}

export function CategorySpendingChart({ spent, budget, categoryName }: CategorySpendingChartProps) {
  const remaining = Math.max(0, budget - spent);
  const chartData = [
    { name: "Gastado", value: spent, fill: "hsl(var(--destructive))" },
    { name: "Restante", value: remaining, fill: "hsl(var(--secondary))" },
  ]
  const chartConfig = {
    spent: {
      label: "Gastado",
    },
    remaining: {
      label: "Restante",
    },
  }

  const totalSpentFormatted = spent.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  const budgetFormatted = budget.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Gasto vs. Presupuesto</CardTitle>
        <CardDescription>Categoría: {categoryName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {spent > budget ? "Presupuesto excedido" : "Dentro del presupuesto"}
        </div>
        <div className="leading-none text-muted-foreground">
          Has gastado {totalSpentFormatted} de {budgetFormatted}
        </div>
      </CardFooter>
    </Card>
  )
}
