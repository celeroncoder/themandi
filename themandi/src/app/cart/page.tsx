"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api, RouterOutputs } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Image } from "@/components/image-loader";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader, Minus, Plus, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { Header } from "../_component/header";
import { currencyFormatter } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Interface for cart item structure
interface CartItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  thumbnailUrl: string;
  quantity: number;
}

export default function CartPage() {
  // Hooks and state
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const trpcCtx = api.useUtils();
  const [cartItems, setCartItems] = useState<
    RouterOutputs["cart"]["getCartItems"]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query and mutations
  const { data: userCartItems, isLoading: isCartItemsLoading } =
    api.cart.getCartItems.useQuery();

  const { mutateAsync: createCheckoutSession, isPending: isCheckoutLoading } =
    api.cart.createCheckoutSession.useMutation({
      onSuccess: ({ sessionId }) => {
        router.push(`/api/checkout/${sessionId}`);
      },
    });

  const { mutateAsync: removeFromCart } = api.cart.removeFromCart.useMutation({
    onSuccess: () => {
      if (user) {
        trpcCtx.cart.getCartItems.invalidate();
      } else {
        const cookieCart = JSON.parse(Cookies.get("cart") || "[]");
        setCartItems(cookieCart);
      }
    },
  });

  const { mutateAsync: updateQuantity, isPending: isUpdatingQuantity } =
    api.cart.updateQuantity.useMutation({
      onSuccess: () => {
        if (user) {
          trpcCtx.cart.getCartItems.invalidate();
        }
      },
    });

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        if (userCartItems && !isCartItemsLoading) {
          setCartItems(userCartItems);
          setIsLoading(false);
        }
      } else {
        const cookieCart = JSON.parse(Cookies.get("cart") || "[]");
        setCartItems(cookieCart);
        setIsLoading(false);
      }
    }
  }, [user, isLoaded, userCartItems, isCartItemsLoading]);

  // Handlers
  const handleCheckout = async () => {
    try {
      if (user) {
        const res = await createCheckoutSession();

        if (!res || !res.sessionId) {
          toast({
            title: "Failed to create checkout session",
            description: "Please try again later.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Redirecting to checkout session...",
            description: "Please do not refresh the page.",
            variant: "default",
          });
        }
      } else {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (user) {
      await removeFromCart({ cartItemId: itemId });
    } else {
      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);
      Cookies.set("cart", JSON.stringify(updatedCart));
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (user) {
      await updateQuantity({ cartItemId: itemId, quantity: newQuantity });
    } else {
      const updatedCart = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      );
      setCartItems(updatedCart);
      Cookies.set("cart", JSON.stringify(updatedCart));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f5f0]">
        <Loader className="h-8 w-8 animate-spin text-[#8b6938]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center text-3xl font-bold text-[#2c1810]"
        >
          Your Shopping Cart
        </motion.h1>

        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-lg bg-white p-8 text-center shadow-lg"
            >
              <p className="text-[#2c1810]">Your cart is empty.</p>
              <Button
                className="mt-4 bg-[#8b6938] transition-colors duration-300 hover:bg-[#c59e58]"
                onClick={() => router.push("/")}
              >
                Continue Shopping
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-6 space-y-6">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between rounded-md border border-[#e2d5c3] p-4 transition-colors duration-300 hover:bg-[#f8f5f0]"
                      >
                        <div className="flex items-center space-x-6">
                          <div className="h-20 w-16 overflow-hidden rounded-md border border-[#e2d5c3]">
                            <Image
                              src={
                                `/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}` ||
                                "/images/book-cover.png"
                              }
                              alt={item.title}
                              width={64}
                              height={80}
                              containerClassName="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h2 className="font-medium text-[#2c1810]">
                              {item.title}
                            </h2>
                            <div className="mt-2 flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-[#8b6938] text-[#8b6938]"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 || isUpdatingQuantity
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="min-w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-[#8b6938] text-[#8b6938]"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={isUpdatingQuantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-medium text-[#2c1810]">
                            {currencyFormatter.format(
                              Number(item.price) * item.quantity,
                            )}
                          </p>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-500 transition-colors duration-300 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white p-6 shadow-lg"
              >
                <h2 className="mb-4 text-lg font-medium text-[#2c1810]">
                  Order Summary
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-[#2c1810]">Subtotal</p>
                    <p>{currencyFormatter.format(totalPrice)}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-[#2c1810]">Shipping</p>
                    <p>Calculated at checkout</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#e2d5c3] pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-[#2c1810]">Total</p>
                    <p className="text-xl font-bold text-[#2c1810]">
                      {currencyFormatter.format(totalPrice)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="mt-6 w-full bg-[#8b6938] py-6 text-base font-medium transition-colors duration-300 hover:bg-[#c59e58]"
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {user ? "Proceed to Checkout" : "Sign In to Checkout"}{" "}
                      <ChevronRight />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
