import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Role } from "@prisma/client";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        role: z.enum(["ADMIN", "USER", "FARMER"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, role } = input;

      const users = await ctx.db.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: role ? { role } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          purchases: true,
          ratings: true,
          cart: {
            include: {
              items: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      const usersWithStats = users.map((user) => ({
        ...user,
        totalPurchases: user.purchases.length,
        totalSpent: user.purchases.reduce(
          (sum, purchase) => sum + purchase.amount.toNumber(),
          0,
        ),
        cartItemCount: user.cart?.items.length ?? 0,
      }));

      return {
        users: usersWithStats,
        nextCursor,
      };
    }),

  upsertUser: publicProcedure
    .input(
      z.object({
        authId: z.string(),
        role: z.enum(["ADMIN", "USER", "FARMER"]).default("USER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.upsert({
        where: { authId: input.authId },
        update: { role: input.role },
        create: input,
      });
    }),

  updateRole: publicProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["ADMIN", "USER", "FARMER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.role },
      });
    }),

  count: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.count();
  }),
});
