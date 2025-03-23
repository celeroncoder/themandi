"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Loader, CheckCircle, ShoppingBag } from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
              Cookies.remove("cart");
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto flex h-screen flex-col items-center justify-center px-4"
      >
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-2xl font-medium text-gray-600"
        >
          Processing your order...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto flex h-screen flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <CheckCircle className="size-16 text-[#8b6938]" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4 mt-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-4xl font-bold text-transparent"
      >
        Thank You for Your Purchase!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8 text-xl text-gray-600"
      >
        Your order has been successfully processed.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link href="/">
          <Button className="group bg-[#8b6938] px-6 py-2 text-lg" size="lg">
            Continue Shopping
            <ShoppingBag className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Loader className="h-8 w-8 animate-spin" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
