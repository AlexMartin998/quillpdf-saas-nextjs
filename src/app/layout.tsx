import { Inter } from 'next/font/google';

import 'react-loading-skeleton/dist/skeleton.css';
import 'simplebar-react/dist/simplebar.min.css';

import { Navbar } from '@/shared/components';
import { Providers } from '@/shared/components/Providers';
import { Toaster } from '@/shared/components/ui/toaster';
import { constructMetadata } from '@/shared/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={`min-h-screen font-sans antialiased grainy ${inter.className}`}
        >
          <Navbar />

          {children}

          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
