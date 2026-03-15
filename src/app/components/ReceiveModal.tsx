import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useAccount, useWallet } from '@getpara/react-sdk-lite';

interface ReceiveModalProps {
  onClose: () => void;
}

// Generate a deterministic QR-like pattern from address string
function generateQRPattern(address: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

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
        const seed = (x * 31 + y * 17 + hash) & 0xFFFF;
        grid[y][x] = (seed % 3) !== 0;
      }
    }
  }

  return grid;
}

export default function ReceiveModal({ onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const { embedded } = useAccount();
  const wallet = useWallet();

  const authUserId = embedded?.userId || wallet?.userId || wallet?.id || '';
  const walletAddress =
    wallet?.address ||
    (authUserId ? localStorage.getItem(`senti_wallet_address_${authUserId}`) : null) ||
    localStorage.getItem('senti_wallet_address') ||
    '';

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-senti-bg w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-lg font-semibold">Receive Money</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-senti-text-secondary" />
            </button>
          </div>

          <div className="space-y-6">
            {/* QR Code */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-senti-card border border-senti-card-border rounded-2xl p-6 flex items-center justify-center"
            >
              <div className="bg-white p-4 rounded-xl">
                <div
                  className="grid gap-0"
                  style={{
                    gridTemplateColumns: `repeat(${qrPattern.length}, 1fr)`,
                    width: '180px',
                    height: '180px'
                  }}
                >
                  {qrPattern.map((row, y) =>
                    row.map((cell, x) => (
                      <div key={`${x}-${y}`} className={cell ? 'bg-gray-900' : 'bg-white'} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <div>
              <label className="block text-senti-text-muted mb-2 text-center text-sm">Your Wallet Address</label>
              <div className="bg-senti-card border border-senti-card-border rounded-xl p-4 flex items-center gap-3">
                <p className="flex-1 text-white break-all text-sm font-mono">{walletAddress}</p>
                <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                  {copied ? <Check className="w-5 h-5 text-senti-green" /> : <Copy className="w-5 h-5 text-senti-text-secondary" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="py-4 bg-senti-cyan text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy Address
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="py-4 bg-senti-card border border-senti-card-border text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </div>

            {/* Info */}
            <div className="bg-senti-cyan/10 border border-senti-cyan/30 rounded-xl p-4">
              <p className="text-sm text-senti-cyan">
                <span className="font-medium">Tip:</span> Share this address or QR code with anyone who wants to send you crypto.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
