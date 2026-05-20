import { ArrowLeft, Download } from 'lucide-react';

import { cn } from '../../lib/cn';
import { managerOverviewTableRows } from './data';
import {
  portalBackButtonClassName,
  portalDetailCardClassName,
  portalDetailHeaderClassName,
  portalExportButtonClassName,
  portalMintTableHeadClassName,
  portalScrollableTableWrapClassName,
  portalTableBodyClassName,
} from './portalStyles';

type ManagerOverviewDetailContentProps = {
  onBack: () => void;
};

export default function ManagerOverviewDetailContent({
  onBack,
}: ManagerOverviewDetailContentProps) {
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
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className={cn('h-full', portalScrollableTableWrapClassName)}>
          <table className="min-w-full table-auto text-left">
            <thead className={portalMintTableHeadClassName}>
              <tr>
                <th className="whitespace-nowrap px-4 py-3.5">员工名称</th>
                <th className="whitespace-nowrap px-4 py-3.5">工作组</th>
                <th className="whitespace-nowrap px-4 py-3.5">呼入接起量</th>
                <th className="whitespace-nowrap px-4 py-3.5">呼出量</th>
                <th className="whitespace-nowrap px-4 py-3.5">呼出接起量</th>
                <th className="whitespace-nowrap px-4 py-3.5">问题参评率</th>
                <th className="whitespace-nowrap px-4 py-3.5">客户满意度</th>
                <th className="whitespace-nowrap px-4 py-3.5">问题解决率</th>
              </tr>
            </thead>
            <tbody className={portalTableBodyClassName}>
              {managerOverviewTableRows.map((row, index) => (
                <tr
                  key={`${row.employeeName}-${row.workgroup}-${index}`}
                  className={cn(
                    'border-t border-hairline transition-colors hover:bg-brand-50/40',
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  )}
                >
                  <td className="px-4 py-4 font-medium text-slate-800">{row.employeeName}</td>
                  <td className="px-4 py-4 text-slate-600">{row.workgroup}</td>
                  <td className="px-4 py-4">{row.inboundAnswered}</td>
                  <td className="px-4 py-4">{row.outboundVolume}</td>
                  <td className="px-4 py-4">{row.outboundAnswered}</td>
                  <td className="px-4 py-4">{row.issueParticipationRate}</td>
                  <td className="px-4 py-4">{row.customerSatisfaction}</td>
                  <td className="px-4 py-4">{row.issueResolutionRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
