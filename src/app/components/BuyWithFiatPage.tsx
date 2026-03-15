import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Building2, CreditCard, ExternalLink } from 'lucide-react';

interface BuyWithFiatPageProps {
  onBack: () => void;
  onBuy?: (amount: number, asset: string, paidAmount: number, paidCurrency: string) => void;
}

type PaymentMethod = 'bank' | 'card' | 'stripe';

export default function BuyWithFiatPage({ onBack, onBuy }: BuyWithFiatPageProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank');

  const numericAmount = parseFloat(amount) || 0;
  const usdcAmount = numericAmount; // 1:1 for stablecoins

  const quickAmounts = [25, 50, 100, 500];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleContinue = () => {
    if (numericAmount > 0 && onBuy) {
      onBuy(usdcAmount, 'USDC', numericAmount, 'USD');
      onBack();
    }
  };

  const paymentMethods = [
    {
      id: 'bank' as PaymentMethod,
      icon: Building2,
      title: 'Bank Transfer',
      desc: 'Direct from your bank account',
      fee: 'Fee: 0%',
      feeColor: 'text-senti-green',
      badge: 'RECOMMENDED',
    },
    {
      id: 'card' as PaymentMethod,
      icon: CreditCard,
      title: 'Visa / Mastercard',
      desc: 'Pay with your debit or credit card',
      fee: 'Fee: 1.5%',
      feeColor: 'text-senti-text-muted',
      badge: null,
    },
    {
      id: 'stripe' as PaymentMethod,
      icon: ExternalLink,
      title: 'Stripe / MoonPay',
      desc: 'Apple Pay, Google Pay, and more',
      fee: 'Fee: 0.99% -1%',
      feeColor: 'text-senti-text-muted',
      badge: null,
      tags: ['Stripe', 'MoonPay'],
    },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-senti-bg max-w-md mx-auto">
      {/* Header */}
      <div className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Buy with Fiat</h1>
        <button className="p-2 -mr-2">
          <Settings className="w-5 h-5 text-senti-text-secondary" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Amount Input */}
        <div className="text-center mt-4 mb-2">
          <p className="text-senti-cyan text-sm mb-3">How much would you like to buy?</p>
          <div className="flex items-center justify-center">
            <span className="text-5xl font-bold text-white">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount || '0.00'}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setAmount(val === '0.00' ? '' : val);
              }}
              onFocus={() => {
                if (amount === '' || amount === '0.00') setAmount('');
              }}
              className="text-5xl font-bold text-white bg-transparent outline-none w-48 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>
          <p className="text-senti-text-muted text-sm mt-2">
            You'll receive approximately {usdcAmount.toFixed(0)} USDC
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 justify-center mt-4 mb-6">
          {quickAmounts.map((val) => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAmount(val)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                parseFloat(amount) === val
                  ? 'border-senti-cyan bg-senti-cyan/10 text-senti-cyan'
                  : 'border-senti-card-border text-senti-text-secondary hover:border-senti-text-muted'
              }`}
            >
              ${val}
            </motion.button>
          ))}
        </div>

        {/* Payment Methods */}
        <h3 className="text-white font-semibold mb-3">Choose Payment Method</h3>
        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => (
            <motion.button
              key={method.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full rounded-2xl p-4 flex items-start gap-3 text-left transition-all border ${
                selectedMethod === method.id
                  ? 'border-senti-cyan bg-senti-cyan/5'
                  : 'border-senti-card-border bg-senti-card'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-senti-card border border-senti-card-border flex items-center justify-center flex-shrink-0">
                <method.icon className="w-5 h-5 text-senti-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-medium">{method.title}</p>
                  {method.badge && (
                    <span className="px-2 py-0.5 bg-senti-green/20 text-senti-green text-[10px] font-bold rounded">
                      {method.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-senti-text-muted">{method.desc}</p>
                {method.tags && (
                  <div className="flex gap-1.5 mt-2">
                    {method.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-senti-card border border-senti-card-border text-senti-text-muted text-[10px] rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className={`text-xs mt-1 ${method.feeColor}`}>{method.fee}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Lucy AI Insight */}
        <div className="bg-senti-card border border-senti-card-border rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-senti-cyan/20 flex items-center justify-center flex-shrink-0">
            <span className="text-senti-cyan text-sm font-bold">L</span>
          </div>
          <p className="text-sm text-senti-text-secondary">
            Bank Transfer has zero fees. Best option if you're not in a rush.
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={numericAmount <= 0}
          className="w-full py-4 bg-senti-cyan text-white rounded-2xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
