import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import LucyChip from './LucyChip';

interface ReceiveModalProps {
  onClose: () => void;
}

export default function ReceiveModal({ onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6"
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
            {/* QR Code placeholder */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex items-center justify-center"
            >
              <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-sm ${
                        Math.random() > 0.5 ? 'bg-blue-600' : 'bg-white'
                      }`}
                    />
                  ))}
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