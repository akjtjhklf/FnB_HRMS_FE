"use client";

import { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useCreate, useUpdate, useDelete, useList } from "@refinedev/core";
import {
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  App,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Alert,
  Input,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SendOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

interface WeeklySchedule {
  id: string;
  week_start: string;
  week_end: string;
  status: "draft" | "published" | "finalized";
  created_by?: string;
  published_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * WeeklySchedulesManagement - Quản lý Lịch Tuần
 * 
 * Chức năng:
 * - Tạo lịch tuần mới → Auto-generate shifts từ shift-types
 * - Công bố lịch (Publish) → Hiển thị cho nhân viên đăng ký
 * - Xem danh sách lịch theo trạng thái
 * - Xóa lịch nháp
 * 
 * Luồng:
 * 1. Tạo lịch tuần (POST /weekly-schedules/with-shifts)
 * 2. Hệ thống tự động tạo shifts cho mỗi ngày theo shift-types đã có
 * 3. Admin công bố lịch (status: draft → published)
 * 4. Nhân viên thấy lịch và đăng ký
 */
export function WeeklySchedulesManagement() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WeeklySchedule | null>(null);

  // Fetch schedules
  const { tableProps } = useTable<WeeklySchedule>({
    resource: "weekly-schedules",
    sorters: {
      initial: [{ field: "week_start", order: "desc" }],
    },
  });

  const { query: schedulesQuery } = useList<WeeklySchedule>({
    resource: "weekly-schedules",
  });

  const schedules = schedulesQuery.data?.data || [];

  // Mutations
  const { mutate: createSchedule } = useCreate();
  const { mutate: updateSchedule } = useUpdate();
  const { mutate: deleteSchedule } = useDelete();

  // Stats
  const stats = {
    total: schedules.length,
    draft: schedules.filter((s: WeeklySchedule) => s.status === "draft").length,
    published: schedules.filter((s: WeeklySchedule) => s.status === "published").length,
    finalized: schedules.filter((s: WeeklySchedule) => s.status === "finalized").length,
  };

  // Handle create with auto-generate shifts
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const weekStart = dayjs(values.week_range[0]);
      const weekEnd = dayjs(values.week_range[1]);

      createSchedule(
        {
          resource: "weekly-schedules/with-shifts",
          values: {
            week_start: weekStart.format("YYYY-MM-DD"),
            week_end: weekEnd.format("YYYY-MM-DD"),
            status: "draft",
            notes: values.notes || null,
          },
        },
        {
          onSuccess: () => {
            message.success("Tạo lịch tuần thành công! Đã tự động tạo ca làm việc.");
            setCreateModalOpen(false);
            form.resetFields();
            schedulesQuery.refetch();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi tạo lịch");
          },
        }
      );
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle publish
  const handlePublish = (id: string) => {
    updateSchedule(
      {
        resource: "weekly-schedules",
        id,
        values: {
          status: "published",
          published_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          message.success("Công bố lịch thành công! Nhân viên có thể đăng ký.");
          schedulesQuery.refetch();
          setViewModalOpen(false);
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Handle finalize
  const handleFinalize = (id: string) => {
    updateSchedule(
      {
        resource: "weekly-schedules",
        id,
        values: {
          status: "finalized",
        },
      },
      {
        onSuccess: () => {
          message.success("Hoàn tất lịch thành công!");
          schedulesQuery.refetch();
          setViewModalOpen(false);
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteSchedule(
      {
        resource: "weekly-schedules",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa lịch thành công");
          schedulesQuery.refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  const getStatusTag = (status: string) => {
    const configs = {
      draft: { color: "default", icon: <EyeOutlined />, text: "Nháp" },
      published: { color: "processing", icon: <SendOutlined />, text: "Đã công bố" },
      finalized: { color: "success", icon: <CheckCircleOutlined />, text: "Hoàn tất" },
    };
    const config = configs[status as keyof typeof configs] || configs.draft;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Tuần",
      key: "week",
      render: (_: any, record: WeeklySchedule) => (
        <div>
          <div>
            <strong>Tuần {dayjs(record.week_start).isoWeek()}</strong>
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {dayjs(record.week_start).format("DD/MM/YYYY")} - {dayjs(record.week_end).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Công bố lúc",
      dataIndex: "published_at",
      key: "published_at",
      width: 150,
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
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
      render: (_: any, record: WeeklySchedule) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSchedule(record);
              setViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === "draft" && (
            <>
              <Button
                type="link"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handlePublish(record.id)}
              >
                Công bố
              </Button>
              <Popconfirm
                title="Xóa lịch"
                description="Bạn có chắc muốn xóa lịch tuần này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === "published" && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleFinalize(record.id)}
            >
              Hoàn tất
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Quản lý Lịch Tuần</h1>

      <Alert
        message="Hướng dẫn"
        description="Tạo lịch tuần mới sẽ tự động tạo các ca làm việc theo loại ca đã cấu hình. Sau khi tạo, công bố lịch để nhân viên có thể đăng ký."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng lịch"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Nháp"
              value={stats.draft}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã công bố"
              value={stats.published}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SendOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hoàn tất"
              value={stats.finalized}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Action buttons */}
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setCreateModalOpen(true);
          }}
        >
          Tạo lịch tuần mới
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
        title="Tạo lịch tuần mới"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        width={600}
        okText="Tạo lịch"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Alert
            message="Lưu ý"
            description="Hệ thống sẽ tự động tạo các ca làm việc cho mỗi ngày trong tuần dựa trên loại ca đã cấu hình."
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          <Form.Item
            label="Chọn tuần"
            name="week_range"
            rules={[{ required: true, message: "Vui lòng chọn tuần" }]}
            tooltip="Chọn ngày bắt đầu và kết thúc của tuần"
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú về lịch tuần này (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết lịch tuần"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedSchedule(null);
        }}
        footer={
          selectedSchedule ? (
            <Space>
              <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
              {selectedSchedule.status === "draft" && (
                <Button type="primary" icon={<SendOutlined />} onClick={() => handlePublish(selectedSchedule.id)}>
                  Công bố lịch
                </Button>
              )}
              {selectedSchedule.status === "published" && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleFinalize(selectedSchedule.id)}>
                  Hoàn tất
                </Button>
              )}
            </Space>
          ) : (
            <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
          )
        }
        width={700}
      >
        {selectedSchedule && (
          <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
            <Descriptions.Item label="Tuần">
              Tuần {dayjs(selectedSchedule.week_start).isoWeek()} - Năm {dayjs(selectedSchedule.week_start).year()}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {dayjs(selectedSchedule.week_start).format("DD/MM/YYYY")} - {dayjs(selectedSchedule.week_end).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedSchedule.status)}
            </Descriptions.Item>
            {selectedSchedule.published_at && (
              <Descriptions.Item label="Công bố lúc">
                {dayjs(selectedSchedule.published_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedSchedule.created_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedSchedule.notes && (
              <Descriptions.Item label="Ghi chú">
                {selectedSchedule.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
