/**
 * LinkAmountStep
 *
 * Figma 317:4387 — Recipient card + asset selector + big amount input
 * + quick pills + optional note + "Preview Send" button.
 */
import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';
import { useAppStore } from '../../../../store';

type Asset = 'USDC' | 'USDT' | 'SOL';
const ASSETS: Asset[] = ['USDC', 'USDT', 'SOL'];
const QUICK_AMOUNTS   = ['$25', '$50', '$100', '$500'];

/** Derive a display name from a handle */
function displayName(handle: string) {
  return handle.replace(/^@/, '').replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** First letter of display name */
function initial(handle: string) {
  return displayName(handle).charAt(0).toUpperCase();
}

export default function LinkAmountStep({ data, onNext, onBack }: StepProps<WithdrawFlowData>) {
  const [asset,  setAsset]  = useState<Asset>(data.asset ?? 'USDC');
  const [amount, setAmount] = useState(data.amount === '0' ? '' : (data.amount ?? ''));
  const [note,   setNote]   = useState(data.note ?? '');

  const balances         = useAppStore(s => s.balances);
  const availableBalance = balances[asset];

  const canContinue = amount.trim().length > 0 && parseFloat(amount) > 0;

  const handleQuick = (label: string) => {
    setAmount(label.replace('$', ''));
  };

  const handlePreview = () => {
    onNext({ asset, amount: amount.trim(), note: note.trim() });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="font-semibold text-[16px] leading-[20px] text-white">Send via Link</p>
        <button className="relative size-[24px] shrink-0 flex items-center justify-center">
          <Clock size={18} className="text-[#8ac7ff]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[24px]">

        {/* ── Recipient card ────────────────────────────────────── */}
        <div className="bg-[#1a2540] rounded-[16px] p-[20px] flex flex-col items-center mb-[16px]">
          {/* Avatar */}
          <div className="bg-[#007bff] rounded-full size-[56px] flex items-center justify-center mb-[8px] shrink-0">
            <p className="font-bold text-[24px] leading-[32px] text-white text-center">
              {initial(data.recipient)}
            </p>
          </div>
          {/* Name */}
          <p className="font-bold text-[20px] leading-[28px] text-white mb-[4px]">
            {displayName(data.recipient)}
          </p>
          {/* Handle */}
          <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff] mb-[8px]">
            {data.recipient}
          </p>
          {/* Senti User badge */}
          <div className="bg-[#0a3040] rounded-full flex items-center gap-[4px] px-[12px] py-[4px]">
            <CheckCircle2 size={12} className="text-[#00e6ff]" />
            <p className="font-bold text-[10px] leading-[15px] tracking-[0.5px] uppercase text-[#00e6ff]">
              Senti User
            </p>
          </div>
        </div>

        {/* ── Asset selector ────────────────────────────────────── */}
        <div className="flex flex-col gap-[12px] items-center mb-[8px]">
          <p className="font-medium text-[14px] leading-[20px] text-[#8ac7ff] text-center">
            Select Asset
          </p>
          <div className="flex items-center gap-[8px] justify-center">
            {ASSETS.map(a => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={`px-[24px] py-[9px] rounded-full text-[14px] leading-[20px] text-white ${
                  asset === a
                    ? 'bg-[#007bff]'
                    : 'bg-[#1a2540] border border-[#374151]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="font-normal text-[14px] leading-[20px] text-[#9ca3af] text-center">
            Available balance:{' '}
            <span className="text-white">
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset}
            </span>
          </p>
        </div>

        {/* ── Big amount display ────────────────────────────────── */}
        <div className="flex flex-col items-center mb-[4px]" style={{ paddingTop: 16 }}>
          <p className="font-medium text-[14px] leading-[20px] text-[#8ac7ff] text-center mb-[8px]">
            Amount to Send
          </p>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="$0.00"
            className="bg-transparent font-bold text-[48px] leading-[48px] tracking-[-1.2px] text-white text-center placeholder:text-[#6b7280] outline-none w-full"
          />
        </div>

        {/* ── Quick pills ───────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-[8px] mb-[24px]">
          {QUICK_AMOUNTS.map(q => (
            <button
              key={q}
              onClick={() => handleQuick(q)}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-[21px] py-[9px]"
            >
              <p className="font-semibold text-[14px] leading-[20px] text-white text-center">
                {q}
              </p>
            </button>
          ))}
        </div>

        {/* ── Note ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[8px] mb-[24px]">
          <p className="font-semibold text-[14px] leading-[20px] text-[#8ac7ff]">
            Add a note (optional)
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What's this for?"
            rows={3}
            className="bg-[#1a2540] rounded-[8px] px-[12px] py-[8px] font-normal text-[16px] leading-[24px] text-white placeholder:text-[rgba(138,199,255,0.5)] outline-none resize-none w-full"
          />
        </div>

      </div>

      {/* ── Preview Send button ───────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={handlePreview}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[16px] py-[16px] flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Preview Send
          </p>
        </button>
      </div>

    </div>
  );
}
