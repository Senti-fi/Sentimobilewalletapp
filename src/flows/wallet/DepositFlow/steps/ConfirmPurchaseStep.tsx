/**
 * ConfirmPurchaseStep — Figma frame 302:2548 "confirm purchase"
 *
 * Summary card with purchase details, Lucy insight, Go Back + Confirm CTA.
 */
import type { StepProps } from '../../../savings/types';
import type { DepositFlowData } from '../../types';

// ── Figma asset URL (302:2548) ───────────────────────────────────────
const imgArrowLeft = 'https://www.figma.com/api/mcp/asset/6650ad68-4610-445f-9b81-c92f5924a06c';

const PAYMENT_LABELS: Record<string, string> = {
  bank:   'Bank Transfer',
  card:   'Visa / Mastercard',
  stripe: 'Stripe / MoonPay',
};

const FEE_LABELS: Record<string, string> = {
  bank:   '$0.00',
  card:   '1.5%',
  stripe: '0.99% - 1%',
};

export default function ConfirmPurchaseStep({ data, onNext, onBack }: StepProps<DepositFlowData>) {
  const amountNum = parseFloat(data.amount || '100');
  const amountStr = `$${amountNum.toFixed(2)} USD`;
  const payLabel  = PAYMENT_LABELS[data.paymentMethod] ?? 'Bank Transfer';
  const feeLabel  = FEE_LABELS[data.paymentMethod]     ?? '$0.00';
  const totalStr  = `$${amountNum.toFixed(2)}`;

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="absolute left-6 size-[24px]">
          <div className="absolute inset-[18.75%_12.5%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
          </div>
        </button>
        <p className="font-normal text-[20px] leading-[28px] text-white">Confirm Purchase</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6">

        {/* ── Summary card ──────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] p-[17px] flex flex-col gap-[12px] mt-[36px]">

          {/* You Pay */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">
              You Pay
            </p>
            <p className="font-['Manrope',sans-serif] font-bold text-[16px] leading-[24px] text-white">
              {amountStr}
            </p>
          </div>

          {/* You Receive */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">
              You Receive
            </p>
            <p className="font-['Manrope',sans-serif] font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              ≈ ${amountNum.toFixed(0)} USDC
            </p>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">
              Payment Method
            </p>
            <p className="font-['Manrope',sans-serif] font-normal text-[16px] leading-[24px] text-white">
              {payLabel}
            </p>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">
              Fee
            </p>
            <p className="font-['Manrope',sans-serif] font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              {feeLabel}
            </p>
          </div>

          {/* Processing Time */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">
              Processing Time
            </p>
            <p className="font-['Manrope',sans-serif] font-medium text-[16px] leading-[24px] text-white">
              30 - 90 seconds
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626]" />

          {/* Total Charged */}
          <div className="flex items-center justify-between pt-[4px]">
            <p className="font-['Manrope',sans-serif] font-bold text-[18px] leading-[28px] text-white">
              Total Charged
            </p>
            <p className="font-['Manrope',sans-serif] font-bold text-[20px] leading-[28px] text-[#00e6ff]">
              {totalStr}
            </p>
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-5 mt-[16px]">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            Zero fees on this purchase. Your USDC will arrive shortly.
          </p>
        </div>

      </div>

      {/* ── Footer actions (pinned) ──────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-[12px] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center py-[8px] w-full"
        >
          <p className="font-['Manrope',sans-serif] font-semibold text-[14px] leading-[20px] text-[#8ac7ff] text-center">
            Go Back
          </p>
        </button>
        <button
          onClick={() => onNext()}
          className="bg-[#007bff] h-[56px] rounded-[12px] flex items-center justify-center w-full"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Confirm Purchase
          </p>
        </button>
      </div>

    </div>
  );
}
