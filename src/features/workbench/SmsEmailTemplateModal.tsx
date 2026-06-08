import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, FolderOpen, Folder, FileText, Search, List, X } from 'lucide-react';

import { cn } from '../../lib/cn';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type TemplateNode = {
  id: string;
  label: string;
  content?: string;               // leaf — template body (plain text for SMS, HTML for email)
  children?: TemplateNode[];      // branch — folder
};

const templateTree: TemplateNode[] = [
  {
    id: 'email',
    label: '邮件',
    children: [
      {
        id: 'email-welcome',
        label: '欢迎邮件',
        content: `<div style="font-family:Arial,sans-serif;color:#334155;">
  <p>尊敬的用户您好，</p>
  <p>欢迎使用我们的服务！如有任何问题，请随时联系客服团队。</p>
  <p style="margin-top:16px;">祝好，<br/><strong>客服中心</strong></p>
</div>`,
      },
      {
        id: 'email-order',
        label: '订单确认',
        content: `<div style="font-family:Arial,sans-serif;color:#334155;">
  <h3 style="color:#0f172a;">订单确认通知</h3>
  <p>您的订单已确认，详情如下：</p>
  <table style="border-collapse:collapse;width:100%;margin:12px 0;">
    <tr style="background:#f1f5f9;">
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">订单编号</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;">ORD-20260608-001</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">商品名称</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;">学习机 T10 旗舰版</td>
    </tr>
    <tr style="background:#f1f5f9;">
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">预计发货</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;">3-5 个工作日</td>
    </tr>
  </table>
  <p>请耐心等待，如有疑问请联系客服。</p>
</div>`,
      },
      {
        id: 'email-aftermarket',
        label: '售后回复',
        content: `<div style="font-family:Arial,sans-serif;color:#334155;">
  <p>尊敬的用户，</p>
  <p>您提交的售后申请已受理，我们将在 <strong>1 个工作日</strong>内为您处理。</p>
  <ul style="margin:12px 0;padding-left:20px;">
    <li>工单状态：<span style="color:#059669;font-weight:600;">处理中</span></li>
    <li>处理部门：售后服务中心</li>
  </ul>
  <p>感谢您的耐心等待。</p>
</div>`,
      },
    ],
  },
  {
    id: 'sms',
    label: '短信',
    children: [
      {
        id: 'sms-folder-1',
        label: '二级目录',
        children: [
          {
            id: 'sms-promo',
            label: '促销通知',
            content: '【学习机】618年中大促火热进行中！${TEXT}全系列限时直降${TEXT}元，详情咨询客服。',
          },
        ],
      },
      {
        id: 'sms-verify',
        label: '验证码',
        content: '您的验证码为：${AGENTID}',
      },
      {
        id: 'sms-111',
        label: '111',
        content: '【学习机】尊敬的用户，您的售后工单已受理，预计${TEXT}个工作日内处理完成，请耐心等待。',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TEXT_PLACEHOLDER = /\$\{TEXT\}/g;

const countTextPlaceholders = (s: string): number => {
  const matches = s.match(TEXT_PLACEHOLDER);
  return matches ? matches.length : 0;
};

const collectFolderIds = (nodes: TemplateNode[], tab: 'sms' | 'email'): string[] => {
  const ids: string[] = [];
  const walk = (list: TemplateNode[]) => {
    for (const n of list) {
      if (n.children) {
        ids.push(n.id);
        walk(n.children);
      }
    }
  };
  const root = nodes.find((n) => n.id === tab);
  if (root?.children) {
    ids.push(root.id);
    walk(root.children);
  }
  return ids;
};

/** Check whether a node id belongs to the email branch */
const isEmailTemplate = (id: string): boolean => {
  const walk = (nodes: TemplateNode[]): boolean =>
    nodes.some((n) => n.id === id || (n.children ? walk(n.children) : false));
  const emailRoot = templateTree.find((n) => n.id === 'email');
  return emailRoot?.children ? walk(emailRoot.children) : false;
};

const findNodeContent = (nodes: TemplateNode[], id: string): string => {
  for (const n of nodes) {
    if (n.id === id && n.content) return n.content;
    if (n.children) {
      const found = findNodeContent(n.children, id);
      if (found) return found;
    }
  }
  return '';
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type SmsEmailTemplateModalProps = {
  isOpen: boolean;
  defaultTab?: 'sms' | 'email';
  onClose: () => void;
  onConfirm: (content: string) => void;
};

export default function SmsEmailTemplateModal({
  isOpen,
  defaultTab = 'sms',
  onClose,
  onConfirm,
}: SmsEmailTemplateModalProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [textInputs, setTextInputs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setExpandedIds(new Set(collectFolderIds(templateTree, defaultTab)));
    setSelectedId(null);
    setSearchText('');
    setTextInputs([]);
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rawContent = selectedId ? findNodeContent(templateTree, selectedId) : '';
  const isEmail = selectedId ? isEmailTemplate(selectedId) : false;
  const placeholderCount = !isEmail && rawContent ? countTextPlaceholders(rawContent) : 0;

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
    const content = findNodeContent(templateTree, id);
    if (isEmailTemplate(id)) {
      // Email: no custom text inputs
      setTextInputs([]);
    } else {
      const count = countTextPlaceholders(content);
      setTextInputs(new Array(count).fill(''));
    }
  };

  const updateTextInput = (index: number, value: string) =>
    setTextInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  /* Confirm logic */
  const hasUnfilled = placeholderCount > 0 && textInputs.some((v) => !v.trim());
  const canConfirm = !!rawContent && !hasUnfilled;

  const handleConfirm = () => {
    if (isEmail) {
      // Email: return HTML as-is
      onConfirm(rawContent);
    } else {
      // SMS: replace ${TEXT} placeholders
      let i = 0;
      const final = rawContent.replace(TEXT_PLACEHOLDER, () => textInputs[i++]?.trim() || '');
      onConfirm(final);
    }
  };

  /* Filtered tree */
  const filterTree = (nodes: TemplateNode[]): TemplateNode[] => {
    if (!searchText.trim()) return nodes;
    const kw = searchText.trim().toLowerCase();
    const filter = (list: TemplateNode[]): TemplateNode[] =>
      list
        .map((n) => {
          if (n.children) {
            const filtered = filter(n.children);
            return filtered.length > 0 ? { ...n, children: filtered } : null;
          }
          return n.label.toLowerCase().includes(kw) ? n : null;
        })
        .filter(Boolean) as TemplateNode[];
    return filter(nodes);
  };

  const visibleTree = filterTree(templateTree);

  const renderNode = (node: TemplateNode, depth: number) => {
    const isFolder = !!node.children;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => {
            if (isFolder) toggleExpand(node.id);
            else handleSelectNode(node.id);
          }}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors',
            isSelected
              ? 'bg-emerald-100/80 text-emerald-700 font-medium'
              : 'text-slate-700 hover:bg-slate-100'
          )}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {isFolder ? (
            isExpanded ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-400" />
          ) : (
            <span className="w-[14px]" />
          )}
          {isFolder ? (
            isExpanded ? <FolderOpen size={15} className="shrink-0 text-amber-500" /> : <Folder size={15} className="shrink-0 text-amber-500" />
          ) : (
            <FileText size={15} className="shrink-0 text-emerald-500" />
          )}
          <span className="truncate">{node.label}</span>
        </button>
        {isFolder && isExpanded && node.children
          ? node.children
              .filter((child) => {
                const vis = visibleTree;
                const isInTree = (list: TemplateNode[], id: string): boolean =>
                  list.some((n) => n.id === id || (n.children && isInTree(n.children, id)));
                return isInTree(vis, child.id);
              })
              .map((child) => renderNode(child, depth + 1))
          : null}
      </div>
    );
  };

  /** SMS preview: highlight replaced values */
  const renderSmsPreview = () => {
    const parts = rawContent.split(TEXT_PLACEHOLDER);
    const elements: React.ReactNode[] = [];
    parts.forEach((part, i) => {
      elements.push(<span key={`t-${i}`}>{part}</span>);
      if (i < parts.length - 1) {
        const val = textInputs[i]?.trim();
        elements.push(
          val ? (
            <span key={`v-${i}`} className="font-semibold text-brand-600">{val}</span>
          ) : (
            <span key={`v-${i}`} className="rounded bg-amber-100 px-1 text-amber-600">{'${TEXT}'}</span>
          )
        );
      }
    });
    return <>{elements}</>;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[8vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-fade-in-up flex w-full max-w-[780px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        style={{ maxHeight: '78vh' }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-400" />
            <h2 className="truncate text-[16px] font-bold tracking-tight text-slate-800">
              短信/邮件模板
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭模板弹窗"
          >
            <X size={16} />
          </button>
        </header>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left tree */}
          <div className="flex w-[260px] shrink-0 flex-col border-r border-hairline">
            <div className="flex items-center gap-1.5 border-b border-hairline px-3 py-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  placeholder="搜索"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-[32px] w-full rounded-lg border border-slate-200 bg-[#fcfcfd] pl-8 pr-3 text-[12px] text-slate-600 placeholder:text-slate-400 outline-none focus:border-brand-400"
                />
              </div>
              <button type="button" className="flex h-[32px] w-[32px] items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                <List size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {visibleTree.map((node) => renderNode(node, 0))}
            </div>
          </div>

          {/* Right: preview + (SMS-only) text inputs */}
          <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
            {/* Preview */}
            <div className="flex-1 p-4">
              <div className="min-h-[200px] rounded-xl border border-hairline bg-slate-50/40 p-4 text-[13px] leading-6 text-slate-700">
                {!rawContent ? (
                  <span className="text-slate-400">请在左侧选择模板</span>
                ) : isEmail ? (
                  /* Email: render HTML */
                  <div dangerouslySetInnerHTML={{ __html: rawContent }} />
                ) : (
                  /* SMS: render with placeholder highlighting */
                  renderSmsPreview()
                )}
              </div>
            </div>

            {/* ${TEXT} input fields — SMS only */}
            {!isEmail && placeholderCount > 0 ? (
              <div className="space-y-3 border-t border-hairline px-4 py-4">
                <div className="text-[12px] font-semibold text-slate-500">自定义文本</div>
                {textInputs.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-[80px] shrink-0 text-right text-[13px] font-medium text-slate-600">
                      <span className="mr-0.5 text-rose-500">*</span>
                      {placeholderCount === 1 ? '自定义文本' : `文本 ${i + 1}`}
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateTextInput(i, e.target.value)}
                      placeholder={`请输入第 ${i + 1} 处自定义内容`}
                      className="focus-ring h-[36px] flex-1 rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-xl border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={cn(
              'focus-ring press-lift rounded-xl px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)] transition-opacity',
              !canConfirm
                ? 'cursor-not-allowed bg-gradient-to-r from-slate-300 to-slate-300 opacity-70'
                : 'bg-gradient-to-r from-brand-500 to-brand-400'
            )}
          >
            确定
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
