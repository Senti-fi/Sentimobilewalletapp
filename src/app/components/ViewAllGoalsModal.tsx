import { motion } from 'motion/react';
import { X, Target, AlertTriangle, ChevronRight } from 'lucide-react';

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

interface ViewAllGoalsModalProps {
  onClose: () => void;
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
}

export default function ViewAllGoalsModal({ onClose, goals, onSelectGoal }: ViewAllGoalsModalProps) {
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDaysLeft = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Due today';
    return `${days} days left`;
  };

  const handleSelectGoal = (goal: Goal) => {
    onSelectGoal(goal);
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
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-gray-900">All Savings Goals</h2>
            <p className="text-sm text-gray-500">{goals.length} active goals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Goals List */}
        <div className="p-6 space-y-3">
          {goals.map((goal, index) => (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectGoal(goal)}
              className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {goal.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-left">
                      <h4 className="text-gray-900">{goal.name}</h4>
                      <p className="text-xs text-gray-500">{formatDaysLeft(goal.deadline)}</p>
                    </div>
                    {goal.isBehind && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-700">Behind</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">${goal.currentAmount.toFixed(2)} saved</span>
                  <span className="text-gray-900">${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress(goal.currentAmount, goal.targetAmount)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${goal.color}`}
                  />
                </div>
              </div>

              {/* Target Info */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600 text-left">
                  Monthly target: <span className="text-gray-900">${goal.monthlyTarget}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}