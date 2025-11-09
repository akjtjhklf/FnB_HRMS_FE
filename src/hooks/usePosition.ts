import { useList, useOne, useCreate, useUpdate, useDelete } from "@refinedev/core";
import { Position, CreatePositionDto, UpdatePositionDto } from "@/types/employee";

export const usePositions = (params?: {
  pagination?: { current: number; pageSize: number };
  filters?: any[];
  sorters?: any[];
}) => {
  return useList<Position>({
    resource: "positions",
    ...params,
  });
};

export const usePosition = (id: string) => {
  return useOne<Position>({
    resource: "positions",
    id,
  });
};

export const useCreatePosition = () => {
  return useCreate<Position, any, CreatePositionDto>();
};

export const useUpdatePosition = () => {
  return useUpdate<Position, any, UpdatePositionDto>();
};

export const useDeletePosition = () => {
  return useDelete<Position>();
};
