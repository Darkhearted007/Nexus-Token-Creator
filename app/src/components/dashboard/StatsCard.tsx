'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change: string;
  changeType: 'up' | 'down';
  accentColor: string;
  delay?: number;
}

export default function StatsCard({ icon: Icon, label, value, change, changeType, accentColor, delay = 0 }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const suffix = typeof value === 'string' ? value.replace(/[0-9.,]/g, '').trim() : '';
    const isDecimal = String(value).includes('.');
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * eased;

      if (isDecimal) {
        setDisplayValue(current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (suffix ? ' ' + suffix : ''));
      } else {
        setDisplayValue(Math.floor(current).toLocaleString('en-US') + (suffix ? ' ' + suffix : ''));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      {/* Glow background */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: accentColor }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <span className={changeType === 'up' ? 'stat-badge-up' : 'stat-badge-down'}>
            {changeType === 'up' ? '↑' : '↓'} {change}
          </span>
        </div>
        <p className="text-2xl font-bold text-white tracking-tight mb-1">
          {displayValue || '0'}
        </p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
