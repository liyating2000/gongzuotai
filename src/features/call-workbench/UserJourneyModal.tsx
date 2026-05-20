import {
  Headphones,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '../../lib/cn';
import FloatingPanel from './FloatingPanel';

type JourneyChannel = '电话' | '在线' | '短信' | '邮件';

type JourneyItem = {
  id: string;
  time: string;
  channel: JourneyChannel;
  title: string;
  ticketId?: string;
  tone: 'resolved' | 'pending' | 'escalated';
};

const channelIcon: Record<JourneyChannel, LucideIcon> = {
  电话: Phone,
  在线: Headphones,
  短信: MessageSquare,
  邮件: Mail,
};

const channelColor: Record<JourneyChannel, string> = {
  电话: 'bg-brand-50 text-brand-600 border-brand-100',
  在线: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  短信: 'bg-violet-50 text-violet-600 border-violet-100',
  邮件: 'bg-amber-50 text-amber-600 border-amber-100',
};

const toneLabel: Record<JourneyItem['tone'], { text: string; cls: string }> = {
  resolved: { text: '已解决', cls: 'text-emerald-600' },
  pending: { text: '跟进中', cls: 'text-amber-600' },
  escalated: { text: '已升级', cls: 'text-rose-500' },
};

const journeyItems: JourneyItem[] = [
  {
    id: 'j-1',
    time: '04-15 09:42',
    channel: '电话',
    title: '咨询 T10 学习机充电速度下降',
    ticketId: 'WO-0412',
    tone: 'pending',
  },
  {
    id: 'j-2',
    time: '04-10 16:08',
    channel: '在线',
    title: '以旧换新政策咨询',
    ticketId: 'WO-0277',
    tone: 'resolved',
  },
  {
    id: 'j-3',
    time: '03-28 10:55',
    channel: '电话',
    title: '投诉物流延迟',
    ticketId: 'WO-1104',
    tone: 'escalated',
  },
  {
    id: 'j-4',
    time: '03-12 14:20',
    channel: '短信',
    title: '满意度回访',
    tone: 'resolved',
  },
  {
    id: 'j-5',
    time: '02-26 11:12',
    channel: '在线',
    title: '课程学习引导咨询',
    ticketId: 'WO-0688',
    tone: 'resolved',
  },
];

type UserJourneyModalProps = {
  isOpen: boolean;
  customerName?: string;
  onClose: () => void;
};

export default function UserJourneyModal({
  isOpen,
  customerName = '王同学',
  onClose,
}: UserJourneyModalProps) {
  return (
    <FloatingPanel
      isOpen={isOpen}
      onClose={onClose}
      title="用户旅程"
      subtitle={`${customerName} · 近 90 天 ${journeyItems.length} 条触点`}
      accent="brand"
      width={440}
      maxHeight={520}
    >
      <ol className="relative space-y-3 border-l-2 border-dashed border-slate-200 pl-5">
        {journeyItems.map((item) => {
          const Icon = channelIcon[item.channel];
          const tone = toneLabel[item.tone];
          return (
            <li key={item.id} className="relative">
              <span
                className={cn(
                  'absolute -left-[22px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-white',
                  channelColor[item.channel]
                )}
              >
                <Icon size={10} strokeWidth={2.2} />
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="tabular-nums text-[11px] text-slate-400">
                  {item.time}
                </span>
                <span className={cn('text-[11px] font-semibold', tone.cls)}>
                  {tone.text}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="truncate text-[13px] font-semibold text-slate-700">
                  {item.title}
                </span>
                {item.ticketId ? (
                  <span className="shrink-0 tabular-nums text-[11px] font-semibold text-brand-600">
                    {item.ticketId}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </FloatingPanel>
  );
}
