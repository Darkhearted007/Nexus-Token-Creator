'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';

export default function AirdropPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const recipientList = recipients.split('\n').filter(r => r.trim().length > 0);
  const totalCost = (recipientList.length * 0.002).toFixed(4); // Simulated rent/fee

  const handleAirdrop = () => {
    if (!tokenAddress || recipientList.length === 0) return;
    setIsProcessing(true);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="relative min-h-full">
      {/* Background Orbs */}
      <div className="fixed top-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-600/[0.05] rounded-full blur-[150px] -z-10 animate-orb-drift pointer-events-none" />
      <div className="fixed bottom-[20%] left-[5%] w-[400px] h-[400px] bg-indigo-500/[0.05] rounded-full blur-[120px] -z-10 animate-orb-drift pointer-events-none" style={{ animationDelay: '-7s' }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">
          Nexus Airdrop Tool
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Distribute your token to multiple wallets simultaneously with minimal fees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          <section className="dashboard-card">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recipients & Distribution
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Token to Airdrop</label>
                <input
                  type="text"
                  placeholder="Enter Token Mint Address"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none border-indigo-500/40 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block font-mono">
                    Recipient Wallets (One per line)
                  </label>
                  <span className="text-[10px] text-gray-600 font-bold">
                    {recipientList.length} WALLETS DETECTED
                  </span>
                </div>
                <textarea
                  placeholder="Address1, Amount1&#10;Address2, Amount2&#10;Address3, Amount3"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full h-64 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-4 text-sm font-mono text-indigo-300 placeholder:text-gray-700 focus:outline-none border-indigo-500/40 transition-all resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="dashboard-card">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Distribution Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipients</span>
                <span className="text-white font-mono">{recipientList.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Est. Network Fees</span>
                <span className="text-white font-mono">{totalCost} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Processing Mode</span>
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Parallel (Fast)</span>
              </div>
              <div className="h-px bg-white/[0.06] my-2" />
              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">Total Est. Cost</span>
                <span className="text-emerald-400 font-bold">{totalCost} SOL</span>
              </div>
            </div>

            <button 
              disabled={isProcessing || recipientList.length === 0}
              onClick={handleAirdrop}
              className={`w-full mt-8 h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl ${
                isProcessing 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Airdrop...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Execute Airdrop
                </>
              )}
            </button>
          </section>

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="dashboard-card border-indigo-500/30"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Progress</span>
                <span className="text-xs font-mono text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-3 text-center">
                Processing batch {Math.min(Math.ceil(progress / 20), 5)} of 5...
              </p>
            </motion.div>
          )}

          <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
             <div className="flex items-center gap-3">
               <Info className="w-4 h-4 text-indigo-400" />
               <p className="text-xs font-bold text-white uppercase tracking-tighter">Pro Tip</p>
             </div>
             <p className="text-[11px] text-gray-500 leading-relaxed">
               You can upload a CSV file with your wallet list to automate large distributions.
             </p>
             <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors flex items-center gap-1">
               Download Template <ChevronRight className="w-3 h-3" />
             </button>
          </section>
        </div>
      </div>
    </div>
  );
}
