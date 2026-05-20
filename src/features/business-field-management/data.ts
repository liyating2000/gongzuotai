export type BusinessFieldManagementTreeItem = {
  name: string;
  enabled: boolean;
};

export type BusinessFieldManagementConfigPanel = {
  key: string;
  title: string;
  tone: 'emerald' | 'blue' | 'amber';
  items: readonly BusinessFieldManagementTreeItem[];
};

export type BusinessFieldManagementRow = {
  id: number;
  businessType: string;
  onlineVersion: string;
  status: '已上线' | '上线审核中';
  updatedBy: string;
  updatedAt: string;
  canSwitchVersion: boolean;
  canManageVersion: boolean;
};

export type BusinessFieldVersionScope = 'online' | 'hotline';
export type BusinessFieldVersionCategory = 'customer' | 'summary';

export type BusinessFieldVersionFieldItem = {
  id: string;
  fieldName: string;
  required: boolean;
};

export const businessFieldManagementConfigPanels: readonly BusinessFieldManagementConfigPanel[] = [
  {
    key: 'business-type',
    title: '业务类型',
    tone: 'emerald',
    items: [
      { name: '教育', enabled: true },
      { name: '交通', enabled: false },
      { name: '听写', enabled: true },
      { name: '文旅', enabled: true },
      { name: '政府', enabled: true },
      { name: '软件', enabled: true },
      { name: '育儿', enabled: true },
      { name: '生活', enabled: false },
    ],
  },
  {
    key: 'product-category',
    title: '产品分类',
    tone: 'blue',
    items: [
      { name: '智慧管理产品线', enabled: true },
      { name: '充电车', enabled: false },
      { name: 'AI创新教育', enabled: true },
      { name: '电脑', enabled: true },
      { name: '教学端', enabled: true },
      { name: '教具', enabled: true },
      { name: '点读教材', enabled: true },
    ],
  },
  {
    key: 'product-name',
    title: '产品名称',
    tone: 'amber',
    items: [
      { name: '智慧管理', enabled: true },
      { name: '新高考', enabled: false },
    ],
  },
];

export const businessFieldManagementRows: readonly BusinessFieldManagementRow[] = [
  {
    id: 1,
    businessType: '小智',
    onlineVersion: '普通版',
    status: '已上线',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: true,
    canManageVersion: true,
  },
  {
    id: 2,
    businessType: '教育',
    onlineVersion: '普通版',
    status: '已上线',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: true,
    canManageVersion: true,
  },
  {
    id: 3,
    businessType: '交通',
    onlineVersion: '普通版',
    status: '已上线',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: true,
    canManageVersion: true,
  },
  {
    id: 4,
    businessType: '听写',
    onlineVersion: '双11版',
    status: '已上线',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: true,
    canManageVersion: true,
  },
  {
    id: 5,
    businessType: '文旅',
    onlineVersion: '双11版',
    status: '上线审核中',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: false,
    canManageVersion: false,
  },
  {
    id: 6,
    businessType: '政府',
    onlineVersion: '双11版',
    status: '上线审核中',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: false,
    canManageVersion: false,
  },
  {
    id: 7,
    businessType: '软件',
    onlineVersion: '普通版',
    status: '上线审核中',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: false,
    canManageVersion: false,
  },
  {
    id: 8,
    businessType: '软件',
    onlineVersion: '普通版',
    status: '上线审核中',
    updatedBy: 'kevin',
    updatedAt: '2026.10.9 18:00',
    canSwitchVersion: false,
    canManageVersion: false,
  },
];

export const businessFieldVersionOptions = ['普通版', '双11版', '新春版'] as const;

export const businessFieldCustomDatabaseFieldOptions = [
  'ext_text_01',
  'ext_text_02',
  'ext_text_03',
  'ext_option_01',
  'ext_option_02',
  'ext_option_03',
  'ext_cascade_01',
  'ext_cascade_02',
  'ext_remark_01',
  'ext_remark_02',
] as const;

export const businessFieldVersionFieldOptions = [
  '客户类型',
  '来电号码',
  '运营商',
  '客户名称',
  '联系地址',
  '来源渠道',
  '业务标签',
  '服务摘要',
] as const;

export const businessFieldVersionFieldTemplates: Record<
  BusinessFieldVersionScope,
  Record<BusinessFieldVersionCategory, readonly BusinessFieldVersionFieldItem[]>
> = {
  online: {
    customer: [
      { id: 'online-customer-1', fieldName: '客户类型', required: true },
      { id: 'online-customer-2', fieldName: '来电号码', required: true },
      { id: 'online-customer-3', fieldName: '运营商', required: true },
      { id: 'online-customer-4', fieldName: '客户名称', required: true },
      { id: 'online-customer-5', fieldName: '', required: true },
    ],
    summary: [
      { id: 'online-summary-1', fieldName: '服务摘要', required: true },
      { id: 'online-summary-2', fieldName: '业务标签', required: false },
      { id: 'online-summary-3', fieldName: '来源渠道', required: true },
    ],
  },
  hotline: {
    customer: [
      { id: 'hotline-customer-1', fieldName: '客户类型', required: true },
      { id: 'hotline-customer-2', fieldName: '来电号码', required: true },
      { id: 'hotline-customer-3', fieldName: '客户名称', required: false },
    ],
    summary: [
      { id: 'hotline-summary-1', fieldName: '服务摘要', required: true },
      { id: 'hotline-summary-2', fieldName: '业务标签', required: true },
      { id: 'hotline-summary-3', fieldName: '', required: false },
    ],
  },
};
