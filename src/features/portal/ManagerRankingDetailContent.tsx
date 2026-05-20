import { ArrowLeft, Download } from 'lucide-react';

import { cn } from '../../lib/cn';
import {
  portalBackButtonClassName,
  portalDetailCardClassName,
  portalDetailHeaderClassName,
  portalExportButtonClassName,
  portalMintTableHeadClassName,
  portalScrollableTableWrapClassName,
  portalTableBodyClassName,
} from './portalStyles';

const rankingDetailList = [
  { rank: 1, workGroup: '学习机', jobId: '10001', name: '张三', personalSatisfaction: '99%', avgSatisfaction: '100%' },
  { rank: 2, workGroup: '学习机', jobId: '10002', name: '李四', personalSatisfaction: '98%', avgSatisfaction: '100%' },
  { rank: 3, workGroup: '学习机', jobId: '10003', name: '王五', personalSatisfaction: '97%', avgSatisfaction: '99%' },
  { rank: 4, workGroup: '学习机', jobId: '10004', name: '赵六', personalSatisfaction: '96%', avgSatisfaction: '99%' },
  { rank: 5, workGroup: '学习机', jobId: '10005', name: '孙七', personalSatisfaction: '95%', avgSatisfaction: '98%' },
  { rank: 6, workGroup: '学习机', jobId: '10006', name: '周八', personalSatisfaction: '94%', avgSatisfaction: '98%' },
  { rank: 7, workGroup: '学习机', jobId: '10007', name: '吴九', personalSatisfaction: '93%', avgSatisfaction: '97%' },
  { rank: 8, workGroup: '学习机', jobId: '10008', name: '郑十', personalSatisfaction: '92%', avgSatisfaction: '97%' },
  { rank: 9, workGroup: '智能硬件', jobId: '10009', name: '冯磊', personalSatisfaction: '91%', avgSatisfaction: '96%' },
  { rank: 10, workGroup: '智能硬件', jobId: '10010', name: '陈芳', personalSatisfaction: '90%', avgSatisfaction: '96%' },
  { rank: 11, workGroup: '智能硬件', jobId: '10011', name: '褚伟', personalSatisfaction: '89%', avgSatisfaction: '95%' },
  { rank: 12, workGroup: '智能硬件', jobId: '10012', name: '卫娜', personalSatisfaction: '88%', avgSatisfaction: '95%' },
  { rank: 13, workGroup: '医疗', jobId: '10013', name: '蒋洋', personalSatisfaction: '87%', avgSatisfaction: '94%' },
  { rank: 14, workGroup: '医疗', jobId: '10014', name: '沈敏', personalSatisfaction: '86%', avgSatisfaction: '94%' },
  { rank: 15, workGroup: '医疗', jobId: '10015', name: '韩勇', personalSatisfaction: '85%', avgSatisfaction: '93%' },
  { rank: 16, workGroup: '法院', jobId: '10016', name: '杨静', personalSatisfaction: '84%', avgSatisfaction: '93%' },
] as const;

type ManagerRankingDetailContentProps = {
  onBack: () => void;
};

const half = Math.ceil(rankingDetailList.length / 2);
const leftList = rankingDetailList.slice(0, half);
const rightList = rankingDetailList.slice(half);
const tableHeaders = ['序号', '工作组', '工号', '姓名', '个人满意度', '平均满意度'] as const;

function RankingTable({
  rows,
}: {
  rows: readonly (typeof rankingDetailList)[number][];
}) {
  return (
    <div className={portalScrollableTableWrapClassName}>
      <table className="min-w-full table-auto text-left">
        <thead className={portalMintTableHeadClassName}>
          <tr>
            {tableHeaders.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-3"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={portalTableBodyClassName}>
          {rows.map((item, index) => {
            const isTop3 = item.rank <= 3;
            return (
              <tr
                key={`${item.rank}-${item.jobId}`}
                className={cn(
                  'border-t border-hairline transition-colors hover:bg-brand-50/40',
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                )}
              >
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[12px] font-bold',
                      isTop3
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_4px_10px_-2px_rgba(245,158,11,0.45)]'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {item.rank}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.workGroup}</td>
                <td className="px-4 py-3">{item.jobId}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3 font-semibold text-brand-600">{item.personalSatisfaction}</td>
                <td className="px-4 py-3 text-slate-500">{item.avgSatisfaction}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ManagerRankingDetailContent({ onBack }: ManagerRankingDetailContentProps) {
  return (
    <div className={portalDetailCardClassName}>
      <div className={portalDetailHeaderClassName}>
        <button
          type="button"
          onClick={onBack}
          className={portalBackButtonClassName}
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <button
          type="button"
          className={portalExportButtonClassName}
        >
          <Download size={14} />
          导出
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-2">
        <RankingTable rows={leftList} />
        <RankingTable rows={rightList} />
      </div>
    </div>
  );
}
