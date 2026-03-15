import { ShieldCheck } from 'lucide-react';
import BalanceCard from './ui/BalanceCard';
import SectionHeader from './ui/SectionHeader';

interface Investment {
  id: string;
  name: string;
  amount: number;
  apy: string;
  protocol: string;
  earned: number;
}

interface InvestPageProps {
  vaultBalance: number;
  vaultEarned: number;
  activeInvestments: Investment[];
  onAddMore?: (inv: Investment) => void;
  onWithdraw?: (inv: Investment) => void;
  onOpenGrow?: () => void;
}

interface VaultCardProps {
  name: string;
  subtitle: string;
  risk: 'Low' | 'Med' | 'High';
  deposited: number;
  earned: number;
  returnPct: string;
  protocol: string;
  tvl: string;
  onAddMore?: () => void;
  onWithdraw?: () => void;
}

function RiskBadge({ risk }: { risk: 'Low' | 'Med' | 'High' }) {
  const styles =
    risk === 'Low' ? 'bg-[rgba(0,230,255,0.1)] border border-[rgba(0,230,255,0.2)] text-[#00e6ff]' :
    risk === 'Med' ? 'bg-[#ffb020] text-[#2a1f0a]' :
    'bg-red-500/20 border border-red-400/30 text-red-400';
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-normal ${styles}`}>{risk}</span>
  );
}

function VaultCard({ name, subtitle, risk, deposited, earned, returnPct, protocol, tvl, onAddMore, onWithdraw }: VaultCardProps) {
  return (
    <div className="bg-[#1a2540] border border-[rgba(255,255,255,0.05)] rounded-2xl px-6 py-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-white text-base font-medium leading-6">{name}</p>
          <p className="text-[#8ac7ff] text-xs font-normal leading-4">{subtitle}</p>
        </div>
        <RiskBadge risk={risk} />
      </div>

      {/* Metrics */}
      <div className="flex items-center border-t border-b border-[rgba(255,255,255,0.05)] py-3 gap-0">
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-[rgba(255,255,255,0.4)] text-xs leading-4">Deposited</span>
          <span className="text-white text-base font-medium leading-6">
            ${deposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-[rgba(255,255,255,0.4)] text-xs leading-4">Earned</span>
          <span className="text-[#00e6ff] text-base font-medium leading-6">
            +${earned.toFixed(2)}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-[rgba(255,255,255,0.4)] text-xs leading-4">Return</span>
          <span className="text-white text-base font-medium leading-6">{returnPct}</span>
        </div>
      </div>

      {/* Protocol + TVL */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[rgba(255,255,255,0.4)] text-xs">Protocol</span>
          <span className="text-white text-xs">{protocol}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-[rgba(255,255,255,0.4)] text-xs">TVL</span>
          <span className="text-white text-xs">{tvl}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAddMore}
          className="flex-1 bg-[#007bff] text-white text-xs font-normal py-2 rounded-lg text-center"
        >
          Add More
        </button>
        <button
          onClick={onWithdraw}
          className="flex-1 bg-[rgba(255,255,255,0.05)] text-white text-xs font-normal py-2 rounded-lg text-center"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

interface AvailableVaultCardProps {
  name: string;
  risk: 'Low' | 'Med';
  withdrawal: string;
  description: string;
  apy: string;
  protocol: string;
  tvl: string;
  minDeposit: string;
  onDeposit?: () => void;
}

function AvailableVaultCard({ name, risk, withdrawal, description, apy, protocol, tvl, minDeposit, onDeposit }: AvailableVaultCardProps) {
  return (
    <div className="bg-[#1a2540] border border-[#262626] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-base font-medium leading-6">{name}</span>
            <RiskBadge risk={risk} />
          </div>
          <span className="text-[#8ac7ff] text-[10px]">{withdrawal}</span>
        </div>
        <p className="text-[#8ac7ff] text-[10px] leading-4">{description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-[rgba(55,65,81,0.3)] pb-2">
          <span className="text-[#8ac7ff] text-xs">Est. Returns</span>
          <span className="text-[#00e6ff] text-lg font-semibold">{apy}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_#00e6ff]" />
            <span className="text-[#8ac7ff] text-xs">{protocol}</span>
          </div>
          <span className="text-[#8ac7ff] text-xs">TVL {tvl}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8ac7ff]" strokeWidth={1.5} />
          <span className="text-[#8ac7ff] text-[10px] font-bold uppercase tracking-wide">Audited &amp; Secure</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#8ac7ff] text-[9px] uppercase font-medium">Min. Deposit</p>
          <p className="text-[#8ac7ff] text-sm font-bold">{minDeposit}</p>
        </div>
        <button
          onClick={onDeposit}
          className="flex items-center gap-1.5 bg-[#007bff] text-white text-xs font-normal px-6 py-2 rounded-lg"
        >
          Deposit Now
        </button>
      </div>
    </div>
  );
}

export default function InvestPage({
  vaultBalance,
  vaultEarned,
  activeInvestments,
  onAddMore,
  onWithdraw,
  onOpenGrow,
}: InvestPageProps) {
  const totalInvested = activeInvestments.reduce((s, i) => s + i.amount, 0);
  const totalEarned   = activeInvestments.reduce((s, i) => s + i.earned, 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0a142f]">
      {/* Header */}
      <div className="flex flex-col px-6 pt-5 pb-2">
        <h1 className="text-white text-base font-semibold leading-5 text-center">Investments</h1>
        <p className="text-[#8ac7ff] text-sm font-medium leading-[18px] mt-1">Your portfolio at a glance.</p>
      </div>

      {/* Portfolio balance card */}
      <div className="mb-5">
        <div className="mx-6 rounded-[20px] bg-gradient-to-b from-[#007bff] to-[#0a142f] overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute -top-4 -left-8 w-[120%] h-[120%] rounded-full bg-white/10" />
          </div>
          <div className="relative px-5 pt-5">
            {/* Badge */}
            <div className="absolute top-5 right-5 bg-[#0a3040] px-2.5 py-1 rounded-full">
              <span className="text-[#00e6ff] text-[11px] font-semibold">+4.2% this month</span>
            </div>

            <p className="text-white text-xs font-normal leading-4 mb-2">Total Portfolio Value</p>
            <p className="text-white text-[32px] font-bold leading-8 tracking-tight mb-4">
              ${(vaultBalance + totalInvested).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            {/* Metrics row */}
            <div className="flex items-center border-t border-[rgba(255,255,255,0.2)] py-3 gap-0">
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[rgba(255,255,255,0.6)] text-[11px]">Invested</span>
                <span className="text-white text-sm font-normal">
                  ${totalInvested > 0 ? totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div className="w-px h-8 bg-[rgba(255,255,255,0.2)]" />
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[rgba(255,255,255,0.6)] text-[11px]">Earned</span>
                <span className="text-[#00e6ff] text-sm font-medium">
                  +${(totalEarned + vaultEarned).toFixed(2)}
                </span>
              </div>
              <div className="w-px h-8 bg-[rgba(255,255,255,0.2)]" />
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[rgba(255,255,255,0.6)] text-[11px]">Positions</span>
                <span className="text-white text-sm font-normal">
                  {activeInvestments.length} Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lucy insight */}
      <div className="mx-6 mb-5">
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] p-5 flex gap-4 items-center">
          <div className="w-8 h-8 bg-[#007bff] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-normal leading-4">
              Your USDC Vault is outperforming this month. Consider adding more to maximize returns.
            </p>
            <button onClick={onOpenGrow} className="text-[#007bff] text-sm font-medium mt-1">
              Add Funds →
            </button>
          </div>
        </div>
      </div>

      {/* My Investments */}
      <div className="px-6 mb-5">
        <SectionHeader title="My Investments" actionLabel="View All" onAction={onOpenGrow} />
        <div className="mt-4 flex flex-col gap-4">
          {activeInvestments.length > 0 ? (
            activeInvestments.map((inv) => (
              <VaultCard
                key={inv.id}
                name={inv.name}
                subtitle="Earning daily returns"
                risk="Low"
                deposited={inv.amount}
                earned={inv.earned}
                returnPct={inv.apy + '%'}
                protocol={inv.protocol}
                tvl="$2.4B"
                onAddMore={() => onAddMore?.(inv)}
                onWithdraw={() => onWithdraw?.(inv)}
              />
            ))
          ) : (
            <div className="bg-[#1a2540] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 text-center">
              <p className="text-[#8ac7ff] text-sm">No active investments yet.</p>
              <button
                onClick={onOpenGrow}
                className="mt-3 bg-[#007bff] text-white text-xs font-normal px-6 py-2.5 rounded-lg"
              >
                Start Investing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Available Vaults */}
      <div className="px-6 mb-6">
        <div className="flex items-end justify-between mb-1">
          <div>
            <h2 className="text-white text-lg font-semibold">Available Vaults</h2>
            <p className="text-[#8ac7ff] text-xs mt-0.5">AI-powered yield strategies, managed for you.</p>
          </div>
          <button onClick={onOpenGrow} className="text-[#007bff] text-sm font-medium">Explore All</button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <AvailableVaultCard
            name="USDT Vault"
            risk="Low"
            withdrawal="Instant Withdrawal"
            description="Secure lending returns on your USDT."
            apy="9.2% APY"
            protocol="Compound"
            tvl="$1.2B"
            minDeposit="$10"
            onDeposit={onOpenGrow}
          />
          <AvailableVaultCard
            name="Stablecoin LP"
            risk="Med"
            withdrawal="1-2 hours"
            description="Higher returns through stablecoin liquidity."
            apy="12.3% APY"
            protocol="Curve"
            tvl="$1.2B"
            minDeposit="$50"
            onDeposit={onOpenGrow}
          />
        </div>
      </div>
    </div>
  );
}
