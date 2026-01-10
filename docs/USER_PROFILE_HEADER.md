# User Profile Dropdown - Header Component

## 📋 Tổng quan

Component header trong **AppLayout** được nâng cấp với **Avatar + Tên người dùng + Dropdown menu**, hiển thị ở **header tổng của app** (không phải từng trang riêng).

## ✨ Vị trí hiển thị

**Header tổng** xuất hiện ở tất cả các trang trong app layout:
- ✅ Nằm trong `AppLayout.tsx` - header cố định cho toàn bộ app
- ✅ Hiển thị trên mọi trang student/teacher/admin
- ✅ Không cần khai báo lại ở từng trang
- ✅ Thông tin user được truyền từ `_layout.tsx` của từng module

## ✨ Tính năng chính

### 1. **User Profile Dropdown**
- ✅ Hiển thị avatar người dùng (tự động tạo từ tên nếu không có ảnh)
- ✅ Tên người dùng rõ ràng
- ✅ Icon dropdown mượt mà
- ✅ Menu dropdown với thông tin chi tiết
- ✅ Các tùy chọn: Trang cá nhân, Cài đặt (Admin), Đăng xuất

### 2. **Notification Dropdown**
- ✅ Icon chuông với badge thông báo
- ✅ Hiển thị số lượng thông báo chưa đọc
- ✅ Danh sách thông báo đầy đủ

### 3. **UI/UX Design**
- ✅ Hover effects mượt mà
- ✅ Click bên ngoài để đóng dropdown
- ✅ Animation slide down
- ✅ Responsive design
- ✅ Shadow và border tinh tế
- ✅ Color scheme hài hòa

## 🚀 Cách sử dụng

### Cấu hình trong Layout (Recommended)

Thông tin user được cấu hình trong `_layout.tsx` của từng module và tự động hiển thị trong header tổng:

#### Student Layout (`app/student/_layout.tsx`)

```tsx
return (
  <AppLayout
    menuItems={menuItems}
    userRole="student"
    userName="Nguyễn Văn An"
    userEmail="nguyenvanan@student.edu.vn"
    // userAvatar="https://..." // Optional
  >
    {stackContent}
  </AppLayout>
);
```

#### Teacher Layout (`app/teacher/_layout.tsx`)

```tsx
return (
  <AppLayout
    menuItems={menuItems}
    userRole="teacher"
    userName="Trần Thị Bình"
    userEmail="tranthib@teacher.edu.vn"
  >
    {stackContent}
  </AppLayout>
);
```

#### Admin Layout (nếu có)

```tsx
return (
  <AppLayout
    menuItems={menuItems}
    userRole="admin"
    userName="Admin User"
    userEmail="admin@system.edu.vn"
    userAvatar="https://i.pravatar.cc/150"
  >
    {stackContent}
  </AppLayout>
);
```

### Sử dụng trong Header riêng (Alternative)

Nếu cần header riêng cho một trang cụ thể:

```tsx
import AppHeader from '@/components/AppHeader';

<AppHeader
  title="Trang chủ"
  showUserProfile={true}
  userName="Nguyễn Văn An"
  userELayoutProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Nội dung trang |
| `menuItems` | `MenuItem[]` | Required | Menu sidebar |
| `userRole` | `'student' \| 'teacher' \| 'admin'` | Required | Vai trò người dùng |
| `userName` | `string` | Role label | Tên người dùng |
| `userEmail` | `string` | - | Email người dùng |
| `userAvatar` | `string` | - | URL ảnh avatar |
| `showSidebar` | `boolean` | `true` | Hiển thị sidebar |

### UserProfileDropdownProps (trong AppLayout)nvanan@student.edu.vn"
  userRole="student"
  showNotifications={true}
/>
```

### Teacher Dashboard

```tsx
<AppHeader
  title="Dashboard"
  showUserProfile={true}
  userName="Trần Thị B"
  userEmail="tranthib@teacher.edu.vn"
  userRole="teacher"
  showNotifications={true}
/>
```

### Admin với Avatar tùy chỉnh

```tsx
<AppHeader
  title="Quản trị hệ thống"
  showUserProfile={true}
  userName="Admin User"
  userAvatar="https://i.pravatar.cc/150?img=1"
  userEmail="admin@system.edu.vn"
  userRole="admin"
  showNotifications={true}
  breadcrumbs={[
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Cài đặt' }
  ]}
/>
```

### Với nút Back

```tsx
<AppHeader
  title="Lịch học"
  showUserProfile={true}
  userName="Nguyễn Văn An"
  userEmail="nguyenvanan@student.edu.vn"
  userRole="student"
  showNotifications={true}
  showBack={true}
/>
```

## 📦 Props

### AppHeaderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Tiêu đề header |
| `showUserProfile` | `boolean` | `false` | Hiển thị user profile dropdown |
| `userName` | `string` | `'User'` | Tên người dùng |
| `userAvatar` | `string` | - | URL ảnh avatar (optional) |
| `userRole` | `'student' \| 'teacher' \| 'admin'` | `'student'` | Vai trò người dùng |
| `userEmail` | `string` | - | Email người dùng (optional) |
| `showNotifications` | `boolean` | `false` | Hiển thị notification dropdown |
| `showBack` | `boolean` | `false` | Hiển thị nút back |
| `showLogout` | `boolean` | `false` | Hiển thị nút logout (legacy) |
| `breadcrumbs` | `BreadcrumbItem[]` | - | Breadcrumb navigation |
| `rightAction` | `ReactNode` | - | Custom action component |

## 🎨 Design System

### Colors
- Primary: `#3FA9F5`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3FA9F5`

### Spacing
- Dropdown width: `280px`
- Avatar size: `32px` (small), `40px` (medium)
- Padding: `12px` horizontal, `8px` vertical
- Gap between items: `8px`

### Effects
- Hover background: `#F9FAFB`
- Active background: `#F3F4F6`
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Border radius: `12px` (dropdown), `24px` (button)
Layout.tsx              # Main layout với header tổng (ĐÃ TÍCH HỢP)
├── UserProfileDropdown.tsx    # User profile menu
├── NotificationDropdown.tsx   # Notifications menu
├── Avatar.tsx                 # Avatar component
├── Sidebar.tsx               # Sidebar menu
└── AppHeader.tsx             # Alternative header cho trang riêng

app/
├── student/
│   └── _layout.tsx           # Student layout với user info
├── teacher/
│   └── _layout.tsx           # Teacher layout với user info
└── admin/
    └── _layout.tsx           # Admin layout (nếu có)
```

## 📄 Files Updated

### ✅ Core Files
- `/components/AppLayout.tsx` - **Header tổng** tích hợp UserProfile + Notifications
- `/components/UserProfileDropdown.tsx` - Component dropdown profile

### ✅ Layout Files
- `/app/student/_layout.tsx` - Truyền thông tin user vào AppLayout
- `/app/teacher/_layout.tsx` - Truyền thông tin teacher vào AppLayout

### ✅ Page Files (Đã xóa header riêng)
- `/app/student/home.tsx` - Không cần header riêng nữa
- `/app/student/schedule.tsx` - Không cần header riêng nữa
- `/app/teacher/dashboard.tsx` - Không cần header riêng nữa
## 📄 Files Updated

### ✅ New Files
- `/components/UserProfileDropdown.tsx` - Component dropdown profile
- `/components/HeaderDemo.tsx` - Demo và hướng dẫn
- `/app/student/profile-demo.tsx` - Trang demo đầy đủ

### ✅ Updated Files
- `/components/AppHeader.tsx` - Tích hợp user profile và notifications
- `/app/student/home.tsx` - Sử dụng header mới
- `/app/student/schedule.tsx` - Sử dụng header mới
- `/app/teacher/dashboard.tsx` - Sử dụng header mới

## 🎯 Features by Role

### Student
- Trang cá nhân
- Đăng xuất

### Teacher
- Trang cá nhân
- Đăng xuất

### Admin
- Trang cá nhân
- Cài đặt hệ thống
- Đăng xuất

## 💡 Best Practices

1. **Luôn cung cấp userName**: Giúp user biết họ đang đăng nhập với tài khoản nào
2. **Sử dụng useGuide

### Trước đây (SAI - Header riêng từng trang)

```tsx
// ❌ KHÔNG NÊN - Mỗi trang có header riêng
export default function StudentHome() {
  return (
    <View>
      <AppHeader 
        title="Trang chủ"
        showUserProfile={true}
        userName="..."
      />
      {/* content */}
    </View>
  );
}
```

### Bây giờ (ĐÚNG - Header tổng trong Layout)

```tsx
// ✅ ĐÚNG - Cấu hình 1 lần trong _layout.tsx
// app/student/_layout.tsx
return (
  <AppLayout
    userRole="student"
    userName="Nguyễn Văn An"
    userEmail="nguyenvanan@student.edu.vn"
    menuItems={menuItems}
  >
    {stackContent}
  </AppLayout>
);

// Các trang con chỉ cần content, không cần header
export default function StudentHome() {
  return (
    <View>
      {/* Header tự động hiển thị từ AppLayout */}
      {/* Chỉ cần viết content */}
    </View>
  );
}
```

## ✅ Lợi ích của cách mới

1. **DRY (Don't Repeat Yourself)** - Không lặp lại code header ở mọi trang
2. **Consistency** - Header giống nhau 100% trên mọi trang
3. **Easy Update** - Sửa 1 lần ở Layout, áp dụng toàn bộ app
4. **Better UX** - Header cố định, không bị reload khi chuyển trang
5. **Clean Code** - Trang con chỉ focus vào content riêng của nóảm bảo role là một trong: 'student', 'teacher', 'admin'

## 📸 Screenshots

Xem demo tại: `/app/student/profile-demo.tsx`

## 🔄 Migration từ Header cũ

**Trước:**
```tsx
<AppHeader title="Trang chủ" showLogout={true} />
```

**Sau:**
```tsx
<AppHeader
  title="Trang chủ"
  showUserProfile={true}
  userName="Nguyễn Văn An"
  userEmail="nguyenvanan@student.edu.vn"
  userRole="student"
  showNotifications={true}
/>
```

## 📞 Support

Nếu có vấn đề, check:
1. Component demo: `/components/HeaderDemo.tsx`
2. Full example: `/app/student/profile-demo.tsx`
3. Existing usage: `/app/student/home.tsx`

---

**Created with ❤️ for better user experience**
