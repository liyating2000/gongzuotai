/**
 * Shared "main tab" types used by App shell, MainHeader and menu config.
 * Kept in a dedicated file so that both the consumer (App) and the
 * data-driven menu config can agree on the same string literal union
 * without circular imports.
 */
export type MainTab =
  | '个人门户'
  | '呼叫工作台'
  | '在线工作台'
  | '消息服务'
  | '排班信息展示'
  | '业务字段管理'
  | '业务字段上线审核'
  | '工单管理'
  | '学习课程'
  | '繁忙公告管理'
  | '隐私声明管理'
  | '网聊维护'
  | '录音查询'
  | '范例录音查询'
  | '范例录音审核'
  | '短信收发查询'
  | '邮件收发查询'
  | '话务员监控'
  | '队列监控'
  | '网聊历史查询'
  | '网聊留言管理'
  | '网聊黑名单查询'
  | '网聊黑名单审批'
  | '小结管理'
  | '预约回电管理';

export type PrimaryMainTab = '个人门户' | '呼叫工作台' | '在线工作台';
export type SecondaryMainTab = Exclude<MainTab, PrimaryMainTab>;
