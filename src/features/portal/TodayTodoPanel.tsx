import { BookOpen, ClipboardCheck, FileText, MessageSquare, UserCheck, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export type TodayTodoKey =
  | 'online-workspace'
  | 'work-order'
  | 'customer-follow'
  | 'course-list'
  | 'summary-pending';

export type TodayTodoItem = {
  key: TodayTodoKey;
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind class applied to icon + number gradient tint. */
  tone:
    | 'sky'
    | 'orange'
    | 'teal'
    | 'violet'
    | 'rose';
};

const toneConfig: Record<
  TodayTodoItem['tone'],
  {
    icon: string;
    ring: string;
    iconBg: string;
    hoverBorder: string;
    hoverBg: string;
    number: string;
    glow: string;
  }
> = {
  sky: {
    icon: 'text-sky-500',
    ring: 'ring-sky-100',
    iconBg: 'bg-gradient-to-br from-sky-50 to-sky-100/60',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:from-sky-50/70 hover:to-white',
    number: 'text-sky-600',
    glow: 'bg-sky-200/40',
  },
  orange: {
    icon: 'text-orange-500',
    ring: 'ring-orange-100',
    iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100/60',
    hoverBorder: 'hover:border-orange-300',
    hoverBg: 'hover:from-orange-50/70 hover:to-white',
    number: 'text-orange-600',
    glow: 'bg-orange-200/40',
  },
  teal: {
    icon: 'text-teal-500',
    ring: 'ring-teal-100',
    iconBg: 'bg-gradient-to-br from-teal-50 to-teal-100/60',
    hoverBorder: 'hover:border-teal-300',
    hoverBg: 'hover:from-teal-50/70 hover:to-white',
    number: 'text-teal-600',
    glow: 'bg-teal-200/40',
  },
  violet: {
    icon: 'text-violet-500',
    ring: 'ring-violet-100',
    iconBg: 'bg-gradient-to-br from-violet-50 to-violet-100/60',
    hoverBorder: 'hover:border-violet-300',
    hoverBg: 'hover:from-violet-50/70 hover:to-white',
    number: 'text-violet-600',
    glow: 'bg-violet-200/40',
  },
  rose: {
    icon: 'text-rose-500',
    ring: 'ring-rose-100',
    iconBg: 'bg-gradient-to-br from-rose-50 to-rose-100/60',
    hoverBorder: 'hover:border-rose-300',
    hoverBg: 'hover:from-rose-50/70 hover:to-white',
    number: 'text-rose-600',
    glow: 'bg-rose-200/40',
  },
};

export const hotlineTodoItems: TodayTodoItem[] = [
  { key: 'work-order', label: '待处理工单', value: 32, icon: FileText, tone: 'orange' },
  { key: 'customer-follow', label: '待跟进客户', value: 20, icon: UserCheck, tone: 'teal' },
  { key: 'summary-pending', label: '待处理小结', value: 8, icon: ClipboardCheck, tone: 'sky' },
  { key: 'course-list', label: '待学习课程', value: 2, icon: BookOpen, tone: 'violet' },
];

export const onlineTodoItems: TodayTodoItem[] = [
  { key: 'work-order', label: '待处理工单', value: 15, icon: FileText, tone: 'orange' },
  { key: 'customer-follow', label: '待跟进客户', value: 11, icon: UserCheck, tone: 'teal' },
  { key: 'summary-pending', label: '待处理小结', value: 5, icon: ClipboardCheck, tone: 'sky' },
  { key: 'course-list', label: '待学习课程', value: 2, icon: BookOpen, tone: 'violet' },
];

type TodayTodoPanelProps = {
  items: TodayTodoItem[];
  onItemClick: (key: TodayTodoKey) => void;
};

export default function TodayTodoPanel({ items, onItemClick }: TodayTodoPanelProps) {
  return (
    <section className="surface-card p-5">
      <header className="mb-4 flex items-center gap-2">
        <h3 className="text-[15px] font-bold tracking-tight text-slate-800">今日待办</h3>
        <span className="ml-auto text-[12px] text-slate-400">点击卡片直达对应页面</span>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item, index) => {
          const tone = toneConfig[item.tone];
          const Icon = item.icon;
          return (
            <button
              key={`${item.key}-${index}`}
              type="button"
              onClick={() => onItemClick(item.key)}
              className={cn(
                'focus-ring press-lift group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/40 p-4 text-left transition-all duration-300',
                tone.hoverBorder,
                tone.hoverBg
              )}
              aria-label={`${item.label}，${item.value} 项，点击跳转`}
            >
              {/* Decorative glow */}
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100',
                  tone.glow
                )}
              />

              <div className="relative min-w-0">
                <div className="mb-2 truncate text-[12px] font-medium text-slate-500">
                  {item.label}
                </div>
                <div
                  className={cn(
                    'tabular-nums text-[26px] font-bold leading-none tracking-tight',
                    tone.number
                  )}
                >
                  {item.value}
                </div>
              </div>

              <div
                className={cn(
                  'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                  tone.iconBg,
                  tone.ring
                )}
              >
                <Icon size={18} strokeWidth={2.2} className={tone.icon} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
