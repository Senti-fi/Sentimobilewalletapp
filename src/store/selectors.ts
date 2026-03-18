/**
 * Financial selectors — single source of truth for all derived balances.
 *
 * Every dollar displayed in the app MUST be computed through these functions.
 * Never recalculate balances inline inside a component.
 *
 * NOTE: balances.SOL is stored as its USD equivalent — do NOT multiply by a
 * price again. $SOL_qty × price is done at the point of deposit/send, before
 * being written to the store.
 */
import type {
  AppState,
  Balances,
  Goal,
  FlexibleSavings,
  LockedSavingsPosition,
  InvestmentPosition,
} from './types';

// ── Wallet ────────────────────────────────────────────────────────────

/** Sum of all wallet asset balances (all stored in USD). */
export function getWalletBalance(balances: Balances): number {
  return balances.USDC + balances.USDT + balances.SOL;
}

// ── Savings ──────────────────────────────────────────────────────────

/** Total real funds held across all savings goals. */
export function getTotalGoalsSavings(goals: Goal[]): number {
  return goals.reduce((sum, g) => sum + g.currentAmount, 0);
}

/** Flexible savings balance. */
export function getTotalFlexibleSavings(flexibleSavings: FlexibleSavings): number {
  return flexibleSavings.balance;
}

/** Total principal held across all active locked savings positions. */
export function getTotalLockedSavings(lockedSavings: LockedSavingsPosition[]): number {
  return lockedSavings
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + p.principal, 0);
}

/** Goals + flexible savings + locked savings combined. */
export function getTotalSavings(
  goals: Goal[],
  flexibleSavings: FlexibleSavings,
  lockedSavings: LockedSavingsPosition[],
): number {
  return (
    getTotalGoalsSavings(goals) +
    getTotalFlexibleSavings(flexibleSavings) +
    getTotalLockedSavings(lockedSavings)
  );
}

// ── Investments ──────────────────────────────────────────────────────

export function getActiveInvestments(investments: InvestmentPosition[]): InvestmentPosition[] {
  return investments.filter(p => p.status === 'active');
}

/** Current market value of all active investment positions. */
export function getTotalInvestments(investments: InvestmentPosition[]): number {
  return getActiveInvestments(investments).reduce((sum, p) => sum + p.currentValue, 0);
}

/** Original capital deployed across all active investment positions. */
export function getTotalInvested(investments: InvestmentPosition[]): number {
  return getActiveInvestments(investments).reduce((sum, p) => sum + p.depositedAmount, 0);
}

/** Total unrealised gain across all active positions. */
export function getTotalEarned(investments: InvestmentPosition[]): number {
  return getActiveInvestments(investments).reduce(
    (sum, p) => sum + (p.currentValue - p.depositedAmount),
    0,
  );
}

// ── Net Worth ────────────────────────────────────────────────────────

/**
 * Net Worth = wallet + all savings (goals + flexible + locked) + investment portfolio.
 *
 * This is the canonical number shown on the Home carousel card.
 */
export function getNetWorth(
  state: Pick<AppState, 'balances' | 'goals' | 'flexibleSavings' | 'lockedSavings' | 'investments'>,
): number {
  return (
    getWalletBalance(state.balances) +
    getTotalSavings(state.goals, state.flexibleSavings, state.lockedSavings) +
    getTotalInvestments(state.investments)
  );
}

// ── Debug helper ─────────────────────────────────────────────────────

/**
 * Prints a full traceable breakdown of Net Worth to the browser console.
 * Call this anywhere: logNetWorthBreakdown(useAppStore.getState())
 */
export function logNetWorthBreakdown(
  state: Pick<AppState, 'balances' | 'goals' | 'flexibleSavings' | 'lockedSavings' | 'investments'>,
): void {
  const wallet  = getWalletBalance(state.balances);
  const goals   = getTotalGoalsSavings(state.goals);
  const flex    = getTotalFlexibleSavings(state.flexibleSavings);
  const locked  = getTotalLockedSavings(state.lockedSavings);
  const invest  = getTotalInvestments(state.investments);
  const total   = wallet + goals + flex + locked + invest;

  console.group('💰 Net Worth Breakdown');
  console.log(`  Wallet:        $${wallet.toFixed(2)}`);
  console.log(`    USDC:        $${state.balances.USDC.toFixed(2)}`);
  console.log(`    USDT:        $${state.balances.USDT.toFixed(2)}`);
  console.log(`    SOL (USD):   $${state.balances.SOL.toFixed(2)}`);
  console.log(`  Savings:       $${(goals + flex + locked).toFixed(2)}`);
  console.log(`    Goals:       $${goals.toFixed(2)}`);
  state.goals.forEach(g => {
    console.log(`      ${g.name}: $${g.currentAmount.toFixed(2)}`);
  });
  console.log(`    Flexible:    $${flex.toFixed(2)}`);
  console.log(`    Locked:      $${locked.toFixed(2)}`);
  state.lockedSavings.filter(p => p.status === 'active').forEach(p => {
    console.log(`      Lock ${p.lockPeriodDays}d @ ${p.apy}%: $${p.principal.toFixed(2)}`);
  });
  console.log(`  Investments:   $${invest.toFixed(2)}`);
  getActiveInvestments(state.investments).forEach(p => {
    const earned = p.currentValue - p.depositedAmount;
    console.log(`    ${p.vaultName}: $${p.currentValue.toFixed(2)} (+$${earned.toFixed(2)})`);
  });
  console.log(`  ─────────────────────────`);
  console.log(`  NET WORTH:     $${total.toFixed(2)}`);
  console.groupEnd();
}
