# API Module - Hướng dẫn sử dụng

## 📁 Cấu trúc

```
apis/
├── config/
│   └── apiClient.ts          # Axios client với interceptors
├── services/
│   ├── auth.service.ts       # Authentication services
│   ├── face.service.ts       # Face recognition services
│   ├── attendance.service.ts # Attendance services
│   ├── otp.service.ts        # OTP services
│   ├── qr.service.ts         # QR code services
│   └── index.ts
├── types/
│   ├── api.types.ts          # Common API types
│   ├── auth.types.ts         # Auth types
│   ├── face.types.ts         # Face recognition types
│   ├── attendance.types.ts   # Attendance types
│   ├── otp.types.ts          # OTP types
│   └── qr.types.ts           # QR types
├── socket/
│   ├── socketClient.ts       # Socket.io client wrapper
│   └── SocketProvider.tsx    # Socket context provider
└── index.ts                  # Export tất cả
```

## 🚀 Cách sử dụng

### 1. Authentication Service

```typescript
import { authService } from '@/apis';

// Đăng nhập
const loginResponse = await authService.login({
  username: 'SV001',
  password: 'student123'
});

// Token tự động được lưu vào secure storage
console.log('Token:', loginResponse.token);
console.log('Role:', loginResponse.role);

// Đăng xuất
await authService.logout();

// Lấy thông tin user hiện tại
const user = await authService.getCurrentUser();
```

### 2. Face Recognition Service

```typescript
import { faceService } from '@/apis';

// Đăng ký face từ ảnh upload (web)
const imageFile = event.target.files[0];
await faceService.registerFromImage('SV001', imageFile);

// Đăng ký face từ camera (React Native)
const { uri } = await Camera.takePictureAsync();
const base64Image = await FileSystem.readAsStringAsync(uri, {
  encoding: FileSystem.EncodingType.Base64,
});

await faceService.registerFromCamera({
  studentId: 'SV001',
  base64Image: `data:image/jpeg;base64,${base64Image}`
});

// Verify face từ camera
const verifyResult = await faceService.verifyFromCamera({
  studentId: 'SV001',
  base64Image: `data:image/jpeg;base64,${base64Image}`
});

if (verifyResult.isMatch) {
  console.log('Xác thực thành công! Similarity:', verifyResult.similarity);
}
```

### 3. OTP Service

```typescript
import { otpService } from '@/apis';

// Tạo OTP cho session
const otp = await otpService.generate({
  sessionId: 'session_123',
  teacherId: 'GV001'
});

console.log('OTP Code:', otp.code);
console.log('Expires At:', otp.expiresAt);

// Verify OTP
const isValid = await otpService.verify({
  sessionId: 'session_123',
  code: '123456'
});
```

### 4. QR Service

```typescript
import { qrService } from '@/apis';

// Tạo QR code cho session
const qr = await qrService.generate({
  sessionId: 'session_123',
  teacherId: 'GV001'
});

console.log('QR Token:', qr.token);

// Verify QR token
const isValid = await qrService.verify({
  sessionId: 'session_123',
  token: qr.token
});
```

### 5. Attendance Service

```typescript
import { attendanceService } from '@/apis';

// Tạo attendance session
const session = await attendanceService.createSession({
  classId: 'class_123',
  subjectId: 'subject_123',
  startTime: '2026-01-20T10:00:00',
  description: 'Buổi học số 1'
});

// Điểm danh
const record = await attendanceService.createRecord({
  sessionId: session.id,
  studentId: 'SV001',
  method: 'FACE',
  faceEncoding: [0.123, 0.456, ...]
});

// Lấy danh sách records
const records = await attendanceService.getRecords({
  sessionId: session.id
});
```

### 6. Socket.io (Realtime)

```typescript
import { useSocket } from '@/apis';
import { useEffect } from 'react';

function MyComponent() {
  const { socket, isConnected, emit, on, off } = useSocket();

  useEffect(() => {
    // Listen to attendance updates
    on('attendance:update', (data) => {
      console.log('Attendance updated:', data);
    });

    // Listen to session status changes
    on('session:status-changed', (data) => {
      console.log('Session status:', data.status);
    });

    // Cleanup listeners
    return () => {
      off('attendance:update');
      off('session:status-changed');
    };
  }, [on, off]);

  const handleEmit = () => {
    // Emit event to server
    emit('attendance:mark', {
      sessionId: 'session_123',
      studentId: 'SV001'
    });
  };

  return (
    <div>
      <p>Socket connected: {isConnected ? 'Yes' : 'No'}</p>
      <button onClick={handleEmit}>Mark Attendance</button>
    </div>
  );
}
```

### 7. Connect Socket manually

```typescript
import { useSocket } from '@/apis';

function MyComponent() {
  const { connect, disconnect, isConnected } = useSocket();

  useEffect(() => {
    // Connect khi user đăng nhập
    connect();

    return () => {
      // Disconnect khi component unmount
      disconnect();
    };
  }, [connect, disconnect]);

  return <div>Connected: {isConnected}</div>;
}
```

## ⚙️ Configuration

### API Base URL

Mặc định trong `apis/config/apiClient.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://your-production-api.com/api';
```

Có thể config từ environment variables:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
```

### Token Storage

Token tự động được lưu vào:
- **Web:** `localStorage`
- **React Native:** `expo-secure-store`

### Error Handling

API client tự động handle:
- 401 Unauthorized → Xóa token và trigger logout event
- Network errors → Hiển thị thông báo lỗi mạng
- Server errors → Trả về error message từ server

## 📝 TypeScript Support

Tất cả services đều có TypeScript types đầy đủ:

```typescript
import { 
  LoginRequest, 
  LoginResponse, 
  User,
  FaceResponse,
  FaceVerifyResponse,
  AttendanceRecordResponse,
  // ... và nhiều types khác
} from '@/apis';
```

## 🔐 Security

- Token được lưu trong secure storage (React Native)
- Token tự động được thêm vào Authorization header
- Auto logout khi token expired (401)
- Socket connection sử dụng auth token

