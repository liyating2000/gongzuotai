import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Headphones,
  Loader2,
  MessageCircle,
  PieChart,
  PlayCircle,
  Shield,
  Sparkles,
  Star,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/cn';

type CourseStatus = '未开始' | '学习中' | '已完成';
type CourseCategory = '服务技能' | '产品知识' | '沟通技巧' | '系统操作' | '合规培训';

interface CourseItem {
  id: string;
  title: string;
  category: CourseCategory;
  status: CourseStatus;
  progress: number;
  totalDuration: string;
  learnedDuration: string;
  deadline: string;
  instructor: string;
  chapters: number;
  desc: string;
  required: boolean;
}

const courses: CourseItem[] = [
  {
    id: 'C-001',
    title: '客服沟通技巧与话术精讲',
    category: '沟通技巧',
    status: '学习中',
    progress: 65,
    totalDuration: '3h 20min',
    learnedDuration: '2h 9min',
    deadline: '2024-10-20',
    instructor: '张老师',
    chapters: 12,
    desc: '系统讲解客服核心话术与情绪管理方法，助力提升服务质量与客户满意度。',
    required: true,
  },
  {
    id: 'C-002',
    title: '产品功能全面了解与使用指南',
    category: '产品知识',
    status: '未开始',
    progress: 0,
    totalDuration: '2h 45min',
    learnedDuration: '0min',
    deadline: '2024-10-25',
    instructor: '李老师',
    chapters: 9,
    desc: '全面介绍平台核心产品功能及最新迭代内容，帮助客服快速解答客户咨询。',
    required: true,
  },
  {
    id: 'C-003',
    title: '工单系统操作规范与流程',
    category: '系统操作',
    status: '已完成',
    progress: 100,
    totalDuration: '1h 30min',
    learnedDuration: '1h 30min',
    deadline: '2024-10-15',
    instructor: '王老师',
    chapters: 6,
    desc: '详细介绍工单创建、流转、处理、关闭全流程规范操作方法。',
    required: true,
  },
  {
    id: 'C-004',
    title: '投诉处理与危机公关技能',
    category: '服务技能',
    status: '未开始',
    progress: 0,
    totalDuration: '2h 10min',
    learnedDuration: '0min',
    deadline: '2024-10-28',
    instructor: '陈老师',
    chapters: 8,
    desc: '掌握客户投诉场景下的应对策略，提升危机处理能力和客户挽留技巧。',
    required: false,
  },
  {
    id: 'C-005',
    title: '数据安全与隐私保护合规培训',
    category: '合规培训',
    status: '学习中',
    progress: 30,
    totalDuration: '1h 50min',
    learnedDuration: '33min',
    deadline: '2024-10-18',
    instructor: '刘老师',
    chapters: 7,
    desc: '了解数据安全法规要求，掌握客户信息保护操作规范，确保合规服务。',
    required: true,
  },
  {
    id: 'C-006',
    title: '高效倾听与需求挖掘技巧',
    category: '沟通技巧',
    status: '未开始',
    progress: 0,
    totalDuration: '1h 20min',
    learnedDuration: '0min',
    deadline: '2024-11-01',
    instructor: '赵老师',
    chapters: 5,
    desc: '通过专业练习提升主动倾听和需求识别能力，更精准满足客户预期。',
    required: false,
  },
];

const statusCfg: Record<
  CourseStatus,
  { chip: string; icon: LucideIcon; coverBg: string }
> = {
  未开始: {
    chip: 'border border-slate-200/80 bg-slate-50 text-slate-500',
    icon: PlayCircle,
    coverBg: 'from-slate-400 to-slate-600',
  },
  学习中: {
    chip: 'border border-sky-200/70 bg-sky-50 text-sky-700',
    icon: Loader2,
    coverBg: 'from-sky-500 to-brand-500',
  },
  已完成: {
    chip: 'border border-emerald-200/70 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
    coverBg: 'from-emerald-500 to-teal-500',
  },
};

const catCfg: Record<CourseCategory, { chip: string; icon: LucideIcon }> = {
  服务技能: { chip: 'border border-teal-200/70 bg-teal-50 text-teal-700', icon: Headphones },
  产品知识: { chip: 'border border-indigo-200/70 bg-indigo-50 text-indigo-700', icon: BookOpen },
  沟通技巧: { chip: 'border border-amber-200/70 bg-amber-50 text-amber-700', icon: MessageCircle },
  系统操作: { chip: 'border border-sky-200/70 bg-sky-50 text-sky-700', icon: Wrench },
  合规培训: { chip: 'border border-rose-200/70 bg-rose-50 text-rose-700', icon: Shield },
};

function CourseDetail({ course, onClose }: { course: CourseItem | null; onClose: () => void }) {
  if (!course) return null;
  const sc = statusCfg[course.status];
  const cat = catCfg[course.category];
  const CatIcon = cat.icon;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-[3px] p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header cover */}
        <div className={cn('relative h-40 overflow-hidden bg-gradient-to-br', sc.coverBg)}>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex h-full items-center justify-center">
            <CatIcon size={56} strokeWidth={1.5} className="text-white/90" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30"
            aria-label="关闭详情"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold', cat.chip)}>
                  <CatIcon size={11} />
                  {course.category}
                </span>
                {course.required ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
                    <Star size={10} className="fill-current" />
                    必修
                  </span>
                ) : null}
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', sc.chip)}>
                  {course.status}
                </span>
              </div>
              <div className="text-[17px] font-bold leading-snug text-slate-800">{course.title}</div>
            </div>
          </div>

          <div className="mb-5 text-[13px] leading-relaxed text-slate-500">{course.desc}</div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { label: '讲师', value: course.instructor },
              { label: '章节数', value: `${course.chapters} 节` },
              { label: '总时长', value: course.totalDuration },
              { label: '已学', value: course.learnedDuration },
              { label: '截止日期', value: course.deadline },
              { label: '完成进度', value: `${course.progress}%` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-hairline bg-slate-50/60 p-3 text-center">
                <div className="mb-1 text-[11px] text-slate-400">{label}</div>
                <div className="tabular-nums text-[13px] font-semibold text-slate-700">{value}</div>
              </div>
            ))}
          </div>

          {course.progress < 100 ? (
            <div className="mb-5">
              <div className="mb-1.5 flex justify-between tabular-nums text-[11px] text-slate-500">
                <span>学习进度</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="focus-ring press-lift w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 py-3 text-[14px] font-semibold text-white shadow-[0_12px_28px_-8px_rgba(58,92,255,0.55)]"
          >
            <PlayCircle size={16} className="-mt-0.5 mr-1.5 inline-block" />
            {course.status === '未开始'
              ? '开始学习'
              : course.status === '学习中'
                ? '继续学习'
                : '重新学习'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseListContent() {
  const [filterStatus, setFilterStatus] = useState<CourseStatus | '全部'>('全部');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  const statusCounts: Record<string, number> = useMemo(
    () => ({
      全部: courses.length,
      未开始: courses.filter((c) => c.status === '未开始').length,
      学习中: courses.filter((c) => c.status === '学习中').length,
      已完成: courses.filter((c) => c.status === '已完成').length,
    }),
    []
  );

  const filtered = useMemo(
    () => courses.filter((c) => filterStatus === '全部' || c.status === filterStatus),
    [filterStatus]
  );

  const totalProgress = Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length);

  const summaryCards: Array<{
    label: string;
    value: number | string;
    icon: LucideIcon;
    accent: string;
    bg: string;
  }> = [
    { label: '全部课程', value: courses.length, icon: BookOpen, accent: 'text-indigo-500', bg: 'bg-indigo-50' },
    {
      label: '必修课程',
      value: courses.filter((c) => c.required).length,
      icon: Sparkles,
      accent: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    { label: '学习中', value: statusCounts['学习中'] ?? 0, icon: Loader2, accent: 'text-sky-500', bg: 'bg-sky-50' },
    {
      label: '已完成',
      value: statusCounts['已完成'] ?? 0,
      icon: CheckCircle2,
      accent: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    { label: '总体进度', value: `${totalProgress}%`, icon: PieChart, accent: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="animate-fade-in-up flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden">
      {/* Summary cards */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-3 md:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="surface-card flex items-center gap-3 p-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-slate-100', card.bg)}>
                <Icon size={18} strokeWidth={2.2} className={card.accent} />
              </div>
              <div className="min-w-0">
                <div className="tabular-nums text-[22px] font-bold leading-none text-slate-900">{card.value}</div>
                <div className="mt-1 text-[12px] text-slate-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <section className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {/* Status Tabs */}
        <div className="flex flex-shrink-0 items-center gap-1 border-b border-hairline px-5">
          {(['全部', '未开始', '学习中', '已完成'] as const).map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s as CourseStatus | '全部')}
                className={cn(
                  'focus-ring relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-[13px] font-medium transition-colors',
                  active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                )}
                aria-pressed={active}
              >
                {s}
                <span
                  className={cn(
                    'tabular-nums inline-flex min-w-[20px] justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                    active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {statusCounts[s] ?? 0}
                </span>
                {active ? (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Course grid */}
        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => {
              const sc = statusCfg[course.status];
              const cat = catCfg[course.category];
              const CatIcon = cat.icon;
              const StatusIcon = sc.icon;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  className="focus-ring group overflow-hidden rounded-2xl border border-hairline bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12)]"
                >
                  {/* Cover */}
                  <div className={cn('relative h-28 overflow-hidden bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.02]', sc.coverBg)}>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl"
                    />
                    <div className="relative flex h-full items-center justify-center">
                      <CatIcon size={44} strokeWidth={1.5} className="text-white/90" />
                    </div>
                    <div className="absolute left-3 top-3 flex items-center gap-1.5">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur', cat.chip)}>
                        {course.category}
                      </span>
                      {course.required ? (
                        <span className="inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(244,63,94,0.4)]">
                          必修
                        </span>
                      ) : null}
                    </div>
                    <div className={cn('absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur', sc.chip)}>
                      <StatusIcon size={11} />
                      {course.status}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="mb-1 line-clamp-2 text-[14px] font-semibold leading-snug text-slate-800">
                      {course.title}
                    </div>
                    <div className="mb-3 line-clamp-1 text-[12px] text-slate-400">{course.desc}</div>

                    {course.progress > 0 && course.progress < 100 ? (
                      <div className="mb-3">
                        <div className="mb-1 flex justify-between tabular-nums text-[11px] text-slate-500">
                          <span>进度</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                    {course.progress === 100 ? (
                      <div className="mb-3 flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                        <CheckCircle2 size={13} />
                        已完成
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between tabular-nums text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {course.totalDuration} · {course.chapters}节
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap size={11} />
                        截止 {course.deadline.slice(5)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <CourseDetail course={selectedCourse} onClose={() => setSelectedCourse(null)} />
    </div>
  );
}
