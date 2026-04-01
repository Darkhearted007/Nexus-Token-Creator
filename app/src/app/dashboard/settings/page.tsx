'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="relative min-h-full">
      <div className="fixed bottom-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/[0.05] rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and platform preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center mx-auto mb-5">
          <Settings className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Settings Panel Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Account configuration, RPC endpoint management, bot preferences, and notification settings will be here.
        </p>
      </motion.div>
    </div>
  );
}
