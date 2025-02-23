import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { productRouter } from "./routers/product";
import { userRouter } from "./routers/user";
import { purchaseRouter } from "./routers/purchase";
import { analyticsRouter } from "./routers/analytics";
import { farmerRouter } from "./routers/farmer";
import { categoryRouter } from "./routers/category";
import { tagRouter } from "./routers/tag";

export const appRouter = createTRPCRouter({
  product: productRouter,
  user: userRouter,
  purchase: purchaseRouter,
  farmer: farmerRouter,
  category: categoryRouter,
  tag: tagRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
