# EduQuest

Không gian ôn tập cá nhân — hệ thống hóa kiến thức qua trắc nghiệm và tự luận, tích hợp chấm điểm AI.

---

## Tính năng

- **Ngân hàng đề thi dạng Markdown** — câu hỏi được lưu trong file `.md`, dễ chỉnh sửa bằng bất kỳ text editor nào.
- **Bốn loại câu hỏi** — một đáp án (`single`), nhiều đáp án (`multiple`), tự luận (`essay`), điền đáp án ngắn (`short_answer`).
- **Làm đề cụ thể** — chọn file `.md` từ ngân hàng, xem trước danh sách câu hỏi, bắt đầu làm.
- **Ôn tập tổng hợp** — backend chọn ngẫu nhiên câu hỏi từ toàn bộ đề trong môn, cấu hình số lượng theo từng loại.
- **Chấm tự luận bằng AI** — tích hợp Gemini API để nhận xét và chấm điểm câu trả lời tự luận (có thể bật/tắt trong Cấu hình).
- **Lịch sử & thống kê** — lưu toàn bộ lịch sử làm bài, thống kê câu hay sai nhất và sai gần đây.
- **Cấu hình linh hoạt** — cho phép chọn kiểu copy (đầy đủ hoặc rút gọn) và bật/tắt chấm bài bằng AI.
- **Không cần đăng nhập** — ứng dụng dành riêng cho một người dùng duy nhất, truy cập trực tiếp.

---

## Công nghệ

| Thành phần | Stack |
| :--- | :--- |
| **Frontend** | React 19 + Vite, TypeScript, TailwindCSS v4, Framer Motion, KaTeX |
| **Backend** | FastAPI (Python), Pydantic, Uvicorn |
| **AI** | Google Gemini API (`@google/genai`) |
| **Lưu trữ** | Flat file — Markdown (`.md`) + JSON (`history.json`) |
| **Container** | Docker + Docker Compose |

---

## Cấu trúc thư mục

```
eduquest/
├── backend/
│   ├── main.py              # FastAPI app — tất cả API endpoints
│   ├── src/
│   │   └── markdown_parser.py   # Parser chuyển .md → JSON câu hỏi
│   └── Dockerfile
├── data/
│   └── [Tên môn]/
│       ├── markdown/
│       │   └── [TênĐề].md   ← Nguồn câu hỏi
│       └── history.json     ← Lịch sử làm bài
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # UI chính
│   │   ├── mapBackend.ts        # Mapper API ↔ Frontend types
│   │   ├── components/
│   │   │   └── MarkdownRenderer.tsx  # Render LaTeX + Markdown
│   │   └── services/
│   │       ├── api.ts           # Gọi backend REST API
│   │       └── geminiService.ts # Gọi Gemini API chấm tự luận
│   └── Dockerfile
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
pip install fastapi uvicorn python-multipart
python main.py
# → http://localhost:1025
# → Swagger UI: http://localhost:1025/swagger
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

> Xem chi tiết định dạng đầy đủ tại [`.agents/rules/data_markdown_format.md`](.agents/rules/data_markdown_format.md).

---