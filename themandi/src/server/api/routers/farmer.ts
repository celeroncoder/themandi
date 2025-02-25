import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const farmerRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.farmer.findMany({
      include: {
        products: true,
      },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        location: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.farmer.create({
        data: input,
      });
    }),
});
