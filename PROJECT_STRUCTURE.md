# HRMS Frontend - Project Structure

## 📂 Complete File Tree

```
FE/refine-nextjs/
├── .env.example                           # Environment variables template
├── .eslintrc.json                         # ESLint configuration
├── .gitignore                             # Git ignore rules
├── next.config.mjs                        # Next.js configuration
├── package.json                           # Dependencies and scripts
├── postcss.config.js                      # PostCSS configuration
├── README.md                              # Project documentation
├── DOCUMENTATION.md                       # Detailed technical docs
├── tailwind.config.ts                     # Tailwind CSS configuration
├── tsconfig.json                          # TypeScript configuration
├── yarn.lock                              # Yarn lock file
│
└── src/
    ├── app/                               # Next.js App Router
    │   ├── globals.css                    # Global styles with Tailwind
    │   ├── layout.tsx                     # Root layout with Refine setup
    │   ├── page.tsx                       # Root page
    │   │
    │   ├── (dashboard)/                   # Dashboard route group
    │   │   └── page.tsx                   # Dashboard page
    │   │
    │   ├── login/                         # Auth pages
    │   │   └── page.tsx                   # Login page
    │   │
    │   └── posts/                         # Posts CRUD pages
    │       ├── page.tsx                   # List posts
    │       ├── create/
    │       │   └── page.tsx               # Create post
    │       └── [id]/
    │           ├── page.tsx               # Show post
    │           └── edit/
    │               └── page.tsx           # Edit post
    │
    ├── components/                        # Reusable components
    │   └── ui/                            # UI primitives
    │       ├── Button.tsx                 # Custom button component
    │       ├── Card.tsx                   # Card with animations
    │       ├── Icon.tsx                   # Icon wrapper
    │       ├── Modal.tsx                  # Modal component
    │       └── index.ts                   # UI components export
    │
    ├── features/                          # Feature-first modules
    │   ├── auth/                          # Authentication feature
    │   │   └── index.tsx                  # Login form
    │   │
    │   ├── dashboard/                     # Dashboard feature
    │   │   └── index.tsx                  # Dashboard stats & charts
    │   │
    │   └── posts/                         # Posts feature
    │       ├── index.tsx                  # Main exports
    │       ├── PostList.tsx               # List view with table
    │       ├── PostCreate.tsx             # Create form
    │       ├── PostEdit.tsx               # Edit form
    │       └── PostShow.tsx               # Detail view
    │
    ├── lib/                               # Utilities
    │   └── utils/
    │       ├── cn.ts                      # Class names utility
    │       └── index.ts                   # Utils export
    │
    ├── providers/                         # Refine providers
    │   ├── authProvider.ts                # Authentication provider
    │   ├── dataProvider.ts                # Data provider (API client)
    │   └── index.ts                       # Providers export
    │
    ├── store/                             # Zustand stores
    │   ├── authStore.ts                   # Auth state with RBAC
    │   └── index.ts                       # Stores export
    │
    └── types/                             # TypeScript types
        └── index.ts                       # All type definitions
```

## 🎯 Key Files Explained

### Configuration Files

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Tailwind CSS theme customization |
| `tsconfig.json` | TypeScript compiler options and path aliases |
| `next.config.mjs` | Next.js build and runtime configuration |
| `postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| `.env.example` | Environment variables template |

### Core Application Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with Refine providers |
| `src/app/globals.css` | Global styles and Tailwind imports |
| `src/providers/authProvider.ts` | Refine authentication logic |
| `src/providers/dataProvider.ts` | Refine API communication |
| `src/store/authStore.ts` | Zustand RBAC store |

### Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils/cn.ts` | Class name merging utility |
| `src/types/index.ts` | TypeScript interfaces for all models |

### Features

| Feature | Files | Purpose |
|---------|-------|---------|
| Auth | `features/auth/index.tsx` | Login form with Refine |
| Dashboard | `features/dashboard/index.tsx` | Stats and overview |
| Posts | `features/posts/*.tsx` | Full CRUD example |

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| Button | `components/ui/Button.tsx` | Customized Ant Design button |
| Card | `components/ui/Card.tsx` | Card with hover effects |
| Modal | `components/ui/Modal.tsx` | Animated modal |
| Icon | `components/ui/Icon.tsx` | Ant Design icon wrapper |

## 🔧 Important Paths

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import Dashboard from "@/features/dashboard";
import { Button, Card } from "@/components/ui";
import { User, Post } from "@/types";
```

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",           // Start development server
    "build": "next build",       // Build for production
    "start": "next start",       // Start production server
    "lint": "next lint"          // Run ESLint
  }
}
```

## 🎨 Styling Approach

1. **Tailwind CSS**: Utility-first styling
2. **Ant Design**: Component library
3. **cn() utility**: Class name merging
4. **globals.css**: Base styles and animations
5. **Framer Motion**: Animation library

## 🔐 RBAC Structure

```
Zustand Store (authStore)
├── user: User | null
├── roles: Role[]
├── permissions: Permission[]
├── policies: Policy[]
└── methods:
    ├── hasRole(roleName)
    ├── hasPermission(action, collection)
    └── canAccess(resource, action)
```

## 🌐 API Integration

```
Frontend                Backend                 Directus
─────────              ────────                ─────────
Refine hooks     →     Express API      →      Directus SDK
(useList, etc)         (routes)                (CMS/DB)
```

## 📝 Feature Structure Pattern

```
features/
└── feature-name/
    ├── index.tsx              # Main export
    ├── FeatureList.tsx        # List view
    ├── FeatureCreate.tsx      # Create form
    ├── FeatureEdit.tsx        # Edit form
    ├── FeatureShow.tsx        # Detail view
    ├── components/            # Local components
    │   └── FeatureCard.tsx
    └── hooks/                 # Local hooks
        └── useFeature.ts
```

## 🚀 Getting Started Checklist

- [ ] Clone repository
- [ ] Run `yarn install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `NEXT_PUBLIC_API_URL`
- [ ] Ensure backend is running
- [ ] Run `yarn dev`
- [ ] Visit `http://localhost:3000`
- [ ] Login with test credentials

## 📚 Learning Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Refine Documentation](https://refine.dev/docs)
- [Ant Design Components](https://ant.design/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Generated for HRMS Project**
