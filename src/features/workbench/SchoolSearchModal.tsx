import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';

import { cn } from '../../lib/cn';

export type SchoolRecord = {
  name: string;
  address: string;
  label: string;
  serviceGroup: string;
  auditStatus: string;
  province: string;
  city: string;
  district: string;
};

type SchoolSearchModalProps = {
  isOpen: boolean;
  keyword: string;
  schools: ReadonlyArray<SchoolRecord>;
  onClose: () => void;
  onSelect: (school: SchoolRecord) => void;
};

export default function SchoolSearchModal({
  isOpen,
  keyword: initialKeyword,
  schools,
  onClose,
  onSelect,
}: SchoolSearchModalProps) {
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    if (!isOpen) return;
    setKeyword(initialKeyword);
  }, [isOpen, initialKeyword]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    const trimmed = keyword.trim();
    if (!trimmed) return schools;
    return schools.filter(
      (school) =>
        school.name.includes(trimmed) || school.address.includes(trimmed)
    );
  }, [schools, keyword]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-search-title"
    >
      <div
        className="animate-fade-in-up w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-400" />
            <h2
              id="school-search-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              学校查询
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭学校查询弹窗"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-6 pt-5">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="输入关键字搜索学校"
              className="focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 hover:border-brand-200 focus:border-brand-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="px-6 pb-5 pt-3">
          <div className="text-[12px] text-slate-400">双击选中一行可自动带入</div>
          <div className="mt-2 max-h-[320px] overflow-auto rounded-xl border border-hairline custom-scrollbar">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/80 text-[12px] font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-2">学校名称</th>
                  <th className="px-4 py-2">地址</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-[12px] text-slate-400">
                      暂无匹配的学校
                    </td>
                  </tr>
                ) : (
                  filtered.map((school, index) => (
                    <tr
                      key={`${school.name}-${school.address}-${index}`}
                      onDoubleClick={() => {
                        onSelect(school);
                        onClose();
                      }}
                      className={cn(
                        'cursor-pointer border-t border-hairline transition-colors hover:bg-brand-50/40',
                        index === 0 && 'border-t-0'
                      )}
                    >
                      <td className="px-4 py-2">{school.name}</td>
                      <td className="px-4 py-2">{school.address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
