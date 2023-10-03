import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db } from '@/db';
import { MessagesConstants } from '../constants';
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

  // // files
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx; // <- auth middleware

    return await db.file.findMany({ where: { userId } });
  }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

      return file;
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: { id: input.fileId, userId: ctx.userId },
      });
      if (!file) return { status: 'PENDING' as const }; // const set as enum of prisma

      return { status: file.uploadStatus };
    }),

  // .input() like body to send | mutation receive input obj
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({ where: { id: input.id, userId } });
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

      await db.file.delete({ where: { id: input.id } });

      return { success: true };
    }),

  // // messages
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // infinite query
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? MessagesConstants.InfiniteQueryLimit;

      const file = await db.file.findFirst({ where: { id: fileId, userId } });
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

      const messages = await db.message.findMany({
        where: { fileId },
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        cursor: cursor ? { id: cursor } : undefined, // infinite query
        select: { id: true, isUserMessage: true, createdAt: true, text: true },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),
});

export type AppRouter = typeof appRouter;
