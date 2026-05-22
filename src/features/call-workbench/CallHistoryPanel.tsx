import {
  ChevronDown,
  ChevronRight,
  FastForward,
  MessageSquare,
  Pause,
  Play,
  Rewind,
  Search,
  Volume2,
} from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/cn';
import {
  HistoryDateRangeFilter,
  HistoryDateRangeMenu,
  type HistoryDateRangeValue,
} from '../workbench/HistoryDateRangeControls';

type WorkbenchHistoryTab = '会话历史' | '通话历史' | '短信历史' | '邮件历史';

type CallHistoryMeta = {
  filterPlaceholder: string;
  details: Array<{ label: string; value: string }>;
  messages: Array<{ align: 'left' | 'right'; text: string; badge?: string }>;
};

type FloatingMenuOptions = {
  align?: 'left' | 'center' | 'right';
  marginTop?: number;
  width?: number;
  placement?: 'top' | 'bottom';
};

type CallHistoryPanelProps = {
  callHistoryTab: WorkbenchHistoryTab;
  onCallHistoryTabChange: (tab: WorkbenchHistoryTab) => void;
  callHistorySummaryLabel: string;
  activeHistoryMeta: CallHistoryMeta;
  isCallHistoryDateRangeTab: boolean;
  isCallHistoryTimeDropdownTab: boolean;
  activeCallHistoryDateRange: HistoryDateRangeValue;
  isCallHistoryDateRangeMenuOpen: boolean;
  onToggleCallHistoryDateRangeMenu: () => void;
  onUpdateActiveCallHistoryDateRange: (key: keyof HistoryDateRangeValue, value: string) => void;
  activeCallHistoryTime: string;
  isCallHistoryTimeMenuOpen: boolean;
  onToggleCallHistoryTimeMenu: () => void;
  callHistoryTimeOptions: string[];
  onSelectCallHistoryTime: (value: string) => void;
  onToggleCallHistoryTimeSort: () => void;
  renderFloatingMenu: (
    triggerElement: HTMLElement | null,
    menuContent: ReactNode,
    options?: FloatingMenuOptions
  ) => ReactNode;
  toolSortIcon: string;
  hideDetails?: boolean;
};

const callHistoryTabs = ['通话历史', '会话历史', '短信历史', '邮件历史'] as const satisfies readonly WorkbenchHistoryTab[];

/**
 * Audio playback mini-player shown beneath the call info details when the
 * active tab is 通话历史. Visual reference: 播放录音.png
 */
export function CallRecordingPlayer({ duration = '00:16' }: { duration?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(55); // 0-100
  const [volume, setVolume] = useState(60);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [speed, setSpeed] = useState<'0.5倍速' | '1倍速' | '1.25倍速' | '1.5倍速' | '2倍速'>('1倍速');
  const speedOptions = ['0.5倍速', '1倍速', '1.25倍速', '1.5倍速', '2倍速'] as const;

  // Derive current time label from progress % * duration in seconds (for 00:16 demo: 55% → 00:08).
  const parseSeconds = (value: string) => {
    const [m, s] = value.split(':').map((x) => Number(x) || 0);
    return m * 60 + s;
  };
  const formatSeconds = (total: number) => {
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const totalSec = parseSeconds(duration);
  const currentLabel = formatSeconds((progress / 100) * totalSec);

  return (
    <div className="rounded-xl border border-slate-200 bg-[#fcfcfd] px-3 py-2.5">
      {/* Top row: progress bar + time labels */}
      <div className="flex items-center gap-3">
        <span className="tabular-nums text-[11px] font-medium text-slate-500 w-[34px]">
          {currentLabel}
        </span>
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            aria-label="播放进度"
            className="call-recording-range w-full"
            style={{ '--value': `${progress}%` } as React.CSSProperties}
          />
        </div>
        <span className="tabular-nums text-[11px] font-medium text-slate-500 w-[34px] text-right">
          {duration}
        </span>
      </div>

      {/* Bottom row: controls */}
      <div className="mt-2 flex items-center gap-2.5">
        <button
          type="button"
          aria-label="后退"
          className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Rewind size={14} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? '暂停' : '播放'}
          onClick={() => setIsPlaying((v) => !v)}
          className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100"
        >
          {isPlaying ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} className="ml-[1px]" />}
        </button>
        <button
          type="button"
          aria-label="快进"
          className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          <FastForward size={14} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="音量"
          className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Volume2 size={14} strokeWidth={2.2} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="音量"
          className="call-recording-range flex-1"
          style={{ '--value': `${volume}%` } as React.CSSProperties}
        />
        <div className="relative" data-dropdown-root="true">
          <button
            type="button"
            onClick={() => setIsSpeedMenuOpen((v) => !v)}
            className="focus-ring flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100"
            aria-haspopup="listbox"
            aria-expanded={isSpeedMenuOpen}
          >
            {speed}
            <ChevronDown
              size={11}
              className={cn('text-slate-400 transition-transform', isSpeedMenuOpen && 'rotate-180')}
            />
          </button>
          {isSpeedMenuOpen ? (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[84px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
              {speedOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSpeed(option);
                    setIsSpeedMenuOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-1.5 text-left text-[11px] transition-colors',
                    speed === option
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type HistoryContentEntry = {
  direction: 'in' | 'out';
  time: string;
  content: string;
  sender?: string;
  recipient?: string;
  subject?: string;
};

/** SMS list: compact time-tagged plain text rows, no bubbles. */
export function SmsContentList({ entries }: { entries: HistoryContentEntry[] }) {
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {entries.map((entry, index) => (
        <div key={index} className="px-3.5 py-3">
          <div className="mb-1.5">
            <span className="tabular-nums text-[11px] text-slate-400">{entry.time}</span>
          </div>
          <p className="text-[12px] leading-5 text-slate-700">{entry.content}</p>
        </div>
      ))}
    </div>
  );
}

/** Email list: card style with sender / recipient / subject — click to view detail. */
export function EmailContentList({ entries }: { entries: HistoryContentEntry[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeEntry = activeIndex !== null ? entries[activeIndex] : null;

  return (
    <>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <article
            key={index}
            onClick={() => setActiveIndex(index)}
            className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_6px_rgba(15,23,42,0.03)] transition-colors hover:border-brand-200 hover:bg-brand-50/30"
          >
            <header className="flex items-start gap-2 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold text-slate-800">
                  {entry.subject ?? '（无主题）'}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500">
                  <span className="font-medium text-slate-600">发件人:</span>{' '}
                  {entry.sender ?? '-'}{' '}
                  <span className="ml-2 font-medium text-slate-600">收件人:</span>{' '}
                  {entry.recipient ?? '-'}
                </div>
              </div>
              <span className="tabular-nums text-[11px] text-slate-400">{entry.time}</span>
            </header>
          </article>
        ))}
      </div>

      {activeEntry ? createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setActiveIndex(null)}
        >
          <div
            style={{ width: 480, maxHeight: '80vh', borderRadius: 16, backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                  {activeEntry.subject ?? '（无主题）'}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                  <span style={{ fontWeight: 500, color: '#475569' }}>发件人:</span>{' '}
                  {activeEntry.sender ?? '-'}{' '}
                  <span style={{ marginLeft: 12, fontWeight: 500, color: '#475569' }}>收件人:</span>{' '}
                  {activeEntry.recipient ?? '-'}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>{activeEntry.time}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '16px 20px', fontSize: 13, lineHeight: 1.8, color: '#334155', maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}>
              {activeEntry.content}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}

export default function CallHistoryPanel({
  callHistoryTab,
  onCallHistoryTabChange,
  callHistorySummaryLabel,
  activeHistoryMeta,
  isCallHistoryDateRangeTab,
  isCallHistoryTimeDropdownTab,
  activeCallHistoryDateRange,
  isCallHistoryDateRangeMenuOpen,
  onToggleCallHistoryDateRangeMenu,
  onUpdateActiveCallHistoryDateRange,
  activeCallHistoryTime,
  isCallHistoryTimeMenuOpen,
  onToggleCallHistoryTimeMenu,
  callHistoryTimeOptions,
  onSelectCallHistoryTime,
  onToggleCallHistoryTimeSort,
  renderFloatingMenu,
  toolSortIcon,
  hideDetails,
}: CallHistoryPanelProps) {
  const dateRangeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const timeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isHistorySummaryCollapsed, setIsHistorySummaryCollapsed] = useState(false);

  const isHistorySummaryTab = callHistoryTab === '通话历史' || callHistoryTab === '会话历史';
  const historySummaryTitle = callHistoryTab === '通话历史' ? '通话纪要' : '会话纪要';
  const historySummaryText = useMemo(() => {
    if (!isHistorySummaryTab) return '';
    const sample = activeHistoryMeta.messages
      .filter((m) => m.text && m.text.trim().length > 0)
      .slice(0, 2)
      .map((m) => m.text.trim())
      .join(' ');
    return sample || (callHistoryTab === '通话历史'
      ? '本次通话围绕用户来电诉求展开，已记录关键问题与处理建议。'
      : '本次会话已记录用户主要诉求与客服处理过程，详情可展开查看。');
  }, [isHistorySummaryTab, activeHistoryMeta.messages, callHistoryTab]);

  return (
    <section className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-hairline px-4 pt-3">

        <div className="flex items-center gap-1 rounded-full bg-slate-100/70 p-1">
          {callHistoryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onCallHistoryTabChange(tab)}
              className={cn(
                'focus-ring rounded-full px-3 py-1 text-[12px] font-semibold transition-all',
                callHistoryTab === tab
                  ? 'bg-white text-brand-600 shadow-[0_2px_8px_-2px_rgba(58,92,255,0.25)]'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] tabular-nums text-slate-500">{callHistorySummaryLabel}</span>
            <div className="relative min-w-[88px] flex-[1_1_120px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder={activeHistoryMeta.filterPlaceholder}
                className="h-[30px] w-full rounded-md border border-slate-200 bg-[#fcfcfd] pl-8 pr-3 text-[12px] text-slate-500 outline-none"
              />
            </div>
            {isCallHistoryDateRangeTab ? (
              <div className="relative" data-dropdown-root="true">
                <HistoryDateRangeFilter
                  buttonRef={(node) => {
                    dateRangeTriggerRef.current = node;
                  }}
                  startDate={activeCallHistoryDateRange.startDate}
                  endDate={activeCallHistoryDateRange.endDate}
                  isOpen={isCallHistoryDateRangeMenuOpen}
                  onClick={onToggleCallHistoryDateRangeMenu}
                  className="flex-[1_1_240px]"
                />
                {isCallHistoryDateRangeMenuOpen
                  ? renderFloatingMenu(
                      dateRangeTriggerRef.current,
                      <HistoryDateRangeMenu
                        startDate={activeCallHistoryDateRange.startDate}
                        endDate={activeCallHistoryDateRange.endDate}
                        onStartDateChange={(value) => onUpdateActiveCallHistoryDateRange('startDate', value)}
                        onEndDateChange={(value) => onUpdateActiveCallHistoryDateRange('endDate', value)}
                        onClear={() => {
                          onUpdateActiveCallHistoryDateRange('startDate', '');
                          onUpdateActiveCallHistoryDateRange('endDate', '');
                        }}
                      />,
                      { marginTop: 4, width: 280 }
                    )
                  : null}
              </div>
            ) : (
              <div className="relative" data-dropdown-root="true">
                <button
                  ref={(node) => {
                    timeTriggerRef.current = node;
                  }}
                  type="button"
                  onClick={onToggleCallHistoryTimeMenu}
                  className="flex h-[30px] items-center gap-2 rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-500"
                >
                  <span className={cn(!activeCallHistoryTime && 'text-slate-300')}>
                    {activeCallHistoryTime || '请选择'}
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn('text-slate-300 transition-transform', isCallHistoryTimeMenuOpen && 'rotate-180')}
                  />
                </button>
                {isCallHistoryTimeDropdownTab && isCallHistoryTimeMenuOpen
                  ? renderFloatingMenu(
                      timeTriggerRef.current,
                      <div className="overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                        {callHistoryTimeOptions.map((time) => (
                          <button
                            key={`${callHistoryTab}-${time}`}
                            type="button"
                            onClick={() => onSelectCallHistoryTime(time)}
                            className={cn(
                              'flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors',
                              activeCallHistoryTime === time
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'text-slate-600 hover:bg-slate-50'
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>,
                      { marginTop: 4, width: 176 }
                    )
                  : null}
              </div>
            )}
            {!isCallHistoryDateRangeTab ? (
              <button
                type="button"
                aria-label="切换时间排序"
                onClick={onToggleCallHistoryTimeSort}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-200 bg-[#fcfcfd] text-slate-400"
              >
                <img src={toolSortIcon} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            ) : null}
          </div>
          {!hideDetails && callHistoryTab !== '短信历史' && callHistoryTab !== '邮件历史' ? (
            <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-[12px]">
              {activeHistoryMeta.details.map((detail) => (
                <div key={detail.label}>
                  <span className="text-slate-500">{detail.label}：</span>
                  <span className="ml-1 tabular-nums font-semibold text-slate-800">{detail.value}</span>
                </div>
              ))}
            </div>
          ) : null}
          {!hideDetails && callHistoryTab === '通话历史' ? <CallRecordingPlayer duration="00:16" /> : null}
          {!hideDetails && isHistorySummaryTab ? (
            <div className="rounded-[10px] border-l-[3px] border-l-accent-400 bg-accent-50/60 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
              <button
                type="button"
                aria-expanded={!isHistorySummaryCollapsed}
                onClick={() => setIsHistorySummaryCollapsed((prev) => !prev)}
                className="focus-ring flex w-full items-center justify-between gap-2 rounded-md text-left text-[12px] font-semibold uppercase tracking-wide text-accent-700"
              >
                <span>{historySummaryTitle}</span>
                {isHistorySummaryCollapsed ? (
                  <ChevronRight size={14} className="text-accent-500" />
                ) : (
                  <ChevronDown size={14} className="text-accent-500" />
                )}
              </button>
              {!isHistorySummaryCollapsed ? (
                <p className="mt-1 text-slate-700">{historySummaryText}</p>
              ) : null}
            </div>
          ) : null}
          {!hideDetails ? (
          <div className="min-h-[228px] space-y-3 border-t border-hairline pt-4">
            {callHistoryTab === '短信历史' ? (
              <SmsContentList
                entries={activeHistoryMeta.messages.map((message, index) => ({
                  direction: message.align === 'right' ? 'out' : 'in',
                  time: `10-28 09:${String(10 + index * 2).padStart(2, '0')}:20`,
                  content: message.text,
                }))}
              />
            ) : callHistoryTab === '邮件历史' ? (
              <EmailContentList
                entries={activeHistoryMeta.messages.map((message, index) => ({
                  direction: message.align === 'right' ? 'out' : 'in',
                  time: `10-28 09:${String(10 + index * 5).padStart(2, '0')}:20`,
                  content: message.text,
                  subject: message.badge ?? '未命名主题',
                  sender: message.align === 'right' ? '客服001' : '客户',
                  recipient: message.align === 'right' ? '客户' : '客服001',
                }))}
              />
            ) : (
              activeHistoryMeta.messages.map((message, index) => (
                <div key={index} className={cn('flex', message.align === 'right' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[235px]', message.align === 'right' && 'items-end')}>
                    <div
                      className={cn(
                        'mb-1 text-[11px] tabular-nums text-slate-400',
                        message.align === 'right' ? 'text-right' : 'text-left'
                      )}
                    >
                      10-28 09:10:20
                    </div>
                    <div className={cn('flex items-center gap-2', message.align === 'right' && 'flex-row-reverse')}>
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white',
                          message.align === 'right' ? 'bg-orange-400' : 'bg-emerald-500'
                        )}
                      >
                        <MessageSquare size={14} />
                      </div>
                      <div className="space-y-1">
                        {message.badge ? (
                          <div className="text-right">
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-500">
                              {message.badge}
                            </span>
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2 text-[12px] leading-5 shadow-[0_2px_6px_rgba(15,23,42,0.03)]',
                            message.align === 'right'
                              ? 'rounded-tr-md bg-[#e9f9f4] text-slate-700'
                              : 'rounded-tl-md bg-slate-50 text-slate-700'
                          )}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
