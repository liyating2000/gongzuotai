import { useState } from 'react';
import { cn } from '../../lib/cn';

type BusyAnnouncement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  scope: string;
};

const initialData: BusyAnnouncement[] = [
  { id: '1', title: '双11繁忙提示', content: '当前为业务高峰期，等待时间可能较长，感谢您的耐心。', createdAt: '2025-04-29 11:15:14', updatedAt: '2025-04-29 11:15:14', status: true, scope: '5个渠道' },
  { id: '2', title: '系统维护公告', content: '系统将于今晚22:00进行维护，请提前保存工作。', createdAt: '2025-04-28 09:30:00', updatedAt: '2025-04-28 09:30:00', status: false, scope: '3个渠道' },
  { id: '3', title: '节假日服务调整', content: '国庆期间服务时间调整为9:00-18:00。', createdAt: '2025-04-25 14:00:00', updatedAt: '2025-04-25 14:00:00', status: true, scope: '全部渠道' },
];

type DialogType = 'add' | 'edit' | 'view' | null;

export default function BusyAnnouncementContent() {
  const [data, setData] = useState(initialData);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [editingItem, setEditingItem] = useState<BusyAnnouncement | null>(null);

  const filtered = data.filter(d => {
    if (searchKeyword && !d.title.includes(searchKeyword)) return false;
    return true;
  });

  const toggleStatus = (id: string) => setData(prev => prev.map(d => d.id === id ? { ...d, status: !d.status } : d));
  const handleDelete = (id: string) => setData(prev => prev.filter(d => d.id !== id));
  const handleBatchDelete = () => { setData(prev => prev.filter(d => !selectedIds.includes(d.id))); setSelectedIds([]); };
  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };
  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(d => d.id) : []);
  };
  const handleReset = () => { setSearchKeyword(''); setDateFrom(''); setDateTo(''); };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-5 pb-5 pt-4 custom-scrollbar">
        <div className="overflow-hidden rounded-[18px] border border-hairline bg-white shadow-[0_1px_2px_rgba(15,23,42,.04),0_4px_12px_rgba(15,23,42,.04)]">

          {/* 搜索区域 */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline px-5 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-[13px] text-slate-500">
                <span className="whitespace-nowrap">公告标题:</span>
                <input type="text" placeholder="请输入公告标题" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                  className="h-[38px] w-[220px] rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] outline-none transition-colors focus:border-brand-400 focus:bg-white" />
              </div>
              <div className="flex items-center gap-2 text-[13px] text-slate-500">
                <span className="whitespace-nowrap">创建时间:</span>
                <input type="datetime-local" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="h-[38px] w-[180px] rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] outline-none focus:border-brand-400" />
                <span className="text-slate-400">—</span>
                <input type="datetime-local" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="h-[38px] w-[180px] rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] outline-none focus:border-brand-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleReset} className="focus-ring h-[38px] rounded-xl border border-hairline bg-white px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">重置</button>
              <button type="button" className="focus-ring h-[38px] rounded-xl border border-brand-200 bg-brand-50/60 px-4 text-[13px] font-semibold text-brand-600 hover:bg-brand-100/60">查询</button>
            </div>
          </div>

          {/* 操作按钮区域 */}
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-5 py-3">
            <button type="button" onClick={() => { setEditingItem(null); setDialog('add'); }}
              className="focus-ring press-lift h-[38px] rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]">新增</button>
            <button type="button" onClick={handleBatchDelete} disabled={selectedIds.length === 0}
              className={cn('focus-ring h-[38px] rounded-xl border px-4 text-[13px] font-semibold transition-colors',
                selectedIds.length > 0 ? 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50' : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed')}>
              批量删除
            </button>
          </div>

          {/* 表格区域 */}
          <div className="min-h-0 overflow-auto px-5 pb-4 pt-3 custom-scrollbar">
            <table className="min-w-full table-fixed text-left">
              <thead className="bg-slate-50/90 text-[13px] text-slate-600">
                <tr>
                  <th className="w-12 px-4 py-3 font-medium"><input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={e => toggleSelectAll(e.target.checked)} className="h-4 w-4 cursor-pointer accent-brand-500" /></th>
                  <th className="w-16 px-4 py-3 font-medium">序号</th>
                  <th className="px-4 py-3 font-medium">公告标题</th>
                  <th className="px-4 py-3 font-medium">创建时间</th>
                  <th className="px-4 py-3 font-medium">更新时间</th>
                  <th className="w-20 px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">生效范围</th>
                  <th className="w-48 px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {filtered.map((item, index) => (
                  <tr key={item.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e => toggleSelect(item.id, e.target.checked)} className="h-4 w-4 cursor-pointer accent-brand-500" /></td>
                    <td className="tabular-nums px-4 py-4">{item.id}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">{item.title}</td>
                    <td className="tabular-nums px-4 py-4">{item.createdAt}</td>
                    <td className="tabular-nums px-4 py-4">{item.updatedAt}</td>
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => toggleStatus(item.id)}
                        className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', item.status ? 'bg-brand-500' : 'bg-slate-300')}>
                        <span className={cn('inline-block h-4 w-4 rounded-full bg-white transition-transform', item.status ? 'translate-x-6' : 'translate-x-1')} />
                      </button>
                    </td>
                    <td className="px-4 py-4">{item.scope}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => { setEditingItem(item); setDialog('edit'); }} className="text-brand-600 hover:text-brand-700">编辑</button>
                        <button type="button" className="text-brand-600 hover:text-brand-700">应用</button>
                        <button type="button" onClick={() => { setEditingItem(item); setDialog('view'); }} className="text-brand-600 hover:text-brand-700">查看</button>
                        <button type="button" onClick={() => handleDelete(item.id)} className="text-brand-600 hover:text-brand-700">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-8 pt-[10vh] backdrop-blur-[3px]" onClick={() => setDialog(null)}>
          <div className="w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <h2 className="text-[16px] font-bold text-slate-800">{dialog === 'add' ? '新增公告' : dialog === 'edit' ? '编辑公告' : '查看公告'}</h2>
              <button type="button" onClick={() => setDialog(null)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </header>
            <div className="space-y-4 px-6 py-5">
              <label className="block"><span className="text-[13px] font-medium text-slate-700">公告标题</span>
                <input type="text" defaultValue={editingItem?.title ?? ''} readOnly={dialog === 'view'} className="mt-1 w-full rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] outline-none focus:border-brand-400" />
              </label>
              <label className="block"><span className="text-[13px] font-medium text-slate-700">公告内容</span>
                <textarea rows={6} defaultValue={editingItem?.content ?? ''} readOnly={dialog === 'view'} className="mt-1 w-full rounded-xl border border-hairline bg-slate-50/60 px-3 py-2 text-[13px] outline-none focus:border-brand-400" />
              </label>
              {dialog !== 'view' && (
                <div className="flex justify-end gap-2 border-t border-hairline pt-4">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-xl border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-slate-600">取消</button>
                  <button type="button" onClick={() => setDialog(null)} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]">保存</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
