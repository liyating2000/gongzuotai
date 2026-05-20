import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import {
  businessFieldLaunchReviewTableRows,
  type BusinessFieldLaunchReviewTableRow,
} from './data';
import { cn } from '../../lib/cn';

const actionClassNameMap = {
  查看: 'text-[#2ac7b2] hover:text-[#18bca2]',
  批准: 'text-[#2ac7b2] hover:text-[#18bca2]',
  驳回: 'text-[#2ac7b2] hover:text-[#18bca2]',
} as const;

const formatLocalReviewTime = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default function BusinessFieldLaunchReviewContent() {
  const [reviewRows, setReviewRows] = useState<BusinessFieldLaunchReviewTableRow[]>(
    () => businessFieldLaunchReviewTableRows.map((row) => ({ ...row }))
  );
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const selectedReview = selectedReviewId === null ? null : reviewRows.find((row) => row.id === selectedReviewId) ?? null;

  const handleUpdateStatus = (rowId: number, nextStatus: '已批准' | '已驳回') => {
    const reviewedAt = formatLocalReviewTime();

    setReviewRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          status: nextStatus,
          approvedAt: nextStatus === '已批准' ? reviewedAt : '-',
          rejectedAt: nextStatus === '已驳回' ? reviewedAt : '-',
          actions: ['查看'],
        };
      })
    );
    setSelectedReviewId(null);
  };

  const handleActionClick = (row: BusinessFieldLaunchReviewTableRow, action: (typeof row.actions)[number]) => {
    if (action === '查看') {
      setSelectedReviewId(row.id);
      return;
    }

    if (action === '批准') {
      handleUpdateStatus(row.id, '已批准');
      return;
    }

    handleUpdateStatus(row.id, '已驳回');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f9fc]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-2">
        <div className="min-h-0 flex-1 overflow-auto bg-white px-[28px] pb-8 pt-[24px] custom-scrollbar">
          {selectedReview ? (
            <LaunchReviewDetailPanel
              row={selectedReview}
              onBack={() => setSelectedReviewId(null)}
              onApprove={() => handleUpdateStatus(selectedReview.id, '已批准')}
              onReject={() => handleUpdateStatus(selectedReview.id, '已驳回')}
            />
          ) : (
            <LaunchReviewTablePanel rows={reviewRows} onActionClick={handleActionClick} />
          )}
        </div>
      </div>
    </div>
  );
}

function LaunchReviewTablePanel({
  rows,
  onActionClick,
}: {
  rows: readonly BusinessFieldLaunchReviewTableRow[];
  onActionClick: (row: BusinessFieldLaunchReviewTableRow, action: BusinessFieldLaunchReviewTableRow['actions'][number]) => void;
}) {
  return (
    <>
      <div className="pb-[26px]">
        <h2 className="text-[18px] font-semibold leading-none text-[#273142]">业务字段上线审核</h2>
      </div>

      <div className="min-h-0 overflow-hidden rounded-[8px] border border-[#e7edf3] bg-white">
        <div className="min-h-0 overflow-auto custom-scrollbar">
          <table className="w-full min-w-[1088px] table-fixed whitespace-nowrap text-center">
            <thead className="bg-[#fafcfe] text-[13px] text-slate-600">
              <tr>
                <th className="w-[64px] px-4 py-3 text-center font-medium whitespace-nowrap">序号</th>
                <th className="w-[228px] px-4 py-3 text-center font-medium whitespace-nowrap">申请内容</th>
                <th className="w-[92px] px-4 py-3 text-center font-medium whitespace-nowrap">申请人</th>
                <th className="w-[132px] px-4 py-3 text-center font-medium whitespace-nowrap">申请时间</th>
                <th className="w-[132px] px-4 py-3 text-center font-medium whitespace-nowrap">批准时间</th>
                <th className="w-[132px] px-4 py-3 text-center font-medium whitespace-nowrap">驳回时间</th>
                <th className="w-[90px] px-4 py-3 text-center font-medium whitespace-nowrap">状态</th>
                <th className="w-[140px] px-4 py-3 text-center font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {rows.map((row, index) => (
                <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfd]')}>
                  <td className="px-4 py-4 text-center font-medium text-slate-700 whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">{row.content}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">{row.applicant}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">{row.appliedAt}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">{row.approvedAt}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">{row.rejectedAt}</td>
                  <td className="px-4 py-4 text-center text-slate-700 whitespace-nowrap">{row.status}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-6 whitespace-nowrap">
                      {row.actions.map((action) => (
                        <button
                          key={`${row.id}-${action}`}
                          type="button"
                          onClick={() => onActionClick(row, action)}
                          className={cn('whitespace-nowrap transition-colors', actionClassNameMap[action])}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LaunchReviewDetailPanel({
  row,
  onBack,
  onApprove,
  onReject,
}: {
  row: BusinessFieldLaunchReviewTableRow;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const showPendingActions = row.actions.includes('批准') || row.actions.includes('驳回');

  return (
    <div className="min-h-full">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-[2px] text-[18px] font-semibold leading-none text-[#273142] transition-colors hover:text-slate-600"
      >
        <ChevronLeft size={18} strokeWidth={2.2} />
        <span>审核详情</span>
      </button>

      <div className="pt-[26px] text-[13px] text-[#2f343b]">
        <div className="mb-[20px] flex items-start leading-[20px]">
          <span className="shrink-0">申请内容：</span>
          <span>{row.requestContent}</span>
        </div>
        <div className="mb-[20px] flex items-start leading-[20px]">
          <span className="shrink-0">申请理由：</span>
          <span>{row.requestReason}</span>
        </div>
        <div className="mb-[20px] flex items-start leading-[20px]">
          <span className="shrink-0">申请人：</span>
          <span>{row.applicant}</span>
        </div>
        <div className="mb-[20px] flex items-start leading-[20px]">
          <span className="shrink-0">申请时间：</span>
          <span>{row.appliedAt}</span>
        </div>
        <div className="mb-[20px] flex items-start leading-[20px]">
          <span className="shrink-0">业务类型：</span>
          <span>{row.businessType}</span>
        </div>
        <div className="flex items-start leading-[20px]">
          <span className="shrink-0">版本变化：</span>
          <span>
            {row.versionBefore} -&gt; {row.versionAfter}
          </span>
        </div>

        {showPendingActions ? (
          <div className="flex items-center gap-[8px] pt-[42px]">
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-[28px] min-w-[68px] items-center justify-center rounded-full border border-[#d9dfe6] bg-white px-5 text-[13px] text-[#6b7280] transition-colors hover:bg-slate-50"
            >
              驳回
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex h-[28px] min-w-[68px] items-center justify-center rounded-full border border-[#8fe0d2] bg-[#e7f7f2] px-5 text-[13px] text-[#20bea9] transition-colors hover:bg-[#dcf4ee]"
            >
              批准
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
