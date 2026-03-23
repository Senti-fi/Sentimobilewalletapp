/**
 * ConfirmWithdrawStep
 *
 * Figma 312:3661 — summary card, security warning, Lucy reassurance, confirm/go back.
 */
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

/** Truncate a long address for display: show first 6 + "..." + last 4 */
function truncate(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ConfirmWithdrawStep({ data, onNext, onBack }: StepProps<WithdrawFlowData>) {
  const amount = parseFloat(data.amount || '0');
  const fee    = 0;
  const receive = amount - fee;

  const handleConfirm = () => {
    onNext({});
  };

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="font-normal text-[20px] leading-[28px] text-white">Confirm Withdrawal</p>
        <div className="size-[24px] shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[28px]">

        {/* ── Summary card ─────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] p-[17px] flex flex-col gap-[12px] mb-[20px]">

          {/* Asset */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Asset</p>
            <p className="font-bold text-[16px] leading-[24px] text-white">{data.asset}</p>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Amount</p>
            <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              ${amount.toFixed(2)}
            </p>
          </div>

          {/* Recipient */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Recipient</p>
            <p className="font-normal text-[16px] leading-[24px] text-white">
              {truncate(data.address)}
            </p>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Network</p>
            <p className="font-normal text-[16px] leading-[24px] text-white">{data.network}</p>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Fee</p>
            <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              ${fee.toFixed(2)}
            </p>
          </div>

          {/* Processing Time */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Processing Time</p>
            <p className="font-medium text-[16px] leading-[24px] text-white">30 - 90 seconds</p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626] h-px" />

          {/* You'll Receive */}
          <div className="flex items-center justify-between pt-[4px]">
            <p className="font-bold text-[18px] leading-[28px] text-white">You'll Receive</p>
            <p className="font-bold text-[20px] leading-[28px] text-[#00e6ff]">
              ${receive.toFixed(2)} {data.asset}
            </p>
          </div>

        </div>

        {/* ── Security warning (plain, no background) ───────────── */}
        <div className="flex items-start gap-[12px] mb-[16px] px-[12px]">
          <AlertTriangle size={20} className="text-[#d1d5db] shrink-0 mt-[2px]" />
          <p className="font-normal text-[12px] leading-[19.5px] text-[#d1d5db]">
            This transaction cannot be reversed. Please verify the address.
          </p>
        </div>

        {/* ── Lucy reassurance ─────────────────────────────────── */}
        <div className="bg-[rgba(30,58,138,0.2)] border border-[rgba(59,130,246,0.3)] rounded-[12px] p-[17px] flex gap-[12px] items-center mb-[20px]">
          <div className="bg-[rgba(59,130,246,0.2)] rounded-full shrink-0 size-[32px] flex items-center justify-center">
            <p className="font-bold text-[14px] leading-[20px] text-white text-center">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-[#dbeafe] italic flex-1">
            "Address verified. This matches your frequent withdrawal patterns."
          </p>
        </div>

      </div>

      {/* ── Footer actions ────────────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-[12px] shrink-0">
        <button
          onClick={handleConfirm}
          className="bg-[#007bff] h-[56px] rounded-[12px] flex items-center justify-center w-full"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Confirm Withdrawal
          </p>
        </button>
        <button onClick={onBack} className="py-[8px] flex items-center justify-center w-full">
          <p className="font-semibold text-[14px] leading-[20px] text-[#8ac7ff] text-center">
            Go Back
          </p>
        </button>
      </div>

    </div>
  );
}
