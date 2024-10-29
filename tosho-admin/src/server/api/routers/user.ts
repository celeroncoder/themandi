import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
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
      percentageChange,
    };
  }),
});
