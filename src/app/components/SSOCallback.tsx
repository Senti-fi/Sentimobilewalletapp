import { useEffect, useRef, useState } from 'react';
import { useSignUp, useSignIn, useClerk } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { Loader } from 'lucide-react';

interface SSOCallbackProps {
  onComplete: () => void;
}

/**
 * Handles the OAuth redirect callback manually instead of using Clerk's
 * AuthenticateWithRedirectCallback component.
 *
 * Why manual? AuthenticateWithRedirectCallback is a black-box that:
 *   1. Fires handleRedirectCallback as fire-and-forget
 *   2. Silently swallows all errors (.catch(() => {}))
 *   3. Races with our transfer-handling useEffect
 *   4. Navigates to unknown URLs for "transferable" states before React
 *      gets a chance to handle the transfer
 *
 * This component instead waits for Clerk to process the URL params, then
 * checks all possible OAuth outcomes and handles each one explicitly.
 */
export default function SSOCallback({ onComplete }: SSOCallbackProps) {
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const clerk = useClerk();
  const processed = useRef(false);
  const fallbackTriggered = useRef(false);
  const [statusText, setStatusText] = useState('Setting up your account...');

  // ── Primary handler: watch for actionable OAuth states ─────────────
  // Clerk processes the URL params during ClerkProvider init and updates
  // the signIn / signUp objects. We watch those objects reactively and
  // handle every possible outcome.
  useEffect(() => {
    if (processed.current) return;
    if (!isSignUpLoaded || !isSignInLoaded) return;
    if (!signIn || !signUp) return;

    const signInComplete = signIn.status === 'complete' && signIn.createdSessionId;
    const signUpComplete = signUp.status === 'complete' && signUp.createdSessionId;
    const signUpTransferable = signUp.verifications?.externalAccount?.status === 'transferable';
    const signInTransferable = signIn.firstFactorVerification?.status === 'transferable';

    // Nothing actionable yet — wait for Clerk to finish processing
    if (!signInComplete && !signUpComplete && !signUpTransferable && !signInTransferable) {
      return;
    }

    processed.current = true;

    (async () => {
      try {
        // Case 1: signIn completed (returning user via signIn.authenticateWithRedirect)
        if (signInComplete) {
          setStatusText('Welcome back! Signing you in...');
          await clerk.setActive({ session: signIn.createdSessionId! });
          sessionStorage.removeItem('senti_oauth_pending');
          window.location.replace('/');
          return;
        }

        // Case 2: signUp completed (new user via signUp.authenticateWithRedirect)
        if (signUpComplete) {
          setStatusText('Account created! Setting up...');
          await clerk.setActive({ session: signUp.createdSessionId! });
          sessionStorage.removeItem('senti_oauth_pending');
          window.location.replace('/');
          return;
        }

        // Case 3: Existing user went through signUp OAuth → transfer to signIn
        if (signUpTransferable) {
          setStatusText('Found your account! Signing you in...');
          const result = await signIn.create({ transfer: true });
          if (result.status === 'complete' && result.createdSessionId) {
            await clerk.setActive({ session: result.createdSessionId });
          }
          sessionStorage.removeItem('senti_oauth_pending');
          window.location.replace('/');
          return;
        }

        // Case 4: New user went through signIn OAuth → transfer to signUp
        if (signInTransferable) {
          setStatusText('Creating your account...');
          const result = await signUp.create({ transfer: true });
          if (result.status === 'complete' && result.createdSessionId) {
            await clerk.setActive({ session: result.createdSessionId });
          }
          sessionStorage.removeItem('senti_oauth_pending');
          window.location.replace('/');
          return;
        }
      } catch (err) {
        console.error('SSO callback processing error:', err);
        sessionStorage.removeItem('senti_oauth_pending');
        window.location.replace('/');
      }
    })();
  }, [
    isSignUpLoaded,
    isSignInLoaded,
    signIn?.status,
    signIn?.createdSessionId,
    signUp?.status,
    signUp?.createdSessionId,
    signUp?.verifications?.externalAccount?.status,
    signIn?.firstFactorVerification?.status,
    signIn,
    signUp,
    clerk,
  ]);

  // ── Fallback: nudge Clerk with handleRedirectCallback ──────────────
  // If no actionable state appears within 3 seconds, it's possible
  // Clerk didn't process the URL params during init. Call
  // handleRedirectCallback to force processing.
  useEffect(() => {
    const nudge = setTimeout(() => {
      if (processed.current || fallbackTriggered.current) return;
      fallbackTriggered.current = true;
      setStatusText('Still working on it...');
      try {
        clerk.handleRedirectCallback({
          afterSignInUrl: '/',
          afterSignUpUrl: '/',
        });
      } catch {
        // handleRedirectCallback proxy swallows errors anyway
      }
    }, 3000);
    return () => clearTimeout(nudge);
  }, [clerk]);

  // ── Ultimate fallback: redirect home ───────────────────────────────
  // If nothing worked after 10 seconds, something is truly broken.
  // Redirect home and let App.tsx handle the auth state.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (processed.current) return;
      processed.current = true;
      console.warn('SSO callback: timed out after 10s, redirecting home');
      sessionStorage.removeItem('senti_oauth_pending');
      window.location.replace('/');
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6">
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
        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20">
          <Loader className="w-12 h-12 text-white animate-spin" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-white text-center text-xl font-semibold"
      >
        Completing Sign In
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-blue-200 text-center mb-8"
      >
        {statusText}
      </motion.p>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
      />
    </div>
  );
}
