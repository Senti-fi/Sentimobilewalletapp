import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { ChevronRight, Send, TrendingUp, Zap, CreditCard, Check, Wifi, Battery, Signal } from 'lucide-react';

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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-white/20 rounded-full blur-xl" />
          </div>
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
            { text: 'Spend Anywhere', icon: CreditCard },
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
      <svg viewBox="0 0 36 36" className="w-full h-full">
        <path d="M6 20c0-8 4-14 12-14s12 6 12 14c0 2-1 4-2 5-1-3-4-5-10-5s-9 2-10 5c-1-1-2-3-2-5z" fill="#4C1D95"/>
        <circle cx="18" cy="19" r="9" fill="#FCD5B8"/>
        <circle cx="15" cy="18" r="1.2" fill="#374151"/>
        <circle cx="21" cy="18" r="1.2" fill="#374151"/>
        <path d="M15 22c1.5 1.5 4.5 1.5 6 0" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M10 14c2-4 6-5 8-5s6 1 8 5c-2-2-5-3-8-3s-6 1-8 3z" fill="#4C1D95"/>
      </svg>
    </div>
  );
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex gap-1 px-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Slide 2: Lucy AI with phone mockup and typing animation
function LucySlide() {
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState('');

  const lucyResponse = "Done! I've created your \"Japan Trip\" goal. I'll auto-save $208/week. At 12% APY, you'll have $5,340 by August.";

  useEffect(() => {
    // Phase 0: Show user message (0-1s)
    // Phase 1: Show typing indicator (1-2s)
    // Phase 2: Type out Lucy's response (2s+)

    const timer1 = setTimeout(() => setPhase(1), 800);
    const timer2 = setTimeout(() => setPhase(2), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    if (phase === 2) {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index <= lucyResponse.length) {
          setTypedText(lucyResponse.slice(0, index));
          index++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setPhase(3), 300);
        }
      }, 25);
      return () => clearInterval(typeInterval);
    }
  }, [phase]);

  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-2">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
          Meet Lucy
        </span>
        <h2 className="text-white text-xl font-semibold mt-3 leading-snug">
          Your AI financial advisor
        </h2>
      </motion.div>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative flex-1 w-full max-w-[280px]"
        style={{ perspective: '1000px' }}
      >
        {/* Phone frame with 3D effect */}
        <div className="relative h-full bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-black/50 border border-gray-700">
          {/* Inner screen */}
          <div className="h-full bg-gray-100 rounded-[2rem] overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="bg-white px-5 py-2 flex items-center justify-between text-[10px] text-gray-600">
              <span className="font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-4 h-3" />
              </div>
            </div>

            {/* Chat header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 flex items-center gap-2">
              <LucyAvatar size={32} />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Lucy</p>
                <p className="text-white/70 text-[10px]">AI Financial Advisor</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            {/* Chat area */}
            <div className="flex-1 p-3 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
              {/* User message */}
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end"
              >
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3 py-2 max-w-[85%] shadow-md">
                  <p className="text-xs leading-relaxed">I want to save $5,000 for my trip to Japan in 6 months</p>
                </div>
              </motion.div>

              {/* Lucy response area */}
              <AnimatePresence mode="wait">
                {phase >= 1 && phase < 2 && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2 items-end"
                  >
                    <LucyAvatar size={24} />
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}

                {phase >= 2 && (
                  <motion.div
                    key="response"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <LucyAvatar size={24} />
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-3 py-2 max-w-[85%] shadow-sm">
                      <p className="text-gray-800 text-xs leading-relaxed">
                        {typedText}
                        {phase === 2 && <span className="inline-block w-0.5 h-3 bg-violet-600 ml-0.5 animate-pulse" />}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <AnimatePresence>
                {phase >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 pl-8"
                  >
                    <span className="px-2.5 py-1 bg-violet-600 text-white text-[10px] rounded-full font-medium shadow-sm">
                      View plan
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] rounded-full shadow-sm">
                      Adjust
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input bar */}
            <div className="bg-white border-t border-gray-200 px-3 py-2">
              <div className="bg-gray-100 rounded-full px-3 py-1.5 text-[10px] text-gray-400">
                Ask Lucy anything...
              </div>
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl" />
        </div>
      </motion.div>
    </div>
  );
}

// Slide 3: Grow Money with counter ticker
function GrowSlide() {
  const [balance, setBalance] = useState(4827.50);
  const [earnings, setEarnings] = useState(0.00);

  useEffect(() => {
    // Simulate real-time earnings
    const interval = setInterval(() => {
      const increment = Math.random() * 0.03 + 0.01; // Random increment between $0.01 and $0.04
      setBalance(prev => prev + increment);
      setEarnings(prev => prev + increment);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-2">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
          Grow Your Money
        </span>
        <h2 className="text-white text-xl font-semibold mt-3 leading-snug">
          Watch your wealth grow
        </h2>
      </motion.div>

      {/* Earnings visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-[300px] flex-1 flex flex-col"
      >
        {/* Main balance card */}
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl p-5 shadow-2xl shadow-green-900/30 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-40 h-40 border border-white rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -left-10 w-32 h-32 border border-white rounded-full"
            />
          </div>

          <p className="text-white/80 text-xs mb-1 relative z-10">Total Savings</p>

          {/* Animated balance counter */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <span className="text-4xl font-bold text-white font-mono tracking-tight">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </motion.div>

          {/* Live earnings indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-3 relative z-10"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-yellow-300 rounded-full"
              />
              <span className="text-white text-[10px] font-medium">LIVE</span>
            </div>
            <span className="text-green-200 text-xs font-semibold">
              +${earnings.toFixed(2)} earned now
            </span>
          </motion.div>
        </div>

        {/* APY Vaults */}
        <div className="mt-4 space-y-2">
          {[
            { name: 'High-Yield Vault', apy: '15%', amount: 2500, color: 'from-violet-500 to-purple-600' },
            { name: 'Flex Savings', apy: '8.5%', amount: 1327, color: 'from-blue-500 to-cyan-600' },
            { name: 'Emergency Fund', apy: '6%', amount: 1000, color: 'from-orange-400 to-amber-500' },
          ].map((vault, i) => (
            <motion.div
              key={vault.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${vault.color} rounded-lg flex items-center justify-center`}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{vault.name}</p>
                  <p className="text-green-300 text-[10px] font-semibold">{vault.apy} APY</p>
                </div>
              </div>
              <p className="text-white font-semibold text-sm">${vault.amount.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Slide 4: Pay Anyone with live transaction animation
function PaySlide() {
  const [step, setStep] = useState(0);
  // Steps: 0=initial, 1=typing, 2=amount, 3=sending, 4=complete

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2200),
      setTimeout(() => setStep(4), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-2">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
          Pay Anyone
        </span>
        <h2 className="text-white text-xl font-semibold mt-3 leading-snug">
          Send money in seconds
        </h2>
      </motion.div>

      {/* Transaction visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-[300px] flex-1"
      >
        {/* Chat-style payment interface */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              E
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Emma Wilson</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 1 ? 1 : 0 }}
                className="text-white/70 text-xs"
              >
                @emma.senti
              </motion.p>
            </div>
          </div>

          {/* Transaction area */}
          <div className="p-4 space-y-4 min-h-[200px]">
            {/* Amount display with typing animation */}
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: step >= 2 ? 1 : 0.8,
                  opacity: step >= 1 ? 1 : 0
                }}
                className="inline-block"
              >
                <span className="text-4xl font-bold text-gray-900">
                  $50
                  <motion.span
                    animate={{ opacity: step === 1 ? [1, 0] : 1 }}
                    transition={{ duration: 0.5, repeat: step === 1 ? Infinity : 0 }}
                  >
                    {step >= 2 ? '.00' : ''}
                  </motion.span>
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 2 ? 1 : 0 }}
                className="text-gray-500 text-xs mt-1"
              >
                For dinner last night
              </motion.p>
            </div>

            {/* Send button with animation */}
            <AnimatePresence mode="wait">
              {step < 3 && (
                <motion.button
                  key="send"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: step >= 2 ? 1 : 0.5, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Send Now
                </motion.button>
              )}

              {step === 3 && (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full py-3 bg-blue-100 text-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                  />
                  Sending...
                </motion.div>
              )}

              {step >= 4 && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </motion.div>
                  <div>
                    <p className="text-green-600 font-semibold">Payment Sent!</p>
                    <p className="text-gray-500 text-xs">Emma will receive it instantly</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flying money animation */}
            <AnimatePresence>
              {step === 3 && (
                <motion.div
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: 100, y: -50, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute left-1/2 -translate-x-1/2 text-2xl"
                >
                  💸
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent activity hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 4 ? 1 : 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className="text-white/60 text-xs">
            No fees. Instant transfers. Always.
          </p>
        </motion.div>
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
        return <GrowSlide />;
      case 3:
        return <PaySlide />;
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

      {/* Content */}
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

      {/* Bottom section */}
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
