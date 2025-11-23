"use client";

import { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useUpdate, useDelete, useList } from "@refinedev/core";
import {
  Table,
  Button,
  App,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Alert,
  Input,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface ScheduleChangeRequest {
  id: string;
  from_assignment_id: string;
  to_assignment_id?: string;
  to_employee_id?: string;
  type: "shift_swap" | "time_off" | "other";
  reason?: string;
  status: "pending" | "approved" | "rejected";
  requested_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  from_assignment?: {
    id: string;
    shift?: {
      date: string;
      start_time: string;
      end_time: string;
      shift_type?: {
        name: string;
      };
    };
    employee?: {
      full_name: string;
    };
  };
  to_employee?: {
    full_name: string;
  };
}

/**
 * ChangeRequestsManagement - Quản lý Yêu cầu Đổi Ca
 * 
 * Chức năng:
 * - Xem danh sách yêu cầu đổi ca
 * - Duyệt yêu cầu đổi ca (auto-swap assignments)
 * - Từ chối yêu cầu
 * - Xem chi tiết yêu cầu
 * 
 * Luồng:
 * 1. Nhân viên A gửi yêu cầu đổi ca với nhân viên B
 * 2. Nhân viên B (hoặc quản lý) xem yêu cầu
 * 3. Duyệt → Backend tự động swap 2 assignments
 * 4. Từ chối → Cập nhật trạng thái rejected
 */
export function ChangeRequestsManagement() {
  const { message } = App.useApp();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ScheduleChangeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch requests
  const { tableProps } = useTable<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    },
  });

  const { query: requestsQuery } = useList<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
  });

  const requests = requestsQuery.data?.data || [];

  // Mutations
  const { mutate: updateRequest } = useUpdate();
  const { mutate: deleteRequest } = useDelete();

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r: ScheduleChangeRequest) => r.status === "pending").length,
    approved: requests.filter((r: ScheduleChangeRequest) => r.status === "approved").length,
    rejected: requests.filter((r: ScheduleChangeRequest) => r.status === "rejected").length,
  };

  // Handle approve (with auto-swap)
  const handleApprove = (id: string) => {
    updateRequest(
      {
        resource: "schedule-change-requests",
        id,
        values: {
          status: "approved",
          approved_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          message.success("Đã duyệt yêu cầu! Ca làm việc đã được hoán đổi tự động.");
          requestsQuery.refetch();
          setViewModalOpen(false);
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra khi duyệt yêu cầu");
        },
      }
    );
  };

  // Handle reject
  const handleReject = () => {
    if (!selectedRequest) return;

    updateRequest(
      {
        resource: "schedule-change-requests",
        id: selectedRequest.id,
        values: {
          status: "rejected",
          reason: rejectReason || "Từ chối",
        },
      },
      {
        onSuccess: () => {
          message.success("Đã từ chối yêu cầu");
          requestsQuery.refetch();
          setRejectModalOpen(false);
          setViewModalOpen(false);
          setRejectReason("");
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteRequest(
      {
        resource: "schedule-change-requests",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa yêu cầu thành công");
          requestsQuery.refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  const getStatusTag = (status: string) => {
    const configs = {
      pending: { color: "processing", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
      approved: { color: "success", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      rejected: { color: "error", icon: <CloseCircleOutlined />, text: "Từ chối" },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const configs = {
      shift_swap: { color: "blue", text: "Đổi ca" },
      time_off: { color: "orange", text: "Xin nghỉ" },
      other: { color: "default", text: "Khác" },
    };
    const config = configs[type as keyof typeof configs] || configs.other;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Loại yêu cầu",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: "Người yêu cầu",
      key: "requester",
      render: (_: any, record: ScheduleChangeRequest) => (
        <div>
          <strong>{record.from_assignment?.employee?.full_name || "N/A"}</strong>
        </div>
      ),
    },
    {
      title: "Ca muốn đổi",
      key: "shift",
      render: (_: any, record: ScheduleChangeRequest) => {
        const shift = record.from_assignment?.shift;
        if (!shift) return "N/A";
        return (
          <div>
            <div>{shift.shift_type?.name || "Ca làm việc"}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {dayjs(shift.date).format("DD/MM/YYYY")} - {shift.start_time} → {shift.end_time}
            </div>
          </div>
        );
      },
    },
    {
      title: "Đổi với",
      key: "target",
      render: (_: any, record: ScheduleChangeRequest) => (
        <span>{record.to_employee?.full_name || "-"}</span>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason: string) => reason || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      fixed: "right" as const,
      render: (_: any, record: ScheduleChangeRequest) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRequest(record);
              setViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ color: "#52c41a" }}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedRequest(record);
                  setRejectModalOpen(true);
                }}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status !== "pending" && (
            <Popconfirm
              title="Xóa yêu cầu"
              description="Bạn có chắc muốn xóa yêu cầu này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="link" danger size="small">
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Quản lý Yêu cầu Đổi Ca</h1>

      <Alert
        message="Hướng dẫn"
        description="Duyệt hoặc từ chối yêu cầu đổi ca của nhân viên. Khi duyệt, hệ thống sẽ tự động hoán đổi ca làm việc giữa hai nhân viên."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={stats.total}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1400 }}
      />

      {/* View Modal */}
      <Modal
        title="Chi tiết yêu cầu đổi ca"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedRequest(null);
        }}
        footer={
          selectedRequest ? (
            <Space>
              <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Từ chối
                  </Button>
                </>
              )}
            </Space>
          ) : (
            <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
          )
        }
        width={700}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
            <Descriptions.Item label="Loại yêu cầu">
              {getTypeTag(selectedRequest.type)}
            </Descriptions.Item>
            <Descriptions.Item label="Người yêu cầu">
              {selectedRequest.from_assignment?.employee?.full_name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ca muốn đổi">
              {selectedRequest.from_assignment?.shift ? (
                <>
                  <strong>{selectedRequest.from_assignment.shift.shift_type?.name || "Ca làm việc"}</strong>
                  <br />
                  {dayjs(selectedRequest.from_assignment.shift.date).format("DD/MM/YYYY")} -{" "}
                  {selectedRequest.from_assignment.shift.start_time} →{" "}
                  {selectedRequest.from_assignment.shift.end_time}
                </>
              ) : (
                "N/A"
              )}
            </Descriptions.Item>
            {selectedRequest.to_employee && (
              <Descriptions.Item label="Đổi với nhân viên">
                {selectedRequest.to_employee.full_name}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Lý do">
              {selectedRequest.reason || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedRequest.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedRequest.created_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedRequest.approved_at && (
              <Descriptions.Item label="Duyệt lúc">
                {dayjs(selectedRequest.approved_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {selectedRequest?.status === "pending" && (
          <Alert
            message="Lưu ý"
            description="Khi duyệt yêu cầu, hệ thống sẽ tự động hoán đổi ca làm việc giữa hai nhân viên. Hành động này không thể hoàn tác."
            type="warning"
            showIcon
            style={{ marginTop: "16px" }}
          />
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
        onOk={handleReject}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginTop: "24px" }}>
          <p>Lý do từ chối (không bắt buộc):</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu đổi ca..."
          />
        </div>
      </Modal>
    </div>
  );
}
