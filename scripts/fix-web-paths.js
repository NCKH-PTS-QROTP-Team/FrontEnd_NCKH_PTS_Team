const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');

  // Đảm bảo dùng absolute paths cho assets khi serve ở root (/, ví dụ bằng backend Java hoặc Node static server)
  // Nếu Expo export ra dạng ./_expo hoặc ./assets thì chuyển lại thành /_expo và /assets
  content = content.replace(/src="\.\/_expo\//g, 'src="/_expo/');
  content = content.replace(/href="\.\/_expo\//g, 'href="/_expo/');
  content = content.replace(/src="\.\/assets\//g, 'src="/assets/');
  content = content.replace(/href="\.\/assets\//g, 'href="/assets/');

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✅ Fixed paths in index.html (/_expo, /assets)');
} else {
  console.error('❌ index.html not found at:', indexPath);
}
