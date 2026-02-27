/**
 * AuthContext — Single source of truth for authentication state.
 *
 * ARCHITECTURE
 * ============
 * The auth flow is a strict, one-directional state machine with a "phase lock"
 * that makes redirect loops structurally impossible.
 *
 * Phase transitions:
 *
 *   BOOT ──(SDK loads)──> resolve window ──(no auth)──> ONBOARDING / UNAUTHENTICATED
 *                              │
 *                        (auth detected)
 *                              │
 *                              v
 *                      CHECKING_PROFILE ──(found)──> AUTHENTICATED  [LOCKED]
 *                              │
 *                         (not found)
 *                              │
 *                              v
 *                        USERNAME_SETUP ──(done)──> AUTHENTICATED   [LOCKED]
 *
 * The PHASE LOCK ("committed" flag) is the key anti-loop mechanism:
 * - Once set, the phase can NEVER regress to 'onboarding' or 'unauthenticated'
 * - It is set the instant Para confirms authentication (isConnected + embedded + userId)
 * - Only a full page reload (triggered by explicit logout) resets it
 * - Transient SDK disconnects, token refreshes, network hiccups are all ignored
 *
 * WHY THIS PREVENTS LOOPS
 * =======================
 * The old design used useEffect dependency arrays to react to every SDK state
 * change. The Para SDK emits multiple intermediate states during initialization
 * (isConnected flipping, embedded wallet not yet ready, etc.), and each one
 * triggered a routing re-evaluation that could bounce between loading and signup.
 *
 * This design:
 * 1. Absorbs all SDK flicker in a "boot" phase with a resolution window
 * 2. Makes ONE routing decision and locks it with the committed flag
 * 3. After locking, only allows forward transitions (never back to signup)
 * 4. Uses refs for timer callbacks (avoids stale closure issues)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useAccount, useWallet } from '@getpara/react-sdk-lite';
import { userService, type UserProfile } from '../services/supabase';
import { referralService } from '../services/referralService';

// ─── Public types ─────────────────────────────────────────────────────

export type AuthPhase =
  | 'boot'             // Para SDK loading + auth resolution window
  | 'onboarding'       // First-time visitor walkthrough
  | 'unauthenticated'  // No session — show login / signup
  | 'checking_profile' // Para auth confirmed — loading Supabase profile
  | 'username_setup'   // Authenticated but needs a username
  | 'authenticated';   // Fully ready — show dashboard

export interface AuthContextValue {
  phase: AuthPhase;
  userImage: string;
  completeOnboarding: () => void;
  completeUsernameSetup: (username: string, referralCode?: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// ─── Internal helpers ─────────────────────────────────────────────────

const generateSentiUserId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SENTI-${ts}-${rand}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Restore a Supabase UserProfile into localStorage. */
function restoreProfile(profile: UserProfile, authId: string) {
  const name = capitalize(profile.username);
  localStorage.setItem('senti_username', name);
  localStorage.setItem('senti_user_handle', profile.handle);
  localStorage.setItem(`senti_username_${authId}`, name);
  localStorage.setItem(`senti_user_handle_${authId}`, profile.handle);
  localStorage.setItem(`senti_username_set_${authId}`, 'true');
  if (profile.wallet_address) {
    localStorage.setItem('senti_wallet_address', profile.wallet_address);
    localStorage.setItem(`senti_wallet_address_${authId}`, profile.wallet_address);
  }
}

/** Persist core auth data to localStorage after Para confirms auth. */
function persistAuth(userId: string, email: string | null, addr: string | null) {
  localStorage.setItem('senti_auth_user_id', userId);
  localStorage.setItem('senti_onboarding_completed', 'true');
  if (email) localStorage.setItem('senti_user_email', email);
  if (addr) {
    localStorage.setItem('senti_wallet_address', addr);
    localStorage.setItem(`senti_wallet_address_${userId}`, addr);
  }
  // Generate or restore Senti user ID
  const key = `senti_user_id_${userId}`;
  let id = localStorage.getItem(key);
  if (!id?.startsWith('SENTI-')) {
    id = generateSentiUserId();
    localStorage.setItem(key, id);
  }
  localStorage.setItem('senti_user_id', id);
}

/** Check if Para SDK reports full authentication (connected + embedded + userId). */
function isFullyAuthed(
  connected: boolean,
  embeddedConnected: boolean,
  userId: string | null,
): boolean {
  return connected && embeddedConnected && !!userId;
}

// ─── Provider ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isConnected, isLoading: sdkLoading, embedded } = useAccount();
  const wallet = useWallet();

  const [phase, setPhase] = useState<AuthPhase>('boot');

  // Derived Para values
  const paraUserId = embedded?.userId || wallet?.userId || wallet?.id || null;
  const paraEmail = embedded?.email || null;
  const walletAddr = wallet?.address || null;

  // ── Refs: latest values safe for use in timers / stale closures ──

  const connRef = useRef(false);
  const embConnRef = useRef(false);
  const uidRef = useRef<string | null>(null);
  const emailRef = useRef<string | null>(null);
  const addrRef = useRef<string | null>(null);

  connRef.current = isConnected;
  embConnRef.current = embedded?.isConnected ?? false;
  uidRef.current = paraUserId;
  emailRef.current = paraEmail;
  addrRef.current = walletAddr;

  // ── Phase lock: prevents phase regression once auth is confirmed ──

  const committedRef = useRef(false);
  const phaseRef = useRef<AuthPhase>('boot');
  phaseRef.current = phase;

  const profileDoneRef = useRef<string | null>(null);
  const bootDoneRef = useRef(false);

  /**
   * Safe phase setter. Once committed, only forward transitions are allowed.
   * This is the core anti-loop mechanism.
   */
  const go = useCallback((next: AuthPhase) => {
    if (committedRef.current) {
      // After commitment, only these forward phases are allowed
      const allowed: AuthPhase[] = ['checking_profile', 'username_setup', 'authenticated'];
      if (!allowed.includes(next)) {
        return; // Block regression to boot/onboarding/unauthenticated
      }
    }
    phaseRef.current = next;
    setPhase(next);
  }, []);

  // ── Supabase profile check ─────────────────────────────────────────
  // Looks up user in Supabase by auth ID, email, or localStorage.
  // Sets phase to 'authenticated' or 'username_setup'.

  const checkProfile = useCallback(
    async (authId: string) => {
      // Guard: only run once per auth ID
      if (profileDoneRef.current === authId) return;
      profileDoneRef.current = authId;

      const email = emailRef.current || localStorage.getItem('senti_user_email') || '';
      const imageUrl = localStorage.getItem('senti_user_image') || '';

      try {
        // 1. Primary: look up by auth ID
        const existing = await userService.getUserByAuthId(authId);
        if (existing) {
          restoreProfile(existing, authId);
          if (existing.email !== email || existing.image_url !== imageUrl) {
            userService.updateUser(authId, { email, image_url: imageUrl }).catch(() => {});
          }
          go('authenticated');
          return;
        }

        // 2. Fallback: look up by email (handles auth provider migrations)
        if (email) {
          const emailUser = await userService.getUserByEmail(email);
          if (emailUser) {
            const migrated = await userService.migrateAuthId(emailUser.id, authId);
            if (migrated) {
              restoreProfile(migrated, authId);
              go('authenticated');
              return;
            }
          }
        }

        // 2b. Fallback: look up by remembered username and re-link auth ID
        // This covers beta→production cutovers where Para IDs changed.
        const knownName =
          localStorage.getItem(`senti_username_${authId}`) ||
          localStorage.getItem('senti_username');

        if (knownName) {
          const usernameUser = await userService.getUserByUsername(knownName);
          if (usernameUser) {
            const migrated = await userService.migrateAuthId(usernameUser.id, authId);
            if (migrated) {
              restoreProfile(migrated, authId);
              if (migrated.email !== email || migrated.image_url !== imageUrl) {
                userService.updateUser(authId, { email, image_url: imageUrl }).catch(() => {});
              }
              go('authenticated');
              return;
            }
          }
        }

        // 3. localStorage migration: per-user keys
        const hasSet = localStorage.getItem(`senti_username_set_${authId}`) === 'true';
        const storedName = localStorage.getItem(`senti_username_${authId}`);
        const storedHandle = localStorage.getItem(`senti_user_handle_${authId}`);

        if (hasSet && storedName && storedHandle) {
          const addr =
            localStorage.getItem(`senti_wallet_address_${authId}`) ||
            localStorage.getItem('senti_wallet_address') || '';
          try {
            const created = await userService.createUser({
              authUserId: authId,
              username: storedName.toLowerCase(),
              handle: storedHandle,
              walletAddress: addr,
              email,
              imageUrl,
            });
            if (created) {
              restoreProfile(created, authId);
            } else {
              localStorage.setItem('senti_username', storedName);
              localStorage.setItem('senti_user_handle', storedHandle);
            }
          } catch (err: any) {
            if (err?.message === 'USERNAME_TAKEN') {
              localStorage.removeItem(`senti_username_set_${authId}`);
              go('username_setup');
              return;
            }
            localStorage.setItem('senti_username', storedName);
            localStorage.setItem('senti_user_handle', storedHandle);
          }
          go('authenticated');
          return;
        }

        // 4. localStorage migration: legacy global keys
        const legacyName = localStorage.getItem('senti_username');
        const legacyHandle = localStorage.getItem('senti_user_handle');
        const legacySet = localStorage.getItem('senti_username_set') === 'true';

        if (legacySet && legacyName && legacyHandle) {
          const addr = localStorage.getItem('senti_wallet_address') || '';
          try {
            const created = await userService.createUser({
              authUserId: authId,
              username: legacyName.toLowerCase(),
              handle: legacyHandle,
              walletAddress: addr,
              email,
              imageUrl,
            });
            if (created) {
              restoreProfile(created, authId);
              localStorage.setItem(`senti_username_set_${authId}`, 'true');
            }
          } catch (err: any) {
            if (err?.message === 'USERNAME_TAKEN') {
              go('username_setup');
              return;
            }
          }
          go('authenticated');
          return;
        }

        // 5. Truly new user — needs to create a username
        go('username_setup');
      } catch (err) {
        console.error('Profile check failed:', err);
        // Graceful fallback: if we have cached data, use it
        const un =
          localStorage.getItem(`senti_username_${authId}`) ||
          localStorage.getItem('senti_username');
        const uh =
          localStorage.getItem(`senti_user_handle_${authId}`) ||
          localStorage.getItem('senti_user_handle');
        if (un && uh) {
          localStorage.setItem('senti_username', un);
          localStorage.setItem('senti_user_handle', uh);
          go('authenticated');
        } else {
          go('username_setup');
        }
      }
    },
    [go],
  );

  /**
   * Commit to the authenticated flow. This is the point of no return —
   * after this, the phase will never regress to onboarding/unauthenticated.
   */
  const commit = useCallback(
    (uid: string, email: string | null, addr: string | null) => {
      if (committedRef.current) return; // Already committed
      committedRef.current = true;
      persistAuth(uid, email, addr);
      go('checking_profile');
      checkProfile(uid);
    },
    [go, checkProfile],
  );

  // ═══════════════════════════════════════════════════════════════════
  // EFFECT 1: Boot — runs ONCE when Para SDK finishes loading
  // ═══════════════════════════════════════════════════════════════════
  //
  // This effect absorbs all Para SDK initialization flicker by:
  // 1. Waiting for sdkLoading to become false (SDK finished init)
  // 2. Checking if the user is already fully authenticated
  // 3. If not, opening a time-limited "resolution window" to let the
  //    SDK settle before making a routing decision
  // 4. If SDK is partially connected at window end, extending the wait
  //
  // The resolution window is longer for returning users (who likely
  // have an active session being restored) and shorter for new visitors.

  useEffect(() => {
    if (bootDoneRef.current || sdkLoading) return;
    bootDoneRef.current = true;

    // Immediately fully authenticated? Skip the resolution window.
    if (isFullyAuthed(isConnected, embedded?.isConnected ?? false, paraUserId)) {
      commit(paraUserId!, paraEmail, walletAddr);
      return;
    }

    // Start resolution window
    const isReturningUser = !!localStorage.getItem('senti_auth_user_id');
    const windowMs = isReturningUser ? 5000 : 1500;
    let extendedTimer: ReturnType<typeof setTimeout> | null = null;

    const mainTimer = setTimeout(() => {
      if (committedRef.current) return; // Auth resolved during the window

      // Re-check using refs (captures latest SDK values)
      if (isFullyAuthed(connRef.current, embConnRef.current, uidRef.current)) {
        commit(uidRef.current!, emailRef.current, addrRef.current);
        return;
      }

      // SDK partially connected — session may still be restoring
      if (connRef.current) {
        // Check if we have enough localStorage data for a returning user
        const storedId = localStorage.getItem('senti_auth_user_id');
        const storedName = localStorage.getItem('senti_username');
        if (storedId && storedName) {
          committedRef.current = true;
          go('authenticated');
          return;
        }

        // No localStorage data but SDK says connected — extend the wait
        extendedTimer = setTimeout(() => {
          if (committedRef.current) return;
          if (isFullyAuthed(connRef.current, embConnRef.current, uidRef.current)) {
            commit(uidRef.current!, emailRef.current, addrRef.current);
            return;
          }
          // Give up — show login
          const onboarded = localStorage.getItem('senti_onboarding_completed') === 'true';
          go(onboarded ? 'unauthenticated' : 'onboarding');
        }, 10000);
        return;
      }

      // SDK says not connected — show login or onboarding
      const onboarded = localStorage.getItem('senti_onboarding_completed') === 'true';
      go(onboarded ? 'unauthenticated' : 'onboarding');
    }, windowMs);

    return () => {
      clearTimeout(mainTimer);
      if (extendedTimer) clearTimeout(extendedTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkLoading]);

  // ═══════════════════════════════════════════════════════════════════
  // EFFECT 2: Auth watcher — picks up auth changes AFTER boot
  // ═══════════════════════════════════════════════════════════════════
  //
  // Handles two scenarios:
  // (a) SDK fully resolves auth during the boot resolution window
  //     (the boot timer hasn't fired yet, but this effect picks it up)
  // (b) User completes OAuth login via the Para modal after seeing
  //     the signup screen
  //
  // Once committed, this effect only keeps localStorage in sync —
  // it never changes the phase.

  useEffect(() => {
    // Don't run during initial SDK load or before boot completes
    if (sdkLoading || !bootDoneRef.current) return;

    const fullyAuthed = isFullyAuthed(
      isConnected,
      embedded?.isConnected ?? false,
      paraUserId,
    );

    if (committedRef.current) {
      // Already committed — keep localStorage in sync
      if (fullyAuthed && paraUserId) {
        persistAuth(paraUserId, paraEmail, walletAddr);
      }
      return;
    }

    // Not yet committed — check if auth just fully resolved
    if (fullyAuthed && paraUserId) {
      commit(paraUserId, paraEmail, walletAddr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, embedded?.isConnected, paraUserId, sdkLoading]);

  // ─── Public actions ─────────────────────────────────────────────────

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('senti_onboarding_completed', 'true');
    setPhase('unauthenticated');
  }, []);

  const completeUsernameSetup = useCallback(
    async (username: string, referralCode?: string) => {
      const authId = uidRef.current || localStorage.getItem('senti_auth_user_id');
      if (!authId) {
        console.error('No user ID available for username setup');
        return;
      }

      const displayName = capitalize(username);
      const handle = `@${username.toLowerCase()}`;
      const addr = addrRef.current || localStorage.getItem('senti_wallet_address') || '';
      const email = localStorage.getItem('senti_user_email') || '';
      const imageUrl = localStorage.getItem('senti_user_image') || '';

      try {
        await userService.createUser({
          authUserId: authId,
          username: username.toLowerCase(),
          handle,
          walletAddress: addr,
          email,
          imageUrl,
        });

        if (referralCode) {
          referralService.applyReferralCode(referralCode, authId).catch(() => {});
        }
      } catch (err: any) {
        if (err?.message === 'USERNAME_TAKEN') {
          console.error('Username was taken during final creation');
          return;
        }
        console.error('Failed to save user to Supabase:', err);
      }

      localStorage.setItem('senti_username', displayName);
      localStorage.setItem('senti_user_handle', handle);
      localStorage.setItem(`senti_username_${authId}`, displayName);
      localStorage.setItem(`senti_user_handle_${authId}`, handle);
      localStorage.setItem(`senti_username_set_${authId}`, 'true');
      localStorage.setItem('senti_username_set', 'true');

      go('authenticated');
    },
    [go],
  );

  // ─── Render ─────────────────────────────────────────────────────────

  const userImage = localStorage.getItem('senti_user_image') || '';

  return (
    <AuthContext.Provider
      value={{ phase, userImage, completeOnboarding, completeUsernameSetup }}
    >
      {children}
    </AuthContext.Provider>
  );
}
