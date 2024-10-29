import { z } from "zod";
import { format, startOfMonth, subMonths } from "date-fns";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const analyticsRouter = createTRPCRouter({
  getBookStats: publicProcedure.query(async ({ ctx }) => {
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
      percentageChange: percentageChange.toFixed(2),
    };
  }),

  getRevenueStats: publicProcedure.query(async ({ ctx }) => {
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

    const totalRevenue =
      (
        await ctx.db.purchase.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: "COMPLETED",
          },
        })
      )._sum.amount?.toNumber() || 0;

    const revenueThisMonth =
      (
        await ctx.db.purchase.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: firstDayOfThisMonth,
              lt: firstDayOfNextMonth,
            },
          },
        })
      )._sum.amount?.toNumber() || 0;

    const revenueLastMonth =
      (
        await ctx.db.purchase.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: firstDayOfLastMonth,
              lt: firstDayOfThisMonth,
            },
          },
        })
      )._sum.amount?.toNumber() || 0;

    const percentageChange = revenueLastMonth
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : revenueThisMonth > 0
        ? 100
        : 0;

    return {
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      percentageChange: percentageChange.toFixed(2),
    };
  }),

  getUserStats: publicProcedure.query(async ({ ctx }) => {
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

    const totalUsers = await ctx.db.user.count();

    const usersThisMonth = await ctx.db.user.count({
      where: {
        createdAt: {
          gte: firstDayOfThisMonth,
          lt: firstDayOfNextMonth,
        },
      },
    });

    const usersLastMonth = await ctx.db.user.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfThisMonth,
        },
      },
    });

    const percentageChange = usersLastMonth
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
      : usersThisMonth > 0
        ? 100
        : 0;

    return {
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      percentageChange: percentageChange.toFixed(2),
    };
  }),

  getPeriodicStats: publicProcedure
    .input(z.object({ period: z.enum(["6months", "12months"]) }))
    .query(async ({ input, ctx }) => {
      const monthsToShow = input.period === "6months" ? 6 : 12;
      const startDate = startOfMonth(subMonths(new Date(), monthsToShow - 1));

      // 1. Get monthly revenue and books sold (COMPLETED purchases)
      const purchases = await ctx.db.purchase.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: startDate,
          },
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
        _count: {
          bookId: true,
        },
      });

      // 2. Get new users created each month within the period
      const users = await ctx.db.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      });

      // 3. Organize data into a monthly format
      const results = [];
      for (let i = 0; i < monthsToShow; i++) {
        const monthStart = startOfMonth(
          subMonths(new Date(), monthsToShow - i - 1),
        );
        const monthLabel = format(monthStart, "yyyy-MM");

        const monthRevenue =
          purchases.find((p) => format(p.createdAt, "yyyy-MM") === monthLabel)
            ?._sum.amount || 0;
        const booksSold =
          purchases.find((p) => format(p.createdAt, "yyyy-MM") === monthLabel)
            ?._count.bookId || 0;
        const newUsers =
          users.find((u) => format(u.createdAt, "yyyy-MM") === monthLabel)
            ?._count.id || 0;

        results.push({
          month: monthLabel,
          revenue: Number(monthRevenue),
          books: booksSold,
          users: newUsers,
        });
      }

      return results;
    }),

  getRecentSales: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const recentSales = await ctx.db.purchase.findMany({
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
        include: {
          user: {
            select: {
              id: true,
              authId: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return recentSales.map((sale) => ({
        id: sale.id,
        userId: sale.userId,
        bookId: sale.bookId,
        bookTitle: sale.book.title,
        amount: sale.amount.toNumber(),
        createdAt: sale.createdAt,
      }));
    }),
});
