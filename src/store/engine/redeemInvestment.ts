import type {
  Balances,
  InvestmentPosition,
  Transaction,
  RedeemInvestmentPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

interface RedeemInvestmentResult {
  updatedBalances: Balances;
  updatedPosition: InvestmentPosition;
  transaction: Transaction;
}

export function computeRedeemInvestment(
  balances: Balances,
  investments: InvestmentPosition[],
  payload: RedeemInvestmentPayload,
): ActionResult<RedeemInvestmentResult> {
  const { positionId } = payload;

  const position = investments.find(p => p.id === positionId);

  if (!position) {
    return { ok: false, error: 'Investment position not found.', code: 'INVESTMENT_NOT_FOUND' };
  }

  if (position.status !== 'active') {
    return {
      ok: false,
      error: `Position in ${position.vaultName} has already been withdrawn.`,
      code: 'INVESTMENT_NOT_ACTIVE',
    };
  }

  const received = position.currentValue;
  const earned   = round2(position.currentValue - position.depositedAmount);

  const updatedPosition: InvestmentPosition = {
    ...position,
    status: 'withdrawn',
  };

  const updatedBalances: Balances = {
    ...balances,
    [position.asset]: round2(balances[position.asset] + received),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'redeem',
    status:      'completed',
    asset:       position.asset,
    amount:      received,
    source:      position.vaultName,
    destination: 'Wallet',
    description: `Redeemed from ${position.vaultName}`,
    timestamp:   nowISO(),
    context:     'invest',
    metadata:    { positionId, vaultName: position.vaultName, principal: position.depositedAmount, earned },
  };

  return { ok: true, data: { updatedBalances, updatedPosition, transaction } };
}
