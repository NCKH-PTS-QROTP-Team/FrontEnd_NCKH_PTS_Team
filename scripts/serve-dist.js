const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, '..', 'dist');

// CORS cho phát triển local (frontend tĩnh gọi backend khác port)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: false,
    maxAge: 3600,
  }),
);

// Tắt cache cho dev để luôn load bundle mới
app.use(
  express.static(distPath, {
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    },
  }),
);

// SPA fallback: luôn trả index.html cho route không phải file tĩnh
app.get('*', (req, res) => {
  const requestedPath = path.join(distPath, req.path);

  if (fs.existsSync(requestedPath) && fs.lstatSync(requestedPath).isFile()) {
    return res.sendFile(requestedPath);
  }

  return res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(` Frontend dist server running at http://localhost:${port}`);
  console.log(` Serving static files from: ${distPath}`);
  console.log(' SPA routing enabled, cache disabled for development.');
});

