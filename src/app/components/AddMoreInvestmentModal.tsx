import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, Plus, TrendingUp } from 'lucide-react';

interface AddMoreInvestmentModalProps {
  onClose: () => void;
  investment: {
    id: string;
    name: string;
    amount: number;
    asset: string;
    apy: string;
    protocol: string;
    startDate: Date;
    earned: number;
  };
  vaultBalance: number;
  onAddMore: (investmentId: string, amount: number, asset: string) => void;
}

export default function AddMoreInvestmentModal({ onClose, investment, vaultBalance, onAddMore }: AddMoreInvestmentModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState(investment.asset);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const daysSinceStart = Math.floor((Date.now() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const simulatedEarnings = (investment.amount * parseFloat(investment.apy) / 100 / 365 * daysSinceStart);
  const currentValue = investment.amount + simulatedEarnings;

  const handleAddMore = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      onAddMore(investment.id, parseFloat(amount), asset);
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

  const newTotal = currentValue + parseFloat(amount || '0');
  const projectedYearlyEarnings = newTotal * parseFloat(investment.apy) / 100;

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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
              <h3 className="text-gray-900 mb-2">Processing Deposit</h3>
              <p className="text-gray-600 text-center">Adding to your {investment.name} position...</p>
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
              <h3 className="text-gray-900 mb-2">Deposit Successful!</h3>
              <p className="text-gray-600 text-center mb-6">Added to your investment position</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Added</span>
                  <span className="text-gray-900">{amount} {asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vault</span>
                  <span className="text-gray-900">{investment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Position Size</span>
                  <span className="text-gray-900">${newTotal.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add More Form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Add to Position</h2>
                  <p className="text-sm text-gray-500">{investment.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Position */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-600 mb-2">Current Position</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Value</p>
                      <p className="text-xl text-gray-900">${currentValue.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">APY</p>
                      <p className="text-xl text-green-600">{investment.apy}%</p>
                    </div>
                  </div>
                </div>

                {/* Vault Balance */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-600 mb-1">Available Vault Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl text-gray-900">${vaultBalance.toFixed(2)}</h3>
                    <span className="text-sm text-gray-500">available</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-gray-600 text-sm">Amount to add</label>
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
                  <p className="text-sm text-gray-500 mt-2">Available: ${vaultBalance.toFixed(2)}</p>
                </div>

                {/* Projection */}
                {amount && parseFloat(amount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-gray-900">Projected Impact</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">New Position Size</span>
                        <span className="text-sm text-gray-900">${newTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Projected Yearly Earnings</span>
                        <span className="text-sm text-green-600">+${projectedYearlyEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Projected Monthly</span>
                        <span className="text-sm text-green-600">+${(projectedYearlyEarnings / 12).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Add More button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddMore}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > vaultBalance || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add {amount || '0'} {asset}
                </motion.button>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center">
                  Your additional deposit will start earning {investment.apy}% APY immediately.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
