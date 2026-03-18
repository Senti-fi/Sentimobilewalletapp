/**
 * NewVaultPage
 * Figma frame 273:849 "New Vault"
 *
 * Layout:
 *   1. Header — ArrowLeft + "USDT Vault" + 3-dot menu
 *   2. Hero — vault icon (left) + risk/withdrawal tags (right)
 *   3. Description text
 *   4. Returns Highlight card (8.5% APY, centered)
 *   5. Segment toggle — "Why This Vault" / "Historical Performance"
 *   6. Feature cards (Why This Vault content)
 *   7. Trust Signals bar — Protocol / Security / TVL
 *   8. Lucy card — "Ask Lucy about this vault"
 *   9. CTA — "Deposit Now" + minimum deposit note
 *  10. FAB (portalled)
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import DepositFlow from '../../flows/invest/DepositFlow';
import type { VaultConfig } from '../../flows/invest/DepositFlow/types';

const USDT_VAULT: VaultConfig = {
  name:        'USDT Vault',
  asset:       'USDT',
  riskLabel:   'LOW',
  apy:         8.5,
  withdrawal:  'Instant anytime',
  minDeposit:  10,
  lucyConfirm: 'Great addition to your portfolio. This keeps your low-risk positions strong.',
  lucySuccess: "Your vault is growing. I'll keep an eye on performance and let you know if anything changes.",
};

// ── Figma asset URLs (273:849) ───────────────────────────────────────
const imgArrowLeft   = 'https://www.figma.com/api/mcp/asset/367d1e04-4022-44f3-9ae7-cad1e1b772b4'; // ArrowLeft        (imgVector5)
const imgDots        = 'https://www.figma.com/api/mcp/asset/bafe849d-1eea-4407-8fec-1bea157a932f'; // DotsThreeOutline (imgVector6)
const imgVaultIcon   = 'https://www.figma.com/api/mcp/asset/bdd3196c-56a4-4728-8846-70f6ef138dfc'; // USDT vault icon  (imgContainer2)
const imgProtocol    = 'https://www.figma.com/api/mcp/asset/c91c34fb-4923-40e4-9553-9b03f654488b'; // Sphere/Protocol  (imgVector7)
const imgShieldCheck = 'https://www.figma.com/api/mcp/asset/4c993823-b445-4af4-8953-d12d3d9a2ad0'; // ShieldCheck      (imgVector8)
const imgLock        = 'https://www.figma.com/api/mcp/asset/025e1988-bccc-4e70-8e46-743bba2bf8c3'; // LockSimple/TVL   (imgVector9)
const imgFabIcon     = 'https://www.figma.com/api/mcp/asset/3cd774c2-76fa-49b8-a538-0eb76d70a7e3'; // FAB icon         (imgContainer1)
const imgAutoComp    = 'https://www.figma.com/api/mcp/asset/a43be51c-7629-439d-ae5b-9564f18dc627'; // Auto-Compounding (imgSvg)
const imgProtocol2   = 'https://www.figma.com/api/mcp/asset/309bcfd5-624b-44ad-b4e6-9b3c90faa93f'; // Battle-Tested    (imgSvg1)
const imgInstant     = 'https://www.figma.com/api/mcp/asset/b38cf642-806d-42cd-a103-303a7310ebcf'; // Instant Access   (imgSvg2)
const imgArrowRight  = 'https://www.figma.com/api/mcp/asset/b880d7cb-b693-42f2-ae83-b279438a3031'; // ArrowRight Lucy  (imgVector10)

// ── Feature card data ────────────────────────────────────────────────

const FEATURES = [
  {
    icon:  imgAutoComp,
    title: 'Auto-Compounding',
    desc:  'Your earnings automatically reinvest to maximize returns.',
  },
  {
    icon:  imgProtocol2,
    title: 'Battle-Tested Protocol',
    desc:  "Secured by Aave — one of DeFi's most trusted protocols with $2.4B TVL.",
  },
  {
    icon:  imgInstant,
    title: 'Instant Access',
    desc:  'Withdraw anytime with no lock-up periods or waiting times.',
  },
] as const;

// ── FAB portalled to #root ───────────────────────────────────────────

function NewVaultFab() {
  const root = document.getElementById('root');
  if (!root) return null;
  return createPortal(
    <button className="absolute bg-[#007bff] bottom-[86px] content-stretch flex items-center justify-center right-[16px] rounded-[9999px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)] size-[56px] z-40">
      <div className="h-[19px] relative shrink-0 w-[22px]">
        <img alt="" className="absolute block max-w-none size-full" src={imgFabIcon} />
      </div>
      <div className="absolute bg-[#00e6ff] border-2 border-[#007bff] right-[-4px] rounded-[9999px] size-[16px] top-[-4px]" />
    </button>,
    root,
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function NewVaultPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'why' | 'history'>('why');
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <>
      {showDeposit && (
        <DepositFlow vault={USDT_VAULT} onExit={() => setShowDeposit(false)} />
      )}

      <NewVaultFab />

      <div className="flex flex-col bg-[#0a142f] pb-[100px]">

        {/* ── 1. Header ─────────────────────────────────────────────── */}
        <div className="content-stretch flex items-center justify-between left-[24px] px-6 pt-[68px] w-full">
          <button onClick={() => navigate(-1)} className="relative shrink-0 size-[24px]">
            <div className="absolute inset-[18.75%_12.5%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
            </div>
          </button>
          <p className="font-semibold leading-[20px] relative shrink-0 text-[16px] text-white whitespace-nowrap">
            USDT Vault
          </p>
          <button className="relative shrink-0 size-[24px]">
            <div className="absolute inset-[7.81%_39.06%]">
              <img alt="" className="absolute block max-w-none size-full" src={imgDots} />
            </div>
          </button>
        </div>

        {/* ── 2. Hero — icon + tags ──────────────────────────────────── */}
        <div className="flex items-center gap-[16px] mt-[28px] px-8">
          {/* Vault icon */}
          <div className="bg-[#1a3a6b] content-stretch flex items-center justify-center rounded-[9999px] shrink-0 size-[56px]">
            <div className="relative shrink-0 size-[33px]">
              <img alt="" className="absolute block max-w-none size-full" src={imgVaultIcon} />
            </div>
          </div>

          {/* Tag row */}
          <div className="content-stretch flex gap-[8px] items-center shrink-0">
            <div className="bg-[rgba(34,197,94,0.2)] border border-[rgba(34,197,94,0.3)] content-stretch flex flex-col items-start px-[13px] py-[5px] relative rounded-[9999px] shrink-0">
              <p className="font-normal leading-[16px] text-[#4ade80] text-[12px] whitespace-nowrap">
                Low Risk
              </p>
            </div>
            <div className="bg-[rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.3)] content-stretch flex flex-col items-start px-[13px] py-[5px] relative rounded-[9999px] shrink-0">
              <p className="font-normal leading-[16px] text-[#60a5fa] text-[12px] whitespace-nowrap">
                Instant Withdrawal
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Description ────────────────────────────────────────── */}
        <p className="font-semibold leading-[24px] mt-[16px] px-[32px] text-[16px] text-white w-full">
          Earn stable daily returns on your USDC. Fully managed, automatically compounding.
        </p>

        {/* ── 4. Returns Highlight card ─────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[rgba(255,255,255,0.05)] content-stretch flex flex-col gap-[8px] items-center justify-center leading-[0] mt-[16px] mx-auto pb-[17px] pt-[25.6px] px-[17px] rounded-[12px] w-[292px]">
          <p className="font-normal leading-[16px] relative shrink-0 text-[#9ca3af] text-[12px] whitespace-nowrap">
            Estimated Annual Returns
          </p>
          <p className="font-bold h-[36px] leading-[40px] relative shrink-0 text-[32px] text-white tracking-[-0.64px] whitespace-nowrap">
            8.5% APY
          </p>
          <p className="font-normal leading-[16px] relative shrink-0 text-[#9ca3af] text-[12px] whitespace-nowrap">
            AI-optimized, updated hourly
          </p>
        </div>

        {/* ── 5. Segment toggle ─────────────────────────────────────── */}
        <div className="bg-[#1a2540] content-stretch flex items-center justify-between mt-[16px] mx-6 p-[4px] rounded-[8px]">
          <button
            onClick={() => setTab('why')}
            className={`content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-0 px-[12px] py-[4px] rounded-[4px] ${
              tab === 'why' ? 'bg-[#2a3550]' : ''
            }`}
          >
            <p className={`font-normal leading-[normal] text-[12px] text-center whitespace-nowrap ${
              tab === 'why' ? 'text-white' : 'text-[rgba(255,255,255,0.5)]'
            }`}>
              Why This Vault
            </p>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-0 px-[12px] py-[4px] rounded-[4px] ${
              tab === 'history' ? 'bg-[#2a3550]' : ''
            }`}
          >
            <p className={`font-normal leading-[normal] text-[12px] text-center whitespace-nowrap ${
              tab === 'history' ? 'text-white' : 'text-[rgba(255,255,255,0.5)]'
            }`}>
              Historical Performance
            </p>
          </button>
        </div>

        {/* ── 6. Feature cards (Why This Vault) ─────────────────────── */}
        {tab === 'why' && (
          <div className="content-stretch flex flex-col gap-[16px] items-start mt-[12px] mx-6">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="bg-[rgba(255,255,255,0.05)] content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[12px] shrink-0 w-full"
              >
                {/* Icon avatar */}
                <div className="bg-[rgba(59,130,246,0.2)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]">
                  <div className="relative shrink-0 size-[16px]">
                    <img alt="" className="absolute block max-w-none size-full" src={f.icon} />
                  </div>
                </div>

                {/* Text */}
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[0] min-w-0 relative">
                  <p className="font-medium leading-[18px] relative shrink-0 text-[14px] text-white whitespace-nowrap">
                    {f.title}
                  </p>
                  <p className="font-normal leading-[16px] relative shrink-0 text-[#8ac7ff] text-[12px]">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historical Performance tab — placeholder */}
        {tab === 'history' && (
          <div className="flex items-center justify-center mt-[12px] mx-6 py-[40px]">
            <p className="font-normal text-[#8ac7ff] text-[14px] text-center">
              Historical performance chart coming soon.
            </p>
          </div>
        )}

        {/* ── 7. Trust Signals ──────────────────────────────────────── */}
        <div className="bg-[#1a2540] content-stretch flex gap-[16px] items-center mt-[24px] mx-6 p-[16px] rounded-[16px]">

          {/* Protocol */}
          <div className="border-[rgba(255,255,255,0.1)] border-r content-stretch flex flex-col gap-[4px] h-[35px] items-start pr-px shrink-0 w-[93.667px]">
            <div className="content-stretch flex gap-[4px] items-center justify-center relative w-full">
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[9.38%_9.38%_9.37%_9.37%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgProtocol} />
                </div>
              </div>
              <p className="font-normal leading-[normal] text-[10px] text-[rgba(255,255,255,0.5)] text-center uppercase whitespace-nowrap">
                Protocol
              </p>
            </div>
            <div className="content-stretch flex flex-col items-center w-full">
              <p className="font-bold h-[20px] leading-[20px] text-[14px] text-center text-white whitespace-nowrap">
                Aave
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="border-[rgba(255,255,255,0.1)] border-r content-stretch flex flex-col gap-[4px] h-[35px] items-start pr-px shrink-0 w-[93.667px]">
            <div className="content-stretch flex gap-[4px] items-center justify-center relative w-full">
              <div className="relative shrink-0 size-[12px]">
                <div className="absolute inset-[15.63%_12.5%_6.25%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgShieldCheck} />
                </div>
              </div>
              <p className="font-normal leading-[normal] text-[12px] text-[rgba(255,255,255,0.5)] text-center uppercase whitespace-nowrap">
                Security
              </p>
            </div>
            <div className="content-stretch flex flex-col items-center w-full">
              <p className="font-semibold leading-[normal] text-[14px] text-center text-[#4ade80] whitespace-nowrap">
                Audited
              </p>
            </div>
          </div>

          {/* TVL */}
          <div className="content-stretch flex flex-col gap-[4px] h-[35px] items-start shrink-0 w-[93.667px]">
            <div className="content-stretch flex gap-[4px] items-center justify-center relative w-full">
              <div className="relative shrink-0 size-[12px]">
                <div className="absolute inset-[3.13%_12.5%_12.5%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgLock} />
                </div>
              </div>
              <p className="font-normal leading-[normal] text-[12px] text-[rgba(255,255,255,0.5)] text-center uppercase whitespace-nowrap">
                TVL
              </p>
            </div>
            <div className="content-stretch flex flex-col items-center w-full">
              <p className="font-bold h-[20px] leading-[20px] text-[14px] text-center text-white whitespace-nowrap">
                $2.4B
              </p>
            </div>
          </div>

        </div>

        {/* ── 8. Lucy card ──────────────────────────────────────────── */}
        <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] content-stretch flex gap-[16px] items-center mt-[16px] mx-6 overflow-clip p-[20px] rounded-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
          {/* "L" avatar */}
          <div className="bg-[#007bff] content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative rounded-[9999px] shrink-0 size-[32px]">
            <p className="font-bold h-[20px] leading-[20px] text-[14px] text-center text-white">L</p>
          </div>

          {/* Content */}
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-w-0 relative">
            <p className="font-normal leading-[16px] min-w-full relative shrink-0 text-[12px] text-white">
              This vault suits your profile well. Low risk, instant access, steady returns.
            </p>
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
              <p className="font-medium leading-[18px] relative shrink-0 text-[#007bff] text-[14px] whitespace-nowrap">
                Ask Lucy about this vault
              </p>
              <div className="relative shrink-0 size-[14px]">
                <div className="absolute inset-[18.75%_12.5%]">
                  <img alt="" className="absolute block max-w-none size-full" src={imgArrowRight} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 9. CTA area ───────────────────────────────────────────── */}
        <div className="content-stretch flex flex-col gap-[8px] items-start mt-[16px] pb-[8px] pt-[16px] px-[24px] w-full">
          <button
            onClick={() => setShowDeposit(true)}
            className="bg-[#007bff] content-stretch flex items-center justify-center py-[16px] relative rounded-[16px] shrink-0 w-full"
          >
            <p className="font-semibold leading-[20px] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
              Deposit Now
            </p>
          </button>
          <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
            <p className="font-normal leading-[16px] relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap">
              Minimum deposit: $10
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
