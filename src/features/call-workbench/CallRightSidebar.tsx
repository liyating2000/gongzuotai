import { Check, Rows3 } from 'lucide-react';
import { useRef, type ComponentType, type DragEvent, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

type CallRightPanel = 'agent' | 'workorder' | 'knowledge' | 'toolsite' | 'summary';
type CallSidebarFeatureKey = 'agent' | 'workorder' | 'knowledge' | 'toolsite' | 'summary' | 'settings';

type FloatingMenuOptions = {
  align?: 'left' | 'center' | 'right';
  marginTop?: number;
  width?: number;
  placement?: 'top' | 'bottom';
};

type CallSidebarFeatureItem = {
  key: CallSidebarFeatureKey;
  label: string;
  title: string;
  panel?: CallRightPanel;
  imageSrc?: string;
  icon?: IconComponent;
  locked?: boolean;
};

type CallSidebarDropIndicator = {
  key: CallSidebarFeatureKey;
  position: 'before' | 'after';
} | null;

type CallRightSidebarProps = {
  visibleButtons: CallSidebarFeatureItem[];
  orderedFeatures: CallSidebarFeatureItem[];
  activePanel: CallRightPanel;
  isFeatureSettingsOpen: boolean;
  featureVisibility: Record<CallSidebarFeatureKey, boolean>;
  dropIndicator: CallSidebarDropIndicator;
  draggingFeatureKey: CallSidebarFeatureKey | null;
  onOpenPanel: (panel: CallRightPanel) => void;
  onToggleFeatureSettings: () => void;
  onToggleFeatureVisibility: (featureKey: CallSidebarFeatureKey) => void;
  onFeatureDragStart: (event: DragEvent<HTMLButtonElement>, featureKey: CallSidebarFeatureKey) => void;
  onFeatureDragOver: (event: DragEvent<HTMLButtonElement>, targetKey: CallSidebarFeatureKey) => void;
  onFeatureDrop: (event: DragEvent<HTMLButtonElement>, targetKey: CallSidebarFeatureKey) => void;
  onFeatureDragEnd: () => void;
  renderFloatingMenu: (
    triggerElement: HTMLElement | null,
    menuContent: ReactNode,
    options?: FloatingMenuOptions
  ) => ReactNode;
};

export default function CallRightSidebar({
  visibleButtons,
  orderedFeatures,
  activePanel,
  isFeatureSettingsOpen,
  featureVisibility,
  dropIndicator,
  draggingFeatureKey,
  onOpenPanel,
  onToggleFeatureSettings,
  onToggleFeatureVisibility,
  onFeatureDragStart,
  onFeatureDragOver,
  onFeatureDrop,
  onFeatureDragEnd,
  renderFloatingMenu,
}: CallRightSidebarProps) {
  const featureSettingsTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="surface-card flex w-full flex-col items-center gap-[18px] py-3 text-slate-400">
      {visibleButtons.map((item) => {
        const isSettingsButton = item.key === 'settings';
        const isSummaryButton = item.key === 'summary';
        const isActive = isSettingsButton ? isFeatureSettingsOpen : item.panel === activePanel;

        return (
          <button
            key={item.key}
            ref={isSettingsButton ? featureSettingsTriggerRef : undefined}
            type="button"
            aria-label={item.title}
            title={item.title}
            data-dropdown-root={isSettingsButton ? 'true' : undefined}
            onClick={() => {
              if (item.panel) {
                onOpenPanel(item.panel);
                return;
              }

              if (isSettingsButton) {
                onToggleFeatureSettings();
              }
            }}
            className={cn(
              'focus-ring relative rounded-xl p-1.5 transition-all',
              isActive
                ? 'bg-brand-50 text-brand-600 shadow-[0_4px_12px_-4px_rgba(58,92,255,0.3)] before:absolute before:-left-1 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-b before:from-brand-500 before:to-brand-400'
                : isSummaryButton
                  ? 'text-slate-400 hover:bg-transparent hover:text-slate-400'
                  : 'hover:-translate-y-[1px] hover:bg-slate-50 hover:text-brand-600'
            )}
          >
            {item.imageSrc ? (
              <img src={item.imageSrc} alt="" className="h-[25px] w-[25px] object-contain" />
            ) : item.icon ? (
              <item.icon size={24} strokeWidth={1.9} />
            ) : null}
          </button>
        );
      })}
      {isFeatureSettingsOpen
        ? renderFloatingMenu(
            featureSettingsTriggerRef.current,
            <div className="overflow-hidden rounded-[12px] border border-[#e6ebf2] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
              <div className="border-b border-slate-100 px-4 py-3 text-[14px] font-semibold text-slate-700">
                功能设置
              </div>
              <div className="px-3 py-2">
                {orderedFeatures.map((item) => {
                  const isVisible = item.key === 'settings' ? true : featureVisibility[item.key];
                  const hasDropIndicator = dropIndicator?.key === item.key;

                  return (
                    <button
                      key={`call-feature-setting-${item.key}`}
                      type="button"
                      draggable={!item.locked}
                      onClick={() => {
                        if (!item.locked) {
                          onToggleFeatureVisibility(item.key);
                        }
                      }}
                      onDragStart={(event) => onFeatureDragStart(event, item.key)}
                      onDragOver={(event) => onFeatureDragOver(event, item.key)}
                      onDrop={(event) => onFeatureDrop(event, item.key)}
                      onDragEnd={onFeatureDragEnd}
                      className={cn(
                        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        item.locked ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50',
                        draggingFeatureKey === item.key && 'opacity-55',
                        hasDropIndicator &&
                          dropIndicator?.position === 'before' &&
                          'before:absolute before:left-2 before:right-2 before:top-0 before:h-[2px] before:rounded-full before:bg-[#18c5aa]',
                        hasDropIndicator &&
                          dropIndicator?.position === 'after' &&
                          'after:absolute after:left-2 after:right-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#18c5aa]'
                      )}
                    >
                      {item.imageSrc ? (
                        <img src={item.imageSrc} alt="" className="h-[18px] w-[18px] shrink-0 object-contain" />
                      ) : item.icon ? (
                        <item.icon size={18} strokeWidth={1.9} className="shrink-0" />
                      ) : null}
                      <span className="min-w-0 flex-1 text-[13px] font-medium text-slate-700">{item.label}</span>
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                          isVisible
                            ? 'border-[#18c5aa] bg-[#18c5aa] text-white'
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
            { align: 'right', marginTop: 14, width: 220, placement: 'top' }
          )
        : null}
    </div>
  );
}
