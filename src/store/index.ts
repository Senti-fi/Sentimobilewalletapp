// Store hook — the only thing most components need
export { useAppStore } from './useAppStore';

// Types — import from here, not from ./types directly
export type {
  AuthProvider,
  UserProfile,
  Asset,
  Balances,
  Transaction,
  TransactionType,
  TransactionStatus,
  TxContext,
  Goal,
  GoalStatus,
  FlexibleSavings,
  LockedSavingsPosition,
  LockedSavingsStatus,
  InvestmentPosition,
  InvestmentStatus,
  AppState,
  ActionResult,
  EngineErrorCode,
  SendFundsPayload,
  DepositFundsPayload,
  InvestFundsPayload,
  CreateGoalPayload,
  FundGoalPayload,
  WithdrawGoalPayload,
  DepositFlexiblePayload,
  WithdrawFlexiblePayload,
  WithdrawFundsPayload,
  LockFundsPayload,
  UnlockSavingsPayload,
  RedeemInvestmentPayload,
} from './types';

// Financial selectors — use these in all components to derive balances
export {
  getWalletBalance,
  getTotalGoalsSavings,
  getTotalFlexibleSavings,
  getTotalLockedSavings,
  getTotalSavings,
  getActiveInvestments,
  getTotalInvestments,
  getTotalInvested,
  getTotalEarned,
  getNetWorth,
  logNetWorthBreakdown,
} from './selectors';

// Engine compute functions — for testing or advanced use only
export {
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
