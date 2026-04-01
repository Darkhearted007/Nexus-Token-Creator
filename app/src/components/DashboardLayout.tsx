'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Coins,
  BarChart3,
  ArrowLeftRight,
  Settings,
  Rocket,
  Menu,
  X,
  Droplets,
  ChevronLeft,
  Airdrop,
  Zap,
  Building2,
  Droplets,
  Coins,
} from 'lucide-react';

const Airdrop = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14s1-1 3-1 3 1 3 1"/><path d="M4 18s1-1 3-1 3 1 3 1"/><path d="M4 22s1-1 3-1 3 1 3 1"/><path d="M18 14s1-1 3-1 3 1 3 1"/><path d="M18 18s1-1 3-1 3 1 3 1"/><path d="M18 22s1-1 3-1 3 1 3 1"/><path d="M9 2l3 3-3 3"/><path d="M15 2l-3 3 3 3"/><line x1="12" y1="5" x2="12" y2="12"/></svg>
);

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Token Creator', href: '/', icon: Coins },
  { label: 'Market Maker', href: '/dashboard/market-maker', icon: Zap },
  { label: 'OpenBook Market', href: '/dashboard/openbook', icon: Building2 },
  { label: 'Airdrop Tool', href: '/dashboard/airdrop', icon: Rocket },
  { label: 'Liquidity', href: 'https://raydium.io/liquidity/create/', icon: Droplets, external: true },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col
          bg-[var(--sidebar-bg)] backdrop-blur-2xl
          border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
          ${sidebarOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-20 border-b border-white/[0.06] ${collapsed ? 'px-4 justify-center' : 'px-6 justify-between'}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
              <Rocket className="w-4.5 h-4.5 text-white" />
            </div>
            {!collapsed && <span className="text-lg font-bold tracking-tight text-white">NexusLaunch</span>}
          </Link>
          {/* Collapse Toggle (desktop) */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="hidden lg:flex absolute -right-3 top-7 items-center justify-center w-6 h-6 rounded-full bg-gray-800 border border-white/10 text-gray-400 hover:text-white transition-all shadow-lg"
            >
              <ChevronLeft className="w-3 h-3 rotate-180" />
            </button>
          )}
          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} py-6 space-y-1 overflow-y-auto`}>
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3 px-3">Menu</p>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            const linkContent = (
              <>
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </>
            );

            if ('external' in item && item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  {linkContent}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                {linkContent}
              </Link>
            );
          })}
        </nav>

        {/* Liquidity Link */}
        {!collapsed && (
          <div className="px-4 pb-3">
            <a
              href="https://raydium.io/liquidity/create/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/[0.03] py-2.5 px-3 rounded-xl border border-white/[0.06] hover:border-emerald-500/30 hover:bg-emerald-500/5"
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-400" />
              Add Liquidity
            </a>
          </div>
        )}

        {/* Wallet */}
        <div className={`border-t border-white/[0.06] ${collapsed ? 'p-2' : 'p-4'}`}>
          <WalletMultiButtonDynamic
            className={`!bg-indigo-600/20 hover:!bg-indigo-600/30 !rounded-xl !h-10 !font-semibold !transition-all !border !border-indigo-500/20 !text-indigo-300 !text-xs ${collapsed ? '!px-2 !w-full !justify-center' : '!w-full'}`}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/5 text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">NexusLaunch</span>
          </Link>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
