import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import SSOCallback from './components/SSOCallback';
import UsernameSetup from './components/UsernameSetup';
import Onboarding from './components/Onboarding';
import { userService, UserProfile } from '../services/supabase';

type AppState = 'loading' | 'onboarding' | 'signup' | 'dashboard' | 'sso-callback' | 'username-setup';

// Generate a unique user ID for Senti
const generateSentiUserId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SENTI-${timestamp}-${randomPart}`;
};

// Format username with capital first letter (e.g., "oxsenti" -> "OxSenti")
const formatUsername = (username: string): string => {
  return username.charAt(0).toUpperCase() + username.slice(1);
};

// Restore Supabase profile data into localStorage for the session
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

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [appState, setAppState] = useState<AppState>('loading');

  // Use a ref to prevent the profile check from running more than once per sign-in
  const profileCheckRef = useRef<string | null>(null);

  // Check current route for SSO callback
  const isCallbackRoute = window.location.pathname === '/sso-callback';
  const isDashboardRoute = window.location.pathname === '/dashboard';

  // Check Supabase for existing user profile – runs exactly once per clerkUserId
  const checkUserProfile = useCallback(async (clerkUserId: string, email: string, imageUrl: string) => {
    // Guard: only run once per user id
    if (profileCheckRef.current === clerkUserId) return;
    profileCheckRef.current = clerkUserId;

    try {
      // ── 1. Check Supabase (primary source of truth) ──
      const existingUser = await userService.getUserByClerkId(clerkUserId);

      if (existingUser) {
        restoreProfileToLocalStorage(existingUser, clerkUserId);

        // Keep Supabase up to date with latest email / image from the auth provider
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
            // createUser returned null but didn't throw – still use localStorage data
            localStorage.setItem('senti_username', storedUsername);
            localStorage.setItem('senti_user_handle', storedHandle);
          }
        } catch (migrationErr: any) {
          if (migrationErr?.message === 'USERNAME_TAKEN') {
            // Username was taken by someone else – user needs to pick a new one
            // Clear the stale localStorage flag so they go through setup
            localStorage.removeItem(`senti_username_set_${clerkUserId}`);
            setAppState('username-setup');
            return;
          }
          // Other migration error – use localStorage data for now
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
            // Promote legacy keys to user-specific keys
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
      // On total failure, fall back to localStorage for a graceful experience
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

    // User is not signed in - check if they've seen onboarding
    const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';

    // Reset the profile check ref so it runs again on next sign-in
    profileCheckRef.current = null;

    setTimeout(() => {
      if (hasCompletedOnboarding) {
        setAppState('signup');
      } else {
        setAppState('onboarding');
      }
    }, 1000);
  }, [isLoaded, isSignedIn, user, isCallbackRoute, isDashboardRoute, checkUserProfile]);

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

    // Save to Supabase first (primary storage)
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
        // This shouldn't happen because UsernameSetup checks beforehand,
        // but handle it gracefully just in case
        console.error('Username was taken during final creation');
        return;
      }
      console.error('Failed to save user to Supabase:', err);
    }

    // Store globally for current session
    localStorage.setItem('senti_username', formattedUsername);
    localStorage.setItem('senti_user_handle', userHandle);

    // Store with user-specific keys for persistence across sessions
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
