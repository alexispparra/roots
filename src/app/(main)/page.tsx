"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Wallet, TrendingUp, TrendingDown, PiggyBank, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: "January", income: 2500, expenses: 1800 },
  { month: "February", income: 2800, expenses: 2000 },
  { month: "March", income: 3200, expenses: 2400 },
  { month: "April", income: 2900, expenses: 2100 },
  { month: "May", income: 3500, expenses: 2600 },
  { month: "June", income: 3100, expenses: 2300 },
];

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const recentTransactions = [
    { id: 'TRN-001', description: 'Groceries at Market', category: 'Food', type: 'expense', amount: 75.60 },
    { id: 'TRN-002', description: 'Monthly Salary', category: 'Income', type: 'income', amount: 2500.00 },
    { id: 'TRN-003', description: 'Gasoline', category: 'Transport', type: 'expense', amount: 45.30 },
    { id: 'TRN-004', description: 'Internet Bill', category: 'Bills', type: 'expense', amount: 60.00 },
    { id: 'TRN-005', description: 'New Shoes', category: 'Shopping', type: 'expense', amount: 120.00 },
]

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">$12,450.00</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income this Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-emerald-600">+$3,100.00</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses this Month</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-destructive">-$2,300.00</div>
            <p className="text-xs text-muted-foreground">
              +10.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">$800.00</div>
            <p className="text-xs text-muted-foreground">
              Saved this month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Income vs. Expenses</CardTitle>
             <CardDescription>An overview of your cash flow for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="income" fill="var(--color-income)" radius={8} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quick Actions</CardTitle>
                <CardDescription>
                    Easily add new transactions.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button size="lg">
                  <PlusCircle className="mr-2" /> Add Expense
                </Button>
                <Button size="lg" variant="secondary">
                  <PlusCircle className="mr-2" /> Add Income
                </Button>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <CardDescription>
              A summary of your latest financial activities.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/transactions">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map(trx => (
              <TableRow key={trx.id}>
                <TableCell className="font-medium">{trx.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{trx.category}</Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${trx.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                  {trx.type === 'income' ? '+' : '-'}${trx.amount.toFixed(2)}
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
