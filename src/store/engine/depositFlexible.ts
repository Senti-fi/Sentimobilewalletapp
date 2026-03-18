import type {
  Balances,
  Transaction,
  FlexibleSavings,
  DepositFlexiblePayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

const MIN_DEPOSIT = 1;

interface DepositFlexibleResult {
  updatedBalances: Balances;
  updatedFlexible: FlexibleSavings;
  transaction: Transaction;
}

export function computeDepositFlexible(
  balances: Balances,
  flexibleSavings: FlexibleSavings,
  payload: DepositFlexiblePayload,
): ActionResult<DepositFlexibleResult> {
  const { asset, amount } = payload;

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (amount < MIN_DEPOSIT) {
    return {
      ok: false,
      error: `Minimum deposit amount is $${MIN_DEPOSIT}.`,
      code: 'BELOW_MINIMUM',
    };
  }

  if (balances[asset] < amount) {
    return {
      ok: false,
      error: `Insufficient ${asset} balance.`,
      code: 'INSUFFICIENT_BALANCE',
    };
  }

  const now = nowISO();

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] - amount),
  };

  const updatedFlexible: FlexibleSavings = {
    ...flexibleSavings,
    balance: round2(flexibleSavings.balance + amount),
    createdAt: flexibleSavings.createdAt ?? now,
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'save',
    status:      'completed',
    asset,
    amount,
    source:      'Wallet',
    destination: 'Flexible Savings',
    description: `Saved ${asset} to Flexible Savings`,
    timestamp:   now,
    context:     'savings',
  };

  return { ok: true, data: { updatedBalances, updatedFlexible, transaction } };
}
