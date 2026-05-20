import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, X } from 'lucide-react';

import { cn } from '../../lib/cn';

type CallScheduleFollowUpModalProps = {
  isOpen: boolean;
  /** Kept for API back-compat; no longer used after portal-based mounting. */
  leftOffset?: number;
  defaultPhoneNumber?: string;
  /** Optional header title override. Defaults to "预约回电". */
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
};

type CallbackTimeMode = 'immediate' | 'scheduled';
type AssigneeMode = 'me' | 'department';

type FollowUpFormValues = {
  phoneNumber: string;
  callbackTimeMode: CallbackTimeMode;
  callbackTime: string;
  assigneeMode: AssigneeMode;
  assignee: string;
  remark: string;
};

const assigneeOptions = ['冉鸥-系统组', '冉鸣-系统组', '客服支持组'] as const;

const padDateTime = (value: number) => value.toString().padStart(2, '0');

const createDefaultFormValues = (phoneNumber?: string): FollowUpFormValues => {
  const now = new Date();
  const year = now.getFullYear();
  const month = padDateTime(now.getMonth() + 1);
  const day = padDateTime(now.getDate());
  const hours = padDateTime(now.getHours());
  const minutes = padDateTime(now.getMinutes());
  const seconds = padDateTime(now.getSeconds());

  return {
    phoneNumber: phoneNumber ?? '',
    callbackTimeMode: 'immediate',
    callbackTime: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
    assigneeMode: 'department',
    assignee: assigneeOptions[0],
    remark: '',
  };
};

export default function CallScheduleFollowUpModal({
  isOpen,
  defaultPhoneNumber,
  title = '预约回电',
  onClose,
  onConfirm,
}: CallScheduleFollowUpModalProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [formValues, setFormValues] = useState<FollowUpFormValues>(() =>
    createDefaultFormValues(defaultPhoneNumber)
  );

  // Reset on every open.
  useEffect(() => {
    if (!isOpen) return;
    setFormValues(createDefaultFormValues(defaultPhoneNumber));
  }, [defaultPhoneNumber, isOpen]);

  // ESC to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isSubmitDisabled =
    !formValues.phoneNumber.trim() || !formValues.callbackTime.trim();

  // Portal to document.body so the fixed overlay escapes any ancestor
  // `transform` that would otherwise become its containing block.
  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-schedule-follow-up-title"
    >
      <div
        className="animate-fade-in-up w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-400" />
            <h2
              id="call-schedule-follow-up-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label={`关闭${title}弹窗`}
          >
            <X size={16} />
          </button>
        </header>

        {/* Form */}
        <form
          className="space-y-4 px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {/* 手机号码 */}
          <FormField label="手机号码" required>
            <input
              type="text"
              value={formValues.phoneNumber}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  phoneNumber: event.target.value,
                }))
              }
              placeholder="请输入手机号码"
              className={cn(fieldInputClass)}
            />
          </FormField>

          {/* 回拨时间 */}
          <FormField label="回拨时间" required alignStart={formValues.callbackTimeMode === 'scheduled'}>
            <div className="space-y-2">
              <SegmentedToggle
                value={formValues.callbackTimeMode}
                options={[
                  { value: 'immediate', label: '立即' },
                  { value: 'scheduled', label: '选择时间' },
                ]}
                onChange={(next) =>
                  setFormValues((prev) => ({
                    ...prev,
                    callbackTimeMode: next,
                    assigneeMode: next === 'immediate' ? 'department' : prev.assigneeMode,
                  }))
                }
              />
              {formValues.callbackTimeMode === 'scheduled' ? (
                <div className="relative">
                  <input
                    ref={dateInputRef}
                    type="datetime-local"
                    step={1}
                    value={formValues.callbackTime}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        callbackTime: event.target.value,
                      }))
                    }
                    className={cn(fieldInputClass, 'pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker?.()}
                    className="focus-ring absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    aria-label="选择回拨时间"
                  >
                    <CalendarDays size={15} />
                  </button>
                </div>
              ) : null}
            </div>
          </FormField>

          {/* 回电人 */}
          <FormField label="回电人" required alignStart={formValues.assigneeMode === 'department'}>
            <div className="space-y-2">
              {formValues.callbackTimeMode === 'immediate' ? null : (
                <SegmentedToggle
                  value={formValues.assigneeMode}
                  options={[
                    { value: 'me', label: '我' },
                    { value: 'department', label: '部门' },
                  ]}
                  onChange={(next) =>
                    setFormValues((prev) => ({
                      ...prev,
                      assigneeMode: next,
                    }))
                  }
                />
              )}
              {formValues.assigneeMode === 'department' ? (
                <div className="relative">
                  <select
                    value={formValues.assignee}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        assignee: event.target.value,
                      }))
                    }
                    className={cn(fieldInputClass, 'appearance-none pr-10')}
                  >
                    {assigneeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              ) : null}
            </div>
          </FormField>

          {/* 备注 */}
          <FormField label="备注" alignStart>
            <textarea
              value={formValues.remark}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  remark: event.target.value,
                }))
              }
              rows={3}
              placeholder="请输入备注信息"
              className={cn(
                'focus-ring w-full rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white'
              )}
            />
          </FormField>

          {/* Footer */}
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
              disabled={isSubmitDisabled}
              className={cn(
                'focus-ring press-lift rounded-xl px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)] transition-opacity',
                isSubmitDisabled
                  ? 'cursor-not-allowed bg-gradient-to-r from-slate-300 to-slate-300 opacity-70'
                  : 'bg-gradient-to-r from-brand-500 to-brand-400'
              )}
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

function FormField({
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

function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string; disabled?: boolean }>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-hairline bg-slate-50/60 p-0.5">
      {options.map((option) => {
        const isActive = option.value === value;
        const isDisabled = option.disabled;
        return (
          <button
            key={option.value}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return;
              onChange(option.value);
            }}
            aria-pressed={isActive}
            className={cn(
              'focus-ring rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
              isActive
                ? 'bg-white text-brand-600 shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                : isDisabled
                ? 'cursor-not-allowed text-slate-300'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
