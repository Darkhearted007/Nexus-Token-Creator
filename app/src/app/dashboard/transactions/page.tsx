'use client';

import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="relative min-h-full">
      <div className="fixed top-[30%] left-[20%] w-[350px] h-[350px] bg-indigo-500/[0.06] rounded-full blur-[130px] -z-10 pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">Track all on-chain transactions and fee history.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-5">
          <ArrowLeftRight className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Transaction History Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Full transaction logs, fee tracking, and export capabilities will be available here.
        </p>
      </motion.div>
    </div>
  );
}
