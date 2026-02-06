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
        {/* Top triangle - sharp tip at top-right */}
        <polygon
          points="88,5 12,50 55,38"
          fill={color}
        />
        {/* Center hexagon */}
        <polygon
          points="50,52 61,58 61,70 50,76 39,70 39,58"
          fill={color}
        />
        {/* Bottom triangle - sharp tip at bottom-left */}
        <polygon
          points="12,115 88,70 45,82"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}
