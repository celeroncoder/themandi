import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Decimal } from "@prisma/client/runtime/library";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  title: string;
  description: string;
  price: Decimal;
  imageUrl: string;
  stock: number;
  unit: string;
  harvestDate: Date | null;
  expiryDate: Date | null;
  rating: number;
  isOrganic: boolean;
  createdAt: Date;
  updatedAt: Date;
  farmers: {
    id: string;
    name: string;
    description: string;
    location: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  categories: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  tags: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  purchases: {
    id: string;
    amount: Decimal;
    quantity: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  ratings: {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      return imageUrl ? (
        <div className="h-10 w-10 overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt={row.getValue("title")}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-md bg-muted" />
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
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
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const unit = row.getValue("unit") as string;
      return (
        <div className="font-medium">
          {stock} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: "isOrganic",
    header: "Organic",
    cell: ({ row }) => {
      const isOrganic = row.getValue("isOrganic") as boolean;
      return isOrganic ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-400" />
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return rating ? rating.toFixed(1) : "N/A";
    },
  },
  {
    accessorKey: "farmers",
    header: "Farmers",
    cell: ({ row }) => {
      const farmers = row.getValue("farmers") as Product["farmers"];
      return farmers.map((f) => f.name).join(", ");
    },
  },
  {
    accessorKey: "harvestDate",
    header: "Harvest Date",
    cell: ({ row }) => {
      const date = row.getValue("harvestDate") as Date | null;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const date = row.getValue("expiryDate") as Date | null;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      const categories = row.getValue("categories") as Product["categories"];
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Badge key={category.id} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as Product["tags"];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      );
    },
  },

  {
    accessorKey: "purchaseCount",
    header: "Sales",
    cell: ({ row }) => {
      const purchases = row.original.purchases;
      return <div className="font-medium">{purchases.length}</div>;
    },
  },

  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const purchases = row.original.purchases;
      const revenue = purchases.reduce(
        (sum, purchase) => sum + purchase.amount.toNumber(),
        0,
      );
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(revenue);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Details",
    cell: ({ cell }) => {
      return (
        <Link href={`/products/${cell.getValue() as string}`}>
          <Button size="icon" variant="ghost">
            <ChevronRight />
          </Button>
        </Link>
      );
    },
  },
];
