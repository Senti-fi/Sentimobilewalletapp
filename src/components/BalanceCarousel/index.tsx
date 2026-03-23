/**
 * BalanceCarousel
 * Persistent swipeable carousel at the top of AppShell on /home, /save, /invest.
 *
 * - 3 slides: Net Worth (Home) · Total Savings (Save) · Portfolio (Invest)
 * - Swipe left  → navigate to next primary route
 * - Swipe right → navigate to previous primary route
 * - Active slide is always derived from current pathname (route-synced)
 * - Bottom nav tab taps also update the active slide (same mechanism)
 *
 * Height: 16px (pt-4) + 196px (card) + 8px (pb-2) = 220px
 * Parent (AppShell) pins main content below this component at top: 220px.
 */
import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  getNetWorth,
  getTotalSavings,
  getTotalInvestments,
  getTotalInvested,
  getTotalEarned,
  getActiveInvestments,
} from '../../store/selectors';

// ── Constants ────────────────────────────────────────────────────────
const ROUTES      = ['/home', '/save', '/invest'] as const;
const CARD_H      = 196;
const SWIPE_THRESHOLD = 50;  // px — minimum horizontal delta to trigger navigation

// ── Figma asset URLs ─────────────────────────────────────────────────
// Wave backgrounds (one per slide to stay consistent with originals)
const imgWaveHome = 'https://www.figma.com/api/mcp/asset/554fb027-bbfe-4aa2-b3c0-3268aa7378cc';
const imgWaveSave = 'https://www.figma.com/api/mcp/asset/7467768c-0b77-49b1-8564-04b4336a8ca5';
const imgWaveInv  = 'https://www.figma.com/api/mcp/asset/8a89975a-dfcc-4c22-8b57-5c2ed8a966b4';
// Home slide action pill icons
const imgPlus     = 'https://www.figma.com/api/mcp/asset/34d7cfc2-4c82-4321-9219-0e880f788476';
const imgSend     = 'https://www.figma.com/api/mcp/asset/6df65f14-63d0-40bf-8a30-67d5b544ced8';
const imgTransfer = 'https://www.figma.com/api/mcp/asset/4f47db2a-5f95-4708-bd1f-1214a0a37cd3';

// ── Helpers ──────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Shared sub-components ────────────────────────────────────────────

/** Two decorative wave images used as card background art */
function WaveBgs({ src }: { src: string }) {
  return (
    <>
      <div className="absolute inset-[0_12.46%_-17.22%_0] pointer-events-none">
        <img alt="" className="absolute block max-w-none size-full" src={src} />
      </div>
      <div className="absolute inset-[0_-75.07%_-17.22%_87.54%] pointer-events-none">
        <img alt="" className="absolute block max-w-none size-full" src={src} />
      </div>
    </>
  );
}

/**
 * 3-dot carousel indicator.
 * Active dot: 12×4px pill (bg-[#2c14dd]).  Inactive: 4×4px circle (white).
 * Positioned at top-[116px] inside each card — matches original Figma placement.
 */
function CarouselDots({ active }: { active: number }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[116px] flex items-end gap-[4px]">
      {ROUTES.map((_, i) =>
        i === active ? (
          <div key={i} className="w-[12px] h-[4px] bg-[#2c14dd] rounded-[9px]" />
        ) : (
          <div key={i} className="size-[4px] bg-white rounded-[4px]" />
        )
      )}
    </div>
  );
}

// ── Slides ───────────────────────────────────────────────────────────

function HomeSlide({
  netWorth,
  active,
  onDeposit,
  onSend,
  onTransfer,
}: {
  netWorth: number;
  active: number;
  onDeposit?: () => void;
  onSend?: () => void;
  onTransfer?: () => void;
}) {
  return (
    <div
      className="relative bg-[#007bff] rounded-[20px] overflow-hidden"
      style={{ height: CARD_H }}
    >
      <WaveBgs src={imgWaveHome} />

      {/* Balance info — top-left */}
      <div className="absolute left-5 top-5 flex flex-col gap-[8px] w-[157px]">
        <p className="font-normal text-[12px] leading-[16px] text-white">Net Worth</p>
        <p className="font-bold text-[32px] leading-[32px] tracking-[-0.64px] text-white">
          ${fmt(netWorth)}
        </p>
        <div className="flex items-center gap-[3px] font-semibold text-[12px] leading-[16px] whitespace-nowrap">
          <span className="text-white">Today&apos;s Earnings</span>
          <span className="text-[#32fc65]">+$146.30 (+2.4%)</span>
        </div>
      </div>

      <CarouselDots active={active} />

      {/* Action pills */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[140px] flex items-center gap-[8px]">
        <button onClick={onDeposit} className="bg-[#007bff] border border-[#b3fbff] rounded-[22px] px-[12px] py-[10px] flex items-center gap-[8px] shrink-0">
          <div className="relative shrink-0 size-[16px]">
            <div className="absolute inset-[10.94%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgPlus} />
            </div>
          </div>
          <span className="font-normal text-[12px] leading-[16px] text-white">Deposit</span>
        </button>
        <button onClick={onSend} className="bg-[#007bff] border border-[#b3fbff] rounded-[22px] px-[12px] py-[10px] flex items-center gap-[8px] shrink-0">
          <div className="relative shrink-0 size-[16px]">
            <div className="absolute inset-[4.68%_7.81%_10.94%_7.8%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgSend} />
            </div>
          </div>
          <span className="font-normal text-[12px] leading-[16px] text-white">Send</span>
        </button>
        <button onClick={onTransfer} className="bg-[#007bff] border border-[#b3fbff] rounded-[22px] px-[12px] py-[10px] flex items-center gap-[8px] shrink-0">
          <div className="relative shrink-0 size-[16px]">
            <div className="absolute inset-[7.81%_7.81%_1.55%_1.57%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgTransfer} />
            </div>
          </div>
          <span className="font-normal text-[12px] leading-[16px] text-white">Transfer</span>
        </button>
      </div>
    </div>
  );
}

function SaveSlide({
  totalSaved,
  goalCount,
  active,
  onSaveNow,
}: {
  totalSaved: number;
  goalCount: number;
  active: number;
  onSaveNow?: () => void;
}) {
  return (
    <div
      className="relative bg-[#007bff] rounded-[20px] overflow-hidden"
      style={{ height: CARD_H }}
    >
      <WaveBgs src={imgWaveSave} />

      {/* Balance info — top-left */}
      <div className="absolute left-5 top-5 flex flex-col gap-[8px] w-[157px]">
        <p className="font-normal text-[12px] leading-[16px] text-white">Total Savings</p>
        <p className="font-bold text-[32px] leading-[32px] tracking-[-0.64px] text-white">
          ${fmt(totalSaved)}
        </p>
        <p className="font-semibold text-[12px] leading-[16px] text-white whitespace-nowrap">
          Across {goalCount} goal{goalCount !== 1 ? 's' : ''} · 1 locked
        </p>
      </div>

      {/* +4.2% badge — top-right */}
      <div className="absolute bg-[rgba(0,230,255,0.4)] left-[218px] top-5 flex items-center justify-center px-[8px] py-[4px] rounded-[16px]">
        <p className="font-semibold text-[12px] leading-[16px] text-[#00e6ff] whitespace-nowrap">
          +4.2% this month
        </p>
      </div>

      <CarouselDots active={active} />

      {/* Save Now pill */}
      <button
        onClick={onSaveNow}
        className="absolute left-5 top-[140px] bg-[#0a142f] border border-[#b3fbff] rounded-[22px] flex items-center gap-[8px] pl-[14px] pr-[16px] py-[10px]"
      >
        <p className="font-normal text-[12px] leading-[16px] text-white whitespace-nowrap">
          Save Now
        </p>
      </button>
    </div>
  );
}

function InvestSlide({
  active,
  totalValue,
  totalInvested,
  totalEarned,
  positionCount,
}: {
  active: number;
  totalValue: number;
  totalInvested: number;
  totalEarned: number;
  positionCount: number;
}) {
  return (
    <div
      className="relative bg-gradient-to-b from-[#007bff] to-[#0a142f] rounded-[20px] overflow-hidden"
      style={{ height: CARD_H }}
    >
      <WaveBgs src={imgWaveInv} />

      {/* Value block — top-left */}
      <div className="absolute left-5 top-5 flex flex-col gap-[8px] w-[157px]">
        <p className="font-normal text-[12px] leading-[16px] text-white">Total Portfolio Value</p>
        <p className="font-bold text-[32px] leading-[32px] tracking-[-0.64px] text-white">
          ${fmt(totalValue)}
        </p>
      </div>

      {/* Earned badge — top-right (only when there are positions) */}
      {totalEarned > 0 && (
        <div className="absolute bg-[#0a3040] left-[218px] top-5 flex items-center justify-center px-[8px] py-[4px] rounded-[16px]">
          <p className="font-semibold text-[12px] leading-[16px] text-[#00e6ff] whitespace-nowrap">
            +${fmt(totalEarned)}
          </p>
        </div>
      )}

      {/* Metrics row — border-t at top-[92px] */}
      <div className="absolute border-t border-[rgba(255,255,255,0.2)] left-[25px] right-[20px] top-[92px] pt-[14px] flex items-center justify-between">
        <div className="flex-1 flex flex-col gap-[4px] items-center min-w-0">
          <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
            Invested
          </p>
          <p className="font-normal text-[14px] leading-[20px] text-white whitespace-nowrap">
            ${fmt(totalInvested)}
          </p>
        </div>
        <div className="bg-[rgba(255,255,255,0.2)] h-[32px] w-px shrink-0" />
        <div className="flex-1 flex flex-col gap-[4px] items-center min-w-0">
          <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
            Earned
          </p>
          <p className="font-medium text-[14px] leading-[18px] text-[#00e6ff] whitespace-nowrap">
            +${fmt(totalEarned)}
          </p>
        </div>
        <div className="bg-[rgba(255,255,255,0.2)] h-[32px] w-px shrink-0" />
        <div className="flex-1 flex flex-col gap-[4px] items-center min-w-0">
          <p className="font-normal text-[12px] leading-[16px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
            Positions
          </p>
          <p className="font-normal text-[14px] leading-[20px] text-white whitespace-nowrap">
            {positionCount} Active
          </p>
        </div>
      </div>

      <CarouselDots active={active} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function BalanceCarousel({
  onSaveNow,
  onDeposit,
  onSend,
  onTransfer,
}: {
  onSaveNow?: () => void;
  onDeposit?: () => void;
  onSend?: () => void;
  onTransfer?: () => void;
} = {}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const balances        = useAppStore(s => s.balances);
  const goals           = useAppStore(s => s.goals);
  const flexibleSavings = useAppStore(s => s.flexibleSavings);
  const lockedSavings   = useAppStore(s => s.lockedSavings);
  const investments     = useAppStore(s => s.investments);

  const activeIndex = ROUTES.indexOf(pathname as (typeof ROUTES)[number]);

  const [dragDelta, setDragDelta]   = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);

  // Don't render on non-primary routes
  if (activeIndex === -1) return null;

  // ── Derived financials (single source of truth) ───────────────────
  const netWorth         = getNetWorth({ balances, goals, flexibleSavings, lockedSavings, investments });
  const totalSaved       = getTotalSavings(goals, flexibleSavings, lockedSavings);
  const totalValue       = getTotalInvestments(investments);
  const totalInvested    = getTotalInvested(investments);
  const totalEarned      = getTotalEarned(investments);
  const positionCount    = getActiveInvestments(investments).length;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    // Apply elastic resistance at the first/last slides
    const atStart = activeIndex === 0 && delta > 0;
    const atEnd   = activeIndex === ROUTES.length - 1 && delta < 0;
    setDragDelta((atStart || atEnd) ? delta * 0.25 : delta);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    setIsDragging(false);
    setDragDelta(0);

    if (delta < -SWIPE_THRESHOLD && activeIndex < ROUTES.length - 1) {
      navigate(ROUTES[activeIndex + 1]);
    } else if (delta > SWIPE_THRESHOLD && activeIndex > 0) {
      navigate(ROUTES[activeIndex - 1]);
    }
  };

  /**
   * Track is 300% wide; each slide is exactly 1/3 of the track = 100% of the container.
   * translateX(-N * 33.333%) shifts by N container widths to the left.
   * dragDelta (px) is added so the user sees the slide move in real-time while swiping.
   */
  const trackTranslate = `calc(-${(activeIndex * 100) / 3}% + ${dragDelta}px)`;

  return (
    /* Overflow-hidden clip + gesture capture area */
    <div
      className="overflow-hidden"
      style={{ height: CARD_H, touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Track: 3 slides side-by-side */}
      <div
        className="flex"
        style={{
          width: '300%',
          transform: `translateX(${trackTranslate})`,
          transition: isDragging ? 'none' : 'transform 300ms ease',
        }}
      >
        <div style={{ width: 'calc(100% / 3)' }} className="px-6">
          <HomeSlide netWorth={netWorth} active={activeIndex} onDeposit={onDeposit} onSend={onSend} onTransfer={onTransfer} />
        </div>
        <div style={{ width: 'calc(100% / 3)' }} className="px-6">
          <SaveSlide totalSaved={totalSaved} goalCount={goals.length} active={activeIndex} onSaveNow={onSaveNow} />
        </div>
        <div style={{ width: 'calc(100% / 3)' }} className="px-6">
          <InvestSlide
            active={activeIndex}
            totalValue={totalValue}
            totalInvested={totalInvested}
            totalEarned={totalEarned}
            positionCount={positionCount}
          />
        </div>
      </div>
    </div>
  );
}
