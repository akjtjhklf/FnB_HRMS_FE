import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import {
  Shift,
  ShiftType,
  CreateShiftDto,
  UpdateShiftDto,
  CreateShiftTypeDto,
  UpdateShiftTypeDto,
} from "@/types/schedule";

// Hooks for Shift Types
export const useShiftTypes = (params?: {
  pagination?: { current: number; pageSize: number };
  filters?: any[];
  sorters?: any[];
}) => {
  const { query } = useList<ShiftType>({
    resource: "shift-types",
    ...params,
  });
  console.log(query);
  return useList<ShiftType>({
    resource: "shift-types",
    ...params,
  });
};

export const useCreateShiftType = () => {
  const { mutate } = useCreate<ShiftType>();

  return {
    create: (data: CreateShiftTypeDto) =>
      mutate({
        resource: "shift-types",
        values: data,
      }),
  };
};

export const useUpdateShiftType = () => {
  const { mutate } = useUpdate<ShiftType>();

  return {
    update: (id: string, data: UpdateShiftTypeDto) =>
      mutate({
        resource: "shift-types",
        id,
        values: data,
      }),
  };
};

export const useDeleteShiftType = () => {
  const { mutate } = useDelete();

  return {
    remove: (id: string) =>
      mutate({
        resource: "shift-types",
        id,
      }),
  };
};

// Hooks for Shifts
export const useShiftsList = (filters?: any) => {
  const { query } = useList<Shift>({
    resource: "shifts",
    pagination: { pageSize: 100 },
    filters,
  });

  return {
    shifts: query.data?.data || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useCreateShift = () => {
  const { mutate } = useCreate<Shift>();

  return {
    create: (data: CreateShiftDto) =>
      mutate({
        resource: "shifts",
        values: data,
      }),
  };
};

export const useUpdateShift = () => {
  const { mutate } = useUpdate<Shift>();

  return {
    update: (id: string, data: UpdateShiftDto) =>
      mutate({
        resource: "shifts",
        id,
        values: data,
      }),
  };
};

export const useDeleteShift = () => {
  const { mutate } = useDelete();

  return {
    remove: (id: string) =>
      mutate({
        resource: "shifts",
        id,
      }),
  };
};
