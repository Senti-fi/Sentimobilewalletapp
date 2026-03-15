import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Lock, ChevronRight, AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface LockedSavingsModalProps {
  onClose: () => void;
  onCreate: (savingData: any) => void;
  onExploreVaults?: () => void;
}

const lockPeriods = [
  { days: 30,  label: '30 Days',  subtitle: 'Steady Returns',  apy: '10.5', estimate: 12,  popular: false, best: false },
  { days: 60,  label: '60 Days',  subtitle: 'Growing Returns', apy: '11.8', estimate: 24,  popular: false, best: false },
  { days: 90,  label: '90 Days',  subtitle: 'Better Returns',  apy: '12.5', estimate: 38,  popular: true,  best: false },
  { days: 180, label: '180 Days', subtitle: 'Strong Returns',  apy: '13.9', estimate: 80,  popular: false, best: false },
  { days: 365, label: '1 Year',   subtitle: 'Maximum Returns', apy: '15.0', estimate: 180, popular: false, best: true  },
];

type Screen = 'pick' | 'amount' | 'processing' | 'success';

export default function LockedSavingsModal({ onClose, onCreate, onExploreVaults }: LockedSavingsModalProps) {
  const [screen, setScreen] = useState<Screen>('pick');
  const [selectedPeriod, setSelectedPeriod] = useState<typeof lockPeriods[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDC');

  // Mock balances
  const balances: Record<string, number> = { USDC: 5420.50, USDT: 3500.00, SOL: 45.32 };
  const currentBalance = balances[asset];

  const getUnlockDate = () => {
    if (!selectedPeriod) return '';
    const d = new Date(Date.now() + selectedPeriod.days * 86400000);
    return d.toISOString().split('T')[0];
  };

  const projectedEarnings = () => {
    if (!amount || !selectedPeriod) return 0;
    const p = parseFloat(amount);
    const apy = parseFloat(selectedPeriod.apy) / 100;
    return (p * apy * selectedPeriod.days) / 365;
  };

  const handlePeriodSelect = (p: typeof lockPeriods[0]) => {
    setSelectedPeriod(p);
    setScreen('amount');
  };

  const handleLock = () => {
    if (!amount || !selectedPeriod || parseFloat(amount) <= 0) return;
    setScreen('processing');
    setTimeout(() => {
      onCreate({
        amount: parseFloat(amount),
        asset,
        duration: selectedPeriod.days,
        apy: selectedPeriod.apy,
        startDate: new Date().toISOString().split('T')[0],
        unlockDate: getUnlockDate(),
        earnings: 0,
      });
      setScreen('success');
      setTimeout(onClose, 2800);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(1.5px)' }}
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
          {screen === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mb-6">
                <Loader className="w-14 h-14 text-[#007bff]" />
              </motion.div>
              <p className="text-white text-lg font-semibold mb-1">Locking Your Savings</p>
              <p className="text-[#8ac7ff] text-sm text-center">
                Securing your funds for {selectedPeriod?.label}...
              </p>
            </div>
          )}

          {/* Success */}
          {screen === 'success' && (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <CheckCircle className="w-14 h-14 text-[#00e6ff]" />
              </motion.div>
              <p className="text-white text-xl font-bold">Locked Successfully!</p>
              <p className="text-[#8ac7ff] text-sm text-center">
                Your funds are now earning {selectedPeriod?.apy}% APY
              </p>
              <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-xl p-4 w-full flex flex-col gap-3 mt-2">
                {[
                  { label: 'Amount Locked', value: `${amount} ${asset}` },
                  { label: 'Lock Period', value: selectedPeriod?.label },
                  { label: 'APY', value: `${selectedPeriod?.apy}%`, color: 'text-[#00e6ff]' },
                  { label: 'Projected Earnings', value: `+$${projectedEarnings().toFixed(2)}`, color: 'text-[#00e6ff]' },
                  { label: 'Unlocks On', value: new Date(getUnlockDate()).toLocaleDateString() },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-[#8ac7ff] text-xs">{r.label}</span>
                    <span className={`text-xs font-medium ${r.color ?? 'text-white'}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pick lock period */}
          {screen === 'pick' && (
            <>
              <div className="px-6 pt-3 pb-2 shrink-0">
                <p className="text-white text-2xl font-bold tracking-tight leading-8">Choose Lock Period</p>
                <p className="text-[#8ac7ff] text-sm mt-0.5">Longer locks earn more.</p>
              </div>

              {/* Lucy card */}
              <div className="mx-6 mb-4 bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-xl px-5 py-3 flex gap-4 items-center shrink-0">
                <div className="w-8 h-8 bg-[#007bff] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">L</span>
                </div>
                <p className="text-white text-xs leading-4 flex-1">
                  Which lock period is best for me?
                </p>
              </div>

              <div className="overflow-y-auto flex-1 px-6 flex flex-col gap-6 pb-6">
                {lockPeriods.map((p) => (
                  <button
                    key={p.days}
                    onClick={() => handlePeriodSelect(p)}
                    className="bg-[#1a2540] border border-[rgba(0,123,255,0.2)] rounded-xl px-4 py-4 flex items-center justify-between relative"
                  >
                    {(p.popular || p.best) && (
                      <span className="absolute top-3 left-[108px] bg-[#007bff] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {p.popular ? 'Popular' : 'Best Value'}
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#007bff] rounded-full flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                      <div className="text-left">
                        <p className="text-white text-base font-bold leading-6">{p.label}</p>
                        <p className="text-[#94a3b8] text-xs">{p.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[#00e6ff] text-base font-bold leading-6">≈ ${p.estimate}</p>
                        <p className="text-[#94a3b8] text-xs">On $500</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8ac7ff] shrink-0" />
                    </div>
                  </button>
                ))}

                <p className="text-[#8ac7ff] text-xs text-center opacity-80">
                  Estimated earnings based on $500. Actual earnings may vary.
                </p>
              </div>
            </>
          )}

          {/* Amount entry */}
          {screen === 'amount' && selectedPeriod && (
            <>
              <div className="px-6 pt-3 pb-4 flex items-center gap-4 shrink-0">
                <button onClick={() => setScreen('pick')}>
                  <ChevronRight className="w-6 h-6 text-white rotate-180" />
                </button>
                <div>
                  <p className="text-white text-xl font-bold leading-8">{selectedPeriod.label}</p>
                  <p className="text-[#8ac7ff] text-xs">{selectedPeriod.apy}% APY — {selectedPeriod.subtitle}</p>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 px-6 flex flex-col gap-5 pb-8">
                {/* Amount input */}
                <div className="bg-[#1a2540] border border-[#3c5679] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#8ac7ff] text-xs">Amount to lock</span>
                    <button
                      onClick={() => setAmount(currentBalance.toString())}
                      className="text-[#007bff] text-xs font-medium"
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

                {/* Earnings preview */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-white text-sm font-medium">Projected Earnings</p>
                    {[
                      { label: 'You will lock', value: `${amount} ${asset}` },
                      { label: 'Annual APY', value: `${selectedPeriod.apy}%`, color: 'text-[#00e6ff]' },
                      { label: `Earnings (${selectedPeriod.label})`, value: `+$${projectedEarnings().toFixed(2)}`, color: 'text-[#00e6ff]' },
                      { label: 'Total at unlock', value: `$${(parseFloat(amount) + projectedEarnings()).toFixed(2)}`, color: 'text-[#00e6ff]' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] pt-2 first:border-0 first:pt-0">
                        <span className="text-[#8ac7ff] text-xs">{r.label}</span>
                        <span className={`text-xs font-medium ${r.color ?? 'text-white'}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warning */}
                <div className="bg-[#1a2030] border border-[rgba(255,180,0,0.2)] rounded-xl p-4 flex gap-3 items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-xs font-medium mb-1">Early Withdrawal Penalty</p>
                    <p className="text-[#8ac7ff] text-xs leading-4">
                      Principal only returned. 10% of accrued interest forfeited. Unlocks on{' '}
                      {getUnlockDate() ? new Date(getUnlockDate()).toLocaleDateString() : '—'}.
                    </p>
                  </div>
                </div>

                {/* Lock button */}
                <button
                  onClick={handleLock}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance}
                  className="w-full h-14 bg-[#007bff] rounded-xl text-white text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Lock {amount || '0'} {asset} for {selectedPeriod.label}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
