import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/server/stripe";

const placeHolderBookCoverImage =
  "https://edit.org/images/cat/book-covers-big-2019101610.jpg";

export const cartRouter = createTRPCRouter({
  getCartItems: publicProcedure.query(async ({ ctx }) => {
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

    const cart = await ctx.db.cart.findUnique({
      where: { userId: dbUser.id },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                price: true,
                thumbnailUrl: true,
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
      bookId: item.bookId,
      title: item.book.title,
      price: item.book.price,
      thumbnailUrl: item.book.thumbnailUrl,
      quantity: 1, // Since the schema doesn't have a quantity field, we'll assume 1 for each item
    }));
  }),

  createCheckoutSession: publicProcedure.mutation(async ({ ctx }) => {
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

    const cart = await ctx.db.cart.findUnique({
      where: { userId: dbUser.id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.book.title,
          images: [item.book.thumbnailUrl || placeHolderBookCoverImage],
        },
        unit_amount: Math.round(Number(item.book.price) * 100),
      },
      quantity: 1,
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
    });

    return { sessionId: session.id };
  }),

  addToCart: publicProcedure
    .input(z.object({ bookId: z.string() }))
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

      console.log(dbUser);

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
          cartId_bookId: {
            cartId: cart.id,
            bookId: input.bookId,
          },
        },
      });

      if (existingItem) {
        // If the item already exists, we don't need to do anything
        // since we don't have a quantity field in the CartItem model
        return { success: true };
      }

      await ctx.db.cartItem.create({
        data: {
          cartId: cart.id,
          bookId: input.bookId,
        },
      });

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

  clearCart: publicProcedure.mutation(async ({ ctx }) => {
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

    console.log(dbUser);

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
        throw new Error("You must be logged in to add items to your cart.");
      }

      const dbUser = await ctx.db.user.findUnique({
        where: { authId: userId },
      });

      if (!dbUser) {
        throw new Error("User not found.");
      }

      console.log(dbUser);

      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      const cart = await ctx.db.cart.findUnique({
        where: { userId: dbUser.id },
        include: { items: { include: { book: true } } },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const purchases = await ctx.db.purchase.createMany({
        data: cart.items.map((item) => ({
          userId: dbUser.id,
          bookId: item.bookId,
          amount: item.book.price,
          status: "COMPLETED",
          stripePaymentId: session.payment_intent as string,
        })),
      });

      return { success: true, purchasesCount: purchases.count };
    }),
});
