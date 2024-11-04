import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { bookRouter } from "./routers/book";
import { tagRouter } from "./routers/tag";
import { genreRouter } from "./routers/genre";
import { authorRouter } from "./routers/author";
import { cartRouter } from "./routers/cart";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  book: bookRouter,
  tag: tagRouter,
  genre: genreRouter,
  author: authorRouter,
  cart: cartRouter,
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
