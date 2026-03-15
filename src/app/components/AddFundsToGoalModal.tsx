import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, AlertTriangle } from 'lucide-react';

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

export default function AddFundsToGoalModal({ onClose, goal, savingsBalance, onAddFunds }: AddFundsToGoalModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const remainingToGoal = goal.targetAmount - goal.currentAmount;
  const isValid = amountNum > 0 && amountNum <= savingsBalance;
  const wouldComplete = goal.currentAmount + amountNum >= goal.targetAmount;
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const newProgress = Math.min(((goal.currentAmount + amountNum) / goal.targetAmount) * 100, 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => { onAddFunds(goal.id, amountNum); onClose(); }, 2000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a142f] w-full max-w-md rounded-t-[24px] max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#8ac7ff]" />
        </div>

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mb-6">
                <Loader className="w-14 h-14 text-[#007bff]" />
              </motion.div>
              <p className="text-white text-lg font-semibold mb-1">Adding Funds</p>
              <p className="text-[#8ac7ff] text-sm">Transferring to your goal...</p>
            </motion.div>
          ) : isSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <CheckCircle className="w-14 h-14 text-[#00e6ff]" />
              </motion.div>
              <p className="text-white text-xl font-bold">{wouldComplete ? '🎉 Goal Completed!' : 'Funds Added!'}</p>
              <p className="text-[#8ac7ff] text-sm">{wouldComplete ? 'You reached your goal!' : 'Keep it up!'}</p>
              <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-xl p-4 w-full flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8ac7ff] text-xs">Amount Added</span>
                  <span className="text-white text-xs font-medium">${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8ac7ff] text-xs">Goal</span>
                  <span className="text-white text-xs font-medium">{goal.name}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between shrink-0">
                <p className="text-white text-xl font-bold">Add Funds to Goal</p>
                <button onClick={onClose}><X className="w-5 h-5 text-[#8ac7ff]" /></button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 pb-8 flex flex-col gap-5">
                {/* Goal card */}
                <div className="bg-[#007bff] rounded-[20px] p-5 overflow-hidden relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <p className="text-white text-base font-semibold">{goal.name}</p>
                      <p className="text-[rgba(255,255,255,0.7)] text-xs">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="bg-[rgba(255,255,255,0.2)] rounded-full h-2 mb-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${amountNum > 0 ? newProgress : progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[rgba(255,255,255,0.7)] text-xs">
                      ${remainingToGoal.toFixed(2)} remaining
                    </span>
                    <span className="text-white text-xs font-semibold">
                      {amountNum > 0 ? newProgress.toFixed(0) : progress.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Available balance */}
                <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[#8ac7ff] text-xs">Available in Savings</span>
                  <span className="text-white text-sm font-semibold">${savingsBalance.toFixed(2)}</span>
                </div>

                {/* Amount input */}
                <div className="bg-[#1a2540] border border-[#3c5679] rounded-xl p-4">
                  <label className="text-[#8ac7ff] text-xs block mb-3">Amount to Add</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8ac7ff] text-2xl">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-white text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {amountNum > savingsBalance && (
                    <div className="flex items-center gap-2 mt-2 text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">Insufficient balance</span>
                    </div>
                  )}
                </div>

                {/* Quick select */}
                <div className="flex gap-3">
                  {[50, 100].map((v) => (
                    <button key={v} type="button"
                      onClick={() => setAmount(Math.min(v, remainingToGoal, savingsBalance).toString())}
                      className="flex-1 h-11 bg-[#1a2540] border border-[#3c5679] rounded-xl text-white text-sm"
                    >
                      ${v}
                    </button>
                  ))}
                  <button type="button"
                    onClick={() => setAmount(Math.min(remainingToGoal, savingsBalance).toString())}
                    className="flex-1 h-11 bg-[rgba(0,123,255,0.15)] border border-[rgba(0,123,255,0.3)] rounded-xl text-[#007bff] text-sm font-medium"
                  >
                    Complete
                  </button>
                </div>

                {wouldComplete && amountNum > 0 && (
                  <div className="bg-[rgba(0,230,255,0.08)] border border-[rgba(0,230,255,0.2)] rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#00e6ff] shrink-0" />
                    <p className="text-[#00e6ff] text-xs">This will complete your goal!</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full h-14 bg-[#007bff] rounded-xl text-white text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add ${amountNum.toFixed(2)} to Goal
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
