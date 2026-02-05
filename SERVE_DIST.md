# Hướng Dẫn Serve Frontend Dist (Cách 2 - Tách Biệt)

## 🎯 Ports cho Frontend Dist

### Development (Local Testing)

#### Option 1: HTTP Server (Recommended)
```bash
cd NCKH
npm run serve:dist
# → Chạy ở http://localhost:3000
```

Hoặc port khác:
```bash
npm run serve:dist:8081
# → Chạy ở http://localhost:8081
```

#### Option 2: Python HTTP Server
```bash
cd NCKH/dist
python -m http.server 3000
# → Chạy ở http://localhost:3000
```

#### Option 3: Node.js http-server
```bash
cd NCKH
npx http-server dist -p 3000 -o
# → Chạy ở http://localhost:3000 và tự động mở browser
```

#### Option 4: VS Code Live Server
- Right-click vào `NCKH/dist/index.html`
- Chọn "Open with Live Server"
- → Thường chạy ở `http://127.0.0.1:5500` hoặc `http://localhost:5500`

---

### Production

#### Option 1: Nginx (Port 80/443)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Option 2: Apache (Port 80/443)
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/frontend/dist
    
    <Directory /var/www/frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### Option 3: CDN/Static Hosting
- **Vercel**: Deploy folder `dist/` → `https://your-app.vercel.app`
- **Netlify**: Deploy folder `dist/` → `https://your-app.netlify.app`
- **GitHub Pages**: Deploy folder `dist/` → `https://username.github.io/repo`

---

## 🔧 Setup Development với Cách 2

### Bước 1: Build Frontend
```bash
cd NCKH
npm run build:web
# → Tạo folder dist/
```

### Bước 2: Serve Frontend (Terminal 1)
```bash
cd NCKH
npm run serve:dist
# → Frontend chạy ở http://localhost:3000
```

### Bước 3: Chạy Backend (Terminal 2)
```bash
cd Backend/ProjectBackend
mvn spring-boot:run
# → Backend chạy ở http://localhost:8080/api
```

### Bước 4: Cấu hình Frontend gọi API

**NCKH/apis/config/apiClient.ts:**
```typescript
const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      // Frontend ở port 3000, Backend ở port 8080
      return 'http://localhost:8080/api';
    }
    // ... mobile
  }
  return 'https://api.yourdomain.com/api';
};
```

---

## 📋 Ports Summary

| Environment | Frontend Port | Backend Port | URL |
|------------|--------------|--------------|-----|
| **Development (Cách 1)** | - | 8080 | `http://localhost:8080/` |
| **Development (Cách 2)** | 3000 | 8080 | Frontend: `http://localhost:3000`<br>Backend: `http://localhost:8080/api` |
| **Production (Nginx)** | 80/443 | 8080 | Frontend: `https://yourdomain.com`<br>Backend: `https://yourdomain.com/api` |
| **Production (CDN)** | CDN | 8080 | Frontend: `https://app.vercel.app`<br>Backend: `https://api.yourdomain.com/api` |

---

## ⚠️ Lưu Ý

### 1. CORS Configuration
Khi frontend và backend chạy ở port khác nhau, cần cấu hình CORS:

**Backend/WebConfig.java:**
```java
.allowedOriginPatterns(
    "http://localhost:3000",  // Frontend dev server
    "http://localhost:8081",   // Hoặc port khác
    "https://yourdomain.com"   // Production
)
```

### 2. API Base URL
Frontend cần biết backend URL:

**Development:**
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

**Production:**
```typescript
const API_BASE_URL = 'https://api.yourdomain.com/api';
// Hoặc nếu dùng reverse proxy:
const API_BASE_URL = '/api'; // Relative path
```

### 3. SPA Routing
Khi serve từ dist folder, cần đảm bảo SPA routing hoạt động:
- Nginx: `try_files $uri $uri/ /index.html;`
- Apache: Rewrite rules
- http-server: Tự động hỗ trợ

---

## 🚀 Quick Commands

```bash
# Build frontend
npm run build:web

# Serve dist ở port 3000
npm run serve:dist

# Serve dist ở port 8081
npm run serve:dist:8081

# Serve với Python
cd dist && python -m http.server 3000

# Serve với Node.js http-server
npx http-server dist -p 3000 -o
```

---

## ✅ Recommended Setup

**Development:**
- Frontend: `http://localhost:3000` (npm run serve:dist)
- Backend: `http://localhost:8080/api`

**Production:**
- Frontend: Nginx port 80/443 hoặc CDN
- Backend: Port 8080 (internal) hoặc 443 (Nginx reverse proxy)

