export type UserRole =
  | 'agent'
  | 'manager'
  | 'director'
  | 'admin';

export const userRoleOrder: readonly UserRole[] = [
  'agent',
  'manager',
  'director',
  'admin',
] as const;

export const userRoleLabels: Record<UserRole, string> = {
  agent: '坐席',
  manager: '班组',
  director: '总监',
  admin: '系统管理员',
};

export const userRoleDescriptions: Record<UserRole, string> = {
  agent: '热线 / 在线一线坐席',
  manager: '热线 / 在线班组长',
  director: '项目 / 业务总监',
  admin: '系统运维管理员',
};

export const DEFAULT_USER_ROLE: UserRole = 'agent';

export const isUserRole = (value: string): value is UserRole =>
  (userRoleOrder as readonly string[]).includes(value);

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const parseRoleFromPathname = (pathname: string): UserRole | null => {
  const stripped = BASE ? pathname.replace(new RegExp(`^${BASE}`), '') : pathname;
  const segment = stripped.replace(/^\/+/, '').split('/')[0] ?? '';
  if (!segment) return null;
  try {
    const decoded = decodeURIComponent(segment);
    return isUserRole(decoded) ? decoded : null;
  } catch {
    return isUserRole(segment) ? segment : null;
  }
};

export const buildPathForRole = (role: UserRole): string => `${BASE}/${role}`;

export const getViewModeForRole = (role: UserRole): 'manager' | 'agent' =>
  role === 'agent' ? 'agent' : 'manager';

export const getAgentChannelForRole = (_role: UserRole): 'online' | 'hotline' =>
  'hotline';

export type AllowedWorkbenches = {
  call: boolean;
  online: boolean;
};

export const getAllowedWorkbenchesForRole = (
  role: UserRole
): AllowedWorkbenches => {
  switch (role) {
    case 'agent':
      return { call: true, online: true };
    case 'manager':
    case 'director':
    case 'admin':
      return { call: false, online: false };
  }
};

/**
 * 所有角色的个人门户都显示热线/在线胶囊切换器，不再锁定渠道。
 */
export const isAgentChannelLockedForRole = (_role: UserRole): boolean => false;
