# HRMS Frontend - Complete Documentation

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Feature-First Pattern](#feature-first-pattern)
3. [RBAC Implementation](#rbac-implementation)
4. [Refine Configuration](#refine-configuration)
5. [Backend Integration](#backend-integration)
6. [Creating New Features](#creating-new-features)
7. [Best Practices](#best-practices)

## Architecture Overview

### Tech Stack
- **Next.js 14+** with App Router
- **Refine** for data management
- **Ant Design** for UI components
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **TypeScript** for type safety

### Folder Structure Philosophy

```
src/
├── app/                    # Next.js routing (thin layer)
├── features/               # Business logic (thick layer)
├── components/ui/          # Reusable UI primitives
├── providers/              # Refine providers
├── store/                  # Zustand stores
├── lib/                    # Utilities
└── types/                  # TypeScript definitions
```

**Key Principle**: Pages in `app/` are thin wrappers that import from `features/`.

## Feature-First Pattern

### What is Feature-First?

Each feature is a self-contained module with all its logic, components, and styles in one place.

### Structure Example

```
features/
└── posts/
    ├── index.tsx           # Main export (List component)
    ├── PostList.tsx        # List view
    ├── PostCreate.tsx      # Create form
    ├── PostEdit.tsx        # Edit form
    ├── PostShow.tsx        # Detail view
    ├── components/         # Feature-specific components
    │   └── PostCard.tsx
    └── hooks/              # Feature-specific hooks
        └── usePostStats.ts
```

### Usage in Pages

```typescript
// app/posts/page.tsx
"use client";
import { PostList } from "@/features/posts";
export default function PostsPage() {
  return <PostList />;
}
```

### Benefits

1. **Colocation**: Related code stays together
2. **Scalability**: Easy to add/remove features
3. **Team Collaboration**: Avoid merge conflicts
4. **Testability**: Test features in isolation
5. **Reusability**: Import features anywhere

## RBAC Implementation

### Zustand Store Structure

```typescript
interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
  token: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setRoles: (roles: Role[]) => void;
  logout: () => void;
  
  // RBAC helpers
  hasRole: (roleName: string) => boolean;
  hasPermission: (action: string, collection: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}
```

### Usage Examples

#### 1. Role-Based Access

```typescript
import { useAuthStore } from "@/store";

function AdminPanel() {
  const hasRole = useAuthStore((state) => state.hasRole);
  
  if (!hasRole("admin")) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Dashboard</div>;
}
```

#### 2. Permission-Based Access

```typescript
function CreateButton() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  
  if (!hasPermission("create", "posts")) {
    return null;
  }
  
  return <Button>Create Post</Button>;
}
```

#### 3. Generic Access Control

```typescript
function Actions({ resource }: { resource: string }) {
  const canAccess = useAuthStore((state) => state.canAccess);
  
  return (
    <div>
      {canAccess(resource, "edit") && <Button>Edit</Button>}
      {canAccess(resource, "delete") && <Button>Delete</Button>}
    </div>
  );
}
```

### Directus RBAC Mapping

The frontend RBAC maps to Directus:

1. **Roles**: Directus `directus_roles` table
2. **Permissions**: Directus `directus_permissions` table
3. **Policies**: Directus `directus_policies` table

Backend should return these in the login response:

```typescript
{
  user: { id, email, ... },
  token: "jwt_token",
  roles: [{ id: 1, name: "admin" }],
  permissions: [
    { action: "create", collection: "posts" },
    { action: "read", collection: "posts" },
  ]
}
```

## Refine Configuration

### 1. Data Provider

Located in `src/providers/dataProvider.ts`:

```typescript
export const dataProvider = (apiUrl: string): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters }) => {
    // Fetch list with pagination
  },
  getOne: async ({ resource, id }) => {
    // Fetch single item
  },
  create: async ({ resource, variables }) => {
    // Create new item
  },
  update: async ({ resource, id, variables }) => {
    // Update item
  },
  deleteOne: async ({ resource, id }) => {
    // Delete item
  },
});
```

### 2. Auth Provider

Located in `src/providers/authProvider.ts`:

```typescript
export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    // Call backend API
    // Store token and user data
  },
  logout: async () => {
    // Clear token and user data
  },
  check: async () => {
    // Verify if user is authenticated
  },
  getPermissions: async () => {
    // Return user permissions
  },
  getIdentity: async () => {
    // Return current user
  },
};
```

### 3. Resource Configuration

In `app/layout.tsx`:

```typescript
<Refine
  resources={[
    {
      name: "posts",
      list: "/posts",
      create: "/posts/create",
      edit: "/posts/:id/edit",
      show: "/posts/:id",
      meta: {
        canDelete: true,
        label: "Posts",
      },
    },
    // More resources...
  ]}
>
```

## Backend Integration

### Express + Directus Architecture

```
Frontend (Next.js)
      ↓
   API Layer (Express)
      ↓
 Directus (Headless CMS)
      ↓
   Database (MySQL/PostgreSQL)
```

### Why Express Middleware?

1. **Authentication Logic**: JWT handling, session management
2. **Business Rules**: Custom validation, authorization
3. **Data Transformation**: Format data for frontend
4. **Caching**: Redis integration
5. **Rate Limiting**: Protect Directus
6. **Logging**: Centralized logging

### Example Backend Route

```typescript
// BE/src/modules/posts/post.routes.ts
router.get("/posts", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const directus = getDirectusClient();
  const posts = await directus.items("posts").readByQuery({
    limit,
    offset: (page - 1) * limit,
  });
  
  res.json({
    data: posts.data,
    total: posts.meta.filter_count,
  });
});
```

## Creating New Features

### Step 1: Define Types

```typescript
// src/types/index.ts
export interface Employee {
  id: number;
  full_name: string;
  email: string;
  // ... more fields
}
```

### Step 2: Create Feature Components

```typescript
// src/features/employees/EmployeeList.tsx
"use client";
import { useList } from "@refinedev/core";
import { Employee } from "@/types";

export default function EmployeeList() {
  const { query } = useList<Employee>({ resource: "employees" });
  
  return (
    <Table dataSource={query.data?.data} />
  );
}
```

### Step 3: Create Feature Index

```typescript
// src/features/employees/index.tsx
export { default as EmployeeList } from "./EmployeeList";
export { default as EmployeeCreate } from "./EmployeeCreate";
export { default } from "./EmployeeList";
```

### Step 4: Create Page

```typescript
// src/app/employees/page.tsx
"use client";
import { EmployeeList } from "@/features/employees";

export default function EmployeesPage() {
  return <EmployeeList />;
}
```

### Step 5: Add Resource to Refine

```typescript
// src/app/layout.tsx
resources={[
  // ... other resources
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
  },
]}
```

## Best Practices

### 1. Component Organization

✅ **Do**:
```typescript
// Clear, single-purpose component
function UserCard({ user }: { user: User }) {
  return <Card>{user.name}</Card>;
}
```

❌ **Don't**:
```typescript
// Too many responsibilities
function UserCardWithFormAndAPI({ userId }: { userId: number }) {
  const [user, setUser] = useState();
  const [editing, setEditing] = useState(false);
  // ... 100 lines of code
}
```

### 2. State Management

✅ **Do**: Use Zustand for global state
```typescript
const user = useAuthStore((state) => state.user);
```

❌ **Don't**: Prop drilling
```typescript
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>
```

### 3. API Calls

✅ **Do**: Use Refine hooks
```typescript
const { query } = useList({ resource: "posts" });
```

❌ **Don't**: Direct fetch
```typescript
useEffect(() => {
  fetch("/api/posts").then(r => r.json()).then(setData);
}, []);
```

### 4. Styling

✅ **Do**: Use cn utility
```typescript
<div className={cn("p-4", isActive && "bg-blue-500")} />
```

❌ **Don't**: String concatenation
```typescript
<div className={"p-4 " + (isActive ? "bg-blue-500" : "")} />
```

### 5. Type Safety

✅ **Do**: Define interfaces
```typescript
interface Post {
  id: number;
  title: string;
}
const { query } = useList<Post>({ resource: "posts" });
```

❌ **Don't**: Use any
```typescript
const { query } = useList<any>({ resource: "posts" });
```

## Common Patterns

### 1. Protected Route

```typescript
"use client";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  if (!user) {
    router.push("/login");
    return null;
  }
  
  return <div>Protected Content</div>;
}
```

### 2. Loading State

```typescript
const { query } = useList({ resource: "posts" });

if (query.isLoading) {
  return <Spin />;
}

if (query.isError) {
  return <Alert message="Error loading data" />;
}

return <Table dataSource={query.data?.data} />;
```

### 3. Form Handling

```typescript
const [form] = Form.useForm();
const { mutate: createPost } = useCreate();

const onFinish = (values: any) => {
  createPost(
    { resource: "posts", values },
    {
      onSuccess: () => message.success("Created!"),
      onError: () => message.error("Failed!"),
    }
  );
};

return <Form form={form} onFinish={onFinish}>...</Form>;
```

### 4. Animated Transitions

```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution**: Check `tsconfig.json` for path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Tailwind classes not working

**Solution**: 
1. Check `tailwind.config.ts` content paths
2. Ensure `globals.css` imports are correct
3. Restart dev server

### Issue: Auth token not persisting

**Solution**: Check Zustand persist configuration:
```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: "auth-storage",
    storage: createJSONStorage(() => localStorage),
  }
)
```

---

**Happy Coding! 🚀**
