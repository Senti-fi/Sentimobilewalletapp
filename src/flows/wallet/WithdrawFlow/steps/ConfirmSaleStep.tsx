/**
 * ConfirmSaleStep
 *
 * Confirm screen for the Sell for Fiat flow.
 * Matches the Figma summary card pattern (312:3661) adapted for fiat:
 * Asset / Amount to Sell / Exchange Rate / Fee / Bank Account /
 * Processing Time / divider / You'll Receive (NGN)
 */
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

const imgArrowLeft = 'https://www.figma.com/api/mcp/asset/7daeeac2-6a9e-40ef-a819-780a29490b46';
const imgWarnPlain = 'https://www.figma.com/api/mcp/asset/40fb678e-9cf6-4c8f-939b-a316f00ae4fd';

type Asset = 'USDC' | 'USDT' | 'SOL';
const RATES: Record<Asset, number> = {
  USDC: 1580,
  USDT: 1578,
  SOL:  220000,
};

export default function ConfirmSaleStep({ data, onNext, onBack }: StepProps<WithdrawFlowData>) {
  const asset       = data.asset as Asset;
  const amount      = parseFloat(data.amount || '0');
  const rate        = RATES[asset] ?? 1580;
  const nairaAmount = (amount * rate).toLocaleString('en-NG', { maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0">
          <div className="absolute inset-[18.75%_12.5%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
          </div>
        </button>
        <p className="font-normal text-[20px] leading-[28px] text-white">Confirm Sale</p>
        <div className="size-[24px] shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[28px]">

        {/* ── Summary card ─────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] p-[17px] flex flex-col gap-[12px] mb-[20px]">

          {/* Asset */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Asset</p>
            <p className="font-bold text-[16px] leading-[24px] text-white">{asset}</p>
          </div>

          {/* Amount to Sell */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Amount to Sell</p>
            <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">
              ${amount.toFixed(2)}
            </p>
          </div>

          {/* Exchange Rate */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Exchange Rate</p>
            <p className="font-normal text-[16px] leading-[24px] text-white">
              1 {asset} = ₦{rate.toLocaleString()}
            </p>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Fee</p>
            <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">$0.00</p>
          </div>

          {/* Bank Account */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Bank Account</p>
            <p className="font-normal text-[16px] leading-[24px] text-white">
              First Bank ••••7823
            </p>
          </div>

          {/* Processing Time */}
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Processing Time</p>
            <p className="font-medium text-[16px] leading-[24px] text-white">5-10 minutes</p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#262626] h-px" />

          {/* You'll Receive */}
          <div className="flex items-center justify-between pt-[4px]">
            <p className="font-bold text-[18px] leading-[28px] text-white">You'll Receive</p>
            <p className="font-bold text-[20px] leading-[28px] text-[#00e6ff]">
              ₦{nairaAmount}
            </p>
          </div>

        </div>

        {/* ── Rate lock warning ─────────────────────────────────── */}
        <div className="flex items-start gap-[12px] mb-[20px] px-[12px]">
          <div className="relative shrink-0 size-[20px] mt-[2px]">
            <img alt="" className="absolute block max-w-none size-full" src={imgWarnPlain} />
          </div>
          <p className="font-normal text-[12px] leading-[19.5px] text-[#d1d5db]">
            This rate is locked for 2 minutes. After confirmation this transaction cannot be reversed.
          </p>
        </div>

      </div>

      {/* ── Footer actions ────────────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-[12px] shrink-0">
        <button
          onClick={() => onNext({})}
          className="bg-[#007bff] h-[56px] rounded-[12px] flex items-center justify-center w-full"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Confirm Sale
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
