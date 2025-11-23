# 🔗 Schedule Navigation Flow - Liên kết giữa các trang

## Tổng quan luồng điều hướng

```
┌──────────────────────────────────────────────────────────────────┐
│                    WEEKLY SCHEDULES MANAGEMENT                    │
│                   /schedule/weekly-schedules                      │
│  - Danh sách tất cả lịch tuần                                    │
│  - CRUD operations                                                │
│  - Statistics overview                                            │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ Click "Xem chi tiết"
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                    WEEKLY SCHEDULE DETAIL                         │
│                   /schedule/weekly/[id]                           │
│  - Thông tin chi tiết 1 lịch tuần                                │
│  - Statistics: Shifts, Assignments, Coverage                      │
│  - Timeline events                                                │
│  - Status-based actions                                           │
└──┬──────────────┬──────────────────────────────────────────┬─────┘
   │              │                                           │
   │ "Quản lý     │ "Xếp lịch"                              │ "Công bố"
   │  ca làm"     │ (scheduled only)                         │ → SCHEDULED
   │              │                                           │
   ▼              ▼                                           ▼
┌─────────────┐ ┌──────────────────┐                   ┌──────────┐
│   SHIFTS    │ │   ASSIGNMENTS    │                   │ VALIDATE │
│ MANAGEMENT  │ │   MANAGEMENT     │                   │  MODAL   │
└─────────────┘ └──────────────────┘                   └──────────┘
```

---

## 📄 Chi tiết từng trang

### 1. Weekly Schedules Management
**Route:** `/schedule/weekly-schedules`  
**Component:** `WeeklySchedulesManagement.tsx`

#### Chức năng
- ✅ Danh sách tất cả lịch tuần với pagination
- ✅ Statistics cards (Draft, Scheduled, Finalized)
- ✅ Create, Edit, Delete lịch tuần
- ✅ Publish và Finalize actions

#### Navigation từ trang này
| Action | Target | Method | Notes |
|--------|--------|--------|-------|
| **Xem chi tiết** | Detail page | `router.push('/schedule/weekly/${id}')` | Từ menu dropdown |
| **Chỉnh sửa** | Modal | In-page modal | Chỉ DRAFT/SCHEDULED |
| **Công bố** | Validation Modal | `handlePublish(id)` | Chỉ DRAFT |
| **Hoàn tất** | Confirmation | `handleFinalize(id)` | Chỉ SCHEDULED |

---

### 2. Weekly Schedule Detail  
**Route:** `/schedule/weekly/[id]`  
**Component:** `WeeklyScheduleDetail.tsx`

#### Chức năng
- ✅ Hiển thị thông tin chi tiết 1 lịch tuần
- ✅ Statistics: Total shifts, assignments, coverage rate
- ✅ Shifts table với thông tin đầy đủ
- ✅ Timeline events (created, published, finalized)
- ✅ Quick actions dựa trên status
- ✅ Workflow status indicators

#### Navigation từ trang này
| Action | Target | Method | Query Params | Status |
|--------|--------|--------|--------------|--------|
| **Quản lý ca làm** | Shifts Management | `window.location.href = "/schedule/shifts?schedule_id=" + id` | `?schedule_id={id}` | DRAFT, SCHEDULED |
| **Xếp lịch** | Assignments | `window.location.href = "/schedule/assignments?schedule_id=" + id` | `?schedule_id={id}` | SCHEDULED only |
| **Công bố** | Validation Modal | `handlePublish()` | - | DRAFT only |
| **Hoàn tất** | Confirmation | `handleFinalize()` | - | SCHEDULED only |
| **Quay lại** | List page | `list("weekly-schedules")` | - | All |

#### Quick Actions Section
- 📍 **Location:** Dưới statistics cards, trên tabs
- 📋 **Content:**
  - Link tới Shifts Management với số ca hiện tại
  - Link tới Assignments (nếu status = scheduled) với coverage %
  - Visual indicators cho progress

---

### 3. Shifts Management
**Route:** `/schedule/shifts`  
**Component:** `ShiftsManagement.tsx`

#### Chức năng
- ✅ Tạo và quản lý shifts cho lịch tuần
- ✅ Bulk create shifts (tạo nhiều ca cùng lúc)
- ✅ Add position requirements cho mỗi shift
- ✅ Calendar view theo ngày trong tuần
- ✅ Filter theo schedule (dropdown + URL params)

#### URL Parameters
```typescript
?schedule_id={weeklyScheduleId}
```

#### Auto-select Schedule
```typescript
// When navigating from detail page
const searchParams = useSearchParams();
useEffect(() => {
  const scheduleIdFromUrl = searchParams.get("schedule_id");
  if (scheduleIdFromUrl && !selectedSchedule) {
    setSelectedSchedule(scheduleIdFromUrl);
  }
}, [searchParams]);
```

#### Navigation từ trang này
| Action | Target | Method | Notes |
|--------|--------|--------|-------|
| **Chọn schedule** | Filter data | Dropdown selection | Manual select |
| **Auto-load** | Auto-filter | URL params | From detail page |
| **Tạo shift** | Modal | In-page modal | - |
| **Bulk create** | Modal | In-page modal | Multiple shifts |

---

### 4. Assignments Management
**Route:** `/schedule/assignments`  
**Component:** `ScheduleAssignmentManagementNew.tsx`

#### Chức năng
- ✅ Xếp lịch phân công nhân viên vào shifts
- ✅ View by day of week
- ✅ Drag & drop assignments (có thể)
- ✅ Employee availability checking
- ✅ Auto-schedule algorithm
- ✅ Coverage tracking

#### URL Parameters
```typescript
?schedule_id={weeklyScheduleId}
```

#### Auto-select Schedule
```typescript
// When navigating from detail page
const searchParams = useSearchParams();
useEffect(() => {
  const scheduleIdFromUrl = searchParams.get("schedule_id");
  if (scheduleIdFromUrl && !selectedSchedule) {
    setSelectedSchedule(scheduleIdFromUrl);
  }
}, [searchParams]);
```

#### Navigation từ trang này
| Action | Target | Method | Notes |
|--------|--------|--------|-------|
| **Chọn schedule** | Filter data | Dropdown selection | Manual select |
| **Auto-load** | Auto-filter | URL params | From detail page |
| **Assign employee** | Drawer | In-page drawer | Per shift |
| **Auto-schedule** | API call | `useAutoSchedule()` | Bulk assign |

---

## 🔄 Complete User Journey

### Scenario: Tạo và hoàn tất lịch tuần mới

```
1️⃣ Weekly Schedules Management
   └─ Click "Tạo Lịch Tuần"
   └─ Điền form: Week range, Notes
   └─ Click "Tạo" → Status = DRAFT

2️⃣ Click "Xem chi tiết" → Weekly Schedule Detail
   └─ Thấy status: DRAFT
   └─ Workflow alert: "Thêm ca làm việc..."
   └─ Click "Quản lý ca làm" hoặc link trong Quick Actions

3️⃣ Shifts Management (?schedule_id=xxx)
   └─ Schedule tự động được chọn
   └─ Click "Tạo nhiều ca" (Bulk create)
   └─ Chọn các ngày, loại ca, requirements
   └─ Click "Tạo" → Tạo 21 shifts (3 ca x 7 ngày)
   └─ Quay lại Detail page

4️⃣ Weekly Schedule Detail
   └─ Thấy statistics: 21 shifts đã tạo
   └─ Click "Công bố" → Validation check
   └─ Nếu hợp lệ: Status = SCHEDULED
   └─ Workflow alert thay đổi: "Xếp lịch phân công..."

5️⃣ Click "Xếp lịch" → Assignments Management (?schedule_id=xxx)
   └─ Schedule tự động được chọn
   └─ Xem danh sách shifts theo ngày
   └─ Click vào shift → Drawer mở
   └─ Chọn nhân viên cho từng vị trí
   └─ Hoặc click "Auto-schedule" cho tất cả
   └─ Quay lại Detail page

6️⃣ Weekly Schedule Detail
   └─ Thấy statistics: Coverage = 100%
   └─ Click "Hoàn tất" → Confirmation modal
   └─ Xác nhận → Status = FINALIZED
   └─ Workflow alert: "Lịch đã khóa"
   └─ Không còn actions (chỉ xem)

✅ DONE! Lịch tuần đã sẵn sàng cho chấm công
```

---

## 🎯 URL Parameters Flow

### From Detail to Shifts
```typescript
// WeeklyScheduleDetail.tsx
onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}

// URL: /schedule/shifts?schedule_id=abc-123

// ShiftsManagement.tsx
const searchParams = useSearchParams();
const scheduleIdFromUrl = searchParams.get("schedule_id");
// → Auto-select schedule "abc-123"
```

### From Detail to Assignments
```typescript
// WeeklyScheduleDetail.tsx
onClick={() => window.location.href = "/schedule/assignments?schedule_id=" + id}

// URL: /schedule/assignments?schedule_id=abc-123

// ScheduleAssignmentManagementNew.tsx
const searchParams = useSearchParams();
const scheduleIdFromUrl = searchParams.get("schedule_id");
// → Auto-select schedule "abc-123"
```

---

## 📊 Data Flow Between Pages

### Weekly Schedules Management → Detail
```typescript
// Pass via route parameter
router.push(`/schedule/weekly/${record.id}`);

// Detail page receives
export default function WeeklyScheduleDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <WeeklyScheduleDetail id={params.id} />;
}
```

### Detail → Shifts/Assignments
```typescript
// Pass via query parameter
window.location.href = "/schedule/shifts?schedule_id=" + id;

// Target page receives
const searchParams = useSearchParams();
const scheduleId = searchParams.get("schedule_id");
```

### Why Query Params?
- ✅ User có thể manually chọn schedule khác
- ✅ URL shareable (copy link để share)
- ✅ Browser back/forward works
- ✅ Refresh page giữ nguyên context
- ✅ Không cần complex state management

---

## 🎨 Visual Indicators

### Status Colors in Detail Page
| Status | Background | Border | Icon | Text |
|--------|-----------|--------|------|------|
| draft | `#f0f5ff` | `#adc6ff` | 📝 | Nháp |
| scheduled | `#e6f7ff` | `#91d5ff` | 📢 | Đã công bố |
| finalized | `#f6ffed` | `#b7eb8f` | ✅ | Hoàn tất |

### Action Buttons Visibility
```
DRAFT:
  ✅ Quản lý ca làm
  ✅ Công bố

SCHEDULED:
  ✅ Quản lý ca làm
  ✅ Xếp lịch
  ✅ Hoàn tất

FINALIZED:
  ✅ Quay lại (only)
```

---

## 🔧 Implementation Details

### useSearchParams Hook
```typescript
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const value = searchParams.get("key");
```

### Auto-select Pattern
```typescript
const [selectedSchedule, setSelectedSchedule] = useState<string>("");

useEffect(() => {
  const scheduleIdFromUrl = searchParams.get("schedule_id");
  if (scheduleIdFromUrl && !selectedSchedule) {
    setSelectedSchedule(scheduleIdFromUrl);
  }
}, [searchParams, selectedSchedule]);
```

### window.location.href vs router.push
```typescript
// Using window.location.href (current implementation)
// ✅ Simple
// ✅ Full page reload ensures fresh data
// ❌ Slower transition

onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}

// Alternative: router.push (Next.js navigation)
// ✅ Faster (client-side navigation)
// ✅ No page reload
// ❌ Need to ensure data refetch

const router = useRouter();
onClick={() => router.push(`/schedule/shifts?schedule_id=${id}`)}
```

---

## 🎓 Best Practices

### 1. Luôn truyền schedule_id
```typescript
// ✅ Good - With context
"/schedule/shifts?schedule_id=abc-123"

// ❌ Bad - No context
"/schedule/shifts"
```

### 2. Auto-select nhưng cho phép thay đổi
```typescript
// User có thể:
// 1. Nhận schedule từ URL (auto-select)
// 2. Chọn schedule khác từ dropdown
// 3. Cả hai đều work
```

### 3. Visual feedback
```typescript
// Hiển thị rõ ràng schedule hiện tại
<Select value={selectedSchedule}>
  {schedules.map(s => (
    <Select.Option value={s.id}>
      Tuần {formatDate(s.week_start)}
    </Select.Option>
  ))}
</Select>
```

### 4. Breadcrumb navigation
```typescript
// Consider adding breadcrumb
Home > Lịch làm việc > Tuần 45/2024 > Chi tiết
                                        ↑ You are here
```

---

## 🚀 Future Enhancements

### 1. Breadcrumb Component
```typescript
<Breadcrumb>
  <Breadcrumb.Item href="/dashboard">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/schedule/weekly-schedules">
    Lịch tuần
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    Tuần {weekNumber}
  </Breadcrumb.Item>
</Breadcrumb>
```

### 2. Back Button với Context
```typescript
// Remember where user came from
const router = useRouter();
onClick={() => router.back()} // Intelligent back
```

### 3. Tab Navigation in Detail Page
```typescript
// Add tabs for different views
<Tabs>
  <Tabs.TabPane tab="Thông tin" key="info" />
  <Tabs.TabPane tab="Ca làm việc" key="shifts">
    <EmbeddedShiftsView scheduleId={id} />
  </Tabs.TabPane>
  <Tabs.TabPane tab="Phân công" key="assignments">
    <EmbeddedAssignmentsView scheduleId={id} />
  </Tabs.TabPane>
</Tabs>
```

### 4. Quick Stats Badges
```typescript
// In schedule list table
<Badge count={shiftCount} showZero>
  <CalendarOutlined />
</Badge>
<Badge count={coveragePercent + "%"} status={coverageStatus}>
  <TeamOutlined />
</Badge>
```

---

## ❓ FAQ

**Q: Tại sao dùng window.location.href thay vì router.push?**  
A: Đảm bảo fresh data load và tránh stale state. Trade-off: chậm hơn nhưng reliable hơn.

**Q: Có thể embedded Shifts/Assignments trực tiếp vào Detail page không?**  
A: Có thể, nhưng sẽ làm page quá nặng. Current approach (separate pages) better for performance.

**Q: Schedule dropdown có cần thiết không nếu đã auto-select?**  
A: CÓ! User cần flexibility để switch giữa các schedules khác nhau.

**Q: Query params có bị mất khi refresh không?**  
A: KHÔNG. Query params persists qua page refresh.

**Q: Có thể share URL với schedule_id không?**  
A: CÓ! URL như `/schedule/shifts?schedule_id=abc-123` hoàn toàn shareable.

---

Tài liệu này mô tả đầy đủ luồng navigation và liên kết giữa các trang trong Schedule module! 🎉
