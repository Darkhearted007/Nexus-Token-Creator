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
        <div className="flex items-center gap-5">
          <a 
            href="https://raydium.io/liquidity/create/" 
            target="_blank" 
            rel="noreferrer"
            className="group flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 bg-white/5 py-2.5 px-5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <Droplets className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
            Add Liquidity
          </a>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </div>
    </header>
  );
}
