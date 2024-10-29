import { AnalyticsCard } from "./_components/analytics-card";
import { RevenueChart } from "./_components/monthly-stats-chart";
import { RecentSales } from "./_components/recent-sales";

export default async function Home() {
  return (
    <main className="min-h-screen w-full">
      <section className="px-10 py-4">
        <p className="text-4xl font-bold">Dashboard</p>
      </section>

      <AnalyticsCard />

      <section className="flex flex-wrap items-start justify-start gap-10 px-10 py-4">
        <RevenueChart />
        <RecentSales />
      </section>
    </main>
  );
}
