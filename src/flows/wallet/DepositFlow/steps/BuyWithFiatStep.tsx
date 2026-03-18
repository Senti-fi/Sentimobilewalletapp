/**
 * BuyWithFiatStep — Figma frame 302:2380 "via fiat"
 *
 * Amount input, quick pills, payment method selection, Continue CTA.
 */
import { useState } from 'react';
import type { StepProps } from '../../../savings/types';
import type { DepositFlowData } from '../../types';
import AmountInput from '../../../../components/AmountInput';

// ── Figma asset URLs (302:2380) ──────────────────────────────────────
const imgArrowLeft  = 'https://www.figma.com/api/mcp/asset/ed32e853-f58f-4171-983f-a72c643e9975';
const imgClock      = 'https://www.figma.com/api/mcp/asset/08448048-fa2b-4a63-9b69-f5a75e435974';
const imgBankCircle = 'https://www.figma.com/api/mcp/asset/354527b8-1641-4612-a03e-ddf93c57cb94';
const imgCardIcon   = 'https://www.figma.com/api/mcp/asset/b47a083f-590b-45f8-a6c7-8684d796c64c';
const imgStripeIcon = 'https://www.figma.com/api/mcp/asset/4abb6413-199c-4094-8054-1e6b44a98c2c';

type PayMethod = 'bank' | 'card' | 'stripe';

export default function BuyWithFiatStep({ onNext, onBack }: StepProps<DepositFlowData>) {
  const [raw,      setRaw]      = useState('');
  const [selected, setSelected] = useState<PayMethod>('bank');

  const numVal      = parseFloat(raw) || 0;
  const canContinue = numVal > 0;

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
          <button onClick={onBack} className="relative size-[24px] shrink-0">
            <div className="absolute inset-[18.75%_12.5%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
            </div>
          </button>
          <p className="font-semibold text-[16px] leading-[20px] text-white">Buy with Fiat</p>
          <button className="relative size-[24px] shrink-0">
            <div className="absolute inset-[9.36%_9.36%_9.43%_9.43%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgClock} />
            </div>
          </button>
        </div>

        {/* ── Amount Input Section ───────────────────────────────── */}
        <div className="flex flex-col items-center mt-[24px] px-6">
          <AmountInput
            raw={raw}
            onChange={setRaw}
            label="How much would you like to buy?"
          />
          <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] text-center mt-[12px]">
            You'll receive approximately {numVal.toFixed(0)} USDC
          </p>
        </div>

        {/* ── Choose Payment Method ──────────────────────────────── */}
        <div className="px-6 mt-[24px]">
          <p className="font-bold text-[16px] leading-[24px] text-white mb-[16px]">
            Choose Payment Method
          </p>

          <div className="flex flex-col gap-[12px]">

            {/* Bank Transfer (Recommended) */}
            <button
              onClick={() => setSelected('bank')}
              className={`flex gap-[16px] items-start p-[17px] rounded-[12px] text-left w-full ${
                selected === 'bank'
                  ? 'bg-[#0d1f3a] border border-[#007bff]'
                  : 'bg-[#1a2540] border border-[rgba(255,255,255,0.05)]'
              }`}
            >
              <div className="bg-[#1a3a6b] rounded-full size-[40px] flex items-center justify-center shrink-0">
                <div className="relative shrink-0" style={{ width: 16.667, height: 16.667 }}>
                  <img alt="" className="absolute block max-w-none size-full" src={imgBankCircle} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[16px] leading-[24px] text-white">Bank Transfer</p>
                  <div className="bg-[#0a3040] rounded-[4px] px-[8px] py-[2px]">
                    <p className="font-bold text-[10px] leading-[15px] tracking-[0.5px] uppercase text-[#00e6ff]">
                      Recommended
                    </p>
                  </div>
                </div>
                <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] mt-[4px]">
                  Direct from your bank account
                </p>
                <p className="font-bold text-[12px] leading-[16px] text-[#00e6ff] mt-[8px]">
                  Fee: 0%
                </p>
              </div>
            </button>

            {/* Visa / Mastercard */}
            <button
              onClick={() => setSelected('card')}
              className={`flex gap-[16px] items-start p-[17px] rounded-[12px] text-left w-full ${
                selected === 'card'
                  ? 'bg-[#0d1f3a] border border-[#007bff]'
                  : 'bg-[#1a2540] border border-[rgba(255,255,255,0.05)]'
              }`}
            >
              <div className="bg-[#0d2a4a] rounded-full size-[40px] flex items-center justify-center shrink-0">
                <div className="relative shrink-0" style={{ width: 16.667, height: 13.333 }}>
                  <img alt="" className="absolute block max-w-none size-full" src={imgCardIcon} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[16px] leading-[24px] text-white">Visa / Mastercard</p>
                <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] mt-[4px]">
                  Pay with your debit or credit card
                </p>
                <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] mt-[8px] opacity-80">
                  Fee: 1.5%
                </p>
              </div>
            </button>

            {/* Stripe / MoonPay */}
            <button
              onClick={() => setSelected('stripe')}
              className={`flex gap-[16px] items-start p-[17px] rounded-[12px] text-left w-full ${
                selected === 'stripe'
                  ? 'bg-[#0d1f3a] border border-[#007bff]'
                  : 'bg-[#1a2540] border border-[rgba(255,255,255,0.05)]'
              }`}
            >
              <div className="bg-[#262626] rounded-full size-[40px] flex items-center justify-center shrink-0">
                <div className="relative shrink-0 size-[15px]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgStripeIcon} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[16px] leading-[24px] text-white">Stripe / MoonPay</p>
                <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] mt-[4px]">
                  Apple Pay, Google Pay, and more
                </p>
                <div className="flex gap-[8px] mt-[8px]">
                  <span className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[8px] py-[2px] font-normal text-[10px] leading-[15px] text-white">
                    Stripe
                  </span>
                  <span className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[8px] py-[2px] font-normal text-[10px] leading-[15px] text-white">
                    MoonPay
                  </span>
                </div>
                <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] mt-[8px] opacity-80">
                  Fee: 0.99% - 1%
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="mx-6 mt-[16px] mb-6 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-5">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            Bank Transfer has zero fees. Best option if you're not in a rush.
          </p>
        </div>
      </div>

      {/* ── Continue button (pinned) ───────────────────────────── */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={() => onNext({ amount: raw, paymentMethod: selected })}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[16px] py-[16px] flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Continue
          </p>
        </button>
      </div>

    </div>
  );
}
