import { Calendar } from 'lucide-react';

import { cn } from '../../lib/cn';

export type HistoryDateRangeValue = {
  startDate: string;
  endDate: string;
};

type HistoryDateRangeFilterProps = {
  startDate: string;
  endDate: string;
  isOpen?: boolean;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  onClick?: () => void;
  className?: string;
};

type HistoryDateRangeMenuProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
};

const formatHistoryDateValue = (value: string, placeholder: string) =>
  value ? value.replace(/-/g, '.') : placeholder;

export function HistoryDateRangeFilter({
  startDate,
  endDate,
  isOpen = false,
  buttonRef,
  onClick,
  className,
}: HistoryDateRangeFilterProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="选择时间范围"
      aria-expanded={isOpen}
      onClick={onClick}
      className={cn(
        'flex h-8 min-w-[230px] items-center rounded-md border border-slate-200 bg-[#fcfcfd] px-2.5 text-left transition-colors hover:border-slate-300',
        isOpen && 'border-[#7fd8ca]',
        className
      )}
    >
      <span className={cn('min-w-0 flex-1 truncate text-[12px]', startDate ? 'text-slate-600' : 'text-slate-300')}>
        {formatHistoryDateValue(startDate, '开始日期')}
      </span>
      <span className="px-2 text-[12px] text-slate-300">-</span>
      <span className={cn('min-w-0 flex-1 truncate text-[12px]', endDate ? 'text-slate-600' : 'text-slate-300')}>
        {formatHistoryDateValue(endDate, '结束日期')}
      </span>
      <Calendar size={14} className="ml-2 shrink-0 text-slate-300" />
    </button>
  );
}

export function HistoryDateRangeMenu({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: HistoryDateRangeMenuProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
      <div className="space-y-3">
        <label className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 text-[12px] text-slate-500">
          <span>开始日期</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="h-8 min-w-0 rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-600 outline-none"
          />
        </label>
        <label className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 text-[12px] text-slate-500">
          <span>结束日期</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="h-8 min-w-0 rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-600 outline-none"
          />
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-500 transition-colors hover:bg-slate-50"
        >
          清空
        </button>
      </div>
    </div>
  );
}
