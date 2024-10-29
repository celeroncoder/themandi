import { AnalyticsCard } from "./_components/analytics-card";

export default async function Home() {
  return (
    <main className="min-h-screen w-full">
      <section className="px-10 py-4">
        <p className="text-4xl font-bold">Dashboard</p>
      </section>

      <AnalyticsCard />
    </main>
  );
}
