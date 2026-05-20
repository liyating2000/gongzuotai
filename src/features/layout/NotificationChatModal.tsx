import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AtSign,
  Image as ImageIcon,
  Paperclip,
  Search,
  Send,
  Smile,
  X,
} from 'lucide-react';

import { cn } from '../../lib/cn';

type ChatMessage = {
  id: string;
  role: 'me' | 'them';
  time: string;
  text: string;
};

type ChatContact = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  role?: string;
  messages: ChatMessage[];
};

const chatContacts: ChatContact[] = [
  {
    id: 'c-1',
    name: '李主管',
    avatar: 'https://picsum.photos/seed/avatar-li/96/96',
    lastMessage: '请及时处理一下新分派的工单，谢谢。',
    lastTime: '09:42',
    unread: 3,
    online: true,
    role: '话务组主管',
    messages: [
      { id: 'm-1', role: 'them', time: '09:30', text: '早上好，今天有两单紧急咨询需要跟进。' },
      { id: 'm-2', role: 'me', time: '09:32', text: '收到，我看一下优先级。' },
      { id: 'm-3', role: 'them', time: '09:41', text: '请及时处理一下新分派的工单，谢谢。' },
      { id: 'm-4', role: 'them', time: '09:42', text: '处理完记得同步到周报。' },
    ],
  },
  {
    id: 'c-2',
    name: '王小芳',
    avatar: 'https://picsum.photos/seed/avatar-wang/96/96',
    lastMessage: '[图片]',
    lastTime: '09:18',
    unread: 1,
    online: true,
    role: '客服坐席',
    messages: [
      { id: 'm-1', role: 'them', time: '09:10', text: '昨天那个客户的回访脚本能发我一份吗？' },
      { id: 'm-2', role: 'me', time: '09:12', text: '稍等，我找一下。' },
      { id: 'm-3', role: 'them', time: '09:18', text: '[图片]' },
    ],
  },
  {
    id: 'c-3',
    name: '张经理',
    avatar: 'https://picsum.photos/seed/avatar-zhang/96/96',
    lastMessage: '本周质检报告已上传至共享盘。',
    lastTime: '昨天',
    unread: 0,
    online: false,
    role: '质检负责人',
    messages: [
      { id: 'm-1', role: 'them', time: '昨天 16:20', text: '本周质检报告已上传至共享盘。' },
      { id: 'm-2', role: 'them', time: '昨天 16:21', text: '有几个典型案例记得看一下。' },
      { id: 'm-3', role: 'me', time: '昨天 17:05', text: '收到，明天一早去看。' },
    ],
  },
  {
    id: 'c-4',
    name: '系统通知',
    avatar: 'https://picsum.photos/seed/avatar-system/96/96',
    lastMessage: '您有 3 张工单超期未处理',
    lastTime: '昨天',
    unread: 12,
    online: false,
    role: '消息助手',
    messages: [
      { id: 'm-1', role: 'them', time: '昨天 18:00', text: '您有 3 张工单超期未处理，请尽快跟进。' },
      { id: 'm-2', role: 'them', time: '昨天 19:30', text: '排班提醒：明日 09:00-18:00 当班。' },
    ],
  },
  {
    id: 'c-5',
    name: '讯飞客服群',
    avatar: 'https://picsum.photos/seed/avatar-group/96/96',
    lastMessage: '陈瑶：大家记得看一下新版话术。',
    lastTime: '周一',
    unread: 0,
    online: true,
    role: '群聊 · 23 人',
    messages: [
      { id: 'm-1', role: 'them', time: '周一 10:12', text: '陈瑶：大家记得看一下新版话术。' },
      { id: 'm-2', role: 'them', time: '周一 10:14', text: '刘杰：收到。' },
    ],
  },
];

type NotificationChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NotificationChatModal({
  isOpen,
  onClose,
}: NotificationChatModalProps) {
  const [activeContactId, setActiveContactId] = useState(chatContacts[0]?.id ?? '');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [draft, setDraft] = useState('');
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const activeContact = useMemo(
    () => chatContacts.find((c) => c.id === activeContactId) ?? chatContacts[0],
    [activeContactId]
  );

  const filteredContacts = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return chatContacts;
    return chatContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.lastMessage.toLowerCase().includes(kw) ||
        (c.role ?? '').toLowerCase().includes(kw)
    );
  }, [searchKeyword]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !activeContact) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label="消息通知"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up flex h-[640px] w-full max-w-[1040px] overflow-hidden rounded-[18px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== Left: contact list ==================== */}
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-hairline bg-slate-50/60">
          <header className="flex items-center justify-between px-4 pb-3 pt-4">
            <h2 className="text-[16px] font-bold tracking-tight text-slate-800">消息</h2>
            <span className="tabular-nums text-[12px] text-slate-400">
              {chatContacts.reduce((sum, c) => sum + c.unread, 0)} 条未读
            </span>
          </header>

          <div className="px-3 pb-3">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="搜索联系人或消息"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="focus-ring h-9 w-full rounded-full border border-hairline bg-white pl-8 pr-3 text-[12px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
            <ul>
              {filteredContacts.map((contact) => {
                const isActive = contact.id === activeContact.id;
                return (
                  <li key={contact.id}>
                    <button
                      type="button"
                      onClick={() => setActiveContactId(contact.id)}
                      className={cn(
                        'focus-ring flex w-full items-center gap-3 border-l-[3px] px-3 py-3 text-left transition-colors',
                        isActive
                          ? 'border-l-brand-500 bg-white'
                          : 'border-l-transparent hover:bg-white'
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-200">
                          <img
                            src={contact.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {contact.online ? (
                          <span
                            aria-hidden
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'truncate text-[13px]',
                              isActive ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'
                            )}
                          >
                            {contact.name}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                            {contact.lastTime}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] text-slate-500">
                            {contact.lastMessage}
                          </span>
                          {contact.unread > 0 ? (
                            <span className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[10px] font-bold text-white tabular-nums">
                              {contact.unread > 99 ? '99+' : contact.unread}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
              {filteredContacts.length === 0 ? (
                <li className="px-4 py-10 text-center text-[12px] text-slate-400">
                  没有找到匹配的联系人
                </li>
              ) : null}
            </ul>
          </div>
        </aside>

        {/* ==================== Right: chat area ==================== */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Chat header */}
          <header className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
                <img
                  src={activeContact.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-bold text-slate-800">
                  {activeContact.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeContact.online ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      在线 · {activeContact.role ?? ''}
                    </span>
                  ) : (
                    <span>{activeContact.role ?? '离线'}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭消息弹窗"
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </header>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-5 py-4 custom-scrollbar">
            <div className="space-y-4">
              {activeContact.messages.map((msg) => {
                const isMe = msg.role === 'me';
                return (
                  <div
                    key={msg.id}
                    className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'flex max-w-[72%] items-start gap-2.5',
                        isMe && 'flex-row-reverse'
                      )}
                    >
                      {!isMe ? (
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200">
                          <img
                            src={activeContact.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div className={cn('min-w-0', isMe && 'text-right')}>
                        <div className="mb-1 text-[10px] tabular-nums text-slate-400">
                          {msg.time}
                        </div>
                        <div
                          className={cn(
                            'inline-block whitespace-pre-line rounded-2xl px-4 py-2.5 text-[13px] leading-5 shadow-[0_2px_6px_rgba(15,23,42,0.03)]',
                            isMe
                              ? 'rounded-tr-md bg-brand-500 text-white'
                              : 'rounded-tl-md bg-white text-slate-700'
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-hairline bg-white px-5 py-3">
            <div className="mb-2 flex items-center gap-3 text-slate-500">
              {[
                { label: '表情', icon: Smile },
                { label: '图片', icon: ImageIcon },
                { label: '附件', icon: Paperclip },
                { label: '提及', icon: AtSign },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={`chat-composer-${label}`}
                  type="button"
                  aria-label={label}
                  title={label}
                  className="focus-ring group relative rounded-lg p-1.5 transition-all duration-200 hover:bg-brand-50 hover:text-brand-600"
                >
                  <Icon size={16} strokeWidth={1.9} />
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                ref={composerRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    setDraft('');
                  }
                }}
                placeholder={`发送给 ${activeContact.name}（Enter 发送，Shift+Enter 换行）`}
                rows={2}
                className="focus-ring min-h-[44px] flex-1 resize-none rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setDraft('')}
                disabled={!draft.trim()}
                className={cn(
                  'focus-ring press-lift flex h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-all',
                  draft.trim()
                    ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                )}
              >
                <Send size={15} strokeWidth={2.1} />
                发送
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}
