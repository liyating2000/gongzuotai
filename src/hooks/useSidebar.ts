import { useCallback, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../lib/storage';
import { usePersistedState } from './usePersistedState';

export type UseSidebarReturn = {
  /** Whether the Rail is in collapsed (icons-only) mode. Persisted. */
  isSidebarCollapsed: boolean;
  /** Direct setter (mostly used by the collapse toggle button). */
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  /** Convenience toggle. */
  toggleSidebarCollapsed: () => void;

  /**
   * Set of currently expanded top-level menu group ids.
   * Persisted as a JSON array under the hood.
   */
  expandedMenuIds: Set<string>;
  /** Toggle a single menu group by id. */
  toggleMenuExpansion: (id: string) => void;
  /** Expand a menu group (no-op if already expanded). */
  expandMenuById: (id: string) => void;

  /** Free-text query for the sidebar search box. Session-only. */
  sidebarSearchQuery: string;
  setSidebarSearchQuery: (query: string) => void;
};

/**
 * Centralises all sidebar-related UI state so that App.tsx does not have to
 * manage 4+ independent pieces of state with overlapping persistence logic.
 *
 * Persists `collapsed` and `expandedMenuIds` via localStorage.
 * `sidebarSearchQuery` is session-scoped on purpose — no reason to recall
 * it after a reload.
 */
export const useSidebar = (): UseSidebarReturn => {
  // Collapsed state — persisted
  const [isSidebarCollapsed, setCollapsedInternal] =
    usePersistedState<boolean>(STORAGE_KEYS.sidebarCollapsed, false);

  const setIsSidebarCollapsed = useCallback(
    (collapsed: boolean) => setCollapsedInternal(collapsed),
    [setCollapsedInternal]
  );

  const toggleSidebarCollapsed = useCallback(
    () => setCollapsedInternal((prev) => !prev),
    [setCollapsedInternal]
  );

  // Expanded menu ids — persisted as array, exposed as Set
  const [expandedMenuIdList, setExpandedMenuIdList] = usePersistedState<
    string[]
  >(STORAGE_KEYS.expandedMenus, []);

  const expandedMenuIds = useMemo(
    () => new Set(expandedMenuIdList),
    [expandedMenuIdList]
  );

  const toggleMenuExpansion = useCallback(
    (id: string) => {
      setExpandedMenuIdList((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return Array.from(next);
      });
    },
    [setExpandedMenuIdList]
  );

  const expandMenuById = useCallback(
    (id: string) => {
      setExpandedMenuIdList((prev) => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    },
    [setExpandedMenuIdList]
  );

  // Search query — session only
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebarCollapsed,
    expandedMenuIds,
    toggleMenuExpansion,
    expandMenuById,
    sidebarSearchQuery,
    setSidebarSearchQuery,
  };
};
