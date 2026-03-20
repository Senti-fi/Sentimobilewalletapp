import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell     from '../layouts/AppShell';
import HomePage     from '../pages/home';
import SavePage     from '../pages/save';
import InvestPage   from '../pages/invest';
import NewVaultPage          from '../pages/invest/NewVaultPage';
import StablecoinLPVaultPage from '../pages/invest/StablecoinLPVaultPage';
import VaultDetailsPage      from '../pages/invest/VaultDetailsPage';
import PortfolioPage         from '../pages/invest/PortfolioPage';
import ExploreVaultsPage     from '../pages/invest/ExploreVaultsPage';
import GoalDetailPage        from '../pages/save/GoalDetailPage';
import WalletPage            from '../pages/wallet';
import AccountPage    from '../pages/account';
import ReferralPage   from '../pages/account/referral';
import OnboardingPage, { ONBOARDING_KEY } from '../pages/onboarding';
import { useAppStore } from '../store';

// ── Auth guards ────────────────────────────────────────────────────────
//
// Source of truth: store.userProfile (persisted in localStorage via Zustand).
// ONBOARDING_KEY is a secondary UX hint only — the profile is the real gate.

/** Redirects unauthenticated users to /onboarding. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const userProfile = useAppStore(s => s.userProfile);
  if (!userProfile) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

/** Redirects already-authenticated users away from the onboarding flow. */
function RequireGuest({ children }: { children: React.ReactNode }) {
  const userProfile = useAppStore(s => s.userProfile);
  if (userProfile) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

/** Root redirect — checks both the onboarding flag and the user profile. */
function InitialRedirect() {
  const userProfile = useAppStore(s => s.userProfile);
  const done = localStorage.getItem(ONBOARDING_KEY);
  return <Navigate to={done && userProfile ? '/home' : '/onboarding'} replace />;
}

const router = createBrowserRouter([
  // ── Onboarding — full-screen, no tab bar ──────────────────────────────
  {
    path: '/onboarding',
    element: (
      <RequireGuest>
        <OnboardingPage />
      </RequireGuest>
    ),
  },

  // ── Main app shell — all children require authentication ──────────────
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <InitialRedirect /> },

      { path: 'home',         element: <HomePage />     },
      { path: 'save',                   element: <SavePage />        },
      { path: 'save/goal/:goalId',      element: <GoalDetailPage />  },
      { path: 'invest',       element: <InvestPage />   },
      { path: 'invest/vault',              element: <NewVaultPage /> },
      { path: 'invest/vault/stablecoin-lp', element: <StablecoinLPVaultPage /> },
      { path: 'invest/position/:vaultId',   element: <VaultDetailsPage /> },
      { path: 'invest/portfolio',           element: <PortfolioPage /> },
      { path: 'invest/explore',            element: <ExploreVaultsPage /> },
      { path: 'wallet',       element: <WalletPage />   },
      { path: 'account',          element: <AccountPage />  },
      { path: 'account/referral', element: <ReferralPage /> },

      // Catch-all → /home
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);

export default router;
