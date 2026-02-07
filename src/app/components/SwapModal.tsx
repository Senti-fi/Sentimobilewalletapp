import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownUp, ArrowDown, CheckCircle, Loader } from 'lucide-react';
import LucyChip from './LucyChip';

interface SwapModalProps {
  onClose: () => void;
  onBuy?: (amount: number, asset: string, paidAmount: number, paidCurrency: string) => void;
}

export default function SwapModal({ onClose, onBuy }: SwapModalProps) {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromAsset, setFromAsset] = useState('USD');
  const [toAsset, setToAsset] = useState('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock exchange rates - fiat to USD conversion
  const fiatToUSD: { [key: string]: number } = {
    USD: 1,
    EUR: 1.08,
    GBP: 1.27,
    NGN: 0.00067,
    ZAR: 0.055,
    KES: 0.0077,
    GHS: 0.084,
    EGP: 0.020,
    MAD: 0.10,
    TZS: 0.00043,
    UGX: 0.00027,
  };

  // Mock crypto prices in USD
  const cryptoPricesUSD: { [key: string]: number } = {
    USDC: 1,
    USDT: 1,
    SOL: 200,
  };

  // Calculate exchange rate
  const getExchangeRate = () => {
    const fiatInUSD = fiatToUSD[fromAsset] || 1;
    const cryptoPrice = cryptoPricesUSD[toAsset] || 1;
    return fiatInUSD / cryptoPrice;
  };

  const exchangeRate = getExchangeRate();
  const fee = 0.01; // 1% fee

  // Recalculate toAmount when currency selection changes
  useEffect(() => {
    if (fromAmount) {
      setToAmount((parseFloat(fromAmount) * exchangeRate * (1 - fee)).toFixed(6));
    }
  }, [fromAsset, toAsset]);

  // Update toAmount when fromAsset or toAsset changes
  const updateToAmount = (value: string) => {
    if (value) {
      setToAmount((parseFloat(value) * exchangeRate * (1 - fee)).toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const handleSwap = () => {
    // Swap logic here
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Call onBuy callback to add transaction to history
      if (onBuy) {
        onBuy(
          parseFloat(toAmount),
          toAsset,
          parseFloat(fromAmount),
          fromAsset
        );
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 2000);
  };

  const handleFlip = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
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
              <h3 className="text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600 text-center">Please wait while we process your transaction...</p>
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
              <h3 className="text-gray-900 mb-2">Purchase Successful!</h3>
              <p className="text-gray-600 text-center mb-6">You've successfully purchased {toAmount} {toAsset}</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-900">{toAmount} {toAsset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid</span>
                  <span className="text-gray-900">{fromAmount} {fromAsset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="text-gray-900 text-sm">0x7a9f...3b2c</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Buy Form */}
          {!isProcessing && !isSuccess && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Buy Crypto</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* From */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-gray-600 mb-3 text-sm">You pay</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => {
                        setFromAmount(e.target.value);
                        updateToAmount(e.target.value);
                      }}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <select
                      value={fromAsset}
                      onChange={(e) => setFromAsset(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="NGN">NGN</option>
                      <option value="ZAR">ZAR</option>
                      <option value="KES">KES</option>
                      <option value="GHS">GHS</option>
                      <option value="EGP">EGP</option>
                      <option value="MAD">MAD</option>
                      <option value="TZS">TZS</option>
                      <option value="UGX">UGX</option>
                    </select>
                  </div>
                </div>

                {/* To */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-gray-600 mb-3 text-sm">You receive</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={toAmount}
                      onChange={(e) => {
                        setToAmount(e.target.value);
                        setFromAmount((parseFloat(e.target.value) / exchangeRate / (1 - fee)).toFixed(2));
                      }}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <select
                      value={toAsset}
                      onChange={(e) => setToAsset(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="SOL">SOL</option>
                    </select>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exchange rate</span>
                    <span className="text-gray-900">1 {fromAsset} = {exchangeRate.toFixed(6)} {toAsset}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee</span>
                    <span className="text-gray-900">1%</span>
                  </div>
                </div>

                {/* Buy button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSwap}
                  disabled={!fromAmount || !toAmount || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy {toAsset}
                </motion.button>

                {/* Payment methods */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Payment method</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 border-blue-600 bg-blue-50 rounded-xl cursor-pointer">
                      <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-gray-900">Bank Account</p>
                        <p className="text-sm text-gray-500">•••• 1234</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                      <input type="radio" name="payment" className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-gray-900">Credit Card</p>
                        <p className="text-sm text-gray-500">•••• 5678</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}