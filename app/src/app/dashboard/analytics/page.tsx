'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Database,
  PieChart,
  Target
} from 'lucide-react';
import TokenTrendsChart from '@/components/dashboard/TokenTrendsChart';
import RevenueBreakdown from '@/components/dashboard/RevenueBreakdown';
import TopCreators from '@/components/dashboard/TopCreators';
import StatsCard from '@/components/dashboard/StatsCard';

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-full pb-10">
      {/* Background Orbs */}
      <div className="fixed top-[20%] right-[15%] w-[450px] h-[450px] bg-purple-600/[0.05] rounded-full blur-[140px] -z-10 animate-orb-drift pointer-events-none" />
      <div className="fixed bottom-[10%] left-[5%] w-[350px] h-[350px] bg-indigo-500/[0.04] rounded-full blur-[120px] -z-10 animate-orb-drift pointer-events-none" style={{ animationDelay: '-8s' }} />

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">
            Nexus Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
             Deep dive into cross-chain token metrics and platform performance.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl self-start md:self-auto">
           <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all">24H</button>
           <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-all">7D</button>
           <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-all">30D</button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={TrendingUp}
          label="Avg. Daily Volume"
          value="42,850 SOL"
          change="+12.4%"
          changeType="up"
          accentColor="#8b5cf6"
          delay={0}
        />
        <StatsCard
          icon={Users}
          label="Unique Creators"
          value="8,412"
          change="+5.2%"
          changeType="up"
          accentColor="#6366f1"
          delay={100}
        />
        <StatsCard
          icon={Target}
          label="Success Rate"
          value="94.2%"
          change="+0.8%"
          changeType="up"
          accentColor="#10b981"
          delay={200}
        />
        <StatsCard
          icon={Zap}
          label="Bot Efficiency"
          value="88.5%"
          change="-1.2%"
          changeType="down"
          accentColor="#f59e0b"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Side: Charts */}
         <div className="lg:col-span-2 space-y-6">
            <section className="glass-card p-6">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Token Launch Velocity</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Monthly Deployment Volume</p>
                    </div>
                  </div>
               </div>
               <TokenTrendsChart />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <RevenueBreakdown />
               
               {/* Efficiency Card */}
               <section className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Network Health</h3>
                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between items-end mb-1.5">
                             <span className="text-xs text-white font-medium">RPC Node Status</span>
                             <span className="text-[10px] font-mono text-emerald-400">99.9% Uptime</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[99%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between items-end mb-1.5">
                             <span className="text-xs text-white font-medium">Transaction Success</span>
                             <span className="text-[10px] font-mono text-indigo-400">94.2%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[94%] h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center">
                        <Database className="w-5 h-5 text-indigo-400 animate-pulse" />
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time Feed</p>
                        <p className="text-xs text-white font-medium">Synchronizing with Solana Mainnet...</p>
                     </div>
                  </div>
               </section>
            </div>
         </div>

         {/* Right Side: Leaderboard & Feed */}
         <div className="space-y-6">
            <TopCreators />
            
            {/* Quick Actions / Summary */}
            <section className="glass-card p-5 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 border-white/[0.06]">
               <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Analytics Actions</h4>
               <div className="space-y-2">
                  <button className="w-full py-3 px-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all text-left flex items-center justify-between group">
                     <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">Export CSV Data</span>
                     <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-all" />
                  </button>
                  <button className="w-full py-3 px-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all text-left flex items-center justify-between group">
                     <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">API Documentation</span>
                     <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-all" />
                  </button>
                  <button className="w-full py-3 px-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all text-left flex items-center justify-between group">
                     <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">Schedule Report</span>
                     <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-all" />
                  </button>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}
