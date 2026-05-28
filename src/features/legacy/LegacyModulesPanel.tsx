import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Hand,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Search,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';

export type LegacyModulePage =
  | 'recording-query'
  | 'sample-recording-query'
  | 'sample-recording-audit'
  | 'sms-delivery-query'
  | 'mail-delivery-query'
  | 'summary-management'
  | 'appointment-message-management'
  | 'agent-monitoring'
  | 'queue-monitoring'
  | 'webchat-history-query'
  | 'webchat-message-management'
  | 'webchat-blacklist-query'
  | 'webchat-blacklist-approval'
  | 'user-system-management';

export type LegacyModuleFilterPreset =
  | { page: 'summary-management'; filters: { status: string } }
  | { page: 'webchat-history-query'; filters: { summarized: string } };

export const legacyModuleLabels: Record<LegacyModulePage, string> = {
  'recording-query': '录音查询',
  'sample-recording-query': '范例录音查询',
  'sample-recording-audit': '范例录音审核',
  'sms-delivery-query': '短信发送历史',
  'mail-delivery-query': '邮件收发查询',
  'summary-management': '小结管理',
  'appointment-message-management': '预约回电/留言管理',
  'agent-monitoring': '话务员监控',
  'queue-monitoring': '队列监控',
  'webchat-history-query': '网聊历史查询',
  'webchat-message-management': '网聊留言管理',
  'webchat-blacklist-query': '网聊黑名单查询',
  'webchat-blacklist-approval': '网聊黑名单审批',
  'user-system-management': '用户体系管理',
};

export const telephoneServiceLegacyMenus = [
  { key: 'recording-query', label: '录音查询' },
  { key: 'sample-recording-query', label: '范例录音查询' },
  { key: 'sample-recording-audit', label: '范例录音审核' },
  { key: 'sms-delivery-query', label: '短信发送历史' },
  { key: 'mail-delivery-query', label: '邮件收发查询' },
] as const satisfies ReadonlyArray<{ key: LegacyModulePage; label: string }>;

export const utilityToolsLegacyMenus = [
  { key: 'summary-management', label: '小结管理' },
  { key: 'appointment-message-management', label: '预约回电/留言管理' },
] as const satisfies ReadonlyArray<{ key: LegacyModulePage; label: string }>;

export const monitoringLegacyMenus = [
  { key: 'agent-monitoring', label: '话务员监控' },
  { key: 'queue-monitoring', label: '队列监控' },
] as const satisfies ReadonlyArray<{ key: LegacyModulePage; label: string }>;

export const webchatLegacyMenus = [
  { key: 'webchat-history-query', label: '网聊历史查询' },
  { key: 'webchat-message-management', label: '网聊留言管理' },
  { key: 'webchat-blacklist-query', label: '网聊黑名单查询' },
  { key: 'webchat-blacklist-approval', label: '网聊黑名单审批' },
] as const satisfies ReadonlyArray<{ key: LegacyModulePage; label: string }>;

type SupportDialogType = 'phone' | 'webchat';
type AgentMonitorStatus = '空闲状态' | '忙碌状态' | '通话状态' | '离线状态' | '在线状态' | 'LOGOUT';
type SupportMessage = {
  id: string;
  time: string;
  sender: string;
  badge: string;
  align: 'left' | 'right';
  text: string;
};
type SupportSession = {
  id: string;
  lockedAt: string | null;
  currentAgent: string;
  updatedAt: string;
  startedAt: string;
  duration: string;
  queue: string;
  messages: SupportMessage[];
};
type AgentMonitorCard = {
  name: string;
  status: AgentMonitorStatus;
  department: string;
  seatNo: string;
  workgroup: string;
  mode: 'phone' | 'webchat';
  caller?: string;
  callee?: string;
  extension?: string;
  startAt: string;
  duration: string;
  extraLabel?: string;
  extraValue?: string;
  sessionCount?: number;
  timeoutAt?: string;
  maxServiceCount?: number;
};

const defaultWebchatSupportSessionsByAgent: Record<string, SupportSession[]> = {
  彭颖测试: [
    {
      id: '9444',
      lockedAt: '14:12:32',
      currentAgent: '000745',
      updatedAt: '11:31',
      startedAt: '2026-4-1 11:15',
      duration: '0小时15分11秒',
      queue: '142',
      messages: [
        { id: '9444-1', time: '今天 11:15', sender: '访客', badge: '客', align: 'left', text: '查询访客分打字已支付' },
        { id: '9444-2', time: '今天 11:16', sender: '机器人', badge: '机', align: 'right', text: '[机器人推荐问题]' },
        {
          id: '9444-3',
          time: '今天 11:16',
          sender: '花花',
          badge: '花',
          align: 'right',
          text: '"from":"机器人","to":"花花","fromUserId":"BOT025","toUserId":"000745","link":"访客[34761]-机器人-花花"',
        },
        { id: '9444-4', time: '今天 11:16', sender: '花花', badge: '花', align: 'right', text: '聊天小助手，很高兴为您服务！请问有什么可以帮您？' },
      ],
    },
    {
      id: '9445',
      lockedAt: null,
      currentAgent: '000746',
      updatedAt: '11:34',
      startedAt: '2026-4-1 11:18',
      duration: '0小时08分26秒',
      queue: '143',
      messages: [
        { id: '9445-1', time: '今天 11:32', sender: '小林', badge: '客', align: 'left', text: '请问这边什么时候可以发货？' },
        { id: '9445-2', time: '今天 11:33', sender: '机器人', badge: '机', align: 'right', text: '[物流咨询推荐语]' },
        { id: '9445-3', time: '今天 11:34', sender: '小林', badge: '客', align: 'left', text: '如果今天下单，周末前能送到吗？' },
      ],
    },
  ],
  测试agent: [
    {
      id: '9551',
      lockedAt: null,
      currentAgent: '000755',
      updatedAt: '15:35',
      startedAt: '2026-4-1 15:20',
      duration: '0小时15分35秒',
      queue: '145',
      messages: [
        { id: '9551-1', time: '今天 15:22', sender: '访客', badge: '客', align: 'left', text: '想确认下订单什么时候能处理。' },
        { id: '9551-2', time: '今天 15:23', sender: '测试agent', badge: '测', align: 'right', text: '您好，我帮您查询一下，请稍等。' },
      ],
    },
  ],
  ADMIN: [
    {
      id: '9661',
      lockedAt: null,
      currentAgent: '1006',
      updatedAt: '11:30',
      startedAt: '2026-4-1 11:26',
      duration: '0小时10分10秒',
      queue: '146',
      messages: [
        { id: '9661-1', time: '今天 11:28', sender: '访客', badge: '客', align: 'left', text: '请问这里可以开发票吗？' },
        { id: '9661-2', time: '今天 11:29', sender: 'ADMIN', badge: '管', align: 'right', text: '可以的，您提供下订单信息。' },
      ],
    },
  ],
};

const pageWrapperClass = 'flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas';
const pageScrollClass = 'flex min-h-0 flex-1 flex-col overflow-auto px-5 pb-5 pt-4 custom-scrollbar';
const pageCardClass = 'overflow-hidden rounded-[18px] border border-hairline bg-white shadow-[0_1px_2px_rgba(15,23,42,.04),0_4px_12px_rgba(15,23,42,.04)]';
const inputClass =
  'h-[38px] w-full min-w-0 rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:bg-white';
const primaryButtonClass =
  'focus-ring inline-flex h-[38px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-brand-200 bg-brand-50/60 px-4 text-[13px] font-semibold text-brand-600 transition-colors hover:border-brand-300 hover:bg-brand-100/60';
const secondaryButtonClass =
  'focus-ring inline-flex h-[38px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-hairline bg-white px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50/40';
const solidButtonClass =
  'focus-ring press-lift inline-flex h-[38px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)] transition-colors hover:shadow-[0_14px_30px_-8px_rgba(58,92,255,0.65)]';

const userSystemRows = [
  { id: '1', name: '声聊1', blacklistDays: 30, createdAt: '2025-04-29 11:15:14', updatedAt: '2025-04-29 11:15:14' },
  { id: '2', name: '教育热线', blacklistDays: 15, createdAt: '2025-04-28 09:32:10', updatedAt: '2025-04-28 09:32:10' },
];

const summaryRows = [
  { id: '1', businessLine: '教育', category: '智学网', product: '平板', type: '咨询', status: '暂存', createdAt: '2025-04-29 11:15:14', summaryType: '在线', department: '教育部', agent: '坐席A', issueType: '操作指导', level1: '一级问题分类', level2: '二级问题分类', level3: '三级问题分类', customerId: '-', sessionId: '2011', correctionCount: 0 },
  { id: '2', businessLine: '教育', category: '电脑', product: '笔记本电脑', type: '咨询', status: '已完成', createdAt: '2025-04-29 11:15:14', summaryType: '热线', department: '教育部', agent: '坐席A', issueType: '产品故障', level1: '一级问题分类', level2: '二级问题分类', level3: '三级问题分类', customerId: '18017682333', sessionId: '-', correctionCount: 3 },
  { id: '3', businessLine: '法院', category: '张女士', product: '体系1', type: '投诉', status: '暂存', createdAt: '2025-04-29 11:15:14', summaryType: '在线', department: '教育部', agent: '坐席B', issueType: '操作指导', level1: '一级问题分类', level2: '二级问题分类', level3: '三级问题分类', customerId: '-', sessionId: '2012', correctionCount: 0 },
];

const correctionRecords = [
  {
    id: '1',
    summaryId: '2',
    correctedAt: '2025-04-29 11:15:14',
    correctedBy: '坐席A',
    beforeValue: '问题分类二级：账号异常',
    afterValue: '问题分类二级：产品故障',
    reason: '根据录音内容修正错误定型。',
    detail: {
      产品分类: '电脑',
      产品名称: '平板',
      呼入类型: '咨询',
      问题定型: '产品故障',
      问题分类一级: '一级问题分类',
      问题分类二级: '二级问题分类',
      问题分类三级: '三级问题分类',
      小结类型: '热线',
      处理结果状态: '已处理',
      账号: '18017682333',
      投诉分类一级: '服务态度',
      投诉分类二级: '一级升级',
    },
  },
  {
    id: '2',
    summaryId: '2',
    correctedAt: '2025-04-30 09:26:40',
    correctedBy: '坐席B',
    beforeValue: '投诉分类二级：一级升级',
    afterValue: '投诉分类二级：专项跟进',
    reason: '用户明确提及需要专项回访。',
    detail: {
      产品分类: '电脑',
      产品名称: '笔记本电脑',
      呼入类型: '咨询',
      问题定型: '产品故障',
      问题分类一级: '一级问题分类',
      问题分类二级: '二级问题分类',
      问题分类三级: '三级问题分类',
      小结类型: '热线',
      处理结果状态: '待回访',
      账号: '18017682333',
      投诉分类一级: '处理时效',
      投诉分类二级: '专项跟进',
    },
  },
  {
    id: '3',
    summaryId: '2',
    correctedAt: '2025-05-02 14:08:12',
    correctedBy: '坐席C',
    beforeValue: '小结类型：在线',
    afterValue: '小结类型：热线',
    reason: '按通话来源调整小结类型。',
    detail: {
      产品分类: '电脑',
      产品名称: '笔记本电脑',
      呼入类型: '咨询',
      问题定型: '产品故障',
      问题分类一级: '一级问题分类',
      问题分类二级: '二级问题分类',
      问题分类三级: '三级问题分类',
      小结类型: '热线',
      处理结果状态: '已处理',
      账号: '18017682333',
      投诉分类一级: '产品质量',
      投诉分类二级: '二级升级',
    },
  },
];

const summaryRecordDetailSelectOptions: Record<string, string[]> = {
  产品分类: ['电脑', '平板', '体系1'],
  产品名称: ['笔记本电脑', '平板', '体系1'],
  呼入类型: ['咨询', '投诉'],
  问题定型: ['产品故障', '操作指导'],
  问题分类一级: ['一级问题分类'],
  问题分类二级: ['二级问题分类'],
  问题分类三级: ['三级问题分类'],
  小结类型: ['在线', '热线'],
  处理结果状态: ['已处理', '待回访', '暂存'],
  投诉分类一级: ['服务态度', '处理时效', '产品质量'],
  投诉分类二级: ['一级升级', '专项跟进', '二级升级'],
};

const summaryRecordDetailFields = [
  '产品分类',
  '产品名称',
  '呼入类型',
  '问题定型',
  '问题分类一级',
  '问题分类二级',
  '问题分类三级',
  '小结类型',
  '处理结果状态',
  '账号',
  '投诉分类一级',
  '投诉分类二级',
] as const;

const correctionRecordChangedFields: Record<string, string[]> = {
  '1': ['产品名称'],
  '2': ['投诉分类二级', '处理结果状态'],
  '3': ['小结类型'],
};

const correctionRecordOriginalDetails: Record<string, Partial<Record<(typeof summaryRecordDetailFields)[number], string>>> = {
  '1': {
    产品名称: '学习机',
  },
  '2': {
    投诉分类二级: '一级升级',
    处理结果状态: '已处理',
  },
  '3': {
    小结类型: '在线',
  },
};

const recordingRows = Array.from({ length: 8 }, (_, index) => ({
  id: `${index + 1}`,
  recordNo: `${10251 - index}`,
  employeeId: index % 2 === 0 ? '1006' : '1004',
  employeeName: index % 2 === 0 ? 'wesley' : '员工A',
  extensionNo: index % 2 === 0 ? '8001' : '8002',
  department: '教育部',
  skillGroup: '学习机组',
  startAt: `2026-03-30 14:${(57 - index).toString().padStart(2, '0')}:12`,
  endAt: `2026-03-30 14:${(58 - index).toString().padStart(2, '0')}:12`,
  duration: `00:00:${(index + 1).toString().padStart(2, '0')}`,
  callType: index % 3 === 0 ? '呼入电话' : '呼出电话',
  caller: index % 2 === 0 ? '02160602023' : '17501613137',
  callee: index % 2 === 0 ? '13162852202' : '02160602023',
  endReason: index % 2 === 0 ? '话务员挂机' : '客户挂机',
  satisfaction: index % 2 === 0 ? '非常满意' : '未评价',
}));

const sampleRecordingRows = [
  { id: '1', recordNo: '10246', quality: '优质录音', description: '测试范例录音', submitter: 'wesley', submittedAt: '2026-03-30 15:05:52', reason: '测试范例录音', status: '通过', reviewer: 'ADMIN', opinion: '录音内容清晰，适合作为范例。', auditCategory: '优质录音', customerName: '李磊序', employeeName: 'wesley', department: '教育部', skillGroup: '学习机组', startedAt: '2026-03-30 15:04:38', endedAt: '2026-03-30 15:04:38', duration: '00:00:00', callType: '呼出电话' },
  { id: '2', recordNo: '10239', quality: '优秀录音', description: '测试', submitter: '刘梦玲', submittedAt: '2026-03-30 14:52:49', reason: '测试', status: '通过', reviewer: 'ADMIN', opinion: '表达完整，服务流程规范。', auditCategory: '优秀录音', customerName: '刘梦玲客户1', employeeName: '刘梦玲', department: '教育部', skillGroup: '学习机组', startedAt: '2026-03-30 14:32:22', endedAt: '2026-03-30 14:34:01', duration: '00:01:39', callType: '呼出电话' },
  { id: '3', recordNo: '10245', quality: '劣质录音', description: '测试范例录音', submitter: 'wesley', submittedAt: '2026-03-30 14:50:41', reason: '测试范例录音', status: '待审批', customerName: '李磊序', employeeName: 'wesley', department: '教育部', skillGroup: '语音质检组', startedAt: '2026-03-30 14:50:17', endedAt: '2026-03-30 14:50:19', duration: '00:00:02', callType: '呼出电话' },
];

const defaultSampleAuditFilters = {
  status: '',
  quality: '',
  department: '',
  skillGroup: '',
  startAt: '2026-03-30T00:00',
  endAt: '2026-03-30T23:59',
};

const defaultSampleQueryFilters = {
  category: '',
  quality: '',
  department: '',
  skillGroup: '',
  startAt: '',
  endAt: '',
};

const defaultSmsSentFilterForm = {
  senderDept: '',
  sender: '',
  status: '',
  startAt: '2026-03-01T00:00',
  endAt: '2026-03-31T23:59',
  content: '',
  receiverNo: '',
};

const smsSendStatusOptions = ['待发送', '请求中', '提交成功', '发送中', '已送达', '发送失败'] as const;

const defaultMailSentFilterForm = {
  receiverEmail: '',
  senderDept: '',
  sender: '',
  status: '',
  startAt: '2026-03-01T00:00',
  endAt: '2026-03-31T23:59',
  subject: '',
  content: '',
};

const mailSendStatusOptions = ['处理中', '已发送', '已投递', '投递失败'] as const;

const defaultMailReceivedFilterForm = {
  senderCustomer: '',
  status: '未处理',
  startAt: '',
  endAt: '',
  subject: '',
  content: '',
};

const defaultWebchatHistoryFilters = {
  visitorId: '',
  sessionId: '',
  employeeId: '',
  department: '',
  employeeName: '',
  startAt: '2026-03-28T00:00',
  endAt: '2026-03-31T23:59',
  summarized: '',
  channel: '',
  queue: '',
  endReason: '',
  content: '',
};

const defaultWebchatMessageFilters = {
  status: '',
  channel: '',
  startAt: '2026-02-01T00:00',
  endAt: '2026-03-31T23:59',
  department: '',
  processor: '',
  customerName: '',
  contact: '',
  content: '',
};

function formatQueueMonitorDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

const queueMonitorPhoneBaseRows = [
  { id: '16', queue: '16', queueName: '人工队列jimi', skillGroup: '学习机一组', requestWaitingCount: 0, loginSeatCount: 4, idleSeatCount: 1, busySeatCount: 2, afterCallCount: 1, restCount: 0, callCount: 8, maxWaitSeconds: 12 },
  { id: '17', queue: '17', queueName: '人工队列12', skillGroup: '学习机一组', requestWaitingCount: 1, loginSeatCount: 5, idleSeatCount: 2, busySeatCount: 2, afterCallCount: 1, restCount: 0, callCount: 13, maxWaitSeconds: 26 },
  { id: '18', queue: '18', queueName: '人工队列35', skillGroup: '学习机二组', requestWaitingCount: 0, loginSeatCount: 3, idleSeatCount: 1, busySeatCount: 1, afterCallCount: 1, restCount: 0, callCount: 6, maxWaitSeconds: 9 },
  { id: '19', queue: '19', queueName: '人工队列89', skillGroup: '法院业务组', requestWaitingCount: 2, loginSeatCount: 6, idleSeatCount: 1, busySeatCount: 3, afterCallCount: 1, restCount: 1, callCount: 15, maxWaitSeconds: 44 },
  { id: '20', queue: '20', queueName: '人工队列4', skillGroup: '法院业务组', requestWaitingCount: 0, loginSeatCount: 4, idleSeatCount: 2, busySeatCount: 1, afterCallCount: 0, restCount: 1, callCount: 9, maxWaitSeconds: 18 },
  { id: '21', queue: '21', queueName: '人工队列zwg', skillGroup: '售后服务组', requestWaitingCount: 1, loginSeatCount: 4, idleSeatCount: 1, busySeatCount: 2, afterCallCount: 1, restCount: 0, callCount: 11, maxWaitSeconds: 32 },
  { id: '24', queue: '24', queueName: '人工队列ysl', skillGroup: '售后服务组', requestWaitingCount: 0, loginSeatCount: 2, idleSeatCount: 1, busySeatCount: 1, afterCallCount: 0, restCount: 0, callCount: 4, maxWaitSeconds: 6 },
];

const queueMonitorWebchatBaseRows = [
  { id: 'web-1', queue: '默认队列 [2025.11.13 - 14:42]', totalSeatCount: 10, onlineSeatCount: 1, robotSessionCount: 0, requestWaitingCount: 0, chatSessionCount: 1, maxWaitSeconds: 0, avgWaitSeconds: 0, maxChatSeconds: 0, instantReplyCount: 0, phoneOnlineCount: 0, busyStatusCount: 0, awayStatusCount: 0, lunchStatusCount: 0, hiddenStatusCount: 0 },
  { id: 'web-2', queue: '默认队列 [2025.11.19 - 14:18]', totalSeatCount: 6, onlineSeatCount: 2, robotSessionCount: 1, requestWaitingCount: 0, chatSessionCount: 2, maxWaitSeconds: 8, avgWaitSeconds: 4, maxChatSeconds: 95, instantReplyCount: 1, phoneOnlineCount: 1, busyStatusCount: 1, awayStatusCount: 0, lunchStatusCount: 0, hiddenStatusCount: 0 },
  { id: 'web-3', queue: '咨询', totalSeatCount: 4, onlineSeatCount: 0, robotSessionCount: 0, requestWaitingCount: 1, chatSessionCount: 0, maxWaitSeconds: 35, avgWaitSeconds: 18, maxChatSeconds: 0, instantReplyCount: 0, phoneOnlineCount: 0, busyStatusCount: 0, awayStatusCount: 0, lunchStatusCount: 0, hiddenStatusCount: 0 },
  { id: 'web-4', queue: '默认队列A1', totalSeatCount: 5, onlineSeatCount: 2, robotSessionCount: 0, requestWaitingCount: 0, chatSessionCount: 2, maxWaitSeconds: 5, avgWaitSeconds: 2, maxChatSeconds: 180, instantReplyCount: 1, phoneOnlineCount: 1, busyStatusCount: 1, awayStatusCount: 0, lunchStatusCount: 0, hiddenStatusCount: 0 },
  { id: 'web-5', queue: '默认队列 [2025.12.08 - 11:45]', totalSeatCount: 1, onlineSeatCount: 0, robotSessionCount: 0, requestWaitingCount: 0, chatSessionCount: 0, maxWaitSeconds: 0, avgWaitSeconds: 0, maxChatSeconds: 0, instantReplyCount: 0, phoneOnlineCount: 0, busyStatusCount: 0, awayStatusCount: 0, lunchStatusCount: 0, hiddenStatusCount: 1 },
  { id: 'web-6', queue: 'lml测试队列1', totalSeatCount: 4, onlineSeatCount: 1, robotSessionCount: 0, requestWaitingCount: 0, chatSessionCount: 1, maxWaitSeconds: 0, avgWaitSeconds: 0, maxChatSeconds: 46, instantReplyCount: 0, phoneOnlineCount: 0, busyStatusCount: 1, awayStatusCount: 0, lunchStatusCount: 0, hiddenStatusCount: 0 },
  { id: 'web-7', queue: '默认队列 [2026.01.08 - 15:20]', totalSeatCount: 3, onlineSeatCount: 1, robotSessionCount: 0, requestWaitingCount: 0, chatSessionCount: 0, maxWaitSeconds: 0, avgWaitSeconds: 0, maxChatSeconds: 0, instantReplyCount: 0, phoneOnlineCount: 0, busyStatusCount: 0, awayStatusCount: 1, lunchStatusCount: 0, hiddenStatusCount: 0 },
];

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(pageCardClass, className)}>{children}</div>;
}

function Field({
  label,
  children,
  className,
}: {
  key?: React.Key;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex min-w-0 items-center gap-2 text-[13px] text-slate-500', className)}>
      <span className="w-[104px] shrink-0 whitespace-nowrap text-right leading-5">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  );
}

function QueryActions({ onSearch, onReset }: { onSearch?: () => void; onReset?: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onSearch} className={primaryButtonClass}>
        <Search size={14} className="mr-1.5" />
        查询
      </button>
      <button type="button" onClick={onReset} className={secondaryButtonClass}>
        <RotateCcw size={14} className="mr-1.5" />
        重置
      </button>
    </div>
  );
}

function FooterPagination({ total }: { total: string }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4 text-[13px] text-slate-500">
      <span>{total}</span>
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            type="button"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border text-[13px]',
              page === 1 ? 'border-brand-200 bg-brand-50 text-brand-600' : 'border-slate-200 bg-white text-slate-500'
            )}
          >
            {page}
          </button>
        ))}
      </div>
      <div className="rounded-md border border-slate-200 px-3 py-1.5">10条/页</div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  widthClass = 'max-w-3xl',
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div className="modal-overlay-pop fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4">
      <div className={cn('modal-panel-pop w-full rounded-xl bg-white shadow-2xl', widthClass)}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-[18px] font-semibold text-slate-800">{title}</div>
          <button type="button" onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlayerBar() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div className="text-[12px] text-slate-500">00:00</div>
      <div className="flex items-center gap-2">
        <button type="button" className={secondaryButtonClass}>
          <Volume2 size={14} />
        </button>
        <button type="button" onClick={() => setPlaying((value) => !value)} className={solidButtonClass}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div className="h-full w-1/3 rounded-full bg-brand-400" />
      </div>
      <div className="rounded-md border border-slate-200 px-3 py-1.5 text-[13px] text-slate-500">1倍速</div>
    </div>
  );
}

function SummaryHotlinePlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(28);
  const [volume, setVolume] = useState(42);
  const [speed, setSpeed] = useState('1');

  return (
    <div className="mt-5 w-[470px] max-w-full rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-3 text-[12px] text-slate-500">
        <span className="shrink-0">00:00</span>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProgress((value) => Math.max(0, value - 10))}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-[12px] text-slate-500 transition-colors hover:bg-slate-50"
          >
            |
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            type="button"
            onClick={() => setProgress((value) => Math.min(100, value + 10))}
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-[12px] text-slate-500 transition-colors hover:bg-slate-50"
          >
            |
          </button>
          <Volume2 size={14} className="text-slate-500" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500"
          />
        </div>
        <select
          value={speed}
          onChange={(event) => setSpeed(event.target.value)}
          className="h-7 rounded border border-slate-200 bg-white px-2 text-[12px] text-slate-500 outline-none focus:border-brand-400"
        >
          <option value="0.5">0.5倍速</option>
          <option value="1">1倍速</option>
          <option value="1.5">1.5倍速</option>
          <option value="2">2倍速</option>
        </select>
      </div>
    </div>
  );
}

export default function LegacyModulesPanel({ page, onOpenMainTab, filterPreset, onFilterPresetConsumed }: { page: LegacyModulePage; onOpenMainTab?: (tab: string) => void; filterPreset?: LegacyModuleFilterPreset | null; onFilterPresetConsumed?: () => void }) {
  const currentSummaryAgent = '坐席A';
  const [toast, setToast] = useState<string | null>(null);
  const [userSystems, setUserSystems] = useState(userSystemRows);
  const [userSystemKeyword, setUserSystemKeyword] = useState('');
  const [userSystemDialog, setUserSystemDialog] = useState<null | 'add' | 'edit'>(null);
  const [editingUserSystemId, setEditingUserSystemId] = useState<string | null>(null);
  const [userSystemForm, setUserSystemForm] = useState({ name: '', blacklistDays: '30' });
  const [showSummaryFilters, setShowSummaryFilters] = useState(false);
  const [summaryCorrectionTarget, setSummaryCorrectionTarget] = useState<(typeof summaryRows)[number] | null>(null);
  const [summaryRecordsTarget, setSummaryRecordsTarget] = useState<(typeof summaryRows)[number] | null>(null);
  const [summaryRecordDetail, setSummaryRecordDetail] = useState<(typeof correctionRecords)[number] | null>(null);
  const [summaryRecordDetailForm, setSummaryRecordDetailForm] = useState<Record<string, string>>({});
  const [summaryHotlineRow, setSummaryHotlineRow] = useState<(typeof summaryRows)[number] | null>(null);
  const [summaryCorrectionForm, setSummaryCorrectionForm] = useState<Record<string, string>>({});
  const [summaryFilters, setSummaryFilters] = useState({
    scope: 'my' as 'my' | 'managed',
    businessLine: '',
    category: '',
    product: '',
    consultType: '',
    startAt: '',
    endAt: '',
    department: '',
    agent: '',
    summaryType: '',
    status: '',
    customerId: '',
    sessionId: '',
  });
  const [summaryCorrectionSortOrder, setSummaryCorrectionSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [recordingFilters, setRecordingFilters] = useState({
    recordNo: '',
    department: '',
    employee: '',
    startAt: '2026-03-30T00:00',
    endAt: '2026-03-30T23:59',
    caller: '',
    callee: '',
    extensionNo: '',
    skillGroup: '',
    employeeId: '',
    callType: '',
    satisfaction: '',
  });
  const [selectedRecordingIds, setSelectedRecordingIds] = useState<string[]>([]);
  const [showRecordingFilters, setShowRecordingFilters] = useState(false);
  const [recordingAudioRowId, setRecordingAudioRowId] = useState<string | null>(null);
  const [sampleSubmitTarget, setSampleSubmitTarget] = useState<(typeof recordingRows)[number] | null>(null);
  const [sampleSubmitForm, setSampleSubmitForm] = useState({
    description: '',
    quality: '',
    owner: '',
    path: '',
    reason: '',
  });
  const [auditRows, setAuditRows] = useState(sampleRecordingRows);
  const [auditAudioRowId, setAuditAudioRowId] = useState<string | null>(null);
  const [sampleQueryAudioRowId, setSampleQueryAudioRowId] = useState<string | null>(null);
  const [sampleQueryFilterForm, setSampleQueryFilterForm] = useState({ ...defaultSampleQueryFilters });
  const [sampleQueryFilters, setSampleQueryFilters] = useState({ ...defaultSampleQueryFilters });
  const [auditFilterForm, setAuditFilterForm] = useState({ ...defaultSampleAuditFilters });
  const [auditFilters, setAuditFilters] = useState({ ...defaultSampleAuditFilters });
  const [auditTarget, setAuditTarget] = useState<(typeof sampleRecordingRows)[number] | null>(null);
  const [auditDecision, setAuditDecision] = useState<'agree' | 'reject'>('agree');
  const [auditCategory, setAuditCategory] = useState('');
  const [auditOpinion, setAuditOpinion] = useState('');

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const filteredUserSystems = useMemo(
    () => userSystems.filter((item) => item.name.toLowerCase().includes(userSystemKeyword.trim().toLowerCase())),
    [userSystems, userSystemKeyword]
  );

  const filteredSummaryRows = useMemo(
    () =>
      summaryRows.filter((row) => {
        const createdAtStamp = new Date(row.createdAt.replace(' ', 'T')).getTime();
        const startStamp = summaryFilters.startAt ? new Date(summaryFilters.startAt).getTime() : null;
        const endStamp = summaryFilters.endAt ? new Date(summaryFilters.endAt).getTime() : null;

        return (
          (summaryFilters.scope === 'managed' || row.agent === currentSummaryAgent) &&
          (!summaryFilters.businessLine || row.businessLine === summaryFilters.businessLine) &&
          (!summaryFilters.category || row.category === summaryFilters.category) &&
          (!summaryFilters.product || row.product === summaryFilters.product) &&
          (!summaryFilters.consultType || row.type === summaryFilters.consultType) &&
          (!summaryFilters.department || row.department === summaryFilters.department) &&
          (!summaryFilters.agent || row.agent === summaryFilters.agent) &&
          (!summaryFilters.summaryType || row.summaryType === summaryFilters.summaryType) &&
          (!summaryFilters.status || row.status === summaryFilters.status) &&
          (!summaryFilters.customerId || row.customerId.includes(summaryFilters.customerId)) &&
          (!summaryFilters.sessionId || row.sessionId.includes(summaryFilters.sessionId)) &&
          (!startStamp || createdAtStamp >= startStamp) &&
          (!endStamp || createdAtStamp <= endStamp)
        );
      }),
    [currentSummaryAgent, summaryFilters]
  );

  const sortedSummaryRows = useMemo(() => {
    if (!summaryCorrectionSortOrder) {
      return filteredSummaryRows;
    }

    return [...filteredSummaryRows].sort((left, right) =>
      summaryCorrectionSortOrder === 'asc' ? left.correctionCount - right.correctionCount : right.correctionCount - left.correctionCount
    );
  }, [filteredSummaryRows, summaryCorrectionSortOrder]);

  const filteredRecordingRows = useMemo(
    () =>
      recordingRows.filter((row) => {
        const startStamp = recordingFilters.startAt ? new Date(recordingFilters.startAt).getTime() : null;
        const endStamp = recordingFilters.endAt ? new Date(recordingFilters.endAt).getTime() : null;
        const rowStartStamp = new Date(row.startAt.replace(' ', 'T')).getTime();

        return (
          (!recordingFilters.recordNo || row.recordNo.includes(recordingFilters.recordNo)) &&
          (!recordingFilters.department || row.department === recordingFilters.department) &&
          (!recordingFilters.employee || row.employeeName === recordingFilters.employee) &&
          (!recordingFilters.caller || row.caller.includes(recordingFilters.caller)) &&
          (!recordingFilters.callee || row.callee.includes(recordingFilters.callee)) &&
          (!recordingFilters.extensionNo || row.extensionNo.includes(recordingFilters.extensionNo)) &&
          (!recordingFilters.skillGroup || row.skillGroup === recordingFilters.skillGroup) &&
          (!recordingFilters.employeeId || row.employeeId.includes(recordingFilters.employeeId)) &&
          (!recordingFilters.callType || row.callType === recordingFilters.callType) &&
          (!recordingFilters.satisfaction || row.satisfaction === recordingFilters.satisfaction) &&
          (!startStamp || rowStartStamp >= startStamp) &&
          (!endStamp || rowStartStamp <= endStamp)
        );
      }),
    [recordingFilters]
  );

  const filteredAuditRows = useMemo(
    () =>
      auditRows.filter((row) => {
        const submittedStamp = new Date(row.submittedAt.replace(' ', 'T')).getTime();
        const startStamp = auditFilters.startAt ? new Date(auditFilters.startAt).getTime() : null;
        const endStamp = auditFilters.endAt ? new Date(auditFilters.endAt).getTime() : null;

        return (
          (!auditFilters.status || row.status === auditFilters.status) &&
          (!auditFilters.quality || row.quality === auditFilters.quality) &&
          (!auditFilters.department || row.department === auditFilters.department) &&
          (!auditFilters.skillGroup || row.skillGroup === auditFilters.skillGroup) &&
          (!startStamp || submittedStamp >= startStamp) &&
          (!endStamp || submittedStamp <= endStamp)
        );
      }),
    [auditFilters, auditRows]
  );

  const filteredSampleQueryRows = useMemo(
    () =>
      auditRows.filter((row) => {
        const submittedStamp = new Date(row.submittedAt.replace(' ', 'T')).getTime();
        const startStamp = sampleQueryFilters.startAt ? new Date(sampleQueryFilters.startAt).getTime() : null;
        const endStamp = sampleQueryFilters.endAt ? new Date(sampleQueryFilters.endAt).getTime() : null;

        return (
          row.status === '通过' &&
          (!sampleQueryFilters.category || (row as { auditCategory?: string }).auditCategory === sampleQueryFilters.category) &&
          (!sampleQueryFilters.quality || row.quality === sampleQueryFilters.quality) &&
          (!sampleQueryFilters.department || row.department === sampleQueryFilters.department) &&
          (!sampleQueryFilters.skillGroup || row.skillGroup === sampleQueryFilters.skillGroup) &&
          (!startStamp || submittedStamp >= startStamp) &&
          (!endStamp || submittedStamp <= endStamp)
        );
      }),
    [auditRows, sampleQueryFilters]
  );

  const submitUserSystem = () => {
    if (!userSystemForm.name.trim()) {
      showToast('请先填写用户体系名称');
      return;
    }

    if (userSystemDialog === 'edit' && editingUserSystemId) {
      setUserSystems((current) =>
        current.map((item) =>
          item.id === editingUserSystemId
            ? { ...item, name: userSystemForm.name.trim(), blacklistDays: Number(userSystemForm.blacklistDays || '0'), updatedAt: '2026-04-02 10:58:00' }
            : item
        )
      );
      showToast('用户体系已更新');
    } else {
      setUserSystems((current) => [
        { id: String(current.length + 1), name: userSystemForm.name.trim(), blacklistDays: Number(userSystemForm.blacklistDays || '0'), createdAt: '2026-04-02 10:58:00', updatedAt: '2026-04-02 10:58:00' },
        ...current,
      ]);
      showToast('用户体系已新增');
    }

    setUserSystemDialog(null);
  };

  const deleteUserSystem = (id: string) => {
    setUserSystems((current) => current.filter((item) => item.id !== id));
    showToast('用户体系已删除');
  };

  const submitSummaryCorrection = () => {
    if (!summaryCorrectionTarget) {
      return;
    }
    showToast(`已提交 ${summaryCorrectionTarget.product} 的小结纠错`);
    setSummaryCorrectionTarget(null);
  };

  const openSummaryCorrection = (row: (typeof summaryRows)[number]) => {
    setSummaryCorrectionTarget(row);
    setSummaryCorrectionForm({
      产品分类: row.category,
      产品名称: row.product,
      呼入类型: row.type,
      问题定型: row.issueType,
      问题分类一级: row.level1,
      问题分类二级: row.level2,
      问题分类三级: row.level3,
      小结类型: row.summaryType,
      处理结果状态: row.status === '已完成' ? '已处理' : row.status,
      账号: row.customerId === '-' ? '' : row.customerId,
      投诉分类一级: '服务态度',
      投诉分类二级: '一级升级',
    });
  };

  const openSummaryRecordDetail = (record: (typeof correctionRecords)[number]) => {
    setSummaryRecordDetail(record);
    setSummaryRecordDetailForm({ ...record.detail });
  };

  const openSummaryRecordsModal = (row: (typeof summaryRows)[number]) => {
    setSummaryRecordsTarget(row);
    const targetRecords = correctionRecords.filter((item) => item.summaryId === row.id);
    if (targetRecords.length > 0) {
      openSummaryRecordDetail(targetRecords[0]);
    } else {
      setSummaryRecordDetail(null);
      setSummaryRecordDetailForm({});
    }
  };

  const openAppointmentTransfer = (row: (typeof appointmentRows)[number]) => {
    setAppointmentTransferTarget(row);
    setAppointmentTransferDepartment(row.department === '-' ? '' : row.department);
  };

  const closeAuditModal = () => {
    setAuditTarget(null);
    setAuditDecision('agree');
    setAuditCategory('');
    setAuditOpinion('');
  };

  const closeSampleSubmitModal = () => {
    setSampleSubmitTarget(null);
    setSampleSubmitForm({
      description: '',
      quality: '',
      owner: '',
      path: '',
      reason: '',
    });
  };

  const closeWebchatHistorySampleSubmitModal = () => {
    setWebchatHistorySampleTargetId(null);
    setWebchatHistorySampleSubmitForm({
      description: '',
      owner: '',
      quality: '',
      reason: '',
    });
  };

  const openSampleSubmitModal = () => {
    if (selectedRecordingIds.length === 0) {
      showToast('请先选择一条录音');
      return;
    }

    if (selectedRecordingIds.length > 1) {
      showToast('一次仅支持提交一条范例录音');
      return;
    }

    const target = recordingRows.find((row) => row.id === selectedRecordingIds[0]);
    if (!target) {
      showToast('未找到选中的录音');
      return;
    }

    setSampleSubmitTarget(target);
    setSampleSubmitForm({
      description: '',
      quality: '',
      owner: target.employeeName,
      path: `https://dev-crm.zhugeapi.net/EliteH5GetRecService/GetRecord?recordNo=${target.recordNo}`,
      reason: '',
    });
  };

  const openWebchatHistorySampleSubmitModal = () => {
    if (selectedWebchatHistoryIds.length === 0) {
      showToast('请先选择一条聊天记录');
      return;
    }

    if (selectedWebchatHistoryIds.length > 1) {
      showToast('一次仅支持提交一条范例聊天');
      return;
    }

    const target = webchatHistoryRows.find((row) => row.id === selectedWebchatHistoryIds[0]);
    if (!target) {
      showToast('未找到选中的聊天记录');
      return;
    }

    setWebchatHistorySampleTargetId(target.id);
    setWebchatHistorySampleSubmitForm({
      description: '',
      owner: target.employeeName,
      quality: '',
      reason: '',
    });
  };

  const submitSampleRecording = () => {
    if (!sampleSubmitTarget) {
      return;
    }

    if (!sampleSubmitForm.description.trim()) {
      showToast('请输入录音描述');
      return;
    }

    if (!sampleSubmitForm.quality) {
      showToast('请选择录音品质');
      return;
    }

    if (!sampleSubmitForm.reason.trim()) {
      showToast('请输入提交理由');
      return;
    }

    setAuditRows((current) => [
      {
        id: `${Date.now()}`,
        recordNo: sampleSubmitTarget.recordNo,
        quality: sampleSubmitForm.quality,
        description: sampleSubmitForm.description.trim(),
        submitter: sampleSubmitForm.owner,
        submittedAt: '2026-04-02 10:30:00',
        reason: sampleSubmitForm.reason.trim(),
        status: '待审批',
        customerName: sampleSubmitTarget.callee,
        employeeName: sampleSubmitTarget.employeeName,
        department: sampleSubmitTarget.department,
        skillGroup: sampleSubmitTarget.skillGroup,
        startedAt: sampleSubmitTarget.startAt,
        endedAt: sampleSubmitTarget.endAt,
        duration: sampleSubmitTarget.duration,
        callType: sampleSubmitTarget.callType,
      },
      ...current,
    ]);
    showToast('范例录音已提交');
    setSelectedRecordingIds([]);
    closeSampleSubmitModal();
  };

  const submitWebchatHistorySample = () => {
    if (!webchatHistorySampleTargetId) {
      return;
    }

    if (!webchatHistorySampleSubmitForm.description.trim()) {
      showToast('请输入聊天描述');
      return;
    }

    if (!webchatHistorySampleSubmitForm.quality) {
      showToast('请选择聊天品质');
      return;
    }

    if (!webchatHistorySampleSubmitForm.reason.trim()) {
      showToast('请输入提交理由');
      return;
    }

    setWebchatHistoryRows((current) =>
      current.map((row) =>
        row.id === webchatHistorySampleTargetId ? { ...row, exampleStatus: '待审批' } : row
      )
    );
    showToast('聊天范例已提交');
    setSelectedWebchatHistoryIds([]);
    closeWebchatHistorySampleSubmitModal();
  };

  const submitAudit = () => {
    if (!auditTarget) {
      return;
    }

    if (!auditCategory) {
      showToast('请选择分类');
      return;
    }

    if (!auditOpinion.trim()) {
      showToast('请输入审核意见');
      return;
    }

    const approved = auditDecision === 'agree';

    setAuditRows((current) =>
      current.map((item) =>
        item.id === auditTarget.id
          ? {
              ...item,
              status: approved ? '通过' : '不通过',
              reviewer: 'ADMIN',
              opinion: auditOpinion.trim(),
              auditCategory,
            }
          : item
      )
    );
    showToast(approved ? '范例录音已通过' : '范例录音已驳回');
    closeAuditModal();
  };

  const renderUserSystemPage = () => (
    <div className={pageWrapperClass}>
      <div className={pageScrollClass}>
        <SectionCard>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Field label="用户体系名称:" className="min-w-[360px]">
                <input
                  value={userSystemKeyword}
                  onChange={(event) => setUserSystemKeyword(event.target.value)}
                  placeholder="请输入用户体系名称"
                  className={inputClass}
                />
              </Field>
              <QueryActions onReset={() => setUserSystemKeyword('')} />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                setUserSystemDialog('add');
                setEditingUserSystemId(null);
                setUserSystemForm({ name: '', blacklistDays: '30' });
              }}
              className={solidButtonClass}
            >
              新增
            </button>
            <div className="text-[13px] text-slate-400">共 {filteredUserSystems.length} 条数据</div>
          </div>

          <div className="overflow-auto px-5 py-4 custom-scrollbar">
            <table className="min-w-full table-fixed text-left text-[13px]">
              <thead className="bg-slate-50/90 text-slate-600">
                <tr>
                  {['序号', '用户体系名称', '黑名单天数', '创建时间', '更新时间', '操作'].map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {filteredUserSystems.map((row, index) => (
                  <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                    <td className="px-4 py-4">{row.id}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">{row.name}</td>
                    <td className="px-4 py-4">{row.blacklistDays}</td>
                    <td className="px-4 py-4">{row.createdAt}</td>
                    <td className="px-4 py-4">{row.updatedAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4 text-brand-600">
                        <button
                          type="button"
                          onClick={() => {
                            setUserSystemDialog('edit');
                            setEditingUserSystemId(row.id);
                            setUserSystemForm({ name: row.name, blacklistDays: String(row.blacklistDays) });
                          }}
                        >
                          编辑
                        </button>
                        <button type="button" onClick={() => deleteUserSystem(row.id)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FooterPagination total={`共 ${filteredUserSystems.length} 条记录`} />
        </SectionCard>
      </div>
    </div>
  );

  const summaryFieldClass = 'xl:[&>label>span]:w-[88px]';
  const summarySelectClass = cn(inputClass, 'pr-8 text-[12px]');
  const summaryCompactSelectClass = cn(inputClass, 'px-2 pr-6 text-[12px]');
  const summaryDateInputClass = cn(inputClass, 'min-w-[220px] px-2 text-[12px]');

  const renderSummaryPage = () => (
    <div className={pageWrapperClass}>
      <div className={pageScrollClass}>
        <SectionCard>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="mb-4 flex items-center justify-end gap-3">
              <QueryActions
                onReset={() =>
                  setSummaryFilters({
                    scope: 'my',
                    businessLine: '',
                    category: '',
                    product: '',
                    consultType: '',
                    startAt: '',
                    endAt: '',
                    department: '',
                    agent: '',
                    summaryType: '',
                    status: '',
                    customerId: '',
                    sessionId: '',
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowSummaryFilters((value) => !value)}
                className="flex items-center gap-1 text-[13px] font-medium text-brand-600"
              >
                {showSummaryFilters ? '收起' : '展开'}
                {showSummaryFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <div className={cn('grid grid-cols-1 gap-4 xl:grid-cols-12 xl:[&>label]:col-span-3', summaryFieldClass)}>
              <Field label="查看范围:" className="xl:col-span-2">
                <select
                  value={summaryFilters.scope}
                  onChange={(event) =>
                    setSummaryFilters((current) => ({ ...current, scope: event.target.value as 'my' | 'managed' }))
                  }
                  className={summarySelectClass}
                >
                  <option value="my">我的</option>
                  <option value="managed">我管的</option>
                </select>
              </Field>
              <Field label="业务线:" className="xl:col-span-2">
                <select
                  value={summaryFilters.businessLine}
                  onChange={(event) => setSummaryFilters((current) => ({ ...current, businessLine: event.target.value }))}
                  className={summarySelectClass}
                >
                  <option value="">请选择业务线</option>
                  <option value="教育">教育</option>
                  <option value="法院">法院</option>
                </select>
              </Field>
              <Field label="产品分类:" className="xl:col-span-3">
                <select
                  value={summaryFilters.category}
                  onChange={(event) => setSummaryFilters((current) => ({ ...current, category: event.target.value }))}
                  className={summarySelectClass}
                >
                  <option value="">请选择产品分类</option>
                  <option value="智学网">智学网</option>
                  <option value="电脑">电脑</option>
                  <option value="张女士">张女士</option>
                </select>
              </Field>
              <Field label="产品名称:" className="xl:col-span-3">
                <select
                  value={summaryFilters.product}
                  onChange={(event) => setSummaryFilters((current) => ({ ...current, product: event.target.value }))}
                  className={summarySelectClass}
                >
                  <option value="">请选择产品名称</option>
                  <option value="平板">平板</option>
                  <option value="笔记本电脑">笔记本电脑</option>
                  <option value="体系1">体系1</option>
                </select>
              </Field>
              <Field label="咨询类型:" className="xl:col-span-2">
                <select
                  value={summaryFilters.consultType}
                  onChange={(event) => setSummaryFilters((current) => ({ ...current, consultType: event.target.value }))}
                  className={summarySelectClass}
                >
                  <option value="">请选择咨询类型</option>
                  <option value="咨询">咨询</option>
                  <option value="投诉">投诉</option>
                </select>
              </Field>
            </div>
            {showSummaryFilters ? (
              <div className="mt-4 space-y-4">
                <div
                  className={cn(
                    'grid grid-cols-1 gap-4 xl:grid-cols-12 xl:[&>label:nth-child(1)]:col-span-6 xl:[&>label:nth-child(2)]:col-span-3 xl:[&>label:nth-child(3)]:col-span-3',
                    summaryFieldClass
                  )}
                >
                  <Field label="时间范围:" className="xl:col-span-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                      <input
                        type="datetime-local"
                        value={summaryFilters.startAt}
                        onChange={(event) => setSummaryFilters((current) => ({ ...current, startAt: event.target.value }))}
                        className={summaryDateInputClass}
                      />
                      <span className="text-slate-400">至</span>
                      <input
                        type="datetime-local"
                        value={summaryFilters.endAt}
                        onChange={(event) => setSummaryFilters((current) => ({ ...current, endAt: event.target.value }))}
                        className={summaryDateInputClass}
                      />
                    </div>
                  </Field>
                  <Field label="处理部门:" className="xl:col-span-2">
                    <select
                      value={summaryFilters.department}
                      onChange={(event) => setSummaryFilters((current) => ({ ...current, department: event.target.value }))}
                      className={summarySelectClass}
                    >
                      <option value="">请选择处理部门</option>
                      <option value="教育部">教育部</option>
                    </select>
                  </Field>
                  <Field label="处理人:" className="xl:col-span-2">
                    <select
                      value={summaryFilters.agent}
                      onChange={(event) => setSummaryFilters((current) => ({ ...current, agent: event.target.value }))}
                      className={summarySelectClass}
                    >
                      <option value="">请选择处理人</option>
                      <option value="坐席A">坐席A</option>
                    </select>
                  </Field>
                </div>

                <div className={cn('grid grid-cols-1 gap-4 xl:grid-cols-12', summaryFieldClass)}>
                  <Field label="小结类型:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                    <select
                      value={summaryFilters.summaryType}
                      onChange={(event) => setSummaryFilters((current) => ({ ...current, summaryType: event.target.value }))}
                      className={summaryCompactSelectClass}
                    >
                      <option value="">请选择小结类型</option>
                      <option value="在线">在线</option>
                      <option value="热线">热线</option>
                    </select>
                  </Field>
                  <Field label="小结状态:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                    <select
                      value={summaryFilters.status}
                      onChange={(event) => setSummaryFilters((current) => ({ ...current, status: event.target.value }))}
                      className={summaryCompactSelectClass}
                    >
                      <option value="">请选择小结状态</option>
                      <option value="暂存">暂存</option>
                      <option value="已完成">已完成</option>
                    </select>
                  </Field>
                </div>

                <div className={cn('grid grid-cols-1 gap-4 xl:grid-cols-12 xl:[&>label]:col-span-4', summaryFieldClass)}>
                  <Field label="客户号码:" className="xl:col-span-4">
                    <input
                      value={summaryFilters.customerId}
                      onChange={(event) => setSummaryFilters((current) => ({ ...current, customerId: event.target.value }))}
                      placeholder="请输入客户号码"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="会话ID:" className="xl:col-span-4">
                    <input
                      value={summaryFilters.sessionId}
                      onChange={(event) => setSummaryFilters((current) => ({ ...current, sessionId: event.target.value }))}
                      placeholder="请输入会话ID"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>

          <div className="overflow-auto px-5 py-4 custom-scrollbar">
            <table className="min-w-[1700px] table-fixed text-left text-[13px]">
              <thead className="bg-slate-50/90 text-slate-600">
                <tr>
                  {['序号', '业务线', '产品分类', '产品名称', '咨询类型', '小结状态', '创建时间', '小结类型', '处理部门', '处理人', '问题分类一级', '问题分类二级', '问题分类三级', '客户号码', '会话ID'].map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() =>
                        setSummaryCorrectionSortOrder((current) =>
                          current === null ? 'desc' : current === 'desc' ? 'asc' : null
                        )
                      }
                      className="inline-flex items-center gap-1 text-slate-600 transition-colors hover:text-slate-800"
                    >
                      <span>纠错次数</span>
                      <span className="flex flex-col leading-none">
                        <ChevronUp
                          size={12}
                          className={cn(summaryCorrectionSortOrder === 'asc' ? 'text-brand-600' : 'text-slate-300')}
                        />
                        <ChevronDown
                          size={12}
                          className={cn(summaryCorrectionSortOrder === 'desc' ? 'text-brand-600' : 'text-slate-300', '-mt-1')}
                        />
                      </span>
                    </button>
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {sortedSummaryRows.map((row, index) => (
                  <tr
                    key={row.id}
                    onDoubleClick={() => {
                      if (row.summaryType === '热线') setSummaryHotlineRow(row);
                    }}
                    className={cn(
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                      row.summaryType === '热线' ? 'cursor-pointer transition-colors hover:bg-brand-50/40' : '',
                      summaryHotlineRow?.id === row.id ? 'bg-brand-50/60' : ''
                    )}
                  >
                    <td className="px-4 py-4">{row.id}</td>
                    <td className="px-4 py-4">{row.businessLine}</td>
                    <td className="px-4 py-4">{row.category}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">{row.product}</td>
                    <td className="px-4 py-4">{row.type}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap',
                          row.status === '已完成' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{row.createdAt}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap',
                          row.summaryType === '热线' ? 'bg-brand-50 text-brand-700' : 'bg-sky-50 text-sky-700'
                        )}
                      >
                        {row.summaryType}
                      </span>
                    </td>
                    <td className="px-4 py-4">{row.department}</td>
                    <td className="px-4 py-4">{row.agent}</td>
                    <td className="px-4 py-4">{row.level1}</td>
                    <td className="px-4 py-4">{row.level2}</td>
                    <td className="px-4 py-4">{row.level3}</td>
                    <td className="px-4 py-4">{row.customerId}</td>
                    <td className="px-4 py-4">{row.sessionId}</td>
                    <td className="px-4 py-4 text-brand-500">
                      {row.correctionCount > 0 ? (
                        <button type="button" onClick={() => openSummaryRecordsModal(row)}>
                          {row.correctionCount}
                        </button>
                      ) : (
                        row.correctionCount
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 whitespace-nowrap text-brand-600">
                        <button type="button" onClick={() => openSummaryCorrection(row)}>
                          小结纠错
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {summaryHotlineRow && sortedSummaryRows.some((row) => row.id === summaryHotlineRow.id) ? (
            <div className="px-5 pb-2">
              <SummaryHotlinePlayer />
            </div>
          ) : null}

          <FooterPagination total={`共 ${sortedSummaryRows.length} 条记录`} />
        </SectionCard>
      </div>
    </div>
  );

  const renderRecordingBase = (title: LegacyModulePage) => {
    const isRecordingQuery = title === 'recording-query';
    const allRecordingSelected =
      filteredRecordingRows.length > 0 && filteredRecordingRows.every((row) => selectedRecordingIds.includes(row.id));
    const recordingFieldClass = 'xl:[&>span]:w-[72px]';
    const recordingSelectClass = cn(inputClass, 'pr-8 text-[12px]');
    const recordingDateInputClass = cn(inputClass, 'px-2 text-[12px]');

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              {isRecordingQuery ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="flex items-center gap-3">
                      <QueryActions
                        onReset={() => {
                          setRecordingFilters({
                            recordNo: '',
                            department: '',
                            employee: '',
                            startAt: '2026-03-30T00:00',
                            endAt: '2026-03-30T23:59',
                            caller: '',
                            callee: '',
                            extensionNo: '',
                            skillGroup: '',
                            employeeId: '',
                            callType: '',
                            satisfaction: '',
                          });
                          setSelectedRecordingIds([]);
                          setRecordingAudioRowId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRecordingFilters((value) => !value)}
                        className="flex items-center gap-1 text-[13px] font-medium text-brand-600"
                      >
                        {showRecordingFilters ? '收起' : '展开'}
                        {showRecordingFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <Field label="录音号:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                      <input
                        value={recordingFilters.recordNo}
                        onChange={(event) => setRecordingFilters((current) => ({ ...current, recordNo: event.target.value }))}
                        placeholder="请输入录音号"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="部门:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                      <select
                        value={recordingFilters.department}
                        onChange={(event) => setRecordingFilters((current) => ({ ...current, department: event.target.value }))}
                        className={recordingSelectClass}
                      >
                        <option value="">请选择</option>
                        <option value="教育部">教育部</option>
                      </select>
                    </Field>
                    <Field label="员工:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                      <select
                        value={recordingFilters.employee}
                        onChange={(event) => setRecordingFilters((current) => ({ ...current, employee: event.target.value }))}
                        className={recordingSelectClass}
                      >
                        <option value="">请选择</option>
                        <option value="wesley">wesley</option>
                        <option value="员工A">员工A</option>
                      </select>
                    </Field>
                    <Field label="开始时间:" className={cn(recordingFieldClass, 'xl:col-span-4')}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                        <input
                          type="datetime-local"
                          value={recordingFilters.startAt}
                          onChange={(event) => setRecordingFilters((current) => ({ ...current, startAt: event.target.value }))}
                          className={recordingDateInputClass}
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="datetime-local"
                          value={recordingFilters.endAt}
                          onChange={(event) => setRecordingFilters((current) => ({ ...current, endAt: event.target.value }))}
                          className={recordingDateInputClass}
                        />
                      </div>
                    </Field>
                  </div>

                  {showRecordingFilters ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                        <Field label="主叫号码:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <input
                            value={recordingFilters.caller}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, caller: event.target.value }))}
                            placeholder="请输入主叫号码"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="被叫号码:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <input
                            value={recordingFilters.callee}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, callee: event.target.value }))}
                            placeholder="请输入被叫号码"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="分机号:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <input
                            value={recordingFilters.extensionNo}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, extensionNo: event.target.value }))}
                            placeholder="请输入分机号"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="技能组:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <select
                            value={recordingFilters.skillGroup}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, skillGroup: event.target.value }))}
                            className={recordingSelectClass}
                          >
                            <option value="">请选择技能组</option>
                            <option value="学习机组">学习机组</option>
                          </select>
                        </Field>
                        <Field label="工号:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <input
                            value={recordingFilters.employeeId}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, employeeId: event.target.value }))}
                            placeholder="请输入工号"
                            className={inputClass}
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                        <Field label="电话类型:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <select
                            value={recordingFilters.callType}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, callType: event.target.value }))}
                            className={recordingSelectClass}
                          >
                            <option value="">请选择</option>
                            <option value="呼入电话">呼入电话</option>
                            <option value="呼出电话">呼出电话</option>
                          </select>
                        </Field>
                        <Field label="满意度:" className={cn(recordingFieldClass, 'xl:col-span-2')}>
                          <select
                            value={recordingFilters.satisfaction}
                            onChange={(event) => setRecordingFilters((current) => ({ ...current, satisfaction: event.target.value }))}
                            className={recordingSelectClass}
                          >
                            <option value="">请选择</option>
                            <option value="非常满意">非常满意</option>
                            <option value="未评价">未评价</option>
                          </select>
                        </Field>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                  {[
                    ['录音号', '请输入录音号'],
                    ['部门', '请选择'],
                    ['员工', '请选择'],
                    ['开始时间', '2026-03-30 00:00:00'],
                    ['技能组', '请选择技能组'],
                    ['主叫号码', '请输入主叫号码'],
                    ['被叫号码', '请输入被叫号码'],
                    ['分机号', '请输入分机号'],
                    ['满意度', '全部'],
                  ].map(([label, placeholder]) => (
                    <Field key={`${title}-${label}`} label={label}>
                      <input defaultValue={label === '开始时间' ? placeholder : ''} placeholder={placeholder} className={inputClass} />
                    </Field>
                  ))}
                  <div className="flex items-center justify-end">
                    <QueryActions />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <button type="button" className={solidButtonClass}>
                录音另存
              </button>
              <button type="button" onClick={isRecordingQuery ? openSampleSubmitModal : undefined} className={primaryButtonClass}>
                提交范例
              </button>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className={cn(isRecordingQuery ? 'min-w-[1680px]' : 'min-w-[1500px]', 'table-fixed text-left text-[13px]')}>
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    {isRecordingQuery ? (
                      <th className="w-10 px-2 py-3 text-center font-medium">
                        <input
                          type="checkbox"
                          checked={allRecordingSelected}
                          onChange={(event) =>
                            setSelectedRecordingIds(
                              event.target.checked ? filteredRecordingRows.map((row) => row.id) : []
                            )
                          }
                          className="h-4 w-4 cursor-pointer accent-brand-500"
                        />
                      </th>
                    ) : null}
                    {['序号', '录音号', '工号', '部门名称', '员工名称', '技能组', '开始时间', '结束时间', '持续时间', '电话类型', '主叫号码', '被叫号码', '结束原因', '满意度'].map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {(isRecordingQuery ? filteredRecordingRows : recordingRows).map((row, index) => (
                    <tr
                      key={`${title}-${row.id}`}
                      onDoubleClick={() => {
                        if (isRecordingQuery) setRecordingAudioRowId(row.id);
                      }}
                      className={cn(
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                        isRecordingQuery ? 'cursor-pointer transition-colors hover:bg-brand-50/40' : '',
                        isRecordingQuery && recordingAudioRowId === row.id ? 'bg-brand-50/60' : ''
                      )}
                    >
                      {isRecordingQuery ? (
                        <td className="px-2 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRecordingIds.includes(row.id)}
                            onChange={(event) =>
                              setSelectedRecordingIds((current) =>
                                event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id)
                              )
                            }
                            className="h-4 w-4 cursor-pointer accent-brand-500"
                          />
                        </td>
                      ) : null}
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4 text-brand-600">{row.recordNo}</td>
                      <td className="px-4 py-4">{row.employeeId}</td>
                      <td className="px-4 py-4">{row.department}</td>
                      <td className="px-4 py-4">{row.employeeName}</td>
                      <td className="px-4 py-4">{row.skillGroup}</td>
                      <td className="px-4 py-4">{row.startAt}</td>
                      <td className="px-4 py-4">{row.endAt}</td>
                      <td className="px-4 py-4">{row.duration}</td>
                      <td className="px-4 py-4">{row.callType}</td>
                      <td className="px-4 py-4">{row.caller}</td>
                      <td className="px-4 py-4">{row.callee}</td>
                      <td className="px-4 py-4">{row.endReason}</td>
                      <td className="px-4 py-4">{row.satisfaction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isRecordingQuery && recordingAudioRowId ? (
              <div className="px-5 pb-2">
                <SummaryHotlinePlayer />
              </div>
            ) : null}

            <FooterPagination total={`共 ${isRecordingQuery ? filteredRecordingRows.length : 33} 条记录`} />
          </SectionCard>
          {!isRecordingQuery ? <PlayerBar /> : null}
        </div>
      </div>
    );
  };

  const renderSampleRecordingQueryPage = () => {
    const fieldClass = 'xl:[&>span]:w-[72px]';
    const selectClass = cn(inputClass, 'pr-8 text-[12px]');
    const dateInputClass = cn(inputClass, 'px-2 text-[12px]');

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="分类:" className={cn(fieldClass, 'xl:col-span-2')}>
                  <select
                    value={sampleQueryFilterForm.category}
                    onChange={(event) => setSampleQueryFilterForm((current) => ({ ...current, category: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">咨询类</option>
                    <option value="优质录音">优质录音</option>
                    <option value="优秀录音">优秀录音</option>
                    <option value="劣质录音">劣质录音</option>
                  </select>
                </Field>
                <Field label="录音质量:" className={cn(fieldClass, 'xl:col-span-2')}>
                  <select
                    value={sampleQueryFilterForm.quality}
                    onChange={(event) => setSampleQueryFilterForm((current) => ({ ...current, quality: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">请选择</option>
                    <option value="优质录音">优质录音</option>
                    <option value="优秀录音">优秀录音</option>
                    <option value="劣质录音">劣质录音</option>
                  </select>
                </Field>
                <Field label="提交时间:" className={cn(fieldClass, 'xl:col-span-4')}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      type="datetime-local"
                      value={sampleQueryFilterForm.startAt}
                      onChange={(event) => setSampleQueryFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                      className={dateInputClass}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="datetime-local"
                      value={sampleQueryFilterForm.endAt}
                      onChange={(event) => setSampleQueryFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                      className={dateInputClass}
                    />
                  </div>
                </Field>
                <Field label="部门:" className={cn(fieldClass, 'xl:col-span-2')}>
                  <select
                    value={sampleQueryFilterForm.department}
                    onChange={(event) => setSampleQueryFilterForm((current) => ({ ...current, department: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">请选择部门</option>
                    <option value="教育部">教育部</option>
                  </select>
                </Field>
                <div className="flex items-center justify-end xl:col-span-2">
                  <QueryActions
                    onSearch={() => setSampleQueryFilters({ ...sampleQueryFilterForm })}
                    onReset={() => {
                      setSampleQueryFilterForm({ ...defaultSampleQueryFilters });
                      setSampleQueryFilters({ ...defaultSampleQueryFilters });
                      setSampleQueryAudioRowId(null);
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="技能组:" className={cn(fieldClass, 'xl:col-span-2')}>
                  <select
                    value={sampleQueryFilterForm.skillGroup}
                    onChange={(event) => setSampleQueryFilterForm((current) => ({ ...current, skillGroup: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">请选择技能组</option>
                    <option value="学习机组">学习机组</option>
                    <option value="语音质检组">语音质检组</option>
                  </select>
                </Field>
                <div className="xl:col-span-10" />
              </div>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className="min-w-[1800px] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    {['序号', '记录号', '录音质量', '录音描述', '提交人', '提交时间', '提交原因', '分类', '审核人', '审核意见', '员工名称', '技能组', '部门', '开始时间', '结束时间', '持续时间', '电话类型'].map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {filteredSampleQueryRows.map((row, index) => (
                    <tr
                      key={`sample-query-${row.id}`}
                      onDoubleClick={() => setSampleQueryAudioRowId(row.id)}
                      className={cn(
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                        'cursor-pointer transition-colors hover:bg-brand-50/40',
                        sampleQueryAudioRowId === row.id ? 'bg-brand-50/60' : ''
                      )}
                    >
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4 text-brand-600">{row.recordNo}</td>
                      <td className="px-4 py-4">{row.quality}</td>
                      <td className="px-4 py-4">{row.description}</td>
                      <td className="px-4 py-4">{row.submitter}</td>
                      <td className="px-4 py-4">{row.submittedAt}</td>
                      <td className="px-4 py-4">{row.reason}</td>
                      <td className="px-4 py-4">{(row as { auditCategory?: string }).auditCategory ?? '-'}</td>
                      <td className="px-4 py-4">{(row as { reviewer?: string }).reviewer ?? '-'}</td>
                      <td className="px-4 py-4">{(row as { opinion?: string }).opinion ?? '-'}</td>
                      <td className="px-4 py-4">{row.employeeName}</td>
                      <td className="px-4 py-4">{row.skillGroup}</td>
                      <td className="px-4 py-4">{row.department}</td>
                      <td className="px-4 py-4">{row.startedAt}</td>
                      <td className="px-4 py-4">{row.endedAt}</td>
                      <td className="px-4 py-4">{row.duration}</td>
                      <td className="px-4 py-4">{row.callType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSampleQueryRows.length === 0 ? (
                <div className="flex h-[420px] items-center justify-center text-[14px] text-slate-400">暂无数据</div>
              ) : null}
            </div>

            {sampleQueryAudioRowId && filteredSampleQueryRows.some((row) => row.id === sampleQueryAudioRowId) ? (
              <div className="px-5 pb-2">
                <SummaryHotlinePlayer />
              </div>
            ) : null}

            <FooterPagination total={`共 ${filteredSampleQueryRows.length} 条记录`} />
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderSampleAuditPage = () => {
    const auditFieldClass = 'xl:[&>span]:w-[72px]';
    const auditSelectClass = cn(inputClass, 'pr-8 text-[12px]');
    const auditDateInputClass = cn(inputClass, 'px-2 text-[12px]');

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="mb-4 flex justify-end">
                <QueryActions
                  onSearch={() => setAuditFilters({ ...auditFilterForm })}
                  onReset={() => {
                    setAuditFilterForm({ ...defaultSampleAuditFilters });
                    setAuditFilters({ ...defaultSampleAuditFilters });
                    setAuditAudioRowId(null);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="状态:" className={cn(auditFieldClass, 'xl:col-span-2')}>
                  <select
                    value={auditFilterForm.status}
                    onChange={(event) => setAuditFilterForm((current) => ({ ...current, status: event.target.value }))}
                    className={auditSelectClass}
                  >
                    <option value="">请选择</option>
                    <option value="待审批">待审批</option>
                    <option value="通过">通过</option>
                    <option value="不通过">不通过</option>
                  </select>
                </Field>
                <Field label="录音质量:" className={cn(auditFieldClass, 'xl:col-span-2')}>
                  <select
                    value={auditFilterForm.quality}
                    onChange={(event) => setAuditFilterForm((current) => ({ ...current, quality: event.target.value }))}
                    className={auditSelectClass}
                  >
                    <option value="">请选择</option>
                    <option value="优质录音">优质录音</option>
                    <option value="优秀录音">优秀录音</option>
                    <option value="劣质录音">劣质录音</option>
                  </select>
                </Field>
                <Field label="部门:" className={cn(auditFieldClass, 'xl:col-span-2')}>
                  <select
                    value={auditFilterForm.department}
                    onChange={(event) => setAuditFilterForm((current) => ({ ...current, department: event.target.value }))}
                    className={auditSelectClass}
                  >
                    <option value="">请选择部门</option>
                    <option value="教育部">教育部</option>
                  </select>
                </Field>
                <Field label="技能组:" className={cn(auditFieldClass, 'xl:col-span-2')}>
                  <select
                    value={auditFilterForm.skillGroup}
                    onChange={(event) => setAuditFilterForm((current) => ({ ...current, skillGroup: event.target.value }))}
                    className={auditSelectClass}
                  >
                    <option value="">请选择技能组</option>
                    <option value="学习机组">学习机组</option>
                    <option value="语音质检组">语音质检组</option>
                  </select>
                </Field>
                <Field label="提交时间:" className={cn(auditFieldClass, 'xl:col-span-4')}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      type="datetime-local"
                      value={auditFilterForm.startAt}
                      onChange={(event) => setAuditFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                      className={auditDateInputClass}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="datetime-local"
                      value={auditFilterForm.endAt}
                      onChange={(event) => setAuditFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                      className={auditDateInputClass}
                    />
                  </div>
                </Field>
              </div>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className="min-w-[1680px] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    {['序号', '审批', '录音号', '录音质量', '录音描述', '提交人', '提交时间', '提交原因', '状态', '审核人', '审核意见', '客户姓名', '员工名', '部门', '技能组', '开始时间', '结束时间', '持续时间', '电话类型'].map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {filteredAuditRows.map((row, index) => (
                    <tr
                      key={row.id}
                      onDoubleClick={() => setAuditAudioRowId(row.id)}
                      className={cn(
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                        'cursor-pointer transition-colors hover:bg-brand-50/40',
                        auditAudioRowId === row.id ? 'bg-brand-50/60' : ''
                      )}
                    >
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setAuditTarget(row);
                            setAuditDecision(row.status === '不通过' ? 'reject' : 'agree');
                            setAuditCategory((row as { auditCategory?: string }).auditCategory ?? row.quality);
                            setAuditOpinion((row as { opinion?: string }).opinion ?? '');
                          }}
                          className="text-brand-600"
                        >
                          审批
                        </button>
                      </td>
                      <td className="px-4 py-4 text-brand-600">{row.recordNo}</td>
                      <td className="px-4 py-4">{row.quality}</td>
                      <td className="px-4 py-4">{row.description}</td>
                      <td className="px-4 py-4">{row.submitter}</td>
                      <td className="px-4 py-4">{row.submittedAt}</td>
                      <td className="px-4 py-4">{row.reason}</td>
                      <td className="px-4 py-4">{row.status}</td>
                      <td className="px-4 py-4">{(row as { reviewer?: string }).reviewer ?? '-'}</td>
                      <td className="px-4 py-4">{(row as { opinion?: string }).opinion ?? '-'}</td>
                      <td className="px-4 py-4">{row.customerName}</td>
                      <td className="px-4 py-4">{row.employeeName}</td>
                      <td className="px-4 py-4">{row.department}</td>
                      <td className="px-4 py-4">{row.skillGroup}</td>
                      <td className="px-4 py-4">{row.startedAt}</td>
                      <td className="px-4 py-4">{row.endedAt}</td>
                      <td className="px-4 py-4">{row.duration}</td>
                      <td className="px-4 py-4">{row.callType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {auditAudioRowId && filteredAuditRows.some((row) => row.id === auditAudioRowId) ? (
              <div className="px-5 pb-2">
                <SummaryHotlinePlayer />
              </div>
            ) : null}

            <FooterPagination total={`共 ${filteredAuditRows.length} 条记录`} />
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderSimpleListPage = ({
    tabs,
    activeTab,
    onChange,
    columns,
    rows,
    extraAction,
  }: {
    tabs: Array<{ key: string; label: string }>;
    activeTab: string;
    onChange: (key: string) => void;
    columns: string[];
    rows: Array<Array<React.ReactNode>>;
    extraAction?: React.ReactNode;
  }) => (
    <div className={pageWrapperClass}>
      <div className={pageScrollClass}>
        <SectionCard>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={cn(
                      'border-b-2 pb-2 text-[14px] font-medium',
                      activeTab === tab.key ? 'border-brand-400 text-brand-600' : 'border-transparent text-slate-500'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {extraAction}
                <QueryActions />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
              {['状态', '时间范围', '处理部门', '处理人'].map((label) => (
                <Field key={`${activeTab}-${label}`} label={label}>
                  <input placeholder={`请输入${label}`} className={inputClass} />
                </Field>
              ))}
            </div>
          </div>

          <div className="overflow-auto px-5 py-4 custom-scrollbar">
            <table className="min-w-full table-fixed text-left text-[13px]">
              <thead className="bg-slate-50/90 text-slate-600">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {rows.map((row, index) => (
                  <tr key={`${activeTab}-${index}`} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${activeTab}-${index}-${cellIndex}`} className="px-4 py-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FooterPagination total={`共 ${rows.length} 条记录`} />
        </SectionCard>
      </div>
    </div>
  );

  const renderSmsDeliveryPage = () => {
    const fieldClass = 'xl:[&>span]:w-[72px]';
    const selectClass = cn(inputClass, 'pr-8 text-[12px]');
    const dateInputClass = cn(inputClass, 'px-2 text-[12px]');

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="发信部门:" className={cn(fieldClass, 'xl:col-span-3')}>
                  <select
                    value={smsSentFilterForm.senderDept}
                    onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, senderDept: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">请选择</option>
                    <option value="系统组">系统组</option>
                    <option value="演示组">演示组</option>
                  </select>
                </Field>
                <Field label="发信人:" className={cn(fieldClass, 'xl:col-span-3')}>
                  <input
                    value={smsSentFilterForm.sender}
                    onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, sender: event.target.value }))}
                    placeholder="请输入员工名称/工号搜索"
                    className={inputClass}
                  />
                </Field>
                <Field label="发信时间:" className={cn(fieldClass, 'xl:col-span-4')}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      type="datetime-local"
                      value={smsSentFilterForm.startAt}
                      onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                      className={dateInputClass}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="datetime-local"
                      value={smsSentFilterForm.endAt}
                      onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                      className={dateInputClass}
                    />
                  </div>
                </Field>
                <div className="flex items-center justify-end xl:col-span-2">
                  <QueryActions
                    onSearch={() => setSmsSentFilters({ ...smsSentFilterForm })}
                    onReset={() => {
                      setSmsSentFilterForm({ ...defaultSmsSentFilterForm });
                      setSmsSentFilters({ ...defaultSmsSentFilterForm });
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="短信内容:" className={cn(fieldClass, 'xl:col-span-3')}>
                  <input
                    value={smsSentFilterForm.content}
                    onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, content: event.target.value }))}
                    placeholder="请输入短信内容"
                    className={inputClass}
                  />
                </Field>
                <Field label="收信号码:" className={cn(fieldClass, 'xl:col-span-3')}>
                  <input
                    value={smsSentFilterForm.receiverNo}
                    onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, receiverNo: event.target.value }))}
                    placeholder="请输入收信号码"
                    className={inputClass}
                  />
                </Field>
                <Field label="发送状态:" className={cn(fieldClass, 'xl:col-span-3')}>
                  <select
                    value={smsSentFilterForm.status}
                    onChange={(event) => setSmsSentFilterForm((current) => ({ ...current, status: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">全部</option>
                    {smsSendStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className="min-w-[1320px] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    {['序号', '操作', '短信内容', '发信部门', '发信人', '发信时间', '发送状态', '收信号码'].map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {filteredSmsSentRows.map((row, index) => (
                    <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          className="text-brand-600"
                          onClick={() => setSmsDetailTarget({ receiverNo: row.receiverNo, content: row.content })}
                        >
                          查看
                        </button>
                      </td>
                      <td className="px-4 py-4">{row.content}</td>
                      <td className="px-4 py-4">{row.senderDept}</td>
                      <td className="px-4 py-4">{row.sender}</td>
                      <td className="px-4 py-4">{row.sentAt}</td>
                      <td className="px-4 py-4">{row.status}</td>
                      <td className="px-4 py-4">{row.receiverNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSmsSentRows.length === 0 ? (
                <div className="flex h-[420px] items-center justify-center text-[14px] text-slate-400">暂无数据</div>
              ) : null}
            </div>

            <FooterPagination total={`共 ${filteredSmsSentRows.length} 条记录`} />
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderMailDeliveryPage = () => {
    const isSentTab = mailDeliveryTab === 'mail-sent';
    const fieldClass = 'xl:[&>span]:w-[72px]';
    const selectClass = cn(inputClass, 'pr-8 text-[12px]');
    const dateInputClass = cn(inputClass, 'px-2 text-[12px]');

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="mb-4 flex items-center gap-8">
                {[
                  ['mail-sent', '发件历史'],
                  ['mail-received', '收件处理'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMailDeliveryTab(key as 'mail-sent' | 'mail-received')}
                    className={cn(
                      'border-b-2 pb-2 text-[14px] font-medium',
                      mailDeliveryTab === key ? 'border-brand-400 text-brand-600' : 'border-transparent text-slate-500'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mb-4 flex justify-end">
                <QueryActions
                  onSearch={() =>
                    isSentTab ? setMailSentFilters({ ...mailSentFilterForm }) : setMailReceivedFilters({ ...mailReceivedFilterForm })
                  }
                  onReset={() => {
                    if (isSentTab) {
                      setMailSentFilterForm({ ...defaultMailSentFilterForm });
                      setMailSentFilters({ ...defaultMailSentFilterForm });
                      return;
                    }
                    setMailReceivedFilterForm({ ...defaultMailReceivedFilterForm });
                    setMailReceivedFilters({ ...defaultMailReceivedFilterForm });
                  }}
                />
              </div>

              {isSentTab ? (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <Field label="收件邮箱:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailSentFilterForm.receiverEmail}
                        onChange={(event) => setMailSentFilterForm((current) => ({ ...current, receiverEmail: event.target.value }))}
                        placeholder="请输入收件邮箱"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="发件部门:" className={cn(fieldClass, 'xl:col-span-2')}>
                      <select
                        value={mailSentFilterForm.senderDept}
                        onChange={(event) => setMailSentFilterForm((current) => ({ ...current, senderDept: event.target.value }))}
                        className={selectClass}
                      >
                        <option value="">请选择</option>
                        <option value="系统组">系统组</option>
                      </select>
                    </Field>
                    <Field label="发件人:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailSentFilterForm.sender}
                        onChange={(event) => setMailSentFilterForm((current) => ({ ...current, sender: event.target.value }))}
                        placeholder="请输入员工名称/工号搜索"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="发件时间:" className={cn(fieldClass, 'xl:col-span-4')}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                        <input
                          type="datetime-local"
                          value={mailSentFilterForm.startAt}
                          onChange={(event) => setMailSentFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                          className={dateInputClass}
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="datetime-local"
                          value={mailSentFilterForm.endAt}
                          onChange={(event) => setMailSentFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                          className={dateInputClass}
                        />
                      </div>
                    </Field>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <Field label="邮件内容:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailSentFilterForm.content}
                        onChange={(event) => setMailSentFilterForm((current) => ({ ...current, content: event.target.value }))}
                        placeholder="输入内容可查询邮件内容"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="邮件标题:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailSentFilterForm.subject}
                        onChange={(event) => setMailSentFilterForm((current) => ({ ...current, subject: event.target.value }))}
                        placeholder="请输入邮件标题"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="发送状态:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <select
                        value={mailSentFilterForm.status}
                        onChange={(event) => setMailSentFilterForm((current) => ({ ...current, status: event.target.value }))}
                        className={selectClass}
                      >
                        <option value="">全部</option>
                        {mailSendStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <Field label="发件客户:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailReceivedFilterForm.senderCustomer}
                        onChange={(event) => setMailReceivedFilterForm((current) => ({ ...current, senderCustomer: event.target.value }))}
                        placeholder="请输入发件客户"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="状态:" className={cn(fieldClass, 'xl:col-span-2')}>
                      <select
                        value={mailReceivedFilterForm.status}
                        onChange={(event) => setMailReceivedFilterForm((current) => ({ ...current, status: event.target.value }))}
                        className={selectClass}
                      >
                        <option value="">全部</option>
                        <option value="未处理">未处理</option>
                        <option value="处理中">处理中</option>
                        <option value="已处理">已处理</option>
                      </select>
                    </Field>
                    <Field label="收件时间:" className={cn(fieldClass, 'xl:col-span-4')}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                        <input
                          type="datetime-local"
                          value={mailReceivedFilterForm.startAt}
                          onChange={(event) => setMailReceivedFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                          className={dateInputClass}
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="datetime-local"
                          value={mailReceivedFilterForm.endAt}
                          onChange={(event) => setMailReceivedFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                          className={dateInputClass}
                        />
                      </div>
                    </Field>
                    <Field label="邮件标题:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailReceivedFilterForm.subject}
                        onChange={(event) => setMailReceivedFilterForm((current) => ({ ...current, subject: event.target.value }))}
                        placeholder="请输入邮件标题"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <Field label="邮件内容:" className={cn(fieldClass, 'xl:col-span-3')}>
                      <input
                        value={mailReceivedFilterForm.content}
                        onChange={(event) => setMailReceivedFilterForm((current) => ({ ...current, content: event.target.value }))}
                        placeholder="输入内容可查询邮件内容"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              {isSentTab ? (
                <table className="min-w-[1580px] table-fixed text-left text-[13px]">
                  <thead className="bg-slate-50/90 text-slate-600">
                    <tr>
                      {['序号', '操作', '邮件标题', '发件部门', '发件人', '发件邮箱', '发件时间', '发送状态', '收件邮箱'].map((column) => (
                        <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {filteredMailSentRows.map((row, index) => (
                      <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4">
                          <button type="button" className="text-brand-600" onClick={() => showToast('已查看邮件详情')}>
                            查看
                          </button>
                        </td>
                        <td className="px-4 py-4">{row.subject}</td>
                        <td className="px-4 py-4">{row.senderDept}</td>
                        <td className="px-4 py-4">{row.sender}</td>
                        <td className="px-4 py-4">{row.senderEmail}</td>
                        <td className="px-4 py-4">{row.sentAt}</td>
                        <td className="px-4 py-4">{row.status}</td>
                        <td className="px-4 py-4">{row.receiverEmail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-[1600px] table-fixed text-left text-[13px]">
                  <thead className="bg-slate-50/90 text-slate-600">
                    <tr>
                      {['序号', '操作', '邮件状态', '邮件标题', '发件邮箱', '收件时间', '收件邮箱', '处理人', '处理部门', '处理时间', '客户姓名'].map((column) => (
                        <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {filteredMailReceivedRows.map((row, index) => (
                      <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4">
                          <button type="button" className="text-brand-600" onClick={() => showToast('邮件已认领')}>
                            认领
                          </button>
                        </td>
                        <td className="px-4 py-4">{row.status}</td>
                        <td className="px-4 py-4">{row.subject || '-'}</td>
                        <td className="px-4 py-4">{row.senderEmail}</td>
                        <td className="px-4 py-4">{row.receivedAt}</td>
                        <td className="px-4 py-4">{row.receiverEmail || '-'}</td>
                        <td className="px-4 py-4">{row.handler || '-'}</td>
                        <td className="px-4 py-4">{row.department || '-'}</td>
                        <td className="px-4 py-4">{row.handledAt || '-'}</td>
                        <td className="px-4 py-4">{row.customerName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <FooterPagination total={`共 ${isSentTab ? filteredMailSentRows.length : filteredMailReceivedRows.length} 条记录`} />
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderWebchatHistoryPage = () => {
    const allSelected =
      filteredWebchatHistoryRows.length > 0 &&
      filteredWebchatHistoryRows.every((row) => selectedWebchatHistoryIds.includes(row.id));

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="mb-4 flex justify-end">
                <QueryActions
                  onSearch={() => setWebchatHistoryFilters({ ...webchatHistoryFilterForm })}
                  onReset={() => {
                    setWebchatHistoryFilterForm({ ...defaultWebchatHistoryFilters });
                    setWebchatHistoryFilters({ ...defaultWebchatHistoryFilters });
                    setSelectedWebchatHistoryIds([]);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="访客ID:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatHistoryFilterForm.visitorId}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, visitorId: event.target.value }))}
                    placeholder="请输入访客ID"
                    className={inputClass}
                  />
                </Field>
                <Field label="会话ID:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatHistoryFilterForm.sessionId}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, sessionId: event.target.value }))}
                    placeholder="请输入会话ID"
                    className={inputClass}
                  />
                </Field>
                <Field label="员工工号:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatHistoryFilterForm.employeeId}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, employeeId: event.target.value }))}
                    placeholder="请输入员工工号"
                    className={inputClass}
                  />
                </Field>
                <Field label="员工部门:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatHistoryFilterForm.department}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, department: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择</option>
                    <option value="测试">测试</option>
                    <option value="系统组">系统组</option>
                  </select>
                </Field>
                <Field label="员工姓名:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatHistoryFilterForm.employeeName}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, employeeName: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择</option>
                    <option value="冉鸽">冉鸽</option>
                  </select>
                </Field>
                <Field label="请求时间:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      type="datetime-local"
                      value={webchatHistoryFilterForm.startAt}
                      onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                      className={cn(inputClass, 'px-2 text-[12px]')}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="datetime-local"
                      value={webchatHistoryFilterForm.endAt}
                      onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                      className={cn(inputClass, 'px-2 text-[12px]')}
                    />
                  </div>
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="是否小结:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatHistoryFilterForm.summarized}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, summarized: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择</option>
                    <option value="已小结">已小结</option>
                    <option value="未小结">未小结</option>
                  </select>
                </Field>
                <Field label="渠道:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatHistoryFilterForm.channel}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, channel: event.target.value }))}
                    placeholder="请输入渠道名称"
                    className={inputClass}
                  />
                </Field>
                <Field label="所属队列:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatHistoryFilterForm.queue}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, queue: event.target.value }))}
                    placeholder="请输入所属队列"
                    className={inputClass}
                  />
                </Field>
                <Field label="结束原因:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatHistoryFilterForm.endReason}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, endReason: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择</option>
                    <option value="坐席结束">坐席结束</option>
                    <option value="坐席超时">坐席超时</option>
                    <option value="访客超时">访客超时</option>
                    <option value="排队超时">排队超时</option>
                    <option value="访客结束">访客结束</option>
                    <option value="异常退出">异常退出</option>
                  </select>
                </Field>
                <Field label="聊天内容:" className="xl:col-span-4 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatHistoryFilterForm.content}
                    onChange={(event) => setWebchatHistoryFilterForm((current) => ({ ...current, content: event.target.value }))}
                    placeholder="输入内容可查询聊天记录"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <button type="button" className={solidButtonClass}>
                下载聊天记录
              </button>
              <button type="button" onClick={openWebchatHistorySampleSubmitModal} className={primaryButtonClass}>
                提交范例
              </button>
              <button type="button" className={secondaryButtonClass}>
                导出
              </button>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className="min-w-[1900px] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    <th className="w-10 px-2 py-3 text-center font-medium">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) =>
                          setSelectedWebchatHistoryIds(event.target.checked ? filteredWebchatHistoryRows.map((row) => row.id) : [])
                        }
                        className="h-4 w-4 cursor-pointer accent-brand-500"
                      />
                    </th>
                    {['序号', '访客ID', '会话ID', '员工姓名', '员工工号', '所属队列', '所属工作组', '请求时间', '聊天开始时间', '聊天结束时间', '聊天时长', '结束原因', '渠道', '满意度', '提交范例库状态'].map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {filteredWebchatHistoryRows.map((row, index) => (
                    <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                      <td className="px-2 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedWebchatHistoryIds.includes(row.id)}
                          onChange={(event) =>
                            setSelectedWebchatHistoryIds((current) =>
                              event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id)
                            )
                          }
                          className="h-4 w-4 cursor-pointer accent-brand-500"
                        />
                      </td>
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="hidden px-4 py-4">
                        <button type="button" className="hidden text-brand-600" onClick={() => showToast('已提交范例库')}>
                          提交范例库
                        </button>
                      </td>
                      <td className="px-4 py-4">{row.visitorId}</td>
                      <td className="px-4 py-4">{row.sessionId}</td>
                      <td className="px-4 py-4">{row.employeeName}</td>
                      <td className="px-4 py-4">{row.employeeId}</td>
                      <td className="px-4 py-4">{row.queue}</td>
                      <td className="px-4 py-4">{row.workgroup}</td>
                      <td className="px-4 py-4">{row.requestAt}</td>
                      <td className="px-4 py-4">{row.chatStartedAt}</td>
                      <td className="px-4 py-4">{row.chatEndedAt}</td>
                      <td className="px-4 py-4">{row.duration}</td>
                      <td className="px-4 py-4">{row.endReason}</td>
                      <td className="px-4 py-4">{row.channel}</td>
                      <td className="px-4 py-4">{row.satisfaction || '-'}</td>
                      <td className="px-4 py-4">{row.exampleStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <FooterPagination total={`共 ${filteredWebchatHistoryRows.length} 条记录`} />
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderWebchatMessagePage = () => {
    const detailRow = webchatMessageDetailTarget ? webchatMessageItems.find((row) => row.id === webchatMessageDetailTarget) ?? null : null;
    const allSelected =
      filteredWebchatMessageRows.length > 0 &&
      filteredWebchatMessageRows.every((row) => selectedWebchatMessageIds.includes(row.id));
    const columns = [
      '序号',
      '操作',
      '状态',
      '客户名',
      '渠道',
      '联系方式',
      '留言时间',
      '留言内容',
      '期望回复时间',
      '调剂人',
      '调剂时间',
      '调剂次数',
      '处理部门',
      '处理人',
    ];

    if (detailRow) {
      return (
        <div className={pageWrapperClass}>
          <div className={pageScrollClass}>
            <SectionCard className="min-h-[860px] overflow-hidden">
              <div className="grid min-h-[860px] grid-cols-1 xl:grid-cols-[1fr_1.45fr]">
                <div className="border-b border-slate-100 bg-white xl:border-b-0 xl:border-r">
                  <div className="border-b border-slate-100 px-5 py-4 text-[15px] font-semibold text-slate-800">聊天记录</div>
                  <div className="flex h-[calc(100%-57px)] min-h-[803px] flex-col items-center justify-center gap-4 text-slate-400">
                    <FileText size={60} strokeWidth={1.2} />
                    <div className="text-[14px]">暂无聊天历史</div>
                  </div>
                </div>

                <div className="flex min-h-[860px] flex-col bg-white">
                  <div className="border-b border-slate-100 px-5 py-4 text-[15px] font-semibold text-slate-800">基础信息</div>
                  <div className="flex flex-1 flex-col px-5 py-5">
                    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-100 text-[13px] text-slate-600">
                      <div className="border-b border-r border-slate-100 bg-slate-50 px-4 py-3 font-medium text-slate-500">联系人姓名</div>
                      <div className="border-b border-slate-100 px-4 py-3">{detailRow.contactName || '-'}</div>
                      <div className="border-b border-r border-slate-100 bg-slate-50 px-4 py-3 font-medium text-slate-500">渠道</div>
                      <div className="border-b border-slate-100 px-4 py-3">{detailRow.channel}</div>
                      <div className="border-b border-r border-slate-100 bg-slate-50 px-4 py-3 font-medium text-slate-500">留言时间</div>
                      <div className="border-b border-slate-100 px-4 py-3">{detailRow.messageAt}</div>
                      <div className="border-b border-r border-slate-100 bg-slate-50 px-4 py-3 font-medium text-slate-500">客户名称</div>
                      <div className="border-b border-slate-100 px-4 py-3">{detailRow.customerName}</div>
                      <div className="border-r border-slate-100 bg-slate-50 px-4 py-3 font-medium text-slate-500">期望回复时间</div>
                      <div className="px-4 py-3">{detailRow.expectedReplyAt || '-'}</div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <label className="flex flex-col gap-2 text-[13px] text-slate-600">
                        <span className="font-medium text-slate-700">留言内容</span>
                        <textarea
                          defaultValue={detailRow.content}
                          rows={3}
                          className="min-h-[104px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-6 text-slate-600 outline-none"
                        />
                      </label>
                      <Field label="联系方式:" className="[&>span]:w-[88px]">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <input
                            value={detailRow.contact}
                            readOnly
                            className="h-10 w-full min-w-0 bg-transparent text-[13px] text-slate-600 outline-none"
                          />
                          <button type="button" onClick={() => onOpenMainTab?.('呼叫工作台')} className={solidButtonClass}>
                            拨打
                          </button>
                        </div>
                      </Field>
                    </div>
                    <div className="flex-1" />
                  </div>

                  <div className="flex justify-end border-t border-slate-100 px-5 py-4">
                    <button type="button" onClick={() => setWebchatMessageDetailTarget(null)} className={secondaryButtonClass}>
                      返回
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      );
    }

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="联系方式:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatMessageFilterForm.contact}
                    onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, contact: event.target.value }))}
                    placeholder="请输入联系方式"
                    className={inputClass}
                  />
                </Field>
                <Field label="状态:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatMessageFilterForm.status}
                    onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, status: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择状态</option>
                    <option value="待处理">待处理</option>
                    <option value="处理中">处理中</option>
                  </select>
                </Field>
                <Field label="留言时间:" className="xl:col-span-5 xl:[&>span]:w-[72px]">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      type="datetime-local"
                      value={webchatMessageFilterForm.startAt}
                      onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, startAt: event.target.value }))}
                      className={cn(inputClass, 'px-2 text-[12px]')}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="datetime-local"
                      value={webchatMessageFilterForm.endAt}
                      onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, endAt: event.target.value }))}
                      className={cn(inputClass, 'px-2 text-[12px]')}
                    />
                  </div>
                </Field>
                <div className="xl:col-span-2 xl:flex xl:justify-end">
                  <QueryActions
                    onSearch={() => {
                      setWebchatMessageFilters({ ...webchatMessageFilterForm });
                      setSelectedWebchatMessageIds([]);
                    }}
                    onReset={() => {
                      setWebchatMessageFilterForm({ ...defaultWebchatMessageFilters });
                      setWebchatMessageFilters({ ...defaultWebchatMessageFilters });
                      setSelectedWebchatMessageIds([]);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Field label="渠道:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatMessageFilterForm.channel}
                    onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, channel: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择渠道</option>
                    <option value="Web">Web</option>
                    <option value="微信">微信</option>
                  </select>
                </Field>
                <Field label="处理部门:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                  <select
                    value={webchatMessageFilterForm.department}
                    onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, department: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">请选择处理部门</option>
                    <option value="系统组">系统组</option>
                    <option value="部门A">部门A</option>
                    <option value="部门B">部门B</option>
                    <option value="部门C">部门C</option>
                  </select>
                </Field>
                <Field label="处理人:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                  <input
                    value={webchatMessageFilterForm.processor}
                    onChange={(event) => setWebchatMessageFilterForm((current) => ({ ...current, processor: event.target.value }))}
                    placeholder="请输入处理人"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <button type="button" className={solidButtonClass}>
                <Download size={14} className="mr-1.5" />
                导出
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedWebchatMessageIds[0];
                  if (!targetId) {
                    showToast('请先选择留言');
                    return;
                  }
                  setWebchatTransferDepartment('');
                  setWebchatTransferTarget(targetId);
                }}
                className={secondaryButtonClass}
              >
                调剂
              </button>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className="min-w-[2140px] table-fixed text-left text-[13px]">
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    <th className="w-10 px-2 py-3 text-center font-medium">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) =>
                          setSelectedWebchatMessageIds(event.target.checked ? filteredWebchatMessageRows.map((row) => row.id) : [])
                        }
                        className="h-4 w-4 cursor-pointer accent-brand-500"
                      />
                    </th>
                    {columns.map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {filteredWebchatMessageRows.map((row, index) => (
                    <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                      <td className="px-2 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedWebchatMessageIds.includes(row.id)}
                          onChange={(event) =>
                            setSelectedWebchatMessageIds((current) =>
                              event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id)
                            )
                          }
                          className="h-4 w-4 cursor-pointer accent-brand-500"
                        />
                      </td>
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-3 whitespace-nowrap text-brand-600">
                          <button type="button" onClick={() => setWebchatMessageDetailTarget(row.id)}>
                            {row.primaryActionLabel}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">{row.status}</td>
                      <td className="px-4 py-4">{row.customerName}</td>
                      <td className="px-4 py-4">{row.channel}</td>
                      <td className="px-4 py-4">{row.contact}</td>
                      <td className="px-4 py-4">{row.messageAt}</td>
                      <td className="px-4 py-4">{row.content || '-'}</td>
                      <td className="px-4 py-4">{row.expectedReplyAt || '-'}</td>
                      <td className="px-4 py-4">{row.transferBy}</td>
                      <td className="px-4 py-4">{row.transferAt}</td>
                      <td className="px-4 py-4">
                        {row.transferCount > 0 ? (
                          <button type="button" className="text-brand-500" onClick={() => setWebchatTransferHistoryTarget(row.id)}>
                            {row.transferCount}
                          </button>
                        ) : (
                          row.transferCount
                        )}
                      </td>
                      <td className="px-4 py-4">{row.department}</td>
                      <td className="px-4 py-4">{row.processor || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <FooterPagination total={`共 ${filteredWebchatMessageRows.length} 条记录`} />
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderBlacklistPage = (mode: 'query' | 'approval') => {
    const isApproval = mode === 'approval';
    const filters = isApproval ? blacklistApprovalFilters : blacklistQueryFilters;
    const setFilters = isApproval ? setBlacklistApprovalFilters : setBlacklistQueryFilters;
    const rows = isApproval ? filteredBlacklistApprovalRows : filteredBlacklistQueryRows;

    const resetFilters = () => {
      if (isApproval) {
        setBlacklistApprovalFilters({
          visitorId: '',
          channelName: '',
          seatNo: '',
          userSystem: '',
          auditStatus: '',
          blockedStartAt: '',
          blockedEndAt: '',
        });
        return;
      }
      setBlacklistQueryFilters({
        visitorId: '',
        channelName: '',
        seatNo: '',
        userSystem: '',
        removedStartAt: '',
        removedEndAt: '',
      });
    };

    return (
      <div className={pageWrapperClass}>
        <div className={pageScrollClass}>
          <SectionCard>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <Field label="访客ID:">
                  <input
                    value={filters.visitorId}
                    onChange={(event) => setFilters((current) => ({ ...current, visitorId: event.target.value }))}
                    placeholder="请输入访客ID"
                    className={inputClass}
                  />
                </Field>
                <Field label="渠道名称:">
                  <input
                    value={filters.channelName}
                    onChange={(event) => setFilters((current) => ({ ...current, channelName: event.target.value }))}
                    placeholder="请输入渠道名称"
                    className={inputClass}
                  />
                </Field>
                <Field label="用户体系:">
                  <select
                    value={filters.userSystem}
                    onChange={(event) => setFilters((current) => ({ ...current, userSystem: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="">选择用户体系</option>
                    <option value="体系1">体系1</option>
                    <option value="体系2">体系2</option>
                  </select>
                </Field>
                <Field label="坐席工号:">
                  <input
                    value={filters.seatNo}
                    onChange={(event) => setFilters((current) => ({ ...current, seatNo: event.target.value }))}
                    placeholder="请输入坐席工号"
                    className={inputClass}
                  />
                </Field>
                <div className="flex items-center justify-end">
                  <QueryActions onReset={resetFilters} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
                {isApproval ? (
                  <Field label="审核状态:">
                    <select
                      value={blacklistApprovalFilters.auditStatus}
                      onChange={(event) => setBlacklistApprovalFilters((current) => ({ ...current, auditStatus: event.target.value }))}
                      className={inputClass}
                    >
                      <option value="">选择审核状态</option>
                      <option value="待审核">待审核</option>
                      <option value="通过">通过</option>
                      <option value="不通过">不通过</option>
                    </select>
                  </Field>
                ) : (
                  <Field label="移出时间:">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <input
                        type="datetime-local"
                        value={blacklistQueryFilters.removedStartAt}
                        onChange={(event) => setBlacklistQueryFilters((current) => ({ ...current, removedStartAt: event.target.value }))}
                        className={inputClass}
                      />
                      <span className="text-slate-400">至</span>
                      <input
                        type="datetime-local"
                        value={blacklistQueryFilters.removedEndAt}
                        onChange={(event) => setBlacklistQueryFilters((current) => ({ ...current, removedEndAt: event.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                )}

                {isApproval ? (
                  <Field label="拉黑时间:">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <input
                        type="datetime-local"
                        value={blacklistApprovalFilters.blockedStartAt}
                        onChange={(event) => setBlacklistApprovalFilters((current) => ({ ...current, blockedStartAt: event.target.value }))}
                        className={inputClass}
                      />
                      <span className="text-slate-400">至</span>
                      <input
                        type="datetime-local"
                        value={blacklistApprovalFilters.blockedEndAt}
                        onChange={(event) => setBlacklistApprovalFilters((current) => ({ ...current, blockedEndAt: event.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </Field>
                ) : null}
              </div>
            </div>

            <div className="overflow-auto px-5 py-4 custom-scrollbar">
              <table className="min-w-full table-fixed text-left text-[13px]">
                <thead className="bg-slate-50/90 text-slate-600">
                  <tr>
                    {[
                      '序号',
                      '会话ID',
                      '访客ID',
                      '渠道',
                      '用户体系',
                      '坐席工号',
                      '拉黑人',
                      '拉黑原因',
                      '拉黑时间',
                      ...(isApproval ? ['审核状态', '操作'] : ['移出时间']),
                    ].map((column) => (
                      <th key={`${mode}-${column}`} className="px-4 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {rows.map((row, index) => (
                    <tr key={`${mode}-${row.sessionId}`} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="px-4 py-4">{row.sessionId}</td>
                      <td className="px-4 py-4">{row.visitorId}</td>
                      <td className="px-4 py-4">{row.channel}</td>
                      <td className="px-4 py-4">{row.userSystem}</td>
                      <td className="px-4 py-4">{row.seatNo}</td>
                      <td className="px-4 py-4">{row.blocker}</td>
                      <td className="px-4 py-4">{row.reason}</td>
                      <td className="px-4 py-4">{row.blockedAt}</td>
                      {isApproval ? (
                        <>
                          <td className="px-4 py-4">{row.auditStatus}</td>
                          <td className="px-4 py-4">
                            {row.auditStatus === '待审核' ? (
                              <div className="flex items-center gap-4 text-brand-600">
                                <button type="button" onClick={() => showToast('黑名单申请已通过')}>
                                  通过
                                </button>
                                <button type="button" onClick={() => showToast('黑名单申请已驳回')}>
                                  不通过
                                </button>
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-4">{row.removedAt}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <FooterPagination total="共 800 条记录" />
          </SectionCard>
        </div>
      </div>
    );
  };

  const [mailDeliveryTab, setMailDeliveryTab] = useState<'mail-sent' | 'mail-received'>('mail-sent');
  const [smsSentFilterForm, setSmsSentFilterForm] = useState({ ...defaultSmsSentFilterForm });
  const [smsSentFilters, setSmsSentFilters] = useState({ ...defaultSmsSentFilterForm });
  const [mailSentFilterForm, setMailSentFilterForm] = useState({ ...defaultMailSentFilterForm });
  const [mailSentFilters, setMailSentFilters] = useState({ ...defaultMailSentFilterForm });
  const [mailReceivedFilterForm, setMailReceivedFilterForm] = useState({ ...defaultMailReceivedFilterForm });
  const [mailReceivedFilters, setMailReceivedFilters] = useState({ ...defaultMailReceivedFilterForm });
  const [smsDetailTarget, setSmsDetailTarget] = useState<null | { receiverNo: string; content: string }>(null);
  const [webchatHistoryFilterForm, setWebchatHistoryFilterForm] = useState({ ...defaultWebchatHistoryFilters });
  const [webchatHistoryFilters, setWebchatHistoryFilters] = useState({ ...defaultWebchatHistoryFilters });
  useEffect(() => {
    if (!filterPreset) return;
    if (filterPreset.page === 'summary-management' && page === 'summary-management') {
      setSummaryFilters(prev => ({ ...prev, ...filterPreset.filters }));
    }
    if (filterPreset.page === 'webchat-history-query' && page === 'webchat-history-query') {
      setWebchatHistoryFilterForm(prev => ({ ...prev, ...filterPreset.filters }));
      setWebchatHistoryFilters(prev => ({ ...prev, ...filterPreset.filters }));
    }
    onFilterPresetConsumed?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [webchatMessageFilterForm, setWebchatMessageFilterForm] = useState({ ...defaultWebchatMessageFilters });
  const [webchatMessageFilters, setWebchatMessageFilters] = useState({ ...defaultWebchatMessageFilters });
  const [selectedWebchatHistoryIds, setSelectedWebchatHistoryIds] = useState<string[]>([]);
  const [webchatHistorySampleTargetId, setWebchatHistorySampleTargetId] = useState<string | null>(null);
  const [webchatHistorySampleSubmitForm, setWebchatHistorySampleSubmitForm] = useState({
    description: '',
    owner: '',
    quality: '',
    reason: '',
  });
  const [selectedWebchatMessageIds, setSelectedWebchatMessageIds] = useState<string[]>([]);
  const [webchatMessageDetailTarget, setWebchatMessageDetailTarget] = useState<string | null>(null);
  const appointmentTodoFilterDefaults = { status: '未处理' };
  const [appointmentTab, setAppointmentTab] = useState<'appointment' | 'message' | 'todo'>('appointment');
  const [showAppointmentFilters, setShowAppointmentFilters] = useState(true);
  const [appointmentFilters, setAppointmentFilters] = useState({
    businessLine: '',
    startAt: '2021-12-12T14:55',
    endAt: '2021-12-23T20:54',
    department: '',
    agent: '',
    caller: '',
    callee: '',
  });
  const [appointmentTodoFilterForm, setAppointmentTodoFilterForm] = useState({ ...appointmentTodoFilterDefaults });
  const [appointmentTodoFilters, setAppointmentTodoFilters] = useState({ ...appointmentTodoFilterDefaults });
  const [showAppointmentTodoReminder, setShowAppointmentTodoReminder] = useState(false);
  const [appointmentTransferTarget, setAppointmentTransferTarget] = useState<(typeof appointmentRows)[number] | null>(null);
  const [appointmentTransferDepartment, setAppointmentTransferDepartment] = useState('');
  const [appointmentTransferHistoryTarget, setAppointmentTransferHistoryTarget] = useState<(typeof appointmentRows)[number] | null>(null);
  const [appointmentAudioRowId, setAppointmentAudioRowId] = useState<string | null>(null);
  const [monitorScope, setMonitorScope] = useState<'all' | 'phone' | 'webchat'>('all');
  const [monitorHideOffline, setMonitorHideOffline] = useState(false);
  const [showMonitorDepartmentDialog, setShowMonitorDepartmentDialog] = useState(false);
  const [monitorSelectedDepartments, setMonitorSelectedDepartments] = useState<string[]>([]);
  const [monitorDepartmentDraft, setMonitorDepartmentDraft] = useState<string[]>([]);
  const [monitorDepartmentKeyword, setMonitorDepartmentKeyword] = useState('');
  const monitorDepartmentOptions = ['选择部门1', '系统组'];
  const [queueMonitorScope, setQueueMonitorScope] = useState<'all' | 'phone' | 'webchat'>('all');
  const [queueMonitorAutoRefresh, setQueueMonitorAutoRefresh] = useState(true);
  const [queueMonitorPhoneSkillGroup, setQueueMonitorPhoneSkillGroup] = useState('');
  const [queueMonitorWebchatQueue, setQueueMonitorWebchatQueue] = useState('');
  const [queueMonitorRefreshSeed, setQueueMonitorRefreshSeed] = useState(0);
  const [queueMonitorRefreshedAt, setQueueMonitorRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString('zh-CN', { hour12: false })
  );
  const [monitorDetailTarget, setMonitorDetailTarget] = useState<AgentMonitorCard | null>(null);
  const [supportDialog, setSupportDialog] = useState<{ target: string; type: SupportDialogType; status: AgentMonitorStatus } | null>(null);
  const [supportSessions, setSupportSessions] = useState<SupportSession[]>([]);
  const [webchatSupportSessionsByAgent, setWebchatSupportSessionsByAgent] =
    useState<Record<string, SupportSession[]>>(defaultWebchatSupportSessionsByAgent);
  const [selectedSupportSessionId, setSelectedSupportSessionId] = useState<string | null>(null);
  const [webchatHistoryDetail, setWebchatHistoryDetail] = useState<string | null>(null);
  const [webchatTransferTarget, setWebchatTransferTarget] = useState<string | null>(null);
  const [webchatTransferDepartment, setWebchatTransferDepartment] = useState('');
  const [webchatTransferHistoryTarget, setWebchatTransferHistoryTarget] = useState<string | null>(null);
  const [blacklistQueryFilters, setBlacklistQueryFilters] = useState({
    visitorId: '',
    channelName: '',
    seatNo: '',
    userSystem: '',
    removedStartAt: '',
    removedEndAt: '',
  });
  const [blacklistApprovalFilters, setBlacklistApprovalFilters] = useState({
    visitorId: '',
    channelName: '',
    seatNo: '',
    userSystem: '',
    auditStatus: '',
    blockedStartAt: '',
    blockedEndAt: '',
  });

  const refreshQueueMonitoring = (showMessage = false) => {
    setQueueMonitorRefreshSeed((current) => current + 1);
    setQueueMonitorRefreshedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    if (showMessage) {
      showToast('队列监控已刷新');
    }
  };

  const openSupportDialog = (target: string, type: SupportDialogType, status: AgentMonitorStatus) => {
    setSupportDialog({ target, type, status });
    if (type === 'webchat') {
      const nextSessions = webchatSupportSessionsByAgent[target] ?? [];
      setSupportSessions(nextSessions);
      setSelectedSupportSessionId(nextSessions[0]?.id ?? null);
      return;
    }

    setSupportSessions([]);
    setSelectedSupportSessionId(null);
  };

  const selectedSupportSession =
    supportDialog?.type === 'webchat'
      ? supportSessions.find((session) => session.id === selectedSupportSessionId) ?? supportSessions[0] ?? null
      : null;
  const filteredMonitorDepartmentOptions = monitorDepartmentOptions.filter((department) =>
    department.toLowerCase().includes(monitorDepartmentKeyword.trim().toLowerCase())
  );

  const phoneSupportActions =
    supportDialog?.type === 'phone'
      ? supportDialog.status === '空闲状态'
        ? ['强忙', '强退']
        : supportDialog.status === '忙碌状态'
          ? ['强闲', '强退']
          : supportDialog.status === '通话状态'
            ? ['监听']
            : []
      : [];

  useEffect(() => {
    if (page !== 'queue-monitoring' || !queueMonitorAutoRefresh) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setQueueMonitorRefreshSeed((current) => current + 1);
      setQueueMonitorRefreshedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    }, 30000);

    return () => window.clearInterval(timer);
  }, [page, queueMonitorAutoRefresh]);

  const blacklistRows = [
    { sessionId: '2001', visitorId: '10002', channel: 'APP', channelName: 'APP', userSystem: '体系1', seatNo: '2001', blocker: 'kily', reason: '脏话', blockedAt: '2025-04-29 11:15:14', removedAt: '2025-04-30 11:15:14', auditStatus: '待审核' },
    { sessionId: '2002', visitorId: '10003', channel: 'PC', channelName: 'PC', userSystem: '体系1', seatNo: '2002', blocker: 'mlkj', reason: '脏话', blockedAt: '2025-04-29 11:15:14', removedAt: '2025-04-30 11:15:14', auditStatus: '通过' },
    { sessionId: '2003', visitorId: '10004', channel: '小程序', channelName: '小程序', userSystem: '体系1', seatNo: '2003', blocker: 'sand', reason: '脏话', blockedAt: '2025-04-29 11:15:14', removedAt: '2025-04-30 11:15:14', auditStatus: '不通过' },
  ];

  const filteredBlacklistQueryRows = useMemo(
    () =>
      blacklistRows.filter((row) => {
        const removedAtStamp = new Date(row.removedAt.replace(' ', 'T')).getTime();
        const startStamp = blacklistQueryFilters.removedStartAt ? new Date(blacklistQueryFilters.removedStartAt).getTime() : null;
        const endStamp = blacklistQueryFilters.removedEndAt ? new Date(blacklistQueryFilters.removedEndAt).getTime() : null;

        return (
          (!blacklistQueryFilters.visitorId || row.visitorId.includes(blacklistQueryFilters.visitorId)) &&
          (!blacklistQueryFilters.channelName || row.channelName.includes(blacklistQueryFilters.channelName)) &&
          (!blacklistQueryFilters.seatNo || row.seatNo.includes(blacklistQueryFilters.seatNo)) &&
          (!blacklistQueryFilters.userSystem || row.userSystem === blacklistQueryFilters.userSystem) &&
          (!startStamp || removedAtStamp >= startStamp) &&
          (!endStamp || removedAtStamp <= endStamp)
        );
      }),
    [blacklistQueryFilters]
  );

  const filteredBlacklistApprovalRows = useMemo(
    () =>
      blacklistRows.filter((row) => {
        const blockedAtStamp = new Date(row.blockedAt.replace(' ', 'T')).getTime();
        const startStamp = blacklistApprovalFilters.blockedStartAt ? new Date(blacklistApprovalFilters.blockedStartAt).getTime() : null;
        const endStamp = blacklistApprovalFilters.blockedEndAt ? new Date(blacklistApprovalFilters.blockedEndAt).getTime() : null;

        return (
          (!blacklistApprovalFilters.visitorId || row.visitorId.includes(blacklistApprovalFilters.visitorId)) &&
          (!blacklistApprovalFilters.channelName || row.channelName.includes(blacklistApprovalFilters.channelName)) &&
          (!blacklistApprovalFilters.seatNo || row.seatNo.includes(blacklistApprovalFilters.seatNo)) &&
          (!blacklistApprovalFilters.userSystem || row.userSystem === blacklistApprovalFilters.userSystem) &&
          (!blacklistApprovalFilters.auditStatus || row.auditStatus === blacklistApprovalFilters.auditStatus) &&
          (!startStamp || blockedAtStamp >= startStamp) &&
          (!endStamp || blockedAtStamp <= endStamp)
        );
      }),
    [blacklistApprovalFilters]
  );

  const smsSentHistoryRows = [
    {
      id: '1',
      content: '为确保您的问题得到及时处理，我们已为您开通专属服务。',
      senderDept: '系统组',
      sender: '冉鸽',
      senderEmployeeId: '10001',
      status: '已送达',
      sentAt: '2026-03-23 09:36:00',
      receiverNo: '18513309510',
    },
    {
      id: '2',
      content: '您好，测试',
      senderDept: '演示组',
      sender: 'ranou2',
      senderEmployeeId: '10002',
      status: '发送中',
      sentAt: '2026-03-11 18:29:00',
      receiverNo: '18035359865',
    },
    {
      id: '3',
      content: '您的业务请求已进入排队，请耐心等待。',
      senderDept: '系统组',
      sender: '冉鸽',
      senderEmployeeId: '10001',
      status: '待发送',
      sentAt: '2026-03-25 08:10:00',
      receiverNo: '13900001111',
    },
    {
      id: '4',
      content: '系统正在为您提交短信发送请求。',
      senderDept: '系统组',
      sender: '冉鸽',
      senderEmployeeId: '10001',
      status: '请求中',
      sentAt: '2026-03-25 08:12:00',
      receiverNo: '13900002222',
    },
    {
      id: '5',
      content: '短信网关已受理，等待下发。',
      senderDept: '演示组',
      sender: 'ranou2',
      senderEmployeeId: '10002',
      status: '提交成功',
      sentAt: '2026-03-25 08:15:00',
      receiverNo: '13900003333',
    },
    {
      id: '6',
      content: '由于号码异常，本次短信发送失败。',
      senderDept: '演示组',
      sender: 'ranou2',
      senderEmployeeId: '10002',
      status: '发送失败',
      sentAt: '2026-03-25 08:18:00',
      receiverNo: '13900004444',
    },
  ];

  const filteredSmsSentRows = useMemo(
    () =>
      smsSentHistoryRows.filter((row) => {
        const sentStamp = new Date(row.sentAt.replace(' ', 'T')).getTime();
        const startStamp = smsSentFilters.startAt ? new Date(smsSentFilters.startAt).getTime() : null;
        const endStamp = smsSentFilters.endAt ? new Date(smsSentFilters.endAt).getTime() : null;
        const senderKeyword = smsSentFilters.sender.trim().toLowerCase();

        return (
          (!smsSentFilters.senderDept || row.senderDept === smsSentFilters.senderDept) &&
          (!senderKeyword ||
            row.sender.toLowerCase().includes(senderKeyword) ||
            row.senderEmployeeId.toLowerCase().includes(senderKeyword)) &&
          (!smsSentFilters.status || row.status === smsSentFilters.status) &&
          (!smsSentFilters.content || row.content.includes(smsSentFilters.content)) &&
          (!smsSentFilters.receiverNo || row.receiverNo.includes(smsSentFilters.receiverNo)) &&
          (!startStamp || sentStamp >= startStamp) &&
          (!endStamp || sentStamp <= endStamp)
        );
      }),
    [smsSentFilters]
  );

  const mailSentHistoryRows = [
    {
      id: '1',
      subject: 'ceshiyixia',
      senderDept: '系统组',
      sender: '冉鸽',
      senderEmployeeId: '10001',
      senderEmail: '18513309510@163.com',
      status: '已投递',
      sentAt: '2026-03-09 11:13:00',
      receiverEmail: 'ranou@yuntongxun.com',
      receiverCustomer: '73d49831-7245-4c26-8...',
      content: '测试邮件内容一',
    },
    {
      id: '2',
      subject: '回复：✨Gemini Pro⭐...',
      senderDept: '系统组',
      sender: '冉鸽',
      senderEmployeeId: '10001',
      senderEmail: '18513309510@163.com',
      status: '已发送',
      sentAt: '2026-03-09 10:14:30',
      receiverEmail: 'email@help.2233.ai',
      receiverCustomer: '',
      content: '测试邮件内容二',
    },
    {
      id: '3',
      subject: '服务升级通知',
      senderDept: '演示组',
      sender: 'ranou2',
      senderEmployeeId: '10002',
      senderEmail: 'ranou2@163.com',
      status: '处理中',
      sentAt: '2026-03-10 09:20:00',
      receiverEmail: 'demo@example.com',
      receiverCustomer: '',
      content: '邮件网关正在处理您的发送请求。',
    },
    {
      id: '4',
      subject: '系统告警邮件',
      senderDept: '演示组',
      sender: 'ranou2',
      senderEmployeeId: '10002',
      senderEmail: 'ranou2@163.com',
      status: '投递失败',
      sentAt: '2026-03-10 09:45:00',
      receiverEmail: 'bounce@example.com',
      receiverCustomer: '',
      content: '目标邮箱不可达，本次投递失败。',
    },
  ];

  const mailReceivedRows = [
    { id: '1', status: '未处理', subject: '你在北京市修改了...', senderEmail: '10000@email.wei...', receivedAt: '2025-12-09 16:58:23', receiverEmail: '', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容1', senderCustomer: '测试发件客户A' },
    { id: '2', status: '未处理', subject: '测试接收', senderEmail: 'verskyzhou@elitec...', receivedAt: '2025-12-09 17:01:02', receiverEmail: 'scrm@zhugeio.com', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容2', senderCustomer: '测试发件客户B' },
    { id: '3', status: '未处理', subject: '企业微信邮箱登录...', senderEmail: '10000@email.wei...', receivedAt: '2025-12-09 17:14:32', receiverEmail: '', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容3', senderCustomer: '测试发件客户C' },
    { id: '4', status: '未处理', subject: '测试更新服务后接收', senderEmail: 'verskyzhou@elitec...', receivedAt: '2025-12-10 14:44:33', receiverEmail: 'scrm@zhugeio.com', handler: '', department: '', handledAt: '', customerName: '测试客户', content: '收件内容4', senderCustomer: '测试发件客户D' },
    { id: '5', status: '未处理', subject: '12.19测试', senderEmail: 'verskyzhou@elitec...', receivedAt: '2025-12-19 14:29:32', receiverEmail: 'scrm@zhugeio.com', handler: '', department: '', handledAt: '', customerName: '测试客户', content: '收件内容5', senderCustomer: '测试发件客户E' },
    { id: '6', status: '未处理', subject: '', senderEmail: '2067483029@qq.c...', receivedAt: '2026-01-29 16:53:03', receiverEmail: 'scrm@zhugeio.com', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容6', senderCustomer: '' },
    { id: '7', status: '未处理', subject: '回复：123123', senderEmail: '2067483029@qq.c...', receivedAt: '2026-01-29 16:54:34', receiverEmail: 'scrm@zhugeio.com', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容7', senderCustomer: '' },
    { id: '8', status: '未处理', subject: '你的订阅续期', senderEmail: 'no_reply@email.ap...', receivedAt: '2026-01-31 18:52:42', receiverEmail: '18513309510@163...', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容8', senderCustomer: '' },
    { id: '9', status: '未处理', subject: '告别网络卡顿，锁...', senderEmail: 'kuajing@service.ne...', receivedAt: '2026-01-31 18:52:43', receiverEmail: 'm18513309510@1...', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容9', senderCustomer: '' },
    { id: '10', status: '未处理', subject: '我们将在5天后向...', senderEmail: 'do_not_reply@em...', receivedAt: '2026-01-31 18:52:43', receiverEmail: '18513309510@163...', handler: '', department: '', handledAt: '', customerName: '', content: '收件内容10', senderCustomer: '' },
  ];

  const filteredMailSentRows = useMemo(
    () =>
      mailSentHistoryRows.filter((row) => {
        const sentStamp = new Date(row.sentAt.replace(' ', 'T')).getTime();
        const startStamp = mailSentFilters.startAt ? new Date(mailSentFilters.startAt).getTime() : null;
        const endStamp = mailSentFilters.endAt ? new Date(mailSentFilters.endAt).getTime() : null;
        const senderKeyword = mailSentFilters.sender.trim().toLowerCase();

        return (
          (!mailSentFilters.receiverEmail || row.receiverEmail.includes(mailSentFilters.receiverEmail)) &&
          (!mailSentFilters.senderDept || row.senderDept === mailSentFilters.senderDept) &&
          (!senderKeyword ||
            row.sender.toLowerCase().includes(senderKeyword) ||
            row.senderEmployeeId.toLowerCase().includes(senderKeyword)) &&
          (!mailSentFilters.status || row.status === mailSentFilters.status) &&
          (!mailSentFilters.subject || row.subject.includes(mailSentFilters.subject)) &&
          (!mailSentFilters.content || row.content.includes(mailSentFilters.content)) &&
          (!startStamp || sentStamp >= startStamp) &&
          (!endStamp || sentStamp <= endStamp)
        );
      }),
    [mailSentFilters]
  );

  const filteredMailReceivedRows = useMemo(
    () =>
      mailReceivedRows.filter((row) => {
        const receivedStamp = new Date(row.receivedAt.replace(' ', 'T')).getTime();
        const startStamp = mailReceivedFilters.startAt ? new Date(mailReceivedFilters.startAt).getTime() : null;
        const endStamp = mailReceivedFilters.endAt ? new Date(mailReceivedFilters.endAt).getTime() : null;

        return (
          (!mailReceivedFilters.senderCustomer || row.senderCustomer.includes(mailReceivedFilters.senderCustomer)) &&
          (!mailReceivedFilters.status || row.status === mailReceivedFilters.status) &&
          (!mailReceivedFilters.subject || row.subject.includes(mailReceivedFilters.subject)) &&
          (!mailReceivedFilters.content || row.content.includes(mailReceivedFilters.content)) &&
          (!startStamp || receivedStamp >= startStamp) &&
          (!endStamp || receivedStamp <= endStamp)
        );
      }),
    [mailReceivedFilters]
  );

  const appointmentRows = [
    { id: '1', businessLine: '教育', caller: '-', callee: '-', startAt: '2025-04-29 11:15:14', endAt: '2025-04-29 11:15:14', status: '处理中', department: '教育部', agent: '坐席A', skillGroup: '教育组', transferAgent: '-', transferAt: '-', transferCount: 0, canTransfer: true },
    { id: '2', businessLine: '教育', caller: '18017682333', callee: '-', startAt: '2025-04-29 11:15:14', endAt: '2025-04-29 11:15:14', status: '已调剂', department: '教育部', agent: '坐席A', skillGroup: '教育组', transferAgent: '坐席B', transferAt: '2025-04-29 11:15:14', transferCount: 1, canTransfer: false },
    { id: '3', businessLine: '法院', caller: '-', callee: '-', startAt: '2025-04-29 11:15:14', endAt: '2025-04-29 11:15:14', status: '处理中', department: '教育部', agent: '坐席A', skillGroup: '教育组', transferAgent: '-', transferAt: '-', transferCount: 0, canTransfer: true },
  ];

  /*
  const appointmentTodoRows = [
    { id: '1', customerName: '张三', callbackNo: '18017682113', callbackAt: '2025-04-29 11:15:14', reason: '客户咨询', status: '未处理' },
    { id: '2', customerName: '小王', callbackNo: '18017682333', callbackAt: '2025-04-29 11:15:14', reason: '-', status: '未处理' },
    { id: '3', customerName: '小李', callbackNo: '18017623333', callbackAt: '2025-04-29 11:15:14', reason: '-', status: '已处理' },
    { id: '4', customerName: '灏忓紶', callbackNo: '18017685555', callbackAt: '2025-04-29 13:20:10', reason: '鍥炶澶勭悊', status: '宸插鐞? },
    { id: '5', customerName: '鐜嬪コ澹?', callbackNo: '18017686666', callbackAt: '2025-04-29 15:08:26', reason: '鎶曡瘔鍥炲', status: '宸插鐞? },
    { id: '6', customerName: '璧靛厛鐢?', callbackNo: '18017687777', callbackAt: '2025-04-29 16:32:48', reason: '涓氬姟鍜ㄨ', status: '宸插鐞? },
  ];

  */

  const appointmentTodoRows = [
    { id: '1', customerName: '张三', callbackNo: '18017682113', callbackAt: '2025-04-29 11:15:14', reason: '客户咨询', status: '未处理' },
    { id: '2', customerName: '小王', callbackNo: '18017682333', callbackAt: '2025-04-29 11:15:14', reason: '-', status: '未处理' },
    { id: '3', customerName: '小李', callbackNo: '18017623333', callbackAt: '2025-04-29 11:15:14', reason: '-', status: '已处理' },
    { id: '4', customerName: '小张', callbackNo: '18017685555', callbackAt: '2025-04-29 13:20:10', reason: '回访处理', status: '已处理' },
    { id: '5', customerName: '王女士', callbackNo: '18017686666', callbackAt: '2025-04-29 15:08:26', reason: '投诉回复', status: '已处理' },
    { id: '6', customerName: '赵先生', callbackNo: '18017687777', callbackAt: '2025-04-29 16:32:48', reason: '业务咨询', status: '已处理' },
  ];

  const appointmentTransferHistoryRows = [
    { id: '1', operator: '坐席A', transferredAt: '2025-04-29 11:15:14', department: '部门A' },
    { id: '2', operator: '坐席A', transferredAt: '2025-04-29 11:15:14', department: '部门B' },
    { id: '3', operator: '坐席A', transferredAt: '2025-04-29 11:15:14', department: '部门C' },
  ];

  const webchatMessageRows = [
    [<div key="ops-3" className="flex gap-3 text-brand-600"><button type="button" onClick={() => showToast('留言已认领')}>认领</button><button type="button" onClick={() => setWebchatTransferTarget('1')}>调剂</button></div>, '处理中', '访客34446', 'Web', '18022343432', '2026-02-26 14:20:35', 'ceshi 测试', '2026-02-26 15:20:35', '-', '-', 0, '系统组', '刘梦玲2'],
    [<div key="ops-4" className="flex gap-3 text-brand-600"><button type="button" onClick={() => showToast('留言已处理')}>处理</button><button type="button" onClick={() => setWebchatTransferTarget('2')}>调剂</button></div>, '处理中', '访客34446', '微信', '18022343432', '2026-02-26 14:19:24', '测试测试测试...', '2026-02-26 15:19:24', '坐席B', '2025-04-29 11:15:14', <button key="count2" type="button" className="text-brand-500" onClick={() => showToast('已打开调剂历史')}>1</button>, '系统组', 'Kukua'],
  ];

  const webchatMessageItems = [
    {
      id: '1',
      status: '处理中',
      customerName: '访客34446',
      contactName: 'lml',
      channel: 'Web',
      contact: '18022343432',
      messageAt: '2026-02-26 14:20:35',
      content: 'ceshi 测试',
      expectedReplyAt: '2026-02-26 15:20:35',
      transferBy: '-',
      transferAt: '-',
      transferCount: 0,
      department: '系统组',
      processor: '刘梦玲2',
      primaryActionLabel: '处理',
      replyMethod: '邮件',
      repliedAt: '2026-02-26 14:35:20',
    },
    {
      id: '2',
      status: '处理中',
      customerName: '访客34446',
      contactName: 'Amy',
      channel: '微信',
      contact: '18022343432',
      messageAt: '2026-02-26 14:19:24',
      content: '测试测试测试...',
      expectedReplyAt: '2026-02-26 15:19:24',
      transferBy: '坐席B',
      transferAt: '2025-04-29 11:15:14',
      transferCount: 1,
      department: '系统组',
      processor: 'Kukua',
      primaryActionLabel: '处理',
      replyMethod: '邮件',
      repliedAt: '2026-02-26 14:28:10',
    },
    {
      id: '3',
      status: '处理中',
      customerName: '访客34446',
      contactName: '陈鸣',
      channel: 'Web',
      contact: '18022343432',
      messageAt: '2026-02-26 14:17:38',
      content: '123213232...',
      expectedReplyAt: '2026-02-26 15:17:38',
      transferBy: '-',
      transferAt: '-',
      transferCount: 0,
      department: '系统组',
      processor: '冉鸥',
      primaryActionLabel: '处理',
      replyMethod: '短信',
      repliedAt: '2026-02-26 14:22:03',
    },
    {
      id: '4',
      status: '待处理',
      customerName: '访客34446',
      contactName: 'lml',
      channel: '微信',
      contact: '15871586242',
      messageAt: '2026-02-26 11:36:58',
      content: '测试留言问题...',
      expectedReplyAt: '',
      transferBy: '-',
      transferAt: '-',
      transferCount: 0,
      department: '系统组',
      processor: '',
      primaryActionLabel: '认领',
      replyMethod: '',
      repliedAt: '',
    },
    {
      id: '5',
      status: '待处理',
      customerName: '访客34446',
      contactName: '张三',
      channel: 'Web',
      contact: '15871586242',
      messageAt: '2026-02-26 11:35:34',
      content: '',
      expectedReplyAt: '',
      transferBy: '-',
      transferAt: '-',
      transferCount: 0,
      department: '系统组',
      processor: '',
      primaryActionLabel: '认领',
      replyMethod: '',
      repliedAt: '',
    },
    {
      id: '6',
      status: '待处理',
      customerName: '刘梦玲客户1',
      contactName: '王五',
      channel: 'Web',
      contact: '15871586242',
      messageAt: '2026-02-26 10:24:52',
      content: '',
      expectedReplyAt: '',
      transferBy: '-',
      transferAt: '-',
      transferCount: 0,
      department: '系统组',
      processor: '',
      primaryActionLabel: '认领',
      replyMethod: '',
      repliedAt: '',
    },
  ];

  const [webchatHistoryRows, setWebchatHistoryRows] = useState([
    { id: '1', exampleStatus: '未提交范例', visitorId: '9399', sessionId: '9399', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-31 13:03:12', chatStartedAt: '2026-03-31 13:03:12', chatEndedAt: '2026-03-31 13:58:56', duration: '00:55:43', endReason: '坐席结束', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录1' },
    { id: '2', exampleStatus: '未提交范例', visitorId: '9373', sessionId: '9373', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 15:16:18', chatStartedAt: '2026-03-28 15:16:18', chatEndedAt: '2026-03-28 15:51:25', duration: '00:35:07', endReason: '坐席超时', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录2' },
    { id: '3', exampleStatus: '未提交范例', visitorId: '9372', sessionId: '9372', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 15:04:32', chatStartedAt: '2026-03-28 15:04:32', chatEndedAt: '2026-03-28 15:51:25', duration: '00:46:53', endReason: '访客超时', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录3' },
    { id: '4', exampleStatus: '未提交范例', visitorId: '9371', sessionId: '9371', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 14:45:30', chatStartedAt: '2026-03-28 14:45:30', chatEndedAt: '2026-03-28 15:03:45', duration: '00:18:14', endReason: '排队超时', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录4' },
    { id: '5', exampleStatus: '未提交范例', visitorId: '9370', sessionId: '9370', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 14:44:42', chatStartedAt: '2026-03-28 14:44:42', chatEndedAt: '2026-03-28 15:03:49', duration: '00:19:07', endReason: '访客结束', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录5' },
    { id: '6', exampleStatus: '未提交范例', visitorId: '9369', sessionId: '9369', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 14:36:20', chatStartedAt: '2026-03-28 14:36:20', chatEndedAt: '2026-03-28 14:39:25', duration: '00:03:05', endReason: '异常退出', channel: 'web', satisfaction: '好', summarized: '未小结', content: '测试聊天记录6' },
    { id: '7', exampleStatus: '未提交范例', visitorId: '9368', sessionId: '9368', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 14:12:55', chatStartedAt: '2026-03-28 14:12:55', chatEndedAt: '2026-03-28 14:32:10', duration: '00:19:15', endReason: '访客超时', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录7' },
    { id: '8', exampleStatus: '未提交范例', visitorId: '9367', sessionId: '9367', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 14:09:58', chatStartedAt: '2026-03-28 14:09:58', chatEndedAt: '2026-03-28 14:32:10', duration: '00:22:12', endReason: '坐席结束', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录8' },
    { id: '9', exampleStatus: '未提交范例', visitorId: '9366', sessionId: '9366', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 13:06:05', chatStartedAt: '2026-03-28 13:06:05', chatEndedAt: '2026-03-28 14:06:55', duration: '01:00:50', endReason: '坐席结束', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录9' },
    { id: '10', exampleStatus: '未提交范例', visitorId: '9365', sessionId: '9365', employeeName: '冉鸽', employeeId: '1001', department: '测试', queue: '默认队列 [2025.11.1...', workgroup: '测试', requestAt: '2026-03-28 12:56:19', chatStartedAt: '2026-03-28 12:56:19', chatEndedAt: '2026-03-28 13:05:37', duration: '00:09:17', endReason: '访客超时', channel: 'web', satisfaction: '', summarized: '未小结', content: '测试聊天记录10' },
  ]);

  const filteredWebchatHistoryRows = useMemo(
    () =>
      webchatHistoryRows.filter((row) => {
        const requestStamp = new Date(row.requestAt.replace(' ', 'T')).getTime();
        const startStamp = webchatHistoryFilters.startAt ? new Date(webchatHistoryFilters.startAt).getTime() : null;
        const endStamp = webchatHistoryFilters.endAt ? new Date(webchatHistoryFilters.endAt).getTime() : null;

        return (
          (!webchatHistoryFilters.visitorId || row.visitorId.includes(webchatHistoryFilters.visitorId)) &&
          (!webchatHistoryFilters.sessionId || row.sessionId.includes(webchatHistoryFilters.sessionId)) &&
          (!webchatHistoryFilters.employeeId || row.employeeId.includes(webchatHistoryFilters.employeeId)) &&
          (!webchatHistoryFilters.department || row.department === webchatHistoryFilters.department) &&
          (!webchatHistoryFilters.employeeName || row.employeeName === webchatHistoryFilters.employeeName) &&
          (!webchatHistoryFilters.summarized || row.summarized === webchatHistoryFilters.summarized) &&
          (!webchatHistoryFilters.channel || row.channel.includes(webchatHistoryFilters.channel)) &&
          (!webchatHistoryFilters.queue || row.queue.includes(webchatHistoryFilters.queue)) &&
          (!webchatHistoryFilters.endReason || row.endReason === webchatHistoryFilters.endReason) &&
          (!webchatHistoryFilters.content || row.content.includes(webchatHistoryFilters.content)) &&
          (!startStamp || requestStamp >= startStamp) &&
          (!endStamp || requestStamp <= endStamp)
        );
      }),
    [webchatHistoryFilters]
  );

  const filteredWebchatMessageRows = useMemo(
    () =>
      webchatMessageItems.filter((row) => {
        const messageStamp = new Date(row.messageAt.replace(' ', 'T')).getTime();
        const startStamp = webchatMessageFilters.startAt ? new Date(webchatMessageFilters.startAt).getTime() : null;
        const endStamp = webchatMessageFilters.endAt ? new Date(webchatMessageFilters.endAt).getTime() : null;

        return (
          (!webchatMessageFilters.status || row.status === webchatMessageFilters.status) &&
          (!webchatMessageFilters.channel || row.channel === webchatMessageFilters.channel) &&
          (!webchatMessageFilters.department || row.department === webchatMessageFilters.department) &&
          (!webchatMessageFilters.processor || row.processor.includes(webchatMessageFilters.processor)) &&
          (!webchatMessageFilters.customerName || row.customerName.includes(webchatMessageFilters.customerName)) &&
          (!webchatMessageFilters.contact || row.contact.includes(webchatMessageFilters.contact)) &&
          (!webchatMessageFilters.content || row.content.includes(webchatMessageFilters.content)) &&
          (!startStamp || messageStamp >= startStamp) &&
          (!endStamp || messageStamp <= endStamp)
        );
      }),
    [webchatMessageFilters]
  );

  const filteredAppointmentTodoRows = appointmentTodoRows.filter(
    (row) => !appointmentTodoFilters.status || row.status === appointmentTodoFilters.status
  );
  const queueMonitorPhoneRows = useMemo(
    () =>
      queueMonitorPhoneBaseRows
        .filter((row) => !queueMonitorPhoneSkillGroup || row.skillGroup === queueMonitorPhoneSkillGroup)
        .map((row, index) => {
          const tick = queueMonitorRefreshSeed + index;
          return {
            ...row,
            requestWaitingCount: Math.max(0, row.requestWaitingCount + (tick % 3 === 0 ? 1 : 0) - (tick % 5 === 0 ? 1 : 0)),
            loginSeatCount: row.loginSeatCount,
            idleSeatCount: Math.max(0, row.idleSeatCount + (tick % 4 === 0 ? 1 : 0) - (tick % 6 === 0 ? 1 : 0)),
            busySeatCount: Math.max(0, row.busySeatCount + (tick % 2 === 0 ? 1 : 0) - (tick % 7 === 0 ? 1 : 0)),
            afterCallCount: Math.max(0, row.afterCallCount + (tick % 5 === 0 ? 1 : 0)),
            restCount: row.restCount,
            callCount: row.callCount + (tick % 4),
            maxWaitTime: formatQueueMonitorDuration(row.maxWaitSeconds + (tick % 5) * 7),
          };
        }),
    [queueMonitorPhoneSkillGroup, queueMonitorRefreshSeed]
  );
  const queueMonitorWebchatRows = useMemo(
    () =>
      queueMonitorWebchatBaseRows
        .filter((row) => !queueMonitorWebchatQueue || row.queue === queueMonitorWebchatQueue)
        .map((row, index) => {
          const tick = queueMonitorRefreshSeed + index;
          return {
            ...row,
            onlineSeatCount: Math.max(0, row.onlineSeatCount + (tick % 4 === 0 ? 1 : 0) - (tick % 6 === 0 ? 1 : 0)),
            robotSessionCount: Math.max(0, row.robotSessionCount + (tick % 5 === 0 ? 1 : 0)),
            requestWaitingCount: Math.max(0, row.requestWaitingCount + (tick % 3 === 0 ? 1 : 0) - (tick % 7 === 0 ? 1 : 0)),
            chatSessionCount: Math.max(0, row.chatSessionCount + (tick % 2 === 0 ? 1 : 0) - (tick % 8 === 0 ? 1 : 0)),
            maxWaitTime: formatQueueMonitorDuration(row.maxWaitSeconds + (tick % 4) * 6),
            avgWaitTime: formatQueueMonitorDuration(row.avgWaitSeconds + (tick % 3) * 4),
            maxChatTime: formatQueueMonitorDuration(row.maxChatSeconds + (tick % 5) * 18),
            instantReplyCount: Math.max(0, row.instantReplyCount + (tick % 6 === 0 ? 1 : 0)),
            phoneOnlineCount: Math.max(0, row.phoneOnlineCount + (tick % 5 === 0 ? 1 : 0)),
            busyStatusCount: Math.max(0, row.busyStatusCount + (tick % 4 === 0 ? 1 : 0)),
            awayStatusCount: row.awayStatusCount,
            lunchStatusCount: row.lunchStatusCount,
            hiddenStatusCount: row.hiddenStatusCount,
          };
        }),
    [queueMonitorRefreshSeed, queueMonitorWebchatQueue]
  );
  const queueMonitorPhoneSkillGroupOptions = [...new Set(queueMonitorPhoneBaseRows.map((row) => row.skillGroup))];
  const queueMonitorWebchatQueueOptions = [...new Set(queueMonitorWebchatBaseRows.map((row) => row.queue))];
  const appointmentTodoReminderRow =
    filteredAppointmentTodoRows.find((row) => row.status === '未处理') ?? filteredAppointmentTodoRows[0] ?? null;

  const openAppointmentListTab = (tab: 'appointment' | 'message') => {
    setAppointmentTab(tab);
    setAppointmentAudioRowId(null);
    setShowAppointmentTodoReminder(false);
  };

  const openAppointmentTodoTab = () => {
    setAppointmentTab('todo');
    setAppointmentAudioRowId(null);
    setAppointmentTodoFilterForm({ ...appointmentTodoFilterDefaults });
    setAppointmentTodoFilters({ ...appointmentTodoFilterDefaults });
    setShowAppointmentTodoReminder(true);
  };

  const openCallWorkbench = () => {
    setShowAppointmentTodoReminder(false);
    onOpenMainTab?.('呼叫工作台');
  };

  const content = (() => {
    if (page === 'user-system-management') return renderUserSystemPage();
    if (page === 'summary-management') return renderSummaryPage();
    if (page === 'recording-query') return renderRecordingBase(page);
    if (page === 'sample-recording-query') return renderSampleRecordingQueryPage();
    if (page === 'sample-recording-audit') return renderSampleAuditPage();
    if (page === 'sms-delivery-query') return renderSmsDeliveryPage();
    if (page === 'mail-delivery-query') return renderMailDeliveryPage();
    if (page === 'appointment-message-management') {
      return (
        <div className={cn(pageWrapperClass, 'relative')}>
          {appointmentTab === 'todo' && showAppointmentTodoReminder && appointmentTodoReminderRow ? (
            <div className="pointer-events-none absolute right-6 top-6 z-20">
              <div className="appointment-todo-reminder-popin pointer-events-auto w-[min(380px,calc(100vw-32px))] rounded-xl border border-brand-200 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(58,92,255,0.12)]">
                <button
                  type="button"
                  onClick={() => setShowAppointmentTodoReminder(false)}
                  className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-brand-600"
                  aria-label="关闭提醒"
                >
                  <X size={20} strokeWidth={2} />
                </button>
                <div className="pr-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-[22px] font-semibold leading-none text-brand-600">
                      i
                    </div>
                    <span className="text-[16px] font-semibold text-slate-900">待办提醒</span>
                  </div>
                  <div className="mt-4 text-[14px] leading-7 text-slate-700">
                    客户{appointmentTodoReminderRow.customerName}已到回电时间，请及时回电！
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={openCallWorkbench}
                      className={solidButtonClass}
                    >
                      回电
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className={pageScrollClass}>
            <SectionCard>
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {[['appointment', '预约回电'], ['message', '留言']].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => openAppointmentListTab(key as 'appointment' | 'message')}
                        className={cn('border-b-2 pb-2 text-[14px] font-medium', appointmentTab === key ? 'border-brand-400 text-brand-600' : 'border-transparent text-slate-500')}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={openAppointmentTodoTab}
                      className={cn('border-b-2 pb-2 text-[14px] font-medium', appointmentTab === 'todo' ? 'border-brand-400 text-brand-600' : 'border-transparent text-slate-500')}
                    >
                      待办
                    </button>
                  </div>
                  <button type="button" onClick={() => setShowAppointmentFilters((value) => !value)} className="flex items-center gap-1 text-[13px] font-medium text-brand-600">
                    {showAppointmentFilters ? '收起' : '展开'}
                    {showAppointmentFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {appointmentTab === 'todo' ? (
                  showAppointmentFilters ? (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                      <Field label="状态:" className="xl:col-span-3 xl:[&>span]:w-[72px]">
                        <select
                          value={appointmentTodoFilterForm.status}
                          onChange={(event) => {
                            const nextFilters = { status: event.target.value };
                            setAppointmentTodoFilterForm(nextFilters);
                            setAppointmentTodoFilters(nextFilters);
                          }}
                          className={inputClass}
                        >
                          <option value="">全部</option>
                          <option value="未处理">未处理</option>
                          <option value="已处理">已处理</option>
                        </select>
                      </Field>
                      <div className="flex items-center justify-end xl:col-span-9">
                        <QueryActions
                          onSearch={() => setAppointmentTodoFilters({ ...appointmentTodoFilterForm })}
                          onReset={() => {
                            setAppointmentTodoFilterForm({ ...appointmentTodoFilterDefaults });
                            setAppointmentTodoFilters({ ...appointmentTodoFilterDefaults });
                          }}
                        />
                      </div>
                    </div>
                  ) : null
                ) : (
                  <>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <Field label="业务线:" className="xl:col-span-2">
                    <select
                      value={appointmentFilters.businessLine}
                      onChange={(event) => setAppointmentFilters((current) => ({ ...current, businessLine: event.target.value }))}
                      className={inputClass}
                    >
                      <option value="">请选择业务线</option>
                      <option value="教育">教育</option>
                      <option value="法院">法院</option>
                    </select>
                  </Field>
                  <Field label="时间范围:" className="xl:col-span-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                      <input
                        type="datetime-local"
                        value={appointmentFilters.startAt}
                        onChange={(event) => setAppointmentFilters((current) => ({ ...current, startAt: event.target.value }))}
                        className={cn(inputClass, 'px-2 text-[12px]')}
                      />
                      <span className="text-slate-400">至</span>
                      <input
                        type="datetime-local"
                        value={appointmentFilters.endAt}
                        onChange={(event) => setAppointmentFilters((current) => ({ ...current, endAt: event.target.value }))}
                        className={cn(inputClass, 'px-2 text-[12px]')}
                      />
                    </div>
                  </Field>
                  <Field label="处理部门:" className="xl:col-span-2 xl:[&>span]:w-[72px]">
                    <select
                      value={appointmentFilters.department}
                      onChange={(event) => setAppointmentFilters((current) => ({ ...current, department: event.target.value }))}
                      className={cn(inputClass, 'px-2 pr-6 text-[11px]')}
                    >
                      <option value="">请选择处理部门</option>
                      <option value="教育部">教育部</option>
                    </select>
                  </Field>
                  <Field label="处理人:" className="xl:col-span-2">
                    <select
                      value={appointmentFilters.agent}
                      onChange={(event) => setAppointmentFilters((current) => ({ ...current, agent: event.target.value }))}
                      className={inputClass}
                    >
                      <option value="">请选择处理人</option>
                      <option value="坐席A">坐席A</option>
                      <option value="坐席B">坐席B</option>
                    </select>
                  </Field>
                  <div className="flex items-center justify-end xl:col-span-2">
                    <QueryActions
                      onReset={() =>
                        setAppointmentFilters({
                          businessLine: '',
                          startAt: '2021-12-12T14:55',
                          endAt: '2021-12-23T20:54',
                          department: '',
                          agent: '',
                          caller: '',
                          callee: '',
                        })
                      }
                    />
                  </div>
                </div>
                {showAppointmentFilters ? (
                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <Field label="主叫号码:" className="xl:col-span-2">
                      <input
                        value={appointmentFilters.caller}
                        onChange={(event) => setAppointmentFilters((current) => ({ ...current, caller: event.target.value }))}
                        placeholder="请输入主叫号码"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="被叫号码:" className="xl:col-span-2">
                      <input
                        value={appointmentFilters.callee}
                        onChange={(event) => setAppointmentFilters((current) => ({ ...current, callee: event.target.value }))}
                        placeholder="请输入被叫号码"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : null}
                  </>
                )}
              </div>
              <div className="overflow-auto px-5 py-4 custom-scrollbar">
                {appointmentTab === 'todo' ? (
                  <table className="min-w-[980px] table-fixed text-left text-[13px]">
                    <thead className="bg-slate-50/90 text-slate-600">
                      <tr>
                        {['序号', '客户姓名', '回电号码', '回电时间', '事由', '状态', '操作'].map((column) => (
                          <th key={column} className="px-4 py-3 font-medium">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      {filteredAppointmentTodoRows.map((row, index) => (
                        <tr key={`appointment-todo-${row.id}`} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40', 'transition-colors hover:bg-brand-50/40')}>
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="px-4 py-4">{row.customerName}</td>
                          <td className="px-4 py-4">{row.callbackNo}</td>
                          <td className="px-4 py-4">{row.callbackAt}</td>
                          <td className="px-4 py-4">{row.reason}</td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-none',
                                row.status === '未处理' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                              )}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button type="button" onClick={openCallWorkbench} className="text-brand-600">
                              回电
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="min-w-[1500px] table-fixed text-left text-[13px]">
                  <thead className="bg-slate-50/90 text-slate-600">
                    <tr>
                      {['序号', '业务线', '主叫号码', '被叫号码', '开始通话时间', '结束通话时间', '处理部门', '处理人', '技能组', '调剂人', '调剂时间', '调剂次数', '操作'].map((column) => (
                        <th key={column} className="px-4 py-3 font-medium">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {appointmentRows.map((row, index) => (
                      <tr
                        key={`appointment-${index}`}
                        onDoubleClick={() => setAppointmentAudioRowId(row.id)}
                        className={cn(
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                          'cursor-pointer transition-colors hover:bg-brand-50/40',
                          appointmentAudioRowId === row.id ? 'bg-brand-50/60' : ''
                        )}
                      >
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4">{row.businessLine}</td>
                        <td className="px-4 py-4">{row.caller}</td>
                        <td className="px-4 py-4">{row.callee}</td>
                        <td className="px-4 py-4">{row.startAt}</td>
                        <td className="px-4 py-4">{row.endAt}</td>
                        <td className="px-4 py-4">{row.department}</td>
                        <td className="px-4 py-4">{row.agent}</td>
                        <td className="px-4 py-4">{row.skillGroup}</td>
                        <td className="px-4 py-4">{row.transferAgent}</td>
                        <td className="px-4 py-4">{row.transferAt}</td>
                        <td className="px-4 py-4 text-brand-500">
                          {row.transferCount > 0 ? (
                            <button type="button" onClick={() => setAppointmentTransferHistoryTarget(row)}>
                              {row.transferCount}
                            </button>
                          ) : (
                            row.transferCount
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-3 whitespace-nowrap text-brand-600">
                            <button type="button" onClick={() => openAppointmentTransfer(row)}>
                              调剂
                            </button>
                            <button type="button" onClick={openCallWorkbench}>
                              回电
                            </button>
                            <button type="button" onClick={() => showToast('已打开详情')}>
                              查看
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                )}
              </div>
              {appointmentTab !== 'todo' && appointmentAudioRowId ? (
                <div className="px-5 pb-2">
                  <SummaryHotlinePlayer />
                </div>
              ) : null}
              <FooterPagination total="共 800 条记录" />
            </SectionCard>
          </div>
        </div>
      );
    }
    if (page === 'agent-monitoring') {
      const allCards: AgentMonitorCard[] = [
        {
          name: '宋方义',
          status: '空闲状态' as AgentMonitorStatus,
          department: '选择部门1',
          seatNo: '000698',
          workgroup: '测试',
          mode: 'phone',
          caller: '',
          callee: '',
          extension: '8788000698',
          startAt: '15:53:35',
          duration: '超过1天',
          extraLabel: '',
          extraValue: '',
        },
        {
          name: '张文富',
          status: '忙碌状态' as AgentMonitorStatus,
          department: '系统组',
          seatNo: '000745',
          workgroup: '测试工作组A2',
          mode: 'phone',
          caller: '',
          callee: '',
          extension: '8788000745',
          startAt: '11:55:52',
          duration: '00:18:16',
          extraLabel: '',
          extraValue: '',
        },
        {
          name: 'Kukua',
          status: '通话状态' as AgentMonitorStatus,
          department: '系统组',
          seatNo: '000731',
          workgroup: '测试',
          mode: 'phone',
          caller: '',
          callee: '',
          extension: '8788000731',
          startAt: '17:10:58',
          duration: '00:06:43',
          extraLabel: '通话时长',
          extraValue: '00:06:43',
        },
        {
          name: '彭颖测试',
          status: '离线状态' as AgentMonitorStatus,
          department: '选择部门1',
          seatNo: '000745',
          workgroup: 'py测试工作组',
          mode: 'webchat',
          sessionCount: 0,
          startAt: '11:35:18',
          duration: '00:01:00',
          timeoutAt: '00:01:00',
          maxServiceCount: 2,
        },
        {
          name: '测试agent',
          status: '离线状态' as AgentMonitorStatus,
          department: '系统组',
          seatNo: '000755',
          workgroup: 'lml测试工作组',
          mode: 'webchat',
          sessionCount: 0,
          startAt: '15:53:35',
          duration: '超过1天',
          timeoutAt: '超过1天',
          maxServiceCount: 0,
        },
        {
          name: 'ADMIN',
          status: '在线状态' as AgentMonitorStatus,
          department: '系统组',
          seatNo: '1006',
          workgroup: '测试',
          mode: 'webchat',
          sessionCount: 0,
          startAt: '11:26:08',
          duration: '00:10:10',
          timeoutAt: '',
          maxServiceCount: 0,
        },
      ];
      const scopedCards = allCards.filter(
        (item) =>
          (monitorScope === 'all' || item.mode === monitorScope) &&
          (monitorSelectedDepartments.length === 0 || monitorSelectedDepartments.includes(item.department))
      );
      const cards = scopedCards.filter((item) => !monitorHideOffline || item.status !== '离线状态');
      const phoneStatusOrder = ['空闲状态', '忙碌状态', '通话状态', '离线状态', '振铃状态', '小休状态', '话后处理'] as const;
      const webchatStatusOrder = ['离线状态', '在线状态', '马上回来', '电话在线', '忙碌状态', '离开状态', '午餐状态', '隐身状态'] as const;
      const phoneStatusMap: Record<string, (typeof phoneStatusOrder)[number]> = {
        空闲状态: '空闲状态',
        忙碌状态: '忙碌状态',
        通话状态: '通话状态',
        离线状态: '离线状态',
        LOGOUT: '离线状态',
      };
      const webchatStatusMap: Record<string, (typeof webchatStatusOrder)[number]> = {
        离线状态: '离线状态',
        在线状态: '在线状态',
        忙碌状态: '忙碌状态',
      };
      const phoneCards = cards.filter((item) => item.mode === 'phone');
      const webchatCards = cards.filter((item) => item.mode === 'webchat');
      const phoneStatusCounts = phoneCards.reduce<Record<string, number>>((acc, item) => {
        const key = phoneStatusMap[item.status] ?? '离线状态';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const webchatStatusCounts = webchatCards.reduce<Record<string, number>>((acc, item) => {
        const key = webchatStatusMap[item.status] ?? item.status;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const footerTags =
        monitorScope === 'phone'
          ? phoneStatusOrder.map((status) => `${status}:${phoneStatusCounts[status] ?? 0}`)
          : monitorScope === 'webchat'
            ? webchatStatusOrder.map((status) => `${status}:${webchatStatusCounts[status] ?? 0}`)
            : [
                ...phoneStatusOrder.map((status) => `${status}:${phoneStatusCounts[status] ?? 0}`),
                ...webchatStatusOrder.map((status) => `${status}:${webchatStatusCounts[status] ?? 0}`),
              ];

      return (
        <div className={pageWrapperClass}>
          <div className={pageScrollClass}>
            <SectionCard>
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-5 text-[13px] text-slate-500">
                    {[
                      ['all', '全部'],
                      ['phone', '电话监控'],
                      ['webchat', '网聊监控'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input type="radio" checked={monitorScope === key} onChange={() => setMonitorScope(key as typeof monitorScope)} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setMonitorHideOffline((current) => !current)}
                      className="inline-flex items-center gap-2 text-[13px] text-slate-500"
                    >
                      <span>过滤离线</span>
                      <span
                        className={cn(
                          'relative inline-flex h-5 w-9 rounded-full transition-colors',
                          monitorHideOffline ? 'bg-brand-500' : 'bg-slate-300'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
                            monitorHideOffline ? 'translate-x-[18px]' : 'translate-x-[2px]'
                          )}
                        />
                      </span>
                    </button>
                    <QueryActions />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[13px]">
                  <button
                    type="button"
                    onClick={() => {
                      setMonitorDepartmentKeyword('');
                      setMonitorDepartmentDraft(
                        monitorSelectedDepartments.length > 0 ? [...monitorSelectedDepartments] : [...monitorDepartmentOptions]
                      );
                      setShowMonitorDepartmentDialog(true);
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-4 text-brand-600 transition-colors hover:bg-brand-100/60"
                  >
                    选择部门
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-slate-500">
                    {(monitorSelectedDepartments.length > 0 ? monitorSelectedDepartments : ['全部部门']).map((department) => (
                      <span key={department} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                        {department}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-2 2xl:grid-cols-4">
                {cards.map((card) => (
                  <div
                    key={card.name}
                    onClick={() => setMonitorDetailTarget(card)}
                    className={cn(
                      'rounded-xl border p-4 shadow-sm transition-colors',
                      card.status === 'LOGOUT' || card.status === '离线状态' ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-transparent bg-brand-600 text-white hover:bg-brand-700',
                      'cursor-pointer'
                    )}
                  >
                    {(() => {
                      const hasLockedWebchatSession =
                        card.mode === 'webchat' && (webchatSupportSessionsByAgent[card.name] ?? []).some((session) => Boolean(session.lockedAt));
                      return (
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[18px] font-semibold">
                          <span>{card.name}</span>
                          <span>|</span>
                          <span>{card.status}</span>
                          <span>|</span>
                          <span>{card.seatNo}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasLockedWebchatSession ? (
                          <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full border', card.status === 'LOGOUT' || card.status === '离线状态' ? 'border-slate-300 text-slate-500' : 'border-white/60 text-white')} title="存在锁定会话">
                            <Lock size={15} />
                          </span>
                        ) : null}
                        {card.mode === 'webchat' || (card.mode === 'phone' && card.status !== '离线状态') ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openSupportDialog(card.name, card.mode === 'webchat' ? 'webchat' : 'phone', card.status);
                            }}
                            title={card.mode === 'webchat' ? '网聊辅助' : '电话辅助'}
                            aria-label={card.mode === 'webchat' ? '网聊辅助' : '电话辅助'}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-600 transition-colors hover:bg-white"
                          >
                            <Hand size={15} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                      );
                    })()}
                    {card.mode === 'phone' ? (
                      <div className={cn('grid grid-cols-2 gap-x-6 gap-y-1 text-[12px]', card.status === 'LOGOUT' || card.status === '离线状态' ? 'text-slate-500' : 'text-white/85')}>
                        <div>主叫号: {card.caller || ''}</div>
                        <div>被叫号: {card.callee || ''}</div>
                        <div>开始时间: {card.startAt}</div>
                        <div>分机号: {card.extension}</div>
                        <div>持续时间: {card.duration}</div>
                        {card.extraLabel ? (
                          <div className={card.status === 'LOGOUT' || card.status === '离线状态' ? 'text-orange-500' : 'text-orange-400'}>
                            {card.extraLabel}: {card.extraValue}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className={cn('grid grid-cols-2 gap-x-6 gap-y-1 text-[12px]', card.status === 'LOGOUT' || card.status === '离线状态' ? 'text-slate-500' : 'text-white/85')}>
                        <div>工作组: {card.workgroup}</div>
                        <div>会话数: {card.sessionCount}</div>
                        <div>开始时间: {card.startAt}</div>
                        <div>持续时间: {card.duration}</div>
                        {(card.status === '离线状态' || (card.timeoutAt && card.status !== '在线状态')) ? (
                          <div className={card.status === 'LOGOUT' || card.status === '离线状态' ? 'text-orange-500' : 'text-orange-400'}>
                            超时时长: {card.timeoutAt || card.duration}
                          </div>
                        ) : null}
                        <div>最大服务数: {typeof card.maxServiceCount === 'number' ? card.maxServiceCount : 0}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4 text-[12px] text-slate-500">
                {footerTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 px-3 py-1">{tag}</span>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      );
    }
    if (page === 'queue-monitoring') {
      return (
        <div className={pageWrapperClass}>
          <div className={pageScrollClass}>
            <SectionCard>
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-5 text-[13px] text-slate-500">
                    {[
                      ['all', '全部'],
                      ['phone', '电话监控'],
                      ['webchat', '网聊监控'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input type="radio" name="queue-scope" checked={queueMonitorScope === key} onChange={() => setQueueMonitorScope(key as typeof queueMonitorScope)} />
                        <span>{label}</span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setQueueMonitorAutoRefresh((current) => !current)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors',
                        queueMonitorAutoRefresh ? 'border-brand-200 bg-brand-50 text-brand-600' : 'border-slate-200 bg-white text-slate-500'
                      )}
                    >
                      <span>定时刷新</span>
                      <span
                        className={cn(
                          'relative inline-flex h-5 w-9 rounded-full transition-colors',
                          queueMonitorAutoRefresh ? 'bg-brand-500' : 'bg-slate-300'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
                            queueMonitorAutoRefresh ? 'translate-x-[18px]' : 'translate-x-[2px]'
                          )}
                        />
                      </span>
                    </button>
                    <span className="text-slate-400">上次刷新: {queueMonitorRefreshedAt}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => refreshQueueMonitoring(true)} className={primaryButtonClass}>
                      <RotateCcw size={14} className="mr-1.5" />
                      立即刷新
                    </button>
                    <QueryActions
                      onSearch={() => refreshQueueMonitoring(true)}
                      onReset={() => {
                        setQueueMonitorScope('all');
                        setQueueMonitorAutoRefresh(true);
                        setQueueMonitorPhoneSkillGroup('');
                        setQueueMonitorWebchatQueue('');
                        refreshQueueMonitoring(true);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6 px-5 py-4">
                {queueMonitorScope !== 'webchat' ? (
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-4 text-[13px] text-slate-500">
                      <span className="font-medium text-slate-700">电话队列</span>
                      <Field label="技能组:" className="[&>span]:w-[52px]">
                        <select value={queueMonitorPhoneSkillGroup} onChange={(event) => setQueueMonitorPhoneSkillGroup(event.target.value)} className="h-10 w-[200px] rounded-md border border-slate-200 px-3 text-[13px] text-slate-600 outline-none">
                          <option value="">请选择技能组</option>
                          {queueMonitorPhoneSkillGroupOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="overflow-auto custom-scrollbar">
                      <table className="min-w-[1280px] table-fixed text-left text-[13px]">
                        <thead className="bg-slate-50/90 text-slate-600">
                          <tr>
                            {['序号', '队列', '队列名', '请求等待数', '登陆坐席数', '空闲坐席数', '忙碌坐席数', '话后处理数', '小休数', '通话数量', '最长等待时间'].map((column) => (
                              <th key={`phone-${column}`} className="whitespace-nowrap px-4 py-3 font-medium">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-slate-600">
                          {queueMonitorPhoneRows.map((row, index) => (
                            <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                              <td className="px-4 py-4">{index + 1}</td>
                              <td className="px-4 py-4">{row.queue}</td>
                              <td className="px-4 py-4">{row.queueName}</td>
                              <td className="px-4 py-4">{row.requestWaitingCount}</td>
                              <td className="px-4 py-4">{row.loginSeatCount}</td>
                              <td className="px-4 py-4">{row.idleSeatCount}</td>
                              <td className="px-4 py-4">{row.busySeatCount}</td>
                              <td className="px-4 py-4">{row.afterCallCount}</td>
                              <td className="px-4 py-4">{row.restCount}</td>
                              <td className="px-4 py-4">{row.callCount}</td>
                              <td className="px-4 py-4">{row.maxWaitTime}</td>
                            </tr>
                          ))}
                          {queueMonitorPhoneRows.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                                暂无电话队列数据
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {queueMonitorScope !== 'phone' ? (
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-4 text-[13px] text-slate-500">
                      <span className="font-medium text-slate-700">网聊队列</span>
                      <Field label="队列:" className="[&>span]:w-[52px]">
                        <select value={queueMonitorWebchatQueue} onChange={(event) => setQueueMonitorWebchatQueue(event.target.value)} className="h-10 w-[240px] rounded-md border border-slate-200 px-3 text-[13px] text-slate-600 outline-none">
                          <option value="">请选择队列</option>
                          {queueMonitorWebchatQueueOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="overflow-auto custom-scrollbar">
                      <table className="min-w-[1880px] table-fixed text-left text-[13px]">
                        <thead className="bg-slate-50/90 text-slate-600">
                          <tr>
                            {['序号', '队列', '所有坐席数', '在线坐席数', '机器人会话数', '请求等待数', '聊天会话数', '最长等待时长', '平均等待时长', '最长聊天时长', '马上回复数', '电话在线数', '忙碌状态数', '离开状态数', '午餐状态数', '隐身状态数'].map((column) => (
                              <th key={`webchat-${column}`} className="whitespace-nowrap px-4 py-3 font-medium">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-slate-600">
                          {queueMonitorWebchatRows.map((row, index) => (
                            <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                              <td className="px-4 py-4">{index + 1}</td>
                              <td className="px-4 py-4">{row.queue}</td>
                              <td className="px-4 py-4">{row.totalSeatCount}</td>
                              <td className="px-4 py-4">{row.onlineSeatCount}</td>
                              <td className="px-4 py-4">{row.robotSessionCount}</td>
                              <td className="px-4 py-4">{row.requestWaitingCount}</td>
                              <td className="px-4 py-4">{row.chatSessionCount}</td>
                              <td className="px-4 py-4">{row.maxWaitTime}</td>
                              <td className="px-4 py-4">{row.avgWaitTime}</td>
                              <td className="px-4 py-4">{row.maxChatTime}</td>
                              <td className="px-4 py-4">{row.instantReplyCount}</td>
                              <td className="px-4 py-4">{row.phoneOnlineCount}</td>
                              <td className="px-4 py-4">{row.busyStatusCount}</td>
                              <td className="px-4 py-4">{row.awayStatusCount}</td>
                              <td className="px-4 py-4">{row.lunchStatusCount}</td>
                              <td className="px-4 py-4">{row.hiddenStatusCount}</td>
                            </tr>
                          ))}
                          {queueMonitorWebchatRows.length === 0 ? (
                            <tr>
                              <td colSpan={16} className="px-4 py-8 text-center text-slate-400">
                                暂无网聊队列数据
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>
        </div>
      );
    }
    if (page === 'webchat-history-query') return renderWebchatHistoryPage();
    if (page === 'webchat-message-management') return renderWebchatMessagePage();
    if (page === 'webchat-blacklist-query') return renderBlacklistPage('query');
    if (page === 'webchat-blacklist-approval') return renderBlacklistPage('approval');
    return null;
  })();

  return (
    <>
      {content}

      {toast ? <div className="fixed bottom-6 right-6 z-[130] rounded-xl bg-slate-900 px-4 py-3 text-[13px] text-white shadow-lg">{toast}</div> : null}

      {userSystemDialog ? (
        <Modal title={userSystemDialog === 'add' ? '新增用户体系' : '编辑用户体系'} onClose={() => setUserSystemDialog(null)} widthClass="max-w-2xl">
          <div className="space-y-5 px-6 py-6">
            <Field label="* 用户体系名称:"><input value={userSystemForm.name} onChange={(event) => setUserSystemForm((current) => ({ ...current, name: event.target.value }))} placeholder="请输入用户体系名称" className={inputClass} /></Field>
            <Field label="* 黑名单天数:"><input value={userSystemForm.blacklistDays} onChange={(event) => setUserSystemForm((current) => ({ ...current, blacklistDays: event.target.value }))} placeholder="请输入黑名单天数" className={inputClass} /></Field>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={() => setUserSystemDialog(null)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={submitUserSystem} className={solidButtonClass}>确定</button>
          </div>
        </Modal>
      ) : null}

      {summaryCorrectionTarget ? (
        <Modal title="小结纠错" onClose={() => setSummaryCorrectionTarget(null)} widthClass="max-w-5xl">
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
            {summaryRecordDetailFields.map((label) => {
              const required = label === '产品分类';

              return (
                <div key={label} className="min-w-0">
                  <div className="mb-2 text-[14px] text-slate-700">
                    {required ? <span className="mr-1 text-rose-500">*</span> : null}
                    {label}
                  </div>
                  {label === '账号' ? (
                    <input
                      value={summaryCorrectionForm[label] ?? ''}
                      onChange={(event) => setSummaryCorrectionForm((current) => ({ ...current, [label]: event.target.value }))}
                      placeholder="请输入"
                      className={cn(inputClass, 'h-10')}
                    />
                  ) : (
                    <select
                      value={summaryCorrectionForm[label] ?? ''}
                      onChange={(event) => setSummaryCorrectionForm((current) => ({ ...current, [label]: event.target.value }))}
                      className={cn(inputClass, 'h-10')}
                    >
                      <option value="">请选择</option>
                      {Array.from(new Set([summaryCorrectionForm[label], ...(summaryRecordDetailSelectOptions[label] ?? [])].filter(Boolean))).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={() => setSummaryCorrectionTarget(null)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={submitSummaryCorrection} className={solidButtonClass}>确定</button>
          </div>
        </Modal>
      ) : null}

      {summaryRecordsTarget ? (
        <Modal
          title="纠错记录"
          onClose={() => {
            setSummaryRecordsTarget(null);
            setSummaryRecordDetail(null);
            setSummaryRecordDetailForm({});
          }}
          widthClass="max-w-6xl"
        >
          <div className="space-y-6 px-6 py-6">
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-slate-600">
              <label className="flex items-center gap-3">
                <span className="font-medium text-slate-700">日期:</span>
                <select
                  value={summaryRecordDetail?.id ?? ''}
                  onChange={(event) => {
                    const target = correctionRecords.find((item) => item.id === event.target.value);
                    if (target) openSummaryRecordDetail(target);
                  }}
                  className={cn(inputClass, 'h-9 w-[180px]')}
                >
                  {correctionRecords
                    .filter((item) => item.summaryId === summaryRecordsTarget.id)
                    .map((record) => (
                      <option key={record.id} value={record.id}>
                        {record.correctedAt}
                      </option>
                    ))}
                </select>
              </label>
              <div>
                <span className="font-medium text-slate-700">处理人:</span>
                <span className="ml-2">{summaryRecordDetail?.correctedBy || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
              {summaryRecordDetailFields.map((label) => {
                const currentValue = summaryRecordDetailForm[label] ?? '';
                const originalValue = summaryRecordDetail ? correctionRecordOriginalDetails[summaryRecordDetail.id]?.[label] : '';
                const changed = summaryRecordDetail ? correctionRecordChangedFields[summaryRecordDetail.id]?.includes(label) : false;
                const required = label === '产品分类';

                return (
                  <div key={label} className="min-w-0">
                    <div className="mb-2 text-[14px] text-slate-700">
                      {required ? <span className="mr-1 text-rose-500">*</span> : null}
                      {label}
                    </div>
                    <div
                      className={cn(
                        'flex min-h-[40px] items-center rounded-md border bg-white px-3 text-[14px] text-slate-700',
                        changed ? 'border-rose-400' : 'border-slate-200'
                      )}
                    >
                      <span className="truncate">{currentValue || '请选择'}</span>
                    </div>
                    {changed && originalValue ? (
                      <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-brand-200 bg-brand-50 px-1 text-[11px] font-medium text-brand-600">
                          原
                        </span>
                        <span className="truncate">{originalValue}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      ) : null}

      {false && summaryRecordDetail ? (
        <Modal title="查看详情" onClose={() => setSummaryRecordDetail(null)} widthClass="max-w-5xl">
          <div className="grid grid-cols-1 gap-4 px-6 py-6 lg:grid-cols-2 xl:grid-cols-3">
            {[
              '产品分类',
              '产品名称',
              '呼入类型',
              '问题定型',
              '问题分类一级',
              '问题分类二级',
              '问题分类三级',
              '小结类型',
              '处理结果状态',
              '账号',
              '投诉分类一级',
              '投诉分类二级',
            ].map((label) => (
              <Field key={label} label={`${label}${label === '产品分类' ? ' *' : ''}`} className="xl:[&>span]:w-[92px]">
                {label === '账号' ? (
                  <input
                    value={summaryRecordDetailForm[label] ?? ''}
                    onChange={(event) => setSummaryRecordDetailForm((current) => ({ ...current, [label]: event.target.value }))}
                    placeholder="请输入"
                    className={inputClass}
                  />
                ) : (
                  <select
                    value={summaryRecordDetailForm[label] ?? ''}
                    onChange={(event) => setSummaryRecordDetailForm((current) => ({ ...current, [label]: event.target.value }))}
                    className={inputClass}
                  >
                    {Array.from(
                      new Set([
                        summaryRecordDetail.detail[label as keyof typeof summaryRecordDetail.detail],
                        ...(summaryRecordDetailSelectOptions[label] ?? []),
                      ].filter(Boolean))
                    ).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            ))}
          </div>
        </Modal>
      ) : null}

      {appointmentTransferTarget ? (
        <Modal title="调剂" onClose={() => setAppointmentTransferTarget(null)} widthClass="max-w-2xl">
          <div className="space-y-6 px-6 py-8">
            <Field label="* 部门:" className="xl:[&>span]:w-[88px]">
              <select
                value={appointmentTransferDepartment}
                onChange={(event) => setAppointmentTransferDepartment(event.target.value)}
                className={inputClass}
              >
                <option value="">请选择部门</option>
                <option value="部门A">部门A</option>
                <option value="部门B">部门B</option>
                <option value="部门C">部门C</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={() => setAppointmentTransferTarget(null)} className={secondaryButtonClass}>取消</button>
            <button
              type="button"
              onClick={() => {
                showToast('预约回电已调剂');
                setAppointmentTransferTarget(null);
              }}
              className={solidButtonClass}
            >
              确定
            </button>
          </div>
        </Modal>
      ) : null}

      {appointmentTransferHistoryTarget ? (
        <Modal title="调剂历史" onClose={() => setAppointmentTransferHistoryTarget(null)} widthClass="max-w-4xl">
          <div className="overflow-auto px-6 py-6 custom-scrollbar">
            <table className="min-w-full table-fixed text-left text-[13px]">
              <thead className="bg-slate-50/90 text-slate-600">
                <tr>
                  {['序号', '调剂人', '调剂时间', '处理部门'].map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {appointmentTransferHistoryRows.map((record, index) => (
                  <tr key={record.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">{record.operator}</td>
                    <td className="px-4 py-4">{record.transferredAt}</td>
                    <td className="px-4 py-4">{record.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      ) : null}

      {sampleSubmitTarget ? (
        <Modal title="提交范例录音" onClose={closeSampleSubmitModal} widthClass="max-w-5xl">
          <div className="space-y-8 px-8 py-8">
            <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-4">
              <span className="text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>录音描述
              </span>
              <div className="relative">
                <input
                  value={sampleSubmitForm.description}
                  maxLength={100}
                  onChange={(event) => setSampleSubmitForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="请输入100字以内录音描述"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-20 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                  {sampleSubmitForm.description.length} / 100
                </span>
              </div>
            </label>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
              <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-4">
                <span className="text-[16px] text-slate-700">
                  <span className="mr-1 text-rose-500">*</span>录音品质
                </span>
                <select
                  value={sampleSubmitForm.quality}
                  onChange={(event) => setSampleSubmitForm((current) => ({ ...current, quality: event.target.value }))}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                >
                  <option value="">请选择录音品质</option>
                  <option value="优质录音">优质录音</option>
                  <option value="优秀录音">优秀录音</option>
                  <option value="劣质录音">劣质录音</option>
                </select>
              </label>

              <label className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
                <span className="text-[16px] text-slate-700">
                  <span className="mr-1 text-rose-500">*</span>录音所属人
                </span>
                <input
                  value={sampleSubmitForm.owner}
                  readOnly
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-700 outline-none"
                />
              </label>
            </div>

            <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-4">
              <span className="text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>录音路径
              </span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
                <FileText size={18} className="shrink-0 text-slate-300" />
                <input
                  value={sampleSubmitForm.path}
                  readOnly
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-700 outline-none"
                />
                <Upload size={18} className="shrink-0 text-slate-300" />
              </div>
            </label>

            <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-4">
              <div className="pt-3 text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>提交理由
              </div>
              <div>
                <textarea
                  value={sampleSubmitForm.reason}
                  maxLength={500}
                  onChange={(event) => setSampleSubmitForm((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="请输入500字以内提交理由"
                  className="min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                />
                <div className="mt-2 text-right text-[14px] text-slate-400">{sampleSubmitForm.reason.length} / 500</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-8 py-4">
            <button type="button" onClick={closeSampleSubmitModal} className={secondaryButtonClass}>
              取消
            </button>
            <button type="button" onClick={submitSampleRecording} className={solidButtonClass}>
              确定
            </button>
          </div>
        </Modal>
      ) : null}

      {webchatHistorySampleTargetId ? (
        <Modal title="提交范例库" onClose={closeWebchatHistorySampleSubmitModal} widthClass="max-w-3xl">
          <div className="space-y-6 px-8 py-8">
            <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-4">
              <span className="text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>聊天描述
              </span>
              <div className="relative">
                <input
                  value={webchatHistorySampleSubmitForm.description}
                  maxLength={20}
                  onChange={(event) => setWebchatHistorySampleSubmitForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="请输入20字以内聊天描述"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-20 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                  {webchatHistorySampleSubmitForm.description.length} / 20
                </span>
              </div>
            </label>

            <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-4">
              <span className="text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>聊天所属人
              </span>
              <input
                value={webchatHistorySampleSubmitForm.owner}
                readOnly
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none"
              />
            </label>

            <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-4">
              <span className="text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>聊天品质
              </span>
              <select
                value={webchatHistorySampleSubmitForm.quality}
                onChange={(event) => setWebchatHistorySampleSubmitForm((current) => ({ ...current, quality: event.target.value }))}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-600 outline-none focus:border-brand-400"
              >
                <option value="">请选择聊天品质</option>
                <option value="优质聊天">优质聊天</option>
                <option value="优秀聊天">优秀聊天</option>
                <option value="劣质聊天">劣质聊天</option>
              </select>
            </label>

            <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-4">
              <div className="pt-3 text-[16px] text-slate-700">
                <span className="mr-1 text-rose-500">*</span>提交理由
              </div>
              <div>
                <textarea
                  value={webchatHistorySampleSubmitForm.reason}
                  maxLength={500}
                  onChange={(event) => setWebchatHistorySampleSubmitForm((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="请输入500字以内提交理由"
                  className="min-h-[140px] w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                />
                <div className="mt-2 text-right text-[14px] text-slate-400">{webchatHistorySampleSubmitForm.reason.length} / 500</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-8 py-4">
            <button type="button" onClick={closeWebchatHistorySampleSubmitModal} className={secondaryButtonClass}>
              取消
            </button>
            <button type="button" onClick={submitWebchatHistorySample} className={solidButtonClass}>
              确定
            </button>
          </div>
        </Modal>
      ) : null}

      {smsDetailTarget ? (
        <Modal title="短信详情" onClose={() => setSmsDetailTarget(null)} widthClass="max-w-5xl">
          <div className="space-y-10 px-8 py-8">
            <label className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-6">
              <span className="text-[16px] text-slate-700">收信号码</span>
              <input
                value={smsDetailTarget.receiverNo}
                readOnly
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-400 outline-none"
              />
            </label>
            <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-6">
              <div className="pt-3 text-[16px] text-slate-700">短信内容</div>
              <textarea
                value={smsDetailTarget.content}
                readOnly
                className="min-h-[260px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-9 text-slate-400 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-100 px-8 py-4">
            <button type="button" onClick={() => setSmsDetailTarget(null)} className={secondaryButtonClass}>
              取消
            </button>
          </div>
        </Modal>
      ) : null}

      {auditTarget ? (
        <Modal
          title="范例录音审批"
          onClose={closeAuditModal}
          widthClass="max-w-4xl"
        >
          <div className="px-6 py-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[160px_minmax(0,1fr)] border-b border-slate-200">
                <div className="bg-slate-50 px-8 py-8 text-[16px] font-medium text-slate-700">录音描述</div>
                <div className="px-8 py-8 text-[16px] text-slate-700">{auditTarget.description}</div>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,1fr)]">
                <div className="bg-slate-50 px-8 py-8 text-[16px] font-medium text-slate-700">提交理由</div>
                <div className="px-8 py-8 text-[16px] text-slate-700">{auditTarget.reason}</div>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-12 px-10">
              <label className="flex cursor-pointer items-center gap-3 text-[16px] text-slate-700">
                <input
                  type="radio"
                  name="auditDecision"
                  checked={auditDecision === 'agree'}
                  onChange={() => setAuditDecision('agree')}
                  className="h-5 w-5 cursor-pointer"
                  style={{ accentColor: '#14b8a6' }}
                />
                <span>同意</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-[16px] text-slate-700">
                <input
                  type="radio"
                  name="auditDecision"
                  checked={auditDecision === 'reject'}
                  onChange={() => setAuditDecision('reject')}
                  className="h-5 w-5 cursor-pointer"
                  style={{ accentColor: '#14b8a6' }}
                />
                <span>拒绝</span>
              </label>
            </div>

            <div className="mt-10 space-y-9 px-14">
              <label className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4">
                <span className="text-[16px] text-slate-700">
                  <span className="mr-1 text-rose-500">*</span>分类
                </span>
                <select
                  value={auditCategory}
                  onChange={(event) => setAuditCategory(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                >
                  <option value="">请选择分类</option>
                  <option value="优质录音">优质录音</option>
                  <option value="优秀录音">优秀录音</option>
                  <option value="劣质录音">劣质录音</option>
                </select>
              </label>

              <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
                <div className="pt-3 text-[16px] text-slate-700">
                  <span className="mr-1 text-rose-500">*</span>意见
                </div>
                <div>
                  <textarea
                    value={auditOpinion}
                    maxLength={500}
                    onChange={(event) => setAuditOpinion(event.target.value)}
                    placeholder="请输入500字以内意见"
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-slate-600 outline-none focus:border-brand-400"
                  />
                  <div className="mt-2 text-right text-[14px] text-slate-400">{auditOpinion.length} / 500</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={closeAuditModal} className={secondaryButtonClass}>
              取消
            </button>
            <button type="button" onClick={submitAudit} className={solidButtonClass}>
              确定
            </button>
          </div>
        </Modal>
      ) : null}

      {showMonitorDepartmentDialog ? (
        <Modal title="用户组选择" onClose={() => setShowMonitorDepartmentDialog(false)} widthClass="max-w-3xl">
          <div className="min-h-[560px] bg-white">
            <div className="border-b border-slate-200 px-3 py-3">
              <div className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-slate-400">
                <Search size={18} />
                <input
                  value={monitorDepartmentKeyword}
                  onChange={(event) => setMonitorDepartmentKeyword(event.target.value)}
                  placeholder="模糊搜索组ID/组名"
                  className="h-8 w-full border-0 bg-transparent text-[15px] text-slate-600 outline-none placeholder:text-slate-300"
                />
                <div className="flex h-8 w-8 items-center justify-center text-slate-400">
                  <span className="text-[22px] leading-none">≡</span>
                </div>
              </div>
            </div>
            <div className="min-h-[430px] px-0 py-1">
              {filteredMonitorDepartmentOptions.map((department) => {
                const checked = monitorDepartmentDraft.includes(department);
                const suffix = department === '系统组' ? 'SYSTEM' : department === '选择部门1' ? 'PNUPRX' : 'S6GVG4';
                return (
                  <label
                    key={department}
                    className="flex cursor-pointer items-center gap-4 border-b border-slate-100 px-8 py-5 text-[17px] text-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setMonitorDepartmentDraft((current) =>
                          event.target.checked ? [...current, department] : current.filter((item) => item !== department)
                        )
                      }
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full text-[16px] font-semibold',
                        checked ? 'bg-brand-500 text-white' : 'border border-slate-300 bg-white text-transparent'
                      )}
                    >
                      ✓
                    </span>
                    <span>
                      {department}
                      <span className="ml-1 text-slate-400">- {suffix}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowMonitorDepartmentDialog(false)}
              className="inline-flex h-12 min-w-[88px] items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-[18px] text-slate-500"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                setMonitorSelectedDepartments(
                  monitorDepartmentDraft.length === monitorDepartmentOptions.length ? [] : [...monitorDepartmentDraft]
                );
                setShowMonitorDepartmentDialog(false);
              }}
              className="inline-flex h-12 min-w-[88px] items-center justify-center rounded-full bg-brand-500 px-6 text-[18px] font-medium text-white"
            >
              确认
            </button>
          </div>
        </Modal>
      ) : null}

      {monitorDetailTarget ? (
        <Modal title={`${monitorDetailTarget.name} ${monitorDetailTarget.seatNo}`} onClose={() => setMonitorDetailTarget(null)} widthClass="max-w-5xl">
          <div className="bg-white px-8 py-8">
            <div className="grid gap-x-12 gap-y-4 pb-2 text-[14px] text-slate-600 md:grid-cols-3">
              {(monitorDetailTarget.mode === 'phone'
                ? [
                    ['当前状态', monitorDetailTarget.status === '空闲状态' ? '在线' : monitorDetailTarget.status],
                    ['持续时间', '1小时17分钟45秒'],
                    ['今日通话数', '23'],
                    ['后处理时长', '0小时0分钟0秒'],
                    ['初始登录时长', '0小时14分钟42秒'],
                    ['离线时长', '2天14小时43分钟59秒'],
                    ['会议时长', '0小时0分钟0秒'],
                    ['小时时长', '0小时0分钟0秒'],
                    ['培训时长', '0小时0分钟0秒'],
                    ['通话时长', '0小时0分钟12秒'],
                    ['辅导时长', '0小时0分钟0秒'],
                    ['挂机时长', '0小时0分钟0秒'],
                    ['注销时长', '0小时0分钟0秒'],
                    ['强置忙时长', '0小时0分钟0秒'],
                  ]
                : [
                    ['当前状态', monitorDetailTarget.status === '在线状态' ? '在线' : monitorDetailTarget.status],
                    ['持续时间', '1小时17分钟45秒'],
                    ['当前服务数', `${monitorDetailTarget.sessionCount ?? 0}人`],
                    ['今日累计服务数', '15人'],
                    ['初始登录时长', '0小时14分钟42秒'],
                    ['离线时长', '2天14小时43分钟59秒'],
                    ['后处理时长', '0小时0分钟0秒'],
                    ['小时时长', '0小时0分钟0秒'],
                    ['培训时长', '0小时0分钟0秒'],
                    ['会议时长', '0小时0分钟0秒'],
                    ['辅导时长', '0小时0分钟0秒'],
                    ['挂机时长', '0小时0分钟0秒'],
                    ['注销时长', '0小时0分钟0秒'],
                    ['强置忙时长', '0小时0分钟0秒'],
                  ]
              ).map(([label, value]) => (
                <div key={`${label}-${value}`} className="flex items-center gap-2">
                  <span className="text-slate-500">{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      ) : null}

      {supportDialog ? (
        <Modal
          title={supportDialog.type === 'phone' ? '电话辅助' : '网聊辅助'}
          onClose={() => setSupportDialog(null)}
          widthClass={supportDialog.type === 'phone' ? 'max-w-sm' : 'max-w-5xl'}
        >
          {supportDialog.type === 'phone' ? (
            <div className="bg-white px-6 py-5">
              <div className="flex items-center gap-3 border-y border-slate-100 py-5">
                <div className="flex items-center gap-3 text-[16px] font-semibold text-slate-700">
                  <span>{supportDialog.target}</span>
                  <span>|</span>
                  <span>{supportDialog.status}</span>
                  <span>|</span>
                  <span>3098</span>
                </div>
              </div>
              <div className="flex gap-4 py-7">
                {phoneSupportActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    className={cn(
                      'inline-flex h-10 min-w-[76px] items-center justify-center rounded-full px-5 text-[15px]',
                      action === '强退'
                        ? 'bg-rose-400 font-medium text-white'
                        : action === '监听'
                          ? 'bg-brand-400 font-medium text-white'
                          : 'border border-slate-300 bg-white text-slate-600'
                    )}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[540px] bg-white">
              <div className="grid grid-cols-[248px_1fr] border-b border-slate-100 text-[13px] text-slate-500">
                <div className="border-r border-slate-100 px-5 py-4" />
                <div className="grid grid-cols-3">
                  <div className="px-6 py-4">当前会话: {selectedSupportSession?.id ?? '-'}</div>
                  <div className="px-6 py-4">当前客服: {selectedSupportSession?.currentAgent ?? '-'}</div>
                  <div className="px-6 py-4 text-right">上次更新: {selectedSupportSession?.updatedAt ?? '-'}</div>
                </div>
              </div>
              <div className="grid grid-cols-[248px_1fr]">
                <div className="border-r border-slate-100 bg-slate-50 px-4 py-3">
                  {supportSessions.map((session) => {
                    const isActive = selectedSupportSession?.id === session.id;
                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSupportSessionId(session.id)}
                        className={cn(
                          'mt-3 flex cursor-pointer items-start gap-3 rounded-r-xl px-4 py-4 text-left transition-colors first:mt-0',
                          isActive ? 'bg-slate-200' : 'hover:bg-slate-100'
                        )}
                      >
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded text-[16px] font-semibold', isActive ? 'bg-brand-400 text-white' : 'bg-slate-200 text-slate-500')}>
                          {session.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cn('text-[13px] font-medium', isActive ? 'text-slate-700' : 'text-slate-600')}>{session.id}</div>
                          <div className={cn('mt-1 whitespace-nowrap text-[12px] leading-5', isActive ? 'text-slate-600' : 'text-slate-500')}>
                            {session.lockedAt ? (
                              `锁定时间: ${session.lockedAt}`
                            ) : (
                              '未锁定'
                            )}
                          </div>
                        </div>
                        {session.lockedAt ? (
                          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-500" title="该会话已被坐席锁定">
                            <Lock size={16} />
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div className="grid grid-cols-3 bg-brand-500 text-[13px] text-white">
                    <div className="px-6 py-2.5">开始时间: {selectedSupportSession?.startedAt ?? '-'}</div>
                    <div className="px-6 py-2.5">持续时间: {selectedSupportSession?.duration ?? '-'}</div>
                    <div className="px-6 py-2.5">当前队列: {selectedSupportSession?.queue ?? '-'}</div>
                  </div>
                  <div className="h-[392px] overflow-auto px-6 py-4 custom-scrollbar">
                    {selectedSupportSession?.messages.map((message) => (
                      <div key={message.id}>
                        <div className={cn('mb-2 text-[12px] text-slate-400', message.align === 'left' ? 'text-left' : 'text-right')}>
                          {message.time} {message.sender}
                        </div>
                        <div className={cn('mb-4 flex items-start gap-3', message.align === 'left' ? 'justify-start' : 'justify-end')}>
                          {message.align === 'left' ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-[15px] font-semibold text-slate-600">{message.badge}</div>
                          ) : null}
                          <div
                            className={cn(
                              'rounded-xl px-4 py-3 text-[13px] text-slate-700',
                              message.align === 'left' ? 'bg-white border border-slate-200' : 'bg-brand-50',
                              message.text.length > 30 ? 'max-w-[560px] leading-6' : ''
                            )}
                          >
                            {message.text}
                          </div>
                          {message.align === 'right' ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-400 text-[15px] font-semibold text-white">{message.badge}</div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      ) : null}
      {webchatHistoryDetail ? (
        <Modal title="网聊历史详情" onClose={() => setWebchatHistoryDetail(null)} widthClass="max-w-2xl">
          <div className="space-y-4 px-6 py-6 text-[14px] text-slate-600">
            <div>客户名: 访客34446</div>
            <div>渠道: Web</div>
            <div>联系方式: 18022343432</div>
            <div>留言时间: 2026-02-26 14:20:35</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-6">客服您好，我想确认回电时间。</div>
          </div>
        </Modal>
      ) : null}

      {false && webchatTransferTarget ? (
        <Modal title="留言调剂" onClose={() => setWebchatTransferTarget(null)} widthClass="max-w-2xl">
          <div className="space-y-4 px-6 py-6">
            <Field label="处理部门:"><input defaultValue="系统组" className={inputClass} /></Field>
            <Field label="处理人:"><input defaultValue="坐席B" className={inputClass} /></Field>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={() => setWebchatTransferTarget(null)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={() => { showToast('留言已调剂'); setWebchatTransferTarget(null); }} className={solidButtonClass}>确定</button>
          </div>
        </Modal>
      ) : null}

      {webchatTransferTarget ? (
        <Modal title="调剂" onClose={() => setWebchatTransferTarget(null)} widthClass="max-w-xl">
          <div className="space-y-4 px-6 py-6">
            <Field label="* 部门:" className="[&>span]:w-[92px]">
              <select value={webchatTransferDepartment} onChange={(event) => setWebchatTransferDepartment(event.target.value)} className={inputClass}>
                <option value="">请选择部门</option>
                <option value="系统组">系统组</option>
                <option value="部门A">部门A</option>
                <option value="部门B">部门B</option>
                <option value="部门C">部门C</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button type="button" onClick={() => setWebchatTransferTarget(null)} className={secondaryButtonClass}>
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (!webchatTransferDepartment) {
                  showToast('请选择部门');
                  return;
                }
                showToast('留言已调剂');
                setWebchatTransferDepartment('');
                setWebchatTransferTarget(null);
              }}
              className={solidButtonClass}
            >
              确定
            </button>
          </div>
        </Modal>
      ) : null}

      {webchatTransferHistoryTarget ? (
        <Modal title="调剂历史" onClose={() => setWebchatTransferHistoryTarget(null)} widthClass="max-w-4xl">
          <div className="px-6 py-5">
            <table className="w-full table-fixed text-left text-[13px]">
              <thead className="bg-slate-50/90 text-slate-600">
                <tr>
                  {['序号', '调剂人', '调剂时间', '处理部门'].map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {appointmentTransferHistoryRows.map((row, index) => (
                  <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">{row.operator}</td>
                    <td className="px-4 py-4">{row.transferredAt}</td>
                    <td className="px-4 py-4">{row.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
