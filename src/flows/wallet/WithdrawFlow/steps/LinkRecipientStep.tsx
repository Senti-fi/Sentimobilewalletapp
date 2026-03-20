/**
 * LinkRecipientStep
 *
 * Figma 317:4090 — Bottom sheet overlay on the frozen WalletPage.
 * Drag handle → large bold title + blue X close → search card → user list.
 *
 * User search:
 *   - On mount: loads up to 8 suggested users from DB (excluding self)
 *   - While typing: debounced 300 ms ilike query on username
 *   - Clicking a result calls onNext immediately (no extra confirm step)
 */
import { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Loader2 } from 'lucide-react';
import type { StepProps } from '../../../savings/types';
import type { WithdrawFlowData } from '../types';
import { supabase } from '../../../../lib/supabase';
import { useAppStore } from '../../../../store';

interface UserResult {
  username: string;
  handle:   string;
}

// Deterministic avatar colour from username
const AVATAR_COLORS = ['#1a3a6b', '#0d2a4a', '#0a2040', '#1a2a5a', '#0d3050'];
function avatarColor(username: string): string {
  let h = 0;
  for (const c of username) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

async function searchUsers(term: string, excludeId: string): Promise<UserResult[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('users')
    .select('username, handle')
    .ilike('username', term ? `%${term}%` : '%')
    .neq('auth_user_id', excludeId)
    .limit(8);
  return (data ?? []) as UserResult[];
}

export default function LinkRecipientStep({ onNext, onExit }: StepProps<WithdrawFlowData>) {
  const selfId = useAppStore(s => s.userProfile?.id) ?? '';

  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Debounced live search — fires on every query change and on mount
  useEffect(() => {
    let cancelled = false;
    setSearching(true);

    const term = query.trim().replace(/^@/, '');

    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const rows = await searchUsers(term, selfId);
        if (!cancelled) setResults(rows);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => { cancelled = true; clearTimeout(timer); setSearching(false); };
  }, [query, selfId]);

  const handleSelect = (u: UserResult) => {
    onNext({ recipient: u.handle ?? `@${u.username}` });
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end">

      {/* Blurred backdrop */}
      <div
        className="flex-1 backdrop-blur-[2px] bg-[rgba(217,217,217,0.15)]"
        onClick={onExit}
      />

      {/* ── Bottom sheet ──────────────────────────────────────────────── */}
      <div
        className="bg-[#0a142f] rounded-tl-[24px] rounded-tr-[24px] flex flex-col shrink-0 overflow-hidden"
        style={{ maxHeight: '88vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center" style={{ marginTop: 16, marginBottom: 4 }}>
          <div className="bg-[rgba(255,255,255,0.18)] rounded-[9999px]" style={{ width: 36, height: 4 }} />
        </div>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5" style={{ marginTop: 20 }}>
          <div className="flex flex-col gap-[4px]">
            <p className="font-bold text-[24px] leading-[32px] tracking-[-0.6px] text-white">
              Send via Link
            </p>
            <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
              Send money instantly to any Senti user.
            </p>
          </div>
          <button
            onClick={onExit}
            className="bg-[#8ac7ff] rounded-full size-[40px] flex items-center justify-center shrink-0"
          >
            <X size={16} className="text-[#0a142f]" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Scrollable content ────────────────────────────────────── */}
        <div className="overflow-y-auto scrollbar-hide px-5 pb-[40px]" style={{ marginTop: 24 }}>

          {/* Search card */}
          <div className="bg-[#1a2540] rounded-[20px] px-[24px] py-[16px] flex flex-col gap-[8px] mb-[12px]">
            <p className="font-medium text-[14px] leading-[20px] text-[#8ac7ff]">
              Find a Senti user
            </p>
            <div className="relative">
              <div className="bg-[#0a142f] border border-[#3c5679] rounded-[12px] h-[56px] flex items-center pl-[49px] pr-[17px]">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search @username"
                  className="flex-1 bg-transparent font-normal text-[16px] leading-[normal] text-white placeholder:text-[#8ac7ff] outline-none min-w-0"
                  autoFocus
                />
              </div>
              <div className="absolute left-[16px] top-1/2 -translate-y-1/2">
                {searching
                  ? <Loader2 size={20} className="text-[#8ac7ff] animate-spin" />
                  : <Search size={20} className="text-[#8ac7ff]" />
                }
              </div>
            </div>
          </div>

          {/* Results card */}
          <div className="bg-[#1a2540] rounded-[20px] px-[24px] py-[16px] flex flex-col gap-[16px]">
            <p className="font-bold text-[12px] leading-[16px] tracking-[0.6px] uppercase text-[#8ac7ff]">
              {query.trim() ? 'Results' : 'Suggested'}
            </p>

            {!searching && results.length === 0 && (
              <p className="text-[#3c5679] font-normal text-[13px] leading-[18px] pb-2">
                {query.trim() ? 'No users found.' : 'No users to show.'}
              </p>
            )}

            <div className="flex flex-col">
              {results.map((u, i) => (
                <button
                  key={u.username}
                  onClick={() => handleSelect(u)}
                  className={`flex items-center py-[16px] text-left w-full ${
                    i < results.length - 1 ? 'border-b border-[rgba(255,255,255,0.06)]' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="relative rounded-full shrink-0 size-[48px] border-2 flex items-center justify-center"
                    style={{ borderColor: '#007bff', backgroundColor: avatarColor(u.username) }}
                  >
                    <p className="font-bold text-[18px] leading-[28px] text-[#007bff] text-center">
                      {u.username[0]?.toUpperCase()}
                    </p>
                  </div>

                  {/* Name + handle */}
                  <div className="flex-1 pl-[16px]">
                    <p className="font-semibold text-[16px] leading-[24px] text-white capitalize">
                      {u.username}
                    </p>
                    <p className="font-normal text-[14px] leading-[20px] text-[#8ac7ff]">
                      {u.handle ?? `@${u.username}`}
                    </p>
                  </div>

                  <ChevronRight size={20} className="text-[#8ac7ff] shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
