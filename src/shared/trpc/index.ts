import { publicProcedure, router } from './trpc';

// router of backend side with safe typing
export const appRouter = router({
  authCallback: publicProcedure.query(() => {
    // const {}
    return 2;
  }),
});

export type AppRouter = typeof appRouter;
