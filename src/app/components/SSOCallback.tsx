import { useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'motion/react';
import { Loader } from 'lucide-react';

interface SSOCallbackProps {
  onComplete: () => void;
}

/**
 * Handles the Supabase OAuth redirect callback.
 *
 * After Google/Apple OAuth, Supabase redirects here with tokens in the URL
 * hash (#access_token=...&refresh_token=...). The Supabase client
 * automatically picks these up and establishes a session.
 *
 * We just wait for the session to be established, then redirect to '/'.
 */
export default function SSOCallback({ onComplete }: SSOCallbackProps) {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    // Listen for auth state changes — fires when Supabase processes the URL tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled.current) return;
      if (event === 'SIGNED_IN' && session) {
        handled.current = true;
        window.location.replace('/');
      }
    });

    // Also check if session is already established (tokens processed synchronously)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (handled.current) return;
      if (session) {
        handled.current = true;
        window.location.replace('/');
      }
    });

    // Fallback: if nothing works after 10s, redirect home
    const timeout = setTimeout(() => {
      if (handled.current) return;
      handled.current = true;
      window.location.replace('/');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
        Setting up your account...
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
