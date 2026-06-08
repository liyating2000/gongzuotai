import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronDown,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  List,
  ListOrdered,
  Upload,
  Server,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import SmsEmailTemplateModal from './SmsEmailTemplateModal';

/* ------------------------------------------------------------------ */
/*  Types & defaults                                                   */
/* ------------------------------------------------------------------ */

type EmailSendModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type SendMode = 'immediate' | 'scheduled';

type EmailFormValues = {
  sender: string;
  sendMode: SendMode;
  showBcc: boolean;
  recipient: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  isHtmlBody: boolean;
};

const senderOptions = [
  'service@learning.com',
  'support@learning.com',
  'noreply@learning.com',
];

const createDefaultFormValues = (): EmailFormValues => ({
  sender: senderOptions[0],
  sendMode: 'immediate',
  showBcc: false,
  recipient: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  isHtmlBody: false,
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EmailSendModal({ isOpen, onClose, onConfirm }: EmailSendModalProps) {
  const [formValues, setFormValues] = useState<EmailFormValues>(createDefaultFormValues);
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

  const isSubmitDisabled = !formValues.recipient.trim() || !formValues.subject.trim();

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[6vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-send-modal-title"
    >
      <div
        className="animate-fade-in-up w-full max-w-[720px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-400" />
            <h2
              id="email-send-modal-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              邮件发送
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭邮件发送弹窗"
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
          {/* Row 1: 发件人 + 发送方式 + 添加密送 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-medium text-slate-700">
                <span className="mr-0.5 text-rose-500">*</span>发件人
              </span>
              <div className="relative">
                <select
                  value={formValues.sender}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, sender: e.target.value }))
                  }
                  className={cn(fieldInputClass, 'w-[220px] appearance-none pr-8')}
                >
                  {senderOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-medium text-slate-700">发送方式</span>
              <div className="inline-flex items-center rounded-xl border border-hairline bg-slate-50/60 p-0.5">
                {([
                  { value: 'immediate' as const, label: '立即发送' },
                  { value: 'scheduled' as const, label: '定时发送' },
                ]).map((option) => {
                  const isActive = formValues.sendMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormValues((prev) => ({ ...prev, sendMode: option.value }))
                      }
                      aria-pressed={isActive}
                      className={cn(
                        'focus-ring rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                        isActive
                          ? 'bg-white text-brand-600 shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                          : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormValues((prev) => ({ ...prev, showBcc: !prev.showBcc }))
              }
              className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
            >
              + 添加密送
            </button>
          </div>

          {/* Row 2: 收件人 + 抄送人 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-medium text-slate-700">
                <span className="mr-0.5 text-rose-500">*</span>收件人
              </span>
              <input
                type="text"
                value={formValues.recipient}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, recipient: e.target.value }))
                }
                placeholder=""
                className={cn(fieldInputClass, 'flex-1')}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-medium text-slate-700">抄送人</span>
              <input
                type="text"
                value={formValues.cc}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, cc: e.target.value }))
                }
                placeholder=""
                className={cn(fieldInputClass, 'flex-1')}
              />
            </div>
          </div>

          {/* 密送人（可选） */}
          {formValues.showBcc ? (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] font-medium text-slate-700">密送人</span>
              <input
                type="text"
                value={formValues.bcc}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, bcc: e.target.value }))
                }
                className={cn(fieldInputClass, 'flex-1')}
              />
            </div>
          ) : null}

          {/* Row 3: 邮件主题 + 邮件模板 + 清空 */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[13px] font-medium text-slate-700">
              <span className="mr-0.5 text-rose-500">*</span>邮件主题
            </span>
            <input
              type="text"
              value={formValues.subject}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="请输入邮件主题"
              className={cn(fieldInputClass, 'flex-1')}
            />
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="focus-ring shrink-0 whitespace-nowrap rounded-xl bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              邮件模板
            </button>
            <button
              type="button"
              onClick={() =>
                setFormValues((prev) => ({ ...prev, subject: '', body: '', isHtmlBody: false }))
              }
              className="focus-ring shrink-0 whitespace-nowrap rounded-xl border border-hairline bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              清空
            </button>
          </div>

          {/* Rich text area (simplified toolbar + content) */}
          <div className="overflow-hidden rounded-xl border border-hairline">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 border-b border-hairline bg-slate-50/60 px-2 py-1.5">
              <ToolbarSelect label="段落" />
              <ToolbarDivider />
              <ToolbarSelect label="A" />
              <ToolbarDivider />
              <ToolbarButton icon={Bold} />
              <ToolbarButton icon={Italic} />
              <ToolbarButton icon={Strikethrough} />
              <ToolbarButton icon={Underline} />
              <ToolbarDivider />
              <ToolbarButton icon={List} />
              <ToolbarButton icon={ListOrdered} />
            </div>
            {/* Body */}
            {formValues.isHtmlBody ? (
              <div
                className="min-h-[200px] w-full bg-white px-4 py-3 text-[13px] leading-6 text-slate-700"
                dangerouslySetInnerHTML={{ __html: formValues.body }}
              />
            ) : (
              <textarea
                value={formValues.body}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, body: e.target.value }))
                }
                rows={8}
                placeholder="请输入邮件正文"
                className="w-full resize-none bg-white px-4 py-3 text-[13px] leading-6 text-slate-700 placeholder:text-slate-400 outline-none"
              />
            )}
          </div>

          {/* 附件列表 */}
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">附件列表：</span>
              <button type="button" className="font-semibold text-brand-600 hover:text-brand-700">
                更多
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600"
              >
                <Upload size={14} />
                <span>本地附件</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600"
              >
                <Server size={14} />
                <span>服务器附件</span>
              </button>
            </div>
          </div>

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

      {/* 邮件模板弹窗 */}
      <SmsEmailTemplateModal
        isOpen={showTemplateModal}
        defaultTab="email"
        onClose={() => setShowTemplateModal(false)}
        onConfirm={(content) => {
          setFormValues((prev) => ({ ...prev, body: content, isHtmlBody: true }));
          setShowTemplateModal(false);
        }}
      />
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Shared styles & sub-components                                     */
/* ------------------------------------------------------------------ */

const fieldInputClass =
  'focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white';

function ToolbarButton({ icon: Icon }: { icon: typeof Bold }) {
  return (
    <button
      type="button"
      className="flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

function ToolbarSelect({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-7 items-center gap-1 rounded px-2 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-200/70"
    >
      {label}
      <ChevronDown size={12} className="text-slate-400" />
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px bg-slate-200" />;
}
