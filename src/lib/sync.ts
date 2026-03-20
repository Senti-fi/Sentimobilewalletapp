/**
 * Supabase sync helpers
 *
 * Existing tables (do not modify schema beyond migration 002):
 *   users      — existing table, 150+ rows from previous deployment
 *                auth_user_id is the Supabase auth identifier (TEXT UNIQUE)
 *                (previously named clerk_user_id — renamed by 002_rename_auth_identifier.sql)
 *
 * New table (created by 001_initial_schema.sql migration):
 *   user_state — one row per user, full financial state as JSONB
 *                user_id = users.auth_user_id (TEXT join, no FK)
 *
 * All functions are safe to call when supabase is null (no-op).
 * Errors are logged but never thrown — sync is best-effort.
 */
import { supabase } from './supabase';
import { withTimeout, TimeoutError } from './withTimeout';
import type { AppState, UserProfile } from '../store/types';

export type FinancialState = Omit<AppState, 'userProfile'>;

// ── Write ────────────────────────────────────────────────────────────

/**
 * Upsert the user profile into the existing `users` table.
 * Conflicts on auth_user_id (the Supabase auth UUID) — never creates duplicates.
 * Returns { error } so callers can surface DB constraint violations (e.g. username taken).
 */
export async function saveUserProfile(
  profile: UserProfile,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: null };
  try {
    const { error } = await withTimeout(
      supabase.from('users').upsert(
        {
          auth_user_id: profile.id,
          username:     profile.username,
          handle:       `@${profile.username}`,
          email:        profile.email,
        },
        { onConflict: 'auth_user_id' },
      ),
      8000,
      'saveUserProfile',
    );
    if (error) {
      console.error('[sync] saveUserProfile:', error.message);
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    const msg = err instanceof TimeoutError ? 'timeout' : 'unexpected error';
    console.error('[sync] saveUserProfile:', msg, err);
    return { error: err instanceof TimeoutError ? 'timeout' : 'save failed' };
  }
}

/** Upsert the full financial state. Call after every successful store action. */
export async function saveUserState(userId: string, state: FinancialState): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('user_state').upsert({
    user_id:          userId,           // matches users.auth_user_id
    balances:         state.balances,
    transactions:     state.transactions,
    goals:            state.goals,
    flexible_savings: state.flexibleSavings,
    locked_savings:   state.lockedSavings,
    investments:      state.investments,
  });
  if (error) console.error('[sync] saveUserState:', error.message);
}

// ── Peer-to-peer transfers ────────────────────────────────────────────

/** Write a pending transfer record so the recipient can claim it on next load. */
export async function recordTransfer(payload: {
  senderAuthId:       string;
  senderUsername:     string;   // stored so recipient can display the sender's name
  recipientUsername:  string;   // raw username, no @
  asset:              string;
  amount:             number;
  note?:              string;
}): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await withTimeout(
      supabase.from('transfers').insert({
        sender_auth_id:     payload.senderAuthId,
        sender_username:    payload.senderUsername,
        recipient_username: payload.recipientUsername.replace(/^@/, ''),
        asset:              payload.asset,
        amount:             payload.amount,
        note:               payload.note ?? null,
      }),
      6000,
      'recordTransfer',
    );
    if (error) console.error('[sync] recordTransfer:', error.message);
  } catch (err) {
    console.error('[sync] recordTransfer failed:', err);
  }
}

export interface IncomingTransfer {
  id:             string;
  asset:          string;
  amount:         number;
  senderAuthId:   string;
  senderUsername: string;
  note?:          string;
  createdAt:      string;
}

/**
 * Fetch unapplied incoming transfers for this user and immediately mark them
 * applied so they are not double-credited on subsequent loads.
 * Returns the transfers so the caller can credit the local balance.
 */
export async function applyIncomingTransfers(username: string): Promise<IncomingTransfer[]> {
  if (!supabase || !username) return [];
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('transfers')
        .select('id, sender_auth_id, sender_username, asset, amount, note, created_at')
        .eq('recipient_username', username.replace(/^@/, ''))
        .is('applied_at', null),
      6000,
      'applyIncomingTransfers',
    );
    if (error || !data || data.length === 0) return [];

    // Mark all as applied atomically before crediting — prevents double-credit
    const ids = (data as { id: string }[]).map(t => t.id);
    await withTimeout(
      supabase.from('transfers').update({ applied_at: new Date().toISOString() }).in('id', ids),
      6000,
      'markTransfersApplied',
    );

    return (data as {
      id: string; sender_auth_id: string; sender_username: string | null;
      asset: string; amount: number; note: string | null; created_at: string;
    }[]).map(t => ({
      id:             t.id,
      asset:          t.asset,
      amount:         t.amount,
      senderAuthId:   t.sender_auth_id,
      senderUsername: t.sender_username ?? 'unknown',
      note:           t.note ?? undefined,
      createdAt:      t.created_at,
    }));
  } catch (err) {
    console.error('[sync] applyIncomingTransfers failed:', err);
    return [];
  }
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
