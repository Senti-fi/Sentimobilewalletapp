/**
 * SendOptionsStep
 *
 * Bottom sheet (h-[480px]) overlaid on frozen WalletPage.
 * User chooses "Send via Link" (to @senti_user) or "Send to Address" (external).
 * Follows the same bottom-sheet pattern as AddMoneyStep (302:1389).
 */
import { X, ChevronRight } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { SendFlowData } from '../types';

export default function SendOptionsStep({ onNext, onExit }: StepProps<SendFlowData>) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]" />

      {/* ── Bottom sheet h-[480px] ──────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
        style={{ height: 480 }}
      >
        {/* Indicator pill */}
        <div className="flex justify-center" style={{ marginTop: 16 }}>
          <div className="bg-[#8ac7ff] rounded-[8px]" style={{ width: 40, height: 4 }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5" style={{ marginTop: 24 }}>
          <div className="flex flex-col gap-[4px]">
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.6px] text-white">
              Send
            </p>
            <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
              How would you like to send?
            </p>
          </div>
          {/* Close button */}
          <button
            onClick={onExit}
            className="bg-white rounded-full size-[40px] flex items-center justify-center shrink-0"
          >
            <X size={12} className="text-black" />
          </button>
        </div>

        {/* Cards stack */}
        <div className="flex flex-col gap-[12px] mx-5" style={{ marginTop: 24 }}>

          {/* Send via Link card */}
          <button
            onClick={() => onNext({ method: 'link' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[14px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                {/* Icon circle */}
                <div
                  className="bg-[#0d2a4a] rounded-full flex items-center justify-center shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <p className="font-bold text-[18px] leading-[18px] text-[#8ac7ff]">@</p>
                </div>
                <div className="flex flex-col gap-[4px] pr-4">
                  <p className="font-bold text-[18px] leading-[18px] text-white">Send via Link</p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Send to a Senti user by their{'\n'}@handle or payment link.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
            {/* Tags */}
            <div className="flex gap-[8px]">
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                @Handle
              </span>
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                Instant
              </span>
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-bold text-[9px] leading-[13.5px] tracking-[0.225px] uppercase text-[#00e6ff]">
                No Fees
              </span>
            </div>
          </button>

          {/* Send to Address card */}
          <button
            onClick={() => onNext({ method: 'address' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[14px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                <div
                  className="bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <p className="font-bold text-[18px] leading-[18px] text-[#8ac7ff]">⬡</p>
                </div>
                <div className="flex flex-col gap-[4px] pr-4">
                  <p className="font-bold text-[18px] leading-[18px] text-white">Send to Address</p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Send crypto to an external{'\n'}wallet address.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
            {/* Tags */}
            <div className="flex gap-[8px]">
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                External Wallet
              </span>
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                Any Network
              </span>
            </div>
          </button>
        </div>

        {/* Lucy card */}
        <div
          className="mx-5 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-4"
          style={{ marginTop: 12 }}
        >
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            Sending via Link is instant and fee-free for Senti users.
          </p>
        </div>
      </div>
    </div>
  );
}
