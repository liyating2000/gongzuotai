import {
  Armchair,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Clock,
  Coffee,
  Image as ImageIcon,
  Key,
  Keyboard,
  LogIn,
  LogOut,
  Lock,
  MicOff,
  Pause,
  Phone,
  PhoneForwarded,
  PhoneOff,
  RefreshCw,
  Unlock,
  User,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';

import { cn } from '../../lib/cn';
import NotificationChatModal from './NotificationChatModal';
import type { MainTab, SecondaryMainTab } from './mainTabs';
import {
  userRoleDescriptions,
  userRoleLabels,
  userRoleOrder,
  type UserRole,
} from './roles';

type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

type HeaderPresenceMeta = {
  statusText: string;
  statusCls: string;
  callDuration: string;
  statusDuration: string;
  incomingNumber: string;
  extensionNumber: string;
  agentNumber: string;
};

type MainHeaderProps = {
  isTopHeaderSignedIn: boolean;
  topHeaderPresenceMeta: HeaderPresenceMeta;
  visibleMainTabs: MainTab[];
  activeTab: MainTab;
  secondaryMainTabCloseLabels: Record<SecondaryMainTab, string>;
  onTogglePresence: () => void;
  onOpenMainTab: (tab: MainTab) => void;
  onCloseSecondaryMainTab: (tab: SecondaryMainTab) => void;
  onOpenPortal: () => void;
  userName: string;
  avatarSrc: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
};

const breakOptions = ['厕所', '吃饭', '会议', '其他', '午休'] as const;
type BreakOption = (typeof breakOptions)[number];

function StatusItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="text-[12px] font-medium text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums truncate text-[14px] font-semibold text-slate-700',
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );
}

function StackedLabel({
  first,
  second,
}: {
  first: string;
  second: string;
}) {
  return (
    <div className="flex min-w-0 flex-col leading-tight tabular-nums text-[13px] font-medium text-slate-500">
      <span className="truncate">{first}</span>
      <span className="truncate">{second}</span>
    </div>
  );
}

export default function MainHeader({
  isTopHeaderSignedIn,
  topHeaderPresenceMeta,
  visibleMainTabs,
  activeTab,
  secondaryMainTabCloseLabels,
  onTogglePresence,
  onOpenMainTab,
  onCloseSecondaryMainTab,
  onOpenPortal,
  userName,
  avatarSrc,
  currentRole,
  onRoleChange,
}: MainHeaderProps) {
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [avatarMenuView, setAvatarMenuView] = useState<'main' | 'role'>('main');
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  // Internal presence sub-states used only when signed-in.
  const [isReady, setIsReady] = useState(false);
  const [breakValue, setBreakValue] = useState<BreakOption | ''>('');
  const [isBreakMenuOpen, setIsBreakMenuOpen] = useState(false);
  const breakMenuRef = useRef<HTMLDivElement | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Dialer state
  const [dialNumber, setDialNumber] = useState('');
  const [isDialpadOpen, setIsDialpadOpen] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callTransferModal, setCallTransferModal] = useState<'转坐席' | '转技能组' | null>(null);
  const dialpadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDialpadOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        dialpadRef.current &&
        !dialpadRef.current.contains(event.target as Node)
      ) {
        setIsDialpadOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isDialpadOpen]);

  // Reset internal sub-states on sign-out.
  useEffect(() => {
    if (!isTopHeaderSignedIn) {
      setIsReady(false);
      setBreakValue('');
      setIsBreakMenuOpen(false);
      setIsInCall(false);
      setCallTransferModal(null);
    }
  }, [isTopHeaderSignedIn]);

  useEffect(() => {
    if (!isBreakMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        breakMenuRef.current &&
        !breakMenuRef.current.contains(event.target as Node)
      ) {
        setIsBreakMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isBreakMenuOpen]);

  const computedStatusText = !isTopHeaderSignedIn
    ? '未签入'
    : isInCall
      ? '通话中'
      : breakValue
        ? `小休-${breakValue}`
        : isReady
          ? '准备好'
          : '未准备好';

  const computedStatusCls = !isTopHeaderSignedIn
    ? 'text-[#f59a23]'
    : isInCall
      ? 'text-blue-500'
      : breakValue
        ? 'text-violet-500'
        : isReady
          ? 'text-emerald-500'
          : 'text-[#e0389a]';

  const extensionNumber = isTopHeaderSignedIn
    ? topHeaderPresenceMeta.extensionNumber
    : '';
  const agentNumber = isTopHeaderSignedIn
    ? topHeaderPresenceMeta.agentNumber
    : '';

  const handleConfirmSignIn = () => {
    setIsSignInModalOpen(false);
    if (!isTopHeaderSignedIn) onTogglePresence();
  };

  const handleSignOutClick = () => {
    if (isTopHeaderSignedIn) onTogglePresence();
  };

  const handleDialCall = () => {
    if (dialNumber.trim()) {
      setIsInCall(true);
      setIsDialpadOpen(false);
    }
  };

  const handleHangUp = () => {
    setIsInCall(false);
    setCallTransferModal(null);
  };

  const handleToggleReadiness = () => {
    if (!isTopHeaderSignedIn) return;
    // Entering ready clears any break selection.
    setBreakValue('');
    setIsReady((prev) => !prev);
  };

  const handlePickBreak = (value: BreakOption) => {
    setBreakValue(value);
    setIsReady(false);
    setIsBreakMenuOpen(false);
  };

  useEffect(() => {
    if (!isAvatarMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isAvatarMenuOpen]);

  // Reset view when menu closes so it always re-opens to main.
  useEffect(() => {
    if (!isAvatarMenuOpen) {
      setAvatarMenuView('main');
    }
  }, [isAvatarMenuOpen]);

  const avatarMenuItems: Array<{
    key: string;
    label: string;
    icon: IconComponent;
    onClick?: () => void;
    trailing?: 'role-switch' | null;
  }> = [
    { key: 'profile', label: '个人信息', icon: User, onClick: onOpenPortal },
    { key: 'avatar', label: '更换头像', icon: ImageIcon },
    { key: 'docs', label: '文档', icon: BookOpen },
    {
      key: 'system-group',
      label: userRoleLabels[currentRole],
      icon: Users,
      trailing: 'role-switch',
    },
    { key: 'password', label: '修改密码', icon: Key },
    { key: 'clear-lock', label: '清除所有业务锁', icon: Unlock },
    { key: 'lock-screen', label: '锁定屏幕', icon: Lock },
    { key: 'logout', label: '退出系统', icon: LogOut },
  ];

  return (
    <header className="relative z-40 shrink-0 border-b border-hairline bg-white">
      {/* ========== Row 1: dialer / call controls / status / user ========== */}
      <div className="flex h-[76px] items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-4">
          {isTopHeaderSignedIn ? (
            <>
              {/* Dialer */}
              <div ref={dialpadRef} className="relative flex items-center gap-2">
                <label className="relative flex items-center">
                  <span className="sr-only">号码</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="号码"
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    className="focus-ring tabular-nums h-9 w-40 rounded-full border border-hairline bg-slate-50 px-4 text-[13px] text-slate-700 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setIsDialpadOpen((open) => !open)}
                  aria-label="打开拨号盘"
                  aria-expanded={isDialpadOpen}
                  className={cn(
                    'focus-ring flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border text-slate-500 transition-colors',
                    isDialpadOpen
                      ? 'border-brand-300 bg-brand-50 text-brand-600'
                      : 'border-hairline bg-slate-50 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600'
                  )}
                >
                  <Keyboard size={18} />
                </button>

                {isDialpadOpen ? (
                  <div className="animate-fade-in absolute left-0 top-[60px] z-[90] w-[232px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28)]">
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDialNumber((prev) => prev + key)}
                          className="focus-ring flex h-12 items-center justify-center rounded-xl bg-slate-50 text-[17px] font-semibold text-slate-700 tabular-nums transition-colors hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDialNumber((prev) => prev.slice(0, -1))}
                        className="focus-ring h-9 flex-1 rounded-xl border border-hairline bg-white text-[12px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600"
                      >
                        删除
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialNumber('')}
                        className="focus-ring h-9 flex-1 rounded-xl border border-hairline bg-white text-[12px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Call control cluster */}
              <div className="flex items-center gap-2">
                {isInCall ? (
                  <>
                    {/* 挂断 */}
                    <button
                      type="button"
                      onClick={handleHangUp}
                      className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    >
                      <PhoneOff size={16} strokeWidth={2.2} />
                      <span className="text-[12px] font-semibold leading-none">挂断</span>
                    </button>

                    {/* 保持 */}
                    <button
                      type="button"
                      className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100"
                    >
                      <Pause size={16} strokeWidth={2.2} />
                      <span className="text-[12px] font-semibold leading-none">保持</span>
                    </button>

                    {/* 转坐席 */}
                    <button
                      type="button"
                      onClick={() => setCallTransferModal('转坐席')}
                      className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                    >
                      <PhoneForwarded size={16} strokeWidth={2.2} />
                      <span className="text-[12px] font-semibold leading-none">转坐席</span>
                    </button>

                    {/* 转技能组 */}
                    <button
                      type="button"
                      onClick={() => setCallTransferModal('转技能组')}
                      className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <PhoneForwarded size={16} strokeWidth={2.2} />
                      <span className="text-[12px] font-semibold leading-none">转技能组</span>
                    </button>

                    {/* 静音 */}
                    <button
                      type="button"
                      className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-cyan-50 text-cyan-600 transition-colors hover:bg-cyan-100"
                    >
                      <MicOff size={16} strokeWidth={2.2} />
                      <span className="text-[12px] font-semibold leading-none">静音</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* 呼叫 */}
                    <button
                      type="button"
                      onClick={handleDialCall}
                      className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                    >
                      <Phone size={16} strokeWidth={2.2} />
                      <span className="text-[12px] font-semibold leading-none">呼叫</span>
                    </button>

                    {/* 示闲 / 示忙 */}
                    <button
                      type="button"
                      onClick={handleToggleReadiness}
                      className={cn(
                        'focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                        isReady
                          ? 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      )}
                    >
                      {isReady ? (
                        <Clock size={16} strokeWidth={2.2} />
                      ) : (
                        <Coffee size={16} strokeWidth={2.2} />
                      )}
                      <span className="text-[12px] font-semibold leading-none">
                        {isReady ? '示忙' : '示闲'}
                      </span>
                    </button>
                  </>
                )}

                {/* 小休 */}
                <button
                  type="button"
                  onClick={() => setIsBreakMenuOpen((open) => !open)}
                  className={cn(
                    'focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                    breakValue
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                  )}
                >
                  <Armchair size={16} strokeWidth={2.2} />
                  <span className="text-[12px] font-semibold leading-none">小休</span>
                </button>

                {/* Break reason select-like display */}
                <div ref={breakMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBreakMenuOpen((open) => !open)}
                    className={cn(
                      'focus-ring flex h-11 w-36 items-center justify-between rounded-xl border border-hairline bg-white px-3 text-[13px] font-medium text-slate-500 transition-colors hover:border-emerald-300 hover:text-emerald-600',
                      isBreakMenuOpen && 'border-emerald-400 ring-2 ring-emerald-100'
                    )}
                  >
                    <span className={cn('truncate', breakValue && 'text-slate-700')}>
                      {breakValue || ''}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {isBreakMenuOpen ? (
                    <div
                      role="menu"
                      aria-label="小休原因"
                      className="animate-fade-in absolute left-0 top-12 z-[100] min-w-[144px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28)]"
                    >
                      {breakOptions.map((opt) => {
                        const active = opt === breakValue;
                        return (
                          <button
                            key={opt}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            onClick={() => handlePickBreak(opt)}
                            className={cn(
                              'focus-ring flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] transition-colors',
                              active
                                ? 'bg-violet-50 font-semibold text-violet-700'
                                : 'text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {/* 签出 — hidden during active call */}
                {!isInCall ? (
                  <button
                    type="button"
                    onClick={handleSignOutClick}
                    className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
                  >
                    <LogOut size={16} strokeWidth={2.2} />
                    <span className="text-[12px] font-semibold leading-none">签出</span>
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            /* Signed-out: only a big 签入 button */
            <button
              type="button"
              onClick={() => setIsSignInModalOpen(true)}
              className="focus-ring flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              <LogIn size={17} strokeWidth={2.2} />
              <span className="text-[13px] font-semibold leading-none">签入</span>
            </button>
          )}

          {/* Status pills */}
          <div className="hidden items-center gap-5 border-l border-hairline pl-4 xl:flex">
            <StatusItem
              label="状态"
              value={computedStatusText}
              valueClass={computedStatusCls}
            />
            <StackedLabel
              first={`分机号:${extensionNumber}`}
              second={`工号:${agentNumber}`}
            />
            <StatusItem
              label="通话时长"
              value={topHeaderPresenceMeta.callDuration}
            />
            <StatusItem
              label="状态时长"
              value={topHeaderPresenceMeta.statusDuration}
            />
            <StatusItem
              label="通话号码"
              value={topHeaderPresenceMeta.incomingNumber}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsChatModalOpen(true)}
            aria-label="通知"
            title="通知"
            className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
          >
            <Bell size={17} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(244,63,94,0.45)]">
              57
            </span>
          </button>

          <div ref={avatarMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAvatarMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isAvatarMenuOpen}
              aria-label={`用户菜单，当前用户 ${userName}`}
              title="用户菜单"
              className="focus-ring group flex items-center gap-2 rounded-full border border-hairline bg-white/60 py-1 pl-1 pr-3 transition-all hover:-translate-y-[1px] hover:border-brand-300 hover:bg-brand-50/60"
            >
              <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-200 shadow-sm ring-2 ring-white transition-[ring] group-hover:ring-brand-100">
                <img
                  src={avatarSrc}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-[13px] font-semibold text-slate-700 transition-colors group-hover:text-brand-600">
                {userName}
              </span>
            </button>

            {isAvatarMenuOpen ? (
              <div
                role="menu"
                aria-label="用户菜单"
                className="animate-fade-in absolute right-0 top-11 z-[100] min-w-[240px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28)]"
              >
                {avatarMenuView === 'main' ? (
                  <div className="py-0.5">
                    {avatarMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            if (item.trailing === 'role-switch') {
                              return;
                            }
                            item.onClick?.();
                            setIsAvatarMenuOpen(false);
                          }}
                          className="focus-ring group/item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-brand-50/60"
                        >
                          <Icon size={15} className="shrink-0 text-slate-500 group-hover/item:text-brand-600" />
                          <span className="flex-1 text-[13px] font-medium text-slate-700 group-hover/item:text-brand-700">
                            {item.label}
                          </span>
                          {item.trailing === 'role-switch' ? (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                setAvatarMenuView('role');
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setAvatarMenuView('role');
                                }
                              }}
                              className="focus-ring tabular-nums rounded-md px-1 text-[12px] font-semibold text-brand-500 transition-colors hover:text-brand-600"
                            >
                              切换
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-0.5">
                    <div className="flex items-center gap-2 px-2 pb-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAvatarMenuView('main')}
                        className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="返回主菜单"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                        <UserCog size={13} className="text-slate-400" />
                        角色切换
                      </div>
                    </div>
                    <div className="my-1 h-px bg-slate-100" />
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                      {userRoleOrder.map((role) => {
                        const isActive = role === currentRole;
                        return (
                          <button
                            key={role}
                            type="button"
                            role="menuitemradio"
                            aria-checked={isActive}
                            onClick={() => {
                              onRoleChange(role);
                              setIsAvatarMenuOpen(false);
                            }}
                            className={cn(
                              'focus-ring flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                              isActive
                                ? 'bg-brand-50 text-brand-700'
                                : 'text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            <div className="min-w-0">
                              <div
                                className={cn(
                                  'text-[13px]',
                                  isActive ? 'font-bold' : 'font-semibold'
                                )}
                              >
                                {userRoleLabels[role]}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-400">
                                {userRoleDescriptions[role]}
                              </div>
                            </div>
                            {isActive ? (
                              <span
                                aria-hidden
                                className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 shadow-[0_0_0_3px_rgba(58,92,255,0.18)]"
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ========== Row 2: open-workspace tab strip ========== */}
      <nav
        aria-label="已打开的工作区"
        className="flex items-center gap-1 border-t border-hairline bg-white/60 px-5 py-2"
      >
        {visibleMainTabs.map((tab) => {
          const isActive = activeTab === tab;
          const closeLabel =
            secondaryMainTabCloseLabels[tab as SecondaryMainTab];
          return (
            <div
              key={tab}
              className={cn(
                'group flex items-center rounded-full transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_4px_12px_-4px_rgba(58,92,255,0.5)]'
                  : 'text-slate-600 hover:bg-brand-50/80 hover:text-brand-600'
              )}
            >
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onOpenMainTab(tab)}
                className={cn(
                  'focus-ring rounded-full py-1.5 pl-4 text-[13px] font-semibold transition-colors',
                  closeLabel ? 'pr-2' : 'pr-4'
                )}
              >
                {tab}
              </button>
              {closeLabel ? (
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCloseSecondaryMainTab(tab as SecondaryMainTab);
                  }}
                  className={cn(
                    'focus-ring mr-1 flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'text-white/80 hover:bg-white/20 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                  )}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              ) : null}
            </div>
          );
        })}
      </nav>

      {isSignInModalOpen ? (
        <SignInModal
          onClose={() => setIsSignInModalOpen(false)}
          onConfirm={handleConfirmSignIn}
        />
      ) : null}

      <NotificationChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      {callTransferModal ? (
        <CallTransferModal
          title={callTransferModal}
          onClose={() => setCallTransferModal(null)}
        />
      ) : null}
    </header>
  );
}

const transferAgentRows = [
  { id: 1, skillGroup: '王磊队列', agentNumber: '5002', status: '空闲' },
  { id: 2, skillGroup: '李娜队列', agentNumber: '5004', status: '空闲' },
];

const transferSkillGroupRows = [
  { id: 1, group: '售后部', name: '售后服务组' },
  { id: 2, group: '售后部', name: '技术支持组' },
  { id: 3, group: '客服部', name: 'VIP客户组' },
];

const skillGroupGroups = [...new Set(transferSkillGroupRows.map((r) => r.group))];

function CallTransferModal({
  title,
  onClose,
}: {
  title: '转坐席' | '转技能组';
  onClose: () => void;
}) {
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [agentSearch, setAgentSearch] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[820px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2
            id="transfer-modal-title"
            className="text-[16px] font-bold tracking-tight text-slate-800"
          >
            {title}
          </h2>
          <button
            type="button"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="刷新"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="min-h-[360px] px-6 py-2">
          {title === '转坐席' ? (
            <div>
              <div className="flex items-center gap-3 py-3">
                <label className="text-[13px] text-slate-500">工号搜索</label>
                <input
                  type="text"
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder="输入工号"
                  className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[13px] text-slate-700 outline-none transition-colors hover:border-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                />
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-hairline text-left text-slate-500">
                    <th className="w-[80px] py-3 font-medium">序号</th>
                    <th className="py-3 font-medium">技能组</th>
                    <th className="py-3 font-medium">工号</th>
                    <th className="py-3 font-medium">状态</th>
                    <th className="w-[100px] py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {transferAgentRows
                    .filter((row) => !agentSearch || row.agentNumber.includes(agentSearch))
                    .map((row) => (
                  <tr key={row.id} className="border-b border-hairline/60">
                    <td className="py-3 text-slate-600">{row.id}</td>
                    <td className="py-3 text-slate-700">{row.skillGroup}</td>
                    <td className="py-3 tabular-nums text-slate-700">{row.agentNumber}</td>
                    <td className="py-3">
                      <span className="text-emerald-600">{row.status}</span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
                      >
                        转接
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 py-3">
                <label className="text-[13px] text-slate-500">组别筛选</label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[13px] text-slate-700 outline-none transition-colors hover:border-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                >
                  <option value="">全部</option>
                  {skillGroupGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-hairline text-left text-slate-500">
                    <th className="w-[80px] py-3 font-medium">序号</th>
                    <th className="py-3 font-medium">组别</th>
                    <th className="py-3 font-medium">技能组名称</th>
                    <th className="w-[100px] py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {transferSkillGroupRows
                    .filter((row) => !groupFilter || row.group === groupFilter)
                    .map((row) => (
                      <tr key={row.id} className="border-b border-hairline/60">
                        <td className="py-3 text-slate-600">{row.id}</td>
                        <td className="py-3 text-slate-700">{row.group}</td>
                        <td className="py-3 text-slate-700">{row.name}</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={onClose}
                            className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
                          >
                            转接
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-xl border border-hairline bg-white px-6 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
          >
            关 闭
          </button>
        </div>
      </div>
    </div>
  );
}

function SignInModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [agentNumber, setAgentNumber] = useState('1001');
  const [extensionNumber, setExtensionNumber] = useState('878881001');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<'browser' | 'sip'>('browser');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-in-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-400" />
            <h2
              id="sign-in-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              坐席签入
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100"
            aria-label="关闭签入弹窗"
          >
            <X size={16} />
          </button>
        </header>
        <form
          className="space-y-4 px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <SignInField label="工号" required>
            <input
              type="text"
              value={agentNumber}
              onChange={(e) => setAgentNumber(e.target.value)}
              maxLength={20}
              className="focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] tabular-nums text-slate-400">
              {agentNumber.length} / 20
            </span>
          </SignInField>
          <SignInField label="分机号">
            <input
              type="text"
              value={extensionNumber}
              onChange={(e) => setExtensionNumber(e.target.value)}
              maxLength={20}
              className="focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] tabular-nums text-slate-400">
              {extensionNumber.length} / 20
            </span>
          </SignInField>
          <SignInField label="密码">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
              className="focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] tabular-nums text-slate-400">
              {password.length} / 20
            </span>
          </SignInField>
          <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3">
            <span className="text-right text-[13px] font-medium text-slate-700">
              签入方式
            </span>
            <div className="flex items-center gap-5 text-[13px] text-slate-700">
              {(
                [
                  { v: 'browser', label: '浏览器' },
                  { v: 'sip', label: 'SIP话机' },
                ] as const
              ).map((opt) => (
                <label key={opt.v} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sign-in-method"
                    checked={method === opt.v}
                    onChange={() => setMethod(opt.v)}
                    className="h-4 w-4 cursor-pointer accent-emerald-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-hairline px-0 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-xl border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-600"
            >
              取消
            </button>
            <button
              type="submit"
              className="focus-ring press-lift rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.55)]"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SignInField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3">
      <span className="text-right text-[13px] font-medium text-slate-700">
        {required ? <span className="mr-0.5 text-rose-500">*</span> : null}
        {label}
      </span>
      <div className="relative">{children}</div>
    </label>
  );
}
