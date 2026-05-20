import { useState } from 'react';
import {
  Check,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquareText,
  Package,
  User,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import TicketSummaryModal from './TicketSummaryModal';
import UserJourneyModal from './UserJourneyModal';

type CallAgentInsight = {
  indexLabel: string;
  content: string;
  primaryTime: string;
  secondaryTime: string;
};

type CallAgentQuickCard = {
  title: string;
  status: string;
  active?: boolean;
};

type CallAgentProfile = {
  name: string;
  phone: string;
  customerType: string;
  vipLevel: string;
  customerId: string;
  address: string;
  tag: string;
};

type CallAgentTicket = {
  id: string;
  title: string;
  time: string;
  status: string;
  tone: 'warning' | 'muted';
};

type CallAgentPanelProps = {
  insight: CallAgentInsight;
  quickCards: readonly CallAgentQuickCard[];
  journeyName: string;
  profile: CallAgentProfile;
  openTickets: readonly CallAgentTicket[];
  purchasedDeviceCount: number;
  interactionCount: number;
};

export default function CallAgentPanel({
  insight,
  quickCards,
  journeyName,
  profile,
  openTickets,
  purchasedDeviceCount,
  interactionCount,
}: CallAgentPanelProps) {
  const [openModal, setOpenModal] = useState<'journey' | 'summary' | null>(null);

  return (
    <section className="surface-card relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(80%_100%_at_50%_0%,rgba(58,92,255,0.08),transparent_60%)]">
      <div className="shrink-0 border-b border-hairline bg-gradient-to-r from-white via-brand-50/30 to-white px-4 py-3">
        <div className="flex items-center gap-2">

          <div className="text-[15px] font-bold text-slate-800">Agent</div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-accent-200/70 bg-accent-50 px-2.5 py-1 text-[11px] font-semibold text-accent-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
            智能辅助中
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
        <div className="space-y-4">
          <div className="rounded-[12px] border border-brand-100/70 bg-gradient-to-br from-brand-50/60 to-white px-3 py-3 shadow-[0_2px_10px_-4px_rgba(58,92,255,0.12)]">
            <div className="flex items-start gap-3">
              <div className="pt-0.5 text-[12px] tabular-nums font-bold text-brand-500">{insight.indexLabel}</div>
              <div className="min-w-0 flex-1 text-[12px] leading-5 text-slate-700">{insight.content}</div>
              <div className="shrink-0 text-right text-[11px] tabular-nums text-slate-400">
                <div className="text-slate-500">{insight.primaryTime}</div>
                <div className="mt-1 text-slate-400">{insight.secondaryTime}</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            {quickCards.map((card) => {
              const isJourney = card.title === '用户旅程';
              const isSummary = card.title === '工单小结';
              const clickable = isJourney || isSummary;
              return (
                <div
                  key={card.title}
                  className={cn(
                    'relative w-[120px] shrink-0 rounded-[12px] border px-2.5 py-2.5 transition-all press-lift',
                    card.active
                      ? 'border-brand-200/70 bg-gradient-to-br from-brand-50 to-white shadow-[0_4px_14px_-4px_rgba(58,92,255,0.22)]'
                      : 'border-hairline bg-white/70 shadow-[0_1px_4px_rgba(15,23,42,0.035)]'
                  )}
                >
                  {clickable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenModal(isJourney ? 'journey' : 'summary')
                      }
                      aria-label={`打开${card.title}详情`}
                      title={`查看${card.title}详情`}
                      className="focus-ring absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    >
                      <ExternalLink size={11} strokeWidth={2.2} />
                    </button>
                  ) : null}

                  <div className="flex items-center gap-1.5 pr-5 text-[11px] font-semibold text-slate-700">
                    <span
                      className={cn(
                        'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] border transition-colors',
                        card.active
                          ? 'border-brand-200 bg-brand-50 text-brand-600'
                          : 'border-hairline bg-white text-slate-500'
                      )}
                    >
                      {isJourney ? (
                        <User size={12} strokeWidth={2.2} />
                      ) : (
                        <FileText size={12} strokeWidth={2.2} />
                      )}
                    </span>
                    <span className="leading-4">{card.title}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-accent-600">
                    <Check size={12} strokeWidth={2.8} />
                    <span>{card.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-hairline pt-3">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-slate-800">
              <User size={13} strokeWidth={2.4} className="text-brand-500" />
              <span>用户旅程</span>
              <span className="text-[11px] font-medium text-slate-400">{journeyName}</span>
            </div>

            <div className="rounded-[12px] border border-hairline bg-gradient-to-br from-white to-slate-50/60 px-4 py-3 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-[13px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(58,92,255,0.55)] ring-2 ring-white">
                    {profile.name.slice(-2)}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-slate-800">{profile.name}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {profile.customerType}，<span className="font-semibold text-amber-600">{profile.vipLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] tabular-nums font-bold text-slate-800">{profile.phone}</div>
                  <div className="mt-1 text-[11px] tabular-nums text-slate-400">编号：{profile.customerId}</div>
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin size={12} strokeWidth={2.4} className="shrink-0 text-signal-danger" />
                  <span className="truncate">{profile.address}</span>
                </div>
                <div className="shrink-0 rounded-full border border-brand-200/70 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600">
                  {profile.tag}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-slate-800">
              <Package size={13} strokeWidth={2.4} className="text-brand-500" />
              <span>已购设备（<span className="tabular-nums">{purchasedDeviceCount}</span>）</span>
            </div>
            <div className="py-4 text-center text-[12px] text-slate-300">
              暂无设备记录
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-slate-800">
              <FileText size={13} strokeWidth={2.4} className="text-brand-500" />
              <span>未办结工单（<span className="tabular-nums">{openTickets.length}</span>）</span>
            </div>
            <div className="space-y-3">
              {openTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="surface-card surface-card-hover rounded-[12px] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[11px] tabular-nums font-bold text-brand-600">{ticket.id}</div>
                    <div
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        ticket.tone === 'warning'
                          ? 'border-amber-200/70 bg-amber-50 text-amber-700'
                          : 'border-hairline bg-slate-50 text-slate-500'
                      )}
                    >
                      {ticket.status}
                    </div>
                  </div>
                  <div className="mt-2 text-[12px] font-medium leading-5 text-slate-800">{ticket.title}</div>
                  <div className="mt-1 text-[11px] tabular-nums text-slate-400">{ticket.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-slate-800">
              <MessageSquareText size={13} strokeWidth={2.4} className="text-brand-500" />
              <span>互动历史（<span className="tabular-nums">{interactionCount}</span>）</span>
            </div>
            <div className="py-4 text-center text-[12px] text-slate-300">
              暂无互动记录
            </div>
          </div>
        </div>
      </div>

      <UserJourneyModal
        isOpen={openModal === 'journey'}
        customerName={profile.name}
        onClose={() => setOpenModal(null)}
      />
      <TicketSummaryModal
        isOpen={openModal === 'summary'}
        customerName={profile.name}
        onClose={() => setOpenModal(null)}
      />
    </section>
  );
}
