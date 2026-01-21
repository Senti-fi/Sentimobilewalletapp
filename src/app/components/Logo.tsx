import { motion } from 'motion/react';
import logoImage from 'figma:asset/f097189035a461d20f85a95f177afc7ea3ff7347.png';

interface LogoProps {
  size?: number;
  className?: string;
  animate?: 'entrance' | 'float' | 'pulse' | 'spin' | 'none';
}

export default function Logo({ size = 64, className = '', animate = 'entrance' }: LogoProps) {
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
      <img 
        src={logoImage} 
        alt="Senti Logo" 
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
}
