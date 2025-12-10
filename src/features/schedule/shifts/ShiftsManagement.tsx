"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useList, useCreate, useUpdate, useDelete, useCustomMutation } from "@refinedev/core";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  TimePicker,
  message,
  Badge,
  Popconfirm,
  Empty,
  Tag,
  Tooltip,
  Space,
  Spin,
  Alert,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import type {
  Shift,
  CreateShiftDto,
  UpdateShiftDto,
} from "@/types/schedule/shift.types";
import type { ShiftType } from "@/types/schedule/shift-type.types";
import type { WeeklySchedule } from "@/types/schedule/weekly-schedule.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
type Position = any;
import { useCanManageSchedule } from "@/hooks/usePermissions";
import { useBulkShifts } from "@/hooks/useScheduleWorkflow";
import { cn } from "@/lib/utils/cn";

const DAYS_OF_WEEK = [
  { value: 0, label: "Thứ 2", short: "T2" },
  { value: 1, label: "Thứ 3", short: "T3" },
  { value: 2, label: "Thứ 4", short: "T4" },
  { value: 3, label: "Thứ 5", short: "T5" },
  { value: 4, label: "Thứ 6", short: "T6" },
  { value: 5, label: "Thứ 7", short: "T7" },
  { value: 6, label: "Chủ nhật", short: "CN" },
];

export function ShiftsManagement() {
  const canManage = useCanManageSchedule();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedShiftTypes, setSelectedShiftTypes] = useState<string[]>([]);
  const { createBulkShifts, isLoading: isBulkCreating } = useBulkShifts();
  const [defaultPositionRequirements, setDefaultPositionRequirements] =
    useState<Array<{ position_id: string; required_count: number }>>([]);
  const [singleShiftPositionRequirements, setSingleShiftPositionRequirements] =
    useState<Array<{ position_id: string; required_count: number }>>([]);

  // Auto-select schedule from URL params (e.g., from detail page)
  useEffect(() => {
    const scheduleIdFromUrl = searchParams.get("schedule_id");
    if (scheduleIdFromUrl && !selectedSchedule) {
      setSelectedSchedule(scheduleIdFromUrl);
    }
  }, [searchParams, selectedSchedule]);

  // Fetch data
  const { query: schedulesQuery } = useList<WeeklySchedule>({
    resource: "weekly-schedules",
    filters: [
      { field: "status", operator: "in", value: ["draft", "published"] },
    ],
  });

  const { query: shiftTypesQuery } = useList<ShiftType>({
    resource: "shift-types",
    pagination: { pageSize: 100 },
    meta: { fields: ["*"] },
  });

  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { pageSize: 1000 },
    meta: { fields: ["id", "name"] },
  });

  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    pagination: { pageSize: 1000 },
    filters: selectedSchedule
      ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
      : [],
    meta: {
      fields: ["*", "shift_type.*"],
    },
  });
  const shiftsData = shiftsQuery.data?.data || [];
  const isLoading = shiftsQuery.isLoading;

  // Get shift IDs from current schedule's shifts
  const shiftIds = shiftsData.map((s: any) => s.id);

  // Query requirements filtered by shift IDs (only when we have shifts)
  const { query: requirementsQuery } = useList<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    pagination: { pageSize: 1000 }, // Need high limit for all requirements (shifts * positions)
    filters: shiftIds.length > 0
      ? [{ field: "shift_id", operator: "in", value: shiftIds }]
      : [],
    meta: { fields: ["*", "shift_id", "position_id"] },
    queryOptions: {
      enabled: shiftIds.length > 0,
    },
  });
  const requirementsData = requirementsQuery.data?.data || [];

  const { mutate: createShift, mutation: createMutation } = useCreate<Shift>();
  const isCreating = createMutation.isPending;
  const { mutate: updateShift, mutation: updateMutation } = useUpdate<Shift>();
  const isUpdating = updateMutation.isPending;
  const { mutate: deleteShift } = useDelete<Shift>();
  const { mutate: createBulkRequirements } = useCustomMutation();

  const schedules = schedulesQuery.data?.data || [];
  const shiftTypes = shiftTypesQuery.data?.data || [];
  const shifts = shiftsData || [];
  const requirements = requirementsData || [];
  const positions = positionsQuery.data?.data || [];

  // DEBUG: Log shifts data
  console.log("🔍 Shifts Management State:", {
    selectedSchedule,
    totalShifts: shifts.length,
    shiftsForThisSchedule: shifts.filter((s: any) => s.schedule_id === selectedSchedule).length,
    firstShift: shifts[0],
  });

  // Memoize select options to avoid re-render
  const scheduleOptions = schedules.map((s: any) => ({
    label: `${s.schedule_name || "Lịch tuần"} (${dayjs(s.week_start).format(
      "DD/MM/YYYY"
    )} - ${dayjs(s.week_end).format("DD/MM/YYYY")})`,
    value: s.id,
  }));

  const shiftTypeOptions = shiftTypes.map((st: any) => ({
    label: (
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: st.color_code || "#1890ff" }}
        />
        <span>{st.name || st.type_name}</span>
      </div>
    ),
    value: st.id,
  }));

  const positionOptions = positions.map((pos: any) => ({
    label: pos.name,
    value: pos.id,
  }));

  // Get selected schedule info
  const selectedScheduleInfo = schedules.find(
    (s: any) => s.id === selectedSchedule
  );
  const scheduleStartDate = selectedScheduleInfo
    ? dayjs(
      (selectedScheduleInfo as any).week_start ||
      (selectedScheduleInfo as any).start_date
    )
    : null;

  // Group shifts by day with actual dates
  const shiftsByDay = DAYS_OF_WEEK.map((day, index) => {
    // Calculate actual date: startDate + day offset (0-6)
    const actualDate = scheduleStartDate
      ? scheduleStartDate.add(index, "day")
      : null;
    return {
      ...day,
      date: actualDate,
      shifts: shifts.filter((s: any) => {
        if (!actualDate) return false;
        // Compare exact date (YYYY-MM-DD)
        const shiftDate = s.shift_date?.split('T')[0] || s.shift_date; // Handle ISO datetime format
        return shiftDate === actualDate.format("YYYY-MM-DD");
      }),
    };
  });

  const handleOpenModal = (shift?: Shift, dayOfWeek?: number) => {
    if (shift) {
      setEditingShift(shift);

      // Get shift_type to fill missing times
      const shiftType = typeof shift.shift_type === "object"
        ? shift.shift_type
        : shiftTypes.find((st: any) => st.id === shift.shift_type_id);

      console.log("🔍 Edit shift modal:", {
        shift,
        shiftType,
        shift_start: shift.start_at,
        shift_end: shift.end_at,
        type_start: shiftType?.start_time,
        type_end: shiftType?.end_time
      });

      form.setFieldsValue({
        ...shift,
        start_at: shift.start_at
          ? dayjs(shift.start_at, "HH:mm:ss")
          : (shiftType?.start_time ? dayjs(shiftType.start_time, "HH:mm:ss") : null),
        end_at: shift.end_at
          ? dayjs(shift.end_at, "HH:mm:ss")
          : (shiftType?.end_time ? dayjs(shiftType.end_time, "HH:mm:ss") : null),
        shift_date: dayjs(shift.shift_date),
      });
      // Load existing requirements for this shift
      const shiftReqs = getShiftRequirements(shift.id);
      setSingleShiftPositionRequirements(
        shiftReqs.map((r: any) => ({
          position_id: r.position_id,
          required_count: r.required_count,
        }))
      );
    } else {
      setEditingShift(null);
      form.resetFields();
      setSingleShiftPositionRequirements([]);
      if (dayOfWeek !== undefined && selectedSchedule) {
        const schedule = schedules.find((s: any) => s.id === selectedSchedule);
        if (schedule) {
          const startDate = dayjs(
            (schedule as any).week_start || (schedule as any).start_date
          );
          const shiftDate = startDate.add(dayOfWeek, 'day');
          form.setFieldsValue({ shift_date: shiftDate });
        }
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
    form.resetFields();
    setSingleShiftPositionRequirements([]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Calculate total_required from position requirements
      const totalRequired = singleShiftPositionRequirements.reduce(
        (sum, req) => sum + req.required_count,
        0
      );

      const shiftDateStr = values.shift_date.format("YYYY-MM-DD");

      const data: CreateShiftDto | UpdateShiftDto = {
        ...values,
        schedule_id: selectedSchedule,
        shift_date: shiftDateStr,
        start_at: values.start_at
          ? `${shiftDateStr}T${values.start_at.format("HH:mm:ss")}`
          : null,
        end_at: values.end_at
          ? `${shiftDateStr}T${values.end_at.format("HH:mm:ss")}`
          : null,
        total_required: totalRequired > 0 ? totalRequired : (values.total_required || 0),
      };

      if (editingShift) {
        updateShift(
          {
            resource: "shifts",
            id: editingShift.id,
            values: data,
          },
          {
            onSuccess: async () => {
              // Update requirements if any
              if (singleShiftPositionRequirements.length > 0) {
                try {
                  // Delete old requirements first (simple approach)
                  // Then create new ones
                  await new Promise<void>((resolve, reject) => {
                    createBulkRequirements(
                      {
                        url: `/shift-position-requirements/bulk`,
                        method: "post",
                        values: singleShiftPositionRequirements.map((req) => ({
                          shift_id: editingShift.id,
                          position_id: req.position_id,
                          required_count: req.required_count,
                        })),
                      },
                      {
                        onSuccess: () => {
                          requirementsQuery.refetch();
                          resolve();
                        },
                        onError: reject,
                      }
                    );
                  });
                } catch (err) {
                  console.error("Error updating requirements:", err);
                }
              }
              message.success("Cập nhật ca thành công");
              handleCloseModal();
              shiftsQuery.refetch();
            },
            onError: (error: any) => {
              message.error(error?.message || "Cập nhật ca thất bại");
            },
          }
        );
      } else {
        createShift(
          {
            resource: "shifts",
            values: data,
          },
          {
            onSuccess: async (response) => {
              // Create requirements if any
              if (singleShiftPositionRequirements.length > 0 && response?.data) {
                try {
                  await new Promise<void>((resolve, reject) => {
                    createBulkRequirements(
                      {
                        url: `/shift-position-requirements/bulk`,
                        method: "post",
                        values: singleShiftPositionRequirements.map((req) => ({
                          shift_id: response.data.id,
                          position_id: req.position_id,
                          required_count: req.required_count,
                        })),
                      },
                      {
                        onSuccess: () => {
                          requirementsQuery.refetch();
                          resolve();
                        },
                        onError: reject,
                      }
                    );
                  });
                } catch (err) {
                  console.error("Error creating requirements:", err);
                }
              }
              message.success("Tạo ca thành công");
              handleCloseModal();
              shiftsQuery.refetch();
            },
            onError: (error: any) => {
              message.error(error?.message || "Tạo ca thất bại");
            },
          }
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleDelete = (shiftId: string) => {
    deleteShift(
      {
        resource: "shifts",
        id: shiftId,
      },
      {
        onSuccess: () => {
          message.success("Xóa ca thành công");
        },
        onError: (error: any) => {
          message.error(error?.message || "Xóa ca thất bại");
        },
      }
    );
  };

  const getShiftRequirements = (shiftId: string) => {
    return requirements.filter((r: any) => r.shift_id === shiftId);
  };

  // Handle bulk create shifts for the whole week
  const handleBulkCreate = async () => {
    if (!selectedSchedule || selectedShiftTypes.length === 0) {
      message.warning("Vui lòng chọn loại ca");
      return;
    }

    if (defaultPositionRequirements.length === 0) {
      message.warning("Vui lòng thêm ít nhất 1 vị trí cần tuyển");
      return;
    }

    const schedule = schedules.find((s: any) => s.id === selectedSchedule);
    if (!schedule) return;

    const startDate = dayjs(
      (schedule as any).week_start || (schedule as any).start_date
    );
    const shiftsToCreate: CreateShiftDto[] = [];

    // Calculate total_required from position requirements
    const totalRequired = defaultPositionRequirements.reduce(
      (sum, req) => sum + req.required_count,
      0
    );

    // Generate shifts for each day of week (7 consecutive days from start date)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const shiftDate = startDate.add(dayOffset, "day");
      const dayOfWeek = shiftDate.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      // Map dayjs day (0=Sun) to our DAYS_OF_WEEK array (0=Mon)
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Create shift for each selected shift type
      selectedShiftTypes.forEach((shiftTypeId) => {
        const shiftType = shiftTypes.find((st: any) => st.id === shiftTypeId);
        shiftsToCreate.push({
          schedule_id: selectedSchedule,
          shift_type_id: shiftTypeId,
          shift_date: shiftDate.format("YYYY-MM-DD"),
          start_at: shiftType?.start_time,
          end_at: shiftType?.end_time,
          total_required: totalRequired,
          notes: `Tự động tạo cho ${DAYS_OF_WEEK[dayIndex]?.label || "Ngày"
            } (${shiftDate.format("DD/MM/YYYY")})`,
        });
      });
    }

    console.log("📅 Shifts to create:", shiftsToCreate.length, "shifts");
    console.log("📝 First shift sample:", shiftsToCreate[0]);
    console.log("📝 Last shift sample:", shiftsToCreate[shiftsToCreate.length - 1]);
    console.log("👥 Position requirements:", defaultPositionRequirements.length, "positions");

    try {
      // Step 1: Create shifts
      console.log("🚀 Calling createBulkShifts with", shiftsToCreate.length, "shifts...");
      const response = await createBulkShifts(shiftsToCreate);
      console.log("✅ Shifts created:", response.shifts?.length || 0, "shifts");
      console.log("📊 Full response:", JSON.stringify(response, null, 2));
      console.log("📊 Response structure:", {
        hasResponse: !!response,
        hasShifts: !!(response && response.shifts),
        isArray: !!(response && response.shifts && Array.isArray(response.shifts)),
        shiftsLength: response?.shifts?.length || 0,
        totalField: response?.total,
      });

      if (!response || !response.shifts || response.shifts.length === 0) {
        throw new Error("Backend không trả về shifts hoặc response rỗng");
      }

      console.log("🔍 First shift in response:", response.shifts[0]);
      console.log("🔍 Last shift in response:", response.shifts[response.shifts.length - 1]);

      // Step 2: Create position requirements for each shift
      if (response && response.shifts && Array.isArray(response.shifts)) {
        const requirementsToCreate: any[] = [];

        console.log(`🔄 Processing ${response.shifts.length} shifts with ${defaultPositionRequirements.length} position requirements`);

        response.shifts.forEach((shift: any, index: number) => {
          console.log(`  📌 Shift #${index + 1}:`, {
            id: shift.id,
            date: shift.shift_date,
            type: shift.shift_type_id
          });
          defaultPositionRequirements.forEach((req) => {
            requirementsToCreate.push({
              shift_id: shift.id,
              position_id: req.position_id,
              required_count: req.required_count,
            });
          });
        });

        console.log("👥 Total requirements to create:", requirementsToCreate.length);
        console.log("📝 First requirement:", requirementsToCreate[0]);
        console.log("📝 Last requirement:", requirementsToCreate[requirementsToCreate.length - 1]);
        const uniqueShiftIds = Array.from(new Set(requirementsToCreate.map(r => r.shift_id)));
        console.log("🔍 Unique shift IDs:", uniqueShiftIds.length, "shifts:", uniqueShiftIds);
        console.log(`🚀 About to call API: /api/shift-position-requirements/bulk with ${requirementsToCreate.length} items`);
        console.log(`📝 Sample requirements:`, requirementsToCreate.slice(0, 3));

        // Create all requirements using bulk API and WAIT for it to complete
        try {
          await new Promise<void>((resolve, reject) => {
            createBulkRequirements(
              {
                url: `/shift-position-requirements/bulk`,
                method: "post",
                values: requirementsToCreate,
              },
              {
                onSuccess: (data) => {
                  console.log("✅ Requirements created successfully:", data);
                  console.log("📊 Response data structure:", {
                    hasData: !!data,
                    dataKeys: data ? Object.keys(data) : [],
                    dataLength: Array.isArray(data) ? data.length : 'not array',
                  });
                  message.success(
                    `Đã tạo ${response.shifts.length} ca và ${requirementsToCreate.length} yêu cầu vị trí`
                  );
                  // Refetch data
                  shiftsQuery.refetch();
                  requirementsQuery.refetch();
                  resolve();
                },
                onError: (error: any) => {
                  console.error("❌ Error creating requirements:", error);
                  console.error("❌ Error details:", JSON.stringify(error, null, 2));
                  console.error("❌ Error stack:", error?.stack);
                  message.error(
                    `Đã tạo ${response.shifts.length} ca nhưng LỖI khi tạo yêu cầu vị trí: ${error?.message || 'Unknown error'}`
                  );
                  // Still refetch to see current state
                  shiftsQuery.refetch();
                  requirementsQuery.refetch();
                  reject(error);
                },
              }
            );
          });
        } catch (err) {
          console.error("❌ Exception in bulk requirements create:", err);
          message.error("Có lỗi nghiêm trọng khi tạo yêu cầu vị trí");
        }
      } else {
        console.warn("⚠️ Cannot create requirements - invalid response structure");
      }

      setIsBulkModalOpen(false);
      setSelectedShiftTypes([]);
      setDefaultPositionRequirements([]);
    } catch (error) {
      console.error("❌ Bulk create error:", error);
      message.error("Có lỗi xảy ra khi tạo ca");
    }
  };

  if (!canManage) {
    return (
      <Card>
        <Empty description="Bạn không có quyền quản lý ca làm việc" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarOutlined className="text-blue-600" />
              Quản lý Ca Làm Việc
            </h2>
            <p className="text-gray-600 mt-1">
              Tạo và quản lý ca làm việc trong tuần
            </p>
          </div>
          {selectedSchedule && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setIsBulkModalOpen(true)}
              size="large"
            >
              Tạo nhanh cả tuần
            </Button>
          )}
        </div>

        {/* Schedule Selector */}
        <div className="mt-4">
          <Select
            placeholder="Chọn lịch tuần"
            value={selectedSchedule}
            onChange={setSelectedSchedule}
            className="w-full md:w-96"
            size="large"
            options={scheduleOptions}
          />
        </div>
      </Card>

      {selectedSchedule ? (
        <div className="grid grid-cols-7 gap-3">
          {shiftsByDay.map((day) => (
            <div key={day.value} className="flex flex-col">
              {/* Day Header */}
              <div className="text-center mb-3 sticky top-0 bg-white z-10 pb-2">
                <div className="inline-flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    {day.short}
                  </span>
                  <span className="text-sm font-bold text-gray-800 mt-1">
                    {day.label}
                  </span>
                  {day.date && (
                    <span className="text-xs text-gray-600 mt-0.5">
                      {day.date.format("DD/MM/YYYY")}
                    </span>
                  )}
                </div>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal(undefined, day.value)}
                  className="mt-2 w-full"
                  size="small"
                >
                  Thêm ca
                </Button>
              </div>

              {/* Shifts */}
              <div className="space-y-2">
                {day.shifts.length > 0 ? (
                  day.shifts.map((shift: Shift) => {
                    const shiftReqs = getShiftRequirements(shift.id);
                    const shiftType =
                      typeof shift.shift_type === "object"
                        ? shift.shift_type
                        : shiftTypes.find(
                          (st: any) => st.id === shift.shift_type_id
                        );

                    return (
                      <Card
                        key={shift.id}
                        className="hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-400"
                        size="small"
                      >
                        <div className="space-y-2">
                          {/* Shift Type */}
                          <div className="flex items-center justify-between">
                            <Tag color={shiftType?.cross_midnight ? "red" : "blue"}>
                              {shiftType?.name || "Chưa có"}
                            </Tag>
                            <Space size="small">
                              <Tooltip title="Chỉnh sửa">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleOpenModal(shift)}
                                />
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <Popconfirm
                                  title="Xóa ca này?"
                                  onConfirm={() => handleDelete(shift.id)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>
                              </Tooltip>
                            </Space>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <ClockCircleOutlined className="text-blue-500" />
                            <span>
                              {(() => {
                                const startTime = shift.start_at
                                  ? (shift.start_at.includes('T') ? dayjs(shift.start_at).format('HH:mm') : shift.start_at.substring(0, 5))
                                  : (shiftType?.start_time ? (shiftType.start_time.includes('T') ? dayjs(shiftType.start_time).format('HH:mm') : shiftType.start_time.substring(0, 5)) : "--:--");
                                const endTime = shift.end_at
                                  ? (shift.end_at.includes('T') ? dayjs(shift.end_at).format('HH:mm') : shift.end_at.substring(0, 5))
                                  : (shiftType?.end_time ? (shiftType.end_time.includes('T') ? dayjs(shiftType.end_time).format('HH:mm') : shiftType.end_time.substring(0, 5)) : "--:--");
                                return `${startTime} - ${endTime}`;
                              })()}
                            </span>
                          </div>

                          {/* Total Required */}
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <UserOutlined className="text-green-500" />
                            <span>Cần {shift.total_required || 0} người</span>
                          </div>

                          {/* Requirements */}
                          {shiftReqs.length > 0 && (
                            <div className="space-y-1 pt-2 border-t">
                              {shiftReqs.map((req: any) => {
                                const position = positions.find(
                                  (p: any) => p.id === req.position_id
                                );
                                return (
                                  <div
                                    key={req.id}
                                    className="flex items-center justify-between text-xs px-2 py-1 rounded bg-gray-50"
                                  >
                                    <span className="truncate">
                                      {position?.name || "Chưa có"}
                                    </span>
                                    <Badge
                                      count={req.required_count}
                                      showZero
                                      style={{ backgroundColor: "#3b82f6" }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <Card size="small" className="border-dashed">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-xs text-gray-400">
                          Chưa có ca
                        </span>
                      }
                    />
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Empty description="Vui lòng chọn lịch tuần để quản lý ca" />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-600" />
            <span>{editingShift ? "Chỉnh sửa ca" : "Tạo ca mới"}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={
          <>
            <SaveOutlined /> {editingShift ? "Cập nhật" : "Tạo ca"}
          </>
        }
        cancelText="Hủy"
        width={600}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="shift_type_id"
            label="Loại ca"
            rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
          >
            <Select
              placeholder="Chọn loại ca"
              options={shiftTypeOptions}
              onChange={(value) => {
                const selectedType = shiftTypes.find((st: any) => st.id === value);
                if (selectedType) {
                  form.setFieldsValue({
                    start_at: selectedType.start_time ? dayjs(selectedType.start_time, "HH:mm:ss") : null,
                    end_at: selectedType.end_time ? dayjs(selectedType.end_time, "HH:mm:ss") : null,
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item name="shift_date" label="Ngày">
            <Input
              disabled
              value={form.getFieldValue('shift_date') ? dayjs(form.getFieldValue('shift_date')).format('DD/MM/YYYY (dddd)') : ''}
              className="bg-gray-50"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="start_at" label="Giờ bắt đầu">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>

            <Form.Item name="end_at" label="Giờ kết thúc">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>

          {/* Total required is auto-calculated from position requirements */}

          {/* Position Requirements Section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-800">
                👥 Yêu cầu vị trí cho ca này
              </label>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSingleShiftPositionRequirements([
                    ...singleShiftPositionRequirements,
                    { position_id: "", required_count: 1 },
                  ]);
                }}
              >
                Thêm vị trí
              </Button>
            </div>

            {singleShiftPositionRequirements.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Chưa có yêu cầu vị trí. Click &quot;Thêm vị trí&quot; để thêm.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {singleShiftPositionRequirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2"
                  >
                    <Select
                      placeholder="Chọn vị trí"
                      value={req.position_id || undefined}
                      onChange={(value) => {
                        const newReqs = [...singleShiftPositionRequirements];
                        newReqs[index].position_id = value;
                        setSingleShiftPositionRequirements(newReqs);
                      }}
                      className="flex-1"
                      showSearch
                      options={positionOptions}
                      optionFilterProp="label"
                      size="small"
                    />

                    <InputNumber
                      min={1}
                      max={50}
                      value={req.required_count}
                      onChange={(value) => {
                        const newReqs = [...singleShiftPositionRequirements];
                        newReqs[index].required_count = value || 1;
                        setSingleShiftPositionRequirements(newReqs);
                      }}
                      className="w-20"
                      size="small"
                    />

                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<MinusCircleOutlined />}
                      onClick={() => {
                        setSingleShiftPositionRequirements(
                          singleShiftPositionRequirements.filter(
                            (_, i) => i !== index
                          )
                        );
                      }}
                    />
                  </div>
                ))}

                {/* Total count */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                  <span className="text-sm text-blue-800 font-medium">
                    Tổng: {singleShiftPositionRequirements.reduce(
                      (sum, req) => sum + req.required_count,
                      0
                    )} người
                  </span>
                </div>
              </div>
            )}
          </div>

          <Form.Item name="notes" label="Ghi chú" className="mb-0">
            <Input.TextArea rows={3} placeholder="Ghi chú cho ca làm việc..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <ThunderboltOutlined
              className="text-yellow-500"
              style={{ fontSize: "18px" }}
            />
            <span className="text-lg font-semibold">
              Tạo nhanh ca cho cả tuần
            </span>
          </div>
        }
        open={isBulkModalOpen}
        onOk={handleBulkCreate}
        onCancel={() => {
          setIsBulkModalOpen(false);
          setSelectedShiftTypes([]);
          setDefaultPositionRequirements([]);
        }}
        okText={
          selectedShiftTypes.length > 0 &&
            defaultPositionRequirements.length > 0 ? (
            <>
              <SaveOutlined /> Tạo {selectedShiftTypes.length * 7} ca
            </>
          ) : (
            "Vui lòng chọn ca & vị trí"
          )
        }
        okButtonProps={{
          disabled:
            selectedShiftTypes.length === 0 ||
            defaultPositionRequirements.length === 0,
          style: { minWidth: "120px" },
        }}
        cancelText="Hủy"
        width={700}
        confirmLoading={isBulkCreating}
        centered
      >
        <div className="space-y-5 mt-4">
          {/* Info box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <InfoCircleOutlined
                className="text-blue-600 mt-0.5"
                style={{ minWidth: "20px" }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Cách hoạt động:</p>
                <p className="text-sm text-gray-700 mt-1">
                  Chọn các loại ca dưới đây. Hệ thống sẽ tự động tạo ca cho mỗi
                  ngày trong tuần.
                  <span className="font-medium">
                    {" "}
                    Ví dụ: 2 loại ca → 14 ca (2×7 ngày)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Schedule info with days breakdown */}
          {selectedSchedule && scheduleStartDate && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <span className="font-medium text-amber-900">📅 Tuần: </span>
                <span className="text-amber-800">
                  {scheduleStartDate.format("DD/MM/YYYY")} -{" "}
                  {scheduleStartDate.add(6, "day").format("DD/MM/YYYY")}
                </span>
              </div>

              {/* Days preview */}
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const actualDate = scheduleStartDate.day(day.value);
                  return (
                    <div
                      key={day.value}
                      className="bg-white border border-gray-200 rounded p-2 text-center"
                    >
                      <div className="text-xs text-gray-600">{day.short}</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {actualDate.format("DD/MM")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shift types selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">
                Chọn loại ca (có thể chọn nhiều)
              </label>
              {shiftTypes.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {selectedShiftTypes.length}/{shiftTypes.length} đã chọn
                </span>
              )}
            </div>

            {shiftTypes.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Empty
                  description={
                    <div>
                      <p className="text-gray-600">Không có loại ca nào</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Vui lòng tạo loại ca trước khi tạo nhanh
                      </p>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {shiftTypes.map((st: any) => {
                  const isSelected = selectedShiftTypes.includes(st.id);
                  return (
                    <Card
                      key={st.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        isSelected
                          ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                          : "border border-gray-300 hover:border-blue-300"
                      )}
                      onClick={() => {
                        if (selectedShiftTypes.includes(st.id)) {
                          setSelectedShiftTypes(
                            selectedShiftTypes.filter((id) => id !== st.id)
                          );
                        } else {
                          setSelectedShiftTypes([...selectedShiftTypes, st.id]);
                        }
                      }}
                      hoverable
                      size="small"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                                isSelected
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300 bg-white"
                              )}
                            >
                              {isSelected && (
                                <CheckOutlined
                                  className="text-white"
                                  style={{ fontSize: "12px" }}
                                />
                              )}
                            </div>
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: st.color_code || "#1890ff",
                              }}
                            />
                            <span className="font-semibold text-gray-900 text-sm leading-tight">
                              {st.name || st.type_name}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 mt-auto">
                          <div className="flex items-center gap-1">
                            <ClockCircleOutlined />
                            {st.start_time ||
                              st.default_start_time ||
                              "--:--"} -{" "}
                            {st.end_time || st.default_end_time || "--:--"}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Position Requirements Section */}
          {selectedShiftTypes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800">
                  👥 Yêu cầu vị trí cho mỗi ca
                </label>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setDefaultPositionRequirements([
                      ...defaultPositionRequirements,
                      { position_id: "", required_count: 1 },
                    ]);
                  }}
                >
                  Thêm vị trí
                </Button>
              </div>

              {defaultPositionRequirements.length === 0 ? (
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
                  <p className="text-sm text-orange-800 text-center">
                    ⚠️ Vui lòng thêm ít nhất 1 vị trí cần tuyển
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {defaultPositionRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3"
                    >
                      <Select
                        placeholder="Chọn vị trí"
                        value={req.position_id || undefined}
                        onChange={(value) => {
                          const newReqs = [...defaultPositionRequirements];
                          newReqs[index].position_id = value;
                          setDefaultPositionRequirements(newReqs);
                        }}
                        className="flex-1"
                        showSearch
                        options={positionOptions}
                        optionFilterProp="label"
                      />

                      <InputNumber
                        min={1}
                        max={50}
                        value={req.required_count}
                        onChange={(value) => {
                          const newReqs = [...defaultPositionRequirements];
                          newReqs[index].required_count = value || 1;
                          setDefaultPositionRequirements(newReqs);
                        }}
                        className="w-24"
                        addonAfter="người"
                      />

                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => {
                          setDefaultPositionRequirements(
                            defaultPositionRequirements.filter(
                              (_, i) => i !== index
                            )
                          );
                        }}
                      />
                    </div>
                  ))}

                  {/* Total count */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                    <span className="text-sm text-blue-800 font-medium">
                      Tổng:{" "}
                      {defaultPositionRequirements.reduce(
                        (sum, req) => sum + req.required_count,
                        0
                      )}{" "}
                      người/ca
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary section */}
          {selectedShiftTypes.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng cộng sẽ tạo:</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {selectedShiftTypes.length * 7}{" "}
                    <span className="text-base text-gray-600">ca</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedShiftTypes.length} loại ca × 7 ngày ={" "}
                    {selectedShiftTypes.length * 7} ca
                  </p>
                  {defaultPositionRequirements.length > 0 && (
                    <p className="text-xs text-green-700 mt-2 font-medium">
                      +{" "}
                      {selectedShiftTypes.length *
                        7 *
                        defaultPositionRequirements.length}{" "}
                      yêu cầu vị trí
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="bg-white rounded-lg p-3 inline-block">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Loại ca</p>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedShiftTypes.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <span className="font-medium">💡 Mẹo: </span>
            Các ca sẽ được tạo với trạng thái nháp và bạn có thể chỉnh sửa hoặc
            xóa trước khi công bố lịch.
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ShiftsManagement;
