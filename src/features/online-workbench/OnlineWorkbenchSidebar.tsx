import type { DragEvent, ReactNode, RefObject } from 'react';

import { Check, Rows3 } from 'lucide-react';

import { cn } from '../../lib/cn';

type OnlineRightPanel = 'robot' | 'customer' | 'history' | 'third-party';
type OnlineSidebarFeatureKey =
  | 'robot'
  | 'customer'
  | 'history'
  | 'knowledge'
  | 'workorder'
  | 'third-party'
  | 'settings';

type OnlineWorkbenchSidebarFeature = {
  key: OnlineSidebarFeatureKey;
  label: string;
  title: string;
  imageSrc: string;
  panel?: OnlineRightPanel;
  locked?: boolean;
};

type OnlineWorkbenchSidebarDropIndicator = {
  key: OnlineSidebarFeatureKey;
  position: 'before' | 'after';
} | null;

type FloatingMenuOptions = {
  align?: 'left' | 'center' | 'right';
  marginTop?: number;
  width?: number;
  placement?: 'top' | 'bottom';
};

type OnlineWorkbenchSidebarProps = {
  visibleButtons: readonly OnlineWorkbenchSidebarFeature[];
  orderedFeatures: readonly OnlineWorkbenchSidebarFeature[];
  visibility: Record<OnlineSidebarFeatureKey, boolean>;
  activePanel: OnlineRightPanel;
  isSettingsOpen: boolean;
  settingsTriggerRef: RefObject<HTMLButtonElement | null>;
  draggingFeatureKey: OnlineSidebarFeatureKey | null;
  dropIndicator: OnlineWorkbenchSidebarDropIndicator;
  onPanelSelect: (panel: OnlineRightPanel) => void;
  onToggleSettings: () => void;
  onToggleVisibility: (key: OnlineSidebarFeatureKey) => void;
  onFeatureDragStart: (
    event: DragEvent<HTMLButtonElement>,
    key: OnlineSidebarFeatureKey
  ) => void;
  onFeatureDragOver: (
    event: DragEvent<HTMLButtonElement>,
    key: OnlineSidebarFeatureKey
  ) => void;
  onFeatureDrop: (
    event: DragEvent<HTMLButtonElement>,
    key: OnlineSidebarFeatureKey
  ) => void;
  onFeatureDragEnd: () => void;
  renderFloatingMenu: (
    triggerElement: HTMLElement | null,
    menuContent: ReactNode,
    options?: FloatingMenuOptions
  ) => ReactNode;
};

export default function OnlineWorkbenchSidebar({
  visibleButtons,
  orderedFeatures,
  visibility,
  activePanel,
  isSettingsOpen,
  settingsTriggerRef,
  draggingFeatureKey,
  dropIndicator,
  onPanelSelect,
  onToggleSettings,
  onToggleVisibility,
  onFeatureDragStart,
  onFeatureDragOver,
  onFeatureDrop,
  onFeatureDragEnd,
  renderFloatingMenu,
}: OnlineWorkbenchSidebarProps) {
  return (
    <div className="surface-card flex w-full flex-col items-center gap-[18px] rounded-[18px] py-4 text-slate-400">
      {visibleButtons.map((item) => {
        const isPanelActive = item.panel ? activePanel === item.panel : false;
        const isSettingsButton = item.key === 'settings';
        const isActive = isSettingsButton ? isSettingsOpen : isPanelActive;

        return (
          <button
            key={item.key}
            ref={isSettingsButton ? settingsTriggerRef : undefined}
            type="button"
            aria-label={item.title}
            title={item.title}
            data-dropdown-root={isSettingsButton ? 'true' : undefined}
            onClick={() => {
              if (item.panel) {
                onPanelSelect(item.panel);
                return;
              }

              if (isSettingsButton) {
                onToggleSettings();
              }
            }}
            className={cn(
              'focus-ring relative rounded-xl p-2 transition-all duration-200',
              isActive
                ? 'bg-brand-50 text-brand-600 shadow-[0_4px_12px_-4px_rgba(58,92,255,0.35)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-x-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-gradient-to-b before:from-brand-500 before:to-brand-400'
                : 'hover:bg-slate-50 hover:text-brand-500'
            )}
          >
            <img src={item.imageSrc} alt="" className="h-[25px] w-[25px] object-contain" />
          </button>
        );
      })}

      {isSettingsOpen
        ? renderFloatingMenu(
            settingsTriggerRef.current,
            <div className="overflow-hidden rounded-[18px] border border-hairline bg-white/95 shadow-[0_20px_48px_rgba(15,23,42,0.16)] backdrop-blur">
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-[14px] font-semibold text-slate-800">

                功能设置
              </div>
              <div className="px-3 py-2">
                {orderedFeatures.map((item) => {
                  const isVisible = item.key === 'settings' ? true : visibility[item.key];
                  const hasDropIndicator = dropIndicator?.key === item.key;

                  return (
                    <button
                      key={`feature-setting-${item.key}`}
                      type="button"
                      draggable={!item.locked}
                      onClick={() => {
                        if (!item.locked) {
                          onToggleVisibility(item.key);
                        }
                      }}
                      onDragStart={(event) => onFeatureDragStart(event, item.key)}
                      onDragOver={(event) => onFeatureDragOver(event, item.key)}
                      onDrop={(event) => onFeatureDrop(event, item.key)}
                      onDragEnd={onFeatureDragEnd}
                      className={cn(
                        'focus-ring relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                        item.locked ? 'cursor-default' : 'cursor-pointer hover:bg-brand-50/50',
                        draggingFeatureKey === item.key && 'opacity-55',
                        hasDropIndicator &&
                          dropIndicator?.position === 'before' &&
                          'before:absolute before:left-2 before:right-2 before:top-0 before:h-[2px] before:rounded-full before:bg-gradient-to-r before:from-brand-500 before:to-brand-400',
                        hasDropIndicator &&
                          dropIndicator?.position === 'after' &&
                          'after:absolute after:left-2 after:right-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-brand-500 after:to-brand-400'
                      )}
                    >
                      <img
                        src={item.imageSrc}
                        alt=""
                        className="h-[18px] w-[18px] shrink-0 object-contain"
                      />
                      <span className="min-w-0 flex-1 text-[13px] font-medium text-slate-700">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                          isVisible
                            ? 'border-brand-500 bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-[0_2px_6px_rgba(58,92,255,0.35)]'
                            : 'border-slate-300 bg-white text-transparent',
                          item.locked && 'cursor-not-allowed'
                        )}
                      >
                        {isVisible ? <Check size={11} strokeWidth={3} /> : null}
                      </span>
                      <Rows3
                        size={14}
                        className={cn(
                          'shrink-0',
                          item.locked ? 'text-slate-200' : 'cursor-grab text-slate-300 active:cursor-grabbing'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>,
            { align: 'right', marginTop: 14, width: 208, placement: 'top' }
          )
        : null}
    </div>
  );
}
