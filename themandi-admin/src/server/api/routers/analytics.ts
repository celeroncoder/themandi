import { z } from "zod";
import { format, startOfMonth, subMonths } from "date-fns";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const analyticsRouter = createTRPCRouter({
  getProductStats: publicProcedure.query(async ({ ctx }) => {
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

    const totalProducts = await ctx.db.product.count();

    const productsThisMonth = await ctx.db.product.count({
      where: {
        createdAt: {
          gte: firstDayOfThisMonth,
          lt: firstDayOfNextMonth,
        },
      },
    });

    const productsLastMonth = await ctx.db.product.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfThisMonth,
        },
      },
    });

    const percentageChange = productsLastMonth
      ? ((productsThisMonth - productsLastMonth) / productsLastMonth) * 100
      : productsThisMonth > 0
        ? 100
        : 0;

    return {
      totalProducts,
      productsThisMonth,
      productsLastMonth,
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

  getTopProducts: publicProcedure.query(async ({ ctx }) => {
    const topProducts = await ctx.db.product.findMany({
      take: 5,
      orderBy: {
        purchases: {
          _count: "desc",
        },
      },
      include: {
        purchases: true,
        farmers: {
          select: {
            name: true,
          },
        },
      },
    });

    return topProducts.map((product) => ({
      id: product.id,
      title: product.title,
      farmers: product.farmers.map((farmer) => farmer.name),
      totalSales: product.purchases.length,
      revenue: product.purchases.reduce(
        (sum, purchase) => sum + purchase.amount.toNumber(),
        0,
      ),
    }));
  }),

  getPeriodicStats: publicProcedure
    .input(z.object({ period: z.enum(["6months", "12months"]) }))
    .query(async ({ input, ctx }) => {
      const monthsToShow = input.period === "6months" ? 6 : 12;
      const startDate = startOfMonth(subMonths(new Date(), monthsToShow - 1));

      const sales = await ctx.db.purchase.groupBy({
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
          id: true,
        },
      });

      const results = [];
      for (let i = 0; i < monthsToShow; i++) {
        const monthStart = startOfMonth(
          subMonths(new Date(), monthsToShow - i - 1),
        );
        const monthLabel = format(monthStart, "yyyy-MM");

        const monthData = sales.find(
          (s) => format(s.createdAt, "yyyy-MM") === monthLabel,
        );

        results.push({
          month: monthLabel,
          revenue: Number(monthData?._sum.amount ?? 0),
          sales: monthData?._count.id ?? 0,
        });
      }

      return results;
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
          user: true,
          product: {
            include: {
              farmers: true,
            },
          },
        },
      });

      return recentSales.map((sale) => ({
        id: sale.id,
        userId: sale.userId,
        productTitle: sale.product.title,
        farmerNames: sale.product.farmers
          .map((farmer) => farmer.name)
          .join(", "),
        amount: sale.amount.toNumber(),
        createdAt: sale.createdAt,
      }));
    }),
});
