import { useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import SSOCallback from './components/SSOCallback';
import UsernameSetup from './components/UsernameSetup';
import Onboarding from './components/Onboarding';
import { userService, UserProfile } from '../services/supabase';

// ─── Error Boundary ──────────────────────────────────────────────────
// Catches any render crash in child components and shows a recovery UI
// instead of a blank white screen.

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
    // Clear potentially corrupted localStorage data that may have caused the crash
    try {
      const keysToPreserve = ['senti_onboarding_completed', 'senti_clerk_user_id'];
      const preserved: Record<string, string> = {};
      keysToPreserve.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) preserved[key] = val;
      });

      // Remove all senti_ keys except the preserved ones
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('senti_') && !keysToPreserve.includes(key)) {
          allKeys.push(key);
        }
      }
      allKeys.forEach(key => localStorage.removeItem(key));

      // Restore preserved keys
      Object.entries(preserved).forEach(([key, val]) => localStorage.setItem(key, val));
    } catch {
      // If even localStorage is broken, just clear everything
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

function restoreProfileToLocalStorage(profile: UserProfile, clerkUserId: string) {
  const formattedUsername = profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
  localStorage.setItem('senti_username', formattedUsername);
  localStorage.setItem('senti_user_handle', profile.handle);
  localStorage.setItem(`senti_username_${clerkUserId}`, formattedUsername);
  localStorage.setItem(`senti_user_handle_${clerkUserId}`, profile.handle);
  localStorage.setItem(`senti_username_set_${clerkUserId}`, 'true');

  if (profile.wallet_address) {
    localStorage.setItem('senti_wallet_address', profile.wallet_address);
    localStorage.setItem(`senti_wallet_address_${clerkUserId}`, profile.wallet_address);
  }
}

// ─── Main App Component ──────────────────────────────────────────────

function AppContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [appState, setAppState] = useState<AppState>('loading');

  // Ref guard: prevents checkUserProfile from running more than once per clerkUserId
  const profileCheckRef = useRef<string | null>(null);
  // Ref to clean up the "not signed in" timeout so it can't race with auth
  const notSignedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCallbackRoute = window.location.pathname === '/sso-callback';
  const isDashboardRoute = window.location.pathname === '/dashboard';

  // Check Supabase for existing user profile – runs exactly once per clerkUserId
  const checkUserProfile = useCallback(async (clerkUserId: string, email: string, imageUrl: string) => {
    if (profileCheckRef.current === clerkUserId) return;
    profileCheckRef.current = clerkUserId;

    try {
      // ── 1. Check Supabase (primary source of truth) ──
      const existingUser = await userService.getUserByClerkId(clerkUserId);

      if (existingUser) {
        restoreProfileToLocalStorage(existingUser, clerkUserId);

        if (existingUser.email !== email || existingUser.image_url !== imageUrl) {
          userService.updateUser(clerkUserId, { email, image_url: imageUrl }).catch(() => {});
        }

        setAppState('dashboard');
        return;
      }

      // ── 2. Supabase has no record – try to migrate from localStorage ──
      const hasSetUsername = localStorage.getItem(`senti_username_set_${clerkUserId}`) === 'true';
      const storedUsername = localStorage.getItem(`senti_username_${clerkUserId}`);
      const storedHandle = localStorage.getItem(`senti_user_handle_${clerkUserId}`);

      if (hasSetUsername && storedUsername && storedHandle) {
        const walletAddress =
          localStorage.getItem(`senti_wallet_address_${clerkUserId}`) ||
          localStorage.getItem('senti_wallet_address') || '';

        try {
          const migrated = await userService.createUser({
            clerkUserId,
            username: storedUsername.toLowerCase(),
            handle: storedHandle,
            walletAddress,
            email,
            imageUrl,
          });

          if (migrated) {
            restoreProfileToLocalStorage(migrated, clerkUserId);
          } else {
            localStorage.setItem('senti_username', storedUsername);
            localStorage.setItem('senti_user_handle', storedHandle);
          }
        } catch (migrationErr: any) {
          if (migrationErr?.message === 'USERNAME_TAKEN') {
            localStorage.removeItem(`senti_username_set_${clerkUserId}`);
            setAppState('username-setup');
            return;
          }
          localStorage.setItem('senti_username', storedUsername);
          localStorage.setItem('senti_user_handle', storedHandle);
        }

        setAppState('dashboard');
        return;
      }

      // ── 3. Also check non-user-specific localStorage keys (legacy migration) ──
      const legacyUsername = localStorage.getItem('senti_username');
      const legacyHandle = localStorage.getItem('senti_user_handle');
      const legacySet = localStorage.getItem('senti_username_set') === 'true';

      if (legacySet && legacyUsername && legacyHandle) {
        const walletAddress = localStorage.getItem('senti_wallet_address') || '';

        try {
          const migrated = await userService.createUser({
            clerkUserId,
            username: legacyUsername.toLowerCase(),
            handle: legacyHandle,
            walletAddress,
            email,
            imageUrl,
          });

          if (migrated) {
            restoreProfileToLocalStorage(migrated, clerkUserId);
            localStorage.setItem(`senti_username_set_${clerkUserId}`, 'true');
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
      const storedUsername = localStorage.getItem(`senti_username_${clerkUserId}`) || localStorage.getItem('senti_username');
      const storedHandle = localStorage.getItem(`senti_user_handle_${clerkUserId}`) || localStorage.getItem('senti_user_handle');

      if (storedUsername && storedHandle) {
        localStorage.setItem('senti_username', storedUsername);
        localStorage.setItem('senti_user_handle', storedHandle);
        setAppState('dashboard');
      } else {
        setAppState('username-setup');
      }
    }
  }, []);

  // Handle authentication state and routing
  useEffect(() => {
    // ── Always cancel the "not signed in" timeout when this effect re-runs ──
    // This prevents the old timeout from stomping the state after Clerk
    // transitions from isSignedIn=false to isSignedIn=true.
    if (notSignedInTimerRef.current) {
      clearTimeout(notSignedInTimerRef.current);
      notSignedInTimerRef.current = null;
    }

    // Handle SSO callback route
    if (isCallbackRoute) {
      setAppState('sso-callback');
      return;
    }

    // Wait for Clerk to load
    if (!isLoaded) {
      setAppState('loading');
      return;
    }

    // User is signed in with Clerk
    if (isSignedIn && user && user.id) {
      const clerkUserId = user.id;

      // Generate Senti ID for this specific user if they don't have one
      const userSentiIdKey = `senti_user_id_${clerkUserId}`;
      let existingSentiId = localStorage.getItem(userSentiIdKey);
      if (!existingSentiId || !existingSentiId.startsWith('SENTI-')) {
        existingSentiId = generateSentiUserId();
        localStorage.setItem(userSentiIdKey, existingSentiId);
      }
      localStorage.setItem('senti_user_id', existingSentiId);

      // Store Clerk data
      const email = user.primaryEmailAddress?.emailAddress || '';
      localStorage.setItem('senti_clerk_user_id', clerkUserId);
      localStorage.setItem('senti_user_email', email);
      localStorage.setItem('senti_user_image', user.imageUrl || '');

      // Generate wallet address for this user if not exists
      const userWalletKey = `senti_wallet_address_${clerkUserId}`;
      let walletAddress = localStorage.getItem(userWalletKey);
      if (!walletAddress) {
        const hexChars = '0123456789abcdef';
        walletAddress = '0x';
        for (let i = 0; i < 40; i++) {
          walletAddress += hexChars[Math.floor(Math.random() * 16)];
        }
        localStorage.setItem(userWalletKey, walletAddress);
      }
      localStorage.setItem('senti_wallet_address', walletAddress);

      // Mark onboarding as complete for signed-in users
      localStorage.setItem('senti_onboarding_completed', 'true');

      // Clean up URL if coming from OAuth redirect
      if (isDashboardRoute) {
        window.history.replaceState({}, '', '/');
      }

      // Check Supabase for existing user – ref guard prevents duplicate calls
      checkUserProfile(clerkUserId, email, user.imageUrl || '');
      return;
    }

    // User is not signed in
    const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';

    // Reset the profile check ref so it runs again on next sign-in
    profileCheckRef.current = null;

    // After an OAuth redirect Clerk needs time to re-establish the session
    // from cookies. If we jump to the signup page too quickly the user sees
    // a flash of the signup screen before Clerk finishes. Use a longer delay
    // when we detect an in-progress OAuth flow.
    const oauthPending = sessionStorage.getItem('senti_oauth_pending') === 'true';
    const delay = oauthPending || isDashboardRoute ? 6000 : 1500;

    // Use a ref-tracked timeout so it can be cancelled if Clerk auth resolves
    notSignedInTimerRef.current = setTimeout(() => {
      notSignedInTimerRef.current = null;
      // OAuth flow finished (or timed out) — clean up the flag
      sessionStorage.removeItem('senti_oauth_pending');
      if (hasCompletedOnboarding) {
        setAppState('signup');
      } else {
        setAppState('onboarding');
      }
    }, delay);

    // Cleanup: cancel the timeout if the effect re-runs before it fires
    return () => {
      if (notSignedInTimerRef.current) {
        clearTimeout(notSignedInTimerRef.current);
        notSignedInTimerRef.current = null;
      }
    };
  }, [isLoaded, isSignedIn, user, isCallbackRoute, isDashboardRoute, checkUserProfile]);

  // Safety net: if we're stuck in 'loading' for more than 10 seconds, force a transition
  useEffect(() => {
    if (appState !== 'loading') return;

    const safetyTimer = setTimeout(() => {
      // Still loading after 10s – Clerk may have failed silently
      if (profileCheckRef.current) return; // checkUserProfile is running, give it more time
      const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';
      setAppState(hasCompletedOnboarding ? 'signup' : 'onboarding');
    }, 10000);

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

  const handleUsernameComplete = async (username: string) => {
    const clerkUserId = user?.id || localStorage.getItem('senti_clerk_user_id');

    if (!clerkUserId) {
      console.error('No user ID available for username setup');
      return;
    }

    const formattedUsername = formatUsername(username);
    const userHandle = `@${username.toLowerCase()}.senti`;
    const walletAddress = localStorage.getItem('senti_wallet_address') || '';
    const email = localStorage.getItem('senti_user_email') || '';
    const imageUrl = localStorage.getItem('senti_user_image') || '';

    try {
      await userService.createUser({
        clerkUserId,
        username: username.toLowerCase(),
        handle: userHandle,
        walletAddress,
        email,
        imageUrl,
      });
    } catch (err: any) {
      if (err?.message === 'USERNAME_TAKEN') {
        console.error('Username was taken during final creation');
        return;
      }
      console.error('Failed to save user to Supabase:', err);
    }

    localStorage.setItem('senti_username', formattedUsername);
    localStorage.setItem('senti_user_handle', userHandle);
    localStorage.setItem(`senti_username_${clerkUserId}`, formattedUsername);
    localStorage.setItem(`senti_user_handle_${clerkUserId}`, userHandle);
    localStorage.setItem(`senti_username_set_${clerkUserId}`, 'true');
    localStorage.setItem('senti_username_set', 'true');

    setAppState('dashboard');
  };

  const userImage = user?.imageUrl || localStorage.getItem('senti_user_image') || '';

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
