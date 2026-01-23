import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface TransactionDetailsModalProps {
  transaction: {
    id: string;
    merchant: string;
    category: string;
    amount: number;
    date: string;
    icon: any;
    color: string;
    bg: string;
    type: 'send' | 'vault' | 'investment' | 'swap' | 'internal';
  };
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const [copiedTxId, setCopiedTxId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const Icon = transaction.icon;
  const isOutgoing = transaction.amount < 0;
  const txId = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
  const address = isOutgoing
    ? `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    : `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;

  const handleCopyTxId = () => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(true);
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getTransactionStatus = () => {
    // All transactions in history are completed by default
    // Only show pending if explicitly marked (future enhancement)
    return 'completed';
  };

  const status = getTransactionStatus();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 text-xl">Transaction Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-2xl ${
            status === 'completed'
              ? 'bg-green-50 border border-green-200'
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center gap-3">
              {status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-orange-600" />
              )}
              <div>
                <p className={`font-medium ${
                  status === 'completed' ? 'text-green-900' : 'text-orange-900'
                }`}>
                  {status === 'completed' ? 'Transaction Completed' : 'Transaction Pending'}
                </p>
                <p className={`text-sm ${
                  status === 'completed' ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {transaction.date}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Icon & Amount */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${transaction.bg}`}>
              <Icon className={`w-8 h-8 ${transaction.color}`} />
            </div>
            <h3 className={`text-3xl font-semibold mb-2 ${
              isOutgoing ? 'text-red-600' : 'text-green-600'
            }`}>
              {isOutgoing ? '' : '+'}{transaction.amount.toFixed(2)} USDC
            </h3>
            <p className="text-gray-600">{transaction.category}</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            {/* Type */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-gray-900 font-medium capitalize">{transaction.type}</span>
              </div>

              {/* To/From */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-600">{isOutgoing ? 'To' : 'From'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-mono text-sm">{address}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedAddress ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recipient/Sender Name */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Description</span>
                <span className="text-gray-900">{transaction.merchant}</span>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-600">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-mono text-sm">{txId}</span>
                  <button
                    onClick={handleCopyTxId}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedTxId ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Network Fee (for sends) */}
              {transaction.type === 'send' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Network Fee</span>
                  <span className="text-gray-900">{(Math.abs(transaction.amount) * 0.005).toFixed(4)} USDC</span>
                </div>
              )}
            </div>

            {/* View on Explorer */}
            <button
              onClick={() => window.open('https://solscan.io', '_blank')}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-gray-700" />
              <span className="text-gray-900 font-medium">View on Block Explorer</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
