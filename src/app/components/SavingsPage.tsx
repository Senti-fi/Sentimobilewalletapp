import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Plus, 
  Lock, 
  Gift, 
  TrendingUp, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  DollarSign,
  Trophy,
  Flame,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import LucyChip from './LucyChip';
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
}

export default function SavingsPage({ onOpenLucy }: SavingsPageProps) {
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
      color: 'from-purple-400 to-indigo-500',
    },
  ]);

  // Mock data for locked savings
  const [lockedSavings, setLockedSavings] = useState<LockedSaving[]>([
    {
      id: '1',
      amount: 1000,
      asset: 'USDC',
      duration: 90,
      apy: '12.5',
      startDate: '2024-12-01',
      unlockDate: '2025-03-01',
      earnings: 31.25,
    },
    {
      id: '2',
      amount: 500,
      asset: 'USDC',
      duration: 30,
      apy: '8.0',
      startDate: '2024-11-20',
      unlockDate: '2024-12-20',
      earnings: 3.29,
    },
    {
      id: '3',
      amount: 2000,
      asset: 'USDC',
      duration: 180,
      apy: '14.0',
      startDate: '2024-10-15',
      unlockDate: '2025-04-13',
      earnings: 138.08,
    },
    {
      id: '4',
      amount: 750,
      asset: 'USDC',
      duration: 60,
      apy: '10.5',
      startDate: '2024-11-01',
      unlockDate: '2024-12-31',
      earnings: 12.95,
    },
  ]);

  // Calculate total savings
  const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalLocked = lockedSavings.reduce((sum, ls) => sum + ls.amount, 0);
  
  // Mock available balance (funds not in goals or locked)
  const availableSavings = 1250.50;
  
  const totalSavings = availableSavings + totalInGoals + totalLocked;

  // Mock rewards data
  const saveStreak = 12; // days
  const completedGoals = 3;
  const totalRewards = 145.50;

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
    setLockedSavings([...lockedSavings, newSaving]);
    setShowLockedSavings(false);
  };

  const handleDeposit = (amount: number, asset: string) => {
    // In a real app, this would move funds from wallet to savings
    console.log(`Deposited ${amount} ${asset} to Savings`);
  };

  const handleTransfer = (amount: number, asset: string, destination: string) => {
    // In a real app, this would move funds from savings to wallet or spend
    console.log(`Transferred ${amount} ${asset} from Savings to ${destination}`);
  };

  const handleUnlock = (savingId: string, isEarly: boolean) => {
    // In a real app, this would unlock the funds and apply penalties if early
    setLockedSavings(lockedSavings.filter(s => s.id !== savingId));
    console.log(`Unlocked saving ${savingId}, early: ${isEarly}`);
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
    // Add the amount to the goal's current amount
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    ));
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

  return (
    <div className="h-full overflow-y-auto pb-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 px-6 pt-6 pb-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-1">Savings</h1>
              <p className="text-sm text-white/80">Build your future, one goal at a time</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Total Savings Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 mb-4">
            <p className="text-sm text-white/70 mb-2">Total Savings</p>
            <h2 className="text-4xl mb-4">${totalSavings.toFixed(2)}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-white/70 mb-1">Available</p>
                <p className="text-lg">${availableSavings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">In Goals</p>
                <p className="text-lg">${totalInGoals.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Locked</p>
                <p className="text-lg">${totalLocked.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Deposit & Transfer Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDepositModal(true)}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-white/20 hover:bg-white transition-colors shadow-lg flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ArrowDownToLine className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-medium text-sm">Deposit</p>
                <p className="text-xs text-gray-500">Add funds</p>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTransferModal(true)}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-white/20 hover:bg-white transition-colors shadow-lg flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <ArrowUpFromLine className="w-4 h-4 text-white" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-medium text-sm">Transfer</p>
                <p className="text-xs text-gray-500">Move funds</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Savings Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Savings Goals</h3>
              <p className="text-xs text-gray-500">{goals.length} active goals</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateGoal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Goal</span>
            </motion.button>
          </div>

          {/* Lucy Recommendation */}
          <div className="mb-4">
            <LucyChip text="How much should I save monthly for my goals?" />
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
                {goals.slice(0, 1).map((goal, index) => (
                  <motion.button
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCameFromAllGoals(false);
                      setSelectedGoal(goal);
                    }}
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
                          <p className="text-gray-900 text-sm">View All Goals</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Locked Savings</h3>
              <p className="text-xs text-gray-500">Earn higher yields with time-locks</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLockedSavings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm">Lock Funds</span>
            </motion.button>
          </div>

          {/* Locked Savings List */}
          <div className="space-y-3">
            {lockedSavings.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center border border-purple-100">
                <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h4 className="text-gray-900 mb-2">No Locked Savings Yet</h4>
                <p className="text-sm text-gray-600 mb-4">Lock your funds for 30-365 days and earn up to 15% APY</p>
                <button
                  onClick={() => setShowLockedSavings(true)}
                  className="text-sm text-purple-600 hover:text-purple-700"
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
                    className="w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-gray-900">{saving.amount} {saving.asset}</h4>
                          <p className="text-xs text-gray-600">{saving.duration} days lock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">{saving.apy}% APY</p>
                        <p className="text-xs text-gray-500">+${saving.earnings.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-purple-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Unlocks on</span>
                        <span className="text-gray-900">{new Date(saving.unlockDate).toLocaleDateString()}</span>
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
                    className="w-full bg-white rounded-2xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Lock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-gray-900 text-sm">View All Locked Savings</p>
                          <p className="text-xs text-gray-600">{lockedSavings.length} active locks</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-600" />
                    </div>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Rewards Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-gray-900" />
            <h3 className="text-gray-900">Rewards</h3>
          </div>

          {/* Total Rewards Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-2xl p-5 text-white mb-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5" />
              <p className="text-sm text-white/90">Total Rewards Earned</p>
            </div>
            <h3 className="text-4xl mb-4">${totalRewards.toFixed(2)}</h3>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4" />
                  <p className="text-xs text-white/80">Save Streak</p>
                </div>
                <p className="text-xl">{saveStreak} days</p>
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <p className="text-xs text-white/80">Completed</p>
                </div>
                <p className="text-xl">{completedGoals} goals</p>
              </div>
            </div>
          </motion.div>

          {/* Reward Opportunities */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 text-sm mb-1">30-Day Streak Bonus</h4>
                  <p className="text-xs text-gray-600 mb-2">Save for 30 consecutive days</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                        style={{ width: `${(saveStreak / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{saveStreak}/30</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">+$25</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 text-sm mb-1">Save More, Earn More</h4>
                  <p className="text-xs text-gray-600">Unlock higher reward tiers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 text-sm mb-1">Referral Bonus</h4>
                  <p className="text-xs text-gray-600">Invite friends and earn $10 each</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
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