'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';

import { trpc } from '@/app/_trpc/client';
import { absoluteUrl } from '@/shared/lib/utils';

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: absoluteUrl('/api/trpc') })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {/* no tiene q ver con trpc, util combinarlos */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
