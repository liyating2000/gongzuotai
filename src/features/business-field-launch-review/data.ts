export type BusinessFieldLaunchReviewBoardItem = {
  name: string;
  businessModule: string;
  applicant: string;
  submittedAt: string;
  highlighted: boolean;
};

export type BusinessFieldLaunchReviewBoardColumn = {
  key: string;
  title: string;
  tone: 'emerald' | 'blue' | 'amber';
  actionLabel: string;
  items: readonly BusinessFieldLaunchReviewBoardItem[];
};

export type BusinessFieldLaunchReviewHistoryRow = {
  id: string;
  batchName: string;
  applicant: string;
  businessModule: string;
  fieldScope: string;
  riskLevel: '高' | '中' | '低';
  status: '待审核' | '待上线' | '已驳回';
  submittedAt: string;
  reviewConclusion: string;
};

export type BusinessFieldLaunchReviewTableRow = {
  id: number;
  content: string;
  applicant: string;
  appliedAt: string;
  approvedAt: string;
  rejectedAt: string;
  status: '待处理' | '已批准' | '已驳回';
  actions: readonly ('查看' | '批准' | '驳回')[];
  requestContent: string;
  requestReason: string;
  businessType: string;
  versionBefore: string;
  versionAfter: string;
};

export const businessFieldLaunchReviewBoardColumns: readonly BusinessFieldLaunchReviewBoardColumn[] = [
  {
    key: 'pending-review',
    title: '待审核批次',
    tone: 'emerald',
    actionLabel: '批量审核',
    items: [
      {
        name: '教育业务字段V3',
        businessModule: '热线客服',
        applicant: '刘畅',
        submittedAt: '09:15',
        highlighted: true,
      },
      {
        name: '渠道标签补充',
        businessModule: '在线客服',
        applicant: '张颖',
        submittedAt: '10:40',
        highlighted: true,
      },
      {
        name: '回访结果字典',
        businessModule: '热线客服',
        applicant: '冉鸥',
        submittedAt: '13:20',
        highlighted: false,
      },
      {
        name: '用户地区联动',
        businessModule: '在线客服',
        applicant: '王晨',
        submittedAt: '14:05',
        highlighted: true,
      },
    ],
  },
  {
    key: 'pending-launch',
    title: '待上线批次',
    tone: 'blue',
    actionLabel: '批量上线',
    items: [
      {
        name: '工单分类新增',
        businessModule: '工单中心',
        applicant: '周航',
        submittedAt: '11:05',
        highlighted: true,
      },
      {
        name: '服务标签收敛',
        businessModule: '在线客服',
        applicant: '孙楠',
        submittedAt: '11:36',
        highlighted: false,
      },
      {
        name: '问题分类二级优化',
        businessModule: '热线客服',
        applicant: '徐萌',
        submittedAt: '15:10',
        highlighted: true,
      },
    ],
  },
  {
    key: 'rejected-review',
    title: '驳回批次',
    tone: 'amber',
    actionLabel: '发起复核',
    items: [
      {
        name: '升级原因枚举调整',
        businessModule: '热线客服',
        applicant: '高原',
        submittedAt: '09:45',
        highlighted: true,
      },
      {
        name: '产品名称映射修订',
        businessModule: '在线客服',
        applicant: '周静',
        submittedAt: '10:28',
        highlighted: false,
      },
    ],
  },
];

export const businessFieldLaunchReviewHistoryRows: readonly BusinessFieldLaunchReviewHistoryRow[] = [
  {
    id: 'REV-20260331-001',
    batchName: '教育业务字段V3',
    applicant: '刘畅',
    businessModule: '热线客服',
    fieldScope: '客户等级、升级原因',
    riskLevel: '高',
    status: '待审核',
    submittedAt: '2026-03-31 09:15',
    reviewConclusion: '待审核人确认必填规则与回退方案',
  },
  {
    id: 'REV-20260331-002',
    batchName: '渠道标签补充',
    applicant: '张颖',
    businessModule: '在线客服',
    fieldScope: '服务渠道、服务标签',
    riskLevel: '中',
    status: '待审核',
    submittedAt: '2026-03-31 10:40',
    reviewConclusion: '需补充枚举值影响范围说明',
  },
  {
    id: 'REV-20260331-003',
    batchName: '工单分类新增',
    applicant: '周航',
    businessModule: '工单中心',
    fieldScope: '工单分类、优先级',
    riskLevel: '低',
    status: '待上线',
    submittedAt: '2026-03-31 11:05',
    reviewConclusion: '审核通过，等待发布窗口执行',
  },
  {
    id: 'REV-20260331-004',
    batchName: '回访结果字典',
    applicant: '冉鸥',
    businessModule: '热线客服',
    fieldScope: '回访结果、回访时间',
    riskLevel: '中',
    status: '已驳回',
    submittedAt: '2026-03-31 13:20',
    reviewConclusion: '字段枚举冲突，退回业务方补充说明',
  },
  {
    id: 'REV-20260331-005',
    batchName: '用户地区联动',
    applicant: '王晨',
    businessModule: '在线客服',
    fieldScope: '用户地区、来源渠道',
    riskLevel: '高',
    status: '待审核',
    submittedAt: '2026-03-31 14:05',
    reviewConclusion: '需校验历史工单兼容策略',
  },
];

export const businessFieldLaunchReviewTableRows: readonly BusinessFieldLaunchReviewTableRow[] = [
  {
    id: 1,
    content: '教育-业务字段版本切换',
    applicant: 'kevin',
    appliedAt: '2026.09.01 18:00',
    approvedAt: '',
    rejectedAt: '',
    status: '待处理',
    actions: ['查看', '批准', '驳回'],
    requestContent: '客户字段版本上线申请',
    requestReason: '双11换版本',
    businessType: '教育',
    versionBefore: '普通版',
    versionAfter: '双11版本',
  },
  {
    id: 2,
    content: '医疗-业务字段版本切换',
    applicant: 'kevin',
    appliedAt: '2026.09.01 18:00',
    approvedAt: '2026.09.01 18:00',
    rejectedAt: '-',
    status: '已批准',
    actions: ['查看'],
    requestContent: '客户字段版本上线申请',
    requestReason: '新版本切换',
    businessType: '医疗',
    versionBefore: '普通版',
    versionAfter: '医疗版',
  },
  {
    id: 3,
    content: '法院-业务字段版本切换',
    applicant: 'kevin',
    appliedAt: '2026.09.01 18:00',
    approvedAt: '-',
    rejectedAt: '2026.09.01 18:00',
    status: '已驳回',
    actions: ['查看'],
    requestContent: '客户字段版本上线申请',
    requestReason: '法院项目版本切换',
    businessType: '法院',
    versionBefore: '普通版',
    versionAfter: '法院版',
  },
];
