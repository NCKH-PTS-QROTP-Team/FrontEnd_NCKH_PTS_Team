# Fix SPA Routing với http-server

## 🔴 Vấn Đề

`http-server` **KHÔNG hỗ trợ SPA routing**. Khi truy cập `/auth/login`:
- Server tìm file `auth/login.html` → Không có → 404
- Cần serve `index.html` cho tất cả routes

## ✅ Giải Pháp

### Cách 1: Dùng `serve` Package (Recommended) ✅

Package `serve` tự động hỗ trợ SPA routing.

**Đã cập nhật trong package.json:**
```bash
npm run serve:dist
# → Dùng serve với flag -s (single page app)
```

### Cách 2: Dùng Python với Custom Handler

Tạo file `server.py` trong `NCKH/dist/`:

```python
import http.server
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()
    
    def do_GET(self):
        # Nếu request không phải file thực sự, serve index.html
        if self.path.startswith('/api'):
            # Proxy API requests (nếu cần)
            self.send_error(404)
            return
        
        # Check if file exists
        file_path = self.path.split('?')[0]  # Remove query string
        if file_path == '/':
            file_path = '/index.html'
        
        full_path = os.path.join(os.getcwd(), file_path.lstrip('/'))
        
        if os.path.isfile(full_path) and not file_path.endswith('.html'):
            # Serve actual file
            super().do_GET()
        else:
            # Serve index.html for SPA routing
            self.path = '/index.html'
            super().do_GET()

PORT = 3000
with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    httpd.serve_forever()
```

Chạy:
```bash
cd NCKH/dist
python server.py
```

### Cách 3: Dùng Node.js Express Server

Tạo file `server.js` trong `NCKH/`:

```javascript
const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;
const DIST_PATH = path.join(__dirname, 'dist');

// Serve static files
app.use(express.static(DIST_PATH));

// SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

Chạy:
```bash
cd NCKH
node server.js
```

## 🚀 Quick Fix (Đã cập nhật)

**Đã thay `http-server` bằng `serve`:**
```bash
npm run serve:dist
# → serve tự động hỗ trợ SPA routing với flag -s
```

## ✅ Kiểm Tra

Sau khi dùng `serve`:
1. Truy cập `http://localhost:3000/` → ✅ Load được
2. Truy cập `http://localhost:3000/auth/login` → ✅ Load được (không còn 404)
3. Truy cập `http://localhost:3000/admin/dashboard` → ✅ Load được

## 📝 Lưu Ý

- **`serve`** package tự động hỗ trợ SPA routing
- Flag `-s` = single page app mode
- Flag `-l` = listen port
- Không cần cấu hình thêm

