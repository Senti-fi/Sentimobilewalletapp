import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Wallet,
  Lock,
  Unlock,
  X,
  Sparkles
} from 'lucide-react';

interface CardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardDrawer({ isOpen, onClose }: CardDrawerProps) {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock card data
  const cardNumber = '4532 •••• •••• 8901';
  const cardNumberFull = '4532 1234 5678 8901';
  const cardExpiry = '12/27';
  const cardCVV = '***';
  const cardCVVFull = '123';
  const cardholderName = 'Alex Johnson';

  const handleCopy = (text: string, field: string) => {
    const showSuccess = () => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showSuccess).catch(() => {
        // Fallback to execCommand
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          showSuccess();
        } catch {
          // Don't show false success if copy truly failed
        }
      });
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess();
      } catch {
        // Silently fail
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 px-6 py-6 text-white z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl">My Card</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/80">Manage your Senti Card</p>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Virtual Card Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                {/* Card */}
                <div className={`relative bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-3xl p-6 shadow-2xl transition-all duration-300 ${isCardFrozen ? 'opacity-50 grayscale' : ''}`}>
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full translate-y-20 -translate-x-20" />
                  </div>

                  {/* Card Content */}
                  <div className="relative text-white">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl">Senti</h3>
                      <CreditCard className="w-8 h-8" />
                    </div>

                    {/* Card Number */}
                    <div className="mb-6">
                      <p className="text-xl tracking-wider mb-1">
                        {showCardDetails ? cardNumberFull : cardNumber}
                      </p>
                    </div>

                    {/* Card Details */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-white/70 mb-1">Cardholder</p>
                        <p className="text-sm">{cardholderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/70 mb-1">Expires</p>
                        <p className="text-sm">{cardExpiry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/70 mb-1">CVV</p>
                        <p className="text-sm">{showCardDetails ? cardCVVFull : cardCVV}</p>
                      </div>
                    </div>
                  </div>

                  {/* Frozen Overlay */}
                  {isCardFrozen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-900" />
                        <span className="text-gray-900 text-sm">Card Frozen</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Card Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-3"
              >
                <button
                  onClick={() => setShowCardDetails(!showCardDetails)}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col items-center gap-2">
                    {showCardDetails ? (
                      <EyeOff className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-700" />
                    )}
                    <span className="text-xs text-gray-700">
                      {showCardDetails ? 'Hide' : 'View'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setIsCardFrozen(!isCardFrozen)}
                  className={`rounded-2xl p-4 border shadow-sm transition-all ${
                    isCardFrozen 
                      ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
                      : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {isCardFrozen ? (
                      <Unlock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-700" />
                    )}
                    <span className="text-xs text-gray-700">
                      {isCardFrozen ? 'Unfreeze' : 'Freeze'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleCopy(cardNumberFull.replace(/\s/g, ''), 'cardNumber')}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Copy className={`w-5 h-5 ${copiedField === 'cardNumber' ? 'text-green-600' : 'text-gray-700'}`} />
                    <span className={`text-xs ${copiedField === 'cardNumber' ? 'text-green-600' : 'text-gray-700'}`}>
                      {copiedField === 'cardNumber' ? 'Copied!' : 'Copy'}
                    </span>
                  </div>
                </button>
              </motion.div>

              {/* Add to Wallet Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3"
              >
                <button className="bg-black text-white rounded-2xl p-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm">Add to Apple Pay</span>
                </button>

                <button className="bg-white border border-gray-200 text-gray-900 rounded-2xl p-4 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm">Add to Google Pay</span>
                </button>
              </motion.div>

              {/* Card Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-gray-900 text-sm mb-1">Spend Anywhere</h4>
                    <p className="text-xs text-gray-700">
                      Use your Senti Card online, in-store, or add it to Apple Pay and Google Pay for contactless payments.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card Limits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <h3 className="text-gray-900">Card Limits</h3>
                
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Daily Spending Limit</span>
                    <span className="text-gray-900">$5,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/4" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">$1,200 used today</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">ATM Withdrawal Limit</span>
                    <span className="text-gray-900">$1,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">No withdrawals today</p>
                </div>
              </motion.div>

              {/* Card Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <h3 className="text-gray-900 mb-3">Card Settings</h3>
                
                <button className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Replace Card</span>
                    <span className="text-xs text-gray-500">Lost or damaged?</span>
                  </div>
                </button>

                <button className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Set PIN</span>
                    <span className="text-xs text-gray-500">Update your PIN</span>
                  </div>
                </button>

                <button className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-red-300 hover:shadow-md transition-all text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Cancel Card</span>
                    <span className="text-xs text-gray-500">Permanently disable</span>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}