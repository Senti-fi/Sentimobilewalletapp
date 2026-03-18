import type { Goal, Transaction, CreateGoalPayload, ActionResult } from '../types';
import { generateId, nowISO } from './utils';

interface CreateGoalResult {
  newGoal: Goal;
  transaction: Transaction;
}

export function computeCreateGoal(
  payload: CreateGoalPayload,
): ActionResult<CreateGoalResult> {
  const { name, emoji, targetAmount, asset, dueDate } = payload;

  if (!name.trim()) {
    return { ok: false, error: 'Goal name is required.', code: 'GOAL_NAME_REQUIRED' };
  }

  if (!targetAmount || targetAmount <= 0) {
    return {
      ok: false,
      error: 'Target amount must be greater than 0.',
      code: 'GOAL_TARGET_REQUIRED',
    };
  }

  if (!dueDate) {
    return { ok: false, error: 'Due date is required.', code: 'GOAL_DUE_DATE_REQUIRED' };
  }

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due <= today) {
    return {
      ok: false,
      error: 'Due date must be in the future.',
      code: 'GOAL_DUE_DATE_PAST',
    };
  }

  const newGoal: Goal = {
    id: generateId(),
    name: name.trim(),
    emoji,
    targetAmount,
    currentAmount: 0,
    asset,
    dueDate,
    createdAt: nowISO(),
    status: 'active',
  };

  const transaction: Transaction = {
    id:          generateId(),
    type:        'goal_create',
    status:      'completed',
    asset,
    amount:      0,
    source:      'System',
    destination: name.trim(),
    description: `Goal created: ${name.trim()}`,
    timestamp:   nowISO(),
    context:     'savings',
    metadata:    { goalId: newGoal.id, targetAmount, dueDate },
  };

  return { ok: true, data: { newGoal, transaction } };
}
