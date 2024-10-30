import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

type User = {
  idx: number;
  id: string;
  authId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  totalPurchases: number;
  totalSpent: number;
  averageRating: number | null;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "idx",
    header: "Sr. No.",
  },
  // TODO: replace with view profile on clerk or user-profile, avatar, name, data from clerk...
  {
    accessorKey: "authId",
    header: "Auth ID",
  },
  {
    accessorKey: "createdAt",
    header: "Joined at",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
  {
    accessorKey: "totalPurchases",
    header: "Total Purchases",
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalSpent"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "averageRating",
    header: "Average Rating",
    cell: ({ row }) => {
      const rating = row.getValue("averageRating") as number | null;
      return rating ? rating.toFixed(2) : "N/A";
    },
  },
];
