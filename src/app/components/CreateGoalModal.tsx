import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronRight, Calendar, Lock } from 'lucide-react';

interface CreateGoalModalProps {
  onClose: () => void;
  onCreate: (goalData: any) => void;
  onOpenLucy: () => void;
}

const goalTemplates = [
  { emoji: '🏥', name: 'Emergency Fund', suggestedAmount: 5000 },
  { emoji: '💻', name: 'Laptop Fund',     suggestedAmount: 1200 },
  { emoji: '✈️', name: 'Travel Fund',     suggestedAmount: 3000 },
  { emoji: '🎓', name: 'Tuition',         suggestedAmount: 10000 },
  { emoji: '🏠', name: 'Rent',            suggestedAmount: 2000 },
  { emoji: '🛂', name: 'Visa Fees',       suggestedAmount: 500 },
  { emoji: '🎯', name: 'Custom Goal',     suggestedAmount: 0 },
];

export default function CreateGoalModal({ onClose, onCreate, onOpenLucy }: CreateGoalModalProps) {
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof goalTemplates[0] | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [termOne, setTermOne] = useState(false);
  const [termTwo, setTermTwo] = useState(false);

  const handleTemplateSelect = (tpl: typeof goalTemplates[0]) => {
    setSelectedTemplate(tpl);
    setGoalName(tpl.name === 'Custom Goal' ? '' : tpl.name);
    setTargetAmount(tpl.suggestedAmount > 0 ? tpl.suggestedAmount.toString() : '');
    setStep('details');
  };

  const calculateMonthlyTarget = () => {
    if (!targetAmount || !deadline) return 0;
    const now = new Date();
    const end = new Date(deadline);
    const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
    return parseFloat(targetAmount) / months;
  };

  const handleCreate = () => {
    if (!goalName || !targetAmount || !deadline) return;
    onCreate({
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline,
      monthlyTarget: calculateMonthlyTarget(),
      emoji: selectedTemplate?.emoji || '🎯',
      color: 'from-blue-400 to-cyan-500',
    });
  };

  const canCreate = goalName && targetAmount && deadline && termOne && termTwo;

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
          className="bg-[#0a142f] w-full max-w-md rounded-t-[24px] max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-4 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#8ac7ff]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 shrink-0">
            {step === 'details' ? (
              <button onClick={() => setStep('pick')} className="text-white">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
            ) : (
              <div className="w-6" />
            )}
            <p className="text-white text-xl font-normal leading-7">Create a Goal</p>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-[#8ac7ff]" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 pb-8">
            {/* STEP 1: Pick template */}
            {step === 'pick' && (
              <div className="flex flex-col gap-3 mt-2">
                <p className="text-[#8ac7ff] text-sm leading-5">What goal are you saving towards?</p>
                {goalTemplates.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleTemplateSelect(tpl)}
                    className="bg-[#1a2540] border border-[#3c5679] rounded-xl px-4 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tpl.emoji}</span>
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{tpl.name}</p>
                        {tpl.suggestedAmount > 0 && (
                          <p className="text-[#8ac7ff] text-xs mt-0.5">
                            Suggested: ${tpl.suggestedAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8ac7ff]" />
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 'details' && (
              <div className="flex flex-col gap-6 mt-2">
                {/* Goal Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#8ac7ff] text-xs leading-4">Goal Name</label>
                  <div className="bg-[#1a2540] border border-[#3c5679] rounded-xl h-14 flex items-center px-4">
                    <input
                      type="text"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="e.g. Rent, Emergency Fund, Vacation"
                      className="bg-transparent text-white text-xs w-full focus:outline-none placeholder:text-[#3c5679]"
                    />
                  </div>
                </div>

                {/* Target Amount */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#8ac7ff] text-xs leading-4">How much do you need for this goal?</label>
                  <div className="bg-[#1a2540] border border-[#3c5679] rounded-xl h-14 flex items-center px-4 gap-1">
                    <span className="text-[#8ac7ff] text-xs">$</span>
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent text-white text-xs w-full focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#3c5679]"
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#8ac7ff] text-xs leading-4">When do you want to reach this goal?</label>
                  <div className="bg-[#1a2540] border border-[#3c5679] rounded-xl h-14 flex items-center justify-between px-4">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-transparent text-white text-xs flex-1 focus:outline-none [color-scheme:dark]"
                    />
                    <Calendar className="w-5 h-5 text-[#8ac7ff] shrink-0 ml-2" />
                  </div>
                </div>

                {/* Lucy insight */}
                <div className="bg-[#162040] border border-[#3c5679] rounded-[20px] px-5 py-4 flex gap-4 items-start">
                  <div className="w-8 h-8 bg-[#007bff] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">L</span>
                  </div>
                  <p className="text-white text-xs leading-4 flex-1">
                    Name your goal something personal. It makes you{' '}
                    <span className="text-[#00e6ff] font-medium">40% more likely</span> to complete it.
                  </p>
                </div>

                {/* Monthly estimate */}
                {calculateMonthlyTarget() > 0 && (
                  <div className="bg-[#162040] border border-[rgba(0,123,255,0.2)] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[#8ac7ff] text-xs">Suggested monthly savings</span>
                    <span className="text-[#00e6ff] text-sm font-semibold">
                      ${calculateMonthlyTarget().toFixed(2)}/mo
                    </span>
                  </div>
                )}

                {/* Term toggles */}
                <div className="flex flex-col gap-4">
                  <TermToggle
                    checked={termOne}
                    onChange={setTermOne}
                    text={`I hereby agree that I will forfeit the interest accrued on this Goal savings if I fail to meet the target amount of $${targetAmount || '0.00'} by the set withdrawal date.`}
                  />
                  <TermToggle
                    checked={termTwo}
                    onChange={setTermTwo}
                    text="I understand that early withdrawal may result in forfeiture of accrued interest and potential penalties."
                  />
                </div>

                {/* Create button */}
                <button
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="w-full h-14 bg-[#007bff] border border-[rgba(0,123,255,0.2)] rounded-xl text-white text-base font-semibold leading-5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Goal
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TermToggle({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-[#007bff]' : 'bg-[#1a2540] border border-[#3c5679]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <p className="text-[#8ac7ff] text-xs leading-4 flex-1">{text}</p>
    </div>
  );
}
