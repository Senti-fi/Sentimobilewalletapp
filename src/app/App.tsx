import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import SSOCallback from './components/SSOCallback';
import UsernameSetup from './components/UsernameSetup';
import Onboarding from './components/Onboarding';

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

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [appState, setAppState] = useState<AppState>('loading');

  // Check current route for SSO callback
  const isCallbackRoute = window.location.pathname === '/sso-callback';
  const isDashboardRoute = window.location.pathname === '/dashboard';

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
      // Sync Clerk user data to localStorage for app-wide use
      const clerkUserId = user.id;

      // User-specific key for username setup status
      const userSetupKey = `senti_username_set_${clerkUserId}`;

      // Generate Senti ID for this specific user if they don't have one
      const userSentiIdKey = `senti_user_id_${clerkUserId}`;
      let existingSentiId = localStorage.getItem(userSentiIdKey);
      if (!existingSentiId || !existingSentiId.startsWith('SENTI-')) {
        existingSentiId = generateSentiUserId();
        localStorage.setItem(userSentiIdKey, existingSentiId);
      }
      // Also store in the global key for backwards compatibility
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
        // Generate a valid-length hex address (40 hex chars)
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

      // Check if THIS USER has set up their custom username (user-specific check)
      const hasSetUsername = localStorage.getItem(userSetupKey) === 'true';

      // Also check if we have the actual username stored (double verification)
      const userUsernameKey = `senti_username_${clerkUserId}`;
      const userHandleKey = `senti_user_handle_${clerkUserId}`;
      const storedUsername = localStorage.getItem(userUsernameKey);
      const storedHandle = localStorage.getItem(userHandleKey);

      // Restore user-specific data if they've set up before
      if (hasSetUsername && storedUsername && storedHandle) {
        localStorage.setItem('senti_username', storedUsername);
        localStorage.setItem('senti_user_handle', storedHandle);
        setAppState('dashboard');
      } else {
        // User needs to set up username (either new user or data was lost)
        setAppState('username-setup');
      }
      return;
    }

    // User is not signed in - check if they've seen onboarding
    const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed') === 'true';

    // Small delay to show loading screen
    setTimeout(() => {
      if (hasCompletedOnboarding) {
        setAppState('signup');
      } else {
        setAppState('onboarding');
      }
    }, 1000);
  }, [isLoaded, isSignedIn, user, isCallbackRoute, isDashboardRoute]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('senti_onboarding_completed', 'true');
    setAppState('signup');
  };

  const handleSignUpComplete = () => {
    // This is called after successful passkey authentication
    // Clerk user data will be synced in the useEffect above
    setAppState('dashboard');
  };

  const handleSSOComplete = () => {
    // Redirect to dashboard after SSO callback is processed
    window.history.replaceState({}, '', '/');
    // The useEffect will handle checking if username is set
  };

  const handleUsernameComplete = (username: string) => {
    // Get the current Clerk user ID - must be available at this point
    const clerkUserId = user?.id || localStorage.getItem('senti_clerk_user_id');

    if (!clerkUserId) {
      console.error('No user ID available for username setup');
      return;
    }

    // Format and save the custom username with capital first letter
    const formattedUsername = formatUsername(username);
    const userHandle = `@${username.toLowerCase()}.senti`;

    // Store globally for current session
    localStorage.setItem('senti_username', formattedUsername);
    localStorage.setItem('senti_user_handle', userHandle);

    // Store with user-specific keys for persistence across sessions (CRITICAL)
    localStorage.setItem(`senti_username_${clerkUserId}`, formattedUsername);
    localStorage.setItem(`senti_user_handle_${clerkUserId}`, userHandle);
    localStorage.setItem(`senti_username_set_${clerkUserId}`, 'true');

    // Also set the old key for backwards compatibility
    localStorage.setItem('senti_username_set', 'true');

    // Register user in the global users database so other users can find them
    const displayName = `${formattedUsername} Senti`;
    const newUser = {
      id: userHandle,
      name: displayName,
      online: true,
      registeredAt: Date.now(),
    };

    // Get existing registered users or initialize empty array
    const existingUsersJson = localStorage.getItem('senti_registered_users');
    const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];

    // Check if user already exists (by id)
    const userExists = existingUsers.some((u: any) => u.id === userHandle);
    if (!userExists) {
      existingUsers.push(newUser);
      localStorage.setItem('senti_registered_users', JSON.stringify(existingUsers));
    }

    setAppState('dashboard');
  };

  // Get user image for username setup page
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