"use client";

import { useState, useMemo } from "react";
import { useTable } from "@refinedev/antd";
import { useCreate, useDelete, useList, useGetIdentity } from "@refinedev/core";
import {
    Table,
    Button,
    Modal,
    Form,
    App,
    Space,
    Popconfirm,
    Tag,
    Card,
    Row,
    Col,
    Statistic,
    Select,
    Alert,
    Descriptions,
    Calendar,
    Badge,
    Divider,
    Typography,
    Tooltip,
    Input,
    Checkbox,
    Empty,
    Tabs,
    Progress,
} from "antd";

const { TextArea } = Input;
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    UserOutlined,
    TeamOutlined,
    LockOutlined,
    StopOutlined,
} from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import type { Dayjs } from "dayjs";
import type { BadgeProps } from "antd";
import type {
    EmployeeAvailability,
    CreateEmployeeAvailabilityDto,
    Shift,
} from "@/types/schedule";
import type { CreateEmployeeAvailabilityPositionDto } from "@/types/schedule/employee-availability.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import { UserIdentity } from "@types";

const { Title, Text } = Typography;

/**
 * AvailabilityRegistration - Đăng ký Khả năng Làm việc
 *
 * Chức năng:
 * - Xem lịch ca làm việc dưới dạng Calendar
 * - Click vào ngày để đăng ký ca
 * - Priority tự động theo role (Manager: 10, Senior: 7, Junior: 5)
 * - Xem trạng thái đăng ký (pending/approved/rejected)
 *
 * Luồng:
 * 1. Xem Calendar với các ca đã công bố
 * 2. Click vào ngày → chọn ca
 * 3. Gửi đăng ký (priority tự động)
 */
export function AvailabilityRegistration() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [selectedAvailability, setSelectedAvailability] =
        useState<EmployeeAvailability | null>(null);
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get current user
    const { data: user } = useGetIdentity<UserIdentity>();

    // Debug: log user identity
    console.log("👤 Current User Identity:", {
        user,
        hasEmployee: !!user?.employee,
        employeeId: user?.employee?.id,
    });

    // Fetch user's availabilities
    const { tableProps } = useTable<EmployeeAvailability>({
        resource: "employee-availability",
        filters: {
            permanent: [
                {
                    field: "employee_id",
                    operator: "eq",
                    value: user?.employee?.id,
                },
            ],
        },
        sorters: {
            initial: [{ field: "created_at", order: "desc" }],
        },
        meta: {
            fields: [
                "*",
                "shift.id",
                "shift.shift_date",
                "shift.start_time",
                "shift.end_time",
                "shift.shift_type.name",
            ],
        },
    });

    const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
        resource: "employee-availability",
        pagination: { pageSize: 1000 },
        filters: [
            {
                field: "employee_id",
                operator: "eq",
                value: user?.employee?.id,
            },
        ],
        meta: {
            fields: ["*", "shift.id", "shift.shift_date", "shift.shift_type.name"],
        },
    });

    // Fetch availability positions to get registered positions per shift
    const { query: availabilityPositionsQuery } = useList<any>({
        resource: "employee-availability-positions",
        pagination: { pageSize: 1000 },
        meta: {
            fields: ["*", "availability_id", "position_id"],
        },
    });

    // Fetch published shifts with position requirements
    const { query: shiftsQuery } = useList<Shift>({
        resource: "shifts",
        pagination: { pageSize: 1000 },
        filters: [
            // {
            //   field: "weekly_schedules.status",
            //   operator: "in",
            //   value: ["scheduled", "published"],
            // },
        ],
        meta: {
            fields: ["*", "shift_type_id.*", "schedule_id.*"],
        },
    });

    // Fetch shift position requirements
    const { query: requirementsQuery } = useList<ShiftPositionRequirement>({
        resource: "shift-position-requirements",
        pagination: { mode: "off" },
        meta: {
            fields: ["*", "position.id", "position.name", "position.description", "position_id.*"],
        },
    });

    // Fetch weekly schedules to check status for registration eligibility
    const { query: weeklySchedulesQuery } = useList<any>({
        resource: "weekly-schedules",
        pagination: { mode: "off" },
    });

    // Mutations - use mutateAsync for proper Promise handling
    const { mutateAsync: createAvailabilityAsync } = useCreate();
    const { mutate: deleteAvailability } = useDelete();

    // Memoized data
    const availabilities = useMemo(
        () => availabilitiesQuery.data?.data || [],
        [availabilitiesQuery.data?.data]
    );
    const shifts = useMemo(
        () => shiftsQuery.data?.data || [],
        [shiftsQuery.data?.data]
    );
    const requirements = useMemo(
        () => requirementsQuery.data?.data || [],
        [requirementsQuery.data?.data]
    );
    const availabilityPositions = useMemo(
        () => availabilityPositionsQuery.data?.data || [],
        [availabilityPositionsQuery.data?.data]
    );
    const weeklySchedules = useMemo(
        () => weeklySchedulesQuery.data?.data || [],
        [weeklySchedulesQuery.data?.data]
    );

    // Map schedule_id to status for quick lookup (for registration eligibility check)
    const scheduleStatusMap = useMemo(() => {
        const map: Record<string, string> = {};
        weeklySchedules.forEach((schedule: any) => {
            map[schedule.id] = schedule.status;
        });
        return map;
    }, [weeklySchedules]);

    // Helper to get schedule status for a shift (from populated schedule_id)
    const getScheduleStatusForShift = (shift: Shift): string | null => {
        // If schedule_id is populated as an object, get status directly
        if (typeof shift.schedule_id === 'object' && shift.schedule_id) {
            const status = (shift.schedule_id as any)?.status || null;
            return status;
        }
        // Fallback: lookup from scheduleStatusMap if schedule_id is just an ID string
        const scheduleId = shift.schedule_id as string;
        if (!scheduleId) return null;
        return scheduleStatusMap[scheduleId] || null;
    };

    // Helper to check if registration is allowed for a shift
    // Only allow registration if schedule status is "scheduled" (not draft, finalized, or cancelled)
    const canRegisterForShift = (shift: Shift): boolean => {
        const status = getScheduleStatusForShift(shift);
        return status === "scheduled";
    };

    // Map availability_id to position_ids
    const positionsByAvailability = useMemo(() => {
        const map: Record<string, string[]> = {};
        availabilityPositions.forEach((ap: any) => {
            if (!map[ap.availability_id]) map[ap.availability_id] = [];
            map[ap.availability_id].push(ap.position_id);
        });
        return map;
    }, [availabilityPositions]);

    // Map shift_id to availability_id for current user
    const availabilityByShift = useMemo(() => {
        const map: Record<string, string> = {};
        availabilities.forEach((avail) => {
            map[avail.shift_id] = avail.id;
        });
        return map;
    }, [availabilities]);

    // Stats
    const stats = useMemo(() => {
        return {
            total: availabilities.length,
            thisWeek: availabilities.filter((a) => {
                const shift = shifts.find((s) => s.id === a.shift_id);
                return shift && dayjs(shift.shift_date).isSame(dayjs(), "week");
            }).length,
            upcoming: availabilities.filter((a) => {
                const shift = shifts.find((s) => s.id === a.shift_id);
                return shift && dayjs(shift.shift_date).isAfter(dayjs());
            }).length,
            totalPositions: availabilityPositions.length,
        };
    }, [availabilities, shifts, availabilityPositions]);

    // Map requirements to shifts
    const requirementsByShift = useMemo(() => {
        const map: Record<string, ShiftPositionRequirement[]> = {};
        requirements.forEach((req) => {
            if (!map[req.shift_id]) map[req.shift_id] = [];
            map[req.shift_id].push(req);
        });
        return map;
    }, [requirements]);

    // Count ALL registered employees by shift and position (not just current user)
    const registeredCountByShiftPosition = useMemo(() => {
        const map: Record<string, Record<string, number>> = {};
        // This should ideally come from a backend endpoint that counts all employee registrations
        // For now, we're only counting from current user's data (incomplete)
        availabilities.forEach((avail) => {
            if (!map[avail.shift_id]) map[avail.shift_id] = {};
            const positions = positionsByAvailability[avail.id] || [];
            positions.forEach((posId) => {
                map[avail.shift_id][posId] = (map[avail.shift_id][posId] || 0) + 1;
            });
        });
        return map;
    }, [availabilities, positionsByAvailability]);

    // Get user's registered positions for a shift
    const userRegisteredPositions = useMemo(() => {
        const map: Record<string, Set<string>> = {};
        availabilities.forEach((avail) => {
            if (!map[avail.shift_id]) map[avail.shift_id] = new Set();
            const positions = positionsByAvailability[avail.id] || [];
            positions.forEach((posId) => map[avail.shift_id].add(posId));
        });
        return map;
    }, [availabilities, positionsByAvailability]);

    // Group shifts by date for calendar
    const shiftsByDate = useMemo(() => {
        const map: Record<string, Shift[]> = {};
        shifts.forEach((shift) => {
            const dateKey = dayjs(shift.shift_date).format("YYYY-MM-DD");
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(shift);
        });
        return map;
    }, [shifts]);

    // Handle create registration for multiple positions
    // Flow: Create 1 availability → Create N availability-positions
    const handleRegister = async () => {
        // Prevent double-click
        if (isSubmitting) {
            console.log("⏳ Already submitting, ignoring click");
            return;
        }

        try {
            setIsSubmitting(true);

            if (selectedPositions.length === 0) {
                message.warning("Vui lòng chọn ít nhất 1 vị trí");
                setIsSubmitting(false);
                return;
            }

            if (!selectedShift || !user?.id) {
                message.error("Thiếu thông tin cần thiết");
                setIsSubmitting(false);
                return;
            }

            const values = await form.validateFields();

            // Check if availability already exists for this shift
            let availabilityId = availabilityByShift[selectedShift.id];

            // Debug log
            console.log("🔍 Register Debug:", {
                selectedShiftId: selectedShift.id,
                selectedShiftDate: selectedShift.shift_date,
                availabilityByShift,
                existingAvailabilityId: availabilityId,
                userAvailabilities: availabilities.map(a => ({ id: a.id, shift_id: a.shift_id })),
            });

            if (!availabilityId) {
                // Step 1: Create availability record if not exists
                const availabilityData: CreateEmployeeAvailabilityDto = {
                    employee_id: user?.employee?.id || "",
                    shift_id: selectedShift.id,
                    priority: 5,
                    note: values.note || null,
                    positions: selectedPositions,
                };

                // Use mutateAsync directly - it returns a Promise
                const availabilityResult = await createAvailabilityAsync({
                    resource: "employee-availability",
                    values: availabilityData,
                });

                availabilityId = availabilityResult?.data?.id;
            }

            if (!availabilityId) {
                throw new Error("Không tạo được availability");
            }

            // Step 2: Create availability-position records for each selected position
            // Filter out positions that are already registered
            const currentRegisteredPositions = positionsByAvailability[availabilityId] || [];
            const newPositions = selectedPositions.filter(posId => !currentRegisteredPositions.includes(posId));

            if (newPositions.length === 0) {
                message.info("Bạn đã đăng ký các vị trí này rồi");
                setRegisterModalOpen(false);
                setIsSubmitting(false);
                return;
            }

            const positionPromises = newPositions.map((positionId, index) => {
                const positionData: CreateEmployeeAvailabilityPositionDto = {
                    availability_id: availabilityId as string,
                    position_id: positionId,
                    preference_order: index + 1, // Order based on selection
                };

                // Use mutateAsync directly - it returns a Promise
                return createAvailabilityAsync({
                    resource: "employee-availability-positions",
                    values: positionData,
                });
            });

            await Promise.all(positionPromises);

            message.success(
                `Đăng ký thành công ${newPositions.length} vị trí cho ca làm việc!`
            );

            // Refetch both lists and WAIT for completion before closing modal
            // This prevents race condition where user could register again before data is updated
            await Promise.all([
                availabilitiesQuery.refetch(),
                availabilityPositionsQuery.refetch(),
            ]);

            // Only reset state after refetch is complete
            setRegisterModalOpen(false);
            setSelectedShift(null);
            setSelectedPositions([]);
            form.resetFields();
        } catch (error: any) {
            console.error("Registration error:", error);
            console.log("📛 Catch block - resetting state...");
            message.error(
                error?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại."
            );
            // Đóng modal và reset state ngay cả khi lỗi
            setIsSubmitting(false); // Reset immediately in catch
            setRegisterModalOpen(false);
            setSelectedShift(null);
            setSelectedPositions([]);
            form.resetFields();
        } finally {
            console.log("✅ Finally block - ensuring isSubmitting is false");
            setIsSubmitting(false);
        }
    };

    // Handle delete - deletes availability and cascade deletes positions
    const handleDelete = (id: string) => {
        deleteAvailability(
            {
                resource: "employee-availability",
                id,
            },
            {
                onSuccess: () => {
                    message.success("Xóa đăng ký thành công");
                    availabilitiesQuery.refetch();
                    availabilityPositionsQuery.refetch();
                },
                onError: (error: any) => {
                    message.error(error?.message || "Có lỗi xảy ra khi xóa đăng ký");
                },
            }
        );
    };

    // Render shift card
    const renderShiftCard = (shift: Shift) => {
        const shiftRequirements = requirementsByShift[shift.id] || [];
        const userRegistered = userRegisteredPositions[shift.id] || new Set();

        if (shiftRequirements.length === 0) return null;

        // Get shift_type object (Directus populates shift_type_id as object)
        const shiftType =
            typeof shift.shift_type_id === "object"
                ? shift.shift_type_id
                : shift.shift_type;

        // Check schedule status for registration eligibility
        const scheduleStatus = getScheduleStatusForShift(shift);
        const isRegistrationAllowed = canRegisterForShift(shift);
        const isDraft = scheduleStatus === "draft";
        const isFinalized = scheduleStatus === "finalized";
        const isCancelled = scheduleStatus === "cancelled";

        // Render status tag based on schedule status
        const renderRegistrationStatus = () => {
            // Priority 1: Check schedule status FIRST - locked states take precedence
            if (isFinalized) {
                return (
                    <Tag color="red" icon={<LockOutlined />}>
                        Đã đóng đăng ký
                    </Tag>
                );
            }

            if (isDraft) {
                return (
                    <Tag color="default" icon={<ClockCircleOutlined />}>
                        Chưa công bố
                    </Tag>
                );
            }

            if (isCancelled) {
                return (
                    <Tag color="default" icon={<StopOutlined />}>
                        Đã hủy
                    </Tag>
                );
            }

            // Priority 2: Check registration status (only when schedule allows)
            if (userRegistered.size > 0 && userRegistered.size === shiftRequirements.length) {
                return (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                        Đã đăng ký đủ
                    </Tag>
                );
            }

            if (userRegistered.size > 0) {
                return (
                    <Tag color="warning" icon={<ClockCircleOutlined />}>
                        Đã đăng ký {userRegistered.size}/{shiftRequirements.length}
                    </Tag>
                );
            }

            // Normal: can register
            return (
                <Button type="primary" icon={<PlusOutlined />}>
                    Đăng ký
                </Button>
            );
        };

        return (
            <Card
                key={shift.id}
                size="small"
                style={{
                    marginBottom: 12,
                    opacity: isRegistrationAllowed ? 1 : 0.7,
                    borderColor: isFinalized ? '#ff4d4f' : isDraft ? '#d9d9d9' : undefined,
                }}
                hoverable={isRegistrationAllowed}
                onClick={() => {
                    // Priority 1: Check locked states FIRST - ALWAYS block
                    if (isFinalized) {
                        message.warning("Lịch tuần đã hoàn tất. Không thể thay đổi đăng ký.");
                        return;
                    }
                    if (isDraft) {
                        message.info("Lịch tuần chưa được công bố. Vui lòng chờ quản lý công bố lịch.");
                        return;
                    }
                    if (isCancelled) {
                        message.error("Lịch tuần đã bị hủy.");
                        return;
                    }
                    // Priority 2: Check if already fully registered
                    if (userRegistered.size === shiftRequirements.length) {
                        message.info("Bạn đã đăng ký tất cả vị trí trong ca này");
                        return;
                    }
                    // Open registration modal
                    setSelectedShift(shift);
                    setSelectedPositions([]);
                    setRegisterModalOpen(true);
                }}
            >
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Space direction="vertical" size={4} style={{ width: "100%" }}>
                            <Text strong style={{ fontSize: 16 }}>
                                {dayjs(shift.shift_date).format("dddd, DD/MM/YYYY")}
                            </Text>
                            <Space>
                                {shiftType && (
                                    <Tag color={shiftType.color || "blue"}>{shiftType.name}</Tag>
                                )}
                                <Text type="secondary">
                                    {shiftType?.start_time || shift.start_at || "--:--"} -{" "}
                                    {shiftType?.end_time || shift.end_at || "--:--"}
                                </Text>
                            </Space>
                            <Space size={8} wrap>
                                {shiftRequirements.map((req) => {
                                    const registered =
                                        registeredCountByShiftPosition[shift.id]?.[
                                        req.position_id
                                        ] || 0;
                                    const isUserRegistered = userRegistered.has(req.position_id);
                                    const isFull = registered >= req.required_count;

                                    // Helper to get position name safely
                                    const positionName = req.position?.name || (req as any).position_id?.name || "Không xác định";

                                    return (
                                        <Tag
                                            key={req.id}
                                            color={
                                                isUserRegistered
                                                    ? "success"
                                                    : isFull
                                                        ? "default"
                                                        : "processing"
                                            }
                                            icon={<TeamOutlined />}
                                        >
                                            {positionName}: {registered}/{req.required_count}
                                            {isUserRegistered && " ✓"}
                                        </Tag>
                                    );
                                })}
                            </Space>
                        </Space>
                    </Col>
                    <Col>
                        {renderRegistrationStatus()}
                    </Col>
                </Row>
            </Card>
        );
    };

    const getDateTimeDisplay = (isoDateTime: string | null | undefined) => {
        return isoDateTime ? dayjs(isoDateTime).format("DD/MM/YYYY HH:mm") : "Chưa có";
    };

    const getStatusTag = (status: string) => {
        const configs = {
            pending: {
                color: "processing",
                icon: <ClockCircleOutlined />,
                text: "Chờ duyệt",
            },
            approved: {
                color: "success",
                icon: <CheckCircleOutlined />,
                text: "Đã duyệt",
            },
            rejected: { color: "error", icon: <DeleteOutlined />, text: "Từ chối" },
        };
        const config = configs[status as keyof typeof configs] || configs.pending;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    // Get shift details for an availability
    const getShiftForAvailability = (avail: EmployeeAvailability) => {
        return shifts.find((s) => s.id === avail?.shift_id);
    };

    const columns = [
        {
            title: "Ca làm việc",
            key: "shift",
            render: (_: any, record: EmployeeAvailability) => {
                const shift = getShiftForAvailability(record);
                if (!shift) return "Chưa có";
                return (
                    <div>
                        <div>
                            <strong>Ca làm việc</strong>
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                            {dayjs(shift.shift_date).format("DD/MM/YYYY")} •{" "}
                            {shift.start_at || "--:--"} - {shift.end_at || "--:--"}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Vị trí đăng ký",
            key: "positions",
            render: (_: any, record: EmployeeAvailability) => {
                const positions = positionsByAvailability[record.id] || [];
                return positions.length > 0 ? (
                    <Space wrap>
                        {positions.map((posId, idx) => (
                            <Tag key={posId} color="blue">
                                Vị trí {idx + 1}
                            </Tag>
                        ))}
                    </Space>
                ) : (
                    <Text type="secondary">Chưa có</Text>
                );
            },
        },
        {
            title: "Độ ưu tiên",
            dataIndex: "priority",
            key: "priority",
            width: 120,
            render: (priority: number) => (
                <Tag color={priority >= 8 ? "red" : priority >= 5 ? "blue" : "default"}>
                    {priority || 5}/10
                </Tag>
            ),
        },
        {
            title: "Ngày đăng ký",
            dataIndex: "created_at",
            key: "created_at",
            width: 150,
            render: (date: string) => getDateTimeDisplay(date),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right" as const,
            render: (_: any, record: EmployeeAvailability) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedAvailability(record);
                            setViewModalOpen(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    <Popconfirm
                        title="Hủy đăng ký"
                        description="Bạn có chắc muốn hủy đăng ký này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Hủy đăng ký"
                        cancelText="Không"
                    >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Hủy
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
            <style jsx global>{`
        .ant-picker-cell .ant-picker-cell-inner {
          height: auto !important;
          min-height: 24px;
        }
        .ant-picker-calendar-date-content {
          height: auto !important;
          overflow: visible !important;
        }
      `}</style>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <Title level={2} style={{ marginBottom: "8px" }}>
                    <CalendarOutlined /> Đăng ký Ca Làm Việc
                </Title>
                <Text type="secondary">
                    Chọn ngày trên lịch để xem và đăng ký ca làm việc. Độ ưu tiên được tự
                    động thiết lập theo vị trí của bạn.
                </Text>
            </div>

            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng đăng ký"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tuần này"
                            value={stats.thisWeek}
                            valueStyle={{ color: "#1890ff" }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Sắp tới"
                            value={stats.upcoming}
                            valueStyle={{ color: "#3f8600" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tổng vị trí"
                            value={stats.totalPositions}
                            valueStyle={{ color: "#722ed1" }}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* User Priority Info */}
            <Alert
                message={
                    <Space>
                        <InfoCircleOutlined />
                        <Text strong>Độ ưu tiên của bạn</Text>
                    </Space>
                }
                description="Độ ưu tiên được tự động xác định dựa trên vai trò của bạn."
                showIcon
                style={{ marginBottom: "24px" }}
            />

            {/* Available Shifts Calendar */}
            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Lịch Ca Làm Việc</span>
                    </Space>
                }
                style={{ marginBottom: "24px" }}
            >
                <Calendar
                    cellRender={(date: Dayjs, info) => {
                        // Only render for date cells, not month cells
                        if (info.type !== 'date') return null;

                        const dateKey = date.format("YYYY-MM-DD");
                        const dayShifts = shiftsByDate[dateKey] || [];

                        if (dayShifts.length === 0) return null;

                        return (
                            <div
                                style={{
                                    // QUAN TRỌNG: Để auto để nó tự giãn theo nội dung
                                    height: "auto",
                                    width: "100%",
                                    padding: "2px 0",
                                }}
                            >
                                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                    {dayShifts.map((shift) => {
                                        const shiftRequirements =
                                            requirementsByShift[shift.id] || [];
                                        const userRegistered =
                                            userRegisteredPositions[shift.id] || new Set();
                                        const hasRegistered = userRegistered.size > 0;
                                        const isFullyRegistered =
                                            userRegistered.size === shiftRequirements.length &&
                                            shiftRequirements.length > 0;

                                        const shiftType =
                                            typeof shift.shift_type_id === "object"
                                                ? shift.shift_type_id
                                                : shift.shift_type;

                                        // Check schedule status
                                        const scheduleStatus = getScheduleStatusForShift(shift);
                                        const isRegistrationAllowed = canRegisterForShift(shift);
                                        const isDraft = scheduleStatus === "draft";
                                        const isFinalized = scheduleStatus === "finalized";
                                        const isCancelled = scheduleStatus === "cancelled";

                                        // Màu nền và viền - adjusted based on schedule status
                                        let bgColor = isFullyRegistered
                                            ? "#f6ffed"
                                            : hasRegistered
                                                ? "#fff7e6"
                                                : "#f0f5ff";

                                        let borderColor = isFullyRegistered
                                            ? "#b7eb8f"
                                            : hasRegistered
                                                ? "#ffd591"
                                                : "#adc6ff";

                                        // Override colors for non-registrable states
                                        if (!isRegistrationAllowed && !hasRegistered) {
                                            if (isDraft) {
                                                bgColor = "#fafafa";
                                                borderColor = "#d9d9d9";
                                            } else if (isFinalized) {
                                                bgColor = "#fff2f0";
                                                borderColor = "#ffccc7";
                                            } else if (isCancelled) {
                                                bgColor = "#f5f5f5";
                                                borderColor = "#d9d9d9";
                                            }
                                        }

                                        return (
                                            <div
                                                key={shift.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Check if schedule is in locked state - ALWAYS block, regardless of hasRegistered
                                                    if (isFinalized) {
                                                        message.warning("Lịch tuần đã hoàn tất. Không thể thay đổi đăng ký.");
                                                        return;
                                                    }
                                                    if (isDraft) {
                                                        message.info("Lịch tuần chưa được công bố. Vui lòng chờ quản lý công bố lịch.");
                                                        return;
                                                    }
                                                    if (isCancelled) {
                                                        message.error("Lịch tuần đã bị hủy.");
                                                        return;
                                                    }
                                                    // Only allow opening modal if schedule is "scheduled"
                                                    setSelectedShift(shift);
                                                    setSelectedPositions([]);
                                                    setRegisterModalOpen(true);
                                                }}
                                                style={{
                                                    cursor: isRegistrationAllowed ? "pointer" : "not-allowed",
                                                    fontSize: 11,
                                                    padding: "4px 8px",
                                                    borderRadius: 4,
                                                    background: bgColor,
                                                    border: `1px solid ${borderColor}`,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "2px",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                    opacity: isRegistrationAllowed ? 1 : 0.7,
                                                }}
                                            >
                                                {/* Dòng 1: Tên ca + Icon */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {shiftType ? (
                                                        <Tag
                                                            color={shiftType.color || "blue"}
                                                            style={{
                                                                margin: 0,
                                                                fontSize: 10,
                                                                padding: "0 4px",
                                                                lineHeight: "16px",
                                                                border: "none",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {shiftType.name}
                                                        </Tag>
                                                    ) : (
                                                        <span style={{ fontWeight: 600, fontSize: 10 }}>
                                                            Ca làm việc
                                                        </span>
                                                    )}

                                                    {/* Icon trạng thái - Priority: locked states first, then registration status */}
                                                    {isFinalized ? (
                                                        <Tooltip title="Đã đóng đăng ký">
                                                            <LockOutlined style={{ fontSize: 10, color: '#ff4d4f' }} />
                                                        </Tooltip>
                                                    ) : isDraft ? (
                                                        <Tooltip title="Chưa công bố">
                                                            <ClockCircleOutlined style={{ fontSize: 10, color: '#999' }} />
                                                        </Tooltip>
                                                    ) : isCancelled ? (
                                                        <Tooltip title="Đã hủy">
                                                            <StopOutlined style={{ fontSize: 10, color: '#999' }} />
                                                        </Tooltip>
                                                    ) : hasRegistered ? (
                                                        <Tooltip
                                                            title={
                                                                isFullyRegistered
                                                                    ? "Đã đăng ký đủ"
                                                                    : "Đã đăng ký 1 phần"
                                                            }
                                                        >
                                                            <CheckCircleOutlined
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: isFullyRegistered
                                                                        ? "#52c41a"
                                                                        : "#faad14",
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    ) : null}
                                                </div>

                                                {/* Dòng 2: Thời gian */}
                                                <div
                                                    style={{
                                                        color: "#666",
                                                        fontSize: 10,
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <ClockCircleOutlined
                                                        style={{ marginRight: 4, fontSize: 10 }}
                                                    />
                                                    {shiftType?.start_time || "..."} -{" "}
                                                    {shiftType?.end_time || "..."}
                                                </div>

                                                {/* Dòng 3 (Optional): Hiển thị số lượng slot nếu cần thiết */}
                                                {/* <div style={{ fontSize: 9, color: '#888', textAlign: 'right' }}>
                    Slot: {userRegistered.size}/{shiftRequirements.length}
                </div> */}
                                            </div>
                                        );
                                    })}
                                </Space>
                            </div>
                        );
                    }}
                />
            </Card>

            <Divider />

            {/* Table */}
            <Card title="Lịch sử đăng ký">
                <Table
                    {...tableProps}
                    columns={columns}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Register Modal */}
            <Modal
                title={
                    <Space>
                        <TeamOutlined />
                        <span>Đăng ký Vị trí - Ca Làm Việc</span>
                    </Space>
                }
                open={registerModalOpen}
                onCancel={() => {
                    setRegisterModalOpen(false);
                    setSelectedShift(null);
                    setSelectedPositions([]);
                    setIsSubmitting(false);
                    form.resetFields();
                }}
                onOk={handleRegister}
                width={700}
                okText={`Đăng ký ${selectedPositions.length} vị trí`}
                cancelText="Hủy"
                okButtonProps={{
                    disabled: selectedPositions.length === 0 || isSubmitting,
                    loading: isSubmitting
                }}
                confirmLoading={isSubmitting}
            >
                {selectedShift &&
                    (() => {
                        const shiftType =
                            typeof selectedShift.shift_type_id === "object"
                                ? selectedShift.shift_type_id
                                : selectedShift.shift_type;
                        return (
                            <div style={{ marginTop: 16 }}>
                                {/* Shift Info */}
                                <Card
                                    size="small"
                                    style={{ marginBottom: 16, background: "#f0f5ff" }}
                                >
                                    <Space
                                        direction="vertical"
                                        size={4}
                                        style={{ width: "100%" }}
                                    >
                                        <Text strong style={{ fontSize: 16 }}>
                                            {dayjs(selectedShift.shift_date).format(
                                                "dddd, DD/MM/YYYY"
                                            )}
                                        </Text>
                                        <Space>
                                            {shiftType && (
                                                <Tag color={shiftType.color || "blue"}>
                                                    {shiftType.name}
                                                </Tag>
                                            )}
                                            <Text type="secondary">
                                                {shiftType?.start_time ||
                                                    selectedShift.start_at ||
                                                    "--:--"}{" "}
                                                - {shiftType?.end_time || selectedShift.end_at || "--:--"}
                                            </Text>
                                        </Space>
                                    </Space>
                                </Card>


                                {/* Position Selection */}
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ marginBottom: 8, display: "block" }}>
                                        Chọn vị trí muốn đăng ký:
                                    </Text>
                                    <Space
                                        direction="vertical"
                                        size={8}
                                        style={{ width: "100%" }}
                                    >
                                        {(requirementsByShift[selectedShift.id] || []).map(
                                            (req) => {
                                                const registered =
                                                    registeredCountByShiftPosition[selectedShift.id]?.[
                                                    req.position_id
                                                    ] || 0;
                                                const userRegistered = userRegisteredPositions[
                                                    selectedShift.id
                                                ]?.has(req.position_id);
                                                const isFull = registered >= req.required_count;
                                                const isSelected = selectedPositions.includes(
                                                    req.position_id
                                                );

                                                // Helper to get position name safely
                                                const positionName = req.position?.name || (req as any).position_id?.name || "Không xác định";
                                                const positionDesc = req.position?.description || (req as any).position_id?.description;

                                                return (
                                                    <Card
                                                        key={req.id}
                                                        size="small"
                                                        style={{
                                                            border: isSelected
                                                                ? "2px solid #1890ff"
                                                                : undefined,
                                                            background: userRegistered
                                                                ? "#f6ffed"
                                                                : undefined,
                                                        }}
                                                    >
                                                        <Row align="middle" gutter={16}>
                                                            <Col flex="auto">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    disabled={userRegistered || isFull}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedPositions([
                                                                                ...selectedPositions,
                                                                                req.position_id,
                                                                            ]);
                                                                        } else {
                                                                            setSelectedPositions(
                                                                                selectedPositions.filter(
                                                                                    (id) => id !== req.position_id
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <Space direction="vertical" size={2}>
                                                                        <Text strong>{positionName}</Text>
                                                                        {positionDesc && (
                                                                            <Text
                                                                                type="secondary"
                                                                                style={{ fontSize: 12 }}
                                                                            >
                                                                                {positionDesc}
                                                                            </Text>
                                                                        )}
                                                                    </Space>
                                                                </Checkbox>
                                                            </Col>
                                                            <Col>
                                                                <Space
                                                                    direction="vertical"
                                                                    size={4}
                                                                    align="end"
                                                                >
                                                                    <Progress
                                                                        type="circle"
                                                                        percent={Math.round(
                                                                            (registered / req.required_count) * 100
                                                                        )}
                                                                        width={50}
                                                                        format={() =>
                                                                            `${registered}/${req.required_count}`
                                                                        }
                                                                        status={isFull ? "success" : "normal"}
                                                                    />
                                                                    {userRegistered && (
                                                                        <Tag
                                                                            color="success"
                                                                            icon={<CheckCircleOutlined />}
                                                                        >
                                                                            Đã đăng ký
                                                                        </Tag>
                                                                    )}
                                                                    {!userRegistered && isFull && (
                                                                        <Tag color="default">Đã đủ người</Tag>
                                                                    )}
                                                                </Space>
                                                            </Col>
                                                        </Row>
                                                        {req.notes && (
                                                            <Alert
                                                                message={req.notes}
                                                                type="info"
                                                                showIcon
                                                                style={{ marginTop: 8 }}
                                                            />
                                                        )}
                                                    </Card>
                                                );
                                            }
                                        )}
                                    </Space>
                                </div>

                                <Form form={form} layout="vertical">
                                    <Form.Item label="Ghi chú chung (không bắt buộc)" name="note">
                                        <TextArea
                                            rows={3}
                                            placeholder="Ghi chú về khả năng làm việc, kinh nghiệm với các vị trí đã chọn..."
                                        />
                                    </Form.Item>
                                </Form>
                            </div>
                        );
                    })()}
            </Modal>

            {/* View Modal */}
            <Modal
                title="Chi tiết đăng ký"
                open={viewModalOpen}
                onCancel={() => {
                    setViewModalOpen(false);
                    setSelectedAvailability(null);
                }}
                footer={<Button onClick={() => setViewModalOpen(false)}>Đóng</Button>}
                width={600}
            >
                {selectedAvailability && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Ca làm việc">
                            {(() => {
                                const shift = getShiftForAvailability(selectedAvailability);
                                if (!shift) return "Chưa có";
                                return `Ca làm việc - ${dayjs(shift.shift_date).format(
                                    "DD/MM/YYYY"
                                )} (${shift.start_at || "--:--"} - ${shift.end_at || "--:--"})`;
                            })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí đăng ký">
                            {(() => {
                                const positions =
                                    positionsByAvailability[selectedAvailability.id] || [];
                                return positions.length > 0 ? (
                                    <Space wrap>
                                        {positions.map((posId, idx) => (
                                            <Tag key={posId} color="blue">
                                                Vị trí {idx + 1}
                                            </Tag>
                                        ))}
                                    </Space>
                                ) : (
                                    <Text type="secondary">Chưa có</Text>
                                );
                            })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Độ ưu tiên">
                            <Tag
                                color={
                                    selectedAvailability.priority &&
                                        selectedAvailability.priority >= 8
                                        ? "red"
                                        : selectedAvailability.priority &&
                                            selectedAvailability.priority >= 5
                                            ? "blue"
                                            : "default"
                                }
                            >
                                {selectedAvailability.priority || 5}/10
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày đăng ký">
                            {getDateTimeDisplay(selectedAvailability.created_at)}
                        </Descriptions.Item>
                        {selectedAvailability.note && (
                            <Descriptions.Item label="Ghi chú">
                                {selectedAvailability.note}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}
