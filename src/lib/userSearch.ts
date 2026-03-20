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

export interface UserResult {
  username: string;
  handle:   string;
}

/**
 * Search users by username (case-insensitive substring match).
 * Pass an empty `term` to load a suggested list (matches all usernames).
 * The calling user is excluded via `excludeId`.
 *
 * Always resolves — returns [] on timeout, network error, or RLS block.
 */
export async function searchUsers(
  term:      string,
  excludeId: string,
): Promise<UserResult[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('users')
        .select('username, handle')
        .ilike('username', term ? `%${term}%` : '%')
        .neq('auth_user_id', excludeId)
        .limit(8),
      6000,
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
