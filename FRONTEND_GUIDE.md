# HRMS Frontend - Hướng dẫn sử dụng

## Tổng quan

Frontend HRMS đã được tùy chỉnh để chỉ gọi tới Backend ExpressJS (HRMS_BE) thay vì gọi trực tiếp tới Directus. Dự án sử dụng:

- **Next.js 14** với App Router
- **Refine** cho quản lý CRUD
- **TypeScript** cho type safety
- **TailwindCSS** cho styling
- **Ant Design & shadcn/ui** cho UI components

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router pages
│   ├── employees/         # Quản lý nhân viên
│   ├── login/            # Đăng nhập
│   ├── register/         # Đăng ký
│   └── (dashboard)/      # Dashboard chính
├── components/           # UI Components
│   ├── ui/              # Base UI components (Button, Table, etc.)
│   ├── header/          # Header component
│   └── auth-page/       # Auth components
├── features/            # Feature modules
│   └── auth/           # Authentication features
├── hooks/              # Custom React hooks
│   ├── useEmployee.ts
│   ├── useAttendance.ts
│   └── usePosition.ts
├── lib/                # Libraries và utilities
│   ├── api-client.ts   # Axios instance với interceptors
│   └── utils/          # Utility functions
│       ├── date-utils.ts
│       ├── format-utils.ts
│       └── validation-utils.ts
├── providers/          # Refine providers
│   ├── authProvider.ts
│   ├── dataProvider.ts
│   └── index.ts
├── store/             # State management
│   └── authStore.ts
└── types/             # TypeScript types
    ├── common.ts
    ├── auth.ts
    ├── employee.ts
    ├── attendance.ts
    └── salary.ts
```

## API Configuration

### Environment Variables

File `.env`:
```bash
# Backend API URL (HRMS Express Backend)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### API Client

File `src/lib/api-client.ts` cung cấp:
- Axios instance với auto-authentication
- Request/Response interceptors
- Error handling tự động
- Toast notifications cho errors

```typescript
import apiClient, { api } from "@/lib/api-client";

// Sử dụng trực tiếp
const response = await apiClient.get("/employees");

// Hoặc dùng helper functions
const data = await api.get("/employees");
const created = await api.post("/employees", newEmployee);
```

## Data Providers

### Auth Provider

`src/providers/authProvider.ts` xử lý:
- Login/Logout
- Token management
- User identity
- Permissions

### Data Provider

`src/providers/dataProvider.ts` cung cấp:
- CRUD operations (getList, getOne, create, update, deleteOne)
- Pagination
- Filtering
- Sorting
- Custom API calls

## Types System

### Common Types

```typescript
import { ApiResponse, PaginatedResponse, QueryParams } from "@/types/common";
```

### Entity Types

```typescript
import { Employee, Position, Contract, RfidCard } from "@/types/employee";
import { AttendanceLog, AttendanceShift, Device } from "@/types/attendance";
import { SalaryScheme, SalaryRequest, Deduction } from "@/types/salary";
```

## Custom Hooks

### Employee Hooks

```typescript
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "@/hooks";

// List employees với pagination
const { query } = useEmployees({
  pagination: { current: 1, pageSize: 10 }
});

// Get single employee
const { query } = useEmployee(employeeId);

// Create employee
const { mutate: createEmployee } = useCreateEmployee();

// Update employee
const { mutate: updateEmployee } = useUpdateEmployee();

// Delete employee
const { mutate: deleteEmployee } = useDeleteEmployee();
```

### Attendance Hooks

```typescript
import { useAttendanceLogs, useAttendanceLog } from "@/hooks";

const { query } = useAttendanceLogs({
  filters: [
    { field: "employee_id", operator: "eq", value: employeeId }
  ]
});
```

### Position Hooks

```typescript
import { usePositions, usePosition, useCreatePosition } from "@/hooks";
```

## Utility Functions

### Date Utilities

```typescript
import { formatDate, formatDateTime, formatTime, calculateAge } from "@/lib/utils";

formatDate(employee.hire_date); // "15/03/2024"
formatDateTime(log.check_in_time); // "15/03/2024 08:30"
formatTime(shift.start_time); // "08:30"
calculateAge(employee.date_of_birth); // 28
```

### Format Utilities

```typescript
import { formatCurrency, formatPhoneNumber, truncateText, getInitials } from "@/lib/utils";

formatCurrency(salary.base_salary); // "10.000.000 ₫"
formatPhoneNumber("0901234567"); // "0901 234 567"
truncateText(description, 50); // "Long description text..."
getInitials("Nguyễn Văn A"); // "NA"
```

### Validation Utilities

```typescript
import { isValidEmail, isValidPhoneNumber, createValidator } from "@/lib/utils";

// Simple validation
if (!isValidEmail(email)) {
  // Handle error
}

// Create validator
const emailValidator = createValidator({
  required: true,
  email: true
});

const error = emailValidator(formData.email); // string | null
```

## Backend API Routes

### Auth & User
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/logout` - Đăng xuất
- POST `/api/auth/refresh` - Refresh token
- GET `/api/users` - Danh sách users
- GET `/api/permissions` - Danh sách permissions
- GET `/api/policies` - Danh sách policies

### HR Core
- GET/POST/PUT/DELETE `/api/employees` - Quản lý nhân viên
- GET/POST/PUT/DELETE `/api/positions` - Quản lý vị trí
- GET/POST/PUT/DELETE `/api/roles` - Quản lý vai trò
- GET/POST/PUT/DELETE `/api/contracts` - Quản lý hợp đồng
- GET/POST/PUT/DELETE `/api/deductions` - Quản lý khấu trừ
- GET/POST/PUT/DELETE `/api/salary-schemes` - Quản lý lương
- GET/POST/PUT/DELETE `/api/salary-requests` - Yêu cầu lương

### Attendance & Shift
- GET/POST/PUT/DELETE `/api/shifts` - Quản lý ca làm
- GET/POST/PUT/DELETE `/api/shift-types` - Loại ca làm
- GET/POST/PUT/DELETE `/api/attendance-logs` - Chấm công
- GET/POST/PUT/DELETE `/api/attendance-shifts` - Ca chấm công
- GET/POST/PUT/DELETE `/api/attendance-adjustments` - Điều chỉnh

### Schedule Management
- GET/POST/PUT/DELETE `/api/weekly-schedule` - Lịch tuần
- GET/POST/PUT/DELETE `/api/schedule-assignments` - Phân công
- GET/POST/PUT/DELETE `/api/schedule-change-requests` - Đổi ca
- GET/POST/PUT/DELETE `/api/employee-availability` - Khả dụng

### Devices & RFID
- GET/POST/PUT/DELETE `/api/devices` - Quản lý thiết bị
- POST `/api/device-events` - Webhook sự kiện
- GET/POST/PUT/DELETE `/api/rfid-cards` - Quản lý thẻ RFID

### Files
- POST `/api/files` - Upload file

## Response Format

Tất cả API responses từ BE đều có format:

```typescript
// Success
{
  "success": true,
  "data": { ... } hoặc [ ... ],
  "message": "Optional success message"
}

// Success với pagination
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Error
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Cách tạo Page mới

### 1. Tạo Type (nếu cần)

```typescript
// src/types/your-entity.ts
export interface YourEntity {
  id: string;
  name: string;
  // ... other fields
}
```

### 2. Tạo Custom Hooks

```typescript
// src/hooks/useYourEntity.ts
import { useList, useOne, useCreate, useUpdate, useDelete } from "@refinedev/core";
import { YourEntity } from "@/types/your-entity";

export const useYourEntities = (params?: any) => {
  return useList<YourEntity>({
    resource: "your-entities",
    ...params,
  });
};

export const useYourEntity = (id: string) => {
  return useOne<YourEntity>({
    resource: "your-entities",
    id,
  });
};

export const useCreateYourEntity = () => {
  return useCreate<YourEntity>();
};

export const useUpdateYourEntity = () => {
  return useUpdate<YourEntity>();
};

export const useDeleteYourEntity = () => {
  return useDelete<YourEntity>();
};
```

### 3. Tạo Page Component

```typescript
// src/app/your-entities/page.tsx
"use client";

import { useYourEntities, useDeleteYourEntity } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";

export default function YourEntitiesPage() {
  const { query } = useYourEntities();
  const { data, isLoading } = query;
  const { mutate: deleteEntity } = useDeleteYourEntity();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Entities</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((entity) => (
            <TableRow key={entity.id}>
              <TableCell>{entity.name}</TableCell>
              <TableCell>
                <Button onClick={() => deleteEntity({ resource: "your-entities", id: entity.id })}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## Các tính năng chính đã implement

✅ API Client với error handling tự động
✅ Auth Provider kết nối BE  
✅ Data Provider với pagination/filter/sort
✅ Type system hoàn chỉnh cho toàn bộ entities
✅ Custom hooks cho Employee, Attendance, Position
✅ Utility functions (date, format, validation)
✅ Toast notifications
✅ Table components

## Các module cần phát triển tiếp

🔄 Hoàn thiện employees pages (create, edit, detail)
🔄 Attendance management pages
🔄 Shift management pages
🔄 Schedule management pages
🔄 Salary management pages
🔄 Reports & Analytics
🔄 Dashboard overview

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Notes

- FE chỉ gọi tới BE (port 4000), không gọi trực tiếp tới Directus
- Tất cả authentication được xử lý qua BE
- Token được lưu trong localStorage và tự động gắn vào headers
- Error handling được xử lý tự động bởi API client
- Toast notifications hiển thị cho mọi errors
