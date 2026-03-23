/**
 * WithdrawOptionsStep
 *
 * Bottom sheet matching the AddMoney modal layout (302:1580) exactly.
 * Layout: drag indicator → header + close → 3 option cards → Lucy banner.
 *
 * Figma icon assets (from 302:1580 design context):
 *   imgOnchain  — chain-link icon (same asset as Deposit Crypto card)
 *   imgFiat     — bank / pillar icon (same asset as Buy with Fiat card)
 *   imgChevron  — chevron-right 7.4 × 16 px
 *   imgCloseX   — close × 11.667 × 11.667 px
 */
import { X, ChevronRight, Link2, Building2 } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

export default function WithdrawOptionsStep({ onNext, onExit }: StepProps<WithdrawFlowData>) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]" />

      {/* ── Bottom sheet ────────────────────────────────────────────── */}
      <div className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
           style={{ height: 620 }}>

        {/* Drag indicator pill */}
        <div className="flex justify-center" style={{ marginTop: 16 }}>
          <div className="bg-[#8ac7ff] rounded-[8px]" style={{ width: 40, height: 4 }} />
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5" style={{ marginTop: 24 }}>
          <div className="flex flex-col gap-[4px]">
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.6px] text-white">
              Withdraw
            </p>
            <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
              How would you like to withdraw?
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

        {/* ── Cards stack ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-[12px] mx-5" style={{ marginTop: 24 }}>

          {/* ── Card 1: Onchain Withdrawal ──────────────────────── */}
          <button
            onClick={() => onNext({ method: 'onchain' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[16px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                {/* Narrow tall-pill icon container — matches Figma Deposit Crypto card */}
                <div
                  className="bg-[#1a3a6b] flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 29.23, height: 48 }}
                >
                  <Link2 size={16} className="text-[#8ac7ff]" />
                </div>
                <div className="flex flex-col gap-[3.25px] pr-[16px] self-stretch shrink-0" style={{ width: 238.25 }}>
                  <p className="font-bold text-[18px] leading-[18px] text-white">
                    Onchain Withdrawal
                  </p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Send crypto directly to an onchain wallet address.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
            {/* Badges */}
            <div className="flex gap-[8px]">
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                External Wallet
              </span>
              <span className="bg-[#0a142f] border border-[#262626] rounded-full px-[13px] py-[5px] font-medium text-[11px] leading-[16.5px] text-[#8ac7ff]">
                Any Network
              </span>
            </div>
          </button>

          {/* ── Card 2: Sell for Fiat ────────────────────────────── */}
          <button
            onClick={() => onNext({ method: 'fiat' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[16px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                {/* Narrow tall-pill icon container — matches Figma Buy with Fiat card */}
                <div
                  className="bg-[#0d2a4a] flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 33.23, height: 48 }}
                >
                  <Building2 size={20} className="text-[#8ac7ff]" />
                </div>
                <div className="flex flex-col gap-[3.25px] pr-[16px] self-stretch shrink-0" style={{ width: 234.25 }}>
                  <p className="font-bold text-[18px] leading-[18px] text-white">
                    Sell for Fiat
                  </p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Instantly receive cash in your bank account or e-wallet.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
          </button>

          {/* ── Card 3: Send via Link ────────────────────────────── */}
          <button
            onClick={() => onNext({ method: 'link' })}
            className="bg-[#1a2540] border border-[#262626] rounded-[24px] p-[21px] flex flex-col gap-[16px] items-start text-left w-full"
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex gap-[16px] items-start">
                {/* "@" icon — user spec: do not change this icon */}
                <div
                  className="bg-[#0d2a4a] rounded-full flex items-center justify-center shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <p className="font-bold text-[18px] leading-[18px] text-[#8ac7ff]">@</p>
                </div>
                <div className="flex flex-col gap-[3.25px] pr-[16px] self-stretch shrink-0" style={{ width: 219 }}>
                  <p className="font-bold text-[18px] leading-[18px] text-white">
                    Send via Link
                  </p>
                  <p className="font-normal text-[12px] leading-[19.5px] text-[#8ac7ff]">
                    Send to another Senti user using their @handle or payment link.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8ac7ff] shrink-0" />
            </div>
            {/* Badges */}
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

        </div>

        {/* ── Lucy banner ─────────────────────────────────────────── */}
        <div
          className="mx-5 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-[20px]"
          style={{ marginTop: 12 }}
        >
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            Send via Link is instant and fee-free. Best option for sending to other Senti users.
          </p>
        </div>

      </div>
    </div>
  );
}
