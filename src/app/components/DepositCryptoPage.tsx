import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Copy, Check, AlertTriangle } from 'lucide-react';
import { useAccount, useWallet } from '@getpara/react-sdk-lite';

// Generate a deterministic QR-like pattern from address string
function generateQRPattern(address: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  const drawFinderPattern = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (y === 0 || y === 6 || x === 0 || x === 6) {
          grid[startY + y][startX + x] = true;
        } else if (y >= 2 && y <= 4 && x >= 2 && x <= 4) {
          grid[startY + y][startX + x] = true;
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(size - 7, 0);
  drawFinderPattern(0, size - 7);

  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inTopLeftFinder = x < 8 && y < 8;
      const inTopRightFinder = x >= size - 8 && y < 8;
      const inBottomLeftFinder = x < 8 && y >= size - 8;
      const isTimingH = y === 6 && x >= 8 && x < size - 8;
      const isTimingV = x === 6 && y >= 8 && y < size - 8;

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !isTimingH && !isTimingV) {
        const seed = (x * 31 + y * 17 + hash) & 0xffff;
        grid[y][x] = seed % 3 !== 0;
      }
    }
  }

  return grid;
}

interface DepositCryptoPageProps {
  onBack: () => void;
}

export default function DepositCryptoPage({ onBack }: DepositCryptoPageProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<'solana' | 'ethereum'>('solana');
  const [copied, setCopied] = useState(false);

  const { embedded } = useAccount();
  const wallet = useWallet();

  const authUserId = embedded?.userId || wallet?.userId || wallet?.id || '';
  const walletAddress =
    wallet?.address ||
    (authUserId ? localStorage.getItem(`senti_wallet_address_${authUserId}`) : null) ||
    localStorage.getItem('senti_wallet_address') ||
    '';

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
    : '';

  const qrPattern = useMemo(() => generateQRPattern(walletAddress), [walletAddress]);

  const handleCopy = async () => {
    const textArea = document.createElement('textarea');
    textArea.value = walletAddress;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      console.log('Copy failed');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-senti-bg max-w-md mx-auto">
      {/* Header */}
      <div className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Deposit Crypto</h1>
        <button className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-senti-text-secondary" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Description */}
        <p className="text-center text-senti-text-secondary text-sm mt-2 mb-5">
          Send crypto to your Senti wallet address. Only send supported assets on the correct network.
        </p>

        {/* Network Toggle */}
        <div className="flex justify-center gap-2 mb-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedNetwork('solana')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedNetwork === 'solana'
                ? 'bg-senti-cyan text-white'
                : 'bg-senti-card border border-senti-card-border text-senti-text-secondary'
            }`}
          >
            Solana
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedNetwork('ethereum')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedNetwork === 'ethereum'
                ? 'bg-senti-cyan text-white'
                : 'bg-senti-card border border-senti-card-border text-senti-text-secondary'
            }`}
          >
            Ethereum
          </motion.button>
        </div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-senti-card border border-senti-card-border rounded-2xl p-6 flex flex-col items-center mb-5"
        >
          <div className="bg-white p-4 rounded-xl mb-4">
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${qrPattern.length}, 1fr)`,
                width: '200px',
                height: '200px',
              }}
            >
              {qrPattern.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={cell ? 'bg-gray-900' : 'bg-white'}
                  />
                ))
              )}
            </div>
          </div>
          <p className="text-senti-text-secondary text-sm">Scan to deposit USDC</p>
        </motion.div>

        {/* Address Display */}
        <div className="bg-senti-card border border-senti-card-border rounded-2xl p-4 mb-4">
          <p className="text-xs text-senti-cyan uppercase tracking-wider mb-2">
            {selectedNetwork === 'solana' ? 'SOLANA' : 'ETHEREUM'} NETWORK
          </p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white text-sm font-mono">{truncatedAddress}</p>
            <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              {copied ? (
                <Check className="w-4 h-4 text-senti-green" />
              ) : (
                <Copy className="w-4 h-4 text-senti-text-secondary" />
              )}
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="w-full py-3 border border-senti-cyan rounded-xl text-senti-cyan text-sm font-medium"
          >
            Copy Address
          </motion.button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            Only send USDC on the {selectedNetwork === 'solana' ? 'Solana' : 'Ethereum'} network.
            Sending other assets may result in permanent loss.
          </p>
        </div>
      </div>
    </div>
  );
}
