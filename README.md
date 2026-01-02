# Hệ thống OTP & Điểm Danh

Ứng dụng React Native/Expo với React Native Web cho hệ thống điểm danh sử dụng OTP và QR Code.

## 🚀 Tính năng

### Cho Sinh viên:
- ✅ Đăng nhập và xác thực OTP
- ✅ Dashboard hiển thị lịch học hôm nay
- ✅ Điểm danh bằng mã OTP 6 số
- ✅ Quét QR Code để điểm danh
- ✅ Xem lịch học trong tuần
- ✅ Lịch sử điểm danh (có mặt / đi muộn / vắng)

### Cho Giảng viên:
- ✅ Dashboard quản lý lớp học
- ✅ Tạo mã OTP động với countdown
- ✅ Tạo mã QR Code cho buổi học
- ✅ Xem danh sách sinh viên và trạng thái điểm danh
- ✅ Báo cáo chuyên cần với biểu đồ
- ✅ Xuất dữ liệu CSV (UI)

## 📁 Cấu trúc dự án

```
/app
  /auth          - Màn hình đăng nhập, xác thực
  /student       - Màn hình cho sinh viên
  /teacher       - Màn hình cho giảng viên
/components      - Components tái sử dụng
/constants       - Dữ liệu mock và constants
```

## 🛠️ Công nghệ sử dụng

- **Expo** ~50.0.0
- **React Native** 0.73.0
- **React Native Web** ~0.19.6
- **Expo Router** ~3.4.0 (File-based routing)
- **NativeWind** ^2.0.11 (Tailwind CSS cho React Native)
- **TypeScript**

## 📦 Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🎨 Thiết kế

- **Màu chủ đạo**: Trắng (#FFFFFF)
- **Màu điểm nhấn**: Xanh da trời (#3B82F6)
- **Font**: System default (San Francisco / Roboto)
- **Responsive**: Tự động điều chỉnh trên Mobile và Web
- **Max width Web**: 600-900px, căn giữa

## 📱 Màn hình

### Auth
- `/auth/login` - Đăng nhập
- `/auth/verify-otp` - Xác thực OTP

### Student
- `/student/home` - Trang chủ sinh viên
- `/student/otp-attendance` - Điểm danh bằng OTP
- `/student/qr-attendance` - Quét QR Code
- `/student/schedule` - Lịch học
- `/student/history` - Lịch sử điểm danh

### Teacher
- `/teacher/dashboard` - Dashboard giảng viên
- `/teacher/generate-otp` - Tạo mã OTP
- `/teacher/generate-qr` - Tạo QR Code
- `/teacher/class-list` - Danh sách lớp học
- `/teacher/reports` - Báo cáo chuyên cần

## 🧩 Components

- `AppHeader` - Header responsive với nút back
- `PrimaryButton` - Button chính với variants
- `OTPInput` - Input 6 số cho mã OTP
- `QRViewer` - Hiển thị QR Code
- `AttendanceStatusTag` - Tag trạng thái điểm danh
- `ScheduleCard` - Card hiển thị lịch học
- `StatsCard` - Card thống kê
- `StudentCard` - Card sinh viên
- `LoadingOverlay` - Loading overlay

## 📝 Lưu ý

- Dự án này chỉ có **UI**, không có backend/API thật
- Sử dụng **mock data** để demo
- Cần tích hợp API thật để sử dụng trong production
- QR Code viewer hiện tại là mock, cần thêm thư viện `react-native-qrcode-svg` để hiển thị QR thật

## 🔄 TODO cho Production

- [ ] Tích hợp API backend
- [ ] Thêm authentication thật
- [ ] Implement QR Code generation/scanning thật
- [ ] Thêm push notifications
- [ ] Cải thiện error handling
- [ ] Thêm unit tests
- [ ] Optimize performance

## 📄 License

MIT

