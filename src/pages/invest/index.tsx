/**
 * InvestPage
 * Figma frame 253:446 "Investment"
 *
 * Layout:
 *   1. Header — ArrowLeft + "Investments" title
 *   2. Subtitle "Your portfolio at a glance."
 *   3. Portfolio hero card (h-169, gradient bg, absolute inner layout)
 *   4. Lucy insight card
 *   5. My Investments section — dynamic from store
 *   6. Available Vaults section — USDT Vault + Stablecoin LP cards
 *   7. Tokenized Stocks & Assets (coming soon, dashed border)
 *   8. FAB (fixed)
 *
 * Excluded: status bar (device), bottom nav (AppShell)
 */
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BalanceCarousel from '../../components/BalanceCarousel';
import { useAppStore } from '../../store';
import { getActiveInvestments } from '../../store/selectors';
import type { InvestmentPosition } from '../../store';

// ── Figma asset URLs (253:446) ───────────────────────────────────────
const imgAddFunds  = 'https://www.figma.com/api/mcp/asset/3c493018-ccff-4c02-8ca2-7b404242ebe7'; // ArrowRight (Lucy)
const imgShield    = 'https://www.figma.com/api/mcp/asset/059f0cce-9356-4ffb-ad6a-05713f1e47e3'; // Shield/Audited
const imgDepNow    = 'https://www.figma.com/api/mcp/asset/d5ebce2f-1cf4-4908-8d3a-a73a9a1f8c38'; // ArrowRight (Deposit Now)
const imgFabIcon   = 'https://www.figma.com/api/mcp/asset/990e1168-cec1-4b09-9af8-9f74d9614f7e'; // FAB icon
const imgRocket    = 'https://www.figma.com/api/mcp/asset/afb79d2f-22e9-4342-b1c9-fb2d1cc9e637'; // Rocket (soon)

// ── Vault display metadata ────────────────────────────────────────────
// Protocol/TVL are display-only — not stored in the financial state.
const VAULT_META: Record<string, { protocol: string; tvl: string; tagline: string }> = {
  'USDC Vault':    { protocol: 'Aave',     tvl: '$2.4B', tagline: 'Earning daily returns' },
  'USDT Vault':    { protocol: 'Compound', tvl: '$1.2B', tagline: 'Earning daily returns' },
  'Stablecoin LP': { protocol: 'Curve',    tvl: '$1.2B', tagline: 'Higher yields via LP'  },
};

const AVAILABLE_VAULTS = [
  {
    name:         'USDT Vault',
    risk:         'Low'  as const,
    withdrawal:   'Instant Withdrawal',
    description:  'Secure lending returns on your USDT.',
    apy:          '9.2% APY',
    protocol:     'Compound',
    tvl:          'TVL $1.2B',
    minDeposit:   '$10',
    depositRoute: '/invest/vault',
  },
  {
    name:         'Stablecoin LP',
    risk:         'Med'  as const,
    withdrawal:   '1-2 hours',
    description:  'Higher returns through stablecoin liquidity.',
    apy:          '12.3% APY',
    protocol:     'Curve',
    tvl:          'TVL $1.2B',
    minDeposit:   '$50',
    depositRoute: '/invest/vault/stablecoin-lp',
  },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────
function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Sub-components ───────────────────────────────────────────────────

/** Risk badge used inside "My Investments" vault cards */
function MyInvestBadge({ risk }: { risk: 'Low' | 'Med' }) {
  return (
    <div className="bg-[rgba(0,230,255,0.1)] border border-[rgba(0,230,255,0.2)] content-stretch flex flex-col items-start px-[9px] py-px rounded-[4px] shrink-0">
      <p className="font-normal leading-[16px] text-[#00e6ff] text-[12px] whitespace-nowrap">
        {risk}
      </p>
    </div>
  );
}

/** Risk pill used inside "Available Vaults" cards */
function AvailableBadge({ risk }: { risk: 'Low' | 'Med' }) {
  if (risk === 'Low') {
    return (
      <div className="bg-[#0a3040] content-stretch flex flex-col items-start px-[12px] py-[4px] rounded-[9999px] shrink-0">
        <p className="font-normal leading-[normal] text-[#00e6ff] text-[10px] whitespace-nowrap">
          Low
        </p>
      </div>
    );
  }
  return (
    <div className="bg-[#ffb020] content-stretch flex flex-col items-start px-[12px] py-[4px] rounded-[9999px] shrink-0">
      <p className="font-normal leading-[16px] text-[#2a1f0a] text-[12px] whitespace-nowrap">
        Med
      </p>
    </div>
  );
}

/** Single card in the "My Investments" list — data from store */
function MyInvestmentCard({ position }: { position: InvestmentPosition }) {
  const navigate = useNavigate();
  const meta     = VAULT_META[position.vaultName] ?? { protocol: '—', tvl: '—', tagline: 'Active position' };
  const earned   = position.currentValue - position.depositedAmount;
  const returnPct = position.apy.toFixed(1) + '%';

  return (
    <div className="bg-[#1a2540] border border-[rgba(255,255,255,0.05)] content-stretch flex flex-col gap-[12px] items-start px-[25px] py-[21px] rounded-[16px] shrink-0 w-full">

      {/* Header row — tap to open vault details */}
      <button
        onClick={() => navigate(`/invest/position/${position.id}`)}
        className="content-stretch flex items-center justify-between w-full text-left"
      >
        <div className="flex flex-col gap-[4px] items-start">
          <p className="font-medium leading-[24px] text-[16px] text-white">{position.vaultName}</p>
          <p className="font-normal leading-[16px] text-[#8ac7ff] text-[12px] whitespace-nowrap">{meta.tagline}</p>
        </div>
        <MyInvestBadge risk="Low" />
      </button>

      {/* Metrics row */}
      <div className="border-[rgba(255,255,255,0.05)] border-b border-t content-stretch flex items-center justify-center py-[13px] w-full">
        <div className="flex-[1_0_0] flex flex-col items-start gap-[2px] min-w-0">
          <p className="font-normal leading-[16px] text-[12px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">Deposited</p>
          <p className="font-medium leading-[24px] text-[16px] text-white">${fmtUsd(position.depositedAmount)}</p>
        </div>
        <div className="flex-[1_0_0] flex flex-col items-start gap-[2px] min-w-0">
          <p className="font-normal leading-[16px] text-[12px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">Earned</p>
          <p className="font-medium leading-[24px] text-[16px] text-[#00e6ff]">+${fmtUsd(earned)}</p>
        </div>
        <div className="flex-[1_0_0] flex flex-col items-start gap-[2px] min-w-0">
          <p className="font-normal leading-[16px] text-[12px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">Return</p>
          <p className="font-medium leading-[24px] text-[16px] text-white">{returnPct}</p>
        </div>
      </div>

      {/* Protocol / TVL row */}
      <div className="content-stretch flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          <p className="font-normal leading-[16px] text-[12px] text-[rgba(255,255,255,0.4)]">Protocol</p>
          <p className="font-normal leading-[16px] text-[12px] text-white">{meta.protocol}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="font-normal leading-[16px] text-[12px] text-[rgba(255,255,255,0.4)]">TVL</p>
          <p className="font-normal leading-[16px] text-[12px] text-white">{meta.tvl}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="content-stretch flex gap-[12px] items-start justify-center w-full">
        <button
          onClick={() => navigate(`/invest/position/${position.id}`)}
          className="bg-[#007bff] content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-0 py-[8px] rounded-[8px]"
        >
          <p className="font-normal leading-[16px] text-[12px] text-center text-white">Add More</p>
        </button>
        <button
          onClick={() => navigate('/wallet')}
          className="bg-[rgba(255,255,255,0.05)] content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-0 py-[8px] rounded-[8px]"
        >
          <p className="font-normal leading-[16px] text-[12px] text-center text-white">Withdraw</p>
        </button>
      </div>

    </div>
  );
}

/** Single card in the "Available Vaults" list */
function AvailableVaultCard({
  name,
  risk,
  withdrawal,
  description,
  apy,
  protocol,
  tvl,
  minDeposit,
  depositRoute,
}: (typeof AVAILABLE_VAULTS)[number]) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#1a2540] border border-[#262626] content-stretch flex flex-col gap-[16px] items-start max-w-[384px] p-[21px] rounded-[16px] shrink-0 w-full">

      {/* Header */}
      <div className="flex flex-col gap-[4px] w-full">
        <div className="content-stretch flex items-center justify-between w-full">
          <div className="content-stretch flex gap-[2px] items-center shrink-0">
            <p className="font-medium leading-[24px] text-[16px] text-white whitespace-nowrap">{name}</p>
            <AvailableBadge risk={risk} />
          </div>
          <p className="font-normal leading-[normal] text-[#8ac7ff] text-[10px] whitespace-nowrap">{withdrawal}</p>
        </div>
        <p className="font-normal leading-[16px] text-[#8ac7ff] text-[10px] whitespace-nowrap">{description}</p>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-[8px] w-full">

        {/* Returns row */}
        <div className="border-b border-[rgba(55,65,81,0.3)] content-stretch flex items-center justify-between pb-[9px] pt-[8px] w-full">
          <p className="font-normal leading-[16px] text-[#8ac7ff] text-[12px] whitespace-nowrap">Est. Returns</p>
          <p className="font-semibold leading-[24px] text-[#00e6ff] text-[18px] whitespace-nowrap">{apy}</p>
        </div>

        {/* Trust row */}
        <div className="content-stretch flex items-center justify-between w-full">
          <div className="content-stretch flex gap-[8px] items-center shrink-0">
            <div className="bg-[rgba(255,255,255,0)] rounded-[9999px] shadow-[0px_0px_8px_0px_#00e6ff] shrink-0 size-[8px]" />
            <p className="font-normal leading-[16px] text-[#8ac7ff] text-[12px] whitespace-nowrap">{protocol}</p>
          </div>
          <p className="font-normal leading-[16px] text-[#8ac7ff] text-[12px] whitespace-nowrap">{tvl}</p>
        </div>

        {/* Audited badge */}
        <div className="content-stretch flex gap-[8px] items-center shrink-0">
          <div className="relative shrink-0 size-[16px]">
            <img alt="" className="absolute block max-w-none size-full" src={imgShield} />
          </div>
          <p className="font-bold leading-[normal] text-[#8ac7ff] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
            Audited &amp; Secure
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="content-stretch flex items-center justify-between w-full">
        <div className="flex flex-col items-start shrink-0">
          <p className="font-medium leading-[15px] text-[#8ac7ff] text-[8px] uppercase opacity-80 whitespace-nowrap">
            Min. Deposit
          </p>
          <p className="font-bold leading-[normal] text-[#8ac7ff] text-[14px] whitespace-nowrap">
            {minDeposit}
          </p>
        </div>
        <button
          onClick={() => navigate(depositRoute)}
          className="bg-[#007bff] content-stretch flex gap-[4px] items-center justify-center px-[24px] py-[8px] rounded-[8px] shrink-0"
        >
          <p className="font-normal leading-[16px] text-[12px] text-center text-white whitespace-nowrap">
            Deposit Now
          </p>
          <div className="relative shrink-0 size-[16px]">
            <img alt="" className="absolute block max-w-none size-full" src={imgDepNow} />
          </div>
        </button>
      </div>

    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function InvestPage() {
  const navigate    = useNavigate();
  const investments = useAppStore(s => s.investments);
  const activePositions = getActiveInvestments(investments);

  return (
    <>
    <InvestFab />
    <div className="flex flex-col bg-[#0a142f] pb-[96px]">

      {/* ── 1. Header ───────────────────────────────────────────────── */}
      <div className="content-stretch flex items-center justify-between px-6 pt-[68px]">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[24px] shrink-0">
          <ArrowLeft size={20} strokeWidth={2} className="text-white" />
        </button>
        <p className="font-semibold leading-[20px] text-[16px] text-white whitespace-nowrap">
          Investments
        </p>
        <div className="size-[24px] shrink-0" />
      </div>

      {/* ── 2. Subtitle ─────────────────────────────────────────────── */}
      <p className="font-medium leading-[18px] px-6 mt-[26px] text-[#8ac7ff] text-[14px] whitespace-nowrap">
        Your portfolio at a glance.
      </p>

      {/* ── 3. Portfolio Card — BalanceCarousel (invest slide) ──────── */}
      <div className="mt-[16px]">
        <BalanceCarousel />
      </div>

      {/* ── 4. Lucy card ────────────────────────────────────────────── */}
      <div className="mx-6 mt-[24px] bg-[#162040] border border-[rgba(0,123,255,0.2)] content-stretch flex gap-[16px] items-center overflow-clip p-[20px] rounded-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">

        {/* "L" avatar */}
        <div className="bg-[#007bff] content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative rounded-[9999px] shrink-0 size-[32px]">
          <p className="font-bold h-[20px] leading-[20px] text-[14px] text-center text-white">L</p>
        </div>

        {/* Content */}
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-w-0">
          <p className="font-normal leading-[16px] min-w-full text-[12px] text-white">
            Your USDC Vault is outperforming this month. Consider adding more to maximize returns.
          </p>
          <div className="content-stretch flex gap-[4px] items-center shrink-0">
            <p className="font-medium leading-[18px] text-[#007bff] text-[14px] whitespace-nowrap">
              Add Funds
            </p>
            <div className="relative shrink-0 size-[14px]">
              <div className="absolute inset-[18.75%_12.5%]">
                <img alt="" className="absolute block max-w-none size-full" src={imgAddFunds} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 5. My Investments ───────────────────────────────────────── */}
      <div className="content-stretch flex flex-col gap-[16px] items-start mx-6 mt-[24px]">

        {/* Section header */}
        <div className="content-stretch flex items-center justify-between shrink-0 w-full">
          <p className="font-semibold leading-[28px] text-[#f1f5f9] text-[18px] whitespace-nowrap">
            My Investments
          </p>
          <button onClick={() => navigate('/invest/portfolio')}>
            <p className="font-semibold leading-[20px] text-[#007bff] text-[14px] text-center whitespace-nowrap">
              View All
            </p>
          </button>
        </div>

        {activePositions.length === 0 ? (
          <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
            No active positions yet.
          </p>
        ) : (
          activePositions.map(position => (
            <MyInvestmentCard key={position.id} position={position} />
          ))
        )}
      </div>

      {/* ── 6. Available Vaults ─────────────────────────────────────── */}
      <div className="content-stretch flex flex-col gap-[16px] items-start mx-6 mt-[32px]">

        {/* Section header */}
        <div className="content-stretch flex items-end justify-between shrink-0 w-full">
          <div className="flex flex-col items-start shrink-0">
            <p className="font-semibold leading-[24px] text-[18px] text-white whitespace-nowrap">
              Available Vaults
            </p>
            <p className="font-normal leading-[16px] text-[#8ac7ff] text-[12px] whitespace-nowrap">
              AI-powered yield strategies, managed for you.
            </p>
          </div>
          <button onClick={() => navigate('/invest/explore')}>
            <p className="font-medium leading-[18px] text-[#007bff] text-[14px] text-center whitespace-nowrap">
              Explore All
            </p>
          </button>
        </div>

        {AVAILABLE_VAULTS.map(v => (
          <AvailableVaultCard key={v.name} {...v} />
        ))}
      </div>

      {/* ── 7. Tokenized Stocks & Assets (soon) ─────────────────────── */}
      <div
        className="border-2 border-dashed border-[rgba(255,255,255,0.2)] content-stretch flex items-center justify-between mx-6 mt-[32px] opacity-60 p-[22px] rounded-[16px]"
      >
        <div className="content-stretch flex flex-col gap-[4px] items-start shrink-0 w-[223.88px]">
          <div className="content-stretch flex gap-[8px] items-center shrink-0 w-full">
            <p className="font-bold h-[20px] leading-[20px] text-[14px] text-white whitespace-nowrap">
              Tokenized Stocks &amp; Assets
            </p>
            <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[6px] py-[2px] rounded-[4px] shrink-0">
              <p className="font-normal h-[15px] leading-[15px] text-[10px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
                Soon
              </p>
            </div>
          </div>
          <p className="font-normal h-[15px] leading-[15px] text-[#8ac7ff] text-[10px] whitespace-nowrap">
            Direct access to real-world assets on-chain
          </p>
        </div>

        <div className="opacity-40 relative shrink-0">
          <div className="relative shrink-0 size-[24px]">
            <img alt="" className="absolute block max-w-none size-full" src={imgRocket} />
          </div>
        </div>
      </div>

    </div>
    </>
  );
}

/** FAB portalled into #root so it stays within the app's 430 px shell */
function InvestFab() {
  const root = document.getElementById('root');
  if (!root) return null;
  return createPortal(
    <button
      className="absolute bg-[#007bff] bottom-[86px] content-stretch flex items-center justify-center right-[16px] rounded-[9999px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)] size-[56px] z-40"
    >
      <div className="h-[19px] relative shrink-0 w-[22px]">
        <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
      </div>
      {/* Cyan notification dot */}
      <div className="absolute bg-[#00e6ff] border-2 border-[#007bff] right-[-4px] rounded-[9999px] size-[16px] top-[-4px]" />
    </button>,
    root,
  );
}
