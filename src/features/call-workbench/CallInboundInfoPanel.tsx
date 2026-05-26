import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Ban,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Mail,
  MessageSquare,
  Monitor,
  Paperclip,
  Plus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '../../lib/cn';

import toolServicePointIcon from '../../assets/tool-icons/tool-售后网点查询.png';
import toolRepairPriceIcon from '../../assets/tool-icons/tool-售后维修价格.png';
import toolPaymentIcon from '../../assets/tool-icons/tool-售后付款.png';

const callFrequentlyUsedTools: Array<{ label: string; icon: LucideIcon }> = [
  { label: '短信', icon: MessageSquare },
  { label: '附件查询', icon: Paperclip },
  { label: '邮箱', icon: Mail },
];

const callServiceTools: Array<{ label: string; imageSrc: string }> = [
  { label: '售后网点查询', imageSrc: toolServicePointIcon },
  { label: '售后维修价格', imageSrc: toolRepairPriceIcon },
  { label: '售后付款', imageSrc: toolPaymentIcon },
  { label: '学习机价格', imageSrc: toolRepairPriceIcon },
  { label: '配件价格', imageSrc: toolRepairPriceIcon },
];

type CallQueueEntry = {
  id: string;
  phone: string;
  waiting: string;
  skillGroup: string;
};

const callQueueEntries: CallQueueEntry[] = [
  { id: 'q1', phone: '13800008989', waiting: '00:42', skillGroup: '售前咨询' },
  { id: 'q2', phone: '17601672305', waiting: '01:18', skillGroup: '售后维修' },
  { id: 'q3', phone: '13900008993', waiting: '02:05', skillGroup: 'VIP客户' },
  { id: 'q4', phone: '15800002999', waiting: '02:47', skillGroup: '售前咨询' },
  { id: 'q5', phone: '18600000139', waiting: '03:22', skillGroup: '退换货' },
];

type CallInboundConversationMessage = {
  id: string;
  role: 'customer' | 'agent';
  time: string;
  text: string;
  qualityCheckText?: string;
};

type CallWorkbenchInboundProfile = {
  inboundInfoItems: Array<{ label: string; value: string }>;
  tags: Array<{ label: string; cls: string }>;
  ivrPath: string;
  transferSummary: string;
  openingQuestion?: string;
  conversationMessages?: CallInboundConversationMessage[];
};

type CallInboundInfoPanelProps = {
  profile: CallWorkbenchInboundProfile;
  height?: number;
  hideDetails?: boolean;
  onScheduleFollowUp?: () => void;
  onBlacklist?: (anchor: { x: number; y: number }) => void;
  onOpenTaggingModal?: () => void;
};

export default function CallInboundInfoPanel({
  profile,
  height,
  hideDetails,
  onScheduleFollowUp,
  onBlacklist,
  onOpenTaggingModal,
}: CallInboundInfoPanelProps) {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const queueTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queuePopoverRef = useRef<HTMLDivElement | null>(null);
  const [queuePopoverRect, setQueuePopoverRect] = useState<{ left: number; top: number } | null>(null);
  const [collapsedSummarySections, setCollapsedSummarySections] = useState<Record<string, boolean>>({});
  const toggleSummarySection = (key: string) =>
    setCollapsedSummarySections((prev) => ({ ...prev, [key]: !prev[key] }));

  useLayoutEffect(() => {
    if (!isQueueOpen) {
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
  }, [isQueueOpen]);

  useEffect(() => {
    if (!isQueueOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (queueTriggerRef.current && queueTriggerRef.current.contains(target)) return;
      if (queuePopoverRef.current && queuePopoverRef.current.contains(target)) return;
      setIsQueueOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQueueOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isQueueOpen]);
  return (
    <section
      className="surface-card flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden xl:flex-none"
      style={height === undefined ? undefined : { height: `${height}px` }}
    >
      {/* Fixed header: 呼入信息 + info items + tags */}
      <div className="shrink-0 border-b border-hairline px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-slate-800">呼叫信息</h2>
          <button
            ref={queueTriggerRef}
            type="button"
            aria-expanded={isQueueOpen}
            aria-label="查看排队列表"
            onClick={() => setIsQueueOpen((open) => !open)}
            className={cn(
              'focus-ring inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors',
              isQueueOpen
                ? 'border-brand-300 bg-brand-50 text-brand-600'
                : 'border-hairline bg-white text-slate-600 hover:border-brand-200 hover:text-brand-600'
            )}
          >
            <Users size={13} strokeWidth={2.1} />
            <span>排队</span>
            <span className="tabular-nums font-semibold text-[#f59a23]">{callQueueEntries.length}</span>
          </button>
        </div>
        <div className="mt-3 grid gap-x-3 gap-y-2 text-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,148px),1fr))]">
          {profile.inboundInfoItems.map((item) => (
            <div key={item.label} className="min-w-0">
              <span className="text-[12px] text-slate-500">{item.label}：</span>
              <span className="tabular-nums break-all font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
        {!hideDetails ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {profile.tags.map((tag) => (
            <span
              key={tag.label}
              className={cn('rounded-full border px-2.5 py-[5px] text-[11px] font-medium leading-none', tag.cls)}
            >
              {tag.label}
            </span>
          ))}
          <button
            type="button"
            onClick={onOpenTaggingModal}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-[5px] text-[11px] font-medium leading-none text-slate-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
          >
            <Plus size={12} strokeWidth={2.2} />
            内部标签
          </button>
        </div>
        ) : null}
      </div>

      {/* Scrollable body */}
      <div className="min-w-0 flex-1 overflow-y-auto px-4 py-3.5 custom-scrollbar">
        {!hideDetails ? (
        <>
        {(() => {
          const isCollapsed = collapsedSummarySections['history'] ?? false;
          return (
            <div className="rounded-[10px] border-l-[3px] border-l-accent-400 bg-accent-50/60 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() => toggleSummarySection('history')}
                className="focus-ring flex w-full items-center justify-between gap-2 rounded-md text-left text-[12px] font-semibold uppercase tracking-wide text-accent-700"
              >
                <span>历史通话纪要</span>
                {isCollapsed ? (
                  <ChevronRight size={14} className="text-accent-500" />
                ) : (
                  <ChevronDown size={14} className="text-accent-500" />
                )}
              </button>
              {!isCollapsed ? <p className="mt-1 text-slate-700">{profile.ivrPath}</p> : null}
            </div>
          );
        })()}
        {(() => {
          const isCollapsed = collapsedSummarySections['transfer'] ?? false;
          return (
            <div className="mt-4 rounded-[10px] border-l-[3px] border-l-amber-400 bg-amber-50/70 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() => toggleSummarySection('transfer')}
                className="focus-ring flex w-full items-center justify-between gap-2 rounded-md text-left text-[12px] font-semibold uppercase tracking-wide text-amber-700"
              >
                <span>本次转接纪要</span>
                {isCollapsed ? (
                  <ChevronRight size={14} className="text-amber-500" />
                ) : (
                  <ChevronDown size={14} className="text-amber-500" />
                )}
              </button>
              {!isCollapsed ? <p className="mt-1 text-slate-700">{profile.transferSummary}</p> : null}
            </div>
          );
        })()}
        {profile.openingQuestion
          ? (() => {
              const isCollapsed = collapsedSummarySections['opener'] ?? false;
              return (
                <div className="mt-4 rounded-[10px] border-l-[3px] border-l-brand-400 bg-brand-50/60 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleSummarySection('opener')}
                    className="focus-ring flex w-full items-center justify-between gap-2 rounded-md text-left text-[12px] font-semibold uppercase tracking-wide text-brand-700"
                  >
                    <span>开口问</span>
                    {isCollapsed ? (
                      <ChevronRight size={14} className="text-brand-500" />
                    ) : (
                      <ChevronDown size={14} className="text-brand-500" />
                    )}
                  </button>
                  {!isCollapsed ? <p className="mt-1 text-slate-700">{profile.openingQuestion}</p> : null}
                </div>
              );
            })()
          : null}
        {profile.conversationMessages?.length ? (
          <div className="mt-5">
            <div className="space-y-4">
              {profile.conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex', message.role === 'agent' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'flex max-w-[82%] items-start gap-2.5',
                      message.role === 'agent' && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
                        message.role === 'agent' ? 'bg-[#ffb24d]' : 'bg-[#18a058]'
                      )}
                    >
                      {message.role === 'agent' ? <MessageSquare size={15} /> : <Monitor size={15} />}
                    </div>
                    <div className={cn('min-w-0 flex-1', message.role === 'agent' && 'text-right')}>
                      <div className="mb-1 text-[10px] tabular-nums text-slate-400">{message.time}</div>
                      <div
                        className={cn(
                          'inline-block whitespace-pre-line rounded-2xl px-4 py-2.5 text-[12px] leading-5 shadow-[0_2px_6px_rgba(15,23,42,0.03)]',
                          message.role === 'agent'
                            ? 'rounded-tr-md bg-[#e9f9f4] text-slate-700'
                            : 'rounded-tl-md bg-[#f7f7f8] text-slate-700'
                        )}
                      >
                        {message.text}
                      </div>
                      {message.qualityCheckText ? (
                        <div className="mt-1.5 inline-flex rounded-full border border-transparent bg-[#f7f7f8] px-3 py-1 text-[10px] font-medium">
                          {message.qualityCheckText.includes('：') ? (
                            <>
                              <span className="text-[#dc2626]">
                                {`${message.qualityCheckText.split('：')[0]}：`}
                              </span>
                              <span className="text-[#2563eb]">
                                {message.qualityCheckText.split('：').slice(1).join('：')}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#dc2626]">{message.qualityCheckText}</span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        </>
        ) : null}
      </div>
      <div className="shrink-0 border-t border-hairline bg-white px-5 py-3">
        <div className="flex items-center gap-4 text-slate-500">
          {callFrequentlyUsedTools.map(({ label, icon: Icon }) => (
            <button
              key={`call-frequently-used-${label}`}
              type="button"
              className="focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                {label}
              </span>
              <Icon size={18} strokeWidth={1.9} />
            </button>
          ))}
          {onBlacklist ? (
            <button
              type="button"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                onBlacklist({ x: rect.left, y: rect.top });
              }}
              className="focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                拉黑
              </span>
              <Ban size={18} strokeWidth={1.9} />
            </button>
          ) : null}
          {onScheduleFollowUp ? (
            <button
              type="button"
              onClick={onScheduleFollowUp}
              className="focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                预约回电
              </span>
              <CalendarClock size={18} strokeWidth={1.9} />
            </button>
          ) : null}
          {callServiceTools.map(({ label, imageSrc }) => (
            <button
              key={`call-service-tool-${label}`}
              type="button"
              className="focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                {label}
              </span>
              <img src={imageSrc} alt="" className="h-[18px] w-[18px] object-contain" />
            </button>
          ))}
        </div>
      </div>
      {isQueueOpen && queuePopoverRect
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
                  <span className="ml-1 text-[12px] font-medium text-slate-400">({callQueueEntries.length})</span>
                </div>
                <button
                  type="button"
                  aria-label="关闭排队列表"
                  onClick={() => setIsQueueOpen(false)}
                  className="focus-ring rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>
              <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                <span>来电号码</span>
                <span>等待时长</span>
                <span>技能组</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
                {callQueueEntries.length ? (
                  callQueueEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-2 px-3 py-2 text-[12px] hover:bg-brand-50/40"
                    >
                      <span className="tabular-nums font-medium text-slate-700">{entry.phone}</span>
                      <span className="tabular-nums text-[#f59a23]">{entry.waiting}</span>
                      <span className="truncate text-slate-600">{entry.skillGroup}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-[12px] text-slate-400">当前无排队来电</div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
