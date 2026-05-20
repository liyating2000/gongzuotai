import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Download,
  GraduationCap,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import {
  portalBackButtonClassName,
  portalDetailCardClassName,
  portalExportButtonClassName,
} from './portalStyles';
import CoachingModal, { type CoachingAbnormalInfo } from './CoachingModal';

type MetricDailyBreakdownPageProps = {
  metricLabel: string;
  onBack: () => void;
};

const agentNames = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '孙七',
  '周八',
  '吴九',
  '郑十',
  '钱一',
  '冯二',
  '陈三',
  '褚四',
];

const skillGroups = ['售后一组', '售前二组', '投诉专组', 'VIP 组'];

const monthOptions = ['2026-04', '2026-03', '2026-02', '2026-01'];

const seedFromString = (s: string) => {
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

type ValueKind = 'count' | 'percent' | 'duration';

const detectKind = (label: string): ValueKind => {
  if (/率|度|分|比/.test(label)) return 'percent';
  if (/时长|时间|ACW|响应|后处理|小休|通话/.test(label)) return 'duration';
  return 'count';
};

const daysInMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

const formatValue = (kind: ValueKind, raw: number) => {
  if (kind === 'percent') return `${(raw * 0.0008 + 85).toFixed(1)}%`;
  if (kind === 'duration') {
    const minutes = Math.floor(raw % 60);
    const hours = Math.floor(raw / 60) % 10;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return raw.toString();
};

const NAME_COL_WIDTH = 108;
const TOTAL_COL_WIDTH = 100;
const ABNORMAL_COL_WIDTH = 88;
const ACTION_COL_WIDTH = 96;
const DAY_COL_WIDTH = 64;

const STICKY_TOTAL_LEFT = NAME_COL_WIDTH;
const STICKY_ABNORMAL_LEFT = NAME_COL_WIDTH + TOTAL_COL_WIDTH;
const STICKY_ACTION_LEFT = NAME_COL_WIDTH + TOTAL_COL_WIDTH + ABNORMAL_COL_WIDTH;

type Row = {
  name: string;
  agentNumber: string;
  skillGroup: string;
  total: string;
  meanLabel: string;
  daily: string[];
  abnormalDays: number[];
  abnormalSet: Set<number>;
};

export default function MetricDailyBreakdownPage({
  metricLabel,
  onBack,
}: MetricDailyBreakdownPageProps) {
  const [month, setMonth] = useState(monthOptions[0]);
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [sortByAbnormal, setSortByAbnormal] = useState(true);
  const [coachingTarget, setCoachingTarget] = useState<Row | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { rows, days, kind } = useMemo(() => {
    const kind = detectKind(metricLabel);
    const dayCount = daysInMonth(month);
    const days = Array.from({ length: dayCount }, (_, i) => i + 1);
    const baseSeed = seedFromString(`${metricLabel}-${month}`);

    const rows: Row[] = agentNames.map((name, rowIdx) => {
      const rowSeed = baseSeed + rowIdx * 131;
      const raws: number[] = days.map((_, i) => {
        const r = rand(rowSeed + i * 17);
        return kind === 'percent'
          ? 60 + r * 1200
          : kind === 'duration'
            ? 120 + Math.floor(r * 360)
            : Math.floor(80 + r * 240);
      });

      const mean = raws.reduce((a, b) => a + b, 0) / raws.length;
      const abnormalThreshold = mean * 0.78;
      const abnormalDays: number[] = [];
      raws.forEach((v, i) => {
        if (v < abnormalThreshold) abnormalDays.push(i + 1);
      });

      const daily = raws.map((r) => formatValue(kind, r));
      const total =
        kind === 'percent'
          ? `${(70 + rand(rowSeed) * 25).toFixed(1)}%`
          : kind === 'duration'
            ? formatValue('duration', raws.reduce((a, b) => a + b, 0))
            : raws.reduce((a, b) => a + Math.floor(b), 0).toString();
      const meanLabel = formatValue(kind, mean);

      return {
        name,
        agentNumber: `A${(10000 + rowIdx * 7).toString().padStart(5, '0')}`,
        skillGroup: skillGroups[rowIdx % skillGroups.length],
        total,
        meanLabel,
        daily,
        abnormalDays,
        abnormalSet: new Set(abnormalDays.map((d) => d - 1)),
      };
    });

    return { rows, days, kind };
  }, [metricLabel, month]);

  const displayRows = useMemo(() => {
    let list = rows;
    if (onlyAbnormal) list = list.filter((r) => r.abnormalDays.length > 0);
    if (sortByAbnormal) {
      list = [...list].sort((a, b) => b.abnormalDays.length - a.abnormalDays.length);
    }
    return list;
  }, [rows, onlyAbnormal, sortByAbnormal]);

  const totalAbnormal = rows.reduce((sum, r) => sum + r.abnormalDays.length, 0);
  const abnormalAgentCount = rows.filter((r) => r.abnormalDays.length > 0).length;

  return (
    <div className={cn(portalDetailCardClassName, 'min-w-0 w-full overflow-hidden')}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={cn(portalBackButtonClassName, 'shrink-0')}
          >
            <ArrowLeft size={14} />
            返回
          </button>
          <span className="h-4 w-px shrink-0 bg-slate-200" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[16px] font-bold tracking-tight text-slate-800">
              {metricLabel}
              <span className="ml-2 text-[12px] font-medium text-slate-400">日明细</span>
            </h2>
            <div className="mt-0.5 truncate text-[12px] text-slate-400">
              姓名、总数、异常、操作四列固定，向右滚动查看每日数值
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="focus-ring h-9 appearance-none rounded-full border border-hairline bg-white pl-3 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-colors hover:border-brand-200"
            >
              {monthOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
          <button type="button" className={portalExportButtonClassName}>
            <Download size={13} />
            导出
          </button>
        </div>
      </div>

      {/* 异常汇总条 + 筛选 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50/80 via-amber-50/40 to-transparent px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-[12px] text-slate-600">
          <AlertTriangle size={14} className="shrink-0 text-rose-500" />
          <span>
            本月检测到
            <span className="mx-1 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {totalAbnormal} 条
            </span>
            异常数据 · 涉及
            <span className="mx-1 font-semibold text-rose-600">{abnormalAgentCount}</span>
            名员工（低于行均值 22% 以上视为异常）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-brand-200">
            <input
              type="checkbox"
              checked={onlyAbnormal}
              onChange={(e) => setOnlyAbnormal(e.target.checked)}
              className="h-3.5 w-3.5 accent-rose-500"
            />
            仅看异常员工
          </label>
          <label className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-brand-200">
            <input
              type="checkbox"
              checked={sortByAbnormal}
              onChange={(e) => setSortByAbnormal(e.target.checked)}
              className="h-3.5 w-3.5 accent-brand-500"
            />
            按异常数降序
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 min-w-0 w-full flex-1 overflow-auto rounded-2xl border border-hairline bg-white custom-scrollbar">
        <table className="w-max border-collapse text-left text-[12px]">
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
            <tr>
              <th
                className="sticky left-0 z-30 border-r border-hairline bg-slate-100 px-4 py-3 text-center font-semibold"
                style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
              >
                姓名
              </th>
              <th
                className="sticky z-30 border-r border-hairline bg-slate-100 px-4 py-3 text-center font-semibold"
                style={{
                  left: STICKY_TOTAL_LEFT,
                  width: TOTAL_COL_WIDTH,
                  minWidth: TOTAL_COL_WIDTH,
                }}
              >
                总数
              </th>
              <th
                className="sticky z-30 border-r border-hairline bg-slate-100 px-4 py-3 text-center font-semibold"
                style={{
                  left: STICKY_ABNORMAL_LEFT,
                  width: ABNORMAL_COL_WIDTH,
                  minWidth: ABNORMAL_COL_WIDTH,
                }}
              >
                异常
              </th>
              <th
                className={cn(
                  'sticky z-30 border-r border-hairline bg-slate-100 px-4 py-3 text-center font-semibold',
                  'shadow-[1px_0_0_rgba(15,23,42,0.05)]'
                )}
                style={{
                  left: STICKY_ACTION_LEFT,
                  width: ACTION_COL_WIDTH,
                  minWidth: ACTION_COL_WIDTH,
                }}
              >
                操作
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className="px-3 py-3 text-right font-medium tabular-nums"
                  style={{ width: DAY_COL_WIDTH, minWidth: DAY_COL_WIDTH }}
                >
                  {d}日
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {displayRows.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const rowBg = isEven ? 'bg-white' : 'bg-slate-50';
              const abnormalCount = row.abnormalDays.length;
              return (
                <tr key={row.name} className={cn(rowBg, 'transition-colors')}>
                  <td
                    className={cn(
                      'sticky left-0 z-10 border-r border-hairline px-4 py-2.5 text-center font-semibold text-slate-800',
                      rowBg
                    )}
                    style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
                  >
                    {row.name}
                  </td>
                  <td
                    className={cn(
                      'sticky z-10 border-r border-hairline px-4 py-2.5 text-center tabular-nums font-bold text-brand-600',
                      rowBg
                    )}
                    style={{
                      left: STICKY_TOTAL_LEFT,
                      width: TOTAL_COL_WIDTH,
                      minWidth: TOTAL_COL_WIDTH,
                    }}
                  >
                    {row.total}
                  </td>
                  <td
                    className={cn(
                      'sticky z-10 border-r border-hairline px-2 py-2.5 text-center tabular-nums',
                      rowBg
                    )}
                    style={{
                      left: STICKY_ABNORMAL_LEFT,
                      width: ABNORMAL_COL_WIDTH,
                      minWidth: ABNORMAL_COL_WIDTH,
                    }}
                  >
                    {abnormalCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                        <AlertTriangle size={10} />
                        {abnormalCount} 天
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                        正常
                      </span>
                    )}
                  </td>
                  <td
                    className={cn(
                      'sticky z-10 border-r border-hairline px-2 py-2.5 text-center',
                      'shadow-[1px_0_0_rgba(15,23,42,0.05)]',
                      rowBg
                    )}
                    style={{
                      left: STICKY_ACTION_LEFT,
                      width: ACTION_COL_WIDTH,
                      minWidth: ACTION_COL_WIDTH,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setCoachingTarget(row)}
                      disabled={abnormalCount === 0}
                      className={cn(
                        'focus-ring press-lift inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all',
                        abnormalCount > 0
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-[0_6px_14px_-6px_rgba(245,158,11,0.6)] hover:brightness-105'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                      )}
                      title={abnormalCount > 0 ? '针对该员工发起辅导' : '无异常'}
                    >
                      <GraduationCap size={12} />
                      辅导
                    </button>
                  </td>
                  {row.daily.map((v, i) => {
                    const isAb = row.abnormalSet.has(i);
                    return (
                      <td
                        key={i}
                        className={cn(
                          'px-3 py-2.5 text-right tabular-nums',
                          isAb &&
                            'bg-rose-50 font-semibold text-rose-600 ring-1 ring-inset ring-rose-200/50'
                        )}
                        style={{ width: DAY_COL_WIDTH, minWidth: DAY_COL_WIDTH }}
                      >
                        {v}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + days.length}
                  className="px-6 py-12 text-center text-[13px] text-slate-400"
                >
                  当前筛选条件下无数据
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 text-[12px] text-slate-400">
        <span>
          共 {displayRows.length} / {rows.length} 人 · {days.length} 天 · 数据类型：
          {kind === 'percent' ? '百分比' : kind === 'duration' ? '时长' : '数量'}
        </span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-100 ring-1 ring-inset ring-rose-200" />
            异常单元格
          </span>
          <span className="inline-flex items-center gap-1">
            <GraduationCap size={12} className="text-amber-500" />
            一键发起辅导
          </span>
        </span>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed bottom-10 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-slate-900/90 px-5 py-2 text-[13px] font-medium text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
          {toast}
        </div>
      ) : null}

      {coachingTarget ? (
        <CoachingModal
          isOpen
          agentName={coachingTarget.name}
          agentNumber={coachingTarget.agentNumber}
          skillGroup={coachingTarget.skillGroup}
          metricLabel={metricLabel}
          month={month}
          abnormal={{
            days: coachingTarget.abnormalDays,
            total: coachingTarget.total,
            meanLabel: coachingTarget.meanLabel,
          } satisfies CoachingAbnormalInfo}
          onClose={() => setCoachingTarget(null)}
          onSubmit={({ channel }) => {
            const channelLabel =
              channel === 'call' ? '即时通话' : channel === 'feishu' ? '飞书消息' : '预约 1v1';
            setToast(
              `已通过【${channelLabel}】向 ${coachingTarget.name} 发起 ${metricLabel} 辅导`
            );
            setCoachingTarget(null);
            window.setTimeout(() => setToast(null), 2600);
          }}
        />
      ) : null}
    </div>
  );
}
