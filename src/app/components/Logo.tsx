import { motion } from 'motion/react';

interface LogoProps {
  size?: number;
  className?: string;
  animate?: 'entrance' | 'float' | 'pulse' | 'spin' | 'none';
  color?: string;
}

export default function Logo({ size = 64, className = '', animate = 'entrance', color = '#38BDF8' }: LogoProps) {
  const animationVariants = {
    entrance: {
      initial: { scale: 0, rotate: -180, opacity: 0 },
      animate: {
        scale: 1,
        rotate: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.8
        }
      }
    },
    float: {
      initial: { y: 0 },
      animate: {
        y: [-10, 10, -10],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    },
    pulse: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    },
    spin: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }
      }
    },
    none: {
      initial: {},
      animate: {}
    }
  };

  const currentAnimation = animationVariants[animate];

  return (
    <motion.div
      initial={currentAnimation.initial}
      animate={currentAnimation.animate}
      className={className}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Top swoosh/arrow - from left-middle to top-right to center */}
        <polygon
          points="8,52 92,2 52,38"
          fill={color}
        />
        {/* Center hexagon */}
        <polygon
          points="50,50 60,55 60,67 50,72 40,67 40,55"
          fill={color}
        />
        {/* Bottom swoosh/arrow - from right-middle to bottom-left to center */}
        <polygon
          points="92,68 8,118 48,82"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}
