import { useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useAccount, useWallet, useLogout, useModal } from '@getpara/react-sdk-lite';
import { userService, UserProfile } from '../services/supabase';
import { referralService } from '../services/referralService';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import SSOCallback from './components/SSOCallback';
import UsernameSetup from './components/UsernameSetup';
import Onboarding from './components/Onboarding';
import { clearAuthAttempt, isAuthAttemptActive } from '../lib/authAttempt';

// ─── Error Boundary ──────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  handleReload = () => {
    try {
      const keysToPreserve = ['senti_onboarding_completed', 'senti_auth_user_id'];
      const preserved: Record<string, string> = {};
      keysToPreserve.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) preserved[key] = val;
      });

      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('senti_') && !keysToPreserve.includes(key)) {
          allKeys.push(key);
        }
      }
      allKeys.forEach(key => localStorage.removeItem(key));

      Object.entries(preserved).forEach(([key, val]) => localStorage.setItem(key, val));
    } catch {
      localStorage.clear();
    }

    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 px-6 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
            <span className="text-4xl">S</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-blue-200/70 mb-8 max-w-xs">
            An unexpected error occurred. Tap below to restart the app.
          </p>
          <button
            onClick={this.handleReload}
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl font-medium shadow-lg"
          >
            Restart App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── App Types & Helpers ─────────────────────────────────────────────

type AppState = 'loading' | 'onboarding' | 'signup' | 'dashboard' | 'sso-callback' | 'username-setup';

const generateSentiUserId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SENTI-${timestamp}-${randomPart}`;
};

const formatUsername = (username: string): string => {
  return username.charAt(0).toUpperCase() + username.slice(1);
};

function restoreProfileToLocalStorage(profile: UserProfile, authUserId: string) {
  const formattedUsername = profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
  localStorage.setItem('senti_username', formattedUsername);
  localStorage.setItem('senti_user_handle', profile.handle);
  localStorage.setItem(`senti_username_${authUserId}`, formattedUsername);
  localStorage.setItem(`senti_user_handle_${authUserId}`, profile.handle);
  localStorage.setItem(`senti_username_set_${authUserId}`, 'true');

  if (profile.wallet_address) {
    localStorage.setItem('senti_wallet_address', profile.wallet_address);
    localStorage.setItem(`senti_wallet_address_${authUserId}`, profile.wallet_address);
  }
}

// ─── Main App Component ──────────────────────────────────────────────

function AppContent() {
  const { isConnected, isLoading: isAccountLoading, embedded } = useAccount();
  const wallet = useWallet();
  const { logoutAsync } = useLogout();
  const { isOpen: isAuthModalOpen } = useModal();

  const [appState, setAppState] = useState<AppState>('loading');
  const [isLoaded, setIsLoaded] = useState(false);

  const profileCheckRef = useRef<string | null>(null);
  // Track current appState via ref so the auth useEffect can read it
  // without adding appState to its dependency array (which would cause loops).
  const appStateRef = useRef<AppState>(appState);
  appStateRef.current = appState;
  const isCallbackRoute = window.location.pathname === '/sso-callback';

  // Derive Para user ID and email from embedded account
  const paraUserId = embedded?.userId || wallet?.userId || wallet?.id || null;
  const walletAddress = wallet?.address || null;
  const paraEmail = embedded?.email || null;

  // Track auth signals via refs so timers read current SDK state
  // outside the React render cycle (setTimeout closures capture stale state).
  const isConnectedRef = useRef(false);
  const embeddedConnectedRef = useRef(false);
  const paraUserIdRef = useRef<string | null>(null);
  isConnectedRef.current = isConnected;
  embeddedConnectedRef.current = embedded?.isConnected ?? false;
  paraUserIdRef.current = paraUserId;

  // ── Mark as loaded once Para SDK resolves auth state ────────────
  useEffect(() => {
    if (!isAccountLoading) {
      setIsLoaded(true);
    }
  }, [isAccountLoading]);

  // Check Supabase for existing user profile – runs once per auth user ID
  const checkUserProfile = useCallback(async (authUserId: string, email: string, imageUrl: string) => {
    if (profileCheckRef.current === authUserId) return;
    profileCheckRef.current = authUserId;

    try {
      // ── 1. Check Supabase by auth ID (primary source of truth) ──
      const existingUser = await userService.getUserByAuthId(authUserId);

      if (existingUser) {
        restoreProfileToLocalStorage(existingUser, authUserId);

        if (existingUser.email !== email || existingUser.image_url !== imageUrl) {
          userService.updateUser(authUserId, { email, image_url: imageUrl }).catch(() => {});
        }

        setAppState('dashboard');
        return;
      }

      // ── 1b. Fallback: find by email (handles auth provider migration) ──
      // When migrating from Clerk/Supabase Auth → Para, the user gets a new
      // Para userId but their email stays the same. Find them by email and
      // update their auth_user_id to the new Para ID.
      if (email) {
        const emailUser = await userService.getUserByEmail(email);
        if (emailUser) {
          const migrated = await userService.migrateAuthId(emailUser.id, authUserId);
          if (migrated) {
            restoreProfileToLocalStorage(migrated, authUserId);
            setAppState('dashboard');
            return;
          }
        }
      }

      // ── 2. Supabase has no record – try localStorage migration ──
      const hasSetUsername = localStorage.getItem(`senti_username_set_${authUserId}`) === 'true';
      const storedUsername = localStorage.getItem(`senti_username_${authUserId}`);
      const storedHandle = localStorage.getItem(`senti_user_handle_${authUserId}`);

      if (hasSetUsername && storedUsername && storedHandle) {
        const storedWalletAddress =
          localStorage.getItem(`senti_wallet_address_${authUserId}`) ||
          localStorage.getItem('senti_wallet_address') || '';

        try {
          const migrated = await userService.createUser({
            authUserId,
            username: storedUsername.toLowerCase(),
            handle: storedHandle,
            walletAddress: storedWalletAddress,
            email,
            imageUrl,
          });

          if (migrated) {
            restoreProfileToLocalStorage(migrated, authUserId);
          } else {
            localStorage.setItem('senti_username', storedUsername);
            localStorage.setItem('senti_user_handle', storedHandle);
          }
        } catch (migrationErr: any) {
          if (migrationErr?.message === 'USERNAME_TAKEN') {
            localStorage.removeItem(`senti_username_set_${authUserId}`);
            setAppState('username-setup');
            return;
          }
          localStorage.setItem('senti_username', storedUsername);
          localStorage.setItem('senti_user_handle', storedHandle);
        }

        setAppState('dashboard');
        return;
      }

      // ── 3. Check legacy localStorage keys ──
      const legacyUsername = localStorage.getItem('senti_username');
      const legacyHandle = localStorage.getItem('senti_user_handle');
      const legacySet = localStorage.getItem('senti_username_set') === 'true';

      if (legacySet && legacyUsername && legacyHandle) {
        const storedWalletAddress = localStorage.getItem('senti_wallet_address') || '';

        try {
          const migrated = await userService.createUser({
            authUserId,
            username: legacyUsername.toLowerCase(),
            handle: legacyHandle,
            walletAddress: storedWalletAddress,
            email,
            imageUrl,
          });

          if (migrated) {
            restoreProfileToLocalStorage(migrated, authUserId);
            localStorage.setItem(`senti_username_set_${authUserId}`, 'true');
          }
        } catch (legacyErr: any) {
          if (legacyErr?.message === 'USERNAME_TAKEN') {
            setAppState('username-setup');
            return;
          }
        }

        setAppState('dashboard');
        return;
      }

      // ── 4. Truly new user – needs to create identity ──
      setAppState('username-setup');
    } catch (err) {
      console.error('Error checking user profile:', err);
      const storedUsername = localStorage.getItem(`senti_username_${authUserId}`) || localStorage.getItem('senti_username');
      const storedHandle = localStorage.getItem(`senti_user_handle_${authUserId}`) || localStorage.getItem('senti_user_handle');

      if (storedUsername && storedHandle) {
        localStorage.setItem('senti_username', storedUsername);
        localStorage.setItem('senti_user_handle', storedHandle);
        setAppState('dashboard');
      } else {
        setAppState('username-setup');
      }
    }
  }, []);

  // ── Handle auth state and routing ─────────────────────────────────
  // Track whether SDK is still settling after partial auth detection.
  // When isConnected=true but embedded isn't ready yet, we stay on
  // loading instead of bouncing to the signup page (the "loop" bug).
  const authSettlingRef = useRef(false);
  const authSettlingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Handle SSO callback route — let SSOCallback component redirect
    if (isCallbackRoute) {
      setAppState('sso-callback');
      return;
    }

    // Wait for Para SDK to resolve auth state
    if (!isLoaded) {
      setAppState('loading');
      return;
    }

    // User is fully authenticated via Para.
    // On mobile OAuth handoff, SDKs can transiently report isConnected=false
    // while embedded session + userId are already ready.
    if (embedded?.isConnected && paraUserId) {
      // Clear any settling state
      authSettlingRef.current = false;
      if (authSettlingTimerRef.current) {
        clearTimeout(authSettlingTimerRef.current);
        authSettlingTimerRef.current = null;
      }

      const authUserId = paraUserId;
      const email = paraEmail || localStorage.getItem('senti_user_email') || '';
      const imageUrl = localStorage.getItem('senti_user_image') || '';

      // Persist email from Para to localStorage
      if (paraEmail) {
        localStorage.setItem('senti_user_email', paraEmail);
      }

      // Generate Senti ID for this user if they don't have one
      const userSentiIdKey = `senti_user_id_${authUserId}`;
      let existingSentiId = localStorage.getItem(userSentiIdKey);
      if (!existingSentiId || !existingSentiId.startsWith('SENTI-')) {
        existingSentiId = generateSentiUserId();
        localStorage.setItem(userSentiIdKey, existingSentiId);
      }
      localStorage.setItem('senti_user_id', existingSentiId);

      // Store auth data
      localStorage.setItem('senti_auth_user_id', authUserId);

      // Use Para's real wallet address if available
      if (walletAddress) {
        localStorage.setItem('senti_wallet_address', walletAddress);
        localStorage.setItem(`senti_wallet_address_${authUserId}`, walletAddress);
      }

      // Mark onboarding as complete for signed-in users
      localStorage.setItem('senti_onboarding_completed', 'true');
      clearAuthAttempt();

      // Check Supabase for existing user – ref guard prevents duplicate calls
      checkUserProfile(authUserId, email, imageUrl);
      return;
    }

    // ── Guard: don't redirect away from authenticated screens ──
    // Once a user reaches the dashboard (or username-setup), they should only
    // leave via explicit sign-out. Transient SDK disconnects (token refresh,
    // network hiccup, session re-sync) must NOT kick them back to signup.
    if (appStateRef.current === 'dashboard' || appStateRef.current === 'username-setup') {
      return;
    }

    // ── Auth is partially resolved (transitional state) ──
    // isConnected=true but embedded wallet/userId not ready yet.
    // This happens during wallet creation/session sync after OAuth.
    // Stay on loading to prevent bouncing to signup page.
    if (isConnected || embedded?.isConnected || !!paraUserId || isAccountLoading) {
      if (!authSettlingRef.current) {
        authSettlingRef.current = true;
        // Safety: if auth doesn't fully resolve within 15s, give up
        authSettlingTimerRef.current = setTimeout(() => {
          authSettlingRef.current = false;
          authSettlingTimerRef.current = null;
        }, 15000);
      }
      setAppState('loading');
      return;
    }

    // ── Genuinely not signed in ──
    // Only reach here when isConnected=false AND not in a settling state
    if (authSettlingRef.current) {
      // Still waiting for auth to settle — don't jump to signup yet
      setAppState('loading');
      return;
    }

    // If user just initiated OAuth, keep the app in loading until attempt expires.
    // This prevents transient Para states from bouncing users back to signup.
    if (isAuthAttemptActive()) {
      setAppState('loading');
      return;
    }

    const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';
    profileCheckRef.current = null;

    if (hasCompletedOnboarding) {
      setAppState('signup');
    } else {
      setAppState('onboarding');
    }
  }, [isLoaded, isConnected, isAccountLoading, embedded?.isConnected, paraUserId, paraEmail, walletAddress, isCallbackRoute, isAuthModalOpen, checkUserProfile]);

  // Safety net: stuck in 'loading' for more than 15s
  useEffect(() => {
    if (appState !== 'loading') return;

    const safetyTimer = setTimeout(() => {
      if (profileCheckRef.current) return;

      // If OAuth/session restoration is in progress, do not bounce to signup.
      // Any live auth signal means Para may still be finishing mobile handoff.
      if (isConnectedRef.current || embeddedConnectedRef.current || !!paraUserIdRef.current) {
        return;
      }

      // If OAuth was recently started and modal is still open, keep waiting.
      if (isAuthAttemptActive()) {
        if (isAuthModalOpen) {
          return;
        }
        clearAuthAttempt();
      }

      // Reset settling state
      authSettlingRef.current = false;

      // If the user has valid auth data in localStorage, they are a returning
      // user whose SDK session is slow to restore.  Send them to the dashboard
      // instead of kicking them back to signup.
      const storedAuthId = localStorage.getItem('senti_auth_user_id');
      const storedUsername = localStorage.getItem('senti_username');
      if (storedAuthId && storedUsername) {
        setAppState('dashboard');
        return;
      }

      const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';
      setAppState(hasCompletedOnboarding ? 'signup' : 'onboarding');
    }, 15000);

    return () => clearTimeout(safetyTimer);
  }, [appState]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('senti_onboarding_completed', 'true');
    setAppState('signup');
  };

  const handleSignUpComplete = () => {
    setAppState('dashboard');
  };

  const handleSSOComplete = () => {
    window.history.replaceState({}, '', '/');
  };

  const handleUsernameComplete = async (username: string, referralCode?: string) => {
    const authUserId = paraUserId || localStorage.getItem('senti_auth_user_id');

    if (!authUserId) {
      console.error('No user ID available for username setup');
      return;
    }

    const formattedUsername = formatUsername(username);
    const userHandle = `@${username.toLowerCase()}`;
    const userWalletAddress = walletAddress || localStorage.getItem('senti_wallet_address') || '';
    const email = localStorage.getItem('senti_user_email') || '';
    const imageUrl = localStorage.getItem('senti_user_image') || '';

    try {
      await userService.createUser({
        authUserId,
        username: username.toLowerCase(),
        handle: userHandle,
        walletAddress: userWalletAddress,
        email,
        imageUrl,
      });

      // Apply referral code if provided
      if (referralCode) {
        referralService.applyReferralCode(referralCode, authUserId).catch(() => {});
      }
    } catch (err: any) {
      if (err?.message === 'USERNAME_TAKEN') {
        console.error('Username was taken during final creation');
        return;
      }
      console.error('Failed to save user to Supabase:', err);
    }

    localStorage.setItem('senti_username', formattedUsername);
    localStorage.setItem('senti_user_handle', userHandle);
    localStorage.setItem(`senti_username_${authUserId}`, formattedUsername);
    localStorage.setItem(`senti_user_handle_${authUserId}`, userHandle);
    localStorage.setItem(`senti_username_set_${authUserId}`, 'true');
    localStorage.setItem('senti_username_set', 'true');

    setAppState('dashboard');
  };

  const userImage = localStorage.getItem('senti_user_image') || '';

  return (
    <div className="size-full bg-gray-50 overflow-hidden relative">
      {appState === 'loading' && (
        <LoadingScreen />
      )}
      {appState === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {appState === 'sso-callback' && (
        <SSOCallback onComplete={handleSSOComplete} />
      )}
      {appState === 'signup' && (
        <SignUp onComplete={handleSignUpComplete} />
      )}
      {appState === 'username-setup' && (
        <UsernameSetup onComplete={handleUsernameComplete} userImage={userImage} />
      )}
      {appState === 'dashboard' && (
        <Dashboard />
      )}
    </div>
  );
}

// ─── Export wrapped in ErrorBoundary ─────────────────────────────────

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
