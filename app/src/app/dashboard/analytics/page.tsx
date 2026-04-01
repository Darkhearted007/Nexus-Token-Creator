'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-full">
      <div className="fixed top-[20%] right-[15%] w-[400px] h-[400px] bg-purple-600/[0.06] rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Deep dive into your token performance metrics.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-5">
          <BarChart3 className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Advanced Analytics Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Detailed charts, token performance breakdowns, wallet analytics, and AI-powered insights will be available here.
        </p>
      </motion.div>
    </div>
  );
}
