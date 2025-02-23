import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/utils";
import { api } from "@/trpc/server";
import { format } from "date-fns";

export async function RecentSales() {
  const recentSales = await api.analytics.getRecentSales({
    limit: 5,
  });

  return (
    <Card className="max-h-fit w-full max-w-md">
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
              <p className="text-sm font-medium leading-none">
                {sale.productTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                Farmer: {sale.farmerNames}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(sale.createdAt, "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-sm font-semibold text-green-500">
                {currencyFormatter.format(sale.amount)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
