import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { auth } from "@clerk/nextjs/server";

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
});
