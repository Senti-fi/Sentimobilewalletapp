import type {
  Balances,
  Goal,
  Transaction,
  WithdrawGoalPayload,
  ActionResult,
} from '../types';
import { generateId, nowISO, round2 } from './utils';

interface WithdrawGoalResult {
  updatedBalances: Balances;
  updatedGoal: Goal;
  transaction: Transaction;
}

export function computeWithdrawGoal(
  balances: Balances,
  goals: Goal[],
  payload: WithdrawGoalPayload,
): ActionResult<WithdrawGoalResult> {
  const { goalId, amount } = payload;

  const goal = goals.find(g => g.id === goalId);

  if (!goal) {
    return { ok: false, error: 'Goal not found.', code: 'GOAL_NOT_FOUND' };
  }

  if (!amount || amount <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.', code: 'INVALID_AMOUNT' };
  }

  if (goal.currentAmount <= 0) {
    return {
      ok: false,
      error: `Goal "${goal.name}" has no funds to withdraw.`,
      code: 'GOAL_NO_FUNDS',
    };
  }

  if (amount > goal.currentAmount) {
    return {
      ok: false,
      error: `Cannot withdraw more than the goal balance ($${goal.currentAmount.toFixed(2)}).`,
      code: 'INSUFFICIENT_SAVINGS_BALANCE',
    };
  }

  const newCurrentAmount = round2(goal.currentAmount - amount);

  const updatedGoal: Goal = {
    ...goal,
    currentAmount: newCurrentAmount,
    // revert to active if funds are being pulled from a completed goal
    status: newCurrentAmount < goal.targetAmount && goal.status === 'completed'
      ? 'active'
      : goal.status,
  };

  const updatedBalances: Balances = {
    ...balances,
    [goal.asset]: round2(balances[goal.asset] + amount),
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'redeem',
    status:      'completed',
    asset:       goal.asset,
    amount,
    source:      goal.name,
    destination: 'Wallet',
    description: `Withdrawn from goal: ${goal.name}`,
    timestamp:   nowISO(),
    context:     'savings',
    metadata:    { goalId, goalName: goal.name, remaining: newCurrentAmount },
  };

  return { ok: true, data: { updatedBalances, updatedGoal, transaction } };
}
