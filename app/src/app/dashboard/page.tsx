'use client';

import { useState, useEffect } from 'react';
import { Coins, DollarSign, Flame, Crosshair } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import TokenTrendsChart from '@/components/dashboard/TokenTrendsChart';
import RecentTokensTable from '@/components/dashboard/RecentTokensTable';
import BotMetricsCard from '@/components/dashboard/BotMetricsCard';
import RevenueBreakdown from '@/components/dashboard/RevenueBreakdown';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-full">
      {/* Background Orbs */}
      <div className="fixed top-[15%] left-[10%] w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[150px] -z-10 animate-orb-drift pointer-events-none" />
      <div className="fixed top-[40%] right-[5%] w-[400px] h-[400px] bg-indigo-500/[0.05] rounded-full blur-[120px] -z-10 animate-orb-drift pointer-events-none" style={{ animationDelay: '-5s' }} />
      <div className="fixed bottom-[10%] left-[30%] w-[350px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[130px] -z-10 animate-orb-drift pointer-events-none" style={{ animationDelay: '-10s' }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Welcome back! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your token launches today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={Coins}
          label="Total Tokens Created"
          value="12485"
          change="+7.2%"
          changeType="up"
          accentColor="#8b5cf6"
          delay={0}
        />
        <StatsCard
          icon={DollarSign}
          label="Total Revenue (SOL)"
          value="4892.30 SOL"
          change="+15.1%"
          changeType="up"
          accentColor="#6366f1"
          delay={100}
        />
        <StatsCard
          icon={Flame}
          label="Active Volume Bots"
          value="312"
          change="+5.8%"
          changeType="up"
          accentColor="#10b981"
          delay={200}
        />
        <StatsCard
          icon={Crosshair}
          label="Active Sniper Bots"
          value="78"
          change="+1.4%"
          changeType="up"
          accentColor="#f59e0b"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TokenTrendsChart />
        <RecentTokensTable />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BotMetricsCard />
        <RevenueBreakdown />
        <ActivityFeed />
      </div>
    </div>
  );
}
