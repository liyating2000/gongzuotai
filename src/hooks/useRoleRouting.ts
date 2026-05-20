import { useEffect, useRef, useState } from 'react';

import {
  DEFAULT_USER_ROLE,
  buildPathForRole,
  parseRoleFromPathname,
  type UserRole,
} from '../features/layout/roles';

export type UseRoleRoutingOptions = {
  /**
   * Callback fired when the user navigates via browser back/forward and
   * a new role is parsed from the URL. Host should dispatch its full
   * role-change routine (reset tabs, reset portal pages, etc.) here.
   */
  onPopStateChange?: (role: UserRole) => void;
};

export type UseRoleRoutingReturn = {
  /** Role resolved on initial mount (URL → parsed → fallback to default). */
  initialUserRole: UserRole;
  /** Current role. */
  userRole: UserRole;
  /** Imperative setter — URL will sync via effect. */
  setUserRole: (role: UserRole) => void;
};

/**
 * Owns the `userRole` state and keeps it in sync with the URL.
 *
 * - First effect run uses `history.replaceState` so the initial URL tidy-up
 *   does not create an extra history entry.
 * - Subsequent changes use `pushState` so browser back/forward walks through
 *   the role history naturally.
 * - `popstate` triggers `onPopStateChange` so the host can run its full
 *   reset routine (we cannot do it here without leaking domain state into
 *   the hook).
 *
 * The host remains responsible for resetting non-role state (active tab,
 * portal sub-page, etc.) when `setUserRole` is called explicitly.
 */
export const useRoleRouting = (
  options?: UseRoleRoutingOptions
): UseRoleRoutingReturn => {
  const [initialUserRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER_ROLE;
    return parseRoleFromPathname(window.location.pathname) ?? DEFAULT_USER_ROLE;
  });
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole);

  // First effect run uses replaceState; subsequent use pushState.
  const didInitialUrlSyncRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetPath = buildPathForRole(userRole);
    if (window.location.pathname === targetPath) {
      didInitialUrlSyncRef.current = true;
      return;
    }
    if (!didInitialUrlSyncRef.current) {
      window.history.replaceState({ role: userRole }, '', targetPath);
      didInitialUrlSyncRef.current = true;
    } else {
      window.history.pushState({ role: userRole }, '', targetPath);
    }
  }, [userRole]);

  // Latest-callback ref so the popstate listener always sees fresh state.
  const onPopStateChangeRef = useRef(options?.onPopStateChange);
  onPopStateChangeRef.current = options?.onPopStateChange;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const parsed = parseRoleFromPathname(window.location.pathname);
      if (!parsed) return;
      const callback = onPopStateChangeRef.current;
      if (callback) {
        callback(parsed);
      } else {
        setUserRole(parsed);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { initialUserRole, userRole, setUserRole };
};
