import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true })),
});
// export type definition of API
export type AppRouter = typeof appRouter;
