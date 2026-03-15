import { motion } from 'motion/react';
import { Home, Heart, Wallet, BarChart3, User } from 'lucide-react';

export type NavTab = 'home' | 'save' | 'wallet' | 'invest' | 'account';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const navItems: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'save', label: 'Save', icon: Heart },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'invest', label: 'Invest', icon: BarChart3 },
  { id: 'account', label: 'Account', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
      <div className="bg-senti-nav-bg border-t border-senti-card-border px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all"
              >
                <tab.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-senti-cyan' : 'text-senti-nav-inactive'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className={`text-[10px] transition-colors ${
                    isActive ? 'text-senti-cyan font-medium' : 'text-senti-nav-inactive'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
