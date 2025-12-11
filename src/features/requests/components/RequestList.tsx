"use client";

import { useList, useCustomMutation, useInvalidate } from "@refinedev/core";
import { Table, Tag, Button, Space, Card, Statistic, Row, Col, Tabs, Tooltip, Modal, message } from "antd";
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
  FieldTimeOutlined,
  ExclamationCircleOutlined,
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

interface AttendanceAdjustment {
  id: string;
  attendance_shift_id: string;
  requested_by?: string | Employee | null;
  requested_at?: string | null;
  old_value?: { clock_in?: string | null; clock_out?: string | null } | null;
  proposed_value?: { clock_in?: string | null; clock_out?: string | null } | null;
  approved_by?: string | null;
  approved_at?: string | null;
  status: "pending" | "approved" | "rejected";
  reason?: string | null;
  created_at?: string | null;
}

type RequestStatus = "all" | "pending" | "approved" | "rejected";
type RequestType = "schedule" | "salary" | "attendance";

interface CombinedRequest {
  id: string;
  type: RequestType;
  originalType: string;
  employeeName: string;
  employeeId: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestDate: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

// Helper to format time
const formatTime = (timeString?: string | null) => {
  if (!timeString) return "--:--";
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeString;
  }
};

export const RequestList = () => {
  const [activeTab, setActiveTab] = useState<RequestStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const invalidate = useInvalidate();
  const { mutate: approveAdjustment } = useCustomMutation();
  const { mutate: rejectAdjustment } = useCustomMutation();

  // Fetch all schedule change requests
  const { result: scheduleResult, query: scheduleQuery } = useList<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "desc" }],
  });
  const scheduleData = scheduleResult?.data;
  const scheduleLoading = scheduleQuery?.isLoading;

  // Fetch all salary requests
  const { result: salaryResult, query: salaryQuery } = useList<SalaryRequest>({
    resource: "salary-requests",
    pagination: { mode: "off" },
    sorters: [{ field: "request_date", order: "desc" }],
  });
  const salaryData = salaryResult?.data;
  const salaryLoading = salaryQuery?.isLoading;

  // Fetch all attendance adjustments
  const { result: attendanceResult, query: attendanceQuery } = useList<AttendanceAdjustment>({
    resource: "attendance-adjustments",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "desc" }],
    meta: { join: ["requested_by"] },
  });
  const attendanceData = attendanceResult?.data;
  const attendanceLoading = attendanceQuery?.isLoading;

  // Handle approve attendance adjustment
  const handleApprove = (record: CombinedRequest) => {
    if (record.type !== "attendance") {
      message.info("Chức năng duyệt chỉ khả dụng cho yêu cầu chấm công");
      return;
    }

    Modal.confirm({
      title: "Xác nhận duyệt yêu cầu",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn duyệt yêu cầu chỉnh sửa chấm công của ${record.employeeName}?`,
      okText: "Duyệt",
      cancelText: "Hủy",
      okButtonProps: { className: "bg-green-600" },
      onOk: () => {
        setActionLoading(record.id);
        approveAdjustment(
          {
            url: `attendance-adjustments/${record.id}/approve`,
            method: "patch",
            values: {},
          },
          {
            onSuccess: () => {
              message.success("Duyệt yêu cầu thành công");
              invalidate({ resource: "attendance-adjustments", invalidates: ["list"] });
              setActionLoading(null);
            },
            onError: (error: any) => {
              message.error(error.message || "Có lỗi xảy ra khi duyệt yêu cầu");
              setActionLoading(null);
            },
          }
        );
      },
    });
  };

  // Handle reject attendance adjustment
  const handleReject = (record: CombinedRequest) => {
    if (record.type !== "attendance") {
      message.info("Chức năng từ chối chỉ khả dụng cho yêu cầu chấm công");
      return;
    }

    Modal.confirm({
      title: "Xác nhận từ chối yêu cầu",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn từ chối yêu cầu chỉnh sửa chấm công của ${record.employeeName}?`,
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setActionLoading(record.id);
        rejectAdjustment(
          {
            url: `attendance-adjustments/${record.id}/reject`,
            method: "patch",
            values: {},
          },
          {
            onSuccess: () => {
              message.success("Từ chối yêu cầu thành công");
              invalidate({ resource: "attendance-adjustments", invalidates: ["list"] });
              setActionLoading(null);
            },
            onError: (error: any) => {
              message.error(error.message || "Có lỗi xảy ra khi từ chối yêu cầu");
              setActionLoading(null);
            },
          }
        );
      },
    });
  };

  // Combine data
  const combinedRequests = useMemo<CombinedRequest[]>(() => {
    const scheduleItems = scheduleData || [];
    const salaryItems = salaryData || [];
    const attendanceItems = attendanceData || [];

    const scheduleRequests: CombinedRequest[] = scheduleItems.map((req) => {
      const employee =
        typeof req.requester_id === "object" ? (req.requester_id as Employee) : null;
      const employeeName = employee?.full_name || employee?.name || "Chưa có";
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
        type: "schedule" as RequestType,
        originalType: req.type,
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
      const employeeName = employee?.full_name || employee?.name || "Chưa có";
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
        type: "salary" as RequestType,
        originalType: "salary",
        employeeName,
        employeeId,
        description,
        status: req.status,
        requestDate: req.request_date,
        approvedBy: req.approved_by,
        approvedAt: req.approved_at,
      };
    });

    const attendanceRequests: CombinedRequest[] = attendanceItems.map((req) => {
      const employee =
        typeof req.requested_by === "object" ? (req.requested_by as Employee) : null;
      const employeeName = employee?.full_name || employee?.name || "Nhân viên";
      const employeeId =
        employee?.id ||
        (typeof req.requested_by === "string" ? req.requested_by : "");

      // Build description from old_value and proposed_value
      let description = "Yêu cầu chỉnh sửa chấm công";

      const oldIn = formatTime(req.old_value?.clock_in);
      const oldOut = formatTime(req.old_value?.clock_out);
      const newIn = formatTime(req.proposed_value?.clock_in);
      const newOut = formatTime(req.proposed_value?.clock_out);

      if (req.old_value || req.proposed_value) {
        description = `Chấm công: ${oldIn}-${oldOut} → ${newIn}-${newOut}`;
      }

      if (req.reason) {
        description += ` | Lý do: ${req.reason}`;
      }

      return {
        id: req.id,
        type: "attendance" as RequestType,
        originalType: "attendance_adjustment",
        employeeName,
        employeeId,
        description,
        status: req.status,
        requestDate: req.created_at || req.requested_at || "",
        approvedBy: req.approved_by,
        approvedAt: req.approved_at,
      };
    });

    return [...scheduleRequests, ...salRequests, ...attendanceRequests].sort(
      (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );
  }, [scheduleData, salaryData, attendanceData]);

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
      attendance: { color: "cyan", icon: <FieldTimeOutlined />, text: "Chấm công" },
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
        { text: "Chấm công", value: "attendance" },
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
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedRequest(record)}
            />
          </Tooltip>
          {record.status === "pending" && record.type === "attendance" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  className="text-green-600 hover:text-green-700"
                  loading={actionLoading === record.id}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  danger
                  icon={<StopOutlined />}
                  loading={actionLoading === record.id}
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === "pending" && record.type !== "attendance" && (
            <>
              <Tooltip title="Duyệt (Chưa hỗ trợ)">
                <Button type="text" icon={<CheckOutlined />} className="text-gray-700" disabled />
              </Tooltip>
              <Tooltip title="Từ chối (Chưa hỗ trợ)">
                <Button type="text" icon={<StopOutlined />} className="text-gray-700" disabled />
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

  const isLoading = scheduleLoading || salaryLoading || attendanceLoading;

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
          Theo dõi và duyệt yêu cầu lịch làm việc, lương và chấm công
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

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu"
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        footer={
          selectedRequest?.status === "pending" && selectedRequest?.type === "attendance" ? (
            <Space>
              <Button onClick={() => setSelectedRequest(null)}>Đóng</Button>
              <Button
                danger
                onClick={() => {
                  if (selectedRequest) {
                    handleReject(selectedRequest);
                    setSelectedRequest(null);
                  }
                }}
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                className="bg-green-600"
                onClick={() => {
                  if (selectedRequest) {
                    handleApprove(selectedRequest);
                    setSelectedRequest(null);
                  }
                }}
              >
                Duyệt yêu cầu
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setSelectedRequest(null)}>Đóng</Button>
          )
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <span className="text-gray-500 text-sm">Nhân viên:</span>
              <p className="font-medium">{selectedRequest.employeeName}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Loại yêu cầu:</span>
              <p>{getTypeTag(selectedRequest.type)}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Mô tả:</span>
              <p className="text-gray-700">{selectedRequest.description}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Ngày tạo:</span>
              <p>{selectedRequest.requestDate ? formatDate(selectedRequest.requestDate) : "-"}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Trạng thái:</span>
              <p>{getStatusTag(selectedRequest.status)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

