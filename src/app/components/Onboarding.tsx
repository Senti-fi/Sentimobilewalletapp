import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Shield, Zap, TrendingUp } from 'lucide-react';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Wallet,
    title: 'Your Digital Wallet',
    description: 'Manage your money with the simplicity of a traditional wallet, powered by blockchain technology.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Secure & Simple',
    description: 'No complex seed phrases. Sign in with email or social accounts - we handle the crypto complexity.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Instant Transactions',
    description: 'Send, receive, and spend your stablecoins instantly with zero hassle.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Money',
    description: 'Save and invest your stablecoins to earn rewards - all without understanding DeFi.',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="size-full flex flex-col bg-white">
      {/* Skip button */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            {/* Animated icon - Show logo on first slide, icons on others */}
            {currentSlide === 0 ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
                className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white shadow-2xl flex items-center justify-center p-6"
              >
                <Logo size={128} animate="float" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
                className={`w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-2xl`}
              >
                <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-gray-900"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section with dots and button */}
      <div className="pb-8 px-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
              animate={{
                width: index === currentSlide ? 32 : 8,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </motion.button>
      </div>
    </div>
  );
}