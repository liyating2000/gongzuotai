export const messageServiceMailboxes = ['我的公告箱', '我发布的', '已失效公告'] as const;

export type MessageServiceMailbox = (typeof messageServiceMailboxes)[number];
