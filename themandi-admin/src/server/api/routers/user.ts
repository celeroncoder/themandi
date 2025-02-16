import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const users = await ctx.db.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          purchases: true,
          ratings: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      const usersWithStats = users.map((user, idx) => {
        const totalPurchases = user.purchases.length;
        const totalSpent = user.purchases.reduce(
          (sum, purchase) => sum + purchase.amount.toNumber(),
          0,
        );
        const averageRating =
          user.ratings.length > 0
            ? user.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
              user.ratings.length
            : null;

        return {
          idx: idx + 1,
          id: user.id,
          authId: user.authId,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          totalPurchases,
          totalSpent,
          averageRating,
        };
      });

      return {
        users: usersWithStats,
        nextCursor,
      };
    }),
});
