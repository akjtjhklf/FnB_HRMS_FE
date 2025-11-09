import { useList, useOne, useCreate, useUpdate, useDelete } from "@refinedev/core";
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "@/types/employee";

export const useEmployees = (params?: {
  pagination?: { current: number; pageSize: number };
  filters?: any[];
  sorters?: any[];
}) => {
  return useList<Employee>({
    resource: "employees",
    ...params,
  });
};

export const useEmployee = (id: string) => {
  return useOne<Employee>({
    resource: "employees",
    id,
  });
};

export const useCreateEmployee = () => {
  return useCreate<Employee, any, CreateEmployeeDto>();
};

export const useUpdateEmployee = () => {
  return useUpdate<Employee, any, UpdateEmployeeDto>();
};

export const useDeleteEmployee = () => {
  return useDelete<Employee>();
};
