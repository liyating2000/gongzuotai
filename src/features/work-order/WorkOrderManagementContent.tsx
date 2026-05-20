import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Smartphone,
  Tag,
  Timer,
  User,
  UserPlus,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '../../lib/cn';

type WorkOrderStatus = '待处理' | '处理中' | '等待回复' | '已解决' | '已关闭' | '已分配';
type WorkOrderPriority = '紧急' | '高' | '中' | '低';
type WorkOrderChannel = '电话' | '在线聊天' | '邮件' | '微信' | 'APP';
type WorkOrderCategory = '退换货' | '账户问题' | '产品咨询' | '投诉建议' | '物流问题' | '技术支持';

interface WorkOrderItem {
  id: string;
  customer: string;
  customerPhone: string;
  subject: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  channel: WorkOrderChannel;
  category: WorkOrderCategory;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  description: string;
  tags: string[];
}

const workOrdersData: WorkOrderItem[] = [
  {
    id: 'WO-2024100001',
    customer: '张伟',
    customerPhone: '138****8821',
    subject: '购买的蓝牙耳机左耳无声音，要求换货',
    status: '待处理',
    priority: '紧急',
    channel: '电话',
    category: '退换货',
    assignee: '冉鸣',
    createdAt: '2024-10-14 09:12',
    updatedAt: '2024-10-14 09:12',
    deadline: '2024-10-14 18:00',
    description: '客户反映购买的蓝牙耳机左耳完全无声，已尝试重置无效，要求换货处理。',
    tags: ['换货', '硬件故障'],
  },
  {
    id: 'WO-2024100002',
    customer: '李娜',
    customerPhone: '139****3302',
    subject: '账户无法登录，提示密码错误但确认密码正确',
    status: '处理中',
    priority: '高',
    channel: '在线聊天',
    category: '账户问题',
    assignee: '王芳',
    createdAt: '2024-10-14 09:35',
    updatedAt: '2024-10-14 10:20',
    deadline: '2024-10-15 09:35',
    description: '客户反映账户登录异常，多次尝试均提示密码错误，已确认密码无误，怀疑账户被锁定。',
    tags: ['账户锁定', '紧急'],
  },
  {
    id: 'WO-2024100003',
    customer: '王建国',
    customerPhone: '135****6677',
    subject: '订单物流三天未更新，询问包裹状态',
    status: '等待回复',
    priority: '中',
    channel: '微信',
    category: '物流问题',
    assignee: '刘洋',
    createdAt: '2024-10-13 14:22',
    updatedAt: '2024-10-14 08:00',
    deadline: '2024-10-15 14:22',
    description: '客户订单号 ORD-20241011-8823，物流信息自10月11日起未更新，客户询问包裹当前状态。',
    tags: ['物流停滞', '跟进中'],
  },
  {
    id: 'WO-2024100004',
    customer: '赵敏',
    customerPhone: '186****4411',
    subject: '产品使用说明书缺失，要求补发',
    status: '已解决',
    priority: '低',
    channel: '邮件',
    category: '产品咨询',
    assignee: '陈静',
    createdAt: '2024-10-12 11:05',
    updatedAt: '2024-10-13 16:30',
    deadline: '2024-10-14 11:05',
    description: '客户收到商品后发现包装内缺少说明书，已通过邮件发送电子版说明书，客户确认收到。',
    tags: ['已补发', '已确认'],
  },
  {
    id: 'WO-2024100005',
    customer: '孙磊',
    customerPhone: '177****9900',
    subject: 'APP 在 iOS 17 系统下频繁崩溃，无法正常使用',
    status: '处理中',
    priority: '紧急',
    channel: 'APP',
    category: '技术支持',
    assignee: '冉鸣',
    createdAt: '2024-10-14 08:50',
    updatedAt: '2024-10-14 10:45',
    deadline: '2024-10-14 17:00',
    description: '客户反映升级 iOS 17 后 APP 启动即崩溃，已收集崩溃日志，技术团队正在排查。',
    tags: ['iOS崩溃', '技术排查'],
  },
  {
    id: 'WO-2024100006',
    customer: '周晓燕',
    customerPhone: '152****2233',
    subject: '对客服态度不满，要求投诉处理',
    status: '已分配',
    priority: '高',
    channel: '电话',
    category: '投诉建议',
    assignee: '张丽',
    createdAt: '2024-10-13 16:40',
    updatedAt: '2024-10-14 09:00',
    deadline: '2024-10-14 16:40',
    description: '客户反映昨日通话中客服态度恶劣，要求正式投诉并获得书面回复。',
    tags: ['投诉', '需回访'],
  },
  {
    id: 'WO-2024100007',
    customer: '吴浩然',
    customerPhone: '133****5566',
    subject: '退款申请已提交7天未到账',
    status: '待处理',
    priority: '高',
    channel: '在线聊天',
    category: '退换货',
    assignee: '未分配',
    createdAt: '2024-10-14 10:15',
    updatedAt: '2024-10-14 10:15',
    deadline: '2024-10-15 10:15',
    description: '客户于10月7日申请退款，至今未收到退款，订单号 ORD-20241001-5512。',
    tags: ['退款', '超时'],
  },
  {
    id: 'WO-2024100008',
    customer: '郑雪梅',
    customerPhone: '158****7788',
    subject: '咨询会员积分兑换规则及有效期',
    status: '已解决',
    priority: '低',
    channel: '微信',
    category: '产品咨询',
    assignee: '王芳',
    createdAt: '2024-10-13 10:30',
    updatedAt: '2024-10-13 11:00',
    deadline: '2024-10-14 10:30',
    description: '客户咨询积分兑换规则，已详细说明积分有效期为自然年，兑换比例100:1。',
    tags: ['积分咨询', '已答复'],
  },
  {
    id: 'WO-2024100009',
    customer: '陈大明',
    customerPhone: '180****1122',
    subject: '收到商品与描述不符，颜色错误',
    status: '处理中',
    priority: '高',
    channel: '电话',
    category: '退换货',
    assignee: '刘洋',
    createdAt: '2024-10-14 11:00',
    updatedAt: '2024-10-14 11:30',
    deadline: '2024-10-15 11:00',
    description: '客户订购黑色款，收到红色款，要求免费换货并补偿运费。',
    tags: ['发货错误', '换货'],
  },
  {
    id: 'WO-2024100010',
    customer: '林小红',
    customerPhone: '136****4455',
    subject: '系统升级后数据导入功能异常',
    status: '等待回复',
    priority: '中',
    channel: '邮件',
    category: '技术支持',
    assignee: '冉鸣',
    createdAt: '2024-10-13 15:20',
    updatedAt: '2024-10-14 09:30',
    deadline: '2024-10-15 15:20',
    description: '客户反映系统升级至 v3.2 后，批量导入 Excel 数据时报错，已发送错误截图。',
    tags: ['数据导入', '版本问题'],
  },
  {
    id: 'WO-2024100011',
    customer: '黄志强',
    customerPhone: '187****3344',
    subject: '发票信息填写错误，要求重开',
    status: '已分配',
    priority: '中',
    channel: '电话',
    category: '产品咨询',
    assignee: '陈静',
    createdAt: '2024-10-13 13:00',
    updatedAt: '2024-10-14 08:30',
    deadline: '2024-10-15 13:00',
    description: '客户公司名称填写有误，要求作废原发票并重新开具，已提交财务审核。',
    tags: ['发票', '财务审核'],
  },
  {
    id: 'WO-2024100012',
    customer: '马秀英',
    customerPhone: '155****6699',
    subject: '建议增加夜间客服在线时段',
    status: '已关闭',
    priority: '低',
    channel: 'APP',
    category: '投诉建议',
    assignee: '张丽',
    createdAt: '2024-10-12 22:10',
    updatedAt: '2024-10-13 09:00',
    deadline: '2024-10-14 22:10',
    description: '客户建议延长客服在线时间至23:00，已记录并转交产品团队评估。',
    tags: ['建议', '已记录'],
  },
];

const statusConfig: Record<WorkOrderStatus, { chip: string; label: string }> = {
  待处理: { chip: 'border border-rose-200/70 bg-rose-50 text-rose-700', label: '待处理' },
  处理中: { chip: 'border border-sky-200/70 bg-sky-50 text-sky-700', label: '处理中' },
  等待回复: { chip: 'border border-amber-200/70 bg-amber-50 text-amber-700', label: '等待回复' },
  已解决: { chip: 'border border-emerald-200/70 bg-emerald-50 text-emerald-700', label: '已解决' },
  已关闭: { chip: 'border border-slate-200/80 bg-slate-50 text-slate-500', label: '已关闭' },
  已分配: { chip: 'border border-indigo-200/70 bg-indigo-50 text-indigo-700', label: '已分配' },
};

const priorityConfig: Record<WorkOrderPriority, { text: string; dot: string }> = {
  紧急: { text: 'text-rose-600', dot: 'bg-rose-500' },
  高: { text: 'text-orange-500', dot: 'bg-orange-400' },
  中: { text: 'text-amber-500', dot: 'bg-amber-400' },
  低: { text: 'text-slate-400', dot: 'bg-slate-300' },
};

const channelIcon: Record<WorkOrderChannel, LucideIcon> = {
  电话: Phone,
  在线聊天: MessageSquare,
  邮件: Mail,
  微信: MessageSquare,
  APP: Smartphone,
};

const ALL_STATUSES: WorkOrderStatus[] = ['待处理', '处理中', '等待回复', '已解决', '已关闭', '已分配'];
const ALL_PRIORITIES: WorkOrderPriority[] = ['紧急', '高', '中', '低'];
const ALL_CHANNELS: WorkOrderChannel[] = ['电话', '在线聊天', '邮件', '微信', 'APP'];
const ALL_CATEGORIES: WorkOrderCategory[] = [
  '退换货',
  '账户问题',
  '产品咨询',
  '投诉建议',
  '物流问题',
  '技术支持',
];

function DetailDrawer({
  order,
  onClose,
}: {
  order: WorkOrderItem | null;
  onClose: () => void;
}) {
  if (!order) return null;
  const sc = statusConfig[order.status];
  const pc = priorityConfig[order.priority];

  return (
    <div
      className="fixed inset-0 z-[90] flex justify-end bg-slate-900/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up flex h-full w-[480px] flex-col overflow-hidden bg-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-hairline px-6 py-4">
          <div className="min-w-0">
            <div className="tabular-nums mb-0.5 text-[12px] text-slate-400">{order.id}</div>
            <div className="text-[15px] font-semibold leading-snug text-slate-800">
              {order.subject}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭详情"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 border-b border-hairline px-6 py-3">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold', sc.chip)}>
            {order.status}
          </span>
          <span className={cn('inline-flex items-center gap-1 text-[12px] font-semibold', pc.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', pc.dot)} />
            {order.priority}优先级
          </span>
          <span className="tabular-nums ml-auto text-[12px] text-slate-400">截止：{order.deadline}</span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              基本信息
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: '客户姓名', value: order.customer },
                { label: '联系电话', value: order.customerPhone },
                { label: '来源渠道', value: order.channel },
                { label: '工单分类', value: order.category },
                { label: '负责人', value: order.assignee },
                { label: '创建时间', value: order.createdAt },
                { label: '最后更新', value: order.updatedAt },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="mb-0.5 text-[11px] text-slate-400">{label}</div>
                  <div className="tabular-nums text-[13px] text-slate-700">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              问题描述
            </div>
            <div className="rounded-xl border border-hairline bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700">
              {order.description}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              标签
            </div>
            <div className="flex flex-wrap gap-1.5">
              {order.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              处理记录
            </div>
            <div className="space-y-3">
              {[
                { time: order.createdAt, user: '系统', content: `工单创建成功，已自动分配给 ${order.assignee}` },
                { time: order.updatedAt, user: order.assignee, content: '已查看工单，正在处理中' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-100">
                    <User size={13} className="text-brand-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-slate-700">{log.user}</span>
                      <span className="tabular-nums text-[11px] text-slate-400">{log.time}</span>
                    </div>
                    <div className="text-[12px] text-slate-600">{log.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 border-t border-hairline px-6 py-4">
          <button
            type="button"
            className="focus-ring press-lift flex-1 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]"
          >
            <Edit3 size={14} className="-mt-0.5 mr-1.5 inline-block" />
            编辑工单
          </button>
          <button
            type="button"
            className="focus-ring flex-1 rounded-xl border border-hairline bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-600"
          >
            <UserPlus size={14} className="-mt-0.5 mr-1.5 inline-block" />
            转派
          </button>
          <button
            type="button"
            className="focus-ring flex-1 rounded-xl border border-hairline bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <CheckCircle2 size={14} className="-mt-0.5 mr-1.5 inline-block" />
            标记解决
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkOrderManagementContent() {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkOrderStatus | '全部'>('全部');
  const [filterPriority, setFilterPriority] = useState<WorkOrderPriority | '全部'>('全部');
  const [filterChannel, setFilterChannel] = useState<WorkOrderChannel | '全部'>('全部');
  const [filterCategory, setFilterCategory] = useState<WorkOrderCategory | '全部'>('全部');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return workOrdersData.filter((o) => {
      if (filterStatus !== '全部' && o.status !== filterStatus) return false;
      if (filterPriority !== '全部' && o.priority !== filterPriority) return false;
      if (filterChannel !== '全部' && o.channel !== filterChannel) return false;
      if (filterCategory !== '全部' && o.category !== filterCategory) return false;
      if (
        searchText &&
        !o.subject.includes(searchText) &&
        !o.customer.includes(searchText) &&
        !o.id.includes(searchText)
      )
        return false;
      return true;
    });
  }, [filterStatus, filterPriority, filterChannel, filterCategory, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: workOrdersData.length };
    ALL_STATUSES.forEach((s) => {
      counts[s] = workOrdersData.filter((o) => o.status === s).length;
    });
    return counts;
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((o) => o.id)));
    }
  };

  const summaryCards: Array<{
    label: string;
    value: number;
    icon: LucideIcon;
    accent: string;
    bg: string;
  }> = [
    { label: '全部工单', value: workOrdersData.length, icon: FileText, accent: 'text-slate-600', bg: 'bg-slate-50' },
    { label: '待处理', value: statusCounts['待处理'] ?? 0, icon: AlertTriangle, accent: 'text-rose-500', bg: 'bg-rose-50' },
    { label: '处理中', value: statusCounts['处理中'] ?? 0, icon: Loader2, accent: 'text-sky-500', bg: 'bg-sky-50' },
    { label: '等待回复', value: statusCounts['等待回复'] ?? 0, icon: Timer, accent: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '已解决', value: statusCounts['已解决'] ?? 0, icon: CheckCircle2, accent: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="animate-fade-in-up flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden">
      {/* Summary cards */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-3 md:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="surface-card flex items-center gap-3 p-4"
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-slate-100', card.bg)}>
                <Icon size={18} strokeWidth={2.2} className={card.accent} />
              </div>
              <div className="min-w-0">
                <div className="tabular-nums text-[22px] font-bold leading-none text-slate-900">
                  {card.value}
                </div>
                <div className="mt-1 text-[12px] text-slate-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <section className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {/* Toolbar */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-hairline px-5 py-3">
          <div className="relative w-full max-w-[260px]">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="搜索工单号、客户、主题..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="focus-ring w-full rounded-xl border border-hairline bg-slate-50/60 py-2 pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 transition-colors focus:border-brand-400 focus:bg-white"
            />
          </div>

          {(
            [
              {
                value: filterStatus,
                onChange: (v: string) => {
                  setFilterStatus(v as WorkOrderStatus | '全部');
                  setCurrentPage(1);
                },
                options: ['全部', ...ALL_STATUSES],
                prefix: '状态',
              },
              {
                value: filterPriority,
                onChange: (v: string) => {
                  setFilterPriority(v as WorkOrderPriority | '全部');
                  setCurrentPage(1);
                },
                options: ['全部', ...ALL_PRIORITIES],
                prefix: '优先级',
              },
              {
                value: filterChannel,
                onChange: (v: string) => {
                  setFilterChannel(v as WorkOrderChannel | '全部');
                  setCurrentPage(1);
                },
                options: ['全部', ...ALL_CHANNELS],
                prefix: '渠道',
              },
              {
                value: filterCategory,
                onChange: (v: string) => {
                  setFilterCategory(v as WorkOrderCategory | '全部');
                  setCurrentPage(1);
                },
                options: ['全部', ...ALL_CATEGORIES],
                prefix: '分类',
              },
            ] as const
          ).map((sel) => (
            <select
              key={sel.prefix}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="focus-ring cursor-pointer rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:border-brand-200 focus:border-brand-400 focus:bg-white"
            >
              {sel.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === '全部' ? `全部${sel.prefix}` : opt}
                </option>
              ))}
            </select>
          ))}

          <div className="ml-auto flex items-center gap-2">
            {selectedIds.size > 0 ? (
              <span className="tabular-nums text-[12px] text-slate-500">
                已选 {selectedIds.size} 条
              </span>
            ) : null}
            <button
              type="button"
              className="focus-ring press-lift flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]"
            >
              <Plus size={14} />
              新建工单
            </button>
            <button
              type="button"
              className="focus-ring flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600"
            >
              <Download size={14} />
              导出
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex flex-shrink-0 items-center gap-1 border-b border-hairline px-5">
          {(['全部', ...ALL_STATUSES] as const).map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setFilterStatus(s as WorkOrderStatus | '全部');
                  setCurrentPage(1);
                }}
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

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur">
              <tr className="border-b border-hairline">
                <th className="w-10 px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer accent-brand-500"
                  />
                </th>
                {[
                  '工单号',
                  '主题',
                  '客户',
                  '状态',
                  '优先级',
                  '渠道',
                  '分类',
                  '负责人',
                  '截止时间',
                  '操作',
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-20 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                      <FileText size={24} className="text-slate-300" />
                    </div>
                    <div className="text-[13px] text-slate-400">暂无符合条件的工单</div>
                  </td>
                </tr>
              ) : (
                paginated.map((order) => {
                  const sc = statusConfig[order.status];
                  const pc = priorityConfig[order.priority];
                  const ChannelIcon = channelIcon[order.channel];
                  const isSelected = selectedIds.has(order.id);
                  return (
                    <tr
                      key={order.id + order.createdAt}
                      className={cn(
                        'cursor-pointer border-b border-hairline transition-colors',
                        isSelected ? 'bg-brand-50/40' : 'hover:bg-brand-50/30'
                      )}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="h-4 w-4 cursor-pointer accent-brand-500"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="tabular-nums text-[12px] font-mono text-slate-500">
                          {order.id}
                        </span>
                      </td>
                      <td className="max-w-[240px] px-3 py-4">
                        <div className="truncate text-[13px] font-semibold text-slate-800" title={order.subject}>
                          {order.subject}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {order.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="text-[13px] text-slate-700">{order.customer}</div>
                        <div className="tabular-nums text-[11px] text-slate-400">{order.customerPhone}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', sc.chip)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className={cn('inline-flex items-center gap-1 text-[12px] font-semibold', pc.text)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', pc.dot)} />
                          {order.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                          <ChannelIcon size={13} className="text-slate-400" />
                          {order.channel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="text-[12px] text-slate-500">{order.category}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-100">
                            <User size={11} className="text-brand-500" />
                          </div>
                          <span className="text-[12px] text-slate-600">{order.assignee}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="tabular-nums text-[12px] text-slate-600">{order.deadline.split(' ')[0]}</div>
                        <div className="tabular-nums text-[11px] text-slate-400">{order.deadline.split(' ')[1]}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                            title="查看详情"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600"
                            title="编辑"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                            title="关闭工单"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-hairline px-5 py-3">
          <span className="tabular-nums text-[12px] text-slate-500">
            共 {filtered.length} 条工单
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="上一页"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={cn(
                  'focus-ring tabular-nums flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-semibold transition-colors',
                  p === currentPage
                    ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-[0_6px_14px_-4px_rgba(58,92,255,0.5)]'
                    : 'border border-hairline text-slate-500 hover:border-brand-200 hover:text-brand-600'
                )}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="下一页"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <DetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
