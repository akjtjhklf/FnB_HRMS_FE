"use client";

import React, { useState, useMemo } from "react";
import { Table, Input, Select, Button, Space, Tag, Avatar, Tooltip } from "antd";
import type { TableProps, ColumnType } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Search, Filter, Download, RefreshCw } from "lucide-react";

export interface DataTableColumn<T = any> extends ColumnType<T> {
  searchable?: boolean;
  filterable?: boolean;
  filterOptions?: Array<{ label: string; value: string | number }>;
}

export interface DataTableProps<T = any> {
  // Data
  dataSource: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  
  // Pagination
  pagination?: boolean | TableProps<T>["pagination"];
  
  // Search & Filter
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ label: string; value: string | number }>;
  }>;
  onFilter?: (filters: Record<string, any>) => void;
  
  // Actions
  onRefresh?: () => void;
  onExport?: () => void;
  showRefresh?: boolean;
  showExport?: boolean;
  
  // Customization
  className?: string;
  tableClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  bordered?: boolean;
  size?: "small" | "middle" | "large";
  
  // Header
  title?: React.ReactNode;
  extra?: React.ReactNode;
  
  // Row selection
  rowSelection?: TableProps<T>["rowSelection"];
  
  // Empty state
  emptyText?: string;
  emptyDescription?: string;
  
  // Sorting
  onSort?: (field: string, order: "ascend" | "descend" | null) => void;
}

export function DataTable<T extends Record<string, any>>({
  dataSource,
  columns,
  loading = false,
  rowKey = "id",
  pagination = true,
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  filters,
  onFilter,
  onRefresh,
  onExport,
  showRefresh = true,
  showExport = false,
  className = "",
  tableClassName = "",
  rowClassName,
  bordered = false,
  size = "middle",
  title,
  extra,
  rowSelection,
  emptyText = "Không có dữ liệu",
  emptyDescription,
  onSort,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  // Handle table change (sorting, filtering, pagination)
  const handleTableChange = (
    pagination: any,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    // Handle sorting
    if (!Array.isArray(sorter) && sorter.field) {
      const field = String(sorter.field);
      const order = sorter.order || null;
      setSortField(field);
      setSortOrder(order);
      onSort?.(field, order);
    }
  };

  // Enhanced columns with default renderers
  const enhancedColumns: DataTableColumn<T>[] = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      sorter: col.sorter !== undefined ? col.sorter : true,
      showSorterTooltip: col.showSorterTooltip !== undefined ? col.showSorterTooltip : true,
    }));
  }, [columns]);

  // Filter data locally if no external filter handler
  const filteredData = useMemo(() => {
    if (onSearch || onFilter) {
      return dataSource; // External filtering
    }

    let filtered = [...dataSource];

    // Search
    if (searchValue) {
      filtered = filtered.filter((record) => {
        return Object.values(record).some((value) =>
          String(value).toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

    // Filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        filtered = filtered.filter((record) => record[key] === value);
      }
    });

    return filtered;
  }, [dataSource, searchValue, filterValues, onSearch, onFilter]);

  return (
    <div className={`data-table-container ${className}`}>
      {/* Header */}
      {(title || extra || filters || showRefresh || showExport) && (
        <div className="mb-4 space-y-4">
          {/* Title and Extra */}
          {(title || extra) && (
            <div className="flex justify-between items-center">
              {title && <div className="text-lg font-semibold text-gray-900">{title}</div>}
              {extra && <div>{extra}</div>}
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <Input
              placeholder={searchPlaceholder}
              prefix={<Search className="w-4 h-4 text-gray-700" />}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              size="large"
              className="flex-1 min-w-[300px] max-w-md rounded-lg"
            />

            {/* Filters */}
            {filters?.map((filter) => (
              <Select
                key={filter.key}
                placeholder={filter.label}
                value={filterValues[filter.key]}
                onChange={(value) => handleFilterChange(filter.key, value)}
                allowClear
                size="large"
                className="min-w-[180px]"
                options={filter.options}
              />
            ))}

            {/* Actions */}
            <Space>
              {showRefresh && (
                <Tooltip title="Làm mới">
                  <Button
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={onRefresh}
                    size="large"
                    className="rounded-lg"
                  />
                </Tooltip>
              )}
              {showExport && (
                <Tooltip title="Xuất dữ liệu">
                  <Button
                    icon={<Download className="w-4 h-4" />}
                    onClick={onExport}
                    size="large"
                    type="primary"
                    className="rounded-lg bg-green-600 hover:bg-green-700"
                  >
                    Xuất Excel
                  </Button>
                </Tooltip>
              )}
            </Space>
          </div>
        </div>
      )}

      {/* Table */}
      <Table<T>
        dataSource={filteredData}
        columns={enhancedColumns}
        loading={loading}
        rowKey={rowKey}
        pagination={
          pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} của ${total} bản ghi`,
                pageSizeOptions: ["10", "20", "50", "100"],
                defaultPageSize: 10,
                ...(typeof pagination === "object" ? pagination : {}),
              }
        }
        onChange={handleTableChange}
        bordered={bordered}
        size={size}
        rowClassName={rowClassName}
        rowSelection={rowSelection}
        className={`custom-data-table ${tableClassName}`}
        locale={{
          emptyText: (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-700 font-medium text-lg mb-2">{emptyText}</p>
              {emptyDescription && (
                <p className="text-gray-700 text-sm">{emptyDescription}</p>
              )}
            </div>
          ),
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}

// Export utilities for common column renderers
export const columnRenderers = {
  // Avatar with text
  avatar: (text: string, record: any, avatarField = "avatar", nameField = "name") => (
    <div className="flex items-center gap-3">
      <Avatar src={record[avatarField]} size={40} className="bg-blue-500">
        {text?.[0]?.toUpperCase()}
      </Avatar>
      <div>
        <p className="font-medium text-gray-900">{text}</p>
        {record.subtitle && <p className="text-sm text-gray-500">{record.subtitle}</p>}
      </div>
    </div>
  ),

  // Status badge
  status: (
    status: string,
    statusMap: Record<string, { label: string; color: string }>
  ) => {
    const config = statusMap[status] || { label: status, color: "default" };
    return <Tag color={config.color}>{config.label}</Tag>;
  },

  // Date formatter
  date: (date: string | Date | null | undefined, format = "DD/MM/YYYY") => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
    // Simple date formatting
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  },

  // Currency formatter
  currency: (value: number, currency = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
    }).format(value);
  },

  // Phone formatter
  phone: (phone: string) => {
    if (!phone) return "-";
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  },

  // Truncate text
  truncate: (text: string, maxLength = 50) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return (
      <Tooltip title={text}>
        <span>{text.substring(0, maxLength)}...</span>
      </Tooltip>
    );
  },
};
