'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  HelpCircle, 
  Rocket, 
  Database, 
  ChevronRight, 
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';

const MARKET_SPACE_OPTIONS = [
  { size: '2.9 KB', cost: '0.45 SOL', label: 'Recommended', desc: 'Standard market space for most tokens.' },
  { size: '1.4 KB', cost: '0.28 SOL', label: 'Economy', desc: 'Cheapest option, for low-volume testing.' },
  { size: '10 KB', cost: '1.5 SOL', label: 'High Volume', desc: 'Enhanced space for heavy trading tokens.' },
];

export default function OpenBookMarket() {
  const [baseMint, setBaseMint] = useState('');
  const [quoteMint, setQuoteMint] = useState('So11111111111111111111111111111111111111112'); // SOL
  const [minOrderSize, setMinOrderSize] = useState('1');
  const [tickSize, setTickSize] = useState('0.000001');
  const [selectedSpace, setSelectedSpace] = useState(0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Introduction Card */}
      <div className="dashboard-card bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border-indigo-500/20 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
               <Building2 className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Create OpenBook Market</h2>
                <p className="text-gray-400 text-sm">Mandatory step to list your token on Raydium or Serum.</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 text-white opacity-5 pointer-events-none">
          <Building2 size={160} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Form */}
          <section className="dashboard-card">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Market Pairs Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Base Token (Your Token)</label>
                  <input
                    type="text"
                    placeholder="Enter Token Mint Address"
                    value={baseMint}
                    onChange={(e) => setBaseMint(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Quote Token (Pairing)</label>
                  <select
                    value={quoteMint}
                    onChange={(e) => setQuoteMint(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 appearance-none cursor-pointer"
                  >
                    <option value="So11111111111111111111111111111111111111112">SOL (Native)</option>
                    <option value="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v">USDC</option>
                    <option value="Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB">USDT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Min. Order Size</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={minOrderSize}
                      onChange={(e) => setMinOrderSize(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all"
                    />
                    <HelpCircle className="absolute right-3 top-3 w-4 h-4 text-gray-600 cursor-help" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tick Size (Price Precision)</label>
                  <input
                    type="number"
                    value={tickSize}
                    onChange={(e) => setTickSize(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Market Space Selection */}
          <section className="dashboard-card">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Market Space & Storage (Rent)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MARKET_SPACE_OPTIONS.map((opt, i) => (
                <button
                  key={opt.size}
                  onClick={() => setSelectedSpace(i)}
                  className={`relative p-5 rounded-2xl border text-left transition-all ${
                    selectedSpace === i 
                      ? 'bg-indigo-500/10 border-indigo-500/40 ring-1 ring-indigo-500/20' 
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  {i === 0 && (
                    <span className="absolute -top-2.5 right-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md shadow-lg">
                      Recommended
                    </span>
                  )}
                  <p className={`text-lg font-black ${selectedSpace === i ? 'text-white' : 'text-gray-400'}`}>{opt.size}</p>
                  <p className="text-sm font-bold text-indigo-400 mt-1">{opt.cost}</p>
                  <p className="text-[10px] text-gray-600 leading-tight mt-3">{opt.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <section className="dashboard-card">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Order Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service Fee</span>
                <span className="text-white font-mono">0.10 SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Market Storage</span>
                <span className="text-white font-mono">{MARKET_SPACE_OPTIONS[selectedSpace].cost}</span>
              </div>
              <div className="h-px bg-white/[0.06] my-2" />
              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">Total Cost</span>
                <span className="text-emerald-400 font-bold">
                  {(0.10 + parseFloat(MARKET_SPACE_OPTIONS[selectedSpace].cost)).toFixed(2)} SOL
                </span>
              </div>
            </div>

            <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-14 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3">
              <Rocket className="w-5 h-5 fill-current" />
              Create Market
            </button>
          </section>

          <section className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-500">Attention</p>
            </div>
            <p className="text-[11px] text-amber-500/80 leading-relaxed">
              Once you create this market, its Base Mint cannot be changed. Ensure all token addresses are correct before proceeding.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
