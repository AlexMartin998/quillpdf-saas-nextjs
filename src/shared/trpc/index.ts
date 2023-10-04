import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { PLANS } from '@/config';
import { db } from '@/db';
import { MessagesConstants } from '../constants';
import { getUserSubscriptionPlan, stripe } from '../lib/stripe';
import { absoluteUrl } from '../lib/utils';
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

  // // Payment
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;
    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const dbUser = await db.user.findFirst({ where: { id: userId } });
    if (!dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' });

    // in server side we need absoluteURLs
    const billingUrl = absoluteUrl('/dashboard/billing');

    // // check subscription
    const isSubscribed = Boolean(
      dbUser.stripePriceId &&
        dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
        dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    );
    const subscriptionPlan = await getUserSubscriptionPlan();

    // already sunscribed and handle subcription
    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    // subscribe/buy ProPlan
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ['card', 'paypal'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price: PLANS.find(plan => plan.name === 'Pro')?.price.priceIds.test,
          quantity: 1, // 'cause is a monthly subscription
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),
});

export type AppRouter = typeof appRouter;
