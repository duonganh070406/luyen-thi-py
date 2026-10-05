# Hệ thống ôn luyện & thi trực tuyến

MVP web chạy local/LAN phục vụ ôn luyện kiến thức, tuyên truyền và tổ chức kiểm tra.

## Chức năng hiện tại

- Import ngân hàng câu hỏi từ Excel (.xlsx)
- Chủ đề + độ khó + số lượng câu
- Luyện tập không cần đăng nhập
- Phòng thi thử / phòng thi chính thức
- Thi chính thức yêu cầu đăng nhập
- Thời gian 30 phút / 60 phút / không giới hạn
- Chấm điểm ở server và xem giải thích sau khi nộp
- Bảng xếp hạng chỉ dành cho admin
- SQLite mặc định; có thể chuyển sang SQL Server

## Chạy nhanh

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Mở `http://localhost:3000`.

## LAN

Ứng dụng bind `0.0.0.0` và in địa chỉ LAN khi khởi động. Máy khác trong cùng mạng có thể truy cập bằng `http://<IP-MAY-CHU>:3000` sau khi firewall cho phép cổng tương ứng.

## Cấu hình

Copy `cau-hinh.env.example` thành `cau-hinh.env` và điền cấu hình thật. Không commit file `cau-hinh.env`, database hoặc mật khẩu lên GitHub.

## Tài liệu

- `HUONG-DAN.md`: hướng dẫn SQLite / SQL Server
- `docs/Bao_cao_san_pham_he_thong_on_luyen_thi_truc_tuyen.docx`: báo cáo thiết kế sản phẩm
- `docs/HUONG-DAN-GITHUB.md`: quy trình push và cập nhật source
- `docs/mau-cau-hoi.xlsx`: template nhập câu hỏi
