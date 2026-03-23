/**
 * AddMoneyStep — Figma frame 302:1389 "payment method"
 *
 * Bottom sheet (h-572px) overlaid on frozen WalletPage.
 * User taps Deposit Crypto or Buy with Fiat card.
 */
import { X, ChevronRight, Link2, Building2 } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { DepositFlowData } from '../../types';

export default function AddMoneyStep({ onNext, onExit }: StepProps<DepositFlowData>) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]" />

      {/* ── Bottom sheet h-[572px] ──────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
        style={{ height: 572 }}
      >
        {/* Indicator pill */}
        <div className="flex justify-center" style={{ marginTop: 16 }}>
          <div className="bg-[#8ac7ff] rounded-[8px]" style={{ width: 40, height: 4 }} />
        </div>

        {/* Header */}
        <div
          className="flex items-start justify-between px-5"
          style={{ marginTop: 24 }}
        >
          <div className="flex flex-col gap-[4px]">
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.6px] text-white">
              Add Money
            </p>
            <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
              How would you like to add funds?
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

          {/* Deposit Crypto card */}
          <button
            onClick={() => onNext({ method: 'crypto' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[16px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                {/* Crypto icon */}
                <div
                  className="bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0"
                  style={{ width: 29.23, height: 48 }}
                >
                  <Link2 size={16} className="text-[#8ac7ff]" />
                </div>
                <div className="flex flex-col gap-[3px] pr-4">
                  <p className="font-bold text-[18px] leading-[18px] text-white">Deposit Crypto</p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Already have crypto? Deposit directly or{'\n'}receive from a Senti user.
                  </p>
                </div>
              </div>
              {/* Chevron */}
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
            {/* Tags */}
            <div className="flex gap-[8px]">
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                Deposit Crypto
              </span>
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                Receive via Link
              </span>
            </div>
          </button>

          {/* Buy with Fiat card */}
          <button
            onClick={() => onNext({ method: 'fiat' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[16px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                {/* Bank icon */}
                <div
                  className="bg-[#0d2a4a] rounded-full flex items-center justify-center shrink-0"
                  style={{ width: 33.23, height: 48 }}
                >
                  <Building2 size={20} className="text-[#8ac7ff]" />
                </div>
                <div className="flex flex-col gap-[3px] pr-4">
                  <p className="font-bold text-[18px] leading-[18px] text-white">Buy with Fiat</p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Use your bank, card, or third party{'\n'}provider to buy crypto.
                  </p>
                </div>
              </div>
              {/* Chevron */}
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
            {/* Tags — two rows */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-[8px]">
                <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] flex items-center gap-[6px]">
                  <span className="font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">Bank Transfer</span>
                  <span className="font-bold text-[9px] leading-[13.5px] tracking-[0.225px] uppercase text-[#00e6ff]">
                    Recommended
                  </span>
                </span>
                <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                  Visa/Mastercard
                </span>
              </div>
              <div className="flex">
                <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                  Stripe/MoonPay
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Lucy card */}
        <div
          className="mx-5 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-5"
          style={{ marginTop: 12 }}
        >
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            Bank Transfer has the lowest fees. Best option for most users.
          </p>
        </div>
      </div>
    </div>
  );
}
