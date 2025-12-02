"use client";

import { useList } from "@refinedev/core";
import { Table, Tag, Button, Space, Card, Statistic, Row, Col, Tabs, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  CheckOutlined,
  StopOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  full_name?: string;
}

interface ScheduleChangeRequest {
  id: string;
  requester_id: string | Employee;
  type: "shift_swap" | "pass_shift" | "day_off";
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at?: string;
  approved_by?: string | null;
  approved_at?: string | null;
}

interface SalaryRequest {
  id: string;
  employee_id: string | Employee;
  current_rate?: number;
  proposed_rate?: number;
  note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  request_date: string;
  approved_by?: string | null;
  approved_at?: string | null;
}

type RequestStatus = "all" | "pending" | "approved" | "rejected";
type RequestType = "schedule" | "salary";

interface CombinedRequest {
  id: string;
  type: RequestType;
  employeeName: string;
  employeeId: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestDate: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export const RequestList = () => {
  const [activeTab, setActiveTab] = useState<RequestStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Fetch all schedule change requests (combined data approach - fetch all, paginate client-side)
  const { data: scheduleData, isLoading: scheduleLoading } = useList<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
    pagination: { 
      mode: "off" // Get all data for combining
    },
    sorters: [{ field: "created_at", order: "desc" }],
  });

  // Fetch all salary requests
  const { data: salaryData, isLoading: salaryLoading } = useList<SalaryRequest>({
    resource: "salary-requests",
    pagination: { 
      mode: "off" // Get all data for combining
    },
    sorters: [{ field: "request_date", order: "desc" }],
  });

  // Combine data
  const combinedRequests = useMemo<CombinedRequest[]>(() => {
    const scheduleItems = scheduleData?.data || [];
    const salaryItems = salaryData?.data || [];

    const scheduleRequests: CombinedRequest[] = scheduleItems.map((req) => {
      const employee =
        typeof req.requester_id === "object" ? (req.requester_id as Employee) : null;
      const employeeName = employee?.full_name || employee?.name || "N/A";
      const employeeId =
        employee?.id ||
        (typeof req.requester_id === "string" ? req.requester_id : "");

      let description = "";
      if (req.type === "shift_swap") {
        description = "Đổi ca làm việc";
      } else if (req.type === "pass_shift") {
        description = "Nhường ca làm việc";
      } else if (req.type === "day_off") {
        description = "Xin nghỉ phép";
      }

      if (req.reason) {
        description += `: ${req.reason}`;
      }

      return {
        id: req.id,
        type: "schedule",
        employeeName,
        employeeId,
        description,
        status: req.status,
        requestDate: req.created_at || "",
        approvedBy: req.approved_by,
        approvedAt: req.approved_at,
      };
    });

    const salRequests: CombinedRequest[] = salaryItems.map((req) => {
      const employee =
        typeof req.employee_id === "object" ? (req.employee_id as Employee) : null;
      const employeeName = employee?.full_name || employee?.name || "N/A";
      const employeeId =
        employee?.id || (typeof req.employee_id === "string" ? req.employee_id : "");

      let description = "Yêu cầu điều chỉnh lương";
      if (req.current_rate && req.proposed_rate) {
        description += `: ${req.current_rate.toLocaleString()} → ${req.proposed_rate.toLocaleString()} VNĐ`;
      }
      if (req.note) {
        description += ` - ${req.note}`;
      }

      return {
        id: req.id,
        type: "salary",
        employeeName,
        employeeId,
        description,
        status: req.status,
        requestDate: req.request_date,
        approvedBy: req.approved_by,
        approvedAt: req.approved_at,
      };
    });

    return [...scheduleRequests, ...salRequests].sort(
      (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );
  }, [scheduleData?.data, salaryData?.data]);

  // Filter by tab
  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return combinedRequests;
    return combinedRequests.filter((req) => req.status === activeTab);
  }, [combinedRequests, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = combinedRequests.length;
    const pending = combinedRequests.filter((r) => r.status === "pending").length;
    const approved = combinedRequests.filter((r) => r.status === "approved").length;
    const rejected = combinedRequests.filter((r) => r.status === "rejected").length;

    return { total, pending, approved, rejected };
  }, [combinedRequests]);

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: "gold", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
      approved: { color: "green", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      rejected: { color: "red", icon: <CloseCircleOutlined />, text: "Từ chối" },
      cancelled: { color: "default", icon: <CloseCircleOutlined />, text: "Đã hủy" },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getTypeTag = (type: RequestType) => {
    const typeMap = {
      schedule: { color: "blue", icon: <CalendarOutlined />, text: "Lịch làm việc" },
      salary: { color: "purple", icon: <DollarOutlined />, text: "Lương" },
    };
    const config = typeMap[type];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      ellipsis: true,
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "type",
      key: "type",
      width: 140,
      filters: [
        { text: "Lịch làm việc", value: "schedule" },
        { text: "Lương", value: "salary" },
      ],
      onFilter: (value: any, record: CombinedRequest) => record.type === value,
      render: (type: RequestType) => getTypeTag(type),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-gray-700">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 150,
      sorter: (a: CombinedRequest, b: CombinedRequest) =>
        new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime(),
      render: (date: string) => (
        <span className="text-gray-700">{date ? formatDate(date) : "-"}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Từ chối", value: "rejected" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value: any, record: CombinedRequest) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: any, record: CombinedRequest) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt">
                <Button type="text" icon={<CheckOutlined />} className="text-green-600" />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button type="text" danger icon={<StopOutlined />} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: `Tất cả (${stats.total})` },
    { key: "pending", label: `Chờ duyệt (${stats.pending})` },
    { key: "approved", label: `Đã duyệt (${stats.approved})` },
    { key: "rejected", label: `Từ chối (${stats.rejected})` },
  ];

  const isLoading = scheduleLoading || salaryLoading;

  // Reset to page 1 when tab changes
  const handleTabChange = (key: string) => {
    setActiveTab(key as RequestStatus);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileTextOutlined className="text-xl text-purple-600" />
          </div>
          Quản lý yêu cầu
        </h1>
        <p className="text-gray-500 mt-2 ml-[52px]">
          Theo dõi và duyệt yêu cầu lịch làm việc và lương
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng số yêu cầu"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs and Table */}
      <Card className="shadow-sm border border-gray-200">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="mb-4"
        />
        <Table
          dataSource={filteredRequests}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredRequests.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1);
              }
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} yêu cầu`,
          }}
        />
      </Card>
    </div>
  );
};
