import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";

export async function RecentSales() {
  // TODO: use the authId from here to fetch the actual names and avatar of the users...

  const recentSales = await api.analytics.getRecentSales({
    limit: 5,
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentSales.map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between space-x-4"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{sale.userId}</p>
              <p className="text-sm text-muted-foreground">{sale.bookTitle}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm font-semibold text-green-500">
                +${sale.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
