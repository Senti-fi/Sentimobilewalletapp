/**
 * DepositAmountStep
 *
 * Figma 284:1549 — bottom sheet portion (modal portion).
 * Rendered as `absolute bottom-0 left-0 right-0` inside the portal overlay.
 *
 * Layout:
 *   Handle pill → Header (ArrowLeft + vault name + risk badge)
 *   → "Deposit Amount" label → Big $X.XX amount display (editable)
 *   → Available Balance → Quick-amount pills ($100 $250 $500 $1,000)
 *   → Projected Earnings card (Daily / Monthly / Annual + disclaimer)
 *   → "Preview Deposit" CTA
 */
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { DepositStepProps } from '../types';
import AmountInput from '../../../../components/AmountInput';
import { useAppStore } from '../../../../store';

const QUICK_AMOUNTS = [100, 250, 500, 1000] as const;

export default function DepositAmountStep({
  data,
  onNext,
  onBack,
  vault,
}: DepositStepProps) {
  const [raw, setRaw] = useState(
    data.amount !== '0' ? data.amount : '',
  );

  const balances         = useAppStore(s => s.balances);
  const availableBalance = balances[vault.asset];

  const amt     = parseFloat(raw) || 0;
  const daily   = amt * vault.apy / 100 / 365;
  const monthly = daily * 30;
  const annual  = amt * vault.apy / 100;

  const belowMin   = amt > 0 && amt < vault.minDeposit;
  const overBalance = amt > availableBalance;
  const canContinue = amt >= vault.minDeposit && !overBalance;

  const error = overBalance
    ? `Insufficient balance. Available: $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${vault.asset}`
    : belowMin
    ? `Minimum deposit is $${vault.minDeposit}`
    : undefined;

  const riskBg = vault.riskLabel === 'LOW' ? 'bg-[#007bff]' : 'bg-[#f59e0b]';

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px]">

      {/* ── Handle pill ─────────────────────────────────────────────── */}
      <div className="bg-[#8ac7ff] h-[4px] w-[40px] rounded-[8px] mx-auto mt-[16px]" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-[16px] px-[24px]">
        <button onClick={onBack} className="relative shrink-0 size-[24px] flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="font-bold text-[24px] leading-[32px] text-white tracking-[-0.48px]">
          {vault.name}
        </p>
        <div className={`${riskBg} px-[8px] py-[2px] rounded-[9999px]`}>
          <p className="font-medium text-[10px] leading-[normal] text-white">
            {vault.riskLabel}
          </p>
        </div>
      </div>

      {/* ── Amount input ────────────────────────────────────────────── */}
      <div className="mt-[20px] px-[24px]">
        <AmountInput
          raw={raw}
          onChange={setRaw}
          size="xl"
          label="Deposit Amount"
          availableBalance={availableBalance}
          asset={vault.asset}
          quickAmounts={[...QUICK_AMOUNTS]}
          error={error}
        />
      </div>

      {/* ── Projected Earnings card ──────────────────────────────────── */}
      {amt > 0 && (
        <div className="bg-[#1a2540] rounded-[12px] mx-[24px] mt-[16px] p-[16px] flex flex-col gap-[12px]">

          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Daily Earnings</p>
            <p className="font-medium text-[14px] leading-[18px] text-[#00e6ff]">
              ${daily.toFixed(2)}/day
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Monthly Earnings</p>
            <p className="font-medium text-[14px] leading-[18px] text-[#00e6ff]">
              ${monthly.toFixed(2)}/month
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Annual Earnings</p>
            <p className="font-medium text-[14px] leading-[18px] text-[#00e6ff]">
              ${annual.toFixed(2)}/year
            </p>
          </div>

          <p className="font-medium italic text-[10px] leading-[normal] text-[#6b7280]">
            Based on current {vault.apy}% APY. Actual earnings may vary.
          </p>
        </div>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div className="px-[24px] mt-[16px] pb-[24px]">
        <button
          onClick={() => { if (canContinue) onNext({ amount: raw }); }}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[12px] h-[56px] w-full shadow-[0px_10px_15px_-3px_rgba(0,123,255,0.2),0px_4px_6px_-4px_rgba(0,123,255,0.2)] disabled:opacity-40"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Preview Deposit
          </p>
        </button>
      </div>

    </div>
  );
}
