import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { loadUserState, applyIncomingTransfers, saveUserState } from '../lib/sync';
import type { Asset } from '../store/types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Credit any unapplied incoming transfers onto the current in-memory store
 * state and persist the result. Safe to call at any time — no-ops if there
 * are no pending transfers.
 */
async function checkAndApplyTransfers(
  userId:      string,
  username:    string,
  hydrateState: (s: ReturnType<typeof useAppStore.getState>) => void,
) {
  const incoming = await applyIncomingTransfers(username);
  if (!incoming.length) return;

  // Operate on current live store state (not a stale closure snapshot)
  const { userProfile: _ignored, ...currentFinancial } = useAppStore.getState();
  const updatedBalances = { ...currentFinancial.balances } as Record<Asset, number>;
  const newTransactions = [...currentFinancial.transactions];

  for (const transfer of incoming) {
    const asset = transfer.asset as Asset;
    updatedBalances[asset] = round2((updatedBalances[asset] ?? 0) + transfer.amount);
    newTransactions.unshift({
      id:          transfer.id,
      type:        'deposit'   as const,
      status:      'completed' as const,
      asset,
      amount:      transfer.amount,
      source:      'Senti Link',
      destination: 'Wallet',
      description: `Received ${transfer.asset} via Senti Link`,
      timestamp:   transfer.createdAt,
      context:     'home' as const,
      ...(transfer.note ? { metadata: { note: transfer.note } } : {}),
    });
  }

  const merged = { ...currentFinancial, balances: updatedBalances, transactions: newTransactions };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hydrateState(merged as any);
  void saveUserState(userId, merged);
}

/**
 * Fires once when the app mounts with a known user:
 *   1. Fetches the latest financial state from Supabase (remote wins).
 *   2. Applies any unapplied incoming peer transfers on top.
 *
 * Also re-checks for incoming transfers whenever the user returns to the tab
 * (visibilitychange), so the recipient sees their balance update without a
 * full page reload.
 */
export function useSupabaseSync() {
  const userId       = useAppStore(s => s.userProfile?.id);
  const username     = useAppStore(s => s.userProfile?.username);
  const hydrateState = useAppStore(s => s.hydrateState);

  // Stable reference — used in both effects below
  const apply = useCallback(() => {
    if (userId && username) void checkAndApplyTransfers(userId, username, hydrateState as never);
  }, [userId, username, hydrateState]);

  // ── Initial load: fetch full state then credit pending transfers ──────
  useEffect(() => {
    if (!userId || !username) return;

    async function load() {
      const remote = await loadUserState(userId!);
      if (!remote) {
        // No remote state yet — still check for incoming transfers
        void apply();
        return;
      }

      // Fetch pending transfers while we have the loaded state available
      const incoming = await applyIncomingTransfers(username!);

      if (incoming.length === 0) {
        hydrateState(remote);
        return;
      }

      const updatedBalances = { ...remote.balances } as Record<Asset, number>;
      const newTransactions = [...remote.transactions];

      for (const transfer of incoming) {
        const asset = transfer.asset as Asset;
        updatedBalances[asset] = round2((updatedBalances[asset] ?? 0) + transfer.amount);
        newTransactions.unshift({
          id:          transfer.id,
          type:        'received'  as const,
          status:      'completed' as const,
          asset,
          amount:      transfer.amount,
          source:      `@${transfer.senderUsername}`,
          destination: 'Wallet',
          description: `Received ${transfer.asset} from @${transfer.senderUsername}`,
          timestamp:   transfer.createdAt,
          context:     'home' as const,
          ...(transfer.note ? { metadata: { note: transfer.note } } : {}),
        });
      }

      const merged = { ...remote, balances: updatedBalances, transactions: newTransactions };
      hydrateState(merged);
      void saveUserState(userId!, merged);
    }

    void load();
  }, [userId, username]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-check on tab focus — no reload required ───────────────────────
  // Delay 1 500 ms after becoming visible: Android suspends background tabs
  // and drops network connections; firing Supabase queries immediately on
  // resume burns the timeout budget before the connection is ready.
  useEffect(() => {
    if (!userId || !username) return;

    let resumeTimer: ReturnType<typeof setTimeout>;

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(apply, 1500);
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearTimeout(resumeTimer);
    };
  }, [userId, username, apply]);
}
