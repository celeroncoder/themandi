import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { bookRouter } from "./routers/book";
import { userRouter } from "./routers/user";
import { purchaseRouter } from "./routers/purchase";
import { analyticsRouter } from "./routers/analytics";
import { authorRouter } from "./routers/author";
import { genreRouter } from "./routers/genre";
import { tagRouter } from "./routers/tag";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  book: bookRouter,
  user: userRouter,
  purchase: purchaseRouter,
  author: authorRouter,
  genre: genreRouter,
  tag: tagRouter,
  analytics: analyticsRouter,
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
