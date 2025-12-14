# 🎯 CustomDataTable Component - Hướng dẫn nhanh

Component bảng dữ liệu đầy đủ tính năng với Ant Design và Tailwind CSS.

## ✅ Đã hoàn thành

1. **Component chính**: `src/components/common/CustomDataTable.tsx`
2. **Styling**: `src/components/common/CustomDataTable.css`
3. **Documentation**: `src/components/common/CustomDataTable.README.md`
4. **Demo**: `src/components/common/DataTable.demo.tsx`
5. **Tích hợp**: `src/app/employees/page.tsx`

## 🚀 Sử dụng ngay

```tsx
import CustomDataTable from "@/components/common/CustomDataTable";
import "@/components/common/CustomDataTable.css";

// Define columns
const columns = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
    sortable: true,
    filterable: true,
    filterType: "text",
  },
  // ... more columns
];

// Use component
<CustomDataTable
  data={yourData}
  columns={columns}
  searchable
  showFilters
  showRefresh
/>
```

## 📋 Tính năng chính

✅ **Search** - Tìm kiếm toàn bộ bảng  
✅ **Filter** - Text, Select, Multi-select  
✅ **Sort** - Sắp xếp theo cột  
✅ **Pagination** - Phân trang đầy đủ  
✅ **Custom Header** - Tùy chỉnh header tại page  
✅ **Row Selection** - Chọn nhiều dòng  
✅ **Export** - Xuất dữ liệu  
✅ **Refresh** - Làm mới  
✅ **Fixed Columns** - Cố định cột  
✅ **Responsive** - Scroll horizontal  
✅ **Custom Styling** - Tailwind CSS  

## 📝 Xem chi tiết

- **Full Documentation**: `src/components/common/CustomDataTable.README.md`
- **Live Example**: `src/app/employees/page.tsx`
- **Demo Component**: `src/components/common/DataTable.demo.tsx`

## 🎨 Custom tại page

```tsx
// Custom header
<CustomDataTable
  headerClassName="bg-gradient-to-r from-blue-50 to-purple-50 p-4"
/>

// Custom table
<CustomDataTable
  tableClassName="shadow-xl rounded-2xl"
/>

// Custom column
columns: [
  {
    title: "Tên",
    className: "font-bold text-blue-600",
    headerClassName: "bg-blue-100",
  }
]
```

## 🔥 Ví dụ thực tế

Xem trang Employees đã được tích hợp đầy đủ:
- Filter theo trạng thái, chức vụ
- Search theo tên, email, mã NV
- Sort theo tên, ngày, lương
- Actions: View, Edit, Delete
- Export Excel
- Refresh data

## ⚡ Performance Tips

1. Sử dụng `useMemo` cho columns
2. Set `rowKey` chính xác
3. Truyền `loading` state
4. Set `scroll` cho nhiều cột

Enjoy! 🎉
