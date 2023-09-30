import { Providers } from '@/shared/components/Providers';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/shared/components';

import 'react-loading-skeleton/dist/skeleton.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quill App',
  description: 'Generated by create next app',
};

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
        </body>
      </Providers>
    </html>
  );
}
