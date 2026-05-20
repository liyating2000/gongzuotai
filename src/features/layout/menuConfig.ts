import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  Monitor,
  Phone,
  PhoneCall,
  Settings,
  User,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { MainTab } from './mainTabs';
import type { UserRole } from './roles';

export type SidebarIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

/**
 * Workbench items are gated by the current role.
 * - 'call'   → visible when allowedWorkbenches.call  === true
 * - 'online' → visible when allowedWorkbenches.online === true
 */
export type WorkbenchGate = 'call' | 'online';

export type MenuItemConfig = {
  /** Stable id — used for React keys and expansion state. */
  id: string;
  /** Display label (Chinese). */
  label: string;
  /** Icon (only top-level items render an icon). */
  icon?: SidebarIcon;
  /** Sub-menu items. If present the top-level item is a group. */
  children?: MenuItemConfig[];
  /** When set, clicking the item dispatches handleOpenMainTab(opensTab). */
  opensTab?: MainTab;
  /** When set, item visibility is tied to allowedWorkbenches for the role. */
  workbenchGate?: WorkbenchGate;
  /**
   * Roles allowed to see this item. `undefined` means visible to everyone.
   * Applies to both top-level and child items.
   */
  allowedRoles?: readonly UserRole[];
};

export const sidebarMenuConfig: MenuItemConfig[] = [
  // ───────── 个人门户 (visible to all roles) ─────────
  {
    id: 'personal-portal',
    label: '个人门户',
    icon: LayoutDashboard,
    opensTab: '个人门户',
  },

  // ───────── Workbench entries (role-gated leaves) ─────────
  {
    id: 'hotline-workbench',
    label: '呼叫工作台',
    icon: PhoneCall,
    opensTab: '呼叫工作台',
    workbenchGate: 'call',
  },
  {
    id: 'online-workbench',
    label: '在线工作台',
    icon: Headphones,
    opensTab: '在线工作台',
    workbenchGate: 'online',
  },

  // ───────── 快捷入口 (admin only) ─────────
  {
    id: 'work-order-management',
    label: '工单管理',
    icon: ClipboardList,
    opensTab: '工单管理',
    allowedRoles: ['admin'],
  },
  {
    id: 'course-learning',
    label: '学习课程',
    icon: GraduationCap,
    opensTab: '学习课程',
    allowedRoles: ['admin'],
  },

  // ───────── 电话客服 ─────────
  {
    id: 'phone-service',
    label: '电话客服',
    icon: Phone,
    children: [
      { id: 'phone-list', label: '电话清单', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'recording-query', label: '录音查询', opensTab: '录音查询' as MainTab },
      { id: 'sample-recording-query', label: '范例录音查询', opensTab: '范例录音查询' as MainTab },
      { id: 'sample-recording-review', label: '范例录音审核', opensTab: '范例录音审核' as MainTab, allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'customer-info', label: '客户资料', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'sms-query', label: '短信收发查询', opensTab: '短信收发查询' as MainTab },
      { id: 'email-query', label: '邮件收发查询', opensTab: '邮件收发查询' as MainTab },
    ],
  },

  // ───────── 网聊客服 ─────────
  {
    id: 'webchat-service',
    label: '网聊客服',
    icon: MessageSquare,
    children: [
      { id: 'webchat-maintenance', label: '网聊维护', opensTab: '网聊维护' as MainTab, allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'webchat-history', label: '网聊历史查询', opensTab: '网聊历史查询' as MainTab },
      { id: 'webchat-message', label: '网聊留言管理', opensTab: '网聊留言管理' as MainTab },
      { id: 'webchat-sample-approval', label: '网聊范例聊天审批', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'webchat-sample-query', label: '网聊范例聊天查询' },
      { id: 'webchat-holiday', label: '网聊节假日管理', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'webchat-blacklist-query', label: '网聊黑名单查询', opensTab: '网聊黑名单查询' as MainTab },
      { id: 'webchat-blacklist-approval', label: '网聊黑名单审批', opensTab: '网聊黑名单审批' as MainTab, allowedRoles: ['manager', 'director', 'admin'] },
    ],
  },

  // ───────── 排班管理 ─────────
  {
    id: 'schedule-management',
    label: '排班管理',
    icon: Calendar,
    allowedRoles: ['manager', 'director', 'admin'],
    children: [
      { id: 'shift-maintenance', label: '班次维护', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'skill-maintenance', label: '人员技能维护', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'schedule-plan', label: '排班方案维护', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'schedule-history', label: '排班历史维护', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'schedule-import', label: '排班导入', allowedRoles: ['manager', 'director', 'admin'] },
      {
        id: 'schedule-display',
        label: '排班信息展示',
        opensTab: '排班信息展示',
      },
      { id: 'work-info-display', label: '上班信息展示', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'shift-change', label: '换/改班/请假/撤销', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'schedule-monitor', label: '排班信息监控', allowedRoles: ['manager', 'director', 'admin'] },
    ],
  },

  // ───────── 监控管理 ─────────
  {
    id: 'monitor',
    label: '监控管理',
    icon: Monitor,
    allowedRoles: ['manager', 'director', 'admin'],
    children: [
      { id: 'agent-monitor', label: '话务员监控', opensTab: '话务员监控' as MainTab },
      { id: 'queue-monitor', label: '队列监控', opensTab: '队列监控' as MainTab },
    ],
  },

  // ───────── 消息通知 ─────────
  {
    id: 'message-notice',
    label: '消息通知',
    icon: Bell,
    allowedRoles: ['manager', 'director', 'admin'],
    children: [
      { id: 'message-maintenance', label: '消息维护', allowedRoles: ['manager', 'director', 'admin'] },
      { id: 'message-service', label: '消息服务', opensTab: '消息服务' },
    ],
  },

  // ───────── 辅助工具 ─────────
  {
    id: 'utility-tools',
    label: '辅助工具',
    icon: FileText,
    allowedRoles: ['admin'],
    children: [
      { id: 'summary-management', label: '小结管理', opensTab: '小结管理' as MainTab },
      { id: 'appointment-message-management', label: '预约回电/留言管理', opensTab: '预约回电管理' as MainTab },
    ],
  },

  // ───────── 组织架构 ─────────
  {
    id: 'organization',
    label: '组织架构',
    icon: LayoutGrid,
    allowedRoles: ['admin'],
    children: [
      { id: 'account-management', label: '账号管理' },
      { id: 'role-department', label: '角色/部门' },
      { id: 'personal-info', label: '个人信息' },
    ],
  },

  // ───────── 权限管理 ─────────
  {
    id: 'permission',
    label: '权限管理',
    icon: User,
    allowedRoles: ['admin'],
    children: [
      { id: 'operation-permission', label: '操作权限管理' },
      { id: 'menu-permission', label: '菜单/权限管理' },
      { id: 'report-permission', label: '报表权限维护' },
    ],
  },

  // ───────── 系统设置 ─────────
  {
    id: 'system-settings',
    label: '系统设置',
    icon: Settings,
    allowedRoles: ['manager', 'director', 'admin'],
    children: [
      {
        id: 'business-field-management',
        label: '业务字段管理',
        opensTab: '业务字段管理',
        allowedRoles: ['admin'],
      },
      {
        id: 'business-field-launch-review',
        label: '业务字段上线审核',
        opensTab: '业务字段上线审核',
        allowedRoles: ['admin'],
      },
      { id: 'busy-announcement', label: '繁忙公告管理', opensTab: '繁忙公告管理' as MainTab, allowedRoles: ['admin'] },
      { id: 'privacy-statement', label: '隐私声明管理', opensTab: '隐私声明管理' as MainTab, allowedRoles: ['admin'] },
      { id: 'user-system', label: '用户体系管理', allowedRoles: ['admin'] },
      { id: 'phone-blacklist', label: '电话黑名单维护' },
      { id: 'sensitive-word', label: '敏感词维护', allowedRoles: ['admin'] },
      { id: 'system-label', label: '系统标签维护', allowedRoles: ['admin'] },
    ],
  },
];

/**
 * Find the id of the top-level menu group that contains a sub-item
 * whose `opensTab` matches the given tab. Used to auto-expand the
 * parent group when a secondary tab becomes active.
 */
export const findMenuGroupForTab = (tab: MainTab): string | null => {
  for (const item of sidebarMenuConfig) {
    if (!item.children) continue;
    if (item.children.some((child) => child.opensTab === tab)) {
      return item.id;
    }
  }
  return null;
};

/**
 * Whether a menu item is visible for a given role based on
 * `allowedRoles`. Items without `allowedRoles` are visible to everyone.
 */
export const isMenuItemVisibleForRole = (
  item: MenuItemConfig,
  role: UserRole
): boolean => {
  if (!item.allowedRoles) return true;
  return item.allowedRoles.includes(role);
};

/**
 * Prune the menu tree by role. Hidden top-level items are removed;
 * children of visible groups are filtered individually (so a group may
 * render with a subset of its original children).
 */
export const filterMenuByRole = (
  items: readonly MenuItemConfig[],
  role: UserRole
): MenuItemConfig[] => {
  const result: MenuItemConfig[] = [];
  for (const item of items) {
    if (!isMenuItemVisibleForRole(item, role)) continue;
    if (item.children && item.children.length > 0) {
      const visibleChildren = item.children.filter((child) =>
        isMenuItemVisibleForRole(child, role)
      );
      // Skip groups where every child is role-restricted out.
      if (visibleChildren.length === 0) continue;
      result.push({ ...item, children: visibleChildren });
    } else {
      result.push(item);
    }
  }
  return result;
};

/**
 * Filter the menu tree by a free-text query. Matches on Chinese labels
 * (case-insensitive). A top-level match keeps the whole group; a child
 * match keeps only the matching children of that group.
 *
 * Returns all items unchanged when the query is empty.
 */
export const filterMenuByQuery = (
  items: readonly MenuItemConfig[],
  query: string
): MenuItemConfig[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...items];

  const result: MenuItemConfig[] = [];
  for (const item of items) {
    const labelMatches = item.label.toLowerCase().includes(normalized);
    if (labelMatches) {
      result.push(item);
      continue;
    }

    if (item.children && item.children.length > 0) {
      const matchingChildren = item.children.filter((child) =>
        child.label.toLowerCase().includes(normalized)
      );
      if (matchingChildren.length > 0) {
        result.push({ ...item, children: matchingChildren });
      }
    }
  }
  return result;
};
