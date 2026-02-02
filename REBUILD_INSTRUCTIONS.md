# Hướng Dẫn Rebuild Frontend

## ⚠️ Vấn Đề

Sau khi sửa code trong `apis/config/apiClient.ts`, bạn **PHẢI rebuild lại** frontend để code mới có hiệu lực.

File đã build trong `dist/` vẫn chứa code cũ với production URL.

## 🔧 Cách Rebuild

### Bước 1: Rebuild Frontend
```bash
cd NCKH
npm run build:web
```

Lệnh này sẽ:
- Build lại frontend với code mới
- Tạo lại file `dist/_expo/static/js/web/entry-*.js` với API URL đúng
- Fix paths trong `index.html`

### Bước 2: Restart Server (nếu đang chạy)
```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm run serve:dist
```

### Bước 3: Hard Refresh Browser
- **Chrome/Edge**: `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R`
- Hoặc mở DevTools → Network tab → Check "Disable cache"

## ✅ Kiểm Tra

Sau khi rebuild, mở browser console và kiểm tra:
```
🌐 API Base URL: http://localhost:8080/api
🌐 Current hostname: localhost
🌐 __DEV__: false
```

Nếu thấy `http://localhost:8080/api` → ✅ Đúng
Nếu thấy `https://your-production-api.com/api` → ❌ Cần rebuild lại

## 🚀 Quick Fix

Nếu vẫn lỗi sau khi rebuild:

1. **Xóa cache browser:**
   - DevTools → Application → Clear storage → Clear site data

2. **Xóa dist folder và rebuild:**
   ```bash
   cd NCKH
   rm -rf dist  # hoặc xóa thủ công
   npm run build:web
   ```

3. **Kiểm tra backend có chạy không:**
   ```bash
   # Terminal khác
   cd Backend/ProjectBackend
   mvn spring-boot:run
   # → Phải chạy ở http://localhost:8080
   ```

## 📝 Lưu Ý

- **Mỗi lần sửa code** trong `apis/` → Phải rebuild
- **File đã build** trong `dist/` không tự động update
- **Browser cache** có thể giữ file cũ → Hard refresh

