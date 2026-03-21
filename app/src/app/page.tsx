'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Image as ImageIcon, Sparkles, Flame, Check, Shield, Lock, Crosshair, PenSquare } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { buildMintTransaction } from '@/lib/solana/mint';
import { saveTokenToFirestore } from '@/lib/firebase/firestore';

const VOLUME_TIERS = [
  { label: 'None', cost: 0 },
  { label: 'Starter', cost: 0.1 },
  { label: 'Advanced', cost: 0.3 },
  { label: 'Pro', cost: 0.5 }
];

const SNIPER_TIERS = [
  { label: 'None', cost: 0 },
  { label: 'Basic', cost: 0.1 },
  { label: 'Aggressive', cost: 0.3 },
  { label: 'Whale', cost: 0.5 }
];

export default function TokenLaunchpad() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ 
    name: '', symbol: '', decimals: 9, supply: 1000000000, 
    website: '', twitter: '', telegram: '',
    revokeMint: false, revokeFreeze: false, revokeUpdate: false, volumeBotTier: 0, sniperBotTier: 0 
  });
  
  const authoritiesCost = (form.revokeMint ? 0.1 : 0) + (form.revokeFreeze ? 0.1 : 0) + (form.revokeUpdate ? 0.1 : 0);
  const totalCost = (0.1 + form.volumeBotTier + form.sniperBotTier + authoritiesCost).toFixed(2);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [successData, setSuccessData] = useState<{mint: string} | null>(null);

  const handleCreateToken = async () => {
    if (!publicKey) {
      alert('Please connect your Solana wallet first!');
      return;
    }
    try {
      setIsMinting(true);
      const { transaction, mintPath, mintKeypair } = await buildMintTransaction(
        connection,
        publicKey,
        form.decimals,
        form.supply,
        form.volumeBotTier,
        form.sniperBotTier,
        form.revokeMint,
        form.revokeFreeze,
        form.revokeUpdate
      );
      
      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair]
      });

      await connection.confirmTransaction(signature, 'processed');

      setSuccessData({ mint: mintPath });

      // Save token metadata to Web2 Backend (Firebase) for UI Indexing & Trending
      try {
        await saveTokenToFirestore({
          mintAddress: mintPath,
          creatorWallet: publicKey.toBase58(),
          name: form.name,
          symbol: form.symbol,
          decimals: form.decimals,
          supply: form.supply,
          hasVolumeBot: form.volumeBotTier > 0,
          volumeBotTier: form.volumeBotTier,
          sniperBotTier: form.sniperBotTier,
          totalRevenue: totalCost,
          website: form.website,
          twitter: form.twitter,
          telegram: form.telegram,
          mintRevoked: form.revokeMint,
          freezeRevoked: form.revokeFreeze,
          updateRevoked: form.revokeUpdate
        });
      } catch (fbErr) {
        console.warn('Firebase analytics save skipped:', fbErr);
      }

    } catch (err) {
      console.error(err);
      alert('Failed to mint token: ' + (err as Error).message);
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
            Launch Your Token
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Effortlessly deploy your next big idea on Solana with zero coding required.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-[23px] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <Coins className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Token Details</h2>
                  <p className="text-sm text-gray-400">Configure your smart contract parameters.</p>
                </div>
              </div>

              {successData && (
                <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">🚀 Token Deployed Successfully!</h3>
                  <p className="text-sm text-gray-300 mb-4 break-all">Mint Address: {successData.mint}</p>
                  <a
                    href={`https://raydium.io/swap/?outputCurrency=${successData.mint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-extrabold rounded-xl hover:scale-105 transition-transform shadow-lg"
                  >
                    Deposit Liquidity on Raydium
                  </a>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Token Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Nexus Coin"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Ticker Symbol</label>
                    <input 
                      type="text" 
                      placeholder="e.g. NEXUS"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.symbol}
                      onChange={(e) => setForm({...form, symbol: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Decimals</label>
                    <input 
                      type="number" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.decimals}
                      onChange={(e) => setForm({...form, decimals: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Total Supply</label>
                    <input 
                      type="number" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.supply}
                      onChange={(e) => setForm({...form, supply: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-4 text-gray-200">Social Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Website URL"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.website}
                      onChange={(e) => setForm({...form, website: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Twitter URL"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.twitter}
                      onChange={(e) => setForm({...form, twitter: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Telegram URL"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={form.telegram}
                      onChange={(e) => setForm({...form, telegram: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-4 text-gray-200">Minter Authorities (0.1 SOL Each)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      onClick={() => setForm({...form, revokeMint: !form.revokeMint})}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${form.revokeMint ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-black/30 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Shield className={`w-5 h-5 ${form.revokeMint ? 'text-indigo-400' : 'text-gray-500'}`} />
                        <span className="text-xs font-bold text-gray-400">+ 0.1 SOL</span>
                      </div>
                      <p className={`font-semibold text-sm ${form.revokeMint ? 'text-indigo-300' : 'text-gray-300'}`}>Revoke Mint</p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">Prevents you from minting more supply.</p>
                    </div>
                    
                    <div 
                      onClick={() => setForm({...form, revokeFreeze: !form.revokeFreeze})}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${form.revokeFreeze ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-black/30 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Lock className={`w-5 h-5 ${form.revokeFreeze ? 'text-indigo-400' : 'text-gray-500'}`} />
                        <span className="text-xs font-bold text-gray-400">+ 0.1 SOL</span>
                      </div>
                      <p className={`font-semibold text-sm ${form.revokeFreeze ? 'text-indigo-300' : 'text-gray-300'}`}>Revoke Freeze</p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">Required to build trust for pools.</p>
                    </div>

                    <div 
                      onClick={() => setForm({...form, revokeUpdate: !form.revokeUpdate})}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${form.revokeUpdate ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-black/30 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <PenSquare className={`w-5 h-5 ${form.revokeUpdate ? 'text-indigo-400' : 'text-gray-500'}`} />
                        <span className="text-xs font-bold text-gray-400">+ 0.1 SOL</span>
                      </div>
                      <p className={`font-semibold text-sm ${form.revokeUpdate ? 'text-indigo-300' : 'text-gray-300'}`}>Revoke Update</p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">Locks token metadata permanently.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Token Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 hover:border-indigo-500/50 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="text-sm text-gray-400 font-medium">Click to upload SVG, PNG, or JPG</p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-4 text-gray-200">Premium Add-ons</h3>
                  
                  {/* Volume Bot Tiers */}
                  <div className="mb-4 bg-black/30 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Flame className={`w-6 h-6 ${form.volumeBotTier > 0 ? 'animate-pulse' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-200">Volume Bot (Market Maker)</h3>
                        <p className="text-xs text-gray-400 mt-1">Pump your trading volume to hit DexScreener trending pages.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {VOLUME_TIERS.map((tier) => (
                        <button
                          key={tier.label}
                          onClick={() => setForm({...form, volumeBotTier: tier.cost})}
                          className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${form.volumeBotTier === tier.cost ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}
                        >
                          {tier.label}<br/>
                          <span className="text-[10px] font-normal">{tier.cost > 0 ? `+${tier.cost} SOL` : 'Free'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sniper Bot Tiers */}
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Crosshair className={`w-6 h-6 ${form.sniperBotTier > 0 ? 'animate-pulse' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-200">Bundle Sniper Bot</h3>
                        <p className="text-xs text-gray-400 mt-1">Snipe your own supply at block 0 to prevent MEV bot tracking.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {SNIPER_TIERS.map((tier) => (
                        <button
                          key={tier.label}
                          onClick={() => setForm({...form, sniperBotTier: tier.cost})}
                          className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${form.sniperBotTier === tier.cost ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}
                        >
                          {tier.label}<br/>
                          <span className="text-[10px] font-normal">{tier.cost > 0 ? `+${tier.cost} SOL` : 'Free'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCreateToken}
                  disabled={isMinting}
                  className="w-full mt-4 group relative inline-flex items-center justify-between px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]" />
                  <span className="relative flex items-center gap-2">
                    {isMinting ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/50 border-t-white"></span>
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {isMinting ? 'Deploying to Solana...' : 'Create Token & Deploy'}
                  </span>
                  <span className="relative bg-black/30 px-3 py-1 rounded-lg border border-white/10 shadow-inner group-hover:border-white/30 transition-colors">
                    {totalCost} SOL
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
