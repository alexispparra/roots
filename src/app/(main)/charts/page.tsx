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
  { category: "Food & Drink", amount: 850, fill: "var(--color-food)" },
  { category: "Shopping", amount: 600, fill: "var(--color-shopping)" },
  { category: "Transport", amount: 350, fill: "var(--color-transport)" },
  { category: "Housing", amount: 1200, fill: "var(--color-housing)" },
  { category: "Other", amount: 400, fill: "var(--color-other)" },
]

const spendingConfig = {
  amount: {
    label: "Amount",
  },
  food: { label: "Food & Drink", color: "hsl(var(--chart-1))" },
  shopping: { label: "Shopping", color: "hsl(var(--chart-2))" },
  transport: { label: "Transport", color: "hsl(var(--chart-3))" },
  housing: { label: "Housing", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const cashflowData = [
  { month: "Jan", income: 2500, expenses: 1800 },
  { month: "Feb", income: 2800, expenses: 2000 },
  { month: "Mar", income: 3200, expenses: 2400 },
  { month: "Apr", income: 2900, expenses: 2100 },
  { month: "May", income: 3500, expenses: 2600 },
  { month: "Jun", income: 3100, expenses: 2300 },
];

const cashflowConfig = {
  income: { label: "Income", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
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
    label: "Net Worth",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
    const [activeIndex, setActiveIndex] = React.useState(0)
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Financial Reports</CardTitle>
          <CardDescription>
            Visualization of your key financial indicators.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Spending by Category</CardTitle>
            <CardDescription>Distribution of your expenses for the current month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={spendingConfig} className="mx-auto aspect-square max-h-[300px]">
               <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
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
                  content={<ChartLegendContent nameKey="category" />}
                  className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Income vs. Expenses</CardTitle>
            <CardDescription>Comparison of income vs. spending per month.</CardDescription>
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
          <CardTitle className="font-headline">Net Worth Trend</CardTitle>
          <CardDescription>Monthly trend of your total net worth.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={netWorthConfig} className="h-[300px] w-full">
                <LineChart
                    data={netWorthData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}/>
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
