"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image } from "@/components/image-loader";
import { ChevronDown, Clock, Package, Loader, ShoppingBag } from "lucide-react";
import { currencyFormatter } from "@/lib/utils";
import { Header } from "../_component/header";
import { PurchaseStatus } from "@prisma/client";
import { api } from "@/trpc/react";

export default function PurchasesPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.purchase.getByUser.useInfiniteQuery(
      {
        authId: user?.id,
        limit: 10,
        status: activeTab !== "all" ? (activeTab as PurchaseStatus) : undefined,
      },
      {
        enabled: isLoaded && !!user?.id,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const purchases = data?.pages.flatMap((page) => page.purchases) || [];

  const groupedPurchases: Record<string, typeof purchases> = {};
  purchases.forEach((purchase) => {
    const key = purchase.stripePaymentId || purchase.id;
    if (!groupedPurchases[key]) {
      groupedPurchases[key] = [];
    }
    groupedPurchases[key].push(purchase);
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: PurchaseStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELIVERED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const ordersByMonth: Record<string, Record<string, typeof purchases>> = {};
  Object.entries(groupedPurchases).forEach(([paymentId, items]) => {
    const firstPurchase = items[0]!;
    const date = new Date(firstPurchase.createdAt);
    const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

    if (!ordersByMonth[monthYear]) {
      ordersByMonth[monthYear] = {};
    }
    ordersByMonth[monthYear][paymentId] = items;
  });

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#8b6938]" />
      </div>
    );
  }

  const calculateOrderTotal = (items: typeof purchases) => {
    return items.reduce(
      (total, purchase) => total + parseInt(purchase.amount.toString()),
      0,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-6 text-left sm:mb-10">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Your Purchases
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            View and track all your orders
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 gap-1 sm:mb-8 sm:grid-cols-5">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="text-xs sm:text-sm">
              Pending
            </TabsTrigger>
            <TabsTrigger value="SHIPPED" className="text-xs sm:text-sm">
              Shipped
            </TabsTrigger>
            <TabsTrigger
              value="DELIVERED"
              className="hidden text-xs sm:block sm:text-sm"
            >
              Delivered
            </TabsTrigger>
            <TabsTrigger
              value="COMPLETED"
              className="hidden text-xs sm:block sm:text-sm"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-[#8b6938]" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg bg-white p-6 text-center shadow-sm sm:p-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
                <h3 className="mt-4 text-lg font-medium text-gray-700 sm:text-xl">
                  No purchases found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  You haven't made any purchases{" "}
                  {activeTab !== "all" ? `with status '${activeTab}'` : ""} yet.
                </p>
                <Button
                  className="mt-6 bg-[#8b6938] hover:bg-[#c59e58]"
                  onClick={() => (window.location.href = "/")}
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(ordersByMonth).map(
                  ([monthYear, ordersByPaymentId]) => (
                    <div key={monthYear} className="space-y-3 sm:space-y-4">
                      <h2 className="text-base font-medium text-gray-700 sm:text-lg">
                        {monthYear}
                      </h2>

                      {Object.entries(ordersByPaymentId).map(
                        ([paymentId, orderItems]) => {
                          const firstItem = orderItems[0]!;
                          const orderDate = new Date(firstItem.createdAt);
                          const mainStatus = firstItem.status;
                          const totalAmount = calculateOrderTotal(orderItems);

                          return (
                            <Card key={paymentId} className="overflow-hidden">
                              <div
                                className="cursor-pointer"
                                onClick={() => toggleExpand(paymentId)}
                              >
                                <CardHeader className="p-3 pb-2 sm:p-4">
                                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                    <div className="flex flex-col">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-medium text-gray-500 sm:text-sm">
                                          Order placed:{" "}
                                          {orderDate.toLocaleDateString()}
                                        </p>
                                        <Badge
                                          className={getStatusColor(mainStatus)}
                                        >
                                          {mainStatus}
                                        </Badge>
                                      </div>
                                    </div>
                                    <span className="flex items-center text-xs font-medium text-[#8b6938] sm:text-sm">
                                      {expandedItems.has(paymentId)
                                        ? "Hide details"
                                        : "Show details"}
                                      <ChevronDown
                                        className={`ml-1 h-4 w-4 transition-transform ${expandedItems.has(paymentId) ? "rotate-180" : ""}`}
                                      />
                                    </span>
                                  </div>
                                </CardHeader>

                                <CardContent className="p-3 pt-2 sm:p-4">
                                  {orderItems.length === 1 ? (
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                      <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-200 bg-gray-50 sm:h-20 sm:w-20">
                                        <Image
                                          src={`/api/image-proxy?url=${encodeURIComponent(firstItem.product?.imageUrl)}`}
                                          alt={
                                            firstItem.product?.title ||
                                            "Product image"
                                          }
                                          width={80}
                                          height={80}
                                          // className="min-h-full object-cover"
                                          // containerClassName="h-full w-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-medium text-gray-800 sm:text-base">
                                          {firstItem.product?.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                          Qty: {firstItem.quantity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900 sm:text-base">
                                          {currencyFormatter.format(
                                            totalAmount,
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                      <div className="flex h-16 items-center space-x-1 overflow-hidden sm:h-20 sm:space-x-2">
                                        {orderItems
                                          .slice(0, 2)
                                          .map((item, index) => (
                                            <div
                                              key={index}
                                              className="h-16 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-50 sm:h-20 sm:w-16"
                                            >
                                              <Image
                                                src={`/api/image-proxy?url=${encodeURIComponent(item.product?.imageUrl)}`}
                                                alt={
                                                  item.product?.title ||
                                                  "Product image"
                                                }
                                                width={64}
                                                height={80}
                                                containerClassName="h-full w-full object-cover"
                                              />
                                            </div>
                                          ))}
                                        {orderItems.length > 2 && (
                                          <div className="flex h-16 w-12 items-center justify-center rounded-md border border-gray-200 bg-gray-50 sm:h-20 sm:w-16">
                                            <span className="text-xs font-medium text-gray-500 sm:text-sm">
                                              +{orderItems.length - 2}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-medium text-gray-800 sm:text-base">
                                          Order with {orderItems.length} items
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                          {orderItems.length} different products
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900 sm:text-base">
                                          {currencyFormatter.format(
                                            totalAmount,
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </div>

                              {expandedItems.has(paymentId) && (
                                <div className="bg-gray-50 p-3 sm:p-4">
                                  <Separator className="mb-4" />

                                  {orderItems.length > 1 && (
                                    <div className="mb-4">
                                      <h4 className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">
                                        Order Items
                                      </h4>
                                      <div className="space-y-3">
                                        {orderItems.map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex items-center rounded-md bg-white p-2 shadow-sm sm:p-3"
                                          >
                                            <div className="h-14 w-14 overflow-hidden rounded-md border border-gray-200 bg-gray-50 sm:h-16 sm:w-16">
                                              <Image
                                                src={`/api/image-proxy?url=${encodeURIComponent(item.product?.imageUrl)}`}
                                                alt={
                                                  item.product?.title ||
                                                  "Product image"
                                                }
                                                width={64}
                                                height={64}
                                                containerClassName="h-full w-full object-cover"
                                              />
                                            </div>
                                            <div className="min-w-0 flex-1 px-3 sm:px-4">
                                              <h5 className="truncate text-sm font-medium text-gray-800 sm:text-base">
                                                {item.product?.title}
                                              </h5>
                                              <div className="flex flex-col space-y-1">
                                                <p className="text-xs text-gray-500 sm:text-sm">
                                                  Qty: {item.quantity}
                                                </p>
                                                {item.product?.description && (
                                                  <p className="line-clamp-1 text-xs text-gray-500">
                                                    {item.product.description}
                                                  </p>
                                                )}
                                                {item.product?.farmers &&
                                                  item.product.farmers.length >
                                                    0 && (
                                                    <p className="text-xs text-gray-500">
                                                      Farmer:{" "}
                                                      {
                                                        item.product.farmers[0]
                                                          ?.name
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm font-medium text-gray-900 sm:text-base">
                                                {currencyFormatter.format(
                                                  parseInt(
                                                    item.amount.toString(),
                                                  ),
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <Separator className="mb-4" />

                                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <div className="grid w-full grid-cols-2 gap-4 sm:flex sm:w-auto sm:space-x-8">
                                      <div>
                                        <span className="text-xs text-gray-500 sm:text-sm">
                                          Order Date
                                        </span>
                                        <p className="text-xs font-medium text-gray-700 sm:text-sm">
                                          {orderDate.toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500 sm:text-sm">
                                          Status
                                        </span>
                                        <p className="text-xs font-medium text-gray-700 sm:text-sm">
                                          {mainStatus}
                                        </p>
                                      </div>
                                      {orderItems.length === 1 && (
                                        <div>
                                          <span className="text-xs text-gray-500 sm:text-sm">
                                            Quantity
                                          </span>
                                          <p className="text-xs font-medium text-gray-700 sm:text-sm">
                                            {firstItem.quantity}
                                          </p>
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-xs text-gray-500 sm:text-sm">
                                          Total Items
                                        </span>
                                        <p className="text-xs font-medium text-gray-700 sm:text-sm">
                                          {orderItems.length}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex w-full flex-col items-end justify-center sm:w-auto sm:border-l sm:border-gray-200 sm:pl-8">
                                      <span className="text-xs text-gray-500 sm:text-sm">
                                        Total Amount
                                      </span>
                                      <span className="text-xl font-bold text-[#8b6938] sm:text-3xl">
                                        {currencyFormatter.format(totalAmount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          );
                        },
                      )}
                    </div>
                  ),
                )}
              </div>
            )}

            {hasNextPage && (
              <div className="mt-6 flex justify-center sm:mt-8">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="border-[#8b6938] text-[#8b6938] hover:bg-[#f8f3ec]"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
