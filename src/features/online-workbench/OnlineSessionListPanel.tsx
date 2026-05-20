import { ArrowLeft, ArrowRight, ChevronDown, Lock, Users, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type MouseEvent } from 'react';

import { cn } from '../../lib/cn';

type OnlineQueueEntry = {
  id: string;
  visitorId: string;
  channel: string;
  queueName: string;
  waitingSeconds: number;
};

const onlineQueueEntries: OnlineQueueEntry[] = [
  { id: 'oq1', visitorId: 'V138989', channel: 'APP', queueName: '售前咨询', waitingSeconds: 38 },
  { id: 'oq2', visitorId: 'V12345', channel: 'PC', queueName: '售后维修', waitingSeconds: 72 },
  { id: 'oq3', visitorId: 'V398993', channel: '微信公众号', queueName: '退换货', waitingSeconds: 145 },
  { id: 'oq4', visitorId: 'V92999', channel: '微信小程序', queueName: 'VIP客户', waitingSeconds: 210 },
];

type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

type OnlineSessionListTab = '活动会话' | '结束会话';

type OnlineSessionListItem = {
  id: string;
  customer: string;
  channel: string;
  waiting: string;
  summary: string;
  statusText: string;
  statusCls: string;
};

type OnlinePresenceMeta = {
  sideActionLabel: string;
  sideActionIcon: IconComponent;
  sideActionButtonCls: string;
  sideActionIconWrapCls: string;
  showOnlineStatusSelector: boolean;
};

type OnlineSessionContextMenu = {
  sessionId: string;
  x: number;
  y: number;
} | null;

type OnlineSessionListPanelProps = {
  presenceMeta: OnlinePresenceMeta;
  onTogglePresence: () => void;
  isOnlineStatusMenuOpen: boolean;
  onToggleStatusMenu: () => void;
  selectedOnlineStatus: string;
  onlineStatusOptions: readonly string[];
  onSelectOnlineStatus: (option: string) => void;
  queueCount: number;
  sessionListTab: OnlineSessionListTab;
  onSessionListTabChange: (tab: OnlineSessionListTab) => void;
  visibleSessions: OnlineSessionListItem[];
  summaryRoleBySessionId: Record<string, 'customer' | 'agent'>;
  activeSessionId: string;
  getChannelIcon: (channel: string) => string;
  onSessionSelect: (sessionId: string) => void;
  onSessionContextMenu: (event: MouseEvent<HTMLButtonElement>, sessionId: string) => void;
  contextMenu: OnlineSessionContextMenu;
  pinnedSessionIds: string[];
  onTogglePin: (sessionId: string) => void;
  onOpenBlockConfirm: (sessionId: string) => void;
  lockedSessionIds: string[];
  onToggleLock: (sessionId: string) => void;
};

const sessionListTabs = ['活动会话', '结束会话'] as const satisfies readonly OnlineSessionListTab[];

export default function OnlineSessionListPanel({
  presenceMeta,
  onTogglePresence,
  isOnlineStatusMenuOpen,
  onToggleStatusMenu,
  selectedOnlineStatus,
  onlineStatusOptions,
  onSelectOnlineStatus,
  queueCount,
  sessionListTab,
  onSessionListTabChange,
  visibleSessions,
  summaryRoleBySessionId,
  activeSessionId,
  getChannelIcon,
  onSessionSelect,
  onSessionContextMenu,
  contextMenu,
  pinnedSessionIds,
  onTogglePin,
  onOpenBlockConfirm,
  lockedSessionIds,
  onToggleLock,
}: OnlineSessionListPanelProps) {
  const hasVisibleSessions = visibleSessions.length > 0;
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [statusMenuRect, setStatusMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const queueTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queuePopoverRef = useRef<HTMLDivElement | null>(null);
  const [isQueuePopoverOpen, setIsQueuePopoverOpen] = useState(false);
  const [queuePopoverRect, setQueuePopoverRect] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!isQueuePopoverOpen) {
      setQueuePopoverRect(null);
      return;
    }
    const updateRect = () => {
      const trigger = queueTriggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setQueuePopoverRect({ left: rect.right, top: rect.bottom + 8 });
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isQueuePopoverOpen]);

  useEffect(() => {
    if (!isQueuePopoverOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (queueTriggerRef.current?.contains(target)) return;
      if (queuePopoverRef.current?.contains(target)) return;
      setIsQueuePopoverOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQueuePopoverOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isQueuePopoverOpen]);

  useLayoutEffect(() => {
    if (!isOnlineStatusMenuOpen) {
      setStatusMenuRect(null);
      return;
    }

    const updateRect = () => {
      const trigger = statusTriggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setStatusMenuRect({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 8,
        width: Math.max(rect.width, 116),
      });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOnlineStatusMenuOpen]);

  useEffect(() => {
    if (!isOnlineStatusMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (statusTriggerRef.current?.contains(target)) return;
      const root = (target as Element).closest?.('[data-status-menu-portal="true"]');
      if (root) return;
      onToggleStatusMenu();
    };
    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => window.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isOnlineStatusMenuOpen, onToggleStatusMenu]);

  return (
    <section className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px]">
      <div className="px-3 pt-4 pb-3">
        <div className="relative flex items-center gap-[6px]">
          <button
            type="button"
            onClick={onTogglePresence}
            className={cn(
              'focus-ring press-lift inline-flex h-[32px] items-center gap-[5px] rounded-full px-3 text-[13px] font-medium tracking-[0.01em] transition-all duration-200',
              presenceMeta.sideActionButtonCls
            )}
          >
            <span
              className={cn(
                'flex h-[16px] w-[16px] items-center justify-center rounded-full border bg-transparent',
                presenceMeta.sideActionIconWrapCls
              )}
            >
              <presenceMeta.sideActionIcon size={10} strokeWidth={2.5} />
            </span>
            {presenceMeta.sideActionLabel}
          </button>
          {presenceMeta.showOnlineStatusSelector ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" data-dropdown-root="true">
              <button
                ref={statusTriggerRef}
                type="button"
                onClick={onToggleStatusMenu}
                className="focus-ring relative inline-flex h-[32px] min-w-[108px] items-center justify-center rounded-full border border-hairline bg-surface-muted px-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50/60"
              >
                <span className="block w-full text-center">{selectedOnlineStatus}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2.2}
                  className={cn(
                    'absolute right-3 text-slate-400 transition-transform',
                    isOnlineStatusMenuOpen && 'rotate-180'
                  )}
                />
              </button>
            </div>
          ) : null}
          <button
            ref={queueTriggerRef}
            type="button"
            aria-expanded={isQueuePopoverOpen}
            aria-label="查看排队列表"
            onClick={() => setIsQueuePopoverOpen((open) => !open)}
            className={cn(
              'focus-ring ml-auto inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors',
              isQueuePopoverOpen
                ? 'border-brand-300 bg-brand-50 text-brand-600'
                : 'border-hairline bg-white text-slate-600 hover:border-brand-200 hover:text-brand-600'
            )}
          >
            <Users size={13} strokeWidth={2.1} />
            <span>排队</span>
            <span className="tabular-nums font-semibold text-[#f59a23]">{onlineQueueEntries.length}</span>
          </button>
        </div>
        <div className="mt-4 border-t border-hairline" />
        <div className="relative mt-4 grid grid-cols-2 gap-1 rounded-full border border-hairline bg-surface-muted p-1">
          {sessionListTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onSessionListTabChange(tab)}
              className={cn(
                'focus-ring relative flex h-8 items-center justify-center rounded-full px-3 text-[13px] font-semibold transition-all duration-300',
                sessionListTab === tab
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_6px_16px_-6px_rgba(58,92,255,0.55)]'
                  : 'text-slate-500 hover:text-brand-600'
              )}
            >
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2 custom-scrollbar">
        {visibleSessions.map((session) => {
          const channelIconSrc = getChannelIcon(session.channel);
          const summaryRole = summaryRoleBySessionId[session.id];

          return (
            <button
              key={session.id}
              type="button"
              onClick={() => onSessionSelect(session.id)}
              onContextMenu={(event) => {
                if (sessionListTab !== '活动会话') {
                  event.preventDefault();
                  return;
                }
                onSessionContextMenu(event, session.id);
              }}
              className={cn(
                'focus-ring group relative w-full min-h-[72px] overflow-hidden rounded-[14px] border px-3 py-2.5 text-left transition-all duration-200',
                activeSessionId === session.id
                  ? 'border-brand-200/80 bg-gradient-to-r from-brand-50 via-brand-50/70 to-white shadow-[0_6px_18px_-10px_rgba(58,92,255,0.45)] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r-full before:bg-gradient-to-b before:from-brand-500 before:to-brand-400'
                  : 'border-transparent hover:border-hairline hover:bg-brand-50/30'
              )}
            >
              <div className="grid grid-cols-[30px_minmax(0,1fr)] items-center gap-x-[8px] gap-y-[4px]">
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center">
                  <img src={channelIconSrc} alt={session.channel} className="h-[30px] w-[30px] object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn(
                      'flex min-w-0 items-center gap-1.5 truncate text-[15px] font-semibold leading-[18px] tracking-[0.01em]',
                      activeSessionId === session.id ? 'text-brand-700' : 'text-slate-800'
                    )}>
                      <span className="truncate">{session.customer}</span>
                      {lockedSessionIds.includes(session.id) ? (
                        <Lock
                          size={12}
                          strokeWidth={2.2}
                          className="shrink-0 text-amber-500"
                          aria-label="已锁定"
                        />
                      ) : null}
                    </span>
                    <div className="tabular-nums shrink-0 pt-[1px] text-[11px] leading-none text-slate-400">{session.waiting}</div>
                  </div>
                </div>
                <div className="col-start-2 flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">
                    {summaryRole === 'customer' ? (
                      <ArrowRight
                        size={12}
                        strokeWidth={2.2}
                        className="shrink-0 text-emerald-500"
                        aria-label="客户消息"
                      />
                    ) : summaryRole === 'agent' ? (
                      <ArrowLeft
                        size={12}
                        strokeWidth={2.2}
                        className="shrink-0 text-brand-500"
                        aria-label="坐席消息"
                      />
                    ) : null}
                    <p className="truncate text-[12px] leading-[18px] text-slate-500">{session.summary}</p>
                  </div>
                  {session.statusText ? (
                    <span
                      className={cn(
                        'shrink-0 pl-2 text-[12px] font-medium leading-[18px] tracking-[0.01em]',
                        session.statusCls
                      )}
                    >
                      {session.statusText}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
        {!hasVisibleSessions ? (
          <div className="flex min-h-[180px] items-center justify-center rounded-[14px] border border-dashed border-hairline bg-surface-sunken px-5 text-center">
            <div>
              <div className="text-[14px] font-semibold text-slate-700">
                {sessionListTab === '活动会话' ? '当前没有活动会话' : '当前没有结束会话'}
              </div>
              <div className="mt-2 text-[12px] leading-[18px] text-slate-400">
                {sessionListTab === '活动会话'
                  ? '可以切换到“结束会话”查看历史会话，或等待新的会话进入。'
                  : '结束后的会话会显示在这里。'}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {isQueuePopoverOpen && queuePopoverRect
        ? createPortal(
            <div
              ref={queuePopoverRef}
              className="fixed z-[80] w-[300px] overflow-hidden rounded-[14px] border border-hairline bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur"
              style={{
                left: queuePopoverRect.left,
                top: queuePopoverRect.top,
                transform: 'translateX(-100%)',
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <div className="text-[13px] font-semibold text-slate-700">
                  排队列表
                  <span className="ml-1 text-[12px] font-medium text-slate-400">({onlineQueueEntries.length})</span>
                </div>
                <button
                  type="button"
                  aria-label="关闭排队列表"
                  onClick={() => setIsQueuePopoverOpen(false)}
                  className="focus-ring rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.85fr)] gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                <span>访客id</span>
                <span>渠道</span>
                <span>队列名</span>
                <span>排队时长</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
                {onlineQueueEntries.length ? (
                  onlineQueueEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.85fr)] items-center gap-2 px-3 py-2 text-[12px] hover:bg-brand-50/40"
                    >
                      <span className="truncate font-medium text-slate-700">{entry.visitorId}</span>
                      <span className="truncate text-slate-600">{entry.channel}</span>
                      <span className="truncate text-slate-600">{entry.queueName}</span>
                      <span className="tabular-nums text-[#f59a23]">
                        {`${Math.floor(entry.waitingSeconds / 60).toString().padStart(2, '0')}:${(entry.waitingSeconds % 60).toString().padStart(2, '0')}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-[12px] text-slate-400">当前无排队</div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
      {isOnlineStatusMenuOpen && statusMenuRect
        ? createPortal(
            <div
              data-status-menu-portal="true"
              data-dropdown-root="true"
              className="fixed z-[80] overflow-hidden rounded-[14px] border border-hairline bg-white/95 py-1 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur"
              style={{
                left: statusMenuRect.left,
                top: statusMenuRect.top,
                width: statusMenuRect.width,
                transform: 'translateX(-50%)',
              }}
            >
              {onlineStatusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectOnlineStatus(option)}
                  className={cn(
                    'focus-ring flex w-full items-center px-3 py-2 text-left text-[13px] transition-colors',
                    selectedOnlineStatus === option
                      ? 'bg-accent-50 font-medium text-accent-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
      {contextMenu
        ? createPortal(
            <div
              data-dropdown-root="true"
              className="fixed z-[80] w-[120px] overflow-hidden rounded-[14px] border border-hairline bg-white/95 py-1 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                type="button"
                onClick={() => onTogglePin(contextMenu.sessionId)}
                className="focus-ring flex w-full items-center px-3 py-2 text-left text-[12px] text-slate-600 transition-colors hover:bg-brand-50/50 hover:text-brand-600"
              >
                {pinnedSessionIds.includes(contextMenu.sessionId) ? '取消置顶' : '置顶'}
              </button>
              <button
                type="button"
                onClick={() => onToggleLock(contextMenu.sessionId)}
                className="focus-ring flex w-full items-center px-3 py-2 text-left text-[12px] text-slate-600 transition-colors hover:bg-brand-50/50 hover:text-brand-600"
              >
                {lockedSessionIds.includes(contextMenu.sessionId) ? '解锁' : '锁定'}
              </button>
              <button
                type="button"
                onClick={() => onOpenBlockConfirm(contextMenu.sessionId)}
                className="focus-ring flex w-full items-center px-3 py-2 text-left text-[12px] text-signal-danger transition-colors hover:bg-rose-50"
              >
                拉黑
              </button>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
