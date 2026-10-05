# Đẩy project lên GitHub

## 1. Tạo repository

Tạo một repository rỗng trên GitHub, ví dụ `he-thong-on-luyen-thi`.

## 2. Push lần đầu

Mở Git Bash/PowerShell tại thư mục project:

```powershell
git init -b main
git add .
git commit -m "Initial MVP: he thong on luyen va thi truc tuyen"
git remote add origin https://github.com/<USERNAME>/he-thong-on-luyen-thi.git
git remote -v
git push -u origin main
```

## 3. Cập nhật tiến độ

```powershell
git status
git add .
git commit -m "feat: add question bank CRUD"
git push
```

## 4. Không đưa secret lên GitHub

Không commit `cau-hinh.env`, database, mật khẩu admin, token, API key hoặc connection string thật.
