import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { supabase } from './lib/supabase';
import { useAppStore } from './store';
import type { AuthProvider } from './store/types';

/**
 * Subscribes to Supabase auth state changes for the lifetime of the app.
 *
 * INITIAL_SESSION — fires on startup; restores the profile for users who
 *   already have a valid session (browser reload, returning visit).
 * SIGNED_IN — fires after a successful OAuth redirect; same restoration logic.
 * SIGNED_OUT — clears the local profile so RequireAuth redirects to /onboarding.
 *
 * Only sets userProfile when the user already has a username in the `users`
 * table. New users (no username yet) are left with a null profile so the
 * onboarding flow can collect one.
 */
function AuthListener() {
  const setUserProfile   = useAppStore(s => s.setUserProfile);
  const clearUserProfile = useAppStore(s => s.clearUserProfile);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase; // capture non-null ref for async callbacks

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          clearUserProfile();
          return;
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          const { data } = await client
            .from('users')
            .select('username')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();

          if (data?.username) {
            const raw = session.user.app_metadata?.provider as string | undefined;
            const authProvider: AuthProvider = raw === 'apple' ? 'apple' : 'google';

            setUserProfile({
              id:           session.user.id,
              email:        session.user.email ?? '',
              authProvider,
              username:     data.username,
              createdAt:    session.user.created_at,
            });
          }
          // No username yet → onboarding will collect it; profile stays null.
        }
      },
    );

    return () => subscription.unsubscribe();

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function SyncInit() {
  useSupabaseSync();
  return null;
}

export default function App() {
  return (
    <>
      <AuthListener />
      <SyncInit />
      <RouterProvider router={router} />
    </>
  );
}
