import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  getProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        title: z.string().optional(),
        farmerId: z.string().optional(),
        tagId: z.string().optional(),
        categoryId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, title, farmerId, tagId, categoryId } = input;

      const where = {
        ...(title
          ? { title: { contains: title, mode: "insensitive" as const } }
          : {}),
        ...(farmerId ? { farmers: { some: { id: farmerId } } } : {}),
        ...(tagId ? { tags: { some: { id: tagId } } } : {}),
        ...(categoryId ? { categories: { some: { id: categoryId } } } : {}),
      };

      const products = await ctx.db.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        where,
        include: {
          farmers: true,
          categories: true,
          tags: true,
          purchases: true,
          ratings: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        products,
        nextCursor,
      };
    }),

  createProduct: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        stock: z.number().min(0),
        unit: z.string(),
        harvestDate: z.date().optional(),
        expiryDate: z.date().optional(),
        isOrganic: z.boolean(),
        imageUrl: z.string().url().optional(),
        farmerIds: z.array(z.string()),
        categoryIds: z.array(z.string()),
        tagIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.product.create({
          data: {
            title: input.title,
            description: input.description,
            price: input.price,
            stock: input.stock,
            unit: input.unit,
            harvestDate: input.harvestDate,
            expiryDate: input.expiryDate,
            isOrganic: input.isOrganic,
            imageUrl: input.imageUrl,
            farmers: {
              connect: input.farmerIds.map((id) => ({ id })),
            },
            categories: {
              connect: input.categoryIds.map((id) => ({ id })),
            },
            tags: {
              connect: input.tagIds.map((id) => ({ id })),
            },
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),
});
