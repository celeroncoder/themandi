"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, BookOpen, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { currencyFormatter } from "@/lib/utils";

type ChartData = {
  month: string;
  revenue: number;
  books: number;
  users: number;
};

export function RevenueChart() {
  const [period, setPeriod] = useState<"6months" | "12months">("6months");

  // Fetch data using tRPC
  const {
    data: chartData = [],
    isLoading,
    error,
  } = api.analytics.getPeriodicStats.useQuery({ period });

  if (isLoading) {
    return (
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <Skeleton className="mt-2 h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:justify-between">
          <div className="flex w-full flex-col gap-1">
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex w-full justify-end gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (error) return <div>Error: {error.message}</div>;

  const totalRevenue = chartData.reduce((sum, data) => sum + data.revenue, 0);
  const totalBooks = chartData.reduce((sum, data) => sum + data.books, 0);
  const totalUsers = chartData.reduce((sum, data) => sum + data.users, 0);
  const lastMonthRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousMonthRevenue = chartData[chartData.length - 2]?.revenue || 0;
  const revenueChange = previousMonthRevenue
    ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0;

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <Card className="w-full min-w-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Revenue</CardTitle>
          <Select
            value={period}
            onValueChange={(value: "6months" | "12months") => setPeriod(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>Revenue from book purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickFormatter={(value) => `${currencyFormatter.format(value)}`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]?.payload as ChartData;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Month
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {data.month}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold">
                              {currencyFormatter.format(data.revenue)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Books Sold
                            </span>
                            <span className="font-bold">{data.books}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              New Users
                            </span>
                            <span className="font-bold">{data.users}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="revenue"
                  position="top"
                  formatter={(value: number) => currencyFormatter.format(value)}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            {revenueChange >= 0 ? (
              <>
                Trending up by {revenueChange.toFixed(1)}% this month
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Trending down by {Math.abs(revenueChange).toFixed(1)}% this
                month
                <TrendingDown className="h-4 w-4 text-red-500" />
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Total revenue: {currencyFormatter.format(totalRevenue)}
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {totalBooks} books sold
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalUsers} new users
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
