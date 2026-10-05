# Hướng dẫn chạy (Python + SQL Server 2022)

## A. Chạy thử nhanh (dùng SQLite, không cần cài gì thêm)
1. Cài Python 3.10 trở lên từ python.org. Khi cài **bắt buộc tick "Add python.exe to PATH"**.
2. Giải nén zip ra thư mục, bấm đúp **start.bat**. Lần đầu mất 1-2 phút để cài thư viện.
3. Trình duyệt tự mở `http://localhost:3000`. Đăng nhập `admin` / `admin123`.
4. Máy khác trong mạng LAN vào bằng địa chỉ dòng "Mạng LAN" trong cửa sổ đen. Windows hỏi tường lửa thì chọn Cho phép.

## B. Chuyển sang SQL Server 2022
1. Cài **ODBC Driver 18 for SQL Server** (tải từ Microsoft, tìm theo tên này).
2. Trong SSMS, tạo CSDL rỗng: `CREATE DATABASE LuyenThi;`
3. Mở `cau-hinh.env` bằng Notepad, bỏ dấu `#` ở một dòng `DATABASE_URL` rồi sửa:
   - `localhost\SQLEXPRESS`: tên máy và instance (bản Express thường là `localhost\SQLEXPRESS`; bản cài mặc định chỉ cần `localhost`).
   - `LuyenThi`: tên CSDL vừa tạo.
   - Cách 1 dùng tài khoản Windows đang đăng nhập. Cách 2 dùng tài khoản SQL (cần bật chế độ Mixed Mode).
4. Bấm đúp **start.bat**. Các bảng tự được tạo. Dòng đầu cửa sổ phải ghi `Cơ sở dữ liệu: mssql`.

Dữ liệu SQLite cũ (nếu có, file `data.db`) không tự chuyển sang SQL Server; hãy import lại bằng file Excel.

## Lỗi thường gặp
| Thông báo | Cách xử lý |
|---|---|
| `Data source name not found` | Chưa cài ODBC Driver 18 hoặc sai tên driver trong DATABASE_URL |
| `Login failed for user` | Sai tài khoản/mật khẩu; với tài khoản SQL phải bật Mixed Mode và khởi động lại SQL Server |
| `Cannot open database "LuyenThi"` | Chưa tạo CSDL ở bước B2 hoặc sai tên |
| `server was not found` / `timeout` | Sai tên instance; bật dịch vụ **SQL Server Browser** và giao thức **TCP/IP** trong SQL Server Configuration Manager |
| Mật khẩu có ký tự `@ : / #` | Phải mã hóa URL (ví dụ `@` thành `%40`) |
