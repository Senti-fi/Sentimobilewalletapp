/**
 * DepositSuccessStep
 *
 * Figma 284:1459 "deposit success"
 *
 * Layout:
 *   LockKey icon (glowing circle)
 *   → "Deposit Successful" title
 *   → Subtitle ("$X is now working in your [Vault]…")
 *   → Summary card (Deposited / Vault / Earnings Start rows)
 *   → Lucy card
 *   → Pinned footer: "Deposit More" link + "Back to Investments" button
 */
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { DepositStepProps } from '../types';

interface DepositSuccessStepProps extends DepositStepProps {
  onDepositMore: () => void;
}

export default function DepositSuccessStep({
  data,
  onExit,
  vault,
  onDepositMore,
}: DepositSuccessStepProps) {
  const navigate  = useNavigate();
  const amt       = parseFloat(data.amount);
  const fmt       = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Scrollable content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[8px]">

        {/* ── Success icon ─────────────────────────────────────────── */}
        <div className="flex justify-center pt-[84px] pb-[16px]">
          <div
            className="bg-[#1a3a6b] border border-[rgba(0,123,255,0.1)] rounded-full size-[100px] flex items-center justify-center"
            style={{ boxShadow: '0px 0px 20px 5px rgba(0,123,255,0.2)' }}
          >
            <Lock size={44} className="text-white" />
          </div>
        </div>

        {/* ── Title ────────────────────────────────────────────────── */}
        <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white text-center">
          Deposit Successful
        </p>

        {/* ── Subtitle ─────────────────────────────────────────────── */}
        <p
          className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center mx-auto mt-[8px]"
          style={{ width: 248 }}
        >
          ${fmt(amt)} is now working in your {vault.name}. Your earnings start immediately.
        </p>

        {/* ── Summary card ─────────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[16px] mx-[24px] mt-[24px] p-[21px] flex flex-col gap-[16px]">

          {/* Deposited */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Deposited</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">${fmt(amt)}</p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Vault */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Vault</p>
            <p className="font-semibold text-[16px] leading-[20px] text-white">{vault.name}</p>
          </div>

          <div className="bg-[#262626] h-px" />

          {/* Earnings Start */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">Earnings Start</p>
            <p className="font-semibold text-[16px] leading-[20px] text-[#00e6ff]">Immediately</p>
          </div>

        </div>

        {/* ── Lucy card ─────────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[12px] mx-[24px] mt-[16px] flex gap-[16px] items-center px-[20px] py-[8px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <div className="bg-[#007bff] rounded-full size-[32px] flex items-center justify-center shrink-0">
            <p className="font-bold text-[14px] leading-[20px] text-white">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            {vault.lucySuccess}
          </p>
        </div>

      </div>

      {/* ── Pinned footer ────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[24px] pb-[20px] pt-[12px] flex flex-col gap-[16px] items-center"
        style={{ background: 'rgba(10,20,47,0.95)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
        <button onClick={onDepositMore}>
          <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] text-center">
            Deposit More
          </p>
        </button>
        <button
          onClick={() => { onExit(); navigate('/invest'); }}
          className="bg-[#007bff] rounded-[12px] h-[56px] w-full"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Back to Investments
          </p>
        </button>
      </div>

    </div>
  );
}
