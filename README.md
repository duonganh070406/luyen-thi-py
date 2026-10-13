# EduQuest

Không gian ôn tập cá nhân + phòng thi online — hệ thống hóa kiến thức qua trắc nghiệm,
import đề Excel/CSV, luyện theo chủ đề/độ khó, thi có giám sát chống gian lận.

---

## Tính năng

### Luyện thi (cần đăng nhập)

- **Chọn chủ đề hỗn hợp, độ khó, số lượng câu** — đề trộn thông minh theo tỉ lệ
  (Dễ: 50% Dễ · 30% TB · 20% Khó; TB: 30-40-30; Khó: 20-30-50), trộn câu hỏi + đảo đáp án.
- **Biểu đồ năng lực** — chủ đề/độ khó nào sai nhiều → ôn lại; **câu sai gần đây**.
- **Báo lỗi câu hỏi** — người luyện báo sai, quản trị viên duyệt.
- **ML gợi ý độ khó** — dựa trên tỉ lệ sai lịch sử (kiến trúc mở, thay được model thật).
- 4–5 loại câu hỏi (1 đáp án, nhiều đáp án, điền ngắn, nối đôi, tự luận),
  chấm tự luận bằng AI, lịch sử & thống kê, flashcard, ghi chú bài giảng.

### Phòng thi online (thí sinh nhập tên + đơn vị + CCCD + mã phòng)

- **Tự động lưu từng câu** ngay khi bấm; **tự động thu bài** khi hết giờ
  (server chốt theo deadline, không tin đồng hồ client).
- **Chống gian lận**: phát hiện chuyển tab (debounce), quá giới hạn tự thu; đáp án đúng
  **không bao giờ gửi cho client** trước khi nộp; mỗi phiên thi có ticket riêng.
- Quản trị viên: **tạo phòng**, **giám sát trực tiếp** (poll 3s), **đóng + thu bài**,
  **sửa bảng xếp hạng**, **xuất báo cáo CSV**.

### Quản trị viên (đăng nhập `admin` / `admin123`)

- **Import Excel/CSV** đúng mẫu: `Câu hỏi | A | B | C | D | E | Đáp án | Độ khó | Chủ đề | Giải thích`
  (tối đa 10MB, xem trước trước khi ghi đè).
- Quản lý ngân hàng đề (xem/sửa độ khó inline, xóa cả bộ), duyệt báo lỗi, chạy ML gợi ý độ khó.
- Quản lý đơn vị, tài khoản (tạo/reset mật khẩu/xóa, đổi mật khẩu lần đầu bắt buộc).
- Đăng xuất thu hồi token phía server.

### Trang chung

Trang chủ · Ôn luyện · Tham gia kiểm tra · Hướng dẫn · Liên hệ · Đăng nhập · Quản trị.
Luồng nghiệp vụ (Mermaid): xem `docs/FLOWS.md`.

---

## Công nghệ

| Thành phần | Stack |
| :--- | :--- |
| **Frontend** | React 19 + Vite, TypeScript, TailwindCSS v4, Framer Motion, KaTeX |
| **Backend** | FastAPI (Python), Pydantic, Uvicorn, openpyxl (đọc Excel) |
| **AI** | Google Gemini API (gọi phía server, key không rời máy chủ) |
| **Lưu trữ** | SQLite (`data/app.db`, WAL mode) — 14 bảng, backup xoay vòng 7 ngày |
| **Container** | Docker + Docker Compose |
| **Kiểm thử** | Playwright (E2E trình duyệt thật, script ngoài repo) |

---

## Cấu trúc thư mục

```
eduquest/
├── backend/
│   ├── main.py              # Entrypoint uvicorn (python main.py)
│   ├── requirements.txt
│   ├── src/
│   │   ├── app.py           # FastAPI app + CORS + routers
│   │   ├── config.py        # DATA_ROOT (DATA_DIR > data/ > backend/data)
│   │   ├── db.py            # SQLite WAL + DAO + migrate + backup
│   │   ├── auth.py          # PBKDF2, token Bearer 12h, lockout, ticket thi
│   │   ├── bank.py          # Ngân hàng đề + import Excel/CSV + ML độ khó
│   │   ├── examrooms.py     # Phòng thi: ticket, deadline, chấm, BXH
│   │   ├── markdown_parser.py  # Parser đề .md (nội dung lưu trong DB)
│   │   ├── grading_strategies.py  # Chấm theo loại câu (AI tự luận fail-closed)
│   │   └── routes/          # auth/bank/rooms/subjects/browse/health
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + guard đăng nhập khu ôn luyện
│   │   ├── pages/               # Home/About/Practice/ExamRoom/Contact/Login/Register/Profile/Admin
│   │   ├── components/          # QuizView, FlashcardView, CompetencyChart, ...
│   │   ├── mapBackend.ts        # Mapper API ↔ Frontend types
│   │   └── services/
│   │       └── api.ts           # Gọi backend REST API (tự gắn token, Friendly error)
│   └── Dockerfile
├── data/                    # Thư mục dữ liệu duy nhất (persistent volume)
│   ├── app.db               # Cơ sở dữ liệu SQLite toàn hệ thống
│   ├── app.db-wal / -shm    # (WAL runtime, tự sinh)
│   └── backups/             # Sao lưu tự động (1 bản/ngày, giữ 7 bản)
├── docs/
│   └── FLOWS.md             # Luồng nghiệp vụ (Mermaid)
├── docker-compose.yml
└── README.md
```

> Đề thi `.md` và ghi chú bài giảng lưu **trong `app.db`** (bảng `subject_exams`,
> `subject_notes`), tự nạp 1 lần từ đĩa lúc khởi động nếu bảng còn rỗng.
> Ảnh minh họa (nếu có) đặt ở `data/assets/<Tên môn>/`, phục vụ qua `GET /data/...`.

---

## Cài đặt & Chạy

### Yêu cầu

- **Python** ≥ 3.11
- **Node.js** ≥ 18
- **Docker** (tuỳ chọn, nếu chạy bằng container)
- **Gemini API Key** (tuỳ chọn, để chấm tự luận AI) — lấy miễn phí tại [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1. Cấu hình (tuỳ chọn)

Biến môi trường (có mặc định, không cần file `.env`):

```env
FRONTEND_PORT=3000
BACKEND_PORT=8000
GEMINI_API_KEY="your_api_key_here"
```

### 2. Chạy thủ công (Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt   # fastapi, uvicorn, python-multipart, openpyxl, ...
python main.py
# → http://localhost:8000 (đổi bằng BACKEND_PORT)
# → Swagger UI: tắt mặc định, bật bằng ENABLE_DOCS=1
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000 (proxy /api, /health, /data về backend)
```

### 3. Chạy bằng Docker Compose

```bash
docker compose up --build
```

Ứng dụng sẽ chạy tại:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`

Dữ liệu sống trên host ở `./data` (mount vào `/data`), rebuild image không mất.

---

## API Endpoints

> Khu ôn luyện cần **đăng nhập** (token Bearer, tự hết hạn 12h).
> Thao tác quản trị cần role **admin**. Tài liệu tương tác tắt mặc định
> (bật bằng `ENABLE_DOCS=1`).

| Method | Endpoint | Quyền | Mô tả |
| :----- | :------- | :---- | :---- |
| `GET` | `/health` | mở | Kiểm tra trạng thái backend |
| `GET` | `/data/{path}` | ảnh: mở, còn lại: admin | File ảnh minh họa trong `data/` |
| `POST` | `/api/auth/register` · `/api/auth/login` | mở | Tạo tài khoản / đăng nhập (mật khẩu ≥ 3 ký tự) |
| `GET` | `/api/auth/me` · `PUT /api/auth/password` · `POST /api/auth/logout` | login | Phiên hiện tại / đổi mật khẩu / thu hồi token |
| `GET` | `/api/auth/users` · `POST` · `PUT .../password` · `DELETE ...` | admin | Quản lý tài khoản |
| `GET` | `/api/subjects` | mở | Liệt kê môn học (tên + cấu hình) |
| `PUT` | `/api/subjects/{subject}/config` | admin | Bật/tắt, mô tả môn |
| `GET` | `/api/subjects/{subject}/exams` | login | Danh sách đề thi |
| `GET` | `/api/subjects/{subject}/exams/{exam_name}` | login | Câu hỏi 1 đề (kèm đáp án để tự học) |
| `GET` | `/api/subjects/{subject}/notes` (+ `/{note_name}`) | login | Ghi chú bài giảng |
| `GET` | `/api/subjects/{subject}/history` (+ `/{attempt_id}`) | login | Lịch sử làm bài / chi tiết 1 lượt |
| `POST` | `/api/subjects/{subject}/history` | login | Lưu 1 lần làm bài (chấm ở server, gắn username) |
| `DELETE` | `/api/subjects/{subject}/history/{attempt_id}` | admin | Xóa 1 lượt làm bài |
| `GET` | `/api/subjects/{subject}/stats` | login | Câu hay sai + sai gần đây |
| `POST` | `/api/subjects/{subject}/comprehensive-quiz` | login | Đề tổng hợp theo tỉ lệ loại câu |
| `POST` | `/api/subjects/{subject}/ai-feedback` | login | Nhận xét tự luận (AI chạy server-side) |
| `GET` | `/api/subjects/{subject}/bank` (+ `/topics`) | login | Ngân hàng đề + thống kê |
| `PUT` | `/api/subjects/{subject}/bank` · `PUT .../bank/{qid}` · `DELETE .../bank` | admin | Ghi đè / sửa 1 câu (ML) / xóa cả bộ |
| `POST` | `/api/import/preview` (multipart `.xlsx`/`.csv`, ≤ 10MB) | admin | Xem trước import |
| `POST` | `/api/subjects/{subject}/practice-quiz` | login | Đề luyện theo chủ đề + độ khó + đảo đáp án |
| `GET` | `/api/subjects/{subject}/competency` | login | Năng lực theo chủ đề/độ khó |
| `GET` | `/api/subjects/{subject}/ml-difficulty` | login | ML gợi ý độ khó câu hỏi |
| `POST` | `/api/subjects/{subject}/reports` | login | Báo lỗi câu hỏi (gắn người gửi) |
| `GET` · `PUT` | `/api/subjects/{subject}/reports...` | admin | Duyệt báo lỗi |
| `GET` | `/api/config/ai` (rút gọn cho user) · `PUT` · `POST .../test` | login / admin | Cấu hình AI (key chỉ admin thấy) |
| `GET` · `PUT` | `/api/config/contact` | mở / admin | Thông tin liên hệ |
| `POST` | `/api/rooms` · `GET /api/rooms` · `POST .../close` | admin | Tạo/liệt kê/đóng phòng thi |
| `POST` | `/api/rooms/join` | mở (mã phòng) | Vào thi: tên + đơn vị + CCCD + mã → nhận đề (đã cắt đáp án) + ticket |
| `POST` | `/api/rooms/answer` · `/violation` · `/submit` | mở (ticket) | Lưu từng câu / báo chuyển tab (debounce) / nộp bài |
| `GET` | `/api/rooms/{id}/monitor` · `/leaderboard/full` · `PUT /leaderboard` · `/export` | admin | Giám sát (kèm CCCD) / sửa điểm / xuất CSV |
| `GET` | `/api/rooms/{id}/leaderboard` | mở | BXH công khai (ẩn CCCD) |
| `GET` | `/api/units` · `POST` · `DELETE` | mở / admin | Danh sách đơn vị |

---

## Thêm câu hỏi / đề mới

Quản trị viên làm **hoàn toàn trên giao diện Web** (`/admin` → tab Ngân hàng đề),
không cần chạm vào máy chủ:

1. Chuẩn bị file Excel/CSV theo mẫu:
   `Câu hỏi | A | B | C | D | E | Đáp án | Độ khó | Chủ đề | Giải thích`
   (đáp án A–E, độ khó Dễ/Trung bình/Khó).
2. **Xem trước** (`POST /api/import/preview`) → kiểm tra lỗi từng dòng.
3. **Ghi đè** vào môn (`PUT /api/subjects/{subject}/bank`).
4. Đề thi `.md` mẫu ban đầu đã nạp sẵn trong DB; phòng thi lấy câu từ
   ngân hàng + đề theo cấu hình (chủ đề/độ khó/số câu/trộn/đảo).
