import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.category.findMany();
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.category.create({
        data: input,
      });
    }),
});
