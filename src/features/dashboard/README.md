# Dashboard Feature

Dashboard hiện đại và đẹp mắt cho hệ thống HRMS với các tính năng thống kê và phân tích toàn diện.

## 📁 Cấu trúc

```
dashboard/
├── components/          # UI Components
│   ├── StatCard.tsx           # Card hiển thị thống kê
│   ├── AttendanceChart.tsx    # Biểu đồ chấm công
│   ├── RecentActivities.tsx   # Hoạt động gần đây
│   ├── QuickActions.tsx       # Thao tác nhanh
│   ├── TopEmployees.tsx       # Nhân viên xuất sắc
│   └── index.ts
├── hooks/               # Custom Hooks
│   ├── useDashboardStats.ts   # Hook fetch dữ liệu thống kê
│   └── index.ts
├── stores/              # State Management
│   ├── dashboardStore.ts      # Zustand store
│   └── index.ts
└── index.tsx           # Main Dashboard Component
```

## 🎨 Tính năng

### 1. **Thống kê tổng quan (Stats Cards)**
- Tổng nhân viên
- Nhân viên đang làm việc
- Có mặt hôm nay
- Vắng mặt
- Đi muộn
- Giờ tăng ca
- Yêu cầu chờ xử lý
- Thiết bị online

### 2. **Biểu đồ chấm công (Attendance Chart)**
- Hiển thị dữ liệu theo tuần
- 3 trạng thái: Có mặt, Đi muộn, Vắng mặt
- Có thể chuyển đổi giữa: Hôm nay, Tuần, Tháng, Năm
- Animated bars với hover effects

### 3. **Hoạt động gần đây (Recent Activities)**
- Hiển thị hoạt động real-time
- Check-in/Check-out
- Đi muộn
- Vắng mặt
- Yêu cầu nghỉ phép
- Format thời gian bằng date-fns (tiếng Việt)

### 4. **Thao tác nhanh (Quick Actions)**
- Thêm nhân viên
- Xếp lịch làm việc
- Tính lương
- Báo cáo
- Cài đặt
- Xuất dữ liệu

### 5. **Nhân viên xuất sắc (Top Employees)**
- Top 5 nhân viên theo tỷ lệ chấm công
- Hiển thị ranking với icon Trophy
- Progress bar màu sắc theo performance
- Số giờ làm việc

## 🔧 Sử dụng

### Import Dashboard
```tsx
import Dashboard from "@/features/dashboard";

export default function DashboardPage() {
  return <Dashboard />;
}
```

### Sử dụng Dashboard Store
```tsx
import { useDashboardStore } from "@/features/dashboard/stores";

function MyComponent() {
  const { stats, loading, setSelectedPeriod } = useDashboardStore();
  
  return (
    <div>
      <p>Tổng nhân viên: {stats.totalEmployees}</p>
      <p>Loading: {loading ? "Đang tải..." : "Đã tải"}</p>
    </div>
  );
}
```

### Sử dụng Dashboard Stats Hook
```tsx
import { useDashboardStats } from "@/features/dashboard/hooks";

function MyComponent() {
  const { refresh } = useDashboardStats();
  
  return (
    <button onClick={refresh}>
      Làm mới dữ liệu
    </button>
  );
}
```

## 🎯 State Management

Dashboard sử dụng **Zustand** để quản lý state:

```typescript
interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  overtimeHours: number;
  pendingRequests: number;
  devicesOnline: number;
}

interface DashboardStore {
  stats: DashboardStats;
  loading: boolean;
  selectedPeriod: "today" | "week" | "month" | "year";
  setStats: (stats: Partial<DashboardStats>) => void;
  setLoading: (loading: boolean) => void;
  setSelectedPeriod: (period: "today" | "week" | "month" | "year") => void;
}
```

## 📊 Data Fetching

Dashboard tự động fetch dữ liệu từ API sử dụng **Refine hooks**:

- `useList<Employee>` - Danh sách nhân viên
- `useList<AttendanceLog>` - Lịch sử chấm công
- `useList<Device>` - Danh sách thiết bị

Dữ liệu được tự động làm mới khi:
- Component mount
- User click nút "Làm mới"
- Thay đổi period (today/week/month/year)

## 🎨 Styling

Dashboard sử dụng:
- **Ant Design** components
- **TailwindCSS** utilities
- **Lucide React** icons
- Gradient backgrounds
- Smooth animations
- Responsive layout

### Color Scheme
- Blue: Thông tin chung
- Green: Trạng thái tích cực
- Orange: Cảnh báo
- Red: Vấn đề cần chú ý
- Purple: Thao tác đặc biệt
- Cyan: Dữ liệu bổ sung

## 📱 Responsive Design

Dashboard tối ưu cho mọi kích thước màn hình:
- **Mobile** (xs): 1 column
- **Tablet** (sm): 2 columns
- **Desktop** (lg): 4-6 columns

## 🚀 Performance

Dashboard được tối ưu hiệu suất:
- ✅ Lazy loading components
- ✅ Memoization với React.memo
- ✅ Efficient state updates
- ✅ Query caching với React Query
- ✅ Debounced refresh

## 🔄 Real-time Updates

Dashboard hỗ trợ cập nhật theo thời gian thực:
- Auto-refresh mỗi 30s (có thể cấu hình)
- Manual refresh button
- Loading states
- Error handling

## 🎭 Animations

Dashboard sử dụng nhiều hiệu ứng animation:
- Card hover effects
- Smooth transitions
- Loading spinners
- Progress bars
- Fade in/out

## 📝 Tùy chỉnh

Bạn có thể tùy chỉnh Dashboard bằng cách:

### 1. Thêm Stats mới
```typescript
// stores/dashboardStore.ts
interface DashboardStats {
  // ... existing stats
  newStat: number;
}
```

### 2. Thêm Component mới
```tsx
// components/NewComponent.tsx
export const NewComponent = () => {
  return <Card>...</Card>;
};

// index.tsx
import { NewComponent } from "./components/NewComponent";
```

### 3. Thay đổi màu sắc
```tsx
// components/StatCard.tsx
const colorClasses = {
  // Add new color
  pink: "bg-pink-50 text-pink-600",
};
```

## 🐛 Debug

Để debug Dashboard:

1. **Check loading state**
```tsx
console.log(useDashboardStore.getState().loading);
```

2. **Check stats data**
```tsx
console.log(useDashboardStore.getState().stats);
```

3. **Monitor API calls**
- Mở DevTools → Network tab
- Filter by: `employees`, `attendance-logs`, `devices`

## 🔗 Dependencies

Dashboard phụ thuộc vào:
- `zustand` - State management
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@refinedev/core` - Data fetching
- `antd` - UI components
- `tailwindcss` - Styling

## 📚 Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Date-fns Documentation](https://date-fns.org/)
- [Refine Documentation](https://refine.dev/docs)
- [Ant Design Documentation](https://ant.design/)
- [Lucide Icons](https://lucide.dev/)

## ✨ Tips

1. **Performance**: Sử dụng `React.memo` cho components không thay đổi thường xuyên
2. **Accessibility**: Thêm `aria-label` cho các interactive elements
3. **SEO**: Sử dụng semantic HTML tags
4. **Testing**: Viết unit tests cho store và hooks
5. **Documentation**: Comment code cho logic phức tạp

---

**Created with ❤️ for HRMS Project**
