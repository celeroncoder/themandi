"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";

function CheckoutSuccessContent({}: {}) {
  const [isProcessing, setIsProcessing] = useState(true);
  const searchParams = useSearchParams();
  const { mutateAsync: clearCart } = api.cart.clearCart.useMutation();
  const { mutateAsync: createPurchases } =
    api.cart.createPurchases.useMutation();

  useEffect(() => {
    (async () => {
      const sessionId = searchParams.get("session_id");
      if (sessionId) {
        await createPurchases(
          { sessionId },
          {
            onSuccess: async () => {
              await clearCart();
              Cookies.remove("cart"); // Clear the cart cookie
              setIsProcessing(false);
              console.log("Purchase processed successfully");
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
    })();
  }, [searchParams, createPurchases, clearCart]);

  if (isProcessing) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
        <Loader className="h-8 w-8 animate-spin" />
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
      <Link href="/">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Loader className="h-8 w-8 animate-spin" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
