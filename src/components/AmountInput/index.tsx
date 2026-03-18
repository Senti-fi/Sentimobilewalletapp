/**
 * AmountInput
 *
 * Shared large-format amount entry used across all money flows:
 * Deposit · Send · Transfer · Buy with Fiat · Invest · Flexible Savings
 *
 * Layout (top → bottom):
 *   optional label
 *   large tappable amount display  ← tap anywhere to open keyboard
 *   optional available balance line
 *   optional quick-amount pill row
 *   optional error message
 *
 * Usage:
 *   const [raw, setRaw] = useState('');
 *   <AmountInput raw={raw} onChange={setRaw} availableBalance={1234.50} asset="USDC" />
 */

interface AmountInputProps {
  /** Raw string value — digits and at most one decimal, e.g. '' | '25' | '100.50' */
  raw: string;
  onChange: (v: string) => void;

  /** Visual size of the amount display. Default 'lg' (48 px). Use 'xl' for 64 px sheets. */
  size?: 'lg' | 'xl';

  /** Prompt shown above the amount, e.g. "How much would you like to send?" */
  label?: string;

  /** When provided, shows an "Available: $X.XX ASSET" line below the amount. */
  availableBalance?: number;
  asset?: string;

  /** Quick-select chips. Defaults to [25, 50, 100, 500]. */
  quickAmounts?: number[];

  /** Validation error shown beneath the chips. */
  error?: string;
}

/** Sanitise a raw string to a valid decimal amount (≤ 2 dp, no leading dots). */
function sanitise(val: string): string {
  // Keep only digits and the first decimal point
  const stripped = val.replace(/[^0-9.]/g, '');
  const parts    = stripped.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  // Limit to 2 decimal places
  if (parts[1] !== undefined && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  return stripped;
}

export default function AmountInput({
  raw,
  onChange,
  size = 'lg',
  label,
  availableBalance,
  asset,
  quickAmounts = [25, 50, 100, 500],
  error,
}: AmountInputProps) {
  const numVal = parseFloat(raw) || 0;

  const textClass = size === 'xl'
    ? 'font-bold text-[64px] tracking-[-0.64px] leading-none'
    : 'font-bold text-[48px] leading-[48px] tracking-[-1.2px]';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = sanitise(e.target.value);
    onChange(cleaned);
  }

  return (
    <div className="flex flex-col items-center w-full">

      {/* ── Label ─────────────────────────────────────────────────── */}
      {label && (
        <p className="font-medium text-[14px] leading-[20px] text-[#8ac7ff] text-center mb-[16px]">
          {label}
        </p>
      )}

      {/* ── Amount input ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center">
        <span className={`${textClass} text-white`}>$</span>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={handleChange}
          placeholder="0.00"
          className={`${textClass} text-white bg-transparent outline-none placeholder:text-[#6b7280]`}
          style={{ width: raw ? `${Math.max(raw.length, 4)}ch` : '4ch' }}
          aria-label="Amount"
        />
      </div>

      {/* ── Available balance ──────────────────────────────────────── */}
      {availableBalance !== undefined && (
        <p className="font-medium text-[14px] leading-[18px] text-center mt-[8px]">
          <span className="text-[#8ac7ff]">Available: </span>
          <span className="font-bold text-[#00e6ff]">
            ${availableBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {asset ? ` ${asset}` : ''}
          </span>
        </p>
      )}

      {/* ── Quick-amount pills ────────────────────────────────────── */}
      {quickAmounts.length > 0 && (
        <div className="flex items-center gap-[8px] mt-[20px] justify-center flex-wrap">
          {quickAmounts.map(amt => (
            <button
              key={amt}
              onClick={() => onChange(String(amt))}
              className={`rounded-full px-[21px] py-[9px] border transition-colors ${
                numVal === amt
                  ? 'bg-[#007bff] border-[#007bff]'
                  : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]'
              }`}
            >
              <p className="font-semibold text-[14px] leading-[20px] text-white text-center">
                ${amt >= 1000 ? amt.toLocaleString() : amt}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <p className="font-normal text-[12px] leading-[16px] text-[#ff4444] text-center mt-[8px] px-6">
          {error}
        </p>
      )}
    </div>
  );
}
