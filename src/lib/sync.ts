/**
 * Supabase sync helpers
 *
 * Contracts:
 *   users      — one row per user account (profile data)
 *   user_state — one row per user (full financial state as JSONB)
 *
 * All functions are safe to call when supabase is null (no-op).
 * Errors are logged but never thrown — sync is best-effort.
 */
import { supabase } from './supabase';
import type { AppState, UserProfile } from '../store/types';

export type FinancialState = Omit<AppState, 'userProfile'>;

// ── Write ────────────────────────────────────────────────────────────

/** Upsert the user's profile row. Call once on onboarding completion. */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('users').upsert({
    id:            profile.id,
    email:         profile.email,
    auth_provider: profile.authProvider,
    username:      profile.username,
    created_at:    profile.createdAt,
  });
  if (error) console.error('[sync] saveUserProfile:', error.message);
}

/** Upsert the full financial state. Call after every successful store action. */
export async function saveUserState(userId: string, state: FinancialState): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('user_state').upsert({
    user_id:          userId,
    balances:         state.balances,
    transactions:     state.transactions,
    goals:            state.goals,
    flexible_savings: state.flexibleSavings,
    locked_savings:   state.lockedSavings,
    investments:      state.investments,
    updated_at:       new Date().toISOString(),
  });
  if (error) console.error('[sync] saveUserState:', error.message);
}

// ── Read ─────────────────────────────────────────────────────────────

/**
 * Fetch the user's financial state from Supabase.
 * Returns null if no row exists yet or on error.
 */
export async function loadUserState(userId: string): Promise<FinancialState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_state')
    .select('balances, transactions, goals, flexible_savings, locked_savings, investments')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return {
    balances:        data.balances,
    transactions:    data.transactions,
    goals:           data.goals,
    flexibleSavings: data.flexible_savings,
    lockedSavings:   data.locked_savings,
    investments:     data.investments,
  };
}
