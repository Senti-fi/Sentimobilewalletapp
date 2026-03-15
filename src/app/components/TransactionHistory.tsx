import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import TransactionDetailsModal from './TransactionDetailsModal';
import Portal from './Portal';
import { formatCompactBalance } from '../utils/formatBalance';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'earn';
  amount: string;
  asset: string;
  timestamp: string;
  status: 'completed' | 'pending';
  recipient?: string;
}

interface DashboardTransaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  icon: any;
  color: string;
  bg: string;
  type: 'send' | 'vault' | 'investment' | 'swap' | 'internal';
}

interface TransactionHistoryProps {
  transactions?: DashboardTransaction[];
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'receive', amount: '+10.76', asset: 'USDC', timestamp: '2 hours ago', status: 'completed', recipient: 'From 0x742d...0bEb' },
  { id: '2', type: 'send', amount: '-25.00', asset: 'USDT', timestamp: 'Yesterday', status: 'completed', recipient: 'To 0x5A4B...8F3C' },
  { id: '3', type: 'swap', amount: '100.00', asset: 'USDC → DAI', timestamp: '2 days ago', status: 'completed' },
  { id: '4', type: 'earn', amount: '+2.34', asset: 'USDC', timestamp: '3 days ago', status: 'completed', recipient: 'Yield earned' },
];

export default function TransactionHistory({ transactions }: TransactionHistoryProps = {}) {
  const [selectedTransaction, setSelectedTransaction] = useState<DashboardTransaction | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const hasRealTransactions = transactions && transactions.length > 0;
  const displayLimit = 3;
  const displayedTransactions = hasRealTransactions ? transactions!.slice(0, displayLimit) : mockTransactions.slice(0, displayLimit);
  const allTransactions = hasRealTransactions ? transactions! : mockTransactions;
  const hasMore = allTransactions.length > displayLimit;

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-5 h-5" />;
      case 'receive': return <ArrowDownLeft className="w-5 h-5" />;
      case 'swap': return <ArrowLeftRight className="w-5 h-5" />;
      case 'earn': return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: Transaction['type']) => {
    switch (type) {
      case 'send': return 'bg-senti-red/20 text-senti-red';
      case 'receive': return 'bg-senti-green/20 text-senti-green';
      case 'swap': return 'bg-senti-cyan/20 text-senti-cyan';
      case 'earn': return 'bg-purple-500/20 text-purple-400';
    }
  };

  const getLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'send': return 'Sent';
      case 'receive': return 'Received';
      case 'swap': return 'Swapped';
      case 'earn': return 'Earned';
    }
  };

  // Dark theme icon colors for real transactions
  const getDarkIconBg = (color: string) => {
    if (color.includes('green')) return 'bg-senti-green/20';
    if (color.includes('red')) return 'bg-senti-red/20';
    if (color.includes('blue')) return 'bg-senti-cyan/20';
    if (color.includes('purple')) return 'bg-purple-500/20';
    if (color.includes('cyan')) return 'bg-senti-cyan/20';
    if (color.includes('orange')) return 'bg-amber-500/20';
    return 'bg-senti-cyan/20';
  };

  const getDarkIconColor = (color: string) => {
    if (color.includes('green')) return 'text-senti-green';
    if (color.includes('red')) return 'text-senti-red';
    if (color.includes('blue')) return 'text-senti-cyan';
    if (color.includes('purple')) return 'text-purple-400';
    if (color.includes('cyan')) return 'text-senti-cyan';
    if (color.includes('orange')) return 'text-amber-400';
    return 'text-senti-cyan';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white">Recent Activity</h2>
        {hasMore && (
          <button onClick={() => setShowAllTransactions(true)} className="text-sm text-senti-cyan hover:text-senti-cyan-light transition-colors">
            View All
          </button>
        )}
      </div>

      <div className="bg-senti-card border border-senti-card-border rounded-2xl p-4 space-y-4">
        {hasRealTransactions && displayedTransactions.map((transaction, index) => {
          const Icon = transaction.icon;
          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTransaction(transaction)}
              className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-3 -m-3 rounded-xl transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getDarkIconBg(transaction.color)}`}>
                <Icon className={`w-5 h-5 ${getDarkIconColor(transaction.color)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white mb-0.5">{transaction.category}</p>
                <p className="text-sm text-senti-text-muted truncate">{transaction.merchant}</p>
              </div>
              <div className="text-right">
                <p className={`mb-0.5 ${transaction.amount < 0 ? 'text-senti-red' : 'text-senti-green'}`}>
                  {transaction.amount < 0 ? '-' : '+'}${formatCompactBalance(Math.abs(transaction.amount))}
                </p>
                <p className="text-xs text-senti-text-muted">{transaction.date}</p>
              </div>
            </motion.div>
          );
        })}

        {!hasRealTransactions && displayedTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(transaction.type)}`}>
              {getIcon(transaction.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white mb-0.5">{getLabel(transaction.type)}</p>
              <p className="text-sm text-senti-text-muted truncate">{transaction.recipient || transaction.asset}</p>
            </div>
            <div className="text-right">
              <p className={`mb-0.5 ${transaction.amount.startsWith('+') ? 'text-senti-green' : 'text-white'}`}>
                {transaction.amount} {transaction.type !== 'swap' && transaction.asset}
              </p>
              <p className="text-xs text-senti-text-muted">{transaction.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedTransaction && (
        <Portal>
          <TransactionDetailsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </Portal>
      )}

      {showAllTransactions && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
            onClick={() => setShowAllTransactions(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-senti-bg w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[80dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-senti-card-border rounded-full" />
              </div>

              <div className="sticky top-0 bg-senti-bg/80 backdrop-blur-xl z-10 flex items-center justify-between px-6 py-4 border-b border-senti-card-border">
                <h2 className="text-white text-xl font-semibold">All Transactions</h2>
                <button onClick={() => setShowAllTransactions(false)} className="p-2.5 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-senti-text-secondary rotate-90" />
                </button>
              </div>

              <div className="space-y-3 p-6">
                {allTransactions.map((transaction, index) => {
                  const Icon = hasRealTransactions ? transaction.icon : null;
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}
                      onClick={() => { if (hasRealTransactions) { setSelectedTransaction(transaction); setShowAllTransactions(false); } }}
                      className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors"
                    >
                      {hasRealTransactions ? (
                        <>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getDarkIconBg(transaction.color)}`}>
                            <Icon className={`w-5 h-5 ${getDarkIconColor(transaction.color)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white mb-0.5">{transaction.category}</p>
                            <p className="text-sm text-senti-text-muted truncate">{transaction.merchant}</p>
                          </div>
                          <div className="text-right">
                            <p className={`mb-0.5 ${transaction.amount < 0 ? 'text-senti-red' : 'text-senti-green'}`}>
                              {transaction.amount < 0 ? '-' : '+'}${formatCompactBalance(Math.abs(transaction.amount))}
                            </p>
                            <p className="text-xs text-senti-text-muted">{transaction.date}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(transaction.type)}`}>
                            {getIcon(transaction.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white mb-0.5">{getLabel(transaction.type)}</p>
                            <p className="text-sm text-senti-text-muted truncate">{transaction.recipient || transaction.asset}</p>
                          </div>
                          <div className="text-right">
                            <p className={`mb-0.5 ${transaction.amount.startsWith('+') ? 'text-senti-green' : 'text-white'}`}>
                              {transaction.amount} {transaction.type !== 'swap' && transaction.asset}
                            </p>
                            <p className="text-xs text-senti-text-muted">{transaction.timestamp}</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </div>
  );
}
