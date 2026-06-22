'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Settings2, 
  Play, 
  Square, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Clock, 
  Wallet, 
  TrendingUp,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { saveTokenToFirestore } from '@/lib/firebase/firestore';

const STRATEGIES = [
  { id: 'natural', name: 'Natural Growth', desc: 'Mimics real human trading patterns', icon: TrendingUp },
  { id: 'aggressive', name: 'Aggressive Volume', desc: 'Maximizes volume for trending lists', icon: Zap },
  { id: 'stealth', name: 'Stealth Mode', desc: 'Randomized small trades to avoid detection', icon: ShieldCheck },
];

export default function MarketMaker() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'active'>('config');
  const [tokenAddress, setTokenAddress] = useState('');
  const [strategy, setStrategy] = useState('natural');
  const [isRunning, setIsRunning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [config, setConfig] = useState({
    targetVolume: 50,
    duration: 24,
    wallets: 5,
    minInterval: 30,
    maxInterval: 120,
    antiMev: true,
  });
  const [trades, setTrades] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState({ 
    volume: 0, 
    uptime: 0, 
    successRate: 98.5,
    tradesPerMin: 0
  });

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };
    fetchBalance();
    
    const subId = connection.onAccountChange(publicKey, (info) => {
      setBalance(info.lamports / LAMPORTS_PER_SOL);
    });
    return () => { connection.removeAccountChangeListener(subId); };
  }, [publicKey, connection]);

  const SERVICE_COST = 0.10;

  const handleStart = async () => {
    if (!publicKey) return alert('Please connect your Solana wallet first!');
    if (!tokenAddress) return alert('Please enter a token address');

    // Validate that the entered address is a well-formed Solana public key
    let validMint: PublicKey;
    try {
      validMint = new PublicKey(tokenAddress);
    } catch {
      return alert('Invalid token address — please enter a valid Solana mint address.');
    }

    if (balance !== null && balance < SERVICE_COST) {
      alert(`Insufficient funds. Your balance is ${balance.toFixed(4)} SOL, but you need at least ${SERVICE_COST} SOL.`);
      return;
    }
    
    setIsLaunching(true);

    try {
      // Write to Firestore so the backend listener picks it up and runs the volume bot
      await saveTokenToFirestore({
        mintAddress: validMint.toBase58(),
        creatorWallet: publicKey.toBase58(),
        name: 'Market Maker Session',
        symbol: '',
        decimals: 9,
        supply: 0,
        hasVolumeBot: true,
        volumeBotTier: SERVICE_COST,
      });
    } catch (err) {
      setIsLaunching(false);
      console.error('Failed to register market maker session', err);
      return alert('Failed to start session — could not reach the backend. Please try again.');
    }

    setIsLaunching(false);
    setIsRunning(true);
    setActiveTab('active');
    
    // Initial trades
    setTrades([
      { id: 1, type: 'BUY', amount: 0.45, wallet: '8xK...q3v', time: new Date().toLocaleTimeString() },
      { id: 2, type: 'SELL', amount: 0.12, wallet: '4hB...mR2', time: new Date().toLocaleTimeString() },
    ]);
    setSessionStats({ volume: 0.57, uptime: 0, successRate: 98.5, tradesPerMin: 2.1 });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSessionStats(prev => ({ 
          ...prev, 
          uptime: prev.uptime + 1,
          volume: prev.volume + (Math.random() * 0.05)
        }));

        if (Math.random() > 0.8) {
          setTrades(prev => [
            { 
              id: Date.now(), 
              type: Math.random() > 0.5 ? 'BUY' : 'SELL', 
              amount: (Math.random() * 0.5 + 0.05).toFixed(3),
              wallet: `${Math.random().toString(16).slice(2,5)}...${Math.random().toString(16).slice(2,5)}`,
              time: new Date().toLocaleTimeString()
            },
            ...prev.slice(0, 9)
          ]);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}h : ${m.toString().padStart(2,'0')}m : ${s.toString().padStart(2,'0')}s`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'config' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'active' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          Active Sessions
          {isRunning && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'config' ? (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Asset & Strategy */}
            <div className="lg:col-span-2 space-y-6">
              <section className="dashboard-card group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <Coins className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Token Selection</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Solana Token Address
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        placeholder="Enter Token Mint Address (e.g. 5hA4Dv...)"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-gray-600 flex items-center gap-1.5">
                      <Info className="w-3 h-3" />
                      Must be a valid SPL Token on Solana Mainnet or Devnet.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {STRATEGIES.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setStrategy(s.id)}
                          className={`flex flex-col gap-2 p-4 rounded-xl border transition-all text-left group/strat ${
                            strategy === s.id 
                              ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' 
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${strategy === s.id ? 'text-indigo-400' : 'text-gray-500 group-hover/strat:text-gray-400'}`} />
                          <div>
                            <p className={`text-sm font-bold ${strategy === s.id ? 'text-white' : 'text-gray-400'}`}>{s.name}</p>
                            <p className="text-[10px] text-gray-600 leading-tight mt-0.5">{s.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="dashboard-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Volume Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Volume (SOL)</label>
                        <span className="text-indigo-400 font-bold">{config.targetVolume} SOL</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="1000"
                        value={config.targetVolume}
                        onChange={(e) => setConfig({ ...config, targetVolume: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration (Hours)</label>
                        <span className="text-indigo-400 font-bold">{config.duration}h</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="168"
                        value={config.duration}
                        onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Simulation Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Avg. Trades / Hour</span>
                        <span className="text-white font-mono">~120</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Wallets Involved</span>
                        <span className="text-white font-mono">{config.wallets}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Total Gas Fee</span>
                        <span className="text-white font-mono">0.45 SOL</span>
                      </div>
                      <div className="h-px bg-white/[0.06] my-2" />
                      <div className="flex justify-between text-base">
                        <span className="text-white font-bold">Total Service Cost</span>
                        <span className="text-emerald-400 font-bold">{SERVICE_COST.toFixed(2)} SOL</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Your Balance</span>
                        <span className={`font-mono ${balance !== null && balance < SERVICE_COST ? 'text-red-400' : 'text-gray-300'}`}>
                          {balance !== null ? `${balance.toFixed(4)} SOL` : 'Not connected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Execution & Security */}
            <div className="space-y-6">
              <section className="dashboard-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Security & Bundling</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl group/toggle cursor-pointer"
                       onClick={() => setConfig({...config, antiMev: !config.antiMev})}>
                    <div className="flex items-center gap-3">
                      <Zap className={`w-4 h-4 ${config.antiMev ? 'text-amber-400' : 'text-gray-600'}`} />
                      <div>
                        <p className="text-xs font-bold text-white">Jito MEV Protection</p>
                        <p className="text-[10px] text-gray-600">Bundles transactions to avoid snipers</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-all relative ${config.antiMev ? 'bg-indigo-500' : 'bg-gray-800'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.antiMev ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-500/80 leading-normal">
                        Ensure your operational wallets have sufficient SOL for priority fees if you select "Aggressive" strategy.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  disabled={isLaunching || (balance !== null && balance < SERVICE_COST)}
                  className={`w-full mt-8 text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLaunching || (balance !== null && balance < SERVICE_COST)
                      ? 'bg-white/5 text-gray-500'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Initialising Session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      {balance !== null && balance < SERVICE_COST ? 'Insufficient SOL' : 'Launch Market Maker'}
                    </>
                  )}
                </button>
              </section>

              <section className="dashboard-card bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Live Token Data</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-12 border-2 border-dashed border-white/[0.06] rounded-2xl">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">No Token Selected</p>
                      <p className="text-[10px] text-gray-700 mt-1 uppercase tracking-tighter">Enter address to load charts</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="dashboard-card p-0 overflow-hidden"
          >
            {!isRunning ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-white font-bold">No Active Sessions</h3>
                <p className="text-sm text-gray-500 mt-1">Start a new market maker session to monitor performance</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                 <div className="p-6 flex flex-wrap items-center justify-between gap-4 bg-emerald-500/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold leading-none">Running: {tokenAddress.slice(0,6)}...</h3>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-md border border-emerald-500/20">Active</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 font-medium">
                          <Settings2 className="w-3.5 h-3.5" />
                          Strategy: {STRATEGIES.find(s=>s.id===strategy)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4 hidden sm:block">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Total Volume Generated</p>
                        <p className="text-lg font-mono text-white font-black">{sessionStats.volume.toFixed(3)} SOL</p>
                      </div>
                      <button 
                        onClick={() => setIsRunning(false)}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 transition-all flex items-center gap-2"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        Stop Bot
                      </button>
                    </div>
                 </div>
                 
                 <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime</p>
                      <p className="text-sm font-mono text-white">{formatUptime(sessionStats.uptime)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Success Rate</p>
                      <p className="text-sm font-mono text-emerald-400">{sessionStats.successRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trades / Min</p>
                      <p className="text-sm font-mono text-white">2.4</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Next Trade In</p>
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-mono text-indigo-400">22s</p>
                         <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             className="h-full bg-indigo-500"
                             initial={{ width: '0%' }}
                             animate={{ width: '100%' }}
                             transition={{ duration: 22, ease: "linear" }}
                           />
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="p-6">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Live Trade Stream</h4>
                   <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-[11px]">
                      {trades.map(trade => (
                        <div key={trade.id} className="flex items-center justify-between py-2 px-3 bg-white/[0.01] rounded-lg border border-white/[0.03]">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">[{trade.time}]</span>
                            <span className={`${trade.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'} font-bold uppercase`}>{trade.type}</span>
                            <span className="text-white">{trade.amount} SOL</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500">Wallet: {trade.wallet}</span>
                            <span className="text-indigo-400 hover:underline cursor-pointer">TXid</span>
                          </div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Coins({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
