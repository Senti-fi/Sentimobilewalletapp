/**
 * ConfirmSendStep
 *
 * Summary card + Lucy + Go Back / Confirm Send.
 * Mirrors ConfirmPurchaseStep (302:2548) exactly.
 */
import type { StepProps } from '../../../savings/types';
import type { SendFlowData } from '../types';

const imgArrowLeft = 'https://www.figma.com/api/mcp/asset/6650ad68-4610-445f-9b81-c92f5924a06c';

const METHOD_LABEL: Record<string, string> = {
  link:    'Send via Link',
  address: 'Send to Address',
};

export default function ConfirmSendStep({ data, onNext, onBack }: StepProps<SendFlowData>) {
  const amount     = parseFloat(data.amount || '0');
  const amountStr  = `$${amount.toFixed(2)} ${data.asset}`;
  const methodLbl  = METHOD_LABEL[data.method ?? 'link'];
  const isLink     = data.method === 'link';

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="absolute left-6 size-[24px]">
          <div className="absolute inset-[18.75%_12.5%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
          </div>
        </button>
        <p className="font-normal text-[20px] leading-[28px] text-white">Confirm Send</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6">

        {/* ── Summary card ──────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] p-[17px] flex flex-col gap-[12px] mt-[36px]">

          {/* To */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">To</p>
            <p className="font-['Manrope',sans-serif] font-bold text-[16px] leading-[24px] text-white">
              {data.recipient || '—'}
            </p>
          </div>

          {/* Asset */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">Asset</p>
            <p className="font-['Manrope',sans-serif] font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              {data.asset}
            </p>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">Amount</p>
            <p className="font-['Manrope',sans-serif] font-bold text-[16px] leading-[24px] text-white">
              {amountStr}
            </p>
          </div>

          {/* Method */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">Method</p>
            <p className="font-['Manrope',sans-serif] font-normal text-[16px] leading-[24px] text-white">
              {methodLbl}
            </p>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">Fee</p>
            <p className="font-['Manrope',sans-serif] font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              {isLink ? '$0.00' : '~$0.001'}
            </p>
          </div>

          {/* Processing time */}
          <div className="flex items-center justify-between">
            <p className="font-['Manrope',sans-serif] font-normal text-[14px] leading-[20px] text-[#94a3b8]">
              Processing
            </p>
            <p className="font-['Manrope',sans-serif] font-medium text-[16px] leading-[24px] text-white">
              {isLink ? 'Instant' : '~30 seconds'}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626]" />

          {/* Total */}
          <div className="flex items-center justify-between pt-[4px]">
            <p className="font-['Manrope',sans-serif] font-bold text-[18px] leading-[28px] text-white">
              Total Sent
            </p>
            <p className="font-['Manrope',sans-serif] font-bold text-[20px] leading-[28px] text-[#00e6ff]">
              {amountStr}
            </p>
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-5 mt-[16px]">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            {isLink
              ? 'Zero fees on this transfer. Funds will arrive instantly in their Senti wallet.'
              : 'A small network fee applies. Verify the address before confirming.'}
          </p>
        </div>

      </div>

      {/* ── Footer actions ────────────────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-[12px] shrink-0">
        <button onClick={onBack} className="flex items-center justify-center py-[8px] w-full">
          <p className="font-['Manrope',sans-serif] font-semibold text-[14px] leading-[20px] text-[#8ac7ff] text-center">
            Go Back
          </p>
        </button>
        <button
          onClick={() => onNext()}
          className="bg-[#007bff] h-[56px] rounded-[12px] flex items-center justify-center w-full"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Confirm Send
          </p>
        </button>
      </div>

    </div>
  );
}
