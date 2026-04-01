'use client';

import MarketMaker from '@/components/dashboard/MarketMaker';

export default function MarketMakerPage() {
  return (
    <div className="relative min-h-full">
      {/* Background Orbs */}
      <div className="fixed top-[15%] left-[10%] w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[150px] -z-10 animate-orb-drift pointer-events-none" />
      <div className="fixed top-[40%] right-[5%] w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[120px] -z-10 animate-orb-drift pointer-events-none" style={{ animationDelay: '-5s' }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">
          Solana Market Maker
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Automate your token volume and trading activity with natural-pattern bots.
        </p>
      </div>

      <MarketMaker />
    </div>
  );
}
