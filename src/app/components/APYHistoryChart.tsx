import { motion } from 'motion/react';

interface APYHistoryChartProps {
  data: Array<{ date: string; apy: number }>;
  currentAPY: number;
  period: '30d' | '90d';
}

export default function APYHistoryChart({ data, currentAPY, period }: APYHistoryChartProps) {
  const maxAPY = Math.max(...data.map(d => d.apy));
  const minAPY = Math.min(...data.map(d => d.apy));
  const range = maxAPY - minAPY;

  // Calculate points for the line
  const width = 300;
  const height = 80;
  const padding = 10;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((point.apy - minAPY) / range) * (height - 2 * padding);
    return { x, y, apy: point.apy };
  });

  const pathData = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Calculate change
  const firstAPY = data[0].apy;
  const change = currentAPY - firstAPY;
  const changePercent = ((change / firstAPY) * 100).toFixed(2);
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">APY History</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-gray-900">{currentAPY.toFixed(2)}%</span>
            <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{changePercent}% ({period})
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Range</p>
          <p className="text-xs text-gray-900">{minAPY.toFixed(2)}% - {maxAPY.toFixed(2)}%</p>
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Area under the line */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          d={`${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#gradient)"
          opacity="0.2"
        />

        {/* Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          d={pathData}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point */}
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill={isPositive ? "#10b981" : "#ef4444"}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Historical rates over the past {period === '30d' ? '30 days' : '90 days'}
      </p>
    </div>
  );
}
