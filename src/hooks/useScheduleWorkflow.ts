/**
 * Custom Hooks for Schedule Workflow
 * Tích hợp các API: validate, check-readiness, stats, bulk-shifts, auto-schedule
 */

import { useCustom, useCustomMutation } from "@refinedev/core";
import { message } from "antd";
import type {
  ScheduleValidationResponse,
  ScheduleReadinessResponse,
  ScheduleStats,
} from "@/types/schedule/weekly-schedule.types";
import type {
  BulkCreateShiftDto,
  BulkCreateShiftResponse,
  CreateShiftDto,
} from "@/types/schedule/shift.types";
import type { AutoScheduleDto } from "@/types/schedule/schedule-assignment.types";

/**
 * Hook: Validate schedule trước khi publish
 * GET /api/weekly-schedules/:id/validate
 */
export const useScheduleValidation = (scheduleId?: string) => {
  const { query } = useCustom<ScheduleValidationResponse>({
    url: `/weekly-schedules/${scheduleId}/validate`,
    method: "get",
    queryOptions: {
      enabled: !!scheduleId,
      retry: 1,
    },
  });

  return {
    validation: query.data?.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    canPublish: query.data?.data?.canPublish || false,
    errors: query.data?.data?.errors || [],
    warnings: query.data?.data?.warnings || [],
  };
};

/**
 * Hook: Check readiness (coverage rate) để quyết định publish
 * GET /api/weekly-schedules/:id/check-readiness
 */
export const useScheduleReadiness = (scheduleId?: string) => {
  const { query } = useCustom<ScheduleReadinessResponse>({
    url: `/weekly-schedules/${scheduleId}/check-readiness`,
    method: "get",
    queryOptions: {
      enabled: !!scheduleId,
      retry: 1,
    },
  });

  return {
    readiness: query.data?.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    canPublish: query.data?.data?.canPublish || false, // true nếu coverage >= 80%
    coverageRate: query.data?.data?.coverageRate || 0,
    issues: query.data?.data?.issues || [],
  };
};

/**
 * Hook: Get schedule statistics
 * GET /api/weekly-schedules/:id/stats
 */
export const useScheduleStats = (scheduleId?: string) => {
  const { query } = useCustom<ScheduleStats>({
    url: `/weekly-schedules/${scheduleId}/stats`,
    method: "get",
    queryOptions: {
      enabled: !!scheduleId,
      retry: 1,
    },
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

/**
 * Hook: Bulk create shifts cho cả tuần
 * POST /api/shifts/bulk
 */
export const useBulkShifts = () => {
  const { mutate, mutation } = useCustomMutation<BulkCreateShiftResponse>();

  const createBulkShifts = async (shifts: CreateShiftDto[]) => {
    return new Promise<BulkCreateShiftResponse>((resolve, reject) => {
      mutate(
        {
          url: `/shifts/bulk`,
          method: "post",
          values: { shifts } as BulkCreateShiftDto,
        },
        {
          onSuccess: (data) => {
            message.success(`Tạo thành công ${data.data.total} ca làm việc`);
            resolve(data.data);
          },
          onError: (error: any) => {
            message.error(error?.message || "Tạo ca hàng loạt thất bại");
            reject(error);
          },
        }
      );
    });
  };

  return {
    createBulkShifts,
    isLoading: mutation.isPending,
  };
};

/**
 * Hook: Auto-schedule với thuật toán
 * POST /api/schedule-assignments/auto-schedule
 */
export const useAutoSchedule = () => {
  const { mutate, mutation } = useCustomMutation<{
    success: boolean;
    totalAssignments: number;
    validationResult: any;
  }>();

  const autoSchedule = async (
    scheduleId: string,
    options?: { overwriteExisting?: boolean; dryRun?: boolean }
  ) => {
    return new Promise<any>((resolve, reject) => {
      const data: AutoScheduleDto = {
        scheduleId,
        overwriteExisting: options?.overwriteExisting || false,
        dryRun: options?.dryRun || false,
      };

      mutate(
        {
          url: `/schedule-assignments/auto-schedule`,
          method: "post",
          values: data,
        },
        {
          onSuccess: (response) => {
            if (!options?.dryRun) {
              message.success(
                `Tự động xếp lịch thành công: ${response.data.totalAssignments} phân công`
              );
            }
            resolve(response.data);
          },
          onError: (error: any) => {
            message.error(error?.message || "Tự động xếp lịch thất bại");
            reject(error);
          },
        }
      );
    });
  };

  return {
    autoSchedule,
    isLoading: mutation.isPending,
  };
};

/**
 * Hook: Publish schedule (chuyển draft → published)
 * PUT /api/weekly-schedules/:id/publish
 */
export const usePublishSchedule = () => {
  const { mutate, mutation } = useCustomMutation();

  const publishSchedule = async (scheduleId: string) => {
    return new Promise<void>((resolve, reject) => {
      mutate(
        {
          url: `/weekly-schedules/${scheduleId}/publish`,
          method: "patch",
          values: {},
        },
        {
          onSuccess: () => {
            message.success("Công bố lịch thành công! Nhân viên có thể đăng ký ca.");
            resolve();
          },
          onError: (error: any) => {
            message.error(error?.message || "Công bố lịch thất bại");
            reject(error);
          },
        }
      );
    });
  };

  return {
    publishSchedule,
    isLoading: mutation.isPending,
  };
};

/**
 * Hook: Finalize schedule (chuyển published → finalized)
 * PUT /api/weekly-schedules/:id/finalize
 */
export const useFinalizeSchedule = () => {
  const { mutate, mutation } = useCustomMutation();

  const finalizeSchedule = async (scheduleId: string) => {
    return new Promise<void>((resolve, reject) => {
      mutate(
        {
          url: `/weekly-schedules/${scheduleId}/finalize`,
          method: "patch",
          values: {},
        },
        {
          onSuccess: () => {
            message.success("Hoàn tất lịch thành công! Lịch đã được khóa.");
            resolve();
          },
          onError: (error: any) => {
            message.error(error?.message || "Hoàn tất lịch thất bại");
            reject(error);
          },
        }
      );
    });
  };

  return {
    finalizeSchedule,
    isLoading: mutation.isPending,
  };
};
