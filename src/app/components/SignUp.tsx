import { useState } from 'react';
import { motion } from 'motion/react';
import { User, AlertCircle, Fingerprint } from 'lucide-react';
import { useSignUp, useSignIn } from '@clerk/clerk-react';

interface SignUpProps {
  onComplete: () => void;
}

export default function SignUp({ onComplete }: SignUpProps) {
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleOAuthSignUp = async (provider: 'oauth_google' | 'oauth_apple') => {
    if (!isSignUpLoaded || !signUp || !isSignInLoaded || !signIn) {
      setError('Authentication not ready. Please try again.');
      return;
    }

    try {
      setError('');
      // Mark that an OAuth flow is in progress so App.tsx doesn't
      // race with a short timeout while Clerk re-establishes the session.
      sessionStorage.setItem('senti_oauth_pending', 'true');

      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: window.location.origin + '/sso-callback',
        redirectUrlComplete: window.location.origin + '/dashboard',
      });
    } catch (err: any) {
      console.error('OAuth sign-up error:', err);

      // If the user already has a Clerk account, fall back to sign-in flow.
      // This covers returning users who click "Continue with Google/Apple".
      const code = err.errors?.[0]?.code;
      if (
        code === 'form_identifier_exists' ||
        code === 'external_account_exists' ||
        code === 'identifier_already_signed_in'
      ) {
        try {
          await signIn.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: window.location.origin + '/sso-callback',
            redirectUrlComplete: window.location.origin + '/dashboard',
          });
          return;
        } catch (signInErr: any) {
          console.error('OAuth sign-in fallback error:', signInErr);
          sessionStorage.removeItem('senti_oauth_pending');
          setError(signInErr.errors?.[0]?.message || 'Failed to sign in. Please try again.');
          return;
        }
      }

      sessionStorage.removeItem('senti_oauth_pending');
      setError(err.errors?.[0]?.message || 'Failed to sign up. Please try again.');
    }
  };

  const handlePasskeySignUp = async () => {
    if (!isSignInLoaded || !signIn) {
      setError('Authentication not ready. Please try again.');
      return;
    }

    try {
      setError('');
      setIsCreating(true);

      // First, try to authenticate with passkey
      const result = await signIn.authenticateWithPasskey();

      if (result.status === 'complete') {
        onComplete();
      }
    } catch (err: any) {
      console.error('Passkey error:', err);
      // If no passkey exists, user needs to sign up with another method first
      if (err.errors?.[0]?.code === 'passkey_not_found') {
        setError('No passkey found. Please sign up with Google or Apple first, then add a passkey in settings.');
      } else {
        setError(err.errors?.[0]?.message || 'Passkey authentication failed. Please try another method.');
      }
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
            <User className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-gray-900 text-center"
        >
          Creating Your Wallet
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-center mb-8"
        >
          Setting up your secure digital wallet...
        </motion.p>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl text-white">S</span>
              </div>
            </motion.div>
            <h1 className="mb-2 text-gray-900 text-2xl font-semibold">Welcome to Senti</h1>
            <p className="text-gray-600">Sign up to create your secure wallet</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Sign Up Options */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthSignUp('oauth_google')}
              disabled={!isSignUpLoaded}
              className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </motion.button>

            {/* Apple */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthSignUp('oauth_apple')}
              disabled={!isSignUpLoaded}
              className="w-full py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-medium">Continue with Apple</span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Passkey */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePasskeySignUp}
              disabled={!isSignInLoaded}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Fingerprint className="w-5 h-5" />
              <span className="font-medium">Sign in with Passkey</span>
            </motion.button>
          </div>

          {/* Info text */}
          <div className="text-center space-y-4">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="text-xs text-gray-400">
              Your wallet is automatically created and secured. No seed phrases needed!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
