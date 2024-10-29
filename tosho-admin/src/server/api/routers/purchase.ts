import { createTRPCRouter, publicProcedure } from "../trpc";

export const purchaseRouter = createTRPCRouter({
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
      percentageChange,
    };
  }),
});
