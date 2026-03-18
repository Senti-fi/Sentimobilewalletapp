import type {
  Balances,
  Transaction,
  ActionResult,
  LockFundsPayload,
  LockedSavingsPosition,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

interface LockFundsResult {
  updatedBalances: Balances;
  newPosition: LockedSavingsPosition;
  transaction: Transaction;
}

export function computeLockFunds(
  balances: Balances,
  payload: LockFundsPayload,
): ActionResult<LockFundsResult> {
  const { asset, amount, lockPeriodDays, apy } = payload;

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (balances[asset] < amount) {
    return { ok: false, error: `Insufficient ${asset} balance.`, code: 'INSUFFICIENT_BALANCE' };
  }

  const lockedAt = nowISO();
  const unlockDate = new Date(lockedAt);
  unlockDate.setDate(unlockDate.getDate() + lockPeriodDays);
  const unlockAt = unlockDate.toISOString();

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] - amount),
  };

  const newPosition: LockedSavingsPosition = {
    id: generateId(),
    asset,
    principal: amount,
    apy,
    lockPeriodDays,
    lockedAt,
    unlockAt,
    status: 'active',
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'save',
    status:      'completed',
    asset,
    amount,
    source:      'Wallet',
    destination: 'Locked Savings',
    description: `Locked ${asset} for ${lockPeriodDays} days`,
    timestamp:   lockedAt,
    context:     'savings',
    metadata:    { lockPeriodDays, apy, unlockAt, positionId: newPosition.id },
  };

  return { ok: true, data: { updatedBalances, newPosition, transaction } };
}
