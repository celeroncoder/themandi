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

function TopBooksSkeletonLoader() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Skeleton bars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" /> {/* Book title */}
              <div className="flex-1">
                <Skeleton className={`h-8 w-${Math.random() * 50 + 50}%`} />{" "}
                {/* Bar */}
              </div>
              <Skeleton className="h-4 w-16" /> {/* Sales number */}
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

function TrendingAuthorsSkeletonLoader() {
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

export function TopBooksAndAuthors() {
  const { data, isLoading } = api.analytics.getTopBooksAndAuthors.useQuery();

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6 px-10 py-4 md:flex-row">
        <TopBooksSkeletonLoader />
        <TrendingAuthorsSkeletonLoader />
      </section>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const totalBookSales = data.topBooks.reduce(
    (acc, book) => acc + book.sales,
    0,
  );
  const averageBookSales = totalBookSales / data.topBooks.length;
  const topBookSales = data.topBooks[0]?.sales || 0;
  const percentageChange = (
    ((topBookSales - averageBookSales) / averageBookSales) *
    100
  ).toFixed(1);

  return (
    <section className="flex flex-col gap-6 px-10 py-4 md:flex-row">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Top Books</CardTitle>
          <CardDescription>Books by Number of Sales</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={data.topBooks}
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
              <Bar dataKey="sales" fill="hsl(var(--chart-5))" radius={4}>
                <LabelList
                  dataKey="title"
                  position="insideLeft"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                />
                <LabelList
                  dataKey="sales"
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
            Top book outperforming by {percentageChange}%{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing top 5 books by total sales
          </div>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Trending Authors</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {data.trendingAuthors.map((author, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {author.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total book sales
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-sm font-semibold text-green-500">
                  +{author.sales} sales
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
