import type {
  Balances,
  FlexibleSavings,
  Transaction,
  WithdrawFlexiblePayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

interface WithdrawFlexibleResult {
  updatedBalances: Balances;
  updatedFlexible: FlexibleSavings;
  transaction: Transaction;
}

export function computeWithdrawFlexible(
  balances: Balances,
  flexibleSavings: FlexibleSavings,
  payload: WithdrawFlexiblePayload,
): ActionResult<WithdrawFlexibleResult> {
  const { amount } = payload;
  const { asset } = flexibleSavings;

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (flexibleSavings.balance <= 0) {
    return {
      ok: false,
      error: 'Flexible savings has no funds to withdraw.',
      code: 'GOAL_NO_FUNDS',
    };
  }

  if (amount > flexibleSavings.balance) {
    return {
      ok: false,
      error: `Cannot withdraw more than the flexible savings balance ($${flexibleSavings.balance.toFixed(2)}).`,
      code: 'INSUFFICIENT_SAVINGS_BALANCE',
    };
  }

  const newBalance = round2(flexibleSavings.balance - amount);

  const updatedFlexible: FlexibleSavings = {
    ...flexibleSavings,
    balance: newBalance,
  };

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] + amount),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'redeem',
    status:      'completed',
    asset,
    amount,
    source:      'Flexible Savings',
    destination: 'Wallet',
    description: `Withdrawn from Flexible Savings`,
    timestamp:   nowISO(),
    context:     'savings',
    metadata:    { remaining: newBalance },
  };

  return { ok: true, data: { updatedBalances, updatedFlexible, transaction } };
}
