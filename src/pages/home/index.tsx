/**
 * HomePage
 * Figma frame: 111:788 "Dark Homepage"
 *
 * Sections:
 *   1. Header — avatar, greeting, bell notification
 *   2. Net Worth hero card — balance, today's earnings, action pills
 *   3. Savings cards row — horizontally scrollable
 *   4. Investment cards row — horizontally scrollable
 *   5. Recent Activities card
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BalanceCarousel from '../../components/BalanceCarousel';
import TransactionList from '../../components/TransactionList';
import FlowPortal from '../../flows/savings/FlowPortal';
import DepositFlow from '../../flows/wallet/DepositFlow';
import SendFlow from '../../flows/wallet/SendFlow';
import WithdrawFlow from '../../flows/wallet/WithdrawFlow';
import { useAppStore } from '../../store';
import { getTransactionsByContext } from '../../data/transactionUtils';

// ── Figma asset URLs (111:788) ──────────────────────────────────────
const imgBell  = 'https://www.figma.com/api/mcp/asset/3b5d6988-0fb2-43f3-918f-fe42d9955a6e'; // BellSimple
const imgArrow = 'https://www.figma.com/api/mcp/asset/102b963d-6885-4626-ba76-695f65854e40'; // ArrowRight (badge)


// ── Sub-components ──────────────────────────────────────────────────

function PerformanceBadge({
  label,
  borderCyan = true,
  onClick,
}: {
  label: string;
  borderCyan?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#d9fbff] rounded-[16px] pl-[8px] pr-[6px] py-[4px] flex gap-[4px] items-center shrink-0 border ${
        borderCyan ? 'border-[#00e6ff]' : 'border-black'
      }`}
    >
      <span className="font-normal text-[12px] leading-[16px] text-black whitespace-nowrap">
        {label}
      </span>
      {/* ArrowRight icon */}
      <div className="relative shrink-0 size-[14px]">
        <div className="absolute inset-[18.75%_12.5%]">
          <img alt="" className="absolute block max-w-none size-full" src={imgArrow} />
        </div>
      </div>
    </button>
  );
}

/**
 * Pure visual content of the Home page.
 * Used both as the live page and as a frozen backdrop behind flow bottom sheets.
 * Callbacks are optional — when omitted (frozen backdrop case) buttons are inert.
 */
function HomePageView({
  onDeposit,
  onSend,
  onTransfer,
}: {
  onDeposit?: () => void;
  onSend?: () => void;
  onTransfer?: () => void;
}) {
  const navigate     = useNavigate();
  const transactions = useAppStore(s => s.transactions);
  const userProfile  = useAppStore(s => s.userProfile);
  const homeTxs      = getTransactionsByContext(transactions, 'home');

  const username      = userProfile?.username ?? 'there';
  const displayName   = username.charAt(0).toUpperCase() + username.slice(1);
  const avatarLetter  = username[0].toUpperCase();

  return (
    <div className="flex flex-col bg-[#0a142f] pb-6">

      {/* ── 1. Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 pt-10 pb-4">
        {/* Avatar */}
        <div className="size-[40px] bg-[#262626] rounded-[20px] overflow-hidden shrink-0 flex items-center justify-center">
          <span className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-[#007bff]">
            {avatarLetter}
          </span>
        </div>

        {/* Greeting */}
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-[16px] leading-[20px] text-white whitespace-nowrap">
            Gm, {displayName}
          </p>
          <p className="font-medium text-[14px] leading-[18px] text-[#8ac7ff] whitespace-nowrap">
            Your money is working for you.
          </p>
        </div>

        {/* Bell + notification dot */}
        <div className="relative shrink-0 size-[24px]">
          <div className="absolute inset-[9.38%_12.5%_9.38%_12.51%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgBell} />
          </div>
          <div className="absolute -top-[1px] -right-[1px] size-[6px] bg-[#f44] rounded-[3px]" />
        </div>
      </div>

      {/* ── 2. Balance Card (carousel) ────────────────────────────── */}
      <BalanceCarousel
        onDeposit={onDeposit}
        onSend={onSend}
        onTransfer={onTransfer}
      />

      {/* ── 3. Savings Cards Row ──────────────────────────────────── */}
      <div className="flex gap-[10px] overflow-x-auto scrollbar-hide py-[10px] pl-6 pr-6">
        {/* Card 1: Goal-Based Savings */}
        <div
          className="bg-[#162040] rounded-[20px] overflow-hidden p-5 relative shrink-0 flex gap-[8px] items-start justify-end shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ width: 164, height: 134 }}
        >
          <PerformanceBadge label="Create New Goal" onClick={() => navigate('/save')} />
          <div className="absolute left-5 top-[60px] flex flex-col gap-[4px]">
            <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              Goal-Based Savings
            </p>
            <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] w-[133px]">
              Create a savings goal and track your progress
            </p>
          </div>
        </div>

        {/* Card 2: Rent goal */}
        <div
          className="bg-[#162040] rounded-[20px] overflow-hidden p-5 relative shrink-0 flex gap-[4px] items-start shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ width: 250, height: 134 }}
        >
          <div className="flex flex-col gap-[4px] shrink-0">
            <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              Rent
            </p>
            <p className="font-bold text-[24px] leading-[32px] text-white whitespace-nowrap">
              $1,200.00
            </p>
            <p className="font-normal text-[12px] leading-[16px] text-[#02d128] whitespace-nowrap">
              +4.2% this month
            </p>
            <p className="font-normal text-[12px] leading-[16px] text-[#8ac7ff] whitespace-nowrap">
              On track and growing
            </p>
          </div>
          <PerformanceBadge label="View Goals" onClick={() => navigate('/save')} />
        </div>
      </div>

      {/* ── 4. Investment Cards Row ───────────────────────────────── */}
      <div className="flex gap-[10px] overflow-x-auto scrollbar-hide py-[10px] pl-6 pr-6">
        {/* Card 1: USDC Vault */}
        <div
          className="bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden p-5 relative shrink-0 flex gap-[4px] items-start shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ width: 252, height: 134 }}
        >
          <div className="flex flex-col gap-[4px] shrink-0">
            <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              USDC Vault
            </p>
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white whitespace-nowrap">
              $4,847.50
            </p>
            <p className="font-normal text-[12px] leading-[16px] text-[#02d128] whitespace-nowrap">
              +8.5% this month
            </p>
            <p className="font-medium text-[12px] leading-[16px] text-[#8ac7ff] whitespace-nowrap">
              Growing daily
            </p>
          </div>
          <PerformanceBadge label="View Portfolio" borderCyan={false} onClick={() => navigate('/invest')} />
        </div>

        {/* Card 2: Stablecoin LP */}
        <div
          className="bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden p-5 relative shrink-0 flex gap-[4px] items-start shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]"
          style={{ width: 256, height: 134 }}
        >
          <div className="flex flex-col gap-[4px] shrink-0">
            <p className="font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              Stablecoin LP
            </p>
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-white whitespace-nowrap">
              $4,847.50
            </p>
            <p className="font-normal text-[12px] leading-[16px] text-[#02d128] whitespace-nowrap">
              +8.5% this month
            </p>
            <p className="font-medium text-[12px] leading-[16px] text-[#8ac7ff] whitespace-nowrap">
              Earning daily returns
            </p>
          </div>
          <PerformanceBadge label="View Portfolio" borderCyan={false} onClick={() => navigate('/invest')} />
        </div>
      </div>

      {/* ── 5. Recent Activities Card ─────────────────────────────── */}
      <div className="mx-6 mt-[6px] bg-[rgba(30,41,59,0.4)] rounded-[20px] overflow-hidden p-5 flex flex-col gap-[4px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-[4px]">
          <p className="font-medium text-[14px] leading-[18px] text-white">Recent Activities</p>
          <p className="font-medium text-[14px] leading-[18px] text-white">View All</p>
        </div>
        <TransactionList transactions={homeTxs} limit={4} />
      </div>

    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function HomePage() {
  const [showDeposit,  setShowDeposit]  = useState(false);
  const [showSend,     setShowSend]     = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const frozenBg = <HomePageView />;

  return (
    <>
      <HomePageView
        onDeposit={() => setShowDeposit(true)}
        onSend={() => setShowSend(true)}
        onTransfer={() => setShowWithdraw(true)}
      />

      {showDeposit && (
        <FlowPortal>
          <DepositFlow onExit={() => setShowDeposit(false)} background={frozenBg} />
        </FlowPortal>
      )}

      {showSend && (
        <FlowPortal>
          <SendFlow onExit={() => setShowSend(false)} background={frozenBg} />
        </FlowPortal>
      )}

      {showWithdraw && (
        <FlowPortal>
          <WithdrawFlow onExit={() => setShowWithdraw(false)} background={frozenBg} />
        </FlowPortal>
      )}
    </>
  );
}
