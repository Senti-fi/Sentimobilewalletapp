/**
 * ExploreVaultsPage
 * Route: /invest/explore
 *
 * Browse all available investment vaults on Senti.
 * Design goals:
 *   - Scannable rows, not overwhelming cards
 *   - APY is the hero number on each row
 *   - Risk colour-coded so users can self-filter at a glance
 *   - Filter pills for quick drill-down by risk tier
 *   - "Coming Soon" assets visible but non-tappable
 *   - Lucy tip anchors the page with a single actionable recommendation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, ChevronRight, Lock } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────

type RiskLevel = 'Low' | 'Med' | 'High';
type Category  = 'Stablecoin Vaults' | 'Liquidity Strategies' | 'Fixed-Term Locks' | 'Coming Soon';
type FilterKey = 'all' | 'low' | 'med' | 'high';

interface Vault {
  id:           string;
  name:         string;
  tagline:      string;
  category:     Category;
  risk:         RiskLevel;
  apy:          string;       // e.g. "8.5%"  or "—" for soon
  protocol:     string;
  withdrawal:   string;       // e.g. "Instant" | "1–2 hrs" | "30-day lock"
  minDeposit:   string;
  assetLetter:  string;       // 1-2 char rendered in the icon circle
  assetBg:      string;       // hex colour for circle bg tint
  assetText:    string;       // hex colour for the letter
  depositRoute: string;
  comingSoon?:  boolean;
}

// ── Vault catalogue ───────────────────────────────────────────────────
// All offerings are stablecoin-native or DeFi-native — consistent with
// Senti's positioning as a yield-bearing crypto wallet on Solana.

const VAULTS: Vault[] = [

  // ─── Stablecoin Vaults ──────────────────────────────────────────────
  // Simple, single-asset lending — lowest risk, easiest to understand.
  {
    id:           'usdc-aave',
    name:         'USDC Vault',
    tagline:      'Earn steady returns on your USDC',
    category:     'Stablecoin Vaults',
    risk:         'Low',
    apy:          '8.5%',
    protocol:     'Aave',
    withdrawal:   'Instant',
    minDeposit:   '$1',
    assetLetter:  'U',
    assetBg:      'rgba(39,117,202,0.15)',
    assetText:    '#5b9bd5',
    depositRoute: '/invest/vault',
  },
  {
    id:           'usdt-compound',
    name:         'USDT Vault',
    tagline:      'Secure lending on your USDT',
    category:     'Stablecoin Vaults',
    risk:         'Low',
    apy:          '9.2%',
    protocol:     'Compound',
    withdrawal:   'Instant',
    minDeposit:   '$10',
    assetLetter:  'T',
    assetBg:      'rgba(38,161,123,0.15)',
    assetText:    '#26a17b',
    depositRoute: '/invest/vault',
  },
  {
    id:           'usdc-morpho',
    name:         'USDC+ Vault',
    tagline:      'Optimised yield routed across protocols',
    category:     'Stablecoin Vaults',
    risk:         'Low',
    apy:          '11.4%',
    protocol:     'Morpho',
    withdrawal:   'Instant',
    minDeposit:   '$1',
    assetLetter:  'U+',
    assetBg:      'rgba(111,76,223,0.15)',
    assetText:    '#a07ff0',
    depositRoute: '/invest/vault',
  },

  // ─── Liquidity Strategies ────────────────────────────────────────────
  // LP positions — higher yield but with withdrawal delays and IL risk.
  {
    id:           'stablecoin-lp',
    name:         'Stablecoin LP',
    tagline:      'Liquidity provision across stable pairs',
    category:     'Liquidity Strategies',
    risk:         'Med',
    apy:          '12.3%',
    protocol:     'Curve',
    withdrawal:   '1–2 hrs',
    minDeposit:   '$50',
    assetLetter:  'LP',
    assetBg:      'rgba(232,65,66,0.12)',
    assetText:    '#e84142',
    depositRoute: '/invest/vault/stablecoin-lp',
  },
  {
    id:           'usdc-sol-lp',
    name:         'USDC / SOL Pool',
    tagline:      'Amplified returns with SOL exposure',
    category:     'Liquidity Strategies',
    risk:         'High',
    apy:          '22.1%',
    protocol:     'Orca',
    withdrawal:   '2–4 hrs',
    minDeposit:   '$25',
    assetLetter:  'LP',
    assetBg:      'rgba(0,163,255,0.12)',
    assetText:    '#00a3ff',
    depositRoute: '/invest/vault',
  },

  // ─── Fixed-Term Locks ────────────────────────────────────────────────
  // Commit funds for a set period in exchange for a guaranteed higher APY.
  {
    id:           'lock-30',
    name:         '30-Day Lock',
    tagline:      'Fixed rate, no market surprises',
    category:     'Fixed-Term Locks',
    risk:         'Low',
    apy:          '10.2%',
    protocol:     'Aave',
    withdrawal:   '30-day lock',
    minDeposit:   '$10',
    assetLetter:  '30',
    assetBg:      'rgba(0,123,255,0.15)',
    assetText:    '#4d9fff',
    depositRoute: '/invest/vault',
  },
  {
    id:           'lock-90',
    name:         '90-Day Lock',
    tagline:      'Premium rate for committed capital',
    category:     'Fixed-Term Locks',
    risk:         'Med',
    apy:          '14.8%',
    protocol:     'Compound',
    withdrawal:   '90-day lock',
    minDeposit:   '$50',
    assetLetter:  '90',
    assetBg:      'rgba(0,87,184,0.15)',
    assetText:    '#4d88e0',
    depositRoute: '/invest/vault',
  },

  // ─── Coming Soon ─────────────────────────────────────────────────────
  {
    id:           'tokenized-stocks',
    name:         'US Stock Index',
    tagline:      'Fractional ownership of top US equities',
    category:     'Coming Soon',
    risk:         'Med',
    apy:          '—',
    protocol:     'On-chain RWA',
    withdrawal:   'Market hours',
    minDeposit:   '$5',
    assetLetter:  'S',
    assetBg:      'rgba(74,222,128,0.10)',
    assetText:    '#4ade80',
    depositRoute: '/invest/vault',
    comingSoon:   true,
  },
  {
    id:           'real-estate',
    name:         'Real Estate Fund',
    tagline:      'Tokenized real-world property returns',
    category:     'Coming Soon',
    risk:         'Med',
    apy:          '—',
    protocol:     'RWA',
    withdrawal:   '7 days',
    minDeposit:   '$100',
    assetLetter:  'RE',
    assetBg:      'rgba(249,115,22,0.12)',
    assetText:    '#f97316',
    depositRoute: '/invest/vault',
    comingSoon:   true,
  },
];

const CATEGORY_ORDER: Category[] = [
  'Stablecoin Vaults',
  'Liquidity Strategies',
  'Fixed-Term Locks',
  'Coming Soon',
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',  label: 'All' },
  { key: 'low',  label: 'Low Risk' },
  { key: 'med',  label: 'Med Risk' },
  { key: 'high', label: 'High Risk' },
];

// ── Sub-components ────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const map: Record<RiskLevel, { bg: string; text: string }> = {
    Low:  { bg: 'bg-[rgba(0,230,255,0.10)]',  text: 'text-[#00e6ff]' },
    Med:  { bg: 'bg-[rgba(255,176,32,0.12)]', text: 'text-[#ffb020]' },
    High: { bg: 'bg-[rgba(255,59,48,0.12)]',  text: 'text-[#ff3b30]' },
  };
  const s = map[risk];
  return (
    <span className={`${s.bg} ${s.text} text-[10px] font-semibold px-[7px] py-[2px] rounded-[9999px] whitespace-nowrap`}>
      {risk}
    </span>
  );
}

/** Single vault row inside a category card */
function VaultRow({ vault, onTap }: { vault: Vault; onTap: () => void }) {
  const isLocked = vault.category === 'Fixed-Term Locks';

  return (
    <button
      onClick={onTap}
      disabled={vault.comingSoon}
      className={`w-full flex items-center gap-3 px-5 py-[14px] text-left transition-colors ${
        vault.comingSoon ? 'opacity-40 cursor-default' : 'active:bg-[rgba(255,255,255,0.03)]'
      }`}
    >
      {/* Asset icon circle */}
      <div
        className="size-[40px] rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: vault.assetBg }}
      >
        <span
          className="font-bold text-[11px] leading-none"
          style={{ color: vault.assetText }}
        >
          {vault.assetLetter}
        </span>
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
        <div className="flex items-center gap-[6px]">
          <p className="text-white font-semibold text-[14px] leading-[20px] truncate">
            {vault.name}
          </p>
          <RiskBadge risk={vault.risk} />
          {vault.comingSoon && (
            <span className="bg-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.4)] text-[10px] font-medium px-[6px] py-[2px] rounded-[4px] whitespace-nowrap">
              Soon
            </span>
          )}
        </div>
        <div className="flex items-center gap-[4px] text-[#8ac7ff] text-[11px] leading-[14px] font-normal">
          <span>{vault.protocol}</span>
          <span className="opacity-40">·</span>
          {isLocked ? (
            <Lock size={9} className="text-[#8ac7ff] opacity-60" strokeWidth={2.5} />
          ) : (
            <Clock size={9} className="text-[#8ac7ff] opacity-60" strokeWidth={2} />
          )}
          <span>{vault.withdrawal}</span>
          <span className="opacity-40">·</span>
          <span>from {vault.minDeposit}</span>
        </div>
      </div>

      {/* APY + chevron */}
      <div className="flex items-center gap-[6px] shrink-0">
        {vault.comingSoon ? (
          <span className="text-[#475569] font-semibold text-[13px]">—</span>
        ) : (
          <span className="text-[#00e6ff] font-bold text-[15px] leading-[20px] whitespace-nowrap">
            {vault.apy}
          </span>
        )}
        {!vault.comingSoon && (
          <ChevronRight size={15} className="text-[#334155]" strokeWidth={2.5} />
        )}
      </div>
    </button>
  );
}

/** Section card wrapping rows for one category */
function CategorySection({
  category,
  vaults,
  onTap,
}: {
  category: string;
  vaults: Vault[];
  onTap: (v: Vault) => void;
}) {
  const availableCount = vaults.filter(v => !v.comingSoon).length;
  const allSoon = availableCount === 0;

  return (
    <div className="bg-[#0f1e3d] rounded-[20px] overflow-hidden border border-[rgba(255,255,255,0.04)]">

      {/* Category header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <p className="text-[#8ac7ff] font-semibold text-[11px] leading-[14px] uppercase tracking-[0.9px]">
          {category}
        </p>
        <p className="text-[#334155] font-normal text-[11px] leading-[14px] whitespace-nowrap">
          {allSoon ? 'Launching soon' : `${availableCount} available`}
        </p>
      </div>

      {/* Rows with hairline dividers */}
      {vaults.map((vault, i) => (
        <div key={vault.id}>
          {i > 0 && (
            <div className="h-[1px] bg-[rgba(255,255,255,0.04)] mx-5" />
          )}
          <VaultRow vault={vault} onTap={() => onTap(vault)} />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export default function ExploreVaultsPage() {
  const navigate     = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('all');

  const riskMap: Record<FilterKey, RiskLevel | null> = {
    all: null, low: 'Low', med: 'Med', high: 'High',
  };
  const activeRisk = riskMap[filter];

  // Filtered + grouped
  const filtered = VAULTS.filter(v => {
    if (activeRisk !== null) {
      if (v.comingSoon) return false;   // hide "coming soon" when drilling into a risk tier
      return v.risk === activeRisk;
    }
    return true;
  });

  const grouped = CATEGORY_ORDER.reduce<Record<string, Vault[]>>((acc, cat) => {
    const items = filtered.filter(v => v.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  function handleVaultTap(vault: Vault) {
    if (!vault.comingSoon) navigate(vault.depositRoute);
  }

  return (
    <div className="flex flex-col bg-[#0a142f] pb-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center px-6 pt-[68px] pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center size-[24px] shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={2} className="text-white" />
        </button>
        <p className="flex-1 text-center font-semibold text-[16px] leading-[20px] text-white">
          Explore Vaults
        </p>
        <div className="size-[24px]" />
      </div>

      {/* ── Subtitle ────────────────────────────────────────────────── */}
      <p className="px-6 pb-5 text-[#8ac7ff] font-medium text-[14px] leading-[18px]">
        AI-powered yield strategies, managed for you.
      </p>

      {/* ── Lucy insight ────────────────────────────────────────────── */}
      <div className="mx-6 bg-[rgba(0,123,255,0.08)] border border-[rgba(0,123,255,0.15)] rounded-[16px] flex gap-3 items-start p-4 mb-5">
        <div className="bg-[#007bff] rounded-full size-7 flex items-center justify-center shrink-0 mt-[1px]">
          <span className="text-white font-bold text-[12px] leading-none">L</span>
        </div>
        <p className="text-[#8ac7ff] font-normal text-[12px] leading-[18px] flex-1">
          New here? Start with a{' '}
          <span className="text-white font-medium">Low Risk vault</span> — trusted protocols,
          instant withdrawals. Move to higher yield once you&apos;re comfortable.
        </p>
      </div>

      {/* ── Filter pills ────────────────────────────────────────────── */}
      <div className="flex gap-2 px-6 mb-5 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-[7px] rounded-[9999px] text-[13px] font-semibold leading-[18px] transition-colors ${
              filter === f.key
                ? 'bg-[#007bff] text-white'
                : 'bg-[rgba(255,255,255,0.06)] text-[#8ac7ff]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── APY column label ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 mb-2">
        <p className="text-[#475569] font-medium text-[11px] leading-[14px] uppercase tracking-[0.5px]">
          Vault
        </p>
        <p className="text-[#475569] font-medium text-[11px] leading-[14px] uppercase tracking-[0.5px] mr-[21px]">
          Est. APY
        </p>
      </div>

      {/* ── Vault sections ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-6">
        {Object.entries(grouped).map(([cat, vaults]) => (
          <CategorySection
            key={cat}
            category={cat}
            vaults={vaults}
            onTap={handleVaultTap}
          />
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="text-[#475569] font-medium text-[14px] leading-[20px]">
              No vaults match this filter
            </p>
            <button
              onClick={() => setFilter('all')}
              className="text-[#007bff] font-semibold text-[13px] leading-[18px]"
            >
              Show all
            </button>
          </div>
        )}
      </div>

      {/* ── Trust badge ─────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-center gap-[6px] opacity-50">
        <ShieldCheck size={13} className="text-[#8ac7ff]" strokeWidth={1.5} />
        <p className="text-[#8ac7ff] font-normal text-[11px] leading-[14px]">
          All vaults are audited · Funds remain in your wallet
        </p>
      </div>

    </div>
  );
}
