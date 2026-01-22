import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, TrendingUp, Calendar, DollarSign, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';
import LucyChip from './LucyChip';

interface LockedSavingsModalProps {
  onClose: () => void;
  onCreate: (savingData: any) => void;
}

const lockPeriods = [
  { days: 30, apy: '10.5', label: '30 Days', color: 'from-blue-400 to-cyan-500' },
  { days: 60, apy: '11.8', label: '60 Days', color: 'from-purple-400 to-blue-500' },
  { days: 90, apy: '12.5', label: '90 Days', color: 'from-purple-400 to-pink-500', popular: true },
  { days: 180, apy: '13.9', label: '180 Days', color: 'from-pink-400 to-rose-500' },
  { days: 365, apy: '15.0', label: '1 Year', color: 'from-orange-400 to-red-500', highest: true },
];

export default function LockedSavingsModal({ onClose, onCreate }: LockedSavingsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof lockPeriods[0] | null>(null);
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

  const calculateEarnings = () => {
    if (!amount || !selectedPeriod) return 0;
    const principal = parseFloat(amount);
    const apy = parseFloat(selectedPeriod.apy) / 100;
    const days = selectedPeriod.days;
    return (principal * apy * days) / 365;
  };

  const projectedEarnings = calculateEarnings();

  const getEffectiveRate = () => {
    if (!selectedPeriod) return 0;
    const apy = parseFloat(selectedPeriod.apy);
    const days = selectedPeriod.days;
    return (apy * days) / 365;
  };

  const getUnlockDate = () => {
    if (!selectedPeriod) return '';
    const now = new Date();
    const unlockDate = new Date(now.getTime() + selectedPeriod.days * 24 * 60 * 60 * 1000);
    return unlockDate.toISOString().split('T')[0];
  };

  const handleLock = () => {
    if (!amount || !selectedPeriod || parseFloat(amount) <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const savingData = {
        amount: parseFloat(amount),
        asset,
        duration: selectedPeriod.days,
        apy: selectedPeriod.apy,
        startDate: new Date().toISOString().split('T')[0],
        unlockDate: getUnlockDate(),
        earnings: 0, // Will accumulate over time
      };

      onCreate(savingData);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 2000);
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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                  <Loader className="w-16 h-16 text-purple-600" />
                </motion.div>
                <h3 className="text-gray-900 mb-2">Locking Your Savings</h3>
                <p className="text-gray-600 text-center">Securing your funds for {selectedPeriod?.label}...</p>
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
                <h3 className="text-gray-900 mb-2">Locked Successfully!</h3>
                <p className="text-gray-600 text-center mb-6">
                  Your funds are now earning {selectedPeriod?.apy}% APY
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Locked</span>
                    <span className="text-gray-900">{amount} {asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lock Period</span>
                    <span className="text-gray-900">{selectedPeriod?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">APY</span>
                    <span className="text-green-600">{selectedPeriod?.apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Earnings</span>
                    <span className="text-green-600">+${projectedEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unlocks On</span>
                    <span className="text-gray-900">{new Date(getUnlockDate()).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Main Form */}
          {!isProcessing && !isSuccess && (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-gray-900">Lock Savings</h2>
                  <p className="text-sm text-gray-500">Earn higher yields with time-locks</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Info Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 text-sm mb-1 flex items-center gap-2">
                        Guaranteed Fixed Rates
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md">Locked In</span>
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Lock in your APY today - guaranteed for the entire period regardless of market changes
                      </p>
                      <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-md inline-flex">
                        <TrendingUp className="w-3 h-3" />
                        Up to 15% APY - higher than standard vaults
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Lucy Chip */}
                <div>
                  <LucyChip text="Which lock period is best for me?" />
                </div>

                {/* Lock Period Selection */}
                <div>
                  <label className="block text-gray-700 text-sm mb-3">Choose Lock Period</label>
                  <div className="space-y-2">
                    {lockPeriods.map((period, index) => (
                      <motion.button
                        key={period.days}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPeriod(period)}
                        className={`w-full rounded-2xl p-4 border-2 transition-all ${
                          selectedPeriod?.days === period.days
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-100 bg-white hover:border-purple-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${period.color} rounded-xl flex items-center justify-center`}>
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h4 className="text-gray-900">{period.label}</h4>
                                {period.popular && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md">
                                    Popular
                                  </span>
                                )}
                                {period.highest && (
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-md">
                                    Highest APY
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Shield className="w-3 h-3 text-green-600" />
                                <p className="text-xs text-green-600">Rate Guaranteed</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl text-green-600">{period.apy}%</p>
                            <p className="text-xs text-gray-500">Fixed APY</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                {selectedPeriod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-gray-600 text-sm">Amount to lock</label>
                        <button
                          onClick={setMaxAmount}
                          className="text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded-md hover:bg-purple-50 transition-colors"
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
                          className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="USDC">USDC</option>
                          <option value="USDT">USDT</option>
                          <option value="SOL">SOL</option>
                        </select>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Available: {currentBalance} {asset}</p>
                    </div>

                    {/* Projected Earnings */}
                    {amount && parseFloat(amount) > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-gray-700">Projected Earnings</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">You will lock</span>
                            <span className="text-gray-900">{amount} {asset}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Annual APY</span>
                            <span className="text-green-600">{selectedPeriod.apy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Effective rate ({selectedPeriod.label})</span>
                            <span className="text-green-600">{getEffectiveRate().toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-200">
                            <span className="text-gray-900">Earnings ({selectedPeriod.label})</span>
                            <span className="text-green-600">+${projectedEarnings.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-900">Total at unlock</span>
                            <span className="text-green-600">
                              ${(parseFloat(amount) + projectedEarnings).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Rate Guarantee Message */}
                    {amount && parseFloat(amount) > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-1 flex items-center gap-2">
                              Rate Lock Guarantee
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md">
                                {selectedPeriod.apy}% Fixed
                              </span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Your <strong>{selectedPeriod.apy}% APY is locked in and guaranteed</strong> for the entire {selectedPeriod.label}.
                              Even if market rates drop to 3%, you'll still earn {selectedPeriod.apy}%.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Warning */}
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900 mb-1">Early Withdrawal Penalty</p>
                          <p className="text-xs text-gray-600">
                            If you withdraw before {new Date(getUnlockDate()).toLocaleDateString()}, 
                            you'll forfeit all earnings and pay a 2% penalty fee.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lock Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLock}
                      disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Lock {amount || '0'} {asset} for {selectedPeriod.label}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}