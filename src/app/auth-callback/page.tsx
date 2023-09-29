'use client';

import { useRouter, useSearchParams } from 'next/navigation'; // v.13+
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';

// // sync auth user with db for the 1st time

export type AuthCallbackProps = {};

const AuthCallback: React.FC<AuthCallbackProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  // client side library
  trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        router.push(origin ?? '/dashboard');
      }
    },
    onError: err => {
      if (err.data?.code === 'UNAUTHORIZED') router.push('/sign-in');
    },
    retry: true,
    retryDelay: 5000,
  });

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
