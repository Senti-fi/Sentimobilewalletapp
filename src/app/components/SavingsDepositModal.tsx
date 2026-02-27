import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDown, Wallet, PiggyBank, CheckCircle, Loader } from 'lucide-react';

interface SavingsDepositModalProps {
  onClose: () => void;
  onDeposit: (amount: number, asset: string) => void;
}

export default function SavingsDepositModal({ onClose, onDeposit }: SavingsDepositModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock wallet balances
  const balances: { [key: string]: number } = {
    USDC: 5420.50,
    USDT: 3500.00,
    SOL: 45.32,
  };

  const currentBalance = balances[asset];

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance) return;

    setIsProcessing(true);

    setTimeout(() => {
      onDeposit(parseFloat(amount), asset);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  const setMaxAmount = () => {
    setAmount(currentBalance.toString());
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
                  <Loader className="w-16 h-16 text-blue-600" />
                </motion.div>
                <h3 className="text-gray-900 mb-2">Depositing to Savings</h3>
                <p className="text-gray-600 text-center">Moving {amount} {asset} to your Savings...</p>
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
                <h3 className="text-gray-900 mb-2">Deposit Successful!</h3>
                <p className="text-gray-600 text-center">
                  {amount} {asset} added to Savings
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
                  <h2 className="text-gray-900">Deposit to Savings</h2>
                  <p className="text-sm text-gray-500">Move funds from Main Wallet</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Transfer Flow Visual */}
                <div className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xs text-gray-600">Main Wallet</p>
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                    <ArrowDown className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <PiggyBank className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xs text-gray-600">Savings</p>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-gray-600 text-sm">Amount to deposit</label>
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
                        autoFocus
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
                    <p className="text-sm text-gray-500 mt-2">Available in wallet: {currentBalance} {asset}</p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-700">
                    💡 Funds in Savings can be used for Goals, Locked Savings, or transferred back anytime.
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
                    onClick={handleDeposit}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deposit {amount || '0'} {asset}
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
