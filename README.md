# EduQuest

Không gian ôn tập cá nhân + phòng thi online — hệ thống hóa kiến thức qua trắc nghiệm,
import đề Excel/CSV, luyện theo chủ đề/độ khó, thi có giám sát chống gian lận.

---

## Tính năng

### Luyện thi (không cần đăng nhập)

- **Chọn chủ đề hỗn hợp, độ khó, số lượng câu** — đề trộn thông minh theo tỉ lệ
  (Dễ: 50% Dễ · 30% TB · 20% Khó; TB: 30-40-30; Khó: 20-30-50), trộn câu hỏi + đảo đáp án.
- **Biểu đồ năng lực** — chủ đề/độ khó nào sai nhiều → ôn lại; **câu sai gần đây**.
- **Báo lỗi câu hỏi** — người luyện báo sai, quản trị viên duyệt.
- **ML gợi ý độ khó** — dựa trên tỉ lệ sai lịch sử (kiến trúc mở, thay được model thật).
- Giữ nguyên luồng cũ: ngân hàng đề Markdown, 4–5 loại câu hỏi, chấm tự luận bằng AI,
  lịch sử & thống kê, flashcard, ghi chú.

### Phòng thi online (thí sinh chỉ nhập tên + mã phòng)

- **Tự động lưu từng câu** ngay khi bấm; **tự động thu bài** khi hết giờ
  (server chốt theo deadline, không tin đồng hồ client).
- **Chống gian lận**: phát hiện chuyển tab, quá giới hạn tự thu; đáp án đúng
  **không bao giờ gửi cho client** trước khi nộp; mỗi phiên thi có ticket riêng.
- Quản trị viên: **tạo phòng**, **giám sát trực tiếp** (poll 3s), **đóng + thu bài**,
  **sửa bảng xếp hạng**, **xuất báo cáo CSV**.

### Quản trị viên (đăng nhập `admin` / `admin123`)

- **Import Excel/CSV** đúng mẫu: `Câu hỏi | A | B | C | D | E | Đáp án | Độ khó | Chủ đề | Giải thích`
  (file mẫu: `backend/scripts/question_template.csv`).
- Quản lý ngân hàng đề (thêm/sửa/xóa, sửa độ khó inline), duyệt báo lỗi, chạy ML gợi ý độ khó.
- Mật khẩu có nút con mắt xem/ẩn. Đăng xuất thu hồi token phía server.

### Trang chung

Trang chủ · Giới thiệu · Luyện thi · Phòng thi · Liên hệ · Đăng nhập · Quản trị.
Luồng nghiệp vụ (Mermaid): xem `docs/FLOWS.md`.

---

## Công nghệ

| Thành phần | Stack |
| :--- | :--- |
| **Frontend** | React 19 + Vite, TypeScript, TailwindCSS v4, Framer Motion, KaTeX |
| **Backend** | FastAPI (Python), Pydantic, Uvicorn, openpyxl (đọc Excel) |
| **AI** | Google Gemini API (`@google/genai`) |
| **Lưu trữ** | Flat file — Markdown (`.md`) + JSON (`questions.json`, `history.json`, `rooms.json`, ...) |
| **Container** | Docker + Docker Compose |
| **Kiểm thử** | Playwright (E2E trình duyệt thật, script ngoài repo) |

---

## Cấu trúc thư mục

```
eduquest/
├── backend/
│   ├── main.py              # FastAPI app — tất cả API endpoints
│   ├── src/
│   │   ├── markdown_parser.py   # Parser chuyển .md → JSON câu hỏi
│   │   ├── auth.py              # Đăng nhập admin/user, token Bearer
│   │   ├── bank.py              # Ngân hàng đề + import Excel/CSV + ML độ khó
│   │   ├── examrooms.py         # Phòng thi: ticket, deadline, chấm, BXH
│   │   └── routes/
│   │       ├── auth.py          # /api/auth/*
│   │       ├── bank.py          # /api/subjects/*/bank|import|practice-quiz|competency|reports|ml-difficulty
│   │       └── rooms.py         # /api/rooms/* (tạo/join/answer/violation/submit/monitor/leaderboard/export)
│   └── Dockerfile
├── data/
│   └── [Tên môn]/
│       ├── markdown/
│       │   └── [TênĐề].md   ← Nguồn câu hỏi (legacy, vẫn dùng được)
│       ├── questions.json   ← Ngân hàng đề từ import Excel/CSV
│       └── history.json     ← Lịch sử làm bài
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + SiteNav chung
│   │   ├── pages/               # Home/About/Practice/ExamRoom/Contact/Login/Admin
│   │   ├── components/          # PasswordInput, CompetencyChart, QuizView, ...
│   │   ├── mapBackend.ts        # Mapper API ↔ Frontend types
│   │   └── services/
│   │       └── api.ts           # Gọi backend REST API
│   └── Dockerfile
├── docs/
│   └── FLOWS.md             # Luồng nghiệp vụ (Mermaid)
├── .env                     # Cấu hình port và API key
├── docker-compose.yml
└── AGENTS.md                # Tài liệu kiến trúc cho AI agent
```

---

## Cài đặt & Chạy

### Yêu cầu

- **Python** ≥ 3.11
- **Node.js** ≥ 18
- **Docker** (tuỳ chọn, nếu chạy bằng container)
- **Gemini API Key** — lấy miễn phí tại [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1. Cấu hình biến môi trường

Sao chép và chỉnh sửa file `.env` ở thư mục gốc:

```env
FRONTEND_PORT=1024
BACKEND_PORT=1025
GEMINI_API_KEY="your_api_key_here"
```

### 2. Chạy thủ công (Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt   # fastapi, uvicorn, python-multipart, openpyxl, ...
python main.py
# → http://localhost:8000 (đổi bằng BACKEND_PORT)
# → Swagger UI: http://localhost:8000/swagger
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:1024
```

### 3. Chạy bằng Docker Compose

```bash
docker-compose up --build
```

Ứng dụng sẽ chạy tại:
- **Frontend:** `http://localhost:1024`
- **Backend API:** `http://localhost:1025`
- **Swagger UI:** `http://localhost:1025/swagger`

---

## API Endpoints

Toàn bộ API được document tại **`http://localhost:1025/swagger`** (Swagger UI) và **`http://localhost:1025/redoc`** (ReDoc).

| Method | Endpoint | Mô tả |
| :----- | :------- | :---- |
| `GET` | `/health` | Kiểm tra trạng thái backend |
| `GET` | `/api/browse?path=...` | Duyệt cây thư mục `data/` |
| `GET` | `/api/subjects` | Liệt kê các môn học hợp lệ |
| `GET` | `/api/subjects/{subject}/exams` | Liệt kê các đề thi `.md` của môn |
| `GET` | `/api/subjects/{subject}/exams/{exam_name}` | Lấy câu hỏi của một đề thi cụ thể |
| `GET` | `/api/subjects/{subject}/history` | Lấy toàn bộ lịch sử làm bài |
| `POST` | `/api/subjects/{subject}/history` | Lưu một lần làm bài mới |
| `GET` | `/api/subjects/{subject}/stats` | Thống kê câu hay sai (`mostMissed`, `recentErrors`) |
| `GET` | `/api/subjects/{subject}/comprehensive-quiz` | Tạo đề ngẫu nhiên theo số lượng từng loại |
| `POST` | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` · `GET /api/auth/me` | Đăng ký/đăng nhập (token Bearer), thu hồi token, xem phiên hiện tại |
| `GET` | `/api/subjects/{subject}/bank` (+ `/topics`) | Ngân hàng đề + thống kê số lượng |
| `POST` | `/api/subjects/{subject}/bank` · `PUT/DELETE .../bank/{id}` | Thêm/sửa/xóa câu hỏi (admin) |
| `POST` | `/api/subjects/{subject}/import` (multipart `.xlsx`/`.csv`) | Import đề theo mẫu image.png (admin) |
| `POST` | `/api/subjects/{subject}/practice-quiz` | Đề luyện theo chủ đề + độ khó (trộn tỉ lệ) + đảo đáp án |
| `GET` | `/api/subjects/{subject}/competency` | Năng lực theo chủ đề/độ khó (vẽ biểu đồ) |
| `GET` | `/api/subjects/{subject}/ml-difficulty` | ML gợi ý độ khó câu hỏi |
| `POST` | `/api/subjects/{subject}/reports` · `GET/PUT` (admin) | Báo lỗi câu hỏi + duyệt |
| `POST` | `/api/rooms` · `GET /api/rooms` · `PUT /api/rooms/{id}` · `POST .../close` | Tạo/liệt kê/sửa/đóng phòng thi (admin) |
| `POST` | `/api/rooms/join` | Vào thi bằng tên + mã phòng → nhận đề (đã cắt đáp án) + ticket |
| `POST` | `/api/rooms/answer` · `/violation` · `/submit` | Lưu từng câu / báo chuyển tab / nộp bài (kèm ticket) |
| `GET` | `/api/rooms/{id}/monitor` · `/leaderboard` · `PUT` (sửa điểm) · `/export` (CSV) | Giám sát, BXH, báo cáo (admin) |

---

## Thêm câu hỏi mới

Tạo hoặc chỉnh sửa file `.md` trong thư mục `data/[Tên môn]/markdown/`. Ví dụ:

**`data/Giải tích 3/markdown/DE_THI_THU.md`**

```markdown
# Câu 0
- **id:** 0
- **type:** single
- **question:** Đạo hàm của $f(x) = \ln(x)$ là gì?
- **options:**
  - $\frac{1}{x}$
  - $-\frac{1}{x}$
  - $e^x$
  - $\ln(x)$
- **answer:** 0
- **explanation:** Công thức cơ bản: $(\ln x)' = 1/x$ với $x > 0$.

---
# Câu 1
- **id:** 1
- **type:** essay
- **question:** Phát biểu định lý Newton-Leibniz.
- **options:**
- **answer:** Nếu $F(x)$ là nguyên hàm của $f(x)$ liên tục trên $[a,b]$, thì $\int_a^b f(x)\,dx = F(b) - F(a)$.
- **explanation:** Định lý thiết lập mối liên hệ giữa tích phân xác định và nguyên hàm.
```

---