"use client";

import { currencyFormatter } from "@/lib/utils";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RouterOutputs } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import Cookies from "js-cookie";

export const ProductCard: React.FC<{
  product: RouterOutputs["product"]["getProducts"]["products"][number];
}> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const trpcCtx = api.useContext();
  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess() {
      trpcCtx.cart.getCartItems.invalidate();
      trpcCtx.cart.getCartItems.refetch();
    },
  });

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      if (user) {
        // User is logged in, use tRPC mutation
        await addToCartMutation.mutateAsync({ productId: product.id });
      } else {
        // User is not logged in, use cookies
        const cart = JSON.parse(Cookies.get("cart") || "[]");
        const existingItem = cart.find((item: any) => item.id === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ id: product.id, quantity: 1 });
        }
        Cookies.set("cart", JSON.stringify(cart), { expires: 7 }); // Expires in 7 days
      }
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to add the product to your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card key={product.id} className="max-h-fit">
      <CardHeader>
        <CardTitle className="line-clamp-2 flex items-center justify-between capitalize">
          {product.title}
          {product.isOrganic && (
            <Leaf
              className="h-5 w-5 text-green-500"
              aria-label="Organic Product"
            />
          )}
        </CardTitle>
        <Image
          src={
            `/api/image-proxy?url=${encodeURIComponent(product.imageUrl)}` ||
            "/images/product-placeholder.png"
          }
          alt={product.title}
          height={192}
          width={256}
          className="mb-4 h-48 w-full rounded-md object-cover"
        />
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-gray-600">
          by {product.farmers.map((f) => f.name).join(", ")}
        </p>
        <div className="mb-2 text-sm text-gray-500">
          Categories:{" "}
          {product.categories.map((category) => (
            <Badge variant="outline" key={category.id} className="mb-1 mr-2">
              {category.name}
            </Badge>
          ))}
        </div>
        <div className="mb-2 text-sm text-gray-500">
          Tags:{" "}
          {product.tags.map((tag) => (
            <Badge variant="secondary" key={tag.id} className="mb-1 mr-2">
              {tag.name}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-lg font-bold">
            {currencyFormatter.format(Number(product.price))} / {product.unit}
          </p>
          <p className="text-sm text-gray-500">
            Stock: {product.stock} {product.unit}
          </p>
          {product.harvestDate && (
            <p className="text-sm text-gray-500">
              Harvested: {new Date(product.harvestDate).toLocaleDateString()}
            </p>
          )}
          {product.expiryDate && (
            <p className="text-sm text-gray-500">
              Best before: {new Date(product.expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#8b6938] hover:bg-[#c59e58]"
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
        >
          {isAdding ? (
            "Adding..."
          ) : product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
