import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../lib/cn';
import SmsEmailTemplateModal from './SmsEmailTemplateModal';

type SmsSendModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type SmsFormValues = {
  phoneNumber: string;
  content: string;
};

const createDefaultFormValues = (): SmsFormValues => ({
  phoneNumber: '',
  content: '',
});

export default function SmsSendModal({ isOpen, onClose, onConfirm }: SmsSendModalProps) {
  const [formValues, setFormValues] = useState<SmsFormValues>(createDefaultFormValues);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormValues(createDefaultFormValues());
    setShowTemplateModal(false);
  }, [isOpen]);

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

  if (!isOpen) return null;

  const isSubmitDisabled = !formValues.phoneNumber.trim() || !formValues.content.trim();

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sms-send-modal-title"
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
              id="sms-send-modal-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              短信发送
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭短信发送弹窗"
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
          {/* 发送号码 */}
          <FormField label="发送号码" required>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formValues.phoneNumber}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, phoneNumber: event.target.value }))
                }
                placeholder="请输入手机号码"
                className={cn(fieldInputClass, 'flex-1')}
              />
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="focus-ring shrink-0 whitespace-nowrap rounded-xl border border-emerald-300 bg-white px-4 py-2 text-[13px] font-semibold text-emerald-600 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
              >
                短信模板
              </button>
            </div>
          </FormField>

          {/* 短信内容 */}
          <FormField label="短信内容" required alignStart>
            <textarea
              value={formValues.content}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, content: event.target.value }))
              }
              rows={5}
              placeholder="请输入短信内容"
              className="focus-ring w-full rounded-xl border border-hairline bg-slate-50/60 px-3 py-2.5 text-[13px] leading-5 text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
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
              发送
            </button>
          </div>
        </form>
      </div>

      {/* 短信/邮件模板弹窗 */}
      <SmsEmailTemplateModal
        isOpen={showTemplateModal}
        defaultTab="sms"
        onClose={() => setShowTemplateModal(false)}
        onConfirm={(content) => {
          setFormValues((prev) => ({ ...prev, content }));
          setShowTemplateModal(false);
        }}
      />
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
