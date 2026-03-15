import { Home, PiggyBank, ArrowLeftRight, BarChart2, UserCircle } from 'lucide-react';

export type NavTab = 'home' | 'save' | 'wallet' | 'invest' | 'account';

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'save',    label: 'Save',    Icon: PiggyBank },
  { id: 'wallet',  label: 'Move',    Icon: ArrowLeftRight },
  { id: 'invest',  label: 'Invest',  Icon: BarChart2 },
  { id: 'account', label: 'Account', Icon: UserCircle },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="bg-[#0f172a] border-t border-[#262626] flex items-start px-5 pt-[18px] pb-[18px] gap-2 shrink-0 w-full">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center gap-0.5 min-w-0"
          >
            <Icon
              className={`w-4 h-4 transition-colors ${isActive ? 'text-[#00e6ff]' : 'text-[#8ac7ff]'}`}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span
              className={`text-[13px] font-medium leading-[18px] whitespace-nowrap transition-colors ${
                isActive ? 'text-[#00e6ff]' : 'text-[#8ac7ff]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
