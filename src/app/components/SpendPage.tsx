import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Utensils,
  Zap,
  ChevronRight,
  Star,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import LucyChip from './LucyChip';
import SentiPayModal from './SentiPayModal';
import CardDrawer from './CardDrawer';
import TransactionDetailsModal from './TransactionDetailsModal';
import Portal from './Portal';

interface SpendPageProps {
  onOpenLucy: () => void;
  recentTransactions: Array<{
    id: string;
    merchant: string;
    category: string;
    amount: number;
    date: string;
    icon: any;
    color: string;
    bg: string;
    type: 'send' | 'vault' | 'investment' | 'swap' | 'internal';
  }>;
  onAddTransaction: (transaction: {
    merchant: string;
    category: string;
    amount: number;
    icon: any;
    color: string;
    bg: string;
    type: 'send' | 'vault' | 'investment' | 'swap' | 'internal';
  }) => void;
}

// Mock spending data by category
const spendingByCategory = [
  { name: 'Shopping', amount: 312.45, color: '#3b82f6', icon: ShoppingBag },
  { name: 'Food & Dining', amount: 287.80, color: '#10b981', icon: Utensils },
  { name: 'Transport', amount: 156.20, color: '#f59e0b', icon: Car },
  { name: 'Utilities', amount: 142.50, color: '#8b5cf6', icon: Zap },
  { name: 'Entertainment', amount: 98.75, color: '#ec4899', icon: Coffee },
  { name: 'Other', amount: 67.30, color: '#6b7280', icon: Home },
];

// Mock cashflow data (weekly)
const cashflowData = [
  { week: 'Week 1', income: 875, spending: 312 },
  { week: 'Week 2', income: 650, spending: 428 },
  { week: 'Week 3', income: 1120, spending: 267 },
  { week: 'Week 4', income: 780, spending: 385 },
];

export default function SpendPage({ onOpenLucy, recentTransactions, onAddTransaction }: SpendPageProps) {
  const [showSentiPay, setShowSentiPay] = useState(false);
  const [showCardDrawer, setShowCardDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SpendPageProps['recentTransactions'][0] | null>(null);

  // Default mock transactions
  const defaultTransactions = [
    { id: 'spend-1', merchant: 'Whole Foods Market', category: 'Shopping', amount: 67.42, date: '3 hours ago', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'spend-2', merchant: 'Chipotle', category: 'Food & Dining', amount: 14.85, date: '6 hours ago', icon: Utensils, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'spend-3', merchant: 'Uber', category: 'Transport', amount: 18.50, date: 'Yesterday', icon: Car, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'spend-4', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, date: '2 days ago', icon: Coffee, color: 'text-pink-600', bg: 'bg-pink-100' },
    { id: 'spend-5', merchant: 'Shell Gas Station', category: 'Transport', amount: 42.30, date: '3 days ago', icon: Car, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  // Merge new transactions with default ones
  const allTransactions = [...recentTransactions, ...defaultTransactions];

  // Calculate totals
  const totalSpent = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);
  const totalIncome = cashflowData.reduce((sum, data) => sum + data.income, 0);
  const totalSpending = cashflowData.reduce((sum, data) => sum + data.spending, 0);
  const netCashflow = totalIncome - totalSpending;
  
  // Budget predictions
  const monthlyBudget = 2000;
  const budgetRemaining = monthlyBudget - totalSpent;
  const budgetUsedPercent = (totalSpent / monthlyBudget) * 100;
  const isOverBudget = budgetUsedPercent > 100;
  const isNearBudget = budgetUsedPercent > 80 && budgetUsedPercent <= 100;

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 px-6 pt-6 pb-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-1">Spend</h1>
              <p className="text-sm text-white/80">Track and manage your spending</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* This Month Overview */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
            <p className="text-sm text-white/70 mb-2">This Month</p>
            <h2 className="text-4xl mb-4">${totalSpent.toFixed(2)}</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-white/70 mb-1">Budget</p>
                <p className="text-lg">${monthlyBudget.toFixed(2)}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/70 mb-1">Remaining</p>
                <p className={`text-lg ${isOverBudget ? 'text-red-300' : 'text-white'}`}>
                  ${Math.abs(budgetRemaining).toFixed(2)}
                  {isOverBudget && ' over'}
                </p>
              </div>
            </div>
            
            {/* Budget Progress */}
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full ${isOverBudget ? 'bg-red-400' : isNearBudget ? 'bg-yellow-400' : 'bg-green-400'}`}
                />
              </div>
              <p className="text-xs text-white/70 mt-1">
                {budgetUsedPercent.toFixed(0)}% of monthly budget used
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Senti Pay CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSentiPay(true)}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-2xl p-5 shadow-xl border border-white/20"
          >
            <div className="flex flex-col items-start gap-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg mb-0.5">Senti Pay</h3>
                <p className="text-xs text-white/80">Send & pay instantly</p>
              </div>
            </div>
          </motion.button>

          {/* My Card Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCardDrawer(true)}
            className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white rounded-2xl p-5 shadow-xl"
          >
            <div className="flex flex-col items-start gap-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg mb-0.5">My Card</h3>
                <p className="text-xs text-white/80">Manage card settings</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Lucy's Insight */}
        {(isOverBudget || isNearBudget) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-gray-900" />
              <h3 className="text-gray-900">Lucy's Insight</h3>
            </div>

            {isOverBudget && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 rounded-2xl p-4 border border-red-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 text-sm mb-1">Over Budget</h4>
                    <p className="text-xs text-gray-700 mb-3">
                      You're ${Math.abs(budgetRemaining).toFixed(2)} over your monthly budget. 
                      Lucy recommends pausing non-essential purchases.
                    </p>
                    <button
                      onClick={onOpenLucy}
                      className="text-xs text-red-700 hover:text-red-800 font-medium"
                    >
                      Get Lucy's advice →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {isNearBudget && !isOverBudget && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 text-sm mb-1">Approaching Budget Limit</h4>
                    <p className="text-xs text-gray-700 mb-3">
                      You've spent {budgetUsedPercent.toFixed(0)}% of your monthly budget. 
                      Consider reducing discretionary spending.
                    </p>
                    <button
                      onClick={onOpenLucy}
                      className="text-xs text-yellow-700 hover:text-yellow-800 font-medium"
                    >
                      Ask Lucy for tips →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Cashflow Summary - Compact */}
        <div>
          <h3 className="text-gray-900 mb-3">This Month's Cashflow</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-1 mb-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-green-600" />
                <p className="text-xs text-gray-600">Income</p>
              </div>
              <p className="text-xl text-gray-900">${totalIncome.toFixed(0)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-3 border border-red-200">
              <div className="flex items-center gap-1 mb-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                <p className="text-xs text-gray-600">Spent</p>
              </div>
              <p className="text-xl text-gray-900">${totalSpending.toFixed(0)}</p>
            </div>
            <div className={`bg-gradient-to-br ${netCashflow >= 0 ? 'from-blue-50 to-cyan-50 border-blue-200' : 'from-orange-50 to-red-50 border-orange-200'} rounded-xl p-3 border`}>
              <div className="flex items-center gap-1 mb-1">
                {netCashflow >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-orange-600" />
                )}
                <p className="text-xs text-gray-600">Net</p>
              </div>
              <p className={`text-xl ${netCashflow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {netCashflow >= 0 ? '+' : ''}${netCashflow.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Top Categories</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-2">
            {spendingByCategory.slice(0, 3).map((category, index) => {
              const percentage = (category.amount / totalSpent) * 100;
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <category.icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 text-sm">{category.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                            className="h-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <p className="text-gray-900">${category.amount.toFixed(0)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Recent</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {allTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTransaction(transaction)}
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 ${transaction.bg} rounded-xl flex items-center justify-center`}>
                  <transaction.icon className={`w-5 h-5 ${transaction.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">{transaction.merchant}</p>
                  <p className="text-xs text-gray-500">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">-${transaction.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lucy Recommendation */}
        <div>
          <LucyChip text="How can I reduce my spending this month?" onClick={onOpenLucy} />
        </div>
      </div>

      {/* Senti Pay Modal */}
      {showSentiPay && (
        <Portal>
          <SentiPayModal
            onClose={() => setShowSentiPay(false)}
            onAddTransaction={onAddTransaction}
          />
        </Portal>
      )}

      {/* Card Drawer */}
      <CardDrawer
        isOpen={showCardDrawer}
        onClose={() => setShowCardDrawer(false)}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Portal>
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        </Portal>
      )}
    </div>
  );
}