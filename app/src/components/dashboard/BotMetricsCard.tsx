'use client';

import { motion } from 'framer-motion';
import { Activity, TrendingUp, Target, Zap } from 'lucide-react';

interface MetricItem {
  icon: typeof Activity;
  label: string;
  value: string;
  color: string;
}

const METRICS: MetricItem[] = [
  { icon: Activity, label: 'Avg. Success Rate', value: '94.1%', color: '#8b5cf6' },
  { icon: TrendingUp, label: 'Avg. Profit Margin', value: '8.5%', color: '#10b981' },
  { icon: Target, label: 'Total Wins', value: '1,845', color: '#6366f1' },
  { icon: Zap, label: 'Avg. Snipe Rate', value: '94.7%', color: '#f59e0b' },
];

export default function BotMetricsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-white mb-5">Bot Performance Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        {METRICS.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              className="relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                <span className="text-[11px] text-gray-500 font-medium">{metric.label}</span>
              </div>
              <p className="text-xl font-bold text-white tracking-tight">{metric.value}</p>
              {/* Subtle bottom bar */}
              <div className="mt-2 h-[2px] rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: metric.value }}
                  transition={{ duration: 1.2, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)`,
                    width: metric.value,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
