import { useEffect, useState, type DragEvent } from 'react';

type SidebarFeature<TFeatureKey extends string, TPanel extends string> = {
  key: TFeatureKey;
  panel?: TPanel;
};

type DropIndicator<TFeatureKey extends string> = {
  key: TFeatureKey;
  position: 'before' | 'after';
} | null;

type UseFeatureSidebarStateOptions<
  TFeatureKey extends string,
  TPanel extends string,
  TFeature extends SidebarFeature<TFeatureKey, TPanel>,
> = {
  features: readonly TFeature[];
  initialOrder: TFeatureKey[];
  initialVisibility: Record<TFeatureKey, boolean>;
  lockedKey: TFeatureKey;
  activePanel: TPanel;
  onActivePanelChange: (panel: TPanel) => void;
};

export function useFeatureSidebarState<
  TFeatureKey extends string,
  TPanel extends string,
  TFeature extends SidebarFeature<TFeatureKey, TPanel>,
>({
  features,
  initialOrder,
  initialVisibility,
  lockedKey,
  activePanel,
  onActivePanelChange,
}: UseFeatureSidebarStateOptions<TFeatureKey, TPanel, TFeature>) {
  const [order, setOrder] = useState<TFeatureKey[]>(initialOrder);
  const [visibility, setVisibility] =
    useState<Record<TFeatureKey, boolean>>(initialVisibility);
  const [draggingFeatureKey, setDraggingFeatureKey] = useState<TFeatureKey | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator<TFeatureKey>>(null);

  const clearDragState = () => {
    setDraggingFeatureKey(null);
    setDropIndicator(null);
  };

  useEffect(() => {
    const currentPanelFeature = features.find((item) => item.panel === activePanel);

    if (!currentPanelFeature || visibility[currentPanelFeature.key]) {
      return;
    }

    for (const key of order) {
      const feature = features.find((item) => item.key === key);

      if (feature?.panel && visibility[feature.key]) {
        onActivePanelChange(feature.panel);
        return;
      }
    }
  }, [activePanel, features, onActivePanelChange, order, visibility]);

  const toggleVisibility = (featureKey: TFeatureKey) => {
    if (featureKey === lockedKey) {
      return;
    }

    setVisibility((previousVisibility) => {
      const targetFeature = features.find((item) => item.key === featureKey);

      if (targetFeature?.panel && previousVisibility[featureKey]) {
        const visiblePanelCount = features.filter(
          (item) => item.panel && previousVisibility[item.key]
        ).length;

        if (visiblePanelCount <= 1) {
          return previousVisibility;
        }
      }

      return {
        ...previousVisibility,
        [featureKey]: !previousVisibility[featureKey],
        [lockedKey]: true,
      };
    });
  };

  const moveFeature = (
    draggedKey: TFeatureKey,
    targetKey: TFeatureKey,
    position: 'before' | 'after'
  ) => {
    if (draggedKey === lockedKey || draggedKey === targetKey) {
      return;
    }

    setOrder((previousOrder) => {
      const movableKeys = previousOrder.filter((key) => key !== lockedKey);
      const fromIndex = movableKeys.indexOf(draggedKey);

      if (fromIndex === -1) {
        return previousOrder;
      }

      const nextMovableKeys = [...movableKeys];
      nextMovableKeys.splice(fromIndex, 1);
      const targetIndex = targetKey === lockedKey ? nextMovableKeys.length : nextMovableKeys.indexOf(targetKey);

      if (targetKey !== lockedKey && targetIndex === -1) {
        return previousOrder;
      }

      const insertionIndex =
        targetKey === lockedKey ? nextMovableKeys.length : targetIndex + (position === 'after' ? 1 : 0);

      nextMovableKeys.splice(insertionIndex, 0, draggedKey);

      return [...nextMovableKeys, lockedKey];
    });
  };

  const handleFeatureDragStart = (
    event: DragEvent<HTMLButtonElement>,
    featureKey: TFeatureKey
  ) => {
    if (featureKey === lockedKey) {
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', featureKey);
    setDraggingFeatureKey(featureKey);
  };

  const handleFeatureDragOver = (
    event: DragEvent<HTMLButtonElement>,
    targetKey: TFeatureKey
  ) => {
    if (!draggingFeatureKey) {
      return;
    }

    if (draggingFeatureKey === targetKey) {
      setDropIndicator(null);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const targetRect = event.currentTarget.getBoundingClientRect();
    const nextPosition =
      targetKey === lockedKey || event.clientY < targetRect.top + targetRect.height / 2
        ? 'before'
        : 'after';

    setDropIndicator({
      key: targetKey,
      position: nextPosition,
    });
  };

  const handleFeatureDrop = (
    event: DragEvent<HTMLButtonElement>,
    targetKey: TFeatureKey
  ) => {
    event.preventDefault();

    const draggedKey = (draggingFeatureKey ??
      event.dataTransfer.getData('text/plain')) as TFeatureKey;

    if (!draggedKey || !features.some((item) => item.key === draggedKey) || draggedKey === targetKey) {
      clearDragState();
      return;
    }

    moveFeature(
      draggedKey,
      targetKey,
      dropIndicator?.key === targetKey ? dropIndicator.position : 'before'
    );
    clearDragState();
  };

  const handleFeatureDragEnd = () => {
    clearDragState();
  };

  return {
    order,
    visibility,
    draggingFeatureKey,
    dropIndicator,
    clearDragState,
    toggleVisibility,
    handleFeatureDragStart,
    handleFeatureDragOver,
    handleFeatureDrop,
    handleFeatureDragEnd,
  };
}
