import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import {
  WeeklySchedule,
  ScheduleAssignment,
  EmployeeAvailability,
  EmployeeAvailabilityPosition,
  Shift,
  ShiftPositionRequirement,
  CreateEmployeeAvailabilityDto,
  CreateScheduleAssignmentDto,
  AutoScheduleDto,
  ScheduleStats,
} from "@/types/schedule";

// Hook for Weekly Schedules
export const useWeeklySchedules = () => {
  const { query: listQuery } = useList<WeeklySchedule>({
    resource: "weekly-schedule",
  });

  return {
    schedules: listQuery.data?.data || [],
    total: listQuery.data?.total || 0,
    isLoading: listQuery.isLoading,
    refetch: listQuery.refetch,
  };
};

export const useWeeklySchedule = (id?: string) => {
  const { query } = useList<WeeklySchedule>({
    resource: "weekly-schedule",
    queryOptions: {
      enabled: !!id,
    },
    filters: id ? [{ field: "id", operator: "eq", value: id }] : [],
  });

  return {
    schedule: query.data?.data[0],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useCreateWeeklySchedule = () => {
  const { mutate } = useCreate<WeeklySchedule>();

  return {
    create: (data: Partial<WeeklySchedule>) =>
      mutate({
        resource: "weekly-schedule",
        values: data,
      }),
  };
};

// Hook for Shifts
export const useShifts = () => {
  const { query } = useList<Shift>({
    resource: "shifts",
    pagination: { pageSize: 100 },
  });

  return {
    shifts: query.data?.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

// Hook for Shift Requirements
export const useShiftRequirements = (shiftId?: string) => {
  const { query } = useList<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    queryOptions: {
      enabled: !!shiftId,
    },
    filters: shiftId
      ? [{ field: "shift_id", operator: "eq", value: shiftId }]
      : [],
  });

  return {
    requirements: query.data?.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

// Hook for Employee Availability
export const useEmployeeAvailabilities = (employeeId?: string) => {
  const { query } = useList<EmployeeAvailability>({
    resource: "employee-availability",
    queryOptions: {
      enabled: !!employeeId,
    },
    filters: employeeId
      ? [{ field: "employee_id", operator: "eq", value: employeeId }]
      : [],
  });

  return {
    availabilities: query.data?.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useCreateEmployeeAvailability = () => {
  const { mutate: createAvailability } =
    useCreate<EmployeeAvailability>();
  const { mutate: createPosition } =
    useCreate<EmployeeAvailabilityPosition>();

  const create = async (data: CreateEmployeeAvailabilityDto) => {
    try {
      // Create availability first
      const availability = await new Promise<EmployeeAvailability>(
        (resolve, reject) => {
          createAvailability(
            {
              resource: "employee-availability",
              values: {
                employee_id: data.employee_id,
                shift_id: data.shift_id,
                priority: data.priority || 5,
                expires_at: data.expires_at,
                note: data.note,
              },
            },
            {
              onSuccess: (response) => resolve(response.data as EmployeeAvailability),
              onError: reject,
            }
          );
        }
      );

      // Create positions for this availability
      if (data.positions && data.positions.length > 0) {
        await Promise.all(
          data.positions.map((positionId, index) =>
            new Promise((resolve, reject) => {
              createPosition(
                {
                  resource: "employee-availability-positions",
                  values: {
                    availability_id: availability.id,
                    position_id: positionId,
                    preference_order: index + 1,
                  },
                },
                {
                  onSuccess: resolve,
                  onError: reject,
                }
              );
            })
          )
        );
      }

      return availability;
    } catch (error) {
      throw error;
    }
  };

  return {
    create,
  };
};

export const useDeleteEmployeeAvailability = () => {
  const { mutate } = useDelete();

  return {
    remove: (id: string) =>
      mutate({
        resource: "employee-availability",
        id,
      }),
  };
};

// Hook for Schedule Assignments
export const useScheduleAssignments = (scheduleId?: string) => {
  const { query } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    queryOptions: {
      enabled: !!scheduleId,
    },
    filters: scheduleId
      ? [{ field: "schedule_id", operator: "eq", value: scheduleId }]
      : [],
  });

  return {
    assignments: query.data?.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useCreateScheduleAssignment = () => {
  const { mutate } = useCreate<ScheduleAssignment>();

  return {
    create: (data: CreateScheduleAssignmentDto) =>
      mutate({
        resource: "schedule-assignments",
        values: data,
      }),
  };
};

export const useUpdateScheduleAssignment = () => {
  const { mutate } = useUpdate<ScheduleAssignment>();

  return {
    update: (id: string, data: Partial<ScheduleAssignment>) =>
      mutate({
        resource: "schedule-assignments",
        id,
        values: data,
      }),
  };
};

export const useDeleteScheduleAssignment = () => {
  const { mutate } = useDelete();

  return {
    remove: (id: string) =>
      mutate({
        resource: "schedule-assignments",
        id,
      }),
  };
};

// Hook for Auto Schedule
export const useAutoSchedule = () => {
  const { mutate } = useCreate();

  return {
    autoSchedule: (data: AutoScheduleDto) =>
      mutate({
        resource: "schedule-assignments/auto-schedule",
        values: data,
      }),
  };
};

// Hook for Schedule Stats
export const useScheduleStats = (scheduleId?: string) => {
  const { query } = useList<ScheduleStats>({
    resource: `schedule-assignments/schedule/${scheduleId}/stats`,
    queryOptions: {
      enabled: !!scheduleId,
    },
  });

  return {
    stats: query.data?.data[0],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

// Hook for getting shifts by day of week
export const useShiftsByDay = (dayOfWeek?: number) => {
  const { query } = useList<Shift>({
    resource: "shifts",
    queryOptions: {
      enabled: dayOfWeek !== undefined,
    },
    filters:
      dayOfWeek !== undefined
        ? [{ field: "day_of_week", operator: "eq", value: dayOfWeek }]
        : [],
  });

  return {
    shifts: query.data?.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
