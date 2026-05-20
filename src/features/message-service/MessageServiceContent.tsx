import { ChevronDown, FileText, Search } from 'lucide-react';

import { cn } from '../../lib/cn';
import type { MessageServiceMailbox } from './data';

type MessageServiceContentProps = {
  activeMailbox: MessageServiceMailbox;
  mailboxes: readonly MessageServiceMailbox[];
  onMailboxChange: (mailbox: MessageServiceMailbox) => void;
};

export default function MessageServiceContent({
  activeMailbox,
  mailboxes,
  onMailboxChange,
}: MessageServiceContentProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-[146px] shrink-0 flex-col border-r border-slate-100 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
              <FileText size={14} className="text-slate-400" />
              公告栏
            </div>
            <ChevronDown size={14} className="rotate-180 text-slate-400" />
          </div>
          <div className="px-2 py-3">
            {mailboxes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onMailboxChange(item)}
                className={cn(
                  'flex w-full items-center border-r-[3px] px-5 py-4 text-left text-[14px] transition-colors',
                  activeMailbox === item
                    ? 'border-[#1cc7ad] bg-[#eefaf7] font-medium text-[#1ab89f]'
                    : 'border-transparent text-slate-700 hover:bg-slate-50'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 min-w-[78px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-600">
                全部
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="flex h-9 w-[180px] items-center rounded-md border border-slate-200 bg-white pl-3 pr-2 text-[13px] text-slate-500">
                <input
                  type="text"
                  placeholder="搜索"
                  className="flex-1 border-none bg-transparent outline-none placeholder:text-slate-400"
                />
                <Search size={15} className="text-slate-400" />
              </div>
            </div>
            <button type="button" className="text-[13px] font-medium text-[#1ab89f] transition-colors hover:text-[#0ea88c]">
              全部标记为已读
            </button>
          </div>
          <div className="px-4 pb-2">
            <span className="inline-flex h-7 items-center rounded-full border border-[#7be3d1] px-3 text-[13px] font-medium text-[#18bea4]">
              全部
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-4">
            <div className="grid grid-cols-[1.8fr_88px_88px_88px_100px_120px] border-b border-slate-100 px-4 py-3 text-[13px] text-slate-400">
              <span>标题</span>
              <span>附件</span>
              <span>阅读量</span>
              <span>回复量</span>
              <span>公告人</span>
              <span>发布时间</span>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                  <FileText size={26} className="text-slate-200" />
                  <span className="absolute left-[14px] top-[12px] h-2 w-2 rounded-full bg-[#4fd7c0]" />
                  <span className="absolute right-[16px] top-[10px] h-1.5 w-1.5 rounded-full bg-[#97eadc]" />
                  <span className="absolute right-[11px] top-[17px] h-2 w-2 rounded-full bg-[#2ec7ad]" />
                </div>
                <span className="text-[13px]">暂无数据</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 px-2 py-4">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-[13px] text-slate-600">
                1
              </button>
              <button type="button" className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-600">
                10 条/页
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
