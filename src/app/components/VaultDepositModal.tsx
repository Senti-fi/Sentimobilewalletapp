import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader, Lock } from 'lucide-react';
import LucyChip from './LucyChip';

interface VaultDepositModalProps {
  onClose: () => void;
  vaultName: string;
  apy: string;
  onDeposit: (amount: number, asset: string) => void;
  walletAssets: Array<{
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
  }>;
  totalWalletBalance: number;
}

export default function VaultDepositModal({ onClose, vaultName, apy, onDeposit, walletAssets, totalWalletBalance }: VaultDepositModalProps) {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get balances from wallet assets
  const getBalance = (symbol: string) => {
    const walletAsset = walletAssets.find(a => a.symbol === symbol);
    return walletAsset ? walletAsset.balance : 0;
  };

  const currentBalance = getBalance(asset);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    
    // Call the deposit handler after a short delay to simulate transaction
    setTimeout(() => {
      onDeposit(parseFloat(amount), asset);
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
              <h3 className="text-gray-900 mb-2">Processing Deposit</h3>
              <p className="text-gray-600 text-center">Depositing your funds into the vault...</p>
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
              <p className="text-gray-600 text-center mb-6">You've successfully deposited into {vaultName}</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Deposited</span>
                  <span className="text-gray-900">{amount} {asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vault</span>
                  <span className="text-gray-900">{vaultName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="text-gray-900 text-sm">0x9c4e...7f3a</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Deposit Form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Deposit to Vault</h2>
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
                {/* Wallet Balance Info */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Main Wallet Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl text-gray-900">${totalWalletBalance.toFixed(2)}</h3>
                    <span className="text-sm text-gray-500">available</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Funds will be transferred from your main wallet</p>
                </div>

                {/* Amount Input */}
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
                  <p className="text-sm text-gray-500 mt-2">Available: ${totalWalletBalance.toFixed(2)}</p>
                </div>

                {/* Vault Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">No lock-up period</p>
                      <p className="text-xs text-gray-600">Withdraw anytime without penalties</p>
                    </div>
                  </div>
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

                {/* Deposit button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deposit {amount || '0'} {asset}
                </motion.button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center">
                  By depositing, you agree to the vault's terms. DeFi investments carry risks. Past performance doesn't guarantee future results.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}