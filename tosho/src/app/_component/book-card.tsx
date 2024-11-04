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
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import Cookies from "js-cookie";

export const BookCard: React.FC<{
  book: RouterOutputs["book"]["getBooks"]["books"][number];
}> = ({ book }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const addToCartMutation = api.cart.addToCart.useMutation();

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      if (user) {
        // User is logged in, use tRPC mutation
        await addToCartMutation.mutateAsync({ bookId: book.id });
      } else {
        // User is not logged in, use cookies

        const cart = JSON.parse(Cookies.get("cart") || "[]");
        const existingItem = cart.find((item: any) => item.id === book.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ id: book.id, quantity: 1 });
        }
        Cookies.set("cart", JSON.stringify(cart), { expires: 7 }); // Expires in 7 days
      }
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the book to your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card key={book.id} className="max-h-fit">
      <CardHeader>
        <CardTitle className="line-clamp-2 capitalize">{book.title}</CardTitle>
        <Image
          src={book.thumbnailUrl || "/images/book-cover.png"}
          alt={book.title}
          height={192}
          width={256}
          className="mb-4 h-48 w-full rounded-md object-cover"
        />
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-gray-600">
          by {book.authors.map((a) => a.name).join(", ")}
        </p>
        <div className="mb-2 text-sm text-gray-500">
          Genres:{" "}
          {book.genres.map((genre) => (
            <Badge variant="outline" key={genre.id} className="mb-1 mr-2">
              {genre.name}
            </Badge>
          ))}
        </div>
        <div className="mb-2 text-sm text-gray-500">
          Tags:{" "}
          {book.tags.map((tag) => (
            <Badge variant="secondary" key={tag.id} className="mb-1 mr-2">
              {tag.name}
            </Badge>
          ))}
        </div>
        <p className="text-lg font-bold">
          {currencyFormatter.format(Number(book.price))}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            "Adding..."
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
