import type {
  Balances,
  InvestmentPosition,
  Transaction,
  InvestFundsPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

interface InvestFundsResult {
  updatedBalances: Balances;
  newPosition: InvestmentPosition;
  transaction: Transaction;
}

export function computeInvestFunds(
  balances: Balances,
  payload: InvestFundsPayload,
): ActionResult<InvestFundsResult> {
  const { vaultName, asset, amount, apy, minDeposit } = payload;

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (amount < minDeposit) {
    return {
      ok: false,
      error: `Minimum deposit for ${vaultName} is $${minDeposit}.`,
      code: 'VAULT_MIN_NOT_MET',
    };
  }

  if (balances[asset] < amount) {
    return {
      ok: false,
      error: `Insufficient ${asset} balance.`,
      code: 'INSUFFICIENT_BALANCE',
    };
  }

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] - amount),
  };

  const newPosition: InvestmentPosition = {
    id: generateId(),
    vaultName,
    asset,
    depositedAmount: amount,
    currentValue: amount, // starts equal; will appreciate over time in simulation
    apy,
    depositedAt: nowISO(),
    status: 'active',
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'invest',
    status:      'completed',
    asset,
    amount,
    source:      'Wallet',
    destination: vaultName,
    description: `Invested in ${vaultName}`,
    timestamp:   nowISO(),
    context:     'invest',
    metadata:    { vaultName, apy },
  };

  return { ok: true, data: { updatedBalances, newPosition, transaction } };
}
