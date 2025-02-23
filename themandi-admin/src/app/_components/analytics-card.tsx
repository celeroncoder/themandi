import { cn, currencyFormatter } from "@/lib/utils";
import { api } from "@/trpc/server";
import { ChartLine, ShoppingBasket, UsersRound } from "lucide-react";

export async function AnalyticsCard() {
  const productData = await api.analytics.getProductStats();
  const revenueData = await api.analytics.getRevenueStats();
  const userCount = await api.user.count(); // We'll add this to the user router

  const cardData = {
    products: {
      icon: ShoppingBasket,
      total: productData.totalProducts,
      changeFromLastMonth: productData.percentageChange,
    },
    users: {
      icon: UsersRound,
      total: userCount, // Simple user count instead of detailed stats
      changeFromLastMonth: "0", // Since we're not tracking monthly changes for now
    },
    revenue: {
      icon: ChartLine,
      total: currencyFormatter.format(revenueData.totalRevenue),
      changeFromLastMonth: revenueData.percentageChange,
    },
  };

  return (
    <section className="flex flex-wrap items-center justify-start gap-4 px-10 py-4">
      {Object.entries(cardData).map(([key, data]) => (
        <div
          className="w-[300px] rounded-lg border-2 px-6 py-6 shadow-lg"
          key={key}
        >
          <div className="flex items-center justify-start gap-6">
            <div className="rounded-full bg-muted p-4">
              <data.icon size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-md font-semibold capitalize text-muted-foreground">
                {key}
              </p>
              <p className="mb-2 text-2xl font-bold">{data.total}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ChartLine size={12} />
                <span
                  className={cn(
                    "font-medium",
                    parseFloat(data.changeFromLastMonth) >= 0
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {parseFloat(data.changeFromLastMonth) > 0 && "+"}
                  {data.changeFromLastMonth}%
                </span>
                <span>from last month</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
