import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Chain - Token Launchpad',
  description: 'Deploy your token across chains seamlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased min-h-screen flex flex-col`}>
        <div className="crypto-bg-animate" />
        <WalletContextProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
