"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api, RouterOutputs } from "@/trpc/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { Header } from "../_component/header";
import { currencyFormatter } from "@/lib/utils";

interface CartItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  thumbnailUrl: string;
  quantity: number;
}

export default function CartPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<
    RouterOutputs["cart"]["getCartItems"]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: userCartItems, isLoading: isCartItemsLoading } =
    api.cart.getCartItems.useQuery();

  const { mutate: createCheckoutSession, isPending: isCheckoutLoading } =
    api.cart.createCheckoutSession.useMutation({
      onSuccess: ({ sessionId }) => {
        router.push(`/api/checkout/${sessionId}`);
      },
    });

  const trpcCtx = api.useContext();
  const { mutate: removeFromCart } = api.cart.removeFromCart.useMutation({
    onSuccess: () => {
      if (user) {
        trpcCtx.cart.getCartItems.invalidate();
      } else {
        const cookieCart = JSON.parse(Cookies.get("cart") || "[]");
        setCartItems(cookieCart);
      }
    },
  });

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        if (userCartItems && !isCartItemsLoading) {
          setCartItems(userCartItems);
          setIsLoading(false);
        }
      } else {
        // Fetch cart items from cookies for non-logged-in users
        const cookieCart = JSON.parse(Cookies.get("cart") || "[]");
        setCartItems(cookieCart);
        setIsLoading(false);
      }
    }
  }, [user, isLoaded, userCartItems, isCartItemsLoading]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (user) {
      createCheckoutSession();
    } else {
      router.push("/sign-in");
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (user) {
      removeFromCart({ cartItemId: itemId });
    } else {
      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);
      Cookies.set("cart", JSON.stringify(updatedCart));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="mb-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={item.thumbnailUrl || "/images/book-cover.png"}
                      alt={item.title}
                      width={50}
                      height={75}
                      className="object-cover"
                    />
                    <div>
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-semibold">
                      {currencyFormatter.format(
                        Number(item.price) * item.quantity,
                      )}
                    </p>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-xl font-semibold">Total:</p>
              <p className="text-xl font-semibold">
                {currencyFormatter.format(totalPrice)}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              className="mt-8 w-full"
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {user ? "Proceed to Checkout" : "Sign In to Checkout"}
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
