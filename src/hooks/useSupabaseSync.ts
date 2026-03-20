import { useEffect } from 'react';
import { useAppStore } from '../store';
import { loadUserState, applyIncomingTransfers, saveUserState } from '../lib/sync';
import type { Asset } from '../store/types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Fires once when the app mounts with a known user.
 * 1. Fetches the latest financial state from Supabase and hydrates the local store.
 * 2. Checks for unapplied incoming peer transfers and credits them before hydrating.
 * Supabase is the source of truth — remote data wins over stale localStorage.
 */
export function useSupabaseSync() {
  const userId       = useAppStore(s => s.userProfile?.id);
  const username     = useAppStore(s => s.userProfile?.username);
  const hydrateState = useAppStore(s => s.hydrateState);

  useEffect(() => {
    if (!userId || !username) return;

    async function load() {
      const remote = await loadUserState(userId!);
      if (!remote) return;

      // Check for money sent to this user by other users
      const incoming = await applyIncomingTransfers(username!);

      if (incoming.length === 0) {
        hydrateState(remote);
        return;
      }

      // Credit each incoming transfer onto the loaded balances
      const updatedBalances: Record<Asset, number> = { ...remote.balances };
      const newTransactions = [...remote.transactions];

      for (const transfer of incoming) {
        const asset = transfer.asset as Asset;
        updatedBalances[asset] = round2(
          (updatedBalances[asset] ?? 0) + transfer.amount,
        );
        newTransactions.unshift({
          id:          transfer.id,
          type:        'deposit'   as const,
          status:      'completed' as const,
          asset:       asset,
          amount:      transfer.amount,
          source:      'Senti Link',
          destination: 'Wallet',
          description: `Received ${transfer.asset} via Senti Link`,
          timestamp:   transfer.createdAt,
          context:     'home' as const,
          ...(transfer.note ? { metadata: { note: transfer.note } } : {}),
        });
      }

      const merged = { ...remote, balances: updatedBalances, transactions: newTransactions };
      hydrateState(merged);
      // Persist the credited state so it survives a reload
      void saveUserState(userId!, merged);
    }

    void load();
  }, [userId, username]); // eslint-disable-line react-hooks/exhaustive-deps
}
