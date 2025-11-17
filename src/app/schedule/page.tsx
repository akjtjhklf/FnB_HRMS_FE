"use client";

import { useState, useMemo } from "react";
import { Tabs, Card } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/authStore";
import {
  useShifts,
  useEmployeeAvailabilities,
  useCreateEmployeeAvailability,
  useDeleteEmployeeAvailability,
} from "@/hooks/useSchedule";
import { useList } from "@refinedev/core";
import { ShiftPositionRequirement, Position, Shift } from "@/types/schedule";
import { WeekCalendar } from "@/components/schedule/WeekCalendar";
import { ManageScheduleTab } from "@/components/schedule/ManageScheduleTab";
import { ViewScheduleTab } from "@/components/schedule/ViewScheduleTab";
import { ShiftManagementTab } from "@/components/schedule/ShiftManagementTab";
import { Clock, Users, CalendarDays } from "lucide-react";
import { message } from "antd";

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("register");
  const { user } = useAuthStore();

  // Fetch shifts
  const { shifts, isLoading: shiftsLoading } = useShifts();

  // Fetch positions
  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { pageSize: 100 },
  });
  const positions = positionsQuery.data?.data || [];

  // Fetch shift requirements
  const { query: requirementsQuery } = useList<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    pagination: { pageSize: 500 },
  });
  const allRequirements = requirementsQuery.data?.data || [];

  // Group requirements by shift_id
  const requirementsByShift = useMemo(() => {
    const data = requirementsQuery.data?.data || [];
    const grouped: Record<string, ShiftPositionRequirement[]> = {};

    data.forEach((req) => {
      const shiftId =
        typeof req.shift_id === "string"
          ? req.shift_id
          : (req.shift_id as Shift)?.id || req.shift_id;
      if (!grouped[shiftId]) grouped[shiftId] = [];
      grouped[shiftId].push(req);
    });

    return grouped;
  }, [requirementsQuery.data?.data]);

  // Fetch user availabilities (assuming employee_id = user.id for now)
  const {
    availabilities,
    isLoading: availLoading,
    refetch: refetchAvail,
  } = useEmployeeAvailabilities(user?.id);

  // Format user availabilities for calendar
  const userAvailabilities = useMemo(() => {
    const formatted: Record<string, string[]> = {};

    // This would need to be enhanced to fetch availability positions
    // For now, we'll just mark shifts as registered
    availabilities.forEach((avail) => {
      const shiftId =
        typeof avail.shift_id === "string"
          ? avail.shift_id
          : (avail.shift_id as Shift).id;
      if (!formatted[shiftId]) {
        formatted[shiftId] = [];
      }
      // Note: We need to fetch employee_availability_positions to get actual position IDs
      // This is simplified for now
    });

    return formatted;
  }, [availabilities]);

  const { create: createAvailability } = useCreateEmployeeAvailability();
  const { remove: deleteAvailability } = useDeleteEmployeeAvailability();

  const handleRegister = async (shiftId: string, positionIds: string[]) => {
    if (!user?.id) {
      message.error("Vui lòng đăng nhập để đăng ký lịch");
      return;
    }

    try {
      await createAvailability({
        employee_id: user.id,
        shift_id: shiftId,
        priority: 5,
        positions: positionIds,
      });
      message.success("Đăng ký ca làm việc thành công!");
      refetchAvail();
    } catch (error) {
      console.error("Error registering shift:", error);
      message.error("Đăng ký thất bại. Vui lòng thử lại!");
    }
  };

  const handleUnregister = async (shiftId: string) => {
    const availability = availabilities.find((a) => {
      const availShiftId =
        typeof a.shift_id === "string" ? a.shift_id : (a.shift_id as Shift).id;
      return availShiftId === shiftId;
    });

    if (!availability) return;

    try {
      await deleteAvailability(availability.id);
      message.success("Hủy đăng ký thành công!");
      refetchAvail();
    } catch (error) {
      console.error("Error unregistering shift:", error);
      message.error("Hủy đăng ký thất bại!");
    }
  };

  const isLoading = shiftsLoading || availLoading;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-purple-600" />
              </div>
              Quản lý lịch làm việc
            </h1>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Đăng ký, xếp lịch và xem lịch làm việc hàng tuần
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tổng ca trong tuần
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {shifts.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Đã đăng ký
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {availabilities.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <CalendarOutlined className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Vị trí khả dụng
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {positions.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-6 pt-4"
          items={[
            {
              key: "register",
              label: (
                <span className="flex items-center gap-2 px-2">
                  <CalendarOutlined />
                  Đăng ký lịch làm
                </span>
              ),
              children: (
                <div className="px-6 pb-6">
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <CalendarOutlined />
                      Hướng dẫn
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                      <li>Click vào ca làm việc để đăng ký</li>
                      <li>Chọn một hoặc nhiều vị trí bạn có thể đảm nhận</li>
                      <li>Ca đã đăng ký sẽ có viền xanh và biểu tượng ✓</li>
                      <li>Click lại vào ca đã đăng ký để thay đổi hoặc hủy</li>
                    </ul>
                  </div>

                  <WeekCalendar
                    shifts={shifts}
                    requirements={requirementsByShift}
                    positions={positions}
                    userAvailabilities={userAvailabilities}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                    loading={isLoading}
                  />
                </div>
              ),
            },
            {
              key: "manage",
              label: (
                <span className="flex items-center gap-2 px-2">
                  <TeamOutlined />
                  Quản lý xếp lịch
                </span>
              ),
              children: (
                <div className="px-6 pb-6">
                  <ManageScheduleTab />
                </div>
              ),
            },
            {
              key: "view",
              label: (
                <span className="flex items-center gap-2 px-2">
                  <EyeOutlined />
                  Xem lịch chính thức
                </span>
              ),
              children: (
                <div className="px-6 pb-6">
                  <ViewScheduleTab />
                </div>
              ),
            },
            {
              key: "shift-management",
              label: (
                <span className="flex items-center gap-2 px-2">
                  <ClockCircleOutlined />
                  Quản lý ca làm
                </span>
              ),
              children: (
                <div className="px-6 pb-6">
                  <ShiftManagementTab />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
