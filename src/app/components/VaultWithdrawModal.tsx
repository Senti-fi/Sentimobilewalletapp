import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, ArrowDownToLine } from 'lucide-react';
import { formatCompactBalance } from '../utils/formatBalance';

interface VaultWithdrawModalProps {
  onClose: () => void;
  vaultBalance: number;
  onWithdraw: (amount: number, asset: string) => void;
}

export default function VaultWithdrawModal({ onClose, vaultBalance, onWithdraw }: VaultWithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    
    // Call the withdraw handler after a short delay to simulate transaction
    setTimeout(() => {
      onWithdraw(parseFloat(amount), asset);
      setIsProcessing(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 2000);
  };

  const setMaxAmount = () => {
    setAmount(vaultBalance.toString());
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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
              <h3 className="text-gray-900 mb-2">Processing Withdrawal</h3>
              <p className="text-gray-600 text-center">Withdrawing your funds to main wallet...</p>
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
              <h3 className="text-gray-900 mb-2">Withdrawal Successful!</h3>
              <p className="text-gray-600 text-center mb-6">Funds transferred to your main wallet</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Withdrawn</span>
                  <span className="text-gray-900">{amount} {asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="text-gray-900">Main Wallet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="text-gray-900 text-sm">0x4a2b...9e1c</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Withdraw Form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Withdraw from Vault</h2>
                  <p className="text-sm text-gray-500">Transfer to Main Wallet</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Vault Balance Info */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-600 mb-1">Available Vault Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl text-gray-900">${formatCompactBalance(vaultBalance)}</h3>
                    <span className="text-sm text-gray-500">available</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Funds will be transferred to your main wallet</p>
                </div>

                {/* Amount Input */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-gray-600 text-sm">Amount to withdraw</label>
                    <button
                      onClick={setMaxAmount}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
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
                    />
                    <select
                      value={asset}
                      onChange={(e) => setAsset(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="SOL">SOL</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Available: ${formatCompactBalance(vaultBalance)}</p>
                </div>

                {/* Instant Withdrawal Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <ArrowDownToLine className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">Instant withdrawal</p>
                      <p className="text-xs text-gray-600">No fees or waiting periods</p>
                    </div>
                  </div>
                </div>

                {/* Withdraw button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWithdraw}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > vaultBalance || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw {amount || '0'} {asset}
                </motion.button>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center">
                  Funds will be instantly available in your main wallet after withdrawal.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
