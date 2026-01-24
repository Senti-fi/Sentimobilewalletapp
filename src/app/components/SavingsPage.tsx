import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Target,
  Plus,
  Lock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  DollarSign,
  Flame,
  Users,
  Trophy,
  Gift,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import CreateGoalModal from './CreateGoalModal';
import LockedSavingsModal from './LockedSavingsModal';
import SavingsDepositModal from './SavingsDepositModal';
import SavingsTransferModal from './SavingsTransferModal';
import UnlockSavingsModal from './UnlockSavingsModal';
import ViewAllLockedSavingsModal from './ViewAllLockedSavingsModal';
import ViewAllGoalsModal from './ViewAllGoalsModal';
import GoalDetailsModal from './GoalDetailsModal';
import AddFundsToGoalModal from './AddFundsToGoalModal';
import EditGoalModal from './EditGoalModal';

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

interface LockedSaving {
  id: string;
  amount: number;
  asset: string;
  duration: number; // in days
  apy: string;
  startDate: string;
  unlockDate: string;
  earnings: number;
}

interface SavingsPageProps {
  onOpenLucy: () => void;
  onSavingsDeposit?: (amount: number) => void;
  onSavingsWithdraw?: (amount: number, destination: string) => void;
  onSavingsLock?: (amount: number, days: number, apy: string) => void;
  onSavingsUnlock?: (amount: number, penalty: number) => void;
  onGoalContribution?: (amount: number, goalName: string) => void;
}

export default function SavingsPage({
  onOpenLucy,
  onSavingsDeposit,
  onSavingsWithdraw,
  onSavingsLock,
  onSavingsUnlock,
  onGoalContribution,
}: SavingsPageProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showLockedSavings, setShowLockedSavings] = useState(false);
  const [showAllLockedSavings, setShowAllLockedSavings] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [selectedLockedSaving, setSelectedLockedSaving] = useState<LockedSaving | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalToAddFunds, setGoalToAddFunds] = useState<Goal | null>(null);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [cameFromAllGoals, setCameFromAllGoals] = useState(false);
  
  // Mock data for goals
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 2340,
      deadline: '2025-12-31',
      monthlyTarget: 450,
      emoji: '🏥',
      color: 'from-red-400 to-pink-500',
    },
    {
      id: '2',
      name: 'Laptop Fund',
      targetAmount: 1200,
      currentAmount: 450,
      deadline: '2025-08-15',
      monthlyTarget: 150,
      emoji: '💻',
      color: 'from-blue-400 to-cyan-500',
      isBehind: true,
    },
    {
      id: '3',
      name: 'Travel to Paris',
      targetAmount: 3000,
      currentAmount: 1800,
      deadline: '2025-10-01',
      monthlyTarget: 200,
      emoji: '✈️',
      color: 'from-cyan-400 to-blue-500',
    },
  ]);

  // Locked savings (start empty for MVP testing)
  const [lockedSavings, setLockedSavings] = useState<LockedSaving[]>([]);

  // Calculate total savings
  const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalLocked = lockedSavings.reduce((sum, ls) => sum + ls.amount, 0);
  
  // Available balance (funds not in goals or locked)
  const [availableSavings, setAvailableSavings] = useState(1250.50);
  
  const totalSavings = availableSavings + totalInGoals + totalLocked;

  // Mock rewards data
  const saveStreak = 12; // days
  const completedGoals = 3;
  const totalRewards = 145.50;

  // Mock this month data for time-based framing
  const thisMonthSaved = 245;
  const lastMonthSaved = 207;
  const monthlyGrowth = ((thisMonthSaved - lastMonthSaved) / lastMonthSaved) * 100;

  // Mock overall growth percentage for endowment effect
  const totalGrowthPercent = 12.3; // Growth since account creation

  const handleCreateGoal = (goalData: any) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      ...goalData,
    };
    setGoals([...goals, newGoal]);
    setShowCreateGoal(false);
  };

  const handleCreateLockedSaving = (savingData: any) => {
    const newSaving: LockedSaving = {
      id: Date.now().toString(),
      ...savingData,
    };

    // Deduct from available savings
    setAvailableSavings(prev => prev - savingData.amount);

    // Log transaction to history
    onSavingsLock?.(savingData.amount, savingData.duration, savingData.apy);

    setLockedSavings([...lockedSavings, newSaving]);
    setShowLockedSavings(false);
  };

  const handleDeposit = (amount: number, asset: string) => {
    // Add funds to available savings (from wallet)
    setAvailableSavings(prev => prev + amount);

    // Log transaction to history
    onSavingsDeposit?.(amount);

    console.log(`Deposited ${amount} ${asset} to Savings`);
  };

  const handleTransfer = (amount: number, asset: string, destination: string) => {
    // Remove funds from available savings (to wallet/spend)
    setAvailableSavings(prev => prev - amount);

    // Log transaction to history
    onSavingsWithdraw?.(amount, destination);

    console.log(`Transferred ${amount} ${asset} from Savings to ${destination}`);
  };

  const handleUnlock = (savingId: string, isEarly: boolean) => {
    // Find the saving being unlocked
    const saving = lockedSavings.find(s => s.id === savingId);
    if (saving) {
      // Calculate the total amount to return (principal + earnings, minus penalty if early)
      const penalty = isEarly ? (saving.earnings * 0.5) : 0; // 50% penalty on earnings if early
      const totalAmount = isEarly
        ? saving.amount + (saving.earnings * 0.5)
        : saving.amount + saving.earnings;

      // Add unlocked funds back to available savings
      setAvailableSavings(prev => prev + totalAmount);

      // Log transaction to history
      onSavingsUnlock?.(totalAmount, penalty);

      // Remove from locked savings
      setLockedSavings(lockedSavings.filter(s => s.id !== savingId));
      console.log(`Unlocked saving ${savingId}, early: ${isEarly}, returned $${totalAmount}`);
    }
    setSelectedLockedSaving(null);
  };

  const handleWithdrawGoal = (goalId: string) => {
    // In a real app, this would transfer funds back to wallet and remove/archive the goal
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      console.log(`Withdrew $${goal.currentAmount} from goal: ${goal.name}`);
      setGoals(goals.filter(g => g.id !== goalId));
    }
    setSelectedGoal(null);
    // Reset navigation tracking
    setCameFromAllGoals(false);
  };

  const handleAddFundsToGoal = (goalId: string) => {
    // Close the goal details modal and open the add funds modal
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoal(null);
      setGoalToAddFunds(goal);
    }
  };

  const handleConfirmAddFunds = (goalId: string, amount: number) => {
    // Find the goal being funded
    const goal = goals.find(g => g.id === goalId);

    // Log transaction to history
    if (goal) {
      onGoalContribution?.(amount, goal.name);
    }

    // Add the amount to the goal's current amount and check for completion
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const newCurrentAmount = g.currentAmount + amount;

        // Check if goal is now complete (100%)
        if (newCurrentAmount >= g.targetAmount) {
          // Auto-transfer completed goal funds to Available Savings
          setAvailableSavings(prev => prev + newCurrentAmount);
          // Remove the completed goal
          setTimeout(() => {
            setGoals(goals.filter(goal => goal.id !== goalId));
          }, 100);
          return null; // Will be filtered out
        }

        // If not complete, recalculate behind status
        const daysLeft = getDaysRemaining(g.deadline);
        const monthsLeft = Math.floor(daysLeft / 30);
        const expectedAmount = g.monthlyTarget * monthsLeft;
        const shouldBeAt = g.targetAmount - expectedAmount;
        const isBehind = newCurrentAmount < shouldBeAt;

        return { ...g, currentAmount: newCurrentAmount, isBehind };
      }
      return g;
    }).filter(g => g !== null) as Goal[];

    setGoals(updatedGoals);
    setGoalToAddFunds(null);
  };

  const handleEditGoal = (goalId: string) => {
    // Close the goal details modal and open the edit goal modal
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoal(null);
      setGoalToEdit(goal);
    }
  };

  const handleCancelEditGoal = () => {
    // When X is clicked, go back to the goal details modal
    if (goalToEdit) {
      const goal = goals.find(g => g.id === goalToEdit.id);
      setGoalToEdit(null);
      setTimeout(() => {
        if (goal) {
          setSelectedGoal(goal);
        }
      }, 300);
    } else {
      setGoalToEdit(null);
    }
  };

  const handleConfirmEditGoal = (goalId: string, updatedGoal: Partial<Goal>) => {
    // Update the goal with the new data
    const updatedGoals = goals.map(g => 
      g.id === goalId 
        ? { ...g, ...updatedGoal }
        : g
    );
    setGoals(updatedGoals);
    
    // Find the updated goal and reopen the details modal
    const updatedGoalData = updatedGoals.find(g => g.id === goalId);
    setGoalToEdit(null);
    
    // Reopen the goal details modal with updated data
    if (updatedGoalData) {
      setTimeout(() => {
        setSelectedGoal(updatedGoalData);
      }, 300);
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Sort goals by priority: behind first, then by deadline urgency
  const getSortedGoals = () => {
    return [...goals].sort((a, b) => {
      // Behind goals come first
      if (a.isBehind && !b.isBehind) return -1;
      if (!a.isBehind && b.isBehind) return 1;

      // Then sort by days remaining (most urgent first)
      const daysA = getDaysRemaining(a.deadline);
      const daysB = getDaysRemaining(b.deadline);
      return daysA - daysB;
    });
  };

  const sortedGoals = getSortedGoals();

  return (
    <div className="h-full overflow-y-auto pb-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header - Compact */}
      <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 px-6 pt-6 pb-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header with Streak Badge */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-0.5">Savings</h1>
              <p className="text-xs text-white/80">Build your future, one step at a time</p>
            </div>
            {saveStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center gap-1.5 bg-gradient-to-br from-orange-400 to-pink-500 px-3 py-1.5 rounded-full shadow-lg"
              >
                <Flame className="w-4 h-4 text-white" />
                <span className="font-bold text-white text-sm">{saveStreak}</span>
              </motion.div>
            )}
          </div>

          {/* Total Savings - Compact */}
          <div className="text-center mb-5">
            <p className="text-xs text-white/70 mb-1">Total Savings</p>
            <motion.h2
              className="text-5xl font-bold mb-1.5"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              ${totalSavings.toFixed(2)}
            </motion.h2>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-white/80">
                {goals.length} goals • {lockedSavings.length} locked
              </span>
              {totalGrowthPercent > 0 && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-green-300 font-medium">
                    ↑ {totalGrowthPercent.toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Single Deposit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDepositModal(true)}
            className="w-full bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:bg-white transition-colors"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-semibold">Deposit to Savings</p>
                <p className="text-xs text-gray-600">Add funds from wallet</p>
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Available Savings Card with Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">💰 Available to Use</p>
              <h3 className="text-3xl font-bold text-gray-900">
                ${availableSavings.toFixed(2)}
              </h3>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-4">
            Funds ready to add to goals, lock for interest, or withdraw
          </p>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowLockedSavings(true)}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-colors text-left"
            >
              <Lock className="w-4 h-4 text-blue-600 mb-1.5" />
              <p className="text-xs font-semibold text-gray-900">Lock & Earn</p>
            </button>

            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:bg-white transition-colors text-left"
            >
              <ArrowRight className="w-4 h-4 text-cyan-600 mb-1.5" />
              <p className="text-xs font-semibold text-gray-900">Withdraw</p>
            </button>
          </div>
        </motion.div>

        {/* This Month Progress Card */}
        {thisMonthSaved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">This Month</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${thisMonthSaved.toFixed(0)}
                </h3>
              </div>
              {monthlyGrowth !== 0 && (
                <div className={`px-3 py-1 rounded-full ${
                  monthlyGrowth > 0
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <span className="text-sm font-semibold">
                    {monthlyGrowth > 0 ? '↑' : '↓'} {Math.abs(monthlyGrowth).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600">
              {monthlyGrowth > 0
                ? `Great momentum! You're saving ${Math.abs(monthlyGrowth).toFixed(0)}% more than last month.`
                : `You saved ${Math.abs(monthlyGrowth).toFixed(0)}% less than last month. You've got this!`
              }
            </p>
          </motion.div>
        )}

        {/* Smart Priority Card */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
          >
            {sortedGoals.some(g => g.isBehind) ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">⚠️ Goal At Risk</h3>
                    <p className="text-xs text-gray-600">Action required this month</p>
                  </div>
                </div>
                {(() => {
                  const behindGoal = sortedGoals.find(g => g.isBehind);
                  if (behindGoal) {
                    const daysLeft = getDaysRemaining(behindGoal.deadline);
                    const monthlyNeeded = behindGoal.monthlyTarget;
                    const behindBy = behindGoal.targetAmount - behindGoal.currentAmount - (monthlyNeeded * Math.floor(daysLeft / 30));
                    const monthsDelay = Math.ceil(behindBy / monthlyNeeded);

                    return (
                      <>
                        <div className="bg-red-50 rounded-xl p-3 mb-4">
                          <p className="text-sm text-gray-900 font-medium mb-1">
                            {behindGoal.name}
                          </p>
                          <p className="text-xs text-red-700">
                            At current rate, you'll miss your deadline by ~{monthsDelay} {monthsDelay === 1 ? 'month' : 'months'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                          Add <span className="font-bold text-gray-900">${monthlyNeeded}</span> this month to get back on track
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setGoalToAddFunds(behindGoal);
                          }}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl py-3 font-semibold shadow-md"
                        >
                          Save My Goal
                        </motion.button>
                      </>
                    );
                  }
                })()}
              </>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="text-gray-900 font-semibold text-lg">🎉 You're on track!</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  All your goals are progressing well. Keep up the great work!
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Savings Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900 text-lg font-semibold">Savings Goals</h3>
              <p className="text-xs text-gray-500">{goals.length} active goals</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateGoal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Goal</span>
            </motion.button>
          </div>

          {/* Goals List */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h4 className="text-gray-900 mb-2">No Goals Yet</h4>
                <p className="text-sm text-gray-600 mb-4">Create a savings goal and track your progress</p>
                <button
                  onClick={() => setShowCreateGoal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Create Your First Goal →
                </button>
              </div>
            ) : (
              <>
                {/* Strategic Social Proof - Only show if user is on track and has multiple goals */}
                {!sortedGoals.some(g => g.isBehind) && goals.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold text-green-700">You're ahead!</span> You save more than 68% of users
                      </p>
                    </div>
                  </motion.div>
                )}

                {sortedGoals.slice(0, 1).map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative"
                  >
                    {/* Quick Add Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGoalToAddFunds(goal);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>

                    <button
                      onClick={() => {
                        setCameFromAllGoals(false);
                        setSelectedGoal(goal);
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center text-2xl`}>
                          {goal.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1 pr-8">
                            <div className="text-left">
                              <h4 className="text-gray-900 font-semibold">{goal.name}</h4>
                              <p className="text-xs text-gray-500">{getDaysRemaining(goal.deadline)} days left</p>
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
                          <span className="text-gray-900 font-semibold">${goal.targetAmount.toFixed(2)}</span>
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
                          Monthly target: <span className="text-gray-900 font-medium">${goal.monthlyTarget}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  </motion.div>
                ))}

                {/* View All Goals Button */}
                {goals.length > 1 && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAllGoals(true);
                      setCameFromAllGoals(true);
                    }}
                    className="w-full bg-white rounded-2xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-gray-900 text-sm font-medium">View All Goals</p>
                          <p className="text-xs text-gray-600">{goals.length} active goals</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Locked Savings Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900 text-lg font-semibold">Locked Savings</h3>
              <p className="text-xs text-gray-500">Earn higher yields with time-locks</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLockedSavings(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Lock Funds</span>
            </motion.button>
          </div>

          {/* Locked Savings List */}
          <div className="space-y-3">
            {lockedSavings.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center border border-blue-100">
                <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h4 className="text-gray-900 font-semibold mb-2">No Locked Savings Yet</h4>
                <p className="text-sm text-gray-600 mb-4">Lock your funds for 30-365 days and earn up to 15% APY</p>
                <button
                  onClick={() => setShowLockedSavings(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Learn More →
                </button>
              </div>
            ) : (
              <>
                {lockedSavings.slice(0, 1).map((saving, index) => (
                  <motion.button
                    key={saving.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLockedSaving(saving)}
                    className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-gray-900 font-semibold">{saving.amount} {saving.asset}</h4>
                          <p className="text-xs text-gray-600">{saving.duration} days lock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-semibold">{saving.apy}% APY</p>
                        <p className="text-xs text-gray-500">+${saving.earnings.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Unlocks on</span>
                        <span className="text-gray-900 font-medium">{new Date(saving.unlockDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {/* View All Button */}
                {lockedSavings.length > 1 && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAllLockedSavings(true)}
                    className="w-full bg-white rounded-2xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-gray-900 text-sm font-medium">View All Locked Savings</p>
                          <p className="text-xs text-gray-600">{lockedSavings.length} active locks</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Rewards Section - Full */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-gray-900" />
            <h3 className="text-gray-900 text-lg font-semibold">Rewards</h3>
          </div>

          {/* Total Rewards Earned Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-400 via-pink-500 to-pink-600 rounded-2xl p-5 text-white mb-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-white" />
              <p className="text-sm text-white/90">Total Rewards Earned</p>
            </div>
            <h3 className="text-4xl font-bold mb-4">${totalRewards.toFixed(2)}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-white" />
                  <p className="text-xs text-white/80">Save Streak</p>
                </div>
                <p className="text-xl font-bold">{saveStreak} days</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-white" />
                  <p className="text-xs text-white/80">Completed</p>
                </div>
                <p className="text-xl font-bold">{completedGoals} goals</p>
              </div>
            </div>
          </motion.div>

          {/* Reward Opportunities */}
          <div className="space-y-3">
            {/* 30-Day Streak Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-gray-900 text-sm font-semibold">30-Day Streak Bonus</h4>
                    <span className="text-sm font-bold text-green-600">+$25</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Save for 30 consecutive days</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                        style={{ width: `${(saveStreak / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{saveStreak}/30</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Save More, Earn More */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 text-sm font-semibold">Save More, Earn More</h4>
                    <p className="text-xs text-gray-600">Unlock higher reward tiers</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>

            {/* Referral Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 text-sm font-semibold">Referral Bonus</h4>
                    <p className="text-xs text-gray-600">Invite friends and earn $10 each</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Modals */}
      {showCreateGoal && (
        <CreateGoalModal
          onClose={() => setShowCreateGoal(false)}
          onCreate={handleCreateGoal}
          onOpenLucy={onOpenLucy}
        />
      )}

      {showLockedSavings && (
        <LockedSavingsModal
          onClose={() => setShowLockedSavings(false)}
          onCreate={handleCreateLockedSaving}
          onExploreVaults={() => {
            // TODO: Navigate to Vault page when implemented
            console.log('Navigate to Vault page');
          }}
        />
      )}

      {showDepositModal && (
        <SavingsDepositModal
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
          goal={goalToAddFunds}
        />
      )}

      {showTransferModal && (
        <SavingsTransferModal
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransfer}
          savingsBalance={totalSavings}
        />
      )}

      {selectedLockedSaving && (
        <UnlockSavingsModal
          onClose={() => setSelectedLockedSaving(null)}
          onUnlock={handleUnlock}
          saving={selectedLockedSaving}
        />
      )}

      {showAllLockedSavings && (
        <ViewAllLockedSavingsModal
          onClose={() => setShowAllLockedSavings(false)}
          lockedSavings={lockedSavings}
          onSelectSaving={(saving) => {
            setSelectedLockedSaving(saving);
            setShowAllLockedSavings(false);
          }}
        />
      )}

      {showAllGoals && (
        <ViewAllGoalsModal
          onClose={() => {
            setShowAllGoals(false);
            setCameFromAllGoals(false);
          }}
          goals={goals}
          onSelectGoal={(goal) => {
            setSelectedGoal(goal);
            setShowAllGoals(false);
          }}
        />
      )}

      {selectedGoal && (
        <GoalDetailsModal
          onClose={() => {
            setSelectedGoal(null);
            // If we came from All Goals modal, reopen it
            if (cameFromAllGoals) {
              setTimeout(() => {
                setShowAllGoals(true);
              }, 300);
            }
          }}
          goal={selectedGoal}
          onWithdraw={handleWithdrawGoal}
          onAddFunds={handleAddFundsToGoal}
          onEdit={handleEditGoal}
        />
      )}

      {goalToAddFunds && (
        <AddFundsToGoalModal
          onClose={() => setGoalToAddFunds(null)}
          goal={goalToAddFunds}
          savingsBalance={availableSavings}
          onAddFunds={handleConfirmAddFunds}
        />
      )}

      {goalToEdit && (
        <EditGoalModal
          onClose={handleCancelEditGoal}
          goal={goalToEdit}
          onUpdate={handleConfirmEditGoal}
        />
      )}
    </div>
  );
}