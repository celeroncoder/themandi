import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@prisma/client";

type User = {
  id: string;
  authId: string;
  role: Role;
  createdAt: Date;
  totalPurchases: number;
  totalSpent: number;
  cartItemCount: number;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "authId",
    header: "Auth ID",
  },
  {
    accessorKey: "role",
    header: "Role",
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
      const amount = row.getValue("totalSpent") as number;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "cartItemCount",
    header: "Cart Items",
  },
];
