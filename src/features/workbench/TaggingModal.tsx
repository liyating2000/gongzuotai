import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Plus, PlusSquare, X } from 'lucide-react';

import { cn } from '../../lib/cn';

type Tag = {
  label: string;
  cls: string;
};

type TabType = 'system' | 'custom';

type TaggingModalProps = {
  isOpen: boolean;
  tags: Tag[];
  onClose: () => void;
  onRemoveTag: (label: string) => void;
  onAddTag: (label: string) => void;
};

const systemTags = [
  'VIP',
  '高价值客户',
  '潜在客户',
  '已签约',
  '待跟进',
  '投诉客户',
  '重点关注',
  '合作伙伴',
];

const tagChipClass =
  'inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[13px] font-medium text-rose-500';

export default function TaggingModal({
  isOpen,
  tags,
  onClose,
  onRemoveTag,
  onAddTag,
}: TaggingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('system');
    setIsCreating(false);
    setNewTagName('');
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

  const appliedLabels = new Set(tags.map((t) => t.label));

  const handleCreateCustomTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (!customTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed]);
    }
    setNewTagName('');
    setIsCreating(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tagging-modal-title"
    >
      <div
        className="animate-fade-in-up flex w-full max-w-[560px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5">
          <h2
            id="tagging-modal-title"
            className="text-[18px] font-bold tracking-tight text-slate-800"
          >
            打标签
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭打标签弹窗"
          >
            <X size={18} />
          </button>
        </header>

        {/* Applied tags */}
        <div className="min-h-[56px] border-b border-hairline px-6 pb-4">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag.label} className={tagChipClass}>
                  {tag.label}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag.label)}
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
                    aria-label={`移除标签 ${tag.label}`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-slate-400">暂未添加标签</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-hairline px-6">
          <TabButton
            active={activeTab === 'system'}
            onClick={() => setActiveTab('system')}
          >
            系统标签
          </TabButton>
          <TabButton
            active={activeTab === 'custom'}
            onClick={() => setActiveTab('custom')}
          >
            自定义标签
          </TabButton>
        </div>

        {/* Content */}
        <div className="min-h-[240px] px-6 py-4">
          {activeTab === 'system' ? (
            <div className="flex flex-wrap gap-2">
              {systemTags.map((label) => {
                const isApplied = appliedLabels.has(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onDoubleClick={() => {
                      if (!isApplied) onAddTag(label);
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                      isApplied
                        ? 'border-rose-200 bg-rose-50 text-rose-500'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
                >
                  <PlusSquare size={15} />
                  新建
                </button>
              </div>

              {isCreating && (
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateCustomTag();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewTagName('');
                      }
                    }}
                    placeholder="输入标签名称"
                    autoFocus
                    className="focus-ring h-[34px] w-48 rounded-lg border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomTag}
                    disabled={!newTagName.trim()}
                    className={cn(
                      'focus-ring rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition-opacity',
                      newTagName.trim()
                        ? 'bg-brand-500 hover:bg-brand-600'
                        : 'cursor-not-allowed bg-slate-300'
                    )}
                  >
                    确定
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewTagName('');
                    }}
                    className="text-[12px] font-medium text-slate-500 hover:text-slate-700"
                  >
                    取消
                  </button>
                </div>
              )}

              {customTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((label) => {
                    const isApplied = appliedLabels.has(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onDoubleClick={() => {
                          if (!isApplied) onAddTag(label);
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                          isApplied
                            ? 'border-rose-200 bg-rose-50 text-rose-500'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600'
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : !isCreating ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FileText size={48} strokeWidth={1} className="mb-3 text-slate-300" />
                  <span className="text-[13px]">暂无数据</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-hairline px-6 py-4">
          <span className="text-[13px] text-slate-400">双击标签进行打标</span>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-xl border border-hairline bg-white px-6 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
          >
            关闭
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative pb-3 pt-3 text-[14px] font-medium transition-colors',
        active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-brand-600" />
      )}
    </button>
  );
}
