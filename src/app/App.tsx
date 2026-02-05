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
    if (isSignedIn && user) {
      // Sync Clerk user data to localStorage for app-wide use
      const clerkUserId = user.id;
      const existingSentiId = localStorage.getItem('senti_user_id');

      // Generate Senti ID if this is a new user
      if (!existingSentiId || !existingSentiId.startsWith('SENTI-')) {
        localStorage.setItem('senti_user_id', generateSentiUserId());
      }

      // Store Clerk data
      const email = user.primaryEmailAddress?.emailAddress || '';
      localStorage.setItem('senti_clerk_user_id', clerkUserId);
      localStorage.setItem('senti_user_email', email);
      localStorage.setItem('senti_user_image', user.imageUrl || '');

      // Generate wallet address if not exists
      if (!localStorage.getItem('senti_wallet_address')) {
        // Generate a valid-length hex address (40 hex chars)
        const hexChars = '0123456789abcdef';
        let addr = '0x';
        for (let i = 0; i < 40; i++) {
          addr += hexChars[Math.floor(Math.random() * 16)];
        }
        localStorage.setItem('senti_wallet_address', addr);
      }

      // Mark onboarding as complete for signed-in users
      localStorage.setItem('senti_onboarding_completed', 'true');

      // Clean up URL if coming from OAuth redirect
      if (isDashboardRoute) {
        window.history.replaceState({}, '', '/');
      }

      // Check if user has set up their custom username
      const hasSetUsername = localStorage.getItem('senti_username_set') === 'true';

      if (!hasSetUsername) {
        // New user needs to set up username
        setAppState('username-setup');
      } else {
        // Existing user with username set
        setAppState('dashboard');
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
    // Format and save the custom username with capital first letter
    const formattedUsername = formatUsername(username);
    localStorage.setItem('senti_username', formattedUsername);
    localStorage.setItem('senti_user_handle', `@${username.toLowerCase()}.senti`);
    localStorage.setItem('senti_username_set', 'true');

    // Register user in the global users database so other users can find them
    const userHandle = `@${username.toLowerCase()}.senti`;
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