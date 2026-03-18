import type {
  Balances,
  Transaction,
  ActionResult,
  Asset,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

export interface WithdrawFundsPayload {
  asset: Asset;
  amount: number;
  destination: string;  // e.g. wallet address, 'Bank Transfer', 'First Bank ••••7823'
  network?: string;     // e.g. 'Solana', 'Ethereum'
  note?: string;
}

interface WithdrawFundsResult {
  updatedBalances: Balances;
  transaction: Transaction;
}

export function computeWithdrawFunds(
  balances: Balances,
  payload: WithdrawFundsPayload,
): ActionResult<WithdrawFundsResult> {
  const { asset, amount, destination, network, note } = payload;

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (balances[asset] < amount) {
    return { ok: false, error: `Insufficient ${asset} balance.`, code: 'INSUFFICIENT_BALANCE' };
  }

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] - amount),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'withdrawal',
    status:      'completed',
    asset,
    amount,
    source:      'Wallet',
    destination,
    description: `Withdrawn ${asset} to ${destination}`,
    timestamp:   nowISO(),
    context:     'home',
    metadata:    {
      ...(network ? { network } : {}),
      ...(note    ? { note }    : {}),
    },
  };

  return { ok: true, data: { updatedBalances, transaction } };
}
