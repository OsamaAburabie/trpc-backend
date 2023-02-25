import { inferRouterContext } from "@trpc/server";
import { authRouter } from "./authRouter";
import { postRouter } from "./postRouter";
import { router } from "../utils/trpc";
import { userRouter } from "./userRouter";
import { CategoryRouter } from "./categoryRouter";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  category: CategoryRouter,
});

export type authRouterContext = inferRouterContext<typeof appRouter>;

// type definition of trpc API
export type AppRouter = typeof appRouter;
