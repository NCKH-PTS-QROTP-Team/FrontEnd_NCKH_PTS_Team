# Hướng dẫn Build Web

## Build Production Web

```bash
# Build static web files
npm run build:web

# Hoặc
npx expo export:web
```

Output sẽ nằm trong thư mục `web-build/`

## Các vấn đề có thể gặp khi build:

### 1. Lỗi className (NativeWind)
- **Nguyên nhân**: Một số component vẫn dùng `className` thay vì `style`
- **Giải pháp**: Đã sửa hầu hết trong admin pages, còn một số file teacher
- **Ảnh hưởng**: Có thể gây lỗi runtime nhưng không chặn build

### 2. Lỗi import sai (named vs default)
- **Nguyên nhân**: Import `{ Component }` thay vì `import Component`
- **Giải pháp**: Đã sửa trong admin pages
- **Ảnh hưởng**: Có thể gây lỗi runtime

### 3. Lỗi displayName
- **Nguyên nhân**: NativeWind styled component không tìm thấy displayName
- **Giải pháp**: Đã bỏ className ở các component chính
- **Ảnh hưởng**: Lỗi runtime khi dev, có thể không ảnh hưởng build

## Kiểm tra sau khi build:

1. Build thành công: `web-build/` folder được tạo
2. Test local: Serve folder `web-build/` với web server
3. Deploy: Upload folder `web-build/` lên hosting (Vercel, Netlify, etc.)

## Lưu ý:

- Build production sẽ minify code và optimize
- Các lỗi runtime có thể không hiển thị khi build nhưng sẽ xuất hiện khi chạy
- Nên test kỹ sau khi build để đảm bảo không có lỗi runtime

