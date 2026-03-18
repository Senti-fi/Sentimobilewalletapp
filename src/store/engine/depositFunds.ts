import type {
  Balances,
  Transaction,
  DepositFundsPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

const MIN_DEPOSIT = 1;

interface DepositFundsResult {
  updatedBalances: Balances;
  transaction: Transaction;
}

export function computeDepositFunds(
  balances: Balances,
  payload: DepositFundsPayload,
): ActionResult<DepositFundsResult> {
  const { asset, amount, source = 'External', txType = 'deposit' } = payload;

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

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] + amount),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        txType,
    status:      'completed',
    asset,
    amount,
    source,
    destination: 'Wallet',
    description: txType === 'fiat_purchase'
      ? `Bought ${asset} via ${source}`
      : `Deposited ${asset} via ${source}`,
    timestamp:   nowISO(),
    context:     payload.context ?? 'home',
  };

  return { ok: true, data: { updatedBalances, transaction } };
}
