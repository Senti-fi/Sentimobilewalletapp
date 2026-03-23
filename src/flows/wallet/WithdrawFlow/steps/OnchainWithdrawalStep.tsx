/**
 * OnchainWithdrawalStep
 *
 * Figma 312:3334 — asset selector, recipient address, network, amount, warning, preview button.
 */
import { useState } from 'react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';
import { useAppStore } from '../../../../store';

const imgArrowLeft   = 'https://www.figma.com/api/mcp/asset/270e5c70-8b11-4bcb-b5dc-ae9d75d2b150';
const imgClock       = 'https://www.figma.com/api/mcp/asset/7227d2b1-d19c-49e4-9f5c-624851175a58';
const imgPaste       = 'https://www.figma.com/api/mcp/asset/b13730f7-8b07-475f-8cb7-1f7d154376bc';
const imgWarning     = 'https://www.figma.com/api/mcp/asset/ca734576-75ee-4b41-893f-bbd8ebfcbb06';

type Asset   = 'USDC' | 'USDT' | 'SOL';
type Network = 'Solana' | 'Ethereum' | 'BNB Chain';

const ASSETS:    Asset[]   = ['USDC', 'USDT', 'SOL'];
const NETWORKS:  Network[] = ['Solana', 'Ethereum', 'BNB Chain'];

export default function OnchainWithdrawalStep({ data, onNext, onBack }: StepProps<WithdrawFlowData>) {
  const [asset,      setAsset]      = useState<Asset>(data.asset ?? 'USDC');
  const [address,    setAddress]    = useState(data.address ?? '');
  const [network,    setNetwork]    = useState<Network>(data.network ?? 'Solana');
  const [amount,     setAmount]     = useState(data.amount === '0' ? '' : (data.amount ?? ''));
  const [pasteError, setPasteError] = useState(false);

  const balances         = useAppStore(s => s.balances);
  const availableBalance = balances[asset];

  const canContinue = address.trim().length > 10 && amount.trim().length > 0 && parseFloat(amount) > 0;

  const handlePaste = async () => {
    setPasteError(false);
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setAddress(text); return; }
    } catch { /* permission denied or API unavailable */ }
    // Clipboard read failed (common on Android without explicit permission)
    setPasteError(true);
    setTimeout(() => setPasteError(false), 3000);
  };

  const handlePreview = () => {
    onNext({ asset, address: address.trim(), network, amount: amount.trim() });
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
        <p className="font-semibold text-[16px] leading-[20px] text-white">Onchain Withdrawal</p>
        <button className="relative size-[24px] shrink-0">
          <div className="absolute inset-[9.36%_9.36%_9.43%_9.43%]">
            <img alt="" className="absolute block max-w-none size-full" src={imgClock} />
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[28px]">

        {/* ── Select Asset ──────────────────────────────────────── */}
        <div className="flex flex-col gap-[12px] mb-[24px]">
          <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">Select Asset</p>
          <div className="flex items-center gap-[8px]">
            {ASSETS.map(a => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={`px-[24px] py-[9px] rounded-full text-[14px] leading-[20px] text-white ${
                  asset === a
                    ? 'bg-[#007bff]'
                    : 'bg-[#1a2540] border border-[#374151]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="font-normal text-[14px] leading-[20px] text-[#9ca3af]">
            Available balance:{' '}
          <span className="text-white">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset}
          </span>
          </p>
        </div>

        {/* ── Recipient Wallet Address ──────────────────────────── */}
        <div className="flex flex-col gap-[8px] mb-[24px]">
          <p className="font-normal text-[14px] leading-[20px] text-white">Recipient Wallet Address</p>
          <div className="relative">
            <div className="bg-[#1a2540] h-[56px] rounded-[12px] flex items-center pl-[16px] pr-[48px]">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter wallet address"
                className="flex-1 bg-transparent font-normal text-[16px] leading-[normal] text-white placeholder:text-[#6b7280] outline-none min-w-0"
              />
            </div>
            <button
              onClick={handlePaste}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 shrink-0"
            >
              <div className="relative size-[20px]">
                <img alt="Paste" draggable="false" className="absolute block max-w-none size-full" src={imgPaste} />
              </div>
            </button>
          </div>
          {pasteError && (
            <p className="font-normal text-[12px] leading-[16px] text-[#ffb020] mt-1">
              Paste access denied — please long-press the field and paste manually.
            </p>
          )}
        </div>

        {/* ── Network ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-[8px] mb-[24px]">
          <p className="font-normal text-[14px] leading-[20px] text-white">Network</p>
          <div className="flex items-center gap-[8px]">
            {NETWORKS.map(n => (
              <button
                key={n}
                onClick={() => setNetwork(n)}
                className={`px-[16px] py-[9px] rounded-[8px] text-[14px] leading-[20px] text-white ${
                  network === n
                    ? 'bg-[#007bff]'
                    : 'bg-[#1a2540] border border-[#374151]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* ── Amount ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-[8px] mb-[24px]">
          <div className="flex items-center justify-between">
            <p className="font-normal text-[14px] leading-[20px] text-white">Amount</p>
            <button onClick={() => setAmount(String(availableBalance))}>
              <p className="font-bold text-[14px] leading-[20px] text-[#007bff]">MAX</p>
            </button>
          </div>
          <div className="bg-[#1a2540] h-[56px] rounded-[12px] flex items-center px-[16px]">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="$0.00"
              className="flex-1 bg-transparent font-normal text-[18px] leading-[normal] text-white placeholder:text-[#6b7280] outline-none min-w-0"
            />
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-[#9ca3af]">
            ≈ {amount ? parseFloat(amount).toFixed(2) : '0'} {asset}
          </p>
        </div>

        {/* ── Warning ──────────────────────────────────────────── */}
        <div className="bg-[#2a1f0a] border border-[#3d2f0a] rounded-[12px] px-[17px] py-[16px] flex gap-[12px] items-start mb-[24px]">
          <div className="relative shrink-0 size-[20px] mt-[2px]">
            <img alt="" className="absolute block max-w-none size-full" src={imgWarning} />
          </div>
          <p className="font-normal text-[14px] leading-[17.5px] text-[#ffb020]">
            Double check the wallet address and network. Sending to the wrong address cannot be reversed.
          </p>
        </div>

      </div>

      {/* ── Preview Withdrawal button ─────────────────────────── */}
      <div className="px-6 pb-8 pt-4 shrink-0">
        <button
          onClick={handlePreview}
          disabled={!canContinue}
          className="bg-[#007bff] rounded-[16px] py-[16px] flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-semibold text-[16px] leading-[20px] text-white text-center">
            Preview Withdrawal
          </p>
        </button>
      </div>

    </div>
  );
}
