"use client";

import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Tag, Space, Tabs, Card, Statistic, Row, Col, Button, message } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import CustomDataTable, { CustomColumnType } from "@/components/common/CustomDataTable";
import { ScheduleChangeRequest } from "@/types/schedule";
import { SalaryRequest } from "@/types/salary";
import { Employee } from "@/types/employee";
import { formatDate } from "@/lib/utils";

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
  originalData: ScheduleChangeRequest | SalaryRequest;
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Fetch schedule change requests
  const { query: scheduleQuery } = useList<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
    queryOptions: {
      retry: 1,
    },
  });

  // Fetch salary requests
  const { query: salaryQuery } = useList<SalaryRequest>({
    resource: "salary-requests",
    queryOptions: {
      retry: 1,
    },
  });

  const isLoading = scheduleQuery.isLoading || salaryQuery.isLoading;

  // Combine and transform data
  const combinedRequests = useMemo<CombinedRequest[]>(() => {
    const scheduleRequests: CombinedRequest[] = (scheduleQuery.data?.data || []).map((req) => {
      const employee = typeof req.requester_id === "object" ? req.requester_id as Employee : null;
      const employeeName = employee?.name || "N/A";
      const employeeId = employee?.id || (typeof req.requester_id === "string" ? req.requester_id : "");

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
        originalData: req,
      };
    });

    const salRequests: CombinedRequest[] = (salaryQuery.data?.data || []).map((req) => {
      const employee = typeof req.employee_id === "object" ? req.employee_id as Employee : null;
      const employeeName = employee?.name || "N/A";
      const employeeId = employee?.id || (typeof req.employee_id === "string" ? req.employee_id : "");

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
        originalData: req,
      };
    });

    return [...scheduleRequests, ...salRequests].sort(
      (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );
  }, [scheduleQuery.data, salaryQuery.data]);

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

  const getTypeIcon = (type: RequestType) => {
    return type === "schedule" ? <CalendarOutlined /> : <DollarOutlined />;
  };

  const getTypeTag = (type: RequestType) => {
    const typeMap = {
      schedule: { color: "blue", text: "Lịch làm việc" },
      salary: { color: "purple", text: "Lương" },
    };
    const config = typeMap[type];
    return (
      <Tag color={config.color} icon={getTypeIcon(type)}>
        {config.text}
      </Tag>
    );
  };

  const handleApprove = async (record: CombinedRequest) => {
    message.info("Chức năng duyệt yêu cầu đang được phát triển");
    // TODO: Implement approval logic
  };

  const handleReject = async (record: CombinedRequest) => {
    message.info("Chức năng từ chối yêu cầu đang được phát triển");
    // TODO: Implement rejection logic
  };

  const columns: CustomColumnType<CombinedRequest>[] = [
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      sorter: true,
      filterable: true,
      filterType: "text",
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "type",
      key: "type",
      render: (type: RequestType) => getTypeTag(type),
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Lịch làm việc", value: "schedule" },
        { label: "Lương", value: "salary" },
      ],
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date: string) => formatDate(new Date(date), "dd/MM/yyyy HH:mm"),
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Chờ duyệt", value: "pending" },
        { label: "Đã duyệt", value: "approved" },
        { label: "Từ chối", value: "rejected" },
        { label: "Đã hủy", value: "cancelled" },
      ],
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: CombinedRequest) => (
        <Space size="small">
          <Button type="link" size="small">
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                size="small"
                style={{ color: "green" }}
                onClick={() => handleApprove(record)}
              >
                Duyệt
              </Button>
              <Button type="link" size="small" danger onClick={() => handleReject(record)}>
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Từ chối" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Quản lý yêu cầu</h1>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Tổng số yêu cầu" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
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
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: "16px" }}
        />
        <CustomDataTable
          data={filteredRequests}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          searchable={true}
          showFilters={true}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
        />
      </Card>
    </div>
  );
}
