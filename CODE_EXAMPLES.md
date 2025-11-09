# HRMS Frontend - Code Examples

## 📝 Common Implementation Patterns

### 1. Create a New Feature (Employees Example)

#### Step 1: Define Types
```typescript
// src/types/index.ts (already exists, just add more types if needed)
export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  status: "active" | "on_leave" | "suspended" | "terminated";
  created_at: string;
  updated_at: string;
}
```

#### Step 2: Create Feature Components

```typescript
// src/features/employees/EmployeeList.tsx
"use client";

import React from "react";
import { useList, useDelete } from "@refinedev/core";
import { Table, Space, Button, Tag, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Card } from "@/components/ui";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Employee } from "@/types";

export default function EmployeeList() {
  const router = useRouter();
  const { query } = useList<Employee>({ resource: "employees" });
  const { mutate: deleteEmployee } = useDelete();

  const handleDelete = (id: number) => {
    deleteEmployee(
      { resource: "employees", id },
      {
        onSuccess: () => message.success("Employee deleted"),
        onError: () => message.error("Failed to delete"),
      }
    );
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "employee_code",
      key: "employee_code",
    },
    {
      title: "Name",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Employee) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/employees/${record.id}/edit`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Employees</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/employees/create")}
        >
          Add Employee
        </Button>
      </div>
      <Card>
        <Table
          dataSource={query.data?.data}
          columns={columns}
          loading={query.isLoading}
          rowKey="id"
        />
      </Card>
    </motion.div>
  );
}
```

```typescript
// src/features/employees/EmployeeCreate.tsx
"use client";

import React from "react";
import { useCreate } from "@refinedev/core";
import { Form, Input, Select, Button, message } from "antd";
import { Card } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function EmployeeCreate() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { mutate: createEmployee, mutation } = useCreate();

  const onFinish = (values: any) => {
    createEmployee(
      { resource: "employees", values },
      {
        onSuccess: () => {
          message.success("Employee created");
          router.push("/employees");
        },
        onError: () => message.error("Failed to create"),
      }
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create Employee</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Employee Code"
            name="employee_code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="active">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="on_leave">On Leave</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

```typescript
// src/features/employees/index.tsx
export { default as EmployeeList } from "./EmployeeList";
export { default as EmployeeCreate } from "./EmployeeCreate";
export { default } from "./EmployeeList";
```

#### Step 3: Create Pages

```typescript
// src/app/employees/page.tsx
"use client";
import { EmployeeList } from "@/features/employees";
export default function EmployeesPage() {
  return <EmployeeList />;
}
```

```typescript
// src/app/employees/create/page.tsx
"use client";
import { EmployeeCreate } from "@/features/employees";
export default function CreateEmployeePage() {
  return <EmployeeCreate />;
}
```

#### Step 4: Add Resource to Refine

```typescript
// src/app/layout.tsx (add to resources array)
{
  name: "employees",
  list: "/employees",
  create: "/employees/create",
  edit: "/employees/:id/edit",
  show: "/employees/:id",
  meta: {
    canDelete: true,
    label: "Employees",
  },
}
```

### 2. Implement RBAC Protection

```typescript
// src/components/ProtectedRoute.tsx
"use client";

import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: { action: string; collection: string };
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, hasRole, hasPermission } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push("/unauthorized");
      return;
    }

    if (
      requiredPermission &&
      !hasPermission(requiredPermission.action, requiredPermission.collection)
    ) {
      router.push("/unauthorized");
      return;
    }
  }, [user, requiredRole, requiredPermission, router, hasRole, hasPermission]);

  if (!user) return null;
  return <>{children}</>;
}
```

Usage:
```typescript
// In any page
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Content</div>
    </ProtectedRoute>
  );
}
```

### 3. Create Reusable Components

```typescript
// src/components/ui/DataTable.tsx
"use client";

import { Table, TableProps } from "antd";
import { Card } from "./Card";
import { motion } from "framer-motion";

interface DataTableProps<T> extends TableProps<T> {
  title?: string;
  extra?: React.ReactNode;
}

export function DataTable<T extends object>({
  title,
  extra,
  ...tableProps
}: DataTableProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {(title || extra) && (
        <div className="flex justify-between mb-6">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {extra}
        </div>
      )}
      <Card>
        <Table {...tableProps} />
      </Card>
    </motion.div>
  );
}
```

Usage:
```typescript
import { DataTable } from "@/components/ui/DataTable";

<DataTable
  title="Employees"
  dataSource={data}
  columns={columns}
  loading={loading}
  extra={<Button>Add Employee</Button>}
/>
```

### 4. Custom Hooks

```typescript
// src/features/employees/hooks/useEmployeeStats.ts
import { useList } from "@refinedev/core";
import { Employee } from "@/types";

export function useEmployeeStats() {
  const { query } = useList<Employee>({ resource: "employees" });

  const stats = {
    total: query.data?.total || 0,
    active: query.data?.data.filter((e) => e.status === "active").length || 0,
    onLeave: query.data?.data.filter((e) => e.status === "on_leave").length || 0,
  };

  return { stats, isLoading: query.isLoading };
}
```

Usage:
```typescript
import { useEmployeeStats } from "./hooks/useEmployeeStats";

function EmployeeDashboard() {
  const { stats, isLoading } = useEmployeeStats();
  
  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Active: {stats.active}</p>
    </div>
  );
}
```

### 5. Form with File Upload

```typescript
// src/features/employees/EmployeeCreateWithPhoto.tsx
"use client";

import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

export default function EmployeeCreateWithPhoto() {
  const uploadProps: UploadProps = {
    name: "file",
    action: `${process.env.NEXT_PUBLIC_API_URL}/files/upload`,
    headers: {
      authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} upload failed`);
      }
    },
  };

  return (
    <Form.Item label="Photo" name="photo_url">
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
    </Form.Item>
  );
}
```

### 6. Search and Filter

```typescript
"use client";

import { useState } from "react";
import { useList } from "@refinedev/core";
import { Input, Select } from "antd";

export default function EmployeeListWithFilter() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>();

  const { query } = useList({
    resource: "employees",
    filters: [
      {
        field: "full_name",
        operator: "contains",
        value: search,
      },
      ...(status
        ? [
            {
              field: "status",
              operator: "eq" as const,
              value: status,
            },
          ]
        : []),
    ],
  });

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select
          placeholder="Filter by status"
          value={status}
          onChange={setStatus}
          allowClear
          className="w-48"
        >
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="on_leave">On Leave</Select.Option>
        </Select>
      </div>
      <Table dataSource={query.data?.data} />
    </div>
  );
}
```

### 7. Pagination

```typescript
"use client";

import { useState } from "react";
import { useList } from "@refinedev/core";

export default function EmployeeListWithPagination() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { query } = useList({
    resource: "employees",
    pagination: {
      current: page,
      pageSize,
      mode: "server",
    },
  });

  return (
    <Table
      dataSource={query.data?.data}
      pagination={{
        current: page,
        pageSize,
        total: query.data?.total,
        onChange: (newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        },
      }}
    />
  );
}
```

### 8. Modal Form

```typescript
"use client";

import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useCreate } from "@refinedev/core";

export default function QuickAddEmployee() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { mutate: create } = useCreate();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      create(
        { resource: "employees", values },
        {
          onSuccess: () => {
            setOpen(false);
            form.resetFields();
          },
        }
      );
    });
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Quick Add
      </Button>
      <Modal
        title="Add Employee"
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="full_name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
```

### 9. Real-time Updates

```typescript
// src/hooks/useRealTimeList.ts
import { useList } from "@refinedev/core";
import { useEffect } from "react";

export function useRealTimeList(resource: string, interval: number = 5000) {
  const { query, result } = useList({ resource });

  useEffect(() => {
    const timer = setInterval(() => {
      query.refetch();
    }, interval);

    return () => clearInterval(timer);
  }, [query, interval]);

  return result;
}
```

Usage:
```typescript
const { data, isLoading } = useRealTimeList("attendance-logs", 3000);
```

### 10. Error Handling

```typescript
"use client";

import { useList } from "@refinedev/core";
import { Alert, Spin } from "antd";

export default function EmployeeListWithErrorHandling() {
  const { query } = useList({ resource: "employees" });

  if (query.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <Alert
        message="Error"
        description={query.error?.message || "Failed to load employees"}
        type="error"
        showIcon
      />
    );
  }

  return <Table dataSource={query.data?.data} />;
}
```

---

## 🎓 Tips

1. **Always use TypeScript types** for type safety
2. **Use Refine hooks** instead of raw fetch
3. **Leverage Zustand** for global state
4. **Use cn()** for className merging
5. **Add animations** with Framer Motion
6. **Handle loading/error states** properly
7. **Follow feature-first** architecture
8. **Keep components small** and focused

---

**Happy Coding! 🚀**
