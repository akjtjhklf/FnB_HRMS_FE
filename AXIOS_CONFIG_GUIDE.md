# Axios Config - Enterprise Setup cho HRMS

## 📁 Cấu trúc

```
src/
├── axios-config/           # Axios configuration enterprise
│   ├── apiClient.ts       # Axios instance chính
│   ├── request.ts         # Request wrapper functions
│   ├── index.ts          # Export tất cả
│   ├── constants/
│   │   └── index.ts      # Constants (endpoints, methods, etc.)
│   ├── interceptors/
│   │   ├── request.interceptor.ts   # Request interceptor
│   │   └── response.interceptor.ts  # Response interceptor
│   └── utils/
│       ├── token-manager.ts         # Token management (cookies)
│       ├── refresh-token-handler.ts # Auto refresh token
│       ├── retry-handler.ts         # Retry failed requests
│       ├── api-error-response.ts    # Error response handler
│       ├── url-parser.ts            # URL utilities
│       └── form-data-compiler.ts    # FormData utilities
│
├── api/                   # API services theo module
│   └── employee/
│       ├── employee-constants.ts   # Endpoints
│       ├── employee-request.ts     # Request types
│       ├── employee-response.ts    # Response types
│       ├── employee-services.ts    # API service functions
│       ├── employee-queries.ts     # React Query queries
│       ├── employee-mutations.ts   # React Query mutations
│       └── index.ts                # Export all
│
└── providers/
    ├── auth-provider/     # Refine auth provider (dùng axiosClient)
    └── data-provider/     # Refine data provider (dùng axiosClient)
```

## 🚀 Features

### 1. **Axios Client với Interceptors**
- ✅ Auto thêm Bearer token vào mọi request
- ✅ Auto thêm Organization key header
- ✅ Xử lý refresh token tự động khi token hết hạn
- ✅ Retry logic cho 5xx errors (exponential backoff)
- ✅ Toast notifications cho errors
- ✅ Type-safe với TypeScript generics

### 2. **Token Management**
- ✅ Quản lý tokens qua cookies (không dùng localStorage)
- ✅ Auto refresh token khi 401
- ✅ Queue requests khi đang refresh token
- ✅ Auto logout và redirect khi refresh token fail

### 3. **Error Handling**
- ✅ Xử lý tất cả status codes (401, 403, 404, 422, 500)
- ✅ Network error handling
- ✅ Timeout handling
- ✅ Retry logic với exponential backoff

### 4. **Request Utilities**
- ✅ Path params replacement (`:id` → `123`)
- ✅ Query params filtering (xóa null/undefined/empty)
- ✅ FormData compilation tự động
- ✅ Type-safe request/response

## 📖 Cách sử dụng

### 1. Với Refine (Recommended)

Refine tự động sử dụng `dataProvider` và `authProvider`, không cần gọi API thủ công:

```typescript
import { useList, useOne, useCreate, useUpdate, useDelete } from "@refinedev/core";

// Get list - Refine tự động gọi dataProvider.getList()
const { data: employees } = useList({
  resource: "employees",
  pagination: { current: 1, pageSize: 10 },
  filters: [{ field: "status", operator: "eq", value: "active" }],
  sorters: [{ field: "createdAt", order: "desc" }],
});

// Get one - Refine tự động gọi dataProvider.getOne()
const { data: employee } = useOne({
  resource: "employees",
  id: "123",
});

// Create - Refine tự động gọi dataProvider.create()
const { mutate: createEmployee } = useCreate();
createEmployee({
  resource: "employees",
  values: {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
  },
});

// Update - Refine tự động gọi dataProvider.update()
const { mutate: updateEmployee } = useUpdate();
updateEmployee({
  resource: "employees",
  id: "123",
  values: {
    first_name: "Jane",
  },
});

// Delete - Refine tự động gọi dataProvider.deleteOne()
const { mutate: deleteEmployee } = useDelete();
deleteEmployee({
  resource: "employees",
  id: "123",
});
```

### 2. Với TanStack Query (Nếu cần custom logic phức tạp)

Khi cần logic phức tạp hơn Refine cung cấp, dùng TanStack Query với API services:

```typescript
import {
  useEmployeesQuery,
  useEmployeeDetailQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/api/employee";

function EmployeeList() {
  // Query với params
  const { data, isLoading } = useEmployeesQuery({
    page: 1,
    limit: 10,
    search: "john",
    sort: "-createdAt",
    filter: {
      status: { $eq: ["active"] },
    },
  });

  const employees = data?.data.items || [];
  const total = data?.data.total || 0;

  return (
    <div>
      {employees.map((emp) => (
        <div key={emp.id}>{emp.first_name}</div>
      ))}
    </div>
  );
}

function EmployeeDetail({ id }: { id: string }) {
  // Query detail
  const { data, isLoading } = useEmployeeDetailQuery(id);
  const employee = data?.data;

  return <div>{employee?.first_name}</div>;
}

function EmployeeCreate() {
  // Mutation với callbacks
  const { mutate: createEmployee, isPending } = useCreateEmployeeMutation({
    onSuccess: (data) => {
      console.log("Created:", data.data);
      toast.success("Tạo nhân viên thành công!");
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleSubmit = () => {
    createEmployee({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    });
  };

  return <button onClick={handleSubmit}>Create</button>;
}
```

### 3. Direct API Call (Ít dùng)

Chỉ dùng khi cần gọi API một lần không cần cache/state management:

```typescript
import { get, post, put, del } from "@/axios-config";

// GET request
const employees = await get<ListResponseAPI<Employee>>("/employees", {
  queryParams: { page: 1, limit: 10 },
});

// POST request
const newEmployee = await post<ResponseAPI<Employee>, CreateEmployeeDto>(
  "/employees",
  {
    first_name: "John",
    last_name: "Doe",
  }
);

// PUT request với path params
const updated = await put<ResponseAPI<Employee>, UpdateEmployeeDto>(
  "/employees/:id",
  { first_name: "Jane" },
  { pathParams: { id: "123" } }
);

// DELETE request
await del("/employees/:id", {
  pathParams: { id: "123" },
});

// FormData upload
await post(
  "/employees/import",
  { file: fileObject },
  { useFormData: true }
);
```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Constants Configuration

File: `src/axios-config/constants/index.ts`

```typescript
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "ac_token",
  REFRESH_TOKEN: "rf_token",
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,        // Số lần retry tối đa
  BASE_DELAY_MS: 1000,   // Delay base (exponential backoff)
};

export const AUTH_CONFIG = {
  LOGIN_ENDPOINT: "/api/auth/login",
  REFRESH_TOKEN_ENDPOINT: "/api/auth/refresh-token",
  LOGOUT_ENDPOINT: "/api/auth/logout",
};
```

## 📝 Tạo API Module mới

### Bước 1: Tạo folder structure

```
src/api/position/
├── position-constants.ts
├── position-request.ts
├── position-response.ts
├── position-services.ts
├── position-queries.ts
├── position-mutations.ts
└── index.ts
```

### Bước 2: Define constants

```typescript
// position-constants.ts
import { API_VERSION } from "@/axios-config/constants";

export const POSITION_ENDPOINTS = {
  LIST: `${API_VERSION}/positions`,
  DETAIL: `${API_VERSION}/positions/:id`,
  CREATE: `${API_VERSION}/positions`,
  UPDATE: `${API_VERSION}/positions/:id`,
  DELETE: `${API_VERSION}/positions/:id`,
} as const;
```

### Bước 3: Define request/response types

```typescript
// position-request.ts
export type PositionGetListRequest = ListPaginationRequest;
export type PositionCreateRequest = { name: string; description?: string };
export type PositionUpdateRequest = Partial<PositionCreateRequest>;

// position-response.ts
export type PositionResponse = {
  id: string;
  name: string;
  description?: string;
};
```

### Bước 4: Create services

```typescript
// position-services.ts
import { get, post, put, del } from "@/axios-config";
import { POSITION_ENDPOINTS } from "./position-constants";

export const apiGetPositionsService = async (params: PositionGetListRequest) => {
  return await get(POSITION_ENDPOINTS.LIST, { queryParams: params });
};

export const apiCreatePositionService = async (data: PositionCreateRequest) => {
  return await post(POSITION_ENDPOINTS.CREATE, data);
};
```

### Bước 5: Create queries/mutations

```typescript
// position-queries.ts
import { useQuery } from "@tanstack/react-query";

export const POSITION_QUERY_KEY = {
  ALL: ["positions"] as const,
  LIST: () => [...POSITION_QUERY_KEY.ALL, "lists"] as const,
};

export const usePositionsQuery = (params: PositionGetListRequest) => {
  return useQuery({
    queryKey: POSITION_QUERY_KEY.LIST(),
    queryFn: () => apiGetPositionsService(params),
  });
};

// position-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreatePositionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiCreatePositionService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEY.ALL });
    },
  });
};
```

## 🎯 Best Practices

### 1. Khi nào dùng Refine hooks?
- ✅ CRUD đơn giản (list, detail, create, update, delete)
- ✅ Cần pagination, filtering, sorting tự động
- ✅ Tích hợp với Refine UI components

### 2. Khi nào dùng TanStack Query?
- ✅ Logic phức tạp (multiple endpoints, conditional queries)
- ✅ Cần control chi tiết cache, refetch, retry
- ✅ Custom mutations với side effects phức tạp
- ✅ Optimistic updates

### 3. Khi nào dùng Direct API call?
- ✅ One-time operations (export, download)
- ✅ Fire-and-forget requests
- ✅ Không cần state management

## 🔒 Token Flow

```
1. User login → Store ac_token & rf_token in cookies
2. Request sent → Interceptor adds Bearer token
3. API returns 401 → Interceptor catches
4. Queue pending requests
5. Call refresh token API
6. Update new tokens in cookies
7. Retry all queued requests with new token
8. If refresh fails → Clear tokens → Redirect to /login
```

## 🐛 Error Handling Flow

```
Request Error
├── 401 Unauthorized → Auto refresh token → Retry
├── 403 Forbidden → Toast error + Log warning
├── 404 Not Found → Toast error
├── 422 Validation → Toast error with messages
├── 500 Server Error → Retry with exponential backoff
├── Timeout → Toast error
└── Network Error → Toast error
```

## 📦 Dependencies

```json
{
  "axios": "^1.x",
  "@tanstack/react-query": "^5.x",
  "@refinedev/core": "^4.x",
  "sonner": "^1.x"
}
```

---

**Tạo bởi:** HRMS Development Team  
**Cập nhật:** 2025-11-09
