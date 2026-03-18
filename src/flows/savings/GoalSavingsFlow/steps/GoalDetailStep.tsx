/**
 * GoalSavingsFlow › Step 4 — Goal Detail
 * Figma frame: 143:2202 "Goal Detail"
 *
 * Full-page scrollable detail view for a specific goal.
 * Reached via "View Goal →" in SuccessStep.
 *
 * Dynamic from data: goalName, targetAmount, deadline
 * Static/mock: saved amount ($1,200.00), progress (60%), contributions
 */
import { ChevronRight } from 'lucide-react';
import PageHeader from '../../../../components/ui/PageHeader';
import type { StepProps, GoalSavingsData } from '../../types';

// ── Figma asset URLs (143:2202) — valid 7 days ────────────────────────
const imgCalendar    = 'https://www.figma.com/api/mcp/asset/51ab47f8-5102-4550-a213-79d3d1b24173'; // CalendarDots 16×16
const imgArrowSmall  = 'https://www.figma.com/api/mcp/asset/9eb55f1c-6bcf-44d3-9326-ba2c98e22476'; // arrow 13×9px
const imgFabIcon     = 'https://www.figma.com/api/mcp/asset/4dfc53fb-cf0f-4ee2-a15b-a34091b98f7b'; // FAB 22×19px
const imgDeposit     = 'https://www.figma.com/api/mcp/asset/91dbd0fc-fed1-44ad-af1e-c7b797555709'; // Manual Deposit 15×15
const imgAutoSave    = 'https://www.figma.com/api/mcp/asset/9a7668ae-8f7f-41cf-9019-59d3b4b027e2'; // Auto-Save 16×22

function formatAmount(val: string): string {
  const n = parseFloat(val || '2000');
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDeadline(iso: string): string {
  if (!iso) return 'Apr 1, 2026';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const CONTRIBUTIONS = [
  { icon: imgDeposit,  iconH: 15, iconW: 15, label: 'Manual Deposit', date: 'Mar 12, 2024', amount: '+$200.00' },
  { icon: imgAutoSave, iconH: 22, iconW: 16, label: 'Auto-Save',      date: 'Mar 05, 2024', amount: '+$500.00' },
  { icon: imgDeposit,  iconH: 15, iconW: 15, label: 'Manual Deposit', date: 'Feb 28, 2024', amount: '+$200.00' },
];

export default function GoalDetailStep({ data, onBack, onExit }: StepProps<GoalSavingsData>) {
  const goalName = data.goalName    || 'Rent';
  const target   = formatAmount(data.targetAmount || '2000');
  const dueDate  = formatDeadline(data.deadline);

  return (
    <div className="flex flex-col h-full bg-[#0a142f] relative">

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        <PageHeader title={goalName} onBack={onBack} />

        {/* ── Progress Card ─────────────────────────────────────────── */}
        <div
          className="mx-6 bg-[#1a2540] rounded-[20px] flex flex-col shrink-0 mb-4"
          style={{ padding: 24, gap: 24, boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }}
        >
          {/* Status badge */}
          <div className="flex justify-center">
            <div className="bg-[#0a3040] rounded-full px-3 py-1">
              <p className="text-[#00e6ff] font-bold text-[12px] leading-[16px] tracking-[0.6px] uppercase">
                On track
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-white font-bold text-[36px] leading-[40px] text-center">$1,200.00</p>
            <p className="text-[#8ac7ff] font-medium text-[16px] leading-[24px] text-center">
              of {target} goal
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">Progress</p>
              <p className="text-[#007bff] font-bold text-[14px] leading-[20px]">60% complete</p>
            </div>
            <div className="bg-[#334155] h-3 rounded-full w-full overflow-hidden">
              <div className="h-full w-[60%] bg-[#007bff] rounded-full" />
            </div>
          </div>

          {/* Footer — due date row */}
          <div className="flex items-center justify-center gap-2 border-t border-[#334155] pt-[17px]">
            {/* CalendarDots icon */}
            <div className="relative shrink-0 size-4">
              <div className="absolute" style={{ inset: '6.25% 12.5% 12.5% 12.5%' }}>
                <img alt="" className="absolute block max-w-none size-full" src={imgCalendar} />
              </div>
            </div>
            <p className="text-[#cbd5e1] font-normal text-[14px] leading-[20px]">Due {dueDate}</p>
            <p className="text-[#94a3b8] font-normal text-[16px] leading-[24px] px-1">•</p>
            <p className="text-[#00e6ff] font-normal text-[14px] leading-[20px]">28 days left</p>
          </div>
        </div>

        {/* ── Lucy Insight Card ─────────────────────────────────────── */}
        <div
          className="mx-6 bg-[#1a2540] rounded-[20px] flex items-start gap-4 shrink-0 mb-4"
          style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14.875, paddingBottom: 16 }}
        >
          {/* Avatar */}
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0 self-center">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          {/* Text */}
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-[#e2e8f0] font-normal text-[14px]" style={{ lineHeight: '22.75px' }}>
              You&apos;re on track. Add $80 more this month and you&apos;ll hit your goal 5 days early.
            </p>
            <button className="flex items-center gap-1 self-start">
              <p className="text-[#00e6ff] font-bold text-[14px] leading-[20px]">Add $80 Now</p>
              {/* Small arrow asset: 13.333×9.333px */}
              <div className="relative shrink-0" style={{ width: 13.333, height: 9.333 }}>
                <img alt="" className="absolute block max-w-none size-full" src={imgArrowSmall} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Recent Contributions ──────────────────────────────────── */}
        <div className="mx-4 flex flex-col gap-4 pt-2 shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-white font-bold text-[18px] leading-[28px]">Recent Contributions</p>
            <button className="flex items-center gap-1">
              <p className="text-[#007bff] font-semibold text-[14px] leading-[20px]">View All</p>
              <ChevronRight className="w-3.5 h-3.5 text-[#007bff]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {CONTRIBUTIONS.map((c, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-4 ${
                  i < CONTRIBUTIONS.length - 1 ? 'border-b border-[#1e293b]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon circle */}
                  <div className="bg-[rgba(0,123,255,0.1)] rounded-full size-10 flex items-center justify-center shrink-0">
                    <div className="relative shrink-0" style={{ width: c.iconW, height: c.iconH }}>
                      <img alt="" className="absolute block max-w-none size-full" src={c.icon} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-bold text-[16px] leading-[24px]">{c.label}</p>
                    <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">{c.date}</p>
                  </div>
                </div>
                <p className="text-[#00e6ff] font-bold text-[16px] leading-[24px]">{c.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Actions ────────────────────────────────────────── */}
        <div className="mx-4 flex flex-col gap-3 pt-4 mb-24 shrink-0">
          {/* Add Funds */}
          <button
            className="w-full bg-[#007bff] rounded-[12px] flex items-center justify-center shadow-[0px_4px_6px_-4px_rgba(0,123,255,0.2)]"
            style={{ paddingTop: 16, paddingBottom: 16 }}
          >
            <span className="text-white font-bold text-[16px] leading-[24px]">Add Funds</span>
          </button>

          {/* Withdraw */}
          <button
            className="w-full border-2 border-[#007bff] rounded-[12px] flex items-center justify-center"
            style={{ paddingTop: 18, paddingBottom: 18 }}
          >
            <span className="text-[#007bff] font-bold text-[16px] leading-[24px]">Withdraw</span>
          </button>

          {/* Delete Goal */}
          <button className="flex items-center justify-center w-full py-2" onClick={onExit}>
            <span className="text-[#ff4444] font-bold text-[14px] leading-[20px]">Delete Goal</span>
          </button>
        </div>
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <button className="absolute bottom-6 right-4 bg-[#007bff] rounded-full size-14 flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)]">
        <div className="h-[19px] w-[22px] relative">
          <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
        </div>
        <div className="absolute -top-1 -right-1 bg-[#00e6ff] border-2 border-[#007bff] rounded-full size-4" />
      </button>
    </div>
  );
}
