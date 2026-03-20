/**
 * PayFlow
 *
 * Bottom sheet over frozen WalletPage.
 *
 * Card design matches the final onboarding CTA screen exactly.
 *
 * Interactions:
 *   • Tap card  → reveal / mask card number on the card face itself
 *   • "View Card Details" → expand controls section below
 *
 * Expanded controls:
 *   • Copy card number
 *   • Freeze / unfreeze toggle
 *   • Spending limit + progress
 *   • Add to Apple / Google Wallet
 */
import { useState } from 'react';
import { X, Copy, Check, Snowflake, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WalletPage from '../../../pages/wallet';
import { useAppStore } from '../../../store';

// ── Card background assets (same as onboarding CTA screen) ───────────
const ctaImgSenti = 'https://www.figma.com/api/mcp/asset/e0794bba-27e6-456f-920e-210f5bf55aae';
const ctaCardVec0 = 'https://www.figma.com/api/mcp/asset/f6a56cd7-14aa-4738-8ba9-747bd6c2eaf6';
const ctaCardVec1 = 'https://www.figma.com/api/mcp/asset/c4f574f2-8911-4de9-bcc1-5763c84bdfe6';
const ctaCardVec2 = 'https://www.figma.com/api/mcp/asset/b6fdcefc-cdbf-44bb-b496-b4b9e4e29c98';

const CARD_NUMBER_GROUPS = ['4921', '8374', '5610', '8492'];
const SPENDING_LIMIT     = 1000;
const SPENDING_USED      = 350;

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PayFlowProps {
  onExit: () => void;
}

export default function PayFlow({ onExit }: PayFlowProps) {
  const [cardRevealed, setCardRevealed] = useState(false);
  const [cardExpanded, setCardExpanded] = useState(false);
  const [cardFrozen,   setCardFrozen]   = useState(false);
  const [copied,       setCopied]       = useState(false);
  const balances     = useAppStore(s => s.balances);
  const userProfile  = useAppStore(s => s.userProfile);

  const cardholderName = (userProfile?.username ?? 'SENTI USER').toUpperCase();
  const spendingPct    = Math.min(SPENDING_USED / SPENDING_LIMIT, 1);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER_GROUPS.join(''));
    } catch { /* API unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative h-full">

      {/* ── Frozen WalletPage background ───────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <WalletPage />
        </div>
      </div>

      {/* ── Sheet overlay ──────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-end">

        {/* Backdrop — tap to dismiss */}
        <div
          className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]"
          onClick={onExit}
        />

        {/* ── Bottom sheet ───────────────────────────────────────── */}
        <div
          className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
          style={{ maxHeight: '92vh' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center" style={{ marginTop: 16 }}>
            <div className="rounded-[9999px]" style={{ width: 40, height: 4, background: '#8ac7ff' }} />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5" style={{ marginTop: 24 }}>
            <div className="flex flex-col gap-[4px]">
              <p className="font-bold text-[24px] leading-[32px] tracking-[-0.6px] text-white">
                Senti Pay
              </p>
              <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
                {cardExpanded ? 'Card details & controls.' : 'Tap card to reveal your details.'}
              </p>
            </div>
            <button
              onClick={onExit}
              className="bg-[#8ac7ff] rounded-full size-[40px] flex items-center justify-center shrink-0"
            >
              <X size={16} className="text-[#0a142f]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto scrollbar-hide px-5 pb-[44px]" style={{ marginTop: 24 }}>

            {/* ─────────────────────────────────────────────────────── */}
            {/*  CARD                                                   */}
            {/* ─────────────────────────────────────────────────────── */}
            <button
              onClick={() => setCardRevealed(v => !v)}
              className="w-full relative rounded-[28px] overflow-hidden text-left"
              style={{
                height: 240,
                background: cardFrozen
                  ? 'linear-gradient(147.09deg, rgb(18,36,60) 0%, rgb(12,26,48) 100%)'
                  : 'linear-gradient(147.09deg, rgb(30,58,95) 0%, rgb(21,45,71) 100%)',
                boxShadow: '0px 20px 50px rgba(30,58,95,0.55)',
                opacity: cardFrozen ? 0.72 : 1,
                transition: 'background 0.4s ease, opacity 0.4s ease',
              }}
            >
              {/* ── Decorative vector patterns ─── */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute" style={{ top: '16.88%', right: '-2.94%', bottom: '60.61%', left: '-14.71%' }}>
                  <img alt="" className="absolute block max-w-none w-full h-full" src={ctaCardVec0} />
                </div>
                <div className="absolute" style={{ top: '25.21%', right: '-11.76%', bottom: '54.55%', left: '-14.71%' }}>
                  <img alt="" className="absolute block max-w-none w-full h-full" src={ctaCardVec1} />
                </div>
                <div className="absolute" style={{ top: 0, right: 0, bottom: '41.82%', left: 0 }}>
                  <img alt="" className="absolute block max-w-none w-full h-full" src={ctaCardVec2} />
                </div>
              </div>

              {/* Radial glow inside card */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: 140, top: -60, width: 160, height: 160,
                  background: 'radial-gradient(circle at 48px 48px, rgba(255,255,255,0.18) 0%, transparent 60%)',
                }}
              />

              {/* Frozen overlay */}
              {cardFrozen && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: 'rgba(10,20,47,0.5)' }}
                >
                  <div className="flex flex-col items-center gap-[6px]">
                    <Snowflake size={30} className="text-[#8ac7ff]" strokeWidth={1.5} />
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#8ac7ff' }}>
                      Card frozen
                    </p>
                  </div>
                </div>
              )}

              {/* ── Top row: label + balance + logo ── */}
              <div
                className="absolute flex items-start justify-between"
                style={{ left: 28, top: 28, right: 28 }}
              >
                <div className="flex flex-col" style={{ gap: 4 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '19.5px', color: 'rgba(255,255,255,0.6)' }}>
                    Senti Premium
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 24, lineHeight: '32px', color: '#fff' }}>
                    ${fmtUsd(balances.USDC)}
                  </p>
                </div>
                {/* Logo square */}
                <div
                  className="flex items-center justify-center rounded-[18px] shrink-0"
                  style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.18)', padding: 6 }}
                >
                  <img alt="Senti" src={ctaImgSenti} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                </div>
              </div>

              {/* ── Card number row ── */}
              <div
                className="absolute flex items-center justify-between"
                style={{ left: 28, right: 28, top: 128 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {cardRevealed ? (
                    // Revealed: full card number
                    <motion.div
                      key="revealed"
                      className="flex items-center"
                      style={{ gap: 10 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {CARD_NUMBER_GROUPS.map((g, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: 15,
                            color: '#fff',
                            letterSpacing: 1.5,
                          }}
                        >
                          {g}
                        </p>
                      ))}
                    </motion.div>
                  ) : (
                    // Masked: dots + last 4
                    <motion.div
                      key="masked"
                      className="flex items-center"
                      style={{ gap: 14 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {[0, 1, 2].map(g => (
                        <div key={g} className="flex items-center" style={{ gap: 6 }}>
                          {[0, 1, 2, 3].map(d => (
                            <div
                              key={d}
                              className="rounded-full shrink-0"
                              style={{ width: 10, height: 10, background: 'rgba(255,255,255,0.5)' }}
                            />
                          ))}
                        </div>
                      ))}
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#fff', letterSpacing: 2 }}>
                        8492
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Eye icon — always visible, signals the card is interactive */}
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 32, height: 32,
                    background: cardRevealed ? 'rgba(138,199,255,0.18)' : 'rgba(255,255,255,0.10)',
                    transition: 'background 0.25s ease',
                  }}
                >
                  {cardRevealed
                    ? <EyeOff size={15} style={{ color: '#8ac7ff' }} strokeWidth={2} />
                    : <Eye    size={15} style={{ color: 'rgba(255,255,255,0.6)' }} strokeWidth={2} />
                  }
                </div>
              </div>

              {/* ── Tap hint — shown below number when masked ── */}
              <div
                className="absolute"
                style={{ left: 28, top: 156, right: 28 }}
              >
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 10,
                  color: cardRevealed ? 'rgba(138,199,255,0.55)' : 'rgba(255,255,255,0.30)',
                  transition: 'color 0.25s ease',
                }}>
                  {cardRevealed ? 'Tap to mask' : 'Tap to reveal'}
                </p>
              </div>

              {/* ── Cardholder name + bottom row ── */}
              <div
                className="absolute flex items-end justify-between"
                style={{ left: 28, right: 28, bottom: 20 }}
              >
                <div className="flex flex-col" style={{ gap: 2 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fff', letterSpacing: 0.5 }}>
                    {cardholderName}
                  </p>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                      Premium Account
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                      12/28
                    </p>
                  </div>
                </div>
                {/* Mastercard circles */}
                <div className="relative shrink-0" style={{ width: 42, height: 26 }}>
                  <div className="absolute rounded-full" style={{ width: 26, height: 26, left: 0,  top: 0, background: '#eb001b', opacity: 0.9 }} />
                  <div className="absolute rounded-full" style={{ width: 26, height: 26, left: 16, top: 0, background: '#f79e1b', opacity: 0.9 }} />
                </div>
              </div>
            </button>

            {/* ─────────────────────────────────────────────────────── */}
            {/*  DEFAULT ACTIONS (Apple Pay, Google Pay, View Details)  */}
            {/* ─────────────────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
              {!cardExpanded && (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="flex flex-col" style={{ marginTop: 20, gap: 10 }}>

                    {/* Apple Pay */}
                    <button
                      className="w-full flex items-center justify-center rounded-[16px]"
                      style={{ height: 56, background: '#000', gap: 8 }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16, color: '#fff' }}>
                        Pay
                      </span>
                    </button>

                    {/* Google Pay */}
                    <button
                      className="w-full flex items-center justify-center rounded-[16px]"
                      style={{ height: 56, background: '#fff', gap: 8, border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16, color: '#3c4043' }}>
                        Pay
                      </span>
                    </button>

                    {/* View Card Details */}
                    <button
                      onClick={() => { setCardExpanded(true); setCardRevealed(true); }}
                      className="w-full flex items-center justify-center"
                      style={{ height: 44 }}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#8ac7ff' }}>
                        View Card Details
                      </span>
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─────────────────────────────────────────────────────── */}
            {/*  EXPANDED CONTROLS                                      */}
            {/* ─────────────────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
              {cardExpanded && (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="flex flex-col" style={{ marginTop: 20, gap: 10 }}>

                    {/* Card number + copy */}
                    <div
                      className="flex items-center justify-between rounded-[16px] px-4"
                      style={{
                        height: 56,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {cardRevealed ? (
                          <motion.p
                            key="full"
                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#fff', letterSpacing: 2 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            {CARD_NUMBER_GROUPS.join('  ')}
                          </motion.p>
                        ) : (
                          <motion.p
                            key="masked"
                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            ••••  ••••  ••••  8492
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <div className="flex items-center shrink-0" style={{ gap: 8 }}>
                        {/* Eye toggle */}
                        <button
                          onClick={() => setCardRevealed(v => !v)}
                          className="flex items-center justify-center"
                          style={{ width: 32, height: 32 }}
                        >
                          {cardRevealed
                            ? <EyeOff size={16} style={{ color: '#8ac7ff' }} strokeWidth={2} />
                            : <Eye    size={16} style={{ color: '#8ac7ff' }} strokeWidth={2} />
                          }
                        </button>
                        {/* Copy */}
                        <button
                          onClick={handleCopy}
                          className="flex items-center justify-center rounded-[8px]"
                          style={{
                            width: 32, height: 32,
                            background: copied ? 'rgba(50,252,101,0.12)' : 'rgba(138,199,255,0.12)',
                            transition: 'background 0.25s ease',
                          }}
                        >
                          {copied
                            ? <Check size={14} style={{ color: '#32fc65' }} strokeWidth={2.5} />
                            : <Copy  size={14} style={{ color: '#8ac7ff' }} strokeWidth={2} />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Freeze / Unfreeze */}
                    <button
                      onClick={() => setCardFrozen(v => !v)}
                      className="w-full flex items-center justify-between rounded-[16px] px-4"
                      style={{
                        height: 56,
                        background: cardFrozen ? 'rgba(138,199,255,0.08)' : 'rgba(255,255,255,0.05)',
                        border: cardFrozen ? '1px solid rgba(138,199,255,0.22)' : '1px solid rgba(255,255,255,0.07)',
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 10 }}>
                        <Snowflake
                          size={18}
                          strokeWidth={1.5}
                          style={{
                            color: cardFrozen ? '#8ac7ff' : 'rgba(255,255,255,0.38)',
                            transition: 'color 0.3s ease',
                          }}
                        />
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 14,
                          color: cardFrozen ? '#8ac7ff' : 'rgba(255,255,255,0.85)',
                          transition: 'color 0.3s ease',
                        }}>
                          {cardFrozen ? 'Unfreeze card' : 'Freeze card'}
                        </span>
                      </div>
                      {/* Toggle pill */}
                      <div
                        className="relative rounded-full shrink-0"
                        style={{
                          width: 40, height: 22,
                          background: cardFrozen ? '#007bff' : 'rgba(255,255,255,0.15)',
                          transition: 'background 0.3s ease',
                        }}
                      >
                        <div
                          className="absolute rounded-full"
                          style={{
                            width: 16, height: 16, top: 3,
                            left: cardFrozen ? 21 : 3,
                            background: '#fff',
                            transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                        />
                      </div>
                    </button>

                    {/* Spending Limit */}
                    <div
                      className="rounded-[16px] px-4 py-4 flex flex-col"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        gap: 12,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>
                          Spending Limit
                        </span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fff' }}>
                          ${fmtUsd(SPENDING_LIMIT)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex flex-col" style={{ gap: 6 }}>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(255,255,255,0.10)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #007bff 0%, #5a9de8 100%)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${spendingPct * 100}%` }}
                            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, color: '#8ac7ff' }}>
                            ${fmtUsd(SPENDING_USED)} used today
                          </span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
                            ${fmtUsd(SPENDING_LIMIT - SPENDING_USED)} left
                          </span>
                        </div>
                      </div>
                      {/* Verify CTA */}
                      <div
                        className="rounded-[10px] px-3 py-[9px] flex items-center justify-between"
                        style={{ background: 'rgba(0,123,255,0.09)', border: '1px solid rgba(0,123,255,0.16)' }}
                      >
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                          Verify your identity to increase your limit
                        </span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 12, color: '#8ac7ff', whiteSpace: 'nowrap', marginLeft: 8 }}>
                          Verify →
                        </span>
                      </div>
                    </div>

                    {/* Add to Wallet */}
                    <div className="flex flex-col" style={{ gap: 8 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        Add to Wallet
                      </p>
                      {/* Apple Wallet */}
                      <button
                        className="w-full flex items-center justify-center rounded-[16px]"
                        style={{ height: 52, background: '#000', gap: 8 }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff' }}>
                          Add to Apple Wallet
                        </span>
                      </button>
                      {/* Google Pay */}
                      <button
                        className="w-full flex items-center justify-center rounded-[16px]"
                        style={{ height: 52, background: '#fff', gap: 8, border: '1px solid rgba(0,0,0,0.08)' }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#3c4043' }}>
                          Add to Google Pay
                        </span>
                      </button>
                    </div>

                    {/* Hide Card Details */}
                    <button
                      onClick={() => { setCardExpanded(false); setCardRevealed(false); }}
                      className="w-full flex items-center justify-center"
                      style={{ height: 44 }}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#8ac7ff' }}>
                        Hide Card Details
                      </span>
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
