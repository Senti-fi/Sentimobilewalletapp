import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Character from './Character';
import Logo from '../Logo';

interface Slide2SolutionProps {
  onComplete: () => void;
}

export default function Slide2Solution({ onComplete }: Slide2SolutionProps) {
  const [phase, setPhase] = useState<'logo' | 'character' | 'walk' | 'final'>('logo');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('character'), 800),   // After 0.8s, show character with text
      setTimeout(() => setPhase('walk'), 2000),       // After 2s, character walks forward
      setTimeout(() => setPhase('final'), 3500),      // After 3.5s, show only logo
      setTimeout(() => onComplete(), 6000),           // After 6s, auto-advance to signup
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50/30 relative overflow-hidden">
      {/* Phase 1: Logo descends from top with glow */}
      {(phase === 'logo' || phase === 'character' || phase === 'walk') && (
        <motion.div
          className="absolute top-20"
          initial={{ y: -200, opacity: 0, scale: 0.5 }}
          animate={{
            y: phase === 'walk' ? -100 : 0,
            opacity: phase === 'walk' ? 0 : 1,
            scale: phase === 'walk' ? 0.3 : 1,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(33, 150, 243, 0.3)',
                '0 0 40px rgba(33, 150, 243, 0.6)',
                '0 0 20px rgba(33, 150, 243, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-3xl p-4 bg-white"
          >
            <Logo size={80} animate="pulse" />
          </motion.div>
        </motion.div>
      )}

      {/* Phase 2 & 3: Character lifts and carries text */}
      {(phase === 'character' || phase === 'walk') && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: phase === 'walk' ? 0 : 1,
            y: phase === 'walk' ? -50 : 0,
            scale: phase === 'walk' ? 0.8 : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          {/* "Made with ❤️ for easy crypto" text above character */}
          <motion.div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: phase === 'walk' ? -30 : 0,
              opacity: phase === 'walk' ? 0 : 1,
            }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-blue-200">
              <p className="text-lg font-semibold text-gray-800">
                Made with <span className="text-red-500">❤️</span> for easy crypto
              </p>
            </div>
            {/* Support beams from character's hands to text */}
            <svg className="absolute top-full left-1/2 -translate-x-1/2" width="100" height="60">
              <line x1="20" y1="0" x2="35" y2="60" stroke="#FF8A7A" strokeWidth="3" />
              <line x1="80" y1="0" x2="65" y2="60" stroke="#FF8A7A" strokeWidth="3" />
            </svg>
          </motion.div>

          {/* Character */}
          <motion.div
            animate={
              phase === 'walk'
                ? {
                    y: [0, -5, 0, -5, 0],
                  }
                : {}
            }
            transition={
              phase === 'walk'
                ? { duration: 0.8, repeat: 2 }
                : {}
            }
          >
            <Character animate={phase === 'walk'} />
          </motion.div>
        </motion.div>
      )}

      {/* Phase 4: Final - Only Senti logo and name */}
      {phase === 'final' && (
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 30px rgba(33, 150, 243, 0.4)',
                '0 0 50px rgba(33, 150, 243, 0.7)',
                '0 0 30px rgba(33, 150, 243, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-3xl p-6 bg-white"
          >
            <Logo size={120} animate="float" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Senti
            </h1>
            <p className="text-center text-gray-600 mt-2 text-sm">
              Banking made human
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
