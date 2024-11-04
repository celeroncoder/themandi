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
import { ArrowDown, Loader2, ShoppingCart } from "lucide-react";
import { api } from "@/trpc/react";
import { BookCard } from "./_component/book-card";

export default function Component() {
  const { data: tags, isLoading: isLoadingTags } = api.tag.getAll.useQuery();
  const { data: genres, isLoading: isLoadingGenres } =
    api.genre.getAll.useQuery();
  const { data: authors, isLoading: isLoadingAuthors } =
    api.author.getAll.useQuery();

  const [filters, setFilters] = useState({
    title: "",
    author: "",
    tag: "",
    genre: "",
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
  } = api.book.getBooks.useInfiniteQuery(filters, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500">
      <header className="sticky top-0 z-10 bg-white shadow-md transition-shadow duration-300 ease-in-out">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">文庫 (Tosho)</h1>
            <p className="text-muted-foreground text-sm font-semibold">
              A random book-store...
            </p>
          </div>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="bg-primary text-primary-foreground absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs">
              0
            </span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search by title"
            value={filters.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
            className="bg-white"
          />

          {isLoadingAuthors ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={filters.author}
              onValueChange={(value) => handleFilterChange("author", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an author" />
              </SelectTrigger>
              <SelectContent>
                {authors?.map((author) => (
                  <SelectItem key={author.id} value={author.name}>
                    {author.name}
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
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isLoadingGenres ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={filters.genre}
              onValueChange={(value) => handleFilterChange("genre", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres?.map((genre) => (
                  <SelectItem value={genre.name} key={genre.id}>
                    {genre.name}
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
            : data?.pages.map((page, i) =>
                page.books.map((book) => (
                  <BookCard key={book.id} book={book} />
                )),
              )}
        </div>

        {isFetching && !isFetchingNextPage && (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{" "}
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

        {/* @ts-ignore */}
        {!hasNextPage && data?.pages[0]?.books.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            You've reached the end of the list.
          </div>
        )}

        {data?.pages[0]?.books.length === 0 && (
          <div className="mt-8 text-center text-gray-600">
            No books found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}
