import { useEffect } from 'react';
import { useAppStore } from '../store';
import { loadUserState } from '../lib/sync';

/**
 * Fires once when the app mounts with a known user.
 * Fetches the latest financial state from Supabase and hydrates the local store.
 * Supabase is the source of truth — remote data wins over stale localStorage.
 */
export function useSupabaseSync() {
  const userId      = useAppStore(s => s.userProfile?.id);
  const hydrateState = useAppStore(s => s.hydrateState);

  useEffect(() => {
    if (!userId) return;
    loadUserState(userId).then(remote => {
      if (remote) hydrateState(remote);
    });
  }, [userId]);
}
