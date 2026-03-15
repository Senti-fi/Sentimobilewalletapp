import { useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  Plus,
  Send,
  Navigation,
  Grid2x2,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  House,
  PiggyBank,
  Wallet,
  BarChart3,
  CircleUserRound,
} from 'lucide-react';

type TabId = 'home' | 'save' | 'wallet' | 'invest' | 'account';

const assets = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    value: '$4,360.01',
    amount: '4,360.01 USDC',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    value: '$1,760.00',
    amount: '1,760.00 USDT',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    value: '$127.49',
    amount: '0.85 SOL',
  },
];

const activities = [
  {
    title: 'Added Funds',
    subtitle: 'Via Bank Transfer',
    amount: '+$750.00',
    date: 'Mar 3, 2026',
    positive: true,
    icon: ArrowDown,
  },
  {
    title: 'Withdrawn',
    subtitle: 'To External Wallet',
    amount: '-$200.00',
    date: 'Feb 28, 2026',
    positive: false,
    icon: ArrowUp,
  },
  {
    title: 'Sent via Link',
    subtitle: 'To @magnifico',
    amount: '-$50.00',
    date: 'Feb 25, 2026',
    positive: false,
    icon: ChevronRight,
  },
  {
    title: 'Crypto Deposit',
    subtitle: 'USDC',
    amount: '+$500.00',
    date: 'Feb 20, 2026',
    positive: true,
    icon: ArrowDown,
  },
];

const tabs = [
  { id: 'home' as const, label: 'Home', icon: House },
  { id: 'save' as const, label: 'Save', icon: PiggyBank },
  { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
  { id: 'invest' as const, label: 'Invest', icon: BarChart3 },
  { id: 'account' as const, label: 'Account', icon: CircleUserRound },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  return (
    <div className="absolute inset-0 mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-[#04133A] text-white">
      <main className="flex-1 overflow-y-auto px-6 pb-28 pt-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <header className="mb-8 flex items-center justify-between">
          <button className="p-1 text-white/95" aria-label="Back">
            <ArrowLeft className="h-6 w-6" strokeWidth={2.1} />
          </button>
          <h1 className="text-[31px] text-white">Wallet</h1>
          <button className="p-1 text-white/95" aria-label="History">
            <Clock3 className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <section className="mb-8 rounded-[22px] bg-[#1B88FF] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <p className="mb-2 text-[22px] text-[#BBDDFF]">Wallet Balance</p>
          <p className="mb-2 text-[58px] tracking-[-0.03em] text-white">$6,247.50</p>
          <p className="mb-6 text-[22px] text-[#D5EEFF]">
            Today&apos;s P&amp;L <span className="text-[#4DFF86]">+$146.30 (+ 2.4%)</span>
          </p>

          <div className="mb-4 flex items-center justify-center gap-1">
            <span className="h-1.5 w-4 rounded-full bg-[#4B29F8]" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          </div>

          <div className="flex items-center gap-2">
            {[
              { label: 'Deposit', icon: Plus },
              { label: 'Send', icon: Send },
              { label: 'Transfer', icon: Navigation },
            ].map((action) => (
              <button
                key={action.label}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#8CC7FF] text-[21px] text-white"
              >
                <action.icon className="h-4 w-4" strokeWidth={2} />
                {action.label}
              </button>
            ))}
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8CC7FF]" aria-label="More actions">
              <Grid2x2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-[43px] text-white">My Assets</h2>
          <div>
            {assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between border-b border-white/10 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123367] text-[13px] text-[#D8EDFF]">
                    {asset.symbol}
                  </div>
                  <div>
                    <p className="text-[34px] text-white">{asset.symbol}</p>
                    <p className="text-[23px] text-[#7AB8FF]">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[34px] text-white">{asset.value}</p>
                  <p className="text-[23px] text-[#7AB8FF]">{asset.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] bg-[#0C214A] px-5 pb-2 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[31px] text-white">Recent Activities</h2>
            <button className="text-[31px] text-[#35A8FF]">View All</button>
          </div>

          {activities.map((activity) => (
            <div key={activity.title} className="flex items-center justify-between border-b border-white/10 py-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    activity.positive ? 'bg-[#0C3E78]' : 'bg-[#3E1020]'
                  }`}
                >
                  <activity.icon
                    className={`h-5 w-5 ${activity.positive ? 'text-[#21D3FF]' : 'text-[#FF4B58]'}`}
                    strokeWidth={2.2}
                  />
                </div>
                <div>
                  <p className="text-[34px] text-white">{activity.title}</p>
                  <p className="text-[23px] text-[#7AB8FF]">{activity.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[34px] ${activity.positive ? 'text-[#13F0FF]' : 'text-[#FF5A63]'}`}>{activity.amount}</p>
                <p className="text-[23px] text-[#7AB8FF]">{activity.date}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <nav className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#071A42] px-3 pb-5 pt-2">
        <ul className="flex items-end justify-between">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-[62px] flex-col items-center gap-1 ${active ? 'text-[#15F3FF]' : 'text-[#95CAFF]'}`}
                >
                  <tab.icon className="h-4.5 w-4.5" strokeWidth={active ? 2.2 : 1.9} />
                  <span className="text-[13px]">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
