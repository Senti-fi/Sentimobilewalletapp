/**
 * transactionUtils
 *
 * Pure functions for working with Transaction records.
 * No component imports — safe to use anywhere.
 */

import type { Transaction, TxContext } from '../store/types';

// ── Filtering ─────────────────────────────────────────────────────────

/**
 * Returns transactions for the given context, sorted newest → oldest.
 */
export function getTransactionsByContext(
  transactions: Transaction[],
  context: TxContext,
): Transaction[] {
  return transactions
    .filter(tx => (tx.context ?? 'home') === context)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Returns invest transactions for a specific vault, newest → oldest.
 * Uses top-level `destination` field (the vault is the destination for invest,
 * and the source for redeem).
 */
export function getVaultTransactions(
  transactions: Transaction[],
  vaultName: string,
): Transaction[] {
  return transactions
    .filter(
      tx =>
        tx.context === 'invest' &&
        (tx.destination === vaultName || tx.source === vaultName),
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Display helpers ───────────────────────────────────────────────────

export interface TxDisplay {
  label:    string;
  sublabel: string;
  /** '+' for incoming, '-' for outgoing */
  sign:     '+' | '-';
  /** Tailwind text color class */
  amountColor: string;
  /** Background color for icon circle */
  iconBg: string;
  /** Lucide icon name (resolved in component) */
  iconKey: 'download' | 'upload' | 'send' | 'trending-up' | 'target' | 'plus-circle';
}

export function getTxDisplay(tx: Transaction): TxDisplay {
  switch (tx.type) {
    case 'deposit':
      return {
        label:       'Deposit',
        sublabel:    `Via ${tx.source}`,
        sign:        '+',
        amountColor: 'text-[#02d128]',
        iconBg:      '#0a3040',
        iconKey:     'download',
      };

    case 'fiat_purchase':
      return {
        label:       'Bought',
        sublabel:    `Via ${tx.source}`,
        sign:        '+',
        amountColor: 'text-[#02d128]',
        iconBg:      '#0a3040',
        iconKey:     'download',
      };

    case 'withdrawal':
      return {
        label:       'Withdrawal',
        sublabel:    `To ${tx.destination}`,
        sign:        '-',
        amountColor: 'text-[#ff4444]',
        iconBg:      '#2d1515',
        iconKey:     'upload',
      };

    case 'transfer':
      return {
        label:       'Sent',
        sublabel:    `To ${tx.destination}`,
        sign:        '-',
        amountColor: 'text-white',
        iconBg:      '#1a3a6b',
        iconKey:     'send',
      };

    case 'received':
      return {
        label:       'Received',
        sublabel:    `From ${tx.source}`,
        sign:        '+',
        amountColor: 'text-[#02d128]',
        iconBg:      '#0a3040',
        iconKey:     'download',
      };

    case 'invest':
      return {
        label:       'Invested',
        sublabel:    tx.destination,
        sign:        '-',
        amountColor: 'text-[#8ac7ff]',
        iconBg:      '#0d2a4a',
        iconKey:     'trending-up',
      };

    case 'save':
      return {
        label:       'Saved',
        sublabel:    `Into ${tx.destination}`,
        sign:        '-',
        amountColor: 'text-[#00e6ff]',
        iconBg:      '#0a3040',
        iconKey:     'target',
      };

    case 'goal_create':
      return {
        label:       'Goal Created',
        sublabel:    tx.destination,
        sign:        '+',
        amountColor: 'text-[#8ac7ff]',
        iconBg:      '#0a3040',
        iconKey:     'plus-circle',
      };

    case 'redeem':
      return {
        label:       'Redeemed',
        sublabel:    `From ${tx.source}`,
        sign:        '+',
        amountColor: 'text-[#02d128]',
        iconBg:      '#0a3040',
        iconKey:     'download',
      };

    default:
      return {
        label:       tx.description,
        sublabel:    tx.asset,
        sign:        '+',
        amountColor: 'text-white',
        iconBg:      '#1a2540',
        iconKey:     'download',
      };
  }
}

// ── Time formatting ───────────────────────────────────────────────────

/**
 * Returns a human-friendly relative time string relative to the real current time.
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const ms    = Date.parse(isoTimestamp);
  const diffS = Math.floor((Date.now() - ms) / 1000);

  if (diffS < 60)                   return 'Just now';
  if (diffS < 3600)                 return `${Math.floor(diffS / 60)}m ago`;
  if (diffS < 86400)                return `${Math.floor(diffS / 3600)}h ago`;
  if (diffS < 172800)               return 'Yesterday';
  if (diffS < 604800)               return `${Math.floor(diffS / 86400)} days ago`;

  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

/** Full date + time for the detail sheet */
export function formatFullDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

/** USD amount string, e.g. "2,342.91" */
export function fmtAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
