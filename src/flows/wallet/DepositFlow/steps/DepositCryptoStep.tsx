/**
 * DepositCryptoStep — Figma frame 302:1706 "via crypto"
 *
 * Full-screen step: QR code, network selector, address card, warning.
 * No "continue" — user copies address and taps back.
 */
import { useState } from 'react';
import { ArrowLeft, Clock, QrCode, Copy, AlertTriangle } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { DepositFlowData } from '../../types';

const WALLET_ADDRESS = '0x1a2b3c4d...5e6f7g8h';

type Network = 'solana' | 'ethereum';

export default function DepositCryptoStep({ onBack }: StepProps<DepositFlowData>) {
  const [network, setNetwork] = useState<Network>('solana');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
    } catch { /* API unavailable — user can copy manually */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a142f] overflow-y-auto scrollbar-hide">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-[68px] pb-0 shrink-0">
        <button onClick={onBack} className="relative size-[24px] shrink-0 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="font-semibold text-[16px] leading-[20px] text-white">Deposit Crypto</p>
        <button className="relative size-[24px] shrink-0 flex items-center justify-center">
          <Clock size={18} className="text-[#8ac7ff]" />
        </button>
      </div>

      {/* ── Subtitle ───────────────────────────────────────────── */}
      <p className="font-normal text-[14px] leading-[22.75px] text-[#8ac7ff] text-center px-6 mt-[12px] shrink-0">
        Send crypto to your Senti wallet address. Only send supported assets on the correct network.
      </p>

      {/* ── Network selector ───────────────────────────────────── */}
      <div className="flex gap-[12px] justify-center mt-[18px] shrink-0">
        <button
          onClick={() => setNetwork('solana')}
          className={`rounded-full px-[16px] py-[9px] font-semibold text-[14px] leading-[20px] text-center ${
            network === 'solana'
              ? 'bg-[#007bff] text-white'
              : 'bg-[#1a2540] border border-[#262626] text-[#8ac7ff]'
          }`}
          style={{ width: 104.67 }}
        >
          Solana
        </button>
        <button
          onClick={() => setNetwork('ethereum')}
          className={`rounded-full px-[17px] py-[9px] font-medium text-[14px] leading-[20px] text-center ${
            network === 'ethereum'
              ? 'bg-[#007bff] text-white font-semibold'
              : 'bg-[#1a2540] border border-[#262626] text-[#8ac7ff]'
          }`}
          style={{ width: 106.67 }}
        >
          Ethereum
        </button>
      </div>

      {/* ── QR Code card ───────────────────────────────────────── */}
      <div className="mx-6 bg-white rounded-[16px] p-[24px] flex flex-col items-center mt-[18px] shrink-0 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <QrCode size={200} className="text-[#262626]" />
        <p className="font-semibold text-[14px] leading-[20px] text-[#262626] mt-[16px]">
          Scan to deposit USDC
        </p>
      </div>

      {/* ── Wallet Address card ─────────────────────────────────── */}
      <div className="mx-6 bg-[#1a2540] border border-[#262626] rounded-[12px] px-[17px] py-[9px] flex flex-col gap-[16px] mt-[16px] shrink-0">
        <div className="flex flex-col gap-[4px]">
          <p className="font-medium text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#8ac7ff]">
            {network === 'solana' ? 'Solana Network' : 'Ethereum Network'}
          </p>
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff] font-mono truncate pr-4">
              {WALLET_ADDRESS}
            </p>
            <button onClick={handleCopy} className="shrink-0">
              <Copy size={14} className="text-[#8ac7ff]" />
            </button>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="border border-[#007bff] rounded-[12px] py-[13px] flex items-center justify-center w-full"
        >
          <p className="font-bold text-[14px] leading-[20px] text-[#007bff] text-center">
            {copied ? 'Copied!' : 'Copy Address'}
          </p>
        </button>
      </div>

      {/* ── Warning ─────────────────────────────────────────────── */}
      <div className="mx-6 bg-[#2a1f0a] border border-[#3d2f0a] rounded-[12px] p-[17px] flex gap-[12px] items-start mt-[16px] mb-6 shrink-0">
        <AlertTriangle size={20} className="text-[#ffb020] shrink-0 mt-[1px]" />
        <p className="font-normal text-[12px] leading-[18px] text-[#ffb020] flex-1">
          Only send USDC on the {network === 'solana' ? 'Solana' : 'Ethereum'} network. Sending other assets may result in permanent loss.
        </p>
      </div>

    </div>
  );
}
