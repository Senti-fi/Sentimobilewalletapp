import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, CheckCircle2, AlertTriangle, TrendingUp, Calendar, DollarSign, ArrowRight } from 'lucide-react';

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

interface GoalDetailsModalProps {
  onClose: () => void;
  goal: Goal;
  onWithdraw: (goalId: string) => void;
  onAddFunds?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
}

export default function GoalDetailsModal({ onClose, goal, onWithdraw, onAddFunds, onEdit }: GoalDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDaysLeft = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Due today';
    return `${days} days remaining`;
  };

  const handleWithdrawClick = () => {
    setShowWithdrawConfirm(true);
  };

  const handleConfirmWithdraw = () => {
    setShowWithdrawConfirm(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onWithdraw(goal.id);
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 2000);
  };

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
              <h3 className="text-gray-900 mb-2">Withdrawing Funds</h3>
              <p className="text-sm text-gray-600">Please wait while we process your request...</p>
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
              <h3 className="text-gray-900 mb-2">Withdrawn Successfully!</h3>
              <p className="text-sm text-gray-600 mb-6">Funds transferred to your wallet</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-gray-900">${goal.currentAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goal</span>
                  <span className="text-gray-900">{goal.name}</span>
                </div>
              </div>
            </motion.div>
          ) : showWithdrawConfirm ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              {/* Confirm Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-gray-900">Confirm Withdrawal</h2>
                <button
                  onClick={() => setShowWithdrawConfirm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Goal Info */}
                <div className={`bg-gradient-to-br ${goal.color} rounded-2xl p-6 text-white mb-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{goal.emoji}</div>
                    <div>
                      <h3 className="text-white text-xl mb-1">{goal.name}</h3>
                      <p className="text-sm text-white/80">Savings Goal</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm text-white/80 mb-1">Withdrawal Amount</p>
                    <p className="text-3xl text-white">${goal.currentAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Warning/Info */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 mb-1">Withdrawing will close this goal</p>
                      <p className="text-xs text-blue-700">Funds will be transferred to your main wallet and this goal will be removed from your savings.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmWithdraw}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Confirm Withdrawal
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowWithdrawConfirm(false)}
                    className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-gray-900">Goal Details</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Goal Header */}
                <div className={`bg-gradient-to-br ${goal.color} rounded-2xl p-6 text-white mb-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{goal.emoji}</div>
                      <div>
                        <h3 className="text-white text-xl mb-1">{goal.name}</h3>
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                            <span className="text-sm text-green-300">Goal Completed!</span>
                          </div>
                        ) : (
                          <p className="text-sm text-white/80">{formatDaysLeft(goal.deadline)}</p>
                        )}
                      </div>
                    </div>
                    {goal.isBehind && !isCompleted && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/30 rounded-lg backdrop-blur-sm">
                        <AlertTriangle className="w-3 h-3 text-yellow-200" />
                        <span className="text-xs text-yellow-200">Behind</span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/80">${goal.currentAmount.toFixed(2)}</span>
                      <span className="text-white">${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-white/80 mb-1">Progress</p>
                    <p className="text-2xl text-white">{progress.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <p className="text-xs text-gray-600">Monthly Target</p>
                    </div>
                    <p className="text-xl text-gray-900">${goal.monthlyTarget}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-xs text-gray-600">Deadline</p>
                    </div>
                    <p className="text-sm text-gray-900">{new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Remaining Amount */}
                {!isCompleted && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Remaining to Save</p>
                        <p className="text-xl text-gray-900">${(goal.targetAmount - goal.currentAmount).toFixed(2)}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {isCompleted ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWithdrawClick}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Withdraw Funds
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onAddFunds?.(goal.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Add Funds
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onEdit?.(goal.id)}
                      className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 hover:bg-gray-200 transition-colors"
                    >
                      Edit Goal
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}