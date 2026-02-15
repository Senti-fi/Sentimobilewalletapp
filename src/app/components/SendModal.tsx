import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Check, User, AlertCircle } from 'lucide-react';
import LucyChip from './LucyChip';

// Load saved contacts from localStorage (same source as LinkPage)
function getSavedContacts(): Array<{ id: string; name: string; avatar: string; color: string; lastMessage: string; lastMessageTime: string; online: boolean; image_url?: string }> {
  try {
    const stored = localStorage.getItem('senti_contacts');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

interface Asset {
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
}

interface SendModalProps {
  onClose: () => void;
  onOpenLucy?: () => void;
  assets: Asset[];
  totalBalance: number;
  onSend: (amount: number, asset: string, recipient: string, recipientName: string, gasFee: number) => void;
}

export default function SendModal({ onClose, onOpenLucy, assets, totalBalance, onSend }: SendModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const savedContacts = getSavedContacts();
  const [selectedContact, setSelectedContact] = useState<typeof savedContacts[0] | null>(null);
  const [error, setError] = useState<string>('');

  // Get current asset balance
  const getCurrentAsset = () => assets.find(a => a.symbol === selectedAsset);
  const currentAsset = getCurrentAsset();
  const availableBalance = currentAsset?.balance || 0;

  // Calculate mock gas fee (0.5% of amount, no minimum)
  const calculateGasFee = (sendAmount: number): number => {
    if (!sendAmount) return 0;
    return sendAmount * 0.005; // Pure 0.5% with no floor
  };

  const gasFee = calculateGasFee(parseFloat(amount) || 0);
  const totalWithGas = (parseFloat(amount) || 0) + gasFee;

  // Filter contacts based on input
  const filteredContacts = savedContacts.filter(contact =>
    contact.name.toLowerCase().includes(recipient.toLowerCase()) ||
    contact.id.toLowerCase().includes(recipient.toLowerCase())
  );

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    setSelectedContact(null);
    setShowSuggestions(value.length > 0);
  };

  const handleSelectContact = (contact: typeof savedContacts[0]) => {
    setRecipient(contact.id);
    setSelectedContact(contact);
    setShowSuggestions(false);
  };

  const handleSend = () => {
    setError('');

    // Validate amount
    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate balance (amount + gas must be <= available)
    if (totalWithGas > availableBalance) {
      setError(`Insufficient ${selectedAsset} balance (need ${totalWithGas.toFixed(2)} including gas)`);
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = () => {
    const sendAmount = parseFloat(amount);
    const recipientName = selectedContact?.name || recipient;

    // Call the onSend callback to update Dashboard state
    onSend(sendAmount, selectedAsset, recipient, recipientName, gasFee);

    setStep('success');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleMaxAmount = () => {
    // Calculate max amount that can be sent including gas
    // Formula: amount + gas(amount) = balance
    // Since gas = amount * 0.005, we have: amount * 1.005 = balance
    // Therefore: amount = balance / 1.005

    const maxAmount = availableBalance / 1.005;
    setAmount(maxAmount.toFixed(4));
    setError('');
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
          {step === 'form' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900">Send Money</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Total Balance Display */}
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Total Wallet Balance</p>
                <p className="text-2xl text-gray-900 font-semibold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Select Asset</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['USDC', 'USDT', 'SOL'].map((asset) => (
                      <button
                        key={asset}
                        onClick={() => setSelectedAsset(asset)}
                        className={`py-3 rounded-xl border-2 transition-all ${
                          selectedAsset === asset
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Recipient</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    placeholder="Wallet address or @username"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Contact Suggestions */}
                  {showSuggestions && filteredContacts.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {filteredContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleSelectContact(contact)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center text-white`}>
                            {contact.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 text-sm">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Selected Contact Display */}
                  {selectedContact && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${selectedContact.color} rounded-xl flex items-center justify-center text-white`}>
                        {selectedContact.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm">{selectedContact.name}</p>
                        <p className="text-xs text-gray-600">{selectedContact.id}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError('');
                      }}
                      placeholder="0.00"
                      className="w-full px-4 py-4 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={handleMaxAmount}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Available: {availableBalance.toFixed(2)} {selectedAsset}
                    {amount && parseFloat(amount) > 0 && (
                      <span className="text-gray-400 ml-2">
                        (Est. gas: {gasFee.toFixed(4)} {selectedAsset})
                      </span>
                    )}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={!recipient || !amount}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Continue
                </motion.button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Confirm Transfer</h2>
                <button
                  onClick={() => setStep('form')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">You're sending</span>
                    <span className="text-gray-900">{amount} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To</span>
                    <span className="text-gray-900">{selectedContact?.name || recipient.slice(0, 20) + '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas fee</span>
                    <span className="text-gray-900">{gasFee.toFixed(4)} {selectedAsset}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-900 font-medium">Total</span>
                    <span className="text-gray-900 font-medium">{totalWithGas.toFixed(4)} {selectedAsset}</span>
                  </div>
                </div>

                {/* Gas Abstraction Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    Gas fee is deducted from your {selectedAsset} balance
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Confirm & Send
                </motion.button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h2 className="text-gray-900 mb-2">Transfer Successful!</h2>
              <p className="text-gray-600">Your {amount} {selectedAsset} has been sent</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}