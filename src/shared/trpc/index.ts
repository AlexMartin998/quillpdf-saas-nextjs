import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

import { TRPCError } from '@trpc/server';

import { db } from '@/db';
import { privateProcedure, publicProcedure, router } from './trpc';

// router of backend side with safe typing
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = getUser();

    if (!user?.id || !user.email) throw new TRPCError({ code: 'UNAUTHORIZED' });

    // // check if the user is in the DB
    const dbUser = await db.user.findFirst({
      where: { id: user.id },
    });
    if (!dbUser) {
      // is the 1st time, we need to create user in our db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return {
      success: true,
    };
  }),

  // files
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({ where: { userId } });
  }),
});

export type AppRouter = typeof appRouter;
