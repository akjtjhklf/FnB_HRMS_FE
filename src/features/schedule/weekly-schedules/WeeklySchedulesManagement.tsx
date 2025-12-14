"use client";

import { useState, useMemo } from "react";
import { useTable } from "@refinedev/antd";
import {
  useCreate,
  useUpdate,
  useDelete,
  useGetIdentity,
} from "@refinedev/core";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  App,
  Space,
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Dropdown,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  MoreOutlined,
  SendOutlined,
  LockOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs, { DATE_FORMATS } from "@/lib/dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { WeeklySchedule } from "@/types/schedule";
import type {
  CreateWeeklyScheduleDto,
  UpdateWeeklyScheduleDto,
} from "@/types/schedule/weekly-schedule.types";
import { useCanManageSchedule } from "@/hooks/usePermissions";
import {
  usePublishSchedule,
  useFinalizeSchedule,
} from "@/hooks/useScheduleWorkflow";
import { ValidationChecker } from "../components/ValidationChecker";
import { useConfirmModalStore } from "@/store/confirmModalStore";
import { useRouter } from "next/navigation";

dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

/**
 * Weekly Schedules Management - Manager Only
 *
 * RBAC: Dynamic permissions based on user's role policies
 *
 * Features:
 * - CRUD weekly schedules
 * - Publish schedule (cho phép nhân viên đăng ký)
 * - Finalize schedule (khóa lịch)
 * - View schedule details với shifts
 * - Status workflow: draft → published → finalized
 */
export function WeeklySchedulesManagement() {
  const router = useRouter();
  const { message } = App.useApp();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishingScheduleId, setPublishingScheduleId] = useState<
    string | null
  >(null);

  // Get user for created_by field
  const { data: user } = useGetIdentity();

  // RBAC: Dynamic permission check
  const canManage = useCanManageSchedule();

  // Fetch weekly schedules với pagination
  const {
    tableProps,
    tableQuery: tableQueryResult,
    currentPage,
    setCurrentPage,
    pageCount,
  } = useTable<WeeklySchedule>({
    resource: "weekly-schedules",
    pagination: {
      // currentPage: 1,
      pageSize: 10,
    },
    // sorters: {
    //   initial: [{ field: "week_start", order: "desc" }],
    // },
    meta: {
      fields: ["*"],
    },
  });

  // Mutations
  const { mutate: createSchedule } = useCreate();
  const { mutate: updateSchedule } = useUpdate();
  const { mutate: deleteSchedule } = useDelete();

  // Workflow hooks
  const { publishSchedule: publishScheduleFn, isLoading: isPublishing } =
    usePublishSchedule();
  const { finalizeSchedule: finalizeScheduleFn, isLoading: isFinalizing } =
    useFinalizeSchedule();

  // Calculate stats
  const stats = useMemo(() => {
    const schedules = tableProps.dataSource || [];
    return {
      total: schedules.length,
      draft: schedules.filter((s) => s.status === "draft").length,
      published: schedules.filter((s) => s.status === "scheduled").length,
      finalized: schedules.filter((s) => s.status === "finalized").length,
    };
  }, [tableProps.dataSource]);

  // Handle create/update
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      const dto: CreateWeeklyScheduleDto | UpdateWeeklyScheduleDto = {
        week_start: values.week_range[0].format(DATE_FORMATS.DATE_ONLY),
        week_end: values.week_range[1].format(DATE_FORMATS.DATE_ONLY),
        created_by: user?.id || null,
        status: "draft",
        notes: values.notes || null,
      };

      if (editingId) {
        await new Promise((resolve, reject) => {
          updateSchedule(
            {
              resource: "weekly-schedules",
              id: editingId,
              values: dto,
            },
            {
              onSuccess: () => {
                message.success("✅ Cập nhật lịch tuần thành công!");
                handleCloseModal();
                tableQueryResult.refetch();
                resolve(true);
              },
              onError: (error: any) => {
                message.error(error?.message || "Có lỗi xảy ra khi cập nhật");
                reject(error);
              },
            }
          );
        });
      } else {
        await new Promise((resolve, reject) => {
          createSchedule(
            {
              resource: "weekly-schedules",
              values: dto,
            },
            {
              onSuccess: () => {
                message.success("✅ Tạo lịch tuần thành công!");
                handleCloseModal();
                tableQueryResult.refetch();
                resolve(true);
              },
              onError: (error: any) => {
                message.error(error?.message || "Có lỗi xảy ra khi tạo lịch");
                reject(error);
              },
            }
          );
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle publish with validation
  const handlePublish = async (id: string) => {
    setPublishingScheduleId(id);
    setPublishModalOpen(true);
  };

  const handlePublishConfirm = async () => {
    if (!publishingScheduleId) return;
    try {
      await publishScheduleFn(publishingScheduleId);
      tableQueryResult.refetch();
      message.success("✅ Công bố lịch tuần thành công!");
      setPublishModalOpen(false);
      setPublishingScheduleId(null);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi công bố lịch");
    }
  };

  // Handle finalize
  const handleFinalize = async (id: string) => {
    try {
      await finalizeScheduleFn(id);
      tableQueryResult.refetch();
      message.success("✅ Hoàn tất lịch tuần thành công!");
    } catch (error: any) {
      console.error("Finalize error:", error);
      message.error(error?.message || "Có lỗi xảy ra khi hoàn tất lịch");
    }
  };

  // Handle edit
  const handleEdit = (record: WeeklySchedule) => {
    if (record.status === "finalized") {
      message.warning("Không thể sửa lịch đã hoàn tất");
      return;
    }

    setEditingId(record.id);
    form.setFieldsValue({
      week_range: [dayjs(record.week_start), dayjs(record.week_end)],
      status: record.status,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  // Handle delete - moved inline to openConfirm callback for better loading state management

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  // RBAC Check
  if (!canManage) {
    return (
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <Card>
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%", textAlign: "center" }}
          >
            <WarningOutlined style={{ fontSize: "64px", color: "#faad14" }} />
            <Title level={3}>Bạn không có quyền truy cập trang này</Title>
            <Text type="secondary">
              Chỉ Quản lý mới có thể quản lý lịch tuần.
            </Text>
          </Space>
        </Card>
      </div>
    );
  }

  // Status renderer
  const getStatusTag = (status: string) => {
    const configs = {
      draft: { color: "default", text: "Nháp", icon: <EditOutlined /> },
      scheduled: {
        color: "processing",
        text: "Đã công bố",
        icon: <SendOutlined />,
      },
      published: {
        color: "processing",
        text: "Đã công bố",
        icon: <SendOutlined />,
      },
      finalized: { color: "success", text: "Hoàn tất", icon: <LockOutlined /> },
      cancelled: { color: "error", text: "Đã hủy", icon: <WarningOutlined /> },
    };
    const config = configs[status as keyof typeof configs] || configs.draft;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Handle view detail
  const handleViewDetail = (id: string) => {
    router.push(`/schedule/weekly/${id}`);
  };

  const columns = [
    {
      title: "Tuần làm việc",
      key: "week",
      render: (_: any, record: WeeklySchedule) => (
        <div>
          <Text strong>
            {dayjs(record.week_start).format(DATE_FORMATS.DISPLAY_DATE)} -{" "}
            {dayjs(record.week_end).format(DATE_FORMATS.DISPLAY_DATE)}
          </Text>
          <div style={{ fontSize: "12px", color: "#888" }}>
            Tuần {dayjs(record.week_start).isoWeek()} /{" "}
            {dayjs(record.week_start).year()}
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
      title: "Ngày công bố",
      dataIndex: "published_at",
      key: "published_at",
      width: 180,
      render: (date: string | null) =>
        date ? (
          dayjs(date).format(DATE_FORMATS.DISPLAY_DATETIME)
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (notes: string | null) =>
        notes || <Text type="secondary">-</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string | null) =>
        date ? dayjs(date).format(DATE_FORMATS.DISPLAY_DATETIME) : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: WeeklySchedule) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => handleViewDetail(record.id),
          },
        ];

        if (record.status === "draft") {
          menuItems.push(
            {
              key: "edit",
              icon: <EditOutlined />,
              label: "Chỉnh sửa",
              onClick: () => handleEdit(record),
            },
            {
              key: "publish",
              icon: <SendOutlined />,
              label: "Công bố",
              onClick: () => handlePublish(record.id),
            },
            {
              key: "delete",
              icon: <DeleteOutlined />,
              label: "Xóa",
              onClick: () => {
                openConfirm({
                  title: "Xóa lịch tuần",
                  content:
                    "Bạn có chắc muốn xóa lịch tuần này? Tất cả ca làm việc và yêu cầu vị trí sẽ bị xóa.",
                  okText: "Xóa",
                  cancelText: "Hủy",
                  type: "danger",
                  onConfirm: async () => {
                    return new Promise((resolve, reject) => {
                      deleteSchedule(
                        {
                          resource: "weekly-schedules",
                          id: record.id,
                        },
                        {
                          onSuccess: () => {
                            message.success("Xóa lịch tuần thành công");
                            tableQueryResult.refetch();
                            resolve();
                          },
                          onError: (error: any) => {
                            message.error(
                              error?.message || "Có lỗi xảy ra khi xóa"
                            );
                            reject(error);
                          },
                        }
                      );
                    });
                  },
                });
              },
            }
          );
        }

        if (record.status === "scheduled") {
          menuItems.push(
            {
              key: "edit",
              icon: <EditOutlined />,
              label: "Chỉnh sửa",
              onClick: () => handleEdit(record),
            },
            {
              key: "finalize",
              icon: <LockOutlined />,
              label: "Hoàn tất",
              onClick: () => {
                openConfirm({
                  title: "Hoàn tất lịch tuần",
                  content:
                    "Sau khi hoàn tất, lịch sẽ được khóa và không thể thay đổi. Bạn có chắc chắn?",
                  okText: "Hoàn tất",
                  cancelText: "Hủy",
                  type: "warning",
                  onConfirm: async () => {
                    await handleFinalize(record.id);
                  },
                });
              },
            }
          );
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button type="link" icon={<MoreOutlined />}>
              Thao tác
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ marginBottom: "8px" }}>
              <CalendarOutlined /> Quản Lý Lịch Tuần
            </Title>
            <Text type="secondary">Tạo và quản lý lịch làm việc theo tuần</Text>
          </Col>
          <Col>
            <Space>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => tableQueryResult.refetch()}
                loading={tableQueryResult.isFetching}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingId(null);
                  form.resetFields();
                  setModalOpen(true);
                }}
              >
                Tạo Lịch Tuần
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Info Alert */}
      <Alert
        message="Quy trình làm việc"
        description={
          <div>
            <div>
              1. <strong>Nháp</strong> - Tạo lịch tuần và thêm ca làm việc
            </div>
            <div>
              2. <strong>Công bố</strong> - Cho phép nhân viên đăng ký ca
            </div>
            <div>
              3. <strong>Hoàn tất</strong> - Khóa lịch và bắt đầu phân công
            </div>
          </div>
        }
        type="info"
        showIcon
        closable
        style={{ marginBottom: "24px" }}
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng lịch tuần"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nháp"
              value={stats.draft}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã công bố"
              value={stats.published}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SendOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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

      {/* Table */}
      <Card>
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} lịch tuần`,
            pageSizeOptions: ["10", "20", "50", "100"],
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>
              {editingId ? "Chỉnh Sửa Lịch Tuần" : "Tạo Lịch Tuần Mới"}
            </span>
          </Space>
        }
        open={modalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        width={600}
        okText={editingId ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        confirmLoading={submitting}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Tuần làm việc"
            name="week_range"
            rules={[
              { required: true, message: "Vui lòng chọn tuần làm việc" },
              {
                validator: (_, value) => {
                  if (!value || value.length !== 2) {
                    return Promise.resolve();
                  }
                  const [start, end] = value;
                  const days = end.diff(start, "day");
                  if (days !== 6) {
                    return Promise.reject(
                      new Error(
                        "Tuần làm việc phải đúng 7 ngày (Thứ 2 - Chủ nhật)"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="Chọn đúng 7 ngày liên tiếp (từ Thứ 2 đến Chủ nhật)"
          >
            <RangePicker
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
              placeholder={["Thứ 2 (Ngày bắt đầu)", "Chủ nhật (Ngày kết thúc)"]}
              disabledDate={(current) => {
                // Disable dates in the past
                return current && current < dayjs().startOf("day");
              }}
              picker="date"
              presets={[]}
            />
          </Form.Item>

          <Form.Item label="Ghi chú (không bắt buộc)" name="notes">
            <TextArea
              rows={3}
              placeholder="Ghi chú về lịch tuần này..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Sau khi tạo lịch tuần, bạn cần thêm các ca làm việc và công bố để nhân viên có thể đăng ký."
            type="info"
            showIcon
            style={{ marginTop: "16px" }}
          />
        </Form>
      </Modal>

      {/* Publish Validation Modal */}
      <Modal
        title="Công bố lịch tuần"
        open={publishModalOpen}
        onCancel={() => {
          setPublishModalOpen(false);
          setPublishingScheduleId(null);
        }}
        footer={null}
        width={700}
        maskClosable={false}
      >
        {publishingScheduleId && (
          <ValidationChecker
            scheduleId={publishingScheduleId}
            onValidated={handlePublishConfirm}
            onCancel={() => {
              setPublishModalOpen(false);
              setPublishingScheduleId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
