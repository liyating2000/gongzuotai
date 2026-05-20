import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '../../lib/cn';

type MetricTrendModalProps = {
  /** Metric label — doubles as open gate (non-null == open). */
  title: string | null;
  onClose: () => void;
};

const trendTabs = ['近3天', '近7天', '近一个月'] as const;
type TrendTab = (typeof trendTabs)[number];

const trendLabelsByTab: Record<TrendTab, string[]> = {
  '近3天': ['10.12', '10.13', '10.14'],
  '近7天': ['10.8', '10.9', '10.10', '10.11', '10.12', '10.13', '10.14'],
  '近一个月': [
    '9.15',
    '9.18',
    '9.21',
    '9.24',
    '9.27',
    '9.30',
    '10.3',
    '10.6',
    '10.9',
    '10.12',
    '10.14',
  ],
};

type TrendPoint = {
  label: string;
  metricValue: number;
  groupAverage: number;
};

/**
 * Deterministic pseudo-random series keyed by the metric title so the same
 * metric always shows the same curve across sessions.
 */
const createTrendSeries = (metricLabel: string, tab: TrendTab): TrendPoint[] => {
  const labels = trendLabelsByTab[tab];
  const seed = Array.from(metricLabel).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = 56 + (seed % 11);
  const amplitude = 8 + (seed % 5);

  return labels.map((label, index) => {
    const metricValue = base + ((index * 7 + seed) % (amplitude + 9)) - Math.floor(amplitude / 2);
    const groupAverage =
      base + ((index * 5 + seed + 9) % (amplitude + 11)) - Math.floor(amplitude / 3);
    return { label, metricValue, groupAverage };
  });
};

export default function MetricTrendModal({ title, onClose }: MetricTrendModalProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>('近7天');
  const isOpen = title !== null;

  // Reset tab whenever the modal re-opens for a different metric.
  useEffect(() => {
    if (isOpen) {
      setActiveTab('近7天');
    }
  }, [isOpen, title]);

  // ESC to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const trendData = useMemo(
    () => (isOpen ? createTrendSeries(title ?? '', activeTab) : []),
    [isOpen, title, activeTab]
  );

  if (!isOpen) return null;

  // NOTE: Rendered via createPortal so it escapes any ancestor with `transform`
  // (which would otherwise become the containing block of `position: fixed`
  // and break viewport-relative positioning). Several portal cards use
  // `animate-fade-in-up` whose final `translateY(0)` triggers exactly that.
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="metric-trend-modal-title"
    >
      <div
        className="animate-fade-in-up w-full max-w-[760px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-400" />
            <h2
              id="metric-trend-modal-title"
              className="truncate text-[16px] font-bold tracking-tight text-slate-800"
            >
              {title} · 趋势图
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭趋势图弹窗"
          >
            <X size={16} />
          </button>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 p-1">
            {trendTabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'focus-ring relative rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors duration-300',
                    active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  )}
                  aria-pressed={active}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_6px_14px_-4px_rgba(58,92,255,0.5)]"
                    />
                  ) : null}
                  <span className="relative">{tab}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            <span className="flex items-center gap-1.5 text-brand-600">
              <span className="h-[3px] w-5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400" />
              {title}
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-[3px] w-5 rounded-full bg-rose-500" />
              组平均值
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[320px] w-full px-6 pb-6 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="metric-trend-modal-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3a5cff" />
                  <stop offset="100%" stopColor="#5a7eff" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eef2f7" strokeDasharray="4 6" />
              <XAxis
                dataKey="label"
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                width={40}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
                  padding: '10px 12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: 4 }}
              />
              <Line
                type="monotone"
                dataKey="metricValue"
                name={title ?? ''}
                stroke="url(#metric-trend-modal-line)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 3, stroke: '#ffffff', fill: '#3a5cff' }}
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="groupAverage"
                name="组平均值"
                stroke="#f5384a"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 3, stroke: '#ffffff', fill: '#f5384a' }}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>,
    document.body
  );
}
