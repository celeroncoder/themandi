import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { productRouter } from "./routers/product";
import { tagRouter } from "./routers/tag";
import { farmerRouter } from "./routers/farmer";
import { cartRouter } from "./routers/cart";
import { userRouter } from "./routers/user";
import { categoryRouter } from "./routers/category";
import { purchaseRouter } from "./routers/purchase";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  tag: tagRouter,
  category: categoryRouter,
  farmer: farmerRouter,
  cart: cartRouter,
  user: userRouter,
  purchase: purchaseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
