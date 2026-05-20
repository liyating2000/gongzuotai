import { useMemo, useState } from 'react';
import {
  Activity,
  ChevronDown,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

import { cn } from '../../lib/cn';

type MetricKey = '解决率' | '客户满意度' | '质检平均分' | '接通量';

type RangeKey = '近7天' | '近14天' | '近30天';

const metricOptions: MetricKey[] = ['解决率', '客户满意度', '质检平均分', '接通量'];
const rangeOptions: RangeKey[] = ['近7天', '近14天', '近30天'];
const rangeDays: Record<RangeKey, number> = {
  '近7天': 7,
  '近14天': 14,
  '近30天': 30,
};

/** 指标显示配置 */
const metricDisplay: Record<
  MetricKey,
  {
    unit: string;
    /** 基准均值（行均值附近） */
    base: number;
    /** 波动幅度（±） */
    amp: number;
    /** 目标线 */
    target: number;
    /** 数值格式 */
    format: (v: number) => string;
  }
> = {
  解决率: {
    unit: '%',
    base: 89,
    amp: 7,
    target: 92,
    format: (v) => `${v.toFixed(1)}%`,
  },
  客户满意度: {
    unit: '分',
    base: 4.55,
    amp: 0.35,
    target: 4.7,
    format: (v) => v.toFixed(2),
  },
  质检平均分: {
    unit: '分',
    base: 90,
    amp: 6,
    target: 93,
    format: (v) => v.toFixed(1),
  },
  接通量: {
    unit: '通',
    base: 168,
    amp: 46,
    target: 180,
    format: (v) => Math.round(v).toString(),
  },
};

const focusAgents = [
  { name: '王五', color: '#f97316', dim: '#fed7aa' },
  { name: '李四', color: '#8b5cf6', dim: '#ddd6fe' },
  { name: '赵六', color: '#06b6d4', dim: '#a5f3fc' },
  { name: '孙七', color: '#ec4899', dim: '#fbcfe8' },
];

/** 伪随机工具（与其他 portal 文件一致） */
const seedFrom = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const rand = (seed: number) => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const CHART_WIDTH = 780;
const CHART_HEIGHT = 220;
const PADDING = { top: 16, right: 24, bottom: 28, left: 44 };
const INNER_W = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const FOCUS_ALL = '全部' as const;

const directorGroupOptions = [
  '售后一组',
  '售后二组',
  '售前一组',
  '售前二组',
  '投诉专组',
  'VIP 组',
];

type MetricFluctuationPanelProps = {
  /** 总监角色开启"分组"必选筛选 */
  isDirector?: boolean;
};

export default function MetricFluctuationPanel({
  isDirector = false,
}: MetricFluctuationPanelProps) {
  const [metric, setMetric] = useState<MetricKey>('解决率');
  const [range, setRange] = useState<RangeKey>('近14天');
  const [focusAgent, setFocusAgent] = useState<string>(FOCUS_ALL);
  const [group, setGroup] = useState<string>(directorGroupOptions[0]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hiddenAgents, setHiddenAgents] = useState<Set<string>>(new Set());
  const isSingleFocus = focusAgent !== FOCUS_ALL;

  const toggleAgent = (name: string) => {
    setHiddenAgents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const data = useMemo(() => {
    const n = rangeDays[range];
    const cfg = metricDisplay[metric];
    const base = cfg.base;
    const amp = cfg.amp;
    const labels: string[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    const seedBase = seedFrom(`${metric}-${range}-${isDirector ? group : 'team'}`);
    // 团队均值序列（平缓波动）
    const team = labels.map((_, i) => {
      const r = rand(seedBase + i * 31);
      return base + (r - 0.5) * amp * 0.5;
    });
    // 上下限带（参考均值±10%）
    const lower = team.map((t) => t - amp * 0.45);
    const upper = team.map((t) => t + amp * 0.45);

    // 个人序列
    const agents = focusAgents.map((a, idx) => {
      const seed = seedBase + idx * 197 + seedFrom(a.name);
      const bias = (rand(seed) - 0.5) * amp * 0.4;
      const values = labels.map((_, i) => {
        const r = rand(seed + i * 43);
        const drift = Math.sin((i / labels.length) * Math.PI * 2 + idx) * amp * 0.25;
        return base + bias + drift + (r - 0.5) * amp * 0.8;
      });
      return { ...a, values };
    });

    // Y 轴范围
    const all = [...team, ...agents.flatMap((a) => a.values), ...lower, ...upper];
    const maxV = Math.max(...all);
    const minV = Math.min(...all);
    const pad = (maxV - minV) * 0.12;
    const yMin = Math.max(0, minV - pad);
    const yMax = maxV + pad;

    return { labels, team, lower, upper, agents, yMin, yMax, cfg };
  }, [metric, range, group, isDirector]);

  const { labels, team, lower, upper, agents, yMin, yMax, cfg } = data;
  const xStep = labels.length > 1 ? INNER_W / (labels.length - 1) : 0;
  const yScale = (v: number) =>
    PADDING.top + INNER_H - ((v - yMin) / (yMax - yMin || 1)) * INNER_H;
  const xPos = (i: number) => PADDING.left + i * xStep;

  const buildPath = (values: number[]) =>
    values
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yScale(v).toFixed(1)}`)
      .join(' ');

  const bandPath = (() => {
    const up = upper.map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yScale(v)}`).join(' ');
    const down = [...lower]
      .map((v, i) => `L${xPos(lower.length - 1 - i)},${yScale(lower[lower.length - 1 - i])}`)
      .reverse()
      .join(' ');
    // 正向绘制上边界，再逆向闭合下边界
    const upStr = upper
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yScale(v)}`)
      .join(' ');
    const downStr = lower
      .slice()
      .reverse()
      .map((v, idx) => `L${xPos(lower.length - 1 - idx)},${yScale(v)}`)
      .join(' ');
    return `${upStr} ${downStr} Z`;
    // 上述 up/down 变量保留为调试痕迹
    void up;
    void down;
  })();

  // Y 轴刻度（4 段）
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

  // 团队均值统计
  const teamAvg = team.reduce((a, b) => a + b, 0) / team.length;
  // 每个人均值与团队差异
  const agentStats = agents.map((a) => {
    const avg = a.values.reduce((x, y) => x + y, 0) / a.values.length;
    return { name: a.name, color: a.color, avg, diff: avg - teamAvg };
  });

  // 目标达成率（超过 target 的天数 / 总天数，基于团队均值）
  const onTargetDays = team.filter((v) =>
    metric === '客户满意度' || metric === '质检平均分' || metric === '解决率'
      ? v >= cfg.target
      : v >= cfg.target
  ).length;

  return (
    <section className="rounded-[18px] border border-hairline bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_8px_18px_-6px_rgba(14,165,233,0.55)]">
            <Activity size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 truncate text-[15px] font-bold tracking-tight text-slate-800">
              指标波动 · 个人 vs 团队均值
              {isDirector ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-100">
                  {group}
                </span>
              ) : null}
            </h3>
            <p className="truncate text-[12px] text-slate-500">
              实线为重点员工，橙色虚线为团队均值，灰带为团队波动区间
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isDirector ? (
            <FilterSelect
              value={group}
              options={directorGroupOptions}
              onChange={setGroup}
              icon={<Users size={12} />}
              label="分组"
              required
            />
          ) : null}
          <FilterSelect
            value={metric}
            options={metricOptions}
            onChange={(v) => setMetric(v as MetricKey)}
          />
          <FilterSelect
            value={range}
            options={rangeOptions}
            onChange={(v) => setRange(v as RangeKey)}
          />
          <FilterSelect
            value={focusAgent}
            options={[FOCUS_ALL, ...focusAgents.map((a) => a.name)]}
            onChange={setFocusAgent}
            icon={<User size={12} />}
            label="聚焦"
          />
        </div>
      </header>

      {/* 指标摘要 / 单人对比 */}
      {isSingleFocus ? (
        <FocusSummary
          agentName={focusAgent}
          teamAvg={teamAvg}
          target={cfg.target}
          values={agents.find((a) => a.name === focusAgent)?.values ?? []}
          format={cfg.format}
          color={agents.find((a) => a.name === focusAgent)?.color ?? '#0ea5e9'}
        />
      ) : (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryCard label="团队均值" value={cfg.format(teamAvg)} tone="sky" />
          <SummaryCard label="目标线" value={cfg.format(cfg.target)} tone="emerald" />
          <SummaryCard
            label="达标天数"
            value={`${onTargetDays} / ${team.length}`}
            tone="violet"
          />
          <SummaryCard
            label="波动幅度"
            value={`± ${cfg.format(Math.max(...upper.map((u, i) => u - lower[i])) / 2)}`}
            tone="amber"
          />
        </div>
      )}

      {/* 图表 */}
      <div className="relative overflow-x-auto rounded-2xl border border-hairline bg-gradient-to-b from-slate-50/60 to-white px-2 py-3 custom-scrollbar">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          width="100%"
          preserveAspectRatio="none"
          className="block"
          style={{ minWidth: 600 }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="fluct-band" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Y 轴刻度 */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                x2={CHART_WIDTH - PADDING.right}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={PADDING.left - 6}
                y={yScale(t) + 3}
                textAnchor="end"
                fontSize="8"
                fill="#94a3b8"
              >
                {cfg.format(t)}
              </text>
            </g>
          ))}

          {/* 目标线 */}
          <line
            x1={PADDING.left}
            x2={CHART_WIDTH - PADDING.right}
            y1={yScale(cfg.target)}
            y2={yScale(cfg.target)}
            stroke="#10b981"
            strokeDasharray="5 4"
            strokeWidth="1.5"
          />
          <text
            x={CHART_WIDTH - PADDING.right - 4}
            y={yScale(cfg.target) - 3}
            textAnchor="end"
            fontSize="8"
            fill="#10b981"
            fontWeight="600"
          >
            目标 {cfg.format(cfg.target)}
          </text>

          {/* 团队波动带 */}
          <path d={bandPath} fill="url(#fluct-band)" stroke="none" />

          {/* 团队均值线 */}
          <path
            d={buildPath(team)}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.2"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 个人线 */}
          {agents
            .filter((a) => (isSingleFocus ? a.name === focusAgent : !hiddenAgents.has(a.name)))
            .map((a) => (
              <g key={a.name}>
                <path
                  d={buildPath(a.values)}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={isSingleFocus ? 2.8 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
                {a.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={xPos(i)}
                    cy={yScale(v)}
                    r={hoverIdx === i ? 4 : isSingleFocus ? 2.8 : 2}
                    fill="#fff"
                    stroke={a.color}
                    strokeWidth={isSingleFocus ? 2 : 1.6}
                  />
                ))}
              </g>
            ))}

          {/* X 轴标签 */}
          {labels.map((l, i) => {
            const skip =
              labels.length > 14 ? i % Math.ceil(labels.length / 10) !== 0 : false;
            if (skip) return null;
            return (
              <text
                key={i}
                x={xPos(i)}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                fontSize="8"
                fill="#94a3b8"
              >
                {l}
              </text>
            );
          })}

          {/* Hover 捕获 + 高亮线 */}
          {labels.map((_, i) => (
            <rect
              key={i}
              x={xPos(i) - xStep / 2}
              y={PADDING.top}
              width={xStep}
              height={INNER_H}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          ))}
          {hoverIdx !== null ? (
            <line
              x1={xPos(hoverIdx)}
              x2={xPos(hoverIdx)}
              y1={PADDING.top}
              y2={PADDING.top + INNER_H}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ) : null}
        </svg>

        {/* Tooltip */}
        {hoverIdx !== null ? (
          <div
            className="pointer-events-none absolute top-3 rounded-xl border border-hairline bg-white/95 px-3 py-2 text-[11px] shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur"
            style={{
              left: `calc(${(xPos(hoverIdx) / CHART_WIDTH) * 100}% + 12px)`,
              maxWidth: 200,
            }}
          >
            <div className="mb-1 font-semibold text-slate-700">{labels[hoverIdx]}</div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 text-orange-500">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                团队均值
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {cfg.format(team[hoverIdx])}
              </span>
            </div>
            {agents
              .filter((a) => (isSingleFocus ? a.name === focusAgent : !hiddenAgents.has(a.name)))
              .map((a) => (
                <div key={a.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1" style={{ color: a.color }}>
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: a.color }}
                    />
                    {a.name}
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {cfg.format(a.values[hoverIdx])}
                  </span>
                </div>
              ))}
          </div>
        ) : null}
      </div>

      {/* 图例 + 员工对比 */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <LegendChip color="#f97316" label="团队均值" dashed active onClick={() => {}} />
          {agentStats
            .filter((a) => (isSingleFocus ? a.name === focusAgent : true))
            .map((a) => {
              const isHidden = hiddenAgents.has(a.name);
              const positive = a.diff >= 0;
              return (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => !isSingleFocus && toggleAgent(a.name)}
                  className={cn(
                    'focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                    isSingleFocus
                      ? 'border-hairline bg-slate-50 text-slate-700'
                      : isHidden
                        ? 'border-hairline bg-white text-slate-400'
                        : 'border-hairline bg-white text-slate-600 hover:border-brand-200'
                  )}
                  title={isSingleFocus ? '当前聚焦' : isHidden ? '点击显示' : '点击隐藏'}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: !isSingleFocus && isHidden ? '#cbd5e1' : a.color }}
                  />
                  {a.name}
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                      !isSingleFocus && isHidden
                        ? 'bg-slate-100 text-slate-400'
                        : positive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                    )}
                  >
                    {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {positive ? '+' : ''}
                    {cfg.format(a.diff)}
                  </span>
                </button>
              );
            })}
        </div>
        {isSingleFocus ? (
          <button
            type="button"
            onClick={() => setFocusAgent(FOCUS_ALL)}
            className="focus-ring inline-flex items-center gap-1 rounded-full border border-hairline bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-600"
          >
            返回全部对比
          </button>
        ) : null}
      </div>
    </section>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
  icon,
  label,
  required,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
}) {
  return (
    <div className="relative inline-flex items-center">
      {icon ? (
        <span
          className={cn(
            'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2',
            required ? 'text-violet-500' : 'text-slate-400'
          )}
        >
          {icon}
        </span>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'focus-ring h-8 appearance-none rounded-full border pr-7 text-[12px] font-medium outline-none transition-colors',
          icon ? 'pl-7' : 'pl-3',
          required
            ? 'border-violet-200 bg-violet-50/60 text-violet-700 hover:border-violet-300'
            : 'border-hairline bg-white text-slate-700 hover:border-brand-200'
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {label ? `${label}：${o}` : o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className={cn(
          'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2',
          required ? 'text-violet-500' : 'text-slate-400'
        )}
      />
    </div>
  );
}

function FocusSummary({
  agentName,
  teamAvg,
  target,
  values,
  format,
  color,
}: {
  agentName: string;
  teamAvg: number;
  target: number;
  values: number[];
  format: (v: number) => string;
  color: string;
}) {
  if (values.length === 0) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const diff = avg - teamAvg;
  const positive = diff >= 0;
  const onTargetDays = values.filter((v) => v >= target).length;
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const belowTeamDays = values.filter((v) => v < teamAvg).length;

  return (
    <div
      className="mb-3 flex flex-wrap items-stretch gap-2 rounded-2xl border bg-gradient-to-r p-2"
      style={{
        borderColor: `${color}44`,
        background: `linear-gradient(135deg, ${color}14, #ffffff 60%)`,
      }}
    >
      <div className="flex min-w-[140px] items-center gap-2 rounded-xl bg-white/80 px-3 py-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ background: color }}
        >
          <User size={14} />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] text-slate-500">聚焦员工</div>
          <div className="truncate text-[14px] font-bold text-slate-800">{agentName}</div>
        </div>
      </div>
      <FocusStat label="个人均值" value={format(avg)} highlight={color} />
      <FocusStat label="团队均值" value={format(teamAvg)} />
      <FocusStat
        label="与团队差"
        value={`${positive ? '+' : ''}${format(diff)}`}
        tone={positive ? 'emerald' : 'rose'}
        trendUp={positive}
      />
      <FocusStat label="达标天数" value={`${onTargetDays} / ${values.length}`} tone="violet" />
      <FocusStat label="低于团队天数" value={`${belowTeamDays} 天`} tone="amber" />
      <FocusStat label="区间" value={`${format(minV)} ~ ${format(maxV)}`} />
      <button
        type="button"
        className="focus-ring press-lift ml-auto inline-flex items-center gap-1 self-center rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(245,158,11,0.6)]"
        title={`针对 ${agentName} 发起辅导`}
      >
        <GraduationCap size={12} />
        发起辅导
      </button>
    </div>
  );
}

function FocusStat({
  label,
  value,
  tone,
  highlight,
  trendUp,
}: {
  label: string;
  value: string;
  tone?: 'emerald' | 'rose' | 'violet' | 'amber';
  highlight?: string;
  trendUp?: boolean;
}) {
  const toneColor: Record<NonNullable<typeof tone>, string> = {
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="flex min-w-[100px] flex-1 flex-col justify-center rounded-xl bg-white/80 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div
        className={cn(
          'flex items-center gap-1 text-[14px] font-bold tabular-nums',
          tone ? toneColor[tone] : 'text-slate-800'
        )}
        style={highlight ? { color: highlight } : undefined}
      >
        {tone === 'emerald' || tone === 'rose' ? (
          trendUp ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )
        ) : null}
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'sky' | 'emerald' | 'violet' | 'amber';
}) {
  const toneMap: Record<typeof tone, string> = {
    sky: 'from-sky-50 to-sky-50/30 text-sky-700 border-sky-100',
    emerald: 'from-emerald-50 to-emerald-50/30 text-emerald-700 border-emerald-100',
    violet: 'from-violet-50 to-violet-50/30 text-violet-700 border-violet-100',
    amber: 'from-amber-50 to-amber-50/30 text-amber-700 border-amber-100',
  };
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border bg-gradient-to-br px-3 py-2',
        toneMap[tone]
      )}
    >
      <span className="text-[11px] font-medium opacity-80">{label}</span>
      <span className="text-[14px] font-bold tabular-nums">{value}</span>
    </div>
  );
}

function LegendChip({
  color,
  label,
  dashed,
  active,
  onClick,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
        active
          ? 'border-hairline bg-white text-slate-700'
          : 'border-hairline bg-white text-slate-400'
      )}
    >
      <span
        className="inline-block h-0.5 w-4 rounded-full"
        style={{
          background: color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          height: dashed ? 0 : 2,
        }}
      />
      {label}
    </button>
  );
}
