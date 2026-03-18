/**
 * FlexibleSavingsFlow › Step 3 — Savings Setup Success
 * Figma frame: 191:1060 composite → bottom sheet node 191:1131
 *
 * Sheet: 393×572px, bg-[#0a142f], rounded-tl-[24px] rounded-tr-[24px]
 * The blur overlay + frozen background are rendered by FlexibleSavingsFlow (parent).
 * This component renders only the success sheet.
 *
 * Vertical rhythm (from sheet top):
 *   success icon   top 48     (size-80, bg-[#1a3a6b] rounded-full)
 *   title          center 167 (Bold 24px)
 *   subtitle       center 209 (Regular 14px, #8ac7ff, w-309)
 *   details card   top 252    (bg-[#1a2540], rounded-12, p-16, gap-16, w-345)
 *   lucy card      top 340    (gap-8, p-20, w-345)
 *   CTA button     top 436    (bg-[#007bff], h-56, w-345)
 *   Save More link top 504    (Regular 14px, #8ac7ff)
 */
import type { StepProps, FlexibleSavingsData } from '../../types';

// Figma asset URL (191:1060) — success icon (target/bullseye)
const imgSuccessIcon = 'https://www.figma.com/api/mcp/asset/16361afb-b6b8-44b2-adca-9faadc8abca7';

export default function SuccessStep({ data, onBack, onExit, onDismiss }: StepProps<FlexibleSavingsData>) {
  const amount  = parseFloat(data.amount || '0');
  const formatted = `$${amount.toFixed(2)}`;

  return (
    /* Tap backdrop → dismiss to step 0 (Flexible Savings page), NOT exit flow */
    <div className="absolute inset-0 flex flex-col justify-end" onClick={onDismiss ?? onExit}>
      <div className="flex-1" />

      {/* ── Bottom sheet (572px, matches Figma 191:1131) ──────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] overflow-hidden flex flex-col items-center shrink-0"
        style={{ height: 572 }}
        onClick={e => e.stopPropagation()}
      >

        {/* Success icon — bg-[#1a3a6b] rounded-full size-80, top 48 */}
        <div
          className="bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0"
          style={{ width: 80, height: 80, marginTop: 48 }}
        >
          <div className="relative shrink-0" style={{ width: 33.333, height: 33.333 }}>
            <img alt="" className="absolute block max-w-none size-full" src={imgSuccessIcon} />
          </div>
        </div>

        {/* Title — Bold 24px / lh 32px / tracking -0.48px */}
        <p
          className="text-white font-bold text-[24px] leading-[32px] tracking-[-0.48px] text-center"
          style={{ marginTop: 23 }}
        >
          Saved Successfully
        </p>

        {/* Subtitle — Regular 14px / lh 20px / #8ac7ff / w-309 */}
        <p
          className="text-[#8ac7ff] font-normal text-[14px] leading-[20px] text-center"
          style={{ width: 309, marginTop: 16 }}
        >
          {`${formatted} has been added to your Flexible Savings. It's available whenever you need it.`}
        </p>

        {/* Details card — bg-[#1a2540], rounded-12, p-16, gap-16, w-345 */}
        <div
          className="bg-[#1a2540] rounded-[12px] flex flex-col shrink-0"
          style={{ width: 345, padding: 16, gap: 16, marginTop: 16 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Amount Saved</p>
            <p className="text-white font-medium text-[14px] leading-[20px]">{formatted}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">Available From</p>
            <p className="text-white font-medium text-[14px] leading-[20px]">Immediately</p>
          </div>
        </div>

        {/* Lucy card — rounded-20, p-20, gap-8, w-345 */}
        <div
          className="flex items-center rounded-[20px] shrink-0"
          style={{
            width: 345,
            padding: 20,
            gap: 8,
            marginTop: 16,
            boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="bg-[#007bff] rounded-[20px] flex items-center justify-center shrink-0"
            style={{ width: 20, height: 20 }}
          >
            <span className="text-white font-normal text-[14px] leading-[20px]">L</span>
          </div>
          <p className="text-[#8ac7ff] font-normal text-[12px] leading-[16px] flex-1">
            Great start. I&apos;ll let you know when your balance hits $100.
          </p>
        </div>

        {/* Back to Savings CTA — bg-[#007bff], h-56, w-345 */}
        <button
          onClick={onExit}
          className="bg-[#007bff] rounded-[12px] flex items-center justify-center shrink-0"
          style={{ width: 345, height: 56, marginTop: 24 }}
        >
          <span className="text-white font-semibold text-[16px] leading-[20px]">
            Back to Savings
          </span>
        </button>

        {/* Save More — Regular 14px / #8ac7ff */}
        <button onClick={onBack} style={{ marginTop: 12 }}>
          <span className="text-[#8ac7ff] font-normal text-[14px] leading-[20px]">
            Save More
          </span>
        </button>

      </div>
    </div>
  );
}
