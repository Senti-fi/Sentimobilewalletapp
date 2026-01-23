import { motion } from 'motion/react';

interface CharacterProps {
  className?: string;
  animate?: boolean;
}

export default function Character({ className = '', animate = false }: CharacterProps) {
  const characterColor = '#FF8A7A'; // Warm coral to complement Senti cyan

  return (
    <svg
      width="120"
      height="160"
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <motion.rect
        x="35"
        y="50"
        width="50"
        height="70"
        rx="25"
        fill={characterColor}
        animate={animate ? {
          scaleY: [1, 0.95, 1],
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Head */}
      <motion.circle
        cx="60"
        cy="30"
        r="20"
        fill={characterColor}
        animate={animate ? {
          y: [0, -2, 0],
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Left Eye */}
      <circle cx="53" cy="28" r="2.5" fill="#2D3748" />

      {/* Right Eye */}
      <circle cx="67" cy="28" r="2.5" fill="#2D3748" />

      {/* Smile (simple arc) */}
      <path
        d="M 52 36 Q 60 40 68 36"
        stroke="#2D3748"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Arm */}
      <motion.rect
        x="20"
        y="60"
        width="15"
        height="40"
        rx="7.5"
        fill={characterColor}
        style={{ transformOrigin: '27.5px 60px' }}
        animate={animate ? {
          rotate: [0, -15, 0],
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Right Arm */}
      <motion.rect
        x="85"
        y="60"
        width="15"
        height="40"
        rx="7.5"
        fill={characterColor}
        style={{ transformOrigin: '92.5px 60px' }}
        animate={animate ? {
          rotate: [0, 15, 0],
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Left Leg */}
      <rect
        x="40"
        y="120"
        width="15"
        height="35"
        rx="7.5"
        fill={characterColor}
      />

      {/* Right Leg */}
      <rect
        x="65"
        y="120"
        width="15"
        height="35"
        rx="7.5"
        fill={characterColor}
      />
    </svg>
  );
}
