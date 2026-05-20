import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, X } from 'lucide-react';

import { cn } from '../../lib/cn';

type BlacklistApplicationModalProps = {
  isOpen: boolean;
  defaultPhoneNumber?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const padDateTime = (value: number) => value.toString().padStart(2, '0');

const formatDateTimeLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = padDateTime(d.getMonth() + 1);
  const day = padDateTime(d.getDate());
  const h = padDateTime(d.getHours());
  const min = padDateTime(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
};

const createDefaults = (phone: string) => {
  const now = new Date();
  const later = new Date(now.getTime() + 2 * 60 * 1000);
  return {
    phoneNumber: phone,
    startTime: formatDateTimeLocal(now),
    endTime: formatDateTimeLocal(later),
    reason: '',
  };
};

const REASON_MAX = 500;

export default function BlacklistApplicationModal({
  isOpen,
  defaultPhoneNumber = '',
  onClose,
  onConfirm,
}: BlacklistApplicationModalProps) {
  const [values, setValues] = useState(() => createDefaults(defaultPhoneNumber));

  useEffect(() => {
    if (!isOpen) return;
    setValues(createDefaults(defaultPhoneNumber));
  }, [isOpen, defaultPhoneNumber]);

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
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blacklist-application-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-rose-500 to-rose-400" />
            <h2
              id="blacklist-application-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              黑名单申请
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭黑名单申请弹窗"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
          <Field label="黑名单号码" required>
            <div className="relative">
              <input
                type="text"
                value={values.phoneNumber}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                placeholder="请输入黑名单号码"
                className={cn(fieldInputClass, 'pr-9')}
              />
              {values.phoneNumber ? (
                <button
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({ ...prev, phoneNumber: '' }))
                  }
                  aria-label="清空号码"
                  className="focus-ring absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          </Field>

          <Field label="开始时间" required>
            <div className="relative">
              <input
                type="datetime-local"
                value={values.startTime}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, startTime: e.target.value }))
                }
                className={cn(fieldInputClass, 'pr-9')}
              />
              <CalendarDays
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          <Field label="结束时间" required>
            <div className="relative">
              <input
                type="datetime-local"
                value={values.endTime}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className={cn(fieldInputClass, 'pr-9')}
              />
              <CalendarDays
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          <Field label="原因" required alignStart>
            <div className="relative">
              <textarea
                value={values.reason}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    reason: e.target.value.slice(0, REASON_MAX),
                  }))
                }
                rows={4}
                placeholder="请输入原因"
                className="focus-ring w-full resize-none rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 tabular-nums text-[11px] text-slate-400">
                {values.reason.length} / {REASON_MAX}
              </span>
            </div>
          </Field>

          <div className="flex items-center justify-end gap-2 border-t border-hairline px-0 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-xl border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
            >
              取消
            </button>
            <button
              type="submit"
              className="focus-ring press-lift rounded-xl bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.5)]"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

const fieldInputClass =
  'focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white';

function Field({
  label,
  required,
  alignStart,
  children,
}: {
  label: string;
  required?: boolean;
  alignStart?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        'grid grid-cols-[80px_minmax(0,1fr)] gap-3',
        alignStart ? 'items-start' : 'items-center'
      )}
    >
      <span
        className={cn(
          'text-right text-[13px] font-medium text-slate-700',
          alignStart && 'pt-2'
        )}
      >
        {required ? <span className="mr-0.5 text-rose-500">*</span> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
