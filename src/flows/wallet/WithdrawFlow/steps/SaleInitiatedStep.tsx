/**
 * SaleInitiatedStep
 *
 * Success screen for the Sell for Fiat flow.
 * Matches the Figma 312:3768 pattern adapted for fiat:
 * success icon → "Sale Initiated" → subtitle → summary card → Lucy card → footer
 */
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

const imgCheckmark = 'https://www.figma.com/api/mcp/asset/9d782e27-ec0a-4870-90f9-7eb29a054889';

type Asset = 'USDC' | 'USDT' | 'SOL';
const RATES: Record<Asset, number> = {
  USDC: 1580,
  USDT: 1578,
  SOL:  220000,
};

export default function SaleInitiatedStep({ data, onExit }: StepProps<WithdrawFlowData>) {
  const asset       = data.asset as Asset;
  const amount      = parseFloat(data.amount || '0');
  const rate        = RATES[asset] ?? 1580;
  const nairaAmount = (amount * rate).toLocaleString('en-NG', { maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* ── Success icon ─────────────────────────────────────── */}
        <div className="flex justify-center pt-[84px] pb-[32px]">
          <div
            className="bg-[#1a3a6b] border border-[rgba(0,123,255,0.3)] rounded-full size-[80px] flex items-center justify-center"
            style={{ boxShadow: '0px 0px 16px 4px rgba(0,123,255,0.2)' }}
          >
            <div className="relative shrink-0" style={{ width: 26.85, height: 20.475 }}>
              <img alt="" className="absolute block max-w-none size-full" src={imgCheckmark} />
            </div>
          </div>
        </div>

        {/* ── Title + subtitle ──────────────────────────────────── */}
        <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white text-center mb-[8px]">
          Sale Initiated
        </p>
        <p
          className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center mx-auto mb-[28px]"
          style={{ width: 248 }}
        >
          Your {asset} is being converted and sent to your bank account.
        </p>

        {/* ── Summary card ─────────────────────────────────────── */}
        <div className="mx-6 bg-[#1a2540] border border-[#262626] rounded-[16px] p-[21px] flex flex-col gap-[16px] mb-[16px]">

          {/* Amount Sold */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Amount Sold</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              ${amount.toFixed(2)} {asset}
            </p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* You'll Receive */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">You'll Receive</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              ₦{nairaAmount}
            </p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Bank */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Bank</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">
              First Bank ••••7823
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
            Funds typically arrive within 5-10 minutes. You'll be notified once the payment lands.
          </p>
        </div>

      </div>

      {/* ── Pinned footer ─────────────────────────────────────── */}
      <div
        className="px-6 pb-8 pt-4 shrink-0"
        style={{ background: 'rgba(10,20,47,0.95)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
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
