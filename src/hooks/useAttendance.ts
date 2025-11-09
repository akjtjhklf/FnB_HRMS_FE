import { useList, useOne, useCreate, useUpdate, useDelete } from "@refinedev/core";
import {
  AttendanceLog,
  AttendanceShift,
  CreateAttendanceLogDto,
  UpdateAttendanceLogDto,
} from "@/types/attendance";

// Attendance Logs
export const useAttendanceLogs = (params?: {
  pagination?: { current: number; pageSize: number };
  filters?: any[];
  sorters?: any[];
}) => {
  return useList<AttendanceLog>({
    resource: "attendance-logs",
    ...params,
  });
};

export const useAttendanceLog = (id: string) => {
  return useOne<AttendanceLog>({
    resource: "attendance-logs",
    id,
  });
};

export const useCreateAttendanceLog = () => {
  return useCreate<AttendanceLog, any, CreateAttendanceLogDto>();
};

export const useUpdateAttendanceLog = () => {
  return useUpdate<AttendanceLog, any, UpdateAttendanceLogDto>();
};

export const useDeleteAttendanceLog = () => {
  return useDelete<AttendanceLog>();
};

// Attendance Shifts
export const useAttendanceShifts = (params?: {
  pagination?: { current: number; pageSize: number };
  filters?: any[];
  sorters?: any[];
}) => {
  return useList<AttendanceShift>({
    resource: "attendance-shifts",
    ...params,
  });
};

export const useAttendanceShift = (id: string) => {
  return useOne<AttendanceShift>({
    resource: "attendance-shifts",
    id,
  });
};
