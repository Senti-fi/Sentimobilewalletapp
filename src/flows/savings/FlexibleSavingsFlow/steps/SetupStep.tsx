/**
 * FlexibleSavingsFlow › Step 2 — Quick Save sheet
 * Figma frame: 191:668 composite → bottom sheet node 191:860
 *
 * Sheet: 393×442px, bg-[#0a142f], rounded-tl-[24px] rounded-tr-[24px]
 * The blur overlay + frozen background are rendered by FlexibleSavingsFlow (parent).
 * This component renders only the interactive bottom sheet.
 *
 * Vertical rhythm (from sheet top):
 *   indicator bar  top 16px   (w-40, h-4)
 *   title          center 60  (Bold 24px)
 *   subtitle       center 108 (SemiBold 12px, uppercase, tracking 1.2px)
 *   amount         center 170 (Bold 64px)
 *   balance        center 226 (Medium 14px)
 *   pills          top 259    (gap-8, px-24)
 *   CTA            top 337    (px-24)
 */
import { useState } from 'react';
import type { StepProps, FlexibleSavingsData } from '../../types';
import { useAppStore } from '../../../../store';
import type { Asset } from '../../../../store';

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function SetupStep({ data, onNext, onBack }: StepProps<FlexibleSavingsData>) {
  const [raw, setRaw]     = useState(data.amount || '');
  const [error, setError] = useState('');
  const { balances, depositFlexible } = useAppStore();

  const asset   = (data.asset || 'USDC') as Asset;
  const numVal  = parseFloat(raw) || 0;
  const display = raw ? `$${numVal.toFixed(2)}` : '$0.00';
  const available = balances[asset];

  return (
    /* Fills the parent overlay; tap above sheet → onBack */
    <div className="absolute inset-0 flex flex-col justify-end">
      <div className="flex-1" onClick={onBack} />

      {/* ── Bottom sheet (442px, matches Figma 191:860) ───────────── */}
      <div className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] overflow-hidden flex flex-col items-center shrink-0"
        style={{ height: 442 }}>

        {/* Indicator bar — w-40 h-1 bg-[#8ac7ff] centered, top 16 */}
        <div className="flex justify-center" style={{ paddingTop: 16 }}>
          <div className="bg-[#8ac7ff] rounded-[8px]" style={{ width: 40, height: 4 }} />
        </div>

        {/* Title — Bold 24px / lh 32px / tracking -0.48px */}
        <p
          className="text-white font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-center w-full px-6"
          style={{ marginTop: 12 }}
        >
          Flexible Savings
        </p>

        {/* Subtitle — SemiBold 12px / uppercase / tracking 1.2px / #8ac7ff */}
        <p
          className="text-[#8ac7ff] font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase text-center w-full px-6"
          style={{ marginTop: 16 }}
        >
          How much would you like to save?
        </p>

        {/* Amount input */}
        <div className="flex items-center justify-center" style={{ marginTop: 16 }}>
          <span className="text-white font-bold text-[64px] tracking-[-0.64px] leading-none">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="0.00"
            className="text-white font-bold text-[64px] tracking-[-0.64px] leading-none bg-transparent outline-none placeholder:text-[#6b7280]"
            style={{ width: raw ? `${Math.max(raw.length, 4)}ch` : '4ch' }}
            aria-label="Savings amount"
          />
        </div>

        {/* Available balance */}
        <p
          className="text-center text-[14px] font-medium leading-[18px]"
          style={{ marginTop: 8 }}
        >
          <span className="text-white">Available Balance : </span>
          <span className="text-[#00e6ff] font-bold">
            ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset}
          </span>
        </p>

        {/* Quick amount pills */}
        <div
          className="flex w-full gap-2"
          style={{ paddingLeft: 24, paddingRight: 24, marginTop: 24 }}
        >
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => setRaw(String(amt))}
              className={`flex-1 rounded-[12px] border text-white font-bold text-[14px] leading-[20px] transition-colors ${
                numVal === amt
                  ? 'bg-[#007bff] border-[#007bff]'
                  : 'bg-[#0a142f] border-[rgba(138,199,255,0.3)]'
              }`}
              style={{ paddingTop: 13, paddingBottom: 13 }}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-[#ff4444] font-normal text-[12px] leading-[16px] text-center px-6"
            style={{ marginTop: 8 }}
          >
            {error}
          </p>
        )}

        {/* Save Now CTA */}
        <div className="w-full" style={{ paddingLeft: 24, paddingRight: 24, marginTop: 16 }}>
          <button
            onClick={() => {
              setError('');
              const result = depositFlexible({ asset, amount: numVal });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              onNext({ amount: raw || '0', asset: data.asset, frequency: data.frequency });
            }}
            disabled={numVal <= 0}
            className="w-full bg-[#007bff] rounded-[12px] text-white font-bold text-[16px] leading-[24px] disabled:opacity-40 transition-opacity"
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              boxShadow: '0px 10px 15px -3px rgba(0,123,255,0.2), 0px 4px 6px -4px rgba(0,123,255,0.2)',
            }}
          >
            Save Now
          </button>
        </div>

      </div>
    </div>
  );
}
