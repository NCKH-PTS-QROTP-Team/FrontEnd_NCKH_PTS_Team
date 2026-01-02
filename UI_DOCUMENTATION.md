# 🎓 Hệ thống Điểm danh Điện tử - OTP & QR Code

Ứng dụng điểm danh điện tử đa nền tảng (React Native + Web) hỗ trợ 3 vai trò: Admin, Giảng viên, Sinh viên.

## 📱 Tính năng chính

### 👤 **ADMIN**
- ✅ Dashboard tổng quan hệ thống
- ✅ Quản lý người dùng (CRUD, phân quyền, upload CSV)
- ✅ Quản lý lớp học & môn học
- ✅ Quản lý lịch học (calendar view)
- ✅ Giám sát điểm danh real-time
- ✅ Báo cáo & thống kê (theo lớp, GV, SV)
- ✅ Cài đặt hệ thống (OTP timeout, QR refresh, GPS)

### 👨‍🏫 **GIẢNG VIÊN**
- ✅ Dashboard với thống kê lớp học
- ✅ Tạo OTP điểm danh (6 số, countdown)
- ✅ Tạo QR Code điểm danh
- ✅ Danh sách sinh viên real-time
- ✅ Chỉnh sửa trạng thái điểm danh thủ công
- ✅ Báo cáo theo lớp
- ✅ **GVCN**: Xem lớp chủ nhiệm, sinh viên nguy cơ, gửi thông báo

### 🎓 **SINH VIÊN**
- ✅ Dashboard hiển thị lịch học hôm nay
- ✅ Điểm danh bằng OTP (6-digit input)
- ✅ Điểm danh bằng QR (camera simulation)
- ✅ Xem lịch học theo tuần/tháng
- ✅ Lịch sử điểm danh + thống kê
- ✅ Thông báo (OTP hết hạn, buổi học sắp bắt đầu, cảnh báo vắng)

## 🎨 Design System

### Colors
- **Primary**: Sky-Blue `#3FA9F5`
- **Background**: White `#FFFFFF`
- **Success**: Green `#10B981`
- **Warning**: Amber `#F59E0B`
- **Error**: Red `#EF4444`

### Components
- `<Modal>` - Dialog overlay
- `<Toast>` - Notification snackbar
- `<Card>` - Container with shadow
- `<Input>` - Form input với validation
- `<Badge>` - Status tag
- `<Tabs>` - Tab navigation
- `<Table>` - Data table (Web)
- `<PrimaryButton>` - Button variants
- `<AttendanceStatusTag>` - Present/Late/Absent
- `<StatsCard>` - Metric display
- `<ScheduleCard>` - Schedule item
- `<StudentCard>` - Student list item

## 📂 Cấu trúc thư mục

```
app/
├── admin/
│   ├── dashboard.tsx
│   ├── users/
│   │   ├── index.tsx (list)
│   │   ├── create.tsx
│   │   └── [id].tsx (detail)
│   ├── classes/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [id].tsx
│   ├── subjects/
│   │   ├── index.tsx
│   │   └── create.tsx
│   ├── schedules.tsx
│   ├── sessions.tsx (real-time monitoring)
│   ├── reports.tsx
│   └── settings.tsx
├── teacher/
│   ├── dashboard.tsx
│   ├── generate-otp.tsx
│   ├── generate-qr.tsx
│   ├── class-list.tsx
│   ├── reports.tsx
│   └── advisee-class.tsx (GVCN)
├── student/
│   ├── home.tsx
│   ├── otp-attendance.tsx
│   ├── qr-attendance.tsx
│   ├── schedule.tsx
│   ├── history.tsx
│   └── notifications.tsx
└── auth/
    ├── login.tsx
    └── verify-otp.tsx

components/
├── Modal.tsx
├── Toast.tsx
├── Card.tsx
├── Input.tsx
├── Badge.tsx
├── Tabs.tsx
├── Table.tsx
├── PrimaryButton.tsx
├── AppHeader.tsx
├── AttendanceStatusTag.tsx
├── StatsCard.tsx
├── ScheduleCard.tsx
└── StudentCard.tsx

constants/
├── colors.ts
└── mockData.ts (interfaces & mock data)
```

## 🚀 Chạy ứng dụng

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on web
npx expo start --web

# Run on mobile
npx expo start --ios
npx expo start --android
```

## 📊 Business Rules

### OTP
- Mã 6 số ngẫu nhiên
- Thời gian hiệu lực: 30-120s (configurable)
- 1 sinh viên chỉ điểm danh 1 lần/buổi

### QR Code
- Dynamic QR (refresh theo interval)
- Quét bằng camera
- Tự động submit sau khi quét

### Attendance States
- **Present**: Điểm danh đúng giờ
- **Late**: Điểm danh sau X phút (configurable)
- **Absent**: Không điểm danh

### Notifications
- OTP sắp hết hạn (30s trước)
- Buổi học sắp bắt đầu (15 phút trước)
- Điểm danh thành công/thất bại
- Cảnh báo vắng quá nhiều (≥20%)

## 🔧 Tech Stack

- **Framework**: Expo SDK 50, React Native 0.73.6
- **Router**: expo-router v3.4.0 (file-based routing)
- **Styling**: NativeWind v2 (TailwindCSS for RN)
- **Language**: TypeScript 5.1.3
- **Web Support**: react-native-web 0.19.6

## 📝 Mock Data

Tất cả mock data trong `constants/mockData.ts`:
- `mockSchedules` - Lịch học
- `mockAttendanceHistory` - Lịch sử điểm danh
- `mockStudents` - Danh sách sinh viên
- `mockStats` - Thống kê
- `mockUsers` - Người dùng
- `mockClasses` - Lớp học
- `mockSubjects` - Môn học
- `mockAttendanceSessions` - Buổi điểm danh đang diễn ra
- `mockSystemSettings` - Cài đặt hệ thống

## 🎯 Navigation Flow

```
Login → Verify OTP
  ↓
Admin Dashboard → Users/Classes/Subjects/Schedules/Sessions/Reports/Settings
  ↓
Teacher Dashboard → Generate OTP/QR → Class List → Reports → Advisee Class
  ↓
Student Home → OTP/QR Attendance → Schedule → History → Notifications
```

## 🔐 Future Enhancements

- [ ] Backend API integration
- [ ] Real QR code generation/scanning (expo-camera)
- [ ] GPS location verification
- [ ] Push notifications
- [ ] Chart visualizations (Victory Native)
- [ ] CSV export functionality
- [ ] Email notifications
- [ ] Multi-language support

## 📄 License

Educational project - NCKH 2026

// Updated: 2026-01-02 13:16:05
