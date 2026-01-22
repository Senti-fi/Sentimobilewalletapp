import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Lock, Zap, ArrowRight, Plus, Wallet, DollarSign, PieChart, ArrowUpRight, ArrowDownToLine, ChevronDown, ChevronUp, Info, Shield, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import LucyChip from './LucyChip';
import VaultDepositModal from './VaultDepositModal';
import InvestInPoolModal from './InvestInPoolModal';
import VaultWithdrawModal from './VaultWithdrawModal';
import InvestmentDetailsModal from './InvestmentDetailsModal';
import WithdrawInvestmentModal from './WithdrawInvestmentModal';
import AddMoreInvestmentModal from './AddMoreInvestmentModal';
import APYHistoryChart from './APYHistoryChart';

interface GrowModalProps {
  onClose: () => void;
  vaultBalance: number;
  vaultEarned: number;
  onDeposit: (amount: number, asset: string) => void;
  onWithdraw: (amount: number, asset: string) => void;
  onWithdrawToWallet?: (amount: number, asset: string) => void;
  onInvest: (vaultName: string, amount: number, asset: string, apy: string, protocol: string) => void;
  walletAssets: Array<{
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
  }>;
  activeInvestments: Array<{
    id: string;
    name: string;
    amount: number;
    asset: string;
    apy: string;
    protocol: string;
    startDate: Date;
    earned: number;
  }>;
  totalWalletBalance: number;
}

// Generate mock historical APY data
const generateHistoricalData = (currentAPY: number, volatility: number = 0.5) => {
  const data = [];
  const days = 30;
  for (let i = 0; i < days; i++) {
    const variance = (Math.random() - 0.5) * volatility;
    const apy = currentAPY + variance;
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      apy: Math.max(0, apy)
    });
  }
  return data;
};

const opportunities = [
  {
    id: '1',
    name: 'USDC Vault',
    apy: '8.5',
    risk: 'Low',
    description: 'Earn interest on USDC with daily compounding',
    protocol: 'Aave',
    tvl: '$2.4B',
    withdrawalTime: 'Instant',
    minDeposit: 10,
    color: 'from-cyan-400 via-blue-500 to-blue-700',
    auditLink: 'https://docs.aave.com/developers/deployed-contracts/security-and-audits',
    historicalData: generateHistoricalData(8.5, 0.8),
  },
  {
    id: '2',
    name: 'Stablecoin LP',
    apy: '12.3',
    risk: 'Medium',
    description: 'Provide liquidity to stablecoin pairs',
    protocol: 'Curve',
    tvl: '$1.8B',
    withdrawalTime: '1-2 hours',
    minDeposit: 50,
    color: 'from-cyan-400 via-blue-500 to-blue-700',
    auditLink: 'https://curve.fi/audits',
    historicalData: generateHistoricalData(12.3, 1.5),
  },
  {
    id: '3',
    name: 'USDT Vault',
    apy: '9.2',
    risk: 'Low',
    description: 'Secure USDT lending with automatic compounding',
    protocol: 'Compound',
    tvl: '$1.2B',
    withdrawalTime: 'Instant',
    minDeposit: 10,
    color: 'from-cyan-400 via-blue-500 to-blue-700',
    auditLink: 'https://compound.finance/docs/security',
    historicalData: generateHistoricalData(9.2, 0.7),
  },
];

export default function GrowModal({ onClose, vaultBalance, vaultEarned, onDeposit, onWithdraw, onWithdrawToWallet, onInvest, walletAssets, activeInvestments, totalWalletBalance }: GrowModalProps) {
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedVaultData, setSelectedVaultData] = useState<{name: string, apy: string, protocol: string}>({name: '', apy: '', protocol: ''});
  const [activeTab, setActiveTab] = useState<'vaults' | 'investments'>('vaults');
  const [showRiskTooltip, setShowRiskTooltip] = useState<string | null>(null);
  const [expandedVault, setExpandedVault] = useState<string | null>(null);

  // Track collapsed state for each investment card
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  
  // Investment action modals
  const [selectedInvestment, setSelectedInvestment] = useState<typeof activeInvestments[0] | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWithdrawInvestmentModal, setShowWithdrawInvestmentModal] = useState(false);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);

  const toggleCard = (id: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Calculate total value in investments
  const totalInvestedValue = activeInvestments.reduce((sum, inv) => {
    const daysSinceStart = Math.floor((Date.now() - inv.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const simulatedEarnings = (inv.amount * parseFloat(inv.apy) / 100 / 365 * daysSinceStart);
    return sum + inv.amount + simulatedEarnings;
  }, 0);

  const totalEarnings = activeInvestments.reduce((sum, inv) => {
    const daysSinceStart = Math.floor((Date.now() - inv.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const simulatedEarnings = (inv.amount * parseFloat(inv.apy) / 100 / 365 * daysSinceStart);
    return sum + simulatedEarnings;
  }, 0);

  // Calculate weighted average APY
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const weightedAPY = totalInvested > 0
    ? activeInvestments.reduce((sum, inv) => sum + (inv.amount / totalInvested) * parseFloat(inv.apy), 0)
    : 0;

  const handleTopUpVault = () => {
    setShowDepositModal(true);
  };

  const handleWithdrawVault = () => {
    setShowWithdrawModal(true);
  };

  const handleInvestClick = (vaultName: string, apy: string, protocol: string) => {
    setSelectedVaultData({ name: vaultName, apy, protocol });
    setShowInvestModal(true);
  };

  const getRiskDescription = (risk: string) => {
    if (risk === 'Low') {
      return 'Low risk vaults use battle-tested lending protocols like Aave and Compound. Your funds are lent to verified borrowers with over-collateralization, minimizing default risk.';
    } else if (risk === 'Medium') {
      return 'Medium risk involves providing liquidity to decentralized exchanges. You may experience impermanent loss if token prices diverge, but earn higher yields from trading fees.';
    }
    return '';
  };

  return (
    <>
      {showDepositModal && (
        <VaultDepositModal
          onClose={() => setShowDepositModal(false)}
          vaultName="Vault Balance"
          apy="0"
          onDeposit={onDeposit}
          walletAssets={walletAssets}
          totalWalletBalance={totalWalletBalance}
        />
      )}
      
      {showWithdrawModal && (
        <VaultWithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          vaultBalance={vaultBalance}
          onWithdraw={onWithdraw}
        />
      )}
      
      {showInvestModal && (
        <InvestInPoolModal
          onClose={() => setShowInvestModal(false)}
          vaultName={selectedVaultData.name}
          apy={selectedVaultData.apy}
          protocol={selectedVaultData.protocol}
          onInvest={onInvest}
          vaultBalance={vaultBalance}
        />
      )}
      
      {showDetailsModal && (
        <InvestmentDetailsModal
          onClose={() => setShowDetailsModal(false)}
          investment={selectedInvestment!}
        />
      )}
      
      {showWithdrawInvestmentModal && selectedInvestment && (
        <WithdrawInvestmentModal
          onClose={() => setShowWithdrawInvestmentModal(false)}
          investment={selectedInvestment}
          onWithdraw={(investmentId: string, amount: number, withdrawEarnings: boolean, destination: 'vault' | 'wallet') => {
            if (destination === 'wallet' && onWithdrawToWallet) {
              // Withdraw directly to main wallet
              onWithdrawToWallet(amount, selectedInvestment.asset);
            } else {
              // Withdraw to vault balance
              onWithdraw(amount, selectedInvestment.asset);
            }
          }}
        />
      )}
      
      {showAddMoreModal && selectedInvestment && (
        <AddMoreInvestmentModal
          onClose={() => setShowAddMoreModal(false)}
          investment={selectedInvestment}
          vaultBalance={vaultBalance}
          onAddMore={(investmentId: string, amount: number, asset: string) => {
            // Deposit the amount from vault balance to the investment
            onInvest(selectedInvestment.name, amount, asset, selectedInvestment.apy, selectedInvestment.protocol);
          }}
        />
      )}
      
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
          className="bg-gradient-to-br from-gray-50 to-blue-50/30 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-gray-900">Vault</h2>
              <p className="text-sm text-gray-500">Grow your crypto effortlessly</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Portfolio Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5" />
                <p className="text-sm text-white/80">Total Portfolio Value</p>
              </div>
              <h2 className="text-4xl mb-3">${(vaultBalance + totalInvestedValue).toFixed(2)}</h2>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
                <div>
                  <p className="text-xs text-white/70 mb-1">Available</p>
                  <p className="text-lg">${vaultBalance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Invested</p>
                  <p className="text-lg">${totalInvestedValue.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70 mb-1">Earned</p>
                  <p className="text-lg text-green-300">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              {weightedAPY > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                  <p className="text-xs text-white/70">Weighted Avg. APY</p>
                  <p className="text-green-300">{weightedAPY.toFixed(2)}%</p>
                </div>
              )}
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100"
            >
              <button
                onClick={() => setActiveTab('vaults')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  activeTab === 'vaults'
                    ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">Available Vaults</span>
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`flex-1 py-2.5 rounded-xl transition-all relative ${
                  activeTab === 'investments'
                    ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">My Investments</span>
                {activeInvestments.length > 0 && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                    activeTab === 'investments' ? 'bg-green-400 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {activeInvestments.length}
                  </span>
                )}
              </button>
            </motion.div>

            {/* Content based on active tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'vaults' && (
                <motion.div
                  key="vaults"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Quick Actions - Deposit and Withdraw */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTopUpVault}
                      className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm border border-gray-100 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-2">
                        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-gray-900 text-sm mb-0.5">Deposit</p>
                      <p className="text-xs text-gray-500 text-center">To Vault</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWithdrawVault}
                      disabled={vaultBalance === 0}
                      className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm border border-gray-100 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-2">
                        <ArrowDownToLine className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-gray-900 text-sm mb-0.5">Withdraw</p>
                      <p className="text-xs text-gray-500 text-center">To Wallet</p>
                    </motion.button>
                  </div>

                  {/* Available Vaults */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-900">Explore Vaults</h3>
                      <span className="text-xs text-gray-500">{opportunities.length} available</span>
                    </div>

                    {/* Lucy Chip */}
                    <div className="mb-3">
                      <LucyChip text="Which vault is best for me?" />
                    </div>

                    <div className="space-y-3">
                      {opportunities.map((opp, index) => (
                        <motion.div
                          key={opp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          {/* Vault Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-gray-900">{opp.name}</h4>
                                <div className="flex items-center gap-1">
                                  <span className={`px-2 py-0.5 rounded-md text-xs ${
                                    opp.risk === 'Low'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {opp.risk}
                                  </span>
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRiskTooltip(showRiskTooltip === opp.id ? null : opp.id);
                                      }}
                                      className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                      <Info className={`w-3.5 h-3.5 ${opp.risk === 'Low' ? 'text-green-600' : 'text-yellow-600'}`} />
                                    </button>
                                    {showRiskTooltip === opp.id && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute z-10 left-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <p className="mb-2 font-medium">{opp.risk} Risk Explained</p>
                                        <p className="text-gray-300 leading-relaxed">{getRiskDescription(opp.risk)}</p>
                                        <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{opp.description}</p>
                            </div>
                          </div>

                          {/* Vault Metrics */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">APY</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl text-green-600">{opp.apy}%</span>
                                <span className="text-xs text-blue-600 flex items-center gap-0.5">
                                  <Zap className="w-3 h-3" />
                                  AI
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">Updated hourly</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-0.5">Withdrawal</p>
                              <p className="text-sm text-gray-900">{opp.withdrawalTime}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Protocol</p>
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-green-600" />
                                <p className="text-sm text-gray-900">{opp.protocol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-0.5">TVL</p>
                              <p className="text-sm text-gray-900">{opp.tvl}</p>
                            </div>
                          </div>

                          {/* Security Badge */}
                          <a
                            href={opp.auditLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 mt-3 p-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-green-600" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-900">Audited & Secure</p>
                              <p className="text-xs text-gray-500">View security reports</p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>

                          {/* APY History Chart - Expandable */}
                          {expandedVault === opp.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3"
                            >
                              <APYHistoryChart
                                data={opp.historicalData}
                                currentAPY={parseFloat(opp.apy)}
                                period="30d"
                              />
                            </motion.div>
                          )}

                          {/* Toggle Chart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedVault(expandedVault === opp.id ? null : opp.id);
                            }}
                            className="w-full mt-2 py-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            {expandedVault === opp.id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide APY History
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show APY History
                              </>
                            )}
                          </button>

                          {/* Action Button */}
                          <div className="mt-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                              onClick={() => handleInvestClick(opp.name, opp.apy, opp.protocol)}
                            >
                              <span className="text-sm">Deposit Now</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Minimum deposit: ${opp.minDeposit}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <motion.div
                    className="bg-white rounded-2xl p-5 space-y-4 border border-gray-100 shadow-sm"
                  >
                    <h3 className="text-gray-900 mb-3">Why Use Vaults?</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-1">Auto-Compound</p>
                        <p className="text-xs text-gray-600">Your earnings automatically reinvest to maximize returns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-1">Battle-Tested</p>
                        <p className="text-xs text-gray-600">Secured by audited protocols with billions in TVL</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-1">Flexible Access</p>
                        <p className="text-xs text-gray-600">Withdraw anytime with no lock-up periods</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'investments' && (
                <motion.div
                  key="investments"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {activeInvestments.length === 0 ? (
                    /* Empty State */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-8 text-center border border-gray-100"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PieChart className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 mb-2">No Active Investments</h3>
                      <p className="text-sm text-gray-600 mb-4">Start investing in vaults to earn passive yield on your crypto</p>
                      <button
                        onClick={() => setActiveTab('vaults')}
                        className="px-6 py-2.5 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white rounded-xl text-sm"
                      >
                        Explore Vaults
                      </button>
                    </motion.div>
                  ) : (
                    /* Active Investments */
                    <>
                      {/* Performance Summary - Moved to Top */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-gray-900 text-sm">Performance Summary</h4>
                          <span className="text-xs text-gray-500">{activeInvestments.length} position{activeInvestments.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Total Invested</p>
                            <p className="text-xl text-gray-900">${totalInvested.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Current Value</p>
                            <p className="text-xl text-gray-900">${totalInvestedValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Total Earnings</p>
                            <p className="text-lg text-green-600">+${totalEarnings.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Weighted APY</p>
                            <p className="text-lg text-green-600">{weightedAPY.toFixed(2)}%</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Compact Investment List */}
                      <div className="space-y-3">
                        {activeInvestments.map((investment, index) => {
                          const daysSinceStart = Math.floor((Date.now() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24));
                          const simulatedEarnings = (investment.amount * parseFloat(investment.apy) / 100 / 365 * daysSinceStart);
                          const currentValue = investment.amount + simulatedEarnings;
                          const percentChange = ((simulatedEarnings / investment.amount) * 100).toFixed(2);
                          const dailyYield = simulatedEarnings / Math.max(daysSinceStart, 1);
                          const isCollapsed = collapsedCards.has(investment.id);

                          return (
                            <motion.div
                              key={investment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Compact Header with Collapse Button */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-gray-900 text-sm">{investment.name}</h4>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{investment.protocol}</span>
                                    <span>•</span>
                                    <span>{daysSinceStart}d active</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg mb-1">
                                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                                      <span className="text-xs text-green-700">+{percentChange}%</span>
                                    </div>
                                    <span className="text-xs text-green-600">{investment.apy}% APY</span>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleCard(investment.id)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    {isCollapsed ? (
                                      <ChevronDown className="w-5 h-5 text-gray-600" />
                                    ) : (
                                      <ChevronUp className="w-5 h-5 text-gray-600" />
                                    )}
                                  </motion.button>
                                </div>
                              </div>

                              {/* Collapsible Content */}
                              <AnimatePresence>
                                {!isCollapsed && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    {/* Compact Value Display */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 mb-3 border border-blue-100">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-xs text-gray-500 mb-0.5">Current Value</p>
                                          <p className="text-2xl text-gray-900">${currentValue.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs text-gray-500 mb-0.5">Earned</p>
                                          <p className="text-lg text-green-600">+${simulatedEarnings.toFixed(2)}</p>
                                        </div>
                                      </div>
                                      
                                      {/* Progress Bar */}
                                      <div className="mt-3 pt-3 border-t border-blue-200/50">
                                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                                          <span>Initial: ${investment.amount.toFixed(2)}</span>
                                          <span>Daily: +${dailyYield.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((simulatedEarnings / investment.amount) * 100 * 2, 100)}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Compact Actions */}
                                    <div className="flex gap-2">
                                      <button
                                        className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
                                        onClick={() => {
                                          setSelectedInvestment(investment);
                                          setShowWithdrawInvestmentModal(true);
                                        }}
                                      >
                                        Withdraw
                                      </button>
                                      <button
                                        className="flex-1 py-2 text-xs bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 hover:shadow-md text-white rounded-lg transition-shadow"
                                        onClick={() => {
                                          setSelectedInvestment(investment);
                                          setShowAddMoreModal(true);
                                        }}
                                      >
                                        Add More
                                      </button>
                                      <button
                                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                        onClick={() => {
                                          setSelectedInvestment(investment);
                                          setShowDetailsModal(true);
                                        }}
                                      >
                                        Details
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Quick Actions Footer */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setActiveTab('vaults')}
                        className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-all group"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="text-sm">Add New Position</span>
                      </motion.button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}