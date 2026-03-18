/**
 * SavePage — Figma frame 168:285 "Savings"
 * Source of truth: Figma file 0HMMhWanPWdxewDhlOWnfx, node 168:285
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BalanceCarousel from '../../components/BalanceCarousel';
import FlowPortal from '../../flows/savings/FlowPortal';
import ChooseSavingsStyle from '../../flows/savings/ChooseSavingsStyle';
import {
  FlexibleSavingsFlow,
  GoalSavingsFlow,
  LockedSavingsFlow,
} from '../../flows/savings';
import { useAppStore } from '../../store';
import type { Goal } from '../../store';
import TransactionList from '../../components/TransactionList';
import { getTransactionsByContext } from '../../data/transactionUtils';

// ── Figma asset URLs (168:285) ───────────────────────────────────────
const imgChevron    = 'https://www.figma.com/api/mcp/asset/8e2b3d97-ca74-4c0d-896d-8e708d2f1cd7'; // Chevron right (section buttons)
const imgBolt       = 'https://www.figma.com/api/mcp/asset/47208871-5d37-4d3d-9e43-1e3f21399f84'; // Bolt icon
const imgArrowRight = 'https://www.figma.com/api/mcp/asset/62f00221-9c66-4e5c-879a-b3e2c501f3ed'; // ArrowRight (Lucy Add Funds)
const imgGoalChev   = 'https://www.figma.com/api/mcp/asset/d63a592b-ad8c-4d7f-82ce-098ff48fc098'; // Chevron in goal cards
const imgFabIcon    = 'https://www.figma.com/api/mcp/asset/cc5368b2-df38-46c6-9b0b-7e78c6826f33'; // FAB icon

// ── Types ────────────────────────────────────────────────────────────
type ActiveFlow = 'choose' | 'flexible' | 'goal' | 'locked' | null;

// ── Helpers ──────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function goalStatus(goal: Goal): { text: string; color: string } {
  if (goal.status === 'completed') return { text: 'Completed',    color: '#00e6ff' };
  if (goal.status === 'expired')   return { text: 'Overdue',      color: '#ff4444' };
  const p = goal.targetAmount > 0
    ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
  if (p >= 70) return { text: 'Almost there', color: '#00e6ff' };
  if (p >= 30) return { text: 'On track',     color: '#00e6ff' };
  return { text: 'Just started', color: '#8ac7ff' };
}

// ── FAB portalled to #root ───────────────────────────────────────────
function SaveFab({ onClick }: { onClick: () => void }) {
  const root = document.getElementById('root');
  if (!root) return null;
  return createPortal(
    <button
      onClick={onClick}
      className="absolute bg-[#007bff] bottom-[86px] flex items-center justify-center right-[16px] rounded-[9999px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)] size-[56px] z-40"
    >
      <div className="h-[19px] relative shrink-0 w-[22px]">
        <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
      </div>
      <div className="absolute bg-[#00e6ff] border-2 border-[#007bff] right-[-4px] rounded-[9999px] size-[16px] top-[-4px]" />
    </button>,
    root,
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function SavePage() {
  const navigate     = useNavigate();
  const goals        = useAppStore(s => s.goals);
  const transactions = useAppStore(s => s.transactions);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);

  const savingsTxs = getTransactionsByContext(transactions, 'savings');

  const openChoose = () => setActiveFlow('choose');
  const close      = () => setActiveFlow(null);

  const activeGoals    = goals.filter(g => g.status !== 'completed');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <>
      <SaveFab onClick={openChoose} />

      {/* ── Scrollable page content ─────────────────────────────────── */}
      <div className="flex flex-col bg-[#0a142f] pb-[32px]">

        {/* ── Header (168:413 ArrowLeft + 168:309 title) ──────────── */}
        <div className="flex items-center justify-between px-6 pt-[68px] pb-[12px]">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[24px] shrink-0">
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <p className="font-semibold text-[16px] leading-[20px] text-white whitespace-nowrap">
            My Savings
          </p>
          <div className="size-[24px]" />
        </div>

        {/* ── Subtitle (168:310) ───────────────────────────────────── */}
        <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] px-6 pb-[16px] whitespace-nowrap">
          Your financial safe corner
        </p>

        {/* ── Total Savings Card — BalanceCarousel (save slide) ─────── */}
        <BalanceCarousel onSaveNow={openChoose} />

        {/* ── Lucy Card (168:363) ──────────────────────────────────── */}
        <div className="mx-6 mt-[24px] bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex gap-[16px] items-center p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="bg-[#007bff] rounded-full size-[32px] flex items-center justify-center shrink-0">
            <p className="font-bold text-[14px] leading-[20px] text-white text-center">L</p>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
            <p className="font-normal text-[12px] leading-[16px]">
              <span className="text-[#e2e8f0]">You&apos;re 60% toward your </span>
              <span className="text-white">rent goal</span>
              <span className="text-[#e2e8f0]">. Add $80 more to hit it this month.</span>
            </p>
            <button
              onClick={() => setActiveFlow('goal')}
              className="flex items-center gap-[4px] self-start"
            >
              <p className="font-medium text-[14px] leading-[18px] text-[#007bff] whitespace-nowrap">
                Add Funds
              </p>
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[18.75%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgArrowRight} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── My Goals Section (168:371) ───────────────────────────── */}
        <div className="flex flex-col gap-[16px] mt-[24px] px-6">

          {/* Section header */}
          <div className="flex items-center justify-between shrink-0">
            <p className="font-semibold text-[18px] leading-[28px] text-[#f1f5f9]">My Goals</p>
            <button
              onClick={() => setActiveFlow('goal')}
              className="flex items-center gap-[4px]"
            >
              <p className="font-semibold text-[14px] leading-[20px] text-[#007bff] text-center">
                New Goal
              </p>
              <div className="relative shrink-0 size-[10.5px]">
                <img alt="" className="absolute block max-w-none size-full" src={imgChevron} />
              </div>
            </button>
          </div>

          {/* Active / expired goal cards */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <div className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-[12px] p-[17px] flex flex-col items-center gap-[8px]">
              <p className="font-medium text-[14px] leading-[18px] text-[#94a3b8]">
                No goals yet
              </p>
              <button
                onClick={() => setActiveFlow('goal')}
                className="font-semibold text-[14px] leading-[20px] text-[#007bff]"
              >
                Create your first goal
              </button>
            </div>
          )}

          {activeGoals.map(goal => {
            const pct = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const due = goal.dueDate
              ? new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'No deadline';
            const { text: statusText, color: statusColor } = goalStatus(goal);
            return (
              <button
                key={goal.id}
                onClick={() => navigate(`/save/goal/${goal.id}`)}
                className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-[12px] p-[17px] flex flex-col gap-[12px] w-full text-left shrink-0"
              >
                {/* Name row */}
                <div className="flex items-start justify-between w-full">
                  <div className="flex flex-col items-start shrink-0">
                    <p className="font-semibold text-[16px] leading-[24px] text-[#f1f5f9]">
                      {goal.name}
                    </p>
                    <p className="font-medium text-[12px] leading-[16px] text-[#94a3b8]">
                      Saved: ${fmt(goal.currentAmount)} of ${fmt(goal.targetAmount)}
                    </p>
                  </div>
                  <p className="font-bold text-[12px] leading-[16px]" style={{ color: statusColor }}>
                    {statusText}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="bg-[#334155] h-[8px] relative rounded-[9999px] w-full overflow-hidden shrink-0">
                  {pct > 0 && (
                    <div
                      className="absolute bg-[#007bff] inset-y-0 left-0 rounded-[9999px]"
                      style={{ right: `${100 - pct}%` }}
                    />
                  )}
                </div>
                {/* Due + chevron */}
                <div className="flex items-center justify-between w-full">
                  <p className="font-medium text-[12px] leading-[16px] text-[#94a3b8]">
                    Due {due}
                  </p>
                  <div className="h-[7px] relative shrink-0 w-[4.317px]">
                    <img alt="" className="absolute block max-w-none size-full" src={imgGoalChev} />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Completed goals */}
          {completedGoals.map(goal => (
            <button
              key={goal.id}
              onClick={() => navigate(`/save/goal/${goal.id}`)}
              className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-[12px] p-[17px] flex flex-col gap-[12px] w-full text-left shrink-0"
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col items-start shrink-0">
                  <p className="font-semibold text-[16px] leading-[24px] text-[#f1f5f9]">
                    {goal.name}
                  </p>
                  <p className="font-medium text-[12px] leading-[16px] text-[#94a3b8]">
                    Saved: ${fmt(goal.currentAmount)} of ${fmt(goal.targetAmount)}
                  </p>
                </div>
                <p className="font-bold text-[12px] leading-[16px] text-[#00e6ff]">
                  Completed
                </p>
              </div>
              <div className="bg-[#334155] h-[8px] rounded-[9999px] w-full overflow-hidden shrink-0">
                <div className="bg-[#007bff] h-full w-full rounded-[9999px]" />
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="font-medium text-[12px] leading-[16px] text-[#94a3b8]">
                  Goal reached
                </p>
                <div className="h-[7px] relative shrink-0 w-[4.317px]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgGoalChev} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Locked Savings Section (168:286) ─────────────────────── */}
        <div className="flex flex-col gap-[16px] mt-[24px] px-6 pb-[8px]">

          {/* Section header */}
          <div className="flex items-center justify-between shrink-0">
            <p className="font-semibold text-[18px] leading-[28px] text-[#f1f5f9]">
              Locked Savings
            </p>
            <button
              onClick={() => setActiveFlow('locked')}
              className="flex items-center gap-[4px]"
            >
              <p className="font-semibold text-[14px] leading-[20px] text-[#007bff] text-center">
                Lock Funds
              </p>
              <div className="relative shrink-0 size-[10.5px]">
                <img alt="" className="absolute block max-w-none size-full" src={imgChevron} />
              </div>
            </button>
          </div>

          {/* Lock card — cyan left accent border (168:294) */}
          <div
            className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] border-l-[#00e6ff] rounded-[12px] flex flex-col gap-[8px] items-start pl-[20px] pr-[17px] py-[17px] shrink-0"
            style={{ borderLeftWidth: 4, borderLeftColor: '#00e6ff' }}
          >
            {/* Top row: name + badge */}
            <div className="flex items-start justify-between w-full">
              <div className="flex flex-col gap-[4px]">
                <p className="font-medium text-[16px] leading-[24px] text-[#f1f5f9]">
                  3-Month Lock
                </p>
                <p className="font-semibold text-[20px] leading-[28px] text-white">
                  $500.00
                </p>
              </div>
              <div className="bg-[rgba(0,230,255,0.1)] px-[8px] py-[4px] rounded-[4px]">
                <p className="font-medium text-[12px] leading-[16px] text-[#00e6ff]">Active</p>
              </div>
            </div>

            {/* Unlock date */}
            <p className="font-medium text-[12px] leading-[16px] text-[#94a3b8]">
              Unlocks Jun 3, 2026
            </p>

            {/* Bolt + earning line */}
            <div className="flex items-center gap-[8px]">
              <div className="h-[7px] relative shrink-0 w-[11.667px]">
                <img alt="" className="absolute block max-w-none size-full" src={imgBolt} />
              </div>
              <p className="font-medium text-[12px] leading-[16px] text-[#cbd5e1]">
                Earning steadily until unlock
              </p>
            </div>
          </div>
        </div>

        {/* ── Recent Activity ──────────────────────────────────────── */}
        <div className="mx-6 mt-[24px] bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden p-[20px] flex flex-col gap-[4px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <p className="font-medium text-[14px] leading-[18px] text-white mb-[4px]">
            Recent Activity
          </p>
          <TransactionList
            transactions={savingsTxs}
            limit={5}
            emptyMessage="No savings activity yet."
          />
        </div>

      </div>

      {/* ── Flow overlays ────────────────────────────────────────────── */}
      {activeFlow === 'choose' && (
        <FlowPortal>
          <ChooseSavingsStyle
            onSelect={flow => setActiveFlow(flow)}
            onBack={close}
          />
        </FlowPortal>
      )}
      {activeFlow === 'flexible' && (
        <FlowPortal>
          <FlexibleSavingsFlow onExit={close} />
        </FlowPortal>
      )}
      {activeFlow === 'goal' && (
        <FlowPortal>
          <GoalSavingsFlow onExit={close} />
        </FlowPortal>
      )}
      {activeFlow === 'locked' && (
        <FlowPortal>
          <LockedSavingsFlow onExit={close} />
        </FlowPortal>
      )}
    </>
  );
}
