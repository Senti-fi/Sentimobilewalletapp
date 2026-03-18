/**
 * LockedSavingsFlow › Step 2 — Lock Selection
 * Figma frame: 218:961 "Locked Savings Option"
 *
 * Bottom-sheet overlay on frozen IntroStep.
 * User taps a period row → onNext({ lockPeriodDays, apy })
 */
import type { StepProps, LockedSavingsData } from '../../types';

// ── Figma asset URLs (218:961) — valid 7 days ────────────────────────
const imgLockKey    = 'https://www.figma.com/api/mcp/asset/b8453e24-12b5-4c9c-96fd-26ea80fead5e'; // LockKey Vector 16×16
const imgCaretRight = 'https://www.figma.com/api/mcp/asset/3cff6dee-8f2c-4fdb-b703-d9ec5deb2ae0'; // CaretRight Vector 16×16

const LOCK_PERIODS = [
  { days: 30,  label: '30 Days',  sublabel: 'Steady Returns',  earnings: '≈ $12',  apy: '4.5%', badge: null          },
  { days: 60,  label: '60 Days',  sublabel: 'Growing Returns', earnings: '≈ $24',  apy: '6%',   badge: null          },
  { days: 90,  label: '90 Days',  sublabel: 'Better Returns',  earnings: '≈ $38',  apy: '7.6%', badge: 'Popular'     },
  { days: 180, label: '180 Days', sublabel: 'Strong Returns',  earnings: '≈ $80',  apy: '10%',  badge: null          },
  { days: 365, label: '1 Year',   sublabel: 'Maximum Returns', earnings: '≈ $180', apy: '12%',  badge: 'Best Value'  },
] as const;

export default function LockSelectionStep({ onNext, onBack }: StepProps<LockedSavingsData>) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div className="flex-1 backdrop-blur-[1.5px] bg-[rgba(217,217,217,0.15)]" />

      {/* ── Bottom sheet: 715px ──────────────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
        style={{ height: 715 }}
      >
        {/* Indicator pill */}
        <div className="flex justify-center" style={{ marginTop: 16 }}>
          <div className="bg-[#8ac7ff] rounded-[8px]" style={{ width: 40, height: 4 }} />
        </div>

        {/* Title */}
        <p
          className="text-white font-bold text-[24px] leading-[32px] tracking-[-0.48px] px-6"
          style={{ marginTop: 28 }}
        >
          Choose Lock Period
        </p>

        {/* Subtitle */}
        <p
          className="text-[#8ac7ff] font-normal text-[14px] px-6"
          style={{ marginTop: 8, lineHeight: 'normal' }}
        >
          Longer locks earn more.
        </p>

        {/* Lucy card */}
        <div
          className="mx-6 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[12px] flex items-center gap-4 overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ marginTop: 16, paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8 }}
        >
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="text-white font-normal text-[12px] leading-[16px] flex-1">
            Which lock period is best for me?
          </p>
        </div>

        {/* Period rows */}
        <div className="mx-6 flex flex-col gap-6 overflow-y-auto" style={{ marginTop: 24 }}>
          {LOCK_PERIODS.map(period => (
            <button
              key={period.days}
              onClick={() => onNext({ lockPeriodDays: period.days, apy: period.apy })}
              className="bg-[#1a2540] border border-[rgba(0,123,255,0.2)] rounded-[12px] flex items-center justify-between relative"
              style={{ padding: 16 }}
            >
              {/* Left: icon + label */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
                  <div className="relative shrink-0 size-4">
                    <div className="absolute inset-[3.13%_12.5%_12.5%_12.5%]">
                      <img alt="" className="absolute block max-w-none size-full" src={imgLockKey} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-white font-bold text-[16px] leading-[24px]">{period.label}</p>
                  <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">{period.sublabel}</p>
                </div>
              </div>

              {/* Right: earnings + caret */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end">
                  <p className="text-[#00e6ff] font-bold text-[16px] leading-[24px]">{period.earnings}</p>
                  <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">On $500</p>
                </div>
                <div className="relative shrink-0 size-4">
                  <div className="absolute inset-[14.05%_26.55%_14.06%_32.8%]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgCaretRight} />
                  </div>
                </div>
              </div>

              {/* Badge (Popular / Best Value) */}
              {period.badge && (
                <div className="absolute bg-[#007bff] rounded-full px-2 py-0.5" style={{ left: 124, top: 21 }}>
                  <p className="text-white font-medium text-[10px] leading-normal">{period.badge}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <p
          className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] text-center px-6 shrink-0"
          style={{ marginTop: 'auto', paddingBottom: 20 }}
        >
          Estimated earnings based on $500. Actual earnings may vary.
        </p>
      </div>
    </div>
  );
}
