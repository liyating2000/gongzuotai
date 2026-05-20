export type ScheduleDisplayRow = {
  id: number;
  type: string;
  shiftName: string;
  startDate: string;
  endDate: string;
  applyReason: string;
  approvalResult: string;
  approvalComment: string;
  revoked: string;
};

export const scheduleDisplayRows: ScheduleDisplayRow[] = Array.from({ length: 10 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');

  return {
    id: index + 1,
    type: '值班',
    shiftName: '上午班',
    startDate: `2026-01-${day}`,
    endDate: `2026-01-${day}`,
    applyReason: '',
    approvalResult: '',
    approvalComment: '',
    revoked: '',
  };
});
