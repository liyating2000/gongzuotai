import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, X } from 'lucide-react';

import { cn } from '../../lib/cn';

type AttachmentQueryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TABLE_COLUMNS = [
  { key: 'index', label: '#', width: 'w-[40px]' },
  { key: 'link', label: '链接', width: 'w-[80px]' },
  { key: 'receiveNumber', label: '接收号码', width: 'min-w-[100px]' },
  { key: 'senderName', label: '发送人姓名', width: 'min-w-[90px]' },
  { key: 'domainAccount', label: '域账号', width: 'min-w-[80px]' },
  { key: 'sendTime', label: '发送时间', width: 'min-w-[120px]' },
  { key: 'invalidStatus', label: '失效状态', width: 'min-w-[80px]' },
  { key: 'uploadStatus', label: '上传状态', width: 'min-w-[80px]' },
] as const;

export default function AttachmentQueryModal({
  isOpen,
  onClose,
}: AttachmentQueryModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setPhoneNumber('');
  }, [isOpen]);

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

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[8vh] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attachment-query-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[800px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-orange-500 to-orange-400" />
            <h2
              id="attachment-query-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              附件查询
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭附件查询弹窗"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </header>

        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
          <label className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
            <span className="shrink-0">号码：</span>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="请输入号码"
              className="focus-ring h-[34px] w-[200px] rounded-lg border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
            />
          </label>
          <button
            type="button"
            className="focus-ring inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-4 text-[13px] font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
          >
            <RefreshCw size={13} strokeWidth={2.2} />
            查询
          </button>
        </div>

        {/* Table */}
        <div className="min-h-[260px] overflow-x-auto px-6 py-4">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-orange-400">
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-2 py-2.5 text-left font-semibold text-slate-700',
                      col.width
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={TABLE_COLUMNS.length}
                  className="px-2 py-12 text-center text-[13px] text-slate-400"
                >
                  表格无数据...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-xl border border-orange-300 bg-orange-50/60 px-5 py-2 text-[13px] font-semibold text-orange-600 transition-colors hover:bg-orange-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
