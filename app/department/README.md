# Module Giáo vụ khoa (Department Management)

Module quản lý toàn diện các hoạt động đào tạo của giáo vụ khoa.

## 📁 Cấu trúc thư mục

```
app/department/
├── _layout.tsx          # Layout chính với navigation stack
├── dashboard.tsx        # Trang tổng quan
├── students.tsx         # Quản lý sinh viên
├── teachers.tsx         # Quản lý giảng viên
├── classes.tsx          # Quản lý lớp học
├── courses.tsx          # Quản lý khóa học/môn học
├── schedules.tsx        # Quản lý lịch học
├── reports.tsx          # Báo cáo & thống kê
└── settings.tsx         # Cài đặt
```

## 🎯 Chức năng chính

### 1. Dashboard (Tổng quan)
- **Thống kê tổng quan**: Hiển thị số liệu về sinh viên, giảng viên, lớp học, khóa học
- **Quick Actions**: Truy cập nhanh các chức năng chính
- **Hoạt động gần đây**: Theo dõi các thay đổi mới nhất
- **Trending indicators**: Hiển thị xu hướng tăng/giảm

### 2. Students Management (Quản lý sinh viên)
- **Tìm kiếm & Filter**: Tìm kiếm theo tên, mã SV, email; lọc theo trạng thái
- **CRUD Operations**: Thêm, sửa, xóa, xem chi tiết sinh viên
- **Trạng thái**: Đang học, Tạm nghỉ, Đã tốt nghiệp
- **Thông tin**: Mã SV, họ tên, email, SĐT, lớp, khóa học

### 3. Teachers Management (Quản lý giảng viên)
- **Tìm kiếm & Filter**: Tìm kiếm và lọc theo trạng thái
- **Thông tin giảng viên**: Mã GV, họ tên, email, SĐT, khoa, môn giảng dạy
- **Trạng thái**: Đang giảng dạy, Nghỉ phép, Không hoạt động
- **Lịch dạy**: Xem lịch giảng dạy của giảng viên

### 4. Classes Management (Quản lý lớp học)
- **Thông tin lớp**: Mã lớp, tên lớp, khóa học, năm học
- **Giáo viên chủ nhiệm**: Quản lý GVCN
- **Sĩ số**: Theo dõi số lượng sinh viên
- **Trạng thái**: Đang học, Sắp khai giảng, Đã hoàn thành
- **Danh sách sinh viên**: Xem danh sách SV trong lớp

### 5. Courses Management (Quản lý khóa học/môn học)
- **Thông tin khóa học**: Mã môn, tên môn, số tín chỉ, học kỳ
- **Giảng viên**: Phân công giảng viên
- **Đăng ký**: Theo dõi số lượng đăng ký với progress bar
- **Trạng thái**: Đang mở, Sắp mở, Đã kết thúc
- **Sĩ số**: Quản lý số lượng sinh viên tối đa

### 6. Schedules Management (Quản lý lịch học)
- **Calendar View**: Xem lịch theo lịch (calendar)
- **List View**: Xem lịch dạng danh sách
- **Thông tin lịch**: Môn học, giảng viên, lớp, phòng, thời gian
- **Filter theo ngày**: Xem lịch học theo ngày được chọn
- **Color coding**: Phân biệt buổi sáng, chiều, tối

### 7. Reports & Statistics (Báo cáo & Thống kê)
- **Key Metrics**: Tỷ lệ điểm danh, tỷ lệ đỗ, điểm TB, tỷ lệ bỏ học
- **Charts**: 
  - Line chart: Tỷ lệ điểm danh theo ngày
  - Bar chart: Số lượng sinh viên theo ngành
  - Pie chart: Phân bố trạng thái sinh viên
- **Quick Reports**: Báo cáo điểm danh, kết quả học tập, sinh viên, giảng viên
- **Period Filter**: Xem theo tuần, tháng, năm

### 8. Settings (Cài đặt)
- **Profile**: Thông tin tài khoản giáo vụ
- **Notifications**: Cấu hình thông báo push và email
- **Data Management**: Sao lưu, xuất/nhập dữ liệu
- **UI Settings**: Chế độ tối, ngôn ngữ
- **System**: Phân quyền, nhật ký hoạt động, thông tin ứng dụng
- **Danger Zone**: Xóa cache, đặt lại cài đặt

## 🎨 Thiết kế UI/UX

### Color Scheme
- **Primary Blue**: `#3b82f6` - Sinh viên
- **Purple**: `#8b5cf6` - Giảng viên
- **Pink**: `#ec4899` - Lớp học
- **Orange**: `#f59e0b` - Khóa học
- **Green**: `#10b981` - Lịch học, Success states
- **Red**: `#ef4444` - Danger actions

### Components
- **Search Bar**: Tìm kiếm với icon
- **Filter Tabs**: Horizontal scrollable tabs
- **Cards**: Shadow, rounded corners, modern design
- **Status Badges**: Color-coded status indicators
- **Progress Bars**: Enrollment tracking
- **Modals**: Bottom sheet style
- **Charts**: Line, Bar, Pie charts

### Icons (Ionicons)
- Dashboard: `home`, `people`, `school`, `book`
- Actions: `add`, `create`, `trash`, `search`
- Navigation: `chevron-forward`, `arrow-back`
- Status: `checkmark-circle`, `alert-circle`

## 🔗 Navigation

### Route Structure
```
/department/dashboard      # Trang chủ
/department/students       # Quản lý sinh viên
/department/teachers       # Quản lý giảng viên
/department/classes        # Quản lý lớp học
/department/courses        # Quản lý khóa học
/department/schedules      # Quản lý lịch học
/department/reports        # Báo cáo & thống kê
/department/settings       # Cài đặt
```

## 📦 Dependencies

Các thư viện được sử dụng:
- `expo-router` - Navigation
- `@expo/vector-icons` - Icons (Ionicons)
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-calendars` - Calendar component
- `react-native-chart-kit` - Charts (Line, Bar, Pie)

## 🚀 Cách sử dụng

1. **Truy cập module**: Navigate đến `/department/dashboard`
2. **Chọn chức năng**: Sử dụng quick actions hoặc navigation
3. **Tìm kiếm & Filter**: Sử dụng search bar và filter tabs
4. **Thêm mới**: Nhấn nút "+" để mở modal
5. **Chỉnh sửa**: Nhấn nút "Sửa" trên card
6. **Xem chi tiết**: Nhấn nút "Chi tiết" để xem thông tin đầy đủ

## 📝 Notes

- Tất cả dữ liệu hiện tại là **mock data** (dữ liệu mẫu)
- Cần tích hợp API backend để lấy dữ liệu thực
- Modal "Thêm mới" cần hoàn thiện validation
- Charts cần kết nối với dữ liệu thực từ backend
- Cần implement authentication và authorization
- Export/Import data cần implement

## 🔄 Tương lai

### Tính năng cần bổ sung:
- [ ] Tích hợp API backend
- [ ] Real-time updates với WebSocket
- [ ] Export Excel/PDF reports
- [ ] Import data từ Excel
- [ ] Advanced filtering & sorting
- [ ] Bulk operations
- [ ] Email notifications
- [ ] Permission management
- [ ] Audit logs
- [ ] Dark mode implementation
- [ ] Multi-language support

## 👥 Phân quyền

Module này dành cho **Giáo vụ khoa** với các quyền:
- ✅ Quản lý sinh viên (CRUD)
- ✅ Quản lý giảng viên (CRUD)
- ✅ Quản lý lớp học (CRUD)
- ✅ Quản lý khóa học (CRUD)
- ✅ Quản lý lịch học (CRUD)
- ✅ Xem báo cáo & thống kê
- ✅ Cấu hình hệ thống

---

**Version**: 1.0.0  
**Last Updated**: 2024-02-05  
**Author**: Development Team
