import type { Metadata } from 'next';
import './globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
      <body className="bg-gray-950 text-white antialiased min-h-screen flex flex-col">
        <div className="crypto-bg-animate" />
        <ToastProvider>
          <WalletContextProvider>
            <ErrorBoundary>
              <Navbar />
              <main className="flex-1 w-full">{children}</main>
            </ErrorBoundary>
          </WalletContextProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
