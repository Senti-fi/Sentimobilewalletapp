import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MoreVertical, Bot } from 'lucide-react';
import { formatCompactBalance } from '../utils/formatBalance';

interface VaultDetailPageProps {
  onBack: () => void;
  vaultName?: string;
  currentValue?: number;
  deposited?: number;
  earned?: number;
  returnPercent?: number;
  apy?: string;
  risk?: string;
  protocol?: string;
  tvl?: string;
  onAddMore?: () => void;
  onWithdraw?: () => void;
}

export default function VaultDetailPage({
  onBack,
  vaultName = 'USDT Vault',
  currentValue = 2385.08,
  deposited = 2342.91,
  earned = 42.17,
  returnPercent = 8.5,
  apy = '8.5',
  risk = 'Low',
  protocol = 'Aave',
  tvl = '$2.4B',
  onAddMore,
  onWithdraw,
}: VaultDetailPageProps) {
  const [performancePeriod, setPerformancePeriod] = useState<'7D' | '30D' | 'All'>('7D');

  // Generate mock chart data
  const chartData = useMemo(() => {
    const points = 30;
    const data: number[] = [];
    let value = deposited;
    for (let i = 0; i < points; i++) {
      value += (Math.random() * 3 - 0.5);
      data.push(value);
    }
    // Ensure last point matches current value
    data[data.length - 1] = currentValue;
    return data;
  }, [deposited, currentValue]);

  // Generate SVG path from chart data
  const generatePath = () => {
    const width = 320;
    const height = 120;
    const min = Math.min(...chartData) - 10;
    const max = Math.max(...chartData) + 10;
    const range = max - min;

    const points = chartData.map((v, i) => ({
      x: (i / (chartData.length - 1)) * width,
      y: height - ((v - min) / range) * height,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - (points[i].x - points[i - 1].x) / 3;
      const cp2y = points[i].y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }

    // Area fill path
    const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

    return { linePath: path, areaPath };
  };

  const { linePath, areaPath } = generatePath();

  const mockActivities = [
    { id: '1', type: 'Savings Deposit', time: '9:41 AM, 03 March 2026', amount: 200.0, positive: true, badge: null },
    { id: '2', type: 'Vault Investment Withdrawal', time: '9:41 AM, 03 March 2026', amount: 200.0, positive: false, badge: 'Save' },
    { id: '3', type: 'Funds Added', time: '9:41 AM, 03 March 2026', amount: 200.0, positive: true, badge: null },
    { id: '4', type: 'Savings Deposit', time: '9:41 AM, 03 March 2026', amount: 200.0, positive: false, badge: 'Save' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-senti-bg max-w-md mx-auto">
      {/* Header */}
      <div className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">{vaultName}</h1>
        <button className="p-2 -mr-2">
          <MoreVertical className="w-5 h-5 text-senti-text-secondary" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0f1d35] to-[#0a1628] border border-senti-card-border rounded-2xl p-5 mt-2 mb-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 bg-senti-green/20 text-senti-green text-xs font-medium rounded">
              {risk.toUpperCase()}
            </span>
            <p className="text-sm text-senti-text-secondary">
              Withdrawal: <span className="text-white font-medium">Instant</span>
            </p>
          </div>
          <p className="text-xs text-senti-text-muted mb-1">
            Earning daily returns on your USDC.
          </p>
          <p className="text-xs text-senti-text-muted uppercase tracking-wider mb-1">
            CURRENT VALUE
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            ${formatCompactBalance(currentValue)}
          </h2>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-xs text-senti-text-muted uppercase tracking-wider mb-1">
                DEPOSITED
              </p>
              <p className="text-white font-semibold">
                ${formatCompactBalance(deposited)}
              </p>
            </div>
            <div>
              <p className="text-xs text-senti-text-muted uppercase tracking-wider mb-1">
                EARNED
              </p>
              <p className="text-senti-green font-semibold">
                +${formatCompactBalance(earned)}
              </p>
            </div>
            <div>
              <p className="text-xs text-senti-text-muted uppercase tracking-wider mb-1">
                RETURN
              </p>
              <p className="text-white font-semibold">{returnPercent}%</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Performance</h3>
            <div className="flex bg-senti-card rounded-lg p-0.5 border border-senti-card-border">
              {(['7D', '30D', 'All'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setPerformancePeriod(period)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    performancePeriod === period
                      ? 'bg-senti-text-secondary text-white'
                      : 'text-senti-text-muted'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-senti-card border border-senti-card-border rounded-2xl p-4 mb-1">
            <svg viewBox="0 0 320 120" className="w-full h-28">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#chartGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-senti-text-muted">30 DAYS AGO</span>
              <span className="text-[10px] text-senti-text-muted">TODAY</span>
            </div>
            <p className="text-xs text-senti-text-muted text-center mt-2">
              Your earnings have grown consistently over the past 30 days.
            </p>
          </div>
        </div>

        {/* Lucy AI Insight */}
        <div className="bg-senti-card border border-senti-card-border rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-senti-cyan/20 flex items-center justify-center flex-shrink-0">
            <span className="text-senti-cyan text-sm font-bold">L</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-senti-text-secondary">
              Your USDC Vault is outperforming this month. Adding $500 more could earn you an extra $42 over 30 days.
            </p>
            <button className="text-senti-green text-sm font-medium mt-2">
              Add Funds →
            </button>
          </div>
        </div>

        {/* Protocol Info Badges */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-senti-card border border-senti-card-border rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Bot className="w-4 h-4 text-senti-text-muted" />
            <div>
              <p className="text-[10px] text-senti-text-muted uppercase">PROTOCOL</p>
              <p className="text-white text-sm font-medium">{protocol}</p>
            </div>
          </div>
          <div className="flex-1 bg-senti-card border border-senti-card-border rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Bot className="w-4 h-4 text-senti-text-muted" />
            <div>
              <p className="text-[10px] text-senti-text-muted uppercase">SECURITY</p>
              <p className="text-senti-green text-sm font-medium">Audited</p>
            </div>
          </div>
          <div className="flex-1 bg-senti-card border border-senti-card-border rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Bot className="w-4 h-4 text-senti-text-muted" />
            <div>
              <p className="text-[10px] text-senti-text-muted uppercase">TVL</p>
              <p className="text-white text-sm font-medium">{tvl}</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Recent Activities</h3>
            <button className="text-sm text-senti-cyan">View All</button>
          </div>
          <div className="space-y-1">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 py-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative ${
                  activity.positive ? 'bg-senti-green/20' : 'bg-senti-cyan/20'
                }`}>
                  <Bot className={`w-5 h-5 ${activity.positive ? 'text-senti-green' : 'text-senti-cyan'}`} />
                  {activity.badge && (
                    <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0 bg-senti-green text-white text-[8px] rounded font-bold">
                      {activity.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-senti-text-muted">{activity.time}</p>
                </div>
                <p className={`text-sm font-medium ${
                  activity.positive ? 'text-senti-green' : 'text-white'
                }`}>
                  ${activity.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAddMore}
            className="w-full py-4 bg-senti-cyan text-white rounded-2xl font-semibold text-base"
          >
            Add More
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onWithdraw}
            className="w-full py-4 bg-senti-card border border-senti-card-border text-white rounded-2xl font-semibold text-base"
          >
            Withdraw
          </motion.button>
        </div>
      </div>
    </div>
  );
}
