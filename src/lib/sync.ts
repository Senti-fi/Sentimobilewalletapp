/**
 * Supabase sync helpers
 *
 * Existing tables (do not modify schema):
 *   users      — existing table, 150+ rows from previous deployment
 *                clerk_user_id is the external auth identifier (TEXT UNIQUE)
 *                We store our USR-XXXXXXXX id there.
 *
 * New table (created by 001_initial_schema.sql migration):
 *   user_state — one row per user, full financial state as JSONB
 *                user_id = users.clerk_user_id (TEXT join, no FK)
 *
 * All functions are safe to call when supabase is null (no-op).
 * Errors are logged but never thrown — sync is best-effort.
 */
import { supabase } from './supabase';
import type { AppState, UserProfile } from '../store/types';

export type FinancialState = Omit<AppState, 'userProfile'>;

// ── Write ────────────────────────────────────────────────────────────

/**
 * Upsert the user profile into the existing `users` table.
 * Maps our UserProfile fields to the existing column names.
 * Conflicts on clerk_user_id (our app's auth identifier).
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('users').upsert(
    {
      clerk_user_id: profile.id,                    // USR-XXXXXXXX
      username:      profile.username,
      handle:        `@${profile.username}`,
      email:         profile.email,
    },
    { onConflict: 'clerk_user_id' },
  );
  if (error) console.error('[sync] saveUserProfile:', error.message);
}

/** Upsert the full financial state. Call after every successful store action. */
export async function saveUserState(userId: string, state: FinancialState): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('user_state').upsert({
    user_id:          userId,           // matches users.clerk_user_id
    balances:         state.balances,
    transactions:     state.transactions,
    goals:            state.goals,
    flexible_savings: state.flexibleSavings,
    locked_savings:   state.lockedSavings,
    investments:      state.investments,
  });
  if (error) console.error('[sync] saveUserState:', error.message);
}

// ── Read ─────────────────────────────────────────────────────────────

/**
 * Fetch the user's financial state from Supabase.
 * Returns null if no row exists yet (new user) or on error.
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
