/**
 * ConfirmLinkStep
 *
 * Figma 317:4525 — "Confirm Transfer" summary card:
 * Asset / Amount / Recipient / Fee / Note / {recipient} Receives
 * + "Confirm & Send" / "Go Back"
 */
import { ArrowLeft } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

/** Derive a display name from a handle */
function displayName(handle: string) {
  return handle.replace(/^@/, '').replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function ConfirmLinkStep({ data, onNext, onBack }: StepProps<WithdrawFlowData>) {
  const amount  = parseFloat(data.amount || '0');
  const fee     = 0;
  const receive = amount - fee;
  const name    = displayName(data.recipient);

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="font-normal text-[20px] leading-[28px] text-white">Confirm Transfer</p>
        <div className="size-[24px] shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[28px]">

        {/* ── Summary card ─────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] p-[17px] flex flex-col gap-[12px]">

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
            <p className="font-normal text-[16px] leading-[24px] text-white">{data.recipient}</p>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Fee</p>
            <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              ${fee.toFixed(2)}
            </p>
          </div>

          {/* Note (only if provided) */}
          {data.note ? (
            <div className="flex items-center justify-between">
              <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Note</p>
              <p className="font-medium text-[16px] leading-[24px] text-white">
                "{data.note}"
              </p>
            </div>
          ) : null}

          {/* Divider */}
          <div className="border-t border-[#262626] h-px" />

          {/* {name} Receives */}
          <div className="flex items-center justify-between pt-[4px]">
            <p className="font-bold text-[16px] leading-[28px] text-white">{name} Receives</p>
            <p className="font-bold text-[18px] leading-[28px] text-[#00e6ff]">
              ${receive.toFixed(2)} {data.asset}
            </p>
          </div>

        </div>

      </div>

      {/* ── Footer actions ────────────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-[12px] shrink-0">
        <button
          onClick={() => onNext({})}
          className="bg-[#007bff] h-[56px] rounded-[12px] flex items-center justify-center w-full"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Confirm &amp; Send
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
