# 📘 Hướng Dẫn Commit Cho Project M-Truyen

## 🎯 Mục Đích

## 📊 Kiểm Tra Sau Khi Commit

### Xem lịch sử commits:
```bash
git log --oneline -24
```

### Xem chi tiết một commit:
```bash
git show <commit-hash>
```

### Xem thống kê:
```bash
git log --oneline --graph --all --decorate
```

---

## 🔄 Hoàn Tác Nếu Cần

### Hoàn tác N commits gần nhất (giữ lại thay đổi):
```bash
git reset --soft HEAD~N
# Ví dụ: git reset --soft HEAD~5
```

### Hoàn tác N commits gần nhất (xóa thay đổi):
```bash
git reset --hard HEAD~N
# ⚠️ Cẩn thận: Lệnh này sẽ xóa mất thay đổi!
```

### Hoàn tác một commit cụ thể:
```bash
git revert <commit-hash>
```

---

## ✅ Best Practices

### 1. **Kiểm Tra Trước Khi Commit**
- Đảm bảo code chạy được: `npm run dev`
- Kiểm tra lỗi TypeScript: `npm run build`
- Xem xét các file thay đổi: `git status`

### 2. **Commit Message Format**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Thay đổi documentation
- `style`: Thay đổi format, không ảnh hưởng code
- `refactor`: Refactor code
- `test`: Thêm tests
- `chore`: Maintenance tasks
- `build`: Build system changes

### 3. **Thứ Tự Commit**
Nên commit theo thứ tự:
1. Infrastructure (API, hooks, store)
2. Components
3. Pages
4. Features (PWA, Analytics)
5. Styling & Assets
6. Configuration
7. Documentation

### 4. **Test Sau Mỗi Commit**
```bash
npm run dev  # Kiểm tra app vẫn chạy
npm run build  # Kiểm tra build thành công
```

---

## 🚨 Troubleshooting

### Lỗi: "Permission Denied"
```bash
# Git Bash
chmod +x auto-commit.sh

# PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Lỗi: "File not found"
- Kiểm tra đường dẫn file
- Đảm bảo đang ở đúng thư mục project
- Một số file có thể chưa tồn tại

### Có file không commit được
- Kiểm tra `.gitignore`
- Một số file có thể đã được staged trước đó
- Dùng `git status` để xem trạng thái

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra lại file paths
2. Đảm bảo Git đã được cài đặt
3. Xem log của script để debug
4. Có thể commit thủ công nếu cần

---

## 📝 Notes

- Script sẽ tự động bỏ qua các file không tồn tại
- Mỗi commit sẽ được kiểm tra trước khi thực hiện
- Có thể dừng script bất cứ lúc nào bằng Ctrl+C
- Nên backup code trước khi chạy script lần đầu

---

**Tạo bởi**: Claude AI Assistant  
**Ngày**: December 26, 2024  
**Project**: M-Truyen Comic Reader
