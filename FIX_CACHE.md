# Fix Browser Cache Issue

## 🔴 Vấn Đề

Browser đang cache file JavaScript cũ (`entry-1e8466485452a9e625ce62fae2a9711b.js`) 
thay vì load file mới (`entry-08f6a146a9bb8a53e87d85781209b3c4.js`).

## ✅ Giải Pháp

### Cách 1: Hard Refresh Browser (Nhanh nhất)
1. Mở browser
2. Nhấn `Ctrl + Shift + R` (Windows/Linux) hoặc `Cmd + Shift + R` (Mac)
3. Hoặc `Ctrl + F5`

### Cách 2: Xóa Cache Hoàn Toàn
1. Mở DevTools (`F12`)
2. Right-click vào nút Refresh
3. Chọn **"Empty Cache and Hard Reload"**

### Cách 3: Disable Cache trong DevTools
1. Mở DevTools (`F12`)
2. Vào tab **Network**
3. Check **"Disable cache"**
4. Refresh lại trang (`F5`)

### Cách 4: Xóa Cache Browser
**Chrome/Edge:**
1. `Ctrl + Shift + Delete`
2. Chọn "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. `Ctrl + Shift + Delete`
2. Chọn "Cache"
3. Click "Clear Now"

### Cách 5: Serve với No-Cache (Đã cập nhật)
```bash
npm run serve:dist
# → Đã thêm flag -c-1 để disable cache
```

## 🧪 Kiểm Tra

Sau khi hard refresh, mở DevTools → Network tab và kiểm tra:
- File JavaScript phải là: `entry-08f6a146a9bb8a53e87d85781209b3c4.js` (file mới)
- Không phải: `entry-1e8466485452a9e625ce62fae2a9711b.js` (file cũ)

## 📝 Lưu Ý

- **http-server** đã được cấu hình với `-c-1` để disable cache
- Nếu vẫn cache, dùng **Hard Refresh** (`Ctrl + Shift + R`)
- **DevTools → Network → Disable cache** để test

