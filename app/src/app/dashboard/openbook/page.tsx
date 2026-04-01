'use client';

import OpenBookMarket from '@/components/dashboard/OpenBookMarket';

export default function OpenBookMarketPage() {
  return (
    <div className="relative min-h-full">
      {/* Background Orbs */}
      <div className="fixed top-[15%] left-[10%] w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[150px] -z-10 animate-orb-drift pointer-events-none" />
      <div className="fixed bottom-[10%] left-[30%] w-[350px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[130px] -z-10 animate-orb-drift pointer-events-none" style={{ animationDelay: '-10s' }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">
          OpenBook Market Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Deploy an OpenBook Market ID to enable trading for your token on Raydium.
        </p>
      </div>

      <OpenBookMarket />
    </div>
  );
}
