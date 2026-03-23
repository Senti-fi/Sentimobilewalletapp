/**
 * WalletPage
 * Figma frame: 295:326 "Wallet"
 *
 * Sections:
 *   1. Header — back arrow, title, clock-history icon
 *   2. Wallet Balance hero card — balance, today's P&L, action pills
 *   3. My Assets — USDC, USDT, SOL rows
 *   4. Recent Activities — transaction rows
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import FlowPortal from '../../flows/savings/FlowPortal';
import SendFlow from '../../flows/wallet/SendFlow';
import PayFlow from '../../flows/wallet/PayFlow';
import TransactionList from '../../components/TransactionList';
import { useAppStore } from '../../store';
import { getWalletBalance } from '../../store/selectors';
import { getTransactionsByContext } from '../../data/transactionUtils';


// ── Asset display config ─────────────────────────────────────────────
// Visual metadata only — balances always come from the store.
// SOL_PRICE is used only to back-calculate display token quantity from the
// stored USD equivalent (balances.SOL is always in USD, not token units).
const SOL_PRICE = 150; // USD per SOL — display only, not used in any calculation

const ASSET_CONFIG = [
  { ticker: 'USDC' as const, name: 'USD Coin', circleBg: '#1a3a6b' },
  { ticker: 'USDT' as const, name: 'Tether',   circleBg: '#0d2a4a' },
  { ticker: 'SOL'  as const, name: 'Solana',   circleBg: '#0a2040' },
];

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format the token quantity string for a given asset. */
function tokenQty(ticker: 'USDC' | 'USDT' | 'SOL', usdBalance: number): string {
  if (ticker === 'SOL') {
    const qty = usdBalance / SOL_PRICE;
    return `${qty.toFixed(2)} SOL`;
  }
  // USDC and USDT are 1:1 with USD
  return `${fmtUsd(usdBalance)} ${ticker}`;
}

// ── Sub-components ────────────────────────────────────────────────────

function AssetRow({
  ticker,
  name,
  circleBg,
  usdBalance,
  last,
}: {
  ticker: 'USDC' | 'USDT' | 'SOL';
  name: string;
  circleBg: string;
  usdBalance: number;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between pt-[16px] pb-[17px] shrink-0 w-full ${
        !last ? 'border-b border-[#1a2540]' : ''
      }`}
    >
      {/* Left: circle + name */}
      <div className="flex gap-[12px] items-center shrink-0">
        <div
          className="size-[40px] rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: circleBg }}
        >
          <span className="font-['Manrope',sans-serif] font-extralight text-[10px] leading-[15px] text-white">
            {ticker}
          </span>
        </div>
        <div className="flex flex-col items-start shrink-0">
          <p className="font-['Manrope',sans-serif] font-extralight text-[14px] leading-[20px] text-white">
            {ticker}
          </p>
          <p className="font-['Manrope',sans-serif] font-extralight text-[12px] leading-[16px] text-[#8ac7ff]">
            {name}
          </p>
        </div>
      </div>
      {/* Right: usd + token qty */}
      <div className="flex flex-col items-end shrink-0">
        <p className="font-['Manrope',sans-serif] font-extralight text-[14px] leading-[20px] text-white">
          ${fmtUsd(usdBalance)}
        </p>
        <p className="font-['Manrope',sans-serif] font-extralight text-[12px] leading-[16px] text-[#8ac7ff]">
          {tokenQty(ticker, usdBalance)}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function WalletPage() {
  const navigate = useNavigate();
  const [showPay,  setShowPay]  = useState(false);
  const [showSend, setShowSend] = useState(false);

  const balances     = useAppStore(s => s.balances);
  const transactions = useAppStore(s => s.transactions);
  const homeTxs      = getTransactionsByContext(transactions, 'home');

  const walletBalance = getWalletBalance(balances);

  return (
    <>
    <div className="flex flex-col bg-[#0a142f] pb-6">

      {/* ── 1. Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-0">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[24px] shrink-0">
          <ArrowLeft size={20} strokeWidth={2} className="text-white" />
        </button>
        <p className="font-semibold text-[16px] leading-[20px] text-white">Wallet</p>
        <button className="relative size-[24px] shrink-0 flex items-center justify-center">
          <Clock size={18} className="text-[#8ac7ff]" />
        </button>
      </div>

      {/* ── 2. Wallet Balance Card ────────────────────────────────── */}
      <div
        className="mx-6 mt-[34px] relative bg-[#007bff] rounded-[20px] overflow-hidden shrink-0"
        style={{ height: 204 }}
      >
        {/* Wave BG */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            <path d="M-20,60 C60,30 140,90 220,55 C300,20 360,75 420,55 L420,220 L-20,220 Z" fill="white" opacity="0.08"/>
            <path d="M-20,90 C80,65 170,105 260,80 C340,58 380,90 420,80 L420,220 L-20,220 Z" fill="white" opacity="0.05"/>
          </svg>
        </div>

        {/* Balance info — top-left */}
        <div className="absolute left-5 top-5 flex flex-col gap-[8px] w-[200px]">
          <p className="font-normal text-[12px] leading-[16px] text-white">
            Wallet Balance
          </p>
          <p className="font-bold text-[32px] leading-[32px] tracking-[-0.64px] text-white">
            ${fmtUsd(walletBalance)}
          </p>
          <div className="flex items-center gap-[3px] font-semibold text-[12px] leading-[16px] whitespace-nowrap">
            <span className="text-white">Today&apos;s P&amp;L</span>
            <span className="text-[#32fc65]">+$146.30 (+ 2.4%)</span>
          </div>
        </div>

        {/* Available to spend — subtle context label */}
        <p
          className="absolute left-5 font-normal text-[11px] leading-[14px] whitespace-nowrap"
          style={{ top: 118, color: 'rgba(255,255,255,0.60)' }}
        >
          Available to spend · ${fmtUsd(balances.USDC)}
        </p>

        {/* Action buttons — Pay (primary) + Send (secondary) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[12px]"
          style={{ bottom: 18, width: 305 }}
        >
          {/* Pay — primary */}
          <button
            onClick={() => setShowPay(true)}
            className="flex-1 flex items-center justify-center rounded-[22px] py-[10px]"
            style={{ background: 'rgba(255,255,255,0.22)' }}
          >
            <span className="font-semibold text-[13px] leading-[16px] text-white">
              Pay
            </span>
          </button>
          {/* Send — secondary */}
          <button
            onClick={() => setShowSend(true)}
            className="flex-1 flex items-center justify-center rounded-[22px] py-[10px] border border-[rgba(255,255,255,0.45)]"
          >
            <span className="font-normal text-[13px] leading-[16px] text-white">
              Send
            </span>
          </button>
        </div>
      </div>

      {/* ── 3. My Assets ──────────────────────────────────────────── */}
      <div className="mx-6 mt-6 flex flex-col gap-[16px]">
        <p className="font-['Manrope',sans-serif] font-extralight text-[18px] leading-[28px] text-white">
          My Assets
        </p>
        <div className="flex flex-col">
          {ASSET_CONFIG.map((cfg, i) => (
            <AssetRow
              key={cfg.ticker}
              ticker={cfg.ticker}
              name={cfg.name}
              circleBg={cfg.circleBg}
              usdBalance={balances[cfg.ticker]}
              last={i === ASSET_CONFIG.length - 1}
            />
          ))}
        </div>
      </div>

      {/* ── 4. Recent Activities ─────────────────────────────────── */}
      <div className="mx-6 mt-9 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden p-[20px] flex flex-col gap-[4px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between shrink-0 w-full whitespace-nowrap mb-[4px]">
          <p className="font-medium text-[14px] leading-[18px] text-white">Recent Activities</p>
          <p className="font-medium text-[14px] leading-[18px] text-[#007bff]">View All</p>
        </div>
        <TransactionList transactions={homeTxs} limit={5} />
      </div>

    </div>

      {/* ── Pay flow (Senti Pay → primary) ────────────────────── */}
      {showPay && (
        <FlowPortal>
          <PayFlow onExit={() => setShowPay(false)} />
        </FlowPortal>
      )}

      {/* ── Send flow (Senti Pay → secondary) ─────────────────── */}
      {showSend && (
        <FlowPortal>
          <SendFlow onExit={() => setShowSend(false)} />
        </FlowPortal>
      )}
    </>
  );
}
