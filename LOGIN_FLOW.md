# 🔐 Hướng dẫn Đăng nhập & Navigation

## ✅ Flow đăng nhập đã hoàn thiện

### 📋 Quy trình hoạt động

```
1. User vào trang Login (/login)
   ↓
2. Nhập email & password
   ↓
3. Click "Đăng nhập" hoặc "Điền thông tin demo"
   ↓
4. authProvider.login() được gọi
   ↓
5. Kiểm tra credentials (Mock hoặc API thật)
   ↓
6. Nếu thành công:
   - Lưu token vào localStorage
   - Lưu user data vào localStorage
   - Redirect đến "/(dashboard)"
   ↓
7. Dashboard page được load với layout (sidebar + header)
   ↓
8. Hiển thị Dashboard với tất cả components
```

## 🎯 Files đã cấu hình

### 1. **Auth Provider** (`src/providers/authProvider.ts`)
- ✅ Mock login cho demo (email: admin@example.com, password: admin123)
- ✅ Real API integration (fallback to mock nếu API fail)
- ✅ Redirect to `"/(dashboard)"` sau khi login thành công
- ✅ Check authentication status
- ✅ Logout functionality

### 2. **Login Page** (`src/features/auth/index.tsx`)
- ✅ Form đăng nhập đẹp mắt
- ✅ Validation email & password
- ✅ Nút "Điền thông tin demo" để test nhanh
- ✅ Loading state khi đang login
- ✅ Error handling với notification
- ✅ Hiển thị thông tin demo

### 3. **Home Page** (`src/app/page.tsx`)
- ✅ Check authentication với `<Authenticated>`
- ✅ Auto redirect đến dashboard nếu đã login
- ✅ Hiển thị loading spinner khi redirect

### 4. **Dashboard Page** (`src/app/(dashboard)/page.tsx`)
- ✅ Import Dashboard component từ features
- ✅ Được bọc trong layout với sidebar & header

### 5. **Dashboard Layout** (`src/app/(dashboard)/layout.tsx`)
- ✅ Sử dụng ThemedLayout từ Refine
- ✅ Header component
- ✅ Sidebar navigation
- ✅ Logo & title

## 🧪 Testing

### Cách test đăng nhập:

#### Option 1: Login nhanh (Demo)
1. Vào http://localhost:3000/login
2. Click nút **"Điền thông tin demo (Test)"**
3. Click **"Đăng nhập"**
4. ✅ Sẽ redirect đến Dashboard

#### Option 2: Nhập thủ công
1. Vào http://localhost:3000/login
2. Nhập:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click **"Đăng nhập"**
4. ✅ Sẽ redirect đến Dashboard

#### Option 3: API thật (khi backend ready)
1. Đảm bảo backend đang chạy
2. Nhập credentials thật từ database
3. Hệ thống sẽ call API thật
4. ✅ Nếu thành công → Dashboard
5. ❌ Nếu thất bại → Fallback to mock login

## 🔑 Mock Credentials

```
Email: admin@example.com
Password: admin123
```

## 📱 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/login` | Trang đăng nhập | ❌ No |
| `/` | Home (redirect to dashboard) | ✅ Yes |
| `/(dashboard)` | Dashboard chính | ✅ Yes |
| `/employees` | Quản lý nhân viên | ✅ Yes |
| `/attendance/logs` | Chấm công | ✅ Yes |

## 🛠️ Troubleshooting

### Vấn đề 1: Không redirect được sau login
**Nguyên nhân**: authProvider redirect sai route
**Giải pháp**: ✅ Đã sửa redirect to `"/(dashboard)"` thay vì `"/"`

### Vấn đề 2: API không connect được
**Nguyên nhân**: Backend chưa chạy
**Giải pháp**: ✅ Đã thêm mock login fallback

### Vấn đề 3: Trang trắng sau login
**Nguyên nhân**: Dashboard component chưa load
**Giải pháp**: ✅ Đã thêm loading state và error boundary

### Vấn đề 4: Loop redirect vô hạn
**Nguyên nhân**: Conflict giữa routes
**Giải pháp**: ✅ Đã sửa sử dụng `router.replace()` thay vì `redirect()`

## 🔒 Authentication State

Auth state được lưu ở 2 nơi:

### 1. **localStorage** (Persistence)
```typescript
localStorage.setItem("auth_token", token);
localStorage.setItem("refresh_token", refreshToken);
localStorage.setItem("user", JSON.stringify(user));
```

### 2. **Zustand Store** (Runtime)
```typescript
useAuthStore((state) => ({
  user: state.user,
  token: state.token,
  roles: state.roles,
}));
```

## 🎨 UI Features

### Login Page
- ✅ Gradient background
- ✅ Card với shadow
- ✅ Icons cho input fields
- ✅ Loading button state
- ✅ Demo info card
- ✅ Responsive design

### Dashboard
- ✅ Sidebar navigation
- ✅ Header với user info
- ✅ Dark/Light mode toggle
- ✅ Stats cards
- ✅ Charts & activities
- ✅ Responsive layout

## 📊 Navigation Flow

```
┌─────────────┐
│   /login    │ (Not authenticated)
└──────┬──────┘
       │ Login Success
       ↓
┌─────────────┐
│      /      │ (Authenticated check)
└──────┬──────┘
       │ Auto redirect
       ↓
┌─────────────┐
│ /(dashboard)│ (Dashboard with layout)
└──────┬──────┘
       │ User can navigate
       ↓
┌─────────────────────────────────┐
│  /employees  /attendance  etc   │
└─────────────────────────────────┘
```

## 🚀 Next Steps

### Khi có Backend API:
1. Comment out mock login code trong authProvider
2. Cập nhật API_URL trong `.env.local`
3. Test với real credentials
4. Handle refresh token

### Thêm tính năng:
- [ ] Remember me
- [ ] Forgot password
- [ ] Register new user
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Session timeout

## 📝 Notes

- Mock login **chỉ để testing**, xóa khi production
- Token được lưu trong localStorage (cân nhắc httpOnly cookie cho security)
- Check authentication ở mọi protected route
- Logout sẽ clear tất cả auth data và redirect về login

---

**✅ Login flow đã hoàn thiện và sẵn sàng sử dụng!**

Test ngay tại: http://localhost:3000/login
