import { useState, useEffect } from 'react';
import {
  Plus,
  Lock,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import SectionHeader from './ui/SectionHeader';
import CreateGoalModal from './CreateGoalModal';
import LockedSavingsModal from './LockedSavingsModal';
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
  walletBalance: number;
  onSavingsWithdraw?: (amount: number, destination: string) => void;
  onSavingsLock?: (amount: number, days: number, apy: string) => void;
  onSavingsUnlock?: (amount: number, penalty: number) => void;
  onGoalContribution?: (amount: number, goalName: string) => void;
  onExploreVaults?: () => void;
}

export default function SavingsPage({
  onOpenLucy,
  walletBalance,
  onSavingsWithdraw,
  onSavingsLock,
  onSavingsUnlock,
  onGoalContribution,
  onExploreVaults,
}: SavingsPageProps) {
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
  
  // Start with empty goals - users create their own
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const stored = localStorage.getItem('senti_savings_goals');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Locked savings (start empty for MVP testing)
  const [lockedSavings, setLockedSavings] = useState<LockedSaving[]>([]);

  // Calculate total savings
  const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalLocked = lockedSavings.reduce((sum, ls) => sum + ls.amount, 0);

  // Available balance (funds from unlocked savings and completed goals, ready to withdraw)
  // Persisted to localStorage to survive page refreshes
  const [availableSavings, setAvailableSavings] = useState(() => {
    try {
      const stored = localStorage.getItem('senti_availableSavings');
      return stored ? JSON.parse(stored) : 0;
    } catch {
      return 0;
    }
  });
  
  const totalSavings = availableSavings + totalInGoals + totalLocked;

  // Persist availableSavings to localStorage
  useEffect(() => {
    localStorage.setItem('senti_availableSavings', JSON.stringify(availableSavings));
  }, [availableSavings]);

  // Persist goals to localStorage
  useEffect(() => {
    localStorage.setItem('senti_savings_goals', JSON.stringify(goals));
  }, [goals]);

  // Track save streak from localStorage
  const [saveStreak, setSaveStreak] = useState(() => {
    try {
      const stored = localStorage.getItem('senti_save_streak');
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  });
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const totalRewards = 0; // Start with 0, users earn through activity

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

    // Funds come from main wallet, not from availableSavings
    // Log transaction to history
    onSavingsLock?.(savingData.amount, savingData.duration, savingData.apy);

    setLockedSavings([...lockedSavings, newSaving]);
    setShowLockedSavings(false);
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
    <div className="h-full overflow-y-auto bg-[#0a142f]">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 pt-5 pb-1">
        <h1 className="text-white text-base font-semibold">My Savings</h1>
      </div>
      <p className="text-[#8ac7ff] text-sm font-medium px-6 mb-4">Your financial safe corner</p>

      {/* ── Total Savings card ───────────────────────────────────────────── */}
      <div className="mx-6 mb-5 rounded-[20px] bg-[#007bff] overflow-hidden relative">
        {/* Wave decoration matching Figma */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] left-0 w-[88%] h-[135%] rounded-[50%] bg-white/[0.09]" />
          <div className="absolute -top-[10%] left-[87%] w-full h-[135%] rounded-[50%] bg-white/[0.09]" />
        </div>
        <div className="relative px-5 pt-5 pb-4">
          {/* Growth badge */}
          <div className="absolute top-5 right-5 bg-[rgba(0,230,255,0.4)] px-2.5 py-1 rounded-full">
            <span className="text-[#00e6ff] text-[11px] font-semibold">+4.2% this month</span>
          </div>
          <p className="text-white text-xs font-normal leading-4 mb-2">Total Savings</p>
          <p className="text-white text-[32px] font-bold leading-8 tracking-tight mb-1">
            ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-white text-[11px] font-semibold mb-4">
            Across {goals.length} {goals.length === 1 ? 'goal' : 'goals'} · {lockedSavings.length} locked
          </p>
          {/* Dots */}
          <div className="flex items-center justify-center gap-1 mb-3">
            <div className="w-3 h-1 rounded-full bg-[#2c14dd]" />
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
          {/* Save Now CTA */}
          <button
            onClick={() => setShowLockedSavings(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#b3fbff] bg-[#0a142f] text-white text-xs font-normal"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Save Now
          </button>
        </div>
      </div>

      {/* ── Lucy insight card ────────────────────────────────────────────── */}
      {goals.length > 0 && (() => {
        const urgentGoal = sortedGoals[0];
        const pct = Math.round(getProgress(urgentGoal.currentAmount, urgentGoal.targetAmount));
        const remaining = urgentGoal.targetAmount - urgentGoal.currentAmount;
        return (
          <div className="mx-6 mb-5">
            <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] p-5 flex gap-4 items-center shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
              <div className="w-8 h-8 bg-[#007bff] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-normal leading-4">
                  <span className="text-[#e2e8f0]">You're {pct}% toward your </span>
                  <span className="text-white">{urgentGoal.name.toLowerCase()} goal</span>
                  <span className="text-[#e2e8f0]">. Add ${remaining.toFixed(0)} more to hit it this month.</span>
                </p>
                <button
                  onClick={() => setGoalToAddFunds(urgentGoal)}
                  className="flex items-center gap-1 mt-1 text-[#007bff] text-sm font-medium"
                >
                  Add Funds <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── My Goals section ─────────────────────────────────────────────── */}
      <div className="px-6 mb-5">
        <SectionHeader
          title="My Goals"
          actionLabel="New Goal"
          onAction={() => setShowCreateGoal(true)}
        />
        <div className="mt-4 flex flex-col gap-3">
          {goals.length === 0 ? (
            <div className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-xl p-6 text-center">
              <p className="text-[#8ac7ff] text-sm mb-3">No goals yet. Start saving towards something!</p>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="text-[#007bff] text-sm font-semibold"
              >
                Create Your First Goal →
              </button>
            </div>
          ) : (
            <>
              {sortedGoals.map((goal) => {
                const pct = getProgress(goal.currentAmount, goal.targetAmount);
                const daysLeft = getDaysRemaining(goal.deadline);
                const statusLabel = pct >= 100 ? 'Complete!' : goal.isBehind ? 'Behind' : daysLeft <= 0 ? 'Overdue' : 'On track';
                const statusColor = pct >= 100 ? 'text-[#02d128]' : goal.isBehind ? 'text-[#ff4444]' : 'text-[#00e6ff]';
                return (
                  <button
                    key={goal.id}
                    onClick={() => { setCameFromAllGoals(false); setSelectedGoal(goal); }}
                    className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-xl p-[17px] text-left flex flex-col gap-3 w-full"
                  >
                    {/* Row 1: name + status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#f1f5f9] text-base font-semibold leading-6">{goal.name}</p>
                        <p className="text-[#94a3b8] text-xs leading-4 mt-0.5">
                          Saved: ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                        </p>
                      </div>
                      <span className={`text-xs font-bold leading-4 ${statusColor}`}>{statusLabel}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-[#334155] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007bff] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Row 3: deadline + chevron */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#94a3b8] text-xs leading-4">
                        {daysLeft > 0 ? `Due in ${daysLeft} days` : goal.deadline ? `Due ${new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', d: 'numeric' })}` : 'No deadline'}
                      </span>
                      <ChevronRight className="w-[17px] h-[17px] text-[#94a3b8]" />
                    </div>
                  </button>
                );
              })}
              {goals.length > 2 && (
                <button
                  onClick={() => { setShowAllGoals(true); setCameFromAllGoals(true); }}
                  className="text-[#007bff] text-sm font-semibold text-center py-1"
                >
                  View All Goals →
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Locked Savings section ───────────────────────────────────────── */}
      <div className="px-6 mb-8">
        <SectionHeader
          title="Locked Savings"
          actionLabel="Lock Funds"
          onAction={() => setShowLockedSavings(true)}
        />
        <div className="mt-4 flex flex-col gap-3">
          {lockedSavings.length === 0 ? (
            <div className="bg-[rgba(30,41,59,0.4)] border border-[rgba(51,65,85,0.5)] rounded-xl p-6 text-center">
              <Lock className="w-8 h-8 text-[#8ac7ff] mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[#8ac7ff] text-sm mb-2">No locked savings yet.</p>
              <p className="text-[#94a3b8] text-xs">Lock funds for 30–365 days and earn up to 15% APY</p>
            </div>
          ) : (
            <>
              {lockedSavings.slice(0, 2).map((saving) => (
                <button
                  key={saving.id}
                  onClick={() => setSelectedLockedSaving(saving)}
                  className="bg-[rgba(30,41,59,0.4)] border-l-4 border-[#007bff] border-t border-r border-b border-[rgba(51,65,85,0.5)] rounded-xl pl-5 pr-[17px] py-[17px] text-left flex flex-col gap-2 w-full"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#f1f5f9] text-base font-medium leading-6">
                        {Math.floor(saving.duration / 30)}-Month Lock
                      </p>
                      <p className="text-white text-xl font-semibold leading-7">
                        ${saving.amount.toFixed(2)}
                      </p>
                    </div>
                    <span className="bg-[rgba(0,230,255,0.1)] text-[#00e6ff] text-xs font-medium px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-[#94a3b8] text-xs leading-4">
                    Unlocks {new Date(saving.unlockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[#cbd5e1] text-xs">Earning steadily until unlock</span>
                  </div>
                </button>
              ))}
              {lockedSavings.length > 2 && (
                <button
                  onClick={() => setShowAllLockedSavings(true)}
                  className="text-[#007bff] text-sm font-semibold text-center py-1"
                >
                  View All Locked Savings →
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Floating Save button ─────────────────────────────────────────── */}
      <button
        onClick={() => setShowLockedSavings(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#007bff] rounded-full flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)] z-30"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00e6ff] border-2 border-[#007bff] rounded-full" />
      </button>

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
            onExploreVaults?.();
          }}
        />
      )}

      {showTransferModal && (
        <SavingsTransferModal
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransfer}
          savingsBalance={availableSavings}
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
          savingsBalance={walletBalance}
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