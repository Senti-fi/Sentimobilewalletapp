/**
 * DepositConfirmStep
 *
 * Figma 284:1364 "deposit confirm"
 *
 * Layout:
 *   Header (ArrowLeft + "Confirm Deposit" centered)
 *   → Deposit Summary card (Vault / Amount / Est. Daily / Est. Annual / Withdrawal / New Balance)
 *   → Lucy card
 *   → Pinned footer: "Go Back" text + "Confirm Deposit $X" blue button
 */
import type { DepositStepProps } from '../types';

// ── Figma asset: ArrowLeft (284:1364 → imgVector5) ──────────────────
const imgArrowLeft = 'https://www.figma.com/api/mcp/asset/641b5d51-35d6-4586-a593-2c3ec59f7791';

const MOCK_CURRENT_BALANCE = 2342.91;

export default function DepositConfirmStep({
  data,
  onNext,
  onBack,
  vault,
}: DepositStepProps) {
  const amt     = parseFloat(data.amount);
  const daily   = amt * vault.apy / 100 / 365;
  const annual  = amt * vault.apy / 100;
  const newBal  = MOCK_CURRENT_BALANCE + amt;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Scrollable content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[8px]">

        {/* Header */}
        <div className="flex items-center justify-between px-[24px] pt-[68px] pb-[20px]">
          <button onClick={onBack} className="relative shrink-0 size-[24px]">
            <div className="absolute inset-[18.75%_12.5%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
            </div>
          </button>
          <p className="font-normal text-[20px] leading-[28px] text-white">
            Confirm Deposit
          </p>
          <div className="size-[24px]" />
        </div>

        {/* ── Deposit Summary card ─────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] mx-[24px] p-[17px] flex flex-col gap-[16px]">

          <p className="font-bold text-[16px] leading-[24px] text-white">Deposit Summary</p>

          <div className="flex flex-col gap-[12px]">

            {/* Vault */}
            <div className="flex items-center justify-between">
              <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Vault</p>
              <p className="font-bold text-[16px] leading-[24px] text-white">{vault.name}</p>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Amount</p>
              <p className="font-normal text-[16px] leading-[24px] text-white">${fmt(amt)}</p>
            </div>

            {/* Est. Daily Earnings */}
            <div className="flex items-center justify-between">
              <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Est. Daily Earnings</p>
              <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">
                ${daily.toFixed(2)}/day
              </p>
            </div>

            {/* Est. Annual Earnings */}
            <div className="flex items-center justify-between">
              <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Est. Annual Earnings</p>
              <p className="font-normal text-[16px] leading-[24px] text-[#00e6ff]">
                ≈ ${fmt(annual)}/year
              </p>
            </div>

            {/* Withdrawal */}
            <div className="flex items-center justify-between">
              <p className="font-normal text-[14px] leading-[20px] text-[#94a3b8]">Withdrawal</p>
              <p className="font-medium text-[16px] leading-[24px] text-white">
                {vault.withdrawal}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#262626]" />

            {/* New Vault Balance */}
            <div className="flex items-center justify-between pt-[4px]">
              <p className="font-bold text-[18px] leading-[28px] text-white">New Vault Balance</p>
              <p className="font-bold text-[20px] leading-[28px] text-[#00e6ff]">
                ${fmt(newBal)}
              </p>
            </div>

          </div>
        </div>

        {/* ── Lucy card ─────────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] mx-[24px] mt-[16px] flex gap-[16px] items-center p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          <div className="bg-[#007bff] rounded-full size-[32px] flex items-center justify-center shrink-0">
            <p className="font-bold text-[14px] leading-[20px] text-white">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            {vault.lucyConfirm}
          </p>
        </div>

      </div>

      {/* ── Pinned footer ────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[24px] pb-[20px] pt-[12px] flex flex-col gap-[12px]"
        style={{ background: 'rgba(10,20,47,0.95)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
        <button onClick={onBack} className="py-[8px]">
          <p className="font-semibold text-[14px] leading-[20px] text-[#8ac7ff] text-center">
            Go Back
          </p>
        </button>
        <button
          onClick={() => onNext()}
          className="bg-[#007bff] rounded-[12px] h-[56px] w-full"
        >
          <p className="font-bold text-[16px] leading-[24px] text-white text-center">
            Confirm Deposit ${amt.toFixed(0)}
          </p>
        </button>
      </div>

    </div>
  );
}
