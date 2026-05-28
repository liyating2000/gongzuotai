/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { LegacyModuleFilterPreset } from './features/legacy/LegacyModulesPanel';
import logoImage from './logo.png';
import channelMobileIcon from './assets/channel-icons/移动端.png';
import channelWebIcon from './assets/channel-icons/Web端.png';
import channelWechatMiniProgramIcon from './assets/channel-icons/微信小程序.png';
import channelWechatServiceIcon from './assets/channel-icons/微信服务号.png';
import onlineTransferAgentIcon from './assets/chat-icons/聊天-顶-转坐席.png';
import onlineTransferQueueIcon from './assets/chat-icons/聊天-顶-转队列.png';
import onlineConferenceIcon from './assets/chat-icons/聊天-顶-三方会议.png';
import onlineEndSessionIcon from './assets/chat-icons/聊天-顶-结束会话.png';
import chatScreenshotIcon from './assets/chat-icons/聊天-截图.png';
import chatMessageIcon from './assets/chat-icons/聊天-留言.png';
import chatTranslateIcon from './assets/chat-icons/聊天-翻译.png';
import chatUtilityIcon from './assets/chat-icons/聊天-常用工具.png';
import chatSuggestionIcon from './assets/chat-icons/聊天-推荐语.png';
import chatVoiceIcon from './assets/chat-icons/聊天-语音.png';
import onlineSideAgentIcon from './assets/rightside-icons/在线-侧-Agent.png';
import onlineSideCustomerInfoIcon from './assets/rightside-icons/在线-侧-客户信息.png';
import onlineSideCustomerHistoryIcon from './assets/rightside-icons/在线-侧-客户历史.png';
import onlineSideKnowledgeBaseIcon from './assets/rightside-icons/在线-侧-知识库.png';
import onlineSideWorkOrderIcon from './assets/rightside-icons/在线-侧-工单端丽.png';
import onlineSideToolIcon from './assets/rightside-icons/在线-侧-常用工具.png';
import onlineSideThirdPartyIcon from './assets/rightside-icons/在线-侧-三方.png';
import onlineSideSettingsIcon from './assets/rightside-icons/在线-侧-设置.png';
import toolSmsIcon from './assets/tool-icons/tool-短信.png';
import toolAttachmentIcon from './assets/tool-icons/tool-附件查询.png';
import toolSortIcon from './assets/tool-icons/tool-排序.png';
import toolMailIcon from './assets/tool-icons/tool-邮件.png';
import toolServicePointIcon from './assets/tool-icons/tool-售后网点查询.png';
import toolRepairPriceIcon from './assets/tool-icons/tool-售后维修价格.png';
import toolPaymentIcon from './assets/tool-icons/tool-售后付款.png';
import onlineAudioCallAvatar from './assets/video-icons/audio-photo.png';
import onlineCallMuteIcon from './assets/video-icons/audio.png';
import onlineCallHangupIcon from './assets/video-icons/hangup.png';
import onlineCallSpeakerIcon from './assets/video-icons/louder.png';
import onlineVideoMainPhoto from './assets/video-icons/video-photo2.png';
import onlineVideoPreviewPhoto from './assets/video-icons/video-ru-photo.png';
import onlineVideoToolbarBackground from './assets/video-icons/video-toobg.png';
import onlineCallVideoIcon from './assets/video-icons/video.png';
import onlineVideoHangupIcon from './assets/video-icons/hangup2.png';
import { 
  Search, 
  LayoutGrid, 
  Phone, 
  MessageSquare, 
  FileText, 
  FileSearch,
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap, 
  Calendar, 
  Monitor, 
  BarChart3, 
  Bell,
  Settings,
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  User,
  Mic,
  PhoneOff,
  PhoneForwarded,
  Pause,
  Volume2,
  LogIn,
  LogOut,
  Mail,
  Download,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Send,
  Check,
  Paperclip,
  Undo2,
  HelpCircle,
  Smile,
  Scissors,
  FilePen,
  Video,
  Languages,
  ScreenShare,
  Clock,
  X,
  AlertCircle,
  Smartphone,
  Rows3,
  Headphones,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useDragResize } from './hooks/useDragResize';
import { useFeatureSidebarState } from './hooks/useFeatureSidebarState';
import { usePanelSizeSync } from './hooks/usePanelSizeSync';
import { useWorkbenchSummaryState } from './hooks/useWorkbenchSummaryState';
import { cn } from './lib/cn';
import SidebarItem from './features/layout/SidebarItem';
import ErrorBoundary from './features/layout/ErrorBoundary';
import MainHeader from './features/layout/MainHeader';
import { useRoleRouting } from './hooks/useRoleRouting';
import { useSidebar } from './hooks/useSidebar';
import {
  sidebarMenuConfig,
  findMenuGroupForTab,
  filterMenuByRole,
  filterMenuByQuery,
  type MenuItemConfig,
} from './features/layout/menuConfig';
import type {
  MainTab,
  PrimaryMainTab,
  SecondaryMainTab,
} from './features/layout/mainTabs';
import {
  getAgentChannelForRole,
  getAllowedWorkbenchesForRole,
  getViewModeForRole,
  isAgentChannelLockedForRole,
  userRoleLabels,
} from './features/layout/roles';
import OnlineConversationPanel from './features/online-workbench/OnlineConversationPanel';
import OnlineSessionListPanel from './features/online-workbench/OnlineSessionListPanel';
import OnlineWorkbenchContentView from './features/online-workbench/OnlineWorkbenchContent';
import OnlineWorkbenchSidebar from './features/online-workbench/OnlineWorkbenchSidebar';
import CallAgentPanel from './features/call-workbench/CallAgentPanel';
import CallCustomerInfoPanel from './features/call-workbench/CallCustomerInfoPanel';
import CallInboundInfoPanel from './features/call-workbench/CallInboundInfoPanel';
import CallHistoryPanel, {
  CallRecordingPlayer,
  EmailContentList,
  SmsContentList,
} from './features/call-workbench/CallHistoryPanel';
import BlacklistApplicationModal from './features/call-workbench/BlacklistApplicationModal';
import CallScheduleFollowUpModal from './features/call-workbench/CallScheduleFollowUpModal';
import TaggingModal from './features/workbench/TaggingModal';
import ProblemClassificationSearchModal, {
  type ProblemClassificationCombo,
} from './features/workbench/ProblemClassificationSearchModal';
import CallWorkbenchContentView from './features/call-workbench/CallWorkbenchContent';
import CallRightSidebar from './features/call-workbench/CallRightSidebar';
import {
  HistoryDateRangeFilter,
  HistoryDateRangeMenu,
  type HistoryDateRangeValue,
} from './features/workbench/HistoryDateRangeControls';
import WorkbenchResizeHandle from './features/workbench/WorkbenchResizeHandle';
import WorkbenchSummaryPanel from './features/workbench/WorkbenchSummaryPanel';
import {
  messageServiceMailboxes,
  type MessageServiceMailbox,
} from './features/message-service/data';
import {
  initialDirectorMessages,
  type DirectorExpressMessage,
  type DirectorExpressView,
} from './features/portal/directorExpress';
import PortalViewHeader from './features/portal/PortalViewHeader';
import {
  createShuffledStarEmployees,
  type ManagerBusinessPeriodOption,
  type ManagerGroupFilter,
  type ManagerOnlineFilter,
  type ManagerPersonnelDateOption,
  type PersonnelFocusMetric,
  type ShiftScheduleDay,
  type StarEmployee,
  type StarEmployeeMetric,
} from './features/portal/data';

const MessageServiceContent = lazy(
  () => import('./features/message-service/MessageServiceContent')
);
const ScheduleDisplayContent = lazy(
  () => import('./features/schedule-display/ScheduleDisplayContent')
);
const BusinessFieldManagementContent = lazy(
  () => import('./features/business-field-management/BusinessFieldManagementContent')
);
const BusinessFieldLaunchReviewContent = lazy(
  () => import('./features/business-field-launch-review/BusinessFieldLaunchReviewContent')
);
const AgentRankingDetailContent = lazy(
  () => import('./features/portal/AgentRankingDetailContent')
);
const ManagerRankingDetailContent = lazy(
  () => import('./features/portal/ManagerRankingDetailContent')
);
const ManagerOverviewDetailContent = lazy(
  () => import('./features/portal/ManagerOverviewDetailContent')
);
const ManagerPortalDashboardContent = lazy(
  () => import('./features/portal/ManagerPortalDashboardContent')
);
const AgentPortalDashboardContent = lazy(
  () => import('./features/portal/AgentPortalDashboardContent')
);
const WorkOrderManagementContent = lazy(
  () => import('./features/work-order/WorkOrderManagementContent')
);
const CourseListContent = lazy(
  () => import('./features/course-learning/CourseListContent')
);
const DirectorExpressModal = lazy(
  () => import('./features/portal/DirectorExpressModal')
);
const BusyAnnouncementContent = lazy(
  () => import('./features/system-settings/BusyAnnouncementContent')
);
const PrivacyStatementContent = lazy(
  () => import('./features/system-settings/PrivacyStatementContent')
);
const WebchatMaintenanceContent = lazy(
  () => import('./features/system-settings/WebchatMaintenanceContent')
);
const LegacyModulesPanel = lazy(
  () => import('./features/legacy/LegacyModulesPanel')
);

const historyTimeDropdownTabs = ['通话历史', '会话历史'] as const;
type HistoryTimeDropdownTab = (typeof historyTimeDropdownTabs)[number];
const historyDateRangeTabs = ['短信历史', '邮件历史'] as const;
type HistoryDateRangeTab = (typeof historyDateRangeTabs)[number];
type HistoryTimeSortOrder = 'asc' | 'desc';
type HistoryTimeDropdownState = {
  optionsByTab: Record<HistoryTimeDropdownTab, string[]>;
  orderByTab: Record<HistoryTimeDropdownTab, HistoryTimeSortOrder>;
  selectedByTab: Record<HistoryTimeDropdownTab, string>;
};

const formatHistoryDropdownTime = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const createHistoryTimeOptions = (
  baseTimeText: string,
  hourOffsets: readonly number[]
) =>
  hourOffsets.map((offset) => {
    const date = new Date(baseTimeText);
    date.setHours(date.getHours() + offset);
    return formatHistoryDropdownTime(date);
  });

const createHistoryTimeDropdownState = (): HistoryTimeDropdownState => {
  const callOptions = createHistoryTimeOptions('2025-03-18T09:00:00', [0, 4, 9, 15, 22]);
  const sessionOptions = createHistoryTimeOptions('2025-08-06T10:30:00', [0, 3, 8, 14, 21]);

  return {
    optionsByTab: {
      '通话历史': callOptions,
      '会话历史': sessionOptions,
    },
    orderByTab: {
      '通话历史': 'asc',
      '会话历史': 'asc',
    },
    selectedByTab: {
      '通话历史': '',
      '会话历史': '',
    },
  };
};

const toggleHistoryTimeDropdownSort = (
  state: HistoryTimeDropdownState,
  tab: HistoryTimeDropdownTab
): HistoryTimeDropdownState => {
  const nextOrder: HistoryTimeSortOrder = state.orderByTab[tab] === 'asc' ? 'desc' : 'asc';
  const sortedOptions = [...state.optionsByTab[tab]].sort((timeA, timeB) => timeA.localeCompare(timeB));
  const nextOptions = nextOrder === 'asc' ? sortedOptions : [...sortedOptions].reverse();

  return {
    optionsByTab: {
      ...state.optionsByTab,
      [tab]: nextOptions,
    },
    orderByTab: {
      ...state.orderByTab,
      [tab]: nextOrder,
    },
    selectedByTab: {
      ...state.selectedByTab,
      [tab]: nextOptions[0],
    },
  };
};

const callSummaryDataByTimeIndex: Array<{ fieldValues: WorkbenchFieldValues; text: string }> = [
  { fieldValues: { 产品分类: '学习机', 呼入类型: '咨询', 问题定型: '使用问题' }, text: '用户来电咨询学习机使用问题，已指导操作步骤。' },
  { fieldValues: { 产品分类: '智能硬件', 呼入类型: '投诉', 问题定型: '质量问题' }, text: '用户反馈智能硬件质量问题，已记录并转售后处理。' },
  { fieldValues: { 产品分类: '学习机', 呼入类型: '售后', 问题定型: '退换货' }, text: '用户申请退换货，已确认订单信息并提交申请。' },
  { fieldValues: { 产品分类: '智能硬件', 呼入类型: '咨询', 问题定型: '功能咨询' }, text: '用户咨询产品功能，已详细介绍并发送资料。' },
  { fieldValues: { 产品分类: '学习机', 呼入类型: '投诉', 问题定型: '服务态度' }, text: '用户投诉服务态度问题，已记录并安排主管回访。' },
];

type ErrorTabKey = 'critical' | 'non-critical';
type WorkbenchHistoryTab = '会话历史' | '通话历史' | '短信历史' | '邮件历史';
type WorkbenchSummaryTab = string;
type WorkbenchToolTab = '工单管理' | '知识库' | '常用工具' | '第三方网站';
type OnlineUtilityTab = '常用工具' | '第三方系统';
type OnlineSessionListTab = '活动会话' | '结束会话';
type CallRightPanel = 'agent' | 'workorder' | 'knowledge' | 'toolsite' | 'summary';
type CallSidebarFeatureKey = 'agent' | 'workorder' | 'knowledge' | 'toolsite' | 'summary' | 'settings';
type OnlineRightPanel = 'robot' | 'customer' | 'history' | 'third-party';
type OnlineSidebarFeatureKey =
  | 'robot'
  | 'customer'
  | 'history'
  | 'knowledge'
  | 'workorder'
  | 'third-party'
  | 'settings';
type OnlineThirdPartyScope = 'public' | 'personal';
type OnlineCallOverlay = 'audio' | 'video';
type OnlineMessageTranslateLanguage = 'zh' | 'en';
type OnlineFormFieldOption = '姓名' | '学校' | '学校省份' | '联系电话';
type OnlineUtilityItem = {
  label: string;
  note: string;
  icon?: IconComponent;
  imageSrc?: string;
  accent?: string;
  bg?: string;
};
type OnlineSession = {
  id: string;
  customer: string;
  channel: string;
  waiting: string;
  unread: number;
  summary: string;
  statusText: string;
  statusCls: string;
  listState: 'default' | 'current' | 'attention';
  finished: boolean;
};
type OnlineVisitorTag = {
  label: string;
  cls: string;
};
type OnlineConversationSummaryCard = {
  title: string;
  body: string;
  cls: string;
};
type OnlineConversationMessage = {
  id: string;
  role: 'customer' | 'agent';
  time: string;
  text: string;
  translation?: string;
  qualityCheckText?: string;
  withdrawn?: boolean;
};
type OnlineWithdrawNotice = {
  messageId: string;
  text: string;
};
type OnlineRobotInsightEntry = {
  id: string;
  content: string;
  duration: string;
  time: string;
};
type OnlineRobotCapabilityCard = {
  title: string;
  status: string;
  emphasized?: boolean;
};
type OnlineRobotPanel = {
  insights: OnlineRobotInsightEntry[];
  capabilities: OnlineRobotCapabilityCard[];
  topicTitle: string;
  steps: string[];
  resultTitle: string;
  suggestedReply: string;
};
type OnlineHistoryPanelMessage = {
  align: 'left' | 'right';
  text: string;
  badge?: string;
};
type OnlineHistoryPanelSection = {
  total: string;
  filterPlaceholder: string;
  details: Array<{ label: string; value: string }>;
  messages: OnlineHistoryPanelMessage[];
};
type OnlineToolItem = {
  label: string;
  imageSrc: string;
  note: string;
};
type OnlineThirdPartyLinkGroup = {
  group: string;
  items: string[];
};
type OnlineCustomerProfile = {
  anonymous: boolean;
  businessType: string;
  fieldValues: WorkbenchFieldValues;
};
type OnlineSessionCoreDetail = {
  visitorMeta: Array<{ label: string; value: string }>;
  tags: OnlineVisitorTag[];
  summaryCards: OnlineConversationSummaryCard[];
  messages: OnlineConversationMessage[];
};
type OnlineSessionRightPanelDetail = {
  robotPanel: OnlineRobotPanel;
  customerProfile: OnlineCustomerProfile;
  historyPanelMeta: Record<WorkbenchHistoryTab, OnlineHistoryPanelSection>;
  toolItems: OnlineToolItem[];
  thirdPartyLinks: Record<OnlineThirdPartyScope, OnlineThirdPartyLinkGroup[]>;
};
type OnlineSessionDetail = OnlineSessionCoreDetail & OnlineSessionRightPanelDetail;
type OnlineAgentPanelData = {
  insight: {
    indexLabel: string;
    content: string;
    primaryTime: string;
    secondaryTime: string;
  };
  quickCards: ReadonlyArray<{
    title: string;
    status: string;
    active?: boolean;
  }>;
  journeyName: string;
  profile: {
    name: string;
    phone: string;
    customerType: string;
    vipLevel: string;
    customerId: string;
    address: string;
    tag: string;
  };
  openTickets: ReadonlyArray<{
    id: string;
    title: string;
    time: string;
    status: string;
    tone: 'warning' | 'muted';
  }>;
  purchasedDeviceCount: number;
  interactionCount: number;
};
type AgentPresence = 'signed-in' | 'signed-out';
type ManagerPortalPage = 'dashboard' | 'overview-detail' | 'ranking-detail';
type AgentPortalPage = 'dashboard' | 'ranking-detail';
type WorkbenchFieldConfig = {
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'input' | 'select';
  span?: 1 | 2 | 3;
};

type WorkbenchFieldValues = Record<string, string>;
type RegionCityOption = {
  name: string;
  districts: readonly string[];
};
type RegionProvinceOption = {
  name: string;
  cities: readonly RegionCityOption[];
};
type CallWorkbenchInboundProfile = {
  inboundInfoItems: Array<{ label: string; value: string }>;
  tags: Array<{ label: string; cls: string }>;
  ivrPath: string;
  transferSummary: string;
  openingQuestion?: string;
  conversationMessages?: OnlineConversationMessage[];
  customerFieldValues: WorkbenchFieldValues;
};
type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;
type AgentPresenceMeta = {
  toolbarActionLabel: string;
  toolbarActionIcon: IconComponent;
  toolbarActionCls: string;
  sideActionLabel: string;
  sideActionIcon: IconComponent;
  sideActionButtonCls: string;
  sideActionIconWrapCls: string;
  showOnlineStatusSelector: boolean;
  statusText: string;
  statusCls: string;
  callDuration: string;
  statusDuration: string;
  incomingNumber: string;
  extensionNumber: string;
  agentNumber: string;
};

const secondaryMainTabs = [
  '消息服务',
  '排班信息展示',
  '业务字段管理',
  '业务字段上线审核',
  '工单管理',
  '学习课程',
  '繁忙公告管理',
  '隐私声明管理',
  '网聊维护',
  '录音查询',
  '范例录音查询',
  '范例录音审核',
  '短信收发查询',
  '邮件收发查询',
  '话务员监控',
  '队列监控',
  '网聊历史查询',
  '网聊留言管理',
  '网聊黑名单查询',
  '网聊黑名单审批',
  '小结管理',
  '预约回电管理',
] as const satisfies readonly SecondaryMainTab[];
const secondaryMainTabCloseLabels: Record<SecondaryMainTab, string> = {
  '消息服务': '关闭消息服务',
  '排班信息展示': '关闭排班信息展示',
  '业务字段管理': '关闭业务字段管理',
  '业务字段上线审核': '关闭业务字段上线审核',
  '工单管理': '关闭工单管理',
  '学习课程': '关闭学习课程',
  '繁忙公告管理': '关闭繁忙公告管理',
  '隐私声明管理': '关闭隐私声明管理',
  '网聊维护': '关闭网聊维护',
  '录音查询': '关闭录音查询',
  '范例录音查询': '关闭范例录音查询',
  '范例录音审核': '关闭范例录音审核',
  '短信收发查询': '关闭短信收发查询',
  '邮件收发查询': '关闭邮件收发查询',
  '话务员监控': '关闭话务员监控',
  '队列监控': '关闭队列监控',
  '网聊历史查询': '关闭网聊历史查询',
  '网聊留言管理': '关闭网聊留言管理',
  '网聊黑名单查询': '关闭网聊黑名单查询',
  '网聊黑名单审批': '关闭网聊黑名单审批',
  '小结管理': '关闭小结管理',
  '预约回电管理': '关闭预约回电管理',
};
const isSecondaryMainTab = (tab: MainTab): tab is SecondaryMainTab =>
  secondaryMainTabs.includes(tab as SecondaryMainTab);

const workbenchCustomerFields: WorkbenchFieldConfig[] = [
  { label: '业务类型', placeholder: '请选择', required: true, type: 'select' },
  { label: '客户类型', placeholder: '请选择', type: 'select' },
  { label: '来电号码', placeholder: '请输入', type: 'input' },
  { label: '省市区', placeholder: '请选择', type: 'select' },
  { label: '学校', placeholder: '请选择', type: 'select' },
  { label: '运营商', placeholder: '请选择', type: 'select' },
  { label: '客户名称', placeholder: '请输入', type: 'input' },
  { label: '联系号码', placeholder: '请输入', type: 'input' },
  { label: '学校标签', placeholder: '请输入', type: 'input' },
  { label: '服务归口', placeholder: '请输入', type: 'input' },
  { label: '是否审核', placeholder: '请选择', type: 'select' },
];

const workbenchSummaryFields: WorkbenchFieldConfig[] = [
  { label: '产品分类', placeholder: '请选择', required: true, type: 'select' },
  { label: '产品名称', placeholder: '请选择', type: 'select' },
  { label: '呼入类型', placeholder: '请选择', type: 'select' },
  { label: '问题定型', placeholder: '请选择', type: 'select' },
  { label: '问题分类一级', placeholder: '请选择', type: 'select' },
  { label: '问题分类二级', placeholder: '请选择', type: 'select' },
  { label: '问题分类三级', placeholder: '请选择', type: 'select' },
  { label: '小结类型', placeholder: '请选择', type: 'select' },
  { label: '处理结果状态', placeholder: '请选择', type: 'select' },
  { label: '账号', placeholder: '请输入', type: 'input' },
  { label: '投诉分类一级', placeholder: '请选择', type: 'select' },
  { label: '投诉分类二级', placeholder: '请选择', type: 'select' },
];

const workbenchToolItems: Record<WorkbenchToolTab, Array<{ label: string; icon?: IconComponent; imageSrc?: string; accent?: string; bg?: string }>> = {
  '工单管理': [
    { label: '工单新建', icon: FileText, accent: 'text-sky-500', bg: 'bg-sky-50' },
    { label: '待办工单', icon: BookOpen, accent: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: '升级工单', icon: ShieldCheck, accent: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '工单查询', icon: Search, accent: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: '回访计划', icon: Calendar, accent: 'text-violet-500', bg: 'bg-violet-50' },
    { label: '工单报表', icon: BarChart3, accent: 'text-orange-500', bg: 'bg-orange-50' },
  ],
  '知识库': [
    { label: '产品知识', icon: BookOpen, accent: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: '流程标准', icon: ShieldCheck, accent: 'text-sky-500', bg: 'bg-sky-50' },
    { label: '质检话术', icon: MessageSquare, accent: 'text-orange-500', bg: 'bg-orange-50' },
    { label: '公告制度', icon: Bell, accent: 'text-violet-500', bg: 'bg-violet-50' },
    { label: '培训考试', icon: GraduationCap, accent: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '业务FAQ', icon: HelpCircle, accent: 'text-indigo-500', bg: 'bg-indigo-50' },
  ],
  '常用工具': [
    { label: '短信', imageSrc: toolSmsIcon },
    { label: '附件查询', imageSrc: toolAttachmentIcon },
    { label: '邮箱', imageSrc: toolMailIcon },
    { label: '售后网点查询', imageSrc: toolServicePointIcon },
    { label: '售后维修价格', imageSrc: toolRepairPriceIcon },
    { label: '售后付款', imageSrc: toolPaymentIcon },
    { label: '家庭圈信息查询', imageSrc: toolAttachmentIcon },
  ],
  '第三方网站': [
    { label: 'CRM系统', icon: Monitor, accent: 'text-sky-500', bg: 'bg-sky-50' },
    { label: '物流平台', icon: ExternalLink, accent: 'text-orange-500', bg: 'bg-orange-50' },
    { label: '短信平台', icon: MessageSquare, accent: 'text-violet-500', bg: 'bg-violet-50' },
    { label: '支付中心', icon: Phone, accent: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: '外呼平台', icon: PhoneForwarded, accent: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: '邮件系统', icon: Mail, accent: 'text-rose-500', bg: 'bg-rose-50' },
  ],
};

const historyTabMeta: Record<WorkbenchHistoryTab, {
  total: string;
  filterPlaceholder: string;
  details: Array<{ label: string; value: string }>;
  messages: Array<{ align: 'left' | 'right'; text: string; badge?: string }>;
}> = {
  '会话历史': {
    total: '共12次，当前第1次',
    filterPlaceholder: '关键词',
    details: [
      { label: '渠道来源', value: '网页IM' },
      { label: '队列', value: 'A技能组' },
      { label: '浏览器类型', value: 'Chrome' },
      { label: '地址', value: '北京市海淀区' },
      { label: '持续时间', value: '10min' },
    ],
    messages: [
      { align: 'left', text: '您好，请问是人工客服吗' },
      { align: 'right', text: '您好，请稍等，我帮您确认一下' },
      { align: 'left', text: '那请问，可以介绍一下产品吗' },
    ]
  },
  '通话历史': {
    total: '共10次，当前第0次',
    filterPlaceholder: '关键词',
    details: [
      { label: '振铃时长', value: '10s' },
      { label: '电话归属', value: '北京海淀' },
      { label: '技能组', value: 'A技能组' },
      { label: '呼叫类型', value: '呼入' },
      { label: '坐席号码', value: '0101' },
      { label: '客户号码', value: '17601672305' },
    ],
    messages: [
      { align: 'left', text: '您好，请问是人工客服吗' },
      { align: 'right', text: '很抱歉，我不是' },
      { align: 'left', text: '那请问，可以介绍一下产品吗' },
    ]
  },
  '短信历史': {
    total: '共5次，当前第1次',
    filterPlaceholder: '短信关键词',
    details: [
      { label: '发送状态', value: '成功' },
      { label: '短信渠道', value: '营销短信' },
      { label: '短信模板', value: '售后通知' },
      { label: '短信类型', value: '单发' },
      { label: '发送账号', value: 'SMS01' },
      { label: '接收号码', value: '17601672305' },
    ],
    messages: [
      { align: 'right', text: '您好，您的工单已受理，请留意后续通知。', badge: '短信模板' },
      { align: 'left', text: '好的，麻烦尽快处理。' },
    ]
  },
  '邮件历史': {
    total: '共3次，当前第1次',
    filterPlaceholder: '邮件关键词',
    details: [
      { label: '邮件状态', value: '已送达' },
      { label: '邮件分类', value: '售后邮件' },
      { label: '邮件主题', value: '服务处理进展' },
      { label: '发送方式', value: '系统发送' },
      { label: '发件账号', value: 'service@iflytek.com' },
      { label: '收件账号', value: 'user@example.com' },
    ],
    messages: [
      { align: 'right', text: '您好，相关处理进展已通过邮件发送，请注意查收。', badge: '邮件摘要' },
      { align: 'left', text: '收到，谢谢。' },
    ]
  },
};

const liveTranscriptMessages = [
  { side: 'left' as const, text: '您好，请问是人工客服吗' },
  { side: 'right' as const, text: '很抱歉，我不是' },
  { side: 'left' as const, text: '那请问，可以介绍一下产品吗' },
  { side: 'right' as const, text: '请稍等，正在为您查询' },
];

const robotInsightEntries = [
  {
    id: '#1',
    content: '用户输入“hjkhkhlkhinh”为无意义字符，无法提取任何有效工单信息，由于是首次处理。',
    duration: '9.5s',
    time: '17:26:37',
  },
  {
    id: '#2',
    content: '首次建立工单小结，从用户消息中提取到：产品分类=翻译机，其余信息未提取到。',
    duration: '10.1s',
    time: '17:26:37',
  },
  {
    id: '#3',
    content: '用户咨询翻译机真伪查询，匹配到引导类技能 troubleshoot-translation。',
    duration: '10.1s',
    time: '17:26:37',
  },
];

const robotCapabilityCards = [
  { title: '用户旅程', status: '已加载' },
  { title: '工单小结', status: '已生成' },
  { title: '排障引导', status: '已生成', emphasized: true },
];

const robotTroubleshootingSteps = ['确认查询需求', '调用系统查询', '解读结果告知'];

const callAgentInsight = {
  indexLabel: '#1',
  content:
    '首次排查工单小结，从已知信息中提取到产品分类“学习机”，其余字段暂未提取到具体信息。',
  primaryTime: '17:15',
  secondaryTime: '16:59:49',
} as const;

const callAgentQuickCards = [
  { title: '用户旅程', status: '已加载', active: true },
  { title: '工单小结', status: '已生成' },
] as const;

const callAgentProfile = {
  name: 'Kevin张',
  phone: '138****8888',
  customerType: '个人客户',
  vipLevel: 'VIP等级',
  customerId: '20241113-003',
  address: '北京市朝阳区望京SOHO',
  tag: 'VIP客户',
} as const;

const callAgentOpenTickets = [
  {
    id: 'WK-20241102-12',
    title: '翻译机口译模式卡顿',
    time: '2024-11-02 09:05',
    status: '处理中',
    tone: 'warning' as const,
  },
  {
    id: 'WK-20241028-07',
    title: '学习机内容未更新',
    time: '2024-10-28 14:30',
    status: '待处理',
    tone: 'muted' as const,
  },
] as const;

const createOnlineAgentQuickCards = (summaryStatus: string = '已生成') => [
  { title: '用户旅程', status: '已加载', active: true },
  { title: '工单小结', status: summaryStatus },
];

const onlineAgentPanelDataBySession: Record<string, OnlineAgentPanelData> = {
  'sess-1': {
    insight: {
      indexLabel: '#1',
      content: '已识别到用户为学习机老客，近 30 天内两次咨询续航与电池健康问题，本次诉求为“充满电后使用 2 小时即掉电”。',
      primaryTime: '09:06:23',
      secondaryTime: '09:06:27',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: '移动端续航咨询',
    profile: {
      name: '李女士',
      phone: '13800008989',
      customerType: '老客',
      vipLevel: '学习机',
      customerId: '234234110',
      address: '北京市朝阳区',
      tag: '移动端老客',
    },
    openTickets: [
      {
        id: 'ON-001-01',
        title: '学习机续航异常排查',
        time: '2024-10-28 09:06',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-001-02',
        title: '电池健康度检测回访',
        time: '2024-10-28 09:12',
        status: '待跟进',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 1,
    interactionCount: 12,
  },
  'sess-2': {
    insight: {
      indexLabel: '#1',
      content: '机器人识别到本次诉求与“提现限额不足”相关，用户已尝试自助调整失败，需要人工补充规则解释。',
      primaryTime: '09:10:22',
      secondaryTime: '09:10:26',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: 'Web 提额咨询',
    profile: {
      name: '匿名访客',
      phone: '17600002305',
      customerType: 'VIP客户',
      vipLevel: '教育',
      customerId: 'WEB-12345',
      address: '北京市海淀区',
      tag: '提现提额',
    },
    openTickets: [
      {
        id: 'ON-002-01',
        title: '提现限额调整指引',
        time: '2024-10-28 09:10',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-002-02',
        title: '提额材料补充提醒',
        time: '2024-10-28 09:15',
        status: '待审核',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 0,
    interactionCount: 16,
  },
  'sess-3': {
    insight: {
      indexLabel: '#1',
      content: '用户来自快手直播间，重点关注活动价、赠品和免息分期，机器人已命中“直播活动咨询”场景。',
      primaryTime: '09:12:11',
      secondaryTime: '09:12:15',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: '快手直播成交线索',
    profile: {
      name: '赵先生',
      phone: '13900008993',
      customerType: '新客',
      vipLevel: '智能硬件',
      customerId: 'KS-1398993',
      address: '河北省石家庄市',
      tag: '直播新客',
    },
    openTickets: [
      {
        id: 'ON-003-01',
        title: '直播间活动政策说明',
        time: '2024-10-28 09:12',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-003-02',
        title: '赠品与分期方案跟进',
        time: '2024-10-28 09:13',
        status: '待跟进',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 0,
    interactionCount: 5,
  },
  'sess-4': {
    insight: {
      indexLabel: '#1',
      content: '用户主要关注学习机英语学习场景，当前问题集中在“离线使用”和“口语评测”两项能力。',
      primaryTime: '09:14:14',
      secondaryTime: '09:14:19',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: '英语学习场景推荐',
    profile: {
      name: '周女士',
      phone: '15800002999',
      customerType: '回访线索',
      vipLevel: '学习机',
      customerId: 'WEB-92999',
      address: '上海市浦东新区',
      tag: '售前回访',
    },
    openTickets: [
      {
        id: 'ON-004-01',
        title: '学习机英语场景推荐',
        time: '2024-10-28 09:14',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-004-02',
        title: '标准版与旗舰版对比发送',
        time: '2024-10-28 09:18',
        status: '待发送',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 0,
    interactionCount: 8,
  },
  'sess-5': {
    insight: {
      indexLabel: '#1',
      content: '用户来自企业微信小程序，重点关注客户资料沉淀、知识库协同和多角色权限管理。',
      primaryTime: '09:18:18',
      secondaryTime: '09:18:23',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: '企业协同方案咨询',
    profile: {
      name: '陈经理',
      phone: '18600000139',
      customerType: '企业客户',
      vipLevel: '教育',
      customerId: 'WX-ENT-0139',
      address: '广东省深圳市南山区',
      tag: '企业项目',
    },
    openTickets: [
      {
        id: 'ON-005-01',
        title: '客户管理协同方案说明',
        time: '2024-10-28 09:18',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-005-02',
        title: '演示预约与权限模板跟进',
        time: '2024-10-28 09:26',
        status: '待预约',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 2,
    interactionCount: 14,
  },
  'sess-6': {
    insight: {
      indexLabel: '#1',
      content: '用户围绕补发配件物流持续追问，当前核心问题是“补发件与主订单是否同包裹发出”。',
      primaryTime: '09:21:13',
      secondaryTime: '09:21:17',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: '售后物流跟单',
    profile: {
      name: '孙女士',
      phone: '17700000909',
      customerType: '售后老客',
      vipLevel: '智能硬件',
      customerId: 'WX-SVC-0909',
      address: '江苏省南京市鼓楼区',
      tag: '补发物流',
    },
    openTickets: [
      {
        id: 'ON-006-01',
        title: '补发配件物流跟进',
        time: '2024-10-28 09:21',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-006-02',
        title: '物流详情链接发送',
        time: '2024-10-28 09:25',
        status: '待发送',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 1,
    interactionCount: 11,
  },
  'sess-7': {
    insight: {
      indexLabel: '#1',
      content: '用户来自抖音直播回流，当前主要关注高配版价格差异和 7 天无理由退货规则。',
      primaryTime: '09:24:07',
      secondaryTime: '09:24:12',
    },
    quickCards: createOnlineAgentQuickCards(),
    journeyName: '抖音直播套餐咨询',
    profile: {
      name: '匿名访客',
      phone: '18500000909',
      customerType: '直播线索',
      vipLevel: '学习机',
      customerId: 'DY-0909',
      address: '浙江省杭州市西湖区',
      tag: '直播回流',
    },
    openTickets: [
      {
        id: 'ON-007-01',
        title: '抖音套餐差异说明',
        time: '2024-10-28 09:24',
        status: '处理中',
        tone: 'warning',
      },
      {
        id: 'ON-007-02',
        title: '退换货规则补充发送',
        time: '2024-10-28 09:27',
        status: '待发送',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 0,
    interactionCount: 9,
  },
  'sess-8': {
    insight: {
      indexLabel: '#1',
      content: '该会话已结束，当前保留的关键诉求为“退款状态查询”和“人工审核加急”。',
      primaryTime: '18:16:10',
      secondaryTime: '18:16:14',
    },
    quickCards: createOnlineAgentQuickCards('已归档'),
    journeyName: '退款审核回访',
    profile: {
      name: '匿名访客',
      phone: '13100000909',
      customerType: '退款客户',
      vipLevel: '学习机',
      customerId: 'END-909',
      address: '天津市南开区',
      tag: '退款审核',
    },
    openTickets: [
      {
        id: 'ON-008-01',
        title: '退款审核跟进建议',
        time: '2024-10-27 18:16',
        status: '审核中',
        tone: 'warning',
      },
      {
        id: 'ON-008-02',
        title: '银行卡尾号补充提醒',
        time: '2024-10-27 18:18',
        status: '待补资料',
        tone: 'muted',
      },
    ],
    purchasedDeviceCount: 1,
    interactionCount: 7,
  },
};

const onlineThirdPartyLinks: Record<OnlineThirdPartyScope, OnlineThirdPartyLinkGroup[]> = {
  public: [
    { group: '讯飞开放平台官网', items: ['AI能力体验中心', '讯飞智作官网', '讯飞文档官网'] },
    { group: '消费者事业群旗下子系统', items: ['讯飞语记', '录音文件助手', '讯飞翻译', '咪咕讯飞电子阅读器'] },
  ],
  personal: [
    { group: '个人常用', items: ['个人 CRM', '个人知识库', '个人工单中心'] },
    { group: '快捷入口', items: ['价格申请平台', '活动素材库'] },
  ],
};

const onlineCustomerFields: WorkbenchFieldConfig[] = [
  { label: '客户类型', placeholder: '请选择', required: true, type: 'select' },
  { label: '来电号码', placeholder: '请输入', type: 'input' },
  { label: '省市区', placeholder: '请选择', type: 'select' },
  { label: '学校', placeholder: '请选择', type: 'select' },
  { label: '运营商', placeholder: '请选择', type: 'select' },
  { label: '客户名称', placeholder: '请输入', type: 'input' },
  { label: '联系号码', placeholder: '请输入', type: 'input' },
  { label: '学校标签', placeholder: '请输入', type: 'input' },
  { label: '服务归口', placeholder: '请输入', type: 'input' },
  { label: '是否审核', placeholder: '请选择', type: 'select' },
];

const onlineUtilityItems: Record<OnlineUtilityTab, OnlineUtilityItem[]> = {
  '常用工具': [
    { label: '短信', imageSrc: toolSmsIcon, note: '消息发送' },
    { label: '附件查询', imageSrc: toolAttachmentIcon, note: '附件检索' },
    { label: '邮箱', imageSrc: toolMailIcon, note: '邮件发送' },
    { label: '售后网点查询', imageSrc: toolServicePointIcon, note: '附近网点' },
    { label: '售后维修价格', imageSrc: toolRepairPriceIcon, note: '维修参考' },
    { label: '售后付款', imageSrc: toolPaymentIcon, note: '补差处理' },
    { label: '学习机价格', imageSrc: toolRepairPriceIcon, note: '产品报价' },
    { label: '配件价格', imageSrc: toolRepairPriceIcon, note: '配件报价' },
    { label: '家庭圈信息查询', imageSrc: toolAttachmentIcon, note: '成员档案' },
  ],
  '第三方系统': [
    { label: 'CRM', icon: LayoutGrid, note: '客户信息', accent: 'text-sky-500', bg: 'bg-sky-50' },
    { label: '工单系统', icon: ExternalLink, note: '售后流转', accent: 'text-orange-500', bg: 'bg-orange-50' },
    { label: '物流系统', icon: Search, note: '订单查询', accent: 'text-violet-500', bg: 'bg-violet-50' },
    { label: '营销系统', icon: BarChart3, note: '活动配置', accent: 'text-emerald-500', bg: 'bg-emerald-50' },
  ],
};

const initialOnlineSessions: OnlineSession[] = [
  {
    id: 'sess-1',
    customer: 'APP访客138989',
    channel: 'APP',
    waiting: '11:09:29',
    unread: 0,
    summary: '那大概多久能修好？',
    statusText: '1m20s未回复',
    statusCls: 'text-[#ff8c4b]',
    listState: 'default',
    finished: false,
  },
  {
    id: 'sess-2',
    customer: 'PC访客12345',
    channel: 'PC',
    waiting: '11:09:29',
    unread: 0,
    summary: '您好，请问你是哪个位?',
    statusText: '',
    statusCls: 'text-slate-400',
    listState: 'current',
    finished: false,
  },
  {
    id: 'sess-3',
    customer: '微信公众号访客1398993',
    channel: '微信公众号',
    waiting: '11:09:29',
    unread: 0,
    summary: '清单发我吧，谢谢。',
    statusText: '',
    statusCls: 'text-slate-400',
    listState: 'default',
    finished: false,
  },
  {
    id: 'sess-4',
    customer: 'PC访客92999',
    channel: 'PC',
    waiting: '11:09:29',
    unread: 0,
    summary: '这个怎么样?',
    statusText: '1m20s未回复',
    statusCls: 'text-[#ff8c4b]',
    listState: 'default',
    finished: false,
  },
  {
    id: 'sess-5',
    customer: '微信小程序访客139',
    channel: '微信小程序',
    waiting: '11:09:29',
    unread: 0,
    summary: '这个客户管理的页面知识库服...',
    statusText: '',
    statusCls: 'text-slate-400',
    listState: 'attention',
    finished: false,
  },
  {
    id: 'sess-6',
    customer: '微信公众号访客909',
    channel: '微信公众号',
    waiting: '11:09:29',
    unread: 0,
    summary: '收到，那我等明天的物流。',
    statusText: '',
    statusCls: 'text-slate-400',
    listState: 'default',
    finished: false,
  },
  {
    id: 'sess-7',
    customer: 'APP访客909',
    channel: 'APP',
    waiting: '11:09:29',
    unread: 0,
    summary: '激活后退货规则也说一下。',
    statusText: '',
    statusCls: 'text-slate-400',
    listState: 'default',
    finished: false,
  },
  {
    id: 'sess-8',
    customer: '结束会话示例909',
    channel: 'PC',
    waiting: '昨天',
    unread: 0,
    summary: '退款状态查询，需转人工审核。',
    statusText: '已结束',
    statusCls: 'text-slate-400',
    listState: 'default',
    finished: true,
  },
];

const onlineSessionEntryCountLabels: Record<string, string> = {
  'sess-1': '2次进线',
  'sess-2': '首次进线',
  'sess-3': '首次进线',
  'sess-4': '3次进线',
  'sess-5': '2次进线',
  'sess-6': '3次进线',
  'sess-7': '首次进线',
  'sess-8': '2次进线',
};

const callWorkbenchInboundConversationMessages: OnlineConversationMessage[] = [
  { id: 'sess-3-m-1', role: 'customer', time: '10-28 09:12:08', text: '直播间这款翻译机现在多少钱？' },
  {
    id: 'sess-3-m-2',
    role: 'agent',
    time: '10-28 09:12:24',
    text: '当前活动到手价是 1999 元，我再帮您确认一下是否能叠加新人券。',
  },
  { id: 'sess-3-m-3', role: 'customer', time: '10-28 09:12:41', text: '能分期吗？还有赠品吗？' },
  {
    id: 'sess-3-m-4',
    role: 'agent',
    time: '10-28 09:13:06',
    text: '支持分期，赠品是保护套和耳机，具体我给您发一份活动清单。',
  },
];

const onlineKuaishouVisitorConversationMessages: OnlineConversationMessage[] = [
  { id: 'sess-3-m-1', role: 'customer', time: '10-28 09:12:08', text: '直播间这款翻译机现在多少钱？' },
  {
    id: 'sess-3-m-2',
    role: 'agent',
    time: '10-28 09:12:24',
    text: '当前活动到手价是 1999 元，我再帮您确认一下是否能叠加新人券。',
  },
  { id: 'sess-3-m-3', role: 'customer', time: '10-28 09:12:41', text: '能分期吗？还有赠品吗？' },
  {
    id: 'sess-3-m-4',
    role: 'agent',
    time: '10-28 09:13:06',
    text: '支持分期，赠品是保护套和耳机，具体我给您发一份活动清单。',
    qualityCheckText: '触发规则：引导推销',
  },
  { id: 'sess-3-m-5', role: 'customer', time: '10-28 09:13:24', text: '清单发我吧，谢谢。' },
];

const callWorkbenchInboundProfile: CallWorkbenchInboundProfile = {
  inboundInfoItems: [
    { label: '电话', value: '17601672305' },
    { label: '持续时间', value: '05:00' },
    { label: '技能组', value: '10' },
    { label: '电话归属', value: '北京海淀' },
    { label: '来电次数', value: '第20次' },
    { label: '运营商', value: '电信' },
  ],
  tags: [
    { label: '二次元', cls: 'border-emerald-200 bg-emerald-50 text-emerald-500' },
    { label: '00后', cls: 'border-orange-200 bg-orange-50 text-orange-500' },
    { label: '性格A', cls: 'border-blue-200 bg-blue-50 text-blue-500' },
    { label: 'VIP客户', cls: 'border-indigo-200 bg-indigo-50 text-indigo-500' },
    { label: '高净值', cls: 'border-amber-200 bg-amber-50 text-amber-500' },
    { label: '已婚', cls: 'border-sky-200 bg-sky-50 text-sky-500' },
    { label: '有房', cls: 'border-teal-200 bg-teal-50 text-teal-500' },
    { label: '对学习机有兴趣', cls: 'border-yellow-200 bg-yellow-50 text-yellow-600' },
  ],
  ivrPath:
    '用户本次发起会话，反馈账户进行提现操作时提示限额不足无法完成提现，希望调整账户提现限额对话中机器人已向用户推送自助调整限额的路径。',
  transferSummary:
    '用户本次发起会话，反馈账户进行提现操作时提示限额不足无法完成提现，希望调整账户提现限额对话中机器人已向用户推送自助调整限额的路径。',
  openingQuestion:
    '您好，我看到您之前反馈过提现限额的问题，请问是同一个账户吗？我帮您核实一下当前的限额设置和账户状态。',
  conversationMessages: callWorkbenchInboundConversationMessages,
  customerFieldValues: {
    业务类型: '学习机',
    客户类型: 'VIP客户',
    来电号码: '17601672305',
    省市区: '北京市 / 北京市 / 海淀区',
    学校: '科大附中',
    运营商: '电信',
    客户名称: '王同学',
    联系号码: '17601672305',
    学校标签: '对学习机有兴趣',
    服务归口: 'A技能组',
    是否审核: '是',
  },
};
const DEFAULT_TOP_HEADER_PRESENCE: AgentPresence = 'signed-out';
const DEFAULT_ONLINE_LEFT_PRESENCE: AgentPresence = 'signed-out';
const toggleAgentPresence = (presence: AgentPresence): AgentPresence =>
  presence === 'signed-in' ? 'signed-out' : 'signed-in';
const agentPresenceMetaMap: Record<AgentPresence, AgentPresenceMeta> = {
  'signed-in': {
    toolbarActionLabel: '签出',
    toolbarActionIcon: LogOut,
    toolbarActionCls: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    sideActionLabel: '签出',
    sideActionIcon: ArrowLeft,
    sideActionButtonCls:
      'bg-[linear-gradient(180deg,#ff9f21_0%,#ff8611_100%)] text-white shadow-[0_10px_18px_rgba(255,146,24,0.22)] hover:brightness-[0.98]',
    sideActionIconWrapCls: 'border-white/90 text-white',
    showOnlineStatusSelector: true,
    statusText: '已准备好',
    statusCls: 'text-emerald-500',
    callDuration: '0:00:00',
    statusDuration: '00:46',
    incomingNumber: '--- ---',
    extensionNumber: '878881001',
    agentNumber: '1001',
  },
  'signed-out': {
    toolbarActionLabel: '签入',
    toolbarActionIcon: LogIn,
    toolbarActionCls: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    sideActionLabel: '签入',
    sideActionIcon: ArrowRight,
    sideActionButtonCls:
      'bg-[linear-gradient(180deg,#12cfaf_0%,#09c39f_100%)] text-white shadow-[0_10px_18px_rgba(18,207,175,0.2)] hover:brightness-[0.98]',
    sideActionIconWrapCls: 'border-white/90 text-white',
    showOnlineStatusSelector: false,
    statusText: '未签入',
    statusCls: 'text-[#f59a23]',
    callDuration: '0:00:00',
    statusDuration: '00:19',
    incomingNumber: '--- ---',
    extensionNumber: '',
    agentNumber: '',
  },
};
const onlineVisitorTagClasses = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-500',
  orange: 'border-orange-200 bg-orange-50 text-orange-500',
  blue: 'border-blue-200 bg-blue-50 text-blue-500',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-500',
  amber: 'border-amber-200 bg-amber-50 text-amber-500',
  sky: 'border-sky-200 bg-sky-50 text-sky-500',
  teal: 'border-teal-200 bg-teal-50 text-teal-500',
  yellow: 'border-yellow-200 bg-yellow-50 text-yellow-600',
} as const;
const onlineConversationSummaryClasses = {
  history: 'border-l-[3px] border-l-[#7cd9cb] bg-[#f2fcf8]',
  transfer: 'border-l-[3px] border-l-[#f4b988] bg-[#fff7ee]',
  opener: 'border-l-[3px] border-l-[#d7e2ef] bg-[#f8fbff]',
} as const;
const onlineSessionBaseDetails: Record<string, OnlineSessionCoreDetail> = {
  'sess-1': {
    visitorMeta: [
      { label: 'IP', value: '10.23.12.10' },
      { label: '地址', value: '北京市朝阳区' },
      { label: '队列', value: '移动服务组' },
      { label: '浏览器类型', value: 'Safari' },
      { label: 'CustomerID', value: '234234110' },
    ],
    tags: [
      { label: '移动端老客', cls: onlineVisitorTagClasses.emerald },
      { label: '售后咨询', cls: onlineVisitorTagClasses.orange },
      { label: '续航敏感', cls: onlineVisitorTagClasses.blue },
      { label: '已购学习机', cls: onlineVisitorTagClasses.indigo },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户此前多次咨询学习机续航、配件更换以及以旧换新政策，已完成一次屏幕贴膜补发，最近一次咨询集中在电池使用时长。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '用户反馈移动端学习机充满电后连续使用约 2 小时即提示低电量，希望确认是否属于异常损耗以及是否支持售后检测。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，我先帮您确认一下设备型号和当前电池损耗情况，再一起看是正常衰减还是需要安排售后检测，可以吗？',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      { id: 'sess-1-m-1', role: 'customer', time: '10-28 09:06:12', text: '学习机最近掉电特别快，基本两个小时就没电了。' },
      { id: 'sess-1-m-2', role: 'agent', time: '10-28 09:06:29', text: '收到，我先帮您确认一下设备型号和近期充电习惯。' },
      { id: 'sess-1-m-3', role: 'customer', time: '10-28 09:07:01', text: '型号是T10，上周开始明显感觉不对。' },
      { id: 'sess-1-m-4', role: 'agent', time: '10-28 09:07:33', text: '好的，我这边建议先查看电池健康度，如果异常我可以继续为您安排售后检测。' },
      { id: 'sess-1-m-5', role: 'customer', time: '10-28 09:08:02', text: '那大概多久能修好？' },
    ],
  },
  'sess-2': {
    visitorMeta: [
      { label: 'IP', value: '10.23.12.0' },
      { label: '地址', value: '北京市海淀区' },
      { label: '队列', value: 'B组' },
      { label: '浏览器类型', value: 'Chrome' },
      { label: 'CustomerID', value: '234234134' },
    ],
    tags: [
      { label: '二次元', cls: onlineVisitorTagClasses.emerald },
      { label: '00后', cls: onlineVisitorTagClasses.orange },
      { label: '性格A', cls: onlineVisitorTagClasses.blue },
      { label: 'VIP客户', cls: onlineVisitorTagClasses.indigo },
      { label: '高净值', cls: onlineVisitorTagClasses.amber },
      { label: '已婚', cls: onlineVisitorTagClasses.sky },
      { label: '有车', cls: onlineVisitorTagClasses.teal },
      { label: '对学习机有兴趣', cls: onlineVisitorTagClasses.yellow },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户在此前多次会话中，曾咨询过账户提现规则、银行卡绑定流程以及交易限额调整等问题，前期客服已为用户讲解基础操作步骤并推送相关指引文档，用户暂行卡绑定问题已完成处理。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '用户本次发起会话，反馈账户进行提现操作时提示限额不足无法完成提现，希望调整账户提现限额或对话中机器人已向用户推送自动调整限额的路径。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，我已经详细查看了您之前的咨询记录以及本次的对话内容，了解到您是在进行账户提现时遇到限额不足的问题，而且没办法自己调整限额对吗？',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      {
        id: 'sess-2-m-1',
        role: 'customer',
        time: '10-28 09:10:20',
        text: 'I would like to inquire about the product capabilities',
        translation: '译文：我想咨询一下产品能力',
      },
      {
        id: 'sess-2-m-2',
        role: 'agent',
        time: '10-28 09:10:20',
        text: '很抱歉，我无法提供关于产品的详细信息。\n（此消息由AI生成）',
        withdrawn: true,
      },
      { id: 'sess-2-m-3', role: 'customer', time: '10-28 09:10:20', text: '您好，我想咨询一下产品能力，可以介绍一下吗？' },
      { id: 'sess-2-m-4', role: 'agent', time: '10-28 09:10:20', text: '可以的，没问题' },
    ],
  },
  'sess-3': {
    visitorMeta: [
      { label: 'IP', value: '10.23.22.16' },
      { label: '地址', value: '河北省石家庄市' },
      { label: '队列', value: '短视频渠道组' },
      { label: '浏览器类型', value: '快手小店' },
      { label: 'CustomerID', value: 'KS-1398993' },
    ],
    tags: [
      { label: '快手新客', cls: onlineVisitorTagClasses.orange },
      { label: '活动咨询', cls: onlineVisitorTagClasses.emerald },
      { label: '比价敏感', cls: onlineVisitorTagClasses.amber },
      { label: '未下单', cls: onlineVisitorTagClasses.blue },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户为首次咨询，来自快手直播间流量入口，重点关注活动价、赠品和是否支持 12 期免息。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '机器人已告知直播间基础优惠，用户进一步追问活动结束时间和是否可以叠加新人券，希望人工确认。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，我来帮您确认当前直播间的优惠政策，您主要想看活动截止时间还是叠加优惠规则呢？',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: onlineKuaishouVisitorConversationMessages,
  },
  'sess-4': {
    visitorMeta: [
      { label: 'IP', value: '10.23.18.26' },
      { label: '地址', value: '上海市浦东新区' },
      { label: '队列', value: 'Web售前组' },
      { label: '浏览器类型', value: 'Edge' },
      { label: 'CustomerID', value: '2342392999' },
    ],
    tags: [
      { label: '网站回访', cls: onlineVisitorTagClasses.emerald },
      { label: '功能对比', cls: onlineVisitorTagClasses.blue },
      { label: 'AI学习机意向', cls: onlineVisitorTagClasses.indigo },
      { label: '待回访', cls: onlineVisitorTagClasses.orange },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户上周浏览过学习机详情页和套餐对比页，曾短暂咨询过“标准版和旗舰版区别”，未完成留资。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '本次再次进入页面，用户询问拍照批改、英语口语评测以及是否支持离线资源下载，希望获取更直观的功能对比。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，我可以按“学习功能、硬件配置、适用年级”三个维度帮您对比，您更关注哪一块？',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      { id: 'sess-4-m-1', role: 'customer', time: '10-28 09:14:12', text: '这个怎么样？我主要给孩子学英语。' },
      { id: 'sess-4-m-2', role: 'agent', time: '10-28 09:14:31', text: '如果主要是英语学习，我建议您重点看口语评测和分级阅读资源。' },
      { id: 'sess-4-m-3', role: 'customer', time: '10-28 09:15:00', text: '离线的时候也能用吗？' },
      { id: 'sess-4-m-4', role: 'agent', time: '10-28 09:15:18', text: '支持离线下载部分课程内容，我可以给您发支持离线的功能清单。' },
    ],
  },
  'sess-5': {
    visitorMeta: [
      { label: 'IP', value: '10.23.31.45' },
      { label: '地址', value: '广东省深圳市' },
      { label: '队列', value: '小程序服务组' },
      { label: '浏览器类型', value: '微信小程序' },
      { label: 'CustomerID', value: 'WXAPP-139' },
    ],
    tags: [
      { label: '知识库命中', cls: onlineVisitorTagClasses.emerald },
      { label: '客户管理咨询', cls: onlineVisitorTagClasses.blue },
      { label: '企业用户', cls: onlineVisitorTagClasses.indigo },
      { label: '高意向', cls: onlineVisitorTagClasses.amber },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户来自企业微信小程序入口，曾查看“客户管理”“知识库服务”和“权限协同”相关页面，对 SaaS 方案有初步了解。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '机器人已推送客户管理页面知识库说明，用户想进一步确认是否支持多角色协同和表单化沉淀客户信息。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，您这边更关注客户资料沉淀、知识库协同，还是多角色权限配置？我可以先按场景给您介绍。',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      { id: 'sess-5-m-1', role: 'customer', time: '10-28 09:18:16', text: '这个客户管理的页面知识库服务是怎么配合使用的？' },
      { id: 'sess-5-m-2', role: 'agent', time: '10-28 09:18:40', text: '客户资料和知识库可以联动展示，坐席接待时会同步看到客户画像和推荐知识。' },
      { id: 'sess-5-m-3', role: 'customer', time: '10-28 09:19:12', text: '那不同岗位能看到的内容可以区分吗？' },
      { id: 'sess-5-m-4', role: 'agent', time: '10-28 09:19:36', text: '可以，系统支持按角色配置字段和知识库权限，我可以给您举个典型配置场景。' },
    ],
  },
  'sess-6': {
    visitorMeta: [
      { label: 'IP', value: '10.23.41.18' },
      { label: '地址', value: '江苏省南京市' },
      { label: '队列', value: '公众号服务组' },
      { label: '浏览器类型', value: '微信服务号' },
      { label: 'CustomerID', value: 'WXSVC-909' },
    ],
    tags: [
      { label: '公众号老客', cls: onlineVisitorTagClasses.sky },
      { label: '物流跟进', cls: onlineVisitorTagClasses.emerald },
      { label: '工单关联', cls: onlineVisitorTagClasses.orange },
      { label: '情绪稳定', cls: onlineVisitorTagClasses.teal },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户最近一周多次通过公众号查询订单物流，曾创建一条“补发配件”工单，目前处于仓储发货阶段。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '机器人已返回物流单号，用户继续追问预计送达时间，并希望确认补发件和主订单是否同包裹发出。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，我看您这边是在跟进补发配件的物流，我先帮您确认一下补发件和主订单的发货关系。',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      { id: 'sess-6-m-1', role: 'customer', time: '10-28 09:21:10', text: '这个怎么样？我的补发配件还没收到。' },
      { id: 'sess-6-m-2', role: 'agent', time: '10-28 09:21:31', text: '我这边看到补发件已经出库了，正在帮您确认是否与主订单分开发货。' },
      { id: 'sess-6-m-3', role: 'customer', time: '10-28 09:21:56', text: '大概什么时候能到？' },
      { id: 'sess-6-m-4', role: 'agent', time: '10-28 09:22:18', text: '预计明天下午前送达，我也可以把物流详情整理后发给您。' },
      { id: 'sess-6-m-5', role: 'customer', time: '10-28 09:22:45', text: '收到，那我等明天的物流。' },
    ],
  },
  'sess-7': {
    visitorMeta: [
      { label: 'IP', value: '10.23.52.07' },
      { label: '地址', value: '浙江省杭州市' },
      { label: '队列', value: '抖音电商组' },
      { label: '浏览器类型', value: '抖音小店' },
      { label: 'CustomerID', value: 'DY-909' },
    ],
    tags: [
      { label: '抖音线索', cls: onlineVisitorTagClasses.orange },
      { label: '价格咨询', cls: onlineVisitorTagClasses.amber },
      { label: '套餐对比', cls: onlineVisitorTagClasses.blue },
      { label: '直播回流', cls: onlineVisitorTagClasses.emerald },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户来自抖音直播回流流量，已浏览套餐详情页和用户评价页，重点关注高配版价格与售后年限。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '机器人已推送基础优惠信息，用户继续询问高配版和标准版差价来源，以及是否支持 7 天无理由退货。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，我可以先帮您对比两个套餐的配置差异，再补充退换货和售后规则，您看这样可以吗？',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      { id: 'sess-7-m-1', role: 'customer', time: '10-28 09:24:05', text: '这个怎么样？高配版贵了不少。' },
      { id: 'sess-7-m-2', role: 'agent', time: '10-28 09:24:20', text: '高配版主要多了更大的存储和 AI 伴学功能，我可以给您列一下差异。' },
      { id: 'sess-7-m-3', role: 'customer', time: '10-28 09:24:47', text: '如果孩子不适应可以退吗？' },
      { id: 'sess-7-m-4', role: 'agent', time: '10-28 09:25:10', text: '支持 7 天无理由退货，激活使用后的规则我也可以一并说明给您。' },
      { id: 'sess-7-m-5', role: 'customer', time: '10-28 09:25:38', text: '激活后退货规则也说一下。' },
    ],
  },
  'sess-8': {
    visitorMeta: [
      { label: 'IP', value: '10.23.67.90' },
      { label: '地址', value: '天津市南开区' },
      { label: '队列', value: '售后审核组' },
      { label: '浏览器类型', value: 'Chrome' },
      { label: 'CustomerID', value: 'END-909' },
    ],
    tags: [
      { label: '已结束会话', cls: onlineVisitorTagClasses.sky },
      { label: '退款审核', cls: onlineVisitorTagClasses.orange },
      { label: '工单挂起', cls: onlineVisitorTagClasses.indigo },
      { label: '待补资料', cls: onlineVisitorTagClasses.yellow },
    ],
    summaryCards: [
      {
        title: '历史会话纪要',
        body: '用户此前因订单退款进度缓慢发起过两次咨询，已提交退款申请和支付凭证，目前工单处于人工复核阶段。',
        cls: onlineConversationSummaryClasses.history,
      },
      {
        title: '本次转接纪要',
        body: '用户询问退款状态并希望人工加急审核，系统已记录诉求并提示需补充银行卡尾号信息。',
        cls: onlineConversationSummaryClasses.transfer,
      },
      {
        title: '开口问',
        body: '您好，本次会话已结束。如您还有补充信息，可以在下方留言，我们会在后续回访中继续跟进。',
        cls: onlineConversationSummaryClasses.opener,
      },
    ],
    messages: [
      { id: 'sess-8-m-1', role: 'customer', time: '10-27 18:16:08', text: '退款状态查询，需转人工审核。' },
      { id: 'sess-8-m-2', role: 'agent', time: '10-27 18:16:32', text: '您的申请已进入人工审核阶段，预计 1-2 个工作日完成。' },
      { id: 'sess-8-m-3', role: 'customer', time: '10-27 18:17:05', text: '如果还需要补资料，麻烦尽快联系我。' },
      { id: 'sess-8-m-4', role: 'agent', time: '10-27 18:17:26', text: '好的，本次会话先结束，后续若有补充资料需求会第一时间联系您。' },
    ],
  },
};

const createOnlineHistorySection = (
  total: string,
  filterPlaceholder: string,
  details: Array<{ label: string; value: string }>,
  messages: OnlineHistoryPanelMessage[]
): OnlineHistoryPanelSection => ({
  total,
  filterPlaceholder,
  details,
  messages,
});

const createOnlineToolItems = (items: Array<[string, string, string]>): OnlineToolItem[] =>
  items.map(([label, imageSrc, note]) => ({ label, imageSrc, note }));

const createOnlineThirdPartyLinks = (
  publicGroups: OnlineThirdPartyLinkGroup[],
  personalGroups: OnlineThirdPartyLinkGroup[]
): Record<OnlineThirdPartyScope, OnlineThirdPartyLinkGroup[]> => ({
  public: publicGroups,
  personal: personalGroups,
});

const onlineSessionRightPanelDetails: Record<string, OnlineSessionRightPanelDetail> = {
  'sess-1': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '已识别到用户为学习机老客，近 30 天内两次咨询续航与电池健康问题，本次诉求为“充满电后使用 2 小时即掉电”。',
          duration: '8.4s',
          time: '09:06:23',
        },
        {
          id: '#2',
          content: '机器人已关联设备型号 T10，并命中“续航异常排查”和“售后检测建议”两条服务策略。',
          duration: '9.1s',
          time: '09:06:25',
        },
        {
          id: '#3',
          content: '推荐先核对充放电习惯和电池健康度，再决定是否创建检测工单，避免直接误判为硬件故障。',
          duration: '9.6s',
          time: '09:06:27',
        },
      ],
      capabilities: [
        { title: '用户画像', status: '已加载' },
        { title: '健康度判断', status: '已生成', emphasized: true },
        { title: '售后建议', status: '已准备' },
      ],
      topicTitle: '学习机续航异常排查',
      steps: ['确认设备型号', '核对掉电表现', '给出售后检测建议'],
      resultTitle: '排查完成',
      suggestedReply: '从您描述看，当前更像是电池损耗偏快，我建议先做一次电池健康检测；如果检测结果异常，我可以继续为您安排售后。',
    },
    customerProfile: {
      anonymous: false,
      businessType: '学习机',
      fieldValues: {
        客户类型: '老客',
        来电号码: '13800008989',
        省市区: '北京市/北京市/朝阳区',
        学校: '朝阳外国语学校',
        运营商: '中国移动',
        客户名称: '李女士',
        联系号码: '13800008989',
        学校标签: '初中',
        服务归口: '移动服务组',
        是否审核: '已审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共12次，当前第3次',
        '会话关键词',
        [
          { label: '渠道来源', value: '移动端' },
          { label: '队列', value: '移动服务组' },
          { label: '浏览器类型', value: 'Safari' },
          { label: '地址', value: '北京市朝阳区' },
          { label: '持续时间', value: '7min' },
        ],
        [
          { align: 'left', text: '上次建议我先观察两天，现在还是掉电很快。' },
          { align: 'right', text: '明白，我这次帮您直接核对电池健康度和检测流程。' },
          { align: 'left', text: '如果需要寄修的话麻烦一起告诉我。' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共2次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '6s' },
          { label: '电话归属', value: '北京' },
          { label: '技能组', value: '售后服务组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0101' },
          { label: '客户号码', value: '13800008989' },
        ],
        [
          { align: 'left', text: '之前电话里说可以先看健康度。' },
          { align: 'right', text: '是的，如果低于阈值就建议安排检测。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共6次，当前2次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '服务短信' },
          { label: '短信模板', value: '续航检测说明' },
          { label: '发送账号', value: 'SMS-BJ-02' },
          { label: '接收号码', value: '138****8989' },
        ],
        [
          { align: 'right', text: '您好，电池健康度检测步骤已短信发送，请留意查收。', badge: '短信模板' },
          { align: 'left', text: '收到了，我先按步骤试一下。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共2次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '售后说明' },
          { label: '邮件主题', value: '学习机电池检测指南' },
          { label: '发送方式', value: '人工发送' },
          { label: '收件账号', value: 'li***@qq.com' },
        ],
        [
          { align: 'right', text: '已将检测指南和售后地址发到您邮箱。', badge: '邮件摘要' },
          { align: 'left', text: '好的，我晚点看一下。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['短信跟进', toolSmsIcon, '续航回访'],
      ['附件查询', toolAttachmentIcon, '检测报告'],
      ['邮箱', toolMailIcon, '发送说明'],
      ['售后网点查询', toolServicePointIcon, '附近网点'],
      ['售后维修价格', toolRepairPriceIcon, '维修参考'],
      ['售后付款', toolPaymentIcon, '补差处理'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '售后服务平台', items: ['售后工单中心', '设备检测服务台', '维修报价平台'] },
        { group: '设备中台', items: ['学习机设备档案', '配件库存平台', '寄修地址查询'] },
      ],
      [
        { group: '个人常用', items: ['我的检测工单', '我的回访任务', '我的售后知识收藏'] },
        { group: '快捷入口', items: ['电池健康度 SOP', '续航异常话术库'] },
      ]
    ),
  },
  'sess-2': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '机器人识别到本次诉求与“提现限额不足”相关，用户已尝试自助调整失败，需要人工补充规则解释。',
          duration: '8.9s',
          time: '09:10:22',
        },
        {
          id: '#2',
          content: '历史会话中用户已完成银行卡绑定，本次只需确认账户等级、近 7 日风险校验结果和可提升路径。',
          duration: '9.7s',
          time: '09:10:24',
        },
        {
          id: '#3',
          content: '推荐优先说明限额规则，再补充需要提交的材料，避免直接承诺即时提升额度。',
          duration: '10.0s',
          time: '09:10:26',
        },
      ],
      capabilities: [
        { title: '账户识别', status: '已加载' },
        { title: '限额规则', status: '已匹配', emphasized: true },
        { title: '提额路径', status: '已生成' },
      ],
      topicTitle: '提现限额调整指引',
      steps: ['确认账户等级', '核对提额条件', '说明处理时效'],
      resultTitle: '方案已生成',
      suggestedReply: '我先帮您核对账户当前等级和风险校验状态，如果满足条件，可以通过补充材料申请提升提现限额，我这边给您说一下具体路径。',
    },
    customerProfile: {
      anonymous: true,
      businessType: '教育',
      fieldValues: {
        客户类型: 'VIP客户',
        来电号码: '17600002305',
        省市区: '北京市/北京市/海淀区',
        学校: '北京理工附中',
        运营商: '中国联通',
        客户名称: '王先生',
        联系号码: '17600002305',
        学校标签: '高校家庭',
        服务归口: 'Web金融咨询组',
        是否审核: '待审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共100次，当前第9次',
        '会话关键词',
        [
          { label: '渠道来源', value: 'Web端' },
          { label: '队列', value: 'B技能组' },
          { label: '浏览器类型', value: 'Chrome' },
          { label: '地址', value: '北京市海淀区' },
          { label: '持续时间', value: '5min' },
        ],
        [
          { align: 'left', text: '提现的时候提示限额不足，自己调不了。' },
          { align: 'right', text: '我先帮您核对当前账户等级和提额条件。' },
          { align: 'left', text: '好的，麻烦你了。' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共16次，当前第2次',
        '通话关键词',
        [
          { label: '振铃时长', value: '8s' },
          { label: '电话归属', value: '北京市海淀区' },
          { label: '技能组', value: 'B技能组' },
          { label: '呼叫类型', value: '呼入' },
          { label: '坐席号码', value: '0102' },
          { label: '客户号码', value: '17600002305' },
        ],
        [
          { align: 'left', text: '我之前打过电话问提额条件。' },
          { align: 'right', text: '账户等级达标后可以走人工审核。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共24次，当前4次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '系统短信' },
          { label: '短信模板', value: '提现限额通知' },
          { label: '发送账号', value: 'SMS-WEB-01' },
          { label: '接收号码', value: '176****2305' },
        ],
        [
          { align: 'right', text: '您好，账户提额说明已短信发送，请注意查收。', badge: '短信模板' },
          { align: 'left', text: '收到了，我先看一下。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共3次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '规则邮件' },
          { label: '邮件主题', value: '提现限额调整说明' },
          { label: '发送方式', value: '系统发送' },
          { label: '收件账号', value: 'wang***@163.com' },
        ],
        [
          { align: 'right', text: '提额所需材料清单已发送到您的邮箱。', badge: '邮件摘要' },
          { align: 'left', text: '好的，我补齐后再申请。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['短信验证', toolSmsIcon, '限额通知'],
      ['资料附件', toolAttachmentIcon, '材料核验'],
      ['规则邮件', toolMailIcon, '发送说明'],
      ['额度查询', toolServicePointIcon, '额度校验'],
      ['银行卡校验', toolRepairPriceIcon, '绑定核验'],
      ['提现处理', toolPaymentIcon, '申请提额'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '账户中心', items: ['提现限额管理台', '账户等级中心', '银行卡校验平台'] },
        { group: '风控系统', items: ['风控规则台', '异常交易核验', '提额审批后台'] },
      ],
      [
        { group: '个人常用', items: ['我的限额审批', '我的资产客户', '我的风控备忘'] },
        { group: '快捷入口', items: ['提额规则说明', '银行卡校验 FAQ'] },
      ]
    ),
  },
  'sess-3': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '用户来自快手直播间，重点关注活动价、赠品和免息分期，机器人已命中“直播活动咨询”场景。',
          duration: '8.1s',
          time: '09:12:11',
        },
        {
          id: '#2',
          content: '会话中已追问活动截止时间和新人券叠加规则，建议优先说明价格有效期和券使用门槛。',
          duration: '8.7s',
          time: '09:12:13',
        },
        {
          id: '#3',
          content: '可补充赠品清单与分期方案，提高成交转化率。',
          duration: '9.2s',
          time: '09:12:15',
        },
      ],
      capabilities: [
        { title: '活动识别', status: '已命中' },
        { title: '优惠规则', status: '已生成', emphasized: true },
        { title: '成交建议', status: '已准备' },
      ],
      topicTitle: '直播间活动政策说明',
      steps: ['确认活动时效', '说明叠券规则', '补充赠品与分期'],
      resultTitle: '说明已生成',
      suggestedReply: '当前直播间活动价和赠品都还有效，我可以把截止时间、叠加新人券的条件以及分期方案一起给您说明清楚。',
    },
    customerProfile: {
      anonymous: false,
      businessType: '智能硬件',
      fieldValues: {
        客户类型: '新客',
        来电号码: '13900008993',
        省市区: '河北省/石家庄市/长安区',
        学校: '石家庄四十二中',
        运营商: '中国电信',
        客户名称: '赵先生',
        联系号码: '13900008993',
        学校标签: '初中',
        服务归口: '短视频渠道组',
        是否审核: '未审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共5次，当前第2次',
        '会话关键词',
        [
          { label: '渠道来源', value: '快手直播间' },
          { label: '队列', value: '短视频渠道组' },
          { label: '浏览器类型', value: '快手小店' },
          { label: '地址', value: '河北省石家庄市' },
          { label: '持续时间', value: '4min' },
        ],
        [
          { align: 'left', text: '这款翻译机直播间活动到什么时候结束？' },
          { align: 'right', text: '我帮您确认一下活动时效和叠券规则。' },
          { align: 'left', text: '那赠品和分期也一起说下。' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共1次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '5s' },
          { label: '电话归属', value: '河北石家庄' },
          { label: '技能组', value: '直播成交组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0103' },
          { label: '客户号码', value: '13900008993' },
        ],
        [
          { align: 'left', text: '我想知道分期有没有手续费。' },
          { align: 'right', text: '当前 12 期免息，不额外收取手续费。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共3次，当前1次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '活动短信' },
          { label: '短信模板', value: '直播优惠说明' },
          { label: '发送账号', value: 'SMS-LIVE-02' },
          { label: '接收号码', value: '139****8993' },
        ],
        [
          { align: 'right', text: '直播间活动说明和赠品清单已短信发送。', badge: '短信模板' },
          { align: 'left', text: '好的，我和家里人商量一下。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共1次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '报价邮件' },
          { label: '邮件主题', value: '翻译机直播活动清单' },
          { label: '发送方式', value: '人工发送' },
          { label: '收件账号', value: 'zhao***@qq.com' },
        ],
        [
          { align: 'right', text: '活动价、赠品和分期表已发送邮箱。', badge: '邮件摘要' },
          { align: 'left', text: '收到了，谢谢。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['活动短信', toolSmsIcon, '优惠说明'],
      ['赠品清单', toolAttachmentIcon, '附件发送'],
      ['报价邮件', toolMailIcon, '活动价单'],
      ['门店查询', toolServicePointIcon, '体验门店'],
      ['价格政策', toolRepairPriceIcon, '优惠核算'],
      ['支付链接', toolPaymentIcon, '下单支付'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '直播营销台', items: ['快手活动后台', '直播商品中心', '优惠券叠加规则库'] },
        { group: '成交支持', items: ['赠品库存平台', '价格审批系统', '分期政策台'] },
      ],
      [
        { group: '个人常用', items: ['我的活动日历', '我的直播线索', '我的成交脚本'] },
        { group: '快捷入口', items: ['新人券说明', '直播成交 FAQ'] },
      ]
    ),
  },
  'sess-4': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '用户主要关注学习机英语学习场景，当前问题集中在“离线使用”和“口语评测”两项能力。',
          duration: '8.6s',
          time: '09:14:14',
        },
        {
          id: '#2',
          content: '系统已关联用户曾浏览套餐对比页，可优先使用“标准版/旗舰版差异说明”模板。',
          duration: '9.0s',
          time: '09:14:16',
        },
        {
          id: '#3',
          content: '建议先讲适用年级和英语资源，再补充离线资源下载范围，避免信息过载。',
          duration: '9.8s',
          time: '09:14:19',
        },
      ],
      capabilities: [
        { title: '需求识别', status: '已完成' },
        { title: '套餐对比', status: '已生成', emphasized: true },
        { title: '功能推荐', status: '已准备' },
      ],
      topicTitle: '学习机英语场景推荐',
      steps: ['识别学习诉求', '对比核心功能', '补充离线资源说明'],
      resultTitle: '推荐已生成',
      suggestedReply: '如果您主要是给孩子学英语，我建议重点看口语评测、分级阅读和拍照批改；关于离线使用，我也可以把支持下载的资源范围一并发您。',
    },
    customerProfile: {
      anonymous: false,
      businessType: '学习机',
      fieldValues: {
        客户类型: '回访线索',
        来电号码: '15800002999',
        省市区: '上海市/上海市/浦东新区',
        学校: '浦东新区实验学校',
        运营商: '中国移动',
        客户名称: '周女士',
        联系号码: '15800002999',
        学校标签: '小学',
        服务归口: 'Web售前组',
        是否审核: '已审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共8次，当前第2次',
        '会话关键词',
        [
          { label: '渠道来源', value: '官网咨询' },
          { label: '队列', value: 'Web售前组' },
          { label: '浏览器类型', value: 'Edge' },
          { label: '地址', value: '上海市浦东新区' },
          { label: '持续时间', value: '6min' },
        ],
        [
          { align: 'left', text: '孩子主要学英语，这个型号适合吗？' },
          { align: 'right', text: '适合的，我先给您对比英语相关功能。' },
          { align: 'left', text: '离线的时候还能不能用？' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共2次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '7s' },
          { label: '电话归属', value: '上海' },
          { label: '技能组', value: '售前组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0104' },
          { label: '客户号码', value: '15800002999' },
        ],
        [
          { align: 'left', text: '能否发我一个标准版和旗舰版对比？' },
          { align: 'right', text: '可以，我整理好后发您。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共4次，当前1次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '咨询短信' },
          { label: '短信模板', value: '功能清单' },
          { label: '发送账号', value: 'SMS-WEB-03' },
          { label: '接收号码', value: '158****2999' },
        ],
        [
          { align: 'right', text: '学习机英语功能清单已短信发送。', badge: '短信模板' },
          { align: 'left', text: '好的，我先了解一下。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共2次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '售前资料' },
          { label: '邮件主题', value: '学习机套餐对比表' },
          { label: '发送方式', value: '人工发送' },
          { label: '收件账号', value: 'zhou***@126.com' },
        ],
        [
          { align: 'right', text: '标准版和旗舰版对比表已发送。', badge: '邮件摘要' },
          { align: 'left', text: '看到了，这个很清楚。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['资料短信', toolSmsIcon, '功能说明'],
      ['功能清单', toolAttachmentIcon, '能力清单'],
      ['对比邮件', toolMailIcon, '套餐对比'],
      ['体验门店', toolServicePointIcon, '门店查询'],
      ['套餐价格', toolRepairPriceIcon, '报价说明'],
      ['支付链接', toolPaymentIcon, '下单引导'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '产品资料中心', items: ['学习机功能库', '套餐对比平台', '英语资源演示站'] },
        { group: '售前支持', items: ['体验门店地图', '优惠政策中心', '离线资源清单'] },
      ],
      [
        { group: '个人常用', items: ['我的演示资料', '我的潜客清单', '我的回访记录'] },
        { group: '快捷入口', items: ['英语场景话术', '学习机配置 FAQ'] },
      ]
    ),
  },
  'sess-5': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '用户来自企业微信小程序，重点关注客户资料沉淀、知识库协同和多角色权限管理。',
          duration: '8.8s',
          time: '09:18:18',
        },
        {
          id: '#2',
          content: '机器人已推送客户管理页面说明，本轮建议补充“字段权限”和“协同流程”两个关键场景。',
          duration: '9.4s',
          time: '09:18:20',
        },
        {
          id: '#3',
          content: '用户为企业线索，推荐进一步引导到方案介绍和演示预约。',
          duration: '10.2s',
          time: '09:18:23',
        },
      ],
      capabilities: [
        { title: '企业画像', status: '已识别' },
        { title: '协同方案', status: '已生成', emphasized: true },
        { title: '演示建议', status: '已准备' },
      ],
      topicTitle: '客户管理协同方案说明',
      steps: ['识别企业场景', '说明权限分层', '引导方案演示'],
      resultTitle: '方案已完成',
      suggestedReply: '系统支持按角色配置客户字段、知识库可见范围和协同流程，我可以结合您当前团队分工给您举一个典型配置场景。',
    },
    customerProfile: {
      anonymous: false,
      businessType: '教育',
      fieldValues: {
        客户类型: '企业客户',
        来电号码: '18600000139',
        省市区: '广东省/深圳市/南山区',
        学校: '深圳南山实验学校',
        运营商: '中国移动',
        客户名称: '陈经理',
        联系号码: '18600000139',
        学校标签: '企业项目',
        服务归口: '小程序服务组',
        是否审核: '已审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共14次，当前第4次',
        '会话关键词',
        [
          { label: '渠道来源', value: '企业微信小程序' },
          { label: '队列', value: '小程序服务组' },
          { label: '浏览器类型', value: '微信小程序' },
          { label: '地址', value: '广东省深圳市' },
          { label: '持续时间', value: '9min' },
        ],
        [
          { align: 'left', text: '客户管理和知识库服务怎么配合使用？' },
          { align: 'right', text: '可以联动展示客户画像和推荐知识。' },
          { align: 'left', text: '不同岗位能看到不同内容吗？' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共3次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '4s' },
          { label: '电话归属', value: '深圳' },
          { label: '技能组', value: '企业解决方案组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0105' },
          { label: '客户号码', value: '18600000139' },
        ],
        [
          { align: 'left', text: '我们想让客服和销售看到不同字段。' },
          { align: 'right', text: '支持字段级权限和角色维度配置。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共4次，当前1次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '商务短信' },
          { label: '短信模板', value: '演示预约提醒' },
          { label: '发送账号', value: 'SMS-BIZ-01' },
          { label: '接收号码', value: '186****0139' },
        ],
        [
          { align: 'right', text: '方案演示预约链接已短信发送。', badge: '短信模板' },
          { align: 'left', text: '好的，我转给同事一起看。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共5次，当前2次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '解决方案' },
          { label: '邮件主题', value: '客户管理协同方案介绍' },
          { label: '发送方式', value: '人工发送' },
          { label: '收件账号', value: 'chen***@company.com' },
        ],
        [
          { align: 'right', text: '企业协同方案和权限配置示意图已邮件发送。', badge: '邮件摘要' },
          { align: 'left', text: '这个材料很有帮助。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['会议短信', toolSmsIcon, '预约提醒'],
      ['方案附件', toolAttachmentIcon, '方案文档'],
      ['方案邮件', toolMailIcon, '邮件跟进'],
      ['区域顾问', toolServicePointIcon, '顾问查询'],
      ['报价方案', toolRepairPriceIcon, '商务报价'],
      ['合同付款', toolPaymentIcon, '回款处理'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '客户协同平台', items: ['客户资料中台', '角色权限后台', '流程编排中心'] },
        { group: '知识库后台', items: ['企业知识库管理', '知识推荐策略', '演示预约系统'] },
      ],
      [
        { group: '个人常用', items: ['我的企业方案', '我的权限模板', '我的演示排期'] },
        { group: '快捷入口', items: ['SaaS 协同话术', '企业方案案例库'] },
      ]
    ),
  },
  'sess-6': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '用户围绕补发配件物流持续追问，当前核心问题是“补发件与主订单是否同包裹发出”。',
          duration: '8.3s',
          time: '09:21:13',
        },
        {
          id: '#2',
          content: '系统已返回物流单号和预计送达时间，建议同步说明补发流程和分开发货原因。',
          duration: '8.9s',
          time: '09:21:15',
        },
        {
          id: '#3',
          content: '可补充物流详情链接，减少后续重复咨询。',
          duration: '9.4s',
          time: '09:21:17',
        },
      ],
      capabilities: [
        { title: '物流识别', status: '已加载' },
        { title: '补发关系', status: '已确认', emphasized: true },
        { title: '跟单建议', status: '已准备' },
      ],
      topicTitle: '补发配件物流跟进',
      steps: ['核对物流单号', '确认发货关系', '同步预计送达时间'],
      resultTitle: '物流已确认',
      suggestedReply: '补发配件已经单独出库，和主订单不是同一包裹，预计明天下午前送达；我也可以把物流详情链接直接发给您。',
    },
    customerProfile: {
      anonymous: false,
      businessType: '智能硬件',
      fieldValues: {
        客户类型: '售后老客',
        来电号码: '17700000909',
        省市区: '江苏省/南京市/鼓楼区',
        学校: '南京师范附属中学',
        运营商: '中国联通',
        客户名称: '孙女士',
        联系号码: '17700000909',
        学校标签: '高中',
        服务归口: '公众号服务组',
        是否审核: '已审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共11次，当前第3次',
        '会话关键词',
        [
          { label: '渠道来源', value: '微信服务号' },
          { label: '队列', value: '公众号服务组' },
          { label: '浏览器类型', value: '微信服务号' },
          { label: '地址', value: '江苏省南京市' },
          { label: '持续时间', value: '5min' },
        ],
        [
          { align: 'left', text: '补发配件还没收到，是不是和主订单分开寄了？' },
          { align: 'right', text: '我正在帮您核实发货关系和预计送达时间。' },
          { align: 'left', text: '好，麻烦尽快告诉我。' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共2次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '5s' },
          { label: '电话归属', value: '南京' },
          { label: '技能组', value: '售后物流组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0106' },
          { label: '客户号码', value: '17700000909' },
        ],
        [
          { align: 'left', text: '补发件什么时候能到？' },
          { align: 'right', text: '预计明天下午前送达。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共7次，当前2次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '物流短信' },
          { label: '短信模板', value: '补发物流提醒' },
          { label: '发送账号', value: 'SMS-SVC-04' },
          { label: '接收号码', value: '177****0909' },
        ],
        [
          { align: 'right', text: '补发件物流信息已短信同步，请留意查收。', badge: '短信模板' },
          { align: 'left', text: '收到了，我再等等。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共2次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '物流说明' },
          { label: '邮件主题', value: '补发配件物流详情' },
          { label: '发送方式', value: '系统发送' },
          { label: '收件账号', value: 'sun***@qq.com' },
        ],
        [
          { align: 'right', text: '补发配件物流详情已发到您的邮箱。', badge: '邮件摘要' },
          { align: 'left', text: '好的，我看到了。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['物流短信', toolSmsIcon, '状态提醒'],
      ['附件查询', toolAttachmentIcon, '物流附件'],
      ['物流邮件', toolMailIcon, '详情发送'],
      ['售后网点查询', toolServicePointIcon, '网点定位'],
      ['补发价格', toolRepairPriceIcon, '差价说明'],
      ['补款处理', toolPaymentIcon, '补发付款'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '物流查询中心', items: ['物流轨迹平台', '补发工单台', '仓储发货中心'] },
        { group: '售后服务台', items: ['补发政策说明', '配件库存查询', '售后网点地图'] },
      ],
      [
        { group: '个人常用', items: ['我的物流跟单', '我的补发工单', '我的配件知识'] },
        { group: '快捷入口', items: ['物流异常话术', '补发流程 FAQ'] },
      ]
    ),
  },
  'sess-7': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '用户来自抖音直播回流，当前主要关注高配版价格差异和 7 天无理由退货规则。',
          duration: '8.0s',
          time: '09:24:07',
        },
        {
          id: '#2',
          content: '可优先讲清高配版新增的 AI 伴学和存储容量，再补充激活后的退换货规则。',
          duration: '8.6s',
          time: '09:24:09',
        },
        {
          id: '#3',
          content: '建议同步发一份套餐差异表，方便用户转发给家长决策。',
          duration: '9.3s',
          time: '09:24:12',
        },
      ],
      capabilities: [
        { title: '套餐识别', status: '已完成' },
        { title: '差异说明', status: '已生成', emphasized: true },
        { title: '退换规则', status: '已准备' },
      ],
      topicTitle: '抖音套餐差异说明',
      steps: ['说明配置差异', '补充价格原因', '解释退换规则'],
      resultTitle: '说明已完成',
      suggestedReply: '高配版主要多了更大的存储和 AI 伴学能力，所以价格会高一些；关于退换货，未激活支持 7 天无理由，我也可以把完整规则发给您。',
    },
    customerProfile: {
      anonymous: true,
      businessType: '学习机',
      fieldValues: {
        客户类型: '直播线索',
        来电号码: '18500000909',
        省市区: '浙江省/杭州市/西湖区',
        学校: '杭州学军小学',
        运营商: '中国移动',
        客户名称: '吴女士',
        联系号码: '18500000909',
        学校标签: '小学',
        服务归口: '抖音电商组',
        是否审核: '待审核',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共9次，当前第3次',
        '会话关键词',
        [
          { label: '渠道来源', value: '抖音直播回流' },
          { label: '队列', value: '抖音电商组' },
          { label: '浏览器类型', value: '抖音小店' },
          { label: '地址', value: '浙江省杭州市' },
          { label: '持续时间', value: '4min' },
        ],
        [
          { align: 'left', text: '高配版为什么贵这么多？' },
          { align: 'right', text: '我给您拆开讲一下配置差异。' },
          { align: 'left', text: '那用了之后不合适还能退吗？' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共2次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '6s' },
          { label: '电话归属', value: '杭州' },
          { label: '技能组', value: '直播成交组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0107' },
          { label: '客户号码', value: '18500000909' },
        ],
        [
          { align: 'left', text: '孩子不适应的话可以退吗？' },
          { align: 'right', text: '未激活支持 7 天无理由。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共5次，当前1次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '活动短信' },
          { label: '短信模板', value: '套餐差异说明' },
          { label: '发送账号', value: 'SMS-DY-01' },
          { label: '接收号码', value: '185****0909' },
        ],
        [
          { align: 'right', text: '高配版和标准版差异说明已短信发送。', badge: '短信模板' },
          { align: 'left', text: '好的，我给家里人看看。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共2次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '套餐资料' },
          { label: '邮件主题', value: '抖音直播套餐差异表' },
          { label: '发送方式', value: '人工发送' },
          { label: '收件账号', value: 'wu***@foxmail.com' },
        ],
        [
          { align: 'right', text: '套餐差异表和退换货规则已邮件发送。', badge: '邮件摘要' },
          { align: 'left', text: '资料很清楚，谢谢。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['活动短信', toolSmsIcon, '优惠通知'],
      ['套餐对比', toolAttachmentIcon, '差异表'],
      ['优惠邮件', toolMailIcon, '规则发送'],
      ['门店查询', toolServicePointIcon, '体验点位'],
      ['价格政策', toolRepairPriceIcon, '报价规则'],
      ['下单付款', toolPaymentIcon, '支付处理'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '抖音商城后台', items: ['抖店商品中心', '直播营销后台', '退换货规则台'] },
        { group: '成交支持', items: ['套餐差异表中心', '优惠配置平台', '订单查询系统'] },
      ],
      [
        { group: '个人常用', items: ['我的直播复盘', '我的优惠配置', '我的成交线索'] },
        { group: '快捷入口', items: ['抖音成交话术', '退换货 FAQ'] },
      ]
    ),
  },
  'sess-8': {
    robotPanel: {
      insights: [
        {
          id: '#1',
          content: '该会话已结束，当前保留的关键诉求为“退款状态查询”和“人工审核加急”。',
          duration: '7.9s',
          time: '18:16:10',
        },
        {
          id: '#2',
          content: '历史记录显示用户已提交退款申请和支付凭证，仍缺少银行卡尾号信息。',
          duration: '8.5s',
          time: '18:16:12',
        },
        {
          id: '#3',
          content: '建议后续回访时优先补齐资料，再同步审核时效。',
          duration: '9.1s',
          time: '18:16:14',
        },
      ],
      capabilities: [
        { title: '退款状态', status: '已归档' },
        { title: '资料缺口', status: '已识别', emphasized: true },
        { title: '回访建议', status: '已准备' },
      ],
      topicTitle: '退款审核跟进建议',
      steps: ['确认审核状态', '补充尾号信息', '安排后续回访'],
      resultTitle: '建议已归档',
      suggestedReply: '当前退款申请仍在人工审核中，后续跟进时建议先补充银行卡尾号信息，这样可以缩短审核确认时间。',
    },
    customerProfile: {
      anonymous: true,
      businessType: '学习机',
      fieldValues: {
        客户类型: '退款客户',
        来电号码: '13100000909',
        省市区: '天津市/天津市/南开区',
        学校: '天津南开中学',
        运营商: '中国联通',
        客户名称: '刘先生',
        联系号码: '13100000909',
        学校标签: '初中',
        服务归口: '售后审核组',
        是否审核: '审核中',
      },
    },
    historyPanelMeta: {
      '会话历史': createOnlineHistorySection(
        '共7次，当前第3次',
        '会话关键词',
        [
          { label: '渠道来源', value: 'Web端' },
          { label: '队列', value: '售后审核组' },
          { label: '浏览器类型', value: 'Chrome' },
          { label: '地址', value: '天津市南开区' },
          { label: '持续时间', value: '6min' },
        ],
        [
          { align: 'left', text: '退款什么时候能到账？' },
          { align: 'right', text: '您的申请已进入人工审核阶段。' },
          { align: 'left', text: '如果缺资料麻烦及时联系我。' },
        ]
      ),
      '通话历史': createOnlineHistorySection(
        '共1次，当前第1次',
        '通话关键词',
        [
          { label: '振铃时长', value: '9s' },
          { label: '电话归属', value: '天津' },
          { label: '技能组', value: '退款审核组' },
          { label: '呼叫类型', value: '呼出' },
          { label: '坐席号码', value: '0108' },
          { label: '客户号码', value: '13100000909' },
        ],
        [
          { align: 'left', text: '需要我再补什么资料吗？' },
          { align: 'right', text: '暂时只差银行卡尾号信息。' },
        ]
      ),
      '短信历史': createOnlineHistorySection(
        '共5次，当前1次',
        '短信关键词',
        [
          { label: '发送状态', value: '成功' },
          { label: '短信渠道', value: '退款短信' },
          { label: '短信模板', value: '审核进度提醒' },
          { label: '发送账号', value: 'SMS-RF-01' },
          { label: '接收号码', value: '131****0909' },
        ],
        [
          { align: 'right', text: '退款审核进度已短信同步，请耐心等待。', badge: '短信模板' },
          { align: 'left', text: '好的，有进展再联系我。' },
        ]
      ),
      '邮件历史': createOnlineHistorySection(
        '共1次，当前1次',
        '邮件关键词',
        [
          { label: '邮件状态', value: '已送达' },
          { label: '邮件分类', value: '退款资料' },
          { label: '邮件主题', value: '退款审核补充资料提醒' },
          { label: '发送方式', value: '系统发送' },
          { label: '收件账号', value: 'liu***@163.com' },
        ],
        [
          { align: 'right', text: '补充资料说明已邮件发送。', badge: '邮件摘要' },
          { align: 'left', text: '收到，我后续补上。' },
        ]
      ),
    },
    toolItems: createOnlineToolItems([
      ['退款短信', toolSmsIcon, '进度通知'],
      ['凭证附件', toolAttachmentIcon, '凭证核验'],
      ['审核邮件', toolMailIcon, '资料发送'],
      ['服务网点', toolServicePointIcon, '线下支持'],
      ['退款金额', toolRepairPriceIcon, '金额核对'],
      ['退款打款', toolPaymentIcon, '打款跟进'],
    ]),
    thirdPartyLinks: createOnlineThirdPartyLinks(
      [
        { group: '退款审核台', items: ['退款审核中心', '支付对账平台', '资料补充系统'] },
        { group: '售后支持', items: ['审核时效看板', '退款政策说明', '投诉升级中心'] },
      ],
      [
        { group: '个人常用', items: ['我的审核队列', '我的回访计划', '我的退款知识'] },
        { group: '快捷入口', items: ['退款审核话术', '补资料 FAQ'] },
      ]
    ),
  },
};

const onlineSessionDetails = Object.keys(onlineSessionBaseDetails).reduce<Record<string, OnlineSessionDetail>>(
  (result, sessionId) => {
    result[sessionId] = {
      ...onlineSessionBaseDetails[sessionId],
      ...onlineSessionRightPanelDetails[sessionId],
    };
    return result;
  },
  {}
);

const createInitialOnlineSessionMessagesStore = (): Record<string, OnlineConversationMessage[]> =>
  Object.fromEntries(
    Object.entries(onlineSessionDetails).map(([sessionId, detail]) => [
      sessionId,
      detail.messages.filter((message) => !message.withdrawn).map((message) => ({ ...message })),
    ])
  );
const createInitialOnlineWithdrawNoticeStore = (): Record<string, OnlineWithdrawNotice | null> =>
  Object.fromEntries(
    Object.entries(onlineSessionDetails).map(([sessionId, detail]) => {
      const withdrawnMessage = [...detail.messages]
        .reverse()
        .find((message) => message.role === 'agent' && message.withdrawn);

      return [
        sessionId,
        withdrawnMessage
          ? {
              messageId: withdrawnMessage.id,
              text: withdrawnMessage.text,
            }
          : null,
      ];
    })
  );
const createInitialOnlineCustomerFieldStore = (): Record<string, WorkbenchFieldValues> =>
  Object.fromEntries(
    Object.entries(onlineSessionDetails).map(([sessionId, detail]) => [
      sessionId,
      { ...detail.customerProfile.fieldValues },
    ])
  );
const createInitialOnlineCustomerAnonymousStore = (): Record<string, boolean> =>
  Object.fromEntries(
    Object.entries(onlineSessionDetails).map(([sessionId, detail]) => [
      sessionId,
      detail.customerProfile.anonymous,
    ])
  );
const createInitialOnlineBusinessTypeStore = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(onlineSessionDetails).map(([sessionId, detail]) => [
      sessionId,
      detail.customerProfile.businessType,
    ])
  );
const onlineFormFieldOptions: OnlineFormFieldOption[] = ['姓名', '学校', '学校省份', '联系电话'];
const onlineMessageEnglishTranslations: Record<string, string> = {
  'sess-1-m-1': 'The learning tablet is losing power very quickly lately. It only lasts about two hours.',
  'sess-1-m-3': 'The model is T10. I started noticing the issue clearly last week.',
  'sess-2-m-1': 'I would like to inquire about the product capabilities',
  'sess-2-m-3': 'Hello, I would like to ask about the product capabilities. Could you introduce them to me?',
  'sess-3-m-1': 'How much is this translator in the livestream now?',
  'sess-3-m-3': 'Can it be purchased in installments? Are there any gifts?',
  'sess-4-m-1': 'How is this one? I mainly want it for my child to learn English.',
  'sess-4-m-3': 'Can it still be used when offline?',
  'sess-5-m-1': 'How does the knowledge base service on this customer management page work together?',
  'sess-5-m-3': 'Can different roles see different content?',
  'sess-6-m-1': 'How is this? I still have not received my replacement accessory.',
  'sess-6-m-3': 'About when will it arrive?',
  'sess-7-m-1': 'How is this one? The premium version is much more expensive.',
  'sess-7-m-3': 'Can it be returned if the child does not adapt to it?',
  'sess-8-m-1': 'I want to check the refund status and need it transferred for manual review.',
  'sess-8-m-3': 'If any additional materials are needed, please contact me as soon as possible.',
};
const getOnlineMessageSourceLanguage = (message: OnlineConversationMessage): OnlineMessageTranslateLanguage => {
  const hasChinese = /[\u4e00-\u9fff]/.test(message.text);
  const hasLatin = /[A-Za-z]/.test(message.text);

  if (hasLatin && !hasChinese) {
    return 'en';
  }

  return 'zh';
};
const getOnlineMessageTranslationText = (
  message: OnlineConversationMessage,
  targetLanguage: OnlineMessageTranslateLanguage
) => {
  if (targetLanguage === 'zh') {
    if (message.translation) {
      return message.translation.replace(/^译文[:：]\s*/, '').trim();
    }

    return message.text;
  }

  return onlineMessageEnglishTranslations[message.id] ?? message.text;
};
const getOnlineSessionSummaryPreview = (messages: OnlineConversationMessage[]) => {
  const latestMessage = messages[messages.length - 1];

  if (!latestMessage) {
    return '';
  }

  const summaryText = latestMessage.text.replace(/\s+/g, ' ').trim();
  return summaryText.length > 18 ? `${summaryText.slice(0, 18)}...` : summaryText;
};
type RegionSelection = {
  province: string;
  city: string;
  district: string;
};

// Mock data for charts
const trendData = [
  { name: '1', satisfaction: 32, resolution: 22, duration: 12 },
  { name: '2', satisfaction: 38, resolution: 30, duration: 18 },
  { name: '3', satisfaction: 42, resolution: 35, duration: 22 },
  { name: '4', satisfaction: 45, resolution: 40, duration: 28 },
  { name: '5', satisfaction: 40, resolution: 45, duration: 32 },
  { name: '6', satisfaction: 35, resolution: 52, duration: 28 },
  { name: '7', satisfaction: 30, resolution: 48, duration: 25 },
  { name: '8', satisfaction: 25, resolution: 42, duration: 22 },
  { name: '9', satisfaction: 40, resolution: 38, duration: 35 },
  { name: '10', satisfaction: 55, resolution: 45, duration: 42 },
  { name: '11', satisfaction: 48, resolution: 42, duration: 38 },
  { name: '12', satisfaction: 32, resolution: 35, duration: 22 },
  { name: '13', satisfaction: 38, resolution: 30, duration: 25 },
  { name: '14', satisfaction: 42, resolution: 38, duration: 28 },
  { name: '15', satisfaction: 45, resolution: 42, duration: 32 },
  { name: '16', satisfaction: 40, resolution: 50, duration: 48 },
  { name: '17', satisfaction: 35, resolution: 58, duration: 42 },
  { name: '18', satisfaction: 30, resolution: 52, duration: 35 },
  { name: '19', satisfaction: 25, resolution: 45, duration: 28 },
  { name: '20', satisfaction: 35, resolution: 48, duration: 32 },
  { name: '21', satisfaction: 45, resolution: 52, duration: 42 },
  { name: '22', satisfaction: 38, resolution: 45, duration: 35 },
  { name: '23', satisfaction: 32, resolution: 38, duration: 22 },
  { name: '24', satisfaction: 35, resolution: 42, duration: 28 },
  { name: '25', satisfaction: 42, resolution: 52, duration: 45 },
  { name: '26', satisfaction: 38, resolution: 48, duration: 40 },
  { name: '27', satisfaction: 30, resolution: 42, duration: 32 },
];

const businessData = [
  { name: '1', volume: 35, manpower: 32 },
  { name: '2', volume: 32, manpower: 30 },
  { name: '3', volume: 38, manpower: 35 },
  { name: '4', volume: 42, manpower: 40 },
  { name: '5', volume: 35, manpower: 32 },
  { name: '6', volume: 28, manpower: 25 },
  { name: '7', volume: 22, manpower: 20 },
  { name: '8', volume: 35, manpower: 32 },
  { name: '9', volume: 45, manpower: 42 },
  { name: '10', volume: 58, manpower: 55 },
  { name: '11', volume: 48, manpower: 45 },
  { name: '12', volume: 32, manpower: 30 },
  { name: '13', volume: 28, manpower: 25 },
  { name: '14', volume: 35, manpower: 32 },
  { name: '15', volume: 42, manpower: 40 },
  { name: '16', volume: 38, manpower: 35 },
  { name: '17', volume: 32, manpower: 30 },
  { name: '18', volume: 28, manpower: 25 },
  { name: '19', volume: 35, manpower: 32 },
  { name: '20', volume: 42, manpower: 40 },
  { name: '21', volume: 38, manpower: 35 },
  { name: '22', volume: 32, manpower: 30 },
  { name: '23', volume: 28, manpower: 25 },
  { name: '24', volume: 35, manpower: 32 },
  { name: '25', volume: 42, manpower: 40 },
  { name: '26', volume: 38, manpower: 35 },
  { name: '27', volume: 32, manpower: 30 },
];

const personnelData = [
  { name: '张三', personal: '30%', group: '50%' },
  { name: '李四', personal: '30%', group: '50%' },
  { name: '王武', personal: '30%', group: '50%' },
  { name: '张三', personal: '30%', group: '50%' },
  { name: '赵小帅', personal: '30%', group: '50%' },
  { name: '王武', personal: '30%', group: '50%' },
];

const personnelResolutionData = [
  personnelData[2],
  personnelData[4],
  personnelData[1],
  personnelData[5],
  personnelData[0],
  personnelData[3],
];

const ERROR_MODAL_PAGE_SIZE = 5;

const qualityMistakePreview = '擅自向无关人员透露客户信息，造成敏感信息外泄风险';
const qualityMistakeHoverText =
  '擅自向无关人员透露工作中知悉的保密信息、商业秘密及内部敏感资料，造成信息泄露或不良影响的，需承担相应责任。';

const callSidebarFeatureDefinitions: ReadonlyArray<{
  key: CallSidebarFeatureKey;
  label: string;
  title: string;
  panel?: CallRightPanel;
  imageSrc?: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  locked?: boolean;
}> = [
  { key: 'agent', label: 'Agent', title: 'Agent', imageSrc: onlineSideAgentIcon, panel: 'agent' },
  { key: 'workorder', label: '工单管理', title: '工单管理', imageSrc: onlineSideWorkOrderIcon, panel: 'workorder' },
  { key: 'knowledge', label: '知识库', title: '知识库', imageSrc: onlineSideKnowledgeBaseIcon, panel: 'knowledge' },
  { key: 'toolsite', label: '第三方网站', title: '第三方网站', imageSrc: onlineSideToolIcon, panel: 'toolsite' },
  { key: 'summary', label: '通话小结', title: '通话小结', icon: FilePen, panel: 'summary' },
  { key: 'settings', label: '设置', title: '设置', imageSrc: onlineSideSettingsIcon, locked: true },
];

const callSidebarInitialOrder = callSidebarFeatureDefinitions.map((item) => item.key);
const callSidebarFeatureDefinitionMap = callSidebarFeatureDefinitions.reduce<
  Record<CallSidebarFeatureKey, (typeof callSidebarFeatureDefinitions)[number]>
>((result, item) => {
  result[item.key] = item;
  return result;
}, {} as Record<CallSidebarFeatureKey, (typeof callSidebarFeatureDefinitions)[number]>);

const callSidebarInitialVisibility: Record<CallSidebarFeatureKey, boolean> = {
  agent: true,
  workorder: true,
  knowledge: true,
  toolsite: true,
  summary: true,
  settings: true,
};

const onlineSidebarFeatureDefinitions: ReadonlyArray<{
  key: OnlineSidebarFeatureKey;
  label: string;
  title: string;
  imageSrc: string;
  panel?: OnlineRightPanel;
  locked?: boolean;
}> = [
  { key: 'robot', label: 'Agent', title: 'Agent', imageSrc: onlineSideAgentIcon, panel: 'robot' },
  { key: 'customer', label: '客户资料', title: '客户资料', imageSrc: onlineSideCustomerInfoIcon, panel: 'customer' },
  { key: 'history', label: '通话历史', title: '通话历史', imageSrc: onlineSideCustomerHistoryIcon, panel: 'history' },
  { key: 'knowledge', label: '知识库', title: '知识库', imageSrc: onlineSideKnowledgeBaseIcon },
  { key: 'workorder', label: '工单管理', title: '工单管理', imageSrc: onlineSideWorkOrderIcon },
  { key: 'third-party', label: '第三方网站', title: '第三方网站', imageSrc: onlineSideThirdPartyIcon, panel: 'third-party' },
  { key: 'settings', label: '设置', title: '设置', imageSrc: onlineSideSettingsIcon, locked: true },
];

const onlineSidebarInitialOrder = onlineSidebarFeatureDefinitions.map((item) => item.key);
const onlineSidebarFeatureDefinitionMap = onlineSidebarFeatureDefinitions.reduce<
  Record<OnlineSidebarFeatureKey, (typeof onlineSidebarFeatureDefinitions)[number]>
>((result, item) => {
  result[item.key] = item;
  return result;
}, {} as Record<OnlineSidebarFeatureKey, (typeof onlineSidebarFeatureDefinitions)[number]>);

const onlineSidebarInitialVisibility: Record<OnlineSidebarFeatureKey, boolean> = {
  robot: true,
  customer: true,
  history: true,
  knowledge: true,
  workorder: true,
  'third-party': true,
  settings: true,
};

const onlineThirdPartyScopes: readonly OnlineThirdPartyScope[] = ['public', 'personal'];
const onlineThirdPartyInitialDefaultScope: OnlineThirdPartyScope = 'public';

const onlineSuggestionGroups = [
  {
    label: '开头话',
    panelCls: 'border-[#eef1f5] bg-[#f8fbfc]',
    items: [
      '您好，科大讯飞，请问有什么可以帮您？',
      '欢迎您，请问有什么问题需要协助处理？',
      '这里是科大讯飞在线客服，请问您想咨询什么内容？',
    ],
  },
  {
    label: '服务等待话',
    panelCls: 'border-[#dff4ef] bg-[#eefaf7]',
    items: [
      '请稍等，正在帮您查询中~',
      '感谢您的耐心等待，我马上为您核实。',
      '请您稍候，我这边确认好信息后立即回复您。',
    ],
  },
  {
    label: '常用语',
    panelCls: 'border-[#eef1f5] bg-[#f8fbfc]',
    items: [
      '已为您记录该问题，我这边继续帮您跟进处理。',
      '为便于进一步核实，麻烦您提供一下设备型号或订单信息。',
      '您反馈的情况我已经了解，下面为您说明处理方式。',
    ],
  },
  {
    label: '官方专用语',
    panelCls: 'border-[#eef1f5] bg-[#f8fbfc]',
    items: [
      '您好，这里是科大讯飞官方客服，请您放心咨询。',
      '当前回复内容以科大讯飞官方服务标准为准，请您留意。',
      '如需进一步协助，我们会按官方流程继续为您处理。',
    ],
  },
  {
    label: '延伸用语',
    panelCls: 'border-[#eef1f5] bg-[#f8fbfc]',
    items: [
      '如果方便的话，您也可以补充一下使用场景，我帮您更准确判断。',
      '若您愿意，我也可以继续为您整理后续操作步骤。',
      '处理完成后如仍有疑问，您可以继续在当前会话中联系我。',
    ],
  },
] as const;

const onlineSuggestionInitialExpandedState: Record<string, boolean> = {
  开头话: true,
  服务等待话: true,
  常用语: false,
  官方专用语: false,
  延伸用语: false,
};

const qualityDetailRecords = [
  { id: 1, sessionId: '324234', score: '90', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 2, sessionId: '345345', score: '86', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 3, sessionId: '456456', score: '45', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 4, sessionId: '234234', score: '34', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 5, sessionId: '345345', score: '87', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 6, sessionId: '423423', score: '92', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 7, sessionId: '534534', score: '89', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 8, sessionId: '645645', score: '84', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 9, sessionId: '756756', score: '78', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 10, sessionId: '867867', score: '81', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 11, sessionId: '978978', score: '88', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 12, sessionId: '213213', score: '83', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 13, sessionId: '324324', score: '79', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 14, sessionId: '435435', score: '91', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 15, sessionId: '546546', score: '85', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
  { id: 16, sessionId: '657657', score: '82', tag: '教育', time: '20260910 18:00', mistake: qualityMistakePreview },
];

const badRecordingCallIds = [
  '9009093330',
  '7890987890',
  '7890987890',
  '9009093330',
  '7890987890',
  '7890987890',
  '9009093330',
  '7890987890',
];


const onlineStatusOptions = ['在线状态', '马上回来', '电话在线', '忙碌状态', '离开状态', '午餐状态', '隐身状态'] as const;
const onlineBusinessTypeOptions = ['教育', '听见', '学习机', '智能硬件', '法院', '医疗'] as const;
const chinaRegionOptions: readonly RegionProvinceOption[] = [
  {
    name: '北京市',
    cities: [{ name: '北京市', districts: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '通州区', '昌平区'] }],
  },
  {
    name: '天津市',
    cities: [{ name: '天津市', districts: ['和平区', '河西区', '南开区', '河北区', '滨海新区', '西青区'] }],
  },
  {
    name: '上海市',
    cities: [{ name: '上海市', districts: ['黄浦区', '徐汇区', '长宁区', '浦东新区', '闵行区', '嘉定区'] }],
  },
  {
    name: '重庆市',
    cities: [{ name: '重庆市', districts: ['渝中区', '江北区', '南岸区', '沙坪坝区', '九龙坡区', '渝北区'] }],
  },
  {
    name: '河北省',
    cities: [
      { name: '石家庄市', districts: ['长安区', '桥西区', '新华区', '裕华区'] },
      { name: '唐山市', districts: ['路南区', '路北区', '丰南区', '曹妃甸区'] },
      { name: '保定市', districts: ['竞秀区', '莲池区', '高新区', '定州市'] },
      { name: '廊坊市', districts: ['广阳区', '安次区', '三河市', '固安县'] },
    ],
  },
  {
    name: '山西省',
    cities: [
      { name: '太原市', districts: ['小店区', '迎泽区', '杏花岭区', '万柏林区'] },
      { name: '大同市', districts: ['平城区', '云冈区', '新荣区'] },
      { name: '运城市', districts: ['盐湖区', '河津市', '永济市'] },
      { name: '晋中市', districts: ['榆次区', '介休市', '太谷区'] },
    ],
  },
  {
    name: '内蒙古自治区',
    cities: [
      { name: '呼和浩特市', districts: ['新城区', '回民区', '赛罕区', '玉泉区'] },
      { name: '包头市', districts: ['昆都仑区', '青山区', '东河区', '九原区'] },
      { name: '鄂尔多斯市', districts: ['东胜区', '康巴什区', '准格尔旗'] },
      { name: '赤峰市', districts: ['红山区', '松山区', '元宝山区'] },
    ],
  },
  {
    name: '辽宁省',
    cities: [
      { name: '沈阳市', districts: ['和平区', '沈河区', '皇姑区', '浑南区'] },
      { name: '大连市', districts: ['中山区', '沙河口区', '甘井子区', '高新区'] },
      { name: '鞍山市', districts: ['铁东区', '铁西区', '立山区'] },
      { name: '营口市', districts: ['站前区', '西市区', '鲅鱼圈区'] },
    ],
  },
  {
    name: '吉林省',
    cities: [
      { name: '长春市', districts: ['南关区', '朝阳区', '宽城区', '净月区'] },
      { name: '吉林市', districts: ['船营区', '昌邑区', '丰满区'] },
      { name: '延边朝鲜族自治州', districts: ['延吉市', '图们市', '珲春市'] },
      { name: '四平市', districts: ['铁西区', '铁东区', '公主岭市'] },
    ],
  },
  {
    name: '黑龙江省',
    cities: [
      { name: '哈尔滨市', districts: ['道里区', '南岗区', '香坊区', '松北区'] },
      { name: '齐齐哈尔市', districts: ['龙沙区', '建华区', '铁锋区'] },
      { name: '大庆市', districts: ['萨尔图区', '让胡路区', '龙凤区'] },
      { name: '牡丹江市', districts: ['东安区', '阳明区', '爱民区'] },
    ],
  },
  {
    name: '江苏省',
    cities: [
      { name: '南京市', districts: ['玄武区', '秦淮区', '鼓楼区', '江宁区'] },
      { name: '苏州市', districts: ['姑苏区', '工业园区', '吴中区', '昆山市'] },
      { name: '无锡市', districts: ['梁溪区', '滨湖区', '新吴区'] },
      { name: '徐州市', districts: ['云龙区', '鼓楼区', '泉山区'] },
    ],
  },
  {
    name: '浙江省',
    cities: [
      { name: '杭州市', districts: ['上城区', '拱墅区', '西湖区', '滨江区'] },
      { name: '宁波市', districts: ['海曙区', '江北区', '鄞州区', '慈溪市'] },
      { name: '温州市', districts: ['鹿城区', '龙湾区', '瓯海区', '瑞安市'] },
      { name: '金华市', districts: ['婺城区', '金东区', '义乌市', '东阳市'] },
    ],
  },
  {
    name: '安徽省',
    cities: [
      { name: '合肥市', districts: ['庐阳区', '蜀山区', '包河区', '肥西县'] },
      { name: '芜湖市', districts: ['镜湖区', '弋江区', '鸠江区'] },
      { name: '阜阳市', districts: ['颍州区', '颍泉区', '临泉县'] },
      { name: '蚌埠市', districts: ['龙子湖区', '蚌山区', '禹会区'] },
    ],
  },
  {
    name: '福建省',
    cities: [
      { name: '福州市', districts: ['鼓楼区', '台江区', '仓山区', '闽侯县'] },
      { name: '厦门市', districts: ['思明区', '湖里区', '集美区', '海沧区'] },
      { name: '泉州市', districts: ['鲤城区', '丰泽区', '晋江市', '石狮市'] },
      { name: '漳州市', districts: ['芗城区', '龙文区', '龙海区'] },
    ],
  },
  {
    name: '江西省',
    cities: [
      { name: '南昌市', districts: ['东湖区', '西湖区', '红谷滩区', '青山湖区'] },
      { name: '赣州市', districts: ['章贡区', '南康区', '瑞金市'] },
      { name: '九江市', districts: ['濂溪区', '浔阳区', '柴桑区'] },
      { name: '上饶市', districts: ['信州区', '广丰区', '鄱阳县'] },
    ],
  },
  {
    name: '山东省',
    cities: [
      { name: '济南市', districts: ['历下区', '市中区', '槐荫区', '历城区'] },
      { name: '青岛市', districts: ['市南区', '市北区', '崂山区', '黄岛区'] },
      { name: '烟台市', districts: ['芝罘区', '福山区', '莱山区', '龙口市'] },
      { name: '潍坊市', districts: ['奎文区', '潍城区', '高新区', '寿光市'] },
    ],
  },
  {
    name: '河南省',
    cities: [
      { name: '郑州市', districts: ['金水区', '二七区', '中原区', '郑东新区'] },
      { name: '洛阳市', districts: ['西工区', '涧西区', '洛龙区', '伊滨区'] },
      { name: '南阳市', districts: ['宛城区', '卧龙区', '邓州市'] },
      { name: '新乡市', districts: ['红旗区', '卫滨区', '牧野区'] },
    ],
  },
  {
    name: '湖北省',
    cities: [
      { name: '武汉市', districts: ['江岸区', '江汉区', '武昌区', '洪山区'] },
      { name: '宜昌市', districts: ['西陵区', '伍家岗区', '点军区', '宜都市'] },
      { name: '襄阳市', districts: ['襄城区', '樊城区', '高新区', '老河口市'] },
      { name: '黄石市', districts: ['黄石港区', '西塞山区', '下陆区'] },
    ],
  },
  {
    name: '湖南省',
    cities: [
      { name: '长沙市', districts: ['芙蓉区', '天心区', '岳麓区', '开福区'] },
      { name: '株洲市', districts: ['天元区', '荷塘区', '芦淞区'] },
      { name: '湘潭市', districts: ['岳塘区', '雨湖区', '湘乡市'] },
      { name: '岳阳市', districts: ['岳阳楼区', '云溪区', '汨罗市'] },
    ],
  },
  {
    name: '广东省',
    cities: [
      { name: '广州市', districts: ['天河区', '越秀区', '海珠区', '番禺区'] },
      { name: '深圳市', districts: ['福田区', '南山区', '宝安区', '龙岗区'] },
      { name: '佛山市', districts: ['禅城区', '南海区', '顺德区'] },
      { name: '东莞市', districts: ['南城街道', '东城街道', '松山湖', '长安镇'] },
      { name: '珠海市', districts: ['香洲区', '斗门区', '金湾区'] },
    ],
  },
  {
    name: '广西壮族自治区',
    cities: [
      { name: '南宁市', districts: ['青秀区', '兴宁区', '西乡塘区', '良庆区'] },
      { name: '柳州市', districts: ['城中区', '鱼峰区', '柳南区', '柳北区'] },
      { name: '桂林市', districts: ['秀峰区', '象山区', '七星区', '临桂区'] },
      { name: '北海市', districts: ['海城区', '银海区', '合浦县'] },
    ],
  },
  {
    name: '海南省',
    cities: [
      { name: '海口市', districts: ['龙华区', '秀英区', '美兰区', '琼山区'] },
      { name: '三亚市', districts: ['吉阳区', '天涯区', '海棠区', '崖州区'] },
      { name: '琼海市', districts: ['嘉积镇', '博鳌镇', '万泉镇'] },
      { name: '儋州市', districts: ['那大镇', '白马井镇', '洋浦经济开发区'] },
    ],
  },
  {
    name: '四川省',
    cities: [
      { name: '成都市', districts: ['锦江区', '青羊区', '武侯区', '高新区'] },
      { name: '绵阳市', districts: ['涪城区', '游仙区', '安州区', '江油市'] },
      { name: '德阳市', districts: ['旌阳区', '罗江区', '广汉市'] },
      { name: '乐山市', districts: ['市中区', '五通桥区', '峨眉山市'] },
    ],
  },
  {
    name: '贵州省',
    cities: [
      { name: '贵阳市', districts: ['南明区', '云岩区', '观山湖区', '花溪区'] },
      { name: '遵义市', districts: ['汇川区', '红花岗区', '新蒲新区', '仁怀市'] },
      { name: '毕节市', districts: ['七星关区', '织金县', '黔西市'] },
      { name: '六盘水市', districts: ['钟山区', '水城区', '盘州市'] },
    ],
  },
  {
    name: '云南省',
    cities: [
      { name: '昆明市', districts: ['五华区', '盘龙区', '官渡区', '西山区'] },
      { name: '曲靖市', districts: ['麒麟区', '沾益区', '马龙区', '宣威市'] },
      { name: '大理白族自治州', districts: ['大理市', '祥云县', '洱源县'] },
      { name: '红河哈尼族彝族自治州', districts: ['蒙自市', '个旧市', '建水县'] },
    ],
  },
  {
    name: '西藏自治区',
    cities: [
      { name: '拉萨市', districts: ['城关区', '堆龙德庆区', '达孜区', '林周县'] },
      { name: '日喀则市', districts: ['桑珠孜区', '南木林县', '江孜县'] },
      { name: '林芝市', districts: ['巴宜区', '工布江达县', '米林市'] },
      { name: '昌都市', districts: ['卡若区', '芒康县', '左贡县'] },
    ],
  },
  {
    name: '陕西省',
    cities: [
      { name: '西安市', districts: ['新城区', '碑林区', '雁塔区', '高新区'] },
      { name: '咸阳市', districts: ['秦都区', '渭城区', '兴平市', '杨陵区'] },
      { name: '宝鸡市', districts: ['渭滨区', '金台区', '陈仓区'] },
      { name: '榆林市', districts: ['榆阳区', '横山区', '神木市'] },
    ],
  },
  {
    name: '甘肃省',
    cities: [
      { name: '兰州市', districts: ['城关区', '七里河区', '安宁区', '西固区'] },
      { name: '天水市', districts: ['秦州区', '麦积区', '甘谷县'] },
      { name: '酒泉市', districts: ['肃州区', '敦煌市', '玉门市'] },
      { name: '庆阳市', districts: ['西峰区', '庆城县', '环县'] },
    ],
  },
  {
    name: '青海省',
    cities: [
      { name: '西宁市', districts: ['城中区', '城东区', '城西区', '城北区'] },
      { name: '海东市', districts: ['乐都区', '平安区', '民和县'] },
      { name: '格尔木市', districts: ['昆仑路街道', '河西街道', '唐古拉山镇'] },
      { name: '玉树藏族自治州', districts: ['玉树市', '结古街道', '囊谦县'] },
    ],
  },
  {
    name: '宁夏回族自治区',
    cities: [
      { name: '银川市', districts: ['兴庆区', '金凤区', '西夏区', '永宁县'] },
      { name: '吴忠市', districts: ['利通区', '红寺堡区', '青铜峡市'] },
      { name: '石嘴山市', districts: ['大武口区', '惠农区', '平罗县'] },
      { name: '固原市', districts: ['原州区', '西吉县', '隆德县'] },
    ],
  },
  {
    name: '新疆维吾尔自治区',
    cities: [
      { name: '乌鲁木齐市', districts: ['天山区', '沙依巴克区', '新市区', '水磨沟区'] },
      { name: '克拉玛依市', districts: ['克拉玛依区', '独山子区', '白碱滩区'] },
      { name: '喀什地区', districts: ['喀什市', '疏附县', '莎车县'] },
      { name: '伊犁哈萨克自治州', districts: ['伊宁市', '奎屯市', '霍尔果斯市'] },
    ],
  },
  {
    name: '台湾省',
    cities: [
      { name: '台北市', districts: ['中正区', '大安区', '信义区', '士林区'] },
      { name: '新北市', districts: ['板桥区', '中和区', '新店区', '淡水区'] },
      { name: '台中市', districts: ['西屯区', '北屯区', '南屯区', '乌日区'] },
      { name: '高雄市', districts: ['苓雅区', '左营区', '前镇区', '三民区'] },
    ],
  },
  {
    name: '香港特别行政区',
    cities: [
      { name: '香港岛', districts: ['中西区', '湾仔区', '东区', '南区'] },
      { name: '九龙', districts: ['油尖旺区', '深水埗区', '九龙城区', '黄大仙区'] },
      { name: '新界', districts: ['荃湾区', '沙田区', '元朗区', '西贡区'] },
    ],
  },
  {
    name: '澳门特别行政区',
    cities: [
      { name: '澳门半岛', districts: ['花地玛堂区', '圣安多尼堂区', '大堂区', '风顺堂区'] },
      { name: '氹仔', districts: ['嘉模堂区', '路氹城'] },
      { name: '路环', districts: ['圣方济各堂区'] },
    ],
  },
] as const;

const getDefaultRegionSelection = (): RegionSelection => {
  const firstProvince = chinaRegionOptions[0];
  const firstCity = firstProvince.cities[0];
  return {
    province: firstProvince.name,
    city: firstCity.name,
    district: firstCity.districts[0] ?? '',
  };
};

const parseRegionValue = (value: string): RegionSelection => {
  const [province = '', city = '', district = ''] = value.split('/').map((item) => item.trim());
  return { province, city, district };
};

const normalizeRegionSelection = (selection?: RegionSelection, value?: string): RegionSelection => {
  const fallbackSelection = value ? parseRegionValue(value) : selection ?? getDefaultRegionSelection();
  const provinceOption =
    chinaRegionOptions.find((province) => province.name === fallbackSelection.province) ?? chinaRegionOptions[0];
  const cityOption =
    provinceOption.cities.find((city) => city.name === fallbackSelection.city) ?? provinceOption.cities[0];
  const district =
    cityOption.districts.find((item) => item === fallbackSelection.district) ?? cityOption.districts[0] ?? '';

  return {
    province: provinceOption.name,
    city: cityOption.name,
    district,
  };
};

const formatRegionValue = (selection: RegionSelection) =>
  [selection.province, selection.city, selection.district].filter(Boolean).join(' / ');

const workbenchSelectOptions: Record<string, readonly string[]> = {
  '业务类型': onlineBusinessTypeOptions,
  '客户类型': ['普通客户', '潜在客户', 'VIP客户'],
  '学校': ['第一中学', '实验小学', '科大附中'],
  '运营商': ['移动', '联通', '电信'],
  '是否审核': ['是', '否'],
  '是否结婚': ['是', '否'],
  '是否有孩子': ['是', '否'],
  '产品分类': ['学习机', '智能硬件', '听见', '教育'],
  '产品名称': ['A10', 'X3 Pro', '讯飞听见', '智能办公本'],
  '呼入类型': ['咨询', '投诉', '售后', '回访'],
  '问题定型': ['功能咨询', '故障报修', '物流查询', '费用问题'],
  '问题分类一级': ['账号问题', '设备问题', '订单问题', '售后问题'],
  '问题分类二级': ['登录异常', '账号注销', '硬件故障', '系统升级', '支付异常', '物流查询', '退换货', '保修咨询'],
  '问题分类三级': ['三级分类A', '三级分类B', '三级分类C'],
  '小结类型': ['服务小结', '售后小结', '回访小结'],
  '处理结果状态': ['已处理', '处理中', '待回访', '已关闭'],
  '投诉分类一级': ['服务态度', '处理时效', '产品质量'],
  '投诉分类二级': ['一级升级', '二级升级', '专项跟进'],
};

const problemClassificationCombos: ReadonlyArray<ProblemClassificationCombo> = [
  { level1: '账号问题', level2: '登录异常', level3: '密码错误' },
  { level1: '账号问题', level2: '登录异常', level3: '验证码未收到' },
  { level1: '账号问题', level2: '账号注销', level3: '注销流程咨询' },
  { level1: '设备问题', level2: '硬件故障', level3: '屏幕不亮' },
  { level1: '设备问题', level2: '硬件故障', level3: '按键失灵' },
  { level1: '设备问题', level2: '系统升级', level3: '升级失败' },
  { level1: '订单问题', level2: '支付异常', level3: '重复扣款' },
  { level1: '订单问题', level2: '物流查询', level3: '快递未送达' },
  { level1: '售后问题', level2: '退换货', level3: '换货进度' },
  { level1: '售后问题', level2: '保修咨询', level3: '保修期判定' },
];

const summaryLinkedCustomerFieldMap: Record<string, WorkbenchFieldConfig[]> = {
  '学习机': [{ label: '是否结婚', placeholder: '请选择', type: 'select' }],
  '智能硬件': [
    { label: '是否结婚', placeholder: '请选择', type: 'select' },
    { label: '是否有孩子', placeholder: '请选择', type: 'select' },
  ],
};

const getSummaryLinkedCustomerFields = (productCategory?: string) =>
  (productCategory ? summaryLinkedCustomerFieldMap[productCategory] : undefined) ?? [];


const getPortalGreetingByTime = (name: string, now: Date = new Date()) => {
  const hour = now.getHours();
  const greeting =
    hour < 6
      ? '凌晨好'
      : hour < 12
        ? '早上好'
        : hour < 14
          ? '中午好'
          : hour < 18
            ? '下午好'
            : '晚上好';

  return `${greeting}，${name}！`;
};

const insertLinkedCustomerFields = (
  baseFields: WorkbenchFieldConfig[],
  linkedFields: WorkbenchFieldConfig[],
  anchorLabel?: string
) => {
  if (linkedFields.length === 0) {
    return baseFields;
  }

  if (!anchorLabel) {
    return [...linkedFields, ...baseFields];
  }

  const anchorIndex = baseFields.findIndex((field) => field.label === anchorLabel);

  if (anchorIndex === -1) {
    return [...linkedFields, ...baseFields];
  }

  return [
    ...baseFields.slice(0, anchorIndex + 1),
    ...linkedFields,
    ...baseFields.slice(anchorIndex + 1),
  ];
};


const sidebarSubMenuButtonClass =
  "flex w-full items-center pl-[58px] pr-2 py-3.5 text-left text-[15px] font-medium leading-5 transition-colors whitespace-normal break-words focus-visible:outline-none";
const sidebarSubMenuButtonActiveClass =
  "border-r-[3px] border-[#15c3a2] bg-[#d8f2ec] font-semibold text-[#18b89b]";
const sidebarSubMenuButtonInactiveClass =
  "text-[#101828] hover:bg-[#eef7f4] hover:text-[#101828] active:bg-[#e4f4ef] active:text-[#101828] focus-visible:bg-[#eef7f4] focus-visible:text-[#101828]";

const createWorkbenchFieldValues = (fields: WorkbenchFieldConfig[]): WorkbenchFieldValues =>
  fields.reduce<WorkbenchFieldValues>((result, field) => {
    result[field.label] = '';
    return result;
  }, {});

const createDefaultSummaryTabs = (): WorkbenchSummaryTab[] => ['小结1', '小结2'];

const createDefaultSummaryFieldStore = (): Record<WorkbenchSummaryTab, WorkbenchFieldValues> => ({
  小结1: {},
  小结2: {},
});

const createDefaultSummaryTextStore = (): Record<WorkbenchSummaryTab, string> => ({
  小结1: '',
  小结2: '',
});

const createNextSummaryTabLabel = (tabs: WorkbenchSummaryTab[]) => {
  const maxIndex = tabs.reduce((result, tab) => {
    const matched = Number(tab.replace('小结', ''));
    return Number.isNaN(matched) ? result : Math.max(result, matched);
  }, 0);

  return `小结${maxIndex + 1}`;
};

const createNextDirectorMessageId = (messages: readonly DirectorExpressMessage[]) => {
  const maxIndex = messages.reduce((result, message) => {
    const matched = Number(message.id.replace('director-', ''));
    return Number.isNaN(matched) ? result : Math.max(result, matched);
  }, 0);

  return `director-${maxIndex + 1}`;
};

export default function App() {
  const CALL_LEFT_PANEL_DEFAULT_RATIO = 1 / 3;
  const CALL_LEFT_PANEL_DEFAULT_OFFSET = 10;
  const CALL_LEFT_PANEL_MIN_WIDTH = 280;
  const CALL_CENTER_PANEL_DEFAULT_RATIO = 1 / 2;
  const CALL_CENTER_PANEL_MIN_WIDTH = 320;
  const CALL_RIGHT_PANEL_MIN_WIDTH = 300;
  const CALL_WORKBENCH_RESIZER_WIDTH = 12;
  const CALL_STACK_PANEL_MIN_HEIGHT = 220;
  const CALL_VERTICAL_RESIZER_HEIGHT = 12;
  const CALL_RIGHT_VERTICAL_RESIZER_HEIGHT = 16;
  const ONLINE_LEFT_PANEL_DEFAULT_RATIO = 1 / 5;
  const ONLINE_LEFT_PANEL_MIN_WIDTH = 240;
  const ONLINE_CENTER_PANEL_DEFAULT_RATIO = 1 / 2;
  const ONLINE_CENTER_PANEL_MIN_WIDTH = 420;
  const ONLINE_RIGHT_PANEL_MIN_WIDTH = 340;
  const ONLINE_RIGHT_TOP_PANEL_DEFAULT_RATIO = 1 / 2;
  const ONLINE_RIGHT_TOP_PANEL_MIN_HEIGHT = 240;
  const ONLINE_RIGHT_BOTTOM_PANEL_MIN_HEIGHT = 220;
  const ONLINE_WORKBENCH_LAYOUT_GAP = 4;
  const ONLINE_CENTER_RESIZER_WIDTH = 8;
  const ONLINE_RIGHT_RESIZER_HEIGHT = 10;
  const { userRole, setUserRole, initialUserRole } = useRoleRouting();
  const {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebarCollapsed,
    expandedMenuIds,
    toggleMenuExpansion,
    expandMenuById,
    sidebarSearchQuery,
    setSidebarSearchQuery,
  } = useSidebar();
  const [activeTab, setActiveTab] = useState<MainTab>('个人门户');
  const [isMessageServiceTabVisible, setIsMessageServiceTabVisible] = useState(false);
  const [isScheduleDisplayTabVisible, setIsScheduleDisplayTabVisible] = useState(false);
  const [isBusinessFieldManagementTabVisible, setIsBusinessFieldManagementTabVisible] = useState(false);
  const [isBusinessFieldLaunchReviewTabVisible, setIsBusinessFieldLaunchReviewTabVisible] = useState(false);
  const [isWorkOrderTabVisible, setIsWorkOrderTabVisible] = useState(false);
  const [isCourseListTabVisible, setIsCourseListTabVisible] = useState(false);
  const [newTabsVisible, setNewTabsVisible] = useState<Record<string, boolean>>({});
  const [lastPrimaryTab, setLastPrimaryTab] = useState<PrimaryMainTab>('个人门户');
  const [viewMode, setViewMode] = useState<'manager' | 'agent'>(() =>
    getViewModeForRole(initialUserRole)
  );
  const [managerPortalPage, setManagerPortalPage] = useState<ManagerPortalPage>('dashboard');
  const [agentPortalPage, setAgentPortalPage] = useState<AgentPortalPage>('dashboard');
  const [agentSubTab, setAgentSubTab] = useState<'online' | 'hotline'>(() =>
    getAgentChannelForRole(initialUserRole)
  );
  const pendingFilterPresetRef = useRef<LegacyModuleFilterPreset | null>(null);
  const [portalGreeting, setPortalGreeting] = useState(() => getPortalGreetingByTime(userRoleLabels[initialUserRole]));
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showBadRecordingModal, setShowBadRecordingModal] = useState(false);
  const [showCallScheduleFollowUpModal, setShowCallScheduleFollowUpModal] = useState(false);
  const [pendingCallBlock, setPendingCallBlock] = useState<{ x: number; y: number } | null>(null);
  const [callBlockReason, setCallBlockReason] = useState('');
  const [showOnlineBlacklistModal, setShowOnlineBlacklistModal] = useState(false);
  const [showOnlineScheduleFollowUpModal, setShowOnlineScheduleFollowUpModal] = useState(false);
  const [taggingModalSource, setTaggingModalSource] = useState<'call' | 'online' | null>(null);
  const [problemClassificationSearchScope, setProblemClassificationSearchScope] = useState<
    'call-summary' | 'online-summary' | null
  >(null);
  const [activeErrorTab, setActiveErrorTab] = useState<ErrorTabKey>('critical');
  const [errorModalPage, setErrorModalPage] = useState(1);
  const [callHistoryTab, setCallHistoryTab] = useState<WorkbenchHistoryTab>('通话历史');
  const [callSmsHistoryDateRange, setCallSmsHistoryDateRange] = useState<HistoryDateRangeValue>({
    startDate: '',
    endDate: '',
  });
  const [callMailHistoryDateRange, setCallMailHistoryDateRange] = useState<HistoryDateRangeValue>({
    startDate: '',
    endDate: '',
  });
  const [activeCallHistoryDateRangeMenuTab, setActiveCallHistoryDateRangeMenuTab] = useState<HistoryDateRangeTab | null>(null);
  const [callHistoryTimeDropdown, setCallHistoryTimeDropdown] = useState<HistoryTimeDropdownState>(createHistoryTimeDropdownState);
  const [activeCallHistoryTimeMenuTab, setActiveCallHistoryTimeMenuTab] = useState<HistoryTimeDropdownTab | null>(null);
  const [callRightPanel, setCallRightPanel] = useState<CallRightPanel>('summary');
  const {
    tabs: callSummaryTabs,
    activeTab: callSummaryTab,
    setActiveTab: setCallSummaryTab,
    activeFieldValues: activeCallSummaryFieldValues,
    activeText: activeCallSummaryText,
    updateActiveFieldValues: updateCallSummaryFieldValues,
    setActiveText: setActiveCallSummaryText,
    addTab: handleAddCallSummaryTab,
    removeTab: handleRemoveCallSummaryTab,
  } = useWorkbenchSummaryState<WorkbenchSummaryTab, WorkbenchFieldValues>({
    createInitialTabs: createDefaultSummaryTabs,
    createNextTabLabel: createNextSummaryTabLabel,
    createEmptyFieldValues: () => ({}),
    createInitialFieldValuesByTab: createDefaultSummaryFieldStore,
    createInitialTextByTab: createDefaultSummaryTextStore,
  });
  const [callLeftPanelWidth, setCallLeftPanelWidth] = useState(CALL_LEFT_PANEL_MIN_WIDTH);
  const [isCallLeftPanelCustomized, setIsCallLeftPanelCustomized] = useState(false);
  const [isCallLeftResizing, setIsCallLeftResizing] = useState(false);
  const [callLeftTopPanelHeight, setCallLeftTopPanelHeight] = useState(CALL_STACK_PANEL_MIN_HEIGHT);
  const [isCallLeftTopPanelCustomized, setIsCallLeftTopPanelCustomized] = useState(false);
  const [isCallLeftTopResizing, setIsCallLeftTopResizing] = useState(false);
  const [callCenterPanelWidth, setCallCenterPanelWidth] = useState(CALL_CENTER_PANEL_MIN_WIDTH);
  const [isCallCenterPanelCustomized, setIsCallCenterPanelCustomized] = useState(false);
  const [isCallCenterResizing, setIsCallCenterResizing] = useState(false);
  const [callCenterTopPanelHeight, setCallCenterTopPanelHeight] = useState(CALL_STACK_PANEL_MIN_HEIGHT);
  const [isCallCenterTopPanelCustomized, setIsCallCenterTopPanelCustomized] = useState(false);
  const [isCallCenterTopResizing, setIsCallCenterTopResizing] = useState(false);
  const [callRightTopPanelHeight, setCallRightTopPanelHeight] = useState(CALL_STACK_PANEL_MIN_HEIGHT);
  const [isCallRightTopPanelCustomized, setIsCallRightTopPanelCustomized] = useState(false);
  const [isCallRightTopResizing, setIsCallRightTopResizing] = useState(false);
  const [isCallFeatureSettingsOpen, setIsCallFeatureSettingsOpen] = useState(false);
  const {
    order: callSidebarOrder,
    visibility: callSidebarVisibility,
    draggingFeatureKey: draggingCallSidebarFeatureKey,
    dropIndicator: callSidebarDropIndicator,
    clearDragState: clearCallSidebarDragState,
    toggleVisibility: handleToggleCallSidebarVisibility,
    handleFeatureDragStart: handleCallSidebarFeatureDragStart,
    handleFeatureDragOver: handleCallSidebarFeatureDragOver,
    handleFeatureDrop: handleCallSidebarFeatureDrop,
    handleFeatureDragEnd: handleCallSidebarFeatureDragEnd,
  } = useFeatureSidebarState<
    CallSidebarFeatureKey,
    CallRightPanel,
    (typeof callSidebarFeatureDefinitions)[number]
  >({
    features: callSidebarFeatureDefinitions,
    initialOrder: callSidebarInitialOrder,
    initialVisibility: callSidebarInitialVisibility,
    lockedKey: 'settings',
    activePanel: callRightPanel,
    onActivePanelChange: setCallRightPanel,
  });
  const [workbenchToolTab, setWorkbenchToolTab] = useState<WorkbenchToolTab>('常用工具');
  const [topHeaderPresence, setTopHeaderPresence] = useState<AgentPresence>(DEFAULT_TOP_HEADER_PRESENCE);
  const [onlineLeftPresence, setOnlineLeftPresence] = useState<AgentPresence>(DEFAULT_ONLINE_LEFT_PRESENCE);
  const [selectedOnlineStatus, setSelectedOnlineStatus] =
    useState<(typeof onlineStatusOptions)[number]>(onlineStatusOptions[0]);
  const [isOnlineStatusMenuOpen, setIsOnlineStatusMenuOpen] = useState(false);
  const [callCustomerFieldValues, setCallCustomerFieldValues] =
    useState<WorkbenchFieldValues>(() => ({ ...callWorkbenchInboundProfile.customerFieldValues }));
  const [callTags, setCallTags] = useState<Array<{ label: string; cls: string }>>(() => [...callWorkbenchInboundProfile.tags]);
  const [onlineTagsBySession, setOnlineTagsBySession] = useState<Record<string, Array<{ label: string; cls: string }>>>(() =>
    Object.fromEntries(
      Object.entries(onlineSessionDetails).map(([id, detail]) => [id, [...detail.tags]])
    )
  );
  const [callCustomerOpenSelect, setCallCustomerOpenSelect] = useState<string | null>(null);
  const [callSummaryOpenSelect, setCallSummaryOpenSelect] = useState<string | null>(null);
  const [isCallAddNewMode, setIsCallAddNewMode] = useState(false);
  const [callCustomerRegionSelection, setCallCustomerRegionSelection] = useState<RegionSelection>(() =>
    normalizeRegionSelection(undefined, callWorkbenchInboundProfile.customerFieldValues['省市区'])
  );
  const [isOnlineBusinessTypeMenuOpen, setIsOnlineBusinessTypeMenuOpen] = useState(false);
  const [onlineCustomerAnonymousBySession, setOnlineCustomerAnonymousBySession] =
    useState<Record<string, boolean>>(createInitialOnlineCustomerAnonymousStore);
  const [onlineBusinessTypeBySession, setOnlineBusinessTypeBySession] =
    useState<Record<string, string>>(createInitialOnlineBusinessTypeStore);
  const [onlineCustomerFieldValuesBySession, setOnlineCustomerFieldValuesBySession] =
    useState<Record<string, WorkbenchFieldValues>>(createInitialOnlineCustomerFieldStore);
  const {
    tabs: onlineSummaryTabs,
    activeTab: onlineSummaryTab,
    setActiveTab: setOnlineSummaryTab,
    activeFieldValues: activeOnlineSummaryFieldValues,
    activeText: activeOnlineSummaryText,
    updateActiveFieldValues: updateOnlineSummaryFieldValues,
    setActiveText: setActiveOnlineSummaryText,
    addTab: handleAddOnlineSummaryTab,
    removeTab: handleRemoveOnlineSummaryTab,
  } = useWorkbenchSummaryState<WorkbenchSummaryTab, WorkbenchFieldValues>({
    createInitialTabs: createDefaultSummaryTabs,
    createNextTabLabel: createNextSummaryTabLabel,
    createEmptyFieldValues: () => ({}),
    createInitialFieldValuesByTab: createDefaultSummaryFieldStore,
    createInitialTextByTab: createDefaultSummaryTextStore,
  });
  const [onlineCustomerOpenSelect, setOnlineCustomerOpenSelect] = useState<string | null>(null);
  const [onlineSummaryOpenSelect, setOnlineSummaryOpenSelect] = useState<string | null>(null);
  const [onlineCustomerRegionSelection, setOnlineCustomerRegionSelection] =
    useState<RegionSelection>(getDefaultRegionSelection);
  const [activeMessageServiceMailbox, setActiveMessageServiceMailbox] =
    useState<MessageServiceMailbox>('我的公告箱');
  const [onlineWorkbenchHistoryTab, setOnlineWorkbenchHistoryTab] = useState<WorkbenchHistoryTab>('会话历史');
  const [isOnlineHistorySummaryCollapsed, setIsOnlineHistorySummaryCollapsed] = useState(false);
  const [onlineSmsHistoryDateRange, setOnlineSmsHistoryDateRange] = useState<HistoryDateRangeValue>({
    startDate: '',
    endDate: '',
  });
  const [onlineMailHistoryDateRange, setOnlineMailHistoryDateRange] = useState<HistoryDateRangeValue>({
    startDate: '',
    endDate: '',
  });
  const [activeOnlineHistoryDateRangeMenuTab, setActiveOnlineHistoryDateRangeMenuTab] = useState<HistoryDateRangeTab | null>(null);
  const [onlineHistoryTimeDropdown, setOnlineHistoryTimeDropdown] = useState<HistoryTimeDropdownState>(createHistoryTimeDropdownState);
  const [activeOnlineHistoryTimeMenuTab, setActiveOnlineHistoryTimeMenuTab] = useState<HistoryTimeDropdownTab | null>(null);
  const [onlineSessions, setOnlineSessions] = useState<OnlineSession[]>(() => initialOnlineSessions);
  const [onlineSessionMessagesBySession, setOnlineSessionMessagesBySession] =
    useState<Record<string, OnlineConversationMessage[]>>(createInitialOnlineSessionMessagesStore);
  const [onlineWithdrawNoticeBySession, setOnlineWithdrawNoticeBySession] =
    useState<Record<string, OnlineWithdrawNotice | null>>(createInitialOnlineWithdrawNoticeStore);
  const [activeOnlineSessionId, setActiveOnlineSessionId] = useState('sess-2');
  const [onlineSessionListTab, setOnlineSessionListTab] = useState<OnlineSessionListTab>('活动会话');
  const [pinnedOnlineSessionIds, setPinnedOnlineSessionIds] = useState<string[]>([]);
  const [lockedOnlineSessionIds, setLockedOnlineSessionIds] = useState<string[]>([]);
  const [blockedOnlineSessionIds, setBlockedOnlineSessionIds] = useState<string[]>([]);
  const [onlineSessionContextMenu, setOnlineSessionContextMenu] = useState<{
    sessionId: string;
    x: number;
    y: number;
  } | null>(null);
  const [pendingBlockedOnlineSession, setPendingBlockedOnlineSession] = useState<{
    sessionId: string;
    x: number;
    y: number;
  } | null>(null);
  const [onlineBlockReason, setOnlineBlockReason] = useState('');
  const [onlineComposerTextBySession, setOnlineComposerTextBySession] = useState<Record<string, string>>({});
  const [onlineMessageTranslationLanguageById, setOnlineMessageTranslationLanguageById] =
    useState<Record<string, OnlineMessageTranslateLanguage>>({});
  const [activeOnlineMessageTranslateMenuId, setActiveOnlineMessageTranslateMenuId] = useState<string | null>(null);
  const [isOnlineFormSelectModalOpen, setIsOnlineFormSelectModalOpen] = useState(false);
  const [selectedOnlineFormFields, setSelectedOnlineFormFields] = useState<OnlineFormFieldOption[]>([]);
  const [onlineComposerTranslateLanguage, setOnlineComposerTranslateLanguage] =
    useState<OnlineMessageTranslateLanguage>('zh');
  const [isOnlineComposerTranslateMenuOpen, setIsOnlineComposerTranslateMenuOpen] = useState(false);
  const [isOnlineSuggestionMenuOpen, setIsOnlineSuggestionMenuOpen] = useState(false);
  const [onlineSuggestionKeyword, setOnlineSuggestionKeyword] = useState('');
  const [expandedOnlineSuggestionGroups, setExpandedOnlineSuggestionGroups] = useState<Record<string, boolean>>(
    onlineSuggestionInitialExpandedState
  );
  const [isOnlineFeatureSettingsOpen, setIsOnlineFeatureSettingsOpen] = useState(false);
  const [onlineRightPanel, setOnlineRightPanel] = useState<OnlineRightPanel>('robot');
  const {
    order: onlineSidebarOrder,
    visibility: onlineSidebarVisibility,
    draggingFeatureKey: draggingOnlineSidebarFeatureKey,
    dropIndicator: onlineSidebarDropIndicator,
    clearDragState: clearOnlineSidebarDragState,
    toggleVisibility: handleToggleOnlineSidebarVisibility,
    handleFeatureDragStart: handleOnlineSidebarFeatureDragStart,
    handleFeatureDragOver: handleOnlineSidebarFeatureDragOver,
    handleFeatureDrop: handleOnlineSidebarFeatureDrop,
    handleFeatureDragEnd: handleOnlineSidebarFeatureDragEnd,
  } = useFeatureSidebarState<
    OnlineSidebarFeatureKey,
    OnlineRightPanel,
    (typeof onlineSidebarFeatureDefinitions)[number]
  >({
    features: onlineSidebarFeatureDefinitions,
    initialOrder: onlineSidebarInitialOrder,
    initialVisibility: onlineSidebarInitialVisibility,
    lockedKey: 'settings',
    activePanel: onlineRightPanel,
    onActivePanelChange: setOnlineRightPanel,
  });
  const [onlineThirdPartyScope, setOnlineThirdPartyScope] =
    useState<OnlineThirdPartyScope>(onlineThirdPartyInitialDefaultScope);
  const [expandedThirdPartyGroups, setExpandedThirdPartyGroups] = useState<Record<string, boolean>>({});
  const toggleThirdPartyGroup = (key: string) =>
    setExpandedThirdPartyGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const [onlineThirdPartyDefaultScope, setOnlineThirdPartyDefaultScope] =
    useState<OnlineThirdPartyScope>(onlineThirdPartyInitialDefaultScope);
  const [pendingOnlineThirdPartyDefaultScope, setPendingOnlineThirdPartyDefaultScope] =
    useState<OnlineThirdPartyScope>(onlineThirdPartyInitialDefaultScope);
  const [isOnlineThirdPartySettingsOpen, setIsOnlineThirdPartySettingsOpen] = useState(false);
  const [activeOnlineCallOverlay, setActiveOnlineCallOverlay] = useState<OnlineCallOverlay | null>(null);
  const [callOverlayPos, setCallOverlayPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const callOverlayDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [isOnlineVisitorExpanded, setIsOnlineVisitorExpanded] = useState(true);
  const [isOnlineSessionConnected, setIsOnlineSessionConnected] = useState(true);
  const [showOnlineEndSessionConfirm, setShowOnlineEndSessionConfirm] = useState(false);
  const [pendingOnlineWithdrawMessage, setPendingOnlineWithdrawMessage] = useState<{
    sessionId: string;
    messageId: string;
  } | null>(null);
  const [onlineLeftPanelWidth, setOnlineLeftPanelWidth] = useState(ONLINE_LEFT_PANEL_MIN_WIDTH);
  const [isOnlineLeftPanelCustomized, setIsOnlineLeftPanelCustomized] = useState(false);
  const [isOnlineLeftResizing, setIsOnlineLeftResizing] = useState(false);
  const [onlineCenterPanelWidth, setOnlineCenterPanelWidth] = useState(ONLINE_CENTER_PANEL_MIN_WIDTH);
  const [isOnlineCenterPanelCustomized, setIsOnlineCenterPanelCustomized] = useState(false);
  const [isOnlineCenterResizing, setIsOnlineCenterResizing] = useState(false);

  useEffect(() => {
    const updatePortalGreeting = () => {
      setPortalGreeting(getPortalGreetingByTime(userRoleLabels[userRole]));
    };

    updatePortalGreeting();
    const timerId = window.setInterval(updatePortalGreeting, 60 * 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [userRole]);
  const [onlineRightTopPanelHeight, setOnlineRightTopPanelHeight] = useState(ONLINE_RIGHT_TOP_PANEL_MIN_HEIGHT);
  const [isOnlineRightTopPanelCustomized, setIsOnlineRightTopPanelCustomized] = useState(false);
  const [isOnlineRightTopResizing, setIsOnlineRightTopResizing] = useState(false);
  const callWorkbenchLayoutRef = useRef<HTMLDivElement | null>(null);
  const callLeftPanelStackRef = useRef<HTMLDivElement | null>(null);
  const callCenterPanelRef = useRef<HTMLDivElement | null>(null);
  const callCenterPanelStackRef = useRef<HTMLDivElement | null>(null);
  const callRightPanelStackRef = useRef<HTMLDivElement | null>(null);
  const onlineWorkbenchLayoutRef = useRef<HTMLDivElement | null>(null);
  const onlineCenterPanelRef = useRef<HTMLDivElement | null>(null);
  const onlineRightPanelStackRef = useRef<HTMLDivElement | null>(null);
  const onlineComposerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const floatingSelectTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onlineMessageTranslateTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onlineHistoryDateRangeTriggerRefs = useRef<Partial<Record<HistoryDateRangeTab, HTMLButtonElement | null>>>({});
  const onlineHistoryTimeTriggerRefs = useRef<Partial<Record<HistoryTimeDropdownTab, HTMLButtonElement | null>>>({});
  const callWorkbenchThirdPartySettingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const onlineBusinessTypeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const onlineSuggestionTriggerRef = useRef<HTMLButtonElement | null>(null);
  const onlineFeatureSettingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const onlineThirdPartySettingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [, setFloatingMenuVersion] = useState(0);
  const floatingMenuSyncFrameRef = useRef<number | null>(null);
  const closeAllDropdownsRef = useRef<() => void>(() => undefined);
  
  // Director's Express states
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [shouldRenderDirectorModal, setShouldRenderDirectorModal] = useState(false);
  const [directorView, setDirectorView] = useState<DirectorExpressView>('list');
  const [selectedDirectorMessage, setSelectedDirectorMessage] = useState<DirectorExpressMessage | null>(null);
  const [directorMessages, setDirectorMessages] = useState<DirectorExpressMessage[]>(initialDirectorMessages);
  const [newDirectorMessageContent, setNewDirectorMessageContent] = useState('');
  const [newDirectorMessageTitle, setNewDirectorMessageTitle] = useState('');
  const [isDirectorMessageAnonymous, setIsDirectorMessageAnonymous] = useState(true);
  const [directorReplyText, setDirectorReplyText] = useState('');
  const [directorReplyImage, setDirectorReplyImage] = useState<string | null>(null);
  const unreadDirectorMessageCount = directorMessages.filter((message) => message.hasNew).length;

  useEffect(() => {
    if (showDirectorModal) {
      setShouldRenderDirectorModal(true);
    }
  }, [showDirectorModal]);

  const handleSendDirectorMessage = () => {
    const trimmedTitle = newDirectorMessageTitle.trim();
    const trimmedContent = newDirectorMessageContent.trim();
    if (!trimmedTitle || !trimmedContent) return;

    const timestamp = new Date().toLocaleString();
    const newMessage: DirectorExpressMessage = {
      id: createNextDirectorMessageId(directorMessages),
      title: trimmedTitle,
      sender: 'Ranou',
      recipient: 'zongjian',
      isAnonymous: isDirectorMessageAnonymous,
      isReplied: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      hasNew: false,
      content: trimmedContent,
      replies: [],
    };

    setDirectorMessages((currentMessages) => [newMessage, ...currentMessages]);
    setNewDirectorMessageContent('');
    setNewDirectorMessageTitle('');
    setDirectorView('list');
  };

  const handleSelectDirectorMessage = (message: DirectorExpressMessage) => {
    const nextSelectedMessage = message.hasNew ? { ...message, hasNew: false } : message;

    setSelectedDirectorMessage(nextSelectedMessage);
    setDirectorView('detail');

    if (!message.hasNew) {
      return;
    }

    setDirectorMessages((currentMessages) =>
      currentMessages.map((currentMessage) =>
        currentMessage.id === message.id ? nextSelectedMessage : currentMessage
      )
    );
  };

  const handleSendDirectorReply = () => {
    const trimmedReply = directorReplyText.trim();
    if (!trimmedReply && !directorReplyImage) return;
    if (!selectedDirectorMessage) return;

    const timestamp = new Date().toLocaleString();
    const replySender = viewMode === 'manager' ? 'zongjian' : 'Ranou';
    const updatedSelectedMessage: DirectorExpressMessage = {
      ...selectedDirectorMessage,
      isReplied: viewMode === 'manager' ? true : selectedDirectorMessage.isReplied,
      updatedAt: timestamp,
      replies: [
        ...selectedDirectorMessage.replies,
        { sender: replySender, content: trimmedReply, timestamp, image: directorReplyImage ?? undefined },
      ],
    };

    setDirectorMessages((currentMessages) =>
      currentMessages.map((currentMessage) =>
        currentMessage.id === selectedDirectorMessage.id ? updatedSelectedMessage : currentMessage
      )
    );
    setSelectedDirectorMessage(updatedSelectedMessage);
    setDirectorReplyText('');
    setDirectorReplyImage(null);
  };
  
  // Portal dashboard states
  const [allFilter, setAllFilter] = useState<ManagerGroupFilter>('全部');
  const [onlineFilter, setOnlineFilter] = useState<ManagerOnlineFilter>(() =>
    '热线'
  );
  const [trendMonth, setTrendMonth] = useState('2026年10月');
  const [personnelDate, setPersonnelDate] = useState<ManagerPersonnelDateOption>('昨日');
  const [personnelFocusMetric, setPersonnelFocusMetric] =
    useState<PersonnelFocusMetric>('satisfaction');
  const [starEmployeeMetric, setStarEmployeeMetric] =
    useState<StarEmployeeMetric>('communication');
  const [satisfactionStarEmployees] = useState<StarEmployee[]>(() =>
    createShuffledStarEmployees()
  );
  const [activeShiftDay, setActiveShiftDay] = useState<ShiftScheduleDay>('今天');
  const [businessPeriod, setBusinessPeriod] =
    useState<ManagerBusinessPeriodOption>('日');

  const errorModalTotal = qualityDetailRecords.length;
  const errorModalTotalPages = Math.ceil(errorModalTotal / ERROR_MODAL_PAGE_SIZE);
  const errorModalStartIndex = (errorModalPage - 1) * ERROR_MODAL_PAGE_SIZE;
  const visibleErrorRecords = qualityDetailRecords.slice(
    errorModalStartIndex,
    errorModalStartIndex + ERROR_MODAL_PAGE_SIZE
  );

  const handleOpenErrorModal = (tab: ErrorTabKey) => {
    setActiveErrorTab(tab);
    setErrorModalPage(1);
    setShowErrorModal(true);
  };

  const handleOpenBadRecordingModal = () => {
    setShowBadRecordingModal(true);
  };

  const handleSwitchErrorTab = (tab: ErrorTabKey) => {
    setActiveErrorTab(tab);
    setErrorModalPage(1);
  };
  const allowedWorkbenches = getAllowedWorkbenchesForRole(userRole);
  const primaryMainTabs: PrimaryMainTab[] = [
    '个人门户',
    ...(allowedWorkbenches.call ? (['呼叫工作台'] as const) : []),
    ...(allowedWorkbenches.online ? (['在线工作台'] as const) : []),
  ];
  const secondaryMainTabVisibility: Record<SecondaryMainTab, boolean> = {
    '消息服务': isMessageServiceTabVisible,
    '排班信息展示': isScheduleDisplayTabVisible,
    '业务字段管理': isBusinessFieldManagementTabVisible,
    '业务字段上线审核': isBusinessFieldLaunchReviewTabVisible,
    '工单管理': isWorkOrderTabVisible,
    '学习课程': isCourseListTabVisible,
    '繁忙公告管理': newTabsVisible['繁忙公告管理'] ?? false,
    '隐私声明管理': newTabsVisible['隐私声明管理'] ?? false,
    '网聊维护': newTabsVisible['网聊维护'] ?? false,
    '录音查询': newTabsVisible['录音查询'] ?? false,
    '范例录音查询': newTabsVisible['范例录音查询'] ?? false,
    '范例录音审核': newTabsVisible['范例录音审核'] ?? false,
    '短信收发查询': newTabsVisible['短信收发查询'] ?? false,
    '邮件收发查询': newTabsVisible['邮件收发查询'] ?? false,
    '话务员监控': newTabsVisible['话务员监控'] ?? false,
    '队列监控': newTabsVisible['队列监控'] ?? false,
    '网聊历史查询': newTabsVisible['网聊历史查询'] ?? false,
    '网聊留言管理': newTabsVisible['网聊留言管理'] ?? false,
    '网聊黑名单查询': newTabsVisible['网聊黑名单查询'] ?? false,
    '网聊黑名单审批': newTabsVisible['网聊黑名单审批'] ?? false,
    '小结管理': newTabsVisible['小结管理'] ?? false,
    '预约回电管理': newTabsVisible['预约回电管理'] ?? false,
  };
  const visibleMainTabs: MainTab[] = [
    ...primaryMainTabs,
    ...secondaryMainTabs.filter((tab) => secondaryMainTabVisibility[tab]),
  ];
  const isChannelLocked = isAgentChannelLockedForRole(userRole);
  const handleOpenSecondaryMainTab = (tab: SecondaryMainTab) => {
    switch (tab) {
      case '消息服务':
        setIsMessageServiceTabVisible(true);
        break;
      case '排班信息展示':
        setIsScheduleDisplayTabVisible(true);
        break;
      case '业务字段管理':
        setIsBusinessFieldManagementTabVisible(true);
        break;
      case '业务字段上线审核':
        setIsBusinessFieldLaunchReviewTabVisible(true);
        break;
      case '工单管理':
        setIsWorkOrderTabVisible(true);
        break;
      case '学习课程':
        setIsCourseListTabVisible(true);
        break;
      default:
        setNewTabsVisible(prev => ({ ...prev, [tab]: true }));
        break;
    }

    const parentGroupId = findMenuGroupForTab(tab);
    if (parentGroupId) {
      expandMenuById(parentGroupId);
    }

    setActiveTab(tab);
  };
  const handleOpenMainTab = (tab: MainTab) => {
    if (isSecondaryMainTab(tab)) {
      handleOpenSecondaryMainTab(tab);
      return;
    }

    setLastPrimaryTab(tab);
    setActiveTab(tab);
  };
  const handleCloseSecondaryMainTab = (tab: SecondaryMainTab) => {
    switch (tab) {
      case '消息服务':
        setIsMessageServiceTabVisible(false);
        break;
      case '排班信息展示':
        setIsScheduleDisplayTabVisible(false);
        break;
      case '业务字段管理':
        setIsBusinessFieldManagementTabVisible(false);
        break;
      case '业务字段上线审核':
        setIsBusinessFieldLaunchReviewTabVisible(false);
        break;
      case '工单管理':
        setIsWorkOrderTabVisible(false);
        break;
      case '学习课程':
        setIsCourseListTabVisible(false);
        break;
      default:
        setNewTabsVisible(prev => ({ ...prev, [tab]: false }));
        break;
    }

    if (activeTab === tab) {
      setActiveTab(lastPrimaryTab);
    }
  };

  const handleGoToPortal = () => {
    setManagerPortalPage('dashboard');
    setAgentPortalPage('dashboard');
    handleOpenMainTab('个人门户');
  };

  // Role change side-effects: whenever userRole changes (via dropdown,
  // popstate, or any other trigger) reset the dependent state to sensible
  // defaults for the new role. The skip-first-run ref keeps the initial
  // mount from redundantly re-setting state that was already computed from
  // initialUserRole.
  const isFirstRoleChangeRef = useRef(true);
  useEffect(() => {
    if (isFirstRoleChangeRef.current) {
      isFirstRoleChangeRef.current = false;
      return;
    }
    const nextViewMode = getViewModeForRole(userRole);
    const nextAgentChannel = getAgentChannelForRole(userRole);
    setViewMode(nextViewMode);
    setAgentSubTab(nextAgentChannel);
    if (nextViewMode === 'manager') {
      setOnlineFilter('热线');
    }
    setManagerPortalPage('dashboard');
    setAgentPortalPage('dashboard');
    setActiveTab('个人门户');
    setLastPrimaryTab('个人门户');
  }, [userRole]);

  useEffect(() => {
    const hasFloatingMenuOpen = Boolean(
        callCustomerOpenSelect ||
        callSummaryOpenSelect ||
        onlineCustomerOpenSelect ||
        onlineSummaryOpenSelect ||
        activeCallHistoryDateRangeMenuTab ||
        activeCallHistoryTimeMenuTab ||
        isCallFeatureSettingsOpen ||
        activeOnlineMessageTranslateMenuId ||
        activeOnlineHistoryDateRangeMenuTab ||
        activeOnlineHistoryTimeMenuTab ||
        isOnlineBusinessTypeMenuOpen ||
        isOnlineSuggestionMenuOpen ||
        isOnlineFeatureSettingsOpen ||
        isOnlineThirdPartySettingsOpen
    );

    if (!hasFloatingMenuOpen || typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const syncFloatingMenus = () => {
      if (floatingMenuSyncFrameRef.current !== null) {
        return;
      }

      floatingMenuSyncFrameRef.current = window.requestAnimationFrame(() => {
        floatingMenuSyncFrameRef.current = null;
        setFloatingMenuVersion((version) => version + 1);
      });
    };

    window.addEventListener('resize', syncFloatingMenus);
    document.addEventListener('scroll', syncFloatingMenus, true);

    return () => {
      if (floatingMenuSyncFrameRef.current !== null) {
        window.cancelAnimationFrame(floatingMenuSyncFrameRef.current);
        floatingMenuSyncFrameRef.current = null;
      }

      window.removeEventListener('resize', syncFloatingMenus);
      document.removeEventListener('scroll', syncFloatingMenus, true);
    };
  }, [
    callCustomerOpenSelect,
    callSummaryOpenSelect,
    onlineCustomerOpenSelect,
    onlineSummaryOpenSelect,
    activeCallHistoryDateRangeMenuTab,
    activeCallHistoryTimeMenuTab,
    isCallFeatureSettingsOpen,
    activeOnlineMessageTranslateMenuId,
    activeOnlineHistoryDateRangeMenuTab,
    activeOnlineHistoryTimeMenuTab,
    isOnlineBusinessTypeMenuOpen,
    isOnlineSuggestionMenuOpen,
    isOnlineFeatureSettingsOpen,
    isOnlineThirdPartySettingsOpen,
  ]);

  const renderFloatingMenu = (
    triggerElement: HTMLElement | null,
    menuContent: React.ReactNode,
    options?: {
      align?: 'left' | 'center' | 'right';
      marginTop?: number;
      width?: number;
      placement?: 'top' | 'bottom';
    }
  ) => {
    if (!triggerElement || typeof document === 'undefined' || typeof window === 'undefined') {
      return null;
    }

    const viewportPadding = 24;
    const triggerRect = triggerElement.getBoundingClientRect();
    const preferredWidth = options?.width ?? triggerRect.width;
    const maxWidth = Math.max(180, window.innerWidth - viewportPadding * 2);
    const resolvedWidth = Math.min(preferredWidth, maxWidth);
    const leftBase =
      options?.align === 'center'
        ? triggerRect.left + triggerRect.width / 2 - resolvedWidth / 2
        : options?.align === 'right'
          ? triggerRect.right - resolvedWidth
          : triggerRect.left;
    const left = Math.min(
      Math.max(leftBase, viewportPadding),
      window.innerWidth - viewportPadding - resolvedWidth
    );

    return createPortal(
      <div
        data-dropdown-root="true"
        style={{
          position: 'fixed',
          left,
          ...(options?.placement === 'top'
            ? { bottom: window.innerHeight - triggerRect.top + (options?.marginTop ?? 4) }
            : { top: triggerRect.bottom + (options?.marginTop ?? 4) }),
          width: resolvedWidth,
          zIndex: 60,
        }}
      >
        {menuContent}
      </div>,
      document.body
    );
  };

  const handleCloseOnlineSuggestionMenu = () => {
    setIsOnlineSuggestionMenuOpen(false);
    setOnlineSuggestionKeyword('');
  };
  const handleCloseOnlineComposerTranslateMenu = () => {
    setIsOnlineComposerTranslateMenuOpen(false);
  };
  const handleCloseCallFeatureSettings = () => {
    setIsCallFeatureSettingsOpen(false);
    clearCallSidebarDragState();
  };
  const handleCloseOnlineFeatureSettings = () => {
    setIsOnlineFeatureSettingsOpen(false);
    clearOnlineSidebarDragState();
  };
  const handleCloseOnlineThirdPartySettings = () => {
    setIsOnlineThirdPartySettingsOpen(false);
    setPendingOnlineThirdPartyDefaultScope(onlineThirdPartyDefaultScope);
  };

  const handleCloseAllDropdowns = () => {
    setCallCustomerOpenSelect(null);
    setCallSummaryOpenSelect(null);
    setOnlineCustomerOpenSelect(null);
    setOnlineSummaryOpenSelect(null);
    setActiveCallHistoryDateRangeMenuTab(null);
    setActiveCallHistoryTimeMenuTab(null);
    setIsOnlineStatusMenuOpen(false);
    setIsOnlineBusinessTypeMenuOpen(false);
    setActiveOnlineMessageTranslateMenuId(null);
    setActiveOnlineHistoryDateRangeMenuTab(null);
    setActiveOnlineHistoryTimeMenuTab(null);
    handleCloseCallFeatureSettings();
    handleCloseOnlineComposerTranslateMenu();
    handleCloseOnlineSuggestionMenu();
    handleCloseOnlineFeatureSettings();
    handleCloseOnlineThirdPartySettings();
    setOnlineSessionContextMenu(null);
  };

  useEffect(() => {
    closeAllDropdownsRef.current = handleCloseAllDropdowns;
  }, [handleCloseAllDropdowns]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleDocumentPointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-dropdown-root="true"]')) {
        return;
      }

      closeAllDropdownsRef.current();
    };

    document.addEventListener('mousedown', handleDocumentPointerDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
    };
  }, []);

  useEffect(() => {
    if (workbenchToolTab === '第三方网站') {
      setOnlineThirdPartyScope(onlineThirdPartyDefaultScope);
    }
  }, [workbenchToolTab, onlineThirdPartyDefaultScope]);

  useEffect(() => {
    if (onlineRightPanel === 'third-party') {
      setOnlineThirdPartyScope(onlineThirdPartyDefaultScope);
    }
  }, [onlineRightPanel, onlineThirdPartyDefaultScope]);

  const activeCallSummaryProductCategory = activeCallSummaryFieldValues['产品分类'];
  const activeCallSummaryProductName = activeCallSummaryFieldValues['产品名称'];
  const callTicketTemplateOptions =
    activeCallSummaryProductCategory && activeCallSummaryProductName
      ? [
          { label: '彩铃设置问题', content: '【问题描述】\n【设备型号】\n【已尝试操作】\n【期望结果】' },
          { label: '会员权益问题', content: '【会员类型】\n【权益类型】\n【问题表现】\n【订单号】' },
        ]
      : [];
  const activeOnlineSummaryProductCategory = activeOnlineSummaryFieldValues['产品分类'];
  const activeOnlineSummaryProductName = activeOnlineSummaryFieldValues['产品名称'];
  const onlineTicketTemplateOptions =
    activeOnlineSummaryProductCategory && activeOnlineSummaryProductName
      ? [
          { label: '彩铃设置问题', content: '【问题描述】\n【设备型号】\n【已尝试操作】\n【期望结果】' },
          { label: '会员权益问题', content: '【会员类型】\n【权益类型】\n【问题表现】\n【订单号】' },
        ]
      : [];
  const callLinkedCustomerFields = getSummaryLinkedCustomerFields(activeCallSummaryProductCategory);
  const onlineLinkedCustomerFields = getSummaryLinkedCustomerFields(activeOnlineSummaryProductCategory);
  const callCustomerFields = insertLinkedCustomerFields(workbenchCustomerFields, callLinkedCustomerFields, '业务类型');
  const handleResetCallCustomerFields = () => {
    setCallCustomerFieldValues({ ...callWorkbenchInboundProfile.customerFieldValues });
    setCallCustomerOpenSelect(null);
    setCallCustomerRegionSelection(
      normalizeRegionSelection(undefined, callWorkbenchInboundProfile.customerFieldValues['省市区'])
    );
    setIsCallAddNewMode(false);
  };
  const handleAddNewCallCustomer = () => {
    setCallCustomerFieldValues({});
    setCallCustomerOpenSelect(null);
    setCallCustomerRegionSelection(normalizeRegionSelection(undefined));
    updateCallSummaryFieldValues({} as WorkbenchFieldValues);
    setActiveCallSummaryText('');
    setCallSummaryOpenSelect(null);
    setIsCallAddNewMode(true);
  };
  const handleQueryCallCustomerByPhone = (phone: string) => {
    setCallCustomerFieldValues({
      ...callWorkbenchInboundProfile.customerFieldValues,
      来电号码: phone,
    });
    setCallCustomerOpenSelect(null);
    setCallCustomerRegionSelection(
      normalizeRegionSelection(undefined, callWorkbenchInboundProfile.customerFieldValues['省市区'])
    );
    setIsCallAddNewMode(false);
  };
  const handleOpenCallScheduleFollowUpModal = () => {
    setShowCallScheduleFollowUpModal(true);
  };
  const handleCloseCallScheduleFollowUpModal = () => {
    setShowCallScheduleFollowUpModal(false);
  };

  const handleOpenTaggingModal = (source: 'call' | 'online') => {
    setTaggingModalSource(source);
  };
  const handleCloseTaggingModal = () => {
    setTaggingModalSource(null);
  };
  const handleRemoveTag = (label: string) => {
    if (taggingModalSource === 'call') {
      setCallTags((prev) => prev.filter((t) => t.label !== label));
    } else if (taggingModalSource === 'online') {
      setOnlineTagsBySession((prev) => ({
        ...prev,
        [activeOnlineSession.id]: (prev[activeOnlineSession.id] ?? []).filter((t) => t.label !== label),
      }));
    }
  };
  const handleAddTag = (label: string) => {
    const newTag = { label, cls: 'border-rose-200 bg-rose-50 text-rose-500' };
    if (taggingModalSource === 'call') {
      setCallTags((prev) => (prev.some((t) => t.label === label) ? prev : [...prev, newTag]));
    } else if (taggingModalSource === 'online') {
      setOnlineTagsBySession((prev) => {
        const current = prev[activeOnlineSession.id] ?? [];
        if (current.some((t) => t.label === label)) return prev;
        return { ...prev, [activeOnlineSession.id]: [...current, newTag] };
      });
    }
  };

  const activeHistoryMeta = historyTabMeta[callHistoryTab];
  const isCallHistoryDateRangeTab = callHistoryTab === '短信历史' || callHistoryTab === '邮件历史';
  const callHistorySummaryLabel = isCallHistoryDateRangeTab ? '共5次' : activeHistoryMeta.total;
  const isCallHistoryTimeDropdownTab = callHistoryTab === '通话历史' || callHistoryTab === '会话历史';
  const activeCallHistoryDateRange = callHistoryTab === '邮件历史' ? callMailHistoryDateRange : callSmsHistoryDateRange;
  const isCallHistoryDateRangeMenuOpen = activeCallHistoryDateRangeMenuTab === callHistoryTab;
  const activeCallHistoryTime =
    isCallHistoryTimeDropdownTab ? callHistoryTimeDropdown.selectedByTab[callHistoryTab as HistoryTimeDropdownTab] : '';
  const isCallHistoryTimeMenuOpen = activeCallHistoryTimeMenuTab === callHistoryTab;
  const isCallHistoryEmpty = isCallHistoryTimeDropdownTab && !activeCallHistoryTime;
  const updateActiveCallHistoryDateRange = (key: keyof HistoryDateRangeValue, value: string) => {
    if (callHistoryTab === '邮件历史') {
      setCallMailHistoryDateRange((prev) => ({
        ...prev,
        [key]: value,
      }));
      return;
    }

    if (callHistoryTab === '短信历史') {
      setCallSmsHistoryDateRange((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };
  const handleSelectCallHistoryTime = (tab: HistoryTimeDropdownTab, value: string) => {
    setCallHistoryTimeDropdown((prev) => ({
      ...prev,
      selectedByTab: {
        ...prev.selectedByTab,
        [tab]: value,
      },
    }));
    setActiveCallHistoryTimeMenuTab(null);

    if (tab === '通话历史') {
      const options = callHistoryTimeDropdown.optionsByTab[tab];
      const index = options.indexOf(value);
      const summaryData = callSummaryDataByTimeIndex[index >= 0 ? index : 0];
      updateCallSummaryFieldValues(summaryData.fieldValues);
      setActiveCallSummaryText(summaryData.text);
    }
  };
  const handleToggleCallHistoryTimeSort = (tab: HistoryTimeDropdownTab) => {
    setCallHistoryTimeDropdown((prev) => toggleHistoryTimeDropdownSort(prev, tab));
  };
  const handleToggleActiveCallHistoryDateRangeMenu = () => {
    if (!isCallHistoryDateRangeTab) {
      return;
    }

    setActiveCallHistoryDateRangeMenuTab((currentTab) =>
      currentTab === callHistoryTab ? null : (callHistoryTab as HistoryDateRangeTab)
    );
  };
  const handleToggleActiveCallHistoryTimeMenu = () => {
    if (!isCallHistoryTimeDropdownTab) {
      return;
    }

    setActiveCallHistoryTimeMenuTab((currentTab) =>
      currentTab === callHistoryTab ? null : (callHistoryTab as HistoryTimeDropdownTab)
    );
  };
  const handleSelectActiveCallHistoryTime = (value: string) => {
    if (!isCallHistoryTimeDropdownTab) {
      return;
    }

    handleSelectCallHistoryTime(callHistoryTab as HistoryTimeDropdownTab, value);
  };
  const handleToggleActiveCallHistoryTimeSort = () => {
    if (!isCallHistoryTimeDropdownTab) {
      return;
    }

    handleToggleCallHistoryTimeSort(callHistoryTab as HistoryTimeDropdownTab);
  };
  const callRobotPanelContent = (
    <CallAgentPanel
      insight={callAgentInsight}
      quickCards={callAgentQuickCards}
      journeyName={callAgentProfile.name}
      profile={callAgentProfile}
      openTickets={callAgentOpenTickets}
      purchasedDeviceCount={0}
      interactionCount={0}
    />
  );
  const handleOnlineSessionDisconnectRequest = () => {
    if (!isOnlineSessionConnected) {
      return;
    }

    setShowOnlineEndSessionConfirm(true);
  };
  const handleOnlineSessionDisconnectConfirm = () => {
    setOnlineSessions((prev) =>
      prev.map((session) =>
        session.id === activeOnlineSessionId
          ? {
              ...session,
              finished: true,
              waiting: '刚刚',
              statusText: '已结束',
              statusCls: 'text-slate-400',
              listState: 'default',
            }
          : session
      )
    );

    setOnlineSessionListTab('结束会话');
    setIsOnlineSessionConnected(false);

    setShowOnlineEndSessionConfirm(false);
  };
  const handleOnlineSessionConnectionToggle = () => {
    handleOnlineSessionDisconnectRequest();
  };
  const handleOpenOnlineCallOverlay = (overlay: OnlineCallOverlay) => {
    setCallOverlayPos({ x: -1, y: -1 });
    setActiveOnlineCallOverlay(overlay);
  };
  const handleCloseOnlineCallOverlay = () => {
    setActiveOnlineCallOverlay(null);
  };
  const handleCallOverlayDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest('[data-call-overlay]') as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const parentRect = el.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    callOverlayDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left - parentRect.left,
      origY: rect.top - parentRect.top,
    };
    const onMove = (ev: MouseEvent) => {
      if (!callOverlayDragRef.current) return;
      const dx = ev.clientX - callOverlayDragRef.current.startX;
      const dy = ev.clientY - callOverlayDragRef.current.startY;
      setCallOverlayPos({
        x: callOverlayDragRef.current.origX + dx,
        y: callOverlayDragRef.current.origY + dy,
      });
    };
    const onUp = () => {
      callOverlayDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  const handleOnlineComposerPrimaryToolClick = (label: string) => {
    if (label === '表单') {
      setSelectedOnlineFormFields([]);
      setIsOnlineFormSelectModalOpen(true);
      return;
    }

    if (label === '语音') {
      handleOpenOnlineCallOverlay('audio');
      return;
    }

    if (label === '视频') {
      handleOpenOnlineCallOverlay('video');
    }
  };
  const handleCloseOnlineFormSelectModal = () => {
    setIsOnlineFormSelectModalOpen(false);
    setSelectedOnlineFormFields([]);
  };
  const handleToggleOnlineFormField = (field: OnlineFormFieldOption) => {
    setSelectedOnlineFormFields((prev) =>
      prev.includes(field) ? prev.filter((item) => item !== field) : [...prev, field]
    );
  };
  const handleConfirmOnlineFormSelect = () => {
    setIsOnlineFormSelectModalOpen(false);
  };
  const handleSubmitOnlineComposer = () => {
    const nextMessageText = activeOnlineComposerText.trim();

    if (!nextMessageText) {
      return;
    }

    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const nextMessageTime = `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const nextMessage: OnlineConversationMessage = {
      id: `${activeOnlineSessionId}-m-${now.getTime()}`,
      role: 'agent',
      time: nextMessageTime,
      text: nextMessageText,
    };
    const currentMessages = onlineSessionMessagesBySession[activeOnlineSessionId] ?? activeOnlineSessionDetail.messages;
    const nextMessages = [...currentMessages, nextMessage];
    const nextSummaryText = getOnlineSessionSummaryPreview(nextMessages);
    setOnlineSessionMessagesBySession((prev) => ({
      ...prev,
      [activeOnlineSessionId]: nextMessages,
    }));
    setOnlineSessions((prev) =>
      prev.map((session) =>
        session.id === activeOnlineSessionId
          ? {
              ...session,
              summary: nextSummaryText,
            }
          : session
      )
    );
    setOnlineComposerTextBySession((prev) => ({
      ...prev,
      [activeOnlineSessionId]: '',
    }));
  };
  const handleOpenOnlineMessageTranslateMenu = (messageId: string) => {
    setActiveOnlineMessageTranslateMenuId((prev) => (prev === messageId ? null : messageId));
  };
  const handleSelectOnlineMessageTranslationLanguage = (
    message: OnlineConversationMessage,
    targetLanguage: OnlineMessageTranslateLanguage
  ) => {
    if (getOnlineMessageSourceLanguage(message) === targetLanguage) {
      setOnlineMessageTranslationLanguageById((prev) => {
        const next = { ...prev };
        delete next[message.id];
        return next;
      });
      setActiveOnlineMessageTranslateMenuId(null);
      return;
    }

    setOnlineMessageTranslationLanguageById((prev) => ({
      ...prev,
      [message.id]: targetLanguage,
    }));
    setActiveOnlineMessageTranslateMenuId(null);
  };
  const handleRequestWithdrawOnlineMessage = (messageId: string) => {
    setPendingOnlineWithdrawMessage({
      sessionId: activeOnlineSessionId,
      messageId,
    });
  };
  const handleCloseOnlineWithdrawConfirm = () => {
    setPendingOnlineWithdrawMessage(null);
  };
  const handleConfirmWithdrawOnlineMessage = () => {
    if (!pendingOnlineWithdrawMessage) {
      return;
    }

    const { sessionId, messageId } = pendingOnlineWithdrawMessage;
    const sessionDetail = onlineSessionDetails[sessionId] ?? onlineSessionDetails['sess-2'];
    const currentMessages = onlineSessionMessagesBySession[sessionId] ?? sessionDetail.messages;
    const withdrawnMessage = currentMessages.find((message) => message.id === messageId);

    if (!withdrawnMessage) {
      setPendingOnlineWithdrawMessage(null);
      return;
    }

    const nextMessages = currentMessages.filter((message) => message.id !== messageId);

    setOnlineSessionMessagesBySession((prev) => ({
      ...prev,
      [sessionId]: nextMessages,
    }));
    setOnlineWithdrawNoticeBySession((prev) => ({
      ...prev,
      [sessionId]: {
        messageId: withdrawnMessage.id,
        text: withdrawnMessage.text,
      },
    }));
    setOnlineSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              summary: getOnlineSessionSummaryPreview(nextMessages),
            }
          : session
      )
    );
    setPendingOnlineWithdrawMessage(null);
  };
  const handleReEditWithdrawnOnlineMessage = (sessionId: string, text: string) => {
    setOnlineComposerTextBySession((prev) => ({
      ...prev,
      [sessionId]: text,
    }));
    setTimeout(() => {
      onlineComposerTextareaRef.current?.focus();
    }, 0);
  };
  const onlineCallContactName = '宋美琪';
  const onlineAudioCallDuration = '00:20:29';
  const onlineVideoCallDuration = '07:29';
  const onlineAudioCallControls = [
    { label: '静音', iconSrc: onlineCallMuteIcon },
    { label: '外放', iconSrc: onlineCallSpeakerIcon },
    { label: '摄像头', iconSrc: onlineCallVideoIcon, onClick: () => handleOpenOnlineCallOverlay('video') },
  ];
  const onlineVideoCallControls = [
    { label: '静音', iconSrc: onlineCallMuteIcon },
    { label: '外放', iconSrc: onlineCallSpeakerIcon },
    { label: '摄像头', iconSrc: onlineCallVideoIcon },
  ];
  const onlineComposerPrimaryTools = [
    { label: '表情', icon: Smile },
    { label: '截图', imageSrc: chatScreenshotIcon },
    { label: '图片/文件', icon: Paperclip },
    { label: '表单', icon: FilePen },
    { label: '语音', imageSrc: chatVoiceIcon },
    { label: '视频', icon: Video },
    { label: '远程控制', icon: ScreenShare },
  ];
  const onlineComposerSecondaryTools: Array<{
    label: string;
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    imageSrc?: string;
  }> = [
    { label: '翻译', imageSrc: chatTranslateIcon },
    { label: '常用工具', imageSrc: chatUtilityIcon },
    { label: '话术', imageSrc: chatSuggestionIcon },
  ];
  const normalizedOnlineSuggestionKeyword = onlineSuggestionKeyword.trim();
  const isOnlineSuggestionSearching = normalizedOnlineSuggestionKeyword.length > 0;
  const visibleOnlineSuggestionGroups = onlineSuggestionGroups
    .map((group) => {
      if (!normalizedOnlineSuggestionKeyword) {
        return group;
      }

      const filteredItems =
        group.label.includes(normalizedOnlineSuggestionKeyword)
          ? [...group.items]
          : group.items.filter((item) => item.includes(normalizedOnlineSuggestionKeyword));

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0);
  const handleToggleOnlineSuggestionMenu = () => {
    if (isOnlineSuggestionMenuOpen) {
      handleCloseOnlineSuggestionMenu();
      return;
    }

    handleCloseOnlineComposerTranslateMenu();
    setIsOnlineSuggestionMenuOpen(true);
  };
  const handleToggleOnlineComposerTranslateMenu = () => {
    if (isOnlineComposerTranslateMenuOpen) {
      handleCloseOnlineComposerTranslateMenu();
      return;
    }

    handleCloseOnlineSuggestionMenu();
    setIsOnlineComposerTranslateMenuOpen(true);
  };
  const handleSelectOnlineComposerTranslateLanguage = (language: OnlineMessageTranslateLanguage) => {
    setOnlineComposerTranslateLanguage(language);
    handleCloseOnlineComposerTranslateMenu();
  };
  const handleToggleOnlineSuggestionGroup = (groupLabel: string) => {
    setExpandedOnlineSuggestionGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };
  const handleApplyOnlineSuggestion = (text: string) => {
    updateActiveOnlineComposerText((prev) => (prev.trim() ? `${prev.trimEnd()}\n${text}` : text));
    handleCloseOnlineSuggestionMenu();
  };
  const orderedOnlineSidebarFeatures = onlineSidebarOrder.map((key) => onlineSidebarFeatureDefinitionMap[key]);
  const visibleOnlineSidebarButtons = orderedOnlineSidebarFeatures.filter(
    (item) => item.key === 'settings' || onlineSidebarVisibility[item.key]
  );
  const handleToggleOnlineFeatureSettings = () => {
    setIsOnlineFeatureSettingsOpen((open) => !open);
  };
  const handleToggleOnlineThirdPartySettings = () => {
    if (isOnlineThirdPartySettingsOpen) {
      handleCloseOnlineThirdPartySettings();
      return;
    }

    setPendingOnlineThirdPartyDefaultScope(onlineThirdPartyDefaultScope);
    setIsOnlineThirdPartySettingsOpen(true);
  };
  const handleSelectPendingOnlineThirdPartyDefaultScope = (scope: OnlineThirdPartyScope) => {
    setPendingOnlineThirdPartyDefaultScope(scope);
  };
  const handleApplyOnlineThirdPartySettings = () => {
    setOnlineThirdPartyDefaultScope(pendingOnlineThirdPartyDefaultScope);
    setOnlineThirdPartyScope(pendingOnlineThirdPartyDefaultScope);
    setIsOnlineThirdPartySettingsOpen(false);
  };
  const renderThirdPartySystemPanelContent = (
    title: string,
    settingsTriggerRef: React.RefObject<HTMLButtonElement | null>,
    settingsAriaLabel: string
  ) => (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-5">
          <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
          <div className="flex overflow-hidden rounded-[8px] border border-[#dce4ec] bg-white">
            {onlineThirdPartyScopes.map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => setOnlineThirdPartyScope(scope)}
                className={cn(
                  "min-w-[92px] px-6 py-1.5 text-[12px] font-medium transition-colors",
                  onlineThirdPartyScope === scope
                    ? "bg-[#dff6f0] text-[#19b69f]"
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {scope === 'public' ? '公共' : '个人'}
              </button>
            ))}
          </div>
        </div>
        <button
          ref={settingsTriggerRef}
          type="button"
          aria-label={settingsAriaLabel}
          title="默认设置"
          data-dropdown-root="true"
          onClick={handleToggleOnlineThirdPartySettings}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            isOnlineThirdPartySettingsOpen
              ? "bg-[#eefaf7] text-[#19b69f]"
              : "text-slate-400 hover:bg-slate-50 hover:text-slate-500"
          )}
        >
          <Settings size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="搜索"
            className="h-9 w-full rounded-full border border-slate-200 bg-[#fcfcfd] pl-9 pr-8 text-[12px] text-slate-500 outline-none"
          />
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
        </div>
        <div className="space-y-7">
          {onlineThirdPartyLinks[onlineThirdPartyScope].map((group) => {
            const groupKey = `${onlineThirdPartyScope}-${group.group}`;
            const isExpanded = expandedThirdPartyGroups[groupKey] ?? false;
            return (
              <section key={group.group} className="space-y-4">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => toggleThirdPartyGroup(groupKey)}
                  className="flex w-full items-center gap-2 text-left text-[15px] font-semibold text-slate-800 transition-colors hover:text-slate-900"
                >
                  <ChevronRight
                    size={16}
                    className={cn(
                      'text-slate-500 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                  <span>{group.group}</span>
                </button>
                {isExpanded ? (
                  <div className="flex flex-wrap gap-3 pl-6">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="min-h-[36px] rounded-[12px] border border-[#d6dce5] bg-white px-5 text-[13px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#bcc7d4] hover:bg-slate-50"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
      {isOnlineThirdPartySettingsOpen
        ? renderFloatingMenu(
            settingsTriggerRef.current,
            <div className="overflow-hidden rounded-[14px] border border-[#e7edf3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
              <div className="px-5 py-4 text-[14px] font-semibold text-slate-700">默认设置</div>
              <div className="space-y-4 px-5 pb-4">
                {([
                  { scope: 'public' as const, label: '默认选中公共部分' },
                  { scope: 'personal' as const, label: '默认选中个人部分' },
                ]).map((item) => {
                  const isSelected = pendingOnlineThirdPartyDefaultScope === item.scope;

                  return (
                    <button
                      key={item.scope}
                      type="button"
                      onClick={() => handleSelectPendingOnlineThirdPartyDefaultScope(item.scope)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-[10px] border px-4 py-3 text-left text-[13px] transition-colors",
                        isSelected
                          ? "border-[#8ee8db] bg-[#ecfbf8] text-[#11c5ab]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                          isSelected
                            ? "border-[#11c5ab] bg-[#11c5ab] text-white"
                            : "border-slate-300 bg-white text-transparent"
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={handleCloseOnlineThirdPartySettings}
                  className="flex h-[32px] min-w-[70px] items-center justify-center rounded-full border border-[#e4e8ef] bg-white px-4 text-[12px] text-[#6f7782] transition-colors hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleApplyOnlineThirdPartySettings}
                  className="flex h-[32px] min-w-[78px] items-center justify-center rounded-full border border-[#8ee8db] bg-[#ecfbf8] px-4 text-[12px] font-medium text-[#11c5ab] transition-colors hover:bg-[#dff8f3]"
                >
                  确定
                </button>
              </div>
            </div>,
            { align: 'right', marginTop: 12, width: 230, placement: 'bottom' }
          )
        : null}
    </>
  );
  const handleToggleCallFeatureSettings = () => {
    setIsCallFeatureSettingsOpen((open) => !open);
  };
  const handleOpenCallRightPanel = (panel: CallRightPanel) => {
    handleCloseCallFeatureSettings();
    setCallRightPanel(panel);

    if (panel === 'workorder') {
      setWorkbenchToolTab('工单管理');
      return;
    }

    if (panel === 'knowledge') {
      setWorkbenchToolTab('知识库');
      return;
    }

    if (panel === 'toolsite' && !['常用工具', '第三方网站'].includes(workbenchToolTab)) {
      setWorkbenchToolTab('常用工具');
    }
  };
  const orderedCallSidebarFeatures = callSidebarOrder.map((key) => callSidebarFeatureDefinitionMap[key]);
  const visibleCallSidebarButtons = orderedCallSidebarFeatures.filter(
    (item) => item.key === 'settings' || callSidebarVisibility[item.key]
  );
  const renderCallWorkbenchToolSection = (
    tabs: readonly WorkbenchToolTab[],
    title?: string
  ) => {
    const resolvedToolTab = tabs.includes(workbenchToolTab) ? workbenchToolTab : tabs[0];

    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {tabs.length > 1 ? (
          <div className="flex shrink-0 items-center gap-5 border-b border-slate-100 px-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setWorkbenchToolTab(tab)}
                className={cn(
                  "relative py-3 text-[12px] font-semibold transition-colors",
                  resolvedToolTab === tab ? "text-emerald-500" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab}
                {resolvedToolTab === tab ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500" /> : null}
              </button>
            ))}
          </div>
        ) : resolvedToolTab !== '第三方网站' ? (
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <h2 className="text-[14px] font-bold text-slate-800">{title ?? resolvedToolTab}</h2>
          </div>
        ) : null}
        {resolvedToolTab === '第三方网站' ? (
          renderThirdPartySystemPanelContent(
            '第三方网站',
            callWorkbenchThirdPartySettingsTriggerRef,
            '打开第三方网站默认设置'
          )
        ) : (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-3 gap-3">
              {workbenchToolItems[resolvedToolTab].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="rounded-lg border border-slate-100 bg-[#f7f8fb] px-2.5 py-3.5 text-center transition-colors hover:border-slate-200 hover:bg-white"
                >
                  {item.imageSrc ? (
                    <div className="mx-auto flex h-[30px] w-[30px] items-center justify-center">
                      <img src={item.imageSrc} alt="" className="h-[30px] w-[30px] object-contain" />
                    </div>
                  ) : (
                    <div className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-lg", item.bg)}>
                      {item.icon ? <item.icon size={16} className={item.accent} /> : null}
                    </div>
                  )}
                  <div className="mt-2 text-[12px] font-medium text-slate-600">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };
  const isTopHeaderSignedIn = topHeaderPresence === 'signed-in';
  const topHeaderPresenceMeta = agentPresenceMetaMap[topHeaderPresence];
  const onlineLeftPresenceMeta = agentPresenceMetaMap[onlineLeftPresence];
  const toggleTopHeaderPresence = () => {
    setTopHeaderPresence(toggleAgentPresence);
    setIsCallAddNewMode(false);
  };
  const toggleOnlineLeftPresence = () => {
    setOnlineLeftPresence(toggleAgentPresence);
  };
  useEffect(() => {
    if (onlineLeftPresence === 'signed-out') {
      setIsOnlineStatusMenuOpen(false);
    }
  }, [onlineLeftPresence]);
  const getCallLeftPanelBounds = (layoutWidth: number, viewportWidth: number) => {
    const minWidth = CALL_LEFT_PANEL_MIN_WIDTH;
    const maxWidth = Math.min(viewportWidth * 0.45, layoutWidth * 0.45);

    return { minWidth, maxWidth };
  };

  const getCallLeftPanelDefaultWidth = (layoutWidth: number, viewportWidth: number) => {
    const { minWidth, maxWidth } = getCallLeftPanelBounds(layoutWidth, viewportWidth);
    const expectedWidth =
      (layoutWidth - CALL_WORKBENCH_RESIZER_WIDTH * 2) * CALL_LEFT_PANEL_DEFAULT_RATIO -
      CALL_LEFT_PANEL_DEFAULT_OFFSET;

    return Math.min(Math.max(expectedWidth, minWidth), maxWidth);
  };

  const getCallCenterPanelBounds = (layoutWidth: number, leftPanelWidth: number) => {
    const availableWidth = Math.max(layoutWidth - leftPanelWidth - CALL_WORKBENCH_RESIZER_WIDTH, 0);
    const maxWidth = Math.max(availableWidth - CALL_RIGHT_PANEL_MIN_WIDTH - CALL_WORKBENCH_RESIZER_WIDTH, 0);
    const minWidth = Math.min(
      CALL_CENTER_PANEL_MIN_WIDTH,
      maxWidth || Math.max(availableWidth - CALL_WORKBENCH_RESIZER_WIDTH, 0)
    );

    return { minWidth, maxWidth: Math.max(minWidth, maxWidth), availableWidth };
  };

  const getCallCenterPanelDefaultWidth = (layoutWidth: number, leftPanelWidth: number) => {
    const { minWidth, maxWidth, availableWidth } = getCallCenterPanelBounds(layoutWidth, leftPanelWidth);
    const expectedWidth = (availableWidth - CALL_WORKBENCH_RESIZER_WIDTH) * CALL_CENTER_PANEL_DEFAULT_RATIO;

    return Math.min(Math.max(expectedWidth, minWidth), maxWidth);
  };
  const getCallVerticalPanelBounds = (stackHeight: number, resizerHeight: number) => {
    const availableHeight = Math.max(stackHeight - resizerHeight, 0);
    const maxHeight = Math.max(availableHeight - CALL_STACK_PANEL_MIN_HEIGHT, 0);
    const minHeight = Math.min(
      CALL_STACK_PANEL_MIN_HEIGHT,
      maxHeight || Math.max(availableHeight, 0)
    );

    return { minHeight, maxHeight: Math.max(minHeight, maxHeight), availableHeight };
  };

  const getCallVerticalPanelDefaultHeight = (stackHeight: number, resizerHeight: number) => {
    const { minHeight, maxHeight, availableHeight } = getCallVerticalPanelBounds(stackHeight, resizerHeight);
    const expectedHeight = availableHeight / 2;

    return Math.min(Math.max(expectedHeight, minHeight), maxHeight);
  };
  const getOnlineLeftPanelBounds = (layoutWidth: number, viewportWidth: number) => {
    const minWidth = ONLINE_LEFT_PANEL_MIN_WIDTH;
    const maxWidth = Math.min(viewportWidth * 0.5, layoutWidth * 0.5);

    return { minWidth, maxWidth };
  };

  const getOnlineLeftPanelDefaultWidth = (layoutWidth: number, viewportWidth: number) => {
    const { minWidth, maxWidth } = getOnlineLeftPanelBounds(layoutWidth, viewportWidth);
    const expectedWidth = layoutWidth * ONLINE_LEFT_PANEL_DEFAULT_RATIO;

    return Math.min(Math.max(expectedWidth, minWidth), maxWidth);
  };

  const getOnlineCenterPanelBounds = (layoutWidth: number, leftPanelWidth: number) => {
    const availableWidth = Math.max(layoutWidth - leftPanelWidth - ONLINE_WORKBENCH_LAYOUT_GAP, 0);
    const maxWidth = Math.max(availableWidth - ONLINE_RIGHT_PANEL_MIN_WIDTH - ONLINE_CENTER_RESIZER_WIDTH, 0);
    const minWidth = Math.min(ONLINE_CENTER_PANEL_MIN_WIDTH, maxWidth || Math.max(availableWidth - ONLINE_CENTER_RESIZER_WIDTH, 0));

    return { minWidth, maxWidth: Math.max(minWidth, maxWidth), availableWidth };
  };

  const getOnlineCenterPanelDefaultWidth = (layoutWidth: number, leftPanelWidth: number) => {
    const { minWidth, maxWidth, availableWidth } = getOnlineCenterPanelBounds(layoutWidth, leftPanelWidth);
    const expectedWidth = (availableWidth - ONLINE_CENTER_RESIZER_WIDTH) * ONLINE_CENTER_PANEL_DEFAULT_RATIO;

    return Math.min(Math.max(expectedWidth, minWidth), maxWidth);
  };

  const getOnlineRightTopPanelBounds = (stackHeight: number) => {
    const availableHeight = Math.max(stackHeight - ONLINE_RIGHT_RESIZER_HEIGHT, 0);
    const maxHeight = Math.max(availableHeight - ONLINE_RIGHT_BOTTOM_PANEL_MIN_HEIGHT, 0);
    const minHeight = Math.min(
      ONLINE_RIGHT_TOP_PANEL_MIN_HEIGHT,
      maxHeight || Math.max(availableHeight, 0)
    );

    return { minHeight, maxHeight: Math.max(minHeight, maxHeight), availableHeight };
  };

  const getOnlineRightTopPanelDefaultHeight = (stackHeight: number) => {
    const { minHeight, maxHeight, availableHeight } = getOnlineRightTopPanelBounds(stackHeight);
    const expectedHeight = availableHeight * ONLINE_RIGHT_TOP_PANEL_DEFAULT_RATIO;

    return Math.min(Math.max(expectedHeight, minHeight), maxHeight);
  };

  const onlineSessionChannelIcons: Record<string, string> = {
    微信公众号: channelWechatServiceIcon,
    微信小程序: channelWechatMiniProgramIcon,
    APP: channelMobileIcon,
    PC: channelWebIcon,
  };

  const onlineSessionSummaryRoleById = onlineSessions.reduce<Record<string, 'customer' | 'agent'>>(
    (acc, session) => {
      const sessionMessages =
        onlineSessionMessagesBySession[session.id] ?? onlineSessionDetails[session.id]?.messages ?? [];
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      if (lastMessage) {
        acc[session.id] = lastMessage.role;
      }
      return acc;
    },
    {}
  );
  const visibleOnlineSessions = onlineSessions
    .filter((session) => !blockedOnlineSessionIds.includes(session.id))
    .filter((session) => (onlineSessionListTab === '活动会话' ? !session.finished : session.finished))
    .sort((sessionA, sessionB) => {
      const pinnedIndexA = pinnedOnlineSessionIds.indexOf(sessionA.id);
      const pinnedIndexB = pinnedOnlineSessionIds.indexOf(sessionB.id);
      const isPinnedA = pinnedIndexA !== -1;
      const isPinnedB = pinnedIndexB !== -1;

      if (isPinnedA && isPinnedB) {
        return pinnedIndexA - pinnedIndexB;
      }

      if (isPinnedA) {
        return -1;
      }

      if (isPinnedB) {
        return 1;
      }

      return 0;
    });
  const hasVisibleOnlineSessions = visibleOnlineSessions.length > 0;
  const fallbackOnlineSession = onlineSessions[0] ?? initialOnlineSessions[0];
  const getOnlineSessionChannelIcon = (channel: string) =>
    onlineSessionChannelIcons[channel] ?? channelWebIcon;
  const activeOnlineSession =
    (hasVisibleOnlineSessions
      ? visibleOnlineSessions.find((session) => session.id === activeOnlineSessionId) ?? visibleOnlineSessions[0]
      : onlineSessions.find((session) => session.id === activeOnlineSessionId)) ?? fallbackOnlineSession;
  const activeOnlineSessionDetail = onlineSessionDetails[activeOnlineSession.id] ?? onlineSessionDetails['sess-2'];
  const taggingModalTags =
    taggingModalSource === 'call'
      ? callTags
      : taggingModalSource === 'online'
        ? (onlineTagsBySession[activeOnlineSession.id] ?? [])
        : [];
  const activeOnlineConversationMessages =
    onlineSessionMessagesBySession[activeOnlineSession.id] ?? activeOnlineSessionDetail.messages;
  const activeOnlineWithdrawNotice = onlineWithdrawNoticeBySession[activeOnlineSession.id] ?? null;
  const isActiveOnlineSessionFinished = activeOnlineSession?.finished ?? false;
  const isOnlineComposerDisabled = !isOnlineSessionConnected && !isActiveOnlineSessionFinished;
  const onlineComposerActionLabel = isActiveOnlineSessionFinished ? '留言' : '发送';
  const activeOnlineRobotPanel = activeOnlineSessionDetail.robotPanel;
  const activeOnlineCustomerAnonymous =
    onlineCustomerAnonymousBySession[activeOnlineSession.id] ?? activeOnlineSessionDetail.customerProfile.anonymous;
  const activeOnlineBusinessType =
    onlineBusinessTypeBySession[activeOnlineSession.id] ?? activeOnlineSessionDetail.customerProfile.businessType;
  const activeOnlineCustomerFieldValues =
    onlineCustomerFieldValuesBySession[activeOnlineSession.id] ?? activeOnlineSessionDetail.customerProfile.fieldValues;
  const activeOnlineAgentPanel =
    onlineAgentPanelDataBySession[activeOnlineSession.id] ?? onlineAgentPanelDataBySession['sess-2'];
  const activeOnlineHistoryPanelMeta = activeOnlineSessionDetail.historyPanelMeta[onlineWorkbenchHistoryTab];
  const isOnlineHistoryDateRangeTab = onlineWorkbenchHistoryTab === '短信历史' || onlineWorkbenchHistoryTab === '邮件历史';
  const onlineHistorySummaryLabel = isOnlineHistoryDateRangeTab ? '共5次' : activeOnlineHistoryPanelMeta.total;
  const isOnlineHistoryTimeDropdownTab = onlineWorkbenchHistoryTab === '通话历史' || onlineWorkbenchHistoryTab === '会话历史';
  const activeOnlineHistoryDateRange =
    onlineWorkbenchHistoryTab === '邮件历史' ? onlineMailHistoryDateRange : onlineSmsHistoryDateRange;
  const activeOnlineHistoryTime =
    isOnlineHistoryTimeDropdownTab
      ? onlineHistoryTimeDropdown.selectedByTab[onlineWorkbenchHistoryTab as HistoryTimeDropdownTab]
      : '';
  const updateActiveOnlineHistoryDateRange = (key: keyof HistoryDateRangeValue, value: string) => {
    if (onlineWorkbenchHistoryTab === '邮件历史') {
      setOnlineMailHistoryDateRange((prev) => ({
        ...prev,
        [key]: value,
      }));
      return;
    }

    if (onlineWorkbenchHistoryTab === '短信历史') {
      setOnlineSmsHistoryDateRange((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };
  const handleSelectOnlineHistoryTime = (tab: HistoryTimeDropdownTab, value: string) => {
    setOnlineHistoryTimeDropdown((prev) => ({
      ...prev,
      selectedByTab: {
        ...prev.selectedByTab,
        [tab]: value,
      },
    }));
    setActiveOnlineHistoryTimeMenuTab(null);
  };
  const handleToggleOnlineHistoryTimeSort = (tab: HistoryTimeDropdownTab) => {
    setOnlineHistoryTimeDropdown((prev) => toggleHistoryTimeDropdownSort(prev, tab));
  };
  const activeOnlineComposerText = onlineComposerTextBySession[activeOnlineSession.id] ?? '';
  const updateActiveOnlineCustomerFieldValues: React.Dispatch<React.SetStateAction<WorkbenchFieldValues>> = (updater) => {
    setOnlineCustomerFieldValuesBySession((prev) => {
      const currentValue = prev[activeOnlineSession.id] ?? activeOnlineSessionDetail.customerProfile.fieldValues;
      const nextValue = typeof updater === 'function' ? updater(currentValue) : updater;

      return {
        ...prev,
        [activeOnlineSession.id]: nextValue,
      };
    });
  };
  const updateActiveOnlineComposerText: React.Dispatch<React.SetStateAction<string>> = (updater) => {
    setOnlineComposerTextBySession((prev) => {
      const currentValue = prev[activeOnlineSession.id] ?? '';
      const nextValue = typeof updater === 'function' ? updater(currentValue) : updater;

      return {
        ...prev,
        [activeOnlineSession.id]: nextValue,
      };
    });
  };
  const handleQuoteOnlineOpeningQuestion = (text: string) => {
    updateActiveOnlineComposerText(text);
    setTimeout(() => {
      onlineComposerTextareaRef.current?.focus();
      onlineComposerTextareaRef.current?.setSelectionRange(text.length, text.length);
    }, 0);
  };
  const handleToggleActiveOnlineCustomerAnonymous = () => {
    setOnlineCustomerAnonymousBySession((prev) => ({
      ...prev,
      [activeOnlineSession.id]: !activeOnlineCustomerAnonymous,
    }));
  };
  const handleSelectActiveOnlineBusinessType = (option: string) => {
    setOnlineBusinessTypeBySession((prev) => ({
      ...prev,
      [activeOnlineSession.id]: option,
    }));
    setIsOnlineBusinessTypeMenuOpen(false);
  };
  const handleResetActiveOnlineCustomerProfile = () => {
    setOnlineCustomerAnonymousBySession((prev) => ({
      ...prev,
      [activeOnlineSession.id]: activeOnlineSessionDetail.customerProfile.anonymous,
    }));
    setOnlineBusinessTypeBySession((prev) => ({
      ...prev,
      [activeOnlineSession.id]: activeOnlineSessionDetail.customerProfile.businessType,
    }));
    setOnlineCustomerFieldValuesBySession((prev) => ({
      ...prev,
      [activeOnlineSession.id]: { ...activeOnlineSessionDetail.customerProfile.fieldValues },
    }));
    setOnlineCustomerOpenSelect(null);
    setIsOnlineBusinessTypeMenuOpen(false);
    setOnlineCustomerRegionSelection(
      activeOnlineSessionDetail.customerProfile.fieldValues['省市区']
        ? parseRegionValue(activeOnlineSessionDetail.customerProfile.fieldValues['省市区'])
        : getDefaultRegionSelection()
    );
  };
  const handleOpenOnlineScheduleFollowUpModal = () => {
    setShowOnlineScheduleFollowUpModal(true);
  };
  const handleCloseOnlineScheduleFollowUpModal = () => {
    setShowOnlineScheduleFollowUpModal(false);
  };
  const handleOpenOnlineSessionContextMenu = (event: React.MouseEvent<HTMLButtonElement>, sessionId: string) => {
    event.preventDefault();

    const menuWidth = 112;
    const menuHeight = 124;
    const viewportPadding = 12;
    const resolvedX = Math.min(event.clientX, window.innerWidth - viewportPadding - menuWidth);
    const resolvedY = Math.min(event.clientY, window.innerHeight - viewportPadding - menuHeight);

    setOnlineSessionContextMenu({
      sessionId,
      x: Math.max(viewportPadding, resolvedX),
      y: Math.max(viewportPadding, resolvedY),
    });
  };
  const handleSelectOnlineSession = (sessionId: string) => {
    setActiveOnlineSessionId(sessionId);
    setOnlineSessionContextMenu(null);
  };
  const handlePinOnlineSession = (sessionId: string) => {
    setPinnedOnlineSessionIds((prev) => [sessionId, ...prev.filter((id) => id !== sessionId)]);
    setOnlineSessionContextMenu(null);
  };
  const handleUnpinOnlineSession = (sessionId: string) => {
    setPinnedOnlineSessionIds((prev) => prev.filter((id) => id !== sessionId));
    setOnlineSessionContextMenu(null);
  };
  const handleToggleOnlineSessionPin = (sessionId: string) => {
    if (pinnedOnlineSessionIds.includes(sessionId)) {
      handleUnpinOnlineSession(sessionId);
      return;
    }

    handlePinOnlineSession(sessionId);
  };
  const handleToggleOnlineSessionLock = (sessionId: string) => {
    setLockedOnlineSessionIds((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [sessionId, ...prev]
    );
    setOnlineSessionContextMenu(null);
  };
  const handleOpenOnlineBlockConfirm = (sessionId: string) => {
    const popupWidth = 280;
    const popupHeight = 164;
    const viewportPadding = 12;
    const fallbackX = window.innerWidth / 2 - popupWidth / 2;
    const fallbackY = window.innerHeight / 2 - popupHeight / 2;
    const baseX = onlineSessionContextMenu ? onlineSessionContextMenu.x + 124 : fallbackX;
    const baseY = onlineSessionContextMenu ? onlineSessionContextMenu.y : fallbackY;
    const resolvedX = Math.min(baseX, window.innerWidth - viewportPadding - popupWidth);
    const resolvedY = Math.min(baseY, window.innerHeight - viewportPadding - popupHeight);

    setPendingBlockedOnlineSession({
      sessionId,
      x: Math.max(viewportPadding, resolvedX),
      y: Math.max(viewportPadding, resolvedY),
    });
    setOnlineBlockReason('');
    setOnlineSessionContextMenu(null);
  };
  const handleCloseOnlineBlockConfirm = () => {
    setPendingBlockedOnlineSession(null);
    setOnlineBlockReason('');
  };
  const handleOpenCallBlockConfirm = (anchor: { x: number; y: number }) => {
    const popupWidth = 280;
    const popupHeight = 164;
    const viewportPadding = 12;
    const resolvedX = Math.min(anchor.x, window.innerWidth - viewportPadding - popupWidth);
    const resolvedY = Math.min(
      anchor.y - popupHeight - 8,
      window.innerHeight - viewportPadding - popupHeight
    );
    setPendingCallBlock({
      x: Math.max(viewportPadding, resolvedX),
      y: Math.max(viewportPadding, resolvedY),
    });
    setCallBlockReason('');
  };
  const handleCloseCallBlockConfirm = () => {
    setPendingCallBlock(null);
    setCallBlockReason('');
  };
  const handleConfirmCallBlock = () => {
    setPendingCallBlock(null);
    setCallBlockReason('');
  };
  const handleChangeOnlineSessionListTab = (tab: OnlineSessionListTab) => {
    setOnlineSessionListTab(tab);

    const nextSessions = onlineSessions
      .filter((session) => !blockedOnlineSessionIds.includes(session.id))
      .filter((session) => (tab === '活动会话' ? !session.finished : session.finished));

    if (nextSessions.length > 0 && !nextSessions.some((session) => session.id === activeOnlineSessionId)) {
      setActiveOnlineSessionId(nextSessions[0].id);
    }
  };
  const handleBlockOnlineSession = () => {
    if (!pendingBlockedOnlineSession) {
      return;
    }

    setBlockedOnlineSessionIds((prev) =>
      prev.includes(pendingBlockedOnlineSession.sessionId) ? prev : [...prev, pendingBlockedOnlineSession.sessionId]
    );
    setPendingBlockedOnlineSession(null);
    setOnlineBlockReason('');
  };
  const onlineHistoryMeta: Record<WorkbenchHistoryTab, { subtitle: string; entries: Array<{ time: string; title: string; desc: string }> }> = {
    '会话历史': {
      subtitle: '近 30 天共 18 条会话',
      entries: [
        { time: '10-26 13:22', title: '产品咨询', desc: '咨询学习机型号区别，已发送商品卡。' },
        { time: '10-22 09:18', title: '物流跟进', desc: '客户催促发货，已同步仓储状态。' },
        { time: '10-20 16:45', title: '售后政策', desc: '说明退换规则，并引导提交工单。' },
      ],
    },
    '通话历史': {
      subtitle: '近 30 天共 6 次通话',
      entries: [
        { time: '10-25 15:40', title: '语音回呼', desc: '客户要求电话回访，通话 3m20s。' },
        { time: '10-19 11:03', title: '售后电话', desc: '确认维修地址与联系人信息。' },
        { time: '10-11 17:26', title: '活动咨询', desc: '语音说明分期活动细则。' },
      ],
    },
    '短信历史': {
      subtitle: '近 30 天共 9 条短信',
      entries: [
        { time: '10-27 10:15', title: '活动短信', desc: '发送 AI 学习机活动说明短信。' },
        { time: '10-24 18:20', title: '工单提醒', desc: '同步工单进度与处理时效。' },
        { time: '10-18 09:42', title: '售后地址', desc: '发送售后网点与联系人。' },
      ],
    },
    '邮件历史': {
      subtitle: '近 30 天共 3 封邮件',
      entries: [
        { time: '10-23 14:08', title: '报价清单', desc: '发送学习机套餐报价附件。' },
        { time: '10-16 16:34', title: '维修报告', desc: '发送维修检测报告 PDF。' },
        { time: '10-05 08:56', title: '活动海报', desc: '发送双十一活动预热海报。' },
      ],
    },
  };
  useDragResize({
    active: isCallLeftResizing,
    cursor: 'col-resize',
    getNextValue: (event) => {
      if (!callWorkbenchLayoutRef.current) {
        return null;
      }

      const layoutRect = callWorkbenchLayoutRef.current.getBoundingClientRect();
      const { minWidth, maxWidth } = getCallLeftPanelBounds(layoutRect.width, window.innerWidth);
      return Math.min(Math.max(event.clientX - layoutRect.left, minWidth), maxWidth);
    },
    onValueChange: (nextWidth) => {
      setIsCallLeftPanelCustomized(true);
      setCallLeftPanelWidth(nextWidth);
    },
    onResizeEnd: () => {
      setIsCallLeftResizing(false);
    },
  });

  useDragResize({
    active: isCallCenterResizing,
    cursor: 'col-resize',
    getNextValue: (event) => {
      if (!callWorkbenchLayoutRef.current || !callCenterPanelRef.current) {
        return null;
      }

      const layoutRect = callWorkbenchLayoutRef.current.getBoundingClientRect();
      const centerRect = callCenterPanelRef.current.getBoundingClientRect();
      const { minWidth, maxWidth } = getCallCenterPanelBounds(layoutRect.width, callLeftPanelWidth);
      return Math.min(Math.max(event.clientX - centerRect.left, minWidth), maxWidth);
    },
    onValueChange: (nextWidth) => {
      setIsCallCenterPanelCustomized(true);
      setCallCenterPanelWidth(nextWidth);
    },
    onResizeEnd: () => {
      setIsCallCenterResizing(false);
    },
  });

  usePanelSizeSync(
    {
      enabled: activeTab === '呼叫工作台',
      isCustomized: isCallLeftPanelCustomized,
      getAvailableSize: () => callWorkbenchLayoutRef.current?.getBoundingClientRect().width ?? null,
      setSize: setCallLeftPanelWidth,
      getDefaultSize: (layoutWidth) => getCallLeftPanelDefaultWidth(layoutWidth, window.innerWidth),
      getBounds: (layoutWidth) => {
        const { minWidth, maxWidth } = getCallLeftPanelBounds(layoutWidth, window.innerWidth);
        return { min: minWidth, max: maxWidth };
      },
    }
  );

  usePanelSizeSync(
    {
      enabled: activeTab === '呼叫工作台',
      isCustomized: isCallCenterPanelCustomized,
      getAvailableSize: () => callWorkbenchLayoutRef.current?.getBoundingClientRect().width ?? null,
      setSize: setCallCenterPanelWidth,
      getDefaultSize: (layoutWidth) => getCallCenterPanelDefaultWidth(layoutWidth, callLeftPanelWidth),
      getBounds: (layoutWidth) => {
        const { minWidth, maxWidth } = getCallCenterPanelBounds(layoutWidth, callLeftPanelWidth);
        return { min: minWidth, max: maxWidth };
      },
    },
    [callLeftPanelWidth]
  );

  useDragResize({
    active: isCallLeftTopResizing,
    cursor: 'row-resize',
    getNextValue: (event) => {
      if (!callLeftPanelStackRef.current) {
        return null;
      }

      const stackRect = callLeftPanelStackRef.current.getBoundingClientRect();
      const { minHeight, maxHeight } = getCallVerticalPanelBounds(stackRect.height, CALL_VERTICAL_RESIZER_HEIGHT);
      return Math.min(Math.max(event.clientY - stackRect.top, minHeight), maxHeight);
    },
    onValueChange: (nextHeight) => {
      setIsCallLeftTopPanelCustomized(true);
      setCallLeftTopPanelHeight(nextHeight);
    },
    onResizeEnd: () => {
      setIsCallLeftTopResizing(false);
    },
  });

  useDragResize({
    active: isCallCenterTopResizing,
    cursor: 'row-resize',
    getNextValue: (event) => {
      if (!callCenterPanelStackRef.current) {
        return null;
      }

      const stackRect = callCenterPanelStackRef.current.getBoundingClientRect();
      const { minHeight, maxHeight } = getCallVerticalPanelBounds(stackRect.height, CALL_VERTICAL_RESIZER_HEIGHT);
      return Math.min(Math.max(event.clientY - stackRect.top, minHeight), maxHeight);
    },
    onValueChange: (nextHeight) => {
      setIsCallCenterTopPanelCustomized(true);
      setCallCenterTopPanelHeight(nextHeight);
    },
    onResizeEnd: () => {
      setIsCallCenterTopResizing(false);
    },
  });

  useDragResize({
    active: isCallRightTopResizing,
    cursor: 'row-resize',
    getNextValue: (event) => {
      if (!callRightPanelStackRef.current) {
        return null;
      }

      const stackRect = callRightPanelStackRef.current.getBoundingClientRect();
      const { minHeight, maxHeight } = getCallVerticalPanelBounds(stackRect.height, CALL_RIGHT_VERTICAL_RESIZER_HEIGHT);
      return Math.min(Math.max(event.clientY - stackRect.top, minHeight), maxHeight);
    },
    onValueChange: (nextHeight) => {
      setIsCallRightTopPanelCustomized(true);
      setCallRightTopPanelHeight(nextHeight);
    },
    onResizeEnd: () => {
      setIsCallRightTopResizing(false);
    },
  });

  usePanelSizeSync(
    {
      enabled: activeTab === '呼叫工作台',
      isCustomized: isCallLeftTopPanelCustomized,
      getAvailableSize: () => callLeftPanelStackRef.current?.getBoundingClientRect().height ?? null,
      setSize: setCallLeftTopPanelHeight,
      getDefaultSize: (stackHeight) => getCallVerticalPanelDefaultHeight(stackHeight, CALL_VERTICAL_RESIZER_HEIGHT),
      getBounds: (stackHeight) => {
        const { minHeight, maxHeight } = getCallVerticalPanelBounds(stackHeight, CALL_VERTICAL_RESIZER_HEIGHT);
        return { min: minHeight, max: maxHeight };
      },
    }
  );

  usePanelSizeSync(
    {
      enabled: activeTab === '呼叫工作台',
      isCustomized: isCallCenterTopPanelCustomized,
      getAvailableSize: () => callCenterPanelStackRef.current?.getBoundingClientRect().height ?? null,
      setSize: setCallCenterTopPanelHeight,
      getDefaultSize: (stackHeight) => getCallVerticalPanelDefaultHeight(stackHeight, CALL_VERTICAL_RESIZER_HEIGHT),
      getBounds: (stackHeight) => {
        const { minHeight, maxHeight } = getCallVerticalPanelBounds(stackHeight, CALL_VERTICAL_RESIZER_HEIGHT);
        return { min: minHeight, max: maxHeight };
      },
    }
  );

  usePanelSizeSync(
    {
      enabled: activeTab === '呼叫工作台' && callRightPanel === 'toolsite',
      isCustomized: isCallRightTopPanelCustomized,
      getAvailableSize: () => callRightPanelStackRef.current?.getBoundingClientRect().height ?? null,
      setSize: setCallRightTopPanelHeight,
      getDefaultSize: (stackHeight) =>
        getCallVerticalPanelDefaultHeight(stackHeight, CALL_RIGHT_VERTICAL_RESIZER_HEIGHT),
      getBounds: (stackHeight) => {
        const { minHeight, maxHeight } = getCallVerticalPanelBounds(
          stackHeight,
          CALL_RIGHT_VERTICAL_RESIZER_HEIGHT
        );
        return { min: minHeight, max: maxHeight };
      },
    },
    [callRightPanel]
  );

  useDragResize({
    active: isOnlineLeftResizing,
    cursor: 'col-resize',
    getNextValue: (event) => {
      if (!onlineWorkbenchLayoutRef.current) {
        return null;
      }

      const layoutRect = onlineWorkbenchLayoutRef.current.getBoundingClientRect();
      const { minWidth, maxWidth } = getOnlineLeftPanelBounds(layoutRect.width, window.innerWidth);
      return Math.min(Math.max(event.clientX - layoutRect.left, minWidth), maxWidth);
    },
    onValueChange: (nextWidth) => {
      setIsOnlineLeftPanelCustomized(true);
      setOnlineLeftPanelWidth(nextWidth);
    },
    onResizeEnd: () => {
      setIsOnlineLeftResizing(false);
    },
  });

  useDragResize({
    active: isOnlineCenterResizing,
    cursor: 'col-resize',
    getNextValue: (event) => {
      if (!onlineWorkbenchLayoutRef.current || !onlineCenterPanelRef.current) {
        return null;
      }

      const layoutRect = onlineWorkbenchLayoutRef.current.getBoundingClientRect();
      const centerRect = onlineCenterPanelRef.current.getBoundingClientRect();
      const { minWidth, maxWidth } = getOnlineCenterPanelBounds(layoutRect.width, onlineLeftPanelWidth);
      return Math.min(Math.max(event.clientX - centerRect.left, minWidth), maxWidth);
    },
    onValueChange: (nextWidth) => {
      setIsOnlineCenterPanelCustomized(true);
      setOnlineCenterPanelWidth(nextWidth);
    },
    onResizeEnd: () => {
      setIsOnlineCenterResizing(false);
    },
  });

  useDragResize({
    active: isOnlineRightTopResizing,
    cursor: 'row-resize',
    getNextValue: (event) => {
      if (!onlineRightPanelStackRef.current) {
        return null;
      }

      const stackRect = onlineRightPanelStackRef.current.getBoundingClientRect();
      const { minHeight, maxHeight } = getOnlineRightTopPanelBounds(stackRect.height);
      return Math.min(Math.max(event.clientY - stackRect.top, minHeight), maxHeight);
    },
    onValueChange: (nextHeight) => {
      setIsOnlineRightTopPanelCustomized(true);
      setOnlineRightTopPanelHeight(nextHeight);
    },
    onResizeEnd: () => {
      setIsOnlineRightTopResizing(false);
    },
  });

  usePanelSizeSync(
    {
      enabled: activeTab === '在线工作台',
      isCustomized: isOnlineLeftPanelCustomized,
      getAvailableSize: () => onlineWorkbenchLayoutRef.current?.getBoundingClientRect().width ?? null,
      setSize: setOnlineLeftPanelWidth,
      getDefaultSize: (layoutWidth) => getOnlineLeftPanelDefaultWidth(layoutWidth, window.innerWidth),
      getBounds: (layoutWidth) => {
        const { minWidth, maxWidth } = getOnlineLeftPanelBounds(layoutWidth, window.innerWidth);
        return { min: minWidth, max: maxWidth };
      },
    }
  );

  usePanelSizeSync(
    {
      enabled: activeTab === '在线工作台',
      isCustomized: isOnlineCenterPanelCustomized,
      getAvailableSize: () => onlineWorkbenchLayoutRef.current?.getBoundingClientRect().width ?? null,
      setSize: setOnlineCenterPanelWidth,
      getDefaultSize: (layoutWidth) => getOnlineCenterPanelDefaultWidth(layoutWidth, onlineLeftPanelWidth),
      getBounds: (layoutWidth) => {
        const { minWidth, maxWidth } = getOnlineCenterPanelBounds(layoutWidth, onlineLeftPanelWidth);
        return { min: minWidth, max: maxWidth };
      },
    },
    [onlineLeftPanelWidth]
  );

  usePanelSizeSync(
    {
      enabled: activeTab === '在线工作台' && onlineRightPanel !== 'robot',
      isCustomized: isOnlineRightTopPanelCustomized,
      getAvailableSize: () => onlineRightPanelStackRef.current?.getBoundingClientRect().height ?? null,
      setSize: setOnlineRightTopPanelHeight,
      getDefaultSize: (stackHeight) => getOnlineRightTopPanelDefaultHeight(stackHeight),
      getBounds: (stackHeight) => {
        const { minHeight, maxHeight } = getOnlineRightTopPanelBounds(stackHeight);
        return { min: minHeight, max: maxHeight };
      },
    },
    [onlineRightPanel]
  );

  useEffect(() => {
    if (!isSecondaryMainTab(activeTab)) {
      setLastPrimaryTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (visibleOnlineSessions.length === 0) {
      return;
    }

    if (!visibleOnlineSessions.some((session) => session.id === activeOnlineSessionId)) {
      setActiveOnlineSessionId(visibleOnlineSessions[0].id);
    }
  }, [activeOnlineSessionId, visibleOnlineSessions]);

  useEffect(() => {
    const currentOnlineSession = onlineSessions.find((session) => session.id === activeOnlineSessionId);

    if (!currentOnlineSession) {
      return;
    }

    setIsOnlineSessionConnected(!currentOnlineSession.finished);
  }, [activeOnlineSessionId, onlineSessions]);

  useEffect(() => {
    setOnlineCustomerOpenSelect(null);
    setIsOnlineBusinessTypeMenuOpen(false);
    setActiveOnlineMessageTranslateMenuId(null);
    setIsOnlineFormSelectModalOpen(false);
    setSelectedOnlineFormFields([]);
    setOnlineCustomerRegionSelection(
      activeOnlineSessionDetail.customerProfile.fieldValues['省市区']
        ? parseRegionValue(activeOnlineSessionDetail.customerProfile.fieldValues['省市区'])
        : getDefaultRegionSelection()
    );
  }, [activeOnlineSessionDetail, activeOnlineSessionId]);

  const onlineCustomerFieldsWithLinked = insertLinkedCustomerFields(onlineCustomerFields, onlineLinkedCustomerFields);

  const renderWorkbenchField = (field: WorkbenchFieldConfig) => (
    <div
      key={field.label}
      className={cn(
        "space-y-1.5",
        field.span === 2 && "md:col-span-2",
        field.span === 3 && "md:col-span-3"
      )}
    >
      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
        <span>{field.label}</span>
        {field.required && <span className="text-rose-400">*</span>}
      </div>
      <div className="flex h-[30px] items-center justify-between rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-400 shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)]">
        <span>{field.placeholder}</span>
        {field.type === 'select' && <ChevronDown size={13} className="text-slate-300" />}
      </div>
    </div>
  );

  const renderEditableWorkbenchField = (
    field: WorkbenchFieldConfig,
    fieldValues: WorkbenchFieldValues,
    setFieldValues: React.Dispatch<React.SetStateAction<WorkbenchFieldValues>>,
    openSelect: string | null,
    setOpenSelect: React.Dispatch<React.SetStateAction<string | null>>,
    scope: string,
    regionSelection?: RegionSelection,
    setRegionSelection?: React.Dispatch<React.SetStateAction<RegionSelection>>
  ) => (
    <div
      key={field.label}
      className={cn(
        "space-y-1.5",
        field.span === 2 && "md:col-span-2",
        field.span === 3 && "md:col-span-3"
      )}
    >
      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
        <span>{field.label}</span>
        {field.required && <span className="text-rose-400">*</span>}
      </div>
      {field.type === 'select' ? (
        (() => {
          const showProblemSearch =
            field.label === '问题分类三级' &&
            (scope === 'call-summary' || scope === 'online-summary');
          return (
        <div className={cn(showProblemSearch && 'flex items-center gap-1.5')}>
        <div className={cn('relative', showProblemSearch && 'flex-1')} data-dropdown-root="true">
          {(() => {
            const fieldKey = `${scope}:${field.label}`;
            const isRegionCascader =
              field.label === '省市区' && regionSelection !== undefined && setRegionSelection !== undefined;
            const initialRegionSelection =
              isRegionCascader && fieldValues[field.label]
                ? parseRegionValue(fieldValues[field.label])
                : regionSelection;
            const activeRegionSelection = isRegionCascader
              ? normalizeRegionSelection(openSelect === fieldKey ? regionSelection : initialRegionSelection)
              : null;
            const activeProvince = activeRegionSelection
              ? chinaRegionOptions.find((province) => province.name === activeRegionSelection.province) ?? chinaRegionOptions[0]
              : null;
            const activeCity = activeProvince && activeRegionSelection
              ? activeProvince.cities.find((city) => city.name === activeRegionSelection.city) ?? activeProvince.cities[0]
              : null;

            return (
              <>
            <button
              ref={(node) => {
                floatingSelectTriggerRefs.current[fieldKey] = node;
              }}
              type="button"
            onClick={() => {
              if (isRegionCascader && activeRegionSelection) {
                setRegionSelection(activeRegionSelection);
              }
              setOpenSelect((prev) => (prev === fieldKey ? null : fieldKey));
            }}
            className="flex h-[30px] w-full items-center gap-2 rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-600 outline-none shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)]"
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate whitespace-nowrap text-left",
                fieldValues[field.label] ? "text-slate-600" : "text-slate-400"
              )}
            >
              {fieldValues[field.label] || field.placeholder}
            </span>
            <ChevronDown
              size={13}
              className={cn(
                "shrink-0 text-slate-300 transition-transform",
                openSelect === fieldKey && "rotate-180"
              )}
            />
          </button>
          {openSelect === fieldKey ? (
            isRegionCascader && activeRegionSelection && activeProvince && activeCity ? (
              renderFloatingMenu(
                floatingSelectTriggerRefs.current[fieldKey],
                <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                  <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-500">
                    {['省', '市', '区'].map((title) => (
                      <div key={title} className="px-3 py-2">
                        {title}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                      {chinaRegionOptions.map((province) => (
                        <button
                          key={province.name}
                          type="button"
                          onClick={() => {
                            const nextCity = province.cities[0];
                            setRegionSelection({
                              province: province.name,
                              city: nextCity.name,
                              district: nextCity.districts[0] ?? '',
                            });
                          }}
                          className={cn(
                            "flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors",
                            activeRegionSelection.province === province.name
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {province.name}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                      {activeProvince.cities.map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() =>
                            setRegionSelection((prev) => ({
                              province: activeProvince.name,
                              city: city.name,
                              district: city.districts.includes(prev.district) ? prev.district : city.districts[0] ?? '',
                            }))
                          }
                          className={cn(
                            "flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors",
                            activeRegionSelection.city === city.name
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                      {activeCity.districts.map((district) => (
                        <button
                          key={district}
                          type="button"
                          onClick={() => {
                            const nextSelection = {
                              province: activeProvince.name,
                              city: activeCity.name,
                              district,
                            };
                            setRegionSelection(nextSelection);
                            setFieldValues((prev) => ({
                              ...prev,
                              [field.label]: formatRegionValue(nextSelection),
                            }));
                            setOpenSelect(null);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2 text-left text-[12px] transition-colors",
                            activeRegionSelection.district === district
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <span>{district}</span>
                          {activeRegionSelection.district === district ? <Check size={12} /> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>,
                { align: 'center', marginTop: 4, width: 420 }
              )
            ) : (
              renderFloatingMenu(
                floatingSelectTriggerRefs.current[fieldKey],
                <div className="max-h-44 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)] custom-scrollbar">
                  {(workbenchSelectOptions[field.label] ?? ['选项一', '选项二', '选项三']).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFieldValues((prev) => ({
                          ...prev,
                          [field.label]: option,
                        }));
                        setOpenSelect(null);
                      }}
                      className={cn(
                        "flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors",
                        fieldValues[field.label] === option
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>,
                { marginTop: 4 }
              )
            )
          ) : null}
              </>
            );
          })()}
        </div>
        {showProblemSearch ? (
          <button
            type="button"
            onClick={() => setProblemClassificationSearchScope(scope as 'call-summary' | 'online-summary')}
            aria-label="搜索问题分类"
            title="搜索问题分类"
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-[#fcfcfd] text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-600"
          >
            <Search size={14} />
          </button>
        ) : null}
        </div>
          );
        })()
      ) : (
        <div className="relative">
          <input
            type="text"
            value={fieldValues[field.label] ?? ''}
            onChange={(event) =>
              setFieldValues((prev) => ({
                ...prev,
                [field.label]: event.target.value,
              }))
            }
            placeholder={field.placeholder}
            className="h-[30px] w-full rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-600 outline-none shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)] placeholder:text-slate-400"
          />
        </div>
      )}
    </div>
  );

  const callCustomerInfoPanelContent = (
    <CallCustomerInfoPanel
      onReset={handleResetCallCustomerFields}
      onAddNew={handleAddNewCallCustomer}
      onQueryByPhone={handleQueryCallCustomerByPhone}
      fieldsContent={callCustomerFields.map((field) =>
        renderEditableWorkbenchField(
          field,
          callCustomerFieldValues,
          setCallCustomerFieldValues,
          callCustomerOpenSelect,
          setCallCustomerOpenSelect,
          'call-customer',
          callCustomerRegionSelection,
          setCallCustomerRegionSelection
        )
      )}
    />
  );

  const callInboundInfoPanelContent = (
    <CallInboundInfoPanel
      profile={{ ...callWorkbenchInboundProfile, tags: callTags }}
      onScheduleFollowUp={handleOpenCallScheduleFollowUpModal}
      onBlacklist={handleOpenCallBlockConfirm}
      onOpenTaggingModal={() => handleOpenTaggingModal('call')}
    />
  );

  const callSummaryPanelContent = (
    <WorkbenchSummaryPanel
      variant="call"
      title="通话小结"
      tabs={callSummaryTabs}
      activeTab={callSummaryTab}
      onTabSelect={setCallSummaryTab}
      onAddTab={handleAddCallSummaryTab}
      onRemoveTab={handleRemoveCallSummaryTab}
      fieldsContent={workbenchSummaryFields.map((field) =>
        renderEditableWorkbenchField(
          field,
          activeCallSummaryFieldValues,
          updateCallSummaryFieldValues,
          callSummaryOpenSelect,
          setCallSummaryOpenSelect,
          'call-summary'
        )
      )}
      descriptionValue={activeCallSummaryText}
      onDescriptionChange={setActiveCallSummaryText}
      ticketTemplateOptions={callTicketTemplateOptions}
      actions={
        <>
          <button
            type="button"
            onClick={() => handleRemoveCallSummaryTab(callSummaryTab)}
            className="rounded-full border border-rose-300 bg-rose-50/60 px-5 py-[7px] text-[12px] font-medium text-rose-500 transition-colors hover:bg-rose-50"
          >
            废弃
          </button>
          <button className="rounded-full border border-emerald-300 px-5 py-[7px] text-[12px] font-medium text-emerald-500 transition-colors hover:bg-emerald-50">
            升级工单
          </button>
          <button className="rounded-full border border-emerald-300 px-5 py-[7px] text-[12px] font-medium text-emerald-500 transition-colors hover:bg-emerald-50">
            暂存
          </button>
          <button className="rounded-full border border-emerald-300 px-5 py-[7px] text-[12px] font-medium text-emerald-500 transition-colors hover:bg-emerald-50">
            提交
          </button>
        </>
      }
    />
  );

  const callRightSidebarContent = (
    <CallRightSidebar
      visibleButtons={visibleCallSidebarButtons}
      orderedFeatures={orderedCallSidebarFeatures}
      activePanel={callRightPanel}
      isFeatureSettingsOpen={isCallFeatureSettingsOpen}
      featureVisibility={callSidebarVisibility}
      dropIndicator={callSidebarDropIndicator}
      draggingFeatureKey={draggingCallSidebarFeatureKey}
      onOpenPanel={handleOpenCallRightPanel}
      onToggleFeatureSettings={handleToggleCallFeatureSettings}
      onToggleFeatureVisibility={handleToggleCallSidebarVisibility}
      onFeatureDragStart={handleCallSidebarFeatureDragStart}
      onFeatureDragOver={handleCallSidebarFeatureDragOver}
      onFeatureDrop={handleCallSidebarFeatureDrop}
      onFeatureDragEnd={handleCallSidebarFeatureDragEnd}
      renderFloatingMenu={renderFloatingMenu}
    />
  );

  const callRightSingleContent =
    callRightPanel === 'agent'
      ? callRobotPanelContent
      : callRightPanel === 'workorder'
        ? renderCallWorkbenchToolSection(['工单管理'], '工单管理')
        : callRightPanel === 'knowledge'
          ? renderCallWorkbenchToolSection(['知识库'], '知识库')
          : callRightPanel === 'toolsite'
            ? renderCallWorkbenchToolSection(['第三方网站'], '第三方网站')
            : callRightPanel === 'summary'
              ? callSummaryPanelContent
              : null;

  const callWorkbenchContent = (
    <CallWorkbenchContentView
      layoutRef={callWorkbenchLayoutRef}
      leftPanelStackRef={callLeftPanelStackRef}
      centerPanelRef={callCenterPanelRef}
      centerPanelStackRef={callCenterPanelStackRef}
      rightPanelStackRef={callRightPanelStackRef}
      leftPanelWidth={callLeftPanelWidth}
      leftTopPanelHeight={callLeftTopPanelHeight}
      centerPanelWidth={callCenterPanelWidth}
      centerTopPanelHeight={callCenterTopPanelHeight}
      rightTopPanelHeight={callRightTopPanelHeight}
      isLeftTopResizing={isCallLeftTopResizing}
      isLeftResizing={isCallLeftResizing}
      isCenterTopResizing={isCallCenterTopResizing}
      isCenterResizing={isCallCenterResizing}
      isRightTopResizing={isCallRightTopResizing}
      onStartLeftTopResize={() => setIsCallLeftTopResizing(true)}
      onResetLeftTopPanelHeight={() => {
        if (!callLeftPanelStackRef.current) {
          return;
        }

        const stackHeight = callLeftPanelStackRef.current.getBoundingClientRect().height;
        setIsCallLeftTopPanelCustomized(false);
        setCallLeftTopPanelHeight(getCallVerticalPanelDefaultHeight(stackHeight, CALL_VERTICAL_RESIZER_HEIGHT));
      }}
      onStartLeftResize={() => setIsCallLeftResizing(true)}
      onResetLeftPanelWidth={() => {
        if (!callWorkbenchLayoutRef.current) {
          return;
        }

        const layoutWidth = callWorkbenchLayoutRef.current.getBoundingClientRect().width;
        setIsCallLeftPanelCustomized(false);
        setCallLeftPanelWidth(getCallLeftPanelDefaultWidth(layoutWidth, window.innerWidth));
      }}
      onStartCenterTopResize={() => setIsCallCenterTopResizing(true)}
      onResetCenterTopPanelHeight={() => {
        if (!callCenterPanelStackRef.current) {
          return;
        }

        const stackHeight = callCenterPanelStackRef.current.getBoundingClientRect().height;
        setIsCallCenterTopPanelCustomized(false);
        setCallCenterTopPanelHeight(getCallVerticalPanelDefaultHeight(stackHeight, CALL_VERTICAL_RESIZER_HEIGHT));
      }}
      onStartCenterResize={() => setIsCallCenterResizing(true)}
      onResetCenterPanelWidth={() => {
        if (!callWorkbenchLayoutRef.current) {
          return;
        }

        const layoutWidth = callWorkbenchLayoutRef.current.getBoundingClientRect().width;
        setIsCallCenterPanelCustomized(false);
        setCallCenterPanelWidth(getCallCenterPanelDefaultWidth(layoutWidth, callLeftPanelWidth));
      }}
      onStartRightTopResize={() => setIsCallRightTopResizing(true)}
      onResetRightTopPanelHeight={() => {
        if (!callRightPanelStackRef.current) {
          return;
        }

        const stackHeight = callRightPanelStackRef.current.getBoundingClientRect().height;
        setIsCallRightTopPanelCustomized(false);
        setCallRightTopPanelHeight(
          getCallVerticalPanelDefaultHeight(stackHeight, CALL_RIGHT_VERTICAL_RESIZER_HEIGHT)
        );
      }}
      leftTopContent={
        <CallCustomerInfoPanel
          onReset={handleResetCallCustomerFields}
          onAddNew={handleAddNewCallCustomer}
          onQueryByPhone={handleQueryCallCustomerByPhone}
          height={
            typeof window !== 'undefined' && window.innerWidth >= 1280
              ? callLeftTopPanelHeight
              : undefined
          }
          fieldsContent={callCustomerFields.map((field) =>
            renderEditableWorkbenchField(
              field,
              callCustomerFieldValues,
              setCallCustomerFieldValues,
              callCustomerOpenSelect,
              setCallCustomerOpenSelect,
              'call-customer',
              callCustomerRegionSelection,
              setCallCustomerRegionSelection
            )
          )}
        />
      }
      leftBottomContent={
        <CallHistoryPanel
          callHistoryTab={callHistoryTab}
          onCallHistoryTabChange={setCallHistoryTab}
          callHistorySummaryLabel={(isCallAddNewMode || isCallHistoryEmpty) ? '' : callHistorySummaryLabel}
          activeHistoryMeta={(isCallAddNewMode || isCallHistoryEmpty) ? { filterPlaceholder: '关键词', details: [], messages: [] } : activeHistoryMeta}
          isCallHistoryDateRangeTab={isCallHistoryDateRangeTab}
          isCallHistoryTimeDropdownTab={isCallHistoryTimeDropdownTab}
          activeCallHistoryDateRange={isCallAddNewMode ? { startDate: '', endDate: '' } : activeCallHistoryDateRange}
          isCallHistoryDateRangeMenuOpen={isCallHistoryDateRangeMenuOpen}
          onToggleCallHistoryDateRangeMenu={handleToggleActiveCallHistoryDateRangeMenu}
          onUpdateActiveCallHistoryDateRange={updateActiveCallHistoryDateRange}
          activeCallHistoryTime={isCallAddNewMode ? '' : activeCallHistoryTime}
          isCallHistoryTimeMenuOpen={isCallHistoryTimeMenuOpen}
          onToggleCallHistoryTimeMenu={handleToggleActiveCallHistoryTimeMenu}
          callHistoryTimeOptions={
            isCallHistoryTimeDropdownTab
              ? callHistoryTimeDropdown.optionsByTab[callHistoryTab as HistoryTimeDropdownTab]
              : []
          }
          onSelectCallHistoryTime={handleSelectActiveCallHistoryTime}
          onToggleCallHistoryTimeSort={handleToggleActiveCallHistoryTimeSort}
          renderFloatingMenu={renderFloatingMenu}
          toolSortIcon={toolSortIcon}
          hideDetails={isCallAddNewMode || isCallHistoryEmpty}
        />
      }
      centerTopContent={
        <CallInboundInfoPanel
          profile={isCallAddNewMode ? { inboundInfoItems: [], tags: [], ivrPath: '', transferSummary: '' } : { ...callWorkbenchInboundProfile, tags: callTags }}
          hideDetails={isCallAddNewMode}
          onScheduleFollowUp={handleOpenCallScheduleFollowUpModal}
          onBlacklist={handleOpenCallBlockConfirm}
          onOpenTaggingModal={() => handleOpenTaggingModal('call')}
        />
      }
      rightSidebar={callRightSidebarContent}
      rightLayoutMode="single"
      rightSingleContent={callRightSingleContent}
    />
  );

  const onlineWorkbenchContent = (
    <OnlineWorkbenchContentView
      layoutRef={onlineWorkbenchLayoutRef}
      leftPanelWidth={onlineLeftPanelWidth}
      isLeftResizing={isOnlineLeftResizing}
      onStartLeftResize={() => setIsOnlineLeftResizing(true)}
      onResetLeftPanelWidth={() => {
        if (!onlineWorkbenchLayoutRef.current) {
          return;
        }

        const layoutWidth = onlineWorkbenchLayoutRef.current.getBoundingClientRect().width;
        setIsOnlineLeftPanelCustomized(false);
        setOnlineLeftPanelWidth(getOnlineLeftPanelDefaultWidth(layoutWidth, window.innerWidth));
      }}
      leftContent={
        <OnlineSessionListPanel
          presenceMeta={onlineLeftPresenceMeta}
          onTogglePresence={toggleOnlineLeftPresence}
          isOnlineStatusMenuOpen={isOnlineStatusMenuOpen}
          onToggleStatusMenu={() => setIsOnlineStatusMenuOpen((open) => !open)}
          selectedOnlineStatus={selectedOnlineStatus}
          onlineStatusOptions={onlineStatusOptions}
          onSelectOnlineStatus={(option) => {
            setSelectedOnlineStatus(option as typeof selectedOnlineStatus);
            setIsOnlineStatusMenuOpen(false);
          }}
          queueCount={10}
          sessionListTab={onlineSessionListTab}
          onSessionListTabChange={handleChangeOnlineSessionListTab}
          visibleSessions={visibleOnlineSessions}
          summaryRoleBySessionId={onlineSessionSummaryRoleById}
          activeSessionId={activeOnlineSessionId}
          getChannelIcon={getOnlineSessionChannelIcon}
          onSessionSelect={handleSelectOnlineSession}
          onSessionContextMenu={handleOpenOnlineSessionContextMenu}
          contextMenu={onlineSessionContextMenu}
          pinnedSessionIds={pinnedOnlineSessionIds}
          onTogglePin={handleToggleOnlineSessionPin}
          onOpenBlockConfirm={handleOpenOnlineBlockConfirm}
          lockedSessionIds={lockedOnlineSessionIds}
          onToggleLock={handleToggleOnlineSessionLock}
        />
      }
    >

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:gap-0">

        <div
          ref={onlineCenterPanelRef}
          className="flex min-h-0 min-w-0 xl:shrink-0"
          style={{
            width:
              typeof window !== 'undefined' && window.innerWidth >= 1280
                ? `${onlineCenterPanelWidth}px`
                : undefined,
          }}
        >
        <OnlineConversationPanel
          sessionId={activeOnlineSession.id}
          customerName={activeOnlineSession.customer}
          entryCountLabel={onlineSessionEntryCountLabels[activeOnlineSession.id] ?? '首次进线'}
          visitorMeta={activeOnlineSessionDetail.visitorMeta}
          tags={onlineTagsBySession[activeOnlineSession.id] ?? activeOnlineSessionDetail.tags}
          summaryCards={activeOnlineSessionDetail.summaryCards}
          isVisitorExpanded={isOnlineVisitorExpanded}
          onToggleVisitorExpanded={() => setIsOnlineVisitorExpanded((expanded) => !expanded)}
          isSessionFinished={isActiveOnlineSessionFinished}
          isSessionConnected={isOnlineSessionConnected}
          onSessionConnectionToggle={handleOnlineSessionConnectionToggle}
          onOpenTaggingModal={() => handleOpenTaggingModal('online')}
          transferAgentIconSrc={onlineTransferAgentIcon}
          transferQueueIconSrc={onlineTransferQueueIcon}
          conferenceIconSrc={onlineConferenceIcon}
          endSessionIconSrc={onlineEndSessionIcon}
          messages={activeOnlineConversationMessages}
          translationLanguageById={onlineMessageTranslationLanguageById}
          getTranslatedMessageText={getOnlineMessageTranslationText}
          activeTranslateMenuMessageId={activeOnlineMessageTranslateMenuId}
          onOpenTranslateMenu={handleOpenOnlineMessageTranslateMenu}
          onSelectMessageTranslationLanguage={handleSelectOnlineMessageTranslationLanguage}
          translateTriggerRefs={onlineMessageTranslateTriggerRefs}
          messageTranslateIconSrc={chatTranslateIcon}
          withdrawNoticeText={activeOnlineWithdrawNotice?.text ?? null}
          onRequestWithdrawMessage={handleRequestWithdrawOnlineMessage}
          onReEditWithdrawnMessage={() => {
            if (!activeOnlineWithdrawNotice) {
              return;
            }

            handleReEditWithdrawnOnlineMessage(activeOnlineSession.id, activeOnlineWithdrawNotice.text);
          }}
          onQuoteOpeningQuestion={handleQuoteOnlineOpeningQuestion}
          renderFloatingMenu={renderFloatingMenu}
          utilityItems={onlineUtilityItems['常用工具']}
          composerPrimaryTools={onlineComposerPrimaryTools}
          composerSecondaryTools={onlineComposerSecondaryTools}
          activeCallOverlay={activeOnlineCallOverlay}
          onPrimaryToolClick={handleOnlineComposerPrimaryToolClick}
          suggestionTriggerRef={onlineSuggestionTriggerRef}
          isComposerTranslateMenuOpen={isOnlineComposerTranslateMenuOpen}
          onToggleComposerTranslateMenu={handleToggleOnlineComposerTranslateMenu}
          composerTranslateLanguage={onlineComposerTranslateLanguage}
          onSelectComposerTranslateLanguage={handleSelectOnlineComposerTranslateLanguage}
          isSuggestionMenuOpen={isOnlineSuggestionMenuOpen}
          onToggleSuggestionMenu={handleToggleOnlineSuggestionMenu}
          onCloseSuggestionMenu={handleCloseOnlineSuggestionMenu}
          suggestionKeyword={onlineSuggestionKeyword}
          onSuggestionKeywordChange={setOnlineSuggestionKeyword}
          visibleSuggestionGroups={visibleOnlineSuggestionGroups}
          isSuggestionSearching={isOnlineSuggestionSearching}
          expandedSuggestionGroups={expandedOnlineSuggestionGroups}
          onToggleSuggestionGroup={handleToggleOnlineSuggestionGroup}
          onApplySuggestion={handleApplyOnlineSuggestion}
          composerTextareaRef={onlineComposerTextareaRef}
          composerText={activeOnlineComposerText}
          onComposerTextChange={updateActiveOnlineComposerText}
          isComposerDisabled={isOnlineComposerDisabled}
          composerActionLabel={onlineComposerActionLabel}
          onSubmitComposer={handleSubmitOnlineComposer}
          composerMessageIconSrc={chatMessageIcon}
        />
        </div>

        <WorkbenchResizeHandle
          direction="col"
          active={isOnlineCenterResizing}
          ariaLabel="调整在线工作台中间区域宽度"
          className="w-2"
          trackClassName="flex h-20 w-[3px] flex-col items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
          indicatorClassName="h-7 w-[2px] rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300"
          onMouseDown={(event) => {
            event.preventDefault();
            setIsOnlineCenterResizing(true);
          }}
          onDoubleClick={() => {
            if (!onlineWorkbenchLayoutRef.current) {
              return;
            }

            const layoutWidth = onlineWorkbenchLayoutRef.current.getBoundingClientRect().width;
            setIsOnlineCenterPanelCustomized(false);
            setOnlineCenterPanelWidth(getOnlineCenterPanelDefaultWidth(layoutWidth, onlineLeftPanelWidth));
          }}
        />

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)_50px] gap-2.5">
          <div
            ref={onlineRightPanelStackRef}
            className={cn(
              "min-h-0 gap-[10px] xl:gap-0",
              onlineRightPanel === 'robot' ? "grid grid-rows-[minmax(0,1fr)]" : "flex flex-col"
            )}
          >
            {onlineRightPanel === 'robot' && (
              <CallAgentPanel
                insight={activeOnlineAgentPanel.insight}
                quickCards={activeOnlineAgentPanel.quickCards}
                journeyName={activeOnlineAgentPanel.journeyName}
                profile={activeOnlineAgentPanel.profile}
                openTickets={activeOnlineAgentPanel.openTickets}
                purchasedDeviceCount={activeOnlineAgentPanel.purchasedDeviceCount}
                interactionCount={activeOnlineAgentPanel.interactionCount}
              />
            )}

            {onlineRightPanel === 'customer' && (
              <section
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                style={{ height: `${onlineRightTopPanelHeight}px` }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h2 className="text-[14px] font-bold text-slate-800">客户信息</h2>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="输入手机号查询" className="h-8 w-[132px] rounded-full border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-400 outline-none" />
                    <button type="button" aria-label="按手机号查询客户信息" title="按手机号查询客户信息" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                      <Search size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] font-medium text-slate-600">匿名</div>
                    <button
                      type="button"
                      aria-pressed={activeOnlineCustomerAnonymous}
                      onClick={handleToggleActiveOnlineCustomerAnonymous}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        activeOnlineCustomerAnonymous ? "bg-[#34d399]" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                          activeOnlineCustomerAnonymous ? "right-0.5" : "left-0.5"
                        )}
                      />
                    </button>
                    <div className="text-[11px] font-medium text-slate-600">业务类型</div>
                    <div className="relative" data-dropdown-root="true">
                      <button
                        ref={onlineBusinessTypeTriggerRef}
                        type="button"
                        onClick={() => setIsOnlineBusinessTypeMenuOpen((open) => !open)}
                        className="flex h-[30px] min-w-[94px] items-center justify-between rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-600"
                      >
                        <span>{activeOnlineBusinessType}</span>
                        <ChevronDown
                          size={13}
                          className={cn("text-slate-300 transition-transform", isOnlineBusinessTypeMenuOpen && "rotate-180")}
                        />
                      </button>
                      {isOnlineBusinessTypeMenuOpen
                        ? renderFloatingMenu(
                            onlineBusinessTypeTriggerRef.current,
                            <div className="overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                              {onlineBusinessTypeOptions.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => handleSelectActiveOnlineBusinessType(option)}
                                  className={cn(
                                    "flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors",
                                    activeOnlineBusinessType === option
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "text-slate-600 hover:bg-slate-50"
                                  )}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>,
                            { marginTop: 4, width: 120 }
                          )
                        : null}
                  </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {onlineCustomerFieldsWithLinked.map((field) =>
                      renderEditableWorkbenchField(
                        field,
                        activeOnlineCustomerFieldValues,
                        updateActiveOnlineCustomerFieldValues,
                        onlineCustomerOpenSelect,
                        setOnlineCustomerOpenSelect,
                        'online-customer',
                        onlineCustomerRegionSelection,
                        setOnlineCustomerRegionSelection
                      )
                    )}
                  </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={handleOpenOnlineScheduleFollowUpModal}
                    className="focus-ring press-lift rounded-full border border-violet-200 bg-violet-50/80 px-6 py-1.5 text-[12px] font-medium text-violet-600 transition-colors hover:border-violet-300 hover:bg-violet-100/80"
                  >
                    预约回电
                  </button>
                  <button type="button" className="rounded-full border border-[#7ee0d3] bg-[#f1fdfa] px-6 py-1.5 text-[12px] font-medium text-[#18a058]">保存</button>
                  <button
                    type="button"
                    onClick={handleResetActiveOnlineCustomerProfile}
                    className="rounded-full border border-[#7ee0d3] bg-[#f1fdfa] px-6 py-1.5 text-[12px] font-medium text-[#18a058]"
                  >
                    重置
                  </button>
                </div>
              </section>
            )}

            {onlineRightPanel === 'history' && (
              <section
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                style={{
                  height: `${onlineRightTopPanelHeight}px`,
                }}
              >
                <div className="flex items-center gap-6 border-b border-slate-100 px-4">
                  {(['会话历史', '通话历史', '短信历史', '邮件历史'] as WorkbenchHistoryTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setOnlineWorkbenchHistoryTab(tab)}
                      className={cn(
                        "relative py-3 text-[12px] font-semibold transition-colors",
                        onlineWorkbenchHistoryTab === tab ? "text-emerald-500" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {tab}
                      {onlineWorkbenchHistoryTab === tab && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500" />}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[12px] text-slate-500">
                      <span className="text-[#18a058]">{onlineHistorySummaryLabel}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                      <div className="relative min-w-[120px] flex-[1_1_120px] sm:flex-none">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                          type="text"
                          placeholder={activeOnlineHistoryPanelMeta.filterPlaceholder}
                          className="h-8 w-[120px] rounded-md border border-slate-200 bg-[#fcfcfd] pl-9 pr-3 text-[12px] text-slate-400 outline-none"
                        />
                      </div>
                      {isOnlineHistoryDateRangeTab ? (
                        <div className="relative" data-dropdown-root="true">
                          <HistoryDateRangeFilter
                            buttonRef={(node) => {
                              onlineHistoryDateRangeTriggerRefs.current[onlineWorkbenchHistoryTab as HistoryDateRangeTab] = node;
                            }}
                            startDate={activeOnlineHistoryDateRange.startDate}
                            endDate={activeOnlineHistoryDateRange.endDate}
                            isOpen={activeOnlineHistoryDateRangeMenuTab === onlineWorkbenchHistoryTab}
                            onClick={() =>
                              setActiveOnlineHistoryDateRangeMenuTab((currentTab) =>
                                currentTab === onlineWorkbenchHistoryTab ? null : (onlineWorkbenchHistoryTab as HistoryDateRangeTab)
                              )
                            }
                            className="flex-[1_1_230px]"
                          />
                          {activeOnlineHistoryDateRangeMenuTab === onlineWorkbenchHistoryTab
                            ? renderFloatingMenu(
                                onlineHistoryDateRangeTriggerRefs.current[onlineWorkbenchHistoryTab as HistoryDateRangeTab] ?? null,
                                <HistoryDateRangeMenu
                                  startDate={activeOnlineHistoryDateRange.startDate}
                                  endDate={activeOnlineHistoryDateRange.endDate}
                                  onStartDateChange={(value) => updateActiveOnlineHistoryDateRange('startDate', value)}
                                  onEndDateChange={(value) => updateActiveOnlineHistoryDateRange('endDate', value)}
                                  onClear={() => {
                                    updateActiveOnlineHistoryDateRange('startDate', '');
                                    updateActiveOnlineHistoryDateRange('endDate', '');
                                  }}
                                />,
                                { marginTop: 4, width: 280 }
                              )
                            : null}
                        </div>
                      ) : (
                        <div className="relative" data-dropdown-root="true">
                          <button
                            ref={(node) => {
                              if (isOnlineHistoryTimeDropdownTab) {
                                onlineHistoryTimeTriggerRefs.current[onlineWorkbenchHistoryTab as HistoryTimeDropdownTab] = node;
                              }
                            }}
                            type="button"
                            onClick={() => {
                              if (!isOnlineHistoryTimeDropdownTab) {
                                return;
                              }

                              setActiveOnlineHistoryTimeMenuTab((currentTab) =>
                                currentTab === onlineWorkbenchHistoryTab ? null : (onlineWorkbenchHistoryTab as HistoryTimeDropdownTab)
                              );
                            }}
                            className="flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-[#fcfcfd] px-3 text-[12px] text-slate-500"
                          >
                            {activeOnlineHistoryTime}
                            <ChevronDown
                              size={12}
                              className={cn(
                                "text-slate-300 transition-transform",
                                activeOnlineHistoryTimeMenuTab === onlineWorkbenchHistoryTab && "rotate-180"
                              )}
                            />
                          </button>
                          {isOnlineHistoryTimeDropdownTab && activeOnlineHistoryTimeMenuTab === onlineWorkbenchHistoryTab
                            ? renderFloatingMenu(
                                onlineHistoryTimeTriggerRefs.current[onlineWorkbenchHistoryTab as HistoryTimeDropdownTab] ?? null,
                                <div className="overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                                  {onlineHistoryTimeDropdown.optionsByTab[onlineWorkbenchHistoryTab as HistoryTimeDropdownTab].map((time) => (
                                    <button
                                      key={`${onlineWorkbenchHistoryTab}-${time}`}
                                      type="button"
                                      onClick={() => handleSelectOnlineHistoryTime(onlineWorkbenchHistoryTab as HistoryTimeDropdownTab, time)}
                                      className={cn(
                                        "flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors",
                                        activeOnlineHistoryTime === time
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "text-slate-600 hover:bg-slate-50"
                                      )}
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>,
                                { marginTop: 4, width: 176 }
                              )
                            : null}
                        </div>
                      )}
                      {!isOnlineHistoryDateRangeTab ? (
                        <button
                          type="button"
                          aria-label="切换时间排序"
                          onClick={() => {
                            if (!isOnlineHistoryTimeDropdownTab) {
                              return;
                            }

                            handleToggleOnlineHistoryTimeSort(onlineWorkbenchHistoryTab as HistoryTimeDropdownTab);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-[#fcfcfd] text-slate-400"
                        >
                          <img src={toolSortIcon} alt="" className="h-[14px] w-[14px] object-contain" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {onlineWorkbenchHistoryTab !== '短信历史' && onlineWorkbenchHistoryTab !== '邮件历史' ? (
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-[11px] text-slate-500">
                      {activeOnlineHistoryPanelMeta.details.map((detail) => (
                        <div key={`${onlineWorkbenchHistoryTab}-${detail.label}`}>
                          <span>{detail.label}: </span>
                          <span className="text-slate-700">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {onlineWorkbenchHistoryTab === '通话历史' ? (
                    <div className="mt-3">
                      <CallRecordingPlayer duration="00:16" />
                    </div>
                  ) : null}
                  {(onlineWorkbenchHistoryTab === '通话历史' || onlineWorkbenchHistoryTab === '会话历史') ? (
                    <div className="mt-3 rounded-[10px] border-l-[3px] border-l-accent-400 bg-accent-50/60 px-3 py-2.5 text-[12px] leading-5 text-slate-600">
                      <button
                        type="button"
                        aria-expanded={!isOnlineHistorySummaryCollapsed}
                        onClick={() => setIsOnlineHistorySummaryCollapsed((prev) => !prev)}
                        className="focus-ring flex w-full items-center justify-between gap-2 rounded-md text-left text-[12px] font-semibold uppercase tracking-wide text-accent-700"
                      >
                        <span>{onlineWorkbenchHistoryTab === '通话历史' ? '通话纪要' : '会话纪要'}</span>
                        {isOnlineHistorySummaryCollapsed ? (
                          <ChevronRight size={14} className="text-accent-500" />
                        ) : (
                          <ChevronDown size={14} className="text-accent-500" />
                        )}
                      </button>
                      {!isOnlineHistorySummaryCollapsed ? (
                        <p className="mt-1 text-slate-700">
                          {(() => {
                            const sample = activeOnlineHistoryPanelMeta.messages
                              .filter((m) => m.text && m.text.trim().length > 0)
                              .slice(0, 2)
                              .map((m) => m.text.trim())
                              .join(' ');
                            return (
                              sample ||
                              (onlineWorkbenchHistoryTab === '通话历史'
                                ? '本次通话围绕用户来电诉求展开，已记录关键问题与处理建议。'
                                : '本次会话已记录用户主要诉求与客服处理过程，详情可展开查看。')
                            );
                          })()}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 min-h-[212px] space-y-3 border-t border-slate-100 pt-4">
                    {onlineWorkbenchHistoryTab === '短信历史' ? (
                      <SmsContentList
                        entries={activeOnlineHistoryPanelMeta.messages.map((message, index) => ({
                          direction: message.align === 'right' ? 'out' : 'in',
                          time: `10-28 09:${String(10 + index * 2).padStart(2, '0')}:20`,
                          content: message.text,
                        }))}
                      />
                    ) : onlineWorkbenchHistoryTab === '邮件历史' ? (
                      <EmailContentList
                        entries={activeOnlineHistoryPanelMeta.messages.map((message, index) => ({
                          direction: message.align === 'right' ? 'out' : 'in',
                          time: `10-28 09:${String(10 + index * 5).padStart(2, '0')}:20`,
                          content: message.text,
                          subject: message.badge ?? '未命名主题',
                          sender: message.align === 'right' ? '客服001' : '客户',
                          recipient: message.align === 'right' ? '客户' : '客服001',
                        }))}
                      />
                    ) : (
                      activeOnlineHistoryPanelMeta.messages.map((message, index) => (
                        <div key={`${onlineWorkbenchHistoryTab}-message-${index}`} className={cn("flex", message.align === 'right' ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[240px]", message.align === 'right' && "items-end")}>
                            <div className={cn("mb-1 text-[11px] text-slate-400", message.align === 'right' ? "text-right" : "text-left")}>
                              10-28 09:10:20
                            </div>
                            <div className={cn("flex items-start gap-2", message.align === 'right' && "flex-row-reverse")}>
                              <div className={cn(
                                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                                message.align === 'right' ? "bg-orange-400" : "bg-emerald-500"
                              )}>
                                <MessageSquare size={14} />
                              </div>
                              <div className="space-y-1">
                                {message.badge && (
                                  <div className="text-left">
                                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-500">
                                      {message.badge}
                                    </span>
                                  </div>
                                )}
                                <div className={cn(
                                  "rounded-2xl px-4 py-2 text-[12px] leading-5 shadow-[0_2px_6px_rgba(15,23,42,0.03)]",
                                  message.align === 'right'
                                    ? "rounded-tr-md bg-[#e9f9f4] text-slate-700"
                                    : "rounded-tl-md bg-slate-50 text-slate-700"
                                )}>
                                  {message.text}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {onlineRightPanel === 'third-party' && (
              <section
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                style={{
                  height: `${onlineRightTopPanelHeight}px`,
                }}
              >
                {renderThirdPartySystemPanelContent(
                  '第三方网站',
                  onlineThirdPartySettingsTriggerRef,
                  '打开第三方网站默认设置'
                )}
              </section>
            )}

            {onlineRightPanel !== 'robot' && (
            <>
            <WorkbenchResizeHandle
              direction="row"
              active={isOnlineRightTopResizing}
              ariaLabel="调整在线工作台右侧上方区域高度"
              className="h-[10px]"
              trackClassName="flex h-[3px] w-20 items-center justify-center gap-1 rounded-full bg-transparent transition-colors"
              indicatorClassName="h-[2px] w-7 rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300"
              onMouseDown={(event) => {
                event.preventDefault();
                setIsOnlineRightTopResizing(true);
              }}
              onDoubleClick={() => {
                if (!onlineRightPanelStackRef.current) {
                  return;
                }

                const stackHeight = onlineRightPanelStackRef.current.getBoundingClientRect().height;
                setIsOnlineRightTopPanelCustomized(false);
                setOnlineRightTopPanelHeight(getOnlineRightTopPanelDefaultHeight(stackHeight));
              }}
            />
            <WorkbenchSummaryPanel
              variant="online"
              tabs={onlineSummaryTabs}
              activeTab={onlineSummaryTab}
              onTabSelect={setOnlineSummaryTab}
              onAddTab={handleAddOnlineSummaryTab}
              onRemoveTab={handleRemoveOnlineSummaryTab}
              fieldsContent={workbenchSummaryFields.map((field) =>
                renderEditableWorkbenchField(
                  field,
                  activeOnlineSummaryFieldValues,
                  updateOnlineSummaryFieldValues,
                  onlineSummaryOpenSelect,
                  setOnlineSummaryOpenSelect,
                  'online-summary'
                )
              )}
              descriptionValue={activeOnlineSummaryText}
              onDescriptionChange={setActiveOnlineSummaryText}
              ticketTemplateOptions={onlineTicketTemplateOptions}
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => handleRemoveOnlineSummaryTab(onlineSummaryTab)}
                    className="rounded-full border border-rose-300 bg-rose-50/60 px-5 py-1.5 text-[12px] font-medium text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    废弃
                  </button>
                  <button className="rounded-full border border-[#7ee0d3] bg-[#f1fdfa] px-5 py-1.5 text-[12px] font-medium text-[#18a058]">
                    升级工单
                  </button>
                  {activeOnlineBusinessType === '教育' ? (
                    <button className="rounded-full border border-[#7ee0d3] bg-[#f1fdfa] px-5 py-1.5 text-[12px] font-medium text-[#18a058]">
                      创建TPD工单
                    </button>
                  ) : null}
                  <button className="rounded-full border border-[#7ee0d3] bg-[#f1fdfa] px-5 py-1.5 text-[12px] font-medium text-[#18a058]">
                    提交
                  </button>
                </>
              }
            />
            </>
            )}
          </div>

          <OnlineWorkbenchSidebar
            visibleButtons={visibleOnlineSidebarButtons}
            orderedFeatures={orderedOnlineSidebarFeatures}
            visibility={onlineSidebarVisibility}
            activePanel={onlineRightPanel}
            isSettingsOpen={isOnlineFeatureSettingsOpen}
            settingsTriggerRef={onlineFeatureSettingsTriggerRef}
            draggingFeatureKey={draggingOnlineSidebarFeatureKey}
            dropIndicator={onlineSidebarDropIndicator}
            onPanelSelect={(panel) => setOnlineRightPanel(panel)}
            onToggleSettings={handleToggleOnlineFeatureSettings}
            onToggleVisibility={handleToggleOnlineSidebarVisibility}
            onFeatureDragStart={handleOnlineSidebarFeatureDragStart}
            onFeatureDragOver={handleOnlineSidebarFeatureDragOver}
            onFeatureDrop={handleOnlineSidebarFeatureDrop}
            onFeatureDragEnd={handleOnlineSidebarFeatureDragEnd}
            renderFloatingMenu={renderFloatingMenu}
          />
        </div>
        </div>

        {activeOnlineCallOverlay && (
            <div
              data-call-overlay
              className="absolute z-50"
              style={callOverlayPos.x >= 0 ? { left: callOverlayPos.x, top: callOverlayPos.y } : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              {activeOnlineCallOverlay === 'audio' ? (
                <div className="w-[258px] overflow-hidden rounded-[18px] border border-[#e7edf3] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
                  <div
                    className="flex cursor-move items-center gap-2 border-b border-[#e4f3ef] bg-[#f2fbf8] px-4 py-[11px] text-[13px] font-semibold text-[#12b89d] select-none"
                    onMouseDown={handleCallOverlayDragStart}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff8f2] text-[#14c4a6]">
                      <Phone size={11} strokeWidth={2.2} />
                    </span>
                    <span>语音通话进行中</span>
                  </div>
                  <div className="flex flex-col items-center px-5 pb-6 pt-7">
                    <img
                      src={onlineAudioCallAvatar}
                      alt={`${onlineCallContactName}头像`}
                      className="h-[84px] w-[84px] rounded-full object-cover shadow-[0_12px_24px_rgba(125,144,255,0.2)]"
                    />
                    <div className="mt-3.5 text-[18px] font-semibold tracking-[0.02em] text-slate-700">{onlineCallContactName}</div>
                    <div className="mt-1 text-[18px] font-semibold tracking-[0.08em] text-[#1cc9af]">{onlineAudioCallDuration}</div>
                    <div className="mt-7 grid w-full grid-cols-3 gap-2.5 text-center">
                      {onlineAudioCallControls.map(({ label, iconSrc, onClick }) => (
                        <div key={`online-audio-call-control-${label}`} className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            aria-label={label}
                            onClick={onClick}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e8ef] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.04)] transition-colors hover:border-[#cfd8e3]"
                          >
                            <img
                              src={iconSrc}
                              alt=""
                              className={cn(
                                "object-contain opacity-70",
                                label === '外放' ? "h-[14px] w-[18px]" : "h-[18px] w-[18px]"
                              )}
                            />
                          </button>
                          <span className="text-[11px] text-slate-400">{label}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="挂断语音通话"
                      onClick={handleCloseOnlineCallOverlay}
                      className="mt-6 transition-transform hover:scale-[1.02]"
                    >
                      <img src={onlineCallHangupIcon} alt="" className="h-[42px] w-[42px] object-contain" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-[500px] max-w-[calc(100%-48px)] overflow-hidden rounded-[14px] bg-[#23252b] shadow-[0_28px_60px_rgba(15,23,42,0.28)]">
                  <div
                    className="flex cursor-move items-center bg-[rgba(12,14,18,0.9)] px-4 py-2.5 text-white select-none"
                    onMouseDown={handleCallOverlayDragStart}
                  >
                    <div className="flex items-center gap-2 text-[13px] font-medium">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
                        <Phone size={10} strokeWidth={2.4} />
                      </span>
                      <span>正在与{onlineCallContactName}视频通话</span>
                      <span className="text-white/70">{onlineVideoCallDuration}</span>
                    </div>
                  </div>
                  <div className="relative h-[332px] overflow-hidden bg-[#3f4145]">
                    <img
                      src={onlineVideoMainPhoto}
                      alt={`${onlineCallContactName}视频画面`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.08))]" />
                    <div className="absolute right-4 top-4 h-[102px] w-[102px] overflow-hidden rounded-[10px] border border-white/10 shadow-[0_14px_22px_rgba(15,23,42,0.24)]">
                      <img
                        src={onlineVideoPreviewPhoto}
                        alt="本地视频预览"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08))]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.18)] text-white shadow-[0_6px_12px_rgba(0,0,0,0.18)]">
                          <Video size={15} strokeWidth={2.1} />
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-[14px] flex justify-center">
                      <div className="relative h-[58px] w-[252px]">
                        <img
                          src={onlineVideoToolbarBackground}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="relative z-10 flex h-full items-center justify-center gap-3.5 px-5">
                          {onlineVideoCallControls.map(({ label, iconSrc }) => (
                            <button
                              key={`online-video-call-control-${label}`}
                              type="button"
                              aria-label={label}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
                            >
                              <img
                                src={iconSrc}
                                alt=""
                                className={cn(
                                  "object-contain invert",
                                  label === '外放' ? "h-[14px] w-[18px]" : "h-[16px] w-[16px]"
                                )}
                              />
                            </button>
                          ))}
                          <button
                            type="button"
                            aria-label="挂断视频通话"
                            onClick={handleCloseOnlineCallOverlay}
                            className="transition-transform hover:scale-[1.02]"
                          >
                            <img src={onlineVideoHangupIcon} alt="" className="h-10 w-10 object-contain" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        )}

        {showOnlineEndSessionConfirm && (
          <>
            <button
              type="button"
              aria-label="关闭结束会话弹窗"
              onClick={() => setShowOnlineEndSessionConfirm(false)}
              className="absolute inset-0 z-20 bg-[rgba(245,247,251,0.58)]"
            />
            <div className="absolute left-1/2 top-[58px] z-30 w-[230px] -translate-x-1/2 rounded-[10px] bg-white px-[20px] py-[16px] text-left shadow-[0_12px_28px_rgba(15,23,42,0.16)] xl:left-[67.4%] xl:top-[64px] xl:-translate-x-1/2">
              <div className="text-[14px] font-semibold leading-none text-[#3f434a]">结束会话</div>
              <div className="mt-[18px] text-[12px] leading-[18px] text-[#5c6570]">是否立即结束会话?</div>
              <div className="mt-[18px] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setShowOnlineEndSessionConfirm(false)}
                  className="flex h-[30px] min-w-[66px] items-center justify-center rounded-full border border-[#e4e8ef] bg-white px-[18px] text-[12px] text-[#6f7782] transition-colors hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleOnlineSessionDisconnectConfirm}
                  className="flex h-[30px] min-w-[74px] items-center justify-center rounded-full border border-[#8ee8db] bg-[#ecfbf8] px-[18px] text-[12px] font-medium text-[#11c5ab] transition-colors hover:bg-[#dff8f3]"
                >
                  确定
                </button>
              </div>
            </div>
          </>
        )}
        {isOnlineFormSelectModalOpen && (
          <>
            <button
              type="button"
              aria-label="关闭表单选择弹窗"
              onClick={handleCloseOnlineFormSelectModal}
              className="absolute inset-0 z-20 bg-[rgba(245,247,251,0.58)]"
            />
            <div className="absolute left-1/2 top-[73%] z-30 w-[376px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-white px-[20px] py-[16px] text-left shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
              <div className="text-[14px] font-semibold leading-none text-[#3f434a]">表单选择</div>
              <div className="mt-[16px] flex flex-wrap items-center gap-x-[22px] gap-y-[10px] text-[12px] text-[#3f434a]">
                {onlineFormFieldOptions.map((field) => {
                  const isSelected = selectedOnlineFormFields.includes(field);

                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => handleToggleOnlineFormField(field)}
                      className="inline-flex items-center gap-[6px] transition-colors hover:text-[#18a058]"
                    >
                      <span>{field}</span>
                      <span
                        className={cn(
                          "flex h-[13px] w-[13px] items-center justify-center rounded-[3px] border transition-colors",
                          isSelected ? "border-[#17c6aa] bg-[#17c6aa]" : "border-[#d6dee7] bg-white"
                        )}
                      >
                        {isSelected ? <Check size={10} strokeWidth={2.8} className="text-white" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-[22px] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={handleCloseOnlineFormSelectModal}
                  className="flex h-[30px] min-w-[66px] items-center justify-center rounded-full border border-[#e4e8ef] bg-white px-[18px] text-[12px] text-[#6f7782] transition-colors hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOnlineFormSelect}
                  className="flex h-[30px] min-w-[74px] items-center justify-center rounded-full border border-[#8ee8db] bg-[#ecfbf8] px-[18px] text-[12px] font-medium text-[#11c5ab] transition-colors hover:bg-[#dff8f3]"
                >
                  确定
                </button>
              </div>
            </div>
          </>
        )}
        {pendingOnlineWithdrawMessage && (
          <>
            <button
              type="button"
              aria-label="关闭撤回消息弹窗"
              onClick={handleCloseOnlineWithdrawConfirm}
              className="absolute inset-0 z-20 bg-[rgba(245,247,251,0.58)]"
            />
            <div className="absolute left-1/2 top-1/2 z-30 w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-white px-[20px] py-[16px] text-left shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
              <div className="text-[14px] font-semibold leading-none text-[#3f434a]">撤回消息</div>
              <div className="mt-[18px] text-[12px] leading-[18px] text-[#5c6570]">是否立即撤回消息?</div>
              <div className="mt-[18px] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={handleCloseOnlineWithdrawConfirm}
                  className="flex h-[30px] min-w-[66px] items-center justify-center rounded-full border border-[#e4e8ef] bg-white px-[18px] text-[12px] text-[#6f7782] transition-colors hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdrawOnlineMessage}
                  className="flex h-[30px] min-w-[74px] items-center justify-center rounded-full border border-[#8ee8db] bg-[#ecfbf8] px-[18px] text-[12px] font-medium text-[#11c5ab] transition-colors hover:bg-[#dff8f3]"
                >
                  确定
                </button>
              </div>
            </div>
          </>
        )}
        {pendingBlockedOnlineSession && (
          <>
            <button
              type="button"
              aria-label="关闭拉黑弹窗"
              onClick={handleCloseOnlineBlockConfirm}
              className="absolute inset-0 z-20 bg-transparent"
            />
            <div
              data-dropdown-root="true"
              className="fixed z-[81] w-[280px] rounded-[10px] border border-[#e8edf3] bg-white px-[16px] py-[14px] text-left shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
              style={{ left: pendingBlockedOnlineSession.x, top: pendingBlockedOnlineSession.y }}
            >
              <div className="text-[14px] font-semibold leading-none text-[#3f434a]">拉黑原因</div>
              <textarea
                value={onlineBlockReason}
                onChange={(event) => setOnlineBlockReason(event.target.value)}
                placeholder="请输入拉黑原因"
                className="mt-[18px] h-[70px] w-full resize-none rounded-[4px] border border-[#e8edf3] px-[10px] py-[8px] text-[12px] leading-[18px] text-[#3f434a] outline-none transition-colors placeholder:text-[#c3cad5] focus:border-[#8ee8db]"
              />
              <div className="mt-[12px] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={handleCloseOnlineBlockConfirm}
                  className="flex h-[30px] min-w-[66px] items-center justify-center rounded-full border border-[#e4e8ef] bg-white px-[18px] text-[12px] text-[#6f7782] transition-colors hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleBlockOnlineSession}
                  className="flex h-[30px] min-w-[74px] items-center justify-center rounded-full border border-[#8ee8db] bg-[#ecfbf8] px-[18px] text-[12px] font-medium text-[#11c5ab] transition-colors hover:bg-[#dff8f3]"
                >
                  确定
                </button>
              </div>
            </div>
          </>
        )}
    </OnlineWorkbenchContentView>
  );

  const deferredTabFallback = (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f7f9fc] text-[14px] text-slate-400">
      页面加载中...
    </div>
  );

  return (
    <div className={cn(
      "flex h-screen font-sans text-slate-900 overflow-hidden",
      activeTab === '呼叫工作台'
        ? "bg-[#f5f7fb]"
        : viewMode === 'agent' && agentSubTab === 'online'
          ? "bg-[#f4f7fa]"
          : "bg-[#f0f2f5]"
    )}>
      {/* Sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-[#e7edf3] bg-white transition-[width] duration-200",
          isSidebarCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {!isSidebarCollapsed ? (
          <>
            <div className="bg-white px-6 py-5">
              <img src={logoImage} alt="科大讯飞" className="h-20 w-auto object-contain" />
            </div>

            <div className="mb-4 bg-white px-4 pb-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
                  size={16}
                />
                <input
                  type="text"
                  value={sidebarSearchQuery}
                  onChange={(event) => setSidebarSearchQuery(event.target.value)}
                  placeholder="功能搜索"
                  aria-label="功能搜索"
                  className="w-full rounded-full border border-[#edf1f5] bg-[#f8fafc] py-2 pl-10 pr-9 text-sm font-normal text-[#475467] outline-none placeholder:font-normal placeholder:text-[#98a2b3] focus:border-[#a8ded2] focus:ring-1 focus:ring-[#c9eee6]"
                />
                {sidebarSearchQuery ? (
                  <button
                    type="button"
                    aria-label="清除搜索"
                    onClick={() => setSidebarSearchQuery('')}
                    className="focus-ring absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#98a2b3] transition-colors hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="h-6 shrink-0" />
        )}

        <nav className="flex-1 overflow-y-auto custom-scrollbar">
          {(() => {
            // Pipeline: role gate → workbench gate → search filter
            const roleFilteredMenu = filterMenuByRole(sidebarMenuConfig, userRole);
            const workbenchFilteredMenu = roleFilteredMenu.filter((item) => {
              if (item.workbenchGate === 'call' && !allowedWorkbenches.call) {
                return false;
              }
              if (item.workbenchGate === 'online' && !allowedWorkbenches.online) {
                return false;
              }
              return true;
            });
            const hasActiveSearch =
              !isSidebarCollapsed && sidebarSearchQuery.trim().length > 0;
            const visibleMenuItems = hasActiveSearch
              ? filterMenuByQuery(workbenchFilteredMenu, sidebarSearchQuery)
              : workbenchFilteredMenu;

            if (visibleMenuItems.length === 0) {
              return (
                <div className="px-6 py-10 text-center text-[13px] text-slate-400">
                  {hasActiveSearch
                    ? `未找到与「${sidebarSearchQuery}」匹配的菜单`
                    : '当前角色暂无可用菜单'}
                </div>
              );
            }

            return visibleMenuItems.map((item) => {
              const Icon = item.icon;
              if (!Icon) return null;

              const hasChildren = Boolean(item.children && item.children.length > 0);

              // Leaf item (workbench entry)
              if (!hasChildren) {
                const isActive =
                  item.opensTab !== undefined && activeTab === item.opensTab;
                return (
                  <SidebarItem
                    key={item.id}
                    icon={Icon}
                    label={item.label}
                    active={isActive}
                    collapsed={isSidebarCollapsed}
                    onClick={() => {
                      if (item.opensTab) {
                        handleOpenMainTab(item.opensTab);
                      }
                    }}
                  />
                );
              }

              // Group item
              const expanded = hasActiveSearch || expandedMenuIds.has(item.id);
              const children = item.children as MenuItemConfig[];
              return (
                <div key={item.id}>
                  <SidebarItem
                    icon={Icon}
                    label={item.label}
                    hasSub
                    expanded={expanded}
                    collapsed={isSidebarCollapsed}
                    onClick={() => toggleMenuExpansion(item.id)}
                  />
                  {expanded && !isSidebarCollapsed ? (
                    <div className="pb-2">
                      {children.map((child) => {
                        const isChildActive =
                          child.opensTab !== undefined &&
                          activeTab === child.opensTab;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              if (child.opensTab) {
                                handleOpenMainTab(child.opensTab);
                              }
                            }}
                            className={cn(
                              sidebarSubMenuButtonClass,
                              isChildActive
                                ? sidebarSubMenuButtonActiveClass
                                : sidebarSubMenuButtonInactiveClass
                            )}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            });
          })()}
        </nav>

        <div className={cn("shrink-0 pb-4", isSidebarCollapsed ? "px-0" : "px-4")}>
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className={cn(
              "flex items-center text-[#98a2b3] transition-colors hover:bg-[#eef7f4] hover:text-[#344054]",
              isSidebarCollapsed ? "mx-auto h-10 w-10 justify-center rounded-md" : "h-10 w-full justify-start rounded-md px-2"
            )}
            aria-label={isSidebarCollapsed ? '展开左侧菜单' : '折叠左侧菜单'}
          >
            <Rows3 size={18} />
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <MainHeader
          isTopHeaderSignedIn={isTopHeaderSignedIn}
          topHeaderPresenceMeta={topHeaderPresenceMeta}
          visibleMainTabs={visibleMainTabs}
          activeTab={activeTab}
          secondaryMainTabCloseLabels={secondaryMainTabCloseLabels}
          onTogglePresence={toggleTopHeaderPresence}
          onOpenMainTab={handleOpenMainTab}
          onCloseSecondaryMainTab={handleCloseSecondaryMainTab}
          onOpenPortal={handleGoToPortal}
          userName={userRoleLabels[userRole]}
          avatarSrc="https://picsum.photos/seed/user/100/100"
          currentRole={userRole}
          onRoleChange={setUserRole}
        />

        <ErrorBoundary key={activeTab}>
        {activeTab === '呼叫工作台' ? callWorkbenchContent : activeTab === '在线工作台' ? onlineWorkbenchContent : activeTab === '消息服务' ? (
          <Suspense fallback={deferredTabFallback}>
            <MessageServiceContent
              activeMailbox={activeMessageServiceMailbox}
              mailboxes={messageServiceMailboxes}
              onMailboxChange={setActiveMessageServiceMailbox}
            />
          </Suspense>
        ) : activeTab === '排班信息展示' ? (
          <Suspense fallback={deferredTabFallback}>
            <ScheduleDisplayContent />
          </Suspense>
        ) : activeTab === '业务字段管理' ? (
          <Suspense fallback={deferredTabFallback}>
            <BusinessFieldManagementContent />
          </Suspense>
        ) : activeTab === '业务字段上线审核' ? (
          <Suspense fallback={deferredTabFallback}>
            <BusinessFieldLaunchReviewContent />
          </Suspense>
        ) : activeTab === '工单管理' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
            <Suspense fallback={deferredTabFallback}>
              <WorkOrderManagementContent />
            </Suspense>
          </div>
        ) : activeTab === '学习课程' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
            <Suspense fallback={deferredTabFallback}>
              <CourseListContent />
            </Suspense>
          </div>
        ) : activeTab === '繁忙公告管理' ? (
          <Suspense fallback={deferredTabFallback}>
            <BusyAnnouncementContent />
          </Suspense>
        ) : activeTab === '隐私声明管理' ? (
          <Suspense fallback={deferredTabFallback}>
            <PrivacyStatementContent />
          </Suspense>
        ) : activeTab === '网聊维护' ? (
          <Suspense fallback={deferredTabFallback}>
            <WebchatMaintenanceContent />
          </Suspense>
        ) : activeTab === '录音查询' || activeTab === '范例录音查询' || activeTab === '范例录音审核' || activeTab === '短信收发查询' || activeTab === '邮件收发查询' || activeTab === '话务员监控' || activeTab === '队列监控' || activeTab === '网聊历史查询' || activeTab === '网聊留言管理' || activeTab === '网聊黑名单查询' || activeTab === '网聊黑名单审批' || activeTab === '小结管理' || activeTab === '预约回电管理' ? (
          <Suspense fallback={deferredTabFallback}>
            <LegacyModulesPanel
              page={
                activeTab === '录音查询' ? 'recording-query' :
                activeTab === '范例录音查询' ? 'sample-recording-query' :
                activeTab === '范例录音审核' ? 'sample-recording-audit' :
                activeTab === '短信收发查询' ? 'sms-delivery-query' :
                activeTab === '邮件收发查询' ? 'mail-delivery-query' :
                activeTab === '话务员监控' ? 'agent-monitoring' :
                activeTab === '队列监控' ? 'queue-monitoring' :
                activeTab === '网聊历史查询' ? 'webchat-history-query' :
                activeTab === '网聊留言管理' ? 'webchat-message-management' :
                activeTab === '网聊黑名单查询' ? 'webchat-blacklist-query' :
                activeTab === '网聊黑名单审批' ? 'webchat-blacklist-approval' :
                activeTab === '小结管理' ? 'summary-management' :
                'appointment-message-management'
              }
              onOpenMainTab={handleOpenMainTab}
              filterPreset={pendingFilterPresetRef.current}
              onFilterPresetConsumed={() => { pendingFilterPresetRef.current = null; }}
            />
          </Suspense>
        ) : (
        <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-5">
          {viewMode === 'manager' && managerPortalPage === 'overview-detail' ? (
            <Suspense fallback={deferredTabFallback}>
              <ManagerOverviewDetailContent onBack={() => setManagerPortalPage('dashboard')} />
            </Suspense>
          ) : viewMode === 'manager' && managerPortalPage === 'ranking-detail' ? (
            <Suspense fallback={deferredTabFallback}>
              <ManagerRankingDetailContent onBack={() => setManagerPortalPage('dashboard')} />
            </Suspense>
          ) : viewMode === 'agent' && agentPortalPage === 'ranking-detail' ? (
            <Suspense fallback={deferredTabFallback}>
              <AgentRankingDetailContent onBack={() => setAgentPortalPage('dashboard')} />
            </Suspense>
          ) : (
          <>
          <PortalViewHeader greeting={portalGreeting} />

          {viewMode === 'manager' ? (
            <Suspense fallback={deferredTabFallback}>
              <ManagerPortalDashboardContent
                allFilter={allFilter}
                onlineFilter={onlineFilter}
                trendMonth={trendMonth}
                personnelDate={personnelDate}
                personnelFocusMetric={personnelFocusMetric}
                businessPeriod={businessPeriod}
                unreadDirectorMessageCount={unreadDirectorMessageCount}
                isChannelLocked={isChannelLocked}
                onAllFilterChange={setAllFilter}
                onOnlineFilterChange={setOnlineFilter}
                onTrendMonthChange={setTrendMonth}
                onPersonnelDateChange={setPersonnelDate}
                onPersonnelFocusMetricChange={setPersonnelFocusMetric}
                onBusinessPeriodChange={setBusinessPeriod}
                onOpenDirectorModal={() => setShowDirectorModal(true)}
                onOpenOverviewDetail={() => setManagerPortalPage('overview-detail')}
                onOpenBadRecordingModal={handleOpenBadRecordingModal}
                onOpenCriticalErrorModal={() => handleOpenErrorModal('critical')}
                onOpenMessageService={() => handleOpenMainTab('消息服务')}
                onOpenRankingDetail={() => setManagerPortalPage('ranking-detail')}
                onOpenScheduleDisplay={() => handleOpenMainTab('排班信息展示')}
                onOpenWorkOrder={() => handleOpenMainTab('工单管理')}
                onOpenCustomerFollow={() => handleOpenMainTab('预约回电管理')}
                onOpenCourseList={() => handleOpenMainTab('学习课程')}
                onOpenSummaryManagement={() => handleOpenMainTab('小结管理')}
                isDirector={userRole === 'director'}
              />
            </Suspense>
          ) : (
            <Suspense fallback={deferredTabFallback}>
              <AgentPortalDashboardContent
                agentSubTab={agentSubTab}
                starEmployeeMetric={starEmployeeMetric}
                satisfactionStarEmployees={satisfactionStarEmployees}
                activeShiftDay={activeShiftDay}
                unreadDirectorMessageCount={unreadDirectorMessageCount}
                isChannelLocked={isChannelLocked}
                showTodayTodo={userRole === 'agent'}
                onAgentSubTabChange={setAgentSubTab}
                onStarEmployeeMetricChange={setStarEmployeeMetric}
                onActiveShiftDayChange={setActiveShiftDay}
                onOpenDirectorModal={() => setShowDirectorModal(true)}
                onOpenBadRecordingModal={handleOpenBadRecordingModal}
                onOpenCriticalErrorModal={() => handleOpenErrorModal('critical')}
                onOpenMessageService={() => handleOpenMainTab('消息服务')}
                onOpenRankingDetail={() => setAgentPortalPage('ranking-detail')}
                onOpenScheduleDisplay={() => handleOpenMainTab('排班信息展示')}
                onOpenOnlineWorkbench={() => handleOpenMainTab('在线工作台')}
                onOpenWorkOrder={() => handleOpenMainTab('工单管理')}
                onOpenCustomerFollow={() => handleOpenMainTab('预约回电管理')}
                onOpenCourseList={() => handleOpenMainTab('学习课程')}
                onOpenSummaryManagement={() => {
                  if (agentSubTab === 'hotline') {
                    pendingFilterPresetRef.current = { page: 'summary-management', filters: { status: '暂存' } };
                    handleOpenMainTab('小结管理');
                  } else {
                    pendingFilterPresetRef.current = { page: 'webchat-history-query', filters: { summarized: '未小结' } };
                    handleOpenMainTab('网聊历史查询');
                  }
                }}
              />
            </Suspense>
          )}
          </>
          )}
          </div>
        </div>
        )}
        </ErrorBoundary>
      </main>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div
            className="fixed top-0 right-0 bottom-0 z-[120] flex items-center justify-center p-4"
            style={{ left: isSidebarCollapsed ? 68 : 256 }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowErrorModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative flex h-[570px] w-full max-w-[1057px] flex-col overflow-hidden rounded-[2px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
            >
              <div className="flex items-center justify-between px-[20px] pt-[16px]">
                <div className="text-[16px] font-semibold text-[#2f2f2f]">质检详情</div>
                <button 
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="rounded p-0.5 text-[#5f6f8d] transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  <X size={28} strokeWidth={2} />
                </button>
              </div>
              <div className="flex-1 px-[15px] pt-[34px]">
                <div className="overflow-hidden">
                  <table className="w-full table-fixed text-left">
                    <thead className="bg-[#f3f3f3] text-[14px] text-[#3e3e3e]">
                      <tr>
                        <th className="w-[106px] px-[36px] py-[6px] font-semibold">序号</th>
                        <th className="w-[138px] px-[14px] py-[6px] font-semibold">会话ID</th>
                        <th className="w-[148px] px-[8px] py-[6px] font-semibold">质检分数</th>
                        <th className="w-[148px] px-[8px] py-[6px] font-semibold">小结标签</th>
                        <th className="w-[214px] px-[8px] py-[6px] font-semibold">质检时间</th>
                        <th className="px-[8px] py-[6px] font-semibold">犯错内容</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] text-[#343434]">
                      {visibleErrorRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="px-[50px] py-[18px] leading-none">{record.id}</td>
                          <td className="px-[18px] py-[18px] leading-none">{record.sessionId}</td>
                          <td className="px-[42px] py-[18px] leading-none">{record.score}</td>
                          <td className="px-[28px] py-[18px] leading-none">{record.tag}</td>
                          <td className="px-[10px] py-[18px] leading-none">{record.time}</td>
                          <td
                            title={qualityMistakeHoverText}
                            className="truncate px-[8px] py-[18px] leading-none cursor-help"
                          >
                            {record.mistake}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="relative flex items-center justify-center px-[88px] pb-[28px] pt-[8px] text-[14px] text-[#a5a5a5]">
                <div className="absolute left-[88px] font-medium text-[#3f3f3f]">
                  共 <span className="mx-[2px] text-[#ff8b2b]">{errorModalTotal}</span> 个
                </div>
                <div className="flex items-center gap-[18px]">
                  <span className="text-[#6f6f6f]">5条记录</span>
                  <button
                    type="button"
                    className="flex h-[42px] min-w-[64px] items-center justify-center gap-1 rounded-[12px] border border-[#dfdfdf] bg-white px-[14px] text-[14px] text-[#666666]"
                  >
                    <span>5</span>
                    <ChevronDown size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorModalPage((page) => Math.max(1, page - 1))}
                    disabled={errorModalPage === 1}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-[6px] bg-[#bfbfbf] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-[20px]">
                    {Array.from({ length: 4 }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setErrorModalPage(page)}
                        className={cn(
                          "min-w-[20px] text-center text-[14px]",
                          errorModalPage === page ? "rounded-[6px] bg-[#d7f4ec] px-[12px] py-[5px] text-[#38b9a5]" : "text-[#b1b1b1]"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-[2px] text-[#cdcdcd]">...</span>
                    <button type="button" className="text-[#b1b1b1]">40</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorModalPage((page) => Math.min(errorModalTotalPages, page + 1))}
                    disabled={errorModalPage === errorModalTotalPages}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-[6px] bg-[#bfbfbf] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bad Recording Modal */}
      <AnimatePresence>
        {showBadRecordingModal && (
          <div
            className="fixed top-0 right-0 bottom-0 z-[121] flex items-center justify-center p-4"
            style={{ left: isSidebarCollapsed ? 68 : 256 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBadRecordingModal(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-[332px] rounded-[10px] border border-slate-100 bg-white px-4 pb-4 pt-3 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[14px] font-semibold text-slate-800">不良记录ID</div>
                <button
                  type="button"
                  onClick={() => setShowBadRecordingModal(false)}
                  className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {badRecordingCallIds.map((callId, index) => (
                  <div
                    key={`${callId}-${index}`}
                    className="flex h-[38px] items-center rounded-[6px] border border-slate-100 bg-white px-3 text-[13px] text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                  >
                    {callId}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CallScheduleFollowUpModal
        isOpen={showCallScheduleFollowUpModal}
        leftOffset={isSidebarCollapsed ? 68 : 256}
        defaultPhoneNumber={callCustomerFieldValues['联系号码']}
        onClose={handleCloseCallScheduleFollowUpModal}
        onConfirm={handleCloseCallScheduleFollowUpModal}
      />
      <BlacklistApplicationModal
        isOpen={showOnlineBlacklistModal}
        defaultPhoneNumber={activeOnlineCustomerFieldValues['联系号码'] ?? ''}
        onClose={() => setShowOnlineBlacklistModal(false)}
        onConfirm={() => setShowOnlineBlacklistModal(false)}
      />
      {pendingCallBlock ? (
        <>
          <button
            type="button"
            aria-label="关闭拉黑弹窗"
            onClick={handleCloseCallBlockConfirm}
            className="fixed inset-0 z-[80] bg-transparent"
          />
          <div
            data-dropdown-root="true"
            className="fixed z-[81] w-[280px] rounded-[10px] border border-[#e8edf3] bg-white px-[16px] py-[14px] text-left shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
            style={{ left: pendingCallBlock.x, top: pendingCallBlock.y }}
          >
            <div className="text-[14px] font-semibold leading-none text-[#3f434a]">拉黑原因</div>
            <textarea
              value={callBlockReason}
              onChange={(event) => setCallBlockReason(event.target.value)}
              placeholder="请输入拉黑原因"
              className="mt-[18px] h-[70px] w-full resize-none rounded-[4px] border border-[#e8edf3] px-[10px] py-[8px] text-[12px] leading-[18px] text-[#3f434a] outline-none transition-colors placeholder:text-[#c3cad5] focus:border-[#8ee8db]"
            />
            <div className="mt-[12px] flex items-center justify-end gap-[10px]">
              <button
                type="button"
                onClick={handleCloseCallBlockConfirm}
                className="flex h-[30px] min-w-[66px] items-center justify-center rounded-full border border-[#e4e8ef] bg-white px-[18px] text-[12px] text-[#6f7782] transition-colors hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmCallBlock}
                className="flex h-[30px] min-w-[74px] items-center justify-center rounded-full border border-[#8ee8db] bg-[#ecfbf8] px-[18px] text-[12px] font-medium text-[#11c5ab] transition-colors hover:bg-[#dff8f3]"
              >
                确定
              </button>
            </div>
          </div>
        </>
      ) : null}
      <CallScheduleFollowUpModal
        isOpen={showOnlineScheduleFollowUpModal}
        leftOffset={isSidebarCollapsed ? 68 : 256}
        defaultPhoneNumber={activeOnlineCustomerFieldValues['联系号码']}
        title="预约回电"
        onClose={handleCloseOnlineScheduleFollowUpModal}
        onConfirm={handleCloseOnlineScheduleFollowUpModal}
      />
      <ProblemClassificationSearchModal
        isOpen={problemClassificationSearchScope !== null}
        combos={problemClassificationCombos}
        onClose={() => setProblemClassificationSearchScope(null)}
        onSelect={(combo) => {
          const apply = (prev: WorkbenchFieldValues): WorkbenchFieldValues => ({
            ...prev,
            '问题分类一级': combo.level1,
            '问题分类二级': combo.level2,
            '问题分类三级': combo.level3,
          });
          if (problemClassificationSearchScope === 'call-summary') {
            updateCallSummaryFieldValues(apply);
          } else if (problemClassificationSearchScope === 'online-summary') {
            updateOnlineSummaryFieldValues(apply);
          }
        }}
      />

      <TaggingModal
        isOpen={taggingModalSource !== null}
        tags={taggingModalTags}
        onClose={handleCloseTaggingModal}
        onRemoveTag={handleRemoveTag}
        onAddTag={handleAddTag}
      />

      {shouldRenderDirectorModal ? (
        <Suspense fallback={null}>
          <DirectorExpressModal
            isOpen={showDirectorModal}
            portalViewMode={viewMode}
            view={directorView}
            messages={directorMessages}
            selectedMessage={selectedDirectorMessage}
            newMessageContent={newDirectorMessageContent}
            newMessageTitle={newDirectorMessageTitle}
            isAnonymous={isDirectorMessageAnonymous}
            replyText={directorReplyText}
            replyImage={directorReplyImage}
            onClose={() => setShowDirectorModal(false)}
            onViewChange={setDirectorView}
            onMessageSelect={handleSelectDirectorMessage}
            onNewMessageContentChange={setNewDirectorMessageContent}
            onNewMessageTitleChange={setNewDirectorMessageTitle}
            onAnonymousChange={setIsDirectorMessageAnonymous}
            onReplyTextChange={setDirectorReplyText}
            onReplyImageChange={setDirectorReplyImage}
            onSendMessage={handleSendDirectorMessage}
            onSendReply={handleSendDirectorReply}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
