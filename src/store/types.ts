// ── Assets ──────────────────────────────────────────────────────────

export type Asset = 'USDC' | 'USDT' | 'SOL';

/** USD value held per asset. SOL is stored as its USD equivalent. */
export type Balances = Record<Asset, number>;

// ── Transactions ────────────────────────────────────────────────────

export type TransactionType =
  | 'deposit'        // external → wallet
  | 'fiat_purchase'  // fiat currency → wallet (bank / card)
  | 'withdrawal'     // wallet → external address or bank
  | 'transfer'       // wallet → another Senti user
  | 'save'           // wallet → savings (flexible | goal | locked)
  | 'invest'         // wallet → vault
  | 'goal_create'    // meta event: goal created (no balance change)
  | 'redeem'         // savings/investment → wallet (goal withdraw, unlock, vault redeem, flexible withdraw)

export type TransactionStatus = 'pending' | 'completed' | 'failed';

/**
 * Context scopes transactions to a product area.
 * 'home'    → wallet-level activity (deposits, sends, withdrawals)
 * 'savings' → goal funding, flexible savings, locked savings
 * 'invest'  → vault investments
 */
export type TxContext = 'home' | 'savings' | 'invest';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  asset: Asset;
  amount: number;           // always in USD terms
  /** Ledger origin  — e.g. 'Wallet', 'Bank Transfer', goal name, vault name */
  source: string;
  /** Ledger target  — e.g. 'Wallet', 'Emergency Fund', '@alice', vault name */
  destination: string;
  description: string;
  timestamp: string;        // ISO 8601
  context: TxContext;       // which product area owns this transaction
  /** Supplementary data (apy, goalId, vaultName, lockPeriodDays, etc.) */
  metadata?: Record<string, unknown>;
  failureReason?: string;
}

// ── Goals ───────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'expired';

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;    // actual funds held in this goal
  asset: Asset;
  dueDate: string;          // YYYY-MM-DD
  createdAt: string;        // ISO 8601
  status: GoalStatus;
}

// ── Flexible Savings ─────────────────────────────────────────────────

export interface FlexibleSavings {
  balance: number;          // current savings balance (USD)
  asset: Asset;             // 'USDC'
  apy: number;              // e.g. 4.5 → 4.5%
  createdAt: string | null; // ISO 8601 timestamp of first deposit; null = never used
}

// ── Locked Savings ───────────────────────────────────────────────────

export type LockedSavingsStatus = 'active' | 'unlocked' | 'early_withdrawn';

export interface LockedSavingsPosition {
  id: string;
  asset: Asset;
  principal: number;        // original amount locked
  apy: number;              // annual rate, e.g. 7.6 → 7.6%
  lockPeriodDays: number;   // 30 | 60 | 90 | 180 | 365
  lockedAt: string;         // ISO 8601
  unlockAt: string;         // ISO 8601 (lockedAt + lockPeriodDays)
  status: LockedSavingsStatus;
}

// ── Investments ──────────────────────────────────────────────────────

export type InvestmentStatus = 'active' | 'withdrawn';

export interface InvestmentPosition {
  id: string;
  vaultName: string;
  asset: Asset;
  depositedAmount: number;
  currentValue: number;     // simulated appreciation
  apy: number;              // e.g. 8.5 → 8.5%
  depositedAt: string;      // ISO 8601
  status: InvestmentStatus;
}

// ── User Profile ──────────────────────────────────────────────────────

export type AuthProvider = 'apple' | 'google';

export interface UserProfile {
  /** Opaque ID generated at registration time — e.g. 'USR-A4B8C2D1'. */
  id: string;
  /** Email address retrieved from the auth provider. */
  email: string;
  /** Which OAuth provider was used to sign in. */
  authProvider: AuthProvider;
  /** Unique username chosen during onboarding. */
  username: string;
  /** ISO 8601 timestamp of account creation. */
  createdAt: string;
}

// ── App State ─────────────────────────────────────────────────────────

export interface AppState {
  /** Authenticated user profile. null = not signed in. */
  userProfile: UserProfile | null;
  /** Liquid wallet funds per asset (all stored as USD equivalent). */
  balances: Balances;
  /** Immutable ledger of all money movements. */
  transactions: Transaction[];
  /** Goal savings — each goal holds real contributed funds. */
  goals: Goal[];
  /** Flexible savings pool. */
  flexibleSavings: FlexibleSavings;
  /** Locked savings positions — each lock holds principal + tracks earnings. */
  lockedSavings: LockedSavingsPosition[];
  /** Investment vault positions. */
  investments: InvestmentPosition[];
}

// ── Engine result ─────────────────────────────────────────────────────

export type EngineErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_SAVINGS_BALANCE'
  | 'BELOW_MINIMUM'
  | 'INVALID_AMOUNT'
  | 'RECIPIENT_REQUIRED'
  | 'VAULT_MIN_NOT_MET'
  | 'GOAL_NOT_FOUND'
  | 'GOAL_NOT_ACTIVE'
  | 'GOAL_DUE_DATE_PAST'
  | 'GOAL_NAME_REQUIRED'
  | 'GOAL_TARGET_REQUIRED'
  | 'GOAL_DUE_DATE_REQUIRED'
  | 'GOAL_NO_FUNDS'
  | 'LOCK_NOT_FOUND'
  | 'LOCK_NOT_ACTIVE'
  | 'INVESTMENT_NOT_FOUND'
  | 'INVESTMENT_NOT_ACTIVE';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: EngineErrorCode };

// ── Action payloads ───────────────────────────────────────────────────

export interface SendFundsPayload {
  asset: Asset;
  amount: number;
  recipient: string;
  note?: string;
}

export interface DepositFundsPayload {
  asset: Asset;
  amount: number;
  source?: string;                      // e.g. 'Bank Transfer', 'Crypto'
  context?: TxContext;                  // defaults to 'home'
  txType?: 'deposit' | 'fiat_purchase'; // defaults to 'deposit'
}

export interface InvestFundsPayload {
  vaultName: string;
  asset: Asset;
  amount: number;
  apy: number;
  minDeposit: number;
}

export interface CreateGoalPayload {
  name: string;
  emoji: string;
  targetAmount: number;
  asset: Asset;
  dueDate: string;          // YYYY-MM-DD
}

export interface FundGoalPayload {
  goalId: string;
  amount: number;
}

/** Withdraw funds from a goal back to the wallet. */
export interface WithdrawGoalPayload {
  goalId: string;
  amount: number;
}

export interface DepositFlexiblePayload {
  asset: Asset;
  amount: number;
}

/** Withdraw from flexible savings back to the wallet. */
export interface WithdrawFlexiblePayload {
  amount: number;
}

export interface WithdrawFundsPayload {
  asset: Asset;
  amount: number;
  destination: string;
  network?: string;
  note?: string;
}

export interface LockFundsPayload {
  asset: Asset;
  amount: number;
  lockPeriodDays: number;
  apy: number;              // annual rate, e.g. 7.6 for 7.6%
}

/** Unlock a locked savings position (normal or early). */
export interface UnlockSavingsPayload {
  positionId: string;
  /** If true, applies the early-withdrawal penalty (forfeit earnings + 10% principal). */
  earlyWithdrawal?: boolean;
}

/** Redeem (withdraw) an active investment vault position back to the wallet. */
export interface RedeemInvestmentPayload {
  positionId: string;
}
