import { useState, useEffect } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import Onboarding from './components/Onboarding';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import SSOCallback from './components/SSOCallback';

type AppState = 'loading' | 'onboarding' | 'signup' | 'dashboard' | 'sso-callback';

// Generate a unique user ID for Senti
const generateSentiUserId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SENTI-${timestamp}-${randomPart}`;
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

      // Store user data from Clerk
      const email = user.primaryEmailAddress?.emailAddress || '';
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
      const username = user.username || fullName.toLowerCase().replace(/\s+/g, '_');

      localStorage.setItem('senti_clerk_user_id', clerkUserId);
      localStorage.setItem('senti_user_email', email);
      localStorage.setItem('senti_username', username);
      localStorage.setItem('senti_user_handle', `@${username}.senti`);
      localStorage.setItem('senti_user_image', user.imageUrl || '');

      // Generate wallet address if not exists
      if (!localStorage.getItem('senti_wallet_address')) {
        const mockWalletAddress = '0x' + Math.random().toString(16).substring(2, 42);
        localStorage.setItem('senti_wallet_address', mockWalletAddress);
      }

      // Mark onboarding as complete for signed-in users
      localStorage.setItem('senti_onboarding_completed', 'true');

      setAppState('dashboard');

      // Clean up URL if coming from OAuth redirect
      if (isDashboardRoute) {
        window.history.replaceState({}, '', '/');
      }
      return;
    }

    // User is not signed in - check onboarding status
    const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed');

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
    setAppState('dashboard');
  };

  return (
    <div className="size-full bg-gray-50 overflow-hidden relative">
      {appState === 'loading' && (
        <LoadingScreen />
      )}
      {appState === 'sso-callback' && (
        <SSOCallback onComplete={handleSSOComplete} />
      )}
      {appState === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {appState === 'signup' && (
        <SignUp onComplete={handleSignUpComplete} />
      )}
      {appState === 'dashboard' && (
        <Dashboard />
      )}
    </div>
  );
}