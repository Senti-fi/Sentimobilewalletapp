/**
 * EnterAmountStep
 *
 * Amount input + asset selector + quick pills.
 * Matches the Buy with Fiat layout pattern (302:2380).
 */
import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { SendFlowData } from '../types';
import AmountInput from '../../../../components/AmountInput';
import { useAppStore } from '../../../../store';
import type { Asset } from '../../../../store';

const ASSETS: Asset[] = ['USDC', 'USDT', 'SOL'];

const ASSET_BG: Record<Asset, string> = {
  USDC: '#1a3a6b',
  USDT: '#0d2a4a',
  SOL:  '#0a2040',
};

export default function EnterAmountStep({ data, onNext, onBack }: StepProps<SendFlowData>) {
  const [raw,   setRaw]   = useState('');
  const [asset, setAsset] = useState<Asset>(data.asset ?? 'USDC');

  const balances        = useAppStore(s => s.balances);
  const availableBalance = balances[asset];

  const numVal      = parseFloat(raw) || 0;
  const canContinue = numVal > 0 && numVal <= availableBalance;

  const error = numVal > availableBalance && numVal > 0
    ? `Insufficient balance. Available: $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : undefined;

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="font-semibold text-[16px] leading-[20px] text-white">Send</p>
        <button className="relative size-[24px] shrink-0 flex items-center justify-center">
          <Clock size={18} className="text-[#8ac7ff]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* ── Recipient badge ───────────────────────────────────── */}
        <div className="flex justify-center mt-[20px]">
          <div className="bg-[#1a2540] border border-[#262626] rounded-full px-[16px] py-[8px] flex items-center gap-[8px]">
            <div className="bg-[#007bff] rounded-full size-[20px] flex items-center justify-center shrink-0">
              <p className="font-bold text-[10px] text-white leading-none">
                {(data.recipient ?? '?')[0]?.toUpperCase()}
              </p>
            </div>
            <p className="font-medium text-[12px] leading-[16px] text-[#8ac7ff]">
              To: {data.recipient || '—'}
            </p>
          </div>
        </div>

        {/* ── Amount input ──────────────────────────────────────── */}
        <div className="px-6 mt-[24px]">
          <AmountInput
            raw={raw}
            onChange={setRaw}
            label="How much would you like to send?"
            availableBalance={availableBalance}
            asset={asset}
            error={error}
          />
        </div>

        {/* ── Asset selector ────────────────────────────────────── */}
        <div className="px-6 mt-[28px]">
          <p className="font-bold text-[16px] leading-[24px] text-white mb-[12px]">
            Select Asset
          </p>
          <div className="flex flex-col gap-[0]">
            {ASSETS.map((a, i) => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={`flex items-center justify-between py-[14px] w-full text-left ${
                  i < ASSETS.length - 1 ? 'border-b border-[#1a2540]' : ''
                }`}
              >
                <div className="flex items-center gap-[12px]">
                  <div
                    className="size-[40px] rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: ASSET_BG[a] }}
                  >
                    <span className="font-['Manrope',sans-serif] font-extralight text-[10px] text-white">
                      {a}
                    </span>
                  </div>
                  <div>
                    <p className="font-['Manrope',sans-serif] font-extralight text-[14px] leading-[20px] text-white">
                      {a}
                    </p>
                    <p className="font-['Manrope',sans-serif] font-extralight text-[12px] leading-[16px] text-[#8ac7ff]">
                      ${balances[a].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {/* Radio indicator */}
                <div
                  className={`size-[20px] rounded-full border-2 flex items-center justify-center ${
                    asset === a ? 'border-[#007bff]' : 'border-[#3c5679]'
                  }`}
                >
                  {asset === a && (
                    <div className="size-[10px] rounded-full bg-[#007bff]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="mx-6 mt-[20px] mb-6 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-5">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            Sending {asset} is instant for Senti-to-Senti transfers. Always double-check before confirming.
          </p>
        </div>
      </div>

      {/* ── Continue button ───────────────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={() => onNext({ amount: raw, asset })}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[16px] py-[16px] flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Continue
          </p>
        </button>
      </div>

    </div>
  );
}
