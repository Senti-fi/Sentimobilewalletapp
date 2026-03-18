/**
 * EnterRecipientStep
 *
 * Full-screen step for entering a recipient.
 * - method='link'    → @handle search with recent contacts
 * - method='address' → paste/scan crypto address + network selector
 */
import { useState } from 'react';
import type { StepProps } from '../../../savings/types';
import type { SendFlowData } from '../types';

const imgArrowLeft = 'https://www.figma.com/api/mcp/asset/ed32e853-f58f-4171-983f-a72c643e9975';
const imgClock     = 'https://www.figma.com/api/mcp/asset/08448048-fa2b-4a63-9b69-f5a75e435974';
const imgCopyIcon  = 'https://www.figma.com/api/mcp/asset/f1431496-c072-4b93-b8b5-d2b7bdea0936';

// Sample recent contacts (via link)
const RECENT_CONTACTS = [
  { handle: '@magnifico', initial: 'M', bg: '#1a3a6b' },
  { handle: '@sarah_k',   initial: 'S', bg: '#0d2a4a' },
  { handle: '@jaytee',    initial: 'J', bg: '#0a2040' },
];

type Network = 'solana' | 'ethereum';

export default function EnterRecipientStep({ data, onNext, onBack }: StepProps<SendFlowData>) {
  const isLink = data.method === 'link';

  const [input, setInput]     = useState('');
  const [network, setNetwork] = useState<Network>('solana');

  const title = isLink ? 'Send via Link' : 'Send to Address';

  const canContinue = isLink
    ? input.trim().startsWith('@') && input.trim().length > 1
    : input.trim().length > 10;

  const handleContinue = () => {
    onNext({ recipient: input.trim() });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      // clipboard access denied
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a142f]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0">
          <div className="absolute inset-[18.75%_12.5%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgArrowLeft} />
          </div>
        </button>
        <p className="font-semibold text-[16px] leading-[20px] text-white">{title}</p>
        <button className="relative size-[24px] shrink-0">
          <div className="absolute inset-[9.36%_9.36%_9.43%_9.43%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgClock} />
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[32px]">

        {/* ── Network selector (address only) ───────────────────── */}
        {!isLink && (
          <div className="flex gap-[12px] justify-center mb-[24px]">
            {(['solana', 'ethereum'] as Network[]).map(n => (
              <button
                key={n}
                onClick={() => setNetwork(n)}
                className={`rounded-full px-[16px] py-[9px] font-semibold text-[14px] leading-[20px] capitalize ${
                  network === n
                    ? 'bg-[#007bff] text-white'
                    : 'bg-[#1a2540] border border-[#262626] text-[#8ac7ff] font-medium'
                }`}
              >
                {n.charAt(0).toUpperCase() + n.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* ── Input field ────────────────────────────────────────── */}
        <div className="bg-[#1a2540] border border-[#262626] rounded-[12px] px-[17px] py-[9px] flex items-center gap-[12px]">
          {isLink && (
            <p className="font-semibold text-[16px] leading-[20px] text-[#8ac7ff] shrink-0">@</p>
          )}
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isLink ? 'Enter Senti username' : `Paste ${network} address`}
            className="flex-1 bg-transparent font-normal text-[14px] leading-[20px] text-white placeholder:text-[#3c5679] outline-none min-w-0"
            autoFocus
          />
          {!isLink && (
            <button onClick={handlePaste} className="shrink-0">
              <div className="relative shrink-0" style={{ width: 14.167, height: 16.667 }}>
                <img alt="Paste" className="absolute block max-w-none size-full" src={imgCopyIcon} />
              </div>
            </button>
          )}
        </div>

        {/* ── Recent contacts (link only) ────────────────────────── */}
        {isLink && (
          <div className="mt-[28px]">
            <p className="font-semibold text-[14px] leading-[18px] text-[#8ac7ff] mb-[16px]">
              Recent
            </p>
            <div className="flex flex-col gap-[0]">
              {RECENT_CONTACTS.map((c, i) => (
                <button
                  key={c.handle}
                  onClick={() => setInput(c.handle)}
                  className={`flex items-center gap-[16px] py-[14px] text-left w-full ${
                    i < RECENT_CONTACTS.length - 1 ? 'border-b border-[#1a2540]' : ''
                  }`}
                >
                  <div
                    className="size-[40px] rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.bg }}
                  >
                    <p className="font-bold text-[16px] leading-[20px] text-white">
                      {c.initial}
                    </p>
                  </div>
                  <p className="font-normal text-[14px] leading-[20px] text-white">
                    {c.handle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Lucy card ─────────────────────────────────────────── */}
        <div className="mt-[24px] bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] flex items-center gap-[16px] overflow-hidden shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] px-5 py-5">
          <div className="bg-[#007bff] rounded-full size-8 flex items-center justify-center shrink-0">
            <p className="text-white font-bold text-[14px] leading-[20px]">L</p>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-white flex-1">
            {isLink
              ? 'Only send to Senti users you trust. Transfers are instant and irreversible.'
              : `Double-check the address before sending. Crypto sent to the wrong address cannot be recovered.`}
          </p>
        </div>

      </div>

      {/* ── Continue button ───────────────────────────────────────── */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[16px] py-[16px] flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Continue
          </p>
        </button>
      </div>

    </div>
  );
}
