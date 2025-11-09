# HRMS Frontend

A modern, feature-first Human Resource Management System (HRMS) built with Next.js, Refine, Ant Design, TailwindCSS, and Framer Motion.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Ant Design (antd)
- **Styling**: TailwindCSS + cn utility (tailwind-merge)
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Data Layer**: Refine (with custom DataProvider)
- **Backend Communication**: Express API → Directus
- **Language**: TypeScript

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router pages
│   ├── (dashboard)/
│   │   └── page.tsx             # Dashboard page
│   ├── posts/
│   │   ├── page.tsx             # Posts list
│   │   ├── create/page.tsx      # Create post
│   │   └── [id]/
│   │       ├── page.tsx         # Show post
│   │       └── edit/page.tsx    # Edit post
│   ├── login/page.tsx           # Login page
│   ├── layout.tsx               # Root layout with Refine providers
│   └── globals.css              # Global styles with Tailwind
├── components/
│   └── ui/                      # Reusable UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── Icon.tsx
├── features/                    # Feature-first architecture
│   ├── dashboard/
│   │   └── index.tsx           # Dashboard feature (default export)
│   ├── posts/
│   │   ├── index.tsx           # Posts feature exports
│   │   ├── PostList.tsx
│   │   ├── PostCreate.tsx
│   │   ├── PostEdit.tsx
│   │   └── PostShow.tsx
│   └── auth/
│       └── index.tsx           # Login feature
├── lib/
│   └── utils/
│       ├── cn.ts               # Class name utility
│       └── index.ts
├── providers/
│   ├── authProvider.ts         # Refine auth provider
│   ├── dataProvider.ts         # Refine data provider
│   └── index.ts
├── store/
│   ├── authStore.ts            # Zustand auth store with RBAC
│   └── index.ts
└── types/
    └── index.ts                # TypeScript types for BE models
```

## 🎯 Key Features

### Feature-First Architecture
Each feature is self-contained in its own folder with:
- Default export for the main component
- Local components and logic
- Easy to import: `import Dashboard from "@/features/dashboard"`

### RBAC with Zustand
Complete Role-Based Access Control using Zustand:
```typescript
const { hasRole, hasPermission, canAccess } = useAuthStore();

// Check role
if (hasRole("admin")) { ... }

// Check permission
if (hasPermission("create", "posts")) { ... }

// Generic access control
if (canAccess("posts", "delete")) { ... }
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- Yarn package manager
- Backend API running (see Backend section)

### Install Dependencies
```bash
cd FE/refine-nextjs
yarn install
```

### Environment Configuration
Create a `.env.local` file:
```bash
cp .env.example .env.local
```

Update the values:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Available Scripts

### Running the development server.

```bash
yarn dev
```

### Building for production.

```bash
yarn build
```

### Running the production server.

```bash
yarn start
```

## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Ant Design** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **Custom Auth Provider** [Docs](https://refine.dev/docs/core/providers/auth-provider/)

## License

MIT
