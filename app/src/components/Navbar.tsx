'use client';
import { Rocket, Droplets } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-gray-950/50 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NexusLaunch</span>
        </Link>
        <div className="flex items-center gap-6">
          <a 
            href="https://raydium.io/liquidity/create/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors bg-white/5 py-2 px-4 rounded-xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30"
          >
            <Droplets className="w-4 h-4 text-emerald-400" />
            Add Liquidity
          </a>
          <WalletMultiButtonDynamic className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-xl !h-12 !font-semibold !transition-colors" />
        </div>
      </div>
    </header>
  );
}
