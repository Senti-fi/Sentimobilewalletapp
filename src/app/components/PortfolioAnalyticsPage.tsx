import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  ArrowLeft,
  Calendar,
  BarChart3,
  Target,
  Percent
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

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

interface PortfolioAnalyticsPageProps {
  assets: Asset[];
  totalBalance: number;
  vaultBalance: number;
  onClose: () => void;
}

// Generate historical data for portfolio performance
const generateHistoricalData = (currentValue: number) => {
  const data = [];
  const days = 30;
  let value = currentValue * 0.85; // Start 15% lower

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate some growth with volatility
    const dailyChange = (Math.random() - 0.4) * 0.03; // Slight upward bias
    value = value * (1 + dailyChange);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(2)),
      change: parseFloat(((value - currentValue * 0.85) / (currentValue * 0.85) * 100).toFixed(2))
    });
  }

  // Ensure last value matches current
  data[data.length - 1].value = currentValue;
  data[data.length - 1].change = parseFloat(((currentValue - currentValue * 0.85) / (currentValue * 0.85) * 100).toFixed(2));

  return data;
};

export default function PortfolioAnalyticsPage({
  assets,
  totalBalance,
  vaultBalance,
  onClose,
}: PortfolioAnalyticsPageProps) {
  const [timeframe, setTimeframe] = useState<'7D' | '1M' | '3M' | '1Y'>('1M');

  // Calculate portfolio composition data
  const portfolioData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.value,
    percentage: (asset.value / totalBalance * 100).toFixed(1),
    color: asset.color.replace('bg-', ''),
  }));

  // Add vault to portfolio if it exists
  if (vaultBalance > 0) {
    portfolioData.push({
      name: 'Vault',
      value: vaultBalance,
      percentage: (vaultBalance / (totalBalance + vaultBalance) * 100).toFixed(1),
      color: 'emerald-500',
    });
  }

  // Chart colors
  const COLORS = {
    'blue-500': '#3b82f6',
    'white': '#10b981', // Using green for USDT instead of white
    'black': '#9333ea', // Using purple for SOL
    'emerald-500': '#10b981',
  };

  // Generate historical portfolio data
  const historicalData = generateHistoricalData(totalBalance);

  // Calculate performance metrics
  const initialValue = historicalData[0]?.value || totalBalance * 0.85;
  const currentValue = totalBalance;
  const totalGain = currentValue - initialValue;
  const totalGainPercent = (totalGain / initialValue) * 100;
  const isPositive = totalGain >= 0;

  // Asset performance comparison
  const assetPerformanceData = assets.map(asset => ({
    name: asset.symbol,
    performance: asset.changePercent,
    value: asset.value,
  }));

  // Chart configuration
  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: "#3b82f6",
    },
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none px-6 pt-6 pb-4 bg-gradient-to-br from-gray-50 to-blue-50/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl text-gray-900">Portfolio Analytics</h1>
            <p className="text-sm text-gray-500">Comprehensive insights & performance</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-500">Total Value</p>
            </div>
            <p className="text-xl text-gray-900">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className="text-xs text-gray-500">Total Return</p>
            </div>
            <p className={`text-xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </p>
            <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${totalGain.toFixed(2)}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-24 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Portfolio Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-900">Performance</h2>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['7D', '1M', '3M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    timeframe === tf
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-40"
                    formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ChartContainer>
        </motion.div>

        {/* Portfolio Composition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Asset Allocation</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.color as keyof typeof COLORS] || '#3b82f6'} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="text-sm font-medium text-gray-900">{data.name}</p>
                          <p className="text-sm text-gray-600">
                            ${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">{data.percentage}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-2">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[item.color as keyof typeof COLORS] || '#3b82f6' }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">${item.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Asset Performance Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Asset Performance</h2>
          </div>

          <ChartContainer config={chartConfig} className="h-48">
            <BarChart data={assetPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-gray-900">{data.name}</p>
                      <p className="text-sm text-green-600">
                        {data.performance > 0 ? '+' : ''}{data.performance.toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        ${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="performance"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Key Metrics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Asset Count</p>
              <p className="text-lg text-gray-900">{assets.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Best Performer</p>
              <p className="text-lg text-gray-900">
                {assets.reduce((best, asset) =>
                  asset.changePercent > best.changePercent ? asset : best
                ).symbol}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Total in Vault</p>
              <p className="text-lg text-gray-900">${vaultBalance.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Vault Allocation</p>
              <p className="text-lg text-gray-900">
                {((vaultBalance / (totalBalance + vaultBalance)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Diversification Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-5 h-5 text-white" />
            <h2 className="text-white">Diversification Score</h2>
          </div>

          <div className="flex items-end gap-3">
            <p className="text-4xl text-white">
              {Math.min(95, 40 + assets.length * 15)}
            </p>
            <p className="text-white/80 mb-1">/ 100</p>
          </div>

          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min(95, 40 + assets.length * 15)}%` }}
            />
          </div>

          <p className="text-sm text-white/80 mt-3">
            {assets.length >= 4
              ? 'Excellent diversification across multiple assets'
              : 'Consider diversifying across more assets to reduce risk'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}
