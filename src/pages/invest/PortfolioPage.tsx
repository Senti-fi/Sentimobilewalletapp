/**
 * PortfolioPage
 * Figma frame 289:1800 "portfolio"
 *
 * All summary metrics (total value, invested, earned, today, positions)
 * are derived live from the Zustand store.
 * The "Earnings Over Time" chart is dynamic — period toggle re-generates
 * the combined portfolio series via generatePortfolioSeries().
 */
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store';
import EarningsChart from '../../components/EarningsChart';
import { generatePortfolioSeries } from '../../data/portfolioTimeSeries';
import type { Period } from '../../data/portfolioTimeSeries';

// ── Figma asset URLs (289:1800) ──────────────────────────────────────
const imgFabIcon    = 'https://www.figma.com/api/mcp/asset/7690c701-7399-4b4a-a699-42f25855ec9c';
const imgArrowRight = 'https://www.figma.com/api/mcp/asset/838df032-1705-4a80-85e0-56c8abb07963';

// Vault name → route ID mapping for navigation
const VAULT_NAME_TO_ID: Record<string, string> = {
  'USDC Vault': 'usdc-vault',
  'USDT Vault': 'usdt-vault',
};

// ── Helpers ───────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Fill percentage for the allocation bar (% of total portfolio value) */
function barFill(value: number, total: number): string {
  if (total === 0) return '100%';
  return `${Math.max(2, Math.round((value / total) * 100))}%`;
}

// ── FAB ──────────────────────────────────────────────────────────────

function PortfolioFab() {
  const root = document.getElementById('root');
  if (!root) return null;
  return createPortal(
    <button className="absolute bg-[#007bff] bottom-[86px] flex items-center justify-center right-[16px] rounded-[9999px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)] size-[56px] z-40">
      <div className="h-[19px] relative shrink-0 w-[22px]">
        <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
      </div>
      <div className="absolute bg-[#00e6ff] border-2 border-[#007bff] right-[-4px] rounded-[9999px] size-[16px] top-[-4px]" />
    </button>,
    root,
  );
}

// ── Main Component ────────────────────────────────────────────────────

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('30D');

  // ── Store data ───────────────────────────────────────────────────
  const investments = useAppStore(s => s.investments);
  const active      = investments.filter(i => i.status === 'active');

  // ── Aggregate metrics ────────────────────────────────────────────
  const totalValue    = active.reduce((s, i) => s + i.currentValue,    0);
  const totalDeposited = active.reduce((s, i) => s + i.depositedAmount, 0);
  const totalEarned   = totalValue - totalDeposited;
  // Approximate today's yield: sum of (dailyRate * currentValue)
  const todayEarned   = active.reduce(
    (s, i) => s + i.currentValue * (i.apy / 100 / 365),
    0,
  );
  const monthPct      = totalDeposited > 0
    ? ((totalEarned / totalDeposited) * 100).toFixed(1)
    : '0.0';

  // ── Chart data (combined portfolio series) ───────────────────────
  const seriesOpts = active.map(i => ({
    depositedAmount: i.depositedAmount,
    apy:             i.apy,
    depositedAt:     i.depositedAt,
    currentValue:    i.currentValue,
  }));

  const chartData = useMemo(
    () => generatePortfolioSeries(seriesOpts, period),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, JSON.stringify(seriesOpts)],
  );

  const totalEarnedChart = chartData.length
    ? chartData[chartData.length - 1].earned
    : totalEarned;

  return (
    <>
      <PortfolioFab />

      <div className="flex flex-col bg-[#0a142f] pb-[32px]">

        {/* ── 1. Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-[68px] pb-[12px]">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[24px] shrink-0">
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <p className="font-semibold text-[16px] leading-[20px] text-white whitespace-nowrap">
            Portfolio Performance
          </p>
          <div className="size-[24px]" />
        </div>

        {/* ── 2. Summary Card ───────────────────────────────────────── */}
        <div
          className="mx-6 rounded-[20px] p-[24px] flex flex-col gap-[8px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
          style={{ background: 'linear-gradient(145.13deg, #007bff 0%, #0a3060 100%)' }}
        >
          {/* Month badge */}
          <div className="flex items-center justify-center">
            <div className="bg-[#0a3040] px-[12px] py-[4px] rounded-[9999px]">
              <p className="font-normal text-[10px] leading-[16px] text-[#00e6ff] whitespace-nowrap">
                +{monthPct}% this month
              </p>
            </div>
          </div>

          {/* Total value */}
          <div className="flex flex-col items-center pb-[8px]">
            <p className="font-semibold text-[36px] leading-[40px] tracking-[-0.9px] text-white text-center">
              ${fmt(totalValue)}
            </p>
          </div>

          {/* 4-column metrics */}
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-[17px] flex gap-[8px] items-start">
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Invested
              </p>
              <p className="font-semibold text-[14px] leading-[20px] text-white text-center">
                ${fmt(totalDeposited)}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Earned
              </p>
              <p className="font-semibold text-[14px] leading-[20px] text-[#00e6ff] text-center">
                +${fmt(totalEarned)}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Today
              </p>
              <p className="font-semibold text-[14px] leading-[20px] text-[#00e6ff] text-center">
                +${fmt(todayEarned)}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Positions
              </p>
              <p className="font-semibold text-[14px] leading-[20px] text-white text-center">
                {active.length} Active
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Earnings Over Time ──────────────────────────────────── */}
        <div className="flex flex-col gap-[16px] mt-[28px] mx-6">

          {/* Heading + period toggle */}
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[18px] leading-[24px] text-white">
              Earnings Over Time
            </p>
            <div className="bg-[#1a2540] flex items-start p-[4px] rounded-[8px]">
              {(['7D', '30D', '3M', 'All'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-[12px] py-[4px] rounded-[6px] ${
                    period === p
                      ? 'bg-[#007bff] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
                      : ''
                  }`}
                >
                  <p className={`font-bold text-[12px] leading-[16px] text-center whitespace-nowrap ${
                    period === p ? 'text-white' : 'text-[#8ac7ff]'
                  }`}>
                    {p}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive chart card */}
          <div className="bg-[#1a2540] rounded-[20px] p-[16px] flex flex-col gap-[16px] overflow-hidden">
            <EarningsChart
              data={chartData}
              periodKey={period}
              height={160}
              color="#007bff"
            />

            {/* Total Earned to Date */}
            <div className="flex flex-col items-center">
              <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff]">
                Total Earned to Date
              </p>
              <p className="font-bold text-[20px] leading-[28px] text-[#00e6ff]">
                +${fmt(totalEarnedChart)}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Position Breakdown ──────────────────────────────────── */}
        <div className="flex flex-col gap-[16px] mt-[28px] mx-6">

          <p className="font-bold text-[20px] leading-[28px] text-white">
            Position Breakdown
          </p>

          <div className="flex flex-col gap-[12px]">
            {active.map(pos => {
              const posEarned  = pos.currentValue - pos.depositedAmount;
              const returnPct  = pos.depositedAmount > 0
                ? ((posEarned / pos.depositedAmount) * 100).toFixed(1)
                : '0.0';
              const vaultId    = VAULT_NAME_TO_ID[pos.vaultName] ?? 'usdc-vault';
              const fillWidth  = barFill(pos.currentValue, totalValue);

              return (
                <button
                  key={pos.id}
                  onClick={() => navigate(`/invest/position/${vaultId}`)}
                  className="bg-[#1a2540] rounded-[20px] p-[16px] flex flex-col gap-[12px] w-full text-left"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between w-full">
                    <div className="flex flex-col items-start gap-[4px]">
                      <div className="flex gap-[8px] items-center">
                        <p className="font-bold text-[16px] leading-[24px] text-white whitespace-nowrap">
                          {pos.vaultName}
                        </p>
                        <div className="bg-[rgba(0,230,255,0.1)] px-[8px] py-[2px] rounded-[4px]">
                          <p className="font-bold text-[10px] leading-[15px] uppercase text-[#00e6ff] whitespace-nowrap">
                            Low Risk
                          </p>
                        </div>
                      </div>
                      <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff]">
                        {returnPct}% return
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-bold text-[16px] leading-[24px] text-[#00e6ff] text-right">
                        +${fmt(posEarned)}
                      </p>
                      <p className="font-normal text-[10px] leading-[15px] text-[#8ac7ff] text-right">
                        earned
                      </p>
                    </div>
                  </div>

                  {/* Allocation bar */}
                  <div className="bg-[#0a142f] h-[6px] overflow-hidden relative rounded-[9999px] w-full">
                    <div
                      className="absolute bg-[#007bff] inset-y-0 left-0 rounded-[9999px]"
                      style={{ width: fillWidth }}
                    />
                  </div>

                  {/* Value row */}
                  <div className="flex items-center justify-between w-full">
                    <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff]">
                      ${fmt(pos.currentValue)} current value
                    </p>
                    <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.4)]">
                      {fillWidth} of portfolio
                    </p>
                  </div>
                </button>
              );
            })}

            {active.length === 0 && (
              <div className="bg-[#1a2540] rounded-[20px] p-[24px] flex flex-col items-center gap-[8px]">
                <p className="font-medium text-[14px] text-[#8ac7ff]">No active positions</p>
                <button
                  onClick={() => navigate('/invest')}
                  className="font-semibold text-[14px] text-[#007bff]"
                >
                  Start investing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Lucy card ──────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] mx-6 mt-[16px] flex gap-[16px] items-center p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="bg-[#007bff] rounded-full size-[32px] flex items-center justify-center shrink-0">
            <p className="font-bold text-[14px] leading-[20px] text-white text-center">L</p>
          </div>
          <div className="flex-1 flex flex-col gap-[4px] min-w-0">
            <p className="font-normal text-[12px] leading-[16px] text-white">
              {active.length > 1
                ? 'Your portfolio is well balanced. Both vaults are performing steadily this month.'
                : 'Your vault is performing steadily. Consider diversifying with another vault.'}
            </p>
            <div className="flex gap-[4px] items-center">
              <p className="font-medium text-[14px] leading-[18px] text-[#007bff] whitespace-nowrap">
                Ask Lucy how to optimize
              </p>
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[18.75%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgArrowRight} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
