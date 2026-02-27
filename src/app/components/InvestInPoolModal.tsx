import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, Lock, TrendingUp } from 'lucide-react';
import LucyChip from './LucyChip';

interface InvestInPoolModalProps {
  onClose: () => void;
  vaultName: string;
  apy: string;
  protocol: string;
  onInvest: (vaultName: string, amount: number, asset: string, apy: string, protocol: string) => void;
  vaultBalance: number;
}

export default function InvestInPoolModal({ onClose, vaultName, apy, protocol, onInvest, vaultBalance }: InvestInPoolModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate projected earnings
  const projectedYearlyEarnings = amount 
    ? (parseFloat(amount) * parseFloat(apy) / 100).toFixed(2)
    : '0.00';

  const projectedMonthlyEarnings = amount
    ? (parseFloat(amount) * parseFloat(apy) / 100 / 12).toFixed(2)
    : '0.00';

  const handleInvest = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    
    // Call the invest handler after a short delay to simulate transaction
    setTimeout(() => {
      onInvest(vaultName, parseFloat(amount), asset, apy, protocol);
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
              <h3 className="text-gray-900 mb-2">Processing Investment</h3>
              <p className="text-gray-600 text-center">Investing your funds into {vaultName}...</p>
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
              <h3 className="text-gray-900 mb-2">Investment Successful!</h3>
              <p className="text-gray-600 text-center mb-6">You've successfully invested in {vaultName}</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Invested</span>
                  <span className="text-gray-900">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pool</span>
                  <span className="text-gray-900">{vaultName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">APY</span>
                  <span className="text-green-600">{apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Monthly Earnings</span>
                  <span className="text-gray-900">${projectedMonthlyEarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="text-gray-900 text-sm">0x9c4e...7f3a</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Investment Form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Invest in Pool</h2>
                  <p className="text-sm text-gray-500">{vaultName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Amount Input */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-gray-600 text-sm">Amount to invest</label>
                    <button
                      onClick={setMaxAmount}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-2xl">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Available in Vault: ${vaultBalance.toFixed(2)}</p>
                </div>

                {/* APY Display */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-700">Current APY</p>
                  </div>
                  <p className="text-3xl text-green-600 mb-1">{apy}%</p>
                  <p className="text-xs text-gray-600">Compounded daily via {protocol}</p>
                </div>

                {/* Projected Earnings */}
                {amount && parseFloat(amount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-blue-50 rounded-xl p-4 space-y-2"
                  >
                    <p className="text-sm text-gray-700 mb-2">Projected Earnings</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly</span>
                      <span className="text-gray-900">${projectedMonthlyEarnings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Yearly</span>
                      <span className="text-gray-900">${projectedYearlyEarnings}</span>
                    </div>
                  </motion.div>
                )}

                {/* Pool Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">No lock-up period</p>
                      <p className="text-xs text-gray-600">Withdraw anytime without penalties</p>
                    </div>
                  </div>
                </div>

                {/* Lucy Chip */}
                <div>
                  <LucyChip text="How does this pool work?" />
                </div>

                {/* Gas Fee Estimate */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900 mb-0.5">Estimated Network Fee</p>
                        <p className="text-xs text-gray-600">Current gas price: ~15 gwei</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">~$2.50</p>
                        <p className="text-xs text-gray-500">$2-5 range</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invest button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInvest}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > vaultBalance || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Invest ${amount || '0'}
                </motion.button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center">
                  By investing, you agree to the pool's terms. DeFi investments carry risks. Past performance doesn't guarantee future results.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
