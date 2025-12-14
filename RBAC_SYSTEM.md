# Dynamic RBAC System

Hệ thống phân quyền động dựa trên Directus Permissions & Policies.

## Architecture

```
User → Role → Policy → Permissions
```

- **User**: Directus user với role reference
- **Role**: Vai trò (Manager, Employee, etc.)
- **Policy**: Chính sách access (admin_access, app_access)
- **Permission**: Quyền cụ thể trên collection + action

## Data Model (Backend)

### User
```typescript
interface User {
  id: string;
  role?: string; // FK to directus_roles.id
  employee_id?: string;
}
```

### Role
```typescript
interface Role {
  id: string;
  name: string;
  // Populated via policies
}
```

### Policy
```typescript
interface Policy {
  id: string;
  name: string;
  admin_access: boolean; // Full access bypass
  app_access: boolean;   // Can access app
}
```

### Permission
```typescript
interface Permission {
  id: string;
  collection: string;    // e.g., "weekly-schedules"
  action: string;        // "create", "read", "update", "delete"
  policy: string;        // FK to directus_policies.id
}
```

## Frontend Usage

### Hooks

#### `usePermissions()`
Main hook - returns permission helper functions:

```typescript
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { 
    isAdmin,
    hasPermission, 
    canCreate,
    canRead, 
    canUpdate,
    canDelete,
    canManageSchedule,
    canRegisterAvailability
  } = usePermissions();

  // Check specific permission
  if (hasPermission("weekly-schedules", "create")) {
    // Show create button
  }

  // Or use specific helpers
  if (canCreate("weekly-schedules")) {
    // Show create button
  }
}
```

#### `useCanManageSchedule()`
Shortcut for schedule management permission:

```typescript
import { useCanManageSchedule } from "@/hooks/usePermissions";

function ScheduleComponent() {
  const canManage = useCanManageSchedule();

  if (!canManage) {
    return <AccessDenied />;
  }

  return <ScheduleManager />;
}
```

#### `useIsAdmin()`
Check admin access:

```typescript
import { useIsAdmin } from "@/hooks/usePermissions";

function AdminPanel() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return <AdminControls />;
}
```

## Permission Collections

### Schedule Module

| Collection | Manager Actions | Employee Actions |
|-----------|----------------|------------------|
| `weekly-schedules` | create, read, update, delete | read |
| `shift-types` | create, read, update, delete | read |
| `shifts` | create, read, update, delete | read |
| `schedule-assignments` | create, read, update, delete | read |
| `employee-availability` | read, update (approve) | create, read, update |
| `schedule-change-requests` | read, update (approve), delete | create, read, update |

## Implementation Status

### ✅ Completed
- [x] Permission hook system (`usePermissions`)
- [x] Specialized hooks (`useCanManageSchedule`, `useIsAdmin`)
- [x] Updated ShiftTypesManagement with dynamic RBAC
- [x] Updated WeeklySchedulesManagement with dynamic RBAC
- [x] Updated ScheduleDashboard with dynamic RBAC
- [x] Updated layout navigation with dynamic RBAC

### 🔄 In Progress
- [ ] Backend API to fetch permissions by role
- [ ] Permission caching and loading strategy
- [ ] Permission context provider for app-wide state

### 📋 TODO
- [ ] Load actual permissions from BE on login
- [ ] Cache permissions in localStorage/memory
- [ ] Add permission check middleware for routes
- [ ] Add permission-based UI component (`<CanAccess>`)
- [ ] Add audit logging for permission checks
- [ ] Add permission testing utilities

## Backend Requirements

### API Endpoints Needed

1. **GET /permissions?filter[role][_eq]=${roleId}**
   - Lấy tất cả permissions cho role
   - Response: `Permission[]`

2. **GET /policies?filter[role][_eq]=${roleId}**
   - Lấy tất cả policies cho role
   - Response: `Policy[]`

3. **GET /users/me** (Enhanced)
   - Populate role with full data including permissions
   - Response:
     ```typescript
     {
       ...user,
       role: {
         id: string,
         name: string,
         policies: Policy[],
         permissions: Permission[]
       }
     }
     ```

## Migration Path

### Current: Hardcoded role names
```typescript
// ❌ Old way
const isManager = user?.role?.name?.includes('manager');
```

### New: Dynamic permissions
```typescript
// ✅ New way
import { useCanManageSchedule } from "@/hooks/usePermissions";

const canManage = useCanManageSchedule();
```

### Fallback Strategy

Hệ thống hiện tại có fallback:
1. Kiểm tra `admin_access` → full access
2. Kiểm tra permissions từ API (khi implement)
3. Fallback to role name check (tạm thời)

## Examples

### Protect a page
```typescript
"use client";

import { useCanManageSchedule } from "@/hooks/usePermissions";

export function ManagerOnlyPage() {
  const canManage = useCanManageSchedule();

  if (!canManage) {
    return <AccessDenied />;
  }

  return <PageContent />;
}
```

### Conditional rendering
```typescript
import { usePermissions } from "@/hooks/usePermissions";

export function ScheduleActions() {
  const { canCreate, canDelete } = usePermissions();

  return (
    <div>
      {canCreate("weekly-schedules") && (
        <Button onClick={handleCreate}>Tạo lịch</Button>
      )}
      
      {canDelete("weekly-schedules") && (
        <Button danger onClick={handleDelete}>Xóa</Button>
      )}
    </div>
  );
}
```

### Check multiple permissions
```typescript
import { usePermissions } from "@/hooks/usePermissions";

export function ScheduleManager() {
  const { hasPermission } = usePermissions();

  const canPublish = hasPermission("weekly-schedules", "update");
  const canAssign = hasPermission("schedule-assignments", "create");

  return (
    <div>
      {canPublish && <PublishButton />}
      {canAssign && <AssignButton />}
    </div>
  );
}
```

## Notes

- **Admin bypass**: Users với `admin_access = true` có full quyền
- **Employee-only**: `canRegisterAvailability` chỉ true cho non-managers
- **Type-safe**: Tất cả hooks đều type-safe với TypeScript
- **Cached**: Permissions sẽ được cache sau khi load lần đầu
- **SSR-safe**: Hooks chỉ chạy client-side (`"use client"`)
