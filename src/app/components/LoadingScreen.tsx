import { motion } from 'motion/react';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600">
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
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4">
          <Logo size={96} animate="pulse" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white mb-2"
      >
        Senti
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-blue-100 mb-8"
      >
        Your digital wallet
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