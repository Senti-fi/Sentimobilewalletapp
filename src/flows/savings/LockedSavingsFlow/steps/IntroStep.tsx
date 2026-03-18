/**
 * LockedSavingsFlow › Step 1 — Intro
 * Figma frame: 204:1398 "Locked Savings"
 *
 * "Choose a Lock Period" button / FAB → onNext() → LockSelectionStep (218:961)
 * Back arrow → onBack() → exits flow at step 0
 */
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import PageHeader from '../../../../components/ui/PageHeader';
import type { StepProps, LockedSavingsData } from '../../types';

// ── Figma asset URLs (204:1398) — valid 7 days ────────────────────────
const imgWave    = 'https://www.figma.com/api/mcp/asset/d6358601-8582-40b6-996e-534698012790'; // wave BG
const imgPlus    = 'https://www.figma.com/api/mcp/asset/44334b14-ea90-4864-b74b-6c71208daf31'; // Plus 16×16
const imgCircles = 'https://www.figma.com/api/mcp/asset/ea3cbee6-1408-4313-9160-498d05fad79d'; // CirclesFour
const imgFabIcon = 'https://www.figma.com/api/mcp/asset/81e7adf9-08b7-4612-a2b0-8969ab09ef66'; // FAB icon 22×19

export default function IntroStep({ onNext, onBack }: StepProps<LockedSavingsData>) {
  const [autoSave, setAutoSave] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#0a142f] relative">

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        <PageHeader title="Committed Savings" onBack={onBack} />

        {/* Subtitle */}
        <p className="px-6 text-[#8ac7ff] font-medium text-[14px] leading-[18px] mb-4 shrink-0">
          Lock it in. Let it grow.
        </p>

        {/* ── Blue locked balance card ─────────────────────────────── */}
        <div className="mx-6 bg-[#007bff] rounded-[20px] overflow-hidden relative h-[156px] shrink-0 mb-6">
          {/* Wave backgrounds */}
          <div className="absolute inset-[0_12.46%_-17.22%_0]">
            <img alt="" className="absolute block max-w-none size-full" src={imgWave} />
          </div>
          <div className="absolute inset-[0_-75.07%_-17.22%_87.54%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgWave} />
          </div>

          {/* Balance */}
          <div className="absolute left-5 top-5 flex flex-col gap-2 w-[157px] text-white">
            <p className="font-normal text-[12px] leading-[16px]">Locked Balance</p>
            <p className="font-bold text-[32px] leading-[32px] tracking-[-0.64px]">$1,247.50</p>
          </div>

          {/* Badge */}
          <div className="absolute left-[218px] top-5 bg-[rgba(0,230,255,0.4)] px-2 py-1 rounded-[16px]">
            <p className="text-[#00e6ff] font-semibold text-[12px] leading-[16px] whitespace-nowrap">
              +4.2% this month
            </p>
          </div>

          {/* Action buttons */}
          <div className="absolute left-5 top-[100px] flex gap-4 items-center h-9">
            {/* Choose a Lock Period → advances to lock selection */}
            <button
              onClick={() => onNext()}
              className="border border-[#b3fbff] rounded-[22px] flex items-center gap-2 pl-2 pr-3 py-2.5"
            >
              <p className="text-white font-normal text-[12px] leading-[16px] whitespace-nowrap">
                Choose a Lock Period
              </p>
            </button>
            {/* Withdraw — static for now */}
            <button className="border border-[#b3fbff] rounded-[22px] flex items-center gap-2 pl-2 pr-3 py-2.5">
              <div className="size-4 relative shrink-0">
                <img alt="" className="absolute block max-w-none size-full" src={imgPlus} />
              </div>
              <p className="text-white font-normal text-[12px] leading-[16px] whitespace-nowrap">Withdraw</p>
            </button>
            {/* More options */}
            <button className="border border-[#b3fbff] rounded-[22px] flex items-center justify-center px-3 py-2.5">
              <div className="size-4 relative shrink-0">
                <img alt="" className="absolute block max-w-none size-full" src={imgCircles} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Enable Auto-Save row ───────────────────────────────────── */}
        <div className="mx-6 flex items-center justify-between mb-6 shrink-0">
          <div className="flex-1 flex flex-col gap-1 pr-4">
            <p className="text-white font-medium text-[16px] leading-[24px]">Enable Auto-Save</p>
            <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]" style={{ maxWidth: 265 }}>
              Save automatically daily, weekly or monthly with Auto-Save. Lucy will remind you when it&apos;s due
            </p>
          </div>
          {/* Functional toggle pill */}
          <button
            role="switch"
            aria-checked={autoSave}
            onClick={() => setAutoSave(v => !v)}
            className={`shrink-0 rounded-full transition-colors duration-200 flex items-center ${
              autoSave ? 'bg-[#007bff]' : 'bg-[#334155]'
            }`}
            style={{ width: 44, height: 24, padding: 2 }}
          >
            <span
              className="bg-white rounded-full shadow-sm transition-transform duration-200 block shrink-0"
              style={{ width: 20, height: 20, transform: autoSave ? 'translateX(20px)' : 'translateX(0px)' }}
            />
          </button>
        </div>

        {/* ── How It Works card ──────────────────────────────────────── */}
        <div className="mx-6 bg-[rgba(30,41,59,0.4)] border border-[#3c5679] rounded-[12px] p-[17px] flex flex-col gap-4 mb-6 shrink-0">
          <p className="text-white font-semibold text-[18px] leading-[24px]">How It Works</p>

          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center self-stretch shrink-0 relative">
              <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center z-[1] shrink-0">
                <p className="text-white font-bold text-[16px] leading-[24px]">1</p>
              </div>
              <div className="w-[2px] bg-[#007bff] flex-1 mt-1" />
            </div>
            <div className="flex-1 flex flex-col gap-1 py-2">
              <p className="text-white font-medium text-[16px] leading-[24px]">Choose Your Lock Period</p>
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                Pick how long you want to commit — 30 days up to 1 year. Longer locks earn more.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center self-stretch shrink-0 relative">
              <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center z-[1] shrink-0">
                <p className="text-white font-bold text-[16px] leading-[24px]">2</p>
              </div>
              <div className="w-[2px] bg-[#007bff] flex-1 mt-1" />
            </div>
            <div className="flex-1 flex flex-col gap-1 py-2">
              <p className="text-white font-medium text-[16px] leading-[24px]">Lock Your Funds</p>
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                Your money is secured and starts earning immediately from day one.
              </p>
            </div>
          </div>

          {/* Step 3 — no connecting line below */}
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center self-stretch shrink-0">
              <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
                <p className="text-white font-bold text-[16px] leading-[24px]">3</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1 py-2">
              <p className="text-white font-medium text-[16px] leading-[24px]">Collect Your Earnings</p>
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                When your lock period ends, your principal and earnings are released automatically.
              </p>
            </div>
          </div>

          {/* Lucy insight */}
          <div className="bg-[rgba(0,123,255,0.1)] border border-[rgba(0,123,255,0.2)] rounded-[12px] p-[17px] flex gap-4 items-start">
            <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
              <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
            </div>
            <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] flex-1">
              Committed Savings is best for money you won&apos;t need for a while. Not sure? Start with Flexible Savings first.
            </p>
          </div>
        </div>

        {/* ── Terms at a Glance ──────────────────────────────────────── */}
        <div className="mx-6 flex flex-col gap-2 mb-5 shrink-0">
          <p className="text-white font-semibold text-[18px] leading-[24px]">Terms at a Glance</p>
          <div className="bg-[#1a2540] border border-[rgba(0,123,255,0.2)] rounded-[12px] overflow-hidden">
            {/* Row 1 — Lock Periods */}
            <div className="flex items-center justify-between px-4 py-[17px] border-b border-[rgba(0,123,255,0.2)]">
              <p className="text-[#94a3b8] font-medium text-[14px] leading-[18px]">Lock Periods</p>
              <p className="text-white font-medium text-[14px] leading-[18px]">30 days to 1 year</p>
            </div>
            {/* Row 2 — Returns */}
            <div className="flex items-start justify-between px-4 py-[17px] border-b border-[rgba(0,123,255,0.2)]">
              <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">Returns</p>
              <div className="flex flex-col items-end gap-0.5">
                <p className="text-white font-normal text-[12px] leading-[16px]">4.5% - 12% longer locks earn more</p>
                <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">Accrues daily, released at unlock</p>
              </div>
            </div>
            {/* Row 3 — Early Withdrawal */}
            <div className="flex items-start justify-between px-4 py-[17px] border-b border-[rgba(0,123,255,0.2)]">
              <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">Early Withdrawal</p>
              <div className="flex flex-col items-end gap-0.5">
                <p className="text-white font-normal text-[12px] leading-[16px]">Principal only, 10% interest forfeited</p>
                <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">Penalties may apply</p>
              </div>
            </div>
            {/* Row 4 — Minimum Lock Amount */}
            <div className="flex items-center justify-between px-4 py-[17px] border-b border-[rgba(0,123,255,0.2)]">
              <p className="text-[#94a3b8] font-medium text-[14px] leading-[18px]">Minimum Lock Amount</p>
              <p className="text-white font-medium text-[14px] leading-[18px]">$1.00</p>
            </div>
            {/* Row 5 — Fees */}
            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-[#94a3b8] font-medium text-[14px] leading-[18px]">Fees</p>
              <p className="text-white font-normal text-[12px] leading-[16px]">No management fees</p>
            </div>
          </div>
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] text-center opacity-80">
            Terms are subject to change. You will be notified of any updates.
          </p>
        </div>

        {/* ── Locks section ──────────────────────────────────────────── */}
        <div className="mx-6 bg-[rgba(30,41,59,0.4)] rounded-[20px] p-5 flex flex-col gap-4 mb-24 shrink-0">
          {/* Tab row */}
          <div className="flex items-center justify-center gap-[120px]">
            <p className="text-white font-medium text-[14px] leading-[18px]">Ongoing</p>
            <p className="text-[#007bff] font-medium text-[14px] leading-[18px]">Released</p>
          </div>

          {/* Lock Card: Rent */}
          <div className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-[12px] p-[17px] flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <p className="text-[#f1f5f9] font-semibold text-[16px] leading-[24px]">Rent</p>
                <p className="text-[#94a3b8] font-medium text-[12px] leading-[16px]">
                  Saved: $1,200.00 of $2,000.00
                </p>
              </div>
              <p className="text-[#00e6ff] font-bold text-[12px] leading-[16px]">On track</p>
            </div>
            <div className="bg-[#334155] h-2 rounded-full w-full relative">
              <div className="absolute inset-y-0 left-0 w-[60%] bg-[#007bff] rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#94a3b8] font-medium text-[12px] leading-[16px]">Due Apr 1</p>
              <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" strokeWidth={2} />
            </div>
          </div>

          {/* Lock Card: Emergency Fund */}
          <div className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-[12px] p-[17px] flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-[#f1f5f9] font-semibold text-[16px] leading-[24px]">Emergency Fund</p>
                <p className="text-[#94a3b8] font-medium text-[12px] leading-[16px]">
                  Saved: $0.00 of $5,000.00
                </p>
              </div>
              <p className="text-[#8ac7ff] font-bold text-[12px] leading-[16px]">Just started</p>
            </div>
            <div className="bg-[#334155] h-2 rounded-full w-full" />
            <div className="flex items-center justify-between">
              <p className="text-[#94a3b8] font-medium text-[12px] leading-[16px]">No deadline</p>
              <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => onNext()}
        className="absolute bottom-6 right-4 bg-[#007bff] rounded-full size-14 flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)]"
      >
        <div className="h-[19px] w-[22px] relative">
          <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
        </div>
        <div className="absolute -top-1 -right-1 bg-[#00e6ff] border-2 border-[#007bff] rounded-full size-4" />
      </button>
    </div>
  );
}
