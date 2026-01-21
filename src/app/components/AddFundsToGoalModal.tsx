import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyTarget: number;
  emoji: string;
  color: string;
  isBehind?: boolean;
}

interface AddFundsToGoalModalProps {
  onClose: () => void;
  goal: Goal;
  savingsBalance: number;
  onAddFunds: (goalId: string, amount: number) => void;
}

export default function AddFundsToGoalModal({ 
  onClose, 
  goal, 
  savingsBalance,
  onAddFunds 
}: AddFundsToGoalModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const remainingToGoal = goal.targetAmount - goal.currentAmount;
  const isValid = amountNum > 0 && amountNum <= savingsBalance;
  const wouldComplete = goal.currentAmount + amountNum >= goal.targetAmount;

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onAddFunds(goal.id, amountNum);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`w-20 h-20 rounded-full bg-gradient-to-r ${goal.color} mx-auto mb-6 flex items-center justify-center`}
              >
                <TrendingUp className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Adding Funds</h3>
              <p className="text-sm text-gray-600">Transferring to your goal...</p>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Funds Added!</h3>
              <p className="text-sm text-gray-600 mb-6">
                {wouldComplete ? '🎉 Goal completed!' : 'Keep it up!'}
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Amount Added</span>
                  <span className="text-gray-900">${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goal</span>
                  <span className="text-gray-900">{goal.name}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-gray-900">Add Funds to Goal</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Goal Info */}
                <div className={`bg-gradient-to-br ${goal.color} rounded-2xl p-5 text-white mb-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{goal.emoji}</div>
                    <div>
                      <h3 className="text-white text-lg mb-1">{goal.name}</h3>
                      <p className="text-sm text-white/80">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-white/80 mb-1">Remaining to Goal</p>
                    <p className="text-2xl text-white">${remainingToGoal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Available Balance */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Available in Savings</p>
                    <p className="text-lg text-gray-900">${savingsBalance.toFixed(2)}</p>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-3">Amount to Add</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-4 text-2xl text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </div>

                  {/* Error Messages */}
                  {amountNum > savingsBalance && (
                    <div className="flex items-center gap-2 mt-3 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <p className="text-sm">Insufficient savings balance</p>
                    </div>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">Quick Select</p>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAmount(Math.min(50, remainingToGoal, savingsBalance))}
                      className="px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      $50
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAmount(Math.min(100, remainingToGoal, savingsBalance))}
                      className="px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      $100
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAmount(Math.min(remainingToGoal, savingsBalance))}
                      className="px-4 py-3 bg-blue-100 text-blue-900 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      Complete
                    </motion.button>
                  </div>
                </div>

                {/* Completion Warning */}
                {wouldComplete && amountNum > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-900 mb-1">🎉 This will complete your goal!</p>
                        <p className="text-xs text-green-700">You'll be able to withdraw the full amount</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Button */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={!isValid}
                  className={`w-full rounded-2xl py-4 shadow-lg transition-all ${
                    isValid
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add ${amountNum.toFixed(2)} to Goal
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}