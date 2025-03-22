"use client";

import { currencyFormatter } from "@/lib/utils";
import { Image } from "@/components/image-loader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import { motion } from "framer-motion";

export const ProductCard: React.FC<{
  product: RouterOutputs["product"]["getProducts"]["products"][number];
}> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card
        key={product.id}
        className="flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
      >
        <CardHeader className="flex-shrink-0 p-0">
          <div className="relative">
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Image
                src={
                  `/api/image-proxy?url=${encodeURIComponent(product.imageUrl)}` ||
                  "/images/product-placeholder.png"
                }
                alt={product.title}
                height={192}
                width={256}
                containerClassName="h-48"
                className="h-48 w-full object-cover transition-transform duration-300"
              />
            </motion.div>
            {product.isOrganic && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow-md"
              >
                <Leaf
                  className="h-5 w-5 text-green-500"
                  aria-label="Organic Product"
                />
              </motion.div>
            )}
          </div>
          <div className="px-4 pt-4">
            <h3 className="line-clamp-2 h-12 text-lg font-bold capitalize text-[#4a3520]">
              {product.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-[#8b6938]">
              by {product.farmers.map((f) => f.name).join(", ")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow px-4 py-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-2 flex flex-wrap gap-1 text-sm text-gray-500"
          >
            {product.categories.map((category) => (
              <Badge
                variant="outline"
                key={category.id}
                className="bg-[#f7f3eb] text-[#8b6938] hover:bg-[#e9dfc7]"
              >
                {category.name}
              </Badge>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 flex flex-wrap gap-1 text-sm text-gray-500"
          >
            {product.tags.map((tag) => (
              <Badge
                variant="secondary"
                key={tag.id}
                className="bg-[#e9dfc7] text-[#594324]"
              >
                {tag.name}
              </Badge>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <p className="text-xl font-bold text-[#4a3520]">
              {currencyFormatter.format(Number(product.price))} / {product.unit}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Stock:</span> {product.stock}{" "}
              {product.unit}
            </p>
            {product.harvestDate && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Harvested:</span>{" "}
                {new Date(product.harvestDate).toLocaleDateString()}
              </p>
            )}
            {product.expiryDate && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Best before:</span>{" "}
                {new Date(product.expiryDate).toLocaleDateString()}
              </p>
            )}
          </motion.div>
        </CardContent>
        <CardFooter className="flex-shrink-0 px-4 pb-4 pt-2">
          <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full bg-[#8b6938] font-medium text-white shadow-sm transition-all duration-300 hover:bg-[#c59e58]"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
            >
              {isAdding ? (
                <span className="flex items-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  Adding...
                </span>
              ) : product.stock === 0 ? (
                "Out of Stock"
              ) : (
                <span className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Add to Cart</span>
                </span>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
