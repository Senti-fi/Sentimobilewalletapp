/**
 * OnboardingPage
 *
 * Figma frames: 2095:341 (splash) → 2101:358 / 2103:406 / 2112:360 (slides)
 *               → 2114:475 (cta) → 2118:692 (username)
 *
 * Flow:
 *   Splash → 3 feature slides (Spend / Save / Invest) → CTA → Username → /home
 *
 * Auth:
 *   The CTA screen presents Google sign-in via Supabase OAuth.
 *   Apple is shown as disabled (coming soon).
 *   After the OAuth redirect the loading step checks for an active session:
 *     - Returning user with username → AuthListener restores profile,
 *       RequireGuest redirects to /home before this page is reached.
 *     - New user (no username) → jump straight to the username step.
 *   Username availability is checked against the real users table (case-insensitive).
 *   On completion the username is normalised to lowercase and written to the DB
 *   before the local profile is set, so a DB constraint violation (race condition
 *   on uniqueness) is surfaced to the user rather than silently accepted.
 *
 * Completion is tracked via localStorage key 'senti-onboarding-done'.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import type { UserProfile } from '../../store';
import { track, identifyUser } from '../../lib/analytics';
import { supabase } from '../../lib/supabase';
import { saveUserProfile } from '../../lib/sync';

export const ONBOARDING_KEY = 'senti-onboarding-done';

// ── Username uniqueness ─────────────────────────────────────────────
// Reserved names are checked instantly; the real DB is checked for all others.

const RESERVED_USERNAMES = new Set([
  'senti', 'admin', 'wallet', 'user', 'finance', 'help', 'support',
  'pay', 'invest', 'save', 'magnifico', 'test', 'demo', 'money', 'bank',
  'root', 'api', 'null', 'undefined', 'system', 'official',
]);

/**
 * Returns true when the username is available.
 * Checks reserved names first (no network), then the real users table.
 * The DB index `unique_username` on LOWER(username) makes this O(log n).
 */
async function checkUsernameAvailable(username: string): Promise<boolean> {
  const lower = username.trim().toLowerCase();

  if (RESERVED_USERNAMES.has(lower)) return false;
  if (!supabase) return true; // no DB configured — reserved-name check is the safety net

  const { data } = await supabase
    .from('users')
    .select('username')
    .ilike('username', lower)  // ILIKE with no wildcards = exact case-insensitive match
    .maybeSingle();

  return data === null; // null → no existing row → available
}

// ── Senti "S" logo — Figma 2101:362 (Screen 2 illustration) ────────
const imgSentiLogo = 'https://www.figma.com/api/mcp/asset/741a58c0-5518-40ba-b57f-56b7bc6a8e6f';

// ── Slide data ─────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'spend',
    bg: 'split' as const,
    title: 'Spend without limits',
    subtitle: 'Pay, send, and move money\ninstantly',
  },
  {
    id: 'save',
    bg: 'light-blue' as const,
    title: 'Save with intention',
    subtitle: 'Flexible savings or fixed plans —\nyou choose',
  },
  {
    id: 'invest',
    bg: 'grey' as const,
    title: 'Do more with your money',
    subtitle: 'Grow and manage your money\neffortlessly',
  },
];

// ── Animation preset ───────────────────────────────────────────────────

const variants = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -32 },
};
const transition = { duration: 0.26, ease: 'easeInOut' as const };

// ── Root ───────────────────────────────────────────────────────────────

type Step = 'loading' | 'splash' | 'slides' | 'cta' | 'username';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step,       setStep]       = useState<Step>('loading');
  const [slideIdx,   setSlideIdx]   = useState(0);
  const [username,   setUsername]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  const setUserProfile = useAppStore(s => s.setUserProfile);

  /**
   * On mount: check for an existing Supabase session (e.g. after an OAuth
   * redirect). Returning users with a username are handled by AuthListener
   * in App.tsx — they never reach this page. Reaching this branch means the
   * user authenticated but hasn't chosen a username yet.
   */
  useEffect(() => {
    track('onboarding_started');

    if (!supabase) {
      setStep('splash');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setStep(session ? 'username' : 'splash');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Persist the username and complete onboarding.
   *
   * Order of operations:
   *  1. Normalise username (trim + lowercase).
   *  2. Write to DB via saveUserProfile — check for errors (e.g. unique violation).
   *  3. Only on success: set local profile in the store and navigate.
   *
   * The store's setUserProfile also fires saveUserProfile internally (upsert,
   * idempotent) — the second write is a no-op and harmless.
   */
  async function complete() {
    if (!supabase) return;
    setSaveError(null);
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();

    const { error } = await saveUserProfile({
      id:           user.id,
      email:        user.email ?? '',
      authProvider: 'google',
      username:     normalizedUsername,
      createdAt:    user.created_at,
    });

    if (error) {
      setSaveError('Username already taken. Please choose another.');
      setSubmitting(false);
      return;
    }

    const profile: UserProfile = {
      id:           user.id,
      email:        user.email ?? '',
      authProvider: 'google',
      username:     normalizedUsername,
      createdAt:    user.created_at,
    };

    setUserProfile(profile);
    identifyUser(user.id, {
      email:        user.email ?? '',
      authProvider: 'google',
      username:     normalizedUsername,
    });
    track('onboarding_completed', { authProvider: 'google', hasUsername: true });
    localStorage.setItem(ONBOARDING_KEY, '1');
    navigate('/home', { replace: true });
  }

  function nextSlide() {
    if (slideIdx < SLIDES.length - 1) {
      setSlideIdx(i => i + 1);
    } else {
      setStep('cta');
    }
  }

  return (
    <div className="relative h-full bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'loading' && (
          <motion.div
            key="loading"
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#0a1628' }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <Loader2 size={32} className="animate-spin" style={{ color: '#5a9de8' }} />
          </motion.div>
        )}
        {step === 'splash' && (
          <SplashScreen
            key="splash"
            onNext={() => { setSlideIdx(0); setStep('slides'); }}
          />
        )}
        {step === 'slides' && (
          <SlideScreen
            key={`slide-${slideIdx}`}
            slide={SLIDES[slideIdx]}
            slideIdx={slideIdx}
            total={SLIDES.length}
            onNext={nextSlide}
            onSkip={() => setStep('cta')}
          />
        )}
        {step === 'cta' && (
          <CtaScreen key="cta" />
        )}
        {step === 'username' && (
          <UsernameScreen
            key="username"
            value={username}
            onChange={(v) => { setUsername(v); setSaveError(null); }}
            onContinue={complete}
            submitting={submitting}
            saveError={saveError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Screen 1: Splash ───────────────────────────────────────────────────

function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col select-none cursor-pointer"
      style={{
        background:
          'linear-gradient(135deg, #0a1628 0%, #0b1b2f 30%, #0d2248 65%, #0a1628 100%)',
      }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      onClick={onNext}
    >
      {/* Glow — bottom left */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500, height: 500, left: -29, top: 523,
          background:
            'radial-gradient(circle, rgba(30,144,255,0.4) 0%, rgba(0,191,255,0.2) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Glow — top left */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 350, height: 350, left: -39, top: -85,
          background:
            'radial-gradient(circle, rgba(77,208,225,0.3) 0%, rgba(0,191,255,0.15) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Decorative curved arc — center right */}
      <div
        className="absolute pointer-events-none"
        style={{ right: 0, top: '38%', width: 200, height: 300, opacity: 0.35 }}
      >
        <svg viewBox="0 0 200 300" fill="none" width="200" height="300">
          <path
            d="M160 20 C200 20 200 80 140 100 C80 120 0 140 0 200 C0 260 80 280 120 280"
            stroke="rgba(0,191,255,0.9)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      {/* Rotated square outline — bottom left */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 33, top: 569, width: 64, height: 64,
          border: '1.2px solid rgba(0,191,255,0.3)',
          borderRadius: 10,
          transform: 'rotate(12deg)',
        }}
      />
      {/* Decorative dots */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{ width: 12, height: 12, left: 322, top: 170, background: 'rgba(77,208,225,0.5)' }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{ width: 8, height: 8, left: 287, top: 239, background: 'rgba(30,144,255,0.4)' }}
      />

      {/* Heading */}
      <div className="px-10 pt-24 flex flex-col gap-6 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            style={{
              fontFamily: 'Urbanist, sans-serif',
              fontWeight: 700,
              fontSize: 60,
              lineHeight: '66px',
              letterSpacing: -1.5,
              color: '#fff',
            }}
          >
            Welcome to
          </p>
          <p
            style={{
              fontFamily: 'Urbanist, sans-serif',
              fontWeight: 700,
              fontSize: 60,
              lineHeight: '66px',
              letterSpacing: -1.5,
              color: '#fff',
            }}
          >
            Senti.
          </p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '29px',
            color: '#94a3b8',
            maxWidth: 265,
          }}
        >
          A better way to spend, save, and invest.
        </motion.p>
      </div>

      {/* Tap hint */}
      <motion.div
        className="flex justify-center pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.85, ease: 'easeOut' }}
      >
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            color: 'rgba(148,163,184,0.5)',
          }}
        >
          Tap anywhere to continue
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Screen 4 explosion fragment data ───────────────────────────────────
const EXPLOSION_CX = 170;
const EXPLOSION_CY = 180;
const FRAGMENTS = [
  { cx: 72.5,  cy: 62.5,  size: 65, r: 16, rot: -15, delay: 0.45,
    g: 'linear-gradient(135deg,#7ab8f5 0%,#5a9de8 100%)',
    s: '0 8px 20px rgba(90,157,232,0.3)' },
  { cx: 270,   cy: 85,    size: 70, r: 14, rot:  20, delay: 0.50,
    g: 'linear-gradient(135deg,#a5cef7 0%,#7ab8f5 100%)',
    s: '0 8px 20px rgba(122,184,245,0.25)' },
  { cx: 45,    cy: 180,   size: 60, r: 15, rot:   8, delay: 0.47,
    g: 'linear-gradient(135deg,#5a9de8 0%,#3b7dd8 100%)',
    s: '0 8px 20px rgba(59,125,216,0.28)' },
  { cx: 282.5, cy: 197.5, size: 75, r: 18, rot: -12, delay: 0.52,
    g: 'linear-gradient(135deg,#7ab8f5 0%,#5a9de8 100%)',
    s: '0 10px 24px rgba(90,157,232,0.3)' },
  { cx: 87.5,  cy: 292.5, size: 55, r: 13, rot:  25, delay: 0.48,
    g: 'linear-gradient(135deg,#c8d1da 0%,#a5cef7 100%)',
    s: '0 6px 16px rgba(165,206,247,0.2)' },
  { cx: 256,   cy: 296,   size: 68, r: 16, rot: -18, delay: 0.53,
    g: 'linear-gradient(135deg,#a5cef7 0%,#7ab8f5 100%)',
    s: '0 8px 20px rgba(122,184,245,0.25)' },
  { cx: 142,   cy: 92,    size: 24, r:  6, rot:  45, delay: 0.56,
    g: 'linear-gradient(135deg,#5a9de8 0%,#3b7dd8 100%)',
    s: '0 4px 12px rgba(59,125,216,0.25)' },
  { cx: 210,   cy: 250,   size: 20, r:  5, rot: -30, delay: 0.60,
    g: 'linear-gradient(135deg,#7ab8f5 0%,#5a9de8 100%)',
    s: '0 4px 10px rgba(90,157,232,0.2)' },
] as const;

// ── Screens 2–4: Feature slides ────────────────────────────────────────

type SlideBg = 'split' | 'light-blue' | 'grey';

interface SlideData {
  id: string;
  bg: SlideBg;
  title: string;
  subtitle: string;
}

function SlideScreen({
  slide, slideIdx, total, onNext, onSkip,
}: {
  slide: SlideData;
  slideIdx: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const titleColor    = '#1e3a5f';
  const subtitleColor = slide.bg === 'grey' ? '#7b92b0' : '#64748b';
  const nextColor     = slide.bg === 'split' ? '#0a1628' : '#1e3a5f';

  const bgStyle: React.CSSProperties =
    slide.bg === 'light-blue'
      ? { background: 'linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)' }
      : slide.bg === 'grey'
      ? { background: '#e8ecf0' }
      : {};

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={slide.bg !== 'split' ? bgStyle : {}}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {/* Split background (Screen 2) — dark top 56.3%, white bottom */}
      {slide.bg === 'split' && (
        <>
          <div className="absolute inset-0" style={{ background: '#0a1628' }} />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-[40px]"
            style={{ top: '56.3%', background: '#ffffff' }}
          />
        </>
      )}

      {/* Screen 2: Senti logo — assemble animation */}
      {slide.bg === 'split' && (
        <motion.div
          className="absolute"
          style={{ left: 21, top: 60, width: 350, height: 350 }}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            delay: 1.15,
            duration: 0.65,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.55, 1],
          }}
        >
          <motion.div
            style={{ position: 'absolute', top: 0, left: 0, width: 350, height: 175, overflow: 'hidden' }}
            initial={{ x: 110, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={imgSentiLogo}
              alt="Senti"
              style={{ position: 'absolute', top: 0, left: 0, width: 350, height: 350, objectFit: 'contain', pointerEvents: 'none' }}
            />
          </motion.div>
          <motion.div
            style={{ position: 'absolute', top: 175, left: 0, width: 350, height: 175, overflow: 'hidden' }}
            initial={{ x: -110, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={imgSentiLogo}
              alt=""
              style={{ position: 'absolute', top: -175, left: 0, width: 350, height: 350, objectFit: 'contain', pointerEvents: 'none' }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Screen 3: Stacked pills — fall from above */}
      {slide.bg === 'light-blue' && (
        <div className="absolute left-0 right-0 flex flex-col items-center" style={{ top: '50%' }}>
          <motion.div
            initial={{ y: -520 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.65, type: 'spring', stiffness: 320, damping: 26 }}
            style={{ width: 220, height: 80, borderRadius: 30, background: 'linear-gradient(163deg, #2563eb 0%, #1e40af 100%)', zIndex: 3 }}
          />
          <motion.div
            initial={{ y: -520 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 320, damping: 26 }}
            style={{ width: 260, height: 80, borderRadius: 30, background: 'linear-gradient(163deg, #60a5fa 0%, #3b82f6 100%)', marginTop: -20, zIndex: 2 }}
          />
          <motion.div
            initial={{ y: -520 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 320, damping: 26 }}
            style={{ width: 300, height: 80, borderRadius: 30, background: 'linear-gradient(163deg, #cbd5e1 0%, #94a3b8 100%)', marginTop: -20, zIndex: 1 }}
          />
        </div>
      )}

      {/* Screen 4: Explosion animation */}
      {slide.bg === 'grey' && (
        <div className="absolute" style={{ top: '44.6%', left: 26, width: 340, height: 360 }}>
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ left: EXPLOSION_CX - 21, top: EXPLOSION_CY - 21, width: 42, height: 42, border: '2px solid rgba(90,157,232,0.7)' }}
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 7, opacity: 0 }}
            transition={{ delay: 0.38, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ left: EXPLOSION_CX - 21, top: EXPLOSION_CY - 21, width: 42, height: 42, border: '1.5px solid rgba(122,184,245,0.5)' }}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ delay: 0.48, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.svg
            className="absolute inset-0 pointer-events-none"
            width="340" height="360"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: 'easeOut' }}
          >
            {FRAGMENTS.slice(0, 6).map((f, i) => (
              <line key={i}
                x1={EXPLOSION_CX} y1={EXPLOSION_CY} x2={f.cx} y2={f.cy}
                stroke="#5a9de8" strokeWidth={0.8} strokeDasharray="3 6" strokeOpacity={0.28}
              />
            ))}
          </motion.svg>
          <motion.div
            className="absolute"
            style={{ left: EXPLOSION_CX - 21, top: EXPLOSION_CY - 21, width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #5a9de8 0%, #3b7dd8 100%)', boxShadow: '0 8px 32px rgba(59,125,216,0.6)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1.05, 1, 0.1, 0], opacity: [0, 1, 1, 1, 0.6, 0] }}
            transition={{ times: [0, 0.18, 0.28, 0.38, 0.52, 0.62], duration: 1.05, ease: 'easeInOut' }}
          />
          {FRAGMENTS.map((f, i) => {
            const initX = EXPLOSION_CX - f.cx;
            const initY = EXPLOSION_CY - f.cy;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: f.cx - f.size / 2, top: f.cy - f.size / 2, width: f.size, height: f.size, borderRadius: f.r, background: f.g, boxShadow: f.s }}
                initial={{ x: initX, y: initY, scale: 0, rotate: 0, opacity: 0 }}
                animate={{ x: 0, y: 0, scale: 1, rotate: f.rot, opacity: 1 }}
                transition={{ delay: f.delay, type: 'spring', stiffness: 210, damping: 17 }}
              />
            );
          })}
        </div>
      )}

      {/* Text content (title at top for light-blue / grey) */}
      {slide.bg !== 'split' && (
        <div className="px-10 pt-[88px]">
          <h2 style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 42, lineHeight: '46px', color: titleColor, marginBottom: 12 }}>
            {slide.title}
          </h2>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 17, lineHeight: '25px', color: subtitleColor, whiteSpace: 'pre-line' }}>
            {slide.subtitle}
          </p>
        </div>
      )}

      {/* Bottom section for split screen */}
      {slide.bg === 'split' && (
        <div className="absolute left-0 right-0" style={{ top: '65.8%', paddingLeft: 40, paddingRight: 40 }}>
          <h2 style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 42, lineHeight: '40px', color: titleColor, marginBottom: 12 }}>
            {slide.title}
          </h2>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 17, lineHeight: '24.375px', color: subtitleColor, whiteSpace: 'pre-line' }}>
            {slide.subtitle}
          </p>
        </div>
      )}

      {/* Skip / dots / Next */}
      <div
        className="absolute left-0 right-0 flex items-center justify-between"
        style={{ bottom: 48, paddingLeft: 40, paddingRight: 40 }}
      >
        <button onClick={onSkip} className="py-2 pr-4">
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 15, color: '#94a3b8' }}>
            Skip
          </span>
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: 9999,
                background: i === slideIdx ? '#3b82f6' : '#cbd5e1',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        <button onClick={onNext} className="py-2 pl-4">
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 15, color: nextColor }}>
            Next
          </span>
        </button>
      </div>
    </motion.div>
  );
}

// ── Screen 5: CTA — Figma 2114:475 ────────────────────────────────────

const ctaImgSenti   = 'https://www.figma.com/api/mcp/asset/e0794bba-27e6-456f-920e-210f5bf55aae';
const ctaCardVec0   = 'https://www.figma.com/api/mcp/asset/f6a56cd7-14aa-4738-8ba9-747bd6c2eaf6';
const ctaCardVec1   = 'https://www.figma.com/api/mcp/asset/c4f574f2-8911-4de9-bcc1-5763c84bdfe6';
const ctaCardVec2   = 'https://www.figma.com/api/mcp/asset/b6fdcefc-cdbf-44bb-b496-b4b9e4e29c98';
const ctaIconSpend  = 'https://www.figma.com/api/mcp/asset/898910e7-d8e3-42d7-98f6-fe5d716a519a';
const ctaIconSave   = 'https://www.figma.com/api/mcp/asset/658e9525-4b71-421a-8f3a-b5b5d7b39c7b';
const ctaIconInvest = 'https://www.figma.com/api/mcp/asset/b8fea292-cfb1-4596-9f11-2cdf66d534b2';

/**
 * CTA screen — self-contained. Initiates real Supabase OAuth.
 * After signInWithOAuth the browser redirects away; no local state to manage.
 */
function CtaScreen() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleAuth() {
    if (!supabase) return;
    setLoading(true);
    track('auth_initiated', { provider: 'google' });
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    // Browser navigates away — no cleanup needed.
  }

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(180deg, #dce4ec 0%, #eef2f6 100%)' }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {/* Background radial glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full" style={{ left: 93, top: -100, width: 400, height: 400, background: 'radial-gradient(circle at 200px 200px, rgba(90,157,232,0.08) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full" style={{ left: -80, top: 582, width: 350, height: 350, background: 'radial-gradient(circle at 175px 175px, rgba(59,125,216,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Cards + feature tiles */}
      <div className="absolute" style={{ left: 26, top: 24, width: 340, height: 400 }}>

        {/* Shadow card behind */}
        <div className="absolute rounded-[28px]" style={{ left: 18, top: 39, width: 304, height: 202, background: 'linear-gradient(146.31deg, rgb(200,209,218) 0%, rgb(184,196,208) 100%)', opacity: 0.4, boxShadow: '0px 12px 32px rgba(0,0,0,0.08)' }} />

        {/* Main dark card */}
        <div className="absolute rounded-[28px] overflow-hidden" style={{ left: 2, top: 0, width: 340, height: 220, background: 'linear-gradient(147.09deg, rgb(30,58,95) 0%, rgb(21,45,71) 100%)', boxShadow: '0px 20px 50px rgba(30,58,95,0.4)' }}>
          <div className="absolute inset-0">
            <div className="absolute inset-0 overflow-hidden">
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
            <div className="absolute rounded-full pointer-events-none" style={{ left: 140, top: -60, width: 160, height: 160, background: 'radial-gradient(circle at 48px 48px, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          </div>

          {/* Top row */}
          <div className="absolute flex items-start justify-between" style={{ left: 28, top: 28, width: 284 }}>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '19.5px', color: 'rgba(255,255,255,0.6)' }}>Senti Premium</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 24, lineHeight: '36px', color: '#fff' }}>$24,850.00</p>
            </div>
            <div className="flex items-center justify-center rounded-[18px] shrink-0" style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.2)', padding: 8 }}>
              <img alt="Senti" src={ctaImgSenti} style={{ width: 64, height: 64, objectFit: 'contain' }} />
            </div>
          </div>

          {/* Card number + bottom row */}
          <div className="absolute flex flex-col" style={{ left: 28, top: 128, width: 284, gap: 16 }}>
            <div className="flex items-center" style={{ gap: 16 }}>
              {[0, 1, 2].map(g => (
                <div key={g} className="flex items-center" style={{ gap: 6 }}>
                  {[0, 1, 2, 3].map(d => (
                    <div key={d} className="rounded-full shrink-0" style={{ width: 10, height: 10, background: 'rgba(255,255,255,0.5)' }} />
                  ))}
                </div>
              ))}
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, lineHeight: '22.5px', color: '#fff' }}>8492</p>
            </div>
            <div className="flex items-center justify-between" style={{ height: 26 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '21px', color: 'rgba(255,255,255,0.8)' }}>Premium Account</p>
              <div className="flex items-center" style={{ gap: 12 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '19.5px', color: 'rgba(255,255,255,0.6)' }}>12/28</p>
                <div className="relative shrink-0" style={{ width: 42, height: 26 }}>
                  <div className="absolute rounded-full" style={{ width: 26, height: 26, left: 0,  top: 0, background: '#eb001b', opacity: 0.9 }} />
                  <div className="absolute rounded-full" style={{ width: 26, height: 26, left: 16, top: 0, background: '#f79e1b', opacity: 0.9 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature tiles */}
        <div className="absolute" style={{ left: 0, top: 250, width: 340, height: 124 }}>
          {[
            { label: 'Spend', sub: 'Daily use',   left: 0,   icon: ctaIconSpend,  bg: 'linear-gradient(135deg, rgb(122,184,245) 0%, rgb(90,157,232) 100%)'  },
            { label: 'Save',  sub: 'Your goals',  left: 117, icon: ctaIconSave,   bg: 'linear-gradient(135deg, rgb(90,157,232) 0%, rgb(59,125,216) 100%)'   },
            { label: 'Invest',sub: 'Grow more',   left: 235, icon: ctaIconInvest, bg: 'linear-gradient(135deg, rgb(59,125,216) 0%, rgb(43,109,200) 100%)'   },
          ].map(({ label, sub, left, icon, bg }) => (
            <div key={label} className="absolute bg-white rounded-[20px]" style={{ left, top: 0, width: 105, height: 124, boxShadow: '0px 8px 20px rgba(0,0,0,0.06)' }}>
              <div className="absolute flex items-center justify-center rounded-[14px]" style={{ left: 31, top: 16, width: 44, height: 44, background: bg }}>
                <img alt="" style={{ width: 18, height: 18 }} src={icon} />
              </div>
              <p className="absolute" style={{ left: label === 'Invest' ? 35 : label === 'Save' ? 39 : 34, top: 70, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#1e3a5f', lineHeight: '19.5px' }}>{label}</p>
              <p className="absolute" style={{ left: label === 'Invest' ? 26 : label === 'Save' ? 27 : 31, top: 91, fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 11, color: '#7b92b0', lineHeight: '16.5px' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 flex items-end" style={{ paddingLeft: 32, paddingBottom: 20 }}>
        <h2 style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 42, lineHeight: '50.4px', color: '#1e3a5f' }}>
          One account.<br />Endless possibilities.
        </h2>
      </div>

      {/* Auth buttons */}
      <div className="shrink-0 flex flex-col" style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 40, gap: 12 }}>

        {/* Continue with Apple — disabled until Apple OAuth is configured */}
        <button
          disabled
          className="w-full flex items-center justify-center rounded-[16px] gap-[10px]"
          style={{ height: 57, background: '#000', opacity: 0.35, cursor: 'not-allowed' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16, color: '#fff' }}>
            Continue with Apple
          </span>
        </button>

        {/* Continue with Google */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center rounded-[16px] gap-[10px]"
          style={{
            height: 57,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.10)',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" style={{ color: '#3c4043' }} />
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16, color: '#3c4043' }}>
                Continue with Google
              </span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Username screen ────────────────────────────────────────────────────

function UsernameScreen({
  value,
  onChange,
  onContinue,
  submitting,
  saveError,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  submitting: boolean;
  saveError: string | null;
}) {
  const [checking,     setChecking]     = useState(false);
  const [availability, setAvailability] = useState<'available' | 'taken' | null>(null);

  // Debounced real-DB uniqueness check
  useEffect(() => {
    setAvailability(null);
    if (value.trim().length < 3) return;
    setChecking(true);
    const timer = setTimeout(async () => {
      const ok = await checkUsernameAvailable(value.trim());
      setAvailability(ok ? 'available' : 'taken');
      setChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const canContinue =
    value.trim().length >= 3 && availability === 'available' && !checking && !submitting;

  // Derive the status message shown below the underline
  const statusLine: { icon: React.ReactNode; text: string; color: string } | null = (() => {
    if (saveError) return {
      icon: <XCircle size={13} style={{ color: '#ff3b30' }} />,
      text: saveError,
      color: '#ff3b30',
    };
    if (checking) return {
      icon: <Loader2 size={13} className="text-[#8ac7ff] animate-spin" />,
      text: 'Checking availability…',
      color: '#8ac7ff',
    };
    if (availability === 'available') return {
      icon: <CheckCircle2 size={13} style={{ color: '#02d128' }} />,
      text: `@${value} is available`,
      color: '#02d128',
    };
    if (availability === 'taken') return {
      icon: <XCircle size={13} style={{ color: '#ff3b30' }} />,
      text: 'Username taken, try another',
      color: '#ff3b30',
    };
    return null;
  })();

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #dce4ec 0%, #eef2f6 100%)' }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{ width: 400, height: 400, left: 93, top: -100, background: 'radial-gradient(circle, rgba(90,157,232,0.08) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 flex flex-col" style={{ paddingTop: 80, paddingLeft: 32, paddingRight: 32, gap: 12 }}>
        <h1 style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 42, lineHeight: '44px', color: '#1e3a5f' }}>
          Create your<br />username
        </h1>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 17, lineHeight: '25.5px', color: '#7b92b0', maxWidth: 311 }}>
          Choose a unique username for your Senti account
        </p>
      </div>

      {/* @ input row */}
      <div className="absolute" style={{ left: 32, right: 32, top: '45.9%' }}>
        <div className="flex items-center" style={{ gap: 8, height: 84 }}>
          <span style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 700, fontSize: 56, lineHeight: '84px', color: '#1e3a5f', flexShrink: 0, width: 53 }}>
            @
          </span>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
            placeholder="yourname"
            autoFocus
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 600,
              fontSize: 48,
              lineHeight: '84px',
              color: value ? '#1e3a5f' : '#c5d0db',
            }}
          />
        </div>

        {/* Underline */}
        <div
          style={{
            height: 3,
            borderRadius: 9999,
            background: saveError
              ? 'linear-gradient(90deg, #ff3b30 0%, #ef4444 100%)'
              : availability === 'available'
              ? 'linear-gradient(90deg, #02d128 0%, #22c55e 100%)'
              : availability === 'taken'
              ? 'linear-gradient(90deg, #ff3b30 0%, #ef4444 100%)'
              : value
              ? 'linear-gradient(90deg, #5a9de8 0%, #3b7dd8 100%)'
              : '#c5d0db',
            transition: 'background 0.25s ease',
          }}
        />

        {/* Status line */}
        <div style={{ marginTop: 10, height: 18 }}>
          {statusLine && (
            <div className="flex items-center gap-[6px]">
              {statusLine.icon}
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: statusLine.color }}>
                {statusLine.text}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="absolute" style={{ left: 32, right: 32, top: '87.6%' }}>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full flex items-center justify-center rounded-[16px]"
          style={{
            height: 57,
            background: canContinue
              ? 'linear-gradient(170.08deg, #5a9de8 0%, #3b7dd8 100%)'
              : 'linear-gradient(170.08deg, rgb(197,208,219) 0%, rgb(184,196,208) 100%)',
            boxShadow: canContinue ? '0px 2px 8px rgba(0,0,0,0.04)' : 'none',
            opacity: canContinue ? 1 : 0.6,
            transition: 'opacity 0.2s, background 0.2s',
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 17, color: '#fff' }}>
              Continue
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
