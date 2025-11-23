# 📅 Weekly Schedule Workflow Guide

## Quy trình làm việc với Lịch Tuần

### 🔄 Flow Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   DRAFT     │ ──────> │   SCHEDULED  │ ──────> │  FINALIZED  │
│   (Nháp)    │ Công bố │ (Đã công bố) │ Hoàn tất│  (Hoàn tất) │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## 1️⃣ DRAFT - Trạng thái Nháp

### 📝 Mô tả
- Lịch mới được tạo ở trạng thái này
- Manager có thể tự do chỉnh sửa
- Nhân viên **KHÔNG** thể xem hoặc đăng ký

### ✅ Công việc cần làm
1. **Tạo lịch tuần mới**
   - Chọn tuần làm việc (7 ngày liên tiếp)
   - Thêm ghi chú nếu cần

2. **Thêm ca làm việc (Shifts)**
   - Vào: "Quản lý ca làm" button
   - Tạo shifts cho từng ngày trong tuần
   - Xác định loại ca (Sáng, Chiều, Tối, etc.)

3. **Thêm yêu cầu vị trí (Position Requirements)**
   - Cho mỗi shift, thêm các vị trí cần thiết
   - Số lượng nhân viên cần cho mỗi vị trí
   - Ví dụ: Ca Sáng cần 2 Phục vụ, 1 Thu ngân

### 🎯 Điều kiện để Công bố
- ✅ Phải có ít nhất 1 shift
- ✅ Mỗi shift phải có yêu cầu vị trí
- ⚠️ Nếu thiếu, hệ thống sẽ cảnh báo khi click "Công bố"

### 🚀 Hành động tiếp theo
```typescript
// Click "Công bố" button
// → Hiển thị ValidationChecker modal
// → Kiểm tra điều kiện
// → Nếu hợp lệ: Status = "scheduled"
```

---

## 2️⃣ SCHEDULED - Trạng thái Đã công bố

### 📝 Mô tả
- Lịch đã được công bố cho nhân viên
- Nhân viên **CÓ THỂ** xem và đăng ký ca
- Manager vẫn có thể chỉnh sửa

### ✅ Công việc cần làm
1. **Xếp lịch phân công (Assignments)**
   - Vào: "Xếp lịch" button
   - Xem danh sách nhân viên đăng ký
   - Phân công nhân viên vào từng vị trí của shift
   - Đảm bảo đủ số lượng yêu cầu

2. **Kiểm tra Coverage**
   - Xem thống kê: Tổng yêu cầu vs Đã phân công
   - Tỷ lệ coverage phải đạt 100% trước khi hoàn tất
   - Nếu thiếu người, phải tìm thêm hoặc điều chỉnh

3. **Chỉnh sửa nếu cần**
   - Vẫn có thể vào "Quản lý ca làm"
   - Thêm/sửa/xóa shifts
   - Cập nhật requirements

### 🎯 Điều kiện để Hoàn tất
- ✅ Tất cả shifts đã có đủ người (100% coverage)
- ⚠️ Nếu chưa đủ, cảnh báo nhưng vẫn cho phép hoàn tất

### 🚀 Hành động tiếp theo
```typescript
// Click "Hoàn tất" button
// → Hiển thị confirmation modal
// → Cảnh báo: Lịch sẽ bị khóa
// → Xác nhận: Status = "finalized"
```

---

## 3️⃣ FINALIZED - Trạng thái Hoàn tất

### 📝 Mô tả
- Lịch đã được **KHÓA**
- Nhân viên **KHÔNG THỂ** đăng ký thêm
- Manager **KHÔNG THỂ** chỉnh sửa
- Hệ thống sử dụng lịch này để chấm công

### 🚫 Hạn chế
- ❌ Không thể sửa shifts
- ❌ Không thể thay đổi assignments
- ❌ Không thể xóa lịch
- ✅ Chỉ có thể XEM

### 📊 Sử dụng
- Hệ thống chấm công sử dụng lịch này
- So sánh giờ check-in/out với schedule
- Tính toán lương dựa trên attendance

### ⚠️ Lưu ý quan trọng
> **Sau khi hoàn tất, KHÔNG THỂ quay lại!**
> 
> Chỉ hoàn tất khi:
> - Đã kiểm tra kỹ tất cả phân công
> - Đảm bảo đủ nhân viên cho mỗi ca
> - Không có thay đổi nào nữa

---

## 🎬 Các Actions trong Detail Page

### Trạng thái DRAFT
| Button | Icon | Action |
|--------|------|--------|
| Quản lý ca làm | 📝 | Mở trang quản lý shifts |
| **Công bố** | 📢 | Publish → Scheduled (validation check) |

### Trạng thái SCHEDULED
| Button | Icon | Action |
|--------|------|--------|
| Quản lý ca làm | 📝 | Mở trang quản lý shifts |
| Xếp lịch | 👥 | Mở trang phân công assignments |
| **Hoàn tất** | 🔒 | Finalize → Finalized (confirmation) |

### Trạng thái FINALIZED
| Button | Icon | Action |
|--------|------|--------|
| Quay lại | ← | Về trang danh sách |

---

## 🔧 API Endpoints

### Publish Schedule
```typescript
PUT /api/weekly-schedules/:id/publish

// Changes status from "draft" → "scheduled"
// Sets published_at timestamp
// Validates: must have shifts + requirements
```

### Finalize Schedule
```typescript
PUT /api/weekly-schedules/:id/finalize

// Changes status from "scheduled" → "finalized"
// Locks the schedule
// Validates: must be in scheduled status
```

### Validate Schedule
```typescript
GET /api/weekly-schedules/:id/validate

Response:
{
  canPublish: boolean,
  valid: boolean,
  errors: string[],      // Blocking issues
  warnings: string[],    // Non-blocking issues
  totalShifts: number
}
```

---

## 💡 Best Practices

### 1. Tạo lịch sớm
- Tạo lịch ít nhất 1 tuần trước
- Cho nhân viên thời gian đăng ký

### 2. Kiểm tra coverage
- Đảm bảo mọi ca đều có đủ người
- Có backup plan nếu thiếu người

### 3. Công bố đúng lúc
- Không công bố khi chưa có đủ shifts
- Không công bố quá sớm (có thể cần sửa)

### 4. Hoàn tất đúng thời điểm
- Hoàn tất vào cuối tuần trước
- Cho phép adjust-minute changes

### 5. Theo dõi attendance
- Sau khi finalized, monitor chấm công
- Xử lý các trường hợp đặc biệt

---

## ❓ FAQ

**Q: Nếu hoàn tất rồi nhưng cần sửa thì sao?**
A: Không thể sửa được. Cần cẩn thận trước khi hoàn tất. Có thể tạo adjustment requests riêng.

**Q: Có thể hủy lịch không?**
A: Chỉ có thể xóa lịch ở trạng thái DRAFT. Sau khi công bố, không thể xóa.

**Q: Nhân viên thấy lịch khi nào?**
A: Chỉ khi status = SCHEDULED. Lúc đó họ mới có thể xem và đăng ký.

**Q: Có thể publish mà không có shifts?**
A: Không. ValidationChecker sẽ block và hiển thị errors.

**Q: Coverage không đủ 100% có finalize được không?**
A: Có, nhưng sẽ có warning. Best practice là nên đạt 100%.

---

## 🎓 Example Workflow

```
Thứ 2 (7/7):
  ✅ Tạo lịch tuần 10-16/7 (DRAFT)
  ✅ Thêm 21 shifts (3 ca x 7 ngày)
  ✅ Thêm requirements cho mỗi shift

Thứ 3 (8/7):
  ✅ Click "Công bố" → SCHEDULED
  📢 Nhân viên nhận được thông báo

Thứ 3-6 (8-11/7):
  👥 Nhân viên đăng ký ca
  📊 Manager theo dõi số đăng ký

Thứ 7 (12/7):
  ✅ Xếp lịch phân công
  ✅ Kiểm tra coverage: 95/95 (100%)
  ✅ Click "Hoàn tất" → FINALIZED
  🔒 Lịch được khóa

Tuần làm việc (14-20/7):
  📍 Nhân viên check-in/out theo lịch
  📊 Hệ thống tracking attendance
  💰 Cuối tuần tính lương
```

---

## 📱 UI Components

### WeeklySchedulesManagement.tsx
- Danh sách tất cả lịch tuần
- Statistics cards (Draft, Scheduled, Finalized)
- Actions: Create, Edit, Delete, Publish, Finalize
- Pagination và filters

### WeeklyScheduleDetail.tsx
- Chi tiết 1 lịch tuần
- Workflow status indicator
- Action buttons theo status
- Statistics: Shifts, Assignments, Coverage
- Shifts table
- Timeline events

### ValidationChecker.tsx
- Modal hiển thị khi click Publish
- Check conditions:
  - Có shifts không?
  - Mỗi shift có requirements không?
- Hiển thị errors (red) và warnings (yellow)
- Chỉ cho publish khi không có errors

---

## 🛠️ Hooks Used

```typescript
// Workflow actions
import { usePublishSchedule, useFinalizeSchedule } from "@/hooks/useScheduleWorkflow";

const { publishSchedule, isLoading } = usePublishSchedule();
await publishSchedule(scheduleId);

const { finalizeSchedule, isLoading } = useFinalizeSchedule();
await finalizeSchedule(scheduleId);

// Permissions
import { useCanManageSchedule } from "@/hooks/usePermissions";
const canManage = useCanManageSchedule(); // true nếu có quyền

// Confirmation modal
import { useConfirmModalStore } from "@/store/confirmModalStore";
const openConfirm = useConfirmModalStore((state) => state.openConfirm);
openConfirm({ title, content, onConfirm: async () => {...} });
```

---

## 🎨 Status Colors

| Status | Color | Badge | Icon |
|--------|-------|-------|------|
| draft | `default` (gray) | Nháp | ✏️ |
| scheduled | `processing` (blue) | Đã công bố | 📢 |
| finalized | `success` (green) | Hoàn tất | 🔒 |
| cancelled | `error` (red) | Đã hủy | ⚠️ |

---

Tài liệu này cung cấp đầy đủ thông tin về workflow của Weekly Schedule system! 🎉
