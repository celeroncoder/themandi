"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api, RouterOutputs } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Image } from "@/components/image-loader";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { Header } from "../_component/header";
import { currencyFormatter } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  const trpcCtx = api.useContext();
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

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  // Load cart items on component mount
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-10 text-center text-3xl font-bold text-gray-800">
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">Your cart is empty.</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="h-20 w-16 overflow-hidden rounded-md border border-gray-200">
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
                        <h2 className="font-medium text-gray-800">
                          {item.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium text-gray-900">
                        {currencyFormatter.format(
                          Number(item.price) * item.quantity,
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">Subtotal</p>
                  <p>{currencyFormatter.format(totalPrice)}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">Shipping</p>
                  <p>Calculated at checkout</p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-gray-800">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {currencyFormatter.format(totalPrice)}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="mt-6 w-full bg-[#8b6938] py-6 text-base font-medium hover:bg-[#c59e58]"
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
