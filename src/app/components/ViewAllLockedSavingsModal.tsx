import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

interface LockedSaving {
  id: string;
  amount: number;
  asset: string;
  duration: number;
  apy: string;
  startDate: string;
  unlockDate: string;
  earnings: number;
}

interface ViewAllLockedSavingsModalProps {
  onClose: () => void;
  lockedSavings: LockedSaving[];
  onSelectSaving: (saving: LockedSaving) => void;
}

export default function ViewAllLockedSavingsModal({ 
  onClose, 
  lockedSavings,
  onSelectSaving 
}: ViewAllLockedSavingsModalProps) {
  // Calculate totals
  const totalLocked = lockedSavings.reduce((sum, s) => sum + s.amount, 0);
  const totalEarnings = lockedSavings.reduce((sum, s) => sum + s.earnings, 0);
  
  // Sort by unlock date (soonest first)
  const sortedSavings = [...lockedSavings].sort((a, b) => 
    new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
  );

  const getDaysRemaining = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const isUnlocked = (unlockDate: string) => {
    return getDaysRemaining(unlockDate) === 0;
  };

  return (
    <AnimatePresence>
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
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[85dvh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-purple-500 to-pink-500 px-6 py-5 text-white z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white text-2xl">Locked Savings</h2>
                <p className="text-sm text-white/80">{lockedSavings.length} active locks</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/70 mb-1">Total Locked</p>
                  <p className="text-xl text-white">${totalLocked.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Total Earnings</p>
                  <p className="text-xl text-green-300">+${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {sortedSavings.map((saving, index) => {
              const daysLeft = getDaysRemaining(saving.unlockDate);
              const unlocked = isUnlocked(saving.unlockDate);

              return (
                <motion.button
                  key={saving.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectSaving(saving);
                    onClose();
                  }}
                  className={`w-full rounded-2xl p-4 border-2 transition-all ${
                    unlocked 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400' 
                      : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      unlocked 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-gray-900">{saving.amount} {saving.asset}</h4>
                        {unlocked && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                            Ready
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{saving.duration} days lock • {saving.apy}% APY</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">+${saving.earnings.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className={`pt-3 border-t ${unlocked ? 'border-green-200' : 'border-purple-200'} space-y-2`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Unlock Date
                      </span>
                      <span className={unlocked ? 'text-green-600' : 'text-gray-900'}>
                        {new Date(saving.unlockDate).toLocaleDateString()}
                      </span>
                    </div>
                    {!unlocked && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Days Remaining</span>
                        <span className="text-gray-900">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                      </div>
                    )}
                  </div>

                  {/* Tap indicator */}
                  <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {unlocked ? 'Tap to unlock' : 'Tap to view details'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
