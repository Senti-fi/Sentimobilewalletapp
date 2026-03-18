import type {
  Balances,
  Goal,
  Transaction,
  FundGoalPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

interface FundGoalResult {
  updatedBalances: Balances;
  updatedGoal: Goal;
  transaction: Transaction;
}

export function computeFundGoal(
  balances: Balances,
  goals: Goal[],
  payload: FundGoalPayload,
): ActionResult<FundGoalResult> {
  const { goalId, amount } = payload;

  const goal = goals.find(g => g.id === goalId);

  if (!goal) {
    return { ok: false, error: 'Goal not found.', code: 'GOAL_NOT_FOUND' };
  }

  if (goal.status !== 'active') {
    return {
      ok: false,
      error: `Goal "${goal.name}" is no longer active.`,
      code: 'GOAL_NOT_ACTIVE',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(goal.dueDate) < today) {
    return {
      ok: false,
      error: `Goal "${goal.name}" has passed its due date.`,
      code: 'GOAL_DUE_DATE_PAST',
    };
  }

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (balances[goal.asset] < amount) {
    return {
      ok: false,
      error: `Insufficient ${goal.asset} balance.`,
      code: 'INSUFFICIENT_BALANCE',
    };
  }

  const newCurrentAmount = round2(goal.currentAmount + amount);
  const isComplete = newCurrentAmount >= goal.targetAmount;

  const updatedGoal: Goal = {
    ...goal,
    currentAmount: newCurrentAmount,
    status: isComplete ? 'completed' : 'active',
  };

  const updatedBalances: Balances = {
    ...balances,
    [goal.asset]: round2(balances[goal.asset] - amount),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'save',
    status:      'completed',
    asset:       goal.asset,
    amount,
    source:      'Wallet',
    destination: goal.name,
    description: `Funded goal: ${goal.name}`,
    timestamp:   nowISO(),
    context:     'savings',
    metadata:    { goalId, goalName: goal.name, newTotal: newCurrentAmount, completed: isComplete },
  };

  return { ok: true, data: { updatedBalances, updatedGoal, transaction } };
}
