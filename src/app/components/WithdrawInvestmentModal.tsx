import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, ArrowDownToLine, AlertCircle, Wallet, LockKeyhole } from 'lucide-react';

interface WithdrawInvestmentModalProps {
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
  onWithdraw: (investmentId: string, amount: number, withdrawEarnings: boolean, destination: 'vault' | 'wallet') => void;
}

export default function WithdrawInvestmentModal({ onClose, investment, onWithdraw }: WithdrawInvestmentModalProps) {
  const daysSinceStart = Math.floor((Date.now() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const simulatedEarnings = (investment.amount * parseFloat(investment.apy) / 100 / 365 * daysSinceStart);
  const totalAvailable = investment.amount + simulatedEarnings;

  const [amount, setAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'partial' | 'full'>('partial');
  const [includeEarnings, setIncludeEarnings] = useState(true);
  const [destination, setDestination] = useState<'vault' | 'wallet'>('vault');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleWithdraw = () => {
    if (withdrawType === 'partial' && (!amount || parseFloat(amount) <= 0)) return;

    setIsProcessing(true);

    setTimeout(() => {
      const withdrawAmount = withdrawType === 'full' ? totalAvailable : parseFloat(amount);
      onWithdraw(investment.id, withdrawAmount, includeEarnings || withdrawType === 'full', destination);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 2000);
  };

  const setMaxAmount = () => {
    setAmount(totalAvailable.toString());
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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6"
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
              <p className="text-gray-600 text-center">Withdrawing from {investment.name}...</p>
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
              <p className="text-gray-600 text-center mb-6">
                Funds transferred to your {destination === 'vault' ? 'vault balance' : 'main wallet'}
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Withdrawn</span>
                  <span className="text-gray-900">
                    ${(withdrawType === 'full' ? totalAvailable : parseFloat(amount || '0')).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From</span>
                  <span className="text-gray-900">{investment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="text-gray-900">{destination === 'vault' ? 'Vault Balance' : 'Main Wallet'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Withdraw Form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Withdraw Investment</h2>
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
                {/* Position Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-600 mb-3">Current Position</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Principal</p>
                      <p className="text-lg text-gray-900">${investment.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Earnings</p>
                      <p className="text-lg text-green-600">+${simulatedEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">Total Available</p>
                    <p className="text-2xl text-gray-900">${totalAvailable.toFixed(2)}</p>
                  </div>
                </div>

                {/* Withdrawal Type */}
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Withdrawal Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWithdrawType('partial')}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${
                        withdrawType === 'partial'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <p className="text-sm">Partial</p>
                      <p className="text-xs opacity-70">Choose amount</p>
                    </button>
                    <button
                      onClick={() => setWithdrawType('full')}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${
                        withdrawType === 'full'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <p className="text-sm">Full Exit</p>
                      <p className="text-xs opacity-70">Close position</p>
                    </button>
                  </div>
                </div>

                {/* Destination Selector */}
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Withdraw To</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDestination('vault')}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${
                        destination === 'vault'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <LockKeyhole className="w-4 h-4" />
                        <p className="text-sm">Vault</p>
                      </div>
                      <p className="text-xs opacity-70">Keep in vault</p>
                    </button>
                    <button
                      onClick={() => setDestination('wallet')}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${
                        destination === 'wallet'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wallet className="w-4 h-4" />
                        <p className="text-sm">Wallet</p>
                      </div>
                      <p className="text-xs opacity-70">Main balance</p>
                    </button>
                  </div>
                </div>

                {/* Amount Input - Only for Partial */}
                {withdrawType === 'partial' && (
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
                      <span className="text-gray-600 text-xl">{investment.asset}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Available: ${totalAvailable.toFixed(2)}</p>
                  </div>
                )}

                {/* Include Earnings Toggle - Only for Partial */}
                {withdrawType === 'partial' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeEarnings}
                        onChange={(e) => setIncludeEarnings(e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">Include earnings in withdrawal</p>
                        <p className="text-xs text-gray-600">
                          Withdraw earnings along with principal. Uncheck to keep earnings invested.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Warning for Full Exit */}
                {withdrawType === 'full' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-900 mb-1">Closing Position</p>
                      <p className="text-xs text-amber-700">
                        This will withdraw your entire position (${totalAvailable.toFixed(2)}) and close this investment.
                      </p>
                    </div>
                  </div>
                )}

                {/* Withdraw button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWithdraw}
                  disabled={
                    (withdrawType === 'partial' && (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > totalAvailable)) ||
                    isProcessing
                  }
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawType === 'full' 
                    ? `Withdraw All ($${totalAvailable.toFixed(2)})`
                    : `Withdraw ${amount || '0'} ${investment.asset}`
                  }
                </motion.button>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center">
                  Funds will be transferred to your {destination === 'vault' ? 'vault balance' : 'main wallet'} and available for immediate use.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
