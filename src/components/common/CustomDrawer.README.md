# Custom Drawer Component

Component Drawer tái sử dụng với giao diện thống nhất cho toàn bộ ứng dụng.

## Tính năng

- **3 chế độ**: View, Edit, Create
- **Footer tùy chỉnh**: Hiển thị nút Save/Cancel
- **Loading state**: Spinner khi đang tải dữ liệu
- **Responsive**: Width mặc định 66% (2/3 màn hình)
- **Accessibility**: ARIA labels và keyboard navigation

## Cách sử dụng

### View Mode (Xem chi tiết)

```tsx
import CustomDrawer from "@/components/common/CustomDrawer";

<CustomDrawer
  open={viewDrawerOpen}
  onClose={() => setViewDrawerOpen(false)}
  title="Chi tiết nhân viên"
  mode="view"
  loading={isLoading}
>
  <YourContentHere />
</CustomDrawer>
```

### Edit Mode (Chỉnh sửa)

```tsx
<CustomDrawer
  open={editDrawerOpen}
  onClose={() => setEditDrawerOpen(false)}
  title="Chỉnh sửa nhân viên"
  mode="edit"
  showFooter
  onSave={handleSave}
  saveLoading={isSaving}
  loading={isLoading}
>
  <YourFormHere />
</CustomDrawer>
```

### Create Mode (Thêm mới)

```tsx
<CustomDrawer
  open={createDrawerOpen}
  onClose={() => setCreateDrawerOpen(false)}
  title="Thêm nhân viên mới"
  mode="create"
  showFooter
  onSave={handleCreate}
  saveLoading={isCreating}
  saveText="Thêm nhân viên"
>
  <YourFormHere />
</CustomDrawer>
```

## Props

### Basic Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | ✅ | - | Trạng thái mở/đóng drawer |
| `onClose` | `() => void` | ✅ | - | Callback khi đóng drawer |
| `title` | `string` | ✅ | - | Tiêu đề drawer |
| `children` | `ReactNode` | ✅ | - | Nội dung drawer |
| `width` | `string \| number` | ❌ | `"66%"` | Độ rộng drawer |
| `mode` | `"view" \| "edit" \| "create"` | ❌ | `"view"` | Chế độ hiển thị |

### Loading Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `loading` | `boolean` | ❌ | `false` | Hiển thị spinner toàn drawer |

### Footer Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `showFooter` | `boolean` | ❌ | `false` | Hiển thị footer với nút action |
| `onSave` | `() => void` | ❌ | - | Callback khi click nút Save |
| `onCancel` | `() => void` | ❌ | `onClose` | Callback khi click nút Cancel |
| `saveText` | `string` | ❌ | `"Lưu"` | Text nút Save |
| `cancelText` | `string` | ❌ | `"Hủy"` | Text nút Cancel |
| `saveLoading` | `boolean` | ❌ | `false` | Loading state nút Save |
| `saveDisabled` | `boolean` | ❌ | `false` | Disable nút Save |
| `footerExtra` | `ReactNode` | ❌ | - | Nội dung thêm ở footer |

### Style Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `className` | `string` | ❌ | - | Custom class cho drawer |
| `bodyClassName` | `string` | ❌ | - | Custom class cho body |

## Ví dụ thực tế

### Với Form submit

```tsx
const handleSave = () => {
  // Trigger form submit
  const submitButton = document.getElementById("my-form-submit");
  submitButton?.click();
};

<CustomDrawer
  open={open}
  onClose={handleClose}
  title="Chỉnh sửa"
  showFooter
  onSave={handleSave}
  saveLoading={isSaving}
>
  <Form onFinish={handleFinish}>
    {/* Form fields */}
    <button type="submit" id="my-form-submit" style={{ display: "none" }} />
  </Form>
</CustomDrawer>
```

### Với footer extra content

```tsx
<CustomDrawer
  open={open}
  onClose={handleClose}
  title="Chỉnh sửa"
  showFooter
  onSave={handleSave}
  footerExtra={
    <Space>
      <Button danger onClick={handleDelete}>
        Xóa
      </Button>
    </Space>
  }
>
  <YourContent />
</CustomDrawer>
```

## Best Practices

1. **Mode selection**: Dùng `mode` prop để tự động hiển thị badge chế độ
2. **Loading states**: Dùng `loading` cho toàn drawer, `saveLoading` cho nút Save
3. **Form integration**: Dùng hidden submit button để trigger form từ footer
4. **Consistent width**: Giữ 66% width cho consistency
5. **Close handling**: Reset state trong `onClose` callback

## Styling

Component sử dụng Tailwind CSS với Ant Design Drawer base. Footer có:
- Border top màu xám
- Background màu xám nhạt (#f9fafb)
- Padding 16px (px-6 py-4)
- Flexbox layout cho space-between

Body drawer có padding 24px (px-6 py-4) mặc định.
