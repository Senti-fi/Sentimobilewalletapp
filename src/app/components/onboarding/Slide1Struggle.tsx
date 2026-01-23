import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Character from './Character';
import { BitcoinLogo, EthereumLogo, USDTLogo, Coin, TangledWire } from './CryptoElements';

interface Slide1StruggleProps {
  onComplete: () => void;
}

export default function Slide1Struggle({ onComplete }: Slide1StruggleProps) {
  const [phase, setPhase] = useState<'juggling' | 'coins' | 'wires' | 'whoosh'>('juggling');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('coins'), 1500),      // After 1.5s, show falling coins
      setTimeout(() => setPhase('wires'), 3000),      // After 3s, show tangled wires
      setTimeout(() => setPhase('whoosh'), 4500),     // After 4.5s, whoosh everything away
      setTimeout(() => onComplete(), 5500),           // After 5.5s, advance to next slide
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/20">
      <motion.div
        className="relative"
        animate={phase === 'whoosh' ? { scale: 0, opacity: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Character in center */}
        <motion.div
          className="relative z-10"
          animate={
            phase === 'juggling' || phase === 'coins'
              ? { y: [0, -5, 0] }
              : phase === 'wires'
              ? { rotate: [0, -10, 10, -10, 0] }
              : {}
          }
          transition={
            phase === 'wires'
              ? { duration: 0.8, repeat: 2 }
              : { duration: 1, repeat: Infinity }
          }
        >
          <Character animate={phase === 'juggling'} />
        </motion.div>

        {/* Phase 1: Juggling crypto logos that drop */}
        {phase === 'juggling' && (
          <>
            {/* Bitcoin - drops to bottom left */}
            <motion.div
              className="absolute top-0 left-0"
              animate={{
                y: [0, -40, -20, 200],
                x: [0, -10, -30, -50],
                rotate: [0, 180, 360, 540],
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <BitcoinLogo />
            </motion.div>

            {/* Ethereum - drops straight down */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              animate={{
                y: [0, -50, -30, 200],
                rotate: [0, -180, -360, -540],
              }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            >
              <EthereumLogo />
            </motion.div>

            {/* USDT - drops to bottom right */}
            <motion.div
              className="absolute top-0 right-0"
              animate={{
                y: [0, -45, -25, 200],
                x: [0, 10, 30, 50],
                rotate: [0, 180, 360, 540],
              }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            >
              <USDTLogo />
            </motion.div>
          </>
        )}

        {/* Phase 2: Coins falling and slipping through fingers */}
        {phase === 'coins' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 15}%`,
                  top: '-50px',
                }}
                animate={{
                  y: [0, 300],
                  x: [0, Math.random() * 40 - 20],
                  rotate: [0, Math.random() * 360],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: "easeIn",
                }}
              >
                <Coin />
              </motion.div>
            ))}
          </>
        )}

        {/* Phase 3: Tangled wires around character */}
        {phase === 'wires' && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'translate(-20%, -20%)' }}
          >
            <TangledWire
              path="M 50 20 Q 100 80, 150 100 T 180 150"
              label="Wallet 1"
            />
            <TangledWire
              path="M 200 50 Q 120 90, 80 120 T 60 180"
              label="Wallet 2"
            />
            <TangledWire
              path="M 100 180 Q 140 140, 180 100 T 200 20"
              label="Wallet 3"
            />
          </svg>
        )}

        {/* Whoosh particles effect */}
        {phase === 'whoosh' && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-400"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: Math.cos((i / 20) * Math.PI * 2) * 200,
                  y: Math.sin((i / 20) * Math.PI * 2) * 200,
                  opacity: [1, 0],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}
