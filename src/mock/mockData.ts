// Mock data for UI prototypes (no API calls)
export const attendanceMock = [
  { id: 'a1', employee_name: 'Nguyễn Văn A', date: '2025-11-10', clock_in: '08:00', clock_out: '17:00', status: 'Present' },
  { id: 'a2', employee_name: 'Trần Thị B', date: '2025-11-10', clock_in: '08:15', clock_out: '17:10', status: 'Present' },
  { id: 'a3', employee_name: 'Lê Văn C', date: '2025-11-10', clock_in: null, clock_out: null, status: 'Absent' },
  { id: 'a4', employee_name: 'Phạm Thị D', date: '2025-11-11', clock_in: '08:05', clock_out: '17:00', status: 'Present' },
];

export const salaryMock = [
  { id: 's1', employee_name: 'Nguyễn Văn A', period: '2025-10', gross: 15000000, net: 12000000, status: 'Paid' },
  { id: 's2', employee_name: 'Trần Thị B', period: '2025-10', gross: 12000000, net: 9800000, status: 'Paid' },
  { id: 's3', employee_name: 'Lê Văn C', period: '2025-10', gross: 10000000, net: 8000000, status: 'Pending' },
];

export const notificationsMock = [
  { id: 'n1', title: 'Bảo trì hệ thống', body: 'Hệ thống sẽ bảo trì vào 20/11', level: 'warning', created_at: '2025-11-12' },
  { id: 'n2', title: 'Chính sách mới', body: 'Cập nhật chính sách nghỉ phép', level: 'info', created_at: '2025-11-11' },
  { id: 'n3', title: 'Vấn đề thanh toán', body: 'Lỗi xuất file payroll', level: 'error', created_at: '2025-11-10' },
];

export const reportsMock = {
  totalEmployees: 128,
  assignedShifts: 512,
  coverageRate: 95,
  overtimeHours: 42,
};

// Breakdown for charts (last 7 days)
export const reportsBreakdown = {
  dailyAssignments: [
    { date: '2025-11-09', assignments: 60 },
    { date: '2025-11-10', assignments: 72 },
    { date: '2025-11-11', assignments: 68 },
    { date: '2025-11-12', assignments: 75 },
    { date: '2025-11-13', assignments: 80 },
    { date: '2025-11-14', assignments: 78 },
    { date: '2025-11-15', assignments: 79 },
  ],
  positionCoverage: [
    { position: 'Cashier', coverage: 96 },
    { position: 'Cook', coverage: 92 },
    { position: 'Waiter', coverage: 94 },
    { position: 'Cleaner', coverage: 88 },
  ],
};

export const requestsMock = [
  { id: 'r1', requester: 'Nguyễn Văn A', type: 'Leave', title: 'Xin nghỉ phép', description: 'Nghỉ 1 ngày vì việc riêng', status: 'pending', created_at: '2025-11-08' },
  { id: 'r2', requester: 'Trần Thị B', type: 'Shift Swap', title: 'Yêu cầu đổi ca', description: 'Muốn đổi ca 12/11 với Cô D', status: 'approved', created_at: '2025-11-09' },
  { id: 'r3', requester: 'Lê Văn C', type: 'Leave', title: 'Xin nghỉ ốm', description: 'Bị ốm, xin nghỉ 2 ngày', status: 'rejected', created_at: '2025-11-07' },
  { id: 'r4', requester: 'Phạm Thị D', type: 'Overtime', title: 'Yêu cầu OT', description: 'Yêu cầu làm thêm 3 giờ', status: 'pending', created_at: '2025-11-13' },
];
