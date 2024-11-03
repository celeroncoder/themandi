import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

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

  createBook: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        price: z.number().positive("Price must be positive"),
        publisher: z.string().min(1, "Publisher is required"),
        releaseDate: z.date(),
        authors: z.array(z.string()).min(1, "At least one author is required"),
        tags: z.array(z.string()),
        genres: z.array(z.string()).min(1, "At least one genre is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const book = await ctx.db.book.create({
          data: {
            title: input.title,
            description: input.description,
            price: input.price,
            publisher: input.publisher,
            releaseDate: input.releaseDate,
            authors: {
              connect: input.authors.map((id) => ({
                id,
              })),
            },
            tags: {
              connect: input.tags.map((id) => ({
                id,
              })),
            },
            genres: {
              connect: input.genres.map((id) => ({
                id,
              })),
            },
          },
          include: {
            authors: true,
            tags: true,
            genres: true,
          },
        });

        return book;
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error.message ||
              "An unexpected error occurred, please try again later.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
        });
      }
    }),

  getBook: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        include: {
          authors: true,
          tags: true,
          genres: true,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      return book;
    }),

  updateBook: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        price: z.number().positive("Price must be positive"),
        pdfUrl: z.string().url("Must be a valid URL"),
        thumbnailUrl: z.string().url("Must be a valid URL"),
        publisher: z.string().min(1, "Publisher is required"),
        releaseDate: z.date(),
        authors: z.array(z.string()).min(1, "At least one author is required"),
        tags: z.array(z.string()),
        genres: z.array(z.string()).min(1, "At least one genre is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const book = await ctx.db.book.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            price: new Prisma.Decimal(input.price),
            pdfUrl: input.pdfUrl,
            thumbnailUrl: input.thumbnailUrl,
            publisher: input.publisher,
            releaseDate: input.releaseDate,
            authors: {
              set: [],
              connectOrCreate: input.authors.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
            tags: {
              set: [],
              connectOrCreate: input.tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
            genres: {
              set: [],
              connectOrCreate: input.genres.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          },
          include: {
            authors: true,
            tags: true,
            genres: true,
          },
        });

        return book;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "A unique constraint would be violated on Author, Tag, or Genre. The book could not be updated.",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
        });
      }
    }),
});
