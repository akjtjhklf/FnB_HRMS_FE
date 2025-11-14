# CustomDataTable Component

Component bảng dữ liệu tùy chỉnh với đầy đủ tính năng, sử dụng Ant Design và Tailwind CSS.

## 🎯 Tính năng

- ✅ **Search**: Tìm kiếm toàn bộ bảng
- ✅ **Filter**: Filter theo text, select, multiSelect
- ✅ **Sort**: Sắp xếp theo cột
- ✅ **Pagination**: Phân trang với nhiều tùy chọn
- ✅ **Custom Header**: Tùy chỉnh header tại từng trang
- ✅ **Row Selection**: Chọn nhiều dòng
- ✅ **Export**: Xuất dữ liệu
- ✅ **Refresh**: Làm mới dữ liệu
- ✅ **Responsive**: Responsive với scroll horizontal
- ✅ **Fixed Columns**: Cố định cột left/right
- ✅ **Custom Styling**: Tùy chỉnh style qua Tailwind CSS

## 📦 Installation

Component đã tích hợp sẵn Ant Design và Tailwind CSS trong project.

```bash
# Đã có sẵn trong package.json
npm install antd tailwind-merge
```

## 🚀 Cách sử dụng cơ bản

### 1. Import component

```tsx
import CustomDataTable, { CustomColumnType } from "@/components/common/CustomDataTable";
import "@/components/common/CustomDataTable.css";
```

### 2. Define columns

```tsx
const columns: CustomColumnType<YourDataType>[] = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
    width: 200,
    sortable: true, // Bật sort
    filterable: true, // Bật filter
    filterType: "text", // Loại filter
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 150,
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "Hoạt động", value: "active" },
      { label: "Không hoạt động", value: "inactive" },
    ],
    render: (status) => (
      <Badge status={status === "active" ? "success" : "default"} text={status} />
    ),
  },
  {
    title: "Thao tác",
    key: "actions",
    width: 120,
    fixed: "right", // Cố định cột bên phải
    render: (_, record) => (
      <Space>
        <Button onClick={() => handleEdit(record)}>Sửa</Button>
        <Button onClick={() => handleDelete(record)}>Xóa</Button>
      </Space>
    ),
  },
];
```

### 3. Sử dụng component

```tsx
<CustomDataTable
  data={yourData}
  columns={columns}
  loading={isLoading}
  rowKey="id"
  searchable
  searchPlaceholder="Tìm kiếm..."
  showFilters
  showRefresh
  showExport
  onRefresh={() => refetch()}
  onExport={() => exportToExcel()}
  pagination={{
    current: 1,
    pageSize: 10,
    total: total,
  }}
/>
```

## 📖 API Reference

### Props

#### Data Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **required** | Dữ liệu hiển thị |
| `columns` | `CustomColumnType<T>[]` | **required** | Cấu hình cột |
| `loading` | `boolean` | `false` | Trạng thái loading |
| `rowKey` | `string \| function` | `"id"` | Key cho mỗi row |

#### Search Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchable` | `boolean` | `true` | Hiển thị search box |
| `searchPlaceholder` | `string` | `"Tìm kiếm..."` | Placeholder cho search |
| `onSearch` | `(value: string) => void` | - | Callback khi search |

#### Filter Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showFilters` | `boolean` | `true` | Hiển thị filters |
| `globalFilters` | `ReactNode` | - | Custom filters |
| `onFilterChange` | `(filters) => void` | - | Callback khi filter thay đổi |

#### Action Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showRefresh` | `boolean` | `true` | Hiển thị nút refresh |
| `onRefresh` | `() => void` | - | Callback khi refresh |
| `showExport` | `boolean` | `false` | Hiển thị nút export |
| `onExport` | `() => void` | - | Callback khi export |
| `extraActions` | `ReactNode` | - | Custom actions thêm |

#### Pagination Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pagination` | `false \| TablePaginationConfig` | `{...}` | Cấu hình pagination |

#### Styling Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Class cho container |
| `tableClassName` | `string` | - | Class cho table |
| `headerClassName` | `string` | - | Class cho header |
| `bordered` | `boolean` | `false` | Hiển thị border |
| `size` | `"small" \| "middle" \| "large"` | `"middle"` | Kích thước table |

### Column Configuration

#### CustomColumnType<T>

```typescript
interface CustomColumnType<T> {
  // Basic
  title: string;                    // Tiêu đề cột
  dataIndex?: string | string[];    // Field trong data
  key: string;                      // Unique key
  width?: number | string;          // Độ rộng cột
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";         // Cố định cột
  ellipsis?: boolean;               // Text overflow
  
  // Sorting
  sortable?: boolean;               // Bật sort đơn giản
  sorter?: boolean | function;      // Custom sort function
  defaultSortOrder?: "ascend" | "descend";
  
  // Filtering
  filterable?: boolean;             // Bật filter
  filterType?: "text" | "select" | "multiSelect" | "date" | "dateRange" | "custom";
  filterOptions?: Array<{label, value}>;  // Options cho select
  filterMultiple?: boolean;         // Multi select
  onFilter?: (value, record) => boolean;  // Custom filter function
  
  // Custom render
  render?: (value, record, index) => ReactNode;
  
  // Styling
  className?: string;               // Class cho cell
  headerClassName?: string;         // Class cho header cell
}
```

## 🎨 Ví dụ nâng cao

### 1. Filter với nhiều loại

```tsx
const columns: CustomColumnType<Employee>[] = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
    filterable: true,
    filterType: "text", // Filter text
  },
  {
    title: "Phòng ban",
    dataIndex: "department",
    key: "department",
    filterable: true,
    filterType: "select", // Filter select
    filterOptions: [
      { label: "IT", value: "it" },
      { label: "HR", value: "hr" },
      { label: "Sales", value: "sales" },
    ],
  },
  {
    title: "Kỹ năng",
    dataIndex: "skills",
    key: "skills",
    filterable: true,
    filterType: "multiSelect", // Filter multi select
    filterOptions: [
      { label: "React", value: "react" },
      { label: "Node.js", value: "nodejs" },
      { label: "Python", value: "python" },
    ],
  },
];
```

### 2. Custom render với styling

```tsx
const columns: CustomColumnType<Employee>[] = [
  {
    title: "Nhân viên",
    dataIndex: "name",
    key: "employee",
    width: 250,
    fixed: "left",
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <Avatar src={record.avatar} size={40}>
          {record.name[0]}
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{record.name}</p>
          <p className="text-sm text-gray-500">{record.email}</p>
        </div>
      </div>
    ),
  },
];
```

### 3. Sort và Filter kết hợp

```tsx
const columns: CustomColumnType<Employee>[] = [
  {
    title: "Lương",
    dataIndex: "salary",
    key: "salary",
    width: 150,
    sortable: true,
    sorter: (a, b) => a.salary - b.salary, // Custom sort
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "< 10 triệu", value: "low" },
      { label: "10-20 triệu", value: "medium" },
      { label: "> 20 triệu", value: "high" },
    ],
    onFilter: (value, record) => {
      if (value === "low") return record.salary < 10000000;
      if (value === "medium") return record.salary >= 10000000 && record.salary <= 20000000;
      if (value === "high") return record.salary > 20000000;
      return true;
    },
    render: (salary) => (
      <span className="font-medium">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(salary)}
      </span>
    ),
  },
];
```

### 4. Row Selection

```tsx
const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

<CustomDataTable
  data={employees}
  columns={columns}
  rowSelection={{
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  }}
/>
```

### 5. Custom Actions

```tsx
<CustomDataTable
  data={employees}
  columns={columns}
  extraActions={
    <>
      <Button icon={<UploadOutlined />}>Import</Button>
      <Button icon={<SettingOutlined />}>Cấu hình</Button>
    </>
  }
/>
```

### 6. Nested Data

```tsx
const columns: CustomColumnType<Employee>[] = [
  {
    title: "Phòng ban",
    dataIndex: ["department", "name"], // Nested field
    key: "department",
    render: (_, record) => record.department?.name || "-",
  },
];
```

## 🎯 Tùy chỉnh Styling với Tailwind

### Custom header tại page

```tsx
<CustomDataTable
  data={employees}
  columns={columns}
  headerClassName="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-t-lg"
/>
```

### Custom table

```tsx
<CustomDataTable
  data={employees}
  columns={columns}
  tableClassName="shadow-xl rounded-2xl"
  className="p-6 bg-gray-50"
/>
```

### Custom column

```tsx
const columns: CustomColumnType<Employee>[] = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
    className: "font-bold text-blue-600", // Custom cell class
    headerClassName: "bg-blue-100 text-blue-800", // Custom header class
  },
];
```

## 📝 Best Practices

1. **Performance**: Sử dụng `useMemo` cho columns để tránh re-render
```tsx
const columns = useMemo(() => [...], [dependencies]);
```

2. **Type Safety**: Luôn define type cho data
```tsx
CustomDataTable<Employee>
```

3. **Loading State**: Luôn truyền `loading` prop
```tsx
loading={isLoading}
```

4. **Unique Key**: Đảm bảo mỗi row có unique key
```tsx
rowKey="id" // hoặc rowKey={(record) => record.uniqueId}
```

5. **Scroll**: Set scroll cho table có nhiều cột
```tsx
scroll={{ x: 1200, y: 500 }}
```

## 🔧 Troubleshooting

### Lỗi: Filter không hoạt động
- Kiểm tra `filterable={true}` và `filterType` đã được set
- Kiểm tra `dataIndex` có đúng với field trong data không

### Lỗi: Sort không hoạt động  
- Kiểm tra `sortable={true}` hoặc custom `sorter` function
- Đảm bảo data có giá trị để sort

### Style không áp dụng
- Import CSS: `import "@/components/common/CustomDataTable.css"`
- Kiểm tra Tailwind config đã include đúng path

## 📚 Examples

Xem ví dụ đầy đủ tại: `src/app/employees/page.tsx`

## 🤝 Contributing

Nếu có lỗi hoặc góp ý, vui lòng tạo issue hoặc PR.
