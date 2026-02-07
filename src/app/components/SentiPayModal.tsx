import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, User, Hash, DollarSign, Zap, CheckCircle, Loader, Star, ArrowRight, ChevronDown, MessageSquare, Wallet } from 'lucide-react';

interface SentiPayModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: {
    merchant: string;
    category: string;
    amount: number;
    icon: any;
    color: string;
    bg: string;
  }) => void;
}

// Nigerian banks
const nigerianBanks = [
  'Access Bank',
  'GTBank',
  'First Bank',
  'UBA',
  'Zenith Bank',
  'Fidelity Bank',
  'Union Bank',
  'Sterling Bank',
  'Stanbic IBTC',
  'Ecobank',
  'Wema Bank',
  'Polaris Bank',
  'Keystone Bank',
  'FCMB',
  'Heritage Bank',
  'Kuda Bank',
  'Opay',
  'Palmpay',
];

export default function SentiPayModal({ onClose, onAddTransaction }: SentiPayModalProps) {
  const [step, setStep] = useState<'bank-details' | 'amount' | 'confirm' | 'processing' | 'success'>('bank-details');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // Spending Balance
  const spendingBalance = 5420.50;

  // Mock exchange rate: 1 USDT = 1,550 NGN (Nigerian Naira)
  const usdtToNgnRate = 1550;
  const ngnAmount = parseFloat(amount || '0') * usdtToNgnRate;

  const handleBankSelect = (bank: string) => {
    setBankName(bank);
    setShowBankDropdown(false);
  };

  const handlePaymentConfirm = () => {
    setStep('processing');

    setTimeout(() => {
      // Add transaction to recent list
      onAddTransaction({
        merchant: accountName,
        category: description || 'Senti Pay Transfer',
        amount: parseFloat(amount),
        icon: Building2,
        color: 'text-purple-600',
        bg: 'bg-purple-100',
      });
      
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 2000);
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
          {step === 'processing' && (
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
                <h3 className="text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-gray-600 text-center">Converting ${amount} USDT to ₦{ngnAmount.toLocaleString('en-NG')}...</p>
                <p className="text-gray-500 text-sm mt-2">Sending to {accountName}</p>
              </motion.div>
            </div>
          )}

          {/* Success Screen */}
          {step === 'success' && (
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
                <h3 className="text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 text-center mb-6">
                  ₦{ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} sent to {accountName}
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank</span>
                    <span className="text-gray-900">{bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number</span>
                    <span className="text-gray-900">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name</span>
                    <span className="text-gray-900">{accountName}</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description</span>
                      <span className="text-gray-900 text-right max-w-[60%]">{description}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">You sent</span>
                    <span className="text-gray-900">${amount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">They received</span>
                    <span className="text-gray-900">₦{ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exchange rate</span>
                    <span className="text-gray-900">₦{usdtToNgnRate.toLocaleString()}/USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span className="text-green-600">$0.00</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Main Screens */}
          {step !== 'processing' && step !== 'success' && (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 pt-8 pb-5 flex items-center justify-between z-10 safe-top">
                <div>
                  <h2 className="text-xl text-gray-900">Senti Pay</h2>
                  <p className="text-sm text-gray-500">
                    {step === 'bank-details' && 'Enter bank details'}
                    {step === 'amount' && `Pay ${bankName}`}
                    {step === 'confirm' && 'Confirm payment'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Step 1: Enter Bank Details */}
                {step === 'bank-details' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {/* Info Banner */}
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-gray-900 text-sm mb-1">Send USDT, Receive Naira</h4>
                          <p className="text-xs text-gray-700">
                            Enter bank details to send crypto and recipient receives Nigerian Naira instantly.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Name Dropdown */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Bank Name</label>
                      <div className="relative">
                        <button
                          onClick={() => setShowBankDropdown(!showBankDropdown)}
                          className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left flex items-center justify-between hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-gray-400" />
                            <span className={bankName ? 'text-gray-900' : 'text-gray-400'}>
                              {bankName || 'Select a bank'}
                            </span>
                          </div>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>
                        {showBankDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
                          >
                            {nigerianBanks.map((bank) => (
                              <button
                                key={bank}
                                onClick={() => handleBankSelect(bank)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                              >
                                {bank}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Account Number</label>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="0123456789"
                            maxLength={10}
                            className="flex-1 bg-transparent text-lg focus:outline-none text-gray-900 placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Name */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Account Name</label>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="John Doe"
                            className="flex-1 bg-transparent text-lg focus:outline-none text-gray-900 placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => setStep('amount')}
                        disabled={!bankName || !accountNumber || !accountName}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Enter Amount */}
                {step === 'amount' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {/* Selected Bank */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="text-xl text-gray-900">{bankName}</h3>
                          <p className="text-sm text-gray-600">
                            Bank
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Payment Amount</label>
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-6 h-6 text-gray-400" />
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 bg-transparent text-3xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            autoFocus
                          />
                        </div>
                        {amount && parseFloat(amount) > 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            ≈ ₦{ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Spending Balance Display */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Pay with</label>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="text-gray-900 text-sm">Spending Balance</p>
                              <p className="text-xs text-gray-600">
                                Available: ${spendingBalance.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Description Field */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Description (Optional)</label>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Payment for groceries, Market goods, etc."
                            rows={3}
                            maxLength={100}
                            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900 placeholder:text-gray-400 resize-none"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {description.length}/100
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep('bank-details')}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep('confirm')}
                        disabled={!amount || parseFloat(amount) <= 0}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirm Payment */}
                {step === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {/* Payment Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-3">You're sending</p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <h2 className="text-4xl text-gray-900">${amount}</h2>
                        <span className="text-gray-600">USDT</span>
                      </div>
                      
                      {/* Conversion Arrow */}
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">Recipient receives</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl text-gray-900">
                          ₦{ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <span className="text-gray-600">NGN</span>
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
                      <h4 className="text-gray-900 text-sm">Recipient Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank</span>
                          <span className="text-gray-900">{bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Number</span>
                          <span className="text-gray-900">{accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Name</span>
                          <span className="text-gray-900">{accountName}</span>
                        </div>
                        {description && (
                          <>
                            <div className="border-t border-gray-100 my-1 pt-2"></div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-600">Description</span>
                              <span className="text-gray-900">{description}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
                      <h4 className="text-gray-900 text-sm">Transaction Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exchange rate</span>
                          <span className="text-gray-900">1 USDT = ₦{usdtToNgnRate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Network Fee</span>
                          <span className="text-green-600">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speed</span>
                          <span className="text-green-600 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Instant
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confirmation Note */}
                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-700">
                            Your USDT will be converted to Naira and sent directly to the recipient's bank account. The transaction is instant and has no fees.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep('amount')}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePaymentConfirm}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Confirm Payment
                      </button>
                    </div>
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