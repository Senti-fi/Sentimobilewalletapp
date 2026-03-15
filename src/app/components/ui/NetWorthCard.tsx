import { Plus, ArrowUpFromLine, Send } from 'lucide-react';

interface NetWorthCardProps {
  balance: string;
  onDeposit: () => void;
  onSend: () => void;
  onTransfer: () => void;
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 16px',
  borderRadius: '9999px',
  border: '1.5px solid rgba(179, 251, 255, 0.5)',
  background: 'transparent',
  color: 'white',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  lineHeight: '1',
  fontFamily: 'inherit',
};

export default function NetWorthCard({ balance, onDeposit, onSend, onTransfer }: NetWorthCardProps) {
  return (
    <div
      style={{
        margin: '0 24px 20px',
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: '#0096c7',
        minHeight: '200px',
      }}
    >
      {/* SVG wave pattern background - matches reference exactly */}
      <svg
        viewBox="0 0 400 250"
        fill="none"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <rect width="400" height="250" fill="#0096c7" />
        <ellipse cx="120" cy="60" rx="220" ry="180" fill="rgba(255,255,255,0.07)" />
        <ellipse cx="350" cy="80" rx="180" ry="200" fill="rgba(255,255,255,0.05)" />
        <ellipse cx="200" cy="280" rx="260" ry="120" fill="rgba(255,255,255,0.04)" />
        <ellipse cx="50" cy="200" rx="150" ry="100" fill="rgba(255,255,255,0.03)" />
      </svg>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 18px' }}>
        <p style={{ color: 'white', fontSize: '13px', fontWeight: 400, lineHeight: '16px', marginBottom: '8px' }}>
          Net Worth
        </p>

        <p style={{ color: 'white', fontSize: '34px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          {balance}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Today&apos;s Earnings</span>
          <span style={{ color: '#32fc65', fontSize: '12px', fontWeight: 600 }}>+$146.30 (+ 2.4%)</span>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '16px' }}>
          <span style={{ display: 'block', width: '14px', height: '5px', borderRadius: '9999px', background: '#1d4ed8' }} />
          <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '9999px', background: 'white' }} />
          <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '9999px', background: 'white' }} />
          <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '9999px', background: 'rgba(255,255,255,0.5)' }} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <button onClick={onDeposit} style={btnStyle}>
            <Plus size={16} strokeWidth={2} /> Deposit
          </button>
          <button onClick={onSend} style={btnStyle}>
            <ArrowUpFromLine size={16} strokeWidth={2} /> Send
          </button>
          <button onClick={onTransfer} style={btnStyle}>
            <Send size={16} strokeWidth={2} /> Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
