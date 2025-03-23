"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
import { ArrowDown, Loader, X, Filter, Search } from "lucide-react";
import { api } from "@/trpc/react";
import { Header } from "./_component/header";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import lodash from "lodash";
import { useSearchParams, useRouter } from "next/navigation";

// You'll need to create this component separately
import { ProductCard } from "./_component/product-card";

function HomeContent() {
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const initialFilters = {
    title: searchParams.get("title") || "",
    farmer: searchParams.get("farmer") || "",
    tag: searchParams.get("tag") || "",
    category: searchParams.get("category") || "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Queries with dependencies on filters
  const { data: tags, isLoading: isLoadingTags } = api.tag.getAll.useQuery();
  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery();
  const { data: farmers, isLoading: isLoadingFarmers } =
    api.farmer.getAll.useQuery();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = api.product.getProducts.useInfiniteQuery(
    {
      limit: 12,
      title: filters.title,
      farmerId: filters.farmer || undefined,
      tagId: filters.tag || undefined,
      categoryId: filters.category || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // Adding refetchOnWindowFocus to avoid stale data
      refetchOnWindowFocus: false,
    },
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.title) params.set("title", filters.title);
    if (filters.farmer) params.set("farmer", filters.farmer);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.category) params.set("category", filters.category);

    const url = params.toString() ? `?${params.toString()}` : "";
    window.history.pushState({}, "", url);
  }, [filters]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const debouncedRefetch = useRef(
    lodash.debounce(() => {
      void refetch();
    }, 300),
  ).current;

  // Apply filters with debounce
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    debouncedRefetch();
  };

  const clearFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    debouncedRefetch();
  };

  const clearAllFilters = () => {
    setFilters({ title: "", farmer: "", tag: "", category: "" });
    debouncedRefetch();
  };

  const getActiveBadges = () => {
    const activeBadges = [];

    if (filters.title) {
      activeBadges.push(
        <Badge
          key="title"
          variant="outline"
          className="flex items-center gap-1 bg-white/90 px-3 py-2"
        >
          <span className="font-semibold">Search:</span> {filters.title}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => clearFilter("title")}
          />
        </Badge>,
      );
    }

    if (filters.farmer && farmers) {
      const farmerName =
        farmers.find((f) => f.id === filters.farmer)?.name || filters.farmer;
      activeBadges.push(
        <Badge
          key="farmer"
          variant="outline"
          className="flex items-center gap-1 bg-white/90 px-3 py-2"
        >
          <span className="font-semibold">Farmer:</span> {farmerName}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => clearFilter("farmer")}
          />
        </Badge>,
      );
    }

    if (filters.tag && tags) {
      const tagName =
        tags.find((t) => t.id === filters.tag)?.name || filters.tag;
      activeBadges.push(
        <Badge
          key="tag"
          variant="outline"
          className="flex items-center gap-1 bg-white/90 px-3 py-2"
        >
          <span className="font-semibold">Tag:</span> {tagName}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => clearFilter("tag")}
          />
        </Badge>,
      );
    }

    if (filters.category && categories) {
      const categoryName =
        categories.find((c) => c.id === filters.category)?.name ||
        filters.category;
      activeBadges.push(
        <Badge
          key="category"
          variant="outline"
          className="flex items-center gap-1 bg-white/90 px-3 py-2"
        >
          <span className="font-semibold">Category:</span> {categoryName}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => clearFilter("category")}
          />
        </Badge>,
      );
    }

    return activeBadges;
  };

  const activeBadges = getActiveBadges();

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-lg bg-red-50 p-8 text-center shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-red-700">
            Something went wrong
          </h2>
          <p className="text-red-600">{error.message}</p>
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => void refetch()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-[#FAF7F1] to-[#F7EED9]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mb-8">
          {/* Mobile filter button */}
          <div className="mb-4 flex items-center gap-2 sm:hidden">
            <Button
              variant="outline"
              className="w-full gap-2 border-gray-300 bg-white"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeBadges.length > 0 && (
                <Badge className="ml-1 bg-green-600">
                  {activeBadges.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Desktop filters */}
          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by title"
                value={filters.title}
                onChange={(e) => handleFilterChange("title", e.target.value)}
                className="bg-white pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
              {filters.title && (
                <button
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500"
                  onClick={() => clearFilter("title")}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {isLoadingFarmers ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.farmer}
                onValueChange={(value) => handleFilterChange("farmer", value)}
              >
                <SelectTrigger className="bg-white transition-all duration-200 focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Select a farmer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All farmers</SelectItem>
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
                <SelectTrigger className="bg-white transition-all duration-200 focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
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
                <SelectTrigger className="bg-white transition-all duration-200 focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Mobile filters dropdown */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                ref={filterRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:hidden"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search by title"
                      value={filters.title}
                      onChange={(e) =>
                        handleFilterChange("title", e.target.value)
                      }
                      className="bg-white pl-10"
                    />
                  </div>

                  {isLoadingFarmers ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={filters.farmer}
                      onValueChange={(value) =>
                        handleFilterChange("farmer", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select a farmer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All farmers</SelectItem>
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
                      onValueChange={(value) =>
                        handleFilterChange("tag", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tags</SelectItem>
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
                      onValueChange={(value) =>
                        handleFilterChange("category", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearAllFilters();
                        setIsFilterOpen(false);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active filters badges */}
        {activeBadges.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {activeBadges}
              {activeBadges.length > 1 && (
                <Button
                  variant="link"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="overflow-hidden rounded-lg bg-white/50 p-4 shadow backdrop-blur-sm"
              >
                <Skeleton className="h-60 w-full rounded-lg" />
                <div className="mt-3 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            {data?.pages[0]?.products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[300px] flex-col items-center justify-center rounded-lg bg-white/50 p-8 text-center shadow-md backdrop-blur-sm"
              >
                <div className="mb-4 rounded-full bg-gray-100 p-3">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  No products found
                </h3>
                <p className="mb-4 text-gray-500">
                  Try adjusting your filters or search criteria
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="transition-all duration-300 hover:bg-green-50 hover:text-green-600"
                >
                  Clear all filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data?.pages.map((page, pageIndex) =>
                  page.products.map((product, productIndex) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay:
                          (pageIndex * page.products.length + productIndex) *
                          0.05,
                      }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  )),
                )}
              </div>
            )}
          </>
        )}

        {isFetching && !isFetchingNextPage && !isLoading && (
          <div className="mt-8 flex justify-center">
            <Loader className="size-5 animate-spin" />
          </div>
        )}

        {/* @ts-ignore */}
        {hasNextPage && data?.pages[0]?.products.length > 0 && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => fetchNextPage()}
              variant="outline"
              disabled={isFetchingNextPage}
              className="min-w-[150px] border-green-600 bg-white/80 text-green-700 backdrop-blur-sm hover:bg-green-50"
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
          </motion.div>
        )}

        {/* @ts-ignore */}
        {!hasNextPage && data?.pages[0]?.products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <div className="mx-auto max-w-sm rounded-lg border-2 border-dashed border-gray-300 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xl font-medium text-gray-700">
                  No more products
                </span>
                <p className="text-sm text-gray-500">
                  You've reached the end of the list
                </p>
                <div className="mt-1 h-1 w-12 rounded-full bg-gray-200" />
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
