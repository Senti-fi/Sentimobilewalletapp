import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Calendar, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import LucyChip from './LucyChip';

interface CreateGoalModalProps {
  onClose: () => void;
  onCreate: (goalData: any) => void;
  onOpenLucy: () => void;
}

const goalTemplates = [
  { emoji: '🏥', name: 'Emergency Fund', suggestedAmount: 5000, color: 'from-red-400 to-pink-500' },
  { emoji: '💻', name: 'Laptop Fund', suggestedAmount: 1200, color: 'from-blue-400 to-cyan-500' },
  { emoji: '✈️', name: 'Travel Fund', suggestedAmount: 3000, color: 'from-purple-400 to-indigo-500' },
  { emoji: '🎓', name: 'Tuition', suggestedAmount: 10000, color: 'from-green-400 to-emerald-500' },
  { emoji: '🏠', name: 'Rent', suggestedAmount: 2000, color: 'from-yellow-400 to-orange-500' },
  { emoji: '🛂', name: 'Visa Fees', suggestedAmount: 500, color: 'from-pink-400 to-rose-500' },
  { emoji: '🎯', name: 'Custom Goal', suggestedAmount: 0, color: 'from-gray-400 to-slate-500' },
];

export default function CreateGoalModal({ onClose, onCreate, onOpenLucy }: CreateGoalModalProps) {
  const [step, setStep] = useState(1); // 1: select template, 2: customize details
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showLucyRecommendation, setShowLucyRecommendation] = useState(false);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setGoalName(template.name === 'Custom Goal' ? '' : template.name);
    setTargetAmount(template.suggestedAmount > 0 ? template.suggestedAmount.toString() : '');
    setStep(2);
  };

  const calculateMonthlyTarget = () => {
    if (!targetAmount || !deadline) return 0;
    
    const now = new Date();
    const end = new Date(deadline);
    const monthsDiff = Math.max(
      1,
      (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
    );
    
    return parseFloat(targetAmount) / monthsDiff;
  };

  const handleCreate = () => {
    if (!goalName || !targetAmount || !deadline) return;

    const goalData = {
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline,
      monthlyTarget: calculateMonthlyTarget(),
      emoji: selectedTemplate?.emoji || '🎯',
      color: selectedTemplate?.color || 'from-blue-400 to-cyan-500',
    };

    onCreate(goalData);
  };

  const monthlyTarget = calculateMonthlyTarget();
  const lucyRecommendation = monthlyTarget > 0 
    ? `Based on your ${goalName} goal of $${targetAmount}, I recommend saving $${monthlyTarget.toFixed(2)} per month to reach your target by ${new Date(deadline).toLocaleDateString()}.`
    : '';

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
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-gray-900">Create Savings Goal</h2>
              <p className="text-sm text-gray-500">
                {step === 1 ? 'Choose a template' : 'Customize your goal'}
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
            {/* Step 1: Template Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div className="mb-4">
                  <LucyChip 
                    text="What are you saving for?" 
                    onClick={onOpenLucy}
                  />
                </div>

                {goalTemplates.map((template, index) => (
                  <motion.button
                    key={template.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {template.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-gray-900 mb-0.5">{template.name}</h4>
                      {template.suggestedAmount > 0 && (
                        <p className="text-sm text-gray-500">
                          Suggested: ${template.suggestedAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-blue-600">
                      <Target className="w-5 h-5" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Goal Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* Selected Template Preview */}
                <div className={`bg-gradient-to-br ${selectedTemplate?.color} rounded-2xl p-5 text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">{selectedTemplate?.emoji}</div>
                    <div>
                      <h3 className="text-xl">{selectedTemplate?.name}</h3>
                      <p className="text-sm text-white/80">Your new savings goal</p>
                    </div>
                  </div>
                </div>

                {/* Goal Name */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g., Emergency Fund"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                  />
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Target Amount</label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Target Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 text-base"
                  />
                </div>

                {/* Lucy's Recommendation */}
                {monthlyTarget > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-gray-900">Lucy's Recommendation</p>
                        </div>
                        <p className="text-xs text-gray-700 mb-3">
                          To reach your goal of ${targetAmount}, save{' '}
                          <span className="text-blue-600">${monthlyTarget.toFixed(2)}/month</span>
                        </p>
                        <div className="bg-white rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Monthly savings</span>
                            <span className="text-gray-900">${monthlyTarget.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Timeline</span>
                            <span className="text-gray-900">
                              {Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Progress tracking</span>
                            <span className="text-green-600">Daily</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!goalName || !targetAmount || !deadline}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Goal
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}