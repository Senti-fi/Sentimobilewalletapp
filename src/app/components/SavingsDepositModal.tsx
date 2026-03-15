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

  const balances: Record<string, number> = { USDC: 5420.50, USDT: 3500.00, SOL: 45.32 };
  const currentBalance = balances[asset];

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance) return;
    setIsProcessing(true);
    setTimeout(() => {
      onDeposit(parseFloat(amount), asset);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); onClose(); }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0a142f] w-full max-w-md rounded-t-[24px] max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Handle */}
          <div className="flex justify-center pt-4 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#8ac7ff]" />
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mb-6">
                <Loader className="w-14 h-14 text-[#007bff]" />
              </motion.div>
              <p className="text-white text-lg font-semibold mb-1">Depositing to Savings</p>
              <p className="text-[#8ac7ff] text-sm">Moving {amount} {asset} to your Savings...</p>
            </div>
          )}

          {/* Success */}
          {isSuccess && (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <CheckCircle className="w-14 h-14 text-[#00e6ff]" />
              </motion.div>
              <p className="text-white text-xl font-bold">Deposit Successful!</p>
              <p className="text-[#8ac7ff] text-sm">{amount} {asset} added to Savings</p>
            </div>
          )}

          {/* Main form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-white text-xl font-bold">Deposit to Savings</p>
                  <p className="text-[#8ac7ff] text-xs mt-0.5">Move funds from Main Wallet</p>
                </div>
                <button onClick={onClose} className="p-1">
                  <X className="w-5 h-5 text-[#8ac7ff]" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 pb-8 flex flex-col gap-5">
                {/* Transfer flow visual */}
                <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-[20px] p-5 flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-[#007bff] rounded-2xl flex items-center justify-center">
                      <Wallet className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-[#8ac7ff] text-xs">Main Wallet</p>
                  </div>
                  <ArrowDown className="w-6 h-6 text-[#007bff]" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-[#007bff] rounded-2xl flex items-center justify-center">
                      <PiggyBank className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-[#8ac7ff] text-xs">Savings</p>
                  </div>
                </div>

                {/* Amount input */}
                <div className="bg-[#1a2540] border border-[#3c5679] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#8ac7ff] text-xs">Amount to deposit</span>
                    <button onClick={() => setAmount(currentBalance.toString())} className="text-[#007bff] text-xs font-medium">
                      MAX
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      className="flex-1 bg-transparent text-white text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <select
                      value={asset}
                      onChange={(e) => setAsset(e.target.value)}
                      className="bg-[#0a142f] border border-[#3c5679] text-white text-xs rounded-lg px-3 py-2 focus:outline-none"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="SOL">SOL</option>
                    </select>
                  </div>
                  <p className="text-[#8ac7ff] text-xs mt-2">
                    Available: {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {asset}
                  </p>
                </div>

                {/* Info card */}
                <div className="bg-[#162040] border border-[rgba(0,123,255,0.15)] rounded-xl px-4 py-3">
                  <p className="text-[#8ac7ff] text-xs leading-4">
                    Funds in Savings can be used for Goals, Locked Savings, or transferred back anytime.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 h-14 bg-[#1a2540] text-white text-sm rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance}
                    className="flex-1 h-14 bg-[#007bff] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
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
