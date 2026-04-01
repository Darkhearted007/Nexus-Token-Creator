'use client';

import { motion } from 'framer-motion';
import { Rocket, Flame, Crosshair, Shield } from 'lucide-react';

interface Activity {
  id: string;
  type: 'launch' | 'volume' | 'sniper' | 'revoke';
  message: string;
  time: string;
}

const DEMO_ACTIVITIES: Activity[] = [
  { id: '1', type: 'launch', message: 'SOLApe (SOLA) deployed to mainnet', time: '2m ago' },
  { id: '2', type: 'volume', message: 'Volume bot activated for MoonShot', time: '5m ago' },
  { id: '3', type: 'sniper', message: 'Bundle snipe completed for DegenFi', time: '12m ago' },
  { id: '4', type: 'revoke', message: 'Mint authority revoked on NexusDAO', time: '18m ago' },
  { id: '5', type: 'launch', message: 'CryptoPunksX (CPX) deployed to mainnet', time: '25m ago' },
  { id: '6', type: 'volume', message: 'Volume bot tier upgraded for SOLApe', time: '32m ago' },
  { id: '7', type: 'launch', message: 'SolVault (SVLT) deployed to mainnet', time: '45m ago' },
];

const ICONS = {
  launch: { icon: Rocket, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  volume: { icon: Flame, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  sniper: { icon: Crosshair, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  revoke: { icon: Shield, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
};

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {DEMO_ACTIVITIES.map((activity, i) => {
          const config = ICONS[activity.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.65 + i * 0.06 }}
              className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors group"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: config.bg }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                  {activity.message}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
