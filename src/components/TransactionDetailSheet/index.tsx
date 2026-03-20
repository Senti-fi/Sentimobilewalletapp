/**
 * TransactionDetailSheet
 *
 * A mobile-native bottom-sheet that shows full details for a single transaction.
 * Slides up from the bottom with a spring animation (motion/react).
 * Tap the backdrop or the × button to dismiss.
 */

import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
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
  formatFullDateTime,
  fmtAmount,
} from '../../data/transactionUtils';

// ── Icon map ──────────────────────────────────────────────────────────

const ICON_MAP = {
  'download':    ArrowDownLeft,
  'upload':      ArrowUpRight,
  'send':        Send,
  'trending-up': TrendingUp,
  'target':      Target,
  'plus-circle': PlusCircle,
} as const;

// ── Context label ─────────────────────────────────────────────────────

const CONTEXT_LABELS: Record<string, string> = {
  home:    'Wallet',
  savings: 'Savings',
  invest:  'Invest',
};

// ── Detail row ────────────────────────────────────────────────────────

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-[14px] border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <p className="font-normal text-[13px] leading-[18px] text-[rgba(255,255,255,0.5)]">
        {label}
      </p>
      <p className={`font-medium text-[13px] leading-[18px] text-right ml-4 ${
        accent ? 'text-[#00e6ff]' : 'text-white'
      }`}>
        {value}
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailSheet({ transaction, onClose }: Props) {
  const isOpen = transaction !== null;
  const root   = document.getElementById('root');

  return createPortal(
    <AnimatePresence>
      {isOpen && transaction && (() => {
        const display = getTxDisplay(transaction);
        const Icon    = ICON_MAP[display.iconKey];
        const meta    = transaction.metadata ?? {};
        const { source, destination } = transaction;

        return (
          <>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-50 bg-[#0f1d3a] rounded-t-[24px] overflow-hidden"
              style={{ maxHeight: '88dvh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-[12px] pb-[4px]">
                <div className="w-[36px] h-[4px] bg-[rgba(255,255,255,0.18)] rounded-[9999px]" />
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(88dvh - 20px)' }}>
                <div className="px-6 pb-[40px]">

                  {/* Close button */}
                  <div className="flex justify-end pt-[4px] pb-[8px]">
                    <button
                      onClick={onClose}
                      className="size-[32px] flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>

                  {/* Icon + type + amount hero */}
                  <div className="flex flex-col items-center gap-[12px] pb-[28px]">
                    <div
                      className="size-[56px] rounded-full flex items-center justify-center"
                      style={{ backgroundColor: display.iconBg }}
                    >
                      <Icon size={24} className="text-white" />
                    </div>

                    <div className="flex flex-col items-center gap-[4px]">
                      <p className="font-semibold text-[18px] leading-[24px] text-white">
                        {display.label}
                      </p>
                      <p className="font-normal text-[13px] leading-[18px] text-[#8ac7ff]">
                        {display.sublabel}
                      </p>
                    </div>

                    {transaction.amount > 0 && (
                      <p className={`font-bold text-[32px] leading-[40px] tracking-[-0.6px] ${display.amountColor}`}>
                        {display.sign}${fmtAmount(transaction.amount)}
                      </p>
                    )}

                    {/* Status badge */}
                    <div className={`px-[12px] py-[4px] rounded-[9999px] ${
                      transaction.status === 'completed'
                        ? 'bg-[rgba(2,209,40,0.12)]'
                        : transaction.status === 'pending'
                        ? 'bg-[rgba(255,176,32,0.12)]'
                        : 'bg-[rgba(255,68,68,0.12)]'
                    }`}>
                      <p className={`font-semibold text-[11px] leading-[normal] tracking-[0.5px] uppercase ${
                        transaction.status === 'completed'
                          ? 'text-[#02d128]'
                          : transaction.status === 'pending'
                          ? 'text-[#ffb020]'
                          : 'text-[#ff4444]'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="bg-[#1a2540] rounded-[16px] px-[16px]">
                    <DetailRow label="Date"    value={formatFullDateTime(transaction.timestamp)} />
                    <DetailRow label="Asset"   value={transaction.asset} />
                    <DetailRow label="Section" value={CONTEXT_LABELS[transaction.context ?? 'home']} />

                    {/* Ledger fields */}
                    <DetailRow label="Source"      value={source} />
                    <DetailRow label="Destination" value={destination} />

                    {/* Supplementary metadata rows */}
                    {/* Skip recipient for transfer — destination already shows it */}
                    {meta.recipient !== undefined && transaction.type !== 'transfer' && (
                      <DetailRow label="Recipient" value={String(meta.recipient)} />
                    )}
                    {meta.vaultName !== undefined && <DetailRow label="Vault"     value={String(meta.vaultName)} />}
                    {meta.goalName  !== undefined && <DetailRow label="Goal"      value={String(meta.goalName)} />}
                    {meta.apy       !== undefined && <DetailRow label="APY"       value={`${meta.apy}%`} accent />}
                    {meta.note      !== undefined && <DetailRow label="Note"      value={String(meta.note)} />}
                  </div>

                  {/* Transaction ID */}
                  <div className="mt-[16px] bg-[#1a2540] rounded-[16px] px-[16px] py-[14px] flex items-center justify-between">
                    <p className="font-normal text-[11px] leading-[16px] text-[rgba(255,255,255,0.4)]">
                      Transaction ID
                    </p>
                    <p className="font-mono text-[10px] leading-[16px] text-[rgba(255,255,255,0.5)] ml-4 truncate max-w-[180px]">
                      {transaction.id}
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        );
      })()}
    </AnimatePresence>,
    root!,
  );
}
