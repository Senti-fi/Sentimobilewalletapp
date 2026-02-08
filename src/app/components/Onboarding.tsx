import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { ChevronRight, Wallet, Send, TrendingUp, Users, PiggyBank, ArrowRight, DollarSign, Shield, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

// Slide 1: Unique orbital/geometric hero
function WelcomeSlide() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
      {/* Animated orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer orbit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute w-72 h-72"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border border-white/10"
          >
            {/* Orbiting dot 1 */}
            <motion.div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
            />
          </motion.div>
        </motion.div>

        {/* Middle orbit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute w-52 h-52"
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border border-white/15"
          >
            {/* Orbiting dot 2 */}
            <motion.div
              className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50"
            />
          </motion.div>
        </motion.div>

        {/* Inner orbit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute w-36 h-36"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border border-white/20"
          >
            {/* Orbiting dot 3 */}
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
            />
          </motion.div>
        </motion.div>

        {/* Floating gradient blobs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[5%] w-32 h-32 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-2xl"
        />
      </div>

      {/* Central content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10"
      >
        {/* Central glowing logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 15 }}
          className="mb-8 flex justify-center relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-white/20 rounded-full blur-xl" />
          </div>
          {/* Logo container */}
          <div className="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/20">
            <Logo size={48} color="#2563eb" />
          </div>
        </motion.div>

        {/* Stacked typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-1 mb-5"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="text-white/60 text-sm tracking-widest uppercase"
          >
            Introducing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-5xl font-bold text-white tracking-tight"
          >
            Senti
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto rounded-full"
          />
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-wrap justify-center gap-2 max-w-[280px] mx-auto"
        >
          {[
            { text: 'AI-Powered', icon: Zap },
            { text: 'Instant Payments', icon: Send },
            { text: 'Grow Wealth', icon: TrendingUp },
          ].map((item, i) => (
            <motion.span
              key={item.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium border border-white/10"
            >
              <item.icon className="w-3 h-3" />
              {item.text}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Lucy Avatar Component
function LucyAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Simple female avatar illustration */}
      <svg viewBox="0 0 36 36" className="w-full h-full">
        {/* Hair */}
        <path d="M6 20c0-8 4-14 12-14s12 6 12 14c0 2-1 4-2 5-1-3-4-5-10-5s-9 2-10 5c-1-1-2-3-2-5z" fill="#4C1D95"/>
        {/* Face */}
        <circle cx="18" cy="19" r="9" fill="#FCD5B8"/>
        {/* Eyes */}
        <circle cx="15" cy="18" r="1.2" fill="#374151"/>
        <circle cx="21" cy="18" r="1.2" fill="#374151"/>
        {/* Smile */}
        <path d="M15 22c1.5 1.5 4.5 1.5 6 0" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round"/>
        {/* Hair bangs */}
        <path d="M10 14c2-4 6-5 8-5s6 1 8 5c-2-2-5-3-8-3s-6 1-8 3z" fill="#4C1D95"/>
      </svg>
    </div>
  );
}

// Slide 2: Meet Lucy AI - Fixed layout, high-value messaging
function LucySlide() {
  return (
    <div className="flex-1 flex flex-col px-5 pt-4">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-3"
      >
        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
          Meet Lucy
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-white text-xl font-semibold text-center mb-4 leading-snug"
      >
        Your AI financial advisor.
        <br />
        <span className="text-cyan-300">Always on. Always smart.</span>
      </motion.h2>

      {/* Compact Chat Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col max-h-[340px]"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center gap-2">
            <LucyAvatar size={28} />
            <span className="text-white font-medium text-sm">Lucy</span>
            <span className="ml-auto w-2 h-2 bg-green-400 rounded-full"></span>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-3 space-y-2.5 bg-gray-50 overflow-hidden">
            {/* User message - RIGHT side, comes FIRST */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%]">
                <p className="text-sm">I want to save $5,000 for my trip to Japan in 6 months</p>
              </div>
            </motion.div>

            {/* Lucy message - LEFT side, RESPONDS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2"
            >
              <LucyAvatar size={24} />
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Done! I've created your "Japan Trip" goal. Based on your income patterns, I'll auto-save $208/week. At 12% APY in locked savings, you'll actually have <span className="font-semibold text-green-600">$5,340</span> by then.
                </p>
              </div>
            </motion.div>

            {/* Quick action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-2 pl-8"
            >
              <span className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-full font-medium">Show breakdown</span>
              <span className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-full">Adjust amount</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 3: Social Payments - Compact
function SocialSlide() {
  return (
    <div className="flex-1 flex flex-col px-5 pt-4">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-3"
      >
        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
          Pay Anyone
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-white text-xl font-semibold text-center mb-4 leading-snug"
      >
        Send money instantly.
        <br />
        <span className="text-cyan-300">Just type @username.</span>
      </motion.h2>

      {/* Compact Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col max-h-[340px]"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-4 flex-1">
          <p className="text-gray-500 text-xs mb-2">Send to</p>
          <div className="bg-gray-100 rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 text-sm">@emma.senti</span>
          </div>

          {/* Contact cards */}
          <div className="space-y-2 mb-3">
            {[
              { name: 'Emma Wilson', handle: '@emma.senti', color: 'from-pink-400 to-rose-500', initials: 'E' },
              { name: 'David Chen', handle: '@david.senti', color: 'from-blue-400 to-cyan-500', initials: 'D' },
            ].map((contact, i) => (
              <motion.div
                key={contact.handle}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-50"
              >
                <div className={`w-9 h-9 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                  {contact.initials}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">{contact.name}</p>
                  <p className="text-gray-500 text-xs">{contact.handle}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Amount */}
          <div className="text-center py-3 border-t border-gray-100">
            <p className="text-3xl font-bold text-gray-900">$50.00</p>
          </div>

          <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
            <Send className="w-4 h-4" />
            Send Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 4: Grow Money - Compact
function GrowSlide() {
  return (
    <div className="flex-1 flex flex-col px-5 pt-4">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-3"
      >
        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
          Grow Your Money
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-white text-xl font-semibold text-center mb-4 leading-snug"
      >
        Earn up to 15% APY.
        <br />
        <span className="text-cyan-300">Zero complexity.</span>
      </motion.h2>

      {/* Compact Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col max-h-[340px]"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1">
          {/* Balance header */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 text-white">
            <p className="text-white/80 text-xs mb-0.5">Total Savings</p>
            <p className="text-2xl font-bold">$4,827.50</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-300" />
              <span className="text-green-300 text-xs font-medium">+12.4% this month</span>
            </div>
          </div>

          {/* Vault cards */}
          <div className="p-3 space-y-2">
            {[
              { name: 'USDC Vault', apy: '8.5%', amount: '$2,500', color: 'bg-blue-500' },
              { name: 'Locked Savings', apy: '15%', amount: '$1,200', color: 'bg-purple-500' },
              { name: 'Emergency Fund', apy: '6%', amount: '$1,127', color: 'bg-green-500' },
            ].map((vault, i) => (
              <motion.div
                key={vault.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 ${vault.color} rounded-lg flex items-center justify-center`}>
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{vault.name}</p>
                    <p className="text-green-600 text-xs font-medium">{vault.apy} APY</p>
                  </div>
                </div>
                <p className="text-gray-900 font-semibold text-sm">{vault.amount}</p>
              </motion.div>
            ))}
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
      <div className="flex justify-end px-5 pt-4 pb-2 z-10 flex-shrink-0">
        <button
          onClick={handleSkip}
          className="text-white/70 text-sm hover:text-white transition-colors px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Content - flex-1 but with constraints */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="h-full flex flex-col"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section - fixed at bottom */}
      <div className="px-5 pt-4 pb-4 z-10 flex-shrink-0 bg-gradient-to-t from-blue-700/50 to-transparent">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[...Array(totalSlides)].map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 bg-white'
                  : index < currentSlide
                  ? 'w-1.5 bg-white/60'
                  : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full py-3.5 bg-white text-blue-600 rounded-2xl font-semibold text-base shadow-lg flex items-center justify-center gap-2"
        >
          {isLastSlide ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {/* Logo at bottom */}
        <div className="flex items-center justify-center mt-4">
          <Logo size={22} color="#ffffff" />
          <span className="ml-1.5 text-base font-bold text-white">
            Senti
          </span>
        </div>
      </div>
    </div>
  );
}
