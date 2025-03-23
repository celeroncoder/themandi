import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/server/stripe";

const placeholderProductImage =
  "https://i0.wp.com/sesitechnologies.com/wp-content/uploads/2021/02/whole-grain.jpeg"; // Update this with your default image

export const cartRouter = createTRPCRouter({
  getCartItems: publicProcedure.query(async ({ ctx }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("You must be logged in to view your cart.");
    }

    const dbUser = await ctx.db.user.findUnique({
      where: { authId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found.");
    }

    const cart = await ctx.db.cart.findUnique({
      where: { userId: dbUser.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                imageUrl: true,
                stock: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return [];
    }

    return cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      title: item.product.title,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      unit: item.product.unit,
      stock: item.product.stock,
    }));
  }),

  createCheckoutSession: publicProcedure.mutation(async ({ ctx }) => {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error("You must be logged in to checkout.");
    }

    const dbUser = await ctx.db.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      throw new Error("User not found.");
    }

    const cart = await ctx.db.cart.findUnique({
      where: { userId: dbUser.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.title,
          images: [item.product.imageUrl || placeholderProductImage],
          // images: [placeholderProductImage],
        },
        unit_amount: Math.round(Number(item.product.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId: dbUser.id,
      },
      customer_email: user.primaryEmailAddress?.emailAddress || undefined,
      billing_address_collection: "required",
    });

    return { sessionId: session.id };
  }),

  addToCart: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("You must be logged in to add items to your cart.");
      }

      const dbUser = await ctx.db.user.findUnique({
        where: { authId: userId },
      });

      if (!dbUser) {
        throw new Error("User not found.");
      }

      let cart = await ctx.db.cart.findUnique({
        where: { userId: dbUser.id },
      });

      if (!cart) {
        cart = await ctx.db.cart.create({
          data: { user: { connect: { id: dbUser.id } } },
        });
      }

      const existingItem = await ctx.db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: input.productId,
          },
        },
      });

      if (existingItem) {
        await ctx.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + input.quantity },
        });
      } else {
        await ctx.db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
      }

      return { success: true };
    }),

  removeFromCart: publicProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cartItem.delete({
        where: { id: input.cartItemId },
      });

      return { success: true };
    }),

  updateQuantity: publicProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cartItem.update({
        where: { id: input.cartItemId },
        data: { quantity: input.quantity },
      });

      return { success: true };
    }),

  clearCart: publicProcedure.mutation(async ({ ctx }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("You must be logged in to clear your cart.");
    }

    const dbUser = await ctx.db.user.findUnique({
      where: { authId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found.");
    }

    await ctx.db.cartItem.deleteMany({
      where: { cart: { userId: dbUser.id } },
    });

    return { success: true };
  }),

  createPurchases: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("You must be logged in to complete purchases.");
      }

      const dbUser = await ctx.db.user.findUnique({
        where: { authId: userId },
      });

      if (!dbUser) {
        throw new Error("User not found.");
      }

      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      // Check if a purchase with this session ID already exists
      const existingPurchases = await ctx.db.purchase.findMany({
        where: { stripePaymentId: session.payment_intent as string },
      });

      if (existingPurchases && existingPurchases.length > 0) {
        return { success: true, purchasesCount: existingPurchases.length };
      }

      const cart = await ctx.db.cart.findUnique({
        where: { userId: dbUser.id },
        include: { items: { include: { product: true } } },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const purchases = await ctx.db.purchase.createMany({
        data: cart.items.map((item) => ({
          userId: dbUser.id,
          productId: item.productId,
          amount: item.product.price,
          quantity: item.quantity,
          status: "COMPLETED",
          stripePaymentId: session.payment_intent as string,
        })),
      });

      return { success: true, purchasesCount: purchases.count };
    }),
});
