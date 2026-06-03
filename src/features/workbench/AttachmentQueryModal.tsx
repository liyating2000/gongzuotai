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

type QueryRow = {
  index: number;
  link: string;
  receiveNumber: string;
  senderName: string;
  domainAccount: string;
  sendTime: string;
  invalidStatus: string;
  uploadStatus: string;
};

const MOCK_RESULTS: QueryRow[] = [
  { index: 1, link: 'https://kffile.ifly...', receiveNumber: '15156006312', senderName: '张三', domainAccount: 'zhangsan', sendTime: '2026-04-23', invalidStatus: '有效', uploadStatus: '已上传' },
  { index: 2, link: 'https://kffile.ifly...', receiveNumber: '15156006312', senderName: '张三', domainAccount: 'zhangsan', sendTime: '2026-04-23', invalidStatus: '有效', uploadStatus: '已上传' },
  { index: 3, link: 'https://kffile.ifly...', receiveNumber: '15156006312', senderName: '李四', domainAccount: 'lisi', sendTime: '2026-03-07', invalidStatus: '有效', uploadStatus: '已上传' },
  { index: 4, link: 'https://kffile.ifly...', receiveNumber: '15156006312', senderName: '李四', domainAccount: 'lisi', sendTime: '2026-03-07', invalidStatus: '有效', uploadStatus: '已上传' },
  { index: 5, link: 'https://kffile.ifly...', receiveNumber: '15156006312', senderName: '王五', domainAccount: 'wangwu', sendTime: '2026-02-28', invalidStatus: '已失效', uploadStatus: '已上传' },
];

type DetailRow = {
  index: number;
  fileName: string;
  fileRemark: string;
  uploadTime: string;
};

const DETAIL_COLUMNS = [
  { key: 'index', label: '#', width: 'w-[40px]' },
  { key: 'fileName', label: '文件名', width: 'min-w-[240px]' },
  { key: 'fileRemark', label: '文件备注', width: 'min-w-[140px]' },
  { key: 'uploadTime', label: '上传时间', width: 'min-w-[140px]' },
] as const;

const MOCK_DETAILS: Record<number, DetailRow[]> = {
  1: [
    { index: 1, fileName: '254386e1644bcefb2bc6267082cca3j...', fileRemark: '短链接上传的附件', uploadTime: '2026-04-23 23:27:21' },
  ],
  2: [
    { index: 1, fileName: 'a8f32c1e9b7d4f6a0c2e8b1d3f5a7c...', fileRemark: '短链接上传的附件', uploadTime: '2026-04-23 18:05:33' },
    { index: 2, fileName: 'b3d91f7a2c8e5d4b6a0f1c9e7d2b4a...', fileRemark: '公众号上传的附件', uploadTime: '2026-04-23 18:10:12' },
  ],
  3: [
    { index: 1, fileName: 'c7e24d8f1a3b6c9e0d5f2a4b8c1e3d...', fileRemark: '公众号上传的附件', uploadTime: '2026-03-07 14:22:08' },
  ],
  4: [
    { index: 1, fileName: 'f1a9c3e5d7b2f4a6c8e0d2b4a6c8e0...', fileRemark: '短链接上传的附件', uploadTime: '2026-03-07 10:15:44' },
  ],
  5: [],
};

export default function AttachmentQueryModal({
  isOpen,
  onClose,
}: AttachmentQueryModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [results, setResults] = useState<QueryRow[]>([]);
  const [queried, setQueried] = useState(false);
  const [detailRow, setDetailRow] = useState<QueryRow | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPhoneNumber('');
    setResults([]);
    setQueried(false);
    setDetailRow(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailRow) {
          setDetailRow(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, detailRow]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleQuery = () => {
    if (!phoneNumber.trim()) return;
    setResults(MOCK_RESULTS);
    setQueried(true);
  };

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
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuery(); }}
              placeholder="请输入号码"
              className="focus-ring h-[34px] w-[200px] rounded-lg border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
            />
          </label>
          <button
            type="button"
            onClick={handleQuery}
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
              {results.length > 0 ? (
                results.map((row) => (
                  <tr
                    key={row.index}
                    className="cursor-pointer border-b border-hairline transition-colors hover:bg-brand-50/50"
                    onDoubleClick={() => setDetailRow(row)}
                    title="双击查看附件详情"
                  >
                    <td className="w-[40px] px-2 py-2 text-slate-600">{row.index}</td>
                    <td className="w-[80px] px-2 py-2 text-brand-500 underline">{row.link}</td>
                    <td className="min-w-[100px] px-2 py-2 text-slate-700">{row.receiveNumber}</td>
                    <td className="min-w-[90px] px-2 py-2 text-slate-700">{row.senderName}</td>
                    <td className="min-w-[80px] px-2 py-2 text-slate-700">{row.domainAccount}</td>
                    <td className="min-w-[120px] px-2 py-2 text-slate-500">{row.sendTime}</td>
                    <td className="min-w-[80px] px-2 py-2 text-slate-700">{row.invalidStatus}</td>
                    <td className="min-w-[80px] px-2 py-2 text-slate-700">{row.uploadStatus}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length}
                    className="px-2 py-12 text-center text-[13px] text-slate-400"
                  >
                    {queried ? '未查询到相关数据' : '表格无数据...'}
                  </td>
                </tr>
              )}
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

      {/* 附件详情弹窗 */}
      {detailRow && (
        <AttachmentDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </div>,
    document.body
  );
}

function AttachmentDetailModal({
  row,
  onClose,
}: {
  row: QueryRow;
  onClose: () => void;
}) {
  const details = MOCK_DETAILS[row.index] ?? [];

  return (
    <div
      className="fixed inset-0 z-[140] flex items-start justify-center overflow-y-auto bg-slate-900/30 px-4 pb-8 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[720px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-orange-500 to-orange-400" />
            <h2 className="truncate text-[16px] font-bold tracking-tight text-slate-800">
              附件详情
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭附件详情弹窗"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </header>

        {/* Table */}
        <div className="min-h-[200px] overflow-x-auto px-6 py-4">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-orange-400">
                {DETAIL_COLUMNS.map((col) => (
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
              {details.length > 0 ? (
                details.map((d) => (
                  <tr
                    key={d.index}
                    className="border-b border-hairline transition-colors hover:bg-brand-50/50"
                  >
                    <td className="w-[40px] px-2 py-2 text-slate-600">{d.index}</td>
                    <td className="min-w-[240px] px-2 py-2 text-brand-500" title={d.fileName}>{d.fileName}</td>
                    <td className="min-w-[140px] px-2 py-2 text-slate-700">{d.fileRemark}</td>
                    <td className="min-w-[140px] px-2 py-2 text-slate-500">{d.uploadTime}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={DETAIL_COLUMNS.length}
                    className="px-2 py-12 text-center text-[13px] text-slate-400"
                  >
                    暂无附件数据
                  </td>
                </tr>
              )}
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
    </div>
  );
}
