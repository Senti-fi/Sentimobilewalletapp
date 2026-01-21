import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'earn';
  amount: string;
  asset: string;
  timestamp: string;
  status: 'completed' | 'pending';
  recipient?: string;
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

export default function TransactionHistory() {
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
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        {mockTransactions.map((transaction, index) => (
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
    </div>
  );
}