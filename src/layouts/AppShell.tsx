import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from '../components/navigation/BottomTabBar';
import { trackPageview } from '../lib/analytics';

function PageviewTracker() {
  const location = useLocation();
  useEffect(() => { trackPageview(); }, [location.pathname]);
  return null;
}

/**
 * AppShell
 * ─────────────────────────────────────────────
 * Wraps every tab screen.
 * Layout:
 *   ┌──────────────────────────────┐
 *   │  <page content> (scrollable) │  flex-1, overflow-y-auto
 *   ├──────────────────────────────┤
 *   │  <BottomTabBar>  80px        │  shrink-0, pinned
 *   └──────────────────────────────┘
 *
 * The #root in globals.css is already capped at 430px and
 * centred, so this shell fills that container exactly.
 * Each page controls its own layout hierarchy (greeting, carousel, content).
 */
export default function AppShell() {
  return (
    <div className="relative h-full bg-[#0a142f]">
      <PageviewTracker />
      {/* scrollable page area — fills all space above the 80px nav bar */}
      <main className="absolute inset-0 bottom-[80px] overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>

      {/* nav bar — absolutely pinned at bottom, cannot be pushed by content */}
      <div className="absolute bottom-0 left-0 right-0">
        <BottomTabBar />
      </div>
    </div>
  );
}
