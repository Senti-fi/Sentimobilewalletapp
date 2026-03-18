/**
 * ChooseSavingsStyle
 * Figma frame: 168:424 "Goal modal"
 *
 * Frame: 393×800px, bg #0a142f, rounded top corners 24px (bottom sheet).
 * Rendered full-screen via FlowPortal — navigation logic unchanged.
 */

// ── Figma asset URLs (168:424) — valid 7 days ────────────────────────
const imgFlexibleIcon  = 'https://www.figma.com/api/mcp/asset/87e15d7d-69ed-4cb7-8343-99ab62df1c64'; // 16×20px
const imgGoalIcon      = 'https://www.figma.com/api/mcp/asset/5d5c6c5e-f77b-4073-b750-d7fa4c32247a'; // 20×20px
const imgCommittedIcon = 'https://www.figma.com/api/mcp/asset/5e73111a-6f7a-4f60-931b-106fecdbe2ba'; // 16×21px
const imgArrowRight    = 'https://www.figma.com/api/mcp/asset/7ec3387a-88ba-4169-a9ac-c9d849575b6d'; // 14×14px

interface Props {
  onSelect: (flow: 'flexible' | 'goal' | 'locked') => void;
  onBack: () => void;
}

export default function ChooseSavingsStyle({ onSelect }: Props) {
  return (
    // Frame: bg #0a142f, top-radius 24px, full height, overflow hidden
    <div className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] overflow-hidden h-full flex flex-col">

      {/* ── Indicator bar: centered, top 16px, 40×4px, #8ac7ff, radius 8px ── */}
      <div className="flex justify-center" style={{ paddingTop: 16 }}>
        <div className="bg-[#8ac7ff] rounded-[8px]" style={{ width: 40, height: 4 }} />
      </div>

      {/* ── Title: Urbanist Bold 24px / lh 32px / tracking -0.48px / white ──
           Figma top-edge ≈ 44px from frame top (center y=60, height=32)
           Gap from indicator bottom (20px) = 24px                          */}
      <h1
        className="text-white font-bold text-[24px] leading-[32px] tracking-[-0.48px]"
        style={{ paddingLeft: 24, paddingRight: 24, marginTop: 24 }}
      >
        How do you want to save?
      </h1>

      {/* ── Subtitle: Manrope Regular 14px / lh normal / #8ac7ff
           Gap from title bottom = 8px (title ends at ~76px, subtitle at 84px) */}
      <p
        className="text-[#8ac7ff] text-[14px] leading-normal"
        style={{ paddingLeft: 24, paddingRight: 24, marginTop: 8 }}
      >
        Pick what works for you right now. You can always change later.
      </p>

      {/* ── Lucy card: left 24px, top 134px (gap from subtitle ≈ 12px)
           bg #162040, border rgba(0,123,255,0.2), radius 20px, p 20px
           shadow 0 4 16 rgba(0,0,0,0.06), gap 16px, flex row items-center ── */}
      <div
        className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] flex items-center gap-4 overflow-hidden"
        style={{ marginLeft: 24, marginRight: 24, marginTop: 12, padding: 20 }}
      >
        {/* Avatar: bg #007bff, 32×32px, radius 9999px */}
        <div
          className="bg-[#007bff] rounded-full flex items-center justify-center shrink-0"
          style={{ width: 32, height: 32 }}
        >
          {/* "L": Manrope Bold 14px / lh 20px / white */}
          <span className="text-white font-bold text-[14px] leading-[20px]">L</span>
        </div>
        {/* Text: Urbanist Regular 12px / lh 16px / white */}
        <p className="text-white font-normal text-[12px] leading-[16px] flex-1 min-w-0">
          Based on your balance, starting with Flexible Savings is a great first move.
        </p>
      </div>

      {/* ── Mode Cards Container: left 24px, right 24px, top 230px
           gap 12px between cards                                            ── */}
      <div
        className="flex flex-col"
        style={{ marginLeft: 24, marginRight: 24, marginTop: 24, gap: 12 }}
      >
        {/* ── Flexible Savings card ─────────────────────────────────────
             bg #1a2540, border #262626, radius 24px, h 162px, relative    ── */}
        <button
          onClick={() => onSelect('flexible')}
          className="bg-[#1a2540] border border-[#262626] rounded-[24px] relative text-left w-full"
          style={{ height: 162 }}
        >
          {/* Icon + Badge row: left 20, right 20, top 20, flex justify-between */}
          <div className="absolute flex items-start justify-between" style={{ left: 20, right: 20, top: 20 }}>
            {/* Icon container: 40×40px, radius 8px, bg rgba(0,230,255,0.1) */}
            <div
              className="bg-[rgba(0,230,255,0.1)] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ width: 40, height: 40 }}
            >
              {/* Icon: 16×20px */}
              <div className="relative" style={{ width: 16, height: 20 }}>
                <img alt="" className="absolute block max-w-none size-full" src={imgFlexibleIcon} />
              </div>
            </div>
            {/* Badge: bg rgba(0,230,255,0.2), pill, px 8 py 4 */}
            <div className="bg-[rgba(0,230,255,0.2)] rounded-[9999px] shrink-0" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
              {/* Text: Urbanist Bold 10px / lh 15px / #00e6ff / uppercase / tracking 0.5px */}
              <span className="text-[#00e6ff] font-bold text-[10px] leading-[15px] uppercase tracking-[0.5px]">
                Most Accessible
              </span>
            </div>
          </div>
          {/* Title: Urbanist Bold 18px / lh 28px / white — top 68 */}
          <p className="absolute text-white font-bold text-[18px] leading-[28px]" style={{ left: 20, right: 20, top: 68 }}>
            Flexible Savings
          </p>
          {/* Description: Urbanist Regular 14px / lh 20px / #94a3b8 — top 100, h 40 */}
          <p className="absolute text-[#94a3b8] font-normal text-[14px] leading-[20px]" style={{ left: 20, right: 20, top: 100, height: 40 }}>
            Lower returns, full access. Deposit and withdraw anytime, no lock period.
          </p>
        </button>

        {/* ── Goal Savings card ─────────────────────────────────────── */}
        <button
          onClick={() => onSelect('goal')}
          className="bg-[#1a2540] border border-[#262626] rounded-[24px] relative text-left w-full"
          style={{ height: 162 }}
        >
          <div className="absolute flex items-start justify-between" style={{ left: 20, right: 20, top: 20 }}>
            {/* Icon container: 40×40px, radius 8px, bg rgba(0,123,255,0.1) */}
            <div
              className="bg-[rgba(0,123,255,0.1)] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ width: 40, height: 40 }}
            >
              {/* Icon: 20×20px */}
              <div className="relative" style={{ width: 20, height: 20 }}>
                <img alt="" className="absolute block max-w-none size-full" src={imgGoalIcon} />
              </div>
            </div>
            {/* Badge: bg rgba(0,123,255,0.2), text #007bff */}
            <div className="bg-[rgba(0,123,255,0.2)] rounded-[9999px] shrink-0" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
              <span className="text-[#007bff] font-bold text-[10px] leading-[15px] uppercase tracking-[0.5px]">
                Most Popular
              </span>
            </div>
          </div>
          <p className="absolute text-white font-bold text-[18px] leading-[28px]" style={{ left: 20, right: 20, top: 68 }}>
            Goal Savings
          </p>
          <p className="absolute text-[#94a3b8] font-normal text-[14px] leading-[20px]" style={{ left: 20, right: 20, top: 100, height: 40 }}>
            Save toward something specific. Track your progress along the way.
          </p>
        </button>

        {/* ── Committed Savings card ────────────────────────────────── */}
        <button
          onClick={() => onSelect('locked')}
          className="bg-[#1a2540] border border-[#262626] rounded-[24px] relative text-left w-full"
          style={{ height: 162 }}
        >
          <div className="absolute flex items-start justify-between" style={{ left: 20, right: 20, top: 20 }}>
            {/* Icon container: 40×40px, radius 8px, bg rgba(138,199,255,0.1) */}
            <div
              className="bg-[rgba(138,199,255,0.1)] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ width: 40, height: 40 }}
            >
              {/* Icon: 16×21px */}
              <div className="relative" style={{ width: 16, height: 21 }}>
                <img alt="" className="absolute block max-w-none size-full" src={imgCommittedIcon} />
              </div>
            </div>
            {/* Badge: bg rgba(138,199,255,0.2), text #8ac7ff */}
            <div className="bg-[rgba(138,199,255,0.2)] rounded-[9999px] shrink-0" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
              <span className="text-[#8ac7ff] font-bold text-[10px] leading-[15px] uppercase tracking-[0.5px]">
                Best Returns
              </span>
            </div>
          </div>
          <p className="absolute text-white font-bold text-[18px] leading-[28px]" style={{ left: 20, right: 20, top: 68 }}>
            Committed Savings
          </p>
          <p className="absolute text-[#94a3b8] font-normal text-[14px] leading-[20px]" style={{ left: 20, right: 20, top: 100, height: 40 }}>
            Lock your money and earn more. Best for money you won't need soon.
          </p>
        </button>
      </div>

      {/* ── Footer: centered, gap 10px, h 56px, p 20px, radius 12px
           "Not sure? Ask Lucy" Urbanist Medium 14px / lh 18px / white
           ArrowRight 14×14px                                               ── */}
      <div
        className="flex items-center justify-center rounded-[12px]"
        style={{ height: 56, gap: 10, padding: 20, marginTop: 'auto' }}
      >
        <span className="text-white font-medium text-[14px] leading-[18px] whitespace-nowrap">
          Not sure? Ask Lucy
        </span>
        {/* ArrowRight: 14×14px, inner vector inset 18.75% 12.5% */}
        <div className="relative shrink-0" style={{ width: 14, height: 14 }}>
          <div className="absolute" style={{ inset: '18.75% 12.5%' }}>
            <img alt="" className="absolute block max-w-none size-full" src={imgArrowRight} />
          </div>
        </div>
      </div>

    </div>
  );
}
