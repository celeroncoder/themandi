"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, Loader } from "lucide-react";
import { api } from "@/trpc/react";
import { Header } from "./_component/header";

// You'll need to create this component separately
import { ProductCard } from "./_component/product-card";

export default function Home() {
  const { data: tags, isLoading: isLoadingTags } = api.tag.getAll.useQuery();
  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();
  const { data: farmers, isLoading: isLoadingFarmers } =
    api.farmer.getAll.useQuery();

  const [filters, setFilters] = useState({
    title: "",
    farmer: "",
    tag: "",
    category: "",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = api.product.getProducts.useInfiniteQuery(
    {
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isError) {
    return (
      <div className="mt-8 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-[#FAF7F1] to-[#F7EED9]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search by title"
            value={filters.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
            className="bg-white"
          />

          {isLoadingFarmers ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={filters.farmer}
              onValueChange={(value) => handleFilterChange("farmer", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a farmer" />
              </SelectTrigger>
              <SelectContent>
                {farmers?.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isLoadingTags ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={filters.tag}
              onValueChange={(value) => handleFilterChange("tag", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {tags?.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isLoadingCategories ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-60 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : data?.pages.map((page) =>
                page.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                )),
              )}
        </div>

        {isFetching && !isFetchingNextPage && (
          <div className="mt-8 flex justify-center">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}

        {hasNextPage && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => fetchNextPage()}
              variant="outline"
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader className="mr-2 inline h-4 w-4 animate-spin" />{" "}
                  Loading more...
                </>
              ) : (
                <>
                  <ArrowDown className="mr-2 inline h-4 w-4 animate-bounce" />{" "}
                  Load More
                </>
              )}
            </Button>
          </div>
        )}

        {(!hasNextPage && data?.pages[0]?.products.length) ||
          (0 > 0 && (
            <div className="mt-8 text-center text-gray-600">
              You've reached the end of the list.
            </div>
          ))}

        {data?.pages[0]?.products.length === 0 && (
          <div className="mt-8 text-center text-gray-600">
            No products found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}
