/**
 * GoalSavingsFlow › Step 3 — Goal Setup Success
 * Figma frame: 141:1932 composite → bottom sheet 141:2169
 *
 * Sheet: 572px tall, bg #0a142f, rounded-tl/tr 24px.
 * Rendered as absolute overlay with blurred backdrop over GoalSetupStep.
 *
 * Vertical rhythm (relative to sheet top-edge):
 *   success icon   top 48px  (size 80px)
 *   title          center-y 167 → marginTop ≈23
 *   subtitle       center-y 209 → marginTop 16
 *   details card   top 252     → marginTop 16
 *   lucy card      top 376     → marginTop ~12
 *   View Goal CTA  top 436     → marginTop ~8
 *   Back to Savings top 504    → marginTop ~12
 */
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import type { StepProps, GoalSavingsData } from '../../types';

function formatAmount(val: string): string {
  const n = parseFloat(val || '0');
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDeadline(iso: string): string {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function SuccessStep({ data, onNext, onExit }: StepProps<GoalSavingsData>) {
  const goalName = data.goalName    || 'Goal';
  const target   = formatAmount(data.targetAmount);
  const dueDate  = formatDeadline(data.deadline);

  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]" />

      {/* ── Bottom sheet: 572px ──────────────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col items-center shrink-0 overflow-hidden"
        style={{ height: 572 }}
      >

        {/* Success icon: size 80, bg #1a3a6b rounded-full */}
        <div
          className="bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0"
          style={{ width: 80, height: 80, marginTop: 48 }}
        >
          <CheckCircle2 size={33} className="text-[#00e6ff]" />
        </div>

        {/* "Goal Created" — Manrope Bold 24px lh-30 */}
        <p
          className="text-white font-bold text-[24px] leading-[30px] text-center"
          style={{ marginTop: 23 }}
        >
          Goal Created
        </p>

        {/* Subtitle — Regular 14px #8ac7ff text-center w-309 */}
        <p
          className="text-[#8ac7ff] font-normal text-[14px] leading-normal text-center"
          style={{ width: 309, marginTop: 16 }}
        >
          Your {goalName} goal is set. Lucy will keep you on track and nudge you when it matters most.
        </p>

        {/* Goal Details Card: bg #1a2540 border #3c5679 rounded-12 p-16 gap-16 w-345 */}
        <div
          className="bg-[#1a2540] border border-[#3c5679] rounded-[12px] flex flex-col"
          style={{ width: 345, padding: 16, gap: 16, marginTop: 16 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Goal</p>
            <p className="text-white font-medium text-[14px] leading-[20px]">{goalName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Target</p>
            <p className="text-white font-medium text-[14px] leading-[20px]">{target}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Due Date</p>
            <p className="text-white font-medium text-[14px] leading-[20px]">{dueDate}</p>
          </div>
        </div>

        {/* Lucy card: rounded-20 p-20 gap-8 shadow */}
        <div
          className="flex items-center rounded-[20px]"
          style={{
            width: 345, padding: 20, gap: 8, marginTop: 12,
            boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="bg-[#007bff] rounded-[20px] flex items-center justify-center shrink-0"
            style={{ width: 20, height: 20 }}
          >
            <span className="text-white font-normal text-[14px] leading-[20px]">L</span>
          </div>
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] flex-1">
            I&apos;ll remind you 5 days before your due date.
          </p>
        </div>

        {/* View Goal CTA: bg #007bff rounded-12 h-56 p-20 gap-10 w-345 */}
        <button
          onClick={() => onNext()}
          className="bg-[#007bff] rounded-[12px] flex items-center justify-center gap-2 shrink-0"
          style={{ width: 345, height: 56, padding: 20, marginTop: 8 }}
        >
          <span className="text-white font-semibold text-[16px] leading-[20px]">View Goal</span>
          <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </button>

        {/* Back to Savings — secondary link */}
        <button onClick={onExit} style={{ marginTop: 12 }}>
          <span className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">
            Back to Savings
          </span>
        </button>

      </div>
    </div>
  );
}
