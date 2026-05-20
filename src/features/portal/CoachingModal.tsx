import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CalendarDays,
  GraduationCap,
  MessageSquare,
  PhoneCall,
  User,
  X,
} from 'lucide-react';

import { cn } from '../../lib/cn';

export type CoachingAbnormalInfo = {
  /** 异常天（如 "3, 7, 12" 日） */
  days: number[];
  /** 该员工该指标的总数显示值 */
  total: string;
  /** 行均值参考（用于展示） */
  meanLabel?: string;
};

type CoachingChannel = 'call' | 'feishu' | 'appointment';

type CoachingModalProps = {
  isOpen: boolean;
  agentName: string;
  agentNumber?: string;
  skillGroup?: string;
  metricLabel: string;
  month: string;
  abnormal: CoachingAbnormalInfo;
  onClose: () => void;
  onSubmit: (payload: {
    channel: CoachingChannel;
    focus: string;
    scheduledAt?: string;
  }) => void;
};

const channelOptions: Array<{
  id: CoachingChannel;
  label: string;
  hint: string;
  icon: typeof PhoneCall;
  tone: string;
}> = [
  {
    id: 'call',
    label: '即时通话',
    hint: '立即拨通对方分机 · 适合紧急纠偏',
    icon: PhoneCall,
    tone: 'from-rose-50 to-rose-50/40 border-rose-200 text-rose-600',
  },
  {
    id: 'feishu',
    label: '飞书消息',
    hint: '异步推送指导要点 · 附带历史数据',
    icon: MessageSquare,
    tone: 'from-sky-50 to-sky-50/40 border-sky-200 text-sky-600',
  },
  {
    id: 'appointment',
    label: '预约 1v1',
    hint: '排定辅导时段 · 纳入排班计划',
    icon: CalendarDays,
    tone: 'from-violet-50 to-violet-50/40 border-violet-200 text-violet-600',
  },
];

const padDateTime = (n: number) => n.toString().padStart(2, '0');
const formatDateTimeLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = padDateTime(d.getMonth() + 1);
  const day = padDateTime(d.getDate());
  const h = padDateTime(d.getHours());
  const min = padDateTime(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
};

const FOCUS_MAX = 300;

export default function CoachingModal({
  isOpen,
  agentName,
  agentNumber = 'A00128',
  skillGroup = '售后一组',
  metricLabel,
  month,
  abnormal,
  onClose,
  onSubmit,
}: CoachingModalProps) {
  const [channel, setChannel] = useState<CoachingChannel>('feishu');
  const [focus, setFocus] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() => {
    const later = new Date();
    later.setHours(later.getHours() + 1, 0, 0, 0);
    return formatDateTimeLocal(later);
  });

  const suggestion = useMemo(() => {
    if (metricLabel.includes('解决')) return '建议梳理 3 类高频未解决场景，并针对知识库短板开展 30 分钟专项讲解。';
    if (metricLabel.includes('满意')) return '建议回听 2 通低分录音，聚焦"回应共情 + 首句致歉"话术。';
    if (metricLabel.includes('质检')) return '建议对照扣分项清单，复盘最近 5 单，并制定 1 周改进打卡计划。';
    if (metricLabel.includes('时长') || metricLabel.includes('通话')) return '建议对照标准话术流程，强化"确认 → 处理 → 复述"三段式收口。';
    return '建议结合异常日期分布，识别是否为排班或业务变化引入的波动；必要时补充培训。';
  }, [metricLabel]);

  useEffect(() => {
    if (!isOpen) return;
    setChannel('feishu');
    setFocus('');
    const later = new Date();
    later.setHours(later.getHours() + 1, 0, 0, 0);
    setScheduledAt(formatDateTimeLocal(later));
  }, [isOpen, agentName]);

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

  if (!isOpen) return null;

  const abnormalCount = abnormal.days.length;
  const abnormalPreview =
    abnormalCount === 0
      ? '无'
      : abnormal.days.slice(0, 8).map((d) => `${d}日`).join('、') +
        (abnormalCount > 8 ? ` 等 ${abnormalCount} 天` : '');

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[8vh] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coaching-modal-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-[640px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-hairline bg-gradient-to-r from-amber-50 via-amber-50/40 to-transparent px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-[0_8px_18px_-6px_rgba(245,158,11,0.6)]">
              <GraduationCap size={18} />
            </span>
            <div className="min-w-0">
              <h2
                id="coaching-modal-title"
                className="truncate text-[16px] font-bold tracking-tight text-slate-800"
              >
                发起辅导
              </h2>
              <p className="truncate text-[12px] text-slate-500">
                针对 {agentName} · {metricLabel} · {month}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭辅导弹窗"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </header>

        <form
          className="max-h-[78vh] space-y-5 overflow-y-auto px-6 py-5 custom-scrollbar"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              channel,
              focus: focus.trim(),
              scheduledAt: channel === 'appointment' ? scheduledAt : undefined,
            });
          }}
        >
          {/* 员工信息 */}
          <section className="flex items-center gap-3 rounded-2xl border border-hairline bg-slate-50/60 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <User size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-slate-800">{agentName}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                  工号 {agentNumber}
                </span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600">
                  {skillGroup}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-slate-500">
                总数 <span className="font-semibold text-slate-700">{abnormal.total}</span>
                {abnormal.meanLabel ? (
                  <>
                    {' · '}行均值 <span className="font-medium">{abnormal.meanLabel}</span>
                  </>
                ) : null}
              </p>
            </div>
          </section>

          {/* 异常摘要 */}
          <section className="rounded-2xl border border-rose-200/70 bg-rose-50/50 px-4 py-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-rose-700">
              <AlertTriangle size={14} />
              <span>异常指标</span>
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {abnormalCount} 天
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-5 text-rose-900/80">
              异常日：{abnormalPreview}
            </p>
            <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-[12px] leading-5 text-slate-600">
              <span className="mr-1 font-semibold text-amber-600">AI 建议</span>
              {suggestion}
            </p>
          </section>

          {/* 辅导方式 */}
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-slate-700">辅导方式</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {channelOptions.map((opt) => {
                const active = channel === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChannel(opt.id)}
                    className={cn(
                      'focus-ring flex flex-col items-start gap-1.5 rounded-2xl border bg-gradient-to-br px-3 py-3 text-left transition-all',
                      active
                        ? cn(opt.tone, 'shadow-[0_10px_24px_-12px_rgba(15,23,42,0.2)]')
                        : 'border-hairline from-white to-white text-slate-600 hover:border-brand-200 hover:from-brand-50/40'
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                      <Icon size={14} />
                      {opt.label}
                    </span>
                    <span className="text-[11px] leading-4 text-slate-500">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 预约时间（仅预约模式） */}
          {channel === 'appointment' ? (
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-slate-700">
                <span className="mr-0.5 text-rose-500">*</span>
                预约时间
              </h3>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="focus-ring h-[38px] w-full rounded-xl border border-hairline bg-slate-50/60 px-3 pr-9 text-[13px] text-slate-700 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
                />
                <CalendarDays
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </section>
          ) : null}

          {/* 辅导重点 */}
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-slate-700">
              <span className="mr-0.5 text-rose-500">*</span>
              辅导重点
            </h3>
            <div className="relative">
              <textarea
                value={focus}
                onChange={(e) => setFocus(e.target.value.slice(0, FOCUS_MAX))}
                rows={4}
                placeholder="请结合异常日的表现，说明本次辅导的核心目标和改进动作"
                className="focus-ring w-full resize-none rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 tabular-nums text-[11px] text-slate-400">
                {focus.length} / {FOCUS_MAX}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                '回听异常日录音',
                '话术标准化训练',
                '知识库专项学习',
                '1v1 复盘',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setFocus((prev) => (prev ? `${prev}；${tag}` : tag).slice(0, FOCUS_MAX))
                  }
                  className="focus-ring rounded-full border border-hairline bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </section>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-xl border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!focus.trim()}
              className="focus-ring press-lift rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(245,158,11,0.55)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              发起辅导
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
