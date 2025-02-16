import { createTRPCRouter, publicProcedure } from "../trpc";

export const genreRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.genre.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
