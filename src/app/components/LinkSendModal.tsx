import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, DollarSign, Info, AlertCircle } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change: number;
  changePercent: number;
  color: string;
  gradient: string;
  icon: string;
}

interface LinkSendModalProps {
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatar: string;
    color: string;
  };
  assets: Asset[];
  onTransactionComplete: (amount: number, asset: string, failed: boolean, gasFee: number) => void;
}

export default function LinkSendModal({ onClose, recipient, assets, onTransactionComplete }: LinkSendModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [error, setError] = useState<string>('');

  // Get current asset balance
  const getCurrentAsset = () => assets.find(a => a.symbol === asset);
  const currentAsset = getCurrentAsset();
  const availableBalance = currentAsset?.balance || 0;

  // Calculate mock gas fee (0.5% of amount, no minimum)
  const calculateGasFee = (sendAmount: number): number => {
    if (!sendAmount) return 0;
    return sendAmount * 0.005; // Pure 0.5% with no floor
  };

  const gasFee = calculateGasFee(parseFloat(amount) || 0);
  const totalWithGas = (parseFloat(amount) || 0) + gasFee;

  const handleSend = () => {
    setError('');

    const sendAmount = parseFloat(amount);
    if (!amount || sendAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate balance (amount + gas must be <= available)
    if (totalWithGas > availableBalance) {
      setError(`Insufficient ${asset} balance (need ${totalWithGas.toFixed(2)} including gas)`);
      return;
    }

    setIsProcessing(true);
    setHasFailed(false);

    // No random failure for MVP - always succeed
    const willFail = false;

    // Simulate transaction processing
    setTimeout(() => {
      setIsProcessing(false);

      if (willFail) {
        setHasFailed(true);
        onTransactionComplete(parseFloat(amount), asset, true, gasFee);
        // Auto-close on failure after showing error
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setIsSuccess(true);
        onTransactionComplete(parseFloat(amount), asset, false, gasFee);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Processing Screen */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Loader className="w-16 h-16 text-blue-600" />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Linking Payment</h3>
              <p className="text-gray-600 text-center">Processing your transaction...</p>
            </motion.div>
          )}

          {/* Success Screen */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircle className="w-16 h-16 text-green-500" />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Payment Linked!</h3>
              <p className="text-gray-600 text-center mb-6">Successfully linked to {recipient.name}</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-900">${amount} {asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To</span>
                  <span className="text-gray-900">{recipient.id}</span>
                </div>
                {note && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Note</span>
                    <span className="text-gray-900">{note}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Failure Screen */}
          {hasFailed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="mb-6"
              >
                <X className="w-16 h-16 text-red-500" />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Payment Failed!</h3>
              <p className="text-gray-600 text-center mb-6">Failed to link to {recipient.name}</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-900">${amount} {asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To</span>
                  <span className="text-gray-900">{recipient.id}</span>
                </div>
                {note && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Note</span>
                    <span className="text-gray-900">{note}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Send Form */}
          {!isProcessing && !isSuccess && !hasFailed && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Link Money</h2>
                  <p className="text-sm text-gray-500">To {recipient.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Recipient Info */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${recipient.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                      {recipient.avatar}
                    </div>
                    <div>
                      <p className="text-gray-900">{recipient.name}</p>
                      <p className="text-sm text-gray-600">{recipient.id}</p>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-gray-600 text-sm mb-3">Amount to send</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-gray-400" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError('');
                        }}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <select
                      value={asset}
                      onChange={(e) => {
                        setAsset(e.target.value);
                        setError('');
                      }}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="SOL">SOL</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Available: {availableBalance.toFixed(2)} {asset}
                    {amount && parseFloat(amount) > 0 && (
                      <span className="text-gray-400 ml-2">
                        (Est. gas: {gasFee.toFixed(4)} {asset})
                      </span>
                    )}
                  </p>
                </div>

                {/* Note (Optional) */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-gray-600 text-sm mb-3">Note (optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's this for?"
                    className="w-full bg-transparent focus:outline-none text-gray-900"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Fee Info */}
                <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900">Instant delivery using Senti IDs</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Network gas fee ({gasFee.toFixed(4)} {asset}) deducted from your {asset} balance
                    </p>
                  </div>
                </div>

                {/* Send Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Link ${amount || '0'} {asset}
                </motion.button>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((quickAmount) => (
                    <motion.button
                      key={quickAmount}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="py-2 px-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      ${quickAmount}
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}