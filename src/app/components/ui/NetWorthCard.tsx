import { Plus, ArrowUpFromLine, Send } from 'lucide-react';

interface NetWorthCardProps {
  balance: string;
  onDeposit: () => void;
  onSend: () => void;
  onTransfer: () => void;
}

export default function NetWorthCard({ balance, onDeposit, onSend, onTransfer }: NetWorthCardProps) {
  return (
    <div
      style={{
        margin: '0 24px 20px',
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #00b4d8 0%, #0096c7 30%, #0077b6 60%, #023e8a 100%)',
        border: '1.5px solid rgba(0, 230, 255, 0.3)',
      }}
    >
      {/* Wave pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '90%',
            height: '140%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-20%',
            width: '80%',
            height: '140%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40%',
            left: '20%',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
          }}
        />
      </div>

      {/* Card content */}
      <div style={{ position: 'relative', padding: '20px 20px 18px' }}>
        {/* Label */}
        <p
          style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
            marginBottom: '8px',
            opacity: 0.9,
          }}
        >
          Net Worth
        </p>

        {/* Amount */}
        <p
          style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: '38px',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
          }}
        >
          {balance}
        </p>

        {/* Today's Earnings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>Today's Earnings</span>
          <span style={{ color: '#32fc65', fontSize: '11px', fontWeight: 600 }}>+$146.30 (+ 2.4%)</span>
        </div>

        {/* Dots indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '14px' }}>
          <div style={{ width: '14px', height: '4px', borderRadius: '9999px', background: '#2c14dd' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '9999px', background: 'white' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '9999px', background: 'white' }} />
          <div style={{ width: '4px', height: '4px', borderRadius: '9999px', background: 'rgba(255,255,255,0.5)' }} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <button
            onClick={onDeposit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1.5px solid rgba(179, 251, 255, 0.6)',
              background: 'rgba(0, 123, 255, 0.4)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              lineHeight: '1',
            }}
          >
            <Plus size={16} strokeWidth={2} /> Deposit
          </button>
          <button
            onClick={onSend}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1.5px solid rgba(179, 251, 255, 0.6)',
              background: 'rgba(0, 123, 255, 0.4)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              lineHeight: '1',
            }}
          >
            <ArrowUpFromLine size={16} strokeWidth={2} /> Send
          </button>
          <button
            onClick={onTransfer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1.5px solid rgba(179, 251, 255, 0.6)',
              background: 'rgba(0, 123, 255, 0.4)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              lineHeight: '1',
            }}
          >
            <Send size={16} strokeWidth={2} /> Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
