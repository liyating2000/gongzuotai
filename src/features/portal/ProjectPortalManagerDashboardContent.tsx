import {
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpDown,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquare,
  Star,
  X,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import DirectorExpressTrigger from './DirectorExpressTrigger';
import MetricDailyBreakdownPage from './MetricDailyBreakdownModal';
import MetricFluctuationPanel from './MetricFluctuationPanel';
import TodayTodoPanel, {
  hotlineTodoItems,
  onlineTodoItems,
  type TodayTodoKey,
} from './TodayTodoPanel';
import {
  managerGroupFilters,
  managerOnlineFilters,
  type ManagerBusinessPeriodOption,
  type ManagerGroupFilter,
  type ManagerOnlineFilter,
  type ManagerPersonnelDateOption,
  type PersonnelFocusMetric,
} from './data';

type ManagerPortalDashboardContentProps = {
  allFilter: ManagerGroupFilter;
  onlineFilter: ManagerOnlineFilter;
  trendMonth: string;
  personnelDate: ManagerPersonnelDateOption;
  personnelFocusMetric: PersonnelFocusMetric;
  businessPeriod: ManagerBusinessPeriodOption;
  unreadDirectorMessageCount: number;
  isChannelLocked?: boolean;
  onAllFilterChange: (value: ManagerGroupFilter) => void;
  onOnlineFilterChange: (value: ManagerOnlineFilter) => void;
  onTrendMonthChange: (value: string) => void;
  onPersonnelDateChange: (value: ManagerPersonnelDateOption) => void;
  onPersonnelFocusMetricChange: (value: PersonnelFocusMetric) => void;
  onBusinessPeriodChange: (value: ManagerBusinessPeriodOption) => void;
  onOpenDirectorModal: () => void;
  onOpenOverviewDetail: () => void;
  onOpenBadRecordingModal: () => void;
  onOpenCriticalErrorModal: () => void;
  onOpenMessageService: () => void;
  onOpenRankingDetail: () => void;
  onOpenScheduleDisplay: () => void;
  onOpenWorkOrder?: () => void;
  onOpenCustomerFollow?: () => void;
  onOpenCourseList?: () => void;
  onOpenSummaryManagement?: () => void;
  isDirector?: boolean;
};

type MetricCardData = {
  id: string;
  label: string;
  todayValue: string;
  lastMonthValue: string;
  yoy: string;
  mom: string;
  momAlert: boolean;
  highlight: boolean;
  underline: boolean;
  hasSearch?: boolean;
  primary?: boolean;
};

type TrendPoint = {
  date: string;
  value: number;
  avg: number;
};

type ChartTooltipState = {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  business: number;
  manpower: number;
};

const metrics: MetricCardData[] = [
  {
    id: 'totalCalls',
    label: '总呼叫量',
    todayValue: '8897',
    lastMonthValue: '8897',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: false,
    underline: true,
    primary: true,
  },
  {
    id: 'resolveRate',
    label: '解决率',
    todayValue: '20.76%',
    lastMonthValue: '20.76%',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: true,
    underline: true,
    hasSearch: false,
    primary: true,
  },
  {
    id: 'satisfaction',
    label: '满意度',
    todayValue: '98.29%',
    lastMonthValue: '98.29%',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: false,
    underline: true,
    primary: true,
  },
  {
    id: 'evalRate',
    label: '参评率',
    todayValue: '99.27%',
    lastMonthValue: '99.27%',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: false,
    underline: true,
  },
  {
    id: 'firstResponse',
    label: '首次响应时长',
    todayValue: '02:35',
    lastMonthValue: '02:48',
    yoy: '+5%',
    mom: '-8%',
    momAlert: true,
    highlight: false,
    underline: true,
  },
  {
    id: 'avgResponse',
    label: '平均响应时长',
    todayValue: '03:12',
    lastMonthValue: '03:30',
    yoy: '+3%',
    mom: '-6%',
    momAlert: true,
    highlight: false,
    underline: true,
  },
  {
    id: 'totalDuration',
    label: '总通话时长',
    todayValue: '08:20:17',
    lastMonthValue: '08:20:17',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: false,
    underline: true,
  },
  {
    id: 'avgDuration',
    label: '平均通话时长',
    todayValue: '08:20:17',
    lastMonthValue: '08:20:17',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: false,
    underline: true,
  },
  {
    id: 'totalAcw',
    label: '总ACW时长',
    todayValue: '08:20:17',
    lastMonthValue: '08:20:17',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: true,
    underline: true,
  },
  {
    id: 'avgAcw',
    label: '平均ACW时长',
    todayValue: '07:20:17',
    lastMonthValue: '07:20:17',
    yoy: '+20%',
    mom: '-20%',
    momAlert: false,
    highlight: false,
    underline: true,
  },
  {
    id: 'breakDuration',
    label: '小休时长',
    todayValue: '08:20:17',
    lastMonthValue: '08:20:17',
    yoy: '+20%',
    mom: '-20%',
    momAlert: true,
    highlight: true,
    underline: true,
  },
  {
    id: 'qualityScore',
    label: '质检平均分',
    todayValue: '87/3条',
    lastMonthValue: '87/3条',
    yoy: '+20%',
    mom: '-20%',
    momAlert: false,
    highlight: false,
    underline: true,
    hasSearch: false,
    primary: true,
  },
];

type DistributionPoint = {
  label: string;
  business: number;
  manpower: number;
};

/**
 * 日维度 X 轴为 8:00–23:00 半小时粒度，周/月维度仍为整点粒度。
 */
const halfHourLabels: string[] = [];
for (let h = 8; h <= 23; h++) {
  halfHourLabels.push(`${h}:00`);
  if (h < 23) halfHourLabels.push(`${h}:30`);
}
const hourLabels = Array.from({ length: 24 }, (_, i) => String(i));

const chartDataByPeriod: Record<'日' | '周' | '月', DistributionPoint[]> = {
  // 日 — 8:00~23:00 半小时粒度
  日: halfHourLabels.map((label) => {
    const [hStr, mStr] = label.split(':');
    const hour = Number(hStr);
    const isHalf = mStr === '30';
    const baseFull = [0, 0, 0, 0, 0, 0, 0, 0, 5800, 7200, 6500, 6000, 4500, 8000, 9200, 8800, 7500, 6200, 4800, 3500, 2800, 2000, 1500, 900];
    const mpFull   = [0, 0, 0, 0, 0, 0, 0, 0, 15, 18, 17, 16, 13, 20, 19, 18, 17, 15, 12, 10, 8, 6, 5, 3];
    const b0 = baseFull[hour];
    const m0 = mpFull[hour];
    if (!isHalf) return { label, business: b0, manpower: m0 };
    const b1 = hour + 1 < 24 ? baseFull[hour + 1] : b0;
    const m1 = hour + 1 < 24 ? mpFull[hour + 1] : m0;
    return { label, business: Math.round((b0 + b1) / 2), manpower: Math.round(((m0 + m1) / 2) * 10) / 10 };
  }),
  // 周 — 周一到周五
  周: (() => {
    const weekLabels = ['周一', '周二', '周三', '周四', '周五'];
    const base = [6200, 7100, 6800, 7400, 5900];
    const mp   = [16, 18, 17, 19, 15];
    return weekLabels.map((label, i) => ({ label, business: base[i], manpower: mp[i] }));
  })(),
  // 月 — 本月1号到当天
  月: (() => {
    const today = new Date();
    const day = today.getDate();
    const seed = 42;
    return Array.from({ length: day }, (_, i) => {
      const d = i + 1;
      const r1 = ((seed + d * 7) * 9301 + 49297) % 233280;
      const r2 = ((seed + d * 13) * 9301 + 49297) % 233280;
      const business = 4000 + Math.round((r1 / 233280) * 5000);
      const manpower = 10 + Math.round((r2 / 233280) * 10);
      return { label: `${d}日`, business, manpower };
    });
  })(),
};

const dailyNotices = [
  { id: 1, title: '1.30 要求', content: '今天所有人都必须完成任务，以便使您能够按双11的工作，并且崩够...' },
  { id: 2, title: '1.30 要求', content: '今天所有人都必须完成任务，以便使您能够按双11的工作，并且崩够...' },
];

type RankingRow = {
  name: string;
  personal: string;
  groupAvg: string;
};

const rankingData: Record<'volume' | 'satisfaction', Record<'今日' | '昨日' | '本月', RankingRow[]>> = {
  volume: {
    今日: [
      { name: '张三', personal: '5600', groupAvg: '4300' },
      { name: '李四', personal: '5200', groupAvg: '4300' },
      { name: '王五', personal: '4900', groupAvg: '4300' },
      { name: '赵六', personal: '4600', groupAvg: '4300' },
      { name: '孙七', personal: '4300', groupAvg: '4300' },
      { name: '周八', personal: '4100', groupAvg: '4300' },
      { name: '吴九', personal: '3900', groupAvg: '4300' },
      { name: '郑十', personal: '3600', groupAvg: '4300' },
      { name: '钱一', personal: '3400', groupAvg: '4300' },
      { name: '冯二', personal: '3100', groupAvg: '4300' },
    ],
    昨日: [
      { name: '李四', personal: '5410', groupAvg: '4210' },
      { name: '张三', personal: '5120', groupAvg: '4210' },
      { name: '赵六', personal: '4780', groupAvg: '4210' },
      { name: '王五', personal: '4520', groupAvg: '4210' },
      { name: '孙七', personal: '4210', groupAvg: '4210' },
      { name: '周八', personal: '4050', groupAvg: '4210' },
      { name: '郑十', personal: '3820', groupAvg: '4210' },
      { name: '吴九', personal: '3700', groupAvg: '4210' },
      { name: '冯二', personal: '3350', groupAvg: '4210' },
      { name: '钱一', personal: '3180', groupAvg: '4210' },
    ],
    本月: [
      { name: '张三', personal: '12.6k', groupAvg: '10.4k' },
      { name: '李四', personal: '12.1k', groupAvg: '10.4k' },
      { name: '王五', personal: '11.5k', groupAvg: '10.4k' },
      { name: '赵六', personal: '11.1k', groupAvg: '10.4k' },
      { name: '孙七', personal: '10.8k', groupAvg: '10.4k' },
      { name: '周八', personal: '10.2k', groupAvg: '10.4k' },
      { name: '吴九', personal: '9.9k', groupAvg: '10.4k' },
      { name: '郑十', personal: '9.3k', groupAvg: '10.4k' },
      { name: '钱一', personal: '8.8k', groupAvg: '10.4k' },
      { name: '冯二', personal: '8.1k', groupAvg: '10.4k' },
    ],
  },
  satisfaction: {
    今日: [
      { name: '张三', personal: '99%', groupAvg: '96%' },
      { name: '李四', personal: '98%', groupAvg: '96%' },
      { name: '王五', personal: '97%', groupAvg: '96%' },
      { name: '赵六', personal: '97%', groupAvg: '96%' },
      { name: '孙七', personal: '96%', groupAvg: '96%' },
      { name: '周八', personal: '95%', groupAvg: '96%' },
      { name: '吴九', personal: '95%', groupAvg: '96%' },
      { name: '郑十', personal: '94%', groupAvg: '96%' },
      { name: '钱一', personal: '93%', groupAvg: '96%' },
      { name: '冯二', personal: '92%', groupAvg: '96%' },
    ],
    昨日: [
      { name: '李四', personal: '98%', groupAvg: '95%' },
      { name: '张三', personal: '98%', groupAvg: '95%' },
      { name: '赵六', personal: '97%', groupAvg: '95%' },
      { name: '王五', personal: '96%', groupAvg: '95%' },
      { name: '孙七', personal: '95%', groupAvg: '95%' },
      { name: '周八', personal: '94%', groupAvg: '95%' },
      { name: '郑十', personal: '94%', groupAvg: '95%' },
      { name: '吴九', personal: '93%', groupAvg: '95%' },
      { name: '冯二', personal: '92%', groupAvg: '95%' },
      { name: '钱一', personal: '91%', groupAvg: '95%' },
    ],
    本月: [
      { name: '张三', personal: '98%', groupAvg: '95%' },
      { name: '李四', personal: '97%', groupAvg: '95%' },
      { name: '王五', personal: '97%', groupAvg: '95%' },
      { name: '赵六', personal: '96%', groupAvg: '95%' },
      { name: '孙七', personal: '96%', groupAvg: '95%' },
      { name: '周八', personal: '95%', groupAvg: '95%' },
      { name: '吴九', personal: '94%', groupAvg: '95%' },
      { name: '郑十', personal: '94%', groupAvg: '95%' },
      { name: '钱一', personal: '93%', groupAvg: '95%' },
      { name: '冯二', personal: '92%', groupAvg: '95%' },
    ],
  },
};

const shiftInfo = {
  today: [
    { period: '早班', time: '8:00–12:00', members: '法伟、土芳、李娜、刘洋、土勾、陈祥、字磊、张敏、刘敏' },
    { period: '下午班', time: '13:00–17:00', members: '法伟、王光、李娜、刘叶、王勾、陈祥、李源、张敏、刘敏' },
    { period: '晚班', time: '20:00–1:00', members: '法伟、王芳、李娜、刘洋、王勾、陈祥、李源、张敏、刘敏' },
  ],
  tomorrow: [
    { period: '早班', time: '8:00–12:00', members: '王磊、李芳、张伟、刘洋、陈勾、赵祥、字磊、张敏、刘敏' },
    { period: '下午班', time: '13:00–17:00', members: '王磊、李芳、张伟、刘洋、陈勾、赵祥、字磊、张敏、刘敏' },
    { period: '晚班', time: '20:00–1:00', members: '王磊、李芳、张伟、刘洋、陈勾、赵祥、字磊、张敏、刘敏' },
  ],
  dayAfter: [
    { period: '早班', time: '8:00–12:00', members: '孙磊、周芳、吴伟、郑洋、王勾、冯祥、字磊、张敏、刘敏' },
    { period: '下午班', time: '13:00–17:00', members: '孙磊、周芳、吴伟、郑洋、王勾、冯祥、字磊、张敏、刘敏' },
    { period: '晚班', time: '20:00–1:00', members: '孙磊、周芳、吴伟、郑洋、王勾、冯祥、字磊、张敏、刘敏' },
  ],
} as const;

const trendMonths = ['2026.1', '2026.2', '2026.3', '2026.4', '2026.5', '2026.6'];
const chartHeight = 200;
const leftPadding = 50;
const rightPadding = 50;
const chartBottomPadding = 30;
const minChartCanvasWidth = 760;
const chartWidthPerItem = 38;

const generateTrendData = (month: string): TrendPoint[] => {
  const days = [
    { d: '5.1', v: 40, a: 38 },
    { d: '5.2', v: 50, a: 39 },
    { d: '5.3', v: 45, a: 40 },
    { d: '5.4', v: 28, a: 38 },
    { d: '5.5', v: 42, a: 39 },
    { d: '5.6', v: 38, a: 40 },
    { d: '5.7', v: 35, a: 39 },
    { d: '5.8', v: 48, a: 40 },
    { d: '5.9', v: 65, a: 41 },
    { d: '5.10', v: 50, a: 41 },
    { d: '5.11', v: 48, a: 41 },
    { d: '5.12', v: 50, a: 42 },
    { d: '5.13', v: 47, a: 42 },
    { d: '5.14', v: 49, a: 42 },
    { d: '5.15', v: 46, a: 42 },
    { d: '5.16', v: 50, a: 43 },
    { d: '5.17', v: 44, a: 43 },
    { d: '5.18', v: 32, a: 42 },
    { d: '5.19', v: 35, a: 42 },
    { d: '5.20', v: 40, a: 42 },
    { d: '5.21', v: 38, a: 42 },
    { d: '5.22', v: 42, a: 43 },
    { d: '5.23', v: 40, a: 43 },
    { d: '5.24', v: 22, a: 42 },
    { d: '5.25', v: 20, a: 41 },
  ];

  return days.map((day) => ({
    date: day.d.replace('5.', `${month.split('.')[1]}.`),
    value: day.v,
    avg: day.a,
  }));
};

const parseRankingValue = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (normalized.endsWith('%')) {
    return Number(normalized.replace('%', ''));
  }

  if (normalized.endsWith('k')) {
    return Number(normalized.replace('k', '')) * 1000;
  }

  return Number(normalized);
};

const dashboardPanelClassName = 'surface-card p-5';
const dashboardPanelTitleClassName = 'text-[15px] font-bold tracking-tight text-slate-800';
const dashboardSelectClassName =
  'focus-ring h-8 rounded-full border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 outline-none transition-colors hover:border-brand-300 hover:text-brand-600';
const dashboardLinkButtonClassName =
  'focus-ring inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-semibold text-brand-600 transition-colors hover:bg-brand-50/60 hover:text-brand-700';

const sectionTitleBarClassName = 'h-4 w-1 rounded-full';

function SectionTitle({
  title,
  gradient = 'from-brand-500 to-brand-400',
  children,
}: {
  title: string;
  gradient?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <h3 className={dashboardPanelTitleClassName}>{title}</h3>
      {children}
    </div>
  );
}

function MetricTrendModal({ label, onClose }: { label: string; onClose: () => void }) {
  const [month, setMonth] = useState('2026.5');
  const data = generateTrendData(month);
  const maxValue = Math.max(...data.map((item) => Math.max(item.value, item.avg)));
  const yMax = Math.ceil(maxValue / 10) * 10 + 10;
  const yTicks = Array.from({ length: Math.floor(yMax / 10) + 1 }, (_, index) => index * 10);
  const modalChartWidth = 680;
  const modalChartHeight = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 10;
  const padBottom = 30;
  const plotWidth = modalChartWidth - padLeft - padRight;
  const plotHeight = modalChartHeight - padTop - padBottom;
  const toX = (index: number) => padLeft + (index / (data.length - 1)) * plotWidth;
  const toY = (value: number) => padTop + plotHeight - (value / yMax) * plotHeight;
  const valueLine = data.map((item, index) => `${toX(index)},${toY(item.value)}`).join(' ');
  const avgLine = data.map((item, index) => `${toX(index)},${toY(item.avg)}`).join(' ');

  // Rendered via createPortal so it escapes the manager portal's
  // `animate-fade-in-up` ancestor whose final `transform: translateY(0)`
  // would otherwise become the containing block of `position: fixed`,
  // pinning the dialog to the (very tall) scroll content instead of the
  // viewport — making it appear far below the visible area.
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-fade-in-up w-full max-w-[760px] rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <SectionTitle title={`${label}趋势图`} gradient="from-brand-500 to-brand-400" />
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭趋势图弹窗"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4">
          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className={cn('cursor-pointer pr-8', dashboardSelectClassName)}
          >
            {trendMonths.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-hairline bg-gradient-to-b from-white to-slate-50/50 p-3">
          <svg width={modalChartWidth} height={modalChartHeight} viewBox={`0 0 ${modalChartWidth} ${modalChartHeight}`}>
            <defs>
              <linearGradient id="manager-modal-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3a5cff" />
                <stop offset="100%" stopColor="#5a7eff" />
              </linearGradient>
            </defs>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={padLeft} y1={toY(tick)} x2={padLeft + plotWidth} y2={toY(tick)} stroke="#eef2f7" strokeWidth={1} strokeDasharray="4 6" />
                <text x={padLeft - 4} y={toY(tick) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                  {tick}
                </text>
              </g>
            ))}

            <polyline points={avgLine} fill="none" stroke="#f5384a" strokeWidth={1.75} strokeDasharray="5 4" />
            <polyline points={valueLine} fill="none" stroke="url(#manager-modal-line)" strokeWidth={2.5} />

            {data.map((item, index) => (
              <circle key={`${item.date}-${index}`} cx={toX(index)} cy={toY(item.value)} r={3} fill="#3a5cff" />
            ))}

            {data.map((item, index) =>
              index % 2 === 0 ? (
                <text key={item.date} x={toX(index)} y={padTop + plotHeight + 18} textAnchor="middle" fontSize={10} fill="#94a3b8">
                  {item.date}
                </text>
              ) : null
            )}
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-center gap-8 text-[12px]">
          <span className="flex items-center gap-1.5 text-brand-600">
            <span className="h-[3px] w-5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400" />
            日{label}
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="h-[3px] w-5 rounded-full bg-rose-500" />
            日平均{label}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function MetricsPanel({
  channel,
  onOpenBadRecordingModal,
  onOpenCriticalErrorModal,
  onOpenBreakdown,
}: {
  channel: ManagerOnlineFilter;
  onOpenBadRecordingModal: () => void;
  onOpenCriticalErrorModal: () => void;
  onOpenBreakdown: (label: string) => void;
}) {
  const [modalLabel, setModalLabel] = useState<string | null>(null);
  const isOnline = channel === '在线';
  const onlineLabelOverrides: Record<string, string> = {
    totalCalls: '总接待量',
    totalDuration: '总沟通时长',
    avgDuration: '平均沟通时长',
  };
  const baseMetrics = metrics.filter((metric) => metric.id !== 'firstResponse' && metric.id !== 'avgResponse');
  const onlineExtraMetrics = metrics.filter((metric) => metric.id === 'firstResponse' || metric.id === 'avgResponse');
  const rawDisplayMetrics = isOnline
    ? [...baseMetrics.slice(0, 4), ...onlineExtraMetrics, ...baseMetrics.slice(4)]
    : baseMetrics;
  const displayMetrics = isOnline
    ? rawDisplayMetrics.map((m) => (onlineLabelOverrides[m.id] ? { ...m, label: onlineLabelOverrides[m.id] } : m))
    : rawDisplayMetrics;
  const primaryMetrics = displayMetrics.filter((m) => m.primary);
  const secondaryMetrics = displayMetrics.filter((m) => !m.primary);

  return (
    <>
      <div className={cn('mb-5', dashboardPanelClassName)}>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle title="核心指标" gradient="from-brand-500 to-brand-400" />
          <span className="text-[12px] text-slate-400">点击卡片查看趋势</span>
        </div>

        {/* Primary — 大卡 4 列 */}
        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              size="large"
              onLabelClick={() => setModalLabel(metric.label)}
              onIconClick={
                metric.id === 'resolveRate'
                  ? onOpenBadRecordingModal
                  : metric.id === 'qualityScore'
                    ? onOpenCriticalErrorModal
                    : undefined
              }
              onOpenDailyBreakdown={() => onOpenBreakdown(metric.label)}
            />
          ))}
        </div>

        {/* Secondary — 小卡等分填满 */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${secondaryMetrics.length}, minmax(0, 1fr))`,
          }}
        >
          {secondaryMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              size="small"
              onLabelClick={() => setModalLabel(metric.label)}
              onIconClick={
                metric.id === 'resolveRate'
                  ? onOpenBadRecordingModal
                  : metric.id === 'qualityScore'
                    ? onOpenCriticalErrorModal
                    : undefined
              }
              onOpenDailyBreakdown={() => onOpenBreakdown(metric.label)}
            />
          ))}
        </div>
      </div>

      {modalLabel ? <MetricTrendModal label={modalLabel} onClose={() => setModalLabel(null)} /> : null}
    </>
  );
}

function MetricCard({
  metric,
  size = 'large',
  onLabelClick,
  onIconClick,
  onOpenDailyBreakdown,
}: {
  key?: string;
  metric: MetricCardData;
  size?: 'large' | 'small';
  onLabelClick: () => void;
  onIconClick?: () => void;
  onOpenDailyBreakdown?: () => void;
}) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLabelClick();
    }
  };

  const yoyDown = metric.yoy.startsWith('-');
  const momDown = metric.mom.startsWith('-');
  const isLarge = size === 'large';

  return (
    <button
      type="button"
      onClick={onLabelClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'focus-ring press-lift surface-card group relative min-w-0 overflow-hidden text-left hover:border-brand-200',
        isLarge
          ? 'min-h-[108px] bg-gradient-to-br from-slate-50/60 to-white p-4 hover:shadow-md'
          : 'bg-white px-3 py-3 hover:bg-brand-50/40'
      )}
    >
      {isLarge ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-500/5 blur-2xl transition-opacity duration-300 group-hover:bg-brand-500/10"
        />
      ) : null}

      {onOpenDailyBreakdown ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`${metric.label}日明细`}
          title="查看每日明细"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDailyBreakdown();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onOpenDailyBreakdown();
            }
          }}
          className={cn(
            'focus-ring absolute z-10 inline-flex items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600',
            isLarge ? 'right-2 top-2 h-6 w-6' : 'right-1.5 top-1.5 h-5 w-5'
          )}
        >
          <CalendarRange size={isLarge ? 13 : 11} />
        </span>
      ) : null}

      <div className={cn('relative flex items-center gap-1.5', isLarge ? 'mb-3 pr-6' : 'mb-1.5 pr-5')}>
        <span className={cn(
          'font-semibold text-slate-500 transition-colors group-hover:text-brand-600',
          isLarge ? 'text-[13px]' : 'truncate text-[11px]'
        )}>
          {metric.label}
        </span>
        {metric.hasSearch && onIconClick ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onIconClick();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                onIconClick();
              }
            }}
            className="focus-ring inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:text-brand-500"
            aria-label={`${metric.label}详情`}
          >
            <FileText size={isLarge ? 13 : 11} />
          </span>
        ) : null}
      </div>

      <div className={cn('relative flex items-baseline gap-2', isLarge ? 'mb-1' : 'mb-0.5')}>
        <span className="w-8 flex-shrink-0 text-[11px] text-slate-400">今日</span>
        <span
          className={cn(
            'tabular-nums font-bold leading-none tracking-tight text-slate-900',
            isLarge ? 'text-[26px]' : 'text-[18px]'
          )}
        >
          {metric.todayValue}
        </span>
      </div>

      <div className={cn('relative flex items-baseline gap-2', isLarge ? 'mb-3' : 'mb-2')}>
        <span className="w-8 flex-shrink-0 text-[11px] text-slate-400">上月</span>
        <span className={cn('tabular-nums text-slate-500', isLarge ? 'text-[14px]' : 'text-[12px]')}>{metric.lastMonthValue}</span>
      </div>

      <div className={cn('relative space-y-1 border-t border-hairline pt-2 text-slate-500', isLarge ? 'text-[12px]' : 'text-[11px]')}>
        <div className="flex items-center justify-between">
          <span>同比</span>
          <span
            className={cn(
              'tabular-nums font-semibold',
              yoyDown ? 'text-rose-500' : 'text-accent-600'
            )}
          >
            {metric.yoy}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>环比</span>
          <span
            className={cn(
              'tabular-nums font-semibold',
              momDown ? 'text-rose-500' : 'text-accent-600'
            )}
          >
            {metric.mom}
          </span>
        </div>
      </div>
    </button>
  );
}

function ChartPanel() {
  const [groupType, setGroupType] = useState<'日' | '周' | '月'>('日');
  const [tooltip, setTooltip] = useState<ChartTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    business: 0,
    manpower: 0,
  });

  const activeChartData = chartDataByPeriod[groupType];
  // 三个周期数据都是小时粒度的均值，Y 轴范围相近
  const activeBusinessMax = 10000;
  const activeBusinessTicks = [0, 2000, 4000, 6000, 8000, 10000];
  const activeManpowerMax = 22;
  const activeManpowerTicks = [0, 5, 10, 15, 20];
  const plotWidth = Math.max(
    activeChartData.length * chartWidthPerItem,
    minChartCanvasWidth - leftPadding - rightPadding
  );
  const chartCanvasWidth = leftPadding + plotWidth + rightPadding;
  const pointSpacing = plotWidth / activeChartData.length;
  const barWidth = Math.min(24, Math.max(pointSpacing - 12, 10));
  const chartSvgHeight = chartHeight + chartBottomPadding;
  const manpowerPoints = activeChartData
    .map((item, index) => {
      const x = leftPadding + index * pointSpacing + pointSpacing / 2;
      const y = chartHeight - (item.manpower / activeManpowerMax) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const showTooltip = (
    event: ReactMouseEvent<SVGElement>,
    data: DistributionPoint,
    svgX: number,
    svgY: number
  ) => {
    const svgElement = event.currentTarget.ownerSVGElement;
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const scaleX = rect.width / chartCanvasWidth;
    const scaleY = rect.height / chartSvgHeight;
    setTooltip({
      visible: true,
      x: svgX * scaleX + rect.left,
      y: svgY * scaleY + rect.top,
      label: data.label,
      business: data.business,
      manpower: data.manpower,
    });
  };

  return (
    <div className={cn('relative', dashboardPanelClassName)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle title="业务量与人力时均分布" gradient="from-accent-500 to-accent-400" />
        <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 p-1">
          {(['日', '周', '月'] as const).map((option) => {
            const active = groupType === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setGroupType(option)}
                className={cn(
                  'focus-ring relative rounded-full px-4 py-1 text-[12px] font-medium transition-colors duration-300',
                  active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_6px_14px_-4px_rgba(58,92,255,0.5)]"
                  />
                ) : null}
                <span className="relative">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ width: chartCanvasWidth }}>
          <svg width={chartCanvasWidth} height={chartSvgHeight} viewBox={`0 0 ${chartCanvasWidth} ${chartSvgHeight}`}>
            <defs>
              <linearGradient id="manager-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3a5cff" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7aa0ff" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            {activeBusinessTicks.map((tick) => (
              <line
                key={tick}
                x1={leftPadding}
                y1={chartHeight - (tick / activeBusinessMax) * chartHeight}
                x2={chartCanvasWidth - rightPadding}
                y2={chartHeight - (tick / activeBusinessMax) * chartHeight}
                stroke="#eef2f7"
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            ))}

            {activeBusinessTicks.map((tick) => (
              <text
                key={`business-${tick}`}
                x={leftPadding - 4}
                y={chartHeight - (tick / activeBusinessMax) * chartHeight + 4}
                textAnchor="end"
                fontSize={10}
                fill="#94a3b8"
              >
                {tick === 0 ? '0' : tick >= 1000 ? `${tick / 1000}k` : tick}
              </text>
            ))}

            {activeManpowerTicks.map((tick) => (
              <text
                key={`manpower-${tick}`}
                x={chartCanvasWidth - rightPadding + 4}
                y={chartHeight - (tick / activeManpowerMax) * chartHeight + 4}
                textAnchor="start"
                fontSize={10}
                fill="#94a3b8"
              >
                {tick}
              </text>
            ))}

            {activeChartData.map((item, index) => {
              const barHeight = (item.business / activeBusinessMax) * chartHeight;
              const centerX = leftPadding + index * pointSpacing + pointSpacing / 2;
              const x = centerX - barWidth / 2;

              return (
                <rect
                  key={item.label}
                  x={x}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#manager-bar-gradient)"
                  rx={3}
                  className="cursor-pointer"
                  onMouseEnter={(event) => showTooltip(event, item, centerX, chartHeight - barHeight)}
                  onMouseLeave={() => setTooltip((previous) => ({ ...previous, visible: false }))}
                />
              );
            })}

            <polyline points={manpowerPoints} fill="none" stroke="#f5384a" strokeWidth={2} strokeDasharray="5 4" />

            {activeChartData.map((item, index) => {
              const cx = leftPadding + index * pointSpacing + pointSpacing / 2;
              const cy = chartHeight - (item.manpower / activeManpowerMax) * chartHeight;

              return (
                <circle
                  key={`dot-${item.label}`}
                  cx={cx}
                  cy={cy}
                  r={3.5}
                  fill="#ffffff"
                  stroke="#f5384a"
                  strokeWidth={2}
                  className="cursor-pointer"
                  onMouseEnter={(event) => showTooltip(event, item, cx, cy)}
                  onMouseLeave={() => setTooltip((previous) => ({ ...previous, visible: false }))}
                />
              );
            })}

            {activeChartData.map((item, index) => (
              <text
                key={`label-${item.label}`}
                x={leftPadding + index * pointSpacing + pointSpacing / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                fontSize={10}
                fill="#94a3b8"
              >
                {item.label}
              </text>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-6 text-[12px]">
        <span className="flex items-center gap-1.5 text-brand-600">
          <span className="h-3 w-4 rounded-sm bg-gradient-to-b from-brand-500 to-brand-400" />
          业务量
        </span>
        <span className="flex items-center gap-1.5 text-rose-500">
          <span className="h-[3px] w-5 rounded-full bg-rose-500" />
          人力
        </span>
      </div>

      {tooltip.visible ? (
        <div
          className="pointer-events-none fixed z-[121] rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-[12px] text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur"
          style={{ left: tooltip.x + 12, top: tooltip.y - 72 }}
        >
          <div className="mb-1.5 font-semibold text-slate-600">
            {`${tooltip.label}:00`}
          </div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-2 w-2 flex-shrink-0 rounded-sm bg-brand-500" />
            <span className="text-slate-500">业务量：</span>
            <span className="tabular-nums font-semibold text-slate-800">{tooltip.business.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-[2px] w-2 flex-shrink-0 bg-rose-500" />
            <span className="text-slate-500">人力：</span>
            <span className="tabular-nums font-semibold text-slate-800">{tooltip.manpower}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RightPanel({
  onOpenMessageService,
  onOpenRankingDetail,
  onOpenScheduleDisplay,
}: {
  onOpenMessageService: () => void;
  onOpenRankingDetail: () => void;
  onOpenScheduleDisplay: () => void;
}) {
  const [rankTab, setRankTab] = useState<'volume' | 'satisfaction'>('volume');
  const [rankPeriod, setRankPeriod] = useState<'今日' | '昨日' | '本月'>('今日');
  const [rankAsc, setRankAsc] = useState(false);
  const [shiftDay, setShiftDay] = useState<'today' | 'tomorrow' | 'dayAfter'>('today');
  const currentShift = shiftInfo[shiftDay];
  const displayedRankingList = [...rankingData[rankTab][rankPeriod]]
    .sort((left, right) => {
      const leftValue = parseRankingValue(left.personal);
      const rightValue = parseRankingValue(right.personal);
      return rankAsc ? leftValue - rightValue : rightValue - leftValue;
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <aside className="space-y-5">
      {/* ========== Daily notices ========== */}
      <div className="surface-card surface-card-hover p-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle title="每日必看" gradient="from-amber-400 to-orange-400" />
          <button
            type="button"
            onClick={onOpenMessageService}
            className={dashboardLinkButtonClassName}
          >
            查看更多
            <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {dailyNotices.map((notice, index) => (
            <div
              key={notice.id}
              className={index < dailyNotices.length - 1 ? 'border-b border-hairline pb-3' : ''}
            >
              <div className="mb-1 text-[14px] font-semibold text-slate-800">{notice.title}</div>
              <div className="line-clamp-2 text-[13px] leading-6 text-slate-500">{notice.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== Ranking ========== */}
      <div className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle title="排行榜" gradient="from-violet-500 to-indigo-400" />
          <button
            type="button"
            onClick={onOpenRankingDetail}
            className={dashboardLinkButtonClassName}
          >
            查看更多
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1">
          <select
            value={rankPeriod}
            onChange={(event) => setRankPeriod(event.target.value as '今日' | '昨日' | '本月')}
            className="focus-ring flex-1 cursor-pointer bg-transparent text-[13px] font-medium text-slate-600 outline-none"
          >
            <option>今日</option>
            <option>昨日</option>
            <option>本月</option>
          </select>
          <span className="h-4 w-px flex-shrink-0 bg-slate-200" />
          <div className="group relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setRankAsc((value) => !value)}
              className={cn(
                'focus-ring flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                rankAsc ? 'text-brand-600' : 'text-slate-500 hover:text-brand-600'
              )}
            >
              <ArrowUpDown size={14} />
            </button>
            <div className="pointer-events-none absolute right-0 top-7 z-10 rounded-md bg-slate-800 px-2.5 py-1.5 text-[12px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              {rankAsc ? '当前：正序排列' : '当前：倒序排列'}
            </div>
          </div>
        </div>

        <div className="relative mb-3 flex items-center rounded-full border border-slate-200 bg-slate-50/80 p-1">
          {(
            [
              { key: 'volume', label: '沟通量', Icon: MessageSquare },
              { key: 'satisfaction', label: '满意度', Icon: Star },
            ] as const
          ).map((tab) => {
            const active = rankTab === tab.key;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRankTab(tab.key)}
                className={cn(
                  'focus-ring relative flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-300',
                  active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_6px_14px_-4px_rgba(58,92,255,0.5)]"
                  />
                ) : null}
                <span className="relative flex items-center gap-1">
                  <Icon size={12} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-1 flex items-center px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span className="w-8 flex-shrink-0">排名</span>
          <span className="flex-1">姓名</span>
          <span className="text-right">个人 / 部门平均</span>
        </div>

        <div className="space-y-0.5">
          {displayedRankingList.map((item) => {
            const above = parseRankingValue(item.personal) >= parseRankingValue(item.groupAvg);
            const isTop3 = item.rank <= 3;
            return (
              <button
                type="button"
                key={item.rank}
                className="focus-ring flex w-full items-center rounded-lg px-1 py-2 text-[13px] transition-colors hover:bg-brand-50/50"
              >
                <span
                  className={cn(
                    'flex h-6 w-8 flex-shrink-0 items-center justify-center',
                    'tabular-nums font-bold'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px]',
                      isTop3
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_4px_10px_-2px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {item.rank}
                  </span>
                </span>
                <span className="flex-1 text-[14px] font-medium text-slate-800">{item.name}</span>
                <span className="text-right tabular-nums">
                  <span
                    className={cn(
                      'font-semibold',
                      above ? 'text-accent-600' : 'text-rose-500'
                    )}
                  >
                    {item.personal}
                  </span>
                  <span className="mx-0.5 text-slate-300">/</span>
                  <span className="text-slate-400">{item.groupAvg}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== Shift ========== */}
      <div className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle title="班次信息" gradient="from-accent-500 to-accent-400" />
          <button
            type="button"
            onClick={onOpenScheduleDisplay}
            className={dashboardLinkButtonClassName}
          >
            查看更多
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="relative mb-4 flex items-center rounded-full border border-slate-200 bg-slate-50/80 p-1">
          {(
            [
              { key: 'today', label: '今天' },
              { key: 'tomorrow', label: '明天' },
              { key: 'dayAfter', label: '后天' },
            ] as const
          ).map((item) => {
            const active = shiftDay === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setShiftDay(item.key)}
                className={cn(
                  'focus-ring relative flex-1 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors duration-300',
                  active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_6px_14px_-4px_rgba(58,92,255,0.5)]"
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {currentShift.map((shift, index) => (
            <div
              key={`${shift.period}-${index}`}
              className={index < currentShift.length - 1 ? 'border-b border-hairline pb-3' : ''}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex rounded-full border border-brand-200/70 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600">
                  {shift.period}
                </span>
                <span className="tabular-nums text-[13px] font-semibold text-slate-700">{shift.time}</span>
              </div>
              <div className="text-[13px] leading-6 text-slate-500">{shift.members}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function ProjectPortalManagerDashboardContent({
  allFilter,
  onlineFilter,
  trendMonth,
  personnelDate,
  personnelFocusMetric,
  businessPeriod,
  unreadDirectorMessageCount,
  isChannelLocked = false,
  onAllFilterChange,
  onOnlineFilterChange,
  onTrendMonthChange,
  onPersonnelDateChange,
  onPersonnelFocusMetricChange,
  onBusinessPeriodChange,
  onOpenDirectorModal,
  onOpenOverviewDetail,
  onOpenBadRecordingModal,
  onOpenCriticalErrorModal,
  onOpenMessageService,
  onOpenRankingDetail,
  onOpenScheduleDisplay,
  onOpenWorkOrder,
  onOpenCustomerFollow,
  onOpenCourseList,
  onOpenSummaryManagement,
  isDirector = false,
}: ManagerPortalDashboardContentProps) {
  const [breakdownLabel, setBreakdownLabel] = useState<string | null>(null);
  const handleTodayTodoClick = (key: TodayTodoKey) => {
    switch (key) {
      case 'work-order':
        onOpenWorkOrder?.();
        break;
      case 'customer-follow':
        onOpenCustomerFollow?.();
        break;
      case 'course-list':
        onOpenCourseList?.();
        break;
      case 'summary-pending':
        onOpenSummaryManagement?.();
        break;
    }
  };
  const todayTodoItems =
    onlineFilter === '在线' ? onlineTodoItems : hotlineTodoItems;
  void trendMonth;
  void personnelDate;
  void personnelFocusMetric;
  void businessPeriod;
  void onTrendMonthChange;
  void onPersonnelDateChange;
  void onPersonnelFocusMetricChange;
  void onBusinessPeriodChange;
  void onOpenOverviewDetail;

  if (breakdownLabel) {
    return (
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
        <MetricDailyBreakdownPage
          metricLabel={breakdownLabel}
          onBack={() => setBreakdownLabel(null)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="space-y-6 rounded-3xl border border-hairline bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        {/* ========== Header: filters + Director Express ========== */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={allFilter}
                onChange={(event) => onAllFilterChange(event.target.value as ManagerGroupFilter)}
                className={cn('w-[140px] cursor-pointer appearance-none pr-8', dashboardSelectClassName)}
              >
                {managerGroupFilters.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {isChannelLocked ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-[13px] font-semibold text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-400" />
                {onlineFilter}
              </div>
            ) : (
              <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 p-1">
                {managerOnlineFilters.map((option) => {
                  const active = onlineFilter === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onOnlineFilterChange(option as ManagerOnlineFilter)}
                      className={cn(
                        'focus-ring relative rounded-full px-5 py-1.5 text-[13px] font-semibold transition-colors duration-300',
                        active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                      )}
                      aria-pressed={active}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_8px_22px_-6px_rgba(58,92,255,0.55)]"
                        />
                      ) : null}
                      <span className="relative">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DirectorExpressTrigger
            unreadCount={unreadDirectorMessageCount}
            onClick={onOpenDirectorModal}
            buttonClassName="focus-ring press-lift rounded-full bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.55)] hover:shadow-[0_14px_30px_-8px_rgba(16,185,129,0.65)]"
            badgeClassName="-top-1.5 -right-1.5 h-[18px] w-[18px] bg-gradient-to-br from-rose-500 to-orange-500 text-[11px] font-bold shadow-[0_4px_10px_rgba(244,63,94,0.45)]"
          />
        </header>

        {/* ========== Main layout ========== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <TodayTodoPanel
              items={todayTodoItems}
              onItemClick={handleTodayTodoClick}
            />
            <MetricsPanel
              channel={onlineFilter}
              onOpenBadRecordingModal={onOpenBadRecordingModal}
              onOpenCriticalErrorModal={onOpenCriticalErrorModal}
              onOpenBreakdown={setBreakdownLabel}
            />
            <MetricFluctuationPanel />
            <ChartPanel />
          </div>

          <RightPanel
            onOpenMessageService={onOpenMessageService}
            onOpenRankingDetail={onOpenRankingDetail}
            onOpenScheduleDisplay={onOpenScheduleDisplay}
          />
        </div>
      </div>
    </div>
  );
}
