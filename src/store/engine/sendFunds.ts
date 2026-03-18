import type {
  Balances,
  Transaction,
  SendFundsPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

const MIN_SEND = 1;

interface SendFundsResult {
  updatedBalances: Balances;
  transaction: Transaction;
}

export function computeSendFunds(
  balances: Balances,
  payload: SendFundsPayload,
): ActionResult<SendFundsResult> {
  const { asset, amount, recipient, note } = payload;

  if (!recipient.trim()) {
    return { ok: false, error: 'Recipient is required.', code: 'RECIPIENT_REQUIRED' };
  }

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (amount < MIN_SEND) {
    return {
      ok: false,
      error: `Minimum send amount is $${MIN_SEND}.`,
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

  const updatedBalances: Balances = {
    ...balances,
    [asset]: round2(balances[asset] - amount),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'transfer',
    status:      'completed',
    asset,
    amount,
    source:      'Wallet',
    destination: recipient,
    description: `Sent ${asset} to ${recipient}`,
    timestamp:   nowISO(),
    context:     'home',
    metadata:    { recipient, ...(note ? { note } : {}) },
  };

  return { ok: true, data: { updatedBalances, transaction } };
}
