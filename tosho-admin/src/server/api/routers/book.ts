import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  getBooks: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const books = await ctx.db.book.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          authors: true,
          tags: true,
          genres: true,
          purchases: true,
          ratings: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (books.length > limit) {
        const nextItem = books.pop();
        nextCursor = nextItem!.id;
      }

      const booksWithStats = books.map((book) => {
        const revenue = book.purchases.reduce(
          (sum, purchase) => sum + purchase.amount.toNumber(),
          0,
        );
        const averageRating =
          book.ratings.length > 0
            ? book.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
              book.ratings.length
            : null;

        return {
          id: book.id,
          title: book.title,
          price: book.price,
          authors: book.authors.map((author) => author.name).join(", "),
          publisher: book.publisher,
          rating: averageRating,
          releaseDate: book.releaseDate,
          revenue,
          genres: book.genres.map((genre) => genre.name),
          tags: book.tags.map((tag) => tag.name),
          thumbnailUrl: book.thumbnailUrl,
          purchaseCount: book.purchases.length,
        };
      });

      return {
        books: booksWithStats,
        nextCursor,
      };
    }),
});
