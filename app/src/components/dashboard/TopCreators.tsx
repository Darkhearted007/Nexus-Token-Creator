'use client';

import { motion } from 'framer-motion';
import { User, Trophy, ArrowUpRight } from 'lucide-react';

interface Creator {
  address: string;
  tokensLaunched: number;
  totalVolume: string;
  rank: number;
}

const TOP_CREATORS: Creator[] = [
  { address: '8xK...q3vM', tokensLaunched: 24, totalVolume: '1,240.50 SOL', rank: 1 },
  { address: '4hB...mR2k', tokensLaunched: 18, totalVolume: '890.30 SOL', rank: 2 },
  { address: '9pL...nW5j', tokensLaunched: 15, totalVolume: '722.10 SOL', rank: 3 },
  { address: '2mK...pT8x', tokensLaunched: 12, totalVolume: '545.80 SOL', rank: 4 },
  { address: '6wR...hL4a', tokensLaunched: 9, totalVolume: '312.20 SOL', rank: 5 },
];

export default function TopCreators() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Top Token Creators</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">All-Time Leaderboard</p>
          </div>
        </div>
        <button className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
          Full Rankings <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4">
        {TOP_CREATORS.map((creator, i) => (
          <div 
            key={creator.address}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                  <User className="w-5 h-5 text-indigo-300" />
                </div>
                {i < 3 && (
                   <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10 ${
                     i === 0 ? 'bg-amber-500 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-900' : 'bg-orange-400 text-orange-950'
                   }`}>
                     {i + 1}
                   </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white font-mono">{creator.address}</p>
                <p className="text-[10px] text-gray-500">{creator.tokensLaunched} Tokens Launched</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-emerald-400">{creator.totalVolume}</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-tighter">Total Volume</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
