import { createTRPCRouter, publicProcedure } from "../trpc";

export const bookRouter = createTRPCRouter({
  getAnalytics: publicProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();

    const firstDayOfThisMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const firstDayOfNextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );

    const totalBooks = await ctx.db.book.count();

    const booksThisMonth = await ctx.db.book.count({
      where: {
        createdAt: {
          gte: firstDayOfThisMonth,
          lt: firstDayOfNextMonth,
        },
      },
    });

    const booksLastMonth = await ctx.db.book.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfThisMonth,
        },
      },
    });

    const percentageChange = booksLastMonth
      ? ((booksThisMonth - booksLastMonth) / booksLastMonth) * 100
      : booksThisMonth > 0
        ? 100 // if there were no books last month, we consider it a 100% increase if there are new books this month
        : 0; // if there were no books last month and none this month, change is 0

    return {
      totalBooks,
      booksThisMonth,
      booksLastMonth,
      percentageChange,
    };
  }),
});
