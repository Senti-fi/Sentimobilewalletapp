/**
 * GoalDetailPage
 * Route: /save/goal/:goalId
 *
 * Shows the full detail of a single goal (active or completed).
 * Tapping "Add Funds" opens a portal bottom sheet that calls fundGoal()
 * from the simulation engine.
 */
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store';
import type { Goal } from '../../store';
import TransactionList from '../../components/TransactionList';
import { getTransactionsByContext } from '../../data/transactionUtils';

// ── Helpers ─────────────────────────────────────────────────────────

function pct(goal: Goal) {
  if (goal.targetAmount === 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

function statusLabel(goal: Goal): { text: string; color: string } {
  if (goal.status === 'completed') return { text: 'Completed', color: '#32fc65' };
  if (goal.status === 'expired')   return { text: 'Overdue',   color: '#ff4444' };
  const p = pct(goal);
  if (p >= 70) return { text: 'Almost there', color: '#00e6ff' };
  if (p >= 30) return { text: 'On track',     color: '#00e6ff' };
  return { text: 'Just started', color: '#8ac7ff' };
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function lucyMessage(goal: Goal): string {
  const p = pct(goal);
  if (goal.status === 'completed')
    return `You reached your "${goal.name}" goal. Well done — every dollar saved is a step forward.`;
  if (goal.status === 'expired')
    return `Your "${goal.name}" goal passed its deadline. You can still add funds to keep working toward it.`;
  if (p >= 70)
    return `You're ${p}% of the way to "${goal.name}". One more push and you'll hit it.`;
  if (p >= 30)
    return `Great progress on "${goal.name}". Consistent contributions make a big difference.`;
  return `You've just started "${goal.name}". Even small deposits add up over time.`;
}

// ── Quick amount pills ───────────────────────────────────────────────
const QUICK_AMOUNTS = [100, 250, 500, 1000];

// ── Fund Goal Sheet (portalled bottom sheet) ─────────────────────────
function FundGoalSheet({
  goal,
  onClose,
}: {
  goal: Goal;
  onClose: () => void;
}) {
  const { balances, fundGoal } = useAppStore();
  const [rawAmt, setRawAmt] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [funded, setFunded] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const availableBalance = balances[goal.asset];
  const amount = parseFloat(rawAmt) || 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  function handleQuick(v: number) {
    setRawAmt(String(v));
    setError('');
  }

  function handleConfirm() {
    const result = fundGoal({ goalId: goal.id, amount });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFunded(amount);
    setSuccess(true);
  }

  const root = document.getElementById('root');
  if (!root) return null;

  return createPortal(
    <div className="absolute inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(10,20,47,0.7)]"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0a142f] rounded-t-[24px] pb-[32px]">

        {/* Handle */}
        <div className="flex justify-center pt-[16px] pb-[8px]">
          <div className="bg-[#8ac7ff] h-[4px] rounded-[8px] w-[40px]" />
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-[20px] px-6 pt-[16px] pb-[8px]">
            <div className="bg-[#1a3a6b] size-[72px] rounded-full flex items-center justify-center shadow-[0px_0px_20px_4px_rgba(0,123,255,0.25)]">
              <span className="text-[32px]">{goal.emoji}</span>
            </div>
            <div className="flex flex-col items-center gap-[8px]">
              <p className="font-semibold text-[20px] leading-[28px] text-white text-center">
                Funds Added!
              </p>
              <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff] text-center">
                ${fmt(funded)} added to &ldquo;{goal.name}&rdquo;
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-[#007bff] rounded-[12px] flex items-center justify-center py-[16px] w-full"
            >
              <p className="font-semibold text-[16px] leading-[20px] text-white">Done</p>
            </button>
          </div>
        ) : (
          /* ── Entry state ── */
          <>
            {/* Header row */}
            <div className="flex items-center justify-between px-6 pb-[8px]">
              <button onClick={onClose} className="flex items-center justify-center size-[24px] shrink-0 text-white">
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
              <p className="font-bold text-[18px] leading-[24px] text-white">Add Funds</p>
              <div className="size-[24px]" />
            </div>

            {/* Goal name badge */}
            <div className="flex justify-center pb-[4px]">
              <div className="bg-[rgba(0,123,255,0.15)] border border-[rgba(0,123,255,0.3)] rounded-full px-[12px] py-[4px] flex items-center gap-[6px]">
                <span className="text-[14px]">{goal.emoji}</span>
                <p className="font-medium text-[12px] leading-[16px] text-[#8ac7ff]">{goal.name}</p>
              </div>
            </div>

            {/* Amount label */}
            <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] text-center mt-[16px]">
              Deposit Amount
            </p>

            {/* Large amount input */}
            <div className="flex justify-center mt-[8px] px-6">
              <div className="flex items-baseline gap-[2px]">
                <span className="font-bold text-[32px] leading-[40px] text-[#8ac7ff]">$</span>
                <input
                  ref={inputRef}
                  type="number"
                  min="0"
                  value={rawAmt}
                  onChange={e => { setRawAmt(e.target.value); setError(''); }}
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none font-bold text-[56px] leading-[normal] tracking-[-0.64px] text-white text-center w-[220px]"
                />
              </div>
            </div>

            {/* Available balance + remaining */}
            <div className="flex items-center justify-center gap-[4px] mt-[8px]">
              <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">
                Available:
              </p>
              <p className="font-bold text-[14px] leading-[18px] text-[#00e6ff]">
                ${fmt(availableBalance)} {goal.asset}
              </p>
            </div>

            {remaining > 0 && (
              <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] text-center mt-[4px]">
                ${fmt(remaining)} still needed to reach goal
              </p>
            )}

            {/* Quick pills */}
            <div className="flex items-center justify-center gap-[8px] mt-[20px] px-6">
              {QUICK_AMOUNTS.map(v => (
                <button
                  key={v}
                  onClick={() => handleQuick(v)}
                  className={`flex-1 flex items-center justify-center py-[13px] rounded-[12px] border ${
                    amount === v
                      ? 'bg-[#007bff] border-[#007bff]'
                      : 'bg-[#0a142f] border-[#262626]'
                  }`}
                >
                  <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
                    ${v >= 1000 ? '1k' : v}
                  </p>
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="font-normal text-[12px] leading-[16px] text-[#ff4444] text-center mt-[12px] px-6">
                {error}
              </p>
            )}

            {/* CTA */}
            <div className="px-6 mt-[24px]">
              <button
                disabled={amount <= 0}
                onClick={handleConfirm}
                className="w-full bg-[#007bff] disabled:opacity-40 rounded-[12px] flex items-center justify-center py-[16px] shadow-[0px_10px_15px_-3px_rgba(0,123,255,0.2)]"
              >
                <p className="font-semibold text-[16px] leading-[20px] text-white">
                  {amount > 0 ? `Fund Goal · $${fmt(amount)}` : 'Enter Amount'}
                </p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    root,
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function GoalDetailPage() {
  const { goalId }     = useParams<{ goalId: string }>();
  const navigate       = useNavigate();
  const goals          = useAppStore(s => s.goals);
  const transactions   = useAppStore(s => s.transactions);
  const [showFund, setShowFund] = useState(false);

  const goal = goals.find(g => g.id === goalId);

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a142f] gap-[16px] px-6">
        <p className="font-semibold text-[18px] leading-[24px] text-white text-center">
          Goal not found
        </p>
        <button
          onClick={() => navigate('/save')}
          className="bg-[#007bff] rounded-[12px] px-6 py-[14px]"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white">Back to Savings</p>
        </button>
      </div>
    );
  }

  const progress  = pct(goal);
  const status    = statusLabel(goal);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isActive  = goal.status === 'active';

  const goalTxs = getTransactionsByContext(transactions, 'savings')
    .filter(tx => tx.destination === goal.name || tx.source === goal.name);

  const dueDateDisplay = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  return (
    <>
      {showFund && (
        <FundGoalSheet goal={goal} onClose={() => setShowFund(false)} />
      )}

      <div className="flex flex-col bg-[#0a142f] pb-[32px]">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-[68px] pb-[12px]">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[24px] shrink-0 text-white">
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <p className="font-semibold text-[16px] leading-[20px] text-white whitespace-nowrap">
            {goal.emoji} {goal.name}
          </p>
          <div className="size-[24px]" />
        </div>

        {/* ── Summary Card ────────────────────────────────────────── */}
        <div
          className="mx-6 rounded-[20px] p-[24px] flex flex-col items-center gap-[12px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]"
          style={{ background: 'linear-gradient(145deg, #007bff 0%, #0a3060 100%)' }}
        >
          {/* Status badge */}
          <div className="bg-[rgba(10,48,96,0.6)] px-[12px] py-[4px] rounded-full">
            <p className="font-semibold text-[12px] leading-[16px]" style={{ color: status.color }}>
              {status.text}
            </p>
          </div>

          {/* Emoji */}
          <div className="size-[72px] rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
            <span className="text-[40px]">{goal.emoji}</span>
          </div>

          {/* Amounts */}
          <div className="flex flex-col items-center gap-[2px]">
            <p className="font-bold text-[36px] leading-[40px] tracking-[-0.9px] text-white">
              ${fmt(goal.currentAmount)}
            </p>
            <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.6)]">
              of ${fmt(goal.targetAmount)} goal
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[rgba(255,255,255,0.15)] h-[8px] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: goal.status === 'completed' ? '#32fc65' : '#00e6ff',
              }}
            />
          </div>

          <p className="font-semibold text-[14px] leading-[18px] text-[rgba(255,255,255,0.8)]">
            {progress}% complete
          </p>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="mx-6 mt-[20px] grid grid-cols-2 gap-[12px]">
          {[
            { label: 'Saved So Far',  value: `$${fmt(goal.currentAmount)}`,  accent: false },
            { label: 'Still Needed',  value: remaining > 0 ? `$${fmt(remaining)}` : 'Goal reached!', accent: remaining === 0 },
            { label: 'Due Date',      value: dueDateDisplay,                  accent: false },
            { label: 'Interest',      value: '4.5% p.a.',                    accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-[#1a2540] rounded-[16px] p-[16px] flex flex-col gap-[6px]">
              <p className="font-normal text-[11px] leading-[15px] uppercase text-[rgba(255,255,255,0.5)] tracking-wide">
                {label}
              </p>
              <p className={`font-semibold text-[14px] leading-[20px] ${accent ? 'text-[#32fc65]' : 'text-white'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Completed banner ────────────────────────────────────── */}
        {goal.status === 'completed' && (
          <div className="mx-6 mt-[20px] bg-[rgba(50,252,101,0.08)] border border-[rgba(50,252,101,0.25)] rounded-[16px] p-[20px] flex flex-col items-center gap-[8px]">
            <p className="text-[28px]">🎉</p>
            <p className="font-bold text-[18px] leading-[24px] text-[#32fc65] text-center">
              Goal Achieved!
            </p>
            <p className="font-normal text-[13px] leading-[18px] text-[rgba(255,255,255,0.6)] text-center">
              You successfully reached your &ldquo;{goal.name}&rdquo; goal. Keep it up!
            </p>
          </div>
        )}

        {/* ── Lucy Card ───────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] mx-6 mt-[20px] flex gap-[16px] items-center p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <div className="bg-[#007bff] rounded-full size-[32px] flex items-center justify-center shrink-0">
            <p className="font-bold text-[14px] leading-[20px] text-white">L</p>
          </div>
          <div className="flex-1 flex flex-col gap-[4px] min-w-0">
            <p className="font-normal text-[12px] leading-[16px] text-white">
              {lucyMessage(goal)}
            </p>
            {isActive && (
              <button
                onClick={() => setShowFund(true)}
                className="flex gap-[4px] items-center self-start"
              >
                <p className="font-medium text-[14px] leading-[18px] text-[#007bff] whitespace-nowrap">
                  Add funds now
                </p>
                <ArrowRight size={14} strokeWidth={2} className="text-[#007bff]" />
              </button>
            )}
          </div>
        </div>

        {/* ── Add Funds / Re-open button ───────────────────────────── */}
        {isActive && (
          <div className="mx-6 mt-[20px]">
            <button
              onClick={() => setShowFund(true)}
              className="w-full bg-[#007bff] rounded-[12px] flex items-center justify-center py-[16px] shadow-[0px_10px_15px_-3px_rgba(0,123,255,0.2)]"
            >
              <p className="font-semibold text-[16px] leading-[20px] text-white">Add Funds</p>
            </button>
          </div>
        )}

        {/* ── Recent Activity ─────────────────────────────────────── */}
        <div className="mx-6 mt-[24px] bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden p-[20px] flex flex-col gap-[4px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <p className="font-medium text-[14px] leading-[18px] text-white mb-[4px]">
            Recent Activity
          </p>
          <TransactionList
            transactions={goalTxs}
            limit={10}
            emptyMessage="No activity yet for this goal."
          />
        </div>

      </div>
    </>
  );
}
