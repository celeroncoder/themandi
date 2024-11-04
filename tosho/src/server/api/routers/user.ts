import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ authId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({ where: { authId: input.authId } });
    }),
  createUser: publicProcedure
    .input(
      z.object({
        authId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { authId: input.authId },
      });

      if (user) {
        return user;
      }

      return await ctx.db.user.create({
        data: {
          authId: input.authId,
        },
      });
    }),
});
