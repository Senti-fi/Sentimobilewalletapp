const AUTH_ATTEMPT_KEY = 'senti_auth_attempt_started_at';
const AUTH_ATTEMPT_TTL_MS = 120000;

export function markAuthAttemptStarted(): void {
  localStorage.setItem(AUTH_ATTEMPT_KEY, String(Date.now()));
}

export function clearAuthAttempt(): void {
  localStorage.removeItem(AUTH_ATTEMPT_KEY);
}

export function isAuthAttemptActive(now = Date.now()): boolean {
  const raw = localStorage.getItem(AUTH_ATTEMPT_KEY);
  if (!raw) return false;

  const startedAt = Number(raw);
  if (!Number.isFinite(startedAt)) {
    localStorage.removeItem(AUTH_ATTEMPT_KEY);
    return false;
  }

  const active = now - startedAt < AUTH_ATTEMPT_TTL_MS;
  if (!active) {
    localStorage.removeItem(AUTH_ATTEMPT_KEY);
  }
  return active;
}

