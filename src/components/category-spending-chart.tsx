
"use client"

import { Pie, PieChart, Tooltip, Cell, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer
} from "@/components/ui/chart"

type CategorySpendingChartProps = {
  categorySpent: number;
  totalProjectExpenses: number;
  categoryName: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))"];

export function CategorySpendingChart({ categorySpent, totalProjectExpenses, categoryName }: CategorySpendingChartProps) {
  const otherExpenses = Math.max(0, totalProjectExpenses - categorySpent);
  
  const chartData = [
    { name: categoryName, value: categorySpent },
    { name: "Otros Gastos", value: otherExpenses },
  ];

  // A single wedge means one category makes up 100% of the expenses shown in the chart.
  const isSingleWedge = chartData.filter(d => d.value > 0).length === 1;

  const chartConfig = {
    [categoryName]: {
      label: categoryName,
      color: "hsl(var(--chart-1))",
    },
    "Otros Gastos": {
      label: "Otros Gastos",
      color: "hsl(var(--chart-2))",
    },
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  const categorySpentFormatted = formatCurrency(categorySpent);
  const totalProjectExpensesFormatted = formatCurrency(totalProjectExpenses);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Proporción de Gasto (U$S)</CardTitle>
        <CardDescription>"{categoryName}" vs. Gasto Total del Proyecto</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalProjectExpenses > 0 ? (
           <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  labelLine={false}
                  // Disable default label for the 100% case to manually render it, otherwise use standard logic.
                  label={isSingleWedge ? false : ({ percent }) => {
                    if (!percent || percent === 0) {
                      return null;
                    }
                    const roundedPercent = Math.round(percent * 100);
                    return `${roundedPercent}%`;
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                 {/* Manually render the "100%" label in the center for the single-wedge case */}
                {isSingleWedge && (
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="hsl(var(--card-foreground))" className="text-base font-bold">
                        100%
                    </text>
                )}
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No hay gastos para mostrar.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
         <div className="leading-none text-muted-foreground">
          Gasto en categoría: <span className="font-medium text-foreground">{categorySpentFormatted}</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Gasto total del proyecto: <span className="font-medium text-foreground">{totalProjectExpensesFormatted}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
