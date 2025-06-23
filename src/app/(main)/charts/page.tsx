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

const projectStatusData = [
  { status: "Completed", value: 45, fill: "var(--color-completed)" },
  { status: "In Progress", value: 30, fill: "var(--color-inProgress)" },
  { status: "Overdue", value: 10, fill: "var(--color-overdue)" },
  { status: "Not Started", value: 15, fill: "var(--color-notStarted)" },
]

const projectStatusConfig = {
  value: {
    label: "Projects",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  overdue: {
    label: "Overdue",
    color: "hsl(var(--destructive))",
  },
  notStarted: {
    label: "Not Started",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const financialsChartData = [
  { month: "Jan", budget: 50000, actual: 45000 },
  { month: "Feb", budget: 55000, actual: 52000 },
  { month: "Mar", budget: 60000, actual: 65000 },
  { month: "Apr", budget: 58000, actual: 54000 },
  { month: "May", budget: 62000, actual: 59000 },
  { month: "Jun", budget: 65000, actual: 68000 },
];

const financialsConfig = {
  budget: {
    label: "Budget",
    color: "hsl(var(--chart-5))",
  },
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const taskCompletionData = [
  { date: "2024-01-01", rate: 65 },
  { date: "2024-02-01", rate: 70 },
  { date: "2024-03-01", rate: 72 },
  { date: "2024-04-01", rate: 78 },
  { date: "2024-05-01", rate: 85 },
  { date: "2024-06-01", rate: 92 },
];

const taskCompletionConfig = {
  rate: {
    label: "Completion Rate",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function ChartsPage() {
    const [activeIndex, setActiveIndex] = React.useState(0)

    const activeSegment = projectStatusData[activeIndex]
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Dynamic Charts</CardTitle>
          <CardDescription>
            Visualization of key project indicators.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Project Status</CardTitle>
            <CardDescription>Distribution of projects by their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={projectStatusConfig} className="mx-auto aspect-square max-h-[300px]">
               <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={projectStatusData}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  activeShape={({ outerRadius = 0, ...props }) => (
                     <Sector {...props} outerRadius={outerRadius + 10} />
                  )}
                  onMouseOver={(_, index) => setActiveIndex(index)}
                />
                 <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Budget vs. Actuals</CardTitle>
            <CardDescription>Comparison of budgeted vs. actual spending per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={financialsConfig} className="h-[300px] w-full">
              <BarChart data={financialsChartData}>
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
                <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
                <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Task Completion Rate</CardTitle>
          <CardDescription>Monthly trend of task completion percentage.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={taskCompletionConfig} className="h-[300px] w-full">
                <LineChart
                    data={taskCompletionData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}/>
                    <YAxis domain={[60, 100]} unit="%"/>
                    <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                    <ChartLegend />
                    <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
