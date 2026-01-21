import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';

type AppState = 'loading' | 'onboarding' | 'signup' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [isWalletCreated, setIsWalletCreated] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      const hasCompletedOnboarding = localStorage.getItem('senti_onboarding_completed');
      const hasWallet = localStorage.getItem('senti_wallet_address');
      
      if (hasCompletedOnboarding && hasWallet) {
        setAppState('dashboard');
        setIsWalletCreated(true);
      } else if (hasCompletedOnboarding) {
        setAppState('signup');
      } else {
        setAppState('onboarding');
      }
    }, 1500);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('senti_onboarding_completed', 'true');
    setAppState('signup');
  };

  const handleSignUpComplete = () => {
    // Simulate wallet creation
    const mockWalletAddress = '0x' + Math.random().toString(16).substring(2, 42);
    localStorage.setItem('senti_wallet_address', mockWalletAddress);
    setIsWalletCreated(true);
    setAppState('dashboard');
  };

  return (
    <div className="size-full bg-gray-50 overflow-hidden">
      {appState === 'loading' && (
        <LoadingScreen />
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