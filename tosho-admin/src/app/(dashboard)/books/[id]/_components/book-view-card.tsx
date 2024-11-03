"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { currencyFormatter } from "@/lib/utils";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { api, RouterOutputs } from "@/trpc/react";
import Link from "next/link";

export const BookViewCard: React.FC<{
  initialBookData: RouterOutputs["book"]["getBook"];
}> = ({ initialBookData }) => {
  const { data: book } = api.book.getBook.useQuery(
    { id: initialBookData.id },
    { initialData: initialBookData },
  );

  return (
    <Card className="flex flex-[0.5] flex-col items-center justify-center">
      <CardHeader>
        <Image
          src={book.thumbnailUrl || "/images/book-cover.png"}
          alt={book.title}
          width={400}
          height={150}
          className="h-80 w-64 rounded-lg border-2"
        />
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center gap-2">
        <div className="w-full">
          <p className="text-2xl font-bold capitalize">{book.title}</p>
          <p className="text-lg font-semibold text-muted-foreground">
            by{" "}
            {book.authors.map(
              (author, idx) =>
                `${author.name}${idx == book.authors.length - 1 ? "" : ", "}`,
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-1 text-sm">
          Tags:
          {book.tags.map((tag) => (
            <Badge variant={"outline"} className="block" key={tag.id}>
              {tag.name}
            </Badge>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-1 text-sm">
          Genres:
          {book.genres.map((genre) => (
            <Badge variant={"secondary"} className="block" key={genre.id}>
              {genre.name}
            </Badge>
          ))}
        </div>
        <div className="w-full text-left text-sm text-muted-foreground">
          <p>Published by: {book.publisher}</p>
          {/* @ts-ignore */}
          <p>Sold at: {currencyFormatter.format(book.price)}</p>
          <p>Relased at: {book.releaseDate.toLocaleDateString()}</p>
        </div>
      </CardContent>
      <CardFooter className="w-full">
        <Link
          href={book.pdfUrl ? book.pdfUrl : "#download"}
          target="__blank"
          className="w-full"
        >
          <Button className="w-full">
            <FileDown /> Download
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
