import { useEffect } from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { Loader } from 'lucide-react';

interface SSOCallbackProps {
  onComplete: () => void;
}

export default function SSOCallback({ onComplete }: SSOCallbackProps) {
  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-6">
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />

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
          <Loader className="w-12 h-12 text-white animate-spin" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-gray-900 text-center text-xl font-semibold"
      >
        Completing Sign In
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 text-center mb-8"
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
        className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
      />
    </div>
  );
}
