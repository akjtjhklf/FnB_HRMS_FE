"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Card, Badge, Modal, Checkbox, Button, Tag, Empty } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Shift, ShiftPositionRequirement, Position } from "@/types/schedule";
import { cn } from "@/lib/utils/cn";

interface WeekCalendarProps {
  shifts: Shift[];
  requirements: Record<string, ShiftPositionRequirement[]>; // shift_id -> requirements
  positions: Position[];
  userAvailabilities?: Record<string, string[]>; // shift_id -> position_ids
  onRegister: (shiftId: string, positionIds: string[]) => void;
  onUnregister?: (shiftId: string) => void;
  loading?: boolean;
  readonly?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Chủ nhật", short: "CN" },
  { value: 1, label: "Thứ 2", short: "T2" },
  { value: 2, label: "Thứ 3", short: "T3" },
  { value: 3, label: "Thứ 4", short: "T4" },
  { value: 4, label: "Thứ 5", short: "T5" },
  { value: 5, label: "Thứ 6", short: "T6" },
  { value: 6, label: "Thứ 7", short: "T7" },
];

// Helper function to get shift name from shift_type
const getShiftName = (shift: Shift): string => {
  if (shift.shift_type?.name) return shift.shift_type.name;
  if (typeof shift.shift_type_id === 'object' && shift.shift_type_id?.name) {
    return shift.shift_type_id.name;
  }
  return 'Unnamed Shift';
};

// Helper function to get shift description from shift_type
const getShiftDescription = (shift: Shift): string | undefined => {
  if (shift.shift_type?.description) return shift.shift_type.description;
  if (typeof shift.shift_type_id === 'object' && shift.shift_type_id?.description) {
    return shift.shift_type_id.description || undefined;
  }
  return undefined;
};

export function WeekCalendar({
  shifts,
  requirements,
  positions,
  userAvailabilities = {},
  onRegister,
  onUnregister,
  loading = false,
  readonly = false,
}: WeekCalendarProps) {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group shifts by day of week
  const shiftsByDay = DAYS_OF_WEEK.map((day) => ({
    ...day,
    shifts: shifts
      .filter((s) => dayjs(s.shift_date).day() === day.value) // Use dayjs to get day of week from shift_date
      .sort((a, b) => (a.start_at || '').localeCompare(b.start_at || '')), // Handle null/undefined start_at
  }));

  const handleShiftClick = (shift: Shift) => {
    if (readonly) return;

    setSelectedShift(shift);
    const existingPositions = userAvailabilities[shift.id] || [];
    setSelectedPositions(existingPositions);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (selectedShift) {
      if (selectedPositions.length > 0) {
        onRegister(selectedShift.id, selectedPositions);
      } else if (onUnregister) {
        onUnregister(selectedShift.id);
      }
    }
    setIsModalOpen(false);
    setSelectedShift(null);
    setSelectedPositions([]);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
    setSelectedPositions([]);
  };

  const getShiftRequirements = (shiftId: string) => {
    return requirements[shiftId] || [];
  };

  const isRegistered = (shiftId: string) => {
    return userAvailabilities[shiftId]?.length > 0;
  };

  return (
    <div className="w-full">
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
              </div>
            </div>

            {/* Shifts for this day */}
            <div className="space-y-2">
              {day.shifts.length > 0 ? (
                day.shifts.map((shift) => {
                  const shiftReqs = getShiftRequirements(shift.id);
                  const registered = isRegistered(shift.id);
                  const registeredPositions = userAvailabilities[shift.id] || [];

                  return (
                    <Card
                      key={shift.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-lg border-2",
                        registered
                          ? "border-green-400 bg-green-50 hover:border-green-500"
                          : "border-gray-200 hover:border-blue-400",
                        readonly && "cursor-default"
                      )}
                      onClick={() => handleShiftClick(shift)}
                      size="small"
                    >
                      <div className="space-y-2">
                        {/* Shift Name */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-gray-800 truncate">
                            {getShiftName(shift)}
                          </h4>
                          {registered && (
                            <CheckCircleOutlined className="text-green-600 text-lg" />
                          )}
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <ClockCircleOutlined className="text-blue-500" />
                          <span>
                            {(shift.start_at || '--:--')} - {(shift.end_at || '--:--')}
                          </span>
                        </div>

                        {/* Requirements */}
                        {shiftReqs.length > 0 && (
                          <div className="space-y-1">
                            {shiftReqs.map((req) => {
                              // Handle position_id which can be a string or populated object from API
                              const positionId = typeof req.position_id === "object" 
                                ? (req.position_id as any).id 
                                : req.position_id;
                              
                              const position = req.position 
                                || (typeof req.position_id === "object" ? req.position_id as Position : null)
                                || positions.find((p) => p.id === positionId);

                              const isSelected = registeredPositions.includes(positionId);

                              return (
                                <div
                                  key={req.id}
                                  className={cn(
                                    "flex items-center justify-between text-xs px-2 py-1 rounded",
                                    isSelected
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-600"
                                  )}
                                >
                                  <span className="truncate">
                                    {position?.name || "Chưa có"}
                                  </span>
                                  <Badge
                                    count={req.required_count}
                                    showZero
                                    style={{
                                      backgroundColor: isSelected ? "#22c55e" : "#6b7280",
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Status Badge */}
                        {registered && (
                          <div className="pt-1 border-t border-green-200">
                            <Tag color="success" className="text-xs">
                              Đã đăng ký {registeredPositions.length} vị trí
                            </Tag>
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
                      <span className="text-xs text-gray-400">Không có ca</span>
                    }
                  />
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-blue-600" />
            <span>Đăng ký ca làm việc</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText={selectedPositions.length > 0 ? "Xác nhận đăng ký" : "Hủy đăng ký"}
        cancelText="Đóng"
        okButtonProps={{
          loading: loading,
          icon: selectedPositions.length > 0 ? <CheckCircleOutlined /> : undefined,
        }}
        width={600}
      >
        {selectedShift && (
          <div className="space-y-4">
            {/* Shift Info */}
            <Card size="small" className="bg-blue-50 border-blue-200">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-800">
                  {getShiftName(selectedShift)}
                </h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockCircleOutlined />
                  <span>
                    {selectedShift.start_at} - {selectedShift.end_at}
                  </span>
                </div>
                {getShiftDescription(selectedShift) && (
                  <p className="text-sm text-gray-600">
                    {getShiftDescription(selectedShift)}
                  </p>
                )}
              </div>
            </Card>

            {/* Position Selection */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UserOutlined />
                Chọn vị trí muốn đăng ký:
              </h4>

              {getShiftRequirements(selectedShift.id).length > 0 ? (
                <div className="space-y-2">
                  <Checkbox.Group
                    value={selectedPositions}
                    onChange={(values) => setSelectedPositions(values as string[])}
                    className="w-full"
                  >
                    <div className="grid grid-cols-1 gap-2">
                      {getShiftRequirements(selectedShift.id).map((req) => {
                        // Handle position_id which can be a string or populated object from API
                        const positionId = typeof req.position_id === "object" 
                          ? (req.position_id as any).id 
                          : req.position_id;
                        
                        const position = req.position 
                          || (typeof req.position_id === "object" ? req.position_id as Position : null)
                          || positions.find((p) => p.id === positionId);

                        return (
                          <Card
                            key={req.id}
                            size="small"
                            className={cn(
                              "cursor-pointer transition-all hover:border-blue-400",
                              selectedPositions.includes(positionId)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            )}
                          >
                            <Checkbox value={positionId} className="w-full">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {position?.name || "Chưa có"}
                                  </p>
                                  {position?.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {position.description}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  count={`Cần ${req.required_count}`}
                                  style={{ backgroundColor: "#3b82f6" }}
                                />
                              </div>
                            </Checkbox>
                          </Card>
                        );
                      })}
                    </div>
                  </Checkbox.Group>
                </div>
              ) : (
                <Empty
                  description="Chưa có vị trí nào cho ca này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>

            {/* Selection Summary */}
            {selectedPositions.length > 0 && (
              <Card size="small" className="bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600 text-lg" />
                  <span className="text-sm text-gray-700">
                    Bạn đã chọn <strong>{selectedPositions.length}</strong> vị trí
                  </span>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default WeekCalendar;
