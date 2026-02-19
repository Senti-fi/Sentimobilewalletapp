import { useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { supabase, userService, UserProfile } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import SSOCallback from './components/SSOCallback';
import UsernameSetup from './components/UsernameSetup';
import Onboarding from './components/Onboarding';

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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appState, setAppState] = useState<AppState>('loading');

  const profileCheckRef = useRef<string | null>(null);

  const isCallbackRoute = window.location.pathname === '/sso-callback';

  // ── Initialize Supabase Auth listener ─────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoaded(true);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check Supabase for existing user profile – runs once per auth user ID
  const checkUserProfile = useCallback(async (authUserId: string, email: string, imageUrl: string) => {
    if (profileCheckRef.current === authUserId) return;
    profileCheckRef.current = authUserId;

    try {
      // ── 1. Check Supabase (primary source of truth) ──
      const existingUser = await userService.getUserByAuthId(authUserId);

      if (existingUser) {
        restoreProfileToLocalStorage(existingUser, authUserId);

        if (existingUser.email !== email || existingUser.image_url !== imageUrl) {
          userService.updateUser(authUserId, { email, image_url: imageUrl }).catch(() => {});
        }

        setAppState('dashboard');
        return;
      }

      // ── 2. Supabase has no record – try localStorage migration ──
      const hasSetUsername = localStorage.getItem(`senti_username_set_${authUserId}`) === 'true';
      const storedUsername = localStorage.getItem(`senti_username_${authUserId}`);
      const storedHandle = localStorage.getItem(`senti_user_handle_${authUserId}`);

      if (hasSetUsername && storedUsername && storedHandle) {
        const walletAddress =
          localStorage.getItem(`senti_wallet_address_${authUserId}`) ||
          localStorage.getItem('senti_wallet_address') || '';

        try {
          const migrated = await userService.createUser({
            authUserId,
            username: storedUsername.toLowerCase(),
            handle: storedHandle,
            walletAddress,
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
        const walletAddress = localStorage.getItem('senti_wallet_address') || '';

        try {
          const migrated = await userService.createUser({
            authUserId,
            username: legacyUsername.toLowerCase(),
            handle: legacyHandle,
            walletAddress,
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
  useEffect(() => {
    // Handle SSO callback route — let SSOCallback component take over
    if (isCallbackRoute) {
      setAppState('sso-callback');
      return;
    }

    // Wait for Supabase to load
    if (!isLoaded) {
      setAppState('loading');
      return;
    }

    // User is signed in
    if (session?.user) {
      const authUserId = session.user.id;
      const email = session.user.email || '';
      const imageUrl = session.user.user_metadata?.avatar_url || '';

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
      localStorage.setItem('senti_user_email', email);
      localStorage.setItem('senti_user_image', imageUrl);

      // Generate wallet address for this user if not exists
      const userWalletKey = `senti_wallet_address_${authUserId}`;
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

      // Check Supabase for existing user – ref guard prevents duplicate calls
      checkUserProfile(authUserId, email, imageUrl);
      return;
    }

    // User is not signed in
    const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';
    profileCheckRef.current = null;

    if (hasCompletedOnboarding) {
      setAppState('signup');
    } else {
      setAppState('onboarding');
    }
  }, [isLoaded, session, isCallbackRoute, checkUserProfile]);

  // Safety net: stuck in 'loading' for more than 10s
  useEffect(() => {
    if (appState !== 'loading') return;

    const safetyTimer = setTimeout(() => {
      if (profileCheckRef.current) return;
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
    const authUserId = session?.user?.id || localStorage.getItem('senti_auth_user_id');

    if (!authUserId) {
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
        authUserId,
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
    localStorage.setItem(`senti_username_${authUserId}`, formattedUsername);
    localStorage.setItem(`senti_user_handle_${authUserId}`, userHandle);
    localStorage.setItem(`senti_username_set_${authUserId}`, 'true');
    localStorage.setItem('senti_username_set', 'true');

    setAppState('dashboard');
  };

  const userImage = session?.user?.user_metadata?.avatar_url || localStorage.getItem('senti_user_image') || '';

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
