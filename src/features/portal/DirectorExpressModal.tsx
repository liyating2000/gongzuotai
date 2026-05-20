import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  LayoutGrid,
  Link as LinkIcon,
  List as ListIcon,
  Maximize2,
  MoreVertical,
  PaintBucket,
  Quote,
  Redo2,
  Send,
  Type,
  Undo2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '../../lib/cn';
import ProjectDirectorExpressManagerModal from './ProjectDirectorExpressManagerModal';
import type {
  DirectorExpressMessage,
  DirectorExpressView,
} from './directorExpress';

type DirectorExpressModalProps = {
  isOpen: boolean;
  portalViewMode: 'manager' | 'agent';
  view: DirectorExpressView;
  messages: DirectorExpressMessage[];
  selectedMessage: DirectorExpressMessage | null;
  newMessageContent: string;
  isAnonymous: boolean;
  replyText: string;
  onClose: () => void;
  onViewChange: (view: DirectorExpressView) => void;
  onMessageSelect: (message: DirectorExpressMessage) => void;
  onNewMessageContentChange: (value: string) => void;
  onAnonymousChange: (value: boolean) => void;
  onReplyTextChange: (value: string) => void;
  onSendMessage: () => void;
  onSendReply: () => void;
};

export default function DirectorExpressModal({
  isOpen,
  portalViewMode,
  view,
  messages,
  selectedMessage,
  newMessageContent,
  isAnonymous,
  replyText,
  onClose,
  onViewChange,
  onMessageSelect,
  onNewMessageContentChange,
  onAnonymousChange,
  onReplyTextChange,
  onSendMessage,
  onSendReply,
}: DirectorExpressModalProps) {
  const isManagerPortalView = portalViewMode === 'manager';
  if (isManagerPortalView) {
    return (
      <ProjectDirectorExpressManagerModal
        isOpen={isOpen}
        view={view}
        messages={messages}
        selectedMessage={selectedMessage}
        replyText={replyText}
        onClose={onClose}
        onViewChange={onViewChange}
        onMessageSelect={onMessageSelect}
        onReplyTextChange={onReplyTextChange}
        onSendReply={onSendReply}
      />
    );
  }

  const currentView = isManagerPortalView && view === 'new' ? 'list' : view;
  const senderColumnTitle = isManagerPortalView ? '发件人' : '是否匿名';
  const secondaryStatusColumnTitle = isManagerPortalView ? '是否已回复' : '创建时间';
  const getManagerSenderLabel = (message: DirectorExpressMessage) => (message.isAnonymous ? '匿名' : 'Jack');
  const getReplyStatusLabel = (message: DirectorExpressMessage) => (message.isReplied ? '已回复' : '未回复');
  const getNewMessageTagLabel = (message: DirectorExpressMessage) => (message.isReplied ? '新回复' : '新消息');

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {currentView !== 'list' ? (
                    <button
                      type="button"
                      onClick={() => onViewChange('list')}
                      className="rounded-full p-1 transition-colors hover:bg-slate-100"
                    >
                      <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                  ) : null}
                  <h3 className="text-base font-bold text-slate-800">
                    {currentView === 'list'
                      ? '总监直通车'
                      : currentView === 'new'
                        ? '新建给总监的信'
                        : '查看信件'}
                  </h3>
                </div>

                {currentView === 'list' && !isManagerPortalView ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewChange('new')}
                      className="flex items-center gap-1 rounded border border-emerald-500 px-3 py-1 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-50"
                    >
                      <span className="text-lg leading-none">+</span> 新建信件
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {currentView === 'list' ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-medium text-slate-500">
                        <tr>
                          <th className="px-4 py-3">信件ID</th>
                          <th className="px-4 py-3">信件标题</th>
                          <th className="px-4 py-3">{senderColumnTitle}</th>
                          <th className="px-4 py-3">{secondaryStatusColumnTitle}</th>
                          <th className="px-4 py-3">更新时间</th>
                          <th className="px-4 py-3">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {messages.map((message) => (
                          <tr
                            key={message.id}
                            className="transition-colors hover:bg-slate-50/50"
                          >
                            <td className="px-4 py-4 text-slate-600">{message.id}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-800">{message.title}</span>
                                {message.hasNew ? (
                                  <span className="rounded border border-orange-100 bg-orange-50 px-1 py-0.5 text-[10px] text-orange-500">
                                    {getNewMessageTagLabel(message)}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {isManagerPortalView
                                ? getManagerSenderLabel(message)
                                : message.isAnonymous
                                  ? '是'
                                  : '否'}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {isManagerPortalView ? getReplyStatusLabel(message) : message.createdAt}
                            </td>
                            <td className="px-4 py-4 text-slate-600">{message.updatedAt}</td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => onMessageSelect(message)}
                                className="font-medium text-emerald-500 hover:text-emerald-600"
                              >
                                查看
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>5条记录</span>
                      <div className="flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1">
                        <span>5</span>
                        <ChevronDown size={12} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 font-bold text-white"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        4
                      </button>
                      <span>...</span>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        40
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : currentView === 'new' ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-20 text-sm text-slate-500">收件人</span>
                    <span className="text-sm text-slate-800">zongjian</span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-20 text-sm text-slate-500">发件人</span>
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-slate-800">Ranou</span>
                      <label className="flex cursor-pointer items-center gap-2">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white transition-colors checked:border-[#00BFA5] checked:bg-[#00BFA5]"
                            checked={isAnonymous}
                            onChange={(event) => onAnonymousChange(event.target.checked)}
                          />
                          <Check
                            size={12}
                            className="pointer-events-none absolute left-0.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                          />
                        </div>
                        <span className="text-sm text-slate-500">开启匿名</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-sm text-slate-800">信件内容</span>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <div className="mx-1 h-4 w-px self-center bg-slate-200" />
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Undo2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Redo2 size={16} />
                      </button>
                      <div className="mx-1 h-4 w-px self-center bg-slate-200" />
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <PaintBucket size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Eraser size={16} />
                      </button>
                      <div className="mx-1 h-4 w-px self-center bg-slate-200" />
                      <div className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-white">
                        正文 <ChevronDown size={12} />
                      </div>
                      <div className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-white">
                        11 <ChevronDown size={12} />
                      </div>
                      <div className="mx-1 h-4 w-px self-center bg-slate-200" />
                      <button
                        type="button"
                        className="rounded p-1.5 font-bold text-slate-600 transition-colors hover:bg-white"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 italic text-slate-600 transition-colors hover:bg-white"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <ListIcon size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 underline transition-colors hover:bg-white"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Type size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Highlighter size={16} />
                      </button>
                      <div className="mx-1 h-4 w-px self-center bg-slate-200" />
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <ImageIcon size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <LinkIcon size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <Quote size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <textarea
                      className="h-64 w-full resize-none p-4 text-sm text-slate-700 focus:outline-none"
                      placeholder="请输入信件内容..."
                      value={newMessageContent}
                      onChange={(event) => onNewMessageContentChange(event.target.value)}
                    />
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => onViewChange('list')}
                      className="rounded-full border border-slate-200 px-10 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={onSendMessage}
                      className="rounded-full border border-[#B2EBE4] bg-[#E6F7F4] px-10 py-2 text-sm font-medium text-[#00BFA5] transition-colors hover:bg-[#D1F2ED]"
                    >
                      发送
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="flex-1 space-y-6 pb-20">
                    <div className="mb-8 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {selectedMessage?.createdAt}
                      </span>
                    </div>

                    <div className="flex max-w-[80%] flex-col items-start gap-2">
                      <span className="text-xs text-slate-500">
                        {selectedMessage
                          ? isManagerPortalView
                            ? getManagerSenderLabel(selectedMessage)
                            : selectedMessage.isAnonymous
                              ? '匿名'
                              : selectedMessage.sender
                          : ''}
                      </span>
                      <div className="relative rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                        <div className="whitespace-pre-wrap">{selectedMessage?.content}</div>
                        <div className="absolute -left-2 top-4 h-4 w-4 rotate-45 bg-slate-50" />
                      </div>
                    </div>

                    {selectedMessage?.replies.map((reply, index) => (
                      <div
                        key={`${reply.sender}-${reply.timestamp}-${index}`}
                        className={cn(
                          'flex max-w-[80%] flex-col gap-2',
                          reply.sender === 'zongjian' ? 'ml-auto items-end' : 'items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            reply.sender === 'zongjian'
                              ? 'flex-row'
                              : 'flex-row-reverse'
                          )}
                        >
                          <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                          <span className="text-xs text-slate-500">{reply.sender}</span>
                        </div>
                        <div
                          className={cn(
                            'relative rounded-2xl p-4 text-sm leading-relaxed text-slate-700',
                            reply.sender === 'zongjian'
                              ? 'bg-emerald-50'
                              : 'bg-slate-50'
                          )}
                        >
                          <p>{reply.content}</p>
                          <div
                            className={cn(
                              'absolute top-4 h-4 w-4 rotate-45',
                              reply.sender === 'zongjian'
                                ? '-right-2 bg-emerald-50'
                                : '-left-2 bg-slate-50'
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="说点什么"
                        value={replyText}
                        onChange={(event) => onReplyTextChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            onSendReply();
                          }
                        }}
                        className="w-full rounded-full border border-slate-100 bg-slate-50 py-3 px-6 pr-12 text-sm transition-colors focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={onSendReply}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
