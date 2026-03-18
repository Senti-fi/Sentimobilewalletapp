/**
 * PostHog analytics — thin wrapper so the rest of the app never
 * imports posthog-js directly and can be easily swapped / disabled.
 *
 * Guards against missing env vars so the app works in dev without keys.
 */
import posthog from 'posthog-js';

const key  = import.meta.env.VITE_POSTHOG_KEY  as string | undefined;
const host = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

export function initAnalytics(): void {
  if (!key) return;
  posthog.init(key, {
    api_host:         host ?? 'https://us.i.posthog.com',
    capture_pageview: false,   // SPA — no automatic pageview noise
    persistence:      'localStorage',
  });
}

/** Call once after the user completes onboarding. */
export function identifyUser(
  id: string,
  traits: { email: string; authProvider: string; username: string },
): void {
  if (!key) return;
  posthog.identify(id, traits);
}

/** Call on sign-out to disassociate the session from the user. */
export function resetIdentity(): void {
  if (!key) return;
  posthog.reset();
}

/** Fire a named event with optional properties. */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!key) return;
  posthog.capture(event, properties);
}
