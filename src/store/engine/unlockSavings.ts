import type {
  Balances,
  LockedSavingsPosition,
  Transaction,
  UnlockSavingsPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

/** Simple interest earned if held to full term: principal × (apy/100) × (days/365) */
function computeFullTermEarnings(position: LockedSavingsPosition): number {
  return round2(position.principal * (position.apy / 100) * (position.lockPeriodDays / 365));
}


interface UnlockSavingsResult {
  updatedBalances: Balances;
  updatedPosition: LockedSavingsPosition;
  transaction: Transaction;
  received: number;
  earned: number;
  penalty: number;
}

export function computeUnlockSavings(
  balances: Balances,
  lockedSavings: LockedSavingsPosition[],
  payload: UnlockSavingsPayload,
): ActionResult<UnlockSavingsResult> {
  const { positionId, earlyWithdrawal = false } = payload;

  const position = lockedSavings.find(p => p.id === positionId);

  if (!position) {
    return { ok: false, error: 'Locked savings position not found.', code: 'LOCK_NOT_FOUND' };
  }

  if (position.status !== 'active') {
    return {
      ok: false,
      error: 'This locked savings position is no longer active.',
      code: 'LOCK_NOT_ACTIVE',
    };
  }

  const now        = new Date();
  const unlockDate = new Date(position.unlockAt);
  const isMatured  = now >= unlockDate;

  let received: number;
  let earned:   number;
  let penalty:  number;

  if (!earlyWithdrawal && isMatured) {
    // Normal unlock at or after maturity — full principal + full term earnings
    earned  = computeFullTermEarnings(position);
    penalty = 0;
    received = round2(position.principal + earned);
  } else {
    // Early withdrawal — forfeit all earnings, lose 10% of principal
    earned   = 0;
    penalty  = round2(position.principal * 0.10);
    received = round2(position.principal - penalty);
  }

  const updatedPosition: LockedSavingsPosition = {
    ...position,
    status: isMatured && !earlyWithdrawal ? 'unlocked' : 'early_withdrawn',
  };

  const updatedBalances: Balances = {
    ...balances,
    [position.asset]: round2(balances[position.asset] + received),
  };

  const description = isMatured && !earlyWithdrawal
    ? `Unlocked ${position.asset} savings (${position.lockPeriodDays} days)`
    : `Early withdrawal: ${position.asset} locked savings`;

  const transaction: Transaction = {
    id:          generateId(),
    type:        'redeem',
    status:      'completed',
    asset:       position.asset,
    amount:      received,
    source:      'Locked Savings',
    destination: 'Wallet',
    description,
    timestamp:   nowISO(),
    context:     'savings',
    metadata:    {
      positionId,
      principal:       position.principal,
      earned,
      penalty,
      earlyWithdrawal: !isMatured || earlyWithdrawal,
      lockPeriodDays:  position.lockPeriodDays,
    },
  };

  return { ok: true, data: { updatedBalances, updatedPosition, transaction, received, earned, penalty } };
}
