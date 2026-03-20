/**
 * VaultDetailsPage
 * Figma frame 261:274 "Vault details"
 *
 * All numerical values (balance, earned, return %) are derived live from
 * the Zustand store's InvestmentPosition record for this vault.
 * Chart data is generated via generateVaultSeries() and updates when the
 * period toggle changes.
 */
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DepositFlow from '../../flows/invest/DepositFlow';
import type { VaultConfig } from '../../flows/invest/DepositFlow/types';
import { useAppStore } from '../../store';
import EarningsChart from '../../components/EarningsChart';
import TransactionList from '../../components/TransactionList';
import { generateVaultSeries } from '../../data/portfolioTimeSeries';
import type { Period } from '../../data/portfolioTimeSeries';
import { getVaultTransactions } from '../../data/transactionUtils';

// ── Figma asset URLs (261:274) ───────────────────────────────────────
const imgDots       = 'https://www.figma.com/api/mcp/asset/aaa8676f-8602-4188-8229-16fdd6412666';
const imgArrowRight = 'https://www.figma.com/api/mcp/asset/02089dab-a0dc-4bfc-baed-8d1176d16a89';
const imgProtocol   = 'https://www.figma.com/api/mcp/asset/5a580da9-469e-4230-b87c-8259d25e7572';
const imgShield     = 'https://www.figma.com/api/mcp/asset/f186f23f-8187-4152-bec4-2c5e7e6d9545';
const imgLock       = 'https://www.figma.com/api/mcp/asset/9a2d1125-3c0d-4e93-a011-5962641c731e';
const imgFabIcon = 'https://www.figma.com/api/mcp/asset/203d2558-3fcc-4874-af2e-0c29b82b0b12';

// ── Static display config (non-data fields) ──────────────────────────

interface VaultDisplayConfig {
  title:         string;
  description:   string;
  riskLabel:     string;
  withdrawal:    string;
  protocol:      string;
  tvl:           string;
  lucyMsg:       (earned: number, returnPct: string) => string;
  depositConfig: VaultConfig;
}

const VAULT_DISPLAY_CONFIG: Record<string, VaultDisplayConfig> = {
  'usdc-vault': {
    title:       'USDC Vault',
    description: 'Earning daily returns on your USDC.',
    riskLabel:   'Low',
    withdrawal:  'Instant',
    protocol:    'Aave',
    tvl:         '$2.4B',
    lucyMsg: (_earned, returnPct) =>
      `Your USDC Vault is outperforming this month at ${returnPct}% return. Adding $500 more could earn you an extra $${(500 * 0.085 / 12).toFixed(0)} over 30 days.`,
    depositConfig: {
      name:        'USDC Vault',
      asset:       'USDC',
      riskLabel:   'LOW',
      apy:         8.5,
      withdrawal:  'Instant anytime',
      minDeposit:  10,
      lucyConfirm: 'Great addition to your portfolio. This keeps your low-risk positions strong.',
      lucySuccess: "Your vault is growing. I'll keep an eye on performance and let you know if anything changes.",
    },
  },
  'usdt-vault': {
    title:       'USDT Vault',
    description: 'Earning daily returns on your USDT.',
    riskLabel:   'Low',
    withdrawal:  'Instant',
    protocol:    'Compound',
    tvl:         '$1.2B',
    lucyMsg: (_earned, returnPct) =>
      `Your USDT Vault is performing steadily at ${returnPct}% return. Adding $500 more could earn you an extra $${(500 * 0.092 / 12).toFixed(0)} over 30 days.`,
    depositConfig: {
      name:        'USDT Vault',
      asset:       'USDT',
      riskLabel:   'LOW',
      apy:         9.2,
      withdrawal:  'Instant anytime',
      minDeposit:  10,
      lucyConfirm: 'Great addition to your portfolio. This keeps your low-risk positions strong.',
      lucySuccess: "Your vault is growing. I'll keep an eye on performance and let you know if anything changes.",
    },
  },
};

const VAULT_ID_TO_NAME: Record<string, string> = {
  'usdc-vault': 'USDC Vault',
  'usdt-vault': 'USDT Vault',
};

// Valid subset of Period used on this page
type VaultPeriod = '7D' | '30D' | 'All';

const CAPTION: Record<VaultPeriod, string> = {
  '7D':  'Earnings over the past 7 days.',
  '30D': 'Your earnings have grown consistently over the past 30 days.',
  'All': 'Full earnings history since your first deposit.',
};

// ── Helpers ───────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


// ── FAB ──────────────────────────────────────────────────────────────

function VaultDetailsFab() {
  const root = document.getElementById('root');
  if (!root) return null;
  return createPortal(
    <button className="absolute bg-[#007bff] bottom-[86px] flex items-center justify-center right-[16px] rounded-[9999px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)] size-[56px] z-40">
      <div className="h-[19px] relative shrink-0 w-[22px]">
        <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
      </div>
      <div className="absolute bg-[#00e6ff] border-2 border-[#007bff] right-[-4px] rounded-[9999px] size-[16px] top-[-4px]" />
    </button>,
    root,
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function VaultDetailsPage() {
  const navigate    = useNavigate();
  const { vaultId } = useParams<{ vaultId: string }>();

  const [perfPeriod, setPerfPeriod] = useState<VaultPeriod>('7D');
  const [showDeposit, setShowDeposit] = useState(false);

  // ── Store data ───────────────────────────────────────────────────
  const investments  = useAppStore(s => s.investments);
  const transactions = useAppStore(s => s.transactions);
  const position     = investments.find(
    i => i.vaultName === VAULT_ID_TO_NAME[vaultId ?? ''],
  );

  const config = VAULT_DISPLAY_CONFIG[vaultId ?? ''] ?? VAULT_DISPLAY_CONFIG['usdc-vault'];

  // ── Derived metrics ──────────────────────────────────────────────
  const deposited    = position?.depositedAmount ?? 0;
  const currentValue = position?.currentValue    ?? deposited;
  const earned       = currentValue - deposited;
  const returnPct    = deposited > 0
    ? ((earned / deposited) * 100).toFixed(1)
    : '0.0';

  // ── Vault-scoped transaction history ────────────────────────────
  const vaultTxs = getVaultTransactions(transactions, config.title);

  // ── Chart data (memoised — only regenerates on position or period change) ─
  const chartData = useMemo(() => {
    if (!position) return [];
    return generateVaultSeries(
      {
        depositedAmount: position.depositedAmount,
        apy:             position.apy,
        depositedAt:     position.depositedAt,
        currentValue:    position.currentValue,
      },
      perfPeriod as Period,
    );
  }, [position, perfPeriod]);

  return (
    <>
      <VaultDetailsFab />

      {showDeposit && (
        <DepositFlow vault={config.depositConfig} onExit={() => setShowDeposit(false)} />
      )}

      {/* ── Scrollable page content ────────────────────────────────── */}
      <div className="flex flex-col bg-[#0a142f] pb-[160px]">

        {/* ── 1. Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-[68px]">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[24px] shrink-0">
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <p className="font-semibold text-[16px] leading-[20px] text-white whitespace-nowrap">
            {config.title}
          </p>
          <button className="relative shrink-0 size-[24px]">
            <div className="absolute inset-[7.81%_39.06%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgDots} />
            </div>
          </button>
        </div>

        {/* ── 2. Position Summary Card ──────────────────────────────── */}
        <div
          className="mx-6 mt-[12px] rounded-[20px] p-[24px] flex flex-col gap-[8px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
          style={{ background: 'linear-gradient(139.8deg, #007bff 0%, #0a3060 100%)' }}
        >
          {/* Risk badge + withdrawal */}
          <div className="flex items-center justify-between">
            <div className="bg-[#0a3040] px-[12px] py-[4px] rounded-[9999px]">
              <p className="font-semibold text-[8px] leading-[normal] tracking-[0.6px] uppercase text-[#00e6ff]">
                {config.riskLabel}
              </p>
            </div>
            <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.8)]">
              Withdrawal: <span className="font-semibold">{config.withdrawal}</span>
            </p>
          </div>

          {/* Description + current value */}
          <div className="flex flex-col gap-[8px] items-center pb-[8px]">
            <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.8)] text-center">
              {config.description}
            </p>
            <p className="font-medium text-[12px] leading-[normal] uppercase text-[rgba(255,255,255,0.7)] text-center">
              Current Value
            </p>
            <p className="font-semibold text-[36px] leading-[40px] tracking-[-0.9px] text-white text-center">
              ${fmt(currentValue)}
            </p>
          </div>

          {/* Metrics row */}
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-[17px] flex gap-[8px] items-start">
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Deposited
              </p>
              <p className="font-bold text-[14px] leading-[20px] text-white text-center">
                ${fmt(deposited)}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Earned
              </p>
              <p className="font-bold text-[14px] leading-[20px] text-[#00e6ff] text-center">
                +${fmt(earned)}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="font-normal text-[10px] leading-[15px] uppercase text-[rgba(255,255,255,0.6)] text-center">
                Return
              </p>
              <p className="font-bold text-[14px] leading-[20px] text-white text-center">
                {returnPct}%
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Performance heading + toggle ──────────────────────── */}
        <div className="flex items-center justify-between mt-[28px] px-6">
          <p className="font-semibold text-[18px] leading-[24px] text-white">
            Performance
          </p>
          <div className="bg-[#1a2540] flex gap-[4px] items-start p-[4px] rounded-[8px]">
            {(['7D', '30D', 'All'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPerfPeriod(p)}
                className={`px-[12px] py-[4px] rounded-[4px] ${perfPeriod === p ? 'bg-[#2a3550]' : ''}`}
              >
                <p className={`font-normal text-[12px] leading-[normal] text-center whitespace-nowrap ${
                  perfPeriod === p ? 'text-white' : 'text-[rgba(255,255,255,0.5)]'
                }`}>
                  {p}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Interactive Chart card ─────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] mx-6 mt-[16px] p-[17px]">
          <EarningsChart
            data={chartData}
            periodKey={perfPeriod}
            height={128}
            color="#007bff"
            caption={CAPTION[perfPeriod]}
          />
        </div>

        {/* ── 5. Lucy card ──────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] mx-6 mt-[16px] flex gap-[16px] items-center p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="bg-[#007bff] rounded-full size-[32px] flex items-center justify-center shrink-0">
            <p className="font-bold text-[14px] leading-[20px] text-white text-center">L</p>
          </div>
          <div className="flex-1 flex flex-col gap-[4px] min-w-0">
            <p className="font-normal text-[12px] leading-[16px] text-white">
              {config.lucyMsg(earned, returnPct)}
            </p>
            <button
              onClick={() => setShowDeposit(true)}
              className="flex gap-[4px] items-center"
            >
              <p className="font-medium text-[14px] leading-[18px] text-[#007bff] whitespace-nowrap">
                Add Funds
              </p>
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[18.75%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgArrowRight} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── 6. Trust Signals ──────────────────────────────────────── */}
        <div className="bg-[#1a2540] flex gap-[16px] items-center mx-6 mt-[16px] p-[16px] rounded-[16px]">

          {/* Protocol */}
          <div className="border-r border-[rgba(255,255,255,0.1)] flex flex-col gap-[4px] h-[35px] items-start pr-px shrink-0 w-[93.667px]">
            <div className="flex gap-[4px] items-center justify-center w-full">
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[9.38%_9.38%_9.37%_9.37%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgProtocol} />
                </div>
              </div>
              <p className="font-normal text-[10px] leading-[normal] uppercase text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">
                Protocol
              </p>
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="font-bold text-[14px] leading-[20px] text-white text-center">
                {config.protocol}
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="border-r border-[rgba(255,255,255,0.1)] flex flex-col gap-[4px] h-[35px] items-start pr-px shrink-0 w-[93.667px]">
            <div className="flex gap-[4px] items-center justify-center w-full">
              <div className="relative shrink-0 size-[12px]">
                <div className="absolute inset-[15.63%_12.5%_6.25%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgShield} />
                </div>
              </div>
              <p className="font-normal text-[12px] leading-[normal] uppercase text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">
                Security
              </p>
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="font-semibold text-[14px] leading-[normal] text-[#4ade80] text-center">Audited</p>
            </div>
          </div>

          {/* TVL */}
          <div className="flex flex-col gap-[4px] h-[35px] items-start shrink-0 w-[93.667px]">
            <div className="flex gap-[4px] items-center justify-center w-full">
              <div className="relative shrink-0 size-[12px]">
                <div className="absolute inset-[3.13%_12.5%_12.5%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgLock} />
                </div>
              </div>
              <p className="font-normal text-[12px] leading-[normal] uppercase text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">
                TVL
              </p>
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="font-bold text-[14px] leading-[20px] text-white text-center">
                {config.tvl}
              </p>
            </div>
          </div>

        </div>

        {/* ── 7. Recent Activities ──────────────────────────────────── */}
        <div
          className="mx-6 mt-[16px] rounded-[20px] p-[20px] flex flex-col gap-[4px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ background: 'rgba(30,41,59,0.4)' }}
        >
          <div className="flex items-center justify-between mb-[4px]">
            <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              Recent Activities
            </p>
            <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              View All
            </p>
          </div>
          <TransactionList
            transactions={vaultTxs}
            limit={5}
            emptyMessage="No activity for this vault yet."
          />
        </div>

      </div>

      {/* ── 8. Sticky footer ──────────────────────────────────────────── */}
      <div
        className="sticky bottom-0 px-6 py-[16px] flex flex-col gap-[8px]"
        style={{ background: 'rgba(10,20,47,0.95)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
        <button
          onClick={() => setShowDeposit(true)}
          className="bg-[#007bff] rounded-[16px] flex items-center justify-center px-6 py-[16px] w-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Add More
          </p>
        </button>
        <button
          onClick={() => navigate('/wallet')}
          className="bg-white rounded-[16px] flex items-center justify-center px-6 py-[16px] w-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-[#0a142f] text-center">
            Withdraw
          </p>
        </button>
      </div>
    </>
  );
}
