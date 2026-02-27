import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, PiggyBank, Wallet, CreditCard, CheckCircle, Loader } from 'lucide-react';

interface SavingsTransferModalProps {
  onClose: () => void;
  onTransfer: (amount: number, asset: string, destination: string) => void;
  savingsBalance: number;
}

export default function SavingsTransferModal({ onClose, onTransfer, savingsBalance }: SavingsTransferModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');
  const [destination, setDestination] = useState<'wallet' | 'spend'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // For this demo, we'll assume all savings are in the selected asset
  const availableBalance = savingsBalance;

  const handleTransfer = () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance) return;

    setIsProcessing(true);

    setTimeout(() => {
      onTransfer(parseFloat(amount), asset, destination);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  const setMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const destinationLabel = destination === 'wallet' ? 'Main Wallet' : 'Spend Account';

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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Processing Screen */}
          {isProcessing && (
            <div className="p-6">
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
                  <Loader className="w-16 h-16 text-cyan-600" />
                </motion.div>
                <h3 className="text-gray-900 mb-2">Transferring from Savings</h3>
                <p className="text-gray-600 text-center">Moving {amount} {asset} to {destinationLabel}...</p>
              </motion.div>
            </div>
          )}

          {/* Success Screen */}
          {isSuccess && (
            <div className="p-6">
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
                <h3 className="text-gray-900 mb-2">Transfer Successful!</h3>
                <p className="text-gray-600 text-center">
                  {amount} {asset} moved to {destinationLabel}
                </p>
              </motion.div>
            </div>
          )}

          {/* Main Form */}
          {!isProcessing && !isSuccess && (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-gray-900">Transfer from Savings</h2>
                  <p className="text-sm text-gray-500">Move funds to Wallet or Spend</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Destination Selection */}
                <div>
                  <label className="block text-gray-700 text-sm mb-3">Transfer to</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDestination('wallet')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        destination === 'wallet'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          destination === 'wallet'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gray-100'
                        }`}>
                          <Wallet className={`w-6 h-6 ${destination === 'wallet' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className="text-sm text-gray-900">Main Wallet</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setDestination('spend')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        destination === 'spend'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100 bg-white hover:border-purple-200'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          destination === 'spend'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gray-100'
                        }`}>
                          <CreditCard className={`w-6 h-6 ${destination === 'spend' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className="text-sm text-gray-900">Spend</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Transfer Flow Visual */}
                <div className="flex items-center justify-between bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-200">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <PiggyBank className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xs text-gray-600">Savings</p>
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                    <ArrowRight className="w-6 h-6 text-cyan-600" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      destination === 'wallet'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {destination === 'wallet' ? (
                        <Wallet className="w-7 h-7 text-white" />
                      ) : (
                        <CreditCard className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{destinationLabel}</p>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-gray-600 text-sm">Amount to transfer</label>
                      <button
                        onClick={setMaxAmount}
                        className="text-xs text-cyan-600 hover:text-cyan-700 px-2 py-1 rounded-md hover:bg-cyan-50 transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoFocus
                      />
                      <select
                        value={asset}
                        onChange={(e) => setAsset(e.target.value)}
                        className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="SOL">SOL</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Available to Use: {availableBalance.toFixed(2)} {asset}</p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    💡 Instant transfer with no fees. Your funds will be available immediately in {destinationLabel}.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Transfer {amount || '0'} {asset}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
