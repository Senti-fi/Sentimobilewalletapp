import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Check, User } from 'lucide-react';
import LucyChip from './LucyChip';
import { mockContacts } from './LinkPage';

interface SendModalProps {
  onClose: () => void;
  onOpenLucy?: () => void;
}

export default function SendModal({ onClose, onOpenLucy }: SendModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null);

  // Filter contacts based on input
  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(recipient.toLowerCase()) ||
    contact.id.toLowerCase().includes(recipient.toLowerCase())
  );

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    setSelectedContact(null);
    setShowSuggestions(value.length > 0);
  };

  const handleSelectContact = (contact: typeof mockContacts[0]) => {
    setRecipient(contact.id);
    setSelectedContact(contact);
    setShowSuggestions(false);
  };

  const handleSend = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 2000);
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Send Money</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
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
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setAmount('5420.50')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Available: 5,420.50 {selectedAsset}</p>
                </div>

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
                    <span className="text-gray-900">{recipient.slice(0, 20)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network fee</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{amount} {selectedAsset}</span>
                  </div>
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