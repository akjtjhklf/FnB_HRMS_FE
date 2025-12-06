"use client";

import { useState } from "react";
import { useTable, useSelect } from "@refinedev/antd";
import { useCreate, useUpdate, useList } from "@refinedev/core";
import { Table, Button, Modal, Form, Select, Input, App, Tag, Space, Row, Col, Card, Statistic, Descriptions } from "antd";
import { PlusOutlined, SwapOutlined, UserDeleteOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { ScheduleChangeRequest } from "@/types/schedule";
import dayjs from "@/lib/dayjs";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface Shift {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
}

/**
 * ChangeRequests - Component for handling schedule change requests
 * 
 * Features:
 * - View all change requests (shift_swap, pass_shift, day_off)
 * - Create new change requests
 * - Approve/reject requests
 * - Filter by status
 * - Shows statistics
 */
export function ChangeRequests() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ScheduleChangeRequest | null>(null);
  const [requestType, setRequestType] = useState<"shift_swap" | "pass_shift" | "day_off">("shift_swap");

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
  const refetch = requestsQuery.refetch;

  // Fetch employees for dropdown
  const { selectProps: employeeSelectProps } = useSelect<Employee>({
    resource: "employees",
    optionLabel: "full_name",
    optionValue: "id",
  });

  // Fetch shifts for dropdown
  const { selectProps: shiftSelectProps } = useSelect<Shift>({
    resource: "shifts",
    optionLabel: "name",
    optionValue: "id",
  });

  // Create mutation
  const { mutate: createRequest } = useCreate();

  // Update mutation
  const { mutate: updateRequest } = useUpdate();



  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter((r: ScheduleChangeRequest) => r.status === "pending").length,
    approved: requests.filter((r: ScheduleChangeRequest) => r.status === "approved").length,
    rejected: requests.filter((r: ScheduleChangeRequest) => r.status === "rejected").length,
  };

  // Handle create
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      
      createRequest(
        {
          resource: "schedule-change-requests",
          values: {
            requester_id: values.requester_id,
            type: requestType,
            from_shift_id: values.from_shift_id || null,
            to_shift_id: values.to_shift_id || null,
            target_employee_id: values.target_employee_id || null,
            replacement_employee_id: values.replacement_employee_id || null,
            reason: values.reason || null,
            status: "pending",
          },
        },
        {
          onSuccess: () => {
            message.success("Tạo yêu cầu thành công");
            setCreateModalOpen(false);
            form.resetFields();
            refetch();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi tạo yêu cầu");
          },
        }
      );
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle approve
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
          message.success("Đã duyệt yêu cầu");
          refetch();
          setViewModalOpen(false);
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Handle reject
  const handleReject = (id: string) => {
    updateRequest(
      {
        resource: "schedule-change-requests",
        id,
        values: {
          status: "rejected",
        },
      },
      {
        onSuccess: () => {
          message.success("Đã từ chối yêu cầu");
          refetch();
          setViewModalOpen(false);
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  const getStatusTag = (status: string) => {
    const configs = {
      pending: { color: "blue", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
      approved: { color: "green", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      rejected: { color: "red", icon: <CloseCircleOutlined />, text: "Từ chối" },
      cancelled: { color: "default", text: "Đã hủy" },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Tag color={config.color} icon={"icon" in config ? config.icon : undefined}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const configs = {
      shift_swap: { color: "blue", icon: <SwapOutlined />, text: "Đổi ca" },
      pass_shift: { color: "orange", icon: <UserDeleteOutlined />, text: "Nhường ca" },
      day_off: { color: "purple", icon: <CalendarOutlined />, text: "Nghỉ phép" },
    };
    const config = configs[type as keyof typeof configs] || configs.shift_swap;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requester_id",
      key: "requester_id",
      render: (id: string) => id || "N/A",
    },
    {
      title: "Từ ca",
      dataIndex: "from_shift_id",
      key: "from_shift_id",
      render: (id: string | null) => id || "-",
    },
    {
      title: "Sang ca",
      dataIndex: "to_shift_id",
      key: "to_shift_id",
      render: (id: string | null) => id || "-",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
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
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: ScheduleChangeRequest) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedRequest(record);
              setViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={stats.total}
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

      {/* Action buttons */}
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Table */}
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      {/* Create Modal */}
      <Modal
        title="Tạo yêu cầu thay đổi lịch"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        width={600}
        okText="Tạo yêu cầu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Loại yêu cầu"
            name="type"
            initialValue="shift_swap"
          >
            <Select onChange={(value) => setRequestType(value)}>
              <Select.Option value="shift_swap">Đổi ca</Select.Option>
              <Select.Option value="pass_shift">Nhường ca</Select.Option>
              <Select.Option value="day_off">Nghỉ phép</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Người yêu cầu"
            name="requester_id"
            rules={[{ required: true, message: "Vui lòng chọn người yêu cầu" }]}
          >
            <Select {...employeeSelectProps} placeholder="Chọn nhân viên" showSearch />
          </Form.Item>

          {(requestType === "shift_swap" || requestType === "pass_shift") && (
            <Form.Item
              label="Từ ca"
              name="from_shift_id"
              rules={[{ required: true, message: "Vui lòng chọn ca" }]}
            >
              <Select {...shiftSelectProps} placeholder="Chọn ca hiện tại" showSearch />
            </Form.Item>
          )}

          {requestType === "shift_swap" && (
            <>
              <Form.Item
                label="Sang ca"
                name="to_shift_id"
                rules={[{ required: true, message: "Vui lòng chọn ca" }]}
              >
                <Select {...shiftSelectProps} placeholder="Chọn ca muốn đổi" showSearch />
              </Form.Item>
              <Form.Item
                label="Đổi với nhân viên"
                name="target_employee_id"
              >
                <Select {...employeeSelectProps} placeholder="Chọn nhân viên" showSearch />
              </Form.Item>
            </>
          )}

          {requestType === "pass_shift" && (
            <Form.Item
              label="Người nhận ca"
              name="replacement_employee_id"
            >
              <Select {...employeeSelectProps} placeholder="Chọn người nhận ca" showSearch />
            </Form.Item>
          )}

          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do yêu cầu" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View/Action Modal */}
      <Modal
        title="Chi tiết yêu cầu"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedRequest(null);
        }}
        footer={
          selectedRequest?.status === "pending" ? (
            <Space>
              <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
              <Button danger onClick={() => handleReject(selectedRequest.id)}>
                Từ chối
              </Button>
              <Button type="primary" onClick={() => handleApprove(selectedRequest.id)}>
                Duyệt
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
          )
        }
        width={700}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
            <Descriptions.Item label="Loại">{getTypeTag(selectedRequest.type)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedRequest.status)}</Descriptions.Item>
            <Descriptions.Item label="Người yêu cầu">{selectedRequest.requester_id}</Descriptions.Item>
            {selectedRequest.from_shift_id && (
              <Descriptions.Item label="Từ ca">{selectedRequest.from_shift_id}</Descriptions.Item>
            )}
            {selectedRequest.to_shift_id && (
              <Descriptions.Item label="Sang ca">{selectedRequest.to_shift_id}</Descriptions.Item>
            )}
            {selectedRequest.target_employee_id && (
              <Descriptions.Item label="Nhân viên liên quan">{selectedRequest.target_employee_id}</Descriptions.Item>
            )}
            {selectedRequest.replacement_employee_id && (
              <Descriptions.Item label="Người thay thế">{selectedRequest.replacement_employee_id}</Descriptions.Item>
            )}
            <Descriptions.Item label="Lý do">{selectedRequest.reason || "-"}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedRequest.created_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedRequest.approved_at && (
              <Descriptions.Item label="Ngày duyệt">
                {dayjs(selectedRequest.approved_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
            {selectedRequest.approved_by && (
              <Descriptions.Item label="Người duyệt">{selectedRequest.approved_by}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
