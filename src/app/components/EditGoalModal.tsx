import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Calendar, DollarSign } from 'lucide-react';

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

interface EditGoalModalProps {
  onClose: () => void;
  goal: Goal;
  onUpdate: (goalId: string, updatedGoal: Partial<Goal>) => void;
}

const goalEmojis = ['🏥', '💻', '✈️', '🏠', '🚗', '🎓', '💍', '🎮', '📱', '🎸'];
const goalColors = [
  'from-red-400 to-pink-500',
  'from-blue-400 to-cyan-500',
  'from-purple-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-yellow-400 to-orange-500',
  'from-pink-400 to-rose-500',
];

export default function EditGoalModal({ onClose, goal, onUpdate }: EditGoalModalProps) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [deadline, setDeadline] = useState(goal.deadline);
  const [monthlyTarget, setMonthlyTarget] = useState(goal.monthlyTarget.toString());
  const [selectedEmoji, setSelectedEmoji] = useState(goal.emoji);
  const [selectedColor, setSelectedColor] = useState(goal.color);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedGoal = {
      name,
      targetAmount: parseFloat(targetAmount),
      deadline,
      monthlyTarget: parseFloat(monthlyTarget),
      emoji: selectedEmoji,
      color: selectedColor,
    };

    setIsProcessing(true);

    setTimeout(() => {
      onUpdate(goal.id, updatedGoal);
      onClose();
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-end sm:items-center justify-center"
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
              className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedColor} mx-auto mb-6 flex items-center justify-center`}
              >
                <Target className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Updating Goal</h3>
              <p className="text-sm text-gray-600">Saving your changes...</p>
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
                <h2 className="text-gray-900">Edit Goal</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Emoji Selection */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-3">Choose an Icon</label>
                  <div className="grid grid-cols-5 gap-3">
                    {goalEmojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                          selectedEmoji === emoji
                            ? 'bg-blue-100 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-3">Choose a Color</label>
                  <div className="grid grid-cols-3 gap-3">
                    {goalColors.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color)}
                        className={`h-12 rounded-xl bg-gradient-to-r ${color} transition-all ${
                          selectedColor === color
                            ? 'ring-4 ring-blue-500 ring-offset-2'
                            : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Goal Name */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Emergency Fund"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* Target Amount */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      required
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Target Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-base"
                    required
                  />
                </div>

                {/* Monthly Target */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Monthly Savings Target</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    How much you plan to save each month toward this goal
                  </p>
                </div>

                {/* Current Progress Note */}
                <div className="mb-6 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-900">Current Progress:</span> ${goal.currentAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your saved amount will remain unchanged
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-4 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}