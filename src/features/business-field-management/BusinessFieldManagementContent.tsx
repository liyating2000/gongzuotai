import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  GripVertical,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';

import menuIcon from '../../assets/set-icons/菜单.png';
import minusIcon from '../../assets/set-icons/减号.png';
import addSiblingIcon from '../../assets/set-icons/增加同级.png';
import addChildIcon from '../../assets/set-icons/增加子级.png';
import { cn } from '../../lib/cn';
import {
  businessFieldCustomDatabaseFieldOptions,
  businessFieldManagementConfigPanels,
  businessFieldManagementRows,
  businessFieldVersionFieldOptions,
  businessFieldVersionFieldTemplates,
  businessFieldVersionOptions,
  type BusinessFieldManagementRow,
  type BusinessFieldVersionCategory,
  type BusinessFieldVersionFieldItem,
  type BusinessFieldVersionScope,
} from './data';

type BusinessFieldInnerSection = 'product-management' | 'field-management' | 'field-detail-management';

const businessFieldInnerSections: ReadonlyArray<{
  key: BusinessFieldInnerSection;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { key: 'product-management', label: '业务类型和产品管理', icon: LayoutGrid },
  { key: 'field-management', label: '字段版本管理', icon: List },
  { key: 'field-detail-management', label: '字段管理', icon: Users },
];

const panelToneClassNameMap = {
  emerald: 'border-[#d6f1ea] bg-[linear-gradient(180deg,#edf9f5_0%,#f7fcfa_26%,#ffffff_100%)]',
  blue: 'border-[#d9e4fb] bg-[linear-gradient(180deg,#eff4fe_0%,#f6f8ff_26%,#ffffff_100%)]',
  amber: 'border-[#f3e1c9] bg-[linear-gradient(180deg,#fff7ee_0%,#fffbf6_26%,#ffffff_100%)]',
} as const;

const itemTextClassNameMap = {
  enabled: 'text-slate-700',
  disabled: 'text-slate-700',
} as const;

type ProductManagementBusinessTypeItem = {
  businessTypeId: string;
  name: string;
  enabled: boolean;
};

type ProductManagementCategoryItem = {
  categoryId: string;
  businessTypeName: string;
  name: string;
  enabled: boolean;
  isAfterSales: '是' | '否';
  serviceEntries: string[];
  serviceMode: '' | '寄修' | '上门';
};

type ProductManagementProductNameItem = {
  productNameId: string;
  businessTypeName: string;
  categoryName: string;
  name: string;
  enabled: boolean;
  brand: string;
  isAfterSales: '是' | '否';
  warrantyYears: string;
  snRequired: '是' | '否';
  processingSystem: string;
  systemProductCode: string;
  systemCategoryCode: string;
  serviceEntries: string[];
  serviceMode: string;
  shortName: string;
};

type BusinessFieldVersionListItem = {
  id: string;
  versionType: string;
  versionDescription: string;
  updatedBy: string;
  updatedAt: string;
};

type VersionFieldMoreSettingsItem = {
  id: string;
  productCategory: string;
  productName: string;
  scope: BusinessFieldVersionScope;
  fieldCategory: BusinessFieldVersionCategory;
  fields: BusinessFieldVersionFieldItem[];
};

type VersionFieldEditorState = {
  rowId: number;
  mode: 'create' | 'edit' | 'view';
  versionId?: string;
};

type BusinessFieldDetailManagementTab = 'customer' | 'summary';

type BusinessFieldCustomFieldOptionConfigMode = 'custom' | 'import' | 'api';

type BusinessFieldCustomFieldOptionItem = {
  id: string;
  value: string;
  placeholder: string;
};

type BusinessFieldCascadeOptionNode = {
  id: string;
  value: string;
  placeholder: string;
  expanded: boolean;
  children: BusinessFieldCascadeOptionNode[];
};

type BusinessFieldDetailManagementRow = {
  id: string;
  fieldIdentifier: string;
  fieldName: string;
  fieldType: '单行文本' | '多行文本' | '选项' | '级联';
  databaseFields?: readonly string[];
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
  canEdit: boolean;
  fieldPattern?: string;
  optionConfigMode?: BusinessFieldCustomFieldOptionConfigMode;
  optionItems?: readonly string[];
  cascadeItems?: readonly BusinessFieldCascadeOptionNode[];
  viewDrawerTitle?: string;
  viewDrawerDescription?: string;
};

type BusinessFieldCustomFieldDraft = {
  fieldName: string;
  fieldIdentifier: string;
  fieldType: BusinessFieldDetailManagementRow['fieldType'];
  databaseFields: string[];
  fieldPattern: string;
  optionConfigMode: BusinessFieldCustomFieldOptionConfigMode;
  optionItems: BusinessFieldCustomFieldOptionItem[];
  cascadeItems: BusinessFieldCascadeOptionNode[];
  cascadeFieldNames: string[];
  cascadeFieldIdentifiers: string[];
};

type BusinessFieldCustomFieldEditorState =
  | {
      mode: 'create';
      draft: BusinessFieldCustomFieldDraft;
    }
  | {
      mode: 'edit';
      rowId: string;
      draft: BusinessFieldCustomFieldDraft;
    }
  | {
      mode: 'view';
      rowId: string;
      draft: BusinessFieldCustomFieldDraft;
    };

type BusinessFieldDetailViewDrawerState = {
  title: string;
  description?: string;
  details?: ReadonlyArray<{ label: string; value: string }>;
};

type BusinessFieldDetailManagementSpecialPage =
  | 'problem-classification'
  | 'ticket-template';

type TicketTemplateItem = {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  relatedNodeId: string;
};

type TicketTemplateEditorState = {
  mode: 'create' | 'edit';
  targetItemId?: string;
  name: string;
  content: string;
  status: '' | '启用' | '停用';
};

type ProblemClassificationTreeNode = {
  id: string;
  name: string;
  enabled: boolean;
  expanded: boolean;
  children: ProblemClassificationTreeNode[];
};

type ProblemClassificationLevelItem = {
  id: string;
  problemId: string;
  name: string;
  enabled: boolean;
  relatedNodeId: string;
  parentItemId?: string;
};

type ProblemClassificationLevelKey = 'level-one' | 'level-two' | 'level-three';

type ProblemClassificationLevelCreateState = {
  mode: 'create' | 'edit';
  targetItemId?: string;
  level: ProblemClassificationLevelKey;
  problemId: string;
  problemName: string;
  status: '' | '启用' | '停用';
};

const defaultBusinessFieldUpdatedAt = '2026.10.9 18:00';
const defaultBusinessFieldViewDescription = '字段值通过接口对接';
const businessFieldConfiguredInProductManagementDescription = '在业务类型和产品管理中配置';
const cascadeLevelLabelMap = ['一级', '二级', '三级', '四级', '五级'] as const;
const problemClassificationLevelCreateTitleMap: Record<ProblemClassificationLevelKey, string> = {
  'level-one': '新增问题一级',
  'level-two': '新增问题二级',
  'level-three': '新增问题三级',
};
const problemClassificationLevelEditTitleMap: Record<ProblemClassificationLevelKey, string> = {
  'level-one': '编辑问题一级',
  'level-two': '编辑问题二级',
  'level-three': '编辑问题三级',
};

const createLocalId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const parseSequentialProductManagementId = (value: string) => {
  const normalizedValue = value.trim();

  return /^\d+$/.test(normalizedValue) ? Number(normalizedValue) : null;
};

const getNextSequentialProductManagementId = (ids: readonly string[]) =>
  String(
    ids.reduce((maxId, currentId) => {
      const parsedId = parseSequentialProductManagementId(currentId);
      return parsedId === null ? maxId : Math.max(maxId, parsedId);
    }, 0) + 1
  );

const productManagementServiceEntryOptions = [
  { value: '01', label: '01、微信小程序（合肥项目）' },
  { value: '02', label: '02、APP' },
  { value: '03', label: '03、客服PC端' },
  { value: '04', label: '04、科大讯飞微信公众号' },
  { value: '05', label: '05、课堂刷机' },
  { value: '06', label: '06、合肥窗启' },
] as const;

const createBusinessFieldOptionItem = (index: number): BusinessFieldCustomFieldOptionItem => ({
  id: createLocalId(`option-${index}`),
  value: '',
  placeholder: `选项${index}`,
});

const getCascadeLevelLabel = (depth: number) => cascadeLevelLabelMap[depth] ?? `${depth + 1}级`;

const createPresetCascadeNode = (
  depth: number,
  order: number,
  children: BusinessFieldCascadeOptionNode[] = [],
  expanded = false
): BusinessFieldCascadeOptionNode => ({
  id: createLocalId(`cascade-${depth}-${order}`),
  value: '',
  placeholder: `${getCascadeLevelLabel(depth)}${order}`,
  expanded,
  children,
});

const createDefaultBusinessFieldCascadeItems = (): BusinessFieldCascadeOptionNode[] => [
  createPresetCascadeNode(0, 1, [createPresetCascadeNode(1, 1)], true),
];

const getCascadeMaxDepth = (nodes: readonly BusinessFieldCascadeOptionNode[]): number => {
  if (!nodes || nodes.length === 0) return 0;
  let max = 1;
  for (const node of nodes) {
    const childDepth = getCascadeMaxDepth(node.children);
    if (childDepth + 1 > max) max = childDepth + 1;
  }
  return max;
};

const isTextFieldType = (
  fieldType: BusinessFieldDetailManagementRow['fieldType']
): boolean => fieldType === '单行文本' || fieldType === '多行文本';

const isProvinceCityDistrictFieldName = (fieldName: string | undefined) => {
  if (!fieldName) return false;
  return fieldName.includes('省') && fieldName.includes('市') && fieldName.includes('区');
};

const getRequiredDatabaseFieldCount = (
  fieldType: BusinessFieldDetailManagementRow['fieldType'],
  fieldName?: string,
  cascadeItems?: readonly BusinessFieldCascadeOptionNode[]
) => {
  if (fieldType !== '级联') return 1;
  const provinceCount = isProvinceCityDistrictFieldName(fieldName) ? 3 : 0;
  const cascadeCount = cascadeItems ? getCascadeMaxDepth(cascadeItems) : 0;
  return Math.max(provinceCount, cascadeCount, 2);
};

const padDatabaseFields = (
  fields: readonly string[] | undefined,
  fieldType: BusinessFieldDetailManagementRow['fieldType'],
  fieldName?: string,
  cascadeItems?: readonly BusinessFieldCascadeOptionNode[]
): string[] => {
  const count = getRequiredDatabaseFieldCount(fieldType, fieldName, cascadeItems);
  const next = Array.from({ length: count }, (_, index) => fields?.[index] ?? '');
  return next;
};

const getDatabaseFieldPlaceholder = (
  fieldType: BusinessFieldDetailManagementRow['fieldType'],
  index: number
) => (fieldType === '级联' ? `请选择${getCascadeLevelLabel(index)}数据库字段` : '请选择');

const padCascadeLevelValues = (
  values: readonly string[] | undefined,
  cascadeItems: readonly BusinessFieldCascadeOptionNode[]
): string[] => {
  const count = Math.max(getCascadeMaxDepth(cascadeItems), 2);
  return Array.from({ length: count }, (_, index) => values?.[index] ?? '');
};

const splitCascadeLevelValue = (value: string | undefined): string[] =>
  value
    ? value
        .split(/[、,]\s*/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];

const createBusinessFieldCustomFieldDraft = (): BusinessFieldCustomFieldDraft => {
  const cascadeItems = createDefaultBusinessFieldCascadeItems();
  return {
    fieldName: '',
    fieldIdentifier: '',
    fieldType: '单行文本',
    databaseFields: padDatabaseFields(undefined, '单行文本'),
    fieldPattern: '',
    optionConfigMode: 'custom',
    optionItems: [createBusinessFieldOptionItem(1)],
    cascadeItems,
    cascadeFieldNames: padCascadeLevelValues(undefined, cascadeItems),
    cascadeFieldIdentifiers: padCascadeLevelValues(undefined, cascadeItems),
  };
};

const cloneCascadeNodes = (
  nodes: readonly BusinessFieldCascadeOptionNode[]
): BusinessFieldCascadeOptionNode[] =>
  nodes.map((node) => ({
    ...node,
    children: cloneCascadeNodes(node.children),
  }));

const cloneProblemClassificationTreeNodes = (
  nodes: readonly ProblemClassificationTreeNode[]
): ProblemClassificationTreeNode[] =>
  nodes.map((node) => ({
    ...node,
    children: cloneProblemClassificationTreeNodes(node.children),
  }));

const cloneProblemClassificationLevelItems = (
  items: readonly ProblemClassificationLevelItem[]
): ProblemClassificationLevelItem[] => items.map((item) => ({ ...item }));

const findProblemClassificationTreePath = (
  nodes: readonly ProblemClassificationTreeNode[],
  targetId: string,
  parentPath: readonly string[] = []
): string[] | null => {
  for (const node of nodes) {
    const nextPath = [...parentPath, node.name];

    if (node.id === targetId) {
      return nextPath;
    }

    const childPath = findProblemClassificationTreePath(node.children, targetId, nextPath);

    if (childPath) {
      return childPath;
    }
  }

  return null;
};

const updateProblemClassificationTreeNodes = (
  nodes: readonly ProblemClassificationTreeNode[],
  targetId: string,
  updater: (node: ProblemClassificationTreeNode) => ProblemClassificationTreeNode
): ProblemClassificationTreeNode[] =>
  nodes.map((node) =>
    node.id === targetId
      ? updater(node)
      : {
          ...node,
          children: updateProblemClassificationTreeNodes(node.children, targetId, updater),
        }
  );

const moveArrayItem = <T,>(items: readonly T[], fromIndex: number, toIndex: number): T[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }

  const nextItems = [...items];
  const [targetItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, targetItem);
  return nextItems;
};

const defaultProblemClassificationProductNodeId = '1';
const legacyDefaultProblemClassificationNodeId = 'problem-business-smart-management';

const normalizeInitialProblemClassificationRelatedNodeId = (relatedNodeId: string) =>
  relatedNodeId === legacyDefaultProblemClassificationNodeId
    ? defaultProblemClassificationProductNodeId
    : relatedNodeId;

const getProblemClassificationBusinessTypeNodeId = (businessTypeId: string) =>
  `problem-business-type-${businessTypeId}`;

const getProblemClassificationCategoryNodeId = (categoryId: string) => `problem-category-${categoryId}`;

const createProblemClassificationTreeNodes = ({
  businessTypes,
  productCategories,
  productNames,
  expandedNodeMap,
}: {
  businessTypes: readonly ProductManagementBusinessTypeItem[];
  productCategories: readonly ProductManagementCategoryItem[];
  productNames: readonly ProductManagementProductNameItem[];
  expandedNodeMap: Readonly<Record<string, boolean>>;
}): ProblemClassificationTreeNode[] =>
  businessTypes.map((businessType) => {
    const businessTypeNodeId = getProblemClassificationBusinessTypeNodeId(businessType.businessTypeId);
    const categoryNodes = productCategories
      .filter((category) => category.businessTypeName === businessType.name)
      .map((category) => {
        const categoryNodeId = getProblemClassificationCategoryNodeId(category.categoryId);
        const productNodes = productNames
          .filter(
            (productName) =>
              productName.businessTypeName === businessType.name && productName.categoryName === category.name
          )
          .map((productName) => ({
            id: productName.productNameId,
            name: productName.name,
            enabled: productName.enabled,
            expanded: false,
            children: [],
          }));

        return {
          id: categoryNodeId,
          name: category.name,
          enabled: category.enabled,
          expanded: expandedNodeMap[categoryNodeId] ?? false,
          children: productNodes,
        };
      });

    return {
      id: businessTypeNodeId,
      name: businessType.name,
      enabled: businessType.enabled,
      expanded: expandedNodeMap[businessTypeNodeId] ?? false,
      children: categoryNodes,
    };
  });

const collectSelectableProblemClassificationNodeIds = (
  nodes: readonly ProblemClassificationTreeNode[],
  depth = 0
): string[] =>
  nodes.flatMap((node) =>
    depth === 2
      ? [node.id]
      : node.children.length > 0
        ? collectSelectableProblemClassificationNodeIds(node.children, depth + 1)
        : []
  );

const findProblemClassificationTreeIdPath = (
  nodes: readonly ProblemClassificationTreeNode[],
  targetId: string,
  parentPath: readonly string[] = []
): string[] | null => {
  for (const node of nodes) {
    const nextPath = [...parentPath, node.id];

    if (node.id === targetId) {
      return nextPath;
    }

    const childPath = findProblemClassificationTreeIdPath(node.children, targetId, nextPath);

    if (childPath) {
      return childPath;
    }
  }

  return null;
};

const initialProblemClassificationTreeNodes: readonly ProblemClassificationTreeNode[] = [
  {
    id: 'problem-business-traffic',
    name: '交通',
    enabled: false,
    expanded: true,
    children: [
      {
        id: 'problem-business-traffic-line',
        name: '交通管理产品总线',
        enabled: false,
        expanded: true,
        children: [
          {
            id: 'problem-business-traffic-product',
            name: '交通管理产品总线',
            enabled: false,
            expanded: false,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'problem-business-education',
    name: '教育',
    enabled: true,
    expanded: true,
    children: [
      {
        id: 'problem-business-education-line',
        name: '智慧管理产品总线',
        enabled: true,
        expanded: true,
        children: [
          {
            id: 'problem-business-smart-management',
            name: '智慧管理',
            enabled: true,
            expanded: false,
            children: [],
          },
          {
            id: 'problem-business-new-gaokao',
            name: '新高考',
            enabled: false,
            expanded: false,
            children: [],
          },
          {
            id: 'problem-business-question-bank',
            name: '题库',
            enabled: true,
            expanded: false,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'problem-business-dictation',
    name: '听写',
    enabled: true,
    expanded: false,
    children: [],
  },
  {
    id: 'problem-business-culture',
    name: '文旅',
    enabled: true,
    expanded: false,
    children: [],
  },
  {
    id: 'problem-business-government',
    name: '政府',
    enabled: true,
    expanded: false,
    children: [],
  },
  {
    id: 'problem-business-software',
    name: '软件',
    enabled: true,
    expanded: false,
    children: [],
  },
  {
    id: 'problem-business-parenting',
    name: '育儿',
    enabled: true,
    expanded: false,
    children: [],
  },
];

void initialProblemClassificationTreeNodes;

const initialProblemClassificationLevelOneItems: readonly ProblemClassificationLevelItem[] = [
  {
    id: 'problem-level-one-1',
    problemId: '1',
    name: '不生效类',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-2',
    problemId: '2',
    name: '公众号查询',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-3',
    problemId: '3',
    name: '会员权益兑换',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-4',
    problemId: '4',
    name: '开通类',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-5',
    problemId: '5',
    name: '商务合作类',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-6',
    problemId: '6',
    name: '设置失败类',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-7',
    problemId: '7',
    name: '设置咨询类',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-8',
    problemId: '8',
    name: '退订/删除类',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-9',
    problemId: '9',
    name: '无合适模块',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-10',
    problemId: '10',
    name: '信息查询类',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'problem-level-one-11',
    problemId: '11',
    name: '资费类',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
  },
];

const initialProblemClassificationLevelTwoItems: readonly ProblemClassificationLevelItem[] = [
  {
    id: 'problem-level-two-1',
    problemId: '1',
    name: '播放公司彩铃',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-2',
    problemId: '2',
    name: '播放视频彩铃',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-3',
    problemId: '3',
    name: '彩铃基础功能未开通',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-4',
    problemId: '4',
    name: '彩铃生效延期',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-5',
    problemId: '5',
    name: '混淆来电铃声和彩铃',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-6',
    problemId: '6',
    name: '设置成功未入库',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-7',
    problemId: '7',
    name: '生效版本不一致',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-8',
    problemId: '8',
    name: '无合适标签',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-9',
    problemId: '9',
    name: '无设置记录',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
  {
    id: 'problem-level-two-10',
    problemId: '10',
    name: '业务已退订',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-one-1',
  },
];

const initialProblemClassificationLevelThreeItems: readonly ProblemClassificationLevelItem[] = [
  {
    id: 'problem-level-three-1',
    problemId: '1',
    name: '无合适标签',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-2',
    problemId: '2',
    name: '无法打开',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-3',
    problemId: '3',
    name: '无法打开报错',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-4',
    problemId: '4',
    name: '如何操作',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-5',
    problemId: '5',
    name: '无合适标签',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-6',
    problemId: '6',
    name: '无法打开',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-7',
    problemId: '7',
    name: '如何操作AI速记',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
  {
    id: 'problem-level-three-8',
    problemId: '8',
    name: '支持几种语言转换',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
    parentItemId: 'problem-level-two-1',
  },
];

const initialTicketTemplateItems: readonly TicketTemplateItem[] = [
  {
    id: 'ticket-template-1',
    name: '彩铃设置问题',
    content: '【问题描述】\n【设备型号】\n【已尝试操作】\n【期望结果】',
    enabled: true,
    relatedNodeId: 'problem-business-smart-management',
  },
  {
    id: 'ticket-template-2',
    name: '会员权益问题',
    content: '【会员类型】\n【权益类型】\n【问题表现】\n【订单号】',
    enabled: false,
    relatedNodeId: 'problem-business-smart-management',
  },
];

const createBusinessFieldCustomFieldDraftFromRow = (
  row: BusinessFieldDetailManagementRow
): BusinessFieldCustomFieldDraft => ({
  fieldName: row.fieldName,
  fieldIdentifier: row.fieldIdentifier,
  fieldType: row.fieldType,
  databaseFields: padDatabaseFields(
    row.databaseFields,
    row.fieldType,
    row.fieldName,
    row.cascadeItems
  ),
  fieldPattern: row.fieldPattern ?? '',
  optionConfigMode: row.optionConfigMode ?? 'custom',
  optionItems:
    row.optionItems && row.optionItems.length > 0
      ? row.optionItems.map((item, index) => ({
          id: createLocalId(`option-${index + 1}`),
          value: item,
          placeholder: `选项${index + 1}`,
        }))
      : [createBusinessFieldOptionItem(1)],
  cascadeItems: row.cascadeItems ? cloneCascadeNodes(row.cascadeItems) : createDefaultBusinessFieldCascadeItems(),
  cascadeFieldNames: padCascadeLevelValues(
    row.fieldType === '级联' ? splitCascadeLevelValue(row.fieldName) : undefined,
    row.cascadeItems ?? createDefaultBusinessFieldCascadeItems()
  ),
  cascadeFieldIdentifiers: padCascadeLevelValues(
    row.fieldType === '级联' ? splitCascadeLevelValue(row.fieldIdentifier) : undefined,
    row.cascadeItems ?? createDefaultBusinessFieldCascadeItems()
  ),
});

const mapBusinessFieldCustomFieldDraftToRow = (
  draft: BusinessFieldCustomFieldDraft,
  baseRow?: Partial<BusinessFieldDetailManagementRow>
): BusinessFieldDetailManagementRow => ({
  id: baseRow?.id ?? createLocalId('custom-field'),
  fieldIdentifier:
    draft.fieldType === '级联'
      ? padCascadeLevelValues(draft.cascadeFieldIdentifiers, draft.cascadeItems)
          .map((value) => value.trim())
          .join('、')
      : draft.fieldIdentifier.trim(),
  fieldName:
    draft.fieldType === '级联'
      ? padCascadeLevelValues(draft.cascadeFieldNames, draft.cascadeItems)
          .map((name) => name.trim())
          .join('、')
      : draft.fieldName.trim(),
  fieldType: draft.fieldType,
  databaseFields: (() => {
    const filled = padDatabaseFields(
      draft.databaseFields,
      draft.fieldType,
      draft.fieldName,
      draft.cascadeItems
    ).filter((value) => value);
    return filled.length > 0 ? filled : undefined;
  })(),
  createdBy: baseRow?.createdBy ?? 'kevin',
  updatedBy: 'kevin',
  updatedAt: defaultBusinessFieldUpdatedAt,
  canEdit: baseRow?.canEdit ?? true,
  fieldPattern: isTextFieldType(draft.fieldType) ? draft.fieldPattern.trim() : undefined,
  optionConfigMode: isTextFieldType(draft.fieldType) ? undefined : draft.optionConfigMode,
  optionItems:
    draft.fieldType === '选项' && draft.optionConfigMode === 'custom'
      ? draft.optionItems.map((item) => item.value.trim()).filter((item) => item.length > 0)
      : undefined,
  cascadeItems:
    draft.fieldType === '级联' && draft.optionConfigMode === 'custom'
      ? cloneCascadeNodes(draft.cascadeItems)
      : undefined,
});

const summarizeCascadeNodesForView = (
  nodes: readonly BusinessFieldCascadeOptionNode[],
  depth = 0
): string =>
  nodes
    .map((node) => {
      const indent = '  '.repeat(depth);
      const label = node.value.trim() || node.placeholder;
      const childText = node.children.length
        ? `\n${summarizeCascadeNodesForView(node.children, depth + 1)}`
        : '';
      return `${indent}- ${label}${childText}`;
    })
    .join('\n');

const countFilledCascadeNodes = (nodes: readonly BusinessFieldCascadeOptionNode[]): number =>
  nodes.reduce(
    (count, node) => count + (node.value.trim() ? 1 : 0) + countFilledCascadeNodes(node.children),
    0
  );

const updateCascadeNodes = (
  nodes: readonly BusinessFieldCascadeOptionNode[],
  targetId: string,
  updater: (node: BusinessFieldCascadeOptionNode) => BusinessFieldCascadeOptionNode
): BusinessFieldCascadeOptionNode[] =>
  nodes.map((node) =>
    node.id === targetId
      ? updater(node)
      : {
          ...node,
          children: updateCascadeNodes(node.children, targetId, updater),
        }
  );

const addSiblingCascadeNode = (
  nodes: readonly BusinessFieldCascadeOptionNode[],
  targetId: string,
  depth = 0
): BusinessFieldCascadeOptionNode[] => {
  const index = nodes.findIndex((node) => node.id === targetId);

  if (index >= 0) {
    const nextNodes = [...nodes];
    nextNodes.splice(index + 1, 0, createPresetCascadeNode(depth, nodes.length + 1));
    return nextNodes;
  }

  return nodes.map((node) => ({
    ...node,
    children: addSiblingCascadeNode(node.children, targetId, depth + 1),
  }));
};

const addChildCascadeNode = (
  nodes: readonly BusinessFieldCascadeOptionNode[],
  targetId: string,
  depth = 0
): BusinessFieldCascadeOptionNode[] =>
  depth >= 2
    ? [...nodes]
    : nodes.map((node) =>
        node.id === targetId
          ? {
              ...node,
              expanded: true,
              children: [...node.children, createPresetCascadeNode(depth + 1, node.children.length + 1)],
            }
          : {
              ...node,
              children: addChildCascadeNode(node.children, targetId, depth + 1),
            }
      );

const removeCascadeNode = (
  nodes: readonly BusinessFieldCascadeOptionNode[],
  targetId: string
): BusinessFieldCascadeOptionNode[] =>
  nodes
    .filter((node) => node.id !== targetId)
    .map((node) => ({
      ...node,
      children: removeCascadeNode(node.children, targetId),
    }));

const initialProductManagementBusinessTypes: readonly ProductManagementBusinessTypeItem[] =
  (businessFieldManagementConfigPanels.find((panel) => panel.key === 'business-type')?.items ?? []).map((item, index) => ({
    businessTypeId: String(index + 1),
    name: item.name,
    enabled: item.enabled,
  }));

const initialProductManagementCategories: readonly ProductManagementCategoryItem[] =
  (businessFieldManagementConfigPanels.find((panel) => panel.key === 'product-category')?.items ?? []).map((item, index) => ({
    categoryId: String(index + 1),
    businessTypeName: '教育',
    name: item.name,
    enabled: item.enabled,
    isAfterSales: '是',
    serviceEntries: ['01', '02', '03'],
    serviceMode: '',
  }));

const initialProductManagementProductNames: readonly ProductManagementProductNameItem[] =
  (businessFieldManagementConfigPanels.find((panel) => panel.key === 'product-name')?.items ?? []).map((item, index) => ({
    productNameId: String(index + 1),
    businessTypeName: '教育',
    categoryName: '智慧管理产品线',
    name: item.name,
    enabled: item.enabled,
    brand: item.name === '新高考' ? '新高考' : '智慧管理',
    isAfterSales: '是',
    warrantyYears: '1',
    snRequired: '否',
    processingSystem: 'CRM系统',
    systemProductCode: `SP-${index + 1}`,
    systemCategoryCode: 'SC-1',
    serviceEntries: ['01', '02', '03'],
    serviceMode: '人工服务',
    shortName: item.name,
  }));

const associatedProductNameIds = new Set(
  [
    ...initialProblemClassificationLevelOneItems,
    ...initialProblemClassificationLevelTwoItems,
    ...initialProblemClassificationLevelThreeItems,
    ...initialTicketTemplateItems,
  ].map((item) => normalizeInitialProblemClassificationRelatedNodeId(item.relatedNodeId))
);

const defaultSelectedBusinessTypeName =
  initialProductManagementBusinessTypes.find((item) => item.enabled)?.name ??
  initialProductManagementBusinessTypes[0]?.name ??
  '';
const defaultSelectedProductCategoryName =
  initialProductManagementCategories.find(
    (item) => item.businessTypeName === defaultSelectedBusinessTypeName && item.enabled
  )?.name ??
  initialProductManagementCategories.find((item) => item.businessTypeName === defaultSelectedBusinessTypeName)?.name ??
  '';

type ProductManagementModalState =
  | {
      mode: 'create' | 'edit';
      type: 'business-type';
      originalBusinessTypeId?: string;
      businessTypeId: string;
      businessTypeName: string;
      status: '启用' | '停用';
    }
  | {
      mode: 'create' | 'edit';
      type: 'product-category';
      originalCategoryId?: string;
      businessTypeName: string;
      categoryId: string;
      categoryName: string;
      status: '启用' | '停用';
      isAfterSales: '是' | '否';
      serviceEntries: string[];
      serviceMode: '' | '寄修' | '上门';
    }
  | {
      mode: 'create' | 'edit';
      type: 'product-name';
      originalProductNameId?: string;
      businessTypeName: string;
      categoryName: string;
      productNameId: string;
      productName: string;
      brand: string;
      isAfterSales: '是' | '否';
      warrantyYears: string;
      snRequired: '是' | '否';
      processingSystem: string;
      systemProductCode: string;
      systemCategoryCode: string;
      status: '启用' | '停用';
      serviceEntries: string[];
      serviceMode: string;
      shortName: string;
    };

type ProductManagementDeleteState =
  | {
      type: 'business-type';
      businessTypeId: string;
      itemName: string;
      relatedCategoryCount: number;
      relatedProductCount: number;
      blocked: boolean;
      blockedReason: string;
    }
  | {
      type: 'product-category';
      categoryId: string;
      businessTypeName: string;
      itemName: string;
      relatedProductCount: number;
      blocked: boolean;
      blockedReason: string;
    }
  | {
      type: 'product-name';
      productNameId: string;
      businessTypeName: string;
      categoryName: string;
      itemName: string;
      blocked: boolean;
      blockedReason: string;
    };

const cloneVersionFields = (fields: readonly BusinessFieldVersionFieldItem[]) =>
  fields.map((field) => ({ ...field }));

const getVersionFieldTemplate = (
  scope: BusinessFieldVersionScope,
  category: BusinessFieldVersionCategory
) => cloneVersionFields(businessFieldVersionFieldTemplates[scope][category]);

const createDefaultVersionManagementItems = (): BusinessFieldVersionListItem[] => [
  {
    id: 'field-version-normal',
    versionType: '普通版本',
    versionDescription: '常用版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
  {
    id: 'field-version-double11',
    versionType: '双11版本',
    versionDescription: '双11版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
  {
    id: 'field-version-c',
    versionType: 'C版本',
    versionDescription: '常用版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
  {
    id: 'field-version-d',
    versionType: 'D版本',
    versionDescription: '双11版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
  {
    id: 'field-version-e',
    versionType: 'E版本',
    versionDescription: '常用版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
  {
    id: 'field-version-f',
    versionType: 'F版本',
    versionDescription: '双11版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
  {
    id: 'field-version-g',
    versionType: 'G版本',
    versionDescription: '常用版本',
    updatedBy: 'kevin',
    updatedAt: defaultBusinessFieldUpdatedAt,
  },
];

const createDefaultVersionMoreSettingsItems = (): VersionFieldMoreSettingsItem[] => [
  {
    id: 'version-more-setting-1',
    productCategory: '智慧管理产品线',
    productName: '智慧管理',
    scope: 'online',
    fieldCategory: 'customer',
    fields: getVersionFieldTemplate('online', 'customer'),
  },
  {
    id: 'version-more-setting-2',
    productCategory: '智慧管理产品线',
    productName: '智慧管理',
    scope: 'online',
    fieldCategory: 'customer',
    fields: getVersionFieldTemplate('online', 'customer'),
  },
  {
    id: 'version-more-setting-3',
    productCategory: '智慧管理产品线',
    productName: '智慧管理',
    scope: 'online',
    fieldCategory: 'customer',
    fields: getVersionFieldTemplate('online', 'customer'),
  },
];

const createBusinessFieldManagementRow = (
  id: number,
  businessTypeName: string
): BusinessFieldManagementRow => ({
  id,
  businessType: businessTypeName,
  onlineVersion: '普通版',
  status: '已上线',
  updatedBy: 'kevin',
  updatedAt: '2026.10.9 18:00',
  canSwitchVersion: true,
  canManageVersion: true,
});

const businessFieldDetailManagementRows: Record<
  BusinessFieldDetailManagementTab,
  readonly BusinessFieldDetailManagementRow[]
> = {
  customer: [
    {
      id: 'province-city-district',
      fieldIdentifier: 'province、city、district',
      fieldName: '省、市、区',
      fieldType: '级联',
      databaseFields: ['ext_cascade_01', 'ext_cascade_02', 'ext_remark_01'],
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
    },
    {
      id: 'college',
      fieldIdentifier: 'college',
      fieldName: '学校',
      fieldType: '单行文本',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
      viewDrawerTitle: '学校',
      viewDrawerDescription: defaultBusinessFieldViewDescription,
    },
    {
      id: 'college-label',
      fieldIdentifier: 'college_label',
      fieldName: '学校标签',
      fieldType: '级联',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
      viewDrawerTitle: '学校标签',
      viewDrawerDescription: defaultBusinessFieldViewDescription,
    },
    {
      id: 'service-ownership',
      fieldIdentifier: 'service_ownership',
      fieldName: '服务归口',
      fieldType: '选项',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
      viewDrawerTitle: '服务归口',
      viewDrawerDescription: defaultBusinessFieldViewDescription,
    },
    {
      id: 'audit-status',
      fieldIdentifier: 'audit_status',
      fieldName: '是否审核',
      fieldType: '单行文本',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
      viewDrawerTitle: '是否审核',
      viewDrawerDescription: defaultBusinessFieldViewDescription,
    },
    {
      id: 'customer-type',
      fieldIdentifier: 'customer_type',
      fieldName: '客户类型',
      fieldType: '选项',
      databaseFields: ['ext_option_01'],
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'tel-number',
      fieldIdentifier: 'tel_number',
      fieldName: '来电号码',
      fieldType: '单行文本',
      databaseFields: ['ext_text_01'],
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'carrier',
      fieldIdentifier: 'carrier',
      fieldName: '运营商',
      fieldType: '选项',
      databaseFields: ['ext_option_02'],
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'name',
      fieldIdentifier: 'name',
      fieldName: '客户名称',
      fieldType: '单行文本',
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'contact-number',
      fieldIdentifier: 'contact_number',
      fieldName: '联系号码',
      fieldType: '单行文本',
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'refund-number',
      fieldIdentifier: 'refund_number',
      fieldName: '退费号码',
      fieldType: '单行文本',
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
  ],
  summary: [
    {
      id: 'product-category',
      fieldIdentifier: 'product_category',
      fieldName: '产品分类',
      fieldType: '选项',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
      viewDrawerTitle: '产品分类',
      viewDrawerDescription: businessFieldConfiguredInProductManagementDescription,
    },
    {
      id: 'product-name',
      fieldIdentifier: 'product_name',
      fieldName: '产品名称',
      fieldType: '单行文本',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
      viewDrawerTitle: '产品名称',
      viewDrawerDescription: businessFieldConfiguredInProductManagementDescription,
    },
    {
      id: 'problem-cat',
      fieldIdentifier: 'problem_cat_level1,\nproblem_cat_level2,\nproblem_cat_level3',
      fieldName: '问题分类一级、问题分类二级、问题分类三级',
      fieldType: '选项',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'ticket-template',
      fieldIdentifier: 'ticket_template',
      fieldName: '建单模板',
      fieldType: '选项',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
    {
      id: 'call-summary',
      fieldIdentifier: 'call_summary',
      fieldName: '来电描述',
      fieldType: '多行文本',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
    },
    {
      id: 'session-summary',
      fieldIdentifier: 'session_summary',
      fieldName: '会话总结',
      fieldType: '多行文本',
      createdBy: 'system',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: false,
    },
    {
      id: 'complaint-cat',
      fieldIdentifier: 'complaint_cat_level1、complaint_cat_level2',
      fieldName: '投诉分类一级、投诉分类二级',
      fieldType: '级联',
      databaseFields: ['ext_cascade_01', 'ext_cascade_02'],
      createdBy: 'kevin',
      updatedBy: 'kevin',
      updatedAt: '2026.10.9 18:00',
      canEdit: true,
    },
  ],
};

export default function BusinessFieldManagementContent() {
  const [activeInnerSection, setActiveInnerSection] =
    useState<BusinessFieldInnerSection>('product-management');
  const [productManagementBusinessTypes, setProductManagementBusinessTypes] = useState<
    ProductManagementBusinessTypeItem[]
  >(() => initialProductManagementBusinessTypes.map((item) => ({ ...item })));
  const [productManagementCategories, setProductManagementCategories] = useState<
    ProductManagementCategoryItem[]
  >(() => initialProductManagementCategories.map((item) => ({ ...item })));
  const [productManagementProductNames, setProductManagementProductNames] = useState<
    ProductManagementProductNameItem[]
  >(() => initialProductManagementProductNames.map((item) => ({ ...item })));
  const [fieldRows, setFieldRows] = useState<BusinessFieldManagementRow[]>(() =>
    businessFieldManagementRows.map((row) => ({ ...row }))
  );
  const [versionManagementItemsByRowId, setVersionManagementItemsByRowId] = useState<
    Record<number, BusinessFieldVersionListItem[]>
  >(() =>
    Object.fromEntries(
      businessFieldManagementRows.map((row) => [row.id, createDefaultVersionManagementItems()])
    )
  );
  const [switchVersionDraft, setSwitchVersionDraft] = useState<{
    rowId: number;
    targetVersion: string;
    reason: string;
  } | null>(null);
  const [versionManagementRowId, setVersionManagementRowId] = useState<number | null>(null);
  const [versionFieldEditorState, setVersionFieldEditorState] = useState<VersionFieldEditorState | null>(null);
  const [versionFieldDeleteState, setVersionFieldDeleteState] = useState<{ rowId: number; versionId: string; versionType: string } | null>(null);

  const switchVersionTarget = switchVersionDraft
    ? fieldRows.find((row) => row.id === switchVersionDraft.rowId) ?? null
    : null;
  const versionManagementTarget =
    versionManagementRowId !== null
      ? fieldRows.find((row) => row.id === versionManagementRowId) ?? null
      : null;
  const versionManagementItems =
    versionManagementTarget ? versionManagementItemsByRowId[versionManagementTarget.id] ?? [] : [];
  const versionFieldEditorTarget =
    versionManagementTarget && versionFieldEditorState?.versionId
      ? (versionManagementItemsByRowId[versionManagementTarget.id] ?? []).find(
          (item) => item.id === versionFieldEditorState.versionId
        ) ?? null
      : null;

  const handleOpenSwitchVersionDialog = (row: BusinessFieldManagementRow) => {
    if (!row.canSwitchVersion) {
      return;
    }

    setSwitchVersionDraft({
      rowId: row.id,
      targetVersion: '',
      reason: '',
    });
  };

  const handleConfirmSwitchVersion = () => {
    if (!switchVersionDraft || !switchVersionDraft.targetVersion) {
      return;
    }

    setFieldRows((currentRows) =>
      currentRows.map((row) =>
        row.id === switchVersionDraft.rowId
          ? {
              ...row,
              onlineVersion: switchVersionDraft.targetVersion,
              status: '上线审核中',
              updatedBy: 'kevin',
              updatedAt: '2026.10.9 18:00',
              canSwitchVersion: false,
              canManageVersion: false,
            }
          : row
      )
    );
    setSwitchVersionDraft(null);
  };

  const handleOpenVersionManagement = (row: BusinessFieldManagementRow) => {
    if (!row.canManageVersion) {
      return;
    }

    setVersionFieldEditorState(null);
    setVersionManagementRowId(row.id);
  };

  const handleCreateBusinessType = (item: ProductManagementBusinessTypeItem) => {
    const nextRowId = fieldRows.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;
    setProductManagementBusinessTypes((current) => [...current, item]);
    setVersionManagementItemsByRowId((current) => ({
      ...current,
      [nextRowId]: createDefaultVersionManagementItems(),
    }));
    setFieldRows((currentRows) => [
      ...currentRows,
      createBusinessFieldManagementRow(nextRowId, item.name),
    ]);
  };

  const handleUpdateBusinessType = (
    previousBusinessTypeId: string,
    previousName: string,
    nextItem: ProductManagementBusinessTypeItem
  ) => {
    setProductManagementBusinessTypes((current) =>
      current.map((item) => (item.businessTypeId === previousBusinessTypeId ? nextItem : item))
    );
    setFieldRows((currentRows) =>
      currentRows.map((row) =>
        row.businessType === previousName
          ? {
              ...row,
              businessType: nextItem.name,
            }
          : row
      )
    );
  };

  const handleDeleteBusinessType = (item: ProductManagementBusinessTypeItem) => {
    const deletedRowId = fieldRows.find((row) => row.businessType === item.name)?.id ?? null;
    setProductManagementBusinessTypes((current) =>
      current.filter((businessType) => businessType.businessTypeId !== item.businessTypeId)
    );
    if (deletedRowId !== null) {
      setVersionManagementItemsByRowId((current) => {
        const nextState = { ...current };
        delete nextState[deletedRowId];
        return nextState;
      });
      if (versionManagementRowId === deletedRowId) {
        setVersionManagementRowId(null);
        setVersionFieldEditorState(null);
      }
    }
    setFieldRows((currentRows) => currentRows.filter((row) => row.businessType !== item.name));
  };

  const handleReorderBusinessTypes = (activeBusinessTypeId: string, targetBusinessTypeId: string) => {
    setProductManagementBusinessTypes((currentBusinessTypes) => {
      const fromIndex = currentBusinessTypes.findIndex(
        (item) => item.businessTypeId === activeBusinessTypeId
      );
      const toIndex = currentBusinessTypes.findIndex((item) => item.businessTypeId === targetBusinessTypeId);

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return currentBusinessTypes;
      }

      const nextBusinessTypes = moveArrayItem(currentBusinessTypes, fromIndex, toIndex);
      const nextBusinessTypeOrder = nextBusinessTypes.map((item) => item.name);

      setFieldRows((currentRows) => {
        const rowMap = new Map(currentRows.map((row) => [row.businessType, row] as const));
        const orderedRows = nextBusinessTypeOrder
          .map((businessTypeName) => rowMap.get(businessTypeName))
          .filter((row): row is BusinessFieldManagementRow => Boolean(row));
        const remainingRows = currentRows.filter((row) => !nextBusinessTypeOrder.includes(row.businessType));

        return [...orderedRows, ...remainingRows];
      });

      return nextBusinessTypes;
    });
  };

  const handleOpenCreateVersionField = (rowId: number) => {
    setVersionFieldEditorState({
      rowId,
      mode: 'create',
    });
  };

  const handleOpenEditVersionField = (rowId: number, versionId: string) => {
    setVersionFieldEditorState({
      rowId,
      mode: 'edit',
      versionId,
    });
  };

  const handleCopyVersionField = (rowId: number, versionId: string) => {
    setVersionManagementItemsByRowId((current) => {
      const currentItems = current[rowId] ?? [];
      const targetItem = currentItems.find((item) => item.id === versionId);

      if (!targetItem) {
        return current;
      }

      return {
        ...current,
        [rowId]: [
          ...currentItems,
          {
            ...targetItem,
            id: createLocalId('field-version'),
            versionType: `${targetItem.versionType}副本`,
            updatedBy: 'kevin',
            updatedAt: defaultBusinessFieldUpdatedAt,
          },
        ],
      };
    });
  };

  const handleDeleteVersionField = (rowId: number, versionId: string) => {
    setVersionManagementItemsByRowId((current) => ({
      ...current,
      [rowId]: (current[rowId] ?? []).filter((item) => item.id !== versionId),
    }));

    if (versionFieldEditorState?.rowId === rowId && versionFieldEditorState.versionId === versionId) {
      setVersionFieldEditorState(null);
    }
  };

  const handleOpenViewVersionField = (rowId: number, versionId: string) => {
    setVersionFieldEditorState({ rowId, mode: 'view', versionId });
  };

  const handleRequestDeleteVersionField = (rowId: number, versionId: string) => {
    const targetItem = (versionManagementItemsByRowId[rowId] ?? []).find((item) => item.id === versionId);

    if (!targetItem) {
      return;
    }

    setVersionFieldDeleteState({ rowId, versionId, versionType: targetItem.versionType });
  };

  const handleConfirmDeleteVersionField = () => {
    if (!versionFieldDeleteState) {
      return;
    }

    handleDeleteVersionField(versionFieldDeleteState.rowId, versionFieldDeleteState.versionId);
    setVersionFieldDeleteState(null);
  };

  const handleConfirmVersionField = (payload: { versionName: string; versionDescription: string }) => {
    if (!versionManagementTarget || !versionFieldEditorState || !payload.versionName.trim()) {
      return;
    }

    if (versionFieldEditorState.mode === 'create') {
      setVersionManagementItemsByRowId((current) => ({
        ...current,
        [versionManagementTarget.id]: [
          ...(current[versionManagementTarget.id] ?? []),
          {
            id: createLocalId('field-version'),
            versionType: payload.versionName.trim(),
            versionDescription: payload.versionDescription.trim(),
            updatedBy: 'kevin',
            updatedAt: defaultBusinessFieldUpdatedAt,
          },
        ],
      }));
      setVersionFieldEditorState(null);
      return;
    }

    setVersionManagementItemsByRowId((current) => ({
      ...current,
      [versionManagementTarget.id]: (current[versionManagementTarget.id] ?? []).map((item) =>
        item.id === versionFieldEditorState.versionId
          ? {
              ...item,
              versionType: payload.versionName.trim(),
              versionDescription: payload.versionDescription.trim(),
              updatedBy: 'kevin',
              updatedAt: defaultBusinessFieldUpdatedAt,
            }
          : item
      ),
    }));
    setVersionFieldEditorState(null);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f7fb]">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-2">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#eef2f6] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-6 border-b border-slate-100 px-[16px] pt-[10px]">
              {businessFieldInnerSections.map((item) => {
                const isActive = item.key === activeInnerSection;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveInnerSection(item.key);
                      setVersionManagementRowId(null);
                      setVersionFieldEditorState(null);
                    }}
                    className={cn(
                      'border-b-2 pb-2 text-[14px] font-medium transition-colors',
                      isActive
                        ? 'border-[#19bba5] text-[#19bba5]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-auto px-[12px] pb-[12px] pt-[10px] custom-scrollbar">
              {activeInnerSection === 'product-management' ? (
                <ProductManagementPanel
                  businessTypes={productManagementBusinessTypes}
                  productCategories={productManagementCategories}
                  setProductCategories={setProductManagementCategories}
                  productNames={productManagementProductNames}
                  setProductNames={setProductManagementProductNames}
                  associatedProductNameIds={associatedProductNameIds}
                  onCreateBusinessType={handleCreateBusinessType}
                  onUpdateBusinessType={handleUpdateBusinessType}
                  onDeleteBusinessType={handleDeleteBusinessType}
                  onReorderBusinessTypes={handleReorderBusinessTypes}
                />
              ) : activeInnerSection === 'field-detail-management' ? (
                <FieldManagementDetailManagementPanel
                  businessTypes={productManagementBusinessTypes}
                  productCategories={productManagementCategories}
                  productNames={productManagementProductNames}
                />
              ) : versionManagementTarget ? (
                versionFieldEditorState ? (
                  <VersionFieldEditorPanel
                    key={`version-editor-${versionFieldEditorState.rowId}-${versionFieldEditorState.mode}-${versionFieldEditorState.versionId ?? 'new'}`}
                    row={versionManagementTarget}
                    title={
                      versionFieldEditorState.mode === 'create'
                        ? '新增字段版本'
                        : versionFieldEditorState.mode === 'view'
                          ? '查看字段版本'
                          : '编辑字段版本'
                    }
                    initialVersionName={versionFieldEditorTarget?.versionType ?? ''}
                    initialVersionDescription={versionFieldEditorTarget?.versionDescription ?? ''}
                    readOnly={versionFieldEditorState.mode === 'view'}
                    onBack={() => setVersionFieldEditorState(null)}
                    onConfirm={handleConfirmVersionField}
                  />
                ) : (
                  <VersionManagementListPanel
                    row={versionManagementTarget}
                    items={versionManagementItems}
                    onBack={() => setVersionManagementRowId(null)}
                    onOpenCreateVersionField={() => handleOpenCreateVersionField(versionManagementTarget.id)}
                    onOpenViewVersionField={(versionId) =>
                      handleOpenViewVersionField(versionManagementTarget.id, versionId)
                    }
                    onOpenEditVersionField={(versionId) =>
                      handleOpenEditVersionField(versionManagementTarget.id, versionId)
                    }
                    onCopyVersionField={(versionId) =>
                      handleCopyVersionField(versionManagementTarget.id, versionId)
                    }
                    onRequestDeleteVersionField={(versionId) =>
                      handleRequestDeleteVersionField(versionManagementTarget.id, versionId)
                    }
                  />
                )
              ) : (
                <FieldManagementListPanel
                  rows={fieldRows}
                  onOpenSwitchVersionDialog={handleOpenSwitchVersionDialog}
                  onOpenVersionManagement={handleOpenVersionManagement}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {switchVersionTarget && switchVersionDraft ? (
        <SwitchVersionDialog
          row={switchVersionTarget}
          targetVersion={switchVersionDraft.targetVersion}
          reason={switchVersionDraft.reason}
          onTargetVersionChange={(value) =>
            setSwitchVersionDraft((current) => (current ? { ...current, targetVersion: value } : current))
          }
          onReasonChange={(value) =>
            setSwitchVersionDraft((current) => (current ? { ...current, reason: value } : current))
          }
          onClose={() => setSwitchVersionDraft(null)}
          onConfirm={handleConfirmSwitchVersion}
        />
      ) : null}

      {versionFieldDeleteState ? (
        <ProductManagementModalFrame
          title="删除确认"
          widthClassName="max-w-[320px]"
          onClose={() => setVersionFieldDeleteState(null)}
          onConfirm={handleConfirmDeleteVersionField}
          confirmDisabled={false}
        >
          <div className="text-[13px] leading-6 text-slate-600">
            <p>确定删除&ldquo;{versionFieldDeleteState.versionType}&rdquo;吗？</p>
          </div>
        </ProductManagementModalFrame>
      ) : null}
    </>
  );
}


function ProductManagementPanel({
  businessTypes,
  productCategories,
  setProductCategories,
  productNames,
  setProductNames,
  associatedProductNameIds,
  onCreateBusinessType,
  onUpdateBusinessType,
  onDeleteBusinessType,
  onReorderBusinessTypes,
}: {
  businessTypes: ProductManagementBusinessTypeItem[];
  productCategories: ProductManagementCategoryItem[];
  setProductCategories: Dispatch<SetStateAction<ProductManagementCategoryItem[]>>;
  productNames: ProductManagementProductNameItem[];
  setProductNames: Dispatch<SetStateAction<ProductManagementProductNameItem[]>>;
  associatedProductNameIds: Set<string>;
  onCreateBusinessType: (item: ProductManagementBusinessTypeItem) => void;
  onUpdateBusinessType: (
    previousBusinessTypeId: string,
    previousName: string,
    nextItem: ProductManagementBusinessTypeItem
  ) => void;
  onDeleteBusinessType: (item: ProductManagementBusinessTypeItem) => void;
  onReorderBusinessTypes: (activeBusinessTypeId: string, targetBusinessTypeId: string) => void;
}) {
  const [selectedBusinessTypeName, setSelectedBusinessTypeName] = useState(defaultSelectedBusinessTypeName);
  const [selectedProductCategoryName, setSelectedProductCategoryName] = useState(defaultSelectedProductCategoryName);
  const [productManagementModal, setProductManagementModal] = useState<ProductManagementModalState | null>(null);
  const [productManagementDeleteState, setProductManagementDeleteState] =
    useState<ProductManagementDeleteState | null>(null);
  const [draggingBusinessTypeId, setDraggingBusinessTypeId] = useState<string | null>(null);
  const [dragOverBusinessTypeId, setDragOverBusinessTypeId] = useState<string | null>(null);

  const currentBusinessTypeName = businessTypes.some((item) => item.name === selectedBusinessTypeName)
    ? selectedBusinessTypeName
    : businessTypes.find((item) => item.enabled)?.name ?? businessTypes[0]?.name ?? '';

  const visibleProductCategories = productCategories.filter(
    (item) => item.businessTypeName === currentBusinessTypeName
  );

  const currentProductCategoryName = visibleProductCategories.some((item) => item.name === selectedProductCategoryName)
    ? selectedProductCategoryName
    : visibleProductCategories.find((item) => item.enabled)?.name ?? visibleProductCategories[0]?.name ?? '';

  const visibleProductNames = productNames.filter(
    (item) =>
      item.businessTypeName === currentBusinessTypeName && item.categoryName === currentProductCategoryName
  );

  const getNextBusinessTypeId = () =>
    getNextSequentialProductManagementId(businessTypes.map((item) => item.businessTypeId));

  const getNextCategoryId = () =>
    getNextSequentialProductManagementId(productCategories.map((item) => item.categoryId));

  const getNextProductNameId = () =>
    getNextSequentialProductManagementId(productNames.map((item) => item.productNameId));

  const hasDuplicateBusinessTypeId = (nextId: string, currentId?: string) =>
    businessTypes.some((item) => item.businessTypeId === nextId && item.businessTypeId !== currentId);

  const hasDuplicateCategoryId = (nextId: string, currentId?: string) =>
    productCategories.some((item) => item.categoryId === nextId && item.categoryId !== currentId);

  const hasDuplicateProductNameId = (nextId: string, currentId?: string) =>
    productNames.some((item) => item.productNameId === nextId && item.productNameId !== currentId);

  const handleSelectBusinessType = (businessTypeName: string) => {
    const nextCategories = productCategories.filter((item) => item.businessTypeName === businessTypeName);

    setSelectedBusinessTypeName(businessTypeName);
    setSelectedProductCategoryName(
      nextCategories.find((item) => item.enabled)?.name ?? nextCategories[0]?.name ?? ''
    );
  };

  const handleOpenAddModal = (panelKey: string) => {
    if (panelKey === 'business-type') {
      setProductManagementModal({
        mode: 'create',
        type: 'business-type',
        businessTypeId: getNextBusinessTypeId(),
        businessTypeName: '',
        status: '启用',
      });
      return;
    }

    if (panelKey === 'product-category') {
      if (!currentBusinessTypeName) {
        return;
      }

      setProductManagementModal({
        mode: 'create',
        type: 'product-category',
        businessTypeName: currentBusinessTypeName,
        categoryId: getNextCategoryId(),
        categoryName: '',
        status: '启用',
        isAfterSales: '是',
        serviceEntries: [],
        serviceMode: '',
      });
      return;
    }

    if (!currentBusinessTypeName || !currentProductCategoryName) {
      return;
    }

    const parentCategoryEnabled = productCategories.find(
      (item) => item.businessTypeName === currentBusinessTypeName && item.name === currentProductCategoryName
    )?.enabled ?? true;

    setProductManagementModal({
      mode: 'create',
      type: 'product-name',
      businessTypeName: currentBusinessTypeName,
      categoryName: currentProductCategoryName,
      productNameId: getNextProductNameId(),
      productName: '',
      brand: '',
      isAfterSales: '是',
      warrantyYears: '',
      snRequired: '否',
      processingSystem: '',
      systemProductCode: '',
      systemCategoryCode: '',
      status: parentCategoryEnabled ? '启用' : '停用',
      serviceEntries: [],
      serviceMode: '',
      shortName: '',
    });
  };

  const handleOpenEditBusinessTypeModal = (item: ProductManagementBusinessTypeItem) => {
    setProductManagementModal({
      mode: 'edit',
      type: 'business-type',
      originalBusinessTypeId: item.businessTypeId,
      businessTypeId: item.businessTypeId,
      businessTypeName: item.name,
      status: item.enabled ? '启用' : '停用',
    });
  };

  const handleOpenEditProductCategoryModal = (item: ProductManagementCategoryItem) => {
    setProductManagementModal({
      mode: 'edit',
      type: 'product-category',
      originalCategoryId: item.categoryId,
      businessTypeName: item.businessTypeName,
      categoryId: item.categoryId,
      categoryName: item.name,
      status: item.enabled ? '启用' : '停用',
      isAfterSales: item.isAfterSales,
      serviceEntries: [...item.serviceEntries],
      serviceMode: item.serviceMode,
    });
  };

  const handleOpenEditProductNameModal = (item: ProductManagementProductNameItem) => {
    setProductManagementModal({
      mode: 'edit',
      type: 'product-name',
      originalProductNameId: item.productNameId,
      businessTypeName: item.businessTypeName,
      categoryName: item.categoryName,
      productNameId: item.productNameId,
      productName: item.name,
      brand: item.brand,
      isAfterSales: item.isAfterSales,
      warrantyYears: item.warrantyYears,
      snRequired: item.snRequired,
      processingSystem: item.processingSystem,
      systemProductCode: item.systemProductCode,
      systemCategoryCode: item.systemCategoryCode,
      status: item.enabled ? '启用' : '停用',
      serviceEntries: [...item.serviceEntries],
      serviceMode: item.serviceMode,
      shortName: item.shortName,
    });
  };

  const handleOpenDeleteBusinessTypeDialog = (item: ProductManagementBusinessTypeItem) => {
    const relatedCategoryCount = productCategories.filter((category) => category.businessTypeName === item.name).length;
    const relatedProductCount = productNames.filter((product) => product.businessTypeName === item.name).length;
    setProductManagementDeleteState({
      type: 'business-type',
      businessTypeId: item.businessTypeId,
      itemName: item.name,
      relatedCategoryCount,
      relatedProductCount,
      blocked: relatedCategoryCount > 0,
      blockedReason: '该业务类型下存在产品分类，需先删除所有子级产品分类',
    });
  };

  const handleOpenDeleteProductCategoryDialog = (item: ProductManagementCategoryItem) => {
    const relatedProductCount = productNames.filter(
      (product) =>
        product.businessTypeName === item.businessTypeName && product.categoryName === item.name
    ).length;
    setProductManagementDeleteState({
      type: 'product-category',
      categoryId: item.categoryId,
      businessTypeName: item.businessTypeName,
      itemName: item.name,
      relatedProductCount,
      blocked: relatedProductCount > 0,
      blockedReason: '该产品分类下存在产品名称，需先删除所有子级产品名称',
    });
  };

  const handleOpenDeleteProductNameDialog = (item: ProductManagementProductNameItem) => {
    const hasAssociation = associatedProductNameIds.has(item.productNameId);
    setProductManagementDeleteState({
      type: 'product-name',
      productNameId: item.productNameId,
      businessTypeName: item.businessTypeName,
      categoryName: item.categoryName,
      itemName: item.name,
      blocked: hasAssociation,
      blockedReason: '该产品名称下存在关联的问题分级配置/建单模板配置，需先删除关联配置',
    });
  };

  const handleConfirmAddModal = () => {
    if (!productManagementModal) {
      return;
    }

    if (productManagementModal.type === 'business-type') {
      const nextName = productManagementModal.businessTypeName.trim();
      const nextId = productManagementModal.businessTypeId.trim();
      const currentBusinessTypeId =
        productManagementModal.originalBusinessTypeId ?? productManagementModal.businessTypeId;

      if (!nextName || !nextId || hasDuplicateBusinessTypeId(nextId, currentBusinessTypeId)) {
        return;
      }

      if (productManagementModal.mode === 'create') {
        onCreateBusinessType({
          businessTypeId: nextId,
          name: nextName,
          enabled: productManagementModal.status === '启用',
        });
        setSelectedBusinessTypeName(nextName);
        setSelectedProductCategoryName('');
      } else {
        const currentItem = businessTypes.find((item) => item.businessTypeId === currentBusinessTypeId);

        if (!currentItem) {
          return;
        }

        const previousName = currentItem.name;
        const nextItem = {
          ...currentItem,
          businessTypeId: nextId,
          name: nextName,
          enabled: productManagementModal.status === '启用',
        };

        onUpdateBusinessType(currentBusinessTypeId, previousName, nextItem);

        if (previousName !== nextName) {
          setProductCategories((current) =>
            current.map((item) =>
              item.businessTypeName === previousName ? { ...item, businessTypeName: nextName } : item
            )
          );
          setProductNames((current) =>
            current.map((item) =>
              item.businessTypeName === previousName ? { ...item, businessTypeName: nextName } : item
            )
          );
        }

        if (selectedBusinessTypeName === previousName) {
          setSelectedBusinessTypeName(nextName);
        }
      }

      setProductManagementModal(null);
      return;
    }

    if (productManagementModal.type === 'product-category') {
      const nextName = productManagementModal.categoryName.trim();
      const nextBusinessTypeName = productManagementModal.businessTypeName.trim();
      const nextCategoryId = productManagementModal.categoryId.trim();
      const nextServiceEntries = productManagementModal.serviceEntries;
      const currentCategoryId = productManagementModal.originalCategoryId ?? productManagementModal.categoryId;

      if (
        !nextBusinessTypeName ||
        !nextCategoryId ||
        !nextName ||
        nextServiceEntries.length === 0 ||
        hasDuplicateCategoryId(nextCategoryId, currentCategoryId)
      ) {
        return;
      }

      if (productManagementModal.mode === 'create') {
        setProductCategories((current) => [
          ...current,
          {
            categoryId: nextCategoryId,
            businessTypeName: nextBusinessTypeName,
            name: nextName,
            enabled: productManagementModal.status === '启用',
            isAfterSales: productManagementModal.isAfterSales,
            serviceEntries: [...nextServiceEntries],
            serviceMode: productManagementModal.serviceMode,
          },
        ]);
      } else {
        const currentItem = productCategories.find((item) => item.categoryId === currentCategoryId);

        if (!currentItem) {
          return;
        }

        const previousBusinessTypeName = currentItem.businessTypeName;
        const previousCategoryName = currentItem.name;

        setProductCategories((current) =>
          current.map((item) =>
            item.categoryId === currentCategoryId
              ? {
                  ...item,
                  categoryId: nextCategoryId,
                  businessTypeName: nextBusinessTypeName,
                  name: nextName,
                  enabled: productManagementModal.status === '启用',
                  isAfterSales: productManagementModal.isAfterSales,
                  serviceEntries: [...nextServiceEntries],
                  serviceMode: productManagementModal.serviceMode,
                }
              : item
          )
        );

        if (
          previousBusinessTypeName !== nextBusinessTypeName ||
          previousCategoryName !== nextName
        ) {
          setProductNames((current) =>
            current.map((item) =>
              item.businessTypeName === previousBusinessTypeName &&
              item.categoryName === previousCategoryName
                ? {
                    ...item,
                    businessTypeName: nextBusinessTypeName,
                    categoryName: nextName,
                  }
                : item
            )
          );
        }

        if (productManagementModal.status === '停用') {
          setProductNames((current) =>
            current.map((item) =>
              item.businessTypeName === nextBusinessTypeName &&
              item.categoryName === nextName
                ? { ...item, enabled: false }
                : item
            )
          );
        }

        if (
          selectedBusinessTypeName === previousBusinessTypeName &&
          selectedProductCategoryName === previousCategoryName
        ) {
          setSelectedBusinessTypeName(nextBusinessTypeName);
        }
      }

      setSelectedBusinessTypeName(nextBusinessTypeName);
      setSelectedProductCategoryName(nextName);
      setProductManagementModal(null);
      return;
    }

    const nextProductNameId = productManagementModal.productNameId.trim();
    const nextName = productManagementModal.productName.trim();
    const nextBusinessTypeName = productManagementModal.businessTypeName.trim();
    const nextCategoryName = productManagementModal.categoryName.trim();
    const nextWarrantyYears = productManagementModal.warrantyYears.trim();
    const nextServiceEntries = productManagementModal.serviceEntries;
    const currentProductNameId =
      productManagementModal.originalProductNameId ?? productManagementModal.productNameId;

    if (
      !nextBusinessTypeName ||
      !nextCategoryName ||
      !nextProductNameId ||
      !nextName ||
      !nextWarrantyYears ||
      nextServiceEntries.length === 0 ||
      hasDuplicateProductNameId(nextProductNameId, currentProductNameId)
    ) {
      return;
    }

    if (productManagementModal.mode === 'create') {
      setProductNames((current) => [
        ...current,
        {
          productNameId: nextProductNameId,
          businessTypeName: nextBusinessTypeName,
          categoryName: nextCategoryName,
          name: nextName,
          enabled: productManagementModal.status === '启用',
          brand: productManagementModal.brand.trim(),
          isAfterSales: productManagementModal.isAfterSales,
          warrantyYears: nextWarrantyYears,
          snRequired: productManagementModal.snRequired,
          processingSystem: productManagementModal.processingSystem.trim(),
          systemProductCode: productManagementModal.systemProductCode.trim(),
          systemCategoryCode: productManagementModal.systemCategoryCode.trim(),
          serviceEntries: [...nextServiceEntries],
          serviceMode: productManagementModal.serviceMode.trim(),
          shortName: productManagementModal.shortName.trim() || nextName,
        },
      ]);
    } else {
      setProductNames((current) =>
        current.map((item) =>
          item.productNameId === currentProductNameId
            ? {
                ...item,
                productNameId: nextProductNameId,
                businessTypeName: nextBusinessTypeName,
                categoryName: nextCategoryName,
                name: nextName,
                enabled: productManagementModal.status === '启用',
                brand: productManagementModal.brand.trim(),
                isAfterSales: productManagementModal.isAfterSales,
                warrantyYears: nextWarrantyYears,
                snRequired: productManagementModal.snRequired,
                processingSystem: productManagementModal.processingSystem.trim(),
                systemProductCode: productManagementModal.systemProductCode.trim(),
                systemCategoryCode: productManagementModal.systemCategoryCode.trim(),
                serviceEntries: [...nextServiceEntries],
                serviceMode: productManagementModal.serviceMode.trim(),
                shortName: productManagementModal.shortName.trim() || nextName,
              }
            : item
        )
      );
    }

    setSelectedBusinessTypeName(nextBusinessTypeName);
    setSelectedProductCategoryName(nextCategoryName);
    setProductManagementModal(null);
  };

  const handleConfirmDelete = () => {
    if (!productManagementDeleteState || productManagementDeleteState.blocked) {
      return;
    }

    if (productManagementDeleteState.type === 'business-type') {
      const currentItem = businessTypes.find(
        (item) => item.businessTypeId === productManagementDeleteState.businessTypeId
      );

      if (!currentItem) {
        return;
      }

      const remainingBusinessTypes = businessTypes.filter(
        (item) => item.businessTypeId !== productManagementDeleteState.businessTypeId
      );

      onDeleteBusinessType(currentItem);

      if (selectedBusinessTypeName === currentItem.name) {
        const nextBusinessTypeName =
          remainingBusinessTypes.find((item) => item.enabled)?.name ??
          remainingBusinessTypes[0]?.name ??
          '';
        const nextCategoryName =
          productCategories.find(
            (item) => item.businessTypeName === nextBusinessTypeName && item.enabled
          )?.name ??
          productCategories.find((item) => item.businessTypeName === nextBusinessTypeName)?.name ??
          '';

        setSelectedBusinessTypeName(nextBusinessTypeName);
        setSelectedProductCategoryName(nextCategoryName);
      }
    }

    if (productManagementDeleteState.type === 'product-category') {
      const remainingCategories = productCategories.filter(
        (item) => item.categoryId !== productManagementDeleteState.categoryId
      );

      setProductCategories(remainingCategories);

      if (
        selectedBusinessTypeName === productManagementDeleteState.businessTypeName &&
        selectedProductCategoryName === productManagementDeleteState.itemName
      ) {
        const nextCategoryName =
          remainingCategories.find(
            (item) =>
              item.businessTypeName === productManagementDeleteState.businessTypeName && item.enabled
          )?.name ??
          remainingCategories.find(
            (item) => item.businessTypeName === productManagementDeleteState.businessTypeName
          )?.name ??
          '';

        setSelectedProductCategoryName(nextCategoryName);
      }
    }

    if (productManagementDeleteState.type === 'product-name') {
      setProductNames((current) =>
        current.filter((item) => item.productNameId !== productManagementDeleteState.productNameId)
      );
    }

    setProductManagementDeleteState(null);
  };

  const isBusinessTypeIdDuplicated =
    productManagementModal?.type === 'business-type'
      ? hasDuplicateBusinessTypeId(
          productManagementModal.businessTypeId.trim(),
          productManagementModal.originalBusinessTypeId ?? productManagementModal.businessTypeId
        )
      : false;
  const isCategoryIdDuplicated =
    productManagementModal?.type === 'product-category'
      ? hasDuplicateCategoryId(
          productManagementModal.categoryId.trim(),
          productManagementModal.originalCategoryId ?? productManagementModal.categoryId
        )
      : false;
  const isProductNameIdDuplicated =
    productManagementModal?.type === 'product-name'
      ? hasDuplicateProductNameId(
          productManagementModal.productNameId.trim(),
          productManagementModal.originalProductNameId ?? productManagementModal.productNameId
        )
      : false;

  const isParentCategoryDisabled =
    productManagementModal?.type === 'product-name'
      ? productCategories.find(
          (item) =>
            item.businessTypeName === productManagementModal.businessTypeName &&
            item.name === productManagementModal.categoryName
        )?.enabled === false
      : false;

  const isConfirmDisabled =
    !productManagementModal ||
    (productManagementModal.type === 'business-type' &&
      (!productManagementModal.businessTypeId.trim() ||
        !productManagementModal.businessTypeName.trim() ||
        isBusinessTypeIdDuplicated)) ||
    (productManagementModal.type === 'product-category' &&
      (!productManagementModal.businessTypeName.trim() ||
        !productManagementModal.categoryId.trim() ||
        !productManagementModal.categoryName.trim() ||
        (productManagementModal.mode === 'create' && productManagementModal.serviceEntries.length === 0) ||
        isCategoryIdDuplicated)) ||
    (productManagementModal.type === 'product-name' &&
      (!productManagementModal.businessTypeName.trim() ||
        !productManagementModal.categoryName.trim() ||
        !productManagementModal.productNameId.trim() ||
        !productManagementModal.productName.trim() ||
        (productManagementModal.mode === 'create' && !productManagementModal.warrantyYears.trim()) ||
        (productManagementModal.mode === 'create' && productManagementModal.serviceEntries.length === 0) ||
        isProductNameIdDuplicated));

  const handleDropBusinessType = (targetBusinessTypeId: string) => {
    if (!draggingBusinessTypeId || draggingBusinessTypeId === targetBusinessTypeId) {
      setDraggingBusinessTypeId(null);
      setDragOverBusinessTypeId(null);
      return;
    }

    onReorderBusinessTypes(draggingBusinessTypeId, targetBusinessTypeId);
    setDraggingBusinessTypeId(null);
    setDragOverBusinessTypeId(null);
  };

  const renderPanels = [
    {
      key: 'business-type',
      title:
        businessFieldManagementConfigPanels.find((panel) => panel.key === 'business-type')?.title ??
        '业务类型',
      tone:
        businessFieldManagementConfigPanels.find((panel) => panel.key === 'business-type')?.tone ??
        'emerald',
      items: businessTypes.map((item) => ({
        id: item.businessTypeId,
        name: item.name,
        enabled: item.enabled,
        selected: item.name === currentBusinessTypeName,
        showMenu: true,
        onClick: () => handleSelectBusinessType(item.name),
        onEdit: () => handleOpenEditBusinessTypeModal(item),
        onDelete: () => handleOpenDeleteBusinessTypeDialog(item),
      })),
    },
    {
      key: 'product-category',
      title:
        businessFieldManagementConfigPanels.find((panel) => panel.key === 'product-category')?.title ??
        '产品分类',
      tone:
        businessFieldManagementConfigPanels.find((panel) => panel.key === 'product-category')?.tone ??
        'blue',
      items: visibleProductCategories.map((item) => ({
        id: item.categoryId,
        name: item.name,
        enabled: item.enabled,
        selected: item.name === currentProductCategoryName,
        showMenu: false,
        onClick: () => setSelectedProductCategoryName(item.name),
        onEdit: () => handleOpenEditProductCategoryModal(item),
        onDelete: () => handleOpenDeleteProductCategoryDialog(item),
      })),
    },
    {
      key: 'product-name',
      title:
        businessFieldManagementConfigPanels.find((panel) => panel.key === 'product-name')?.title ??
        '产品名称',
      tone:
        businessFieldManagementConfigPanels.find((panel) => panel.key === 'product-name')?.tone ??
        'amber',
      items: visibleProductNames.map((item) => ({
        id: item.productNameId,
        name: item.name,
        enabled: item.enabled,
        selected: false,
        showMenu: false,
        onClick: undefined,
        onEdit: () => handleOpenEditProductNameModal(item),
        onDelete: () => handleOpenDeleteProductNameDialog(item),
      })),
    },
  ] as const;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col pl-14">
        <div className="flex items-center justify-end px-2 pb-4 pt-1">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
          >
            <Download size={14} />
            导出
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-stretch gap-[28px] overflow-x-auto pb-1 pr-6">
          {renderPanels.map((panel) => {
            const isAddButtonDisabled =
              (panel.key === 'product-category' && !currentBusinessTypeName) ||
              (panel.key === 'product-name' && (!currentBusinessTypeName || !currentProductCategoryName));

            return (
              <section
                key={panel.key}
                className={cn(
                  'flex min-h-[600px] self-stretch w-[20%] min-w-[240px] shrink-0 flex-col overflow-hidden rounded-[6px] border',
                  panelToneClassNameMap[panel.tone]
                )}
              >
                <div className="flex items-center px-[12px] py-[9px] text-[14px] font-semibold text-slate-700">
                  {panel.title}
                </div>

                <div className="flex min-h-0 flex-1 flex-col px-[12px] pb-[14px] pt-[10px]">
                  <div className="space-y-[2px]">
                    {panel.items.map((item) => {
                      return (
                        <div
                          key={`${panel.key}-${item.id}`}
                          onClick={item.onClick}
                          onDragOver={(event) => {
                            if (panel.key !== 'business-type' || !draggingBusinessTypeId) {
                              return;
                            }

                            event.preventDefault();

                            if (dragOverBusinessTypeId !== item.id) {
                              setDragOverBusinessTypeId(item.id);
                            }
                          }}
                          onDrop={(event) => {
                            if (panel.key !== 'business-type') {
                              return;
                            }

                            event.preventDefault();
                            handleDropBusinessType(item.id);
                          }}
                          className={cn(
                            'flex items-center gap-[7px] rounded-[4px] px-[6px] py-[5px]',
                            item.onClick && 'cursor-pointer',
                            item.selected && 'bg-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.68)]',
                            panel.key === 'business-type' &&
                              dragOverBusinessTypeId === item.id &&
                              draggingBusinessTypeId !== item.id &&
                              'bg-white/80 shadow-[inset_0_0_0_1px_rgba(132,221,208,0.9)]',
                            panel.key === 'business-type' &&
                              draggingBusinessTypeId === item.id &&
                              'opacity-60 shadow-[inset_0_0_0_1px_rgba(132,221,208,0.72)]'
                          )}
                        >
                          {item.enabled ? (
                            <CheckCircle2 size={13} strokeWidth={2.1} className="shrink-0 text-[#28c7b2]" />
                          ) : (
                            <img src={minusIcon} alt="" className="h-[13px] w-[13px] shrink-0 object-contain" />
                          )}

                          <span
                            className={cn(
                              'min-w-0 flex-1 truncate text-[13px]',
                              item.enabled ? itemTextClassNameMap.enabled : itemTextClassNameMap.disabled
                            )}
                          >
                            {item.name}
                          </span>

                          <div className="ml-auto flex items-center gap-[10px] text-slate-400">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                item.onEdit();
                              }}
                              aria-label={`编辑${item.name}`}
                              className="transition-colors hover:text-slate-600"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                item.onDelete();
                              }}
                              aria-label={`删除${item.name}`}
                              className="transition-colors hover:text-slate-600"
                            >
                              <Trash2 size={13} />
                            </button>
                            {item.showMenu ? (
                              <button
                                type="button"
                                draggable
                                onClick={(event) => event.stopPropagation()}
                                onMouseDown={(event) => event.stopPropagation()}
                                onDragStart={(event) => {
                                  event.stopPropagation();
                                  event.dataTransfer.effectAllowed = 'move';
                                  event.dataTransfer.setData('text/plain', item.id);
                                  setDraggingBusinessTypeId(item.id);
                                  setDragOverBusinessTypeId(item.id);
                                }}
                                onDragEnd={(event) => {
                                  event.stopPropagation();
                                  setDraggingBusinessTypeId(null);
                                  setDragOverBusinessTypeId(null);
                                }}
                                aria-label={`拖动排序${item.name}`}
                                className="cursor-grab transition-opacity hover:opacity-80 active:cursor-grabbing"
                              >
                                <img src={menuIcon} alt="" className="h-[13px] w-[13px] object-contain" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={isAddButtonDisabled}
                    onClick={() => handleOpenAddModal(panel.key)}
                    className={cn(
                      'mt-auto inline-flex h-[28px] w-[150px] self-center items-center justify-center gap-1 rounded-[4px] border text-[13px] font-medium transition-colors',
                      isAddButtonDisabled
                        ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                        : 'border-[#8fe0d2] bg-white text-[#21c4b0] hover:bg-[#f4fcfa]'
                    )}
                  >
                    <Plus size={14} />
                    新增
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {productManagementModal?.type === 'business-type' ? (
        <ProductManagementModalFrame
          title={productManagementModal.mode === 'create' ? '新增业务类型' : '编辑业务类型'}
          widthClassName="max-w-[340px]"
          onClose={() => setProductManagementModal(null)}
          onConfirm={handleConfirmAddModal}
          confirmDisabled={isConfirmDisabled}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="业务类型id" />
              <ProductManagementInput
                value={productManagementModal.businessTypeId}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'business-type' ? { ...current, businessTypeId: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="业务类型名称" />
              <ProductManagementInput
                value={productManagementModal.businessTypeName}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'business-type' ? { ...current, businessTypeName: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="状态" />
              <ProductManagementSelect
                value={productManagementModal.status}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'business-type'
                      ? { ...current, status: value as '启用' | '停用' }
                      : current
                  )
                }
                options={['启用', '停用']}
              />
            </div>
          </div>
        </ProductManagementModalFrame>
      ) : null}

      {productManagementModal?.type === 'product-category' ? (
        <ProductManagementModalFrame
          title={productManagementModal.mode === 'create' ? '新增产品分类' : '编辑产品分类'}
          widthClassName="max-w-[430px]"
          onClose={() => setProductManagementModal(null)}
          onConfirm={handleConfirmAddModal}
          confirmDisabled={isConfirmDisabled}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="业务类型名称" />
              <div className="text-[13px] text-slate-600">{productManagementModal.businessTypeName}</div>
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="产品分类ID" />
              <ProductManagementInput
                value={productManagementModal.categoryId}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-category' ? { ...current, categoryId: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="产品分类" required />
              <ProductManagementInput
                value={productManagementModal.categoryName}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-category' ? { ...current, categoryName: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="状态" required />
              <ProductManagementSelect
                value={productManagementModal.status}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-category'
                      ? { ...current, status: value as '启用' | '停用' }
                      : current
                  )
                }
                options={['启用', '停用']}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="是否售后" />
              <ProductManagementSelect
                value={productManagementModal.isAfterSales}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-category'
                      ? { ...current, isAfterSales: value as '是' | '否' }
                      : current
                  )
                }
                options={['是', '否']}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="服务方式" />
              <ProductManagementSelect
                value={productManagementModal.serviceMode}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-category'
                      ? { ...current, serviceMode: value as '' | '寄修' | '上门' }
                      : current
                  )
                }
                options={['', '寄修', '上门']}
              />
            </div>
            <div className="flex items-start gap-3">
              <ProductManagementFieldLabel label="服务入口" required={productManagementModal.mode === 'create'} />
              <ProductManagementMultiSelect
                value={productManagementModal.serviceEntries}
                options={productManagementServiceEntryOptions}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-category' ? { ...current, serviceEntries: value } : current
                  )
                }
              />
            </div>
          </div>
        </ProductManagementModalFrame>
      ) : null}

      {productManagementModal?.type === 'product-name' ? (
        <ProductManagementModalFrame
          title={productManagementModal.mode === 'create' ? '新增产品名称' : '编辑产品名称'}
          widthClassName="max-w-[430px]"
          onClose={() => setProductManagementModal(null)}
          onConfirm={handleConfirmAddModal}
          confirmDisabled={isConfirmDisabled}
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="业务类型名称" />
              <div className="text-[13px] text-slate-600">{productManagementModal.businessTypeName}</div>
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="产品分类" />
              <div className="text-[13px] text-slate-600">{productManagementModal.categoryName}</div>
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="产品名称ID" required />
              <ProductManagementInput
                value={productManagementModal.productNameId}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, productNameId: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="产品名称" required />
              <ProductManagementInput
                value={productManagementModal.productName}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, productName: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="品牌" />
              <ProductManagementSelect
                value={productManagementModal.brand}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, brand: value } : current
                  )
                }
                options={['', '智慧管理', '新高考', '讯飞']}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="是否售后" />
              <ProductManagementSelect
                value={productManagementModal.isAfterSales}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name'
                      ? { ...current, isAfterSales: value as '是' | '否' }
                      : current
                  )
                }
                options={['是', '否']}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="质保时间(年)" required={productManagementModal.mode === 'create'} />
              <ProductManagementInput
                value={productManagementModal.warrantyYears}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, warrantyYears: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="SN是否必填" />
              <ProductManagementSelect
                value={productManagementModal.snRequired}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name'
                      ? { ...current, snRequired: value as '是' | '否' }
                      : current
                  )
                }
                options={['是', '否']}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="处理系统" />
              <ProductManagementSelect
                value={productManagementModal.processingSystem}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, processingSystem: value } : current
                  )
                }
                options={['', '翻译机寄修系统', '丰修系统']}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="处理系统产品编码" />
              <ProductManagementInput
                value={productManagementModal.systemProductCode}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, systemProductCode: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="处理系统分类编码" />
              <ProductManagementInput
                value={productManagementModal.systemCategoryCode}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, systemCategoryCode: value } : current
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductManagementFieldLabel label="状态" required />
              <div className="flex flex-1 items-center gap-2">
                <ProductManagementSelect
                  value={isParentCategoryDisabled ? '停用' : productManagementModal.status}
                  onChange={(value) =>
                    setProductManagementModal((current) =>
                      current?.type === 'product-name'
                        ? { ...current, status: value as '启用' | '停用' }
                        : current
                    )
                  }
                  options={['启用', '停用']}
                  disabled={isParentCategoryDisabled}
                />
                {isParentCategoryDisabled ? (
                  <span className="shrink-0 text-[12px] text-amber-600">(所属产品分类已停用)</span>
                ) : null}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ProductManagementFieldLabel label="服务入口" required={productManagementModal.mode === 'create'} />
              <ProductManagementMultiSelect
                value={productManagementModal.serviceEntries}
                options={productManagementServiceEntryOptions}
                onChange={(value) =>
                  setProductManagementModal((current) =>
                    current?.type === 'product-name' ? { ...current, serviceEntries: value } : current
                  )
                }
              />
            </div>
          </div>
        </ProductManagementModalFrame>
      ) : null}

      {productManagementDeleteState ? (
        <ProductManagementModalFrame
          title="删除确认"
          widthClassName="max-w-[320px]"
          onClose={() => setProductManagementDeleteState(null)}
          onConfirm={handleConfirmDelete}
          confirmDisabled={productManagementDeleteState.blocked}
        >
          <div className="space-y-3 text-[13px] leading-6 text-slate-600">
            {productManagementDeleteState.blocked ? (
              <>
                <p>无法删除“{productManagementDeleteState.itemName}”</p>
                <p className="text-amber-600">{productManagementDeleteState.blockedReason}</p>
              </>
            ) : (
              <p>确定删除”{productManagementDeleteState.itemName}”吗？</p>
            )}
          </div>
        </ProductManagementModalFrame>
      ) : null}
    </>
  );
}

function ProductManagementModalFrame({
  title,
  widthClassName,
  children,
  onClose,
  onConfirm,
  confirmDisabled,
}: {
  title: string;
  widthClassName: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmDisabled: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.36)] p-6">
      <button type="button" aria-label={`关闭${title}`} onClick={onClose} className="absolute inset-0" />
      <div
        className={cn(
          'relative z-10 w-full rounded-[8px] border border-[#e6ebf2] bg-white px-4 pb-4 pt-3 shadow-[0_20px_50px_rgba(15,23,42,0.18)]',
          widthClassName
        )}
      >
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold text-slate-700">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`关闭${title}`}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5">{children}</div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[28px] min-w-[72px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-4 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={cn(
              'inline-flex h-[28px] min-w-[72px] items-center justify-center rounded-full border px-4 text-[13px] transition-colors',
              confirmDisabled
                ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
            )}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductManagementFieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="w-[92px] shrink-0 text-right text-[13px] text-slate-700">
      {required ? <span className="mr-[2px] text-[#ff8b5e]">*</span> : null}
      {label}
    </label>
  );
}

function ProductManagementMultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: readonly { value: string; label: string }[];
}) {
  const handleToggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue]
    );
  };

  return (
    <div className="flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 py-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value.includes(option.value);

          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-2 rounded-[4px] px-2 py-1 text-[13px] text-slate-600 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(option.value)}
                className="mt-[2px] h-3.5 w-3.5 rounded border-[#cbd5e1] text-[#18bca2] focus:ring-[#7fdccf]"
              />
              <span className="leading-5">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ProductManagementInput({
  value,
  onChange,
  disabled = false,
  placeholder,
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      disabled={disabled}
      className={cn(
        'h-[28px] flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]',
        disabled && 'bg-[#f8fafc] text-slate-300'
      )}
    />
  );
}

function ProductManagementSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-[28px] w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]',
          disabled && 'cursor-not-allowed bg-slate-50 text-slate-500'
        )}
      >
        {options.map((item, index) => (
          <option key={`${item || 'empty'}-${index}`} value={item}>
            {item || '请选择'}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function FieldManagementListPanel({
  rows,
  onOpenSwitchVersionDialog,
  onOpenVersionManagement,
}: {
  rows: BusinessFieldManagementRow[];
  onOpenSwitchVersionDialog: (row: BusinessFieldManagementRow) => void;
  onOpenVersionManagement: (row: BusinessFieldManagementRow) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 overflow-hidden rounded-[8px] border border-[#e7edf3] bg-white">
        <div className="min-h-0 overflow-auto custom-scrollbar">
          <table className="min-w-full table-fixed text-center">
            <thead className="bg-[#fafcfe] text-[13px] text-slate-600">
              <tr>
                <th className="w-[120px] px-4 py-3 font-medium text-center">业务类型</th>
                <th className="w-[104px] px-4 py-3 font-medium text-center">上线版本</th>
                <th className="w-[140px] px-4 py-3 font-medium text-center">状态</th>
                <th className="w-[78px] px-4 py-3 font-medium text-center">修改人</th>
                <th className="w-[162px] px-4 py-3 font-medium text-center">修改时间</th>
                <th className="w-[220px] px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {rows.map((row, index) => (
                <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfd]')}>
                  <td className="px-4 py-4 text-center text-slate-700">{row.businessType}</td>
                  <td className="px-4 py-4 text-center">{row.onlineVersion}</td>
                  <td className="px-4 py-4 text-center text-slate-700">{row.status}</td>
                  <td className="px-4 py-4 text-center">{row.updatedBy}</td>
                  <td className="px-4 py-4 text-center">{row.updatedAt}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-6 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenSwitchVersionDialog(row)}
                        className={cn(
                          'transition-colors',
                          row.canSwitchVersion
                            ? 'text-[#2ac7b2] hover:text-[#18bca2]'
                            : 'cursor-default text-slate-300'
                        )}
                      >
                        切换上线版本
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenVersionManagement(row)}
                        className={cn(
                          'transition-colors',
                          row.canManageVersion
                            ? 'text-[#2ac7b2] hover:text-[#18bca2]'
                            : 'cursor-default text-slate-300'
                        )}
                      >
                        版本管理
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FieldManagementDetailManagementPanel({
  businessTypes,
  productCategories,
  productNames,
}: {
  businessTypes: ProductManagementBusinessTypeItem[];
  productCategories: ProductManagementCategoryItem[];
  productNames: ProductManagementProductNameItem[];
}) {
  const [activeTab, setActiveTab] = useState<BusinessFieldDetailManagementTab>('customer');
  const [rowsByTab, setRowsByTab] = useState<Record<
    BusinessFieldDetailManagementTab,
    BusinessFieldDetailManagementRow[]
  >>(() => ({
    customer: businessFieldDetailManagementRows.customer.map((row) => ({ ...row })),
    summary: businessFieldDetailManagementRows.summary.map((row) => ({ ...row })),
  }));
  const [customFieldEditorState, setCustomFieldEditorState] =
    useState<BusinessFieldCustomFieldEditorState | null>(null);
  const [viewDrawerState, setViewDrawerState] = useState<BusinessFieldDetailViewDrawerState | null>(null);
  const [activeSpecialPage, setActiveSpecialPage] =
    useState<BusinessFieldDetailManagementSpecialPage | null>(null);
  const [specialPageReadOnly, setSpecialPageReadOnly] = useState(false);
  const [problemClassificationExpandedNodeMap, setProblemClassificationExpandedNodeMap] = useState<
    Record<string, boolean>
  >({});
  const [problemClassificationLevelOneItems, setProblemClassificationLevelOneItems] = useState<
    ProblemClassificationLevelItem[]
  >(() =>
    cloneProblemClassificationLevelItems(initialProblemClassificationLevelOneItems).map((item) => ({
      ...item,
      relatedNodeId: normalizeInitialProblemClassificationRelatedNodeId(item.relatedNodeId),
    }))
  );
  const [problemClassificationLevelTwoItems, setProblemClassificationLevelTwoItems] = useState<
    ProblemClassificationLevelItem[]
  >(() =>
    cloneProblemClassificationLevelItems(initialProblemClassificationLevelTwoItems).map((item) => ({
      ...item,
      relatedNodeId: normalizeInitialProblemClassificationRelatedNodeId(item.relatedNodeId),
    }))
  );
  const [problemClassificationLevelThreeItems, setProblemClassificationLevelThreeItems] = useState<
    ProblemClassificationLevelItem[]
  >(() =>
    cloneProblemClassificationLevelItems(initialProblemClassificationLevelThreeItems).map((item) => ({
      ...item,
      relatedNodeId: normalizeInitialProblemClassificationRelatedNodeId(item.relatedNodeId),
    }))
  );
  const [problemClassificationLevelCreateState, setProblemClassificationLevelCreateState] =
    useState<ProblemClassificationLevelCreateState | null>(null);
  const [selectedProblemClassificationNodeId, setSelectedProblemClassificationNodeId] = useState(
    defaultProblemClassificationProductNodeId
  );
  const [selectedProblemClassificationLevelOneItemId, setSelectedProblemClassificationLevelOneItemId] = useState<
    string | null
  >(initialProblemClassificationLevelOneItems[0]?.id ?? null);
  const [selectedProblemClassificationLevelTwoItemId, setSelectedProblemClassificationLevelTwoItemId] = useState<
    string | null
  >(initialProblemClassificationLevelTwoItems[0]?.id ?? null);
  const [selectedProblemClassificationLevelThreeItemId, setSelectedProblemClassificationLevelThreeItemId] = useState<
    string | null
  >(initialProblemClassificationLevelThreeItems[0]?.id ?? null);
  const [ticketTemplateItems, setTicketTemplateItems] = useState<TicketTemplateItem[]>(() =>
    initialTicketTemplateItems.map((item) => ({
      ...item,
      relatedNodeId: normalizeInitialProblemClassificationRelatedNodeId(item.relatedNodeId),
    }))
  );
  const [selectedTicketTemplateNodeId, setSelectedTicketTemplateNodeId] = useState(
    defaultProblemClassificationProductNodeId
  );
  const [ticketTemplateExpandedNodeMap, setTicketTemplateExpandedNodeMap] = useState<
    Record<string, boolean>
  >({});
  const [ticketTemplateEditorState, setTicketTemplateEditorState] =
    useState<TicketTemplateEditorState | null>(null);
  const [customFieldDeleteState, setCustomFieldDeleteState] = useState<{ rowId: string; fieldName: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const handle = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(handle);
  }, [toastMessage]);

  const rows = rowsByTab[activeTab];
  const customFieldDraft = customFieldEditorState?.draft ?? null;
  const customFieldDrawerTitle =
    customFieldEditorState?.mode === 'edit' ? '修改自定义字段' : customFieldEditorState?.mode === 'view' ? '查看自定义字段' : '新增自定义字段';
  const isCustomFieldConfirmDisabled =
    !customFieldDraft ||
    (customFieldDraft.fieldType === '级联'
      ? padCascadeLevelValues(customFieldDraft.cascadeFieldNames, customFieldDraft.cascadeItems).some(
          (name) => !name.trim()
        )
      : !customFieldDraft.fieldName.trim()) ||
    !customFieldDraft.fieldType ||
    padDatabaseFields(
      customFieldDraft.databaseFields,
      customFieldDraft.fieldType,
      customFieldDraft.fieldName,
      customFieldDraft.cascadeItems
    ).some((value) => !value) ||
    (customFieldDraft.fieldType === '选项' &&
      customFieldDraft.optionConfigMode === 'custom' &&
      customFieldDraft.optionItems.every((item) => !item.value.trim())) ||
    (customFieldDraft.fieldType === '级联' &&
      customFieldDraft.optionConfigMode === 'custom' &&
      countFilledCascadeNodes(customFieldDraft.cascadeItems) === 0);
  const problemClassificationTree = createProblemClassificationTreeNodes({
    businessTypes,
    productCategories,
    productNames,
    expandedNodeMap: problemClassificationExpandedNodeMap,
  });
  const selectableProblemClassificationNodeIds =
    collectSelectableProblemClassificationNodeIds(problemClassificationTree);
  const selectableProblemClassificationNodeIdsKey = selectableProblemClassificationNodeIds.join('|');
  const selectableProblemClassificationNodeIdSet = new Set(selectableProblemClassificationNodeIds);
  const defaultSelectedProblemClassificationNodeId =
    selectableProblemClassificationNodeIds.find((nodeId) => nodeId === defaultProblemClassificationProductNodeId) ??
    selectableProblemClassificationNodeIds[0] ??
    '';
  const selectedProblemClassificationIdPath =
    findProblemClassificationTreeIdPath(problemClassificationTree, selectedProblemClassificationNodeId) ?? [];
  const selectedProblemClassificationPath =
    findProblemClassificationTreePath(problemClassificationTree, selectedProblemClassificationNodeId) ?? [];
  const problemClassificationLevelOneDisplayItems = problemClassificationLevelOneItems.filter(
    (item) => item.relatedNodeId === selectedProblemClassificationNodeId
  );
  const effectiveSelectedProblemClassificationLevelOneItemId = problemClassificationLevelOneDisplayItems.some(
    (item) => item.id === selectedProblemClassificationLevelOneItemId
  )
    ? selectedProblemClassificationLevelOneItemId
    : (problemClassificationLevelOneDisplayItems[0]?.id ?? null);
  const problemClassificationLevelTwoDisplayItems = problemClassificationLevelTwoItems.filter(
    (item) =>
      item.relatedNodeId === selectedProblemClassificationNodeId &&
      item.parentItemId === effectiveSelectedProblemClassificationLevelOneItemId
  );
  const effectiveSelectedProblemClassificationLevelTwoItemId = problemClassificationLevelTwoDisplayItems.some(
    (item) => item.id === selectedProblemClassificationLevelTwoItemId
  )
    ? selectedProblemClassificationLevelTwoItemId
    : (problemClassificationLevelTwoDisplayItems[0]?.id ?? null);
  const problemClassificationLevelThreeDisplayItems = problemClassificationLevelThreeItems.filter(
    (item) =>
      item.relatedNodeId === selectedProblemClassificationNodeId &&
      item.parentItemId === effectiveSelectedProblemClassificationLevelTwoItemId
  );
  const effectiveSelectedProblemClassificationLevelThreeItemId = problemClassificationLevelThreeDisplayItems.some(
    (item) => item.id === selectedProblemClassificationLevelThreeItemId
  )
    ? selectedProblemClassificationLevelThreeItemId
    : (problemClassificationLevelThreeDisplayItems[0]?.id ?? null);
  const selectedProblemClassificationLevelOneItem =
    problemClassificationLevelOneDisplayItems.find((item) => item.id === effectiveSelectedProblemClassificationLevelOneItemId) ??
    null;
  const selectedProblemClassificationLevelTwoItem =
    problemClassificationLevelTwoDisplayItems.find((item) => item.id === effectiveSelectedProblemClassificationLevelTwoItemId) ??
    null;
  const problemClassificationCreateContextItems =
    problemClassificationLevelCreateState === null
      ? []
      : [
          {
            label: '产品',
            value: selectedProblemClassificationPath[selectedProblemClassificationPath.length - 1] ?? '',
          },
          ...(problemClassificationLevelCreateState.level === 'level-two' ||
          problemClassificationLevelCreateState.level === 'level-three'
            ? selectedProblemClassificationLevelOneItem
              ? [{ label: '问题一级', value: selectedProblemClassificationLevelOneItem.name }]
              : []
            : []),
          ...(problemClassificationLevelCreateState.level === 'level-three'
            ? selectedProblemClassificationLevelTwoItem
              ? [{ label: '问题二级', value: selectedProblemClassificationLevelTwoItem.name }]
              : []
            : []),
        ];

  useEffect(() => {
    if (selectableProblemClassificationNodeIdSet.has(selectedProblemClassificationNodeId)) {
      return;
    }

    if (selectedProblemClassificationNodeId !== defaultSelectedProblemClassificationNodeId) {
      setSelectedProblemClassificationNodeId(defaultSelectedProblemClassificationNodeId);
    }
  }, [
    defaultSelectedProblemClassificationNodeId,
    selectableProblemClassificationNodeIdSet,
    selectedProblemClassificationNodeId,
  ]);

  useEffect(() => {
    if (selectedProblemClassificationIdPath.length <= 1) {
      return;
    }

    setProblemClassificationExpandedNodeMap((current) => {
      let hasChange = false;
      const nextState = { ...current };

      selectedProblemClassificationIdPath.slice(0, -1).forEach((nodeId) => {
        if (!nextState[nodeId]) {
          nextState[nodeId] = true;
          hasChange = true;
        }
      });

      return hasChange ? nextState : current;
    });
  }, [selectedProblemClassificationIdPath]);

  useEffect(() => {
    setProblemClassificationLevelOneItems((current) => {
      const nextItems = current.filter((item) => selectableProblemClassificationNodeIdSet.has(item.relatedNodeId));
      return nextItems.length === current.length ? current : nextItems;
    });
  }, [selectableProblemClassificationNodeIdsKey, selectableProblemClassificationNodeIdSet]);

  useEffect(() => {
    const levelOneIdSet = new Set(problemClassificationLevelOneItems.map((item) => item.id));

    setProblemClassificationLevelTwoItems((current) => {
      const nextItems = current.filter(
        (item) =>
          selectableProblemClassificationNodeIdSet.has(item.relatedNodeId) &&
          item.parentItemId !== undefined &&
          levelOneIdSet.has(item.parentItemId)
      );

      return nextItems.length === current.length ? current : nextItems;
    });
  }, [problemClassificationLevelOneItems, selectableProblemClassificationNodeIdsKey, selectableProblemClassificationNodeIdSet]);

  useEffect(() => {
    const levelTwoIdSet = new Set(problemClassificationLevelTwoItems.map((item) => item.id));

    setProblemClassificationLevelThreeItems((current) => {
      const nextItems = current.filter(
        (item) =>
          selectableProblemClassificationNodeIdSet.has(item.relatedNodeId) &&
          item.parentItemId !== undefined &&
          levelTwoIdSet.has(item.parentItemId)
      );

      return nextItems.length === current.length ? current : nextItems;
    });
  }, [problemClassificationLevelTwoItems, selectableProblemClassificationNodeIdsKey, selectableProblemClassificationNodeIdSet]);

  useEffect(() => {
    const nextSelectedItem = problemClassificationLevelOneDisplayItems.find(
      (item) => item.id === selectedProblemClassificationLevelOneItemId
    );

    if (!nextSelectedItem && selectedProblemClassificationLevelOneItemId !== effectiveSelectedProblemClassificationLevelOneItemId) {
      setSelectedProblemClassificationLevelOneItemId(effectiveSelectedProblemClassificationLevelOneItemId);
    }
  }, [
    effectiveSelectedProblemClassificationLevelOneItemId,
    problemClassificationLevelOneDisplayItems,
    selectedProblemClassificationLevelOneItemId,
  ]);

  useEffect(() => {
    const nextSelectedItem = problemClassificationLevelTwoDisplayItems.find(
      (item) => item.id === selectedProblemClassificationLevelTwoItemId
    );

    if (!nextSelectedItem && selectedProblemClassificationLevelTwoItemId !== effectiveSelectedProblemClassificationLevelTwoItemId) {
      setSelectedProblemClassificationLevelTwoItemId(effectiveSelectedProblemClassificationLevelTwoItemId);
    }
  }, [
    effectiveSelectedProblemClassificationLevelTwoItemId,
    problemClassificationLevelTwoDisplayItems,
    selectedProblemClassificationLevelTwoItemId,
  ]);

  useEffect(() => {
    const nextSelectedItem = problemClassificationLevelThreeDisplayItems.find(
      (item) => item.id === selectedProblemClassificationLevelThreeItemId
    );

    if (
      !nextSelectedItem &&
      selectedProblemClassificationLevelThreeItemId !== effectiveSelectedProblemClassificationLevelThreeItemId
    ) {
      setSelectedProblemClassificationLevelThreeItemId(effectiveSelectedProblemClassificationLevelThreeItemId);
    }
  }, [
    effectiveSelectedProblemClassificationLevelThreeItemId,
    problemClassificationLevelThreeDisplayItems,
    selectedProblemClassificationLevelThreeItemId,
  ]);

  const handleOpenCustomFieldDrawer = () => {
    setViewDrawerState(null);
    setActiveSpecialPage(null);
    setProblemClassificationLevelCreateState(null);
    setCustomFieldEditorState({
      mode: 'create',
      draft: createBusinessFieldCustomFieldDraft(),
    });
  };

  const handleOpenEditCustomFieldDrawer = (row: BusinessFieldDetailManagementRow) => {
    setViewDrawerState(null);
    setSpecialPageReadOnly(false);

    if (row.id === 'problem-cat') {
      setCustomFieldEditorState(null);
      setProblemClassificationLevelCreateState(null);
      setActiveSpecialPage('problem-classification');
      return;
    }

    if (row.id === 'ticket-template') {
      setCustomFieldEditorState(null);
      setTicketTemplateEditorState(null);
      setActiveSpecialPage('ticket-template');
      return;
    }

    setActiveSpecialPage(null);
    setCustomFieldEditorState({
      mode: 'edit',
      rowId: row.id,
      draft: createBusinessFieldCustomFieldDraftFromRow(row),
    });
  };

  const handleOpenViewDrawer = (row: BusinessFieldDetailManagementRow) => {
    setViewDrawerState(null);
    setProblemClassificationLevelCreateState(null);

    if (row.id === 'problem-cat') {
      setCustomFieldEditorState(null);
      setActiveSpecialPage('problem-classification');
      setSpecialPageReadOnly(true);
      return;
    }

    if (row.id === 'ticket-template') {
      setCustomFieldEditorState(null);
      setTicketTemplateEditorState(null);
      setActiveSpecialPage('ticket-template');
      setSpecialPageReadOnly(true);
      return;
    }

    setActiveSpecialPage(null);
    setSpecialPageReadOnly(false);
    setCustomFieldEditorState({
      mode: 'view',
      rowId: row.id,
      draft: createBusinessFieldCustomFieldDraftFromRow(row),
    });
  };

  const handleOpenCreateProblemClassificationLevel = (level: ProblemClassificationLevelKey) => {
    if (!selectedProblemClassificationNodeId) {
      return;
    }

    if (level === 'level-two' && !effectiveSelectedProblemClassificationLevelOneItemId) {
      return;
    }

    if (level === 'level-three' && !effectiveSelectedProblemClassificationLevelTwoItemId) {
      return;
    }

    const levelItems =
      level === 'level-one'
        ? problemClassificationLevelOneItems
        : level === 'level-two'
        ? problemClassificationLevelTwoItems
        : problemClassificationLevelThreeItems;
    const nextProblemId = getNextSequentialProductManagementId(
      levelItems.map((item) => item.problemId)
    );

    setCustomFieldEditorState(null);
    setViewDrawerState(null);
    setActiveSpecialPage('problem-classification');
    setProblemClassificationLevelCreateState({
      mode: 'create',
      level,
      problemId: nextProblemId,
      problemName: '',
      status: '',
    });
  };

  const handleOpenEditProblemClassificationLevel = (
    item: ProblemClassificationLevelItem,
    level: ProblemClassificationLevelKey
  ) => {
    setCustomFieldEditorState(null);
    setViewDrawerState(null);
    setActiveSpecialPage('problem-classification');
    setProblemClassificationLevelCreateState({
      mode: 'edit',
      targetItemId: item.id,
      level,
      problemId: item.problemId,
      problemName: item.name,
      status: item.enabled ? '启用' : '停用',
    });

    if (level === 'level-one') {
      setSelectedProblemClassificationLevelOneItemId(item.id);
      return;
    }

    if (level === 'level-two') {
      setSelectedProblemClassificationLevelTwoItemId(item.id);
      return;
    }

    setSelectedProblemClassificationLevelThreeItemId(item.id);
  };

  const handleDeleteProblemClassificationLevel = (
    item: ProblemClassificationLevelItem,
    level: ProblemClassificationLevelKey
  ) => {
    setProblemClassificationLevelCreateState((current) =>
      current?.mode === 'edit' && current.targetItemId === item.id ? null : current
    );

    if (level === 'level-one') {
      const deletedLevelTwoIds = problemClassificationLevelTwoItems
        .filter((levelTwoItem) => levelTwoItem.parentItemId === item.id)
        .map((levelTwoItem) => levelTwoItem.id);

      setProblemClassificationLevelOneItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setProblemClassificationLevelTwoItems((current) =>
        current.filter((currentItem) => currentItem.parentItemId !== item.id)
      );
      setProblemClassificationLevelThreeItems((current) =>
        current.filter(
          (currentItem) =>
            !currentItem.parentItemId || !deletedLevelTwoIds.includes(currentItem.parentItemId)
        )
      );

      if (selectedProblemClassificationLevelOneItemId === item.id) {
        setSelectedProblemClassificationLevelOneItemId(null);
      }

      if (
        selectedProblemClassificationLevelTwoItemId &&
        deletedLevelTwoIds.includes(selectedProblemClassificationLevelTwoItemId)
      ) {
        setSelectedProblemClassificationLevelTwoItemId(null);
      }

      if (selectedProblemClassificationLevelThreeItemId) {
        const shouldClearLevelThreeSelection = problemClassificationLevelThreeItems.some(
          (levelThreeItem) =>
            levelThreeItem.id === selectedProblemClassificationLevelThreeItemId &&
            levelThreeItem.parentItemId &&
            deletedLevelTwoIds.includes(levelThreeItem.parentItemId)
        );

        if (shouldClearLevelThreeSelection) {
          setSelectedProblemClassificationLevelThreeItemId(null);
        }
      }

      return;
    }

    if (level === 'level-two') {
      setProblemClassificationLevelTwoItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setProblemClassificationLevelThreeItems((current) =>
        current.filter((currentItem) => currentItem.parentItemId !== item.id)
      );

      if (selectedProblemClassificationLevelTwoItemId === item.id) {
        setSelectedProblemClassificationLevelTwoItemId(null);
      }

      if (selectedProblemClassificationLevelThreeItemId) {
        const shouldClearLevelThreeSelection = problemClassificationLevelThreeItems.some(
          (levelThreeItem) =>
            levelThreeItem.id === selectedProblemClassificationLevelThreeItemId &&
            levelThreeItem.parentItemId === item.id
        );

        if (shouldClearLevelThreeSelection) {
          setSelectedProblemClassificationLevelThreeItemId(null);
        }
      }

      return;
    }

    setProblemClassificationLevelThreeItems((current) => current.filter((currentItem) => currentItem.id !== item.id));

    if (selectedProblemClassificationLevelThreeItemId === item.id) {
      setSelectedProblemClassificationLevelThreeItemId(null);
    }
  };

  const handleConfirmCreateProblemClassificationLevel = () => {
    if (
      !problemClassificationLevelCreateState ||
      !problemClassificationLevelCreateState.problemName.trim() ||
      !problemClassificationLevelCreateState.status
    ) {
      return;
    }

    const nextProblemName = problemClassificationLevelCreateState.problemName.trim();
    const nextEnabled = problemClassificationLevelCreateState.status === '启用';

    if (problemClassificationLevelCreateState.mode === 'edit') {
      if (!problemClassificationLevelCreateState.targetItemId) {
        return;
      }

      switch (problemClassificationLevelCreateState.level) {
        case 'level-one':
          setProblemClassificationLevelOneItems((current) =>
            current.map((item) =>
              item.id === problemClassificationLevelCreateState.targetItemId
                ? {
                    ...item,
                    problemId: problemClassificationLevelCreateState.problemId.trim() || item.problemId,
                    name: nextProblemName,
                    enabled: nextEnabled,
                  }
                : item
            )
          );
          break;
        case 'level-two':
          setProblemClassificationLevelTwoItems((current) =>
            current.map((item) =>
              item.id === problemClassificationLevelCreateState.targetItemId
                ? {
                    ...item,
                    problemId: problemClassificationLevelCreateState.problemId.trim() || item.problemId,
                    name: nextProblemName,
                    enabled: nextEnabled,
                  }
                : item
            )
          );
          break;
        case 'level-three':
          setProblemClassificationLevelThreeItems((current) =>
            current.map((item) =>
              item.id === problemClassificationLevelCreateState.targetItemId
                ? {
                    ...item,
                    problemId: problemClassificationLevelCreateState.problemId.trim() || item.problemId,
                    name: nextProblemName,
                    enabled: nextEnabled,
                  }
                : item
            )
          );
          break;
      }

      setProblemClassificationLevelCreateState(null);
      return;
    }

    switch (problemClassificationLevelCreateState.level) {
      case 'level-one':
        setProblemClassificationLevelOneItems((current) => [
          ...current,
          (() => {
            const nextItem = {
              id: createLocalId('problem-level-one'),
              problemId:
                problemClassificationLevelCreateState.problemId.trim() ||
                getNextSequentialProductManagementId(current.map((item) => item.problemId)),
              name: nextProblemName,
              enabled: nextEnabled,
              relatedNodeId: selectedProblemClassificationNodeId,
            };

            setSelectedProblemClassificationLevelOneItemId(nextItem.id);
            setSelectedProblemClassificationLevelTwoItemId(null);
            setSelectedProblemClassificationLevelThreeItemId(null);

            return nextItem;
          })(),
        ]);
        break;
      case 'level-two':
        if (!effectiveSelectedProblemClassificationLevelOneItemId) {
          return;
        }

        setProblemClassificationLevelTwoItems((current) => [
          ...current,
          (() => {
            const nextItem = {
              id: createLocalId('problem-level-two'),
              problemId:
                problemClassificationLevelCreateState.problemId.trim() ||
                getNextSequentialProductManagementId(current.map((item) => item.problemId)),
              name: nextProblemName,
              enabled: nextEnabled,
              relatedNodeId: selectedProblemClassificationNodeId,
              parentItemId: effectiveSelectedProblemClassificationLevelOneItemId,
            };

            setSelectedProblemClassificationLevelTwoItemId(nextItem.id);
            setSelectedProblemClassificationLevelThreeItemId(null);

            return nextItem;
          })(),
        ]);
        break;
      case 'level-three':
        if (!effectiveSelectedProblemClassificationLevelTwoItemId) {
          return;
        }

        setProblemClassificationLevelThreeItems((current) => [
          ...current,
          (() => {
            const nextItem = {
              id: createLocalId('problem-level-three'),
              problemId:
                problemClassificationLevelCreateState.problemId.trim() ||
                getNextSequentialProductManagementId(current.map((item) => item.problemId)),
              name: nextProblemName,
              enabled: nextEnabled,
              relatedNodeId: selectedProblemClassificationNodeId,
              parentItemId: effectiveSelectedProblemClassificationLevelTwoItemId,
            };

            setSelectedProblemClassificationLevelThreeItemId(nextItem.id);

            return nextItem;
          })(),
        ]);
        break;
    }

    setProblemClassificationLevelCreateState(null);
  };

  const ticketTemplateTree = createProblemClassificationTreeNodes({
    businessTypes,
    productCategories,
    productNames,
    expandedNodeMap: ticketTemplateExpandedNodeMap,
  });
  const ticketTemplateDisplayItems = ticketTemplateItems.filter(
    (item) => item.relatedNodeId === selectedTicketTemplateNodeId
  );

  const handleOpenCreateTicketTemplate = () => {
    if (!selectedTicketTemplateNodeId) {
      return;
    }

    setTicketTemplateEditorState({
      mode: 'create',
      name: '',
      content: '',
      status: '',
    });
  };

  const handleOpenEditTicketTemplate = (item: TicketTemplateItem) => {
    setTicketTemplateEditorState({
      mode: 'edit',
      targetItemId: item.id,
      name: item.name,
      content: item.content,
      status: item.enabled ? '启用' : '停用',
    });
  };

  const handleDeleteTicketTemplate = (item: TicketTemplateItem) => {
    setTicketTemplateItems((current) => current.filter((current) => current.id !== item.id));
    setTicketTemplateEditorState((current) =>
      current?.mode === 'edit' && current.targetItemId === item.id ? null : current
    );
  };

  const handleConfirmTicketTemplate = () => {
    if (!ticketTemplateEditorState) {
      return;
    }

    const nextName = ticketTemplateEditorState.name.trim();
    if (!nextName || !ticketTemplateEditorState.status) {
      return;
    }

    const nextEnabled = ticketTemplateEditorState.status === '启用';

    if (ticketTemplateEditorState.mode === 'edit') {
      if (!ticketTemplateEditorState.targetItemId) {
        return;
      }

      setTicketTemplateItems((current) =>
        current.map((item) =>
          item.id === ticketTemplateEditorState.targetItemId
            ? {
                ...item,
                name: nextName,
                content: ticketTemplateEditorState.content,
                enabled: nextEnabled,
              }
            : item
        )
      );
      setTicketTemplateEditorState(null);
      return;
    }

    setTicketTemplateItems((current) => [
      ...current,
      {
        id: createLocalId('ticket-template'),
        name: nextName,
        content: ticketTemplateEditorState.content,
        enabled: nextEnabled,
        relatedNodeId: selectedTicketTemplateNodeId,
      },
    ]);
    setTicketTemplateEditorState(null);
  };

  const handleConfirmCustomField = () => {
    if (!customFieldEditorState || !customFieldDraft || isCustomFieldConfirmDisabled) {
      return;
    }

    if (customFieldEditorState.mode === 'create') {
      setRowsByTab((currentRowsByTab) => ({
        ...currentRowsByTab,
        [activeTab]: [
          ...currentRowsByTab[activeTab],
          mapBusinessFieldCustomFieldDraftToRow(customFieldDraft, {
            id: createLocalId(`custom-field-${activeTab}`),
          }),
        ],
      }));
      setCustomFieldEditorState(null);
      return;
    }

    setRowsByTab((currentRowsByTab) => ({
      ...currentRowsByTab,
      [activeTab]: currentRowsByTab[activeTab].map((row) =>
        row.id === customFieldEditorState.rowId
          ? mapBusinessFieldCustomFieldDraftToRow(customFieldDraft, row)
          : row
      ),
    }));
    setCustomFieldEditorState(null);
  };

  const handleDeleteCustomField = (row: BusinessFieldDetailManagementRow) => {
    const usedFieldNames = new Set(
      Object.values(businessFieldVersionFieldTemplates).flatMap((byCategory) =>
        Object.values(byCategory).flatMap((fields) => fields.map((f) => f.fieldName).filter(Boolean))
      )
    );
    if (usedFieldNames.has(row.fieldName)) {
      setToastMessage('该字段已被生效中的版本使用，无法删除');
      return;
    }
    setCustomFieldDeleteState({ rowId: row.id, fieldName: row.fieldName });
  };

  const handleConfirmDeleteCustomField = () => {
    if (!customFieldDeleteState) return;
    setRowsByTab((currentRowsByTab) => ({
      ...currentRowsByTab,
      [activeTab]: currentRowsByTab[activeTab].filter((r) => r.id !== customFieldDeleteState.rowId),
    }));
    if (customFieldEditorState?.rowId === customFieldDeleteState.rowId) {
      setCustomFieldEditorState(null);
    }
    setCustomFieldDeleteState(null);
  };

  if (activeSpecialPage === 'problem-classification') {
    return (
      <>
        <FieldManagementProblemClassificationPanel
          readOnly={specialPageReadOnly}
          treeNodes={problemClassificationTree}
          selectedNodeId={selectedProblemClassificationNodeId}
          levelOneItems={problemClassificationLevelOneDisplayItems}
          selectedLevelOneItemId={effectiveSelectedProblemClassificationLevelOneItemId}
          onSelectLevelOneItem={setSelectedProblemClassificationLevelOneItemId}
          onEditLevelOneItem={(item) => handleOpenEditProblemClassificationLevel(item, 'level-one')}
          onDeleteLevelOneItem={(item) => handleDeleteProblemClassificationLevel(item, 'level-one')}
          levelTwoItems={problemClassificationLevelTwoDisplayItems}
          selectedLevelTwoItemId={effectiveSelectedProblemClassificationLevelTwoItemId}
          onSelectLevelTwoItem={setSelectedProblemClassificationLevelTwoItemId}
          onEditLevelTwoItem={(item) => handleOpenEditProblemClassificationLevel(item, 'level-two')}
          onDeleteLevelTwoItem={(item) => handleDeleteProblemClassificationLevel(item, 'level-two')}
          levelThreeItems={problemClassificationLevelThreeDisplayItems}
          selectedLevelThreeItemId={effectiveSelectedProblemClassificationLevelThreeItemId}
          onSelectLevelThreeItem={setSelectedProblemClassificationLevelThreeItemId}
          onEditLevelThreeItem={(item) => handleOpenEditProblemClassificationLevel(item, 'level-three')}
          onDeleteLevelThreeItem={(item) => handleDeleteProblemClassificationLevel(item, 'level-three')}
          onBack={() => setActiveSpecialPage(null)}
          onToggleTreeNode={(nodeId) =>
            setProblemClassificationExpandedNodeMap((current) => ({
              ...current,
              [nodeId]: !current[nodeId],
            }))
          }
          onSelectTreeNode={setSelectedProblemClassificationNodeId}
          onOpenCreateLevelOne={() => handleOpenCreateProblemClassificationLevel('level-one')}
          onOpenCreateLevelTwo={() => handleOpenCreateProblemClassificationLevel('level-two')}
          onOpenCreateLevelThree={() => handleOpenCreateProblemClassificationLevel('level-three')}
          disableCreateLevelTwo={!selectedProblemClassificationLevelOneItem}
          disableCreateLevelThree={!selectedProblemClassificationLevelTwoItem}
        />

        {problemClassificationLevelCreateState ? (
          <ProblemClassificationLevelCreateModal
            title={
              problemClassificationLevelCreateState.mode === 'edit'
                ? problemClassificationLevelEditTitleMap[problemClassificationLevelCreateState.level]
                : problemClassificationLevelCreateTitleMap[problemClassificationLevelCreateState.level]
            }
            draft={problemClassificationLevelCreateState}
            contextItems={problemClassificationCreateContextItems}
            onClose={() => setProblemClassificationLevelCreateState(null)}
            onDraftChange={(updater) =>
              setProblemClassificationLevelCreateState((current) => (current ? updater(current) : current))
            }
            onConfirm={handleConfirmCreateProblemClassificationLevel}
            confirmDisabled={
              !problemClassificationLevelCreateState.problemName.trim() ||
              !problemClassificationLevelCreateState.status
            }
          />
        ) : null}
      </>
    );
  }


  if (activeSpecialPage === 'ticket-template') {
    return (
      <>
        <FieldManagementTicketTemplatePanel
          readOnly={specialPageReadOnly}
          treeNodes={ticketTemplateTree}
          selectedNodeId={selectedTicketTemplateNodeId}
          items={ticketTemplateDisplayItems}
          onBack={() => setActiveSpecialPage(null)}
          onToggleTreeNode={(nodeId) =>
            setTicketTemplateExpandedNodeMap((current) => ({
              ...current,
              [nodeId]: !current[nodeId],
            }))
          }
          onSelectTreeNode={setSelectedTicketTemplateNodeId}
          onOpenCreate={handleOpenCreateTicketTemplate}
          onEditItem={handleOpenEditTicketTemplate}
          onDeleteItem={handleDeleteTicketTemplate}
        />

        {ticketTemplateEditorState ? (
          <TicketTemplateEditorModal
            title={ticketTemplateEditorState.mode === 'edit' ? '编辑建单模板' : '新增建单模板'}
            draft={ticketTemplateEditorState}
            onClose={() => setTicketTemplateEditorState(null)}
            onDraftChange={(updater) =>
              setTicketTemplateEditorState((current) => (current ? updater(current) : current))
            }
            onConfirm={handleConfirmTicketTemplate}
            confirmDisabled={
              !ticketTemplateEditorState.name.trim() ||
              !ticketTemplateEditorState.content.trim() ||
              !ticketTemplateEditorState.status
            }
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col rounded-[8px] border border-[#e7edf3] bg-white px-5 pb-5 pt-3">
          <div className="flex items-center gap-0">
            {[
              { key: 'customer' as const, label: '客户信息' },
              { key: 'summary' as const, label: '小结信息' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  setCustomFieldEditorState(null);
                  setViewDrawerState(null);
                  setActiveSpecialPage(null);
                }}
                className={cn(
                  'inline-flex h-8 min-w-[100px] items-center justify-center border text-[14px] font-medium transition-colors',
                  item.key === activeTab
                    ? 'border-[#87e0d4] bg-[#ecfbf8] text-[#18bca2]'
                    : 'border-[#e5e9ef] bg-white text-slate-500 hover:bg-slate-50'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCustomFieldDrawer}
              className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#87e0d4] bg-white px-4 text-[13px] font-medium text-[#18bca2] transition-colors hover:bg-[#f4fcfa]"
            >
              <Plus size={14} />
              新增自定义字段
            </button>
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-[6px] border border-[#eef2f6] bg-white">
            <div className="min-h-0 overflow-auto custom-scrollbar">
              <table className="min-w-full table-fixed text-left">
                <thead className="bg-[#fafcfe] text-[13px] text-slate-600">
                  <tr>
                    <th className="w-[64px] px-4 py-3 font-medium">序号</th>
                    <th className="w-[108px] px-4 py-3 font-medium">字段名称</th>
                    <th className="w-[120px] px-4 py-3 font-medium">数据库字段</th>
                    <th className="w-[76px] px-4 py-3 font-medium">字段格式</th>
                    <th className="w-[90px] px-4 py-3 font-medium">类型</th>
                    <th className="w-[90px] px-4 py-3 font-medium">创建人</th>
                    <th className="w-[90px] px-4 py-3 font-medium">修改人</th>
                    <th className="w-[142px] px-4 py-3 font-medium">修改时间</th>
                    <th className="w-[120px] px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-slate-600">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="border-b border-[#eef2f6] last:border-b-0">
                      <td className="px-4 py-4 align-top text-slate-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-700">
                        <div className="truncate" title={row.fieldName}>
                          {row.fieldName}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-700">
                        {(() => {
                          const joined = row.databaseFields?.join('、') ?? '';
                          return (
                            <div className="truncate" title={joined}>
                              {joined || '-'}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 align-top">{row.fieldType}</td>
                      <td className="px-4 py-4 align-top">
                        {row.createdBy === 'system' ? '系统字段' : '自定义字段'}
                      </td>
                      <td className="px-4 py-4 align-top">{row.createdBy}</td>
                      <td className="px-4 py-4 align-top">{row.updatedBy}</td>
                      <td className="px-4 py-4 align-top">{row.updatedAt}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-4 whitespace-nowrap text-[#21c4b0]">
                          {(activeTab === 'customer' ? row.canEdit : !['product-category', 'product-name', 'call-summary', 'session-summary'].includes(row.id)) ? (
                            <button
                              type="button"
                              onClick={() => handleOpenViewDrawer(row)}
                              className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                            >
                              <Eye size={13} />
                              查看
                            </button>
                          ) : null}
                          {row.canEdit ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEditCustomFieldDrawer(row)}
                              className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                            >
                              <Pencil size={13} />
                              编辑
                            </button>
                          ) : null}
                          {row.createdBy !== 'system' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomField(row)}
                              className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                            >
                              <Trash2 size={13} />
                              删除
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {customFieldDraft ? (
        <FieldManagementCustomFieldDrawer
          title={customFieldDrawerTitle}
          draft={customFieldDraft}
          readOnly={customFieldEditorState?.mode === 'view'}
          onClose={() => setCustomFieldEditorState(null)}
          onConfirm={handleConfirmCustomField}
          onDraftChange={(updater) =>
            setCustomFieldEditorState((current) =>
              current
                ? {
                    ...current,
                    draft: updater(current.draft),
                  }
                : current
            )
          }
          confirmDisabled={isCustomFieldConfirmDisabled}
        />
      ) : null}

      {viewDrawerState ? (
        <FieldManagementViewDrawer
          title={viewDrawerState.title}
          description={viewDrawerState.description}
          details={viewDrawerState.details}
          onClose={() => setViewDrawerState(null)}
        />
      ) : null}

      {customFieldDeleteState ? (
        <ProductManagementModalFrame
          title="删除确认"
          widthClassName="max-w-[320px]"
          onClose={() => setCustomFieldDeleteState(null)}
          onConfirm={handleConfirmDeleteCustomField}
          confirmDisabled={false}
        >
          <div className="text-[13px] leading-6 text-slate-600">
            <p>确定删除&ldquo;{customFieldDeleteState.fieldName}&rdquo;吗？</p>
          </div>
        </ProductManagementModalFrame>
      ) : null}

      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center">
          <div className="pointer-events-auto rounded-[6px] bg-slate-900/85 px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </>
  );
}

function FieldManagementCustomFieldDrawer({
  title,
  draft,
  readOnly,
  onClose,
  onConfirm,
  onDraftChange,
  confirmDisabled,
}: {
  title: string;
  draft: BusinessFieldCustomFieldDraft;
  readOnly?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDraftChange: (updater: (current: BusinessFieldCustomFieldDraft) => BusinessFieldCustomFieldDraft) => void;
  confirmDisabled: boolean;
}) {
  const updateDraft = (updater: (current: BusinessFieldCustomFieldDraft) => BusinessFieldCustomFieldDraft) => {
    if (readOnly) return;
    onDraftChange(updater);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[rgba(15,23,42,0.18)]">
      <button type="button" aria-label={`关闭${title}`} onClick={onClose} className="h-full flex-1" />

      <div className="relative flex h-full w-full max-w-[498px] shrink-0 flex-col bg-white shadow-[-12px_0_28px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between border-b border-[#edf1f5] px-4 py-5">
          <div className="text-[15px] font-semibold text-slate-700">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`关闭${title}`}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className={cn('min-h-0 flex-1 overflow-auto px-4 py-4 custom-scrollbar', readOnly && 'pointer-events-none')}>
          <div className={cn('space-y-4', readOnly && '[&_input]:cursor-not-allowed [&_input]:bg-slate-50 [&_input]:text-slate-500 [&_select]:cursor-not-allowed [&_select]:bg-slate-50 [&_select]:text-slate-500 [&_textarea]:cursor-not-allowed [&_textarea]:bg-slate-50 [&_textarea]:text-slate-500')}>
            <FieldManagementCustomFieldRow label="字段格式" required>
              <div className="relative">
                <select
                  value={draft.fieldType}
                  onChange={(event) =>
                    updateDraft((current) => {
                      const nextFieldType = event.target.value as BusinessFieldDetailManagementRow['fieldType'];
                      return {
                        ...current,
                        fieldType: nextFieldType,
                        databaseFields: padDatabaseFields(
                          current.databaseFields,
                          nextFieldType,
                          current.fieldName,
                          current.cascadeItems
                        ),
                        optionItems: current.optionItems.length
                          ? current.optionItems
                          : [createBusinessFieldOptionItem(1)],
                        cascadeItems: current.cascadeItems.length
                          ? current.cascadeItems
                          : createDefaultBusinessFieldCascadeItems(),
                      };
                    })
                  }
                  className="h-[28px] w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]"
                >
                  <option value="单行文本">单行文本</option>
                  <option value="多行文本">多行文本</option>
                  <option value="选项">选项</option>
                  <option value="级联">级联</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FieldManagementCustomFieldRow>

            {draft.fieldType === '级联' ? (
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1 text-[13px] text-slate-700">
                    <span className="mr-[2px] text-[#ff8b5e]">*</span>字段名称
                  </div>
                  <div className="flex-1 text-[13px] text-slate-700">
                    <span className="mr-[2px] text-[#ff8b5e]">*</span>数据库字段
                  </div>
                </div>
                {padCascadeLevelValues(draft.cascadeFieldNames, draft.cascadeItems).map((name, index) => {
                  const dbValue =
                    padDatabaseFields(
                      draft.databaseFields,
                      draft.fieldType,
                      draft.fieldName,
                      draft.cascadeItems
                    )[index] ?? '';
                  return (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={name}
                        placeholder={`请输入${getCascadeLevelLabel(index)}字段名称`}
                        onChange={(event) =>
                          updateDraft((current) => {
                            const next = padCascadeLevelValues(current.cascadeFieldNames, current.cascadeItems);
                            next[index] = event.target.value;
                            return { ...current, cascadeFieldNames: next };
                          })
                        }
                        className="h-[28px] flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
                      />
                      <div className="relative flex-1">
                        <select
                          value={dbValue}
                          onChange={(event) =>
                            updateDraft((current) => {
                              const next = padDatabaseFields(
                                current.databaseFields,
                                current.fieldType,
                                current.fieldName,
                                current.cascadeItems
                              );
                              next[index] = event.target.value;
                              return { ...current, databaseFields: next };
                            })
                          }
                          className="h-[28px] w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]"
                        >
                          <option value="">{getDatabaseFieldPlaceholder(draft.fieldType, index)}</option>
                          {businessFieldCustomDatabaseFieldOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <FieldManagementCustomFieldRow label="字段名称" required>
                <input
                  type="text"
                  value={draft.fieldName}
                  placeholder="请输入名称"
                  onChange={(event) =>
                    updateDraft((current) => {
                      const nextFieldName = event.target.value;
                      return {
                        ...current,
                        fieldName: nextFieldName,
                        databaseFields: padDatabaseFields(
                          current.databaseFields,
                          current.fieldType,
                          nextFieldName,
                          current.cascadeItems
                        ),
                      };
                    })
                  }
                  className="h-[28px] w-full rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
                />
              </FieldManagementCustomFieldRow>
            )}

            {draft.fieldType !== '级联' ? (
              <FieldManagementCustomFieldRow
                label="数据库字段"
                required
                alignStart={getRequiredDatabaseFieldCount(draft.fieldType, draft.fieldName, draft.cascadeItems) > 1}
              >
                <div className="space-y-2">
                  {padDatabaseFields(
                    draft.databaseFields,
                    draft.fieldType,
                    draft.fieldName,
                    draft.cascadeItems
                  ).map((value, index) => (
                    <div key={index} className="relative">
                      <select
                        value={value}
                        onChange={(event) =>
                          updateDraft((current) => {
                            const next = padDatabaseFields(
                              current.databaseFields,
                              current.fieldType,
                              current.fieldName,
                              current.cascadeItems
                            );
                            next[index] = event.target.value;
                            return { ...current, databaseFields: next };
                          })
                        }
                        className="h-[28px] w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]"
                      >
                        <option value="">{getDatabaseFieldPlaceholder(draft.fieldType, index)}</option>
                        {businessFieldCustomDatabaseFieldOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  ))}
                </div>
              </FieldManagementCustomFieldRow>
            ) : null}

            {isTextFieldType(draft.fieldType) ? (
              <FieldManagementCustomFieldRow label="正则表达式">
                <input
                  type="text"
                  value={draft.fieldPattern}
                  placeholder="请输入正则表达式"
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      fieldPattern: event.target.value,
                    }))
                  }
                  className="h-[28px] w-full rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
                />
              </FieldManagementCustomFieldRow>
            ) : (
              <FieldManagementCustomFieldRow label="选项配置" alignStart required>
                {draft.fieldType === '选项' ? (
                  <>
                    <div className="space-y-2">
                      {draft.optionItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.value}
                            placeholder={item.placeholder}
                            onChange={(event) =>
                              updateDraft((current) => ({
                                ...current,
                                optionItems: current.optionItems.map((optionItem) =>
                                  optionItem.id === item.id
                                    ? {
                                        ...optionItem,
                                        value: event.target.value,
                                      }
                                    : optionItem
                                ),
                              }))
                            }
                            className="h-[28px] min-w-0 flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
                          />
                          {draft.optionItems.length > 1 ? (
                            <button
                              type="button"
                              aria-label={`删除${item.placeholder}`}
                              onClick={() =>
                                updateDraft((current) => ({
                                  ...current,
                                  optionItems: current.optionItems.filter((optionItem) => optionItem.id !== item.id),
                                }))
                              }
                              className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[4px] border border-[#f3c5b5] text-[#f16f43] transition-colors hover:bg-[#fff4ef]"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateDraft((current) => ({
                          ...current,
                          optionItems: [
                            ...current.optionItems,
                            createBusinessFieldOptionItem(current.optionItems.length + 1),
                          ],
                        }))
                      }
                      className="mt-2 inline-flex h-[28px] items-center gap-1 rounded-[4px] border border-[#87e0d4] bg-white px-3 text-[13px] text-[#18bca2] transition-colors hover:bg-[#f4fcfa]"
                    >
                      <Plus size={14} />
                      添加
                    </button>
                  </>
                ) : (
                  <FieldManagementCascadeTreeEditor
                    nodes={draft.cascadeItems}
                    onValueChange={(nodeId, value) =>
                      updateDraft((current) => ({
                        ...current,
                        cascadeItems: updateCascadeNodes(current.cascadeItems, nodeId, (node) => ({
                          ...node,
                          value,
                        })),
                      }))
                    }
                    onToggleExpand={(nodeId) =>
                      updateDraft((current) => ({
                        ...current,
                        cascadeItems: updateCascadeNodes(current.cascadeItems, nodeId, (node) => ({
                          ...node,
                          expanded: !node.expanded,
                        })),
                      }))
                    }
                    onAddSibling={(nodeId) =>
                      updateDraft((current) => ({
                        ...current,
                        cascadeItems: addSiblingCascadeNode(current.cascadeItems, nodeId),
                      }))
                    }
                    onAddChild={(nodeId) =>
                      updateDraft((current) => ({
                        ...current,
                        cascadeItems: addChildCascadeNode(current.cascadeItems, nodeId),
                      }))
                    }
                    onDelete={(nodeId) =>
                      updateDraft((current) => ({
                        ...current,
                        cascadeItems: removeCascadeNode(current.cascadeItems, nodeId),
                      }))
                    }
                  />
                )}
              </FieldManagementCustomFieldRow>
            )}
          </div>
        </div>

        {readOnly ? (
          <div className="flex items-center justify-end gap-3 px-4 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[28px] min-w-[68px] items-center justify-center rounded-full border border-[#82ddd0] bg-[#effbf8] px-4 text-[13px] text-[#18bca2] transition-colors hover:bg-[#e2f8f3]"
            >
              关闭
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 px-4 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[28px] min-w-[68px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-4 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              disabled={confirmDisabled}
              onClick={onConfirm}
              className={cn(
                'inline-flex h-[28px] min-w-[68px] items-center justify-center rounded-full border px-4 text-[13px] transition-colors',
                confirmDisabled
                  ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                  : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
              )}
            >
              确定
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldManagementViewDrawer({
  title,
  description,
  details,
  onClose,
}: {
  title: string;
  description?: string;
  details?: ReadonlyArray<{ label: string; value: string }>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex bg-[rgba(15,23,42,0.18)]">
      <button type="button" aria-label={`关闭${title}`} onClick={onClose} className="h-full flex-1" />

      <div className="relative flex h-full w-full max-w-[478px] shrink-0 flex-col bg-white shadow-[-12px_0_28px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between border-b border-[#edf1f5] px-4 py-5">
          <div className="text-[15px] font-semibold text-slate-700">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`关闭${title}`}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4 custom-scrollbar">
          {description ? (
            <div className="text-[14px] leading-6 text-slate-700">{description}</div>
          ) : null}
          {details && details.length > 0 ? (
            <div className={cn('space-y-3 text-[13px] text-slate-700', description ? 'mt-4' : '')}>
              {details.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <div className="w-[88px] shrink-0 text-slate-500">{item.label}</div>
                  <div className="min-w-0 flex-1 whitespace-pre-line break-all leading-6">
                    {item.value || '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}

function ProblemClassificationLevelCreateModal({
  title,
  draft,
  contextItems,
  onClose,
  onDraftChange,
  onConfirm,
  confirmDisabled,
}: {
  title: string;
  draft: ProblemClassificationLevelCreateState;
  contextItems: ReadonlyArray<{
    label: string;
    value: string;
  }>;
  onClose: () => void;
  onDraftChange: (updater: (current: ProblemClassificationLevelCreateState) => ProblemClassificationLevelCreateState) => void;
  onConfirm: () => void;
  confirmDisabled: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.36)] p-6">
      <button type="button" aria-label={`关闭${title}`} onClick={onClose} className="absolute inset-0" />

      <div className="relative z-10 w-full max-w-[336px] rounded-[8px] border border-[#e6ebf2] bg-white px-4 pb-4 pt-3 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold text-slate-700">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`关闭${title}`}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {contextItems.length > 0 ? (
          <div className="mt-4 space-y-[6px]">
            {contextItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <ProblemClassificationModalFieldLabel label={item.label} />
                <div
                  title={item.value}
                  className="w-0 min-w-0 flex-1 truncate whitespace-nowrap text-left text-[13px] leading-[28px] text-slate-700"
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5 space-y-[6px]">
          <div className="flex items-center gap-2">
            <ProblemClassificationModalFieldLabel label="问题id" />
            <input
              type="text"
              value={draft.problemId}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  problemId: event.target.value,
                }))
              }
              className="h-[28px] w-0 min-w-0 flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ProblemClassificationModalFieldLabel label="问题名称" />
            <input
              type="text"
              value={draft.problemName}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  problemName: event.target.value,
                }))
              }
              className="h-[28px] w-0 min-w-0 flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ProblemClassificationModalFieldLabel label="状态" required />
            <div className="w-0 min-w-0 flex-1">
              <ProductManagementSelect
                value={draft.status}
                onChange={(value) =>
                  onDraftChange((current) => ({
                    ...current,
                    status: value as ProblemClassificationLevelCreateState['status'],
                  }))
                }
                options={['', '启用', '停用']}
              />
            </div>
          </div>
        </div>

        <div className="mt-[10px] flex items-center justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[28px] min-w-[60px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-4 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={cn(
              'inline-flex h-[28px] min-w-[60px] items-center justify-center rounded-full border px-4 text-[13px] transition-colors',
              confirmDisabled
                ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
            )}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldManagementProblemClassificationPanel({
  readOnly,
  treeNodes,
  selectedNodeId,
  levelOneItems,
  selectedLevelOneItemId,
  onSelectLevelOneItem,
  onEditLevelOneItem,
  onDeleteLevelOneItem,
  levelTwoItems,
  selectedLevelTwoItemId,
  onSelectLevelTwoItem,
  onEditLevelTwoItem,
  onDeleteLevelTwoItem,
  levelThreeItems,
  selectedLevelThreeItemId,
  onSelectLevelThreeItem,
  onEditLevelThreeItem,
  onDeleteLevelThreeItem,
  onBack,
  onToggleTreeNode,
  onSelectTreeNode,
  onOpenCreateLevelOne,
  onOpenCreateLevelTwo,
  onOpenCreateLevelThree,
  disableCreateLevelTwo,
  disableCreateLevelThree,
}: {
  readOnly?: boolean;
  treeNodes: readonly ProblemClassificationTreeNode[];
  selectedNodeId: string;
  levelOneItems: readonly ProblemClassificationLevelItem[];
  selectedLevelOneItemId: string | null;
  onSelectLevelOneItem: (itemId: string) => void;
  onEditLevelOneItem: (item: ProblemClassificationLevelItem) => void;
  onDeleteLevelOneItem: (item: ProblemClassificationLevelItem) => void;
  levelTwoItems: readonly ProblemClassificationLevelItem[];
  selectedLevelTwoItemId: string | null;
  onSelectLevelTwoItem: (itemId: string) => void;
  onEditLevelTwoItem: (item: ProblemClassificationLevelItem) => void;
  onDeleteLevelTwoItem: (item: ProblemClassificationLevelItem) => void;
  levelThreeItems: readonly ProblemClassificationLevelItem[];
  selectedLevelThreeItemId: string | null;
  onSelectLevelThreeItem: (itemId: string) => void;
  onEditLevelThreeItem: (item: ProblemClassificationLevelItem) => void;
  onDeleteLevelThreeItem: (item: ProblemClassificationLevelItem) => void;
  onBack: () => void;
  onToggleTreeNode: (nodeId: string) => void;
  onSelectTreeNode: (nodeId: string) => void;
  onOpenCreateLevelOne: () => void;
  onOpenCreateLevelTwo: () => void;
  onOpenCreateLevelThree: () => void;
  disableCreateLevelTwo: boolean;
  disableCreateLevelThree: boolean;
}) {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setImportFile(null);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-[3px] text-[18px] font-semibold text-slate-800 transition-colors hover:text-slate-600"
        >
          <ChevronLeft size={17} />
          <span>问题分级管理</span>
        </button>
        <div className="flex items-center gap-2">
          {readOnly ? null : (
            <>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
              >
                <Upload size={14} />
                导入
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
              >
                <Download size={14} />
                导出
              </button>
            </>
          )}
        </div>
      </div>

      {importModalOpen ? (
        <ProductManagementModalFrame
          title="导入"
          widthClassName="max-w-[420px]"
          onClose={handleCloseImportModal}
          onConfirm={handleCloseImportModal}
          confirmDisabled={!importFile}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[6px] border border-[#e6ebf2] bg-[#fafcfe] px-3 py-2.5">
              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                <List size={14} className="text-[#1fc0ad]" />
                <span>问题标签模板</span>
              </div>
              <a
                href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQACAgIAAAAIQAAAAAAAAAAAAAAAAALAAAAX3JlbHMvLnJlbHM="
                download="问题标签模板.xlsx"
                className="inline-flex items-center gap-1 text-[13px] text-[#1fc0ad] transition-colors hover:text-[#18a391]"
              >
                <Download size={13} />
                下载
              </a>
            </div>

            <div>
              <input
                ref={importFileInputRef}
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImportFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => importFileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-[#c8d2dd] bg-white px-3 py-6 text-[13px] text-slate-500 transition-colors hover:border-[#8fe0d2] hover:bg-[#f4fcfa]"
              >
                <Upload size={18} className="text-[#1fc0ad]" />
                <span>{importFile ? importFile.name : '点击选择 Excel 文件上传'}</span>
                <span className="text-[12px] text-slate-400">支持 .xls / .xlsx 格式</span>
              </button>
            </div>
          </div>
        </ProductManagementModalFrame>
      ) : null}

      <div
        className="grid min-h-0 flex-1 gap-[10px] overflow-x-auto custom-scrollbar"
        style={{ gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))' }}
      >
        <section className="flex min-h-[610px] min-w-[240px] flex-col overflow-hidden rounded-[6px] border border-[#e7edf3] bg-white">
          <div className="px-[13px] py-[12px] text-[14px] font-semibold text-slate-700">业务类型和产品</div>

          <div className="min-h-0 flex-1 overflow-auto px-[8px] pb-[14px] pt-[2px] custom-scrollbar">
            <FieldManagementProblemClassificationTree
              nodes={treeNodes}
              selectedNodeId={selectedNodeId}
              onToggleTreeNode={onToggleTreeNode}
              onSelectTreeNode={onSelectTreeNode}
            />
          </div>
        </section>

        <FieldManagementProblemClassificationCard
          title="问题一级"
          tone="emerald"
          items={levelOneItems}
          selectedItemId={selectedLevelOneItemId}
          onSelectItem={onSelectLevelOneItem}
          onEditItem={onEditLevelOneItem}
          onDeleteItem={onDeleteLevelOneItem}
          onAdd={onOpenCreateLevelOne}
          readOnly={readOnly}
        />
        <FieldManagementProblemClassificationCard
          title="问题二级"
          tone="blue"
          items={levelTwoItems}
          selectedItemId={selectedLevelTwoItemId}
          onSelectItem={onSelectLevelTwoItem}
          onEditItem={onEditLevelTwoItem}
          onDeleteItem={onDeleteLevelTwoItem}
          onAdd={onOpenCreateLevelTwo}
          addDisabled={disableCreateLevelTwo}
          readOnly={readOnly}
        />
        <FieldManagementProblemClassificationCard
          title="问题三级"
          tone="amber"
          items={levelThreeItems}
          selectedItemId={selectedLevelThreeItemId}
          onSelectItem={onSelectLevelThreeItem}
          onEditItem={onEditLevelThreeItem}
          onDeleteItem={onDeleteLevelThreeItem}
          onAdd={onOpenCreateLevelThree}
          addDisabled={disableCreateLevelThree}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

function FieldManagementProblemClassificationTree({
  nodes,
  selectedNodeId,
  depth = 0,
  onToggleTreeNode,
  onSelectTreeNode,
}: {
  nodes: readonly ProblemClassificationTreeNode[];
  selectedNodeId: string;
  depth?: number;
  onToggleTreeNode: (nodeId: string) => void;
  onSelectTreeNode: (nodeId: string) => void;
}) {
  return (
    <div className="space-y-[1px]">
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isSelectable = depth === 2;
        const isSelected = isSelectable && node.id === selectedNodeId;

        return (
          <div key={node.id}>
            <div
              className={cn(
                'flex items-center gap-[6px] rounded-[4px] py-[5px] pr-[6px]',
                isSelected ? 'bg-[#dff4ef]' : 'hover:bg-[#f4f7fa]'
              )}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <button
                type="button"
                onClick={() => {
                  if (hasChildren) {
                    onToggleTreeNode(node.id);
                  }
                }}
                className={cn(
                  'inline-flex h-4 w-4 shrink-0 items-center justify-center text-slate-300 transition-colors',
                  hasChildren ? 'hover:text-slate-500' : 'cursor-default'
                )}
              >
                {hasChildren ? (node.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
              </button>

              {node.enabled ? (
                <CheckCircle2 size={13} strokeWidth={2.1} className="shrink-0 text-[#28c7b2]" />
              ) : (
                <img src={minusIcon} alt="" className="h-[13px] w-[13px] shrink-0 object-contain" />
              )}

              <button
                type="button"
                onClick={() => {
                  if (isSelectable) {
                    onSelectTreeNode(node.id);
                    return;
                  }

                  if (hasChildren) {
                    onToggleTreeNode(node.id);
                  }
                }}
                className={cn(
                  'min-w-0 flex-1 text-left',
                  isSelectable ? 'cursor-pointer' : hasChildren ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <span className="block truncate text-[13px] text-slate-700">{node.name}</span>
              </button>
            </div>

            {hasChildren && node.expanded ? (
              <div className="mt-[1px]">
                <FieldManagementProblemClassificationTree
                  nodes={node.children}
                  selectedNodeId={selectedNodeId}
                  depth={depth + 1}
                  onToggleTreeNode={onToggleTreeNode}
                  onSelectTreeNode={onSelectTreeNode}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FieldManagementProblemClassificationCard({
  title,
  tone,
  items,
  selectedItemId,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onAdd,
  addDisabled = false,
  readOnly,
}: {
  title: string;
  tone: keyof typeof panelToneClassNameMap;
  items: readonly ProblemClassificationLevelItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onEditItem: (item: ProblemClassificationLevelItem) => void;
  onDeleteItem: (item: ProblemClassificationLevelItem) => void;
  onAdd?: () => void;
  addDisabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <section
      className={cn(
        'flex min-h-[610px] min-w-[240px] flex-col overflow-hidden rounded-[6px] border',
        panelToneClassNameMap[tone]
      )}
    >
      <div className="flex items-center px-[13px] py-[12px] text-[14px] font-semibold text-slate-700">{title}</div>

      <div className="flex min-h-0 flex-1 flex-col px-[12px] pb-[14px] pt-[6px]">
        <div className="space-y-[1px]">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-[7px] rounded-[4px] px-[6px] py-[5px]',
                item.id === selectedItemId ? 'bg-[#dff4ef]' : 'hover:bg-white/70'
              )}
            >
              {item.enabled ? (
                <CheckCircle2 size={13} strokeWidth={2.1} className="shrink-0 text-[#28c7b2]" />
              ) : (
                <img src={minusIcon} alt="" className="h-[13px] w-[13px] shrink-0 object-contain" />
              )}

              <button
                type="button"
                onClick={() => onSelectItem(item.id)}
                className="min-w-0 flex-1 truncate text-left text-[13px] text-slate-700"
              >
                {item.name}
              </button>

              <div className="ml-auto flex items-center gap-[9px] text-slate-400">
                {readOnly ? null : (
                  <>
                    <button
                      type="button"
                      onClick={() => onEditItem(item)}
                      aria-label={`编辑${item.name}`}
                      className="transition-colors hover:text-slate-600"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item)}
                      aria-label={`删除${item.name}`}
                      className="transition-colors hover:text-slate-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {readOnly ? null : (
          <button
            type="button"
            disabled={addDisabled}
            onClick={onAdd}
            className={cn(
              'mt-auto inline-flex h-[28px] w-[142px] self-center items-center justify-center gap-1 rounded-[4px] border text-[13px] font-medium transition-colors',
              addDisabled
                ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                : 'border-[#8fe0d2] bg-white text-[#21c4b0] hover:bg-[#f4fcfa]'
            )}
          >
            <Plus size={14} />
            新增
          </button>
        )}
      </div>
    </section>
  );
}

function ProblemClassificationModalFieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="w-[58px] shrink-0 whitespace-nowrap text-right text-[13px] text-slate-700">
      {required ? <span className="mr-[2px] text-[#ff8b5e]">*</span> : null}
      {label}
    </label>
  );
}

function FieldManagementCustomFieldRow({
  label,
  children,
  alignStart = false,
  required = false,
}: {
  label: string;
  children: ReactNode;
  alignStart?: boolean;
  required?: boolean;
}) {
  return (
    <div className={cn('flex gap-3', alignStart ? 'items-start' : 'items-center')}>
      <div className={cn('w-[72px] shrink-0 text-[13px] text-slate-700', alignStart ? 'pt-[6px]' : '')}>
        {required ? <span className="mr-[2px] text-[#ff8b5e]">*</span> : null}
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function FieldManagementCascadeTreeEditor({
  nodes,
  depth = 0,
  onValueChange,
  onToggleExpand,
  onAddSibling,
  onAddChild,
  onDelete,
}: {
  nodes: readonly BusinessFieldCascadeOptionNode[];
  depth?: number;
  onValueChange: (nodeId: string, value: string) => void;
  onToggleExpand: (nodeId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => {
        const shouldShowTriangle = depth < 2 || node.children.length > 0;
        const isTriangleInteractive = node.children.length > 0;
        const canAddChild = depth < 2;

        return (
        <div key={node.id}>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 14}px` }}>
            <button
              type="button"
              onClick={() => {
                if (isTriangleInteractive) {
                  onToggleExpand(node.id);
                }
              }}
              className={cn(
                'inline-flex h-4 w-4 items-center justify-center text-slate-300 transition-colors',
                shouldShowTriangle ? 'visible' : 'invisible',
                isTriangleInteractive ? 'hover:text-slate-500' : 'cursor-default'
              )}
            >
              {node.expanded && isTriangleInteractive ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            <input
              type="text"
              value={node.value}
              placeholder={node.placeholder}
              onChange={(event) => onValueChange(node.id, event.target.value)}
              className="h-[28px] flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[12px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
            />

            <div className="grid w-[77px] grid-cols-[16px_16px_16px] items-center justify-items-center gap-x-[10px] pl-1">
              <button
                type="button"
                onClick={() => onAddSibling(node.id)}
                aria-label="增加同级"
                className="inline-flex h-4 w-4 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
              >
                <img src={addSiblingIcon} alt="" className="h-4 w-4" />
              </button>
              {canAddChild ? (
                <button
                  type="button"
                  onClick={() => onAddChild(node.id)}
                  aria-label="增加子级"
                  className="inline-flex h-4 w-4 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
                >
                  <img src={addChildIcon} alt="" className="h-4 w-4" />
                </button>
              ) : (
                <span className="h-4 w-4" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => onDelete(node.id)}
                aria-label="删除"
                className="inline-flex h-4 w-4 items-center justify-center text-slate-300 transition-colors hover:text-slate-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {node.children.length > 0 && node.expanded ? (
            <div className="mt-2">
              <FieldManagementCascadeTreeEditor
                nodes={node.children}
                depth={depth + 1}
                onValueChange={onValueChange}
                onToggleExpand={onToggleExpand}
                onAddSibling={onAddSibling}
                onAddChild={onAddChild}
                onDelete={onDelete}
              />
            </div>
          ) : null}
        </div>
        );
      })}
    </div>
  );
}

function SwitchVersionDialog({
  row,
  targetVersion,
  reason,
  onTargetVersionChange,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  row: BusinessFieldManagementRow;
  targetVersion: string;
  reason: string;
  onTargetVersionChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const availableVersions = businessFieldVersionOptions.filter((item) => item !== row.onlineVersion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.36)] p-6">
      <button type="button" aria-label="关闭切换线上版本弹窗" onClick={onClose} className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-[420px] rounded-[6px] bg-white px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="text-[16px] font-semibold text-slate-700">切换线上版本</div>

        <div className="mt-8 space-y-5 text-[14px] text-slate-700">
          <div className="flex items-center gap-3">
            <span className="w-[76px] shrink-0 text-right">业务类型：</span>
            <span>{row.businessType}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-[76px] shrink-0 text-right">当前版本：</span>
            <span>{row.onlineVersion}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="w-[76px] shrink-0 text-right" htmlFor="switch-version-select">
              切换后版本：
            </label>
            <div className="relative w-[114px]">
              <select
                id="switch-version-select"
                value={targetVersion}
                onChange={(event) => onTargetVersionChange(event.target.value)}
                className="h-8 w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]"
              >
                <option value="">请选择</option>
                {availableVersions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <label className="mt-2 w-[76px] shrink-0 text-right" htmlFor="switch-version-reason">
              切换理由：
            </label>
            <textarea
              id="switch-version-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="h-[84px] w-[226px] resize-none rounded-[2px] border border-slate-400 px-3 py-2 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 min-w-[68px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-4 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'inline-flex h-7 min-w-[58px] items-center justify-center rounded-full border px-4 text-[13px] transition-colors',
              targetVersion
                ? 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
                : 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
            )}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionManagementListPanel({
  row,
  items,
  onBack,
  onOpenCreateVersionField,
  onOpenViewVersionField,
  onOpenEditVersionField,
  onCopyVersionField,
  onRequestDeleteVersionField,
}: {
  row: BusinessFieldManagementRow;
  items: BusinessFieldVersionListItem[];
  onBack: () => void;
  onOpenCreateVersionField: () => void;
  onOpenViewVersionField: (versionId: string) => void;
  onOpenEditVersionField: (versionId: string) => void;
  onCopyVersionField: (versionId: string) => void;
  onRequestDeleteVersionField: (versionId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-4 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[18px] font-semibold text-slate-800 transition-colors hover:text-slate-600"
        >
          <ChevronLeft size={18} />
          <span>{row.businessType}字段版本管理</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-[8px] border border-[#e7edf3] bg-white px-5 pb-5 pt-3">
        <div>
          <button
            type="button"
            onClick={onOpenCreateVersionField}
            className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
          >
            <Plus size={14} />
            新增字段版本
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-[6px] bg-white">
          <div className="min-h-0 overflow-auto custom-scrollbar">
            <table className="min-w-full table-fixed text-center">
              <thead className="bg-[#fafcfe] text-[13px] text-slate-600">
                <tr>
                  <th className="w-[180px] px-4 py-3 font-medium">版本名称</th>
                  <th className="w-[220px] px-4 py-3 font-medium">版本描述</th>
                  <th className="w-[120px] px-4 py-3 font-medium">修改人</th>
                  <th className="w-[180px] px-4 py-3 font-medium">修改时间</th>
                  <th className="w-[220px] px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#eef2f6] last:border-b-0">
                    <td className="px-4 py-[11px] text-center text-slate-700">{item.versionType}</td>
                    <td className="px-4 py-[11px] text-center text-slate-700">{item.versionDescription}</td>
                    <td className="px-4 py-[11px] text-center">{item.updatedBy}</td>
                    <td className="px-4 py-[11px] text-center">{item.updatedAt}</td>
                    <td className="px-4 py-[11px] text-center">
                      <div className="flex items-center justify-center gap-4 whitespace-nowrap text-[#21c4b0]">
                        <button
                          type="button"
                          onClick={() => onOpenViewVersionField(item.id)}
                          className="transition-colors hover:text-[#18bca2]"
                        >
                          查看
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopyVersionField(item.id)}
                          className="transition-colors hover:text-[#18bca2]"
                        >
                          复制
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditVersionField(item.id)}
                          className="transition-colors hover:text-[#18bca2]"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteVersionField(item.id)}
                          className="transition-colors hover:text-[#18bca2]"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const versionEditorStepLabels = ['版本信息', '字段配置'] as const;

const versionEditorScopeOptions = [
  { key: 'online' as BusinessFieldVersionScope, label: '在线' },
  { key: 'hotline' as BusinessFieldVersionScope, label: '热线' },
] as const;

const versionEditorCategoryOptions = [
  { key: 'customer' as BusinessFieldVersionCategory, label: '客户字段' },
  { key: 'summary' as BusinessFieldVersionCategory, label: '小结字段' },
] as const;

const versionEditorScopeCategoryKey = (
  scope: BusinessFieldVersionScope,
  category: BusinessFieldVersionCategory
) => `${scope}-${category}` as const;

const createVersionEditorFieldsByScopeCategory = () => {
  const next: Record<string, BusinessFieldVersionFieldItem[]> = {};
  for (const scope of versionEditorScopeOptions) {
    for (const category of versionEditorCategoryOptions) {
      next[versionEditorScopeCategoryKey(scope.key, category.key)] = getVersionFieldTemplate(
        scope.key,
        category.key
      );
    }
  }
  return next;
};

function VersionFieldEditorPanel({
  row,
  title,
  initialVersionName,
  initialVersionDescription,
  readOnly = false,
  onBack,
  onConfirm,
}: {
  row: BusinessFieldManagementRow;
  title: string;
  initialVersionName: string;
  initialVersionDescription: string;
  readOnly?: boolean;
  onBack: () => void;
  onConfirm: (payload: { versionName: string; versionDescription: string }) => void;
}) {
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [versionName, setVersionName] = useState(initialVersionName);
  const [versionDescription, setVersionDescription] = useState(initialVersionDescription);
  const [activeScope, setActiveScope] = useState<BusinessFieldVersionScope>('online');
  const [activeCategory, setActiveCategory] = useState<BusinessFieldVersionCategory>('customer');
  const [isMoreSettingsOpen, setIsMoreSettingsOpen] = useState(false);
  const [moreSettingsDrawerOpen, setMoreSettingsDrawerOpen] = useState(false);
  const [moreSettingsEditingItem, setMoreSettingsEditingItem] = useState<{
    item: VersionFieldMoreSettingsItem;
    mode: 'view' | 'edit';
  } | null>(null);
  const [moreSettingsItems, setMoreSettingsItems] = useState<VersionFieldMoreSettingsItem[]>(() =>
    createDefaultVersionMoreSettingsItems()
  );
  const [fieldsByScopeCategory, setFieldsByScopeCategory] = useState<
    Record<string, BusinessFieldVersionFieldItem[]>
  >(() => createVersionEditorFieldsByScopeCategory());
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
  const isConfirmDisabled = !versionName.trim();
  const isStepOneNextDisabled = !versionName.trim();

  const activeFieldsKey = versionEditorScopeCategoryKey(activeScope, activeCategory);
  const fields = fieldsByScopeCategory[activeFieldsKey] ?? [];
  const setFieldsForActive = (
    updater: (current: BusinessFieldVersionFieldItem[]) => BusinessFieldVersionFieldItem[]
  ) => {
    setFieldsByScopeCategory((current) => ({
      ...current,
      [activeFieldsKey]: updater(current[activeFieldsKey] ?? []),
    }));
  };


  const handleSwitchScope = (nextScope: BusinessFieldVersionScope) => {
    setActiveScope(nextScope);
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const handleSwitchCategory = (nextCategory: BusinessFieldVersionCategory) => {
    setActiveCategory(nextCategory);
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const handleChangeFieldName = (fieldId: string, fieldName: string) => {
    setFieldsForActive((currentFields) =>
      currentFields.map((field) => (field.id === fieldId ? { ...field, fieldName } : field))
    );
  };

  const handleChangeRequired = (fieldId: string, required: boolean) => {
    setFieldsForActive((currentFields) =>
      currentFields.map((field) => (field.id === fieldId ? { ...field, required } : field))
    );
  };

  const handleDeleteField = (fieldId: string) => {
    setFieldsForActive((currentFields) => currentFields.filter((field) => field.id !== fieldId));
  };

  const handleDropField = (targetFieldId: string) => {
    setFieldsForActive((currentFields) => {
      if (!draggingFieldId || draggingFieldId === targetFieldId) {
        return currentFields;
      }

      const fromIndex = currentFields.findIndex((field) => field.id === draggingFieldId);
      const toIndex = currentFields.findIndex((field) => field.id === targetFieldId);

      if (fromIndex < 0 || toIndex < 0) {
        return currentFields;
      }

      const nextFields = [...currentFields];
      const [moved] = nextFields.splice(fromIndex, 1);
      nextFields.splice(toIndex, 0, moved);
      return nextFields;
    });
  };

  const handleAddField = () => {
    setFieldsForActive((currentFields) => [
      ...currentFields,
      {
        id: `custom-${Date.now()}`,
        fieldName: '',
        required: true,
      },
    ]);
  };

  const handleDeleteMoreSettingsItem = (itemId: string) => {
    setMoreSettingsItems((current) => current.filter((item) => item.id !== itemId));
  };

  const handleCreateMoreSettingsItem = (item: VersionFieldMoreSettingsItem) => {
    setMoreSettingsItems((current) => [...current, item]);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-2 pb-4 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-[18px] font-semibold text-slate-800 transition-colors hover:text-slate-600"
          >
            <ChevronLeft size={18} />
            <span>{title}</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-[8px] border border-[#e7edf3] bg-white px-5 pb-5 pt-4">
          <VersionFieldEditorStepper currentStep={currentStep} />

          {currentStep === 0 ? (
            <div className="mt-6 grid max-w-[760px] grid-cols-[84px_minmax(0,1fr)] items-start gap-x-4 gap-y-3 text-[14px] text-slate-700">
              <div className="pt-2 font-medium">业务类型名称</div>
              <div className="pt-2">{row.businessType}</div>

              <label className="pt-2 font-medium" htmlFor="version-name">
                <span className="mr-[2px] text-[#ff8b5e]">*</span>版本名称
              </label>
              <input
                id="version-name"
                type="text"
                value={versionName}
                disabled={readOnly}
                onChange={(event) => setVersionName(event.target.value)}
                className={cn(
                  'h-8 w-[164px] rounded-[4px] border border-[#dfe6ee] px-3 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]',
                  readOnly && 'cursor-not-allowed bg-slate-50 text-slate-500'
                )}
              />

              <label className="pt-2 font-medium" htmlFor="version-description">
                版本描述
              </label>
              <textarea
                id="version-description"
                value={versionDescription}
                disabled={readOnly}
                onChange={(event) => setVersionDescription(event.target.value)}
                className={cn(
                  'h-[84px] w-[292px] resize-none rounded-[4px] border border-[#dfe6ee] px-3 py-2 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]',
                  readOnly && 'cursor-not-allowed bg-slate-50 text-slate-500'
                )}
              />
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-0">
                {versionEditorScopeOptions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSwitchScope(item.key)}
                    className={cn(
                      'inline-flex h-8 min-w-[100px] items-center justify-center border text-[14px] font-medium transition-colors',
                      item.key === activeScope
                        ? 'border-[#87e0d4] bg-[#ecfbf8] text-[#18bca2]'
                        : 'border-[#e5e9ef] bg-white text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-0">
                {versionEditorCategoryOptions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSwitchCategory(item.key)}
                    className={cn(
                      'inline-flex h-8 min-w-[100px] items-center justify-center border text-[14px] font-medium transition-colors',
                      item.key === activeCategory
                        ? 'border-[#87e0d4] bg-[#ecfbf8] text-[#18bca2]'
                        : 'border-[#e5e9ef] bg-white text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-[6px] border border-[#eef2f6]">
                <div className="grid grid-cols-[1fr_268px_156px] bg-[#fafcfe] px-4 py-3 text-[13px] font-medium text-slate-600">
                  <div>字段名称</div>
                  <div>是否必填</div>
                  <div>{readOnly ? '' : '操作'}</div>
                </div>

                <div className="space-y-3 px-4 py-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      onDragOver={(event) => {
                        if (!draggingFieldId) {
                          return;
                        }
                        event.preventDefault();
                        if (dragOverFieldId !== field.id) {
                          setDragOverFieldId(field.id);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleDropField(field.id);
                        setDraggingFieldId(null);
                        setDragOverFieldId(null);
                      }}
                      className={cn(
                        'grid grid-cols-[1fr_268px_156px] items-center gap-4 rounded-[4px] transition-colors',
                        dragOverFieldId === field.id &&
                          draggingFieldId &&
                          draggingFieldId !== field.id &&
                          'bg-[#f4fcfa] shadow-[inset_0_0_0_1px_rgba(132,221,208,0.9)]',
                        draggingFieldId === field.id && 'opacity-60'
                      )}
                    >
                      <div className="relative max-w-[264px]">
                        <select
                          value={field.fieldName}
                          disabled={readOnly}
                          onChange={(event) => handleChangeFieldName(field.id, event.target.value)}
                          className={cn(
                            'h-8 w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]',
                            readOnly && 'cursor-not-allowed bg-slate-50 text-slate-500'
                          )}
                        >
                          <option value="">请选择字段</option>
                          {businessFieldVersionFieldOptions.map((item) => (
                            <option key={`${field.id}-${item}`} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>

                      <div className="flex items-center gap-8 text-[13px] text-slate-600">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={`required-${field.id}`}
                            checked={field.required}
                            disabled={readOnly}
                            onChange={() => handleChangeRequired(field.id, true)}
                            className={cn('h-4 w-4 accent-[#20c6b1]', readOnly && 'cursor-not-allowed')}
                          />
                          <span>是</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={`required-${field.id}`}
                            checked={!field.required}
                            disabled={readOnly}
                            onChange={() => handleChangeRequired(field.id, false)}
                            className={cn('h-4 w-4 accent-[#20c6b1]', readOnly && 'cursor-not-allowed')}
                          />
                          <span>否</span>
                        </label>
                      </div>

                      {readOnly ? (
                        <div />
                      ) : (
                        <div className="flex items-center gap-5 whitespace-nowrap text-[13px]">
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="inline-flex items-center gap-1 text-[#21c4b0] transition-colors hover:text-[#18bca2]"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                          <button
                            type="button"
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = 'move';
                              event.dataTransfer.setData('text/plain', field.id);
                              setDraggingFieldId(field.id);
                              setDragOverFieldId(field.id);
                            }}
                            onDragEnd={() => {
                              setDraggingFieldId(null);
                              setDragOverFieldId(null);
                            }}
                            aria-label={`拖动排序${field.fieldName || '字段'}`}
                            className="inline-flex cursor-grab items-center gap-1 text-[#21c4b0] transition-colors hover:text-[#18bca2] active:cursor-grabbing"
                          >
                            <GripVertical size={14} />
                            排序
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {readOnly ? null : (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
                  >
                    <Plus size={14} />
                    添加
                  </button>
                </div>
              )}

              <div className="mt-6 rounded-[6px] border border-[#eef2f6]">
                <button
                  type="button"
                  onClick={() => setIsMoreSettingsOpen((v) => !v)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ChevronRight
                    size={14}
                    className={cn('transition-transform', isMoreSettingsOpen && 'rotate-90')}
                  />
                  更多设置
                </button>

                {isMoreSettingsOpen ? (
                  <div className="border-t border-[#eef2f6] px-4 py-4">
                    {moreSettingsItems.length > 0 ? (
                      <div className="overflow-hidden rounded-[6px]">
                        <table className="min-w-full table-fixed text-left">
                          <thead className="bg-[#fafcfe] text-[13px] text-slate-600">
                            <tr>
                              <th className="w-[132px] px-4 py-[8px] font-medium">产品分类</th>
                              <th className="px-4 py-[8px] font-medium">操作</th>
                            </tr>
                          </thead>
                          <tbody className="text-[13px] text-slate-600">
                            {moreSettingsItems.map((item) => (
                              <tr key={item.id} className="border-b border-[#eef2f6] last:border-b-0">
                                <td className="px-4 py-[14px] text-slate-700">{item.productCategory}</td>
                                <td className="px-4 py-[14px]">
                                  <div className="flex items-center gap-4 whitespace-nowrap text-[#21c4b0]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMoreSettingsEditingItem({ item, mode: 'view' });
                                        setMoreSettingsDrawerOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                                    >
                                      <Eye size={13} />
                                      查看
                                    </button>
                                    {readOnly ? null : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setMoreSettingsEditingItem({ item, mode: 'edit' });
                                            setMoreSettingsDrawerOpen(true);
                                          }}
                                          className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                                        >
                                          <Pencil size={13} />
                                          编辑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMoreSettingsItem(item.id)}
                                          className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                                        >
                                          <Trash2 size={13} />
                                          删除
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}

                    {readOnly ? null : (
                      <div className={moreSettingsItems.length > 0 ? 'mt-4' : ''}>
                        <button
                          type="button"
                          onClick={() => {
                            setMoreSettingsEditingItem(null);
                            setMoreSettingsDrawerOpen(true);
                          }}
                          className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
                        >
                          <Plus size={14} />
                          添加
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-end gap-3 pt-10">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-5 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
            >
              {readOnly ? '返回' : '取消'}
            </button>
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((step) => (step > 0 ? ((step - 1) as 0 | 1) : step))}
                className="inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-5 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
              >
                上一步
              </button>
            ) : null}
            {currentStep < 1 ? (
              <button
                type="button"
                disabled={currentStep === 0 && isStepOneNextDisabled}
                onClick={() => setCurrentStep((step) => (step < 1 ? ((step + 1) as 0 | 1) : step))}
                className={cn(
                  'inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border px-5 text-[13px] transition-colors',
                  currentStep === 0 && isStepOneNextDisabled
                    ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                    : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
                )}
              >
                下一步
              </button>
            ) : readOnly ? null : (
              <button
                type="button"
                disabled={isConfirmDisabled}
                onClick={() =>
                  onConfirm({
                    versionName: versionName.trim(),
                    versionDescription: versionDescription.trim(),
                  })
                }
                className={cn(
                  'inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border px-5 text-[13px] transition-colors',
                  isConfirmDisabled
                    ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                    : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
                )}
              >
                确定
              </button>
            )}
          </div>
        </div>
      </div>

      {moreSettingsDrawerOpen ? (
        <VersionFieldMoreSettingsDrawer
          editingItem={moreSettingsEditingItem}
          onClose={() => {
            setMoreSettingsDrawerOpen(false);
            setMoreSettingsEditingItem(null);
          }}
          onCreateItem={handleCreateMoreSettingsItem}
          onUpdateItem={(updated) => {
            setMoreSettingsItems((current) =>
              current.map((item) => (item.id === updated.id ? updated : item))
            );
          }}
        />
      ) : null}
    </>
  );
}

function VersionFieldEditorStepper({ currentStep }: { currentStep: 0 | 1 }) {
  return (
    <div className="flex items-center justify-center gap-0 pb-2 pt-1">
      {versionEditorStepLabels.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === versionEditorStepLabels.length - 1;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-[13px] font-medium transition-colors',
                  isActive
                    ? 'border-[#18bca2] bg-[#18bca2] text-white'
                    : isCompleted
                      ? 'border-[#18bca2] bg-white text-[#18bca2]'
                      : 'border-[#dfe6ee] bg-white text-slate-400'
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  'text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-[#18bca2]'
                    : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                )}
              >
                {label}
              </span>
            </div>
            {isLast ? null : (
              <div
                className={cn(
                  'mx-4 h-px w-16 transition-colors',
                  isCompleted ? 'bg-[#18bca2]' : 'bg-[#e3e7ed]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function VersionFieldMoreSettingsDrawer({
  editingItem,
  onClose,
  onCreateItem,
  onUpdateItem,
}: {
  editingItem: { item: VersionFieldMoreSettingsItem; mode: 'view' | 'edit' } | null;
  onClose: () => void;
  onCreateItem: (item: VersionFieldMoreSettingsItem) => void;
  onUpdateItem: (item: VersionFieldMoreSettingsItem) => void;
}) {
  const isViewMode = editingItem?.mode === 'view';
  const [editorState, setEditorState] = useState<{
    productCategory: string;
    productName: string;
    activeScope: BusinessFieldVersionScope;
    activeCategory: BusinessFieldVersionCategory;
    fields: BusinessFieldVersionFieldItem[];
  }>(() =>
    editingItem
      ? {
          productCategory: editingItem.item.productCategory,
          productName: editingItem.item.productName,
          activeScope: editingItem.item.scope,
          activeCategory: editingItem.item.fieldCategory,
          fields: cloneVersionFields(editingItem.item.fields),
        }
      : {
          productCategory: '',
          productName: '',
          activeScope: 'online',
          activeCategory: 'customer',
          fields: getVersionFieldTemplate('online', 'customer'),
        }
  );
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  const productCategoryOptions = Array.from(new Set(initialProductManagementCategories.map((item) => item.name)));
  const isEditorConfirmDisabled = !editorState.productCategory;

  const handleSwitchScope = (nextScope: BusinessFieldVersionScope) => {
    setEditorState((current) => ({
      ...current,
      activeScope: nextScope,
      fields: getVersionFieldTemplate(nextScope, current.activeCategory),
    }));
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const handleSwitchCategory = (nextCategory: BusinessFieldVersionCategory) => {
    setEditorState((current) => ({
      ...current,
      activeCategory: nextCategory,
      fields: getVersionFieldTemplate(current.activeScope, nextCategory),
    }));
    setDraggingFieldId(null);
    setDragOverFieldId(null);
  };

  const handleChangeFieldName = (fieldId: string, fieldName: string) => {
    setEditorState((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === fieldId ? { ...field, fieldName } : field)),
    }));
  };

  const handleChangeRequired = (fieldId: string, required: boolean) => {
    setEditorState((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === fieldId ? { ...field, required } : field)),
    }));
  };

  const handleDeleteField = (fieldId: string) => {
    setEditorState((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const handleDropField = (targetFieldId: string) => {
    setEditorState((current) => {
      if (!draggingFieldId || draggingFieldId === targetFieldId) {
        return current;
      }

      const fromIndex = current.fields.findIndex((field) => field.id === draggingFieldId);
      const toIndex = current.fields.findIndex((field) => field.id === targetFieldId);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const nextFields = [...current.fields];
      const [moved] = nextFields.splice(fromIndex, 1);
      nextFields.splice(toIndex, 0, moved);

      return {
        ...current,
        fields: nextFields,
      };
    });
  };

  const handleAddField = () => {
    setEditorState((current) => ({
      ...current,
      fields: [
        ...current.fields,
        {
          id: createLocalId('more-setting-field'),
          fieldName: '',
          required: true,
        },
      ],
    }));
  };

  const handleConfirm = () => {
    if (!editorState.productCategory || !editorState.productName) {
      return;
    }

    if (editingItem) {
      onUpdateItem({
        ...editingItem.item,
        productCategory: editorState.productCategory,
        productName: editorState.productName,
        scope: editorState.activeScope,
        fieldCategory: editorState.activeCategory,
        fields: cloneVersionFields(editorState.fields),
      });
    } else {
      onCreateItem({
        id: createLocalId('version-more-setting'),
        productCategory: editorState.productCategory,
        productName: editorState.productName,
        scope: editorState.activeScope,
        fieldCategory: editorState.activeCategory,
        fields: cloneVersionFields(editorState.fields),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[rgba(15,23,42,0.36)]">
      <button type="button" aria-label="关闭更多配置" onClick={onClose} className="h-full flex-1" />

      <div className="relative flex h-full w-full max-w-[498px] shrink-0 flex-col bg-white shadow-[-12px_0_28px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-[15px] font-semibold text-slate-700">
            {isViewMode ? '查看更多设置' : editingItem ? '编辑更多设置' : '添加更多设置'}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭更多配置"
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 pb-5 custom-scrollbar">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-[56px] shrink-0 text-[13px] text-slate-700">产品分类</div>
              <div className="w-[164px]">
                <ProductManagementSelect
                  value={editorState.productCategory}
                  onChange={(value) =>
                    setEditorState((current) => ({
                      ...current,
                      productCategory: value,
                      productName: '',
                    }))
                  }
                  options={['', ...productCategoryOptions]}
                  disabled={isViewMode}
                />
              </div>
            </div>

          </div>

          <div className="mt-6 flex items-center gap-0">
            {[
              { key: 'online' as const, label: '在线' },
              { key: 'hotline' as const, label: '热线' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => !isViewMode && handleSwitchScope(item.key)}
                className={cn(
                  'inline-flex h-8 min-w-[98px] items-center justify-center border text-[14px] font-medium transition-colors',
                  item.key === editorState.activeScope
                    ? 'border-[#87e0d4] bg-[#ecfbf8] text-[#18bca2]'
                    : 'border-[#e5e9ef] bg-white text-slate-500 hover:bg-slate-50'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-0">
            {[
              { key: 'customer' as const, label: '客户字段' },
              { key: 'summary' as const, label: '小结字段' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => !isViewMode && handleSwitchCategory(item.key)}
                className={cn(
                  'inline-flex h-8 min-w-[98px] items-center justify-center border text-[14px] font-medium transition-colors',
                  item.key === editorState.activeCategory
                    ? 'border-[#87e0d4] bg-[#ecfbf8] text-[#18bca2]'
                    : 'border-[#e5e9ef] bg-white text-slate-500 hover:bg-slate-50'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className={cn(
              'grid items-center px-[10px] pb-2 text-[13px] font-medium text-slate-600',
              isViewMode ? 'grid-cols-[114px_1fr]' : 'grid-cols-[114px_148px_1fr]'
            )}>
              <div>字段名称</div>
              <div>是否必填</div>
              {isViewMode ? null : <div className="text-right">操作</div>}
            </div>

            <div className="space-y-[10px]">
              {editorState.fields.map((field) => (
                <div
                  key={field.id}
                  onDragOver={(event) => {
                    if (isViewMode || !draggingFieldId) {
                      return;
                    }
                    event.preventDefault();
                    if (dragOverFieldId !== field.id) {
                      setDragOverFieldId(field.id);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDropField(field.id);
                    setDraggingFieldId(null);
                    setDragOverFieldId(null);
                  }}
                  className={cn(
                    'grid items-center gap-[14px] rounded-[4px] transition-colors',
                    isViewMode ? 'grid-cols-[114px_1fr]' : 'grid-cols-[114px_148px_1fr]',
                    dragOverFieldId === field.id &&
                      draggingFieldId &&
                      draggingFieldId !== field.id &&
                      'bg-[#f4fcfa] shadow-[inset_0_0_0_1px_rgba(132,221,208,0.9)]',
                    draggingFieldId === field.id && 'opacity-60'
                  )}
                >
                  <div className="relative">
                    <select
                      value={field.fieldName}
                      disabled={isViewMode}
                      onChange={(event) => handleChangeFieldName(field.id, event.target.value)}
                      className={cn(
                        'h-8 w-full appearance-none rounded-[4px] border border-[#dfe6ee] bg-white pl-3 pr-8 text-[13px] text-slate-600 outline-none transition-colors focus:border-[#7fdccf]',
                        isViewMode && 'cursor-not-allowed bg-slate-50 text-slate-500'
                      )}
                    >
                      <option value="">请选择字段</option>
                      {businessFieldVersionFieldOptions.map((item) => (
                        <option key={`${field.id}-${item}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-5 text-[13px] text-slate-600">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`more-setting-required-${field.id}`}
                        checked={field.required}
                        disabled={isViewMode}
                        onChange={() => handleChangeRequired(field.id, true)}
                        className={cn('h-4 w-4 accent-[#20c6b1]', isViewMode && 'cursor-not-allowed')}
                      />
                      <span>是</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`more-setting-required-${field.id}`}
                        checked={!field.required}
                        disabled={isViewMode}
                        onChange={() => handleChangeRequired(field.id, false)}
                        className={cn('h-4 w-4 accent-[#20c6b1]', isViewMode && 'cursor-not-allowed')}
                      />
                      <span>否</span>
                    </label>
                  </div>

                  {isViewMode ? null : (
                    <div className="flex items-center justify-end gap-4 whitespace-nowrap text-[#21c4b0]">
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.id)}
                        className="inline-flex items-center gap-1 transition-colors hover:text-[#18bca2]"
                      >
                        <Trash2 size={13} />
                        删除
                      </button>
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', field.id);
                          setDraggingFieldId(field.id);
                          setDragOverFieldId(field.id);
                        }}
                        onDragEnd={() => {
                          setDraggingFieldId(null);
                          setDragOverFieldId(null);
                        }}
                        aria-label={`拖动排序${field.fieldName || '字段'}`}
                        className="inline-flex cursor-grab items-center gap-1 transition-colors hover:text-[#18bca2] active:cursor-grabbing"
                      >
                        <GripVertical size={13} />
                        排序
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isViewMode ? null : (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddField}
                  className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-4 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
                >
                  <Plus size={14} />
                  添加
                </button>
              </div>
            )}
          </div>
        </div>

        {isViewMode ? (
          <div className="flex items-center justify-end gap-3 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border border-[#82ddd0] bg-[#effbf8] px-5 text-[13px] text-[#18bca2] transition-colors hover:bg-[#e2f8f3]"
            >
              关闭
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-5 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isEditorConfirmDisabled}
              onClick={handleConfirm}
              className={cn(
                'inline-flex h-8 min-w-[68px] items-center justify-center rounded-full border px-5 text-[13px] transition-colors',
                isEditorConfirmDisabled
                  ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                  : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
              )}
            >
              确定
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldManagementTicketTemplatePanel({
  readOnly,
  treeNodes,
  selectedNodeId,
  items,
  onBack,
  onToggleTreeNode,
  onSelectTreeNode,
  onOpenCreate,
  onEditItem,
  onDeleteItem,
}: {
  readOnly?: boolean;
  treeNodes: readonly ProblemClassificationTreeNode[];
  selectedNodeId: string;
  items: readonly TicketTemplateItem[];
  onBack: () => void;
  onToggleTreeNode: (nodeId: string) => void;
  onSelectTreeNode: (nodeId: string) => void;
  onOpenCreate: () => void;
  onEditItem: (item: TicketTemplateItem) => void;
  onDeleteItem: (item: TicketTemplateItem) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
      <div className="pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-[3px] text-[18px] font-semibold text-slate-800 transition-colors hover:text-slate-600"
        >
          <ChevronLeft size={17} />
          <span>建单模板管理</span>
        </button>
      </div>

      <div
        className="grid min-h-0 flex-1 gap-[10px] overflow-x-auto custom-scrollbar"
        style={{ gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)' }}
      >
        <section className="flex min-h-[610px] min-w-[240px] flex-col overflow-hidden rounded-[6px] border border-[#e7edf3] bg-white">
          <div className="px-[13px] py-[12px] text-[14px] font-semibold text-slate-700">业务类型和产品</div>
          <div className="min-h-0 flex-1 overflow-auto px-[8px] pb-[14px] pt-[2px] custom-scrollbar">
            <FieldManagementProblemClassificationTree
              nodes={treeNodes}
              selectedNodeId={selectedNodeId}
              onToggleTreeNode={onToggleTreeNode}
              onSelectTreeNode={onSelectTreeNode}
            />
          </div>
        </section>

        <section className="flex min-h-[610px] min-w-[320px] flex-col overflow-hidden rounded-[6px] border border-[#e7edf3] bg-white">
          <div className="flex items-center justify-between px-[14px] py-[12px]">
            <div className="text-[14px] font-semibold text-slate-700">建单模板</div>
            {readOnly ? null : (
              <button
                type="button"
                onClick={onOpenCreate}
                className="inline-flex h-[28px] items-center gap-1 rounded-[4px] border border-[#8fe0d2] bg-white px-3 text-[13px] font-medium text-[#21c4b0] transition-colors hover:bg-[#f4fcfa]"
              >
                <Plus size={14} />
                新增模板
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-[14px] pb-[14px] custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center text-[13px] text-slate-400">
                暂无建单模板，点击右上角新增
              </div>
            ) : (
              <div className="space-y-[10px]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[6px] border border-[#eef2f6] bg-white px-[14px] py-[10px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[8px]">
                        {item.enabled ? (
                          <CheckCircle2 size={13} strokeWidth={2.1} className="shrink-0 text-[#28c7b2]" />
                        ) : (
                          <img src={minusIcon} alt="" className="h-[13px] w-[13px] shrink-0 object-contain" />
                        )}
                        <span className="text-[13px] font-medium text-slate-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-[12px] text-slate-400">
                        {readOnly ? null : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditItem(item)}
                              aria-label={`编辑${item.name}`}
                              className="inline-flex items-center gap-[3px] text-[12px] transition-colors hover:text-slate-600"
                            >
                              <Pencil size={13} />
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item)}
                              aria-label={`删除${item.name}`}
                              className="inline-flex items-center gap-[3px] text-[12px] transition-colors hover:text-slate-600"
                            >
                              <Trash2 size={13} />
                              删除
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-[8px] text-[12px] font-medium text-slate-500">建单要素</div>
                    <pre className="mt-[4px] whitespace-pre-wrap rounded-[4px] bg-[#fafcfe] px-[10px] py-[8px] text-[12px] leading-[20px] text-red-500">
                      {item.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TicketTemplateEditorModal({
  title,
  draft,
  onClose,
  onDraftChange,
  onConfirm,
  confirmDisabled,
}: {
  title: string;
  draft: TicketTemplateEditorState;
  onClose: () => void;
  onDraftChange: (updater: (current: TicketTemplateEditorState) => TicketTemplateEditorState) => void;
  onConfirm: () => void;
  confirmDisabled: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.36)] p-6">
      <button type="button" aria-label={`关闭${title}`} onClick={onClose} className="absolute inset-0" />

      <div className="relative z-10 w-full max-w-[460px] rounded-[8px] border border-[#e6ebf2] bg-white px-4 pb-4 pt-3 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold text-slate-700">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`关闭${title}`}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-[10px]">
          <div className="flex items-center gap-2">
            <ProblemClassificationModalFieldLabel label="模板名称" required />
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="h-[28px] w-0 min-w-0 flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 text-[13px] text-slate-600 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
            />
          </div>

          <div className="flex items-start gap-2">
            <div className="w-[58px] shrink-0 pt-[6px] text-right text-[13px] text-slate-700">
              <span className="mr-[2px] text-[#ff8b5e]">*</span>
              建单要素
            </div>
            <textarea
              rows={6}
              value={draft.content}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              placeholder="请输入建单要素模板内容，可使用多行文本"
              className="w-0 min-w-0 flex-1 rounded-[4px] border border-[#dfe6ee] bg-white px-3 py-[6px] text-[13px] leading-[20px] text-red-500 outline-none transition-colors placeholder:text-slate-300 focus:border-[#7fdccf]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ProblemClassificationModalFieldLabel label="状态" required />
            <div className="w-0 min-w-0 flex-1">
              <ProductManagementSelect
                value={draft.status}
                onChange={(value) =>
                  onDraftChange((current) => ({
                    ...current,
                    status: value as TicketTemplateEditorState['status'],
                  }))
                }
                options={['', '启用', '停用']}
              />
            </div>
          </div>
        </div>

        <div className="mt-[14px] flex items-center justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[28px] min-w-[60px] items-center justify-center rounded-full border border-[#e3e7ed] bg-white px-4 text-[13px] text-slate-500 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={cn(
              'inline-flex h-[28px] min-w-[60px] items-center justify-center rounded-full border px-4 text-[13px] transition-colors',
              confirmDisabled
                ? 'cursor-not-allowed border-[#d9efe9] bg-[#f6fbfa] text-[#9ad7cc]'
                : 'border-[#82ddd0] bg-[#effbf8] text-[#18bca2] hover:bg-[#e2f8f3]'
            )}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
