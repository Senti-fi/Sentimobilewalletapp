import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import TransactionDetailsModal from './TransactionDetailsModal';

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
  {
    id: '1',
    type: 'receive',
    amount: '+10.76',
    asset: 'USDC',
    timestamp: '2 hours ago',
    status: 'completed',
    recipient: 'From 0x742d...0bEb',
  },
  {
    id: '2',
    type: 'send',
    amount: '-25.00',
    asset: 'USDT',
    timestamp: 'Yesterday',
    status: 'completed',
    recipient: 'To 0x5A4B...8F3C',
  },
  {
    id: '3',
    type: 'swap',
    amount: '100.00',
    asset: 'USDC → DAI',
    timestamp: '2 days ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'earn',
    amount: '+2.34',
    asset: 'USDC',
    timestamp: '3 days ago',
    status: 'completed',
    recipient: 'Yield earned',
  },
];

export default function TransactionHistory({ transactions }: TransactionHistoryProps = {}) {
  const [selectedTransaction, setSelectedTransaction] = useState<DashboardTransaction | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // If real transactions are provided, use them; otherwise use mock data
  const hasRealTransactions = transactions && transactions.length > 0;

  // Show only first 3 transactions initially
  const displayLimit = 3;
  const displayedTransactions = hasRealTransactions
    ? transactions!.slice(0, displayLimit)
    : mockTransactions.slice(0, displayLimit);
  const allTransactions = hasRealTransactions ? transactions! : mockTransactions;
  const hasMore = allTransactions.length > displayLimit;

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5" />;
      case 'swap':
        return <ArrowLeftRight className="w-5 h-5" />;
      case 'earn':
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return 'bg-red-100 text-red-600';
      case 'receive':
        return 'bg-green-100 text-green-600';
      case 'swap':
        return 'bg-blue-100 text-blue-600';
      case 'earn':
        return 'bg-purple-100 text-purple-600';
    }
  };

  const getLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'swap':
        return 'Swapped';
      case 'earn':
        return 'Earned';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900">Recent Activity</h2>
        {hasMore && (
          <button
            onClick={() => setShowAllTransactions(true)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        {/* Show real transactions if available */}
        {hasRealTransactions && displayedTransactions.map((transaction, index) => {
          const Icon = transaction.icon;
          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTransaction(transaction)}
              className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded-xl transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${transaction.bg}`}>
                <Icon className={`w-5 h-5 ${transaction.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 mb-0.5">{transaction.category}</p>
                <p className="text-sm text-gray-500 truncate">
                  {transaction.merchant}
                </p>
              </div>
              <div className="text-right">
                <p className={`mb-0.5 ${
                  transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.amount < 0 ? '' : '+'}{transaction.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
            </motion.div>
          );
        })}

        {/* Show mock transactions if no real transactions */}
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
              <p className="text-gray-900 mb-0.5">{getLabel(transaction.type)}</p>
              <p className="text-sm text-gray-500 truncate">
                {transaction.recipient || transaction.asset}
              </p>
            </div>
            <div className="text-right">
              <p className={`mb-0.5 ${
                transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'
              }`}>
                {transaction.amount} {transaction.type !== 'swap' && transaction.asset}
              </p>
              <p className="text-xs text-gray-500">{transaction.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {/* View All Transactions Modal */}
      {showAllTransactions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
          onClick={() => setShowAllTransactions(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 text-xl font-semibold">All Transactions</h2>
              <button
                onClick={() => setShowAllTransactions(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowUpRight className="w-5 h-5 text-gray-600 rotate-90" />
              </button>
            </div>

            <div className="space-y-3">
              {allTransactions.map((transaction, index) => {
                const Icon = hasRealTransactions ? transaction.icon : null;
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      if (hasRealTransactions) {
                        setSelectedTransaction(transaction);
                        setShowAllTransactions(false);
                      }
                    }}
                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors"
                  >
                    {hasRealTransactions ? (
                      <>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${transaction.bg}`}>
                          <Icon className={`w-5 h-5 ${transaction.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 mb-0.5">{transaction.category}</p>
                          <p className="text-sm text-gray-500 truncate">{transaction.merchant}</p>
                        </div>
                        <div className="text-right">
                          <p className={`mb-0.5 ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.amount < 0 ? '' : '+'}{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(transaction.type)}`}>
                          {getIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 mb-0.5">{getLabel(transaction.type)}</p>
                          <p className="text-sm text-gray-500 truncate">{transaction.recipient || transaction.asset}</p>
                        </div>
                        <div className="text-right">
                          <p className={`mb-0.5 ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                            {transaction.amount} {transaction.type !== 'swap' && transaction.asset}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.timestamp}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}