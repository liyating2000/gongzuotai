import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquare,
  Smile,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import learningRecommendCoverOne from '../../assets/video-icons/video-photo1.png';
import learningRecommendCoverTwo from '../../assets/video-icons/video-photo2.png';
import DirectorExpressTrigger from './DirectorExpressTrigger';
import MetricTrendModal from './MetricTrendModal';
import TodayTodoPanel, {
  hotlineTodoItems,
  onlineTodoItems,
  type TodayTodoKey,
} from './TodayTodoPanel';
import {
  communicationStarEmployees,
  shiftScheduleByDay,
  type ShiftScheduleDay,
  type StarEmployee,
  type StarEmployeeMetric,
} from './data';

type AgentPortalSubTab = 'online' | 'hotline';

type MetricCard = {
  label: string;
  value: string;
  note: string;
  primary?: boolean;
  danger?: boolean;
  emphasis?: string;
  withIcon?: boolean;
};

type AgentPortalDashboardContentProps = {
  agentSubTab: AgentPortalSubTab;
  starEmployeeMetric: StarEmployeeMetric;
  satisfactionStarEmployees: StarEmployee[];
  activeShiftDay: ShiftScheduleDay;
  unreadDirectorMessageCount: number;
  isChannelLocked?: boolean;
  /** When true, render the 今日待办 panel at the top of the left column. */
  showTodayTodo?: boolean;
  onAgentSubTabChange: (tab: AgentPortalSubTab) => void;
  onStarEmployeeMetricChange: (metric: StarEmployeeMetric) => void;
  onActiveShiftDayChange: (day: ShiftScheduleDay) => void;
  onOpenDirectorModal: () => void;
  onOpenBadRecordingModal: () => void;
  onOpenCriticalErrorModal: () => void;
  onOpenMessageService: () => void;
  onOpenRankingDetail: () => void;
  onOpenScheduleDisplay: () => void;
  onOpenOnlineWorkbench?: () => void;
  onOpenWorkOrder?: () => void;
  onOpenCustomerFollow?: () => void;
  onOpenCourseList?: () => void;
  onOpenSummaryManagement?: () => void;
};

const hotlineMetricCards: readonly MetricCard[] = [
  { label: '总呼叫量', value: '3099', note: '部门平均 3099', primary: true },
  { label: '解决率', value: '20.00% ', emphasis: '(21/102)', note: '部门平均 20.00%', danger: true, primary: true },
  { label: '满意度', value: '20.00% ', emphasis: '(21/102)', note: '部门平均 20.00%', danger: true, primary: true },
  { label: '参评率', value: '20.00% ', emphasis: '(21/102)', note: '部门平均 20.00%', danger: true },
  { label: '总通话时长', value: '4:20:10', note: '部门平均 4:20:10' },
  { label: '平均通话时长', value: '00:01:20', note: '部门平均 00:01:20' },
  { label: '总ACW时长', value: '01:20:40', note: '部门平均 00:01:20', danger: true },
  { label: '平均ACW时长', value: '00:00:40', note: '部门平均 00:01:20' },
  { label: '小休时长', value: '01:20:40', note: '部门平均 00:01:20', danger: true },
  { label: '质检平均分', value: '85/3条', note: '部门平均 90', primary: true },
];

const hotlineYesterdayMetricCards: readonly MetricCard[] = [
  { label: '总呼叫量', value: '2876', note: '部门平均 2950', primary: true },
  { label: '解决率', value: '22.10% ', emphasis: '(35/158)', note: '部门平均 21.40%', danger: true, primary: true },
  { label: '满意度', value: '21.80% ', emphasis: '(34/158)', note: '部门平均 22.60%', danger: true, primary: true },
  { label: '参评率', value: '23.50% ', emphasis: '(37/158)', note: '部门平均 22.90%', danger: true },
  { label: '总通话时长', value: '4:02:55', note: '部门平均 4:15:08' },
  { label: '平均通话时长', value: '00:01:18', note: '部门平均 00:01:22' },
  { label: '总ACW时长', value: '01:12:30', note: '部门平均 00:01:18', danger: true },
  { label: '平均ACW时长', value: '00:00:36', note: '部门平均 00:01:18' },
  { label: '小休时长', value: '01:05:20', note: '部门平均 00:01:18', danger: true },
  { label: '质检平均分', value: '86/4条', note: '部门平均 89', primary: true },
];

const hotlineMonthlyMetricCards: readonly MetricCard[] = [
  { label: '总呼叫量', value: '28690', note: '部门平均 27420', primary: true },
  { label: '解决率', value: '23.80% ', emphasis: '(682/2869)', note: '部门平均 22.50%', danger: true, primary: true },
  { label: '满意度', value: '24.60% ', emphasis: '(705/2869)', note: '部门平均 23.10%', danger: true, primary: true },
  { label: '参评率', value: '25.20% ', emphasis: '(723/2869)', note: '部门平均 24.30%', danger: true },
  { label: '总通话时长', value: '42:18:35', note: '部门平均 39:25:10' },
  { label: '平均通话时长', value: '00:01:31', note: '部门平均 00:01:25' },
  { label: '总ACW时长', value: '10:52:40', note: '部门平均 09:43:18', danger: true },
  { label: '平均ACW时长', value: '00:00:46', note: '部门平均 00:00:42' },
  { label: '小休时长', value: '09:15:20', note: '部门平均 08:42:10', danger: true },
  { label: '质检平均分', value: '88/26条', note: '部门平均 91', primary: true },
];

const onlineMetricCards: readonly MetricCard[] = [
  { label: '总接待量', value: '3099', note: '部门平均 3099', primary: true },
  { label: '解决率', value: '20.00%', note: '部门平均', danger: true, primary: true },
  { label: '满意度', value: '20.00%', note: '部门平均', danger: true, primary: true },
  { label: '参评率', value: '20.00%', note: '部门平均', danger: true },
  { label: '首次响应时长', value: '00:00:4', note: '部门平均' },
  { label: '平均响应时长', value: '00:00:4', note: '部门平均' },
  { label: '总沟通时长', value: '4:20:10', note: '部门平均' },
  { label: '平均沟通时长', value: '00:01:2', note: '部门平均' },
  { label: '总后处理时长', value: '01:20:4', note: '部门平均', danger: true },
  { label: '平均后处理时长', value: '00:00:4', note: '部门平均' },
  { label: '小休时长', value: '01:20:4', note: '部门平均', danger: true },
  { label: '质检平均分', value: '85/3条', note: '部门平均 90', primary: true },
];

const onlineYesterdayMetricCards: readonly MetricCard[] = [
  { label: '总接待量', value: '2852', note: '部门平均 2920', primary: true },
  { label: '解决率', value: '21.40%', note: '部门平均 22.10%', danger: true, primary: true },
  { label: '满意度', value: '22.80%', note: '部门平均 23.40%', danger: true, primary: true },
  { label: '参评率', value: '23.20%', note: '部门平均 24.00%', danger: true },
  { label: '首次响应时长', value: '00:00:5', note: '部门平均' },
  { label: '平均响应时长', value: '00:00:6', note: '部门平均' },
  { label: '总沟通时长', value: '4:08:55', note: '部门平均' },
  { label: '平均沟通时长', value: '00:01:3', note: '部门平均' },
  { label: '总后处理时长', value: '01:12:38', note: '部门平均', danger: true },
  { label: '平均后处理时长', value: '00:00:5', note: '部门平均' },
  { label: '小休时长', value: '01:10:24', note: '部门平均', danger: true },
  { label: '质检平均分', value: '87/5条', note: '部门平均 90', primary: true },
];

const onlineMonthlyMetricCards: readonly MetricCard[] = [
  { label: '总接待量', value: '25890', note: '部门平均 24120', primary: true },
  { label: '解决率', value: '22.80%', note: '部门平均 21.60%', danger: true, primary: true },
  { label: '满意度', value: '24.20%', note: '部门平均 23.80%', danger: true, primary: true },
  { label: '参评率', value: '25.10%', note: '部门平均 24.40%', danger: true },
  { label: '首次响应时长', value: '00:00:5', note: '部门平均 00:00:6' },
  { label: '平均响应时长', value: '00:00:6', note: '部门平均 00:00:7' },
  { label: '总沟通时长', value: '39:42:15', note: '部门平均 36:18:40' },
  { label: '平均沟通时长', value: '00:01:4', note: '部门平均 00:01:3' },
  { label: '总后处理时长', value: '08:45:2', note: '部门平均 07:58:4', danger: true },
  { label: '平均后处理时长', value: '00:00:5', note: '部门平均 00:00:4' },
  { label: '小休时长', value: '08:18:4', note: '部门平均 07:42:5', danger: true },
  { label: '质检平均分', value: '89/28条', note: '部门平均 91', primary: true },
];

const metricPeriodOptions = ['今日', '昨日', '本月'] as const;

const hotlineRecentWorkOrders = [
  {
    id: 'WO-20231014-001',
    customer: '张三',
    customerAvatarTone: 'tone-warm',
    topic: '产品质量问题，要求退货退款',
    status: '处理中',
    statusClassName: 'border border-amber-200/70 bg-amber-50 text-amber-700',
    priority: '高',
    priorityClassName: 'text-rose-500',
  },
  {
    id: 'WO-20231014-002',
    customer: '李四',
    customerAvatarTone: 'tone-cool',
    topic: '无法登录账户，需要密码重置帮助',
    status: '已解决',
    statusClassName: 'border border-emerald-200/70 bg-emerald-50 text-emerald-700',
    priority: '中',
    priorityClassName: 'text-amber-500',
  },
  {
    id: 'WO-20231014-003',
    customer: '王五',
    customerAvatarTone: 'tone-violet',
    topic: '咨询新功能使用方法和最佳实践',
    status: '等待回复',
    statusClassName: 'border border-indigo-200/70 bg-indigo-50 text-indigo-600',
    priority: '低',
    priorityClassName: 'text-slate-400',
  },
  {
    id: 'WO-20231014-004',
    customer: '赵六',
    customerAvatarTone: 'tone-mint',
    topic: '系统升级后数据导入功能无法使用',
    status: '已分配',
    statusClassName: 'border border-violet-200/70 bg-violet-50 text-violet-600',
    priority: '高',
    priorityClassName: 'text-rose-500',
  },
] as const;

const hotlineLearningRecommendations = [
  {
    title: '提升客户沟通技巧的5个实用方法',
    description: '学习如何更有效地倾听客户需求，提高一次解决率与服务体验。',
    imageSrc: learningRecommendCoverOne,
    duration: '8分钟视频',
    tag: '沟通技巧',
  },
  {
    title: '智能体系功能全解析：提升工作效率30%',
    description: '了解热线工作台关键能力，快速掌握高频功能与处理路径。',
    imageSrc: learningRecommendCoverTwo,
    duration: '12分钟课程',
    tag: '系统实操',
  },
] as const;

export default function AgentPortalDashboardContent({
  agentSubTab,
  starEmployeeMetric,
  satisfactionStarEmployees,
  activeShiftDay,
  unreadDirectorMessageCount,
  isChannelLocked = false,
  showTodayTodo = false,
  onAgentSubTabChange,
  onStarEmployeeMetricChange,
  onActiveShiftDayChange,
  onOpenDirectorModal,
  onOpenBadRecordingModal,
  onOpenCriticalErrorModal,
  onOpenMessageService,
  onOpenRankingDetail,
  onOpenScheduleDisplay,
  onOpenOnlineWorkbench,
  onOpenWorkOrder,
  onOpenCustomerFollow,
  onOpenCourseList,
  onOpenSummaryManagement,
}: AgentPortalDashboardContentProps) {
  const handleTodayTodoClick = (key: TodayTodoKey) => {
    switch (key) {
      case 'online-workspace':
        onOpenOnlineWorkbench?.();
        return;
      case 'work-order':
        onOpenWorkOrder?.();
        return;
      case 'customer-follow':
        onOpenCustomerFollow?.();
        return;
      case 'course-list':
        onOpenCourseList?.();
        return;
      case 'summary-pending':
        onOpenSummaryManagement?.();
        return;
    }
  };
  const metricPeriodMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedMetricPeriod, setSelectedMetricPeriod] =
    useState<(typeof metricPeriodOptions)[number]>('今日');
  const [isMetricPeriodMenuOpen, setIsMetricPeriodMenuOpen] = useState(false);
  const [trendModalMetric, setTrendModalMetric] = useState<string | null>(null);
  const [starEmployeePeriod, setStarEmployeePeriod] =
    useState<'今日' | '昨日' | '本月'>('今日');
  void starEmployeePeriod;
  const activeStarEmployees =
    starEmployeeMetric === 'communication'
      ? communicationStarEmployees
      : satisfactionStarEmployees;
  const activeShiftSchedules = shiftScheduleByDay[activeShiftDay];
  const isOnlineView = agentSubTab === 'online';
  const metricCards = isOnlineView
    ? selectedMetricPeriod === '本月'
      ? onlineMonthlyMetricCards
      : selectedMetricPeriod === '昨日'
        ? onlineYesterdayMetricCards
        : onlineMetricCards
    : selectedMetricPeriod === '本月'
      ? hotlineMonthlyMetricCards
      : selectedMetricPeriod === '昨日'
        ? hotlineYesterdayMetricCards
        : hotlineMetricCards;
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        metricPeriodMenuRef.current &&
        !metricPeriodMenuRef.current.contains(target)
      ) {
        setIsMetricPeriodMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="space-y-6 rounded-3xl border border-hairline bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        {/* ========== Header: sub-tabs + Director Express ========== */}
        <header className="flex items-center justify-between">
          {isChannelLocked ? (
            <div className="flex items-center gap-2">

              <h2 className="text-[17px] font-bold tracking-tight text-slate-800">
                {agentSubTab === 'hotline' ? '热线工作概览' : '在线工作概览'}
              </h2>
            </div>
          ) : (
            <nav className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-inner">
              {([
                { key: 'hotline', label: '热线' },
                { key: 'online', label: '在线' },
              ] as const).map((tab) => {
                const active = agentSubTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onAgentSubTabChange(tab.key)}
                    className={cn(
                      'focus-ring relative rounded-full px-6 py-2 text-[15px] font-semibold transition-all duration-300',
                      active
                        ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_8px_22px_-6px_rgba(58,92,255,0.55)]'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                    aria-pressed={active}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          <DirectorExpressTrigger
            unreadCount={unreadDirectorMessageCount}
            onClick={onOpenDirectorModal}
            buttonClassName="focus-ring press-lift rounded-full bg-[#216BFF] px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(33,107,255,0.5)] hover:bg-[#1a5ce6] hover:shadow-[0_12px_28px_-6px_rgba(33,107,255,0.6)]"
            badgeClassName="-top-1.5 -right-1.5 h-[18px] w-[18px] bg-gradient-to-br from-rose-500 to-orange-500 text-[11px] font-bold shadow-[0_4px_10px_rgba(244,63,94,0.45)]"
          />
        </header>

        {/* ========== Main two-column layout ========== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ---------- Left column: metrics + trend ---------- */}
          <div className="min-w-0 space-y-6">
            {/* Today todo (gated — only hotline/online agents) */}
            {showTodayTodo ? (
              <TodayTodoPanel
                items={isOnlineView ? onlineTodoItems : hotlineTodoItems}
                onItemClick={handleTodayTodoClick}
              />
            ) : null}

            {/* Core metrics */}
            <section className="surface-card flex flex-col p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex items-center gap-2">

                  <h3 className="text-[15px] font-bold tracking-tight text-slate-800">核心指标</h3>
                </div>
                <div ref={metricPeriodMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMetricPeriodMenuOpen((open) => !open)}
                    className="focus-ring flex h-8 min-w-[86px] items-center justify-between gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                    aria-haspopup="listbox"
                    aria-expanded={isMetricPeriodMenuOpen}
                  >
                    <span>{selectedMetricPeriod}</span>
                    <ChevronDown
                      size={13}
                      className={cn('transition-transform duration-300', isMetricPeriodMenuOpen && 'rotate-180')}
                    />
                  </button>
                  {isMetricPeriodMenuOpen ? (
                    <div className="animate-fade-in absolute left-0 top-[38px] z-20 min-w-[110px] overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
                      {metricPeriodOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSelectedMetricPeriod(option);
                            setIsMetricPeriodMenuOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                            selectedMetricPeriod === option
                              ? 'bg-brand-50 font-semibold text-brand-600'
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="ml-auto text-[12px] text-slate-400">点击卡片查看趋势弹窗</span>
              </div>

              {/* Primary metrics — 大卡 4 列 */}
              <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {metricCards.filter((m) => m.primary).map((metric) => (
                  <button
                    key={metric.label}
                    type="button"
                    onClick={() => setTrendModalMetric(metric.label)}
                    className="focus-ring press-lift relative flex min-h-[108px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/60 to-white p-4 text-left transition-all duration-300 hover:border-brand-200 hover:shadow-md"
                    aria-label={`${metric.label}，点击查看趋势图`}
                  >
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-slate-500">
                      <span>{metric.label}</span>
                      {metric.withIcon ? (
                        <FileText
                          size={13}
                          className="cursor-pointer text-slate-400 transition-colors hover:text-brand-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (metric.label === '解决率') {
                              onOpenBadRecordingModal();
                            } else {
                              onOpenCriticalErrorModal();
                            }
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="flex items-end gap-2">
                      <span
                        className={cn(
                          'tabular-nums text-[30px] font-bold leading-none tracking-tight',
                          metric.danger ? 'text-rose-500' : 'text-slate-900'
                        )}
                      >
                        {metric.value}
                      </span>
                      {metric.emphasis ? (
                        <span className="tabular-nums pb-[3px] text-[14px] font-semibold text-rose-500">
                          {metric.emphasis}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[12px] text-slate-500">{metric.note}</div>
                  </button>
                ))}
              </div>

              {/* Secondary metrics — 小卡等分填满容器 */}
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${metricCards.filter((m) => !m.primary).length}, minmax(0, 1fr))`,
                }}
              >
                {metricCards.filter((m) => !m.primary).map((metric) => (
                  <button
                    key={metric.label}
                    type="button"
                    onClick={() => setTrendModalMetric(metric.label)}
                    className="focus-ring press-lift relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-left transition-colors duration-300 hover:border-brand-200 hover:bg-brand-50/40"
                    aria-label={`${metric.label}，点击查看趋势图`}
                  >
                    <div className="mb-1.5 truncate text-[11px] font-medium text-slate-400">
                      {metric.label}
                      {metric.withIcon ? (
                        <FileText
                          size={11}
                          className="ml-1 inline-block cursor-pointer text-slate-400 transition-colors hover:text-brand-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (metric.label === '解决率') {
                              onOpenBadRecordingModal();
                            } else {
                              onOpenCriticalErrorModal();
                            }
                          }}
                        />
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'tabular-nums text-[18px] font-bold leading-none tracking-tight',
                        metric.danger ? 'text-rose-500' : 'text-slate-800'
                      )}
                    >
                      {metric.value}
                    </span>
                    <div className="mt-1.5 truncate text-[11px] text-slate-400">{metric.note}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent work orders (top) + Learning recommendations (below) */}
            <div className="space-y-6">
              {/* Recent work orders */}
              <section className="surface-card flex min-h-[360px] flex-col p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-[15px] font-bold tracking-tight text-slate-800">最近工单</h3>
                  <button
                    type="button"
                    className="focus-ring flex items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    查看全部 <ChevronRight size={13} />
                  </button>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200/80 bg-white">
                  <div className="min-w-[560px] grid grid-cols-[100px_80px_minmax(140px,1fr)_80px_60px] gap-2 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    <span>工单 ID</span>
                    <span>客户</span>
                    <span>主题</span>
                    <span>状态</span>
                    <span>优先级</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {hotlineRecentWorkOrders.map((order) => (
                      <div
                        key={order.id}
                        className="group min-w-[560px] grid min-h-[60px] cursor-pointer grid-cols-[100px_80px_minmax(140px,1fr)_80px_60px] gap-2 px-4 py-3 text-[13px] text-slate-700 transition-colors hover:bg-brand-50/40"
                      >
                        <div className="tabular-nums self-center text-[12px] font-semibold leading-[16px] text-slate-500 group-hover:text-brand-700">
                          {order.id.split('-').slice(0, 3).join('-')}
                          <br />
                          <span className="text-slate-400 group-hover:text-brand-500">{order.id.split('-')[3]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 self-center">
                          <span
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold shadow-sm ring-2 ring-white',
                              order.customerAvatarTone
                            )}
                          >
                            {order.customer.slice(0, 1)}
                          </span>
                          <span className="text-[13px] font-semibold text-slate-700">{order.customer}</span>
                        </div>
                        <div className="min-w-0 self-center pr-1 text-[13px] leading-5 text-slate-600 truncate group-hover:text-slate-900">
                          {order.topic}
                        </div>
                        <div className="self-center">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                              order.statusClassName
                            )}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1 self-center text-[12px] font-bold',
                            order.priorityClassName
                          )}
                        >
                          <span className="text-[9px]">●</span>
                          <span>{order.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Learning recommendations */}
              <section className="surface-card surface-card-hover p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-slate-800">学习推荐</h3>
                  <button
                    type="button"
                    className="focus-ring flex items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-medium text-accent-600 transition-colors hover:bg-accent-50 hover:text-accent-700"
                  >
                    查看更多 <ChevronRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hotlineLearningRecommendations.map((item) => (
                    <article
                      key={item.title}
                      tabIndex={0}
                      className="focus-ring press-lift group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-brand-200 hover:shadow-[0_18px_36px_-12px_rgba(58,92,255,0.25)]"
                    >
                      <div className="relative h-[120px] overflow-hidden bg-slate-100">
                        <img
                          src={item.imageSrc}
                          alt=""
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
                        <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
                          {item.duration}
                        </span>
                      </div>
                      <div className="space-y-1.5 px-3 py-3">
                        <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600">
                          {item.tag}
                        </span>
                        <div className="text-[13px] font-bold leading-5 text-slate-800 group-hover:text-brand-700">
                          {item.title}
                        </div>
                        <div className="text-[12px] leading-5 text-slate-500 line-clamp-2">
                          {item.description}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* ---------- Right rail ---------- */}
          <aside className="space-y-5">
            {/* Agent performance radar */}
            <AgentRadarCard />

            {/* Daily must-see */}
            <div className="surface-card surface-card-hover p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">

                  <h3 className="text-[15px] font-bold text-slate-800">每日必看</h3>
                </div>
                <button
                  type="button"
                  onClick={onOpenMessageService}
                  className="focus-ring flex items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-medium text-accent-600 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  查看更多 <ChevronRight size={13} />
                </button>
              </div>
              <div className="space-y-3">
                {[1, 2].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={onOpenMessageService}
                    className="focus-ring group block w-full space-y-1 rounded-xl border border-transparent p-2 -mx-2 text-left transition-all duration-300 hover:border-accent-100 hover:bg-accent-50/50"
                  >
                    <div className="flex items-center gap-2 text-[14px] font-bold text-slate-800 group-hover:text-accent-700">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                      1.30 要求
                    </div>
                    <div className="pl-3.5 text-[12.5px] leading-relaxed text-slate-500 line-clamp-2">
                      今天所有人都必须完成任务，以便能够迎接双11的工作，并且能够...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Star employees */}
            <div className="surface-card surface-card-hover p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="text-[15px] font-bold text-slate-800">明星员工</h3>
                  <div className="relative">
                    <select
                      value={starEmployeePeriod}
                      onChange={(e) =>
                        setStarEmployeePeriod(e.target.value as '今日' | '昨日' | '本月')
                      }
                      className="focus-ring h-7 appearance-none rounded-full border border-slate-200 bg-white pl-2.5 pr-6 text-[12px] font-medium text-slate-600 outline-none transition-colors hover:border-brand-300"
                    >
                      <option>今日</option>
                      <option>昨日</option>
                      <option>本月</option>
                    </select>
                    <ChevronDown
                      size={11}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenRankingDetail}
                  className="focus-ring flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-medium text-accent-600 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  查看更多 <ChevronRight size={13} />
                </button>
              </div>

              {/* Metric segmented switch */}
              <div className="mb-5 relative grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1">
                {([
                  { key: 'communication' as const, label: '沟通量', Icon: MessageSquare },
                  { key: 'satisfaction' as const, label: '满意度', Icon: Smile },
                ]).map(({ key, label, Icon }) => {
                  const active = starEmployeeMetric === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onStarEmployeeMetricChange(key)}
                      className={cn(
                        'focus-ring relative flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors duration-300',
                        active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-[#216BFF] shadow-[0_6px_14px_-4px_rgba(33,107,255,0.5)]"
                        />
                      ) : null}
                      <Icon size={14} className="relative" />
                      <span className="relative">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                {activeStarEmployees.map((employee) => (
                  <div
                    key={`${employee.rank}-${employee.name}`}
                    className="flex flex-col items-center rounded-2xl p-2 text-center transition-colors hover:bg-amber-50/60"
                  >
                    <div className="relative mb-2 flex h-[74px] w-[74px] items-start justify-center">
                      <div className={cn('absolute top-0 h-[24px] w-[10px] rounded-b-[6px] bg-gradient-to-b', employee.ribbonClassName)} />
                      <div className={cn('absolute left-[22px] top-0 h-[24px] w-[10px] rounded-b-[6px] bg-gradient-to-b', employee.ribbonClassName)} />
                      <div className={cn('absolute right-[22px] top-0 h-[24px] w-[10px] rounded-b-[6px] bg-gradient-to-b', employee.ribbonClassName)} />
                      <div className={cn('relative mt-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full border-[3px] bg-gradient-to-b shadow-[0_8px_18px_rgba(15,23,42,0.12)]', employee.medalClassName)}>
                        <div className={cn('flex h-[34px] w-[34px] items-center justify-center rounded-full border bg-gradient-to-b', employee.innerClassName)}>
                          <span className="text-[16px] font-bold">{employee.rank}</span>
                        </div>
                        <span className={cn('absolute left-[7px] top-[8px] h-2 w-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]', employee.sparkleClassName)} />
                        <span className="absolute left-[12px] top-[11px] h-1 w-1 rounded-full bg-white/80" />
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-slate-700">{employee.name}</span>
                  </div>
                ))}
              </div>

              <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 px-4 py-3">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-amber-300/40 to-orange-300/40 blur-2xl"
                />
                <span className="relative text-[13px] font-bold text-orange-600">我的排名</span>
                <span className="relative tabular-nums text-[15px] font-extrabold text-orange-600">5 / 100</span>
              </div>
            </div>

            {/* Shift info */}
            <div className="surface-card surface-card-hover p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">

                  <h3 className="text-[15px] font-bold text-slate-800">班次信息</h3>
                </div>
                <button
                  type="button"
                  onClick={onOpenScheduleDisplay}
                  className="focus-ring flex items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-medium text-accent-600 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  查看更多 <ChevronRight size={13} />
                </button>
              </div>

              <div className="mb-5 relative grid grid-cols-3 gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1">
                {(Object.keys(shiftScheduleByDay) as ShiftScheduleDay[]).map((day) => {
                  const active = activeShiftDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onActiveShiftDayChange(day)}
                      className={cn(
                        'focus-ring relative rounded-full px-3 py-1.5 text-center text-[13px] font-medium transition-colors duration-300',
                        active ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_6px_14px_-4px_rgba(99,102,241,0.5)]"
                        />
                      ) : null}
                      <span className="relative">{day}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 px-1 pb-1">
                {activeShiftSchedules.map((shift) => (
                  <div
                    key={shift.label}
                    className="grid grid-cols-[72px_1fr] items-center gap-4 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-indigo-100 hover:bg-indigo-50/50"
                  >
                    <span className="text-[13px] font-semibold text-slate-500">{shift.label}</span>
                    <span className="tabular-nums text-[13px] font-medium text-slate-800">{shift.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* Metric trend modal */}
      <MetricTrendModal title={trendModalMetric} onClose={() => setTrendModalMetric(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Agent performance radar
// ─────────────────────────────────────────────────────────────
type RadarMetric = { label: string; value: number; avg: number };

const agentRadarMetrics: RadarMetric[] = [
  { label: '响应速度', value: 88, avg: 80 },
  { label: '服务质量', value: 92, avg: 82 },
  { label: '客户满意度', value: 85, avg: 78 },
  { label: '工单处理', value: 78, avg: 75 },
  { label: '通话效率', value: 90, avg: 80 },
  { label: '学习进度', value: 72, avg: 76 },
];

function AgentRadarCard() {
  const width = 300;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 78;
  const metrics = agentRadarMetrics;
  const n = metrics.length;
  const levels = 4;

  const pointAt = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const axisPoints = metrics.map((_, i) => pointAt(i, 1));
  const valuePoints = metrics.map((m, i) => pointAt(i, m.value / 100));
  const avgPoints = metrics.map((m, i) => pointAt(i, m.avg / 100));
  const valuePath = valuePoints.map((p) => `${p.x},${p.y}`).join(' ');
  const avgPath = avgPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const overall = Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / n);
  const avgOverall = Math.round(metrics.reduce((sum, m) => sum + m.avg, 0) / n);

  return (
    <div className="surface-card surface-card-hover p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-slate-800">个人能力雷达</h3>
        </div>
        <div className="flex items-baseline gap-2 text-[11px] text-slate-400">
          <span>
            个人{' '}
            <span className="tabular-nums text-[15px] font-bold text-brand-600">
              {overall}
            </span>
          </span>
          <span className="text-slate-200">|</span>
          <span>
            平均{' '}
            <span className="tabular-nums text-[15px] font-bold text-amber-500">
              {avgOverall}
            </span>
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2 flex items-center gap-4 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-full bg-brand-500" />
          个人
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded-full border border-dashed border-amber-400 bg-amber-100"
            aria-hidden
          />
          团队平均
        </span>
      </div>

      <div className="flex justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto max-w-full"
          role="img"
          aria-label="坐席能力雷达图"
        >
          <defs>
            <radialGradient id="radar-fill" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#3a5cff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3a5cff" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Grid polygons */}
          {Array.from({ length: levels }).map((_, lvl) => {
            const ratio = (lvl + 1) / levels;
            const pts = metrics
              .map((_, i) => {
                const p = pointAt(i, ratio);
                return `${p.x},${p.y}`;
              })
              .join(' ');
            return (
              <polygon
                key={lvl}
                points={pts}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={1}
              />
            );
          })}

          {/* Axes */}
          {axisPoints.map((p, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}

          {/* Average polygon (rendered first so personal overlays on top) */}
          <polygon
            points={avgPath}
            fill="rgba(245, 158, 11, 0.14)"
            stroke="#f59e0b"
            strokeWidth={1.4}
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />
          {avgPoints.map((p, i) => (
            <circle
              key={`avg-${i}`}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill="#fff"
              stroke="#f59e0b"
              strokeWidth={1.4}
            />
          ))}

          {/* Value polygon */}
          <polygon
            points={valuePath}
            fill="url(#radar-fill)"
            stroke="#3a5cff"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />

          {/* Value dots */}
          {valuePoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#fff"
              stroke="#3a5cff"
              strokeWidth={1.6}
            />
          ))}

          {/* Labels */}
          {metrics.map((m, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const lx = cx + cos * (radius + 10);
            const ly = cy + sin * (radius + 10);
            const anchor =
              Math.abs(cos) < 0.15 ? 'middle' : cos > 0 ? 'start' : 'end';
            const baseline =
              sin < -0.5 ? 'auto' : sin > 0.5 ? 'hanging' : 'middle';
            // Small offset on the vertical to prevent touching the outermost
            // polygon edge when the label sits exactly above/below.
            const dy = sin < -0.5 ? -2 : sin > 0.5 ? 2 : 0;
            return (
              <text
                key={i}
                x={lx}
                y={ly + dy}
                textAnchor={anchor}
                dominantBaseline={baseline}
                className="fill-slate-600"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {m.label}
              </text>
            );
          })}
        </svg>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {metrics.map((m) => {
          const diff = m.value - m.avg;
          const diffCls =
            diff > 0
              ? 'text-emerald-500'
              : diff < 0
                ? 'text-rose-500'
                : 'text-slate-400';
          const diffLabel = diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`;
          return (
            <li
              key={m.label}
              className="flex items-center justify-between gap-2 text-[12px] text-slate-500"
            >
              <span className="truncate">{m.label}</span>
              <span className="flex items-baseline gap-1 tabular-nums">
                <span className="font-semibold text-slate-700">{m.value}</span>
                <span className="text-slate-300">/</span>
                <span className="text-amber-500">{m.avg}</span>
                <span className={cn('text-[11px] font-semibold', diffCls)}>
                  {diffLabel}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
