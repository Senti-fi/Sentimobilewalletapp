/**
 * AccountPage
 * Route: /account
 *
 * All profile data (username, email, auth provider, member since, user ID)
 * is read from the persisted Zustand store — never hardcoded.
 *
 * Sections:
 *   1. Header        — back button + "Account" label + "Profile" title
 *   2. Profile Card  — avatar, username, verified badge, stats row
 *   3. Account Details Card — email, wallet address, user ID
 *   4. Connected Accounts Card — shows active provider as Connected
 *   5. Settings Cards — Security Center, Smart Alerts, Help & Support
 *   6. Sign Out Card  — clears profile + returns to onboarding
 *   7. Footer         — version + tagline
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Pencil,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { getNetWorth } from '../../store/selectors';
import { ONBOARDING_KEY } from '../onboarding';

// ── Static data (not user-specific) ──────────────────────────────────
const WALLET_ADDRESS       = '7A3FkPqR8sT2nJ5dVxYzC4bW1eM6hKLNpQrSuTvWxYz';
const WALLET_ADDRESS_SHORT = '7A3FkPqR8s…WxYz';

// ── Sub-components ──────────────────────────────────────────────────

function Divider() {
  return <div className="h-[1px] bg-[rgba(138,199,255,0.12)] w-full" />;
}

function StatusBadge({ status }: { status: 'connected' | 'pending' | 'not_connected' }) {
  if (status === 'connected') {
    return (
      <span className="px-[10px] py-[4px] rounded-[20px] text-[12px] font-semibold leading-[16px] whitespace-nowrap bg-[rgba(2,209,40,0.12)] text-[#02d128]">
        Connected
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="px-[10px] py-[4px] rounded-[20px] text-[12px] font-semibold leading-[16px] whitespace-nowrap bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">
        Pending
      </span>
    );
  }
  return (
    <span className="px-[10px] py-[4px] rounded-[20px] text-[12px] font-semibold leading-[16px] whitespace-nowrap bg-[rgba(138,199,255,0.07)] text-[rgba(138,199,255,0.45)]">
      Not connected
    </span>
  );
}

function CopyBtn({ value, copiedKey, onCopy }: {
  value: string;
  copiedKey: string;
  onCopy: (value: string, key: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(value, copiedKey)}
      className="flex items-center justify-center size-8 rounded-[8px] bg-[rgba(138,199,255,0.08)] shrink-0"
      aria-label="Copy"
    >
      {copiedKey === 'copied' ? (
        <Check size={15} className="text-[#02d128]" strokeWidth={2.5} />
      ) : (
        <Copy size={15} className="text-[#8ac7ff]" strokeWidth={1.75} />
      )}
    </button>
  );
}

function DetailRow({
  label,
  value,
  subtext,
  action,
}: {
  label: string;
  value: string;
  subtext?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">{label}</p>
        <p className="text-white font-medium text-[14px] leading-[18px] truncate">{value}</p>
        {subtext && (
          <p className="text-[#8ac7ff] font-normal text-[11px] leading-[14px] opacity-70">{subtext}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ConnectedRow({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  status: 'connected' | 'pending' | 'not_connected';
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      {icon}
      <p className="flex-1 text-white font-medium text-[14px] leading-[18px]">{label}</p>
      <StatusBadge status={status} />
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-4 active:bg-[rgba(255,255,255,0.04)] transition-colors"
    >
      <div className={`size-9 rounded-[12px] flex items-center justify-center shrink-0 ${
        danger ? 'bg-[rgba(255,59,48,0.12)]' : 'bg-[rgba(138,199,255,0.08)]'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-[2px] text-left">
        <p className={`font-medium text-[14px] leading-[18px] ${danger ? 'text-[#ff3b30]' : 'text-white'}`}>
          {label}
        </p>
        <p className={`font-normal text-[12px] leading-[16px] ${danger ? 'text-[rgba(255,59,48,0.7)]' : 'text-[#8ac7ff]'}`}>
          {subtitle}
        </p>
      </div>
      <ChevronRight
        size={16}
        className={danger ? 'text-[rgba(255,59,48,0.5)]' : 'text-[#8ac7ff]'}
        strokeWidth={2}
      />
    </button>
  );
}

function BrandCircle({ letter, bg }: { letter: string; bg: string }) {
  return (
    <div
      className="size-9 rounded-[12px] flex items-center justify-center shrink-0"
      style={{ backgroundColor: bg }}
    >
      <span className="text-white font-bold text-[14px] leading-[18px]">{letter}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function AccountPage() {
  const navigate       = useNavigate();
  const userProfile    = useAppStore(s => s.userProfile);
  const clearUserProfile = useAppStore(s => s.clearUserProfile);
  const balances       = useAppStore(s => s.balances);
  const goals          = useAppStore(s => s.goals);
  const flexibleSavings = useAppStore(s => s.flexibleSavings);
  const lockedSavings  = useAppStore(s => s.lockedSavings);
  const investments    = useAppStore(s => s.investments);

  const netWorth    = getNetWorth({ balances, goals, flexibleSavings, lockedSavings, investments });
  const activeGoals = goals.filter(g => g.status === 'active').length;

  // Derive display values from live profile
  const username      = userProfile?.username     ?? 'user';
  const email         = userProfile?.email        ?? '—';
  const provider      = userProfile?.authProvider ?? 'google';
  const userId        = userProfile?.id           ?? 'USR-????';
  const avatarLetter  = username[0].toUpperCase();
  const memberYear    = userProfile
    ? new Date(userProfile.createdAt).getFullYear()
    : new Date().getFullYear();

  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 1500);
  };

  function handleSignOut() {
    clearUserProfile();
    localStorage.removeItem(ONBOARDING_KEY);
    navigate('/onboarding', { replace: true });
  }

  return (
    <div className="flex flex-col bg-[#0a142f] pb-8">

      {/* ── 1. Header ───────────────────────────────────────────────── */}
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
          Profile
        </p>
      </div>

      {/* ── 2. Profile Summary Card ─────────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[#162040] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-4 px-5 pt-5 pb-4">
          {/* Avatar — uses first letter of username */}
          <div className="size-[60px] bg-[#007bff] rounded-full flex items-center justify-center shrink-0 shadow-[0px_0px_0px_3px_rgba(0,123,255,0.25)]">
            <span className="text-white font-bold text-[24px] leading-[32px] tracking-[-0.48px]">
              {avatarLetter}
            </span>
          </div>

          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            <div className="flex items-center gap-[6px]">
              <p className="text-white font-bold text-[18px] leading-[24px]">
                @{username}
              </p>
              <div className="flex items-center gap-[3px] bg-[rgba(0,230,255,0.12)] px-[6px] py-[2px] rounded-[20px]">
                <BadgeCheck size={12} className="text-[#00e6ff]" strokeWidth={2.5} />
                <span className="text-[#00e6ff] font-semibold text-[11px] leading-[14px]">
                  Verified
                </span>
              </div>
            </div>
            <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px]">
              Senti member since {memberYear}
            </p>
          </div>
        </div>

        <Divider />

        {/* Stats row */}
        <div className="flex items-stretch px-5 py-4">
          <div className="flex flex-col gap-[2px] flex-1 min-w-0">
            <p className="text-[#8ac7ff] font-normal text-[11px] leading-[14px] uppercase tracking-[0.4px]">Net Worth</p>
            <p className="text-white font-bold text-[16px] leading-[20px] tracking-[-0.32px]">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-[1px] bg-[rgba(138,199,255,0.15)] self-stretch mx-3" />
          <div className="flex flex-col gap-[2px] flex-1 min-w-0 items-center">
            <p className="text-[#8ac7ff] font-normal text-[11px] leading-[14px] uppercase tracking-[0.4px]">Goals</p>
            <p className="text-white font-bold text-[16px] leading-[20px]">{activeGoals}</p>
          </div>
          <div className="w-[1px] bg-[rgba(138,199,255,0.15)] self-stretch mx-3" />
          <div className="flex flex-col gap-[2px] flex-1 min-w-0 items-end">
            <p className="text-[#8ac7ff] font-normal text-[11px] leading-[14px] uppercase tracking-[0.4px]">Rewards</p>
            <p className="text-white font-bold text-[16px] leading-[20px]">5 pts</p>
          </div>
        </div>
      </div>

      {/* ── 3. Account Details Card ─────────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
        <div className="px-5 pt-5 pb-3">
          <p className="text-white font-semibold text-[16px] leading-[20px]">Account details</p>
        </div>

        <Divider />

        {/* Email — from auth provider, not editable */}
        <DetailRow
          label="Email"
          value={email}
          subtext={`Via ${provider === 'apple' ? 'Apple' : 'Google'}`}
          action={
            <button
              className="flex items-center justify-center size-8 rounded-[8px] bg-[rgba(138,199,255,0.08)] shrink-0"
              aria-label="Edit email"
            >
              <Pencil size={15} className="text-[#8ac7ff]" strokeWidth={1.75} />
            </button>
          }
        />

        <Divider />

        {/* Wallet Address */}
        <DetailRow
          label="Wallet Address"
          value={WALLET_ADDRESS_SHORT}
          action={
            <CopyBtn
              value={WALLET_ADDRESS}
              copiedKey={copied['wallet'] ? 'copied' : ''}
              onCopy={(v) => handleCopy(v, 'wallet')}
            />
          }
        />

        <Divider />

        {/* User ID */}
        <DetailRow
          label="Unique User ID"
          value={userId}
          action={
            <CopyBtn
              value={userId}
              copiedKey={copied['uid'] ? 'copied' : ''}
              onCopy={(v) => handleCopy(v, 'uid')}
            />
          }
        />
      </div>

      {/* ── 4. Connected Accounts Card ──────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-white font-semibold text-[16px] leading-[20px]">Connected accounts</p>
          <button>
            <span className="text-[#007bff] font-semibold text-[13px] leading-[18px]">Manage</span>
          </button>
        </div>

        <Divider />

        <ConnectedRow
          label="Apple ID"
          status={provider === 'apple' ? 'connected' : 'not_connected'}
          icon={<BrandCircle letter="A" bg="#1c1c1e" />}
        />

        <Divider />

        <ConnectedRow
          label="Google"
          status={provider === 'google' ? 'connected' : 'not_connected'}
          icon={<BrandCircle letter="G" bg="#4285f4" />}
        />

        <Divider />

        <ConnectedRow
          label="Mercury Bank"
          status="pending"
          icon={<BrandCircle letter="M" bg="#3d2f7a" />}
        />
      </div>

      {/* ── 5. Settings / Action Cards ──────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
        <SettingsRow
          icon={<ShieldCheck size={18} className="text-[#00e6ff]" strokeWidth={1.75} />}
          label="Security Center"
          subtitle="Protect your wallet & devices"
        />
        <Divider />
        <SettingsRow
          icon={<Bell size={18} className="text-[#8ac7ff]" strokeWidth={1.75} />}
          label="Smart Alerts"
          subtitle="Customize balance reminders"
        />
        <Divider />
        <SettingsRow
          icon={<HelpCircle size={18} className="text-[#8ac7ff]" strokeWidth={1.75} />}
          label="Help & Support"
          subtitle="Get help and contact us"
        />
      </div>

      {/* ── 6. Sign Out Card ────────────────────────────────────────── */}
      <div className="mx-6 mt-4 bg-[rgba(255,59,48,0.06)] border border-[rgba(255,59,48,0.2)] rounded-[20px] overflow-hidden">
        <SettingsRow
          icon={<LogOut size={18} className="text-[#ff3b30]" strokeWidth={1.75} />}
          label="Sign out of Senti"
          subtitle="We will keep your wallet safe"
          danger
          onClick={handleSignOut}
        />
      </div>

      {/* ── 7. Footer ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-[4px] mt-8 pb-2">
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] opacity-50">
          Senti Wallet v1.2.0
        </p>
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] opacity-50">
          Made with ❤️ for easy crypto
        </p>
      </div>

    </div>
  );
}
