import { createTRPCRouter, publicProcedure } from "../trpc";

export const tagRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.tag.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
