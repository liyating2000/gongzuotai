export type ManagerGroupFilter = '全部' | '学习机' | '智能硬件' | '医疗' | '法院';
export type ManagerOnlineFilter = '在线' | '热线';
export type ManagerPersonnelDateOption = '昨日' | '上周' | '上月';
export type ManagerBusinessPeriodOption = '日' | '周' | '月';
export type PersonnelFocusMetric = 'satisfaction' | 'resolution';
export type StarEmployeeMetric = 'communication' | 'satisfaction';

export type ManagerOverviewMetricRow = {
  label: string;
  day: string;
  month: string;
  mom: string;
  yoy: string;
};

export type PersonnelRecord = {
  name: string;
  personal: string;
  group: string;
};

export type AgentRankingRow = {
  rank: number;
  workgroup: string;
  employeeId: string;
  name: string;
  value: string;
  averageValue: string;
};

export type ManagerOverviewDetailRow = {
  employeeName: string;
  workgroup: string;
  inboundAnswered: string;
  outboundVolume: string;
  outboundAnswered: string;
  issueParticipationRate: string;
  customerSatisfaction: string;
  issueResolutionRate: string;
};

export type StarEmployee = {
  name: string;
  rank: number;
  ribbonClassName: string;
  medalClassName: string;
  innerClassName: string;
  sparkleClassName: string;
};

export const managerGroupFilters: readonly ManagerGroupFilter[] = [
  '全部',
  '学习机',
  '智能硬件',
  '医疗',
  '法院',
];

export const managerOnlineFilters: readonly ManagerOnlineFilter[] = ['在线', '热线'];
export const managerMonthOptions = Array.from({ length: 12 }, (_, index) => `2026年${index + 1}月`);
export const managerPersonnelDateOptions: readonly ManagerPersonnelDateOption[] = ['昨日', '上周', '上月'];
export const managerBusinessPeriodOptions: readonly ManagerBusinessPeriodOption[] = ['日', '周', '月'];

export const getManagerOverviewMetricRows = (
  onlineFilter: ManagerOnlineFilter
): ManagerOverviewMetricRow[] => [
  { label: '服务满意度', day: '50', month: '50', mom: '+10%', yoy: '+10%' },
  { label: '解决率', day: '50%', month: '50%', mom: '+10%', yoy: '+10%' },
  { label: '参评率', day: '50%', month: '50%', mom: '+10%', yoy: '+10%' },
  { label: '接起率', day: '50%', month: '50%', mom: '+10%', yoy: '+10%' },
  ...(onlineFilter === '在线'
    ? [
        { label: '首次响应时间', day: '10s', month: '10s', mom: '-20%', yoy: '-20%' },
        { label: '平均响应时间', day: '1m20s', month: '1m20s', mom: '-20%', yoy: '-20%' },
      ]
    : []),
  { label: '日人均服务时长', day: '10h20m5s', month: '10h20m5s', mom: '-20%', yoy: '-20%' },
  { label: '日人均接待量', day: '100', month: '100', mom: '+10%', yoy: '+10%' },
];

export const trendData = [
  { name: '1', satisfaction: 32, resolution: 22, duration: 12 },
  { name: '2', satisfaction: 38, resolution: 30, duration: 18 },
  { name: '3', satisfaction: 42, resolution: 35, duration: 22 },
  { name: '4', satisfaction: 45, resolution: 40, duration: 28 },
  { name: '5', satisfaction: 40, resolution: 45, duration: 32 },
  { name: '6', satisfaction: 35, resolution: 52, duration: 28 },
  { name: '7', satisfaction: 30, resolution: 48, duration: 25 },
  { name: '8', satisfaction: 25, resolution: 42, duration: 22 },
  { name: '9', satisfaction: 40, resolution: 38, duration: 35 },
  { name: '10', satisfaction: 55, resolution: 45, duration: 42 },
  { name: '11', satisfaction: 48, resolution: 42, duration: 38 },
  { name: '12', satisfaction: 32, resolution: 35, duration: 22 },
  { name: '13', satisfaction: 38, resolution: 30, duration: 25 },
  { name: '14', satisfaction: 42, resolution: 38, duration: 28 },
  { name: '15', satisfaction: 45, resolution: 42, duration: 32 },
  { name: '16', satisfaction: 40, resolution: 50, duration: 48 },
  { name: '17', satisfaction: 35, resolution: 58, duration: 42 },
  { name: '18', satisfaction: 30, resolution: 52, duration: 35 },
  { name: '19', satisfaction: 25, resolution: 45, duration: 28 },
  { name: '20', satisfaction: 35, resolution: 48, duration: 32 },
  { name: '21', satisfaction: 45, resolution: 52, duration: 42 },
  { name: '22', satisfaction: 38, resolution: 45, duration: 35 },
  { name: '23', satisfaction: 32, resolution: 38, duration: 22 },
  { name: '24', satisfaction: 35, resolution: 42, duration: 28 },
  { name: '25', satisfaction: 42, resolution: 52, duration: 45 },
  { name: '26', satisfaction: 38, resolution: 48, duration: 40 },
  { name: '27', satisfaction: 30, resolution: 42, duration: 32 },
];

export const businessData = [
  { name: '1', volume: 35, manpower: 32 },
  { name: '2', volume: 32, manpower: 30 },
  { name: '3', volume: 38, manpower: 35 },
  { name: '4', volume: 42, manpower: 40 },
  { name: '5', volume: 35, manpower: 32 },
  { name: '6', volume: 28, manpower: 25 },
  { name: '7', volume: 22, manpower: 20 },
  { name: '8', volume: 35, manpower: 32 },
  { name: '9', volume: 45, manpower: 42 },
  { name: '10', volume: 58, manpower: 55 },
  { name: '11', volume: 48, manpower: 45 },
  { name: '12', volume: 32, manpower: 30 },
  { name: '13', volume: 28, manpower: 25 },
  { name: '14', volume: 35, manpower: 32 },
  { name: '15', volume: 42, manpower: 40 },
  { name: '16', volume: 38, manpower: 35 },
  { name: '17', volume: 32, manpower: 30 },
  { name: '18', volume: 28, manpower: 25 },
  { name: '19', volume: 35, manpower: 32 },
  { name: '20', volume: 42, manpower: 40 },
  { name: '21', volume: 38, manpower: 35 },
  { name: '22', volume: 32, manpower: 30 },
  { name: '23', volume: 28, manpower: 25 },
  { name: '24', volume: 35, manpower: 32 },
  { name: '25', volume: 42, manpower: 40 },
  { name: '26', volume: 38, manpower: 35 },
  { name: '27', volume: 32, manpower: 30 },
];

const personnelData: PersonnelRecord[] = [
  { name: '张三', personal: '30%', group: '50%' },
  { name: '李四', personal: '30%', group: '50%' },
  { name: '王武', personal: '30%', group: '50%' },
  { name: '张三', personal: '30%', group: '50%' },
  { name: '赵小帅', personal: '30%', group: '50%' },
  { name: '王武', personal: '30%', group: '50%' },
];

const personnelResolutionData: PersonnelRecord[] = [
  personnelData[2],
  personnelData[4],
  personnelData[1],
  personnelData[5],
  personnelData[0],
  personnelData[3],
];

export const getPersonnelRecords = (
  metric: PersonnelFocusMetric
): PersonnelRecord[] => (metric === 'satisfaction' ? personnelData : personnelResolutionData);

export const communicationStarEmployees: StarEmployee[] = [
  {
    name: '张小花',
    rank: 1,
    ribbonClassName: 'from-[#ffb347] to-[#ff7a45]',
    medalClassName: 'border-[#f8a81b] from-[#ffd95c] via-[#ffc82d] to-[#ffb400] text-[#d77a00]',
    innerClassName: 'border-[#f7c94a] from-[#ffe88e] to-[#ffc928]',
    sparkleClassName: 'bg-white/90',
  },
  {
    name: '孙之伊',
    rank: 2,
    ribbonClassName: 'from-[#79a7ff] to-[#4c7ee9]',
    medalClassName: 'border-[#a7b4d8] from-[#eef3ff] via-[#cfd8f3] to-[#aab7d5] text-[#6f7598]',
    innerClassName: 'border-[#d8dff1] from-[#f8fbff] to-[#c7d0eb]',
    sparkleClassName: 'bg-white/80',
  },
  {
    name: '王帅帅',
    rank: 3,
    ribbonClassName: 'from-[#ff9b93] to-[#ff6a62]',
    medalClassName: 'border-[#efb08f] from-[#ffe1d2] via-[#f8c8ab] to-[#eeb089] text-[#a95e35]',
    innerClassName: 'border-[#f7d8c8] from-[#fff0e6] to-[#f5c19c]',
    sparkleClassName: 'bg-white/75',
  },
];

export const createShuffledStarEmployees = (): StarEmployee[] => {
  const employeeCount = communicationStarEmployees.length;
  const rotatedNames = communicationStarEmployees.map(
    (_, index) => communicationStarEmployees[(index + 1) % employeeCount].name
  );

  return communicationStarEmployees.map((employee, index) => ({
    ...employee,
    name: rotatedNames[index],
  }));
};

export const starEmployeeSatisfactionRankingRows: AgentRankingRow[] = [
  { rank: 1, workgroup: '学习机组', employeeId: '1001', name: '张三', value: '50%', averageValue: '30%' },
  { rank: 2, workgroup: '学习机组', employeeId: '1002', name: '张三', value: '30%', averageValue: '30%' },
  { rank: 3, workgroup: '学习机组', employeeId: '1003', name: '张三', value: '30%', averageValue: '30%' },
  { rank: 4, workgroup: '学习机组', employeeId: '1004', name: '张三', value: '30%', averageValue: '30%' },
  { rank: 5, workgroup: '学习机组', employeeId: '1005', name: '张三', value: '30%', averageValue: '30%' },
  { rank: 6, workgroup: '学习机组', employeeId: '1006', name: '张三', value: '30%', averageValue: '30%' },
];

export const starEmployeeCommunicationRankingRows: AgentRankingRow[] = [
  { rank: 1, workgroup: '学习机组', employeeId: '1001', name: '张三', value: '50000', averageValue: '10000' },
  { rank: 2, workgroup: '学习机组', employeeId: '1002', name: '张三', value: '50000', averageValue: '10000' },
  { rank: 3, workgroup: '学习机组', employeeId: '1003', name: '张三', value: '50000', averageValue: '10000' },
  { rank: 4, workgroup: '学习机组', employeeId: '1004', name: '张三', value: '50000', averageValue: '10000' },
  { rank: 5, workgroup: '学习机组', employeeId: '1005', name: '张三', value: '50000', averageValue: '10000' },
  { rank: 6, workgroup: '学习机组', employeeId: '1006', name: '张三', value: '50000', averageValue: '10000' },
];

export const shiftScheduleByDay = {
  今天: [
    { label: '早班', time: '8:00–12:00' },
    { label: '下午班', time: '13:00–17:00' },
  ],
  明天: [
    { label: '早班', time: '9:00–12:00' },
    { label: '下午班', time: '14:00–18:00' },
  ],
  后天: [
    { label: '早班', time: '8:30–12:30' },
    { label: '下午班', time: '13:30–17:30' },
  ],
} as const;

export type ShiftScheduleDay = keyof typeof shiftScheduleByDay;

export const managerOverviewTableRows: ManagerOverviewDetailRow[] = [
  { employeeName: '李明明', workgroup: '硬件', inboundAnswered: '2000', outboundVolume: '2988', outboundAnswered: '899', issueParticipationRate: '99%', customerSatisfaction: '100%', issueResolutionRate: '100%' },
  { employeeName: '张晓晔', workgroup: '硬件', inboundAnswered: '788', outboundVolume: '5678', outboundAnswered: '789', issueParticipationRate: '100%', customerSatisfaction: '90%', issueResolutionRate: '90%' },
  { employeeName: '李明明', workgroup: '硬件', inboundAnswered: '2000', outboundVolume: '2988', outboundAnswered: '899', issueParticipationRate: '99%', customerSatisfaction: '100%', issueResolutionRate: '100%' },
  { employeeName: '张晓晔', workgroup: '学习机', inboundAnswered: '788', outboundVolume: '5678', outboundAnswered: '789', issueParticipationRate: '100%', customerSatisfaction: '90%', issueResolutionRate: '90%' },
  { employeeName: '李明明', workgroup: '学习机', inboundAnswered: '2000', outboundVolume: '2988', outboundAnswered: '899', issueParticipationRate: '99%', customerSatisfaction: '100%', issueResolutionRate: '100%' },
  { employeeName: '张晓晔', workgroup: '学习机', inboundAnswered: '788', outboundVolume: '5678', outboundAnswered: '789', issueParticipationRate: '100%', customerSatisfaction: '90%', issueResolutionRate: '90%' },
  { employeeName: '李明明', workgroup: '教育', inboundAnswered: '2000', outboundVolume: '2988', outboundAnswered: '899', issueParticipationRate: '99%', customerSatisfaction: '100%', issueResolutionRate: '100%' },
  { employeeName: '张晓晔', workgroup: '教育', inboundAnswered: '788', outboundVolume: '5678', outboundAnswered: '789', issueParticipationRate: '100%', customerSatisfaction: '90%', issueResolutionRate: '90%' },
  { employeeName: '李明明', workgroup: '教育', inboundAnswered: '2000', outboundVolume: '2988', outboundAnswered: '899', issueParticipationRate: '99%', customerSatisfaction: '100%', issueResolutionRate: '100%' },
  { employeeName: '张晓晔', workgroup: '医院', inboundAnswered: '788', outboundVolume: '5678', outboundAnswered: '789', issueParticipationRate: '100%', customerSatisfaction: '90%', issueResolutionRate: '90%' },
  { employeeName: '李明明', workgroup: '医院', inboundAnswered: '2000', outboundVolume: '2988', outboundAnswered: '899', issueParticipationRate: '99%', customerSatisfaction: '100%', issueResolutionRate: '100%' },
  { employeeName: '张晓晔', workgroup: '医院', inboundAnswered: '788', outboundVolume: '5678', outboundAnswered: '789', issueParticipationRate: '100%', customerSatisfaction: '90%', issueResolutionRate: '90%' },
];
