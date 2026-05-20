import { useState } from 'react';
import { ChevronDown, RefreshCw, Sparkles } from 'lucide-react';

import { cn } from '../../lib/cn';
import FloatingPanel from './FloatingPanel';

type AIField = {
  label: string;
  value: string;
  confidence: number;
};

const problemCategoryLevel2Options: Record<string, string[]> = {
  '硬件故障': ['电池', '屏幕不亮', '按键失灵', '充电异常', '摄像头故障'],
  '系统升级': ['升级失败', '升级后异常', '版本回退'],
  '登录异常': ['密码错误', '验证码未收到', '账号冻结'],
  '账号注销': ['注销流程咨询', '注销后恢复'],
  '支付异常': ['重复扣款', '支付超时', '退款未到账'],
  '物流查询': ['快递未送达', '物流信息异常'],
  '退换货': ['换货进度', '退货流程', '退款进度'],
  '保修咨询': ['保修期判定', '保修范围', '延保服务'],
};

const defaultFields: AIField[] = [
  { label: '业务分类', value: '售后服务', confidence: 0.98 },
  { label: '产品类型', value: '学习机 T10', confidence: 0.95 },
  { label: '问题分类', value: '硬件故障/电池', confidence: 0.87 },
  { label: '处理方式', value: '预约上门检测', confidence: 0.9 },
];

const defaultSummary =
  'T10 学习机使用约 10 个月后出现掉电速度明显加快，连续使用 2 小时提示低电量。保修有效，建议先自检电池健康度，异常则安排上门检测，客户认同方案。';

type TicketSummaryModalProps = {
  isOpen: boolean;
  ticketId?: string;
  customerName?: string;
  onClose: () => void;
};

export default function TicketSummaryModal({
  isOpen,
  ticketId = 'WO-202604-0412',
  customerName = '王同学',
  onClose,
}: TicketSummaryModalProps) {
  const [fields, setFields] = useState<AIField[]>(defaultFields);
  const [summary, setSummary] = useState(defaultSummary);

  const confidenceTone = (v: number) =>
    v >= 0.9
      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
      : v >= 0.8
        ? 'bg-amber-50 text-amber-600 border-amber-200'
        : 'bg-rose-50 text-rose-600 border-rose-200';

  return (
    <FloatingPanel
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          工单小结
          <span className="inline-flex items-center gap-1 rounded-full border border-accent-200 bg-accent-50 px-1.5 py-0.5 text-[10px] font-semibold text-accent-600">
            <Sparkles size={10} />
            AI
          </span>
        </span>
      }
      subtitle={`${ticketId} · ${customerName}`}
      accent="accent"
      width={480}
      maxHeight={520}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg border border-hairline bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-brand-200 hover:text-brand-600"
          >
            暂存
          </button>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring press-lift rounded-lg bg-gradient-to-r from-accent-500 to-accent-400 px-4 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(16,185,129,0.5)]"
          >
            提交
          </button>
        </>
      }
    >
      {/* AI fields */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-700">AI 提取字段</span>
        <button
          type="button"
          onClick={() => setFields(defaultFields)}
          className="focus-ring inline-flex items-center gap-1 rounded-full border border-hairline bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:border-brand-200 hover:text-brand-600"
        >
          <RefreshCw size={10} />
          重新生成
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f, idx) => {
          const isProblemCategory = f.label === '问题分类';
          const [level1, level2] = isProblemCategory ? f.value.split('/') : [f.value, ''];
          const level2Options = (isProblemCategory && level1 && problemCategoryLevel2Options[level1]) || [];

          return (
            <div
              key={f.label}
              className="rounded-lg border border-hairline bg-slate-50/50 px-2.5 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{f.label}</span>
                <span
                  className={cn(
                    'rounded-full border px-1.5 py-0 text-[10px] font-semibold tabular-nums',
                    confidenceTone(f.confidence)
                  )}
                >
                  {Math.round(f.confidence * 100)}%
                </span>
              </div>
              {isProblemCategory ? (
                <div className="mt-1 flex gap-1.5">
                  <input
                    value={level1}
                    onChange={(e) => {
                      const next = [...fields];
                      const newLevel1 = e.target.value;
                      const newLevel2Options = problemCategoryLevel2Options[newLevel1] || [];
                      const keepLevel2 = newLevel2Options.includes(level2) ? level2 : '';
                      next[idx] = { ...f, value: keepLevel2 ? `${newLevel1}/${keepLevel2}` : newLevel1 };
                      setFields(next);
                    }}
                    className="focus-ring h-7 w-0 flex-1 rounded-md border border-hairline bg-white px-2 text-[12px] font-semibold text-slate-700 outline-none focus:border-brand-400"
                  />
                  <div className="relative w-0 flex-1">
                    <select
                      value={level2}
                      onChange={(e) => {
                        const next = [...fields];
                        next[idx] = { ...f, value: e.target.value ? `${level1}/${e.target.value}` : level1 };
                        setFields(next);
                      }}
                      className="focus-ring h-7 w-full appearance-none rounded-md border border-hairline bg-white px-2 pr-6 text-[12px] font-semibold text-slate-700 outline-none focus:border-brand-400"
                    >
                      <option value="">请选择</option>
                      {level2Options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              ) : (
                <input
                  value={f.value}
                  onChange={(e) => {
                    const next = [...fields];
                    next[idx] = { ...f, value: e.target.value };
                    setFields(next);
                  }}
                  className="focus-ring mt-1 h-7 w-full rounded-md border border-hairline bg-white px-2 text-[12px] font-semibold text-slate-700 outline-none focus:border-brand-400"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-3">
        <span className="text-[12px] font-semibold text-slate-700">对话摘要</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className="focus-ring mt-1 w-full resize-none rounded-lg border border-hairline bg-slate-50/50 px-2.5 py-2 text-[12px] leading-5 text-slate-700 outline-none focus:border-brand-400 focus:bg-white"
        />
      </div>
    </FloatingPanel>
  );
}
