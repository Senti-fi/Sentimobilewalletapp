import { useRef, useCallback } from 'react';

/**
 * useHasSeenIntro
 *
 * Captures the first-visit state from localStorage at mount time (via useRef,
 * so the value is stable for the component's lifetime — no re-render flash).
 *
 * Call markSeen() when the user has completed the intro (e.g. navigates forward).
 * On the next mount, isFirstVisit will be false and educational content is hidden.
 *
 * Suggested keys:
 *   hasSeenFlexibleSavingsIntro
 *   hasSeenGoalSavingsIntro
 *   hasSeenCommittedSavingsIntro
 */
export function useHasSeenIntro(key: string): {
  isFirstVisit: boolean;
  markSeen: () => void;
} {
  // Read localStorage once at mount. useRef ensures the value never changes
  // within the same component instance (no state update → no re-render flash).
  const isFirstVisit = useRef(localStorage.getItem(key) !== 'true').current;

  const markSeen = useCallback(() => {
    localStorage.setItem(key, 'true');
  }, [key]);

  return { isFirstVisit, markSeen };
}
