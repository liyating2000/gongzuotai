import type { DependencyList, Dispatch, SetStateAction } from 'react';
import { useWindowResizeSync } from './useWindowResizeSync';

type PanelBounds = {
  min: number;
  max: number;
};

type UsePanelSizeSyncOptions = {
  enabled?: boolean;
  isCustomized: boolean;
  getAvailableSize: () => number | null;
  setSize: Dispatch<SetStateAction<number>>;
  getDefaultSize: (availableSize: number) => number;
  getBounds: (availableSize: number) => PanelBounds;
};

export function usePanelSizeSync(
  {
    enabled = true,
    isCustomized,
    getAvailableSize,
    setSize,
    getDefaultSize,
    getBounds,
  }: UsePanelSizeSyncOptions,
  deps: DependencyList = []
) {
  useWindowResizeSync(
    () => {
      const availableSize = getAvailableSize();
      if (!availableSize) {
        return;
      }

      setSize((prev) => {
        if (!isCustomized) {
          return getDefaultSize(availableSize);
        }

        const { min, max } = getBounds(availableSize);
        return Math.min(Math.max(prev, min), max);
      });
    },
    [isCustomized, ...deps],
    enabled
  );
}
