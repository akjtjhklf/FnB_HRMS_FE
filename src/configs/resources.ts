import { ResourceProps } from "@refinedev/core";

export const resources: ResourceProps[] = [
  {
    name: "dashboard",
    list: "/dashboard",
    meta: {
      label: "Dashboard",
      icon: "📊",
    },
  },
  {
    name: "employees",
    list: "/employees",
    create: "/employees/create",
    edit: "/employees/:id/edit",
    show: "/employees/:id",
    meta: {
      label: "Nhân viên",
      icon: "👥",
    },
  },
  {
    name: "schedule",
    list: "/schedule",
    meta: {
      label: "Lịch làm việc",
      icon: "📅",
    },
  },
  {
    name: "shift-types",
    list: "/schedule",
    meta: {
      label: "Loại ca làm",
      parent: "schedule",
    },
  },
  {
    name: "shifts",
    list: "/schedule",
    meta: {
      label: "Ca làm việc",
      parent: "schedule",
    },
  },
];
