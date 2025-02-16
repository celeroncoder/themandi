import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  getBooks: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        title: z.string().optional(),
        author: z.string().optional(),
        publisher: z.string().optional(),
        tag: z.string().optional(),
        genre: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const { cursor, title, author, publisher, tag, genre } = input;

      const books = await ctx.db.book.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          title: title ? { contains: title } : undefined,
          publisher: publisher ? { contains: publisher } : undefined,
          authors: author
            ? { some: { name: { contains: author } } }
            : undefined,
          tags: tag ? { some: { name: { contains: tag } } } : undefined,
          genres: genre ? { some: { name: { contains: genre } } } : undefined,
        },
        include: {
          authors: true,
          tags: true,
          genres: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (books.length > limit) {
        const nextItem = books.pop();
        nextCursor = nextItem!.id;
      }

      return {
        books,
        nextCursor,
      };
    }),
});
