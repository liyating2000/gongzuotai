export type DirectorExpressView = 'list' | 'new' | 'detail';

export type DirectorExpressReply = {
  sender: string;
  content: string;
  timestamp: string;
};

export type DirectorExpressMessage = {
  id: string;
  title: string;
  sender: string;
  recipient: string;
  isAnonymous: boolean;
  isReplied: boolean;
  createdAt: string;
  updatedAt: string;
  hasNew: boolean;
  content: string;
  replies: DirectorExpressReply[];
};

export const initialDirectorMessages: DirectorExpressMessage[] = [
  {
    id: '9089000',
    title: '意见投诉',
    sender: 'Ranou',
    recipient: 'zongjian',
    isAnonymous: true,
    isReplied: false,
    createdAt: '2026-01-09 18:00',
    updatedAt: '2026-01-09 18:00',
    hasNew: true,
    content:
      '尊敬的总监：\n\n您好！为提升客服接待效率、优化用户体验，减少用户重复表述问题，结合一线服务实际，现提出简要建议：\n\n建议系统规范历史会话小结、本次转接小结展示逻辑，同时统一坐席开口衔接话术，让人工转接更顺畅、服务更专业。\n\n望您参考，感谢关注！',
    replies: [],
  },
  {
    id: '9089001',
    title: '系统优化建议',
    sender: 'Ranou',
    recipient: 'zongjian',
    isAnonymous: false,
    isReplied: false,
    createdAt: '2026-01-10 10:00',
    updatedAt: '2026-01-10 10:00',
    hasNew: false,
    content: '建议增加自动回复功能。',
    replies: [],
  },
  {
    id: '9089002',
    title: '关于排班的反馈',
    sender: 'Ranou',
    recipient: 'zongjian',
    isAnonymous: true,
    isReplied: true,
    createdAt: '2026-01-11 14:30',
    updatedAt: '2026-01-11 15:00',
    hasNew: false,
    content: '排班时间太紧凑了。',
    replies: [
      {
        sender: 'zongjian',
        content: '我们会考虑调整。',
        timestamp: '2026-01-11 15:00',
      },
    ],
  },
];
