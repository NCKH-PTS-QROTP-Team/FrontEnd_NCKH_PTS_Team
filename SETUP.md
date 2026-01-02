# Hướng dẫn Setup và Chạy Ứng dụng

## ✅ Đã cài đặt dependencies thành công!

## 🚀 Chạy ứng dụng

### 1. Chạy trên Web (Khuyến nghị để test nhanh)
```bash
npm run web
```
Ứng dụng sẽ mở tại: http://localhost:8081

### 2. Chạy trên iOS (Cần macOS + Xcode)
```bash
npm run ios
```

### 3. Chạy trên Android (Cần Android Studio + Emulator)
```bash
npm run android
```

### 4. Start development server
```bash
npm start
```
Sau đó chọn platform bằng cách nhấn:
- `w` - Web
- `i` - iOS Simulator
- `a` - Android Emulator

## 📱 Test trên thiết bị thật

### iOS
1. Cài Expo Go từ App Store
2. Scan QR code từ terminal

### Android
1. Cài Expo Go từ Play Store
2. Scan QR code từ terminal

## 🔧 Lưu ý

1. **Camera Permissions**: 
   - Trên web: Cần HTTPS để truy cập camera
   - Trên mobile: Expo sẽ tự động yêu cầu quyền

2. **QR Code Scanner**:
   - Chỉ hoạt động trên thiết bị thật (không hoạt động trên web)
   - Cần quyền truy cập camera

3. **Assets**:
   - Nếu thiếu icon/splash, Expo sẽ dùng placeholder
   - Tạo thư mục `assets/` và thêm:
     - `icon.png` (1024x1024)
     - `splash.png` (1284x2778)
     - `adaptive-icon.png` (1024x1024)
     - `favicon.png` (48x48)

## 🐛 Troubleshooting

### Lỗi "Cannot find module"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install --legacy-peer-deps
```

### Lỗi Metro bundler
```bash
# Clear cache
npx expo start --clear
```

### Lỗi TypeScript
```bash
# Kiểm tra tsconfig.json đã được cấu hình đúng
# Nếu vẫn lỗi, thử:
npm install --save-dev @types/react @types/react-native
```

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [NativeWind](https://www.nativewind.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

