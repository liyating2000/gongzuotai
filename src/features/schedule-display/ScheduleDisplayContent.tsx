import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '../../lib/cn';
import { scheduleDisplayRows } from './data';

export default function ScheduleDisplayContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f9fc]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-2">
        <div className="flex items-center gap-8 border-b border-slate-100 bg-white px-4 text-[14px]">
          <button type="button" className="border-b-2 border-transparent py-3 text-slate-500 transition-colors hover:text-slate-700">
            日历模式
          </button>
          <button type="button" className="border-b-2 border-[#18c2a7] py-3 font-medium text-[#18c2a7]">
            列表模式
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-[10px] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-500">
              <span className="font-medium text-slate-600">时间范围</span>
              <div className="flex h-9 w-[168px] items-center rounded-md border border-slate-200 bg-white px-3 text-slate-400">
                开始日期
                <Calendar size={14} className="ml-auto text-slate-300" />
              </div>
              <div className="flex h-9 w-[168px] items-center rounded-md border border-slate-200 bg-white px-3 text-slate-400">
                结束日期
                <Calendar size={14} className="ml-auto text-slate-300" />
              </div>
              <label className="ml-2 flex items-center gap-2 text-[13px] text-slate-600">
                <input type="checkbox" className="h-3.5 w-3.5 accent-[#19c5aa]" />
                仅查询正常值班信息
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-full border border-[#89dccd] bg-[#f1fbf8] px-5 py-1.5 text-[13px] font-medium text-[#18bda3] transition-colors hover:bg-[#e5f8f3]">
                查询
              </button>
              <button type="button" className="rounded-full border border-slate-200 bg-white px-5 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-50">
                重置
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-5 px-4 py-3 text-[13px] font-medium text-slate-500">
            <span>值班 53</span>
            <span>请假 0</span>
            <span>换班 0</span>
            <span>改班 0</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-3 custom-scrollbar">
            <div className="overflow-hidden rounded-[10px] border border-slate-100">
              <table className="min-w-full table-fixed text-left">
                <thead className="bg-[#fafafa] text-[13px] text-slate-600">
                  <tr>
                    <th className="w-[72px] px-5 py-3 font-medium">序号</th>
                    <th className="w-[138px] px-4 py-3 font-medium">类型</th>
                    <th className="w-[140px] px-4 py-3 font-medium">班次名称</th>
                    <th className="w-[136px] px-4 py-3 font-medium">开始时间</th>
                    <th className="w-[136px] px-4 py-3 font-medium">结束时间</th>
                    <th className="w-[140px] px-4 py-3 font-medium">申请理由</th>
                    <th className="w-[140px] px-4 py-3 font-medium">审批结果</th>
                    <th className="w-[140px] px-4 py-3 font-medium">审批意见</th>
                    <th className="w-[130px] px-4 py-3 font-medium">是否撤销</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-slate-600">
                  {scheduleDisplayRows.map((row, index) => (
                    <tr key={row.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]')}>
                      <td className="px-5 py-3">{row.id}</td>
                      <td className="px-4 py-3">{row.type}</td>
                      <td className="px-4 py-3">{row.shiftName}</td>
                      <td className="px-4 py-3">{row.startDate}</td>
                      <td className="px-4 py-3">{row.endDate}</td>
                      <td className="px-4 py-3">{row.applyReason}</td>
                      <td className="px-4 py-3">{row.approvalResult}</td>
                      <td className="px-4 py-3">{row.approvalComment}</td>
                      <td className="px-4 py-3">{row.revoked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-3 text-[13px] text-slate-500">
            <span>共53条记录</span>
            <button type="button" className="flex h-7 min-w-[28px] items-center justify-center rounded-md border border-[#8fe0d2] bg-[#f0fbf8] px-2 text-[#19bca2]">
              1
            </button>
            <button type="button" className="flex h-7 min-w-[28px] items-center justify-center rounded-md border border-slate-200 bg-white px-2 hover:bg-slate-50">
              2
            </button>
            <button type="button" className="flex h-7 min-w-[28px] items-center justify-center rounded-md border border-slate-200 bg-white px-2 hover:bg-slate-50">
              3
            </button>
            <span>...</span>
            <button type="button" className="flex h-7 min-w-[28px] items-center justify-center rounded-md border border-slate-200 bg-white px-2 hover:bg-slate-50">
              6
            </button>
            <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50">
              <ChevronRight size={14} />
            </button>
            <button type="button" className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              10 条/页
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <span>跳至</span>
              <input type="text" className="h-8 w-12 rounded-md border border-slate-200 px-2 outline-none" />
              <span>页</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
