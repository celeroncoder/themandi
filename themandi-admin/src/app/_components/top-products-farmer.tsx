"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { currencyFormatter } from "@/lib/utils";

function TopProductsSkeletonLoader() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex-1">
                <Skeleton className={`h-8 w-${Math.random() * 50 + 50}%`} />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </CardFooter>
    </Card>
  );
}

function TopFarmersSkeletonLoader() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="grid gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between space-x-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TopProductsAndFarmers() {
  const { data, isLoading } = api.analytics.getTopProducts.useQuery();

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6 px-10 py-4 md:flex-row">
        <TopProductsSkeletonLoader />
        <TopFarmersSkeletonLoader />
      </section>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const totalSales = data.reduce((acc, product) => acc + product.totalSales, 0);
  const averageSales = totalSales / data.length;
  const topProductSales = data[0]?.totalSales || 0;
  const percentageChange = (
    ((topProductSales - averageSales) / averageSales) *
    100
  ).toFixed(1);

  return (
    <section className="flex flex-col gap-6 px-10 py-4 md:flex-row">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Products by Number of Sales</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="title"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis type="number" hide />
              <Bar dataKey="totalSales" fill="hsl(var(--chart-5))" radius={4}>
                <LabelList
                  dataKey="title"
                  position="insideLeft"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                />
                <LabelList
                  dataKey="totalSales"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => `${value} sales`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Top product outperforming by {percentageChange}%{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing top 5 products by total sales
          </div>
        </CardFooter>
      </Card>

      <Card className="max-h-fit w-full max-w-lg">
        <CardHeader>
          <CardTitle>Top Farmers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {data.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {product.farmers.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">{product.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-green-500">
                  {product.totalSales} sales
                </p>
                <p className="text-sm font-semibold">
                  {currencyFormatter.format(product.revenue)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
