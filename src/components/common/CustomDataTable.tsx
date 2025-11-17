"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Table, Input, Select, Button, Space, Tag, Dropdown } from "antd";
import type { TableProps, ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { cn } from "@/lib/utils/cn";

// Types
export interface CustomColumnType<T = any> {
  title: string;
  dataIndex?: string | string[];
  key: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  ellipsis?: boolean;
  
  // Sorting
  sortable?: boolean;
  sorter?: boolean | ((a: T, b: T) => number);
  defaultSortOrder?: "ascend" | "descend" | null;
  
  // Filtering
  filterable?: boolean;
  filterType?: "text" | "select" | "multiSelect" | "date" | "dateRange" | "custom";
  filterOptions?: Array<{ label: string; value: any }>;
  filterMultiple?: boolean;
  filters?: Array<{ text: string; value: any }>;
  onFilter?: (value: any, record: T) => boolean;
  
  // Custom render
  render?: (value: any, record: T, index: number) => React.ReactNode;
  
  // Custom classes
  className?: string;
  headerClassName?: string;
}

export interface CustomDataTableProps<T = any> {
  // Data
  data: T[];
  columns: CustomColumnType<T>[];
  loading?: boolean;
  
  // Row Key
  rowKey?: string | ((record: T) => string);
  
  // Pagination
  pagination?: false | TablePaginationConfig;
  
  // Selection
  rowSelection?: TableProps<T>["rowSelection"];
  
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  
  // Filters
  showFilters?: boolean;
  globalFilters?: React.ReactNode;
  onFilterChange?: (filters: Record<string, FilterValue | null>) => void;
  
  // Actions
  showRefresh?: boolean;
  onRefresh?: () => void;
  showExport?: boolean;
  onExport?: () => void;
  extraActions?: React.ReactNode;
  
  // Styling
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bordered?: boolean;
  size?: "small" | "middle" | "large";
  
  // Events
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => void;
  onRow?: (record: T, index?: number) => React.HTMLAttributes<any>;
  
  // Custom title/footer
  title?: React.ReactNode;
  footer?: React.ReactNode;
  
  // Expandable
  expandable?: TableProps<T>["expandable"];
  
  // Scroll
  scroll?: { x?: number | string; y?: number | string };
}

export function CustomDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  rowKey = "id",
  pagination = {
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
    pageSizeOptions: ["10", "20", "50", "100"],
  },
  rowSelection,
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  showFilters = true,
  globalFilters,
  onFilterChange,
  showRefresh = true,
  onRefresh,
  showExport = false,
  onExport,
  extraActions,
  className,
  tableClassName,
  headerClassName,
  bordered = false,
  size = "middle",
  onChange,
  onRow,
  title,
  footer,
  expandable,
  scroll,
}: CustomDataTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue | null>>({});

  // Convert columns to Ant Design format
  const antdColumns: ColumnsType<T> = useMemo(() => {
    return columns.map((col) => {
      const antdCol: any = {
        title: col.title,
        dataIndex: col.dataIndex,
        key: col.key,
        width: col.width,
        align: col.align || "left",
        fixed: col.fixed,
        ellipsis: col.ellipsis,
        className: col.className,
        onHeaderCell: () => ({
          className: cn("font-semibold", col.headerClassName),
        }),
      };

      // Add sorting
      if (col.sortable || col.sorter) {
        antdCol.sorter = col.sorter === true 
          ? (a: T, b: T) => {
              const aVal = col.dataIndex ? getNestedValue(a, col.dataIndex) : "";
              const bVal = col.dataIndex ? getNestedValue(b, col.dataIndex) : "";
              
              if (typeof aVal === "string") return aVal.localeCompare(bVal);
              if (typeof aVal === "number") return aVal - bVal;
              return 0;
            }
          : col.sorter;
        
        antdCol.defaultSortOrder = col.defaultSortOrder;
      }

      // Add filtering
      if (col.filterable) {
        if (col.filterType === "select" || col.filterType === "multiSelect") {
          antdCol.filters = col.filterOptions?.map(opt => ({
            text: opt.label,
            value: opt.value,
          })) || col.filters;
          antdCol.filterMultiple = col.filterType === "multiSelect";
          antdCol.onFilter = col.onFilter || ((value: any, record: T) => {
            const recordValue = col.dataIndex ? getNestedValue(record, col.dataIndex) : "";
            return recordValue === value;
          });
        } else if (col.filterType === "text") {
          antdCol.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
              <Input
                placeholder={`Tìm ${col.title.toLowerCase()}`}
                value={selectedKeys[0]}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => confirm()}
                className="mb-2 block"
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => confirm()}
                  icon={<SearchOutlined />}
                  size="small"
                >
                  Tìm
                </Button>
                <Button onClick={() => clearFilters?.()} size="small">
                  Xóa
                </Button>
              </Space>
            </div>
          );
          antdCol.filterIcon = (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
          );
          antdCol.onFilter = col.onFilter || ((value: any, record: T) => {
            const recordValue = col.dataIndex ? getNestedValue(record, col.dataIndex) : "";
            return recordValue
              ?.toString()
              .toLowerCase()
              .includes(value.toLowerCase());
          });
        }
      }

      // Add custom render
      if (col.render) {
        antdCol.render = col.render;
      }

      return antdCol;
    });
  }, [columns]);

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return data;

    return data.filter((item) => {
      return columns.some((col) => {
        if (!col.dataIndex) return false;
        const value = getNestedValue(item, col.dataIndex);
        return value?.toString().toLowerCase().includes(searchText.toLowerCase());
      });
    });
  }, [data, searchText, columns]);

  // Handle table change
  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<T> | SorterResult<T>[]
    ) => {
      setActiveFilters(filters);
      onFilterChange?.(filters);
      onChange?.(pagination, filters, sorter);
    },
    [onChange, onFilterChange]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setSearchText("");
    setActiveFilters({});
    onRefresh?.();
  }, [onRefresh]);

  return (
    <div className={cn("custom-data-table", className)}>
      {/* Header Actions */}
      {(searchable || showFilters || showRefresh || showExport || extraActions) && (
        <div className={cn("mb-4 flex flex-wrap items-center gap-3", headerClassName)}>
          {/* Search */}
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="max-w-xs"
              size="large"
            />
          )}

          {/* Global Filters */}
          {showFilters && globalFilters && (
            <div className="flex items-center gap-2">
              {globalFilters}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Refresh Button */}
            {showRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                title="Làm mới"
              >
                Làm mới
              </Button>
            )}

            {/* Export Button */}
            {showExport && (
              <Button
                icon={<DownloadOutlined />}
                onClick={onExport}
                type="primary"
                className="bg-green-600 hover:bg-green-700"
              >
                Xuất Excel
              </Button>
            )}

            {/* Extra Actions */}
            {extraActions}
          </div>
        </div>
      )}

      {/* Table */}
      <Table<T>
        rowKey={rowKey}
        columns={antdColumns}
        dataSource={filteredData}
        loading={loading}
        pagination={pagination}
        rowSelection={rowSelection}
        bordered={bordered}
        size={size}
        onChange={handleTableChange}
        onRow={onRow}
        title={title ? () => title : undefined}
        footer={footer ? () => footer : undefined}
        expandable={expandable}
        scroll={scroll}
        className={cn(
          "custom-table",
          "shadow-sm rounded-lg overflow-hidden",
          tableClassName
        )}
      />
    </div>
  );
}

// Helper function to get nested value
function getNestedValue(obj: any, path: string | string[]): any {
  const keys = Array.isArray(path) ? path : path.split(".");
  return keys.reduce((acc, key) => acc?.[key], obj);
}

export default CustomDataTable;
