/**
 * portfolioTimeSeries
 *
 * Pure data-generation layer for investment charts.
 * All functions are deterministic — no Math.random().
 * Swap `generateVaultSeries` / `generatePortfolioSeries` for real API calls
 * without touching any UI component.
 */

// ── Types ─────────────────────────────────────────────────────────────

export type Period = '7D' | '30D' | '3M' | 'All';

export interface DataPoint {
  /** Human-readable x-axis label, e.g. "Mar 10" */
  label: string;
  /** Portfolio / vault total value at this point */
  value: number;
  /** Cumulative earnings = value − depositedAmount */
  earned: number;
}

export interface GenerateOptions {
  depositedAmount: number;
  /** Annual percentage yield, e.g. 8.5 → 8.5 % */
  apy: number;
  /** ISO date string of the original deposit */
  depositedAt: string;
  /** Actual current value — used to pin the last data point */
  currentValue: number;
}

// ── Constants ─────────────────────────────────────────────────────────

const TODAY = new Date('2026-03-17');

/** How many calendar days each period covers */
const PERIOD_WINDOW: Record<Period, number> = {
  '7D':  7,
  '30D': 30,
  '3M':  90,
  'All': Infinity,
};

/** Target number of data points per period */
const PERIOD_POINTS: Record<Period, number> = {
  '7D':   7,
  '30D':  15,
  '3M':   13,
  'All':  12,
};

// ── Helpers ───────────────────────────────────────────────────────────

/** Deterministic noise in (−1, 1) keyed by an integer seed. */
function dnoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function fmtLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Core generator ────────────────────────────────────────────────────

/**
 * Generates a time-series of DataPoints for a single vault.
 * Points span the given period, capped at the actual deposit history.
 * The last point always equals `opts.currentValue` for accuracy.
 */
export function generateVaultSeries(
  opts: GenerateOptions,
  period: Period,
): DataPoint[] {
  const depositedAt = new Date(opts.depositedAt);
  const totalDays = Math.max(
    1,
    Math.floor((TODAY.getTime() - depositedAt.getTime()) / 86_400_000),
  );

  const windowDays = Math.min(totalDays, PERIOD_WINDOW[period]);
  const numPoints  = Math.min(PERIOD_POINTS[period], windowDays + 1);
  const startOffset = totalDays - windowDays;

  const points: DataPoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    // Distribute points evenly across the window
    const t         = numPoints <= 1 ? 1 : i / (numPoints - 1);
    const dayOffset = Math.round(startOffset + t * windowDays);
    const date      = new Date(depositedAt.getTime() + dayOffset * 86_400_000);

    // Daily compound growth
    const baseValue = opts.depositedAmount * Math.pow(1 + opts.apy / 100 / 365, dayOffset);
    // Tiny deterministic noise (±0.05 % of base) for visual realism
    const noised    = baseValue * (1 + dnoise(dayOffset) * 0.0005);
    const value     = Math.max(opts.depositedAmount, noised);

    points.push({
      label:  fmtLabel(date),
      value,
      earned: value - opts.depositedAmount,
    });
  }

  // Pin last point to the real current value
  if (points.length > 0) {
    const last = points[points.length - 1];
    last.value  = opts.currentValue;
    last.earned = opts.currentValue - opts.depositedAmount;
  }

  return points;
}

/**
 * Generates a combined portfolio series by summing individual vault series.
 * Each vault is sampled to the same number of points (aligned by index).
 * Drop-in replacement: swap individual GenerateOptions for real API data.
 */
export function generatePortfolioSeries(
  vaults: GenerateOptions[],
  period: Period,
): DataPoint[] {
  if (vaults.length === 0) return [];

  const allSeries = vaults.map(v => generateVaultSeries(v, period));
  const len       = Math.min(...allSeries.map(s => s.length));

  return Array.from({ length: len }, (_, i) => ({
    label:  allSeries[0][i].label,
    value:  allSeries.reduce((sum, s) => sum + s[i].value,  0),
    earned: allSeries.reduce((sum, s) => sum + s[i].earned, 0),
  }));
}
