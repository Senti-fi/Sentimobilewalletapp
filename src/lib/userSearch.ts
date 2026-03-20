/**
 * userSearch — shared utility for searching registered Senti users.
 *
 * Wraps the Supabase query with withTimeout so a blocked or slow query
 * never leaves a calling component stuck in an infinite loading state.
 * Returns an empty array on timeout or any DB error so the UI degrades
 * gracefully (shows "No users found" instead of spinning forever).
 *
 * Used by:
 *   - SendFlow / EnterRecipientStep   (Send via Link)
 *   - WithdrawFlow / LinkRecipientStep (Send via Link bottom sheet)
 *
 * Any future feature that needs to search users should import from here
 * rather than writing a raw Supabase query, so timeout protection is
 * guaranteed by default.
 */
import { supabase } from './supabase';
import { withTimeout } from './withTimeout';
import type { Transaction } from '../store/types';

export interface UserResult {
  username: string;
  handle:   string;
}

/**
 * Search users by username (case-insensitive substring match).
 * Only call this when `term` is non-empty — use getRecentRecipients for
 * the empty/suggested state so we don't dump the entire user table.
 *
 * Always resolves — returns [] on timeout, network error, or RLS block.
 */
export async function searchUsers(
  term:      string,
  excludeId: string,
): Promise<UserResult[]> {
  if (!supabase || !term.trim()) return [];
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('users')
        .select('username, handle')
        .ilike('username', `%${term}%`)
        .neq('auth_user_id', excludeId)
        .limit(8),
      12000,
      'searchUsers',
    );
    if (error) {
      console.warn('[userSearch] query error:', error.message);
      return [];
    }
    return (data ?? []) as UserResult[];
  } catch (err) {
    console.warn('[userSearch] timed out or failed:', err);
    return [];
  }
}

/**
 * Derive suggested recipients from the user's own send history.
 * Scans transactions newest-first, picks unique @handle destinations
 * from outgoing 'transfer' entries (skips crypto addresses).
 *
 * Synchronous — no network call needed.
 */
export function getRecentRecipients(transactions: Transaction[]): UserResult[] {
  const seen    = new Set<string>();
  const results: UserResult[] = [];

  for (const tx of transactions) {
    if (tx.type !== 'transfer') continue;
    const dest = (tx.destination ?? '').trim();
    if (!dest.startsWith('@'))  continue;  // skip onchain addresses
    if (seen.has(dest))         continue;
    seen.add(dest);

    results.push({ username: dest.replace(/^@/, ''), handle: dest });
    if (results.length >= 8) break;
  }

  return results;
}
