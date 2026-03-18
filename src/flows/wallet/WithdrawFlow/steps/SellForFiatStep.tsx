/**
 * SellForFiatStep
 *
 * Figma 312:3485 — Asset selector + big amount input + exchange rate card
 * + bank account selector + Lucy nudge + "Preview Sale" button.
 */
import { useState } from 'react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';
import { useAppStore } from '../../../../store';

const imgArrowLeft = 'https://www.figma.com/api/mcp/asset/45be0d0e-de7a-4850-8751-865476ff472a';
const imgClock     = 'https://www.figma.com/api/mcp/asset/0a3f33c7-a884-4874-aef7-036fd6643938';
const imgBankIcon  = 'https://www.figma.com/api/mcp/asset/defec878-3317-4471-81e8-9ce874364261';
const imgInfoIcon  = 'https://www.figma.com/api/mcp/asset/e91dfa42-d9fc-4cb4-9296-d05bd6e23e78';

type Asset = 'USDC' | 'USDT' | 'SOL';
const ASSETS: Asset[] = ['USDC', 'USDT', 'SOL'];
const QUICK_AMOUNTS   = ['$25', '$50', '$100', '$500'];

/** Exchange rates to NGN (hardcoded placeholder) */
const RATES: Record<Asset, number> = {
  USDC: 1580,
  USDT: 1578,
  SOL:  220000,
};

export default function SellForFiatStep({ data, onNext, onBack }: StepProps<WithdrawFlowData>) {
  const [asset,  setAsset]  = useState<Asset>(data.asset ?? 'USDC');
  const [amount, setAmount] = useState(data.amount === '0' ? '' : (data.amount ?? ''));

  const balances         = useAppStore(s => s.balances);
  const availableBalance = balances[asset];

  const numericAmount = parseFloat(amount) || 0;
  const nairaAmount   = (numericAmount * RATES[asset]).toLocaleString('en-NG', { maximumFractionDigits: 0 });
  const canContinue   = numericAmount > 0;

  const handlePreview = () => {
    onNext({ asset, amount: amount.trim() });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0">
          <div className="absolute inset-[18.75%_12.5%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
          </div>
        </button>
        <p className="font-semibold text-[16px] leading-[20px] text-white">Sell for Fiat</p>
        <button className="relative size-[24px] shrink-0">
          <div className="absolute inset-[9.36%_9.36%_9.43%_9.43%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgClock} />
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[24px]">

        {/* ── Select Asset ──────────────────────────────────────── */}
        <div className="flex flex-col gap-[12px] mb-[20px]">
          <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">Select Asset</p>
          <div className="flex items-center gap-[8px]">
            {ASSETS.map(a => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={`px-[24px] py-[9px] rounded-full text-[14px] leading-[20px] text-white ${
                  asset === a
                    ? 'bg-[#007bff]'
                    : 'bg-[#1a2540] border border-[#374151]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="font-normal text-[14px] leading-[20px] text-[#9ca3af]">
            Available balance:{' '}
          <span className="text-white">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset}
          </span>
          </p>
        </div>

        {/* ── Big amount input ──────────────────────────────────── */}
        <div className="flex flex-col items-center mb-[4px]">
          <p className="font-medium text-[14px] leading-[20px] text-[#8ac7ff] text-center mb-[8px]">
            How much would you like to Sell?
          </p>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="$0.00"
            className="bg-transparent font-bold text-[48px] leading-[48px] tracking-[-1.2px] text-white text-center placeholder:text-[#6b7280] outline-none w-full"
          />
          <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] text-center mt-[8px]">
            You'll receive approximately ₦{numericAmount > 0 ? nairaAmount : '0'}
          </p>
        </div>

        {/* ── Quick pills ───────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-[8px] mb-[24px] mt-[16px]">
          {QUICK_AMOUNTS.map(q => (
            <button
              key={q}
              onClick={() => setAmount(q.replace('$', ''))}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-[21px] py-[9px]"
            >
              <p className="font-semibold text-[14px] leading-[20px] text-white text-center">{q}</p>
            </button>
          ))}
        </div>

        {/* ── Exchange rate info card ───────────────────────────── */}
        <div className="bg-[#0d1f3a] border border-[#007bff] rounded-[12px] p-[17px] flex flex-col gap-[16px] mb-[24px]">
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Exchange Rate:</p>
            <p className="font-normal text-[14px] leading-[20px] text-white">
              1 {asset} = ₦{RATES[asset].toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Processing Time:</p>
            <p className="font-normal text-[14px] leading-[20px] text-white">5-10 minutes</p>
          </div>
        </div>

        {/* ── Bank account section ──────────────────────────────── */}
        <div className="flex flex-col gap-[12px] mb-[16px]">
          <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8] pl-[4px]">
            Withdraw to
          </p>
          <div className="bg-[#1a2540] border border-[#262626] rounded-[16px] p-[17px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              {/* Bank icon */}
              <div className="bg-[rgba(30,58,138,0.5)] rounded-[8px] size-[40px] flex items-center justify-center shrink-0">
                <div className="relative size-[24px]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgBankIcon} />
                </div>
              </div>
              <div>
                <p className="font-bold text-[14px] leading-[20px] text-white">
                  First Bank ••••7823
                </p>
                <p className="font-normal text-[12px] leading-[16px] text-[#94a3b8]">
                  Savings Account
                </p>
              </div>
            </div>
            <button>
              <p className="font-normal text-[14px] leading-[20px] text-[#007bff] text-center">
                Change
              </p>
            </button>
          </div>
        </div>

        {/* ── Lucy nudge ────────────────────────────────────────── */}
        <div className="flex items-start gap-[12px] mb-[24px]">
          <div className="relative shrink-0 size-[16px] mt-[2px]">
            <img alt="" className="absolute block max-w-none size-full" src={imgInfoIcon} />
          </div>
          <p className="font-normal text-[12px] leading-[19.5px] text-[#94a3b8]">
            Exchange rates update every few minutes to reflect market changes. Your final rate is locked when you confirm.
          </p>
        </div>

      </div>

      {/* ── Preview Sale button ───────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={handlePreview}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[16px] py-[16px] flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Preview Sale
          </p>
        </button>
      </div>

    </div>
  );
}
