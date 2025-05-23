import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const tagRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.tag.findMany({
      include: {
        products: true,
      },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tag.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),
});
