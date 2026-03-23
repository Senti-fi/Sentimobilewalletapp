/**
 * GoalSavingsFlow › Step 2 — Goal Setup
 * Figma frame: 133:1606 "Goal Setup"
 *
 * Full-page form: Goal Name, Target Amount, Target Date.
 * Two terms-agreement toggles (both must be ON before CTA enables).
 * "Create Goal" → onNext({ goalName, targetAmount, deadline, agreedToTerms: true })
 */
import { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import PageHeader from '../../../../components/ui/PageHeader';
import type { StepProps, GoalSavingsData } from '../../types';

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function GoalSetupStep({ data, onNext, onBack }: StepProps<GoalSavingsData>) {
  const [goalName,     setGoalName]     = useState(data.goalName     || '');
  const [targetAmount, setTargetAmount] = useState(data.targetAmount || '');
  const [deadline,     setDeadline]     = useState(data.deadline     || '');
  const [agreed1,      setAgreed1]      = useState(false);
  const [agreed2,      setAgreed2]      = useState(false);

  const dateRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    goalName.trim().length > 0 &&
    parseFloat(targetAmount) > 0 &&
    deadline.length > 0 &&
    agreed1 && agreed2;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onNext({ goalName, targetAmount, deadline, agreedToTerms: true });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        <PageHeader title="Create a Goal" onBack={onBack} />

        {/* Subtitle */}
        <p className="px-6 text-[#8ac7ff] font-normal text-[14px] leading-[20px] mb-6 shrink-0">
          What goal are you saving towards?
        </p>

        {/* ── Goal Name ─────────────────────────────────────────────── */}
        <div className="mx-6 flex flex-col gap-2 mb-6 shrink-0">
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">Goal Name</p>
          <div className="bg-[#1a2540] border border-[#3c5679] rounded-[12px] h-14 flex items-center px-4">
            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              placeholder="e.g. Rent, Emergency Fund, Vacation"
              className="flex-1 bg-transparent text-white font-normal text-[16px] leading-[20px] focus:outline-none placeholder:text-[rgba(255,255,255,0.3)]"
            />
          </div>
        </div>

        {/* ── Target Amount ─────────────────────────────────────────── */}
        <div className="mx-6 flex flex-col gap-2 mb-6 shrink-0">
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
            How much do you need for this goal?
          </p>
          <div className="bg-[#1a2540] border border-[#3c5679] rounded-[12px] h-14 flex items-center px-4 gap-1">
            <span className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white font-normal text-[16px] leading-[20px] focus:outline-none placeholder:text-[rgba(255,255,255,0.3)]"
            />
          </div>
        </div>

        {/* ── Target Date ───────────────────────────────────────────── */}
        <div className="mx-6 flex flex-col gap-2 mb-6 shrink-0">
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
            When do you want to reach this goal?
          </p>
          <div
            className="bg-[#1a2540] border border-[#3c5679] rounded-[12px] h-14 flex items-center justify-between px-4 relative cursor-pointer"
            onClick={() => dateRef.current?.showPicker?.()}
          >
            <p className={`font-normal text-[12px] leading-[16px] ${deadline ? 'text-white' : 'text-[#8ac7ff]'}`}>
              {deadline ? formatDisplayDate(deadline) : 'Select a date'}
            </p>
            <Calendar size={20} className="text-[#8ac7ff] shrink-0" />
            {/* Hidden date input — triggers native picker */}
            <input
              ref={dateRef}
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              aria-label="Target date"
            />
          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────────── */}
        <div className="mx-6 bg-[#162040] border border-[#3c5679] rounded-[20px] p-5 flex gap-4 items-center mb-4 shrink-0 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="text-white font-normal text-[12px] leading-[16px] flex-1">
            Name your goal something personal. It makes you{' '}
            <span className="font-bold">40% more likely</span> to complete it.
          </p>
        </div>

        {/* ── Terms row 1 ───────────────────────────────────────────── */}
        <TermsRow agreed={agreed1} onToggle={() => setAgreed1(v => !v)} />

        {/* ── Terms row 2 ───────────────────────────────────────────── */}
        <TermsRow agreed={agreed2} onToggle={() => setAgreed2(v => !v)} />

        {/* ── Create Goal CTA ───────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mx-6 mb-8 bg-[#007bff] rounded-[12px] h-14 flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          style={{ boxShadow: '0px 10px 15px -3px rgba(0,123,255,0.2)' }}
        >
          <span className="text-white font-semibold text-[16px] leading-[20px]">Create Goal</span>
        </button>
      </div>
    </div>
  );
}

// ── Terms toggle row ─────────────────────────────────────────────────

function TermsRow({ agreed, onToggle }: { agreed: boolean; onToggle: () => void }) {
  return (
    <div className="mx-6 flex gap-4 items-start mb-4 shrink-0">
      {/* Functional toggle pill */}
      <button
        role="switch"
        aria-checked={agreed}
        onClick={onToggle}
        className={`shrink-0 rounded-full transition-colors duration-200 flex items-center mt-0.5 ${
          agreed ? 'bg-[#007bff]' : 'bg-[#334155]'
        }`}
        style={{ width: 44, height: 24, padding: 2 }}
      >
        <span
          className="bg-white rounded-full shadow-sm transition-transform duration-200 block shrink-0"
          style={{ width: 20, height: 20, transform: agreed ? 'translateX(20px)' : 'translateX(0px)' }}
        />
      </button>
      <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] flex-1">
        I hereby agree that i will forfeit the interest accrued on this Goal savings if i fail
        to meet this target amount by the set withdrawal date.
      </p>
    </div>
  );
}
