/**
 * withTimeout — races any Promise against a hard deadline.
 *
 * Why this exists:
 *   Supabase PostgREST queries return a Promise that can remain PENDING
 *   indefinitely when a request is blocked (missing RLS policy, network stall,
 *   connection pool exhausted). A blocked Promise never resolves AND never
 *   rejects, so try/catch and try/finally are useless — they only run after
 *   the await settles. The only way to guarantee a loading state always clears
 *   is to force the Promise to settle via a hard deadline.
 *
 * Usage:
 *   const { data } = await withTimeout(
 *     supabase.from('users').select('*').maybeSingle(),
 *     6000,
 *     'lookup user',
 *   );
 *
 * If the deadline fires first, withTimeout rejects with a TimeoutError.
 * The caller's try/catch picks it up and the finally block always runs.
 */

export class TimeoutError extends Error {
  readonly label: string;
  readonly ms:    number;

  constructor(label: string, ms: number) {
    super(`"${label}" did not respond within ${ms}ms`);
    this.name  = 'TimeoutError';
    this.label = label;
    this.ms    = ms;
  }
}

/**
 * Returns a Promise that either:
 *   - resolves/rejects with the same value as `promise`, or
 *   - rejects with TimeoutError after `ms` milliseconds — whichever comes first.
 *
 * The timeout timer is always cleared after the race settles (no leaks).
 */
export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms:      number,
  label  = 'query',
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout>;

  const deadline = new Promise<never>((_, reject) => {
    timerId = setTimeout(
      () => reject(new TimeoutError(label, ms)),
      ms,
    );
  });

  return Promise.race([Promise.resolve(promise), deadline]).finally(() => clearTimeout(timerId));
}
