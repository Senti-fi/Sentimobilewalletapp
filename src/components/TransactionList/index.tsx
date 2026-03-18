/**
 * TransactionList
 *
 * Reusable list of transaction rows. Manages its own detail-sheet state.
 * Parent is responsible for pre-filtering (by context, vault, etc.).
 *
 * Usage:
 *   <TransactionList transactions={filteredTxs} limit={4} />
 */

import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  TrendingUp,
  Target,
  PlusCircle,
} from 'lucide-react';
import type { Transaction } from '../../store/types';
import {
  getTxDisplay,
  formatRelativeTime,
  fmtAmount,
} from '../../data/transactionUtils';
import TransactionDetailSheet from '../TransactionDetailSheet';

// ── Icon map ──────────────────────────────────────────────────────────

const ICON_MAP = {
  'download':    ArrowDownLeft,
  'upload':      ArrowUpRight,
  'send':        Send,
  'trending-up': TrendingUp,
  'target':      Target,
  'plus-circle': PlusCircle,
} as const;

// ── Row ───────────────────────────────────────────────────────────────

function TxRow({
  transaction,
  last,
  onClick,
}: {
  transaction: Transaction;
  last: boolean;
  onClick: () => void;
}) {
  const display = getTxDisplay(transaction);
  const Icon    = ICON_MAP[display.iconKey];

  return (
    <button
      onClick={onClick}
      className={`flex gap-[16px] items-center w-full text-left py-[14px] ${
        !last ? 'border-b border-[rgba(255,255,255,0.05)]' : ''
      }`}
    >
      {/* Icon circle */}
      <div
        className="size-[40px] rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: display.iconBg }}
      >
        <Icon size={18} className="text-white" />
      </div>

      {/* Label + sublabel */}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
          {display.label}
        </p>
        <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] truncate max-w-full">
          {display.sublabel}
        </p>
      </div>

      {/* Amount + time */}
      <div className="flex flex-col items-end shrink-0">
        {transaction.amount > 0 ? (
          <p className={`font-medium text-[14px] leading-[18px] ${display.amountColor}`}>
            {display.sign}${fmtAmount(transaction.amount)}
          </p>
        ) : (
          <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff]">—</p>
        )}
        <p className="font-normal text-[11px] leading-[16px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">
          {formatRelativeTime(transaction.timestamp)}
        </p>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────

interface TransactionListProps {
  transactions: Transaction[];
  /** Cap the number of visible rows (default: all) */
  limit?: number;
  /** Show empty state if list is empty */
  emptyMessage?: string;
}

export default function TransactionList({
  transactions,
  limit,
  emptyMessage = 'No transactions yet.',
}: TransactionListProps) {
  const [selected, setSelected] = useState<Transaction | null>(null);

  const visible = limit ? transactions.slice(0, limit) : transactions;

  if (visible.length === 0) {
    return (
      <p className="font-normal text-[13px] leading-[18px] text-[rgba(255,255,255,0.4)] py-[8px]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {visible.map((tx, i) => (
          <TxRow
            key={tx.id}
            transaction={tx}
            last={i === visible.length - 1}
            onClick={() => setSelected(tx)}
          />
        ))}
      </div>

      <TransactionDetailSheet
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
