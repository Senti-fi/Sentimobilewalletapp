import { NavLink } from 'react-router-dom';
import { House, PiggyBank, BarChart2, ArrowLeftRight, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tab {
  path: string;
  label: string;
  Icon: LucideIcon;
}

const TABS: Tab[] = [
  { path: '/home',    label: 'Home',    Icon: House          },
  { path: '/save',    label: 'Save',    Icon: PiggyBank      },
  { path: '/wallet',  label: 'Wallet',  Icon: ArrowLeftRight },
  { path: '/invest',  label: 'Invest',  Icon: BarChart2      },
  { path: '/account', label: 'Account', Icon: UserCircle     },
];

export default function BottomTabBar() {
  return (
    <nav
      className="bg-[#0f172a] border-t border-[#262626] h-[80px] flex gap-[10px] items-start px-5 pt-[23px] pb-0 shrink-0 overflow-hidden"
      aria-label="Main navigation"
    >
      {TABS.map(({ path, label, Icon }) => (
        <NavLink
          key={path}
          to={path}
          className="flex-1 flex flex-col items-center gap-0.5 min-w-0"
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00e6ff]' : 'text-[#8ac7ff]'}`}
                strokeWidth={1.8}
              />
              <span
                className={`text-[14px] font-medium leading-[18px] whitespace-nowrap ${
                  isActive ? 'text-[#00e6ff]' : 'text-[#8ac7ff]'
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
