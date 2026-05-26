import {
  useEffect,
  useRef,
  useState,
  ComponentType,
  MutableRefObject,
  ReactNode,
  RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Monitor,
  Plus,
  Search,
  Send,
  X,
} from 'lucide-react';

import { cn } from '../../lib/cn';

type OnlineMessageTranslateLanguage = 'zh' | 'en';
type OnlineCallOverlay = 'audio' | 'video' | null;

type OnlineSessionVisitorMeta = {
  label: string;
  value: string;
};

type OnlineSessionTag = {
  label: string;
  cls: string;
};

type OnlineConversationSummaryCard = {
  title: string;
  body: string;
  cls: string;
};

type OnlineConversationMessage = {
  id: string;
  role: 'customer' | 'agent';
  time: string;
  text: string;
  translation?: string;
  qualityCheckText?: string;
  withdrawn?: boolean;
};

type OnlineSuggestionGroup = {
  label: string;
  panelCls: string;
  items: readonly string[];
};

type FloatingMenuOptions = {
  align?: 'left' | 'center' | 'right';
  marginTop?: number;
  width?: number;
  placement?: 'top' | 'bottom';
};

type ToolIconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
}>;

type ComposerTool = {
  label: string;
  icon?: ToolIconComponent;
  imageSrc?: string;
};

type OnlineUtilityItem = {
  label: string;
  imageSrc?: string;
};

type OnlineConversationPanelProps = {
  sessionId: string;
  customerName: string;
  entryCountLabel: string;
  visitorMeta: readonly OnlineSessionVisitorMeta[];
  tags: readonly OnlineSessionTag[];
  summaryCards: readonly OnlineConversationSummaryCard[];
  isVisitorExpanded: boolean;
  onToggleVisitorExpanded: () => void;
  isSessionFinished: boolean;
  isSessionConnected: boolean;
  onSessionConnectionToggle: () => void;
  onOpenTaggingModal?: () => void;
  transferAgentIconSrc: string;
  transferQueueIconSrc: string;
  conferenceIconSrc: string;
  endSessionIconSrc: string;
  messages: readonly OnlineConversationMessage[];
  translationLanguageById: Record<string, OnlineMessageTranslateLanguage | undefined>;
  getTranslatedMessageText: (
    message: OnlineConversationMessage,
    language: OnlineMessageTranslateLanguage
  ) => string | null;
  activeTranslateMenuMessageId: string | null;
  onOpenTranslateMenu: (messageId: string) => void;
  onSelectMessageTranslationLanguage: (
    message: OnlineConversationMessage,
    language: OnlineMessageTranslateLanguage
  ) => void;
  translateTriggerRefs: MutableRefObject<Record<string, HTMLButtonElement | null>>;
  messageTranslateIconSrc: string;
  withdrawNoticeText: string | null;
  onRequestWithdrawMessage: (messageId: string) => void;
  onReEditWithdrawnMessage: () => void;
  onQuoteOpeningQuestion: (text: string) => void;
  renderFloatingMenu: (
    triggerElement: HTMLElement | null,
    menuContent: ReactNode,
    options?: FloatingMenuOptions
  ) => ReactNode;
  utilityItems: readonly OnlineUtilityItem[];
  composerPrimaryTools: readonly ComposerTool[];
  composerSecondaryTools: readonly ComposerTool[];
  activeCallOverlay: OnlineCallOverlay;
  onPrimaryToolClick: (label: string) => void;
  suggestionTriggerRef: RefObject<HTMLButtonElement | null>;
  isComposerTranslateMenuOpen: boolean;
  onToggleComposerTranslateMenu: () => void;
  composerTranslateLanguage: OnlineMessageTranslateLanguage;
  onSelectComposerTranslateLanguage: (language: OnlineMessageTranslateLanguage) => void;
  isSuggestionMenuOpen: boolean;
  onToggleSuggestionMenu: () => void;
  onCloseSuggestionMenu: () => void;
  suggestionKeyword: string;
  onSuggestionKeywordChange: (value: string) => void;
  visibleSuggestionGroups: readonly OnlineSuggestionGroup[];
  isSuggestionSearching: boolean;
  expandedSuggestionGroups: Record<string, boolean>;
  onToggleSuggestionGroup: (groupLabel: string) => void;
  onApplySuggestion: (value: string) => void;
  composerTextareaRef: RefObject<HTMLTextAreaElement | null>;
  composerText: string;
  onComposerTextChange: (value: string) => void;
  isComposerDisabled: boolean;
  composerActionLabel: string;
  onSubmitComposer: () => void;
  composerMessageIconSrc: string;
};

export default function OnlineConversationPanel({
  sessionId,
  customerName,
  entryCountLabel,
  visitorMeta,
  tags,
  summaryCards,
  isVisitorExpanded,
  onToggleVisitorExpanded,
  isSessionFinished,
  isSessionConnected,
  onSessionConnectionToggle,
  onOpenTaggingModal,
  transferAgentIconSrc,
  transferQueueIconSrc,
  conferenceIconSrc,
  endSessionIconSrc,
  messages,
  translationLanguageById,
  getTranslatedMessageText,
  activeTranslateMenuMessageId,
  onOpenTranslateMenu,
  onSelectMessageTranslationLanguage,
  translateTriggerRefs,
  messageTranslateIconSrc,
  withdrawNoticeText,
  onRequestWithdrawMessage,
  onReEditWithdrawnMessage,
  onQuoteOpeningQuestion,
  renderFloatingMenu,
  utilityItems,
  composerPrimaryTools,
  composerSecondaryTools,
  activeCallOverlay,
  onPrimaryToolClick,
  suggestionTriggerRef,
  isComposerTranslateMenuOpen,
  onToggleComposerTranslateMenu,
  composerTranslateLanguage,
  onSelectComposerTranslateLanguage,
  isSuggestionMenuOpen,
  onToggleSuggestionMenu,
  onCloseSuggestionMenu,
  suggestionKeyword,
  onSuggestionKeywordChange,
  visibleSuggestionGroups,
  isSuggestionSearching,
  expandedSuggestionGroups,
  onToggleSuggestionGroup,
  onApplySuggestion,
  composerTextareaRef,
  composerText,
  onComposerTextChange,
  isComposerDisabled,
  composerActionLabel,
  onSubmitComposer,
  composerMessageIconSrc,
}: OnlineConversationPanelProps) {
  const utilityTriggerRef = useRef<HTMLButtonElement | null>(null);
  const utilityCloseTimerRef = useRef<number | null>(null);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const suggestionCloseTimerRef = useRef<number | null>(null);
  const [suggestionScopeTab, setSuggestionScopeTab] = useState<'public' | 'personal'>('public');
  const [collapsedSummaryCards, setCollapsedSummaryCards] = useState<Record<string, boolean>>({});
  const toggleSummaryCardCollapsed = (title: string) =>
    setCollapsedSummaryCards((prev) => ({ ...prev, [title]: !prev[title] }));
  const [messageContextMenu, setMessageContextMenu] = useState<{
    messageId: string;
    role: 'customer' | 'agent';
    text: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!messageContextMenu) return;
    const close = () => setMessageContextMenu(null);
    window.addEventListener('pointerdown', close, true);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', close, true);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', handleKey);
    };
  }, [messageContextMenu]);

  const clearUtilityCloseTimer = () => {
    if (utilityCloseTimerRef.current === null) {
      return;
    }

    window.clearTimeout(utilityCloseTimerRef.current);
    utilityCloseTimerRef.current = null;
  };

  const openUtilityMenu = () => {
    clearUtilityCloseTimer();
    setIsUtilityMenuOpen(true);
  };

  const scheduleUtilityMenuClose = () => {
    clearUtilityCloseTimer();
    utilityCloseTimerRef.current = window.setTimeout(() => {
      setIsUtilityMenuOpen(false);
      utilityCloseTimerRef.current = null;
    }, 120);
  };

  const clearSuggestionCloseTimer = () => {
    if (suggestionCloseTimerRef.current === null) {
      return;
    }

    window.clearTimeout(suggestionCloseTimerRef.current);
    suggestionCloseTimerRef.current = null;
  };

  const openSuggestionMenu = () => {
    clearSuggestionCloseTimer();
    if (!isSuggestionMenuOpen) {
      onToggleSuggestionMenu();
    }
  };

  const scheduleSuggestionMenuClose = () => {
    clearSuggestionCloseTimer();
    suggestionCloseTimerRef.current = window.setTimeout(() => {
      onCloseSuggestionMenu();
      suggestionCloseTimerRef.current = null;
    }, 160);
  };

  useEffect(() => {
    return () => {
      clearUtilityCloseTimer();
      clearSuggestionCloseTimer();
    };
  }, []);

  return (
    <section className="surface-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[18px]">
      <div className="border-b border-hairline bg-gradient-to-r from-white via-brand-50/20 to-white px-5 py-3.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-expanded={isVisitorExpanded}
            onClick={onToggleVisitorExpanded}
            className="focus-ring flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 text-[12px] text-slate-500 transition-colors hover:bg-brand-50/50 hover:text-brand-600"
          >
            <ChevronDown
              size={15}
              className={cn('text-slate-400 transition-transform', isVisitorExpanded && 'rotate-180')}
            />
            <span className="text-[15px] font-bold text-slate-800">{customerName}</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600">A渠道</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">{entryCountLabel}</span>
            <span className="tabular-nums text-[12px] text-slate-500">05:07</span>
          </button>
          {!isSessionFinished ? (
            <div className="flex items-center gap-[18px] text-[#6f6f6f]">
              <button
                type="button"
                aria-label="转坐席"
                title="转坐席"
                className="focus-ring rounded-lg p-1.5 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <img src={transferAgentIconSrc} alt="" className="h-[23px] w-[23px] object-contain" />
              </button>
              <button
                type="button"
                aria-label="转队列"
                title="转队列"
                className="focus-ring rounded-lg p-1.5 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <img src={transferQueueIconSrc} alt="" className="h-[23px] w-[23px] object-contain" />
              </button>
              <button
                type="button"
                aria-label="三方会议"
                title="三方会议"
                className="focus-ring rounded-lg p-1.5 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <img src={conferenceIconSrc} alt="" className="h-[23px] w-[23px] object-contain" />
              </button>
              <button
                type="button"
                aria-label="结束会话"
                title="结束会话"
                aria-pressed={!isSessionConnected}
                onClick={onSessionConnectionToggle}
                className={cn(
                  'focus-ring rounded-lg p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-600',
                  !isSessionConnected && 'bg-slate-100 opacity-70'
                )}
              >
                <img src={endSessionIconSrc} alt="" className="h-[23px] w-[23px] object-contain" />
              </button>
            </div>
          ) : null}
        </div>
        {isVisitorExpanded ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] text-slate-500">
              {visitorMeta.map((item) => (
                <div key={`online-visitor-meta-${sessionId}-${item.label}`} className="tabular-nums">
                  <span className="text-slate-400">{item.label}:</span>{' '}
                  <span className="text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.01em]', tag.cls)}
                >
                  {tag.label}
                </span>
              ))}
              <button
                type="button"
                onClick={onOpenTaggingModal}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
              >
                <Plus size={12} strokeWidth={2.2} />
                内部标签
              </button>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-surface-sunken/40 via-white to-white px-5 py-4 custom-scrollbar">
        <div className="space-y-2.5">
          {summaryCards.map((card) => {
            const isOpeningQuestionCard = card.title === '开口问';
            const isCollapsed = collapsedSummaryCards[card.title] ?? false;

            return (
              <div
                key={card.title}
                className={cn('rounded-[14px] border border-hairline px-4 py-3 text-[12px] leading-5 text-slate-600 shadow-[0_2px_8px_rgba(15,23,42,0.03)]', card.cls)}
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleSummaryCardCollapsed(card.title)}
                    className="focus-ring -mx-1 -my-0.5 flex flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left text-[13px] font-bold text-slate-800 transition-colors hover:text-brand-600"
                  >
                    <span className="h-3.5 w-[3px] rounded-full bg-gradient-to-b from-brand-500 to-brand-400" />
                    <span className="flex-1">{card.title}</span>
                    {isCollapsed ? (
                      <ChevronRight size={14} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={14} className="text-slate-400" />
                    )}
                  </button>
                  {isOpeningQuestionCard && !isCollapsed ? (
                    <button
                      type="button"
                      onClick={() => onQuoteOpeningQuestion(card.body)}
                      className="focus-ring press-lift shrink-0 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-brand-600 transition-colors hover:border-brand-300 hover:bg-brand-50"
                    >
                      引用
                    </button>
                  ) : null}
                </div>
                {!isCollapsed ? (
                  <p className="mt-1.5 text-[12px] leading-5">{card.body}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center py-1">
          <div className="rounded-full border border-hairline bg-surface-muted px-3 py-1 text-[11px] font-medium text-slate-500">
            {customerName}接入机器人
          </div>
        </div>

        {messages.map((message) => {
          const translationLanguage = translationLanguageById[message.id];
          const translatedMessageText = translationLanguage
            ? getTranslatedMessageText(message, translationLanguage)
            : null;
          const canTranslate = message.role === 'customer';

          return (
            <div
              key={message.id}
              className={cn('flex', message.role === 'agent' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'group/message flex max-w-[82%] items-start gap-2.5',
                  message.role === 'agent' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.25)]',
                    message.role === 'agent'
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600'
                      : 'bg-gradient-to-br from-accent-500 to-accent-600'
                  )}
                >
                  {message.role === 'agent' ? <MessageSquare size={15} /> : <Monitor size={15} />}
                </div>
                <div className={cn('min-w-0 flex-1', message.role === 'agent' && 'text-right')}>
                  <div className="tabular-nums mb-1 text-[11px] text-slate-400">{message.time}</div>
                  <div className="relative inline-block">
                    <div
                      onContextMenu={(event) => {
                        if (message.withdrawn) return;
                        event.preventDefault();
                        setMessageContextMenu({
                          messageId: message.id,
                          role: message.role,
                          text: message.text,
                          x: event.clientX,
                          y: event.clientY,
                        });
                      }}
                      className={cn(
                        'inline-block whitespace-pre-line rounded-2xl px-4 py-2.5 text-[13px] leading-5 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.12)] animate-fade-in',
                        message.role === 'agent'
                          ? 'rounded-br-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white'
                          : 'rounded-bl-sm border border-hairline bg-white text-slate-700'
                      )}
                    >
                      {message.text}
                    </div>
                    {canTranslate ? (
                      <div
                        className="absolute right-[-34px] top-1/2 -translate-y-1/2"
                        data-dropdown-root="true"
                      >
                        <button
                          ref={(node) => {
                            translateTriggerRefs.current[message.id] = node;
                          }}
                          type="button"
                          aria-label="翻译消息"
                          onClick={() => onOpenTranslateMenu(message.id)}
                          className={cn(
                            'focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-white/95 text-slate-400 opacity-0 shadow-[0_4px_12px_rgba(15,23,42,0.1)] transition-all duration-200 group-hover/message:opacity-100 hover:border-brand-200 hover:text-brand-600',
                            activeTranslateMenuMessageId === message.id &&
                              'border-brand-200 text-brand-600 opacity-100'
                          )}
                        >
                          <img
                            src={messageTranslateIconSrc}
                            alt=""
                            className="h-[16px] w-[16px] object-contain"
                          />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {translatedMessageText ? (
                    <div className="mt-1.5 inline-flex rounded-full border border-hairline bg-surface-muted px-3 py-1 text-[11px] text-slate-500">
                      {translationLanguage === 'zh' ? `译文：${translatedMessageText}` : `英文：${translatedMessageText}`}
                    </div>
                  ) : null}
                  {message.qualityCheckText ? (
                    <div className="mt-1.5 inline-flex rounded-full border border-rose-100 bg-rose-50/60 px-3 py-1 text-[11px] font-medium">
                      {message.qualityCheckText.includes('：') ? (
                        <>
                          <span className="text-signal-danger">
                            {`${message.qualityCheckText.split('：')[0]}：`}
                          </span>
                          <span className="text-brand-600">
                            {message.qualityCheckText.split('：').slice(1).join('：')}
                          </span>
                        </>
                      ) : (
                        <span className="text-signal-danger">{message.qualityCheckText}</span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              {activeTranslateMenuMessageId === message.id
                ? renderFloatingMenu(
                    translateTriggerRefs.current[message.id],
                    <div className="overflow-hidden rounded-[14px] border border-hairline bg-white/95 py-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur">
                      {([
                        { label: '中文', language: 'zh' as const },
                        { label: '英文', language: 'en' as const },
                      ]).map((item) => (
                        <button
                          key={item.language}
                          type="button"
                          onClick={() => onSelectMessageTranslationLanguage(message, item.language)}
                          className={cn(
                            'focus-ring flex h-12 w-full items-center justify-center px-6 text-[14px] font-medium transition-colors',
                            translationLanguage === item.language
                              ? 'bg-brand-50 text-brand-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>,
                    { align: 'center', marginTop: 10, width: 120, placement: 'bottom' }
                  )
                : null}
            </div>
          );
        })}

        {withdrawNoticeText ? (
          <div className="flex justify-center pt-10">
            <div className="text-[12px] font-medium tracking-[0.01em] text-slate-400">
              <span>你撤回了一条消息</span>
              <button
                type="button"
                onClick={onReEditWithdrawnMessage}
                className="focus-ring ml-3 font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                重新编辑
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-hairline bg-white px-5 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500">
            {composerPrimaryTools
              .filter(
                ({ label }) =>
                  !isSessionFinished || !['表单', '语音', '视频', '远程控制'].includes(label)
              )
              .map(({ label, icon: Icon, imageSrc }) => (
                <button
                  key={`online-composer-primary-${label}`}
                  type="button"
                  onClick={() => onPrimaryToolClick(label)}
                  className={cn(
                    'focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600',
                    ((label === '语音' && activeCallOverlay === 'audio') ||
                      (label === '视频' && activeCallOverlay === 'video')) &&
                      'bg-brand-50 text-brand-600'
                  )}
                >
                  <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                    {label}
                  </span>
                  {imageSrc ? (
                    <img src={imageSrc} alt="" className="h-[18px] w-[18px] object-contain" />
                  ) : Icon ? (
                    <Icon size={18} strokeWidth={1.9} />
                  ) : null}
                </button>
              ))}
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            {composerSecondaryTools.map(({ label, icon: Icon, imageSrc }) => {
              const isTranslateTool = label === '翻译';
              const isUtilityTool = label === '常用工具';
              const isSuggestionTool = label === '话术';
              const isUtilityToolActive = isUtilityTool && isUtilityMenuOpen;

              return (
                <div
                  key={`online-composer-secondary-${label}`}
                  className="relative"
                  data-dropdown-root={
                    isTranslateTool || isUtilityTool || isSuggestionTool ? 'true' : undefined
                  }
                >
                  <button
                    ref={
                      isSuggestionTool
                        ? suggestionTriggerRef
                        : isUtilityTool
                          ? utilityTriggerRef
                          : undefined
                    }
                    type="button"
                    aria-expanded={
                      isTranslateTool
                        ? isComposerTranslateMenuOpen
                        : isUtilityTool
                          ? isUtilityMenuOpen
                        : isSuggestionTool
                          ? isSuggestionMenuOpen
                          : undefined
                    }
                    onMouseEnter={
                      isUtilityTool
                        ? openUtilityMenu
                        : isSuggestionTool
                          ? openSuggestionMenu
                          : undefined
                    }
                    onMouseLeave={
                      isUtilityTool
                        ? scheduleUtilityMenuClose
                        : isSuggestionTool
                          ? scheduleSuggestionMenuClose
                          : undefined
                    }
                    onClick={
                      isTranslateTool
                        ? onToggleComposerTranslateMenu
                        : undefined
                    }
                    className={cn(
                      'focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600',
                      isTranslateTool && isComposerTranslateMenuOpen && 'bg-brand-50 text-brand-600',
                      isSuggestionTool && isSuggestionMenuOpen && 'bg-brand-50 text-brand-600',
                      isUtilityToolActive && 'bg-brand-50 text-brand-600'
                    )}
                  >
                    <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                      {label}
                    </span>
                    {imageSrc ? (
                      <img src={imageSrc} alt="" className="h-[18px] w-[18px] object-contain" />
                    ) : Icon ? (
                      <Icon size={18} strokeWidth={1.9} />
                    ) : null}
                  </button>

                  {isTranslateTool && isComposerTranslateMenuOpen ? (
                    <div className="absolute right-[calc(100%+8px)] top-1/2 z-20 w-[96px] -translate-y-1/2 overflow-hidden rounded-[14px] border border-hairline bg-white/95 py-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur">
                      {([
                        { label: '中文', language: 'zh' as const },
                        { label: '英文', language: 'en' as const },
                      ]).map((item) => (
                        <button
                          key={`online-composer-translate-${item.language}`}
                          type="button"
                          onClick={() => onSelectComposerTranslateLanguage(item.language)}
                          className={cn(
                            'focus-ring flex h-11 w-full items-center justify-center px-4 text-[13px] font-medium transition-colors',
                            composerTranslateLanguage === item.language
                              ? 'bg-brand-50 text-brand-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {isUtilityMenuOpen
              ? renderFloatingMenu(
                  utilityTriggerRef.current,
                  <div
                    className="overflow-hidden rounded-[18px] border border-hairline bg-white/95 shadow-[0_22px_48px_rgba(15,23,42,0.18)] backdrop-blur"
                    onMouseEnter={openUtilityMenu}
                    onMouseLeave={scheduleUtilityMenuClose}
                  >
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">

                      <div className="text-[14px] font-bold text-slate-800">常用工具</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-4">
                      {utilityItems.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className="focus-ring press-lift rounded-xl border border-hairline bg-surface-sunken px-2 py-3.5 text-center transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/40"
                        >
                          <div className="mx-auto flex h-[35px] w-[35px] items-center justify-center">
                            {item.imageSrc ? (
                              <img
                                src={item.imageSrc}
                                alt=""
                                className="h-[35px] w-[35px] object-contain"
                              />
                            ) : null}
                          </div>
                          <div className="mt-2 text-[12px] font-semibold text-slate-700">
                            {item.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>,
                  { align: 'center', marginTop: 12, width: 340, placement: 'top' }
                )
              : null}

            {isSuggestionMenuOpen
              ? renderFloatingMenu(
                  suggestionTriggerRef.current,
                  <div
                    className="overflow-hidden rounded-[18px] border border-hairline bg-white/95 shadow-[0_22px_48px_rgba(15,23,42,0.18)] backdrop-blur"
                    onMouseEnter={openSuggestionMenu}
                    onMouseLeave={scheduleSuggestionMenuClose}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-1">
                        {([
                          { key: 'public' as const, label: '公共话术' },
                          { key: 'personal' as const, label: '个人话术' },
                        ]).map((tab) => (
                          <button
                            key={`suggestion-scope-${tab.key}`}
                            type="button"
                            onClick={() => setSuggestionScopeTab(tab.key)}
                            className={cn(
                              'focus-ring rounded-full px-3 py-1 text-[13px] font-semibold transition-colors',
                              suggestionScopeTab === tab.key
                                ? 'bg-brand-50 text-brand-600'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        aria-label="关闭话术窗口"
                        onClick={onCloseSuggestionMenu}
                        className="focus-ring rounded-lg p-1 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <X size={16} strokeWidth={2.2} />
                      </button>
                    </div>
                    <div
                      className="max-h-[420px] overflow-y-auto px-4 py-3 custom-scrollbar"
                      style={{ maxHeight: 'min(420px, calc(100vh - 120px))' }}
                    >
                      <div className="relative">
                        <Search
                          size={14}
                          strokeWidth={2.2}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                        />
                        <input
                          value={suggestionKeyword}
                          onChange={(event) => onSuggestionKeywordChange(event.target.value)}
                          placeholder="搜索"
                          className="focus-ring h-9 w-full rounded-full border border-hairline bg-surface-muted pl-9 pr-3 text-[12px] text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <div className="mt-4 text-[12px] font-bold text-slate-800">系统自动提示语</div>
                      <div className="mt-3 space-y-2.5">
                        {visibleSuggestionGroups.length ? (
                          visibleSuggestionGroups.map((group) => {
                            const isExpanded =
                              isSuggestionSearching || expandedSuggestionGroups[group.label];

                            return (
                              <div key={group.label}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isSuggestionSearching) {
                                      onToggleSuggestionGroup(group.label);
                                    }
                                  }}
                                  className="focus-ring flex w-full items-center gap-1 rounded-md text-left text-[12px] font-semibold text-slate-700 hover:text-brand-600"
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={14} className="text-slate-400" />
                                  ) : (
                                    <ChevronRight size={14} className="text-slate-400" />
                                  )}
                                  <span>{group.label}</span>
                                </button>
                                {isExpanded ? (
                                  <div className={cn('mt-2 rounded-[12px] border border-hairline px-3 py-3', group.panelCls)}>
                                    <div className="space-y-1.5">
                                      {group.items.map((item, index) => (
                                        <button
                                          key={`${group.label}-${item}`}
                                          type="button"
                                          onClick={() => onApplySuggestion(item)}
                                          className="focus-ring flex w-full items-start gap-1.5 rounded-lg px-1.5 py-1 text-left text-[12px] leading-5 text-slate-600 transition-colors hover:bg-white hover:text-brand-600"
                                        >
                                          <span className="shrink-0 text-slate-400">{index + 1}.</span>
                                          <span>{item}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-[12px] border border-dashed border-hairline bg-surface-sunken px-3 py-6 text-center text-[12px] text-slate-400">
                            {suggestionScopeTab === 'public' ? '暂无公共话术' : '暂无个人话术'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>,
                  { align: 'center', marginTop: 12, width: 340, placement: 'top' }
                )
              : null}
          </div>
        </div>

        <div
          className={cn(
            'relative rounded-[18px] border border-hairline bg-white px-4 py-3 transition-all duration-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100',
            isComposerDisabled && 'bg-surface-sunken'
          )}
        >
          <textarea
            ref={composerTextareaRef}
            value={composerText}
            onChange={(event) => onComposerTextChange(event.target.value)}
            disabled={isComposerDisabled}
            placeholder={isSessionFinished ? '请输入留言内容' : isSessionConnected ? '' : '当前会话已断开'}
            className="custom-scrollbar h-[96px] w-full resize-none bg-transparent text-[14px] leading-5 text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
          />
          <button
            type="button"
            aria-label={composerActionLabel}
            disabled={isComposerDisabled}
            onClick={onSubmitComposer}
            className="focus-ring press-lift absolute bottom-4 right-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(58,92,255,0.55)] transition-all hover:shadow-[0_12px_26px_-8px_rgba(58,92,255,0.65)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {isSessionFinished ? null : (
              <Send size={14} strokeWidth={2.35} />
            )}
            <span>{composerActionLabel}</span>
          </button>
        </div>
      </div>
      {messageContextMenu
        ? createPortal(
            <div
              className="fixed z-[80] w-[120px] overflow-hidden rounded-[12px] border border-hairline bg-white/95 py-1 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur"
              style={{ left: messageContextMenu.x, top: messageContextMenu.y }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  const quoted = messageContextMenu.text;
                  const next = composerText.trim()
                    ? `${composerText.trimEnd()}\n${quoted}`
                    : quoted;
                  onComposerTextChange(next);
                  setMessageContextMenu(null);
                  composerTextareaRef.current?.focus();
                }}
                className="focus-ring flex w-full items-center px-3 py-2 text-left text-[12px] text-slate-600 transition-colors hover:bg-brand-50/60 hover:text-brand-600"
              >
                引用
              </button>
              {messageContextMenu.role === 'agent' ? (
                <button
                  type="button"
                  onClick={() => {
                    onRequestWithdrawMessage(messageContextMenu.messageId);
                    setMessageContextMenu(null);
                  }}
                  className="focus-ring flex w-full items-center px-3 py-2 text-left text-[12px] text-signal-danger transition-colors hover:bg-rose-50"
                >
                  撤回
                </button>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
