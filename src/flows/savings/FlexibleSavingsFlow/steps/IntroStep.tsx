/**
 * FlexibleSavingsFlow › Step 1 — Flexible Savings overview
 * Figma frame: 185:267
 *
 * Scrollable page. FAB at bottom-[86px] right-[16px] (6px above bottom nav).
 */
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import PageHeader from '../../../../components/ui/PageHeader';
import type { StepProps, FlexibleSavingsData } from '../../types';
import { useAppStore } from '../../../../store';
import type { FlexibleSavings } from '../../../../store';
import TransactionList from '../../../../components/TransactionList';
import { getTransactionsByContext } from '../../../../data/transactionUtils';
import { useHasSeenIntro } from '../../../../hooks/useHasSeenIntro';
import EarningsChart from '../../../../components/EarningsChart';
import { generateVaultSeries } from '../../../../data/portfolioTimeSeries';
import type { Period } from '../../../../data/portfolioTimeSeries';

// ── Figma asset URLs (185:267) ─────────────────────────────────────────
const imgWave        = 'https://www.figma.com/api/mcp/asset/e012906e-211b-4f9d-9321-120a51820350'; // Wave BG
const imgPlus        = 'https://www.figma.com/api/mcp/asset/c95d20df-aafb-414d-8136-ae85928dde87'; // Plus icon
const imgCirclesFour = 'https://www.figma.com/api/mcp/asset/55b8e8bf-d17a-42f9-9807-2e6e17221fe5'; // CirclesFour
const imgFabIcon     = 'https://www.figma.com/api/mcp/asset/3ded90ae-4d77-4827-8ee0-c094aa73ee0d'; // FAB icon

// ── Earnings helpers ───────────────────────────────────────────────────

const SEEDED_TODAY      = new Date('2026-03-17T00:00:00.000Z');
const SEEDED_MONTH_START = new Date('2026-03-01T00:00:00.000Z');

function computeEarnings(savings: FlexibleSavings) {
  const dailyRate = savings.apy / 100 / 365;

  const daysThisMonth = Math.max(
    0,
    (SEEDED_TODAY.getTime() - SEEDED_MONTH_START.getTime()) / (1000 * 60 * 60 * 24),
  );

  const daysActive = savings.createdAt
    ? Math.max(
        0,
        (SEEDED_TODAY.getTime() - new Date(savings.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  const earnedThisMonth = savings.balance * dailyRate * daysThisMonth;
  // Actual % earned this month relative to current balance (not promised APY)
  const monthPct = savings.balance > 0 ? (earnedThisMonth / savings.balance) * 100 : 0;

  return {
    earnedThisMonth,
    totalEarned: savings.balance * dailyRate * daysActive,
    daysActive:  Math.round(daysActive),
    monthPct,
  };
}

// ── Savings Insights Sheet ─────────────────────────────────────────────

const PERIODS: Period[] = ['7D', '30D', '3M', 'All'];

function InsightsSheet({
  savings,
  earnedThisMonth,
  totalEarned,
  monthPct,
  onClose,
}: {
  savings: FlexibleSavings;
  earnedThisMonth: number;
  totalEarned: number;
  monthPct: number;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState<Period>('30D');
  const root = document.getElementById('root');

  const chartData = useMemo(() => {
    if (savings.balance === 0 || !savings.createdAt) return [];
    return generateVaultSeries(
      {
        depositedAmount: savings.balance,
        apy:             savings.apy,
        depositedAt:     savings.createdAt,
        currentValue:    savings.balance,
      },
      period,
    );
  }, [savings, period]);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!root) return null;

  return createPortal(
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-50 bg-[#0f1d3a] rounded-t-[24px] overflow-hidden"
          style={{ maxHeight: '80vh' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-[12px] pb-[4px]">
            <div className="w-[36px] h-[4px] bg-[rgba(255,255,255,0.18)] rounded-[9999px]" />
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 20px)' }}>
            <div className="px-6 pb-[32px]">

              {/* Header */}
              <div className="flex items-center justify-between pt-[4px] pb-[20px]">
                <p className="font-semibold text-[18px] leading-[24px] text-white">Savings Insights</p>
                <button
                  onClick={onClose}
                  className="size-[32px] flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Period tabs */}
              <div className="flex gap-[8px] mb-[16px]">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`flex-1 rounded-[8px] py-[8px] font-semibold text-[12px] leading-[16px] transition-colors ${
                      period === p
                        ? 'bg-[#007bff] text-white'
                        : 'bg-[#1a2540] text-[rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Growth chart */}
              <div className="mb-[20px]">
                {chartData.length > 0 ? (
                  <EarningsChart data={chartData} periodKey={period} height={140} />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-[12px] bg-[#1a2540]"
                    style={{ height: 140 }}
                  >
                    <p className="text-[rgba(255,255,255,0.3)] font-normal text-[13px] leading-[18px] text-center px-6">
                      Make your first deposit to see growth
                    </p>
                  </div>
                )}
              </div>

              {/* Stat rows */}
              <div className="bg-[#1a2540] rounded-[16px] px-[16px]">
                <InsightRow label="Current Balance"   value={`$${fmt(savings.balance)}`} />
                <InsightRow label="Earned This Month" value={`+$${fmt(earnedThisMonth)}`} accent />
                <InsightRow label="Total Earned"      value={`+$${fmt(totalEarned)}`}     accent />
                <InsightRow
                  label="Rate Earned (MTD)"
                  value={savings.balance > 0 ? `+${monthPct.toFixed(3)}%` : '—'}
                  last
                />
              </div>

            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    root,
  );
}

function InsightRow({
  label, value, accent = false, last = false,
}: {
  label: string; value: string; accent?: boolean; last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-[14px] ${last ? '' : 'border-b border-[rgba(255,255,255,0.06)]'}`}>
      <p className="font-normal text-[13px] leading-[18px] text-[rgba(255,255,255,0.5)]">{label}</p>
      <p className={`font-medium text-[13px] leading-[18px] ${accent ? 'text-[#00e6ff]' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export default function IntroStep(props: StepProps<FlexibleSavingsData>) {
  const { onNext, onBack } = props;
  const [autoSave, setAutoSave]         = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const { isFirstVisit, markSeen }      = useHasSeenIntro('hasSeenFlexibleSavingsIntro');
  const transactions    = useAppStore(s => s.transactions);
  const flexibleSavings = useAppStore(s => s.flexibleSavings);
  const flexibleTxs     = getTransactionsByContext(transactions, 'savings')
    .filter(tx => tx.type === 'deposit');

  const { earnedThisMonth, totalEarned, daysActive, monthPct } = computeEarnings(flexibleSavings);

  // Mark intro as seen when user navigates forward (Quick Save / FAB)
  const handleNext = () => {
    markSeen();
    onNext();
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full bg-[#0a142f] relative">

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        {/* Header — ArrowLeft + "Flexible Savings" centered */}
        <PageHeader title="Flexible Savings" onBack={onBack} />

        {/* Subtitle + trait chips — first visit only */}
        {isFirstVisit && (
          <>
            <p className="px-6 text-[#8ac7ff] font-medium text-[14px] leading-[18px] mb-3 shrink-0">
              Save freely, withdraw anytime. Lower returns, but full access to your money whenever you need it.
            </p>
            <div className="px-6 flex items-center gap-[8px] mb-4 shrink-0">
              <span className="bg-[rgba(255,176,32,0.12)] text-[#ffb020] font-semibold text-[10px] leading-[15px] uppercase tracking-[0.5px] rounded-[9999px] px-[10px] py-[4px]">
                Low Returns
              </span>
              <span className="bg-[rgba(0,230,255,0.12)] text-[#00e6ff] font-semibold text-[10px] leading-[15px] uppercase tracking-[0.5px] rounded-[9999px] px-[10px] py-[4px]">
                High Flexibility
              </span>
              <span className="bg-[rgba(0,230,255,0.12)] text-[#00e6ff] font-semibold text-[10px] leading-[15px] uppercase tracking-[0.5px] rounded-[9999px] px-[10px] py-[4px]">
                No Lock Period
              </span>
            </div>
          </>
        )}

        {/* ── Savings Balance card ──────────────────────────────────── */}
        <div
          className="mx-6 bg-[#007bff] rounded-[20px] overflow-hidden relative shrink-0 mb-2"
          style={{ height: 176 }}
          onClick={() => setShowInsights(true)}
        >
          {/* Wave BGs */}
          <div className="absolute inset-[0_12.46%_-17.22%_0]">
            <img alt="" className="absolute block max-w-none size-full" src={imgWave} />
          </div>
          <div className="absolute inset-[0_-75.07%_-17.22%_87.54%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgWave} />
          </div>

          {/* Balance + earnings — top-left */}
          <div className="absolute left-5 top-5 flex flex-col gap-[4px] text-white w-[185px]">
            <p className="font-normal text-[12px] leading-[16px] opacity-80">Savings Balance</p>
            <p className="font-bold text-[32px] leading-[32px] tracking-[-0.64px]">
              ${fmt(flexibleSavings.balance)}
            </p>
            <p className="font-semibold text-[12px] leading-[16px] text-[#32fc65]">
              +${fmt(earnedThisMonth)} this month
            </p>
          </div>

          {/* Earned % badge — top-right, only when actively earning */}
          {flexibleSavings.balance > 0 && (
            <div className="absolute right-5 top-5 bg-[rgba(50,252,101,0.15)] px-[8px] py-[4px] rounded-[16px]">
              <p className="text-[#32fc65] font-semibold text-[11px] leading-[15px] whitespace-nowrap">
                +{monthPct.toFixed(3)}% MTD
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute left-5 bottom-[12px] flex gap-3 items-center">
            <button
              onClick={e => { e.stopPropagation(); handleNext(); }}
              className="border border-[#b3fbff] rounded-[22px] flex items-center gap-2 pl-2 pr-3 py-2.5"
            >
              <div className="size-4 relative shrink-0">
                <img alt="" className="absolute block max-w-none size-full" src={imgPlus} />
              </div>
              <p className="text-white font-normal text-[12px] leading-[16px] whitespace-nowrap">
                Quick Save
              </p>
            </button>
            <button
              onClick={e => e.stopPropagation()}
              className="border border-[#b3fbff] rounded-[22px] flex items-center gap-2 pl-2 pr-3 py-2.5"
            >
              <div className="size-4 relative shrink-0">
                <img alt="" className="absolute block max-w-none size-full" src={imgPlus} />
              </div>
              <p className="text-white font-normal text-[12px] leading-[16px] whitespace-nowrap">
                Withdraw
              </p>
            </button>
            {/* CirclesFour — opens Insights */}
            <button
              onClick={e => { e.stopPropagation(); setShowInsights(true); }}
              className="border border-[#b3fbff] rounded-[22px] flex items-center justify-center px-3 py-2.5"
            >
              <div className="size-4 relative shrink-0">
                <img alt="" className="absolute block max-w-none size-full" src={imgCirclesFour} />
              </div>
            </button>
          </div>
        </div>

        {/* Context text — shown when balance > 0 */}
        {flexibleSavings.balance > 0 && daysActive > 0 && (
          <p className="px-6 text-[rgba(255,255,255,0.35)] font-normal text-[11px] leading-[15px] mb-4 shrink-0">
            You&apos;ve earned ${fmt(totalEarned)} in {daysActive} day{daysActive !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Earnings strip — always visible ──────────────────────── */}
        <div className="mx-6 mb-4 shrink-0">
          <button
            onClick={() => setShowInsights(true)}
            className="w-full bg-[#1a2540] rounded-[16px] flex items-stretch"
          >
            <StatCell label="This Month" value={`+$${fmt(earnedThisMonth)}`} color="text-[#32fc65]" />
            <div className="w-px bg-[rgba(255,255,255,0.06)] self-stretch" />
            <StatCell label="Total Earned" value={`+$${fmt(totalEarned)}`} color="text-[#00e6ff]" />
            <div className="w-px bg-[rgba(255,255,255,0.06)] self-stretch" />
            <StatCell
              label="Rate (MTD)"
              value={flexibleSavings.balance > 0 ? `+${monthPct.toFixed(3)}%` : '—'}
              color="text-white"
            />
          </button>
        </div>

        {/* ── Enable Auto-Save row ──────────────────────────────────── */}
        <div className="mx-6 flex items-center justify-between mb-4 shrink-0">
          <div className="flex-1 flex flex-col gap-1 pr-4">
            <p className="text-white font-medium text-[16px] leading-[24px]">Enable Auto-Save</p>
            <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] w-[265px]">
              Save automatically daily, weekly or monthly with Auto-Save. Lucy will remind you when it&apos;s due
            </p>
          </div>
          {/* Toggle: 44×24px pill, 20×20px knob */}
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
              style={{
                width: 20, height: 20,
                transform: autoSave ? 'translateX(20px)' : 'translateX(0px)',
              }}
            />
          </button>
        </div>

        {/* ── How It Works + Lucy Insight — first visit only ────────── */}
        {isFirstVisit && (
          <>
            <div className="mx-6 bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-[12px] p-[17px] flex flex-col gap-4 mb-4 shrink-0">
              <p className="text-white font-semibold text-[18px] leading-[24px]">How It Works</p>

              <div className="flex flex-col">
                {/* Step 1 */}
                <div className="flex gap-4 items-start h-[76px]">
                  <div className="flex flex-col items-center self-stretch shrink-0 relative isolate">
                    <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center z-[1] shrink-0">
                      <p className="text-white font-bold text-[16px] leading-[24px]">1</p>
                    </div>
                    <div className="absolute w-[2px] bg-[#007bff] left-1/2 -translate-x-1/2 top-[32px] bottom-[-22px] z-[3]" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 py-2">
                    <p className="text-white font-medium text-[16px] leading-[24px]">Add Money</p>
                    <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                      Deposit any amount anytime. No minimums, no maximums.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 items-start h-[76px]">
                  <div className="flex flex-col items-center self-stretch shrink-0 relative isolate">
                    <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center z-[1] shrink-0">
                      <p className="text-white font-bold text-[16px] leading-[24px]">2</p>
                    </div>
                    <div className="absolute w-[2px] bg-[#007bff] left-1/2 -translate-x-1/2 top-[32px] bottom-[-22px] z-[2]" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 py-2">
                    <p className="text-white font-medium text-[16px] leading-[24px]">Earn Daily</p>
                    <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                      Your balance earns returns every day automatically. No action needed.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 items-start h-[76px]">
                  <div className="flex flex-col items-center self-stretch shrink-0">
                    <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
                      <p className="text-white font-bold text-[16px] leading-[24px]">3</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 py-2">
                    <p className="text-white font-medium text-[16px] leading-[24px]">Withdraw Freely</p>
                    <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                      Access your money whenever you need it. No waiting, no penalties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lucy Insight */}
              <div className="bg-[rgba(0,123,255,0.1)] border border-[rgba(0,123,255,0.2)] rounded-[12px] p-[17px] flex gap-4 items-start">
                <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
                  <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
                </div>
                <div className="flex flex-col gap-[4px] flex-1">
                  <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
                    Best for everyday savings and emergency access. Withdraw without penalties — anytime.
                  </p>
                  <p className="text-[rgba(255,255,255,0.4)] font-normal text-[11px] leading-[15px]">
                    Returns are lower than Goal or Committed Savings, but your money is always yours.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms at a Glance */}
            <div className="mx-6 flex flex-col gap-2 mb-4 shrink-0">
              <p className="text-white font-semibold text-[18px] leading-[24px]">Terms at a Glance</p>
              <div className="bg-[#1a2540] border border-[rgba(0,123,255,0.2)] rounded-[12px] overflow-hidden">
                <TermRow label="Interest Rate"   value="4.5% per annum"   sub="Accrues daily, paid monthly" border />
                <TermRow label="Withdrawals"     value="Anytime, instant" valueColor="text-[#00e6ff]"       border />
                <TermRow label="Minimum Deposit" value="$1.00"                                              border />
                <TermRow label="Fees"            value="No management fees" />
              </div>
              <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] text-center opacity-80">
                *Terms are subject to change based on market conditions.
              </p>
            </div>
          </>
        )}

        {/* ── Recent Activities ─────────────────────────────────────── */}
        <div className="mx-6 bg-[rgba(30,41,59,0.4)] rounded-[20px] p-5 flex flex-col gap-[4px] mb-[120px] shrink-0">
          <p className="text-white font-medium text-[14px] leading-[18px] mb-[4px]">Recent Activities</p>
          <TransactionList
            transactions={flexibleTxs}
            limit={5}
            emptyMessage="No flexible savings activity yet."
          />
        </div>

      </div>

      {/* ── FAB — bottom-[86px] ─────────────────────────────────────── */}
      <button
        onClick={handleNext}
        className="absolute right-4 bg-[#007bff] rounded-full size-14 flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)]"
        style={{ bottom: 86 }}
      >
        <div className="h-[19px] w-[22px] relative">
          <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
        </div>
        <div className="absolute -top-1 -right-1 bg-[#00e6ff] border-2 border-[#007bff] rounded-full size-4" />
      </button>

      {/* ── Savings Insights Sheet ──────────────────────────────────── */}
      {showInsights && (
        <InsightsSheet
          savings={flexibleSavings}
          earnedThisMonth={earnedThisMonth}
          totalEarned={totalEarned}
          monthPct={monthPct}
          onClose={() => setShowInsights(false)}
        />
      )}

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center py-[14px] gap-[4px]">
      <p className="font-normal text-[10px] leading-[14px] uppercase tracking-[0.4px] text-[rgba(255,255,255,0.4)]">
        {label}
      </p>
      <p className={`font-semibold text-[14px] leading-[18px] ${color}`}>{value}</p>
    </div>
  );
}

function TermRow({
  label, value, sub, valueColor = 'text-white', border = false,
}: {
  label: string; value: string; sub?: string; valueColor?: string; border?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-[17px] ${border ? 'border-b border-[rgba(0,123,255,0.2)]' : ''}`}>
      {sub ? (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-[#94a3b8] font-normal text-[12px] leading-[16px]">{label}</p>
            <p className="text-white font-medium text-[16px] leading-[24px]">{value}</p>
          </div>
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] text-right whitespace-nowrap">{sub}</p>
        </>
      ) : (
        <>
          <p className="text-[#94a3b8] font-medium text-[14px] leading-[18px]">{label}</p>
          <p className={`font-medium text-[14px] leading-[18px] whitespace-nowrap ${valueColor}`}>{value}</p>
        </>
      )}
    </div>
  );
}
