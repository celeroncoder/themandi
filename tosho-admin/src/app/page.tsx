import { AnalyticsCard } from "./_components/analytics-card";
import { RevenueChart } from "./_components/monthly-stats-chart";

export default async function Home() {
  return (
    <main className="min-h-screen w-full">
      <section className="px-10 py-4">
        <p className="text-4xl font-bold">Dashboard</p>
      </section>

      <AnalyticsCard />

      <RevenueChart />
    </main>
  );
}
