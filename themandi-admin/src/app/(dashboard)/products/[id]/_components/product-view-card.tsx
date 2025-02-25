"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { currencyFormatter } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { api, RouterOutputs } from "@/trpc/react";
import { Leaf } from "lucide-react";

type Product = RouterOutputs["product"]["getProducts"]["products"][number];

export const ProductViewCard: React.FC<{
  initialProductData: Product;
}> = ({ initialProductData }) => {
  const { data: product, isLoading } = api.product.getProducts.useQuery(
    {
      limit: 1,
      cursor: initialProductData.id,
    },
    {
      select: (data) => data.products[0],
      initialData: {
        products: [initialProductData],
        nextCursor: undefined,
      },
    },
  );

  if (isLoading) {
    return (
      <Card className="flex flex-[0.5] flex-col items-center justify-center p-8">
        <div className="animate-pulse">Loading...</div>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="flex flex-[0.5] flex-col items-center justify-center p-8">
        <div className="text-red-500">Error: Product not found</div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-[0.5] flex-col items-center justify-center">
      <CardHeader>
        <Image
          src={product.imageUrl || "/images/product-placeholder.png"}
          alt={product.title}
          width={400}
          height={150}
          className="h-80 w-64 rounded-lg border-2"
        />
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center gap-2">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold capitalize">{product.title}</p>
            {product.isOrganic && (
              <Leaf
                className="h-5 w-5 text-green-500"
                aria-label="Organic Product"
              />
            )}
          </div>
          <p className="text-lg font-semibold text-muted-foreground">
            by{" "}
            {product.farmers.map(
              (farmer, idx) =>
                `${farmer.name}${idx == product.farmers.length - 1 ? "" : ", "}`,
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-1 text-sm">
          Categories:
          {product.categories.map((category) => (
            <Badge variant={"outline"} className="block" key={category.id}>
              {category.name}
            </Badge>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-1 text-sm">
          Tags:
          {product.tags.map((tag) => (
            <Badge variant={"secondary"} className="block" key={tag.id}>
              {tag.name}
            </Badge>
          ))}
        </div>
        <div className="w-full text-left text-sm text-muted-foreground">
          <p>Price: {currencyFormatter.format(Number(product.price))}</p>
          <p>
            Stock: {product.stock} {product.unit}
          </p>
          {product.harvestDate && (
            <p>Harvest Date: {product.harvestDate.toLocaleDateString()}</p>
          )}
          {product.expiryDate && (
            <p>Expiry Date: {product.expiryDate.toLocaleDateString()}</p>
          )}
        </div>
        <div className="w-full">
          <p className="text-sm font-semibold">Description:</p>
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </div>
      </CardContent>
      <CardFooter className="w-full"></CardFooter>
    </Card>
  );
};
