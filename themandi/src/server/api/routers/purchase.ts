import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PurchaseStatus } from "@prisma/client";

export const purchaseRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        status: z
          .enum(["PENDING", "COMPLETED", "FAILED", "SHIPPED", "DELIVERED"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, status } = input;

      const purchases = await ctx.db.purchase.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          product: {
            include: {
              farmers: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (purchases.length > limit) {
        const nextItem = purchases.pop();
        nextCursor = nextItem!.id;
      }

      return {
        purchases,
        nextCursor,
      };
    }),

  getByUser: publicProcedure
    .input(
      z
        .object({
          userId: z.string().optional(),
          authId: z.string().optional(),
          limit: z.number().min(1).max(100).nullish(),
          cursor: z.string().nullish(),
          status: z
            .enum(["PENDING", "COMPLETED", "FAILED", "SHIPPED", "DELIVERED"])
            .optional(),
        })
        .refine((data) => data.userId || data.authId, {
          message: "Either userId or authId must be provided",
        }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, status, userId, authId } = input;

      const userWhere = userId
        ? { id: userId }
        : authId
          ? { authId }
          : undefined;

      if (!userWhere) {
        throw new Error("Either userId or authId must be provided");
      }

      // First get the user
      const user = await ctx.db.user.findFirst({
        where: userWhere,
      });

      if (!user) {
        throw new Error("User not found");
      }

      const purchases = await ctx.db.purchase.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          userId: user.id,
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              farmers: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (purchases.length > limit) {
        const nextItem = purchases.pop();
        nextCursor = nextItem!.id;
      }

      return {
        purchases,
        nextCursor,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        quantity: z.number().min(1),
        amount: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.purchase.create({
        data: {
          ...input,
          status: PurchaseStatus.PENDING,
        },
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "COMPLETED",
          "FAILED",
          "SHIPPED",
          "DELIVERED",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.purchase.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
