import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ReceiveModalProps {
  onClose: () => void;
}

// Generate a deterministic QR-like pattern from address string
function generateQRPattern(address: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Create finder patterns (the three large squares in corners)
  const drawFinderPattern = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        // Outer border
        if (y === 0 || y === 6 || x === 0 || x === 6) {
          grid[startY + y][startX + x] = true;
        }
        // Inner square
        else if (y >= 2 && y <= 4 && x >= 2 && x <= 4) {
          grid[startY + y][startX + x] = true;
        }
      }
    }
  };

  // Draw three finder patterns
  drawFinderPattern(0, 0);       // Top-left
  drawFinderPattern(size - 7, 0); // Top-right
  drawFinderPattern(0, size - 7); // Bottom-left

  // Add timing patterns (alternating dots between finders)
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Generate deterministic data modules from address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash;
  }

  // Fill data area with deterministic pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip finder pattern areas and timing patterns
      const inTopLeftFinder = x < 8 && y < 8;
      const inTopRightFinder = x >= size - 8 && y < 8;
      const inBottomLeftFinder = x < 8 && y >= size - 8;
      const isTimingH = y === 6 && x >= 8 && x < size - 8;
      const isTimingV = x === 6 && y >= 8 && y < size - 8;

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !isTimingH && !isTimingV) {
        // Use deterministic pattern based on position and address hash
        const seed = (x * 31 + y * 17 + hash) & 0xFFFF;
        grid[y][x] = (seed % 3) !== 0;
      }
    }
  }

  return grid;
}

export default function ReceiveModal({ onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const walletAddress = localStorage.getItem('senti_wallet_address') || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  // Generate QR pattern once based on address
  const qrPattern = useMemo(() => generateQRPattern(walletAddress), [walletAddress]);

  const handleCopy = async () => {
    // Use the fallback method directly for better compatibility
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
    } catch (err) {
      // Silently fail - just don't show the copied state
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">Receive Money</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-6">
            {/* QR Code */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center justify-center"
            >
              <div className="bg-white p-3 rounded-lg">
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
                      <div
                        key={`${x}-${y}`}
                        className={cell ? 'bg-gray-900' : 'bg-white'}
                      />
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <div>
              <label className="block text-gray-600 mb-2 text-center">Your Wallet Address</label>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <p className="flex-1 text-gray-900 break-all text-sm font-mono">
                  {walletAddress}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy Address
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Tip:</span> Share this address or QR code with anyone who wants to send you crypto. All stablecoins are supported.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}