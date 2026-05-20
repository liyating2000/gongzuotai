import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Smile, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '../../lib/cn';
import type { DirectorExpressMessage, DirectorExpressView } from './directorExpress';
import {
  portalPagerButtonClassName,
  portalTableCardClassName,
  portalToolbarIconButtonClassName,
} from './portalStyles';

type ProjectDirectorExpressManagerModalProps = {
  isOpen: boolean;
  view: DirectorExpressView;
  messages: DirectorExpressMessage[];
  selectedMessage: DirectorExpressMessage | null;
  replyText: string;
  onClose: () => void;
  onViewChange: (view: DirectorExpressView) => void;
  onMessageSelect: (message: DirectorExpressMessage) => void;
  onReplyTextChange: (value: string) => void;
  onSendReply: () => void;
};

const getVisiblePageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const sortedPages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  return sortedPages.reduce<Array<number | string>>((items, page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}-${page}`);
    }

    items.push(page);
    return items;
  }, []);
};

export default function ProjectDirectorExpressManagerModal({
  isOpen,
  view,
  messages,
  selectedMessage,
  replyText,
  onClose,
  onViewChange,
  onMessageSelect,
  onReplyTextChange,
  onSendReply,
}: ProjectDirectorExpressManagerModalProps) {
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const currentView = view === 'new' || !selectedMessage && view === 'detail' ? 'list' : view;
  const pageSizeOptions = [5, 10, 20] as const;
  const totalPages = Math.max(1, Math.ceil(messages.length / pageSize));
  const pageStartIndex = (currentPage - 1) * pageSize;
  const visibleMessages = messages.slice(pageStartIndex, pageStartIndex + pageSize);
  const visiblePageItems = getVisiblePageItems(currentPage, totalPages);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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
            className="relative flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-2xl"
          >
            {currentView === 'list' ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <span className="text-base font-bold text-slate-800">总监直通车</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className={portalToolbarIconButtonClassName}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  <div className={portalTableCardClassName}>
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">信件ID</th>
                          <th className="px-4 py-3 font-medium">信件标题</th>
                          <th className="px-4 py-3 font-medium">发件人</th>
                          <th className="px-4 py-3 font-medium">创建时间</th>
                          <th className="px-4 py-3 font-medium">更新时间</th>
                          <th className="px-4 py-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleMessages.map((message) => (
                          <tr key={message.id} className="transition-colors hover:bg-slate-50/50">
                            <td className="px-4 py-4 text-slate-600">{message.id}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-800">{message.title}</span>
                                {message.hasNew ? (
                                  <span className="rounded border border-orange-100 bg-orange-50 px-1.5 py-0.5 text-[10px] text-orange-500">
                                    未读
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {message.isAnonymous ? '匿名' : message.sender}
                            </td>
                            <td className="px-4 py-4 text-slate-600">{message.createdAt}</td>
                            <td className="px-4 py-4 text-slate-600">{message.updatedAt}</td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => onMessageSelect(message)}
                                className="font-medium text-[#26aa8e] transition-colors hover:text-[#1f947b]"
                              >
                                查看
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-[13px] text-slate-500">
                  <span>共{messages.length}条</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span>每页</span>
                      <select
                        value={pageSize}
                        onChange={(event) => {
                          setPageSize(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-600 shadow-sm outline-none transition-colors hover:border-slate-300"
                      >
                        {pageSizeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span>条</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className={portalPagerButtonClassName}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {visiblePageItems.map((item) =>
                        typeof item === 'number' ? (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrentPage(item)}
                            className={cn(
                              portalPagerButtonClassName,
                              currentPage === item
                                ? 'border-[#26aa8e] bg-[#26aa8e] text-white hover:bg-[#1f947b] hover:text-white'
                                : ''
                            )}
                          >
                            {item}
                          </button>
                        ) : (
                          <span key={item} className="px-1 text-slate-300">
                            ...
                          </span>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className={portalPagerButtonClassName}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewChange('list')}
                      className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-base font-bold text-slate-800">{selectedMessage?.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className={portalToolbarIconButtonClassName}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#26aa8e] text-[13px] font-medium text-white">
                      {(selectedMessage?.sender ?? '匿').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex max-w-[78%] flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-slate-500">
                          {selectedMessage?.isAnonymous ? '匿名' : selectedMessage?.sender}
                        </span>
                        <span className="text-[12px] text-slate-400">{selectedMessage?.createdAt}</span>
                      </div>
                      <div className="rounded-[10px] rounded-tl-none border border-slate-100 bg-white px-4 py-3 shadow-sm">
                        <div className="mb-1.5 text-[13px] font-medium text-[#26aa8e]">{selectedMessage?.title}</div>
                        <div className="whitespace-pre-wrap text-[14px] leading-7 text-slate-700">
                          {selectedMessage?.content}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedMessage?.replies.map((reply, index) => {
                    const isManagerReply = reply.sender === 'zongjian';

                    return (
                      <div
                        key={`${reply.sender}-${reply.timestamp}-${index}`}
                        className={`flex items-start gap-3 ${isManagerReply ? 'justify-end' : ''}`}
                      >
                        {!isManagerReply ? (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-[13px] font-medium text-white">
                            {reply.sender.slice(0, 1).toUpperCase()}
                          </div>
                        ) : null}

                        <div className={`flex max-w-[78%] flex-col gap-1.5 ${isManagerReply ? 'items-end' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-slate-500">{reply.sender}</span>
                            <span className="text-[12px] text-slate-400">{reply.timestamp}</span>
                          </div>
                          <div
                            className={`rounded-lg px-3 py-2.5 shadow-sm ${
                              isManagerReply
                                ? 'rounded-tr-none bg-[#26aa8e] px-4 py-3 text-white'
                                : 'rounded-tl-none border border-slate-100 bg-white px-4 py-3 text-slate-700'
                            }`}
                          >
                            <div className="text-[14px] leading-7">{reply.content}</div>
                          </div>
                        </div>

                        {isManagerReply ? (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#26aa8e] text-[13px] font-medium text-white">
                            总
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
                    <button type="button" className={portalToolbarIconButtonClassName}>
                      <Smile size={15} />
                    </button>
                    <button type="button" className={portalToolbarIconButtonClassName}>
                      <ImageIcon size={15} />
                    </button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(event) => onReplyTextChange(event.target.value)}
                    placeholder="请输入..."
                    className="h-24 w-full resize-none bg-white px-4 py-3 text-[14px] leading-7 text-slate-700 outline-none"
                  />
                  <div className="flex justify-end px-4 pb-4">
                    <button
                      type="button"
                      onClick={onSendReply}
                      disabled={!replyText.trim()}
                      className={`rounded-md px-5 py-2 text-[13px] font-medium transition-colors ${
                        replyText.trim()
                          ? 'bg-[#26aa8e] text-white hover:bg-[#1f947b]'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                      }`}
                    >
                      发送
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
