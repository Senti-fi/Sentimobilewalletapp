import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  UserProfile,
  ActionResult,
  SendFundsPayload,
  DepositFundsPayload,
  InvestFundsPayload,
  CreateGoalPayload,
  FundGoalPayload,
  DepositFlexiblePayload,
  WithdrawFundsPayload,
  LockFundsPayload,
  WithdrawGoalPayload,
  WithdrawFlexiblePayload,
  RedeemInvestmentPayload,
  UnlockSavingsPayload,
} from './types';
import {
  computeSendFunds,
  computeDepositFunds,
  computeInvestFunds,
  computeCreateGoal,
  computeFundGoal,
  computeDepositFlexible,
  computeWithdrawFunds,
  computeLockFunds,
  computeWithdrawGoal,
  computeWithdrawFlexible,
  computeRedeemInvestment,
  computeUnlockSavings,
} from './engine';
import { logNetWorthBreakdown } from './selectors';
import { saveUserProfile, saveUserState } from '../lib/sync';
import type { FinancialState } from '../lib/sync';

// ── Seed state ───────────────────────────────────────────────────────
//
// Net worth reconciliation (seed):
//   Wallet:      USDC $3,860.01 + USDT $1,760.00 + SOL $127.49 = $5,747.50
//   Goals:       Emergency Fund $3,200 + Rent $1,200             = $4,400.00
//   Flexible:    $0
//   Locked:      USDC $500 (90-day lock @ 7.6%)                  =   $500.00
//   Investments: USDT Vault $2,385.08 + USDC Vault $2,462.42     = $4,847.50
//   ────────────────────────────────────────────────────────────────────────
//   NET WORTH:                                                    $15,495.00

const INITIAL_STATE: AppState = {
  userProfile: null,
  balances: {
    USDC: 3860.01,  // 4360.01 − 500 (locked seed)
    USDT: 1760.00,
    SOL:   127.49,
  },
  transactions: [
    // ── Wallet / Home ──────────────────────────────────────────────
    {
      id:          'tx-seed-1',
      type:        'deposit',
      status:      'completed',
      asset:       'USDC',
      amount:      750.00,
      source:      'Bank Transfer',
      destination: 'Wallet',
      description: 'Deposited USDC via Bank Transfer',
      timestamp:   '2026-03-03T10:00:00.000Z',
      context:     'home',
    },
    {
      id:          'tx-seed-2',
      type:        'withdrawal',
      status:      'completed',
      asset:       'USDC',
      amount:      200.00,
      source:      'Wallet',
      destination: 'External Wallet',
      description: 'Withdrawn USDC to External Wallet',
      timestamp:   '2026-02-28T14:30:00.000Z',
      context:     'home',
    },
    {
      id:          'tx-seed-3',
      type:        'transfer',
      status:      'completed',
      asset:       'USDC',
      amount:      50.00,
      source:      'Wallet',
      destination: '@magnifico',
      description: 'Sent USDC to @magnifico',
      timestamp:   '2026-02-25T09:15:00.000Z',
      context:     'home',
      metadata:    { recipient: '@magnifico' },
    },
    {
      id:          'tx-seed-4',
      type:        'deposit',
      status:      'completed',
      asset:       'USDC',
      amount:      500.00,
      source:      'Crypto',
      destination: 'Wallet',
      description: 'Deposited USDC via Crypto',
      timestamp:   '2026-02-20T16:45:00.000Z',
      context:     'home',
    },
    // ── Savings ────────────────────────────────────────────────────
    {
      id:          'tx-seed-5',
      type:        'save',
      status:      'completed',
      asset:       'USDC',
      amount:      1200.00,
      source:      'Wallet',
      destination: 'Rent',
      description: 'Funded goal: Rent',
      timestamp:   '2026-03-01T09:00:00.000Z',
      context:     'savings',
      metadata:    { goalId: 'goal-seed-2', goalName: 'Rent', newTotal: 1200, completed: false },
    },
    {
      id:          'tx-seed-6',
      type:        'save',
      status:      'completed',
      asset:       'USDC',
      amount:      1700.00,
      source:      'Wallet',
      destination: 'Emergency Fund',
      description: 'Funded goal: Emergency Fund',
      timestamp:   '2026-02-10T11:00:00.000Z',
      context:     'savings',
      metadata:    { goalId: 'goal-seed-1', goalName: 'Emergency Fund', newTotal: 3200, completed: false },
    },
    {
      id:          'tx-seed-7',
      type:        'goal_create',
      status:      'completed',
      asset:       'USDC',
      amount:      0,
      source:      'System',
      destination: 'Rent',
      description: 'Goal created: Rent',
      timestamp:   '2026-02-01T00:00:00.000Z',
      context:     'savings',
      metadata:    { goalId: 'goal-seed-2', targetAmount: 2000, dueDate: '2026-04-01' },
    },
    {
      id:          'tx-seed-8',
      type:        'goal_create',
      status:      'completed',
      asset:       'USDC',
      amount:      0,
      source:      'System',
      destination: 'Emergency Fund',
      description: 'Goal created: Emergency Fund',
      timestamp:   '2026-01-15T00:00:00.000Z',
      context:     'savings',
      metadata:    { goalId: 'goal-seed-1', targetAmount: 5000, dueDate: '2026-12-31' },
    },
    {
      id:          'tx-seed-11',
      type:        'save',
      status:      'completed',
      asset:       'USDC',
      amount:      500.00,
      source:      'Wallet',
      destination: 'Locked Savings',
      description: 'Locked USDC for 90 days',
      timestamp:   '2026-01-15T00:00:00.000Z',
      context:     'savings',
      metadata:    { lockPeriodDays: 90, apy: 7.6, unlockAt: '2026-04-15T00:00:00.000Z', positionId: 'lock-seed-1' },
    },
    // ── Invest ─────────────────────────────────────────────────────
    {
      id:          'tx-seed-9',
      type:        'invest',
      status:      'completed',
      asset:       'USDC',
      amount:      2422.42,
      source:      'Wallet',
      destination: 'USDC Vault',
      description: 'Invested in USDC Vault',
      timestamp:   '2026-01-20T00:00:00.000Z',
      context:     'invest',
      metadata:    { vaultName: 'USDC Vault', apy: 8.5 },
    },
    {
      id:          'tx-seed-10',
      type:        'invest',
      status:      'completed',
      asset:       'USDT',
      amount:      2342.91,
      source:      'Wallet',
      destination: 'USDT Vault',
      description: 'Invested in USDT Vault',
      timestamp:   '2026-01-10T00:00:00.000Z',
      context:     'invest',
      metadata:    { vaultName: 'USDT Vault', apy: 9.2 },
    },
  ],
  flexibleSavings: {
    balance: 0,
    asset: 'USDC',
    apy: 4.5,
    createdAt: null,
  },
  goals: [
    {
      id: 'goal-seed-1',
      name: 'Emergency Fund',
      emoji: '🛡️',
      targetAmount: 5000,
      currentAmount: 3200,
      asset: 'USDC',
      dueDate: '2026-12-31',
      createdAt: '2026-01-15T00:00:00.000Z',
      status: 'active',
    },
    {
      id: 'goal-seed-2',
      name: 'Rent',
      emoji: '🏠',
      targetAmount: 2000,
      currentAmount: 1200,
      asset: 'USDC',
      dueDate: '2026-04-01',
      createdAt: '2026-02-01T00:00:00.000Z',
      status: 'active',
    },
  ],
  lockedSavings: [
    {
      id: 'lock-seed-1',
      asset: 'USDC',
      principal: 500.00,
      apy: 7.6,
      lockPeriodDays: 90,
      lockedAt: '2026-01-15T00:00:00.000Z',
      unlockAt: '2026-04-15T00:00:00.000Z',
      status: 'active',
    },
  ],
  investments: [
    {
      id: 'inv-seed-1',
      vaultName: 'USDT Vault',
      asset: 'USDT',
      depositedAmount: 2342.91,
      currentValue: 2385.08,
      apy: 9.2,
      depositedAt: '2026-01-10T00:00:00.000Z',
      status: 'active',
    },
    {
      id: 'inv-seed-2',
      vaultName: 'USDC Vault',
      asset: 'USDC',
      depositedAmount: 2422.42,
      currentValue: 2462.42,
      apy: 8.5,
      depositedAt: '2026-01-20T00:00:00.000Z',
      status: 'active',
    },
  ],
};

// ── Store interface ──────────────────────────────────────────────────

interface AppStore extends AppState {
  // Wallet actions
  sendFunds:          (payload: SendFundsPayload)          => ActionResult<unknown>;
  depositFunds:       (payload: DepositFundsPayload)       => ActionResult<unknown>;
  withdrawFunds:      (payload: WithdrawFundsPayload)      => ActionResult<unknown>;

  // Investment actions
  investFunds:        (payload: InvestFundsPayload)        => ActionResult<unknown>;
  redeemInvestment:   (payload: RedeemInvestmentPayload)   => ActionResult<unknown>;

  // Goal actions
  createGoal:         (payload: CreateGoalPayload)         => ActionResult<unknown>;
  fundGoal:           (payload: FundGoalPayload)           => ActionResult<unknown>;
  withdrawGoal:       (payload: WithdrawGoalPayload)       => ActionResult<unknown>;

  // Savings actions
  depositFlexible:    (payload: DepositFlexiblePayload)    => ActionResult<unknown>;
  withdrawFlexible:   (payload: WithdrawFlexiblePayload)   => ActionResult<unknown>;
  lockFunds:          (payload: LockFundsPayload)          => ActionResult<unknown>;
  unlockSavings:      (payload: UnlockSavingsPayload)      => ActionResult<unknown>;

  // Auth actions
  setUserProfile:     (profile: UserProfile)               => void;
  clearUserProfile:   ()                                   => void;

  // Supabase hydration — called on startup to load remote state
  hydrateState:       (state: FinancialState)              => void;

  // Utility
  resetToSeed: () => void;
}

// ── Store ────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      /** Fire-and-forget Supabase sync after any successful state mutation. */
      function sync() {
        const s = get();
        if (!s.userProfile?.id) return;
        void saveUserState(s.userProfile.id, s);
      }

      return {
      ...INITIAL_STATE,

      sendFunds(payload) {
        const result = computeSendFunds(get().balances, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:     result.data.updatedBalances,
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      depositFunds(payload) {
        const result = computeDepositFunds(get().balances, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:     result.data.updatedBalances,
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      withdrawFunds(payload) {
        const result = computeWithdrawFunds(get().balances, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:     result.data.updatedBalances,
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      investFunds(payload) {
        const result = computeInvestFunds(get().balances, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:     result.data.updatedBalances,
          investments:  [...state.investments, result.data.newPosition],
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      redeemInvestment(payload) {
        const result = computeRedeemInvestment(get().balances, get().investments, payload);
        if (!result.ok) return result;
        set(state => ({
          balances: result.data.updatedBalances,
          investments: state.investments.map(p =>
            p.id === payload.positionId ? result.data.updatedPosition : p,
          ),
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      createGoal(payload) {
        const result = computeCreateGoal(payload);
        if (!result.ok) return result;
        set(state => ({
          goals:        [...state.goals, result.data.newGoal],
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      fundGoal(payload) {
        const result = computeFundGoal(get().balances, get().goals, payload);
        if (!result.ok) return result;
        set(state => ({
          balances: result.data.updatedBalances,
          goals: state.goals.map(g =>
            g.id === payload.goalId ? result.data.updatedGoal : g,
          ),
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      withdrawGoal(payload) {
        const result = computeWithdrawGoal(get().balances, get().goals, payload);
        if (!result.ok) return result;
        set(state => ({
          balances: result.data.updatedBalances,
          goals: state.goals.map(g =>
            g.id === payload.goalId ? result.data.updatedGoal : g,
          ),
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      depositFlexible(payload) {
        const result = computeDepositFlexible(get().balances, get().flexibleSavings, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:        result.data.updatedBalances,
          flexibleSavings: result.data.updatedFlexible,
          transactions:    [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      withdrawFlexible(payload) {
        const result = computeWithdrawFlexible(get().balances, get().flexibleSavings, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:        result.data.updatedBalances,
          flexibleSavings: result.data.updatedFlexible,
          transactions:    [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      lockFunds(payload) {
        const result = computeLockFunds(get().balances, payload);
        if (!result.ok) return result;
        set(state => ({
          balances:      result.data.updatedBalances,
          lockedSavings: [...state.lockedSavings, result.data.newPosition],
          transactions:  [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      unlockSavings(payload) {
        const result = computeUnlockSavings(get().balances, get().lockedSavings, payload);
        if (!result.ok) return result;
        set(state => ({
          balances: result.data.updatedBalances,
          lockedSavings: state.lockedSavings.map(p =>
            p.id === payload.positionId ? result.data.updatedPosition : p,
          ),
          transactions: [result.data.transaction, ...state.transactions],
        }));
        logNetWorthBreakdown(get()); sync();
        return result;
      },

      setUserProfile(profile: UserProfile) {
        set({ userProfile: profile });
        void saveUserProfile(profile);
      },

      clearUserProfile() {
        set({ userProfile: null });
      },

      hydrateState(state: FinancialState) {
        set(state);
      },

      resetToSeed() {
        set(INITIAL_STATE);
      },
    };
  },
    {
      name:    'senti-app-state',
      version: 2,               // bump to discard pre-v2 persisted state
    },
  ),
);
