# 🚀 HRMS Frontend - Quick Start Guide

## Prerequisites

- Node.js 18+ or Bun
- Yarn package manager
- Backend API running on port 3001

## Installation

```bash
# Navigate to frontend directory
cd FE/refine-nextjs

# Install dependencies
yarn install
```

## Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and set:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Development

```bash
# Start development server
yarn dev

# Open browser
# http://localhost:3000
```

## Default Credentials

If your backend has seed data:
```
Email: admin@example.com
Password: password123
```

## Project Structure

```
src/
├── app/          # Next.js pages (thin)
├── features/     # Business logic (thick)
├── components/   # Reusable UI
├── providers/    # Refine setup
├── store/        # Zustand RBAC
└── types/        # TypeScript types
```

## Key Concepts

### 1. Feature-First Architecture
Each feature lives in its own folder:
```typescript
// Import feature directly
import Dashboard from "@/features/dashboard";
```

### 2. RBAC with Zustand
```typescript
const { hasRole, canAccess } = useAuthStore();

if (hasRole("admin")) {
  // Show admin content
}
```

### 3. Refine Hooks
```typescript
const { query } = useList({ resource: "posts" });
const { mutate: create } = useCreate();
```

## Common Tasks

### Create New Feature

1. Create folder: `src/features/my-feature/`
2. Create component: `index.tsx`
3. Create page: `src/app/my-feature/page.tsx`
4. Add resource to `layout.tsx`

### Add New Route

```typescript
// app/my-page/page.tsx
"use client";
import MyFeature from "@/features/my-feature";
export default function MyPage() {
  return <MyFeature />;
}
```

### Style with Tailwind

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "p-4 bg-white",
  isActive && "bg-blue-500"
)} />
```

## Troubleshooting

### Port 3000 in use
```bash
# Kill process on port 3000
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
yarn dev --port 3001
```

### Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
yarn install
```

### Tailwind not working
```bash
# Restart dev server
# Ctrl+C then yarn dev
```

## Build for Production

```bash
# Build
yarn build

# Start production server
yarn start
```

## Testing API Connection

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Or in PowerShell
Invoke-WebRequest http://localhost:3001/api/health
```

## Useful Commands

```bash
# Install new package
yarn add package-name

# Install dev dependency
yarn add -D package-name

# Run linter
yarn lint

# Type check
yarn type-check
```

## File Locations

| Need | Location |
|------|----------|
| Add new page | `src/app/` |
| Create feature | `src/features/` |
| Reusable component | `src/components/ui/` |
| Add type | `src/types/index.ts` |
| Auth logic | `src/store/authStore.ts` |
| API config | `src/providers/dataProvider.ts` |

## Next Steps

1. ✅ Install and run (done)
2. 📖 Read `DOCUMENTATION.md` for detailed guides
3. 🎨 Explore example features in `src/features/`
4. 🔨 Build your first feature
5. 📝 Check `PROJECT_STRUCTURE.md` for architecture

## Support

- Documentation: `DOCUMENTATION.md`
- Structure: `PROJECT_STRUCTURE.md`
- Main README: `README.md`

---

**Happy Coding! 🎉**
