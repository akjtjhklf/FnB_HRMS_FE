// Common response types from BE
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, any>;
  search?: string;
}

// DataTable component types
export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string | string[];
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  sorter?: boolean | ((a: T, b: T) => number);
  render?: (value: any, record: T, index: number) => React.ReactNode;
  searchable?: boolean;
  filterable?: boolean;
  filterOptions?: Array<{ label: string; value: string | number }>;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange";
  options?: Array<{ label: string; value: string | number }>;
  placeholder?: string;
}

export interface DataTableProps<T = any> {
  dataSource: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  pagination?: boolean | {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange?: (page: number, pageSize: number) => void;
  };
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: FilterConfig[];
  onFilter?: (filters: Record<string, any>) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  showRefresh?: boolean;
  showExport?: boolean;
  className?: string;
  tableClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  bordered?: boolean;
  size?: "small" | "middle" | "large";
  title?: React.ReactNode;
  extra?: React.ReactNode;
  rowSelection?: {
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    selections?: boolean;
  };
  emptyText?: string;
  emptyDescription?: string;
  onSort?: (field: string, order: "ascend" | "descend" | null) => void;
}

// Status configuration for common status badges
export interface StatusConfig {
  label: string;
  color: string;
  icon?: React.ReactNode;
}

export type StatusMap = Record<string, StatusConfig>;

// Common status maps
export const EMPLOYEE_STATUS: StatusMap = {
  active: { label: "Đang làm việc", color: "green" },
  inactive: { label: "Nghỉ việc", color: "red" },
  on_leave: { label: "Nghỉ phép", color: "orange" },
  probation: { label: "Thử việc", color: "blue" },
};

export const CONTRACT_STATUS: StatusMap = {
  active: { label: "Hiệu lực", color: "green" },
  expired: { label: "Hết hạn", color: "red" },
  pending: { label: "Chờ xử lý", color: "orange" },
  terminated: { label: "Đã chấm dứt", color: "red" },
};

export const ATTENDANCE_STATUS: StatusMap = {
  present: { label: "Có mặt", color: "green" },
  absent: { label: "Vắng mặt", color: "red" },
  late: { label: "Đi muộn", color: "orange" },
  early_leave: { label: "Về sớm", color: "orange" },
  on_leave: { label: "Nghỉ phép", color: "blue" },
};

export const SHIFT_STATUS: StatusMap = {
  scheduled: { label: "Đã xếp lịch", color: "blue" },
  in_progress: { label: "Đang diễn ra", color: "green" },
  completed: { label: "Hoàn thành", color: "default" },
  cancelled: { label: "Đã hủy", color: "red" },
};
