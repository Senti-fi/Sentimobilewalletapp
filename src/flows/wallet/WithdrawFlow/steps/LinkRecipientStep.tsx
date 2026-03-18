/**
 * LinkRecipientStep
 *
 * Figma 317:4090 — Bottom sheet overlay on the frozen WalletPage.
 * Drag handle → large bold title + blue X close → search card → recent contacts.
 * Rendered inside a frozen-background wrapper (see WithdrawFlow index).
 */
import { useState } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';

const RECENT_CONTACTS = [
  { handle: '@magnifico',  displayName: 'Magnifico', initial: 'M' },
  { handle: '@adaeze',     displayName: 'Adaeze',    initial: 'A' },
  { handle: '@tope.senti', displayName: 'Tope',      initial: 'T' },
];

export default function LinkRecipientStep({ onNext, onExit }: StepProps<WithdrawFlowData>) {
  const [query, setQuery] = useState('');

  const handleSelect = (handle: string) => {
    onNext({ recipient: handle });
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length > 1) {
      onNext({ recipient: trimmed.startsWith('@') ? trimmed : `@${trimmed}` });
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div
        className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]"
        onClick={onExit}
      />

      {/* ── Bottom sheet ────────────────────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
        style={{ maxHeight: '88vh' }}
      >

        {/* Drag handle */}
        <div className="flex justify-center" style={{ marginTop: 16, marginBottom: 4 }}>
          <div
            className="bg-[rgba(255,255,255,0.18)] rounded-[9999px]"
            style={{ width: 36, height: 4 }}
          />
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5" style={{ marginTop: 20 }}>
          <div className="flex flex-col gap-[4px]">
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.6px] text-white">
              Send via Link
            </p>
            <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
              Send money instantly to any Senti user.
            </p>
          </div>
          {/* Close button — blue circle */}
          <button
            onClick={onExit}
            className="bg-[#8ac7ff] rounded-full size-[40px] flex items-center justify-center shrink-0"
          >
            <X size={16} className="text-[#0a142f]" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Scrollable content ──────────────────────────────────── */}
        <div className="overflow-y-auto scrollbar-hide px-5 pb-[40px]" style={{ marginTop: 24 }}>

          {/* Search card */}
          <div className="bg-[#1a2540] rounded-[20px] px-[24px] py-[16px] flex flex-col gap-[8px] mb-[12px]">
            <p className="font-medium text-[14px] leading-[20px] text-[#8ac7ff]">
              Find a Senti user
            </p>
            <div className="relative">
              <div className="bg-[#0a142f] border border-[#3c5679] rounded-[12px] h-[56px] flex items-center pl-[49px] pr-[17px]">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search @username or email"
                  className="flex-1 bg-transparent font-normal text-[16px] leading-[normal] text-white placeholder:text-[#8ac7ff] outline-none min-w-0"
                  autoFocus
                />
              </div>
              <div className="absolute left-[16px] top-1/2 -translate-y-1/2">
                <Search size={20} className="text-[#8ac7ff]" />
              </div>
            </div>
          </div>

          {/* Recent contacts card */}
          <div className="bg-[#1a2540] rounded-[20px] px-[24px] py-[16px] flex flex-col gap-[16px]">
            <p className="font-bold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#8ac7ff]">
              Recent
            </p>
            <div className="flex flex-col">
              {RECENT_CONTACTS.map((c, i) => (
                <button
                  key={c.handle}
                  onClick={() => handleSelect(c.handle)}
                  className={`flex items-center py-[16px] text-left w-full ${
                    i < RECENT_CONTACTS.length - 1
                      ? 'border-b border-[rgba(255,255,255,0.06)]'
                      : ''
                  }`}
                >
                  {/* Avatar with blue border */}
                  <div
                    className="relative rounded-full shrink-0 size-[48px] border-2 flex items-center justify-center"
                    style={{ borderColor: '#007bff', backgroundColor: '#0a142f' }}
                  >
                    <p className="font-bold text-[18px] leading-[28px] text-[#007bff] text-center">
                      {c.initial}
                    </p>
                  </div>

                  {/* Name + handle */}
                  <div className="flex-1 pl-[16px]">
                    <p className="font-semibold text-[16px] leading-[24px] text-white">
                      {c.displayName}
                    </p>
                    <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
                      {c.handle}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronRight size={20} className="text-[#8ac7ff] shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
