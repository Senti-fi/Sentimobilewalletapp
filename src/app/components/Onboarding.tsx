import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { ChevronRight, Wallet, Shield, TrendingUp, Users } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    icon: Wallet,
    title: 'Your Money, Simplified',
    subtitle: 'One wallet for all your crypto. Send, receive, and grow your assets effortlessly.',
  },
  {
    id: 2,
    icon: Shield,
    title: 'Secure by Design',
    subtitle: 'Bank-grade security with biometric protection. Your funds are always safe.',
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Grow Your Wealth',
    subtitle: 'Set savings goals, earn interest in vaults, and watch your money work for you.',
  },
  {
    id: 4,
    icon: Users,
    title: 'Pay Friends Instantly',
    subtitle: 'Send money to anyone with just their @username. No more complicated wallet addresses.',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button
          onClick={handleSkip}
          className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-8 shadow-lg"
            >
              <slide.icon className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-lg max-w-sm leading-relaxed"
            >
              {slide.subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-12">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-blue-600'
                  : index < currentSlide
                  ? 'w-2 bg-blue-400'
                  : 'w-2 bg-gray-200'
              }`}
              layoutId={`dot-${index}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isLastSlide ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Logo at bottom */}
      <div className="flex items-center justify-center pb-8">
        <Logo size={32} />
        <span className="ml-2 text-xl font-bold text-blue-600">
          Senti
        </span>
      </div>
    </div>
  );
}
