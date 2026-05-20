import { ArrowLeft, Download } from 'lucide-react';

import { cn } from '../../lib/cn';
import {
  portalBackButtonClassName,
  portalDetailCardClassName,
  portalDetailHeaderClassName,
  portalExportButtonClassName,
  portalGreenTableHeadClassName,
  portalScrollableTableWrapClassName,
  portalTableBodyClassName,
} from './portalStyles';
import {
  starEmployeeCommunicationRankingRows,
  starEmployeeSatisfactionRankingRows,
} from './data';

type AgentRankingDetailContentProps = {
  onBack: () => void;
};

export default function AgentRankingDetailContent({
  onBack,
}: AgentRankingDetailContentProps) {
  const tables = [
    {
      key: 'satisfaction',
      rows: starEmployeeSatisfactionRankingRows,
      valueLabel: '个人满意度',
      averageLabel: '平均满意度',
    },
    {
      key: 'communication',
      rows: starEmployeeCommunicationRankingRows,
      valueLabel: '沟通量',
      averageLabel: '平均沟通量',
    },
  ];

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
        {tables.map((table) => (
          <div key={table.key} className={portalScrollableTableWrapClassName}>
            <table className="min-w-full table-auto text-left">
              <thead className={portalGreenTableHeadClassName}>
                <tr>
                  <th className="px-4 py-3 font-medium">排名</th>
                  <th className="px-4 py-3 font-medium">工作组</th>
                  <th className="px-4 py-3 font-medium">工号</th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">{table.valueLabel}</th>
                  <th className="px-4 py-3 font-medium">{table.averageLabel}</th>
                </tr>
              </thead>
              <tbody className={portalTableBodyClassName}>
                {table.rows.map((row, index) => (
                  <tr
                    key={`${table.key}-${row.rank}-${row.employeeId}`}
                    className={cn(index % 2 === 0 ? 'bg-white' : 'bg-[#fbfcfb]')}
                  >
                    <td className="px-4 py-3">{row.rank}</td>
                    <td className="px-4 py-3">{row.workgroup}</td>
                    <td className="px-4 py-3">{row.employeeId}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.value}</td>
                    <td className="px-4 py-3">{row.averageValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
