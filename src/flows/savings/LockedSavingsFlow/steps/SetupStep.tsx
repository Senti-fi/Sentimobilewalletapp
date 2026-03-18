/**
 * LockedSavingsFlow › Step 3 — Lock Setup
 * Figma frame: 220:1712 "Locked Savings" (Goal modal overlay)
 *
 * Bottom-sheet (546px) overlay on frozen IntroStep.
 * User taps a quick-amount pill (or selects amount), then confirms.
 * → onNext({ amount })
 * ← onBack() → LockSelection
 */
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { StepProps, LockedSavingsData } from '../../types';
import { useAppStore } from '../../../../store';

const EST_EARNINGS: Record<number, number> = {
  30: 12, 60: 24, 90: 38, 180: 80, 365: 180,
};

const QUICK_AMOUNTS = [100, 250, 500, 1000] as const;

function getPeriodBadge(days: number): string {
  return days === 365 ? '1 YEAR' : `${days} DAYS`;
}

export default function SetupStep({ data, onNext, onBack }: StepProps<LockedSavingsData>) {
  const balances = useAppStore(s => s.balances);
  const asset    = (data.asset ?? 'USDC') as 'USDC' | 'USDT' | 'SOL';
  const days     = data.lockPeriodDays || 90;
  const baseEst  = EST_EARNINGS[days] ?? 38;

  const [raw, setRaw] = useState(data.amount || '');

  const amount      = parseFloat(raw) || 0;
  const estEarnings = amount > 0 ? (amount / 500) * baseEst : 0;
  const totalUnlock = amount + estEarnings;

  function handleNext() {
    if (amount <= 0) return;
    onNext({ amount: raw });
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]" />

      {/* ── Bottom sheet: 546px ────────────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
        style={{ height: 546 }}
      >
        {/* Indicator pill */}
        <div className="flex justify-center mt-4">
          <div className="bg-[#8ac7ff] rounded-[8px] w-10 h-1 shrink-0" />
        </div>

        {/* Header row: ArrowLeft | Lock & Earn | period badge */}
        <div className="flex items-center justify-between px-6 mt-7">
          <button onClick={onBack} className="size-6 flex items-center justify-center shrink-0">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white">
            Lock &amp; Earn
          </p>
          <div className="bg-[#007bff] rounded-full px-3 py-2 shrink-0">
            <p className="text-white font-medium text-[10px] leading-normal">
              {getPeriodBadge(days)}
            </p>
          </div>
        </div>

        {/* "Amount to Lock" label */}
        <p className="text-center text-[#8ac7ff] font-normal text-[12px] leading-[16px] mt-8">
          Amount to Lock
        </p>

        {/* Amount input */}
        <div className="flex items-center justify-center mt-3">
          <span className="text-white font-bold text-[64px] tracking-[-0.64px] leading-normal">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="0.00"
            className="text-white font-bold text-[64px] tracking-[-0.64px] leading-normal bg-transparent outline-none placeholder:text-[#6b7280]"
            style={{ width: raw ? `${Math.max(raw.length, 4)}ch` : '4ch' }}
            aria-label="Amount to lock"
          />
        </div>

        {/* Available balance */}
        <p className="text-center text-[#8ac7ff] font-medium text-[14px] leading-[18px] mt-3">
          Available Balance:{' '}
          <span className="font-bold text-[#00e6ff]">
            ${balances[asset].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset}
          </span>
        </p>

        {/* Quick Amount Pills */}
        <div className="flex gap-2 px-6 mt-4">
          {QUICK_AMOUNTS.map(v => (
            <button
              key={v}
              onClick={() => setRaw(String(v))}
              className={`flex-1 flex items-center justify-center rounded-[12px] py-[13px] border border-[#262626] ${
                amount === v ? 'bg-[#007bff]' : 'bg-[#0a142f]'
              }`}
            >
              <span className="text-white font-medium text-[14px] leading-[18px]">
                {v >= 1000 ? '$1,000' : `$${v}`}
              </span>
            </button>
          ))}
        </div>

        {/* Goal Details Card */}
        <div className="mx-6 mt-4 bg-[#1a2540] rounded-[12px] p-4 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-medium text-[14px] leading-[18px]">
              Estimated Earnings
            </p>
            <p className="text-[#00e6ff] font-medium text-[14px] leading-[18px]">
              ≈ ${estEarnings.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">
              Total at Unlock
            </p>
            <p className="text-white font-medium text-[14px] leading-[20px]">
              {totalUnlock > 0
                ? `$${totalUnlock.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00'}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto px-6 pb-6">
          <button
            onClick={handleNext}
            disabled={amount <= 0}
            className="w-full bg-[#007bff] rounded-[12px] h-14 flex items-center justify-center disabled:opacity-50"
          >
            <span className="text-white font-bold text-[16px] leading-[24px]">
              Preview &amp; Confirm
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
