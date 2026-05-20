import { useEffect, useRef, type DependencyList } from 'react';

export function useWindowResizeSync(
  sync: () => void,
  deps: DependencyList,
  enabled = true
) {
  const syncRef = useRef(sync);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        syncRef.current();
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, ...deps]);
}
