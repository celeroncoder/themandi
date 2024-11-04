"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  const { mutate: clearCart } = api.cart.clearCart.useMutation();
  const { mutate: createPurchases } = api.cart.createPurchases.useMutation();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      createPurchases(
        { sessionId },
        {
          onSuccess: () => {
            clearCart();
            Cookies.remove("cart"); // Clear the cart cookie
            setIsProcessing(false);
          },
          onError: (error) => {
            console.error("Error processing purchase:", error);
            setIsProcessing(false);
          },
        },
      );
    } else {
      setIsProcessing(false);
    }
  }, [searchParams, createPurchases, clearCart]);

  if (isProcessing) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-xl">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-8 text-4xl font-bold">Thank You for Your Purchase!</h1>
      <p className="mb-8 text-xl">
        Your order has been successfully processed.
      </p>
      <Button onClick={() => router.push("/")}>Continue Shopping</Button>
    </div>
  );
}
