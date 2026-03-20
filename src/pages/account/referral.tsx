/**
 * ReferralPage
 * Route: /account/referral
 *
 * Two distinct sections:
 *   1. Share — user's own referral link + stats (how many they've referred, points earned)
 *   2. Enter a code — lets a signed-up user apply someone else's referral code
 *      post-onboarding. Disabled once a code has already been applied.
 *
 * Data sources:
 *   referrals       — count where referrer_id = user (outbound) and whether
 *                     a row exists where referred_id = user (inbound / already used)
 *   referral_points — sum of all points for the user
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Copy, Check, Share2, Users, Gift,
  Loader2, TicketCheck,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────

interface ReferralStats {
  referralCount:      number;
  totalPoints:        number;
  alreadyReferred:    boolean;
  referredByUsername: string | null;
}

// ── Data helpers ───────────────────────────────────────────────────────

async function fetchReferralStats(authUserId: string): Promise<ReferralStats> {
  if (!supabase) return { referralCount: 0, totalPoints: 0, alreadyReferred: false, referredByUsername: null };

  const [countResult, pointsResult, inboundResult] = await Promise.all([
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', authUserId),
    supabase
      .from('referral_points')
      .select('points')
      .eq('auth_user_id', authUserId),
    supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referred_id', authUserId)
      .maybeSingle(),
  ]);

  const referralCount  = countResult.count ?? 0;
  const totalPoints    = (pointsResult.data ?? []).reduce((sum, row) => sum + (row.points as number), 0);
  const alreadyReferred = inboundResult.data !== null;

  let referredByUsername: string | null = null;
  if (alreadyReferred && inboundResult.data?.referrer_id) {
    const { data: referrer } = await supabase
      .from('users')
      .select('username')
      .eq('auth_user_id', inboundResult.data.referrer_id)
      .maybeSingle();
    referredByUsername = referrer?.username ?? null;
  }

  return { referralCount, totalPoints, alreadyReferred, referredByUsername };
}

async function applyReferralCode(
  authUserId:      string,
  currentUsername: string,
  code:            string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not available offline.' };

  const normalized = code.trim().toLowerCase();

  if (normalized === currentUsername.trim().toLowerCase()) {
    return { error: 'You cannot use your own referral code.' };
  }

  const { data: referrer } = await supabase
    .from('users')
    .select('auth_user_id')
    .ilike('username', normalized)
    .maybeSingle();

  if (!referrer) return { error: 'Code not found. Check the username and try again.' };

  const { data: referral, error: insertErr } = await supabase
    .from('referrals')
    .insert({ referrer_id: referrer.auth_user_id, referred_id: authUserId, status: 'completed' })
    .select('id')
    .single();

  if (insertErr) return { error: 'Code already applied or invalid.' };

  const referralId = referral?.id ?? null;
  await supabase.from('referral_points').insert([
    { auth_user_id: referrer.auth_user_id, referral_id: referralId, points: 100, reason: 'Successful referral' },
    { auth_user_id: authUserId,            referral_id: referralId, points: 50,  reason: 'Joined via referral'  },
  ]);

  return { error: null };
}

// ── Sub-components ─────────────────────────────────────────────────────

function StatCard({
  icon, label, value, loading,
}: {
  icon: React.ReactNode; label: string; value: string; loading: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 py-5 px-3">
      <div className="size-10 rounded-[14px] bg-[rgba(138,199,255,0.08)] flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[#8ac7ff] font-normal text-[11px] leading-[14px] uppercase tracking-[0.4px] text-center">
        {label}
      </p>
      {loading
        ? <Loader2 size={16} className="text-[#8ac7ff] animate-spin" />
        : <p className="text-white font-bold text-[20px] leading-[26px] tracking-[-0.4px]">{value}</p>
      }
    </div>
  );
}

function HowItWorksStep({ number, title, description }: {
  number: number; title: string; description: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="size-7 rounded-full bg-[rgba(0,123,255,0.15)] border border-[rgba(0,123,255,0.3)] flex items-center justify-center shrink-0 mt-[1px]">
        <span className="text-[#007bff] font-bold text-[12px] leading-none">{number}</span>
      </div>
      <div className="flex flex-col gap-[2px] flex-1">
        <p className="text-white font-semibold text-[14px] leading-[18px]">{title}</p>
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">{description}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export default function ReferralPage() {
  const navigate    = useNavigate();
  const userProfile = useAppStore(s => s.userProfile);

  const username    = userProfile?.username ?? '';
  const authUserId  = userProfile?.id       ?? '';
  const referralLink = `${window.location.origin}?ref=${username}`;

  // ── Share / stats state
  const [stats,    setStats]    = useState<ReferralStats>({ referralCount: 0, totalPoints: 0, alreadyReferred: false, referredByUsername: null });
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState(false);
  const [shareErr, setShareErr] = useState(false);

  // ── Enter-a-code state
  const [inputCode,    setInputCode]    = useState('');
  const [codeLoading,  setCodeLoading]  = useState(false);
  const [codeError,    setCodeError]    = useState<string | null>(null);
  const [codeApplied,  setCodeApplied]  = useState(false); // success for this session

  useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    setLoading(true);
    fetchReferralStats(authUserId)
      .then(data  => { if (!cancelled) { setStats(data); setLoading(false); } })
      .catch(()   => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authUserId]);

  // ── Share handlers
  function handleCopy() {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleShare() {
    setShareErr(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Senti',
          text: 'Use my referral link to sign up for Senti — your all-in-one crypto wallet.',
          url: referralLink,
        });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(referralLink).catch(() => {});
      setCopied(true);
      setShareErr(true);
      setTimeout(() => { setCopied(false); setShareErr(false); }, 2000);
    }
  }

  // ── Apply code handler
  async function handleApplyCode() {
    if (!inputCode.trim() || codeLoading) return;
    setCodeError(null);
    setCodeLoading(true);
    const { error } = await applyReferralCode(authUserId, username, inputCode);
    setCodeLoading(false);
    if (error) {
      setCodeError(error);
      return;
    }
    // Success — mark applied and refresh stats so points update
    setCodeApplied(true);
    fetchReferralStats(authUserId).then(data => setStats(data)).catch(() => {});
  }

  // Derived: has the user already been referred (either before opening this
  // page, or just now in this session)?
  const wasReferred = stats.alreadyReferred || codeApplied;

  return (
    <div className="flex flex-col bg-[#0a142f] min-h-screen pb-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-12 pb-2">
        <div className="flex items-center mb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-6 text-white shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <p className="flex-1 text-center text-[#8ac7ff] font-medium text-[12px] leading-[16px] tracking-[0.5px] uppercase">
            Account
          </p>
          <div className="size-6" />
        </div>
        <p className="text-white font-bold text-[28px] leading-[36px] tracking-[-0.56px]">
          Referrals
        </p>
        <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px] mt-1">
          Invite friends and earn reward points
        </p>
      </div>

      {/* ── Stats Card ──────────────────────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[#162040] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]">
        <div className="flex items-stretch">
          <StatCard
            icon={<Users size={18} className="text-[#8ac7ff]" strokeWidth={1.75} />}
            label="Friends Referred"
            value={String(stats.referralCount)}
            loading={loading}
          />
          <div className="w-[1px] bg-[rgba(138,199,255,0.12)] self-stretch my-4" />
          <StatCard
            icon={<Gift size={18} className="text-[#00e6ff]" strokeWidth={1.75} />}
            label="Points Earned"
            value={`${stats.totalPoints} pts`}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Your Referral Link Card ──────────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] p-5">
        <p className="text-white font-semibold text-[16px] leading-[20px] mb-1">
          Your referral link
        </p>
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] mb-4">
          Share this link — when a friend signs up you both earn points.
        </p>

        <div className="flex items-center gap-3 bg-[rgba(138,199,255,0.06)] rounded-[14px] px-4 py-3 mb-3">
          <p className="flex-1 text-[#8ac7ff] font-medium text-[13px] leading-[18px] truncate">
            {referralLink}
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center size-8 rounded-[10px] bg-[rgba(138,199,255,0.1)] shrink-0 transition-colors active:bg-[rgba(138,199,255,0.18)]"
            aria-label="Copy referral link"
          >
            {copied
              ? <Check size={15} className="text-[#02d128]" strokeWidth={2.5} />
              : <Copy  size={15} className="text-[#8ac7ff]" strokeWidth={1.75} />
            }
          </button>
        </div>

        {shareErr && (
          <p className="text-[#8ac7ff] text-[12px] mb-2 text-center">
            Sharing not supported — link copied instead.
          </p>
        )}

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] py-[14px] transition-opacity active:opacity-70"
          style={{ background: 'linear-gradient(170.08deg, #5a9de8 0%, #3b7dd8 100%)' }}
        >
          <Share2 size={16} className="text-white" strokeWidth={2} />
          <span className="text-white font-semibold text-[15px] leading-[20px]">
            Share with friends
          </span>
        </button>
      </div>

      {/* ── Enter a Referral Code Card ───────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] p-5">

        <div className="flex items-center gap-2 mb-1">
          <TicketCheck size={16} className="text-[#00e6ff]" strokeWidth={1.75} />
          <p className="text-white font-semibold text-[16px] leading-[20px]">
            Have a referral code?
          </p>
        </div>
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] mb-4">
          Enter a friend's username to apply their referral code.
        </p>

        {/* Already referred — locked state */}
        {wasReferred ? (
          <div className="flex items-center gap-3 bg-[rgba(2,209,40,0.06)] border border-[rgba(2,209,40,0.2)] rounded-[14px] px-4 py-3">
            <div className="size-8 rounded-[10px] bg-[rgba(2,209,40,0.1)] flex items-center justify-center shrink-0">
              <Check size={15} className="text-[#02d128]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[#02d128] font-semibold text-[13px] leading-[18px]">
                Referral code applied
              </p>
              {(stats.referredByUsername || codeApplied) && (
                <p className="text-[rgba(2,209,40,0.7)] font-normal text-[12px] leading-[16px]">
                  {codeApplied
                    ? `@${inputCode.trim().toLowerCase()} referred you`
                    : stats.referredByUsername
                    ? `@${stats.referredByUsername} referred you`
                    : null
                  }
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Not yet referred — input + submit */
          <>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-[rgba(138,199,255,0.06)] border border-[rgba(138,199,255,0.12)] rounded-[14px] px-4 overflow-hidden"
                style={{ borderColor: codeError ? 'rgba(255,59,48,0.4)' : inputCode ? 'rgba(90,157,232,0.35)' : 'rgba(138,199,255,0.12)' }}
              >
                <span className="text-[#8ac7ff] font-medium text-[15px] mr-[2px] shrink-0">@</span>
                <input
                  type="text"
                  value={inputCode}
                  onChange={e => {
                    setInputCode(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''));
                    setCodeError(null);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                  placeholder="friend's username"
                  className="flex-1 bg-transparent outline-none py-[14px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 15,
                    color: '#fff',
                  }}
                />
              </div>

              <button
                onClick={handleApplyCode}
                disabled={!inputCode.trim() || codeLoading}
                className="flex items-center justify-center rounded-[14px] px-4 shrink-0 transition-opacity"
                style={{
                  background: inputCode.trim()
                    ? 'linear-gradient(170.08deg, #5a9de8 0%, #3b7dd8 100%)'
                    : 'rgba(138,199,255,0.08)',
                  opacity: codeLoading ? 0.6 : 1,
                  minWidth: 72,
                  height: 50,
                }}
              >
                {codeLoading
                  ? <Loader2 size={16} className="text-white animate-spin" />
                  : <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14,
                      color: inputCode.trim() ? '#fff' : '#8ac7ff' }}>
                      Apply
                    </span>
                }
              </button>
            </div>

            {codeError && (
              <p className="mt-2 text-[#ff3b30] font-normal text-[12px] leading-[16px]">
                {codeError}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 pt-4 pb-2">
        <p className="text-white font-semibold text-[16px] leading-[20px] mb-1">
          How it works
        </p>
        <div className="h-[1px] bg-[rgba(138,199,255,0.12)] w-full my-3" />
        <HowItWorksStep number={1} title="Share your link"  description="Send your unique referral link to a friend." />
        <div className="h-[1px] bg-[rgba(138,199,255,0.07)] w-full" />
        <HowItWorksStep number={2} title="Friend signs up"  description="They create a Senti account using your link." />
        <div className="h-[1px] bg-[rgba(138,199,255,0.07)] w-full" />
        <HowItWorksStep number={3} title="You both earn points" description="Reward points are added to both accounts automatically." />
      </div>

    </div>
  );
}
