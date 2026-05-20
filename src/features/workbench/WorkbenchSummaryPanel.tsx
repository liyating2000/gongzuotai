import { type ReactNode, useState } from 'react';

import { cn } from '../../lib/cn';

type WorkbenchSummaryPanelVariant = 'call' | 'online';

type TicketTemplateOption = {
  label: string;
  content: string;
};

type WorkbenchSummaryPanelProps = {
  variant: WorkbenchSummaryPanelVariant;
  title?: string;
  tabs: readonly string[];
  activeTab: string;
  onTabSelect: (tab: string) => void;
  onAddTab?: () => void;
  onRemoveTab?: (tab: string) => void;
  fieldsContent: ReactNode;
  descriptionValue: string;
  onDescriptionChange: (value: string) => void;
  actions: ReactNode;
  ticketTemplateOptions?: TicketTemplateOption[];
};

const variantClassMap: Record<
  WorkbenchSummaryPanelVariant,
  {
    section: string;
    activeTab: string;
    fieldGrid: string;
    descriptionWrapper: string;
    descriptionLabel: string;
    descriptionTextarea: string;
  }
> = {
  call: {
    section:
      'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
    activeTab: 'border-emerald-200 bg-emerald-50 text-emerald-500',
    fieldGrid: 'grid grid-cols-1 gap-3 md:grid-cols-3',
    descriptionWrapper: 'space-y-1.5',
    descriptionLabel: 'text-[12px] font-medium text-slate-600',
    descriptionTextarea:
      'h-[68px] w-full resize-y rounded-md border border-slate-200 bg-[#fcfcfd] px-3 py-2 text-[12px] text-red-500 outline-none',
  },
  online: {
    section:
      'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
    activeTab: 'border-[#7ee0d3] bg-[#f1fdfa] text-emerald-500',
    fieldGrid: 'grid grid-cols-3 gap-x-3 gap-y-2.5',
    descriptionWrapper: 'space-y-1.5 md:col-span-3',
    descriptionLabel: 'text-[11px] font-medium text-slate-600',
    descriptionTextarea:
      'h-[76px] w-full resize-none rounded-md border border-slate-200 bg-[#fcfcfd] px-3 py-2 text-[12px] text-red-500 outline-none',
  },
};

export default function WorkbenchSummaryPanel({
  variant,
  title = '会话小结',
  tabs,
  activeTab,
  onTabSelect,
  onAddTab,
  onRemoveTab,
  fieldsContent,
  descriptionValue,
  onDescriptionChange,
  actions,
  ticketTemplateOptions,
}: WorkbenchSummaryPanelProps) {
  const classes = variantClassMap[variant];
  const descriptionLabel = variant === 'online' ? '会话总结' : '来电描述';
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value && ticketTemplateOptions) {
      const template = ticketTemplateOptions.find((t) => t.label === value);
      if (template) {
        onDescriptionChange(template.content);
      }
    }
  };

  return (
    <section className={classes.section}>
      <div className="shrink-0 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabSelect(tab)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-[12px] transition-colors',
                  activeTab === tab
                    ? classes.activeTab
                    : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                )}
              >
                {tab}
              </button>
            ))}
            {onAddTab ? (
              <button
                type="button"
                onClick={onAddTab}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[12px] text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600"
              >
                +
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          <div className={classes.fieldGrid}>
            {fieldsContent}
            {ticketTemplateOptions && ticketTemplateOptions.length > 0 ? (
              <div className="space-y-1.5">
                <div className={classes.descriptionLabel}>建单模板</div>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="h-[28px] w-full rounded-md border border-slate-200 bg-[#fcfcfd] px-2 text-[12px] text-slate-500 outline-none"
                >
                  <option value="">请选择</option>
                  {ticketTemplateOptions.map((t) => (
                    <option key={t.label} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className={classes.descriptionWrapper}>
              <div className={classes.descriptionLabel}>{descriptionLabel}</div>
              <textarea
                value={descriptionValue}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="请输入"
                className={classes.descriptionTextarea}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">{actions}</div>
        </div>
      </div>
    </section>
  );
}
