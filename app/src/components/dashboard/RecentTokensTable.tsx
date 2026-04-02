'use client';

import { motion } from 'framer-motion';
import { Coins, ExternalLink } from 'lucide-react';

interface TokenRow {
  id: string;
  name: string;
  symbol: string;
  mintAddress: string;
  totalRevenue: string | number;
  status: 'active' | 'completed' | 'paused';
}

const DEMO_TOKENS: TokenRow[] = [
  { id: '1', name: 'SOLApe', symbol: 'SOLA', mintAddress: '7xKX...q3vM', totalRevenue: '14.50', status: 'active' },
  { id: '2', name: 'CryptoPunksX', symbol: 'CPX', mintAddress: '4hBt...mR2k', totalRevenue: '8.30', status: 'completed' },
  { id: '3', name: 'MoonShot', symbol: 'MOON', mintAddress: '9pLz...nW5j', totalRevenue: '22.10', status: 'active' },
  { id: '4', name: 'DegenFi', symbol: 'DGEN', mintAddress: '2mKs...pT8x', totalRevenue: '5.80', status: 'paused' },
  { id: '5', name: 'NexusDAO', symbol: 'NXDAO', mintAddress: '6wRt...hL4a', totalRevenue: '31.20', status: 'active' },
  { id: '6', name: 'SolVault', symbol: 'SVLT', mintAddress: '3kPn...dF7c', totalRevenue: '12.90', status: 'completed' },
];

export default function RecentTokensTable({ tokens }: { tokens?: any[] }) {
  const displayTokens = (tokens && tokens.length > 0) ? tokens : DEMO_TOKENS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Recent Tokens</h3>
        <button className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors bg-white/[0.03] px-2.5 py-1 rounded-lg">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left pb-3 pr-4">Token</th>
              <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left pb-3 pr-4">Symbol</th>
              <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left pb-3 pr-4 hidden sm:table-cell">Mint Address</th>
              <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right pb-3 pr-4">Revenue</th>
              <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayTokens.map((token, i) => (
              <motion.tr
                key={token.id || token.mintAddress}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                className="border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Coins className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{token.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-gray-400 font-mono">{token.symbol}</span>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 font-mono">{token.mintAddress.slice(0, 4)}...{token.mintAddress.slice(-4)}</span>
                    <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-400" />
                  </div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-sm font-semibold text-gray-200">{token.totalRevenue} SOL</span>
                </td>
                <td className="py-3 text-right">
                  <span className={`status-${token.status || 'active'}`}>
                    {(token.status || 'active').charAt(0).toUpperCase() + (token.status || 'active').slice(1)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
