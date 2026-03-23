/**
 * LinkSuccessStep
 *
 * Figma 317:4626 — "Sent Successfully"
 * Success icon + summary (Sent To / Username / Amount / Status: Delivered)
 * + "Send More" + "Back to Wallet"
 */
import { Send } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

/** Derive a display name from a handle */
function displayName(handle: string) {
  return handle.replace(/^@/, '').replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface LinkSuccessStepProps extends StepProps<WithdrawFlowData> {
  onSendMore?: () => void;
}

export default function LinkSuccessStep({ data, onExit, onSendMore }: LinkSuccessStepProps) {
  const amount = parseFloat(data.amount || '0');
  const name   = displayName(data.recipient);

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* ── Success icon ─────────────────────────────────────── */}
        <div className="flex justify-center pt-[84px] pb-[24px]">
          <div
            className="bg-[#1a3a6b] rounded-full size-[80px] flex items-center justify-center"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0,230,255,0.3)' }}
          >
            <Send size={32} className="text-white" />
          </div>
        </div>

        {/* ── Title + subtitle ──────────────────────────────────── */}
        <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white text-center mb-[8px]">
          Sent Successfully
        </p>
        <p
          className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center mx-auto mb-[28px]"
          style={{ width: 248 }}
        >
          ${amount.toFixed(0)} {data.asset} has been sent to {name}.
        </p>

        {/* ── Summary card ─────────────────────────────────────── */}
        <div className="mx-6 bg-[#1a2540] border border-[#262626] rounded-[16px] p-[21px] flex flex-col gap-[16px]">

          {/* Sent To */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Sent To</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">{name}</p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Username */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Username</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">{data.recipient}</p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Amount */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Amount</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              ${amount.toFixed(2)} {data.asset}
            </p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Status</p>
            <p className="font-semibold text-[16px] leading-[20px] text-[#00e6ff]">Delivered</p>
          </div>

        </div>

      </div>

      {/* ── Pinned footer ─────────────────────────────────────── */}
      <div
        className="px-6 pb-8 pt-4 flex flex-col gap-[16px] shrink-0"
        style={{ background: 'rgba(10,20,47,0.95)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
        <button
          onClick={onSendMore}
          className="flex items-center justify-center py-[4px]"
        >
          <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center">
            Send More
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
