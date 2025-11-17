# Frontend Components Guide

## DataTable Component

### Giới thiệu

`DataTable` là một component bảng dữ liệu có thể tái sử dụng, được xây dựng trên nền tảng Ant Design Table với nhiều tính năng mở rộng:

- ✅ Tìm kiếm (Search)
- ✅ Lọc dữ liệu (Filter) với Select dropdown
- ✅ Sắp xếp (Sort)
- ✅ Phân trang (Pagination)
- ✅ Chọn nhiều dòng (Row Selection)
- ✅ Export dữ liệu
- ✅ Làm mới dữ liệu (Refresh)
- ✅ Tùy chỉnh giao diện với className
- ✅ Hỗ trợ TypeScript

### Import

```tsx
import { DataTable } from "@/components/common/DataTable";
import type { DataTableColumn } from "@/types/common";
```

### Sử dụng cơ bản

```tsx
import { DataTable, columnRenderers } from "@/components/common/DataTable";
import { EMPLOYEE_STATUS } from "@/types/common";
import type { Employee } from "@/types/employee";

const columns: DataTableColumn<Employee>[] = [
  {
    key: "full_name",
    title: "Họ và tên",
    dataIndex: "full_name",
    render: (text, record) => columnRenderers.avatar(text, record),
    sorter: true,
  },
  {
    key: "email",
    title: "Email",
    dataIndex: "email",
  },
  {
    key: "status",
    title: "Trạng thái",
    dataIndex: "status",
    render: (status) => columnRenderers.status(status, EMPLOYEE_STATUS),
  },
];

function MyComponent() {
  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      title="Danh sách nhân viên"
      searchPlaceholder="Tìm kiếm..."
    />
  );
}
```

### Props

| Prop | Type | Mặc định | Mô tả |
|------|------|----------|-------|
| `dataSource` | `T[]` | **required** | Dữ liệu hiển thị trong bảng |
| `columns` | `DataTableColumn<T>[]` | **required** | Cấu hình các cột |
| `loading` | `boolean` | `false` | Hiển thị trạng thái loading |
| `rowKey` | `string \| function` | `"id"` | Key duy nhất cho mỗi dòng |
| `pagination` | `boolean \| object` | `true` | Cấu hình phân trang |
| `searchPlaceholder` | `string` | `"Tìm kiếm..."` | Placeholder cho ô tìm kiếm |
| `onSearch` | `(value: string) => void` | - | Callback khi tìm kiếm (server-side) |
| `filters` | `FilterConfig[]` | - | Cấu hình các bộ lọc |
| `onFilter` | `(filters: Record) => void` | - | Callback khi filter (server-side) |
| `onRefresh` | `() => void` | - | Callback khi nhấn nút làm mới |
| `onExport` | `() => void` | - | Callback khi nhấn nút xuất dữ liệu |
| `showRefresh` | `boolean` | `true` | Hiển thị nút làm mới |
| `showExport` | `boolean` | `false` | Hiển thị nút xuất dữ liệu |
| `className` | `string` | - | Custom class cho container |
| `tableClassName` | `string` | - | Custom class cho bảng |
| `bordered` | `boolean` | `false` | Hiển thị viền |
| `size` | `"small" \| "middle" \| "large"` | `"middle"` | Kích thước bảng |
| `title` | `ReactNode` | - | Tiêu đề bảng |
| `extra` | `ReactNode` | - | Nội dung thêm ở header |

### Column Renderers

Component cung cấp các hàm render sẵn cho các trường hợp phổ biến:

#### 1. Avatar với text

```tsx
columnRenderers.avatar(text, record, "avatar", "name")
```

#### 2. Status badge

```tsx
columnRenderers.status(status, {
  active: { label: "Đang làm việc", color: "green" },
  inactive: { label: "Nghỉ việc", color: "red" },
})
```

#### 3. Date formatter

```tsx
columnRenderers.date(dateValue) // Output: 01/12/2024
```

#### 4. Currency formatter

```tsx
columnRenderers.currency(10000000) // Output: 10.000.000 ₫
```

#### 5. Phone formatter

```tsx
columnRenderers.phone("0123456789") // Output: 0123 456 789
```

#### 6. Truncate text

```tsx
columnRenderers.truncate(longText, 50) // Truncate with tooltip
```

### Ví dụ nâng cao

#### 1. Bảng với Filters

```tsx
const filters = [
  {
    key: "status",
    label: "Trạng thái",
    options: [
      { label: "Đang làm việc", value: "active" },
      { label: "Nghỉ việc", value: "inactive" },
    ],
  },
  {
    key: "position_id",
    label: "Vị trí",
    options: [
      { label: "Quản lý", value: 1 },
      { label: "Nhân viên", value: 2 },
    ],
  },
];

<DataTable
  dataSource={employees}
  columns={columns}
  filters={filters}
  onFilter={(filters) => {
    console.log("Applied filters:", filters);
    // Gọi API với filters
  }}
/>
```

#### 2. Server-side Pagination & Filtering

```tsx
function ServerSideTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (params: any) => {
    setLoading(true);
    const response = await api.getEmployees(params);
    setEmployees(response.data);
    setPagination({
      ...pagination,
      total: response.meta.total,
    });
    setLoading(false);
  };

  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      loading={loading}
      pagination={{
        ...pagination,
        onChange: (page, pageSize) => {
          setPagination({ ...pagination, current: page, pageSize });
          fetchData({ page, limit: pageSize });
        },
      }}
      onSearch={(value) => fetchData({ search: value })}
      onFilter={(filters) => fetchData({ filter: filters })}
      onSort={(field, order) => fetchData({ sort: `${field}:${order}` })}
    />
  );
}
```

#### 3. Row Selection

```tsx
<DataTable
  dataSource={employees}
  columns={columns}
  rowSelection={{
    onChange: (selectedKeys, selectedRows) => {
      console.log("Selected:", selectedRows);
    },
  }}
/>
```

#### 4. Custom Styling

```tsx
<DataTable
  dataSource={employees}
  columns={columns}
  className="shadow-lg rounded-xl"
  tableClassName="custom-table"
  rowClassName={(record, index) =>
    record.status === "active" ? "bg-green-50" : ""
  }
  bordered
/>
```

#### 5. Actions Column

```tsx
const columns = [
  // ... other columns
  {
    key: "actions",
    title: "Thao tác",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <Space size="small">
        <Button
          type="text"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleView(record)}
        />
        <Button
          type="text"
          icon={<Edit className="w-4 h-4" />}
          onClick={() => handleEdit(record)}
        />
        <Button
          type="text"
          danger
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => handleDelete(record)}
        />
      </Space>
    ),
  },
];
```

### Custom CSS

Thêm vào file CSS global của bạn:

```css
/* Custom table styling */
.custom-data-table .ant-table-thead > tr > th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.custom-data-table .ant-table-tbody > tr:hover > td {
  background: #f0f9ff;
  transition: background 0.3s;
}

/* Custom row styling */
.bg-green-50 {
  background-color: #f0fdf4;
}
```

---

## Auth Middleware

### Giới thiệu

Middleware bảo vệ các route yêu cầu xác thực, tự động redirect user chưa đăng nhập về trang login.

### Cấu hình

File `src/middleware.ts` đã được tạo và cấu hình sẵn.

### Cách hoạt động

1. **Public routes**: `/login`, `/register`, `/forgot-password`, `/reset-password`
   - Không yêu cầu xác thực
   - Nếu đã đăng nhập, redirect về dashboard

2. **Protected routes**: Tất cả routes khác
   - Yêu cầu xác thực (kiểm tra token trong cookies)
   - Nếu chưa đăng nhập, redirect về `/login?redirect=/current-path`

3. **Token Management**:
   - Token được lưu trong cookies (cho middleware) và localStorage (cho client)
   - `authProvider` đã được cập nhật để sync token giữa cookies và localStorage

### Thêm Public Route

Sửa file `src/middleware.ts`:

```typescript
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/public-page", // Thêm route public mới
];
```

### Protect Custom Routes

Middleware tự động protect tất cả routes không nằm trong `publicRoutes`.

### Redirect sau khi Login

Khi user chưa đăng nhập truy cập protected route, URL gốc được lưu trong query param `redirect`:

```
/login?redirect=/employees/123
```

Bạn có thể sử dụng trong login page:

```tsx
// src/app/login/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async () => {
    // ... login logic
    router.push(redirect); // Redirect về trang ban đầu
  };
}
```

### Kiểm tra Auth trong Component

Sử dụng `authProvider` từ Refine:

```tsx
import { useGetIdentity } from "@refinedev/core";

function MyComponent() {
  const { data: user } = useGetIdentity();

  if (!user) {
    return <div>Loading...</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

---

## Status Maps

File `src/types/common.ts` cung cấp các status map sẵn:

### Employee Status

```tsx
import { EMPLOYEE_STATUS } from "@/types/common";

// active: "Đang làm việc" (green)
// inactive: "Nghỉ việc" (red)
// on_leave: "Nghỉ phép" (orange)
// probation: "Thử việc" (blue)
```

### Contract Status

```tsx
import { CONTRACT_STATUS } from "@/types/common";

// active: "Hiệu lực" (green)
// expired: "Hết hạn" (red)
// pending: "Chờ xử lý" (orange)
// terminated: "Đã chấm dứt" (red)
```

### Attendance Status

```tsx
import { ATTENDANCE_STATUS } from "@/types/common";

// present: "Có mặt" (green)
// absent: "Vắng mặt" (red)
// late: "Đi muộn" (orange)
// early_leave: "Về sớm" (orange)
// on_leave: "Nghỉ phép" (blue)
```

### Shift Status

```tsx
import { SHIFT_STATUS } from "@/types/common";

// scheduled: "Đã xếp lịch" (blue)
// in_progress: "Đang diễn ra" (green)
// completed: "Hoàn thành" (default)
// cancelled: "Đã hủy" (red)
```

---

## Best Practices

### 1. TypeScript Types

Luôn định nghĩa type cho data của bạn:

```tsx
interface MyData {
  id: number;
  name: string;
  status: string;
}

const columns: DataTableColumn<MyData>[] = [
  // TypeScript sẽ autocomplete và type-check
];
```

### 2. Memoization

Sử dụng `useMemo` cho columns và filters nếu chúng không thay đổi:

```tsx
const columns = useMemo(() => [
  { key: "name", title: "Tên", dataIndex: "name" },
  // ...
], []);
```

### 3. Server-side vs Client-side

- **Client-side**: Dữ liệu nhỏ (<1000 records), không cần `onSearch`, `onFilter`, `onSort`
- **Server-side**: Dữ liệu lớn, cung cấp callbacks để gọi API

### 4. Loading State

Luôn truyền `loading` prop khi fetch data:

```tsx
const { data, isLoading } = useList({ resource: "employees" });

<DataTable dataSource={data} loading={isLoading} />
```

### 5. Error Handling

Xử lý lỗi trong callbacks:

```tsx
const handleRefresh = async () => {
  try {
    await refetch();
  } catch (error) {
    toast.error("Không thể tải dữ liệu");
  }
};
```

---

## Troubleshooting

### Table không hiển thị dữ liệu

- Kiểm tra `dataSource` có dữ liệu
- Kiểm tra `rowKey` khớp với field trong data
- Kiểm tra `columns[].dataIndex` đúng

### Tìm kiếm không hoạt động

- Nếu client-side: Component tự động filter
- Nếu server-side: Đảm bảo đã cung cấp `onSearch` callback

### Auth middleware không hoạt động

- Kiểm tra cookies có token
- Kiểm tra `middleware.ts` config matcher
- Xem console browser và server logs

### Styling không áp dụng

- Kiểm tra Tailwind config đã include component path
- Import global CSS đúng cách trong `layout.tsx`
- Sử dụng `className` prop cho custom styling

---

## Xem thêm

- [Ant Design Table Documentation](https://ant.design/components/table)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Refine Documentation](https://refine.dev/docs)
