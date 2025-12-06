"use client";

import { useMemo, useState } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import {
    Card,
    Select,
    Table,
    Typography,
    Empty,
    Spin,
    Modal,
    Form,
    InputNumber,
    message,
    Button,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import type { Shift } from "@/types/schedule/shift.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import type { WeeklySchedule } from "@/types/schedule/weekly-schedule.types";
import type { Position } from "@/types/employee";

// Components
import { DayHeader } from "./components/DayHeader";
import { ShiftTypeHeader } from "./components/ShiftTypeHeader";
import { RequirementCell } from "./components/RequirementCell";

const { Title, Text } = Typography;

export function ShiftRequirementsMatrixView() {
    const [selectedSchedule, setSelectedSchedule] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRequirement, setEditingRequirement] = useState<ShiftPositionRequirement | null>(null);
    const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
    const [form] = Form.useForm();

    // Mutations
    const { mutate: createRequirement } = useCreate();
    const { mutate: updateRequirement } = useUpdate();
    const { mutate: deleteRequirement } = useDelete();

    // Fetch schedules
    const { query: schedulesQuery } = useList<WeeklySchedule>({
        resource: "weekly-schedules",
        filters: [{ field: "status", operator: "in", value: ["draft", "published"] }],
    });
    const schedules = schedulesQuery.data?.data || [];

    // Fetch shifts for selected schedule
    const { query: shiftsQuery } = useList<Shift>({
        resource: "shifts",
        queryOptions: { enabled: !!selectedSchedule },
        filters: selectedSchedule
            ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
            : [],
        meta: { fields: ["*", "shift_type_id.*"] },
        pagination: { pageSize: 100 },
    });
    const shifts = shiftsQuery.data?.data || [];

    // Fetch positions
    const { query: positionsQuery } = useList<Position>({
        resource: "positions",
        pagination: { pageSize: 100 },
    });
    const positions = positionsQuery.data?.data || [];

    // Get shift IDs for requirements query
    const shiftIds = useMemo(() => shifts.map((s: any) => s.id), [shifts]);

    // Fetch requirements
    const { query: requirementsQuery } = useList<ShiftPositionRequirement>({
        resource: "shift-position-requirements",
        queryOptions: { enabled: shiftIds.length > 0 },
        filters: shiftIds.length > 0
            ? [{ field: "shift_id", operator: "in", value: shiftIds }]
            : [],
        meta: { fields: ["*", "position_id.*"] },
        pagination: { pageSize: 500 },
    });
    const requirements = requirementsQuery.data?.data || [];

    // Get selected schedule info
    const selectedScheduleInfo = schedules.find((s: any) => s.id === selectedSchedule);
    const scheduleStartDate = selectedScheduleInfo
        ? dayjs(selectedScheduleInfo.week_start || selectedScheduleInfo.week_start)
        : null;

    // Get unique shift types
    const shiftTypes = useMemo(() => {
        const types = new Map();
        shifts.forEach((shift: any) => {
            const shiftType = shift.shift_type || shift.shift_type_id;
            if (shiftType && typeof shiftType === 'object') {
                types.set(shiftType.id, shiftType);
            }
        });
        return Array.from(types.values());
    }, [shifts]);

    // Modal handlers
    const handleAdd = (shiftId: string) => {
        setSelectedShiftId(shiftId);
        setEditingRequirement(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (req: ShiftPositionRequirement) => {
        setEditingRequirement(req);
        setSelectedShiftId(req.shift_id);
        form.setFieldsValue({
            position_id: req.position_id,
            required_count: req.required_count,
            notes: req.notes,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRequirement(null);
        setSelectedShiftId(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingRequirement) {
                updateRequirement(
                    {
                        resource: "shift-position-requirements",
                        id: editingRequirement.id,
                        values: {
                            ...values,
                        },
                    },
                    {
                        onSuccess: () => {
                            message.success("Cập nhật thành công");
                            handleCloseModal();
                            requirementsQuery.refetch();
                        },
                    }
                );
            } else {
                if (!selectedShiftId) return;
                createRequirement(
                    {
                        resource: "shift-position-requirements",
                        values: {
                            ...values,
                            shift_id: selectedShiftId,
                        },
                    },
                    {
                        onSuccess: () => {
                            message.success("Thêm yêu cầu thành công");
                            handleCloseModal();
                            requirementsQuery.refetch();
                        },
                    }
                );
            }
        } catch (error) {
            console.error("Validation error:", error);
        }
    };

    const handleDelete = () => {
        if (!editingRequirement) return;
        deleteRequirement(
            {
                resource: "shift-position-requirements",
                id: editingRequirement.id,
            },
            {
                onSuccess: () => {
                    message.success("Xóa thành công");
                    handleCloseModal();
                    requirementsQuery.refetch();
                },
            }
        );
    };

    // Build matrix data
    const matrixData = useMemo(() => {
        if (!scheduleStartDate) return [];

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = scheduleStartDate.add(i, 'day');
            const dayData: any = {
                key: i,
                date: date,
            };

            shiftTypes.forEach((shiftType: any) => {
                const shift = shifts.find((s: any) => {
                    const shiftDate = dayjs(s.shift_date).format('YYYY-MM-DD');
                    const targetDate = date.format('YYYY-MM-DD');
                    const shiftTypeId = s.shift_type?.id || s.shift_type_id;
                    return shiftDate === targetDate && shiftTypeId === shiftType.id;
                });

                if (shift) {
                    const shiftReqs = requirements.filter((r: any) => r.shift_id === shift.id);
                    dayData[`shift_${shiftType.id} `] = {
                        shift,
                        requirements: shiftReqs,
                    };
                } else {
                    dayData[`shift_${shiftType.id} `] = null;
                }
            });

            days.push(dayData);
        }

        return days;
    }, [scheduleStartDate, shifts, shiftTypes, requirements]);

    // Build columns
    const columns = useMemo(() => {
        const cols: any[] = [
            {
                title: "Ngày",
                dataIndex: "date",
                key: "date",
                width: 140,
                fixed: 'left',
                render: (date: dayjs.Dayjs) => <DayHeader date={date} />,
            },
        ];

        shiftTypes.forEach((shiftType: any) => {
            cols.push({
                title: <ShiftTypeHeader name={shiftType.name || shiftType.type_name} color={shiftType.color_code} />,
                dataIndex: `shift_${shiftType.id} `,
                key: `shift_${shiftType.id} `,
                width: 220,
                render: (data: any) => (
                    <RequirementCell
                        shift={data?.shift || null}
                        requirements={data?.requirements || []}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                    />
                ),
            });
        });

        return cols;
    }, [shiftTypes]);

    const scheduleOptions = schedules.map((s: any) => ({
        label: `${s.schedule_name || "Lịch tuần"} (${dayjs(s.week_start).format("DD/MM/YYYY")} - ${dayjs(s.week_end).format("DD/MM/YYYY")})`,
        value: s.id,
    }));

    const isLoading = shiftsQuery.isLoading || requirementsQuery.isLoading;

    return (
        <div className="p-6">
            <Card>
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <Title level={3} className="mb-1">
                            <CalendarOutlined className="mr-2" />
                            Yêu Cầu Ca Làm Việc
                        </Title>
                        <Text type="secondary">
                            Quản lý định biên nhân sự theo ca và ngày
                        </Text>
                    </div>
                    <div className="w-64">
                        <Select
                            placeholder="Chọn lịch tuần"
                            value={selectedSchedule}
                            onChange={setSelectedSchedule}
                            options={scheduleOptions}
                            className="w-full"
                            size="large"
                        />
                    </div>
                </div>

                {!selectedSchedule ? (
                    <Empty description="Vui lòng chọn lịch tuần để xem yêu cầu" />
                ) : isLoading ? (
                    <div className="text-center py-12">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={matrixData}
                        pagination={false}
                        bordered
                        scroll={{ x: 'max-content' }}
                        className="shift-requirements-matrix"
                        rowClassName="align-top"
                    />
                )}
            </Card>

            <Modal
                title={editingRequirement ? "Cập nhật yêu cầu" : "Thêm yêu cầu vị trí"}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={[
                    editingRequirement && (
                        <Button key="delete" danger onClick={handleDelete} className="float-left">
                            Xóa
                        </Button>
                    ),
                    <Button key="cancel" onClick={handleCloseModal}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit}>
                        Lưu
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="position_id"
                        label="Vị trí"
                        rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
                    >
                        <Select
                            placeholder="Chọn vị trí"
                            options={positions.map((p: any) => ({ label: p.name, value: p.id }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="required_count"
                        label="Số lượng cần"
                        rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx global>{`
    .shift - requirements - matrix.ant - table - cell {
    vertical - align: top;
    padding: 8px!important;
}
        .shift - requirements - matrix.ant - table - thead > tr > th {
    background: #fafafa;
    font - weight: 600;
    text - align: center;
}
`}</style>
        </div>
    );
}
