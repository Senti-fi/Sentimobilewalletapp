/**
 * PurchaseSuccessfulStep — Figma frame 302:2638 "purchase successful"
 *
 * Success icon, summary card, Lucy card, pinned footer.
 * "Back to Wallet" → onExit  |  "Deposit More" → restart (step 0)
 */
import type { StepProps } from '../../../savings/types';
import type { DepositFlowData } from '../../types';

// ── Figma asset URLs (302:2638) ──────────────────────────────────────
const imgCheckmark = 'https://www.figma.com/api/mcp/asset/ac2444b3-8619-462d-9b01-52cce5965288';
const imgArrowRight = 'https://www.figma.com/api/mcp/asset/35834fc3-e984-4224-921b-2f7f9a2ed08b';

export default function PurchaseSuccessfulStep({ data, onExit, onNext }: StepProps<DepositFlowData>) {
  const amountNum = parseFloat(data.amount || '100');
  const amountStr = `$${amountNum.toFixed(2)}`;

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* ── Success icon ───────────────────────────────────────── */}
        <div className="flex justify-center mt-[84px]">
          <div className="bg-[#1a3a6b] border border-[rgba(0,123,255,0.3)] rounded-full size-[80px] flex items-center justify-center shadow-[0px_0px_16px_4px_rgba(0,123,255,0.2)]">
            <div className="relative shrink-0" style={{ width: 26.85, height: 20.475 }}>
              <img alt="" className="absolute block max-w-none size-full" src={imgCheckmark} />
            </div>
          </div>
        </div>

        {/* ── Title ──────────────────────────────────────────────── */}
        <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white text-center mt-[48px] px-6">
          Purchase Successful
        </p>

        {/* ── Subtitle ───────────────────────────────────────────── */}
        <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center mt-[16px] w-[248px] mx-auto">
          {amountStr} has now been deposited in your wallet. It's ready to save or invest.
        </p>

        {/* ── Summary card ──────────────────────────────────────── */}
        <div className="mx-6 bg-[#1a2540] border border-[#262626] rounded-[16px] p-[21px] flex flex-col gap-[16px] mt-[28px]">

          {/* Amount */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Amount</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">{amountStr}</p>
          </div>

          <div className="bg-[#262626] h-px w-full" />

          {/* Received */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Received</p>
            <p className="font-semibold text-[16px] leading-[20px] text-[#00e6ff]">
              {amountNum.toFixed(0)} USDC
            </p>
          </div>

          <div className="bg-[#262626] h-px w-full" />

          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Status</p>
            <p className="font-semibold text-[16px] leading-[20px] text-[#00e6ff]">Completed</p>
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="mx-6 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[12px] px-[20px] py-[8px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] mt-[16px] mb-6">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <div className="flex-1 flex flex-col gap-[4px] min-w-0">
            <p className="font-normal text-[12px] leading-[16px] text-white">
              Your USDC is ready. Want me to suggest where to put it to work?
            </p>
            <div className="flex items-center gap-[4px]">
              <p className="font-medium text-[14px] leading-[18px] text-[#007bff]">Show me options</p>
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[18.75%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgArrowRight} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Pinned footer ─────────────────────────────────────────── */}
      <div className="bg-[rgba(10,20,47,0.95)] backdrop-blur-[2px] px-6 pb-8 pt-5 flex flex-col gap-[16px] shrink-0">
        <button
          onClick={() => onNext({ method: null, amount: '', paymentMethod: 'bank' })}
          className="flex items-center justify-center w-full"
        >
          <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center">
            Deposit More
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
