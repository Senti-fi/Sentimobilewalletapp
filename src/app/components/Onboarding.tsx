import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { ChevronRight, Wallet, Send, TrendingUp, MessageCircle, Sparkles, Users, PiggyBank, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

// Slide 1: Creative word layout (like Petra's gateway slide)
function WelcomeSlide() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Row 1 */}
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold"
          >
            Senti
          </motion.span>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <Wallet className="w-6 h-6 text-white" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold"
          >
            is the
          </motion.span>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-2xl font-medium"
          >
            smart
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-6 py-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold border border-white/20"
          >
            way to
          </motion.span>
        </div>

        {/* Row 3 */}
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold"
          >
            save
          </motion.span>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <PiggyBank className="w-6 h-6 text-white" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold"
          >
            send
          </motion.span>
        </div>

        {/* Row 4 */}
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-white/80 text-2xl font-medium"
          >
            &
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold"
          >
            grow
          </motion.span>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: 'spring' }}
            className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Row 5 */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="px-6 py-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-white text-2xl font-semibold border border-white/20"
        >
          your money
        </motion.span>
      </motion.div>
    </div>
  );
}

// Slide 2: Meet Lucy AI
function LucySlide() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-8">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-4"
      >
        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
          Meet Lucy AI
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white text-2xl font-semibold text-center mb-8 leading-snug"
      >
        Your personal finance assistant.{'\n'}Ask anything, anytime.
      </motion.h2>

      {/* Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        className="flex-1 mx-auto w-full max-w-[280px]"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
          {/* Chat mockup */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Lucy</span>
            </div>
          </div>
          <div className="p-4 space-y-3 bg-gray-50">
            <div className="bg-blue-100 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
              <p className="text-gray-800 text-sm">How can I save more this month?</p>
            </div>
            <div className="bg-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] ml-auto shadow-sm border border-gray-100">
              <p className="text-gray-700 text-sm">Based on your spending, you could save $127 by reducing dining out. Want me to set up a goal?</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-full">Yes, set it up</span>
              <span className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-full">Tell me more</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 3: Social Payments
function SocialSlide() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-8">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-4"
      >
        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
          Pay Anyone
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white text-2xl font-semibold text-center mb-8 leading-snug"
      >
        Send money instantly.{'\n'}Just search by @username.
      </motion.h2>

      {/* Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        className="flex-1 mx-auto w-full max-w-[280px]"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
          <div className="p-5">
            <p className="text-gray-500 text-sm mb-3">Send to</p>
            <div className="bg-gray-100 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">@emma.senti</span>
            </div>

            {/* Contact cards */}
            <div className="space-y-2 mb-4">
              {[
                { name: 'Emma Wilson', handle: '@emma.senti', color: 'from-pink-400 to-rose-500' },
                { name: 'David Chen', handle: '@david.senti', color: 'from-blue-400 to-cyan-500' },
              ].map((contact, i) => (
                <motion.div
                  key={contact.handle}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{contact.name}</p>
                    <p className="text-gray-500 text-xs">{contact.handle}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Amount */}
            <div className="text-center py-4 border-t border-gray-100">
              <p className="text-4xl font-bold text-gray-900">$50.00</p>
              <p className="text-gray-500 text-sm mt-1">USDC</p>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Send Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 4: Grow Money
function GrowSlide() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-8">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-4"
      >
        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
          Grow Your Money
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white text-2xl font-semibold text-center mb-8 leading-snug"
      >
        Earn up to 15% APY.{'\n'}No crypto knowledge needed.
      </motion.h2>

      {/* Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        className="flex-1 mx-auto w-full max-w-[280px]"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
          {/* Balance header */}
          <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 p-5 text-white">
            <p className="text-white/80 text-sm mb-1">Total Savings</p>
            <p className="text-3xl font-bold">$4,827.50</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-green-300 text-sm">+12.4% APY</span>
            </div>
          </div>

          {/* Vault cards */}
          <div className="p-4 space-y-3">
            {[
              { name: 'USDC Vault', apy: '8.5%', amount: '$2,500', color: 'bg-blue-500' },
              { name: 'Savings Goal', apy: '15%', amount: '$1,200', color: 'bg-purple-500' },
            ].map((vault, i) => (
              <motion.div
                key={vault.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${vault.color} rounded-xl flex items-center justify-center`}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{vault.name}</p>
                    <p className="text-green-600 text-xs font-medium">{vault.apy} APY</p>
                  </div>
                </div>
                <p className="text-gray-900 font-semibold">{vault.amount}</p>
              </motion.div>
            ))}

            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 mt-2">
              Start Earning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const isLastSlide = currentSlide === totalSlides - 1;

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <WelcomeSlide />;
      case 1:
        return <LucySlide />;
      case 2:
        return <SocialSlide />;
      case 3:
        return <GrowSlide />;
      default:
        return <WelcomeSlide />;
    }
  };

  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
      {/* Skip button */}
      <div className="flex justify-end p-6 z-10">
        <button
          onClick={handleSkip}
          className="text-white/70 text-sm hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom section */}
      <div className="px-6 pb-8 z-10">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[...Array(totalSlides)].map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : index < currentSlide
                  ? 'w-2 bg-white/60'
                  : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-white/95 transition-colors"
        >
          {isLastSlide ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Logo at bottom */}
      <div className="flex items-center justify-center pb-6">
        <Logo size={28} color="#ffffff" />
        <span className="ml-2 text-xl font-bold text-white">
          Senti
        </span>
      </div>
    </div>
  );
}
