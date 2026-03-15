import { ArrowUpFromLine, Plus, Send, PiggyBank, ArrowDownToLine, ArrowRightLeft, LayoutGrid } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
}

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  type: string;
}

interface WalletPageProps {
  totalBalance: number;
  assets: Asset[];
  recentTransactions: Transaction[];
  onDeposit?: () => void;
  onSend?: () => void;
  onTransfer?: () => void;
  onViewAll?: () => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TxIcon({ type, amount }: { type: string; amount: number }) {
  const isCredit = amount >= 0;
  if (type === 'send') return <ArrowUpFromLine className="w-4 h-4 text-white" strokeWidth={2} />;
  if (type === 'savings') return <PiggyBank className="w-4 h-4 text-white" strokeWidth={1.5} />;
  if (type === 'vault') return <ArrowRightLeft className="w-4 h-4 text-white" strokeWidth={2} />;
  if (isCredit) return <ArrowDownToLine className="w-4 h-4 text-white" strokeWidth={2} />;
  return <Send className="w-4 h-4 text-white" strokeWidth={2} />;
}

function TxIconBg(type: string, amount: number): string {
  if (amount >= 0) return 'bg-[#1a3a6b]';
  if (type === 'send') return 'bg-[#2d1515]';
  if (type === 'vault') return 'bg-[#0d2a4a]';
  return 'bg-[#1a3a6b]';
}

export default function WalletPage({
  totalBalance,
  assets,
  recentTransactions,
  onDeposit,
  onSend,
  onTransfer,
  onViewAll,
}: WalletPageProps) {
  // Per-asset icon background colors matching Figma
  const assetIconBg: Record<string, string> = {
    USDC: 'bg-[#1a3a6b]',
    USDT: 'bg-[#0d2a4a]',
    SOL:  'bg-[#0a2040]',
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0a142f]">
      {/* Page header */}
      <div className="flex items-center justify-center px-6 py-5">
        <h1 className="text-white text-base font-semibold leading-5">Wallet</h1>
      </div>

      {/* Inline balance card — Figma-exact */}
      <div className="mx-6 mb-5 rounded-[20px] bg-[#007bff] h-[204px] overflow-hidden relative">
        {/* Wave decoration — matches Figma SVG wave pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] left-0 w-[88%] h-[135%] rounded-[50%] bg-white/[0.09]" />
          <div className="absolute -top-[10%] left-[87%] w-full h-[135%] rounded-[50%] bg-white/[0.09]" />
        </div>
        <div className="relative px-5 pt-5 pb-4 flex flex-col h-full">
          {/* Label */}
          <p className="text-white text-xs font-normal leading-4 mb-2">Wallet Balance</p>
          {/* Amount */}
          <p className="text-white text-[32px] font-bold leading-8 tracking-tight mb-1">
            ${fmt(totalBalance)}
          </p>
          {/* P&L subline */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-white text-[11px] font-semibold">Today's P&L</span>
            <span className="text-[#32fc65] text-[11px] font-semibold">+$146.30 (+ 2.4%)</span>
          </div>
          {/* Carousel dots */}
          <div className="flex items-center justify-center gap-1 my-3">
            <div className="w-3 h-1 rounded-full bg-[#2c14dd]" />
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
          {/* Action buttons row */}
          <div className="flex items-center justify-center gap-2 mt-auto">
            <button
              onClick={onDeposit}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs font-normal"
            >
              <Plus className="w-4 h-4" strokeWidth={2} /> Deposit
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs font-normal"
            >
              <ArrowUpFromLine className="w-4 h-4" strokeWidth={2} /> Send
            </button>
            <button
              onClick={onTransfer}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs font-normal"
            >
              <Send className="w-4 h-4" strokeWidth={2} /> Transfer
            </button>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full border border-[#b3fbff] text-white"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* My Assets */}
      <div className="px-6 mb-5">
        <p className="text-[18px] text-white font-normal leading-7 mb-4">My Assets</p>
        <div className="flex flex-col">
          {assets.map((asset, i) => (
            <div
              key={asset.id}
              className={`flex items-center justify-between py-4 ${
                i < assets.length - 1 ? 'border-b border-[#1a2540]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${assetIconBg[asset.symbol] ?? 'bg-[#1a3a6b]'} rounded-full flex items-center justify-center shrink-0`}>
                  <span className="text-white text-[10px] font-medium">{asset.symbol}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-normal leading-5">{asset.symbol}</p>
                  <p className="text-[#8ac7ff] text-xs leading-4">{asset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-normal leading-5">${fmt(asset.value)}</p>
                <p className="text-[#8ac7ff] text-xs leading-4">{fmt(asset.balance)} {asset.symbol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mx-6 mb-6">
        <div className="bg-[rgba(30,41,59,0.4)] rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm font-medium leading-[18px]">Recent Activities</span>
            <button onClick={onViewAll} className="text-[#007bff] text-sm font-medium leading-[18px]">
              View All
            </button>
          </div>
          <div className="flex flex-col">
            {recentTransactions.slice(0, 4).map((tx, i) => {
              const isCredit = tx.amount >= 0;
              return (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between py-4 ${
                    i < Math.min(recentTransactions.length, 4) - 1 ? 'border-b border-[#1a2540]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${TxIconBg(tx.type, tx.amount)}`}>
                      <TxIcon type={tx.type} amount={tx.amount} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-normal leading-5">{tx.merchant}</p>
                      <p className="text-[#8ac7ff] text-xs leading-4">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-normal leading-5 ${isCredit ? 'text-[#00e6ff]' : 'text-[#ff4444]'}`}>
                      {isCredit ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[#8ac7ff] text-xs leading-4">{tx.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
