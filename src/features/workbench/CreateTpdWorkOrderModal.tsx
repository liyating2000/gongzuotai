import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Upload, X } from 'lucide-react';

import { cn } from '../../lib/cn';

type CreateTpdWorkOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type PriorityOption = '普通' | '普通加急' | '紧急' | '重要';

const PRIORITY_OPTIONS: PriorityOption[] = ['普通', '普通加急', '紧急', '重要'];

const createDefaults = () => ({
  productModule: '',
  receiver: '',
  priority: '普通' as PriorityOption,
  frontlineAccount: '',
});

export default function CreateTpdWorkOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: CreateTpdWorkOrderModalProps) {
  const [values, setValues] = useState(createDefaults);

  useEffect(() => {
    if (!isOpen) return;
    setValues(createDefaults());
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

  const handleReset = () => {
    setValues(createDefaults());
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-tpd-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-400" />
            <h2
              id="create-tpd-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              创建TPD工单
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭创建TPD工单弹窗"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </header>

        {/* Form */}
        <form
          className="space-y-5 px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          {/* 产品模块 */}
          <Field label="产品模块" required>
            <SelectField
              value={values.productModule}
              placeholder="请选择"
              onChange={(v) => setValues((prev) => ({ ...prev, productModule: v }))}
            />
          </Field>

          {/* 接收人(域账号) */}
          <Field label="接收人(域账号)" required>
            <input
              type="text"
              value={values.receiver}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, receiver: e.target.value }))
              }
              placeholder="请输入域账号"
              className={fieldInputClass}
            />
          </Field>

          {/* 优先级 */}
          <Field label="优先级" required>
            <div className="flex items-center gap-4">
              {PRIORITY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-1.5"
                >
                  <span
                    className={cn(
                      'flex h-[16px] w-[16px] items-center justify-center rounded-full border-2 transition-colors',
                      values.priority === option
                        ? 'border-brand-500'
                        : 'border-slate-300'
                    )}
                  >
                    {values.priority === option ? (
                      <span className="h-[8px] w-[8px] rounded-full bg-brand-500" />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      'text-[13px]',
                      values.priority === option
                        ? 'font-semibold text-brand-600'
                        : 'text-slate-600'
                    )}
                  >
                    {option}
                  </span>
                  <input
                    type="radio"
                    name="tpd-priority"
                    value={option}
                    checked={values.priority === option}
                    onChange={() =>
                      setValues((prev) => ({ ...prev, priority: option }))
                    }
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </Field>

          {/* 一线人员域账号 */}
          <Field label="一线人员域账号">
            <input
              type="text"
              value={values.frontlineAccount}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, frontlineAccount: e.target.value }))
              }
              placeholder="请输入"
              className={fieldInputClass}
            />
          </Field>

          {/* 附件上传 */}
          <div className="flex justify-center py-2">
            <button
              type="button"
              className="focus-ring inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-500 transition-colors hover:text-brand-600"
            >
              附件上传
              <Upload size={14} strokeWidth={2.2} />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-hairline px-0 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="focus-ring rounded-xl border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
            >
              重置
            </button>
            <button
              type="submit"
              className="focus-ring press-lift rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(59,130,246,0.5)]"
            >
              提交
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ---------- reusable sub-components ---------- */

const fieldInputClass =
  'focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
      <span className="text-right text-[13px] font-medium text-slate-700">
        {required ? <span className="mr-0.5 text-rose-500">*</span> : null}
        {label}
      </span>
      {children}
    </div>
  );
}

function SelectField({
  value,
  placeholder,
  onChange: _onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          fieldInputClass,
          'flex cursor-pointer items-center justify-between',
          !value && 'text-slate-400'
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className="shrink-0 text-slate-400" />
      </div>
    </div>
  );
}
