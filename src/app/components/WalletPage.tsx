import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Plus, Send, ArrowLeftRight, QrCode, ArrowDownLeft, ArrowUpRight, Link2, Download } from 'lucide-react';
import { formatCompactBalance } from '../utils/formatBalance';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change: number;
  changePercent: number;
  color: string;
  gradient: string;
  icon: string;
}

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  icon: any;
  color: string;
  bg: string;
  type: string;
}

interface WalletPageProps {
  onBack: () => void;
  totalBalance: number;
  assets: Asset[];
  transactions: Transaction[];
  onDeposit: () => void;
  onSend: () => void;
  onTransfer: () => void;
  onReceive: () => void;
}

export default function WalletPage({
  onBack,
  totalBalance,
  assets,
  transactions,
  onDeposit,
  onSend,
  onTransfer,
  onReceive,
}: WalletPageProps) {
  const pnlValue = 146.30;
  const pnlPercent = 2.4;

  const recentTxs = transactions.slice(0, 4);

  // Map transaction types to appropriate icons and colors for dark theme
  const getTxDisplay = (tx: Transaction) => {
    const isPositive = tx.amount >= 0;
    return {
      iconBg: isPositive ? 'bg-senti-green/20' : 'bg-senti-cyan/20',
      iconColor: isPositive ? 'text-senti-green' : 'text-senti-cyan',
      amountColor: isPositive ? 'text-senti-green' : 'text-senti-red',
      icon: isPositive ? ArrowDownLeft : ArrowUpRight,
    };
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-senti-bg max-w-md mx-auto">
      {/* Header */}
      <div className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Wallet</h1>
        <button className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-senti-text-secondary" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl p-5 mt-2 mb-5"
        >
          <p className="text-sm text-white/70 mb-1">Wallet Balance</p>
          <h2 className="text-4xl font-bold text-white mb-1">
            ${formatCompactBalance(totalBalance)}
          </h2>
          <p className="text-sm text-white/80">
            Today's P&L{' '}
            <span className="text-green-300">
              +${pnlValue.toFixed(2)} (+ {pnlPercent}%)
            </span>
          </p>

          {/* Pagination dots */}
          <div className="flex justify-center gap-1.5 mt-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onDeposit}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white"
            >
              <Plus className="w-4 h-4" />
              Deposit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSend}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onTransfer}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transfer
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onReceive}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 text-sm text-white"
            >
              <QrCode className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* My Assets */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">My Assets</h3>
          <div className="space-y-1">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 py-3 border-b border-senti-card-border last:border-b-0"
              >
                <div className="w-10 h-10 rounded-full bg-senti-card flex items-center justify-center flex-shrink-0 border border-senti-card-border">
                  <img
                    src={asset.icon}
                    alt={asset.symbol}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{asset.symbol}</p>
                  <p className="text-xs text-senti-text-muted">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    ${formatCompactBalance(asset.value)}
                  </p>
                  <p className="text-xs text-senti-text-muted">
                    {formatCompactBalance(asset.balance)} {asset.symbol}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Recent Activities</h3>
            <button className="text-sm text-senti-cyan">View All</button>
          </div>
          <div className="space-y-1">
            {recentTxs.map((tx, index) => {
              const display = getTxDisplay(tx);
              const TxIcon = display.icon;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-3 py-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${display.iconBg}`}
                  >
                    <TxIcon className={`w-5 h-5 ${display.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{tx.category}</p>
                    <p className="text-xs text-senti-text-muted truncate">
                      {tx.merchant}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${display.amountColor}`}>
                      {tx.amount >= 0 ? '+' : '-'}${formatCompactBalance(Math.abs(tx.amount))}
                    </p>
                    <p className="text-xs text-senti-text-muted">{tx.date}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
