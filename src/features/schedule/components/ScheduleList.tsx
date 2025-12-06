"use client";

import { useState } from "react";
import { useList, useCreate, useDelete, useUpdate } from "@refinedev/core";
import { useTable, useSelect } from "@refinedev/antd";
import {
  Card,
  Button,
  Select,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  App,
  Statistic,
  Row,
  Col,
  Badge,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

interface WeeklySchedule {
  id: string;
  week_start: string;
  week_end: string;
  status: "draft" | "published" | "finalized";
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface ScheduleAssignment {
  id: string;
  schedule_id: string;
  shift_id: any;
  employee_id: string;
  position_id: any;
  source: "manual" | "auto";
  status: "assigned" | "tentative" | "swapped" | "cancelled";
  confirmed_by_employee: boolean;
  note?: string;
}

export const ScheduleList = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [autoScheduleModalOpen, setAutoScheduleModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Fetch weekly schedules
  const { tableProps: schedulesTableProps, tableQuery: query } =
    useTable<WeeklySchedule>({
      resource: "weekly-schedules",
      pagination: { pageSize: 20 },
      sorters: {
        initial: [{ field: "week_start", order: "desc" }],
      },
    });

  const schedules = query?.data?.data || [];

  // Fetch assignments for selected schedule
  const { tableProps: assignmentsTableProps, tableQuery: assignmentsQuery } =
    useTable<ScheduleAssignment>({
      resource: "schedule-assignments",
      filters: {
        permanent: selectedScheduleId
          ? [
              {
                field: "schedule_id",
                operator: "eq",
                value: selectedScheduleId,
              },
            ]
          : [],
      },
      queryOptions: {
        enabled: !!selectedScheduleId,
      },
    });

  const assignments = assignmentsQuery?.data?.data || [];

  // Fetch employees for display
  const { selectProps: employeeSelectProps } = useSelect({
    resource: "employees",
    optionLabel: (item: any) => `${item.first_name} ${item.last_name}`,
    optionValue: (item: any) => item.id,
  });

  // Fetch shifts for display
  const { selectProps: shiftSelectProps } = useSelect({
    resource: "shifts",
    optionLabel: (item: any) => item.name,
    optionValue: (item: any) => item.id,
  });

  // Mutations
  const { mutate: createSchedule } = useCreate();
  const { mutate: deleteSchedule } = useDelete();
  const { mutate: deleteAssignment } = useDelete();

  // Handle create schedule
  const handleCreateSchedule = async () => {
    try {
      const values = await createForm.validateFields();

      createSchedule(
        {
          resource: "weekly-schedules/with-shifts",
          values: {
            week_start: values.week_start.format("YYYY-MM-DD"),
            week_end: values.week_end.format("YYYY-MM-DD"),
            status: "draft",
          },
        },
        {
          onSuccess: () => {
            message.success("Tạo lịch tuần thành công!");
            setCreateModalOpen(false);
            createForm.resetFields();
            query.refetch();
          },
          onError: (error) => {
            message.error("Tạo lịch thất bại!");
            console.error(error);
          },
        }
      );
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Handle auto schedule
  const handleAutoSchedule = () => {
    if (!selectedScheduleId) {
      message.error("Vui lòng chọn lịch tuần");
      return;
    }

    createSchedule(
      {
        resource: "schedule-assignments/auto-schedule",
        values: {
          scheduleId: selectedScheduleId,
          overwriteExisting: false,
          dryRun: false,
        },
      },
      {
        onSuccess: () => {
          message.success("Xếp lịch tự động thành công!");
          setAutoScheduleModalOpen(false);
          assignmentsQuery.refetch();
        },
        onError: () => {
          message.error("Xếp lịch thất bại!");
        },
      }
    );
  };

  // Handle delete assignment
  const handleDeleteAssignment = (id: string) => {
    deleteAssignment(
      {
        resource: "schedule-assignments",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa phân công thành công!");
          assignmentsQuery.refetch();
        },
        onError: () => {
          message.error("Xóa thất bại!");
        },
      }
    );
  };

  // Handle delete schedule
  const handleDeleteSchedule = (id: string) => {
    deleteSchedule(
      {
        resource: "weekly-schedules",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa lịch tuần thành công!");
          if (selectedScheduleId === id) {
            setSelectedScheduleId(undefined);
          }
          query.refetch();
        },
        onError: () => {
          message.error("Xóa thất bại!");
        },
      }
    );
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      draft: { color: "default", text: "Nháp" },
      published: { color: "processing", text: "Đã xuất bản" },
      finalized: { color: "success", text: "Hoàn tất" },
    };
    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const selectedSchedule = schedules.find(
    (s: WeeklySchedule) => s.id === selectedScheduleId
  );

  // Schedule columns
  const scheduleColumns = [
    {
      title: "Tuần",
      key: "week",
      render: (_: any, record: WeeklySchedule) => (
        <div>
          <p className="font-medium text-gray-900">
            {dayjs(record.week_start).format("DD/MM")} -{" "}
            {dayjs(record.week_end).format("DD/MM/YYYY")}
          </p>
          <p className="text-xs text-gray-500">
            Tuần {dayjs(record.week_start).week()}
          </p>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
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
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: WeeklySchedule) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedScheduleId(record.id)}
          >
            Xem chi tiết
          </Button>
          {record.status === "draft" && (
            <Popconfirm
              title="Xóa lịch tuần"
              description="Bạn có chắc muốn xóa lịch này?"
              onConfirm={() => handleDeleteSchedule(record.id)}
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

  // Assignment columns
  const assignmentColumns = [
    {
      title: "Ca làm việc",
      dataIndex: "shift_id",
      key: "shift",
      render: (shift: any) => {
        const shiftName = typeof shift === "object" ? shift.name : "N/A";
        const timeRange =
          typeof shift === "object"
            ? `${shift.start_at} - ${shift.end_at}`
            : "";
        return (
          <div>
            <p className="font-medium text-gray-800">{shiftName}</p>
            <p className="text-xs text-gray-500">{timeRange}</p>
          </div>
        );
      },
    },
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee",
      render: (employeeId: string) => {
        const employee = employeeSelectProps.options?.find(
          (e: any) => e.value === employeeId
        );
        return employee?.label || "N/A";
      },
    },
    {
      title: "Vị trí",
      dataIndex: "position_id",
      key: "position",
      render: (position: any) => {
        const positionName =
          typeof position === "object" ? position.name : "N/A";
        return <Tag color="blue">{positionName}</Tag>;
      },
    },
    {
      title: "Nguồn",
      dataIndex: "source",
      key: "source",
      width: 100,
      render: (source: string) => (
        <Tag color={source === "auto" ? "purple" : "green"}>
          {source === "auto" ? "Tự động" : "Thủ công"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          assigned: { color: "success", text: "Đã phân" },
          tentative: { color: "warning", text: "Chờ xác nhận" },
          swapped: { color: "processing", text: "Đã đổi" },
          cancelled: { color: "error", text: "Đã hủy" },
        };
        const config =
          statusConfig[status as keyof typeof statusConfig] ||
          statusConfig.assigned;
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: "Xác nhận",
      dataIndex: "confirmed_by_employee",
      key: "confirmed",
      width: 100,
      align: "center" as const,
      render: (confirmed: boolean) =>
        confirmed ? (
          <CheckCircleOutlined className="text-green-600 text-lg" />
        ) : (
          <CloseCircleOutlined className="text-gray-400 text-lg" />
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: ScheduleAssignment) => (
        <Popconfirm
          title="Xóa phân công"
          description="Bạn có chắc muốn xóa?"
          onConfirm={() => handleDeleteAssignment(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger size="small">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarOutlined className="text-xl text-blue-600" />
            </div>
            Quản lý lịch làm việc
          </h1>
          <p className="text-gray-500 mt-2 ml-0 md:ml-[52px]">
            Xếp lịch và phân công ca làm việc
          </p>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo lịch tuần
          </Button>
        </Space>
      </div>

      {/* Weekly Schedules Table */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <Table
          {...schedulesTableProps}
          columns={scheduleColumns}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{
            ...schedulesTableProps.pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lịch tuần`,
          }}
        />
      </Card>

      {/* Schedule Detail Section */}
      {selectedSchedule && (
        <>
          {/* Stats Card */}
          <Card size="small" className="bg-blue-50 border-blue-200 mb-6">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Lịch tuần đã chọn"
                  value={`${dayjs(selectedSchedule.week_start).format(
                    "DD/MM"
                  )} - ${dayjs(selectedSchedule.week_end).format(
                    "DD/MM/YYYY"
                  )}`}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <div>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', marginBottom: '4px' }}>Trạng thái</div>
                  {getStatusTag(selectedSchedule.status)}
                </div>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Statistic
                  title="Phân công"
                  value={assignments.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ fontSize: "20px", color: "#1890ff" }}
                />
              </Col>
              <Col xs={24} md={8} className="flex items-center justify-end">
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => assignmentsQuery.refetch()}
                    loading={assignmentsQuery.isFetching}
                  >
                    Làm mới
                  </Button>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => setAutoScheduleModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Xếp lịch tự động
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Assignments Table */}
          <Card className="shadow-sm border border-gray-200">
            <Table
              {...assignmentsTableProps}
              columns={assignmentColumns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                ...assignmentsTableProps.pagination,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} phân công`,
              }}
            />
          </Card>
        </>
      )}

      {/* Create Schedule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined />
            <span>Tạo lịch tuần mới</span>
          </div>
        }
        open={createModalOpen}
        onOk={handleCreateSchedule}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item
            name="week_start"
            label="Ngày bắt đầu tuần"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="week_end"
            label="Ngày kết thúc tuần"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Auto Schedule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-purple-600" />
            <span>Xếp lịch tự động</span>
          </div>
        }
        open={autoScheduleModalOpen}
        onOk={handleAutoSchedule}
        onCancel={() => setAutoScheduleModalOpen(false)}
        okText="Xếp lịch"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <Card size="small" className="bg-purple-50 border-purple-200">
            <p className="text-sm text-gray-700">
              Hệ thống sẽ tự động xếp lịch dựa trên:
            </p>
            <ul className="mt-2 ml-6 text-sm text-gray-600 space-y-1 list-disc">
              <li>Đăng ký khả dụng của nhân viên</li>
              <li>Vị trí và ưu tiên đã chọn</li>
              <li>Yêu cầu số lượng cho mỗi ca</li>
              <li>Giới hạn giờ làm việc</li>
            </ul>
          </Card>
          <Card size="small" className="bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium">⚠️ Lưu ý:</p>
            <p className="text-sm text-yellow-700 mt-1">
              Các phân công thủ công hiện tại sẽ được giữ nguyên.
            </p>
          </Card>
        </div>
      </Modal>
    </div>
  );
};
