import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { User, AlertCircle, Shield, Zap, Globe } from 'lucide-react';
import { useAccount, useModal } from '@getpara/react-sdk-lite';
import Logo from './Logo';
import { clearAuthAttempt, markAuthAttemptStarted } from '../../lib/authAttempt';

type AuthMethod = 'google' | 'apple';
type SignUpPhase = 'idle' | 'launching' | 'awaiting_auth';

const AUTH_LAUNCH_TIMEOUT_MS = 8000;

export default function SignUp() {
  const [phase, setPhase] = useState<SignUpPhase>('idle');
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [error, setError] = useState('');

  const { openModal, isOpen: isAuthModalOpen } = useModal();
  const { isConnected, embedded } = useAccount();

  const launchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<SignUpPhase>('idle');
  phaseRef.current = phase;

  const clearLaunchTimer = () => {
    if (!launchTimerRef.current) return;
    clearTimeout(launchTimerRef.current);
    launchTimerRef.current = null;
  };

  const resetToIdle = (clearAttempt = false) => {
    clearLaunchTimer();
    setPhase('idle');
    setSelectedMethod(null);
    if (clearAttempt) {
      clearAuthAttempt();
    }
  };

  useEffect(() => {
    return () => {
      clearLaunchTimer();
    };
  }, []);

  // Once auth modal opens, transition out of launch state.
  useEffect(() => {
    if (isAuthModalOpen && phase === 'launching') {
      clearLaunchTimer();
      setPhase('awaiting_auth');
    }
  }, [isAuthModalOpen, phase]);

  // If user closes modal before auth succeeds, recover cleanly.
  useEffect(() => {
    if (!isAuthModalOpen && phase === 'awaiting_auth' && !(embedded?.isConnected || isConnected)) {
      resetToIdle(true);
    }
  }, [isAuthModalOpen, phase, embedded?.isConnected, isConnected]);

  // Auth completed: clean up local transient state and let App route by auth state.
  useEffect(() => {
    if (embedded?.isConnected || isConnected) {
      clearLaunchTimer();
      setError('');
      setPhase('awaiting_auth');
    }
  }, [embedded?.isConnected, isConnected]);

  const handleSignUp = async (method: AuthMethod) => {
    if (phase !== 'idle' || isAuthModalOpen) {
      return;
    }

    try {
      setError('');
      setSelectedMethod(method);
      setPhase('launching');
      markAuthAttemptStarted();

      launchTimerRef.current = setTimeout(() => {
        if (phaseRef.current === 'launching') {
          resetToIdle(true);
          setError('Authentication took too long to open. Please try again.');
        }
      }, AUTH_LAUNCH_TIMEOUT_MS);

      await openModal();
    } catch (err: any) {
      console.error('Auth error:', err);
      resetToIdle(true);
      setError('Failed to open authentication. Please try again.');
    }
  };

  const isCreating = phase !== 'idle';
  const disableAuthButtons = isCreating || isAuthModalOpen;

  if (isCreating) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20">
            <User className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-white text-center text-xl font-semibold"
        >
          Creating Your Wallet
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-200 text-center mb-8"
        >
          {selectedMethod === 'apple' ? 'Opening Apple sign in...' : 'Opening secure sign in...'}
        </motion.p>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-32 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute top-1/3 right-0 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between px-6 py-8 max-w-md mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <Logo size={72} color="#ffffff" animate="entrance" className="mb-6" />

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-white text-center mb-3"
          >
            Welcome to Senti
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-blue-200 text-center text-base mb-8 max-w-xs"
          >
            Your all-in-one wallet for sending, saving, and growing your money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-6 mb-2"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs text-blue-200/80">Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs text-blue-200/80">Instant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs text-blue-200/80">Borderless</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 bg-red-500/15 border border-red-400/30 backdrop-blur-sm rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}

          <div className="space-y-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSignUp('google')}
              disabled={disableAuthButtons}
              className="w-full py-4 bg-white rounded-2xl hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-semibold">Continue with Google</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSignUp('apple')}
              disabled={disableAuthButtons}
              className="w-full py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/15 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-semibold">Continue with Apple</span>
            </motion.button>
          </div>

          <div className="text-center space-y-2 pb-2">
            <p className="text-xs text-blue-200/60">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="text-xs text-blue-200/40">
              No seed phrases. Your wallet is created and secured automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
