/**
 * Tiny localStorage helpers with safe JSON (de)serialization.
 * - Handles SSR / non-browser environments
 * - Swallows quota / privacy-mode errors
 * - Falls back gracefully on parse errors
 */

export const STORAGE_KEYS = {
  sidebarCollapsed: 'iflytek-dashboard/sidebar-collapsed',
  expandedMenus: 'iflytek-dashboard/expanded-menus',
} as const;

export const readJSON = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeJSON = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded / privacy mode — silently skip
  }
};
