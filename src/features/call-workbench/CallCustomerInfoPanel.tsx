import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { FilePlus2, Search } from 'lucide-react';

type CallCustomerInfoPanelProps = {
  linkedNotice: string | null;
  fieldsContent: ReactNode;
  onReset: () => void;
  onAddNew?: () => void;
  onQueryByPhone?: (phone: string) => void;
  height?: number;
};

export default function CallCustomerInfoPanel({
  linkedNotice,
  fieldsContent,
  onReset,
  onAddNew,
  onQueryByPhone,
  height,
}: CallCustomerInfoPanelProps) {
  const [phoneQuery, setPhoneQuery] = useState('');
  const triggerQuery = () => {
    const trimmed = phoneQuery.trim();
    if (!trimmed) return;
    onQueryByPhone?.(trimmed);
  };
  const handlePhoneKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      triggerQuery();
    }
  };
  return (
    <section
      className="surface-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden xl:flex-none"
      style={height === undefined ? undefined : { height: `${height}px` }}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">

          <h2 className="text-[15px] font-bold text-slate-800">客户信息</h2>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          <input
            type="text"
            value={phoneQuery}
            onChange={(event) => setPhoneQuery(event.target.value)}
            onKeyDown={handlePhoneKeyDown}
            onBlur={triggerQuery}
            placeholder="输入手机号查询"
            className="focus-ring h-[30px] min-w-[112px] max-w-[150px] flex-1 rounded-full border border-hairline bg-surface-muted px-3 text-[12px] tabular-nums text-slate-600 outline-none transition-colors placeholder:text-slate-400 hover:border-brand-200"
          />
          <button
            type="button"
            aria-label="按手机号查询客户信息"
            title="按手机号查询客户信息"
            onClick={triggerQuery}
            className="focus-ring flex h-[30px] w-[30px] items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
          >
            <Search size={14} />
          </button>
          {onAddNew ? (
            <button
              type="button"
              aria-label="新增客户"
              title="新增客户"
              onClick={onAddNew}
              className="focus-ring flex h-[30px] w-[30px] items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
            >
              <FilePlus2 size={14} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
        {linkedNotice ? (
          <div className="mb-4 rounded-[12px] border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-[12px] font-medium leading-6 text-slate-700">
            {linkedNotice}
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-3">
          {fieldsContent}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-hairline bg-slate-50/40 px-4 py-3">
        <button
          type="button"
          className="focus-ring press-lift rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-1.5 text-[12px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onReset}
          className="focus-ring press-lift rounded-full border border-hairline bg-white px-6 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600"
        >
          重置
        </button>
      </div>
    </section>
  );
}
