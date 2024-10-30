import { AnalyticsCard } from "./_components/analytics-card";
import { RevenueChart } from "./_components/revenue-chart";
import { RecentSales } from "./_components/recent-sales";
import { TopBooksAndAuthors } from "./_components/top-books-authors-card";

export default async function Home() {
  return (
    <section className="">
      <section className="px-10 py-4">
        <p className="text-4xl font-bold">Dashboard</p>
      </section>

      <AnalyticsCard />

      <section className="flex flex-col gap-6 px-10 py-4 md:flex-row">
        <RevenueChart />
        <RecentSales />
      </section>

      <TopBooksAndAuthors />
    </section>
  );
}
