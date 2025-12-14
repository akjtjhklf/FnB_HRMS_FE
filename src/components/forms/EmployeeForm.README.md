# Employee Form Component

Form component thêm/sửa nhân viên với đầy đủ validation và UX tốt.

## Tính năng

- ✅ **Validation đầy đủ**: Email, phone, CMND/CCCD, mã nhân viên
- ✅ **Auto-format**: DatePicker với định dạng DD/MM/YYYY
- ✅ **Responsive layout**: 2 columns với Row/Col
- ✅ **Grouping**: Chia section rõ ràng (Cơ bản, Công việc, Liên hệ khẩn cấp, Ghi chú)
- ✅ **Accessibility**: Labels rõ ràng, required markers
- ✅ **TypeScript**: Full type safety với Employee types

## Cách sử dụng

### Create Mode (Thêm mới)

```tsx
import EmployeeForm from "@/components/forms/EmployeeForm";

<EmployeeForm
  mode="create"
  onSubmit={handleCreate}
  loading={isCreating}
/>
```

### Edit Mode (Chỉnh sửa)

```tsx
<EmployeeForm
  mode="edit"
  initialValues={employeeData}
  onSubmit={handleUpdate}
  loading={isUpdating}
/>
```

### Với CustomDrawer

```tsx
<CustomDrawer
  open={open}
  onClose={handleClose}
  title="Thêm nhân viên"
  showFooter
  onSave={() => {
    // Trigger hidden submit button
    document.getElementById("employee-form-submit")?.click();
  }}
  saveLoading={isSaving}
>
  <EmployeeForm
    mode="create"
    onSubmit={handleSubmit}
    loading={isSaving}
  />
</CustomDrawer>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `mode` | `"create" \| "edit"` | ❌ | `"create"` | Chế độ form |
| `initialValues` | `Partial<Employee>` | ❌ | - | Giá trị ban đầu (cho edit mode) |
| `onSubmit` | `(values) => void` | ❌ | - | Callback khi submit form |
| `loading` | `boolean` | ❌ | `false` | Disable form khi đang submit |

## Form Fields

### Thông tin cơ bản

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `employee_code` | Input | ✅ | Uppercase, alphanumeric, disabled khi edit |
| `status` | Select | ✅ | active/on_leave/suspended/terminated |
| `first_name` | Input | ✅ | - |
| `last_name` | Input | ✅ | - |
| `full_name` | Input | ✅ | - |
| `gender` | Select | ✅ | male/female/other |
| `dob` | DatePicker | ❌ | - |
| `personal_id` | Input | ❌ | 9-12 digits |
| `phone` | Input | ✅ | 10-11 digits |
| `email` | Input | ✅ | Valid email format |
| `address` | TextArea | ❌ | - |

### Thông tin công việc

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `hire_date` | DatePicker | ✅ | - |
| `termination_date` | DatePicker | ❌ | - |
| `default_work_hours_per_week` | InputNumber | ❌ | 40 |
| `max_hours_per_week` | InputNumber | ❌ | 48 |
| `max_consecutive_days` | InputNumber | ❌ | 6 |
| `min_rest_hours_between_shifts` | InputNumber | ❌ | 12 |

### Liên hệ khẩn cấp

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `emergency_contact_name` | Input | ❌ | - |
| `emergency_contact_phone` | Input | ❌ | 10-11 digits |

### Ghi chú

| Field | Type | Required |
|-------|------|----------|
| `notes` | TextArea | ❌ |

## Validation Rules

### Employee Code
- **Pattern**: `/^[A-Z0-9]+$/`
- **Message**: "Mã chỉ chứa chữ hoa và số"
- **Example**: EMP001, NHAN_VIEN_123

### Personal ID (CMND/CCCD)
- **Pattern**: `/^[0-9]{9,12}$/`
- **Length**: 9-12 digits
- **Example**: 001234567890

### Phone Number
- **Pattern**: `/^[0-9]{10,11}$/`
- **Length**: 10-11 digits
- **Example**: 0901234567

### Email
- **Type**: email validation
- **Example**: nguyenvana@example.com

## Data Transformation

Form tự động chuyển đổi dữ liệu trước khi submit:

```typescript
// Input: dayjs object
dob: dayjs("1990-01-01")

// Output: ISO string
dob: "1990-01-01"
```

Áp dụng cho: `dob`, `hire_date`, `termination_date`

## Layout Structure

```
┌─────────────────────────────────────┐
│ Alert (Create mode only)             │
├─────────────────────────────────────┤
│ ▼ Thông tin cơ bản                  │
│ ┌─────────────┬─────────────┐       │
│ │ Mã NV       │ Trạng thái   │       │
│ ├─────────────┼─────────────┤       │
│ │ Họ đệm      │ Tên          │       │
│ ├─────────────┴─────────────┤       │
│ │ Họ tên đầy đủ              │       │
│ ├─────────────┬─────────────┤       │
│ │ Giới tính   │ Ngày sinh    │       │
│ ├─────────────┼─────────────┤       │
│ │ CMND/CCCD   │ SĐT          │       │
│ ├─────────────┴─────────────┤       │
│ │ Email                      │       │
│ ├────────────────────────────┤       │
│ │ Địa chỉ                    │       │
│ └────────────────────────────┘       │
├─────────────────────────────────────┤
│ ▼ Thông tin công việc               │
│ ┌─────────────┬─────────────┐       │
│ │ Ngày vào    │ Ngày nghỉ    │       │
│ ├─────────────┼─────────────┤       │
│ │ Giờ/tuần    │ Max giờ/tuần │       │
│ ├─────────────┼─────────────┤       │
│ │ Max ngày    │ Min giờ nghỉ │       │
│ └─────────────┴─────────────┘       │
├─────────────────────────────────────┤
│ ▼ Liên hệ khẩn cấp                  │
│ ┌─────────────┬─────────────┐       │
│ │ Tên         │ SĐT          │       │
│ └─────────────┴─────────────┘       │
├─────────────────────────────────────┤
│ ▼ Ghi chú                           │
│ ┌────────────────────────────┐       │
│ │ Ghi chú thêm               │       │
│ │                            │       │
│ └────────────────────────────┘       │
└─────────────────────────────────────┘
```

## Best Practices

1. **Mode selection**: Luôn truyền `mode` prop cho UX rõ ràng
2. **Initial values**: Truyền full employee object cho edit mode
3. **Loading state**: Set `loading={true}` để disable form khi đang submit
4. **Hidden submit**: Form có hidden submit button với id `employee-form-submit`
5. **Validation**: Tất cả validation đều ở client, backend cũng cần validate

## Integration Example

```tsx
// employees/page.tsx

const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);

const { mutate: createEmployee } = useCreate<Employee>();

const handleCreateSubmit = (values: CreateEmployeeDto) => {
  setIsCreating(true);
  createEmployee(
    {
      resource: "employees",
      values,
    },
    {
      onSuccess: () => {
        message.success("Thêm nhân viên thành công!");
        setCreateDrawerOpen(false);
        setIsCreating(false);
      },
      onError: (error) => {
        message.error(error?.message || "Có lỗi xảy ra");
        setIsCreating(false);
      },
    }
  );
};

return (
  <CustomDrawer
    open={createDrawerOpen}
    onClose={() => setCreateDrawerOpen(false)}
    title="Thêm nhân viên mới"
    mode="create"
    showFooter
    onSave={() => {
      document.getElementById("employee-form-submit")?.click();
    }}
    saveLoading={isCreating}
    saveText="Thêm nhân viên"
  >
    <EmployeeForm
      mode="create"
      onSubmit={handleCreateSubmit}
      loading={isCreating}
    />
  </CustomDrawer>
);
```

## Styling

- **Spacing**: `space-y-4` giữa các form items
- **Dividers**: Ant Design Divider với orientation="left"
- **Inputs**: Full width với placeholder rõ ràng
- **TextAreas**: 3-4 rows cho address và notes
- **InputNumbers**: Addon text (giờ, ngày) sau input
- **Colors**: Gray palette cho text và borders

## Future Enhancements

- [ ] Avatar upload field
- [ ] Position selection (multi-select)
- [ ] Salary scheme selection
- [ ] User account creation checkbox
- [ ] Department and team fields
- [ ] Skills and certifications
- [ ] Document attachments
