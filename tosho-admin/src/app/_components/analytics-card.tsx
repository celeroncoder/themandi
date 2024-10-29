import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { BookMarked, ChartLine, UsersRound } from "lucide-react";

export async function AnalyticsCard() {
  const booksData = await api.analytics.getBookStats();
  const userData = await api.analytics.getUserStats();
  const revenueData = await api.analytics.getRevenueStats();

  const cardData = {
    books: {
      icon: BookMarked,
      total: booksData.totalBooks,
      changeFromLastMonth: booksData.percentageChange,
    },
    users: {
      icon: UsersRound,
      total: userData.totalUsers,
      changeFromLastMonth: userData.percentageChange,
    },
    revenue: {
      icon: ChartLine,
      total: revenueData.totalRevenue,
      changeFromLastMonth: revenueData.percentageChange,
    },
  };

  return (
    <section className="flex flex-wrap items-center justify-start gap-4 px-10 py-4">
      {Object.keys(cardData).map((key) => {
        const data = cardData[key as keyof typeof cardData];

        return (
          <div className="rounded-lg border-2 px-6 py-6 shadow-lg" key={key}>
            <div className="flex items-center justify-start gap-6">
              <p className="rounded-full bg-muted p-4">
                <data.icon size={24} />
              </p>
              <div>
                <p className="text-md font-semibold capitalize text-muted-foreground">
                  {key}
                </p>
                <p className="mb-2 text-2xl font-bold">{data.total}</p>
                <p className="text-sm text-muted-foreground">
                  <ChartLine size={12} className="inline" />{" "}
                  <span
                    className={cn(
                      "text-green-500",
                      parseFloat(data.changeFromLastMonth) < 0 &&
                        "text-red-500",
                    )}
                  >
                    {data.changeFromLastMonth}%
                  </span>{" "}
                  from last month.
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
