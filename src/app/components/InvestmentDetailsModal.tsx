import { motion } from 'motion/react';
import { X, TrendingUp, Calendar, DollarSign, Percent, ExternalLink, Shield, Activity } from 'lucide-react';

interface InvestmentDetailsModalProps {
  onClose: () => void;
  investment: {
    id: string;
    name: string;
    amount: number;
    asset: string;
    apy: string;
    protocol: string;
    startDate: Date;
    earned: number;
  };
}

export default function InvestmentDetailsModal({ onClose, investment }: InvestmentDetailsModalProps) {
  const daysSinceStart = Math.floor((Date.now() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const simulatedEarnings = (investment.amount * parseFloat(investment.apy) / 100 / 365 * daysSinceStart);
  const currentValue = investment.amount + simulatedEarnings;
  const dailyYield = simulatedEarnings / Math.max(daysSinceStart, 1);
  const projectedMonthly = dailyYield * 30;
  const projectedYearly = investment.amount * parseFloat(investment.apy) / 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[85dvh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-gray-900">Investment Details</h2>
            <p className="text-sm text-gray-500">{investment.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Value Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Current Position Value</p>
            <h2 className="text-4xl text-gray-900 mb-4">${currentValue.toFixed(2)}</h2>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Earned</p>
                <p className="text-lg text-green-600">+${simulatedEarnings.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Return</p>
                <p className="text-lg text-green-600">+{((simulatedEarnings / investment.amount) * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Investment Overview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-gray-900 text-sm mb-3">Investment Overview</h3>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Initial Deposit</span>
              </div>
              <span className="text-gray-900">${investment.amount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Percent className="w-4 h-4" />
                <span className="text-sm">APY Rate</span>
              </div>
              <span className="text-green-600">{investment.apy}%</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <span className="text-gray-900">{investment.startDate.toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Days Active</span>
              </div>
              <span className="text-gray-900">{daysSinceStart} days</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Protocol</span>
              </div>
              <span className="text-gray-900">{investment.protocol}</span>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <h3 className="text-gray-900 text-sm mb-3">Earnings Breakdown</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Yield</span>
                <span className="text-green-600">+${dailyYield.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projected Monthly</span>
                <span className="text-green-600">+${projectedMonthly.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projected Yearly</span>
                <span className="text-green-600">+${projectedYearly.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 text-sm">Performance</h3>
              <span className="text-xs text-gray-500">Last {daysSinceStart} days</span>
            </div>
            <div className="h-32 bg-gradient-to-t from-green-50 to-transparent rounded-xl flex items-end justify-center gap-1 p-4">
              {Array.from({ length: Math.min(daysSinceStart, 30) }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-green-400 to-green-500 rounded-t"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                />
              ))}
            </div>
          </div>

          {/* Protocol Link */}
          <button className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-900">View on {investment.protocol}</p>
                <p className="text-xs text-gray-500">Check protocol details</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </button>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-xs text-blue-900">
              <span className="font-medium">Note:</span> Your earnings are automatically compounded and can be withdrawn at any time. APY rates may vary based on market conditions.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
