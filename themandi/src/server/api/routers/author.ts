import { createTRPCRouter, publicProcedure } from "../trpc";

export const authorRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.author.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
