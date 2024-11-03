import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Decimal } from "@prisma/client/runtime/library";

type Book = {
  id: string;
  title: string;
  price: Decimal;
  authors: string;
  publisher: string;
  rating: number | null;
  releaseDate: Date;
  revenue: number;
  genres: string[];
  tags: string[];
  thumbnailUrl: string;
  purchaseCount: number;
};

export const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "authors",
    header: "Authors",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | null;
      return rating ? rating.toFixed(2) : "N/A";
    },
  },
  {
    accessorKey: "releaseDate",
    header: "Release Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("releaseDate")).toLocaleDateString();

      return <p className="text-nowrap">{date}</p>;
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const revenue = parseFloat(row.getValue("revenue"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(revenue);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "purchaseCount",
    header: "Purchases",
  },
  {
    accessorKey: "publisher",
    header: "Publisher",
  },
  {
    accessorKey: "genres",
    header: "Genres",
    cell: ({ row }) => {
      const genres = row.getValue("genres") as string[];
      return genres.join(", ");
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      return tags.join(", ");
    },
  },
];
