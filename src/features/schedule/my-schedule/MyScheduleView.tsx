"use client";

import { useState } from "react";
import { useList, useCreate, useGetIdentity } from "@refinedev/core";
import {
  Calendar,
  Badge,
  Card,
  Modal,
  Descriptions,
  Tag,
  Button,
  Form,
  Select,
  Input,
  App,
  Alert,
  Space,
  Empty,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  SwapOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

interface ScheduleAssignment {
  id: string;
  shift_id: string | any;
  employee_id: string;
  position_id: string | any;
  assigned_at?: string;
  notes?: string;
  shift?: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    shift_type?: {
      name: string;
    };
    shift_type_id?: string | any;
  };
  position?: {
    id: string;
    name: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
}

/**
 * MyScheduleView - Lịch Làm việc Của Tôi
 * 
 * Chức năng:
 * - Xem lịch làm việc được phân công
 * - Hiển thị dạng Calendar
 * - Đổi ca (swap shift) với nhân viên khác
 * - Xem chi tiết từng ca
 * 
 * Luồng:
 * 1. Hiển thị các ca đã được phân công
 * 2. Click vào ca để xem chi tiết
 * 3. Chọn đổi ca → chọn nhân viên → tạo schedule-change-request
 * 4. Chờ nhân viên kia duyệt
 */
export function MyScheduleView() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ScheduleAssignment | null>(null);

  const { data: user } = useGetIdentity<any>();

  // Fetch my assignments (filter by current user)
  const { query: assignmentsQuery } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    pagination: { pageSize: 1000 },
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: user?.employee?.id,
      },
    ],
    // Try to request expanded fields, but we will fallback to manual join if needed
    meta: {
      fields: [
        "*",
        "shift.*",
        "shift.shift_type.id",
        "shift.shift_type.name",
        "position.*",
        "shift_id.*",
        "shift_id.shift_type.id",
        "shift_id.shift_type.name",
        "position_id.*"
      ],
    },
    queryOptions: {
      enabled: !!user?.employee?.id,
    },
  });

  // Fetch all shifts for manual join (fallback)
  const { query: shiftsQuery } = useList<any>({
    resource: "shifts",
    pagination: { pageSize: 1000 },
    meta: {
      fields: ["*", "shift_type.id", "shift_type.name"],
    },
  });

  // Fetch all positions for manual join (fallback)
  const { query: positionsQuery } = useList<any>({
    resource: "positions",
    pagination: { pageSize: 1000 },
  });

  // Fetch all shift types for manual join (fallback)
  const { query: shiftTypesQuery } = useList<any>({
    resource: "shift-types",
    pagination: { pageSize: 1000 },
    meta: {
      fields: ["id", "name"],
    },
  });

  // Fetch all employees for swap selection
  const { query: employeesQuery } = useList<Employee>({
    resource: "employees",
    pagination: { pageSize: 1000 },
    queryOptions: {
      enabled: swapModalOpen,
    },
  });

  const assignments = assignmentsQuery.data?.data || [];
  const shifts = shiftsQuery.data?.data || [];
  const positions = positionsQuery.data?.data || [];
  const shiftTypes = shiftTypesQuery.data?.data || [];
  const employees = employeesQuery.data?.data || [];

  // Mutation for creating swap request
  const { mutate: createSwapRequest } = useCreate();

  // Helper to get shift data safely and normalize it
  const getShift = (a: ScheduleAssignment) => {
    let shift: any = a.shift;

    // If shift is not in .shift, check .shift_id
    if (!shift) {
      if (typeof a.shift_id === 'object' && a.shift_id !== null) {
        shift = a.shift_id;
      } else {
        shift = shifts.find((s: any) => s.id === a.shift_id);
      }
    }

    if (!shift) return null;

    // Enrich shift_type if missing or just an ID
    if (!shift.shift_type || typeof shift.shift_type !== 'object') {
      // 1. Try from shifts list (if we have a full shift object there)
      const fullShift = shifts.find((s: any) => s.id === shift.id);
      if (fullShift?.shift_type && typeof fullShift.shift_type === 'object') {
        shift = { ...shift, shift_type: fullShift.shift_type };
      } else {
        // 2. Try from shiftTypes list using shift_type_id
        const shiftTypeId = shift.shift_type_id || shift.shift_type; // shift_type might be the ID
        if (shiftTypeId && typeof shiftTypeId === 'string') {
          const foundShiftType = shiftTypes.find((st: any) => st.id === shiftTypeId);
          if (foundShiftType) {
            shift = { ...shift, shift_type: foundShiftType };
          }
        }
      }
    }

    // Normalize fields (Directus might return different field names)
    return {
      ...shift,
      date: shift.date || shift.shift_date,
      start_time: shift.start_time || shift.start_at,
      end_time: shift.end_time || shift.end_at,
      shift_type: shift.shift_type || (shift.shift_type_id ? { name: "Ca làm việc" } : null)
    };
  };

  const getPosition = (a: ScheduleAssignment) => {
    if (a.position) return a.position;

    if (typeof a.position_id === 'object' && a.position_id !== null) {
      return a.position_id;
    }

    // Fallback: find in positions list
    return positions.find((p: any) => p.id === a.position_id);
  };

  // Stats
  const thisWeekAssignments = assignments.filter((a: ScheduleAssignment) => {
    const shift = getShift(a);
    if (!shift?.date) return false;
    const shiftDate = dayjs(shift.date);
    return shiftDate.isSame(dayjs(), "week");
  });

  const thisMonthAssignments = assignments.filter((a: ScheduleAssignment) => {
    const shift = getShift(a);
    if (!shift?.date) return false;
    const shiftDate = dayjs(shift.date);
    return shiftDate.isSame(dayjs(), "month");
  });

  // Get assignments for specific date
  const getAssignmentsForDate = (date: Dayjs) => {
    return assignments.filter((a: ScheduleAssignment) => {
      const shift = getShift(a);
      if (!shift?.date) return false;
      return dayjs(shift.date).isSame(date, "day");
    });
  };

  // Calendar cell render
  const cellRender = (value: Dayjs, info: any) => {
    if (info.type !== 'date') return info.originNode;

    const dayAssignments = getAssignmentsForDate(value);
    if (dayAssignments.length === 0) return info.originNode;

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {dayAssignments.map((assignment: ScheduleAssignment) => {
          const shift = getShift(assignment);
          const shiftName = shift?.shift_type?.name || "Ca làm việc";
          const startTime = shift?.start_time ? dayjs(shift.start_time).format("HH:mm") : "";
          const endTime = shift?.end_time ? dayjs(shift.end_time).format("HH:mm") : "";

          return (
            <li key={assignment.id} style={{ marginBottom: "4px" }}>
              <Badge
                status="success"
                text={
                  <span
                    style={{ cursor: "pointer", fontSize: "12px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssignment(assignment);
                      setViewModalOpen(true);
                    }}
                  >
                    {shiftName} ({startTime} - {endTime})
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>
    );
  };

  // Handle swap request
  const handleSwapRequest = async () => {
    if (!selectedAssignment) return;

    try {
      const values = await form.validateFields();

      createSwapRequest(
        {
          resource: "schedule-change-requests",
          values: {
            from_assignment_id: selectedAssignment.id,
            to_employee_id: values.to_employee_id,
            type: "shift_swap",
            reason: values.reason || null,
            status: "pending",
          },
        },
        {
          onSuccess: () => {
            message.success("Yêu cầu đổi ca đã được gửi! Chờ nhân viên kia duyệt.");
            setSwapModalOpen(false);
            form.resetFields();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi gửi yêu cầu đổi ca");
          },
        }
      );
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Helper to render assignment details with fallback data
  const renderAssignmentDetails = () => {
    if (!selectedAssignment) return null;
    const shift = getShift(selectedAssignment);
    const position = getPosition(selectedAssignment);

    if (!shift) return null;

    return (
      <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
        <Descriptions.Item label="Ca làm việc">
          <strong>{shift.shift_type?.name || "Ca làm việc"}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày">
          {dayjs(shift.date).format("dddd, DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Giờ làm việc">
          <Space>
            <ClockCircleOutlined />
            <span>
              {dayjs(shift.start_time).format("HH:mm")} - {dayjs(shift.end_time).format("HH:mm")}
            </span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Vị trí">
          <Tag color="blue">{position?.name || "N/A"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phân công lúc">
          {selectedAssignment.assigned_at
            ? dayjs(selectedAssignment.assigned_at).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Descriptions.Item>
        {selectedAssignment.notes && (
          <Descriptions.Item label="Ghi chú">
            {selectedAssignment.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Lịch Làm việc Của Tôi</h1>

      <Alert
        message="Hướng dẫn"
        description="Xem lịch làm việc được phân công. Click vào ca để xem chi tiết và đổi ca với đồng nghiệp."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng ca được phân"
              value={assignments.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca tuần này"
              value={thisWeekAssignments.length}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca tháng này"
              value={thisMonthAssignments.length}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Calendar */}
      <Card>
        {assignments.length > 0 ? (
          <Calendar
            value={selectedDate}
            onSelect={setSelectedDate}
            cellRender={cellRender}
          />
        ) : (
          <Empty description="Chưa có ca làm việc nào được phân công" />
        )}
      </Card>

      {/* View Assignment Modal */}
      <Modal
        title="Chi tiết ca làm việc"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedAssignment(null);
        }}
        footer={
          <Space>
            <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => {
                setViewModalOpen(false);
                setSwapModalOpen(true);
              }}
            >
              Đổi ca
            </Button>
          </Space>
        }
        width={700}
      >
        {renderAssignmentDetails()}
      </Modal>

      {/* Swap Request Modal */}
      <Modal
        title="Yêu cầu đổi ca"
        open={swapModalOpen}
        onCancel={() => {
          setSwapModalOpen(false);
          setSelectedAssignment(null);
          form.resetFields();
        }}
        onOk={handleSwapRequest}
        width={700}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Alert
            message="Lưu ý"
            description="Chọn nhân viên bạn muốn đổi ca. Họ sẽ nhận được thông báo và quyết định có chấp nhận hay không."
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          {selectedAssignment && (
            (() => {
              const shift = getShift(selectedAssignment);
              if (!shift) return null;
              return (
                <Alert
                  message="Ca làm việc của bạn"
                  description={`${shift.shift_type?.name || "Ca làm việc"} - ${dayjs(
                    shift.date
                  ).format("DD/MM/YYYY")} (${dayjs(shift.start_time).format("HH:mm")} - ${dayjs(shift.end_time).format("HH:mm")})`}
                  type="info"
                  style={{ marginBottom: "16px" }}
                />
              );
            })()
          )}

          <Form.Item
            label="Chọn nhân viên đổi ca"
            name="to_employee_id"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
            tooltip="Chọn đồng nghiệp bạn muốn đổi ca"
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
              loading={employeesQuery.isLoading}
            >
              {employees.map((employee: Employee) => (
                <Select.Option key={employee.id} value={employee.id}>
                  <Space>
                    <UserOutlined />
                    {employee.full_name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Lý do đổi ca"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do bạn muốn đổi ca (ví dụ: có việc gia đình, muốn nghỉ ngơi...)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
