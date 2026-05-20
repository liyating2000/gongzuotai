import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { readJSON, writeJSON } from '../lib/storage';

/**
 * Drop-in replacement for `useState` that transparently mirrors the value
 * to `localStorage` under the given key.
 *
 * - Initial value is read from storage (falls back to `defaultValue`)
 * - Every change is persisted via `writeJSON`
 * - Safe for SSR / privacy mode (delegated to storage helpers)
 *
 * @example
 *   const [collapsed, setCollapsed] = usePersistedState(
 *     'my-app/collapsed',
 *     false
 *   );
 */
export const usePersistedState = <T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, defaultValue));

  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);

  return [value, setValue];
};
