import { useState } from 'react';
import { Plus, Search, Trash2, Edit3, Settings } from 'lucide-react';
import { cn } from '../../lib/cn';

type Section = '系统' | '工作组/队列' | '渠道维护' | '员工快捷检索' | '产品维护' | '访问地址' | '终端' | '操作日志';

const actions = [
  '刷新队列中员工缓存',
  '刷新工作组队列缓存',
  '刷新系统参数缓存',
  '刷新脏词库',
  '刷新满意度',
  '刷新属性配置缓存',
  '刷新员工状态',
] as const;

const tabs: Section[] = ['系统', '工作组/队列', '渠道维护', '员工快捷检索', '产品维护', '访问地址', '终端', '操作日志'];

const productRows = [
  { id: '1', cat: '教育', name: '学习机', src: '讯飞官网', robot: '智能客服A', robotType: '在线', robotId: 'R-001' },
  { id: '2', cat: '翻译', name: '翻译笔T1', src: '天猫旗舰店', robot: '智能客服B', robotType: '在线', robotId: 'R-002' },
  { id: '3', cat: '办公', name: '录音笔', src: '京东自营', robot: '智能客服C', robotType: '在线', robotId: 'R-003' },
  { id: '4', cat: '智能硬件', name: '智能音箱', src: '讯飞商城', robot: '智能客服D', robotType: '在线', robotId: 'R-004' },
];

const queueRows = [
  { id: '1', name: 'VIP服务组', members: 8, maxConcurrent: 5, routeMode: '轮询', status: true },
  { id: '2', name: '普通服务组', members: 15, maxConcurrent: 3, routeMode: '最少会话', status: true },
  { id: '3', name: '投诉处理组', members: 5, maxConcurrent: 2, routeMode: '技能优先', status: false },
];

const channelRows = [
  { id: '1', name: '微信服务号', type: '微信', status: true, queue: 'VIP服务组', createdAt: '2024-10-01' },
  { id: '2', name: '微信小程序', type: '微信', status: true, queue: '普通服务组', createdAt: '2024-10-01' },
  { id: '3', name: 'Web端', type: 'Web', status: true, queue: '普通服务组', createdAt: '2024-09-15' },
  { id: '4', name: '移动端APP', type: 'APP', status: true, queue: '普通服务组', createdAt: '2024-09-20' },
  { id: '5', name: '抖音', type: '抖音', status: false, queue: '普通服务组', createdAt: '2024-10-05' },
];

const logRows = [
  { id: '1', time: '2025-04-29 14:30:12', user: '管理员A', action: '修改渠道配置', detail: '更新微信服务号队列为VIP服务组', ip: '10.23.12.5' },
  { id: '2', time: '2025-04-29 11:15:00', user: '管理员B', action: '新增产品', detail: '添加产品"智能音箱"', ip: '10.23.12.8' },
  { id: '3', time: '2025-04-28 16:20:45', user: '管理员A', action: '修改工作组', detail: '投诉处理组停用', ip: '10.23.12.5' },
  { id: '4', time: '2025-04-28 09:00:00', user: '系统', action: '自动巡检', detail: '全渠道健康检查通过', ip: '127.0.0.1' },
];

export default function WebchatMaintenanceContent() {
  const [activeTab, setActiveTab] = useState<Section>('产品维护');
  const [activeCat, setActiveCat] = useState('学习机');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-5 pb-5 pt-4 custom-scrollbar">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-hairline bg-white shadow-[0_1px_2px_rgba(15,23,42,.04),0_4px_12px_rgba(15,23,42,.04)]">

          {/* Top action buttons row */}
          <div className="flex flex-wrap gap-2.5 border-b border-hairline px-5 py-3">
            {actions.map(item => (
              <button key={item} type="button"
                className="focus-ring rounded-full border border-brand-200 bg-white px-4 py-2 text-[13px] font-medium text-brand-600 transition-colors hover:bg-brand-50">
                {item}
              </button>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-8 border-b border-hairline px-5 text-[14px]">
            {tabs.map(tab => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={cn('border-b-2 py-4 font-medium transition-colors',
                  activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-600 hover:text-slate-800')}>
                {tab}
              </button>
            ))}
          </div>

          {/* Content area */}
          {activeTab === '产品维护' ? (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Left: category list */}
              <div className="flex w-[260px] shrink-0 flex-col border-r border-hairline bg-slate-50/30">
                <div className="border-b border-hairline px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="搜索分类" className="focus-ring h-[38px] w-full rounded-xl border border-hairline bg-white pl-9 pr-3 text-[13px] outline-none focus:border-brand-400" /></div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto px-3 py-3 custom-scrollbar">
                  {['学习机', '翻译笔', '录音笔', '智能音箱', '打印机'].map(cat => (
                    <button key={cat} type="button" className={cn('flex w-full items-center rounded-xl px-4 py-2.5 text-left text-[14px] transition-colors', activeCat === cat ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50')} onClick={() => setActiveCat(cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {/* Right: product table */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
                <div className="border-b border-hairline px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="font-medium text-slate-700">产品名称:</span>
                      <input type="text" placeholder="请输入产品名称" className="focus-ring h-[38px] w-[220px] rounded-xl border border-hairline bg-slate-50/60 px-3 text-[13px] outline-none focus:border-brand-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="focus-ring rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2 text-[13px] font-semibold text-brand-600 hover:bg-brand-100/60">查询</button>
                      <button type="button" className="focus-ring rounded-xl border border-hairline bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">重置</button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" className="focus-ring press-lift rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]">新增</button>
                    <button type="button" className="focus-ring rounded-xl border border-brand-200 bg-white px-4 py-2 text-[13px] font-semibold text-brand-600 hover:bg-brand-50">同步</button>
                    <button type="button" className="focus-ring rounded-xl border border-brand-200 bg-white px-4 py-2 text-[13px] font-semibold text-brand-600 hover:bg-brand-50">批量操作 ▾</button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-auto px-5 pb-4 pt-3 custom-scrollbar">
                  <div className="overflow-hidden rounded-xl border border-hairline">
                    <table className="w-full text-[13px]">
                      <thead className="bg-slate-50/90 text-slate-600">
                        <tr>
                          <th className="w-[50px] px-4 py-3 font-medium"><input type="checkbox" className="h-4 w-4 accent-brand-500" /></th>
                          {['序号', '产品名称', '产品图片', '来源', '机器人名称', '机器人种类', '机器人Aid', '操作'].map(h => (
                            <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-[13px] font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {productRows.map((r, i) => (
                          <tr key={r.id} className={cn('border-t border-hairline transition-colors hover:bg-brand-50/30', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                            <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 accent-brand-500" /></td>
                            <td className="tabular-nums px-3 py-3 text-slate-500">{i + 1}</td>
                            <td className="px-3 py-3 font-semibold text-slate-800">{r.name}</td>
                            <td className="px-3 py-3"><div className="h-10 w-10 rounded-lg bg-slate-100"></div></td>
                            <td className="px-3 py-3 text-slate-600">{r.src}</td>
                            <td className="px-3 py-3 text-slate-700">{r.robot}</td>
                            <td className="px-3 py-3"><span className="inline-flex items-center rounded-full border border-brand-200/70 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">{r.robotType}</span></td>
                            <td className="tabular-nums px-3 py-3 text-[12px] text-slate-500">{r.robotId}</td>
                            <td className="px-3 py-3"><div className="flex items-center gap-1 text-brand-600"><button type="button" className="text-[13px] hover:underline">配置</button><span className="text-slate-300">|</span><button type="button" className="text-[13px] hover:underline">编辑</button><span className="text-slate-300">|</span><button type="button" className="text-[13px] text-rose-500 hover:underline">删除</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === '工作组/队列' ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
                <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="搜索工作组..." className="focus-ring h-[38px] w-[240px] rounded-xl border border-hairline bg-slate-50/60 pl-9 pr-3 text-[13px] outline-none focus:border-brand-400" /></div>
                <button type="button" className="focus-ring press-lift flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]"><Plus size={14} /> 新增工作组</button>
              </div>
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur">
                  <tr className="border-b border-hairline">{['工作组名称', '成员数', '最大并发', '路由模式', '状态', '操作'].map(h => (<th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>))}</tr>
                </thead>
                <tbody>
                  {queueRows.map(r => (
                    <tr key={r.id} className="border-b border-hairline hover:bg-brand-50/30 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-800">{r.name}</td>
                      <td className="tabular-nums px-4 py-4 text-slate-700">{r.members}</td>
                      <td className="tabular-nums px-4 py-4 text-slate-700">{r.maxConcurrent}</td>
                      <td className="px-4 py-4 text-slate-600">{r.routeMode}</td>
                      <td className="px-4 py-4"><span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', r.status ? 'border border-emerald-200/70 bg-emerald-50 text-emerald-700' : 'border border-slate-200 bg-slate-50 text-slate-500')}>{r.status ? '启用' : '停用'}</span></td>
                      <td className="px-4 py-4"><div className="flex items-center gap-1"><button type="button" className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Edit3 size={14} /></button><button type="button" className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === '渠道维护' ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
                <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="搜索渠道..." className="focus-ring h-[38px] w-[240px] rounded-xl border border-hairline bg-slate-50/60 pl-9 pr-3 text-[13px] outline-none focus:border-brand-400" /></div>
                <button type="button" className="focus-ring press-lift flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(58,92,255,0.55)]"><Plus size={14} /> 新增渠道</button>
              </div>
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur">
                  <tr className="border-b border-hairline">{['渠道名称', '渠道类型', '分配队列', '创建时间', '状态', '操作'].map(h => (<th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>))}</tr>
                </thead>
                <tbody>
                  {channelRows.map(r => (
                    <tr key={r.id} className="border-b border-hairline hover:bg-brand-50/30 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-4 py-4 text-slate-600">{r.type}</td>
                      <td className="px-4 py-4 text-slate-700">{r.queue}</td>
                      <td className="tabular-nums px-4 py-4 text-[12px] text-slate-500">{r.createdAt}</td>
                      <td className="px-4 py-4"><span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', r.status ? 'border border-emerald-200/70 bg-emerald-50 text-emerald-700' : 'border border-slate-200 bg-slate-50 text-slate-500')}>{r.status ? '启用' : '停用'}</span></td>
                      <td className="px-4 py-4"><div className="flex items-center gap-1"><button type="button" className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Edit3 size={14} /></button><button type="button" className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Settings size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === '操作日志' ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
                <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="搜索操作日志..." className="focus-ring h-[38px] w-[240px] rounded-xl border border-hairline bg-slate-50/60 pl-9 pr-3 text-[13px] outline-none focus:border-brand-400" /></div>
              </div>
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur">
                  <tr className="border-b border-hairline">{['时间', '操作人', '操作类型', '操作详情', 'IP地址'].map(h => (<th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>))}</tr>
                </thead>
                <tbody>
                  {logRows.map(r => (
                    <tr key={r.id} className="border-b border-hairline hover:bg-brand-50/30 transition-colors">
                      <td className="tabular-nums whitespace-nowrap px-4 py-4 text-[12px] text-slate-500">{r.time}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{r.user}</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center rounded-full border border-brand-200/70 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">{r.action}</span></td>
                      <td className="px-4 py-4 text-slate-600">{r.detail}</td>
                      <td className="tabular-nums px-4 py-4 text-[12px] text-slate-400">{r.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50/30 p-6">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
                <div className="text-[18px] font-semibold text-slate-700">{activeTab}</div>
                <p className="mt-3 max-w-[360px] text-[13px] leading-6 text-slate-500">
                  当前仅实现"产品维护"等核心视图，其余二级页签保留为占位。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
