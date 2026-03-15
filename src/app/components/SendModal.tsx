import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Check, AlertCircle } from 'lucide-react';

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

  const getCurrentAsset = () => assets.find(a => a.symbol === selectedAsset);
  const currentAsset = getCurrentAsset();
  const availableBalance = currentAsset?.balance || 0;

  const calculateGasFee = (sendAmount: number): number => {
    if (!sendAmount) return 0;
    return sendAmount * 0.005;
  };

  const gasFee = calculateGasFee(parseFloat(amount) || 0);
  const totalWithGas = (parseFloat(amount) || 0) + gasFee;

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
    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (totalWithGas > availableBalance) {
      setError(`Insufficient ${selectedAsset} balance (need ${totalWithGas.toFixed(2)} including gas)`);
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    const sendAmount = parseFloat(amount);
    const recipientName = selectedContact?.name || recipient;
    onSend(sendAmount, selectedAsset, recipient, recipientName, gasFee);
    setStep('success');
  };

  const handleMaxAmount = () => {
    const maxAmount = availableBalance / 1.005;
    setAmount(maxAmount.toFixed(4));
    setError('');
  };

  const recipientDisplayName = selectedContact?.name || recipient || 'recipient';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={step === 'success' ? undefined : onClose}
      >
        <motion.div
          initial={{ y: step === 'success' ? 0 : '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full sm:max-w-md max-h-[90dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            step === 'success'
              ? 'bg-senti-bg h-full'
              : 'bg-senti-bg sm:rounded-3xl rounded-t-3xl p-6'
          }`}
        >
          {step === 'form' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold">Send Money</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-senti-text-secondary" />
                </button>
              </div>

              {/* Total Balance */}
              <div className="mb-6 bg-gradient-to-br from-[#0f1d35] to-[#0a1628] rounded-xl p-4 border border-senti-card-border">
                <p className="text-sm text-senti-text-muted mb-1">Total Wallet Balance</p>
                <p className="text-2xl text-white font-semibold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-4">
                {/* Asset Selection */}
                <div>
                  <label className="block text-senti-text-secondary mb-2">Select Asset</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['USDC', 'USDT', 'SOL'].map((asset) => (
                      <button
                        key={asset}
                        onClick={() => setSelectedAsset(asset)}
                        className={`py-3 rounded-xl border-2 transition-all ${
                          selectedAsset === asset
                            ? 'border-senti-cyan bg-senti-cyan/10 text-senti-cyan'
                            : 'border-senti-card-border text-senti-text-secondary hover:border-senti-text-muted'
                        }`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-senti-text-secondary mb-2">Recipient</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    placeholder="Wallet address or @username"
                    className="w-full px-4 py-4 bg-senti-card border border-senti-card-border rounded-xl text-white placeholder-senti-text-muted focus:outline-none focus:ring-2 focus:ring-senti-cyan focus:border-transparent"
                  />

                  {showSuggestions && filteredContacts.length > 0 && (
                    <div className="mt-2 bg-senti-card border border-senti-card-border rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {filteredContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleSelectContact(contact)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center text-white`}>
                            {contact.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{contact.name}</p>
                            <p className="text-xs text-senti-text-muted">{contact.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedContact && (
                    <div className="mt-2 bg-senti-cyan/10 border border-senti-cyan/30 rounded-xl p-3 flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${selectedContact.color} rounded-xl flex items-center justify-center text-white`}>
                        {selectedContact.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{selectedContact.name}</p>
                        <p className="text-xs text-senti-text-muted">{selectedContact.id}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-senti-text-secondary mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(''); }}
                      placeholder="0.00"
                      className="w-full px-4 py-4 pr-20 bg-senti-card border border-senti-card-border rounded-xl text-white text-2xl placeholder-senti-text-muted focus:outline-none focus:ring-2 focus:ring-senti-cyan focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={handleMaxAmount}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-senti-cyan hover:text-senti-cyan-light font-medium"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-sm text-senti-text-muted mt-2">
                    Available: {availableBalance.toFixed(2)} {selectedAsset}
                    {amount && parseFloat(amount) > 0 && (
                      <span className="ml-2 text-senti-text-muted">
                        (Est. gas: {gasFee.toFixed(4)} {selectedAsset})
                      </span>
                    )}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={!recipient || !amount}
                  className="w-full py-4 bg-senti-cyan text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <h2 className="text-white text-lg font-semibold">Confirm Transfer</h2>
                <button onClick={() => setStep('form')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-senti-text-secondary" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-senti-card border border-senti-card-border rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-senti-text-muted">You're sending</span>
                    <span className="text-white font-medium">{amount} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-senti-text-muted">To</span>
                    <span className="text-white font-medium">{selectedContact?.name || recipient.slice(0, 20) + '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-senti-text-muted">Gas fee</span>
                    <span className="text-white">{gasFee.toFixed(4)} {selectedAsset}</span>
                  </div>
                  <div className="pt-4 border-t border-senti-card-border flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-semibold">{totalWithGas.toFixed(4)} {selectedAsset}</span>
                  </div>
                </div>

                <div className="bg-senti-cyan/10 border border-senti-cyan/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-senti-cyan mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-senti-cyan">
                    Gas fee is deducted from your {selectedAsset} balance
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="w-full py-4 bg-senti-cyan text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Confirm & Send
                </motion.button>
              </div>
            </>
          )}

          {/* SUCCESS SCREEN - Matches Figma Design */}
          {step === 'success' && (
            <div className="flex flex-col min-h-screen bg-senti-bg px-5">
              {/* Spacer */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Cyan circle with send icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-senti-cyan/20 border-2 border-senti-cyan flex items-center justify-center mb-6"
                >
                  <Send className="w-10 h-10 text-senti-cyan" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Sent Successfully
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-senti-cyan text-sm mb-8"
                >
                  ${parseFloat(amount).toFixed(2)} {selectedAsset} has been sent to {recipientDisplayName}.
                </motion.p>

                {/* Transaction Details Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-senti-card border border-senti-card-border rounded-2xl p-5 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-senti-cyan text-sm">Sent To</span>
                    <span className="text-white font-semibold">{recipientDisplayName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-senti-cyan text-sm">Username</span>
                    <span className="text-white font-medium">
                      {selectedContact ? `@${selectedContact.name.toLowerCase().replace(/\s+/g, '')}` : recipient.startsWith('@') ? recipient : `@${recipient}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-senti-cyan text-sm">Amount</span>
                    <span className="text-white font-semibold">
                      ${parseFloat(amount).toFixed(2)} {selectedAsset}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-senti-cyan text-sm">Status</span>
                    <span className="text-senti-green font-semibold">Delivered</span>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Buttons */}
              <div className="pb-10 pt-6 space-y-3">
                <button
                  onClick={() => { setStep('form'); setAmount(''); setRecipient(''); setSelectedContact(null); }}
                  className="w-full text-center text-senti-text-secondary text-sm py-2"
                >
                  Send More
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-4 bg-senti-cyan text-white rounded-2xl font-semibold text-base"
                >
                  Back to Wallet
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
