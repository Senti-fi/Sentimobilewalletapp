/**
 * WithdrawInitiatedStep
 *
 * Figma 312:3768 — success icon, "Withdrawal Initiated", summary card, Lucy card, footer.
 */
import { Check } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

/** Truncate address for display */
function truncate(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}. . .${addr.slice(-4)}`;
}

export default function WithdrawInitiatedStep({ data, onExit }: StepProps<WithdrawFlowData>) {
  const amount = parseFloat(data.amount || '0');

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* ── Success icon ─────────────────────────────────────── */}
        <div className="flex justify-center pt-[84px] pb-[32px]">
          <div
            className="bg-[#1a3a6b] border border-[rgba(0,123,255,0.3)] rounded-full size-[80px] flex items-center justify-center"
            style={{ boxShadow: '0px 0px 16px 4px rgba(0,123,255,0.2)' }}
          >
            <Check size={24} className="text-white" />
          </div>
        </div>

        {/* ── Title + subtitle ──────────────────────────────────── */}
        <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white text-center mb-[8px]">
          Withdrawal Initiated
        </p>
        <p
          className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center mx-auto mb-[28px]"
          style={{ width: 248 }}
        >
          Your {data.asset} is on it's way. Transaction submitted to {data.network} network
        </p>

        {/* ── Summary card ─────────────────────────────────────── */}
        <div className="mx-6 bg-[#1a2540] border border-[#262626] rounded-[16px] p-[21px] flex flex-col gap-[16px] mb-[16px]">

          {/* Amount */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Amount</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              ${amount.toFixed(2)} {data.asset}
            </p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Destination */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Destination</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              {truncate(data.address)}
            </p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Status</p>
            <p className="font-semibold text-[16px] leading-[20px] text-[#ffb020]">Processing</p>
          </div>

        </div>

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="mx-6 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[12px] flex items-center gap-[16px] px-[20px] py-[8px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            You will be notified once the transaction is confirmed onchain
          </p>
        </div>

      </div>

      {/* ── Pinned footer ─────────────────────────────────────── */}
      <div
        className="px-6 pb-8 pt-4 flex flex-col gap-[16px] shrink-0"
        style={{ background: 'rgba(10,20,47,0.95)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
        <button className="flex items-center justify-center py-[4px]">
          <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center">
            View Transaction
          </p>
        </button>
        <button
          onClick={onExit}
          className="bg-[#007bff] h-[56px] rounded-[12px] flex items-center justify-center w-full"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Back to Wallet
          </p>
        </button>
      </div>

    </div>
  );
}
