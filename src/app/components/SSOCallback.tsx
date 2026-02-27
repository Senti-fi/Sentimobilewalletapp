import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader } from 'lucide-react';

interface SSOCallbackProps {
  onComplete: () => void;
}

/**
 * Legacy SSO callback route handler.
 *
 * Para uses popup-based OAuth (not redirects), so this route is no longer
 * part of the primary auth flow. If a user lands here (e.g., from a stale
 * bookmark or back-navigation), we simply redirect them to the app root.
 */
export default function SSOCallback({ onComplete }: SSOCallbackProps) {
  useEffect(() => {
    // Redirect to root — Para handles auth via popup, not redirect callbacks
    const timeout = setTimeout(() => {
      window.location.replace('/');
    }, 1000);

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
        Redirecting...
      </motion.h2>
    </div>
  );
}
