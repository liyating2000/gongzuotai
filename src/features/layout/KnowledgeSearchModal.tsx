import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';

import { cn } from '../../lib/cn';

/* ------------------------------------------------------------------ */
/*  Mock knowledge base data                                          */
/* ------------------------------------------------------------------ */

type KnowledgeCategory = {
  id: string;
  label: string;
  icon: typeof BookOpen;
  accent: string;
  bg: string;
};

type KnowledgeArticle = {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  updatedAt: string;
  tags: string[];
};

const categories: KnowledgeCategory[] = [
  { id: 'product', label: '产品知识', icon: BookOpen, accent: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'process', label: '流程标准', icon: FileText, accent: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'script', label: '质检话术', icon: MessageSquare, accent: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'faq', label: '业务FAQ', icon: HelpCircle, accent: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const articles: KnowledgeArticle[] = [
  {
    id: 'a-1',
    categoryId: 'product',
    title: '客户管理模块功能说明',
    summary: '介绍客户管理模块的核心功能，包括客户资料维护、画像标签、联系历史记录等操作指南。',
    updatedAt: '2026-06-03',
    tags: ['客户管理', '产品说明'],
  },
  {
    id: 'a-2',
    categoryId: 'product',
    title: '知识库协同功能介绍',
    summary: '知识库与坐席端的联动机制说明，包括智能推荐、关联推送、知识卡片展示等。',
    updatedAt: '2026-06-01',
    tags: ['知识库', '协同'],
  },
  {
    id: 'a-3',
    categoryId: 'product',
    title: '多角色权限配置指南',
    summary: '详细说明系统中不同角色（坐席、主管、管理员）的权限划分及配置方法。',
    updatedAt: '2026-05-28',
    tags: ['权限管理', '角色配置'],
  },
  {
    id: 'a-4',
    categoryId: 'process',
    title: '工单升级处理流程',
    summary: '当客户问题超出坐席处理范围时，工单如何按规范流程升级至二线或主管。',
    updatedAt: '2026-06-02',
    tags: ['工单', '升级流程'],
  },
  {
    id: 'a-5',
    categoryId: 'process',
    title: '退款审批标准操作流程',
    summary: '退款场景的审批流程、各级审批权限及时效要求说明。',
    updatedAt: '2026-05-30',
    tags: ['退款', '审批'],
  },
  {
    id: 'a-6',
    categoryId: 'script',
    title: '首次来电欢迎话术',
    summary: '适用于新客户首次来电的标准欢迎语及引导话术模板。',
    updatedAt: '2026-06-04',
    tags: ['欢迎语', '新客户'],
  },
  {
    id: 'a-7',
    categoryId: 'script',
    title: '投诉安抚标准话术',
    summary: '客户情绪激动或表达投诉意向时的标准安抚话术及应对技巧。',
    updatedAt: '2026-06-03',
    tags: ['投诉', '安抚'],
  },
  {
    id: 'a-8',
    categoryId: 'faq',
    title: '如何重置客户密码？',
    summary: '客户忘记密码时，坐席协助重置密码的操作步骤及注意事项。',
    updatedAt: '2026-06-04',
    tags: ['密码', '账号'],
  },
  {
    id: 'a-9',
    categoryId: 'faq',
    title: '发票开具常见问题',
    summary: '关于发票类型选择、抬头修改、电子发票下载等高频问题的解答。',
    updatedAt: '2026-05-29',
    tags: ['发票', '财务'],
  },
  {
    id: 'a-10',
    categoryId: 'product',
    title: 'SaaS 方案概览与定价说明',
    summary: '面向企业客户的 SaaS 版本功能对比、套餐定价及增值服务说明。',
    updatedAt: '2026-06-05',
    tags: ['SaaS', '定价'],
  },
];

const recentSearches = ['客户管理', '退款流程', '权限配置', '投诉话术'];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

type KnowledgeSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function KnowledgeSearchModal({
  isOpen,
  onClose,
}: KnowledgeSearchModalProps) {
  const [keyword, setKeyword] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ---- filtered results ---- */
  const filteredArticles = useMemo(() => {
    let list = articles;
    if (activeCategoryId) {
      list = list.filter((a) => a.categoryId === activeCategoryId);
    }
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) ||
          a.summary.toLowerCase().includes(kw) ||
          a.tags.some((t) => t.toLowerCase().includes(kw)),
      );
    }
    return list;
  }, [keyword, activeCategoryId]);

  /* ---- keyboard ---- */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, selectedArticle]);

  /* ---- lock body scroll ---- */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  /* ---- auto-focus search input ---- */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setKeyword('');
      setActiveCategoryId(null);
      setSelectedArticle(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label="知识搜索"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up flex h-[600px] w-full max-w-[720px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== Header with search ==================== */}
        <header className="flex items-center gap-3 border-b border-hairline px-5 py-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="搜索知识库文章、话术、FAQ…"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setSelectedArticle(null);
              }}
              className="focus-ring h-10 w-full rounded-xl border border-hairline bg-slate-50 pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </header>

        {/* ==================== Body ==================== */}
        <div className="flex min-h-0 flex-1">
          {/* ---------- Left: categories ---------- */}
          <aside className="flex w-[180px] shrink-0 flex-col gap-1 border-r border-hairline bg-slate-50/60 px-3 py-3">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryId(null);
                setSelectedArticle(null);
              }}
              className={cn(
                'focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors',
                activeCategoryId === null
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-white hover:text-slate-800',
              )}
            >
              <Search size={14} className="shrink-0" />
              全部分类
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setSelectedArticle(null);
                  }}
                  className={cn(
                    'focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:bg-white hover:text-slate-800',
                  )}
                >
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded', cat.bg)}>
                    <Icon size={12} className={cat.accent} />
                  </span>
                  {cat.label}
                </button>
              );
            })}

            {/* Recent searches */}
            {!keyword && (
              <div className="mt-4 border-t border-hairline pt-3">
                <p className="mb-2 flex items-center gap-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <Clock size={11} />
                  最近搜索
                </p>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setKeyword(term);
                      setSelectedArticle(null);
                    }}
                    className="focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[12px] text-slate-500 transition-colors hover:bg-white hover:text-brand-600"
                  >
                    <Clock size={11} className="shrink-0 text-slate-300" />
                    {term}
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ---------- Right: results / detail ---------- */}
          <div className="flex min-h-0 flex-1 flex-col">
            {selectedArticle ? (
              /* ---- Article detail view ---- */
              <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
                <div className="border-b border-hairline px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    ← 返回列表
                  </button>
                </div>
                <article className="flex-1 px-6 py-5">
                  <h3 className="mb-2 text-[17px] font-bold text-slate-800">
                    {selectedArticle.title}
                  </h3>
                  <div className="mb-4 flex items-center gap-3 text-[12px] text-slate-400">
                    <span>
                      分类：{categories.find((c) => c.id === selectedArticle.categoryId)?.label}
                    </span>
                    <span>更新于 {selectedArticle.updatedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-xl border border-hairline bg-slate-50/60 p-5 text-[13px] leading-relaxed text-slate-600">
                    <p>{selectedArticle.summary}</p>
                    <p className="mt-3 text-slate-400">
                      （完整知识内容将在此处展示，包括图文、附件、关联知识等。）
                    </p>
                  </div>
                </article>
              </div>
            ) : (
              /* ---- Results list view ---- */
              <>
                <div className="flex items-center justify-between border-b border-hairline px-5 py-2.5">
                  <p className="text-[12px] text-slate-400">
                    {keyword ? (
                      <>
                        找到 <span className="font-semibold text-slate-600">{filteredArticles.length}</span> 条相关结果
                      </>
                    ) : (
                      <>
                        共 <span className="font-semibold text-slate-600">{filteredArticles.length}</span> 篇知识文章
                      </>
                    )}
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
                  {filteredArticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Search size={36} strokeWidth={1.2} className="mb-3 text-slate-300" />
                      <p className="text-[14px] font-medium">未找到相关知识</p>
                      <p className="mt-1 text-[12px]">请尝试更换关键词或分类</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-hairline">
                      {filteredArticles.map((article) => {
                        const cat = categories.find((c) => c.id === article.categoryId);
                        const CatIcon = cat?.icon ?? BookOpen;
                        return (
                          <li key={article.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedArticle(article)}
                              className="focus-ring group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50/80"
                            >
                              <span
                                className={cn(
                                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                  cat?.bg ?? 'bg-slate-100',
                                )}
                              >
                                <CatIcon size={14} className={cat?.accent ?? 'text-slate-500'} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate text-[13px] font-semibold text-slate-700 group-hover:text-brand-600">
                                    {article.title}
                                  </h4>
                                  <ChevronRight
                                    size={13}
                                    className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400"
                                  />
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-[12px] leading-relaxed text-slate-400">
                                  {article.summary}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                  {article.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center rounded bg-slate-100 px-1.5 py-[1px] text-[10px] font-medium text-slate-400"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  <span className="text-[10px] text-slate-300">{article.updatedAt}</span>
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
