import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, AlertTriangle, CheckCircle, Loader, Calendar, DollarSign } from 'lucide-react';

interface LockedSaving {
  id: string;
  amount: number;
  asset: string;
  duration: number;
  apy: string;
  startDate: string;
  unlockDate: string;
  earnings: number;
}

interface UnlockSavingsModalProps {
  onClose: () => void;
  saving: LockedSaving;
  onUnlock: (savingId: string, isEarly: boolean) => void;
}

export default function UnlockSavingsModal({ onClose, saving, onUnlock }: UnlockSavingsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [unlockType, setUnlockType] = useState<'normal' | 'early' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check if the lock period has ended
  const unlockDate = new Date(saving.unlockDate);
  const now = new Date();
  const isUnlocked = now >= unlockDate;
  const daysRemaining = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate early withdrawal penalty (2% of principal + loss of all earnings)
  const earlyWithdrawalPenalty = saving.amount * 0.02;
  const totalLossIfEarly = earlyWithdrawalPenalty + saving.earnings;
  const amountAfterPenalty = saving.amount - earlyWithdrawalPenalty;

  const handleUnlock = (isEarly: boolean) => {
    const type = isEarly ? 'early' : 'normal';
    setUnlockType(type);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onUnlock(saving.id, isEarly);
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 2000);
  };

  const getFinalAmount = () => {
    if (unlockType === 'early') {
      return amountAfterPenalty;
    }
    return saving.amount + saving.earnings;
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
                <h3 className="text-gray-900 mb-2">
                  {unlockType === 'early' ? 'Processing Early Withdrawal' : 'Unlocking Your Funds'}
                </h3>
                <p className="text-gray-600 text-center">
                  {unlockType === 'early' 
                    ? 'Applying penalty and releasing funds...' 
                    : 'Releasing your savings with earnings...'}
                </p>
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
                <h3 className="text-gray-900 mb-2">Withdrawn Successfully!</h3>
                <p className="text-gray-600 text-center mb-6">
                  Funds returned to your Savings
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Received</span>
                    <span className="text-gray-900">{getFinalAmount().toFixed(2)} {saving.asset}</span>
                  </div>
                  {unlockType === 'early' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Penalty Applied</span>
                        <span className="text-red-600">-${earlyWithdrawalPenalty.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Earnings Forfeited</span>
                        <span className="text-red-600">-${saving.earnings.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {unlockType === 'normal' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnings</span>
                      <span className="text-green-600">+${saving.earnings.toFixed(2)}</span>
                    </div>
                  )}
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
                  <h2 className="text-gray-900">Unlock Savings</h2>
                  <p className="text-sm text-gray-500">
                    {isUnlocked ? 'Ready to withdraw' : 'Locked until ' + unlockDate.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Saving Details */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      {isUnlocked ? (
                        <Unlock className="w-7 h-7 text-white" />
                      ) : (
                        <Lock className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-xl">{saving.amount} {saving.asset}</h3>
                      <p className="text-sm text-gray-600">{saving.duration} days lock • {saving.apy}% APY</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Started</span>
                      <span className="text-gray-900">{new Date(saving.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unlocks</span>
                      <span className={isUnlocked ? 'text-green-600' : 'text-gray-900'}>
                        {unlockDate.toLocaleDateString()}
                        {!isUnlocked && ` (${daysRemaining} days)`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-purple-200">
                      <span className="text-gray-600">Current Earnings</span>
                      <span className="text-green-600">+${saving.earnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {isUnlocked && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-900">Lock Period Complete</p>
                        <p className="text-xs text-gray-600">You can withdraw your funds with full earnings</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Normal Unlock Option */}
                {isUnlocked && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowConfirmation(true);
                      setUnlockType('normal');
                    }}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>Unlock & Withdraw</span>
                      <span className="text-sm opacity-90">
                        Receive {(saving.amount + saving.earnings).toFixed(2)} {saving.asset}
                      </span>
                    </div>
                  </motion.button>
                )}

                {/* Early Unlock Option */}
                {!isUnlocked && (
                  <>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900 mb-1">Early Withdrawal Available</p>
                          <p className="text-xs text-gray-600 mb-3">
                            You can withdraw now, but you'll incur a 2% penalty and forfeit all earnings.
                          </p>
                          <div className="bg-white rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Principal</span>
                              <span className="text-gray-900">{saving.amount} {saving.asset}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">2% Penalty</span>
                              <span className="text-red-600">-${earlyWithdrawalPenalty.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Lost Earnings</span>
                              <span className="text-red-600">-${saving.earnings.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                              <span className="text-gray-900">You'll Receive</span>
                              <span className="text-gray-900">{amountAfterPenalty.toFixed(2)} {saving.asset}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-red-600">Total Loss</span>
                              <span className="text-red-600">-${totalLossIfEarly.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setUnlockType('early');
                        setShowConfirmation(true);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>Withdraw Early (with Penalty)</span>
                        <span className="text-sm opacity-90">
                          Receive {amountAfterPenalty.toFixed(2)} {saving.asset}
                        </span>
                      </div>
                    </motion.button>
                  </>
                )}

                {/* Wait Option for Locked Savings */}
                {!isUnlocked && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900">Recommended: Wait {daysRemaining} days</p>
                        <p className="text-xs text-gray-600">
                          You'll receive the full {(saving.amount + saving.earnings).toFixed(2)} {saving.asset} with no penalties
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Confirmation Modal */}
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              >
                {unlockType === 'early' ? (
                  <>
                    {/* Early Withdrawal Confirmation */}
                    <div className="text-center mb-5">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-gray-900 mb-2">Confirm Early Withdrawal</h3>
                      <p className="text-sm text-gray-600">
                        You'll lose ${totalLossIfEarly.toFixed(2)} in penalties and forfeited earnings.
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-5">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Principal</span>
                          <span className="text-gray-900">${saving.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Penalty (2%)</span>
                          <span className="text-red-600">-${earlyWithdrawalPenalty.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lost Earnings</span>
                          <span className="text-red-600">-${saving.earnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-red-200">
                          <span className="text-gray-900">You'll Receive</span>
                          <span className="text-gray-900">${amountAfterPenalty.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Normal Unlock Confirmation */}
                    <div className="text-center mb-5">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Unlock className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-gray-900 mb-2">Confirm Unlock</h3>
                      <p className="text-sm text-gray-600">
                        Your funds will be returned to your Savings account.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-5">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Principal</span>
                          <span className="text-gray-900">${saving.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Earnings</span>
                          <span className="text-green-600">+${saving.earnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-200">
                          <span className="text-gray-900">Total Amount</span>
                          <span className="text-gray-900">${(saving.amount + saving.earnings).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowConfirmation(false);
                      handleUnlock(unlockType === 'early');
                    }}
                    className={`py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow ${
                      unlockType === 'early' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600'
                    }`}
                  >
                    Confirm
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}