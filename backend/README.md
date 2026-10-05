# EduQuest — Backend (FastAPI)

Storage handler và REST API cho dự án EduQuest. Toàn bộ dữ liệu được lưu trữ dưới dạng **Flat-file JSON** trên đĩa cục bộ — không dùng database.

---

## Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt & Khởi động](#cài-đặt--khởi-động)
3. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
4. [Cấu trúc dữ liệu](#cấu-trúc-dữ-liệu)
5. [API Reference](#api-reference)
6. [Biến môi trường](#biến-môi-trường)
7. [Ghi chú kỹ thuật](#ghi-chú-kỹ-thuật)

---

## Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu |
|------------|-------------------|
| Python | 3.10+ |
| pip | 22+ |

**Thư viện Python cần thiết:**

```
fastapi
uvicorn[standard]
pydantic
python-multipart
```

> Không có file `requirements.txt` — cài trực tiếp bằng lệnh bên dưới.

---

## Cài đặt & Khởi động

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. (Khuyến nghị) Tạo virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# 3. Cài đặt dependencies
pip install fastapi "uvicorn[standard]" pydantic python-multipart

# 4. Khởi động server (auto-reload khi code thay đổi)
python -m uvicorn main:app --reload

# Server sẽ chạy tại: http://127.0.0.1:8000
# Swagger UI (docs tương tác): http://127.0.0.1:8000/docs
# ReDoc:                        http://127.0.0.1:8000/redoc
```

---

## Cấu trúc thư mục

```
backend/
├── main.py              # Toàn bộ logic API (single-file)
└── data/                # Thư mục dữ liệu gốc
    ├── Toán học/
    │   ├── đề giữa kì.json   # Ngân hàng câu hỏi (đề thi)
    │   ├── đề 2.json          # Ngân hàng câu hỏi (đề thi)
    │   └── history.json       # Lịch sử làm bài của môn này
    └── Tin học/
        ├── data.json
        └── history.json
```

**Quy ước:**
- Mỗi **thư mục con** trong `data/` là một **môn học**.
- Mỗi file `.json` (trừ `history.json`) là một **đề thi / ngân hàng câu hỏi**.
- `history.json` lưu toàn bộ lịch sử làm bài của môn đó.
- Một môn học **chỉ được nhận diện** nếu có ít nhất 1 file đề thi (không tính `history.json`).

---

## Cấu trúc dữ liệu

> Xem chi tiết đầy đủ tại `.agents/rules/data_format.md`

### File đề thi (`*.json`)

Mỗi file là một **mảng JSON** chứa các đối tượng câu hỏi:

```json
[
  {
    "id": 1,
    "type": "single",
    "question": "Đạo hàm của $f(x) = e^x$ là gì?",
    "options": ["$e^x$", "$xe^{x-1}$", "$\\ln(x)$", "$1/e^x$"],
    "answer": 0,
    "explanation": "Theo công thức cơ bản, $(e^x)' = e^x$."
  },
  {
    "id": 2,
    "type": "multiple",
    "question": "Mệnh đề nào đúng về đạo hàm?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "answer": [0, 1, 3],
    "explanation": "Giải thích..."
  },
  {
    "id": 3,
    "type": "essay",
    "question": "Phát biểu định lý Newton-Leibniz.",
    "answer": "Nếu F là nguyên hàm của f trên [a,b]: $\\int_a^b f(x)dx = F(b) - F(a)$.",
    "explanation": "Định lý thiết lập mối liên hệ giữa đạo hàm và tích phân xác định."
  }
]
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `number` | ID duy nhất trong môn học |
| `type` | `"single"` \| `"multiple"` \| `"essay"` | Loại câu hỏi |
| `question` | `string` | Nội dung câu hỏi (hỗ trợ LaTeX với `$...$`) |
| `options` | `string[]` | Danh sách lựa chọn (bắt buộc với `single`/`multiple`) |
| `answer` | `number` \| `number[]` \| `string` | Đáp án đúng (index 0-based cho trắc nghiệm; chuỗi cho essay) |
| `explanation` | `string` | Giải thích sau khi nộp bài |

### File lịch sử (`history.json`)

```json
[
  {
    "attemptId": "uuid-hoặc-timestamp",
    "timestamp": "2026-05-12T16:19:24Z",
    "summary": {
      "score": 2, "total": 4,
      "correct": 2, "wrong": 1, "pendingEssay": 1
    },
    "snapshot": [
      {
        "id": 1, "type": "single",
        "question": "Nội dung câu hỏi...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "userAnswer": 0,
        "isCorrect": true,
        "explanation": "Giải thích..."
      }
    ]
  }
]
```

---

## API Reference

**Base URL:** `http://127.0.0.1:8000`

### Health Check

```
GET /health
```
Trả về `{"ok": true}` — dùng để kiểm tra server đang chạy.

---

### Static File Server

```
GET /data/{path}
```
Truy cập trực tiếp bất kỳ file JSON nào trong thư mục `data/`.

**Ví dụ:**
```
GET /data/Toán học/đề giữa kì.json
GET /data/Toán học/history.json
```

---

### Resource Browser

```
GET /api/browse?path={path}
```
Duyệt cây thư mục `data/` dạng JSON có thể navigate. Nếu không truyền `path`, trả về toàn bộ cây từ gốc.

**Ví dụ:**
```
GET /api/browse
GET /api/browse?path=Toán học
```

**Response (thư mục):**
```json
{
  "name": "Toán học",
  "type": "directory",
  "path": "Toán học",
  "children": [
    { "name": "đề 2.json", "type": "file", "path": "Toán học/đề 2.json", "size": 1234, "url": "/data/To%C3%A1n%20h%E1%BB%8Dc/%C4%91%E1%BB%81%202.json" },
    { "name": "history.json", "type": "file", ... }
  ]
}
```

---

### Subjects (Môn học)

```
GET /api/subjects
```
Trả về danh sách tên các môn học có ít nhất 1 đề thi.

**Response:** `["Tin học", "Toán học"]`

---

### Exams (Đề thi)

```
GET /api/subjects/{subject}/exams
```
Liệt kê các file đề thi trong môn học (không bao gồm `history.json`).

**Response:** `["đề 2.json", "đề giữa kì.json"]`

---

```
GET /api/subjects/{subject}/exams/{exam_name}
```
Trả về toàn bộ danh sách câu hỏi của một đề thi cụ thể.

**Ví dụ:** `GET /api/subjects/Toán học/exams/đề giữa kì.json`

---

### History (Lịch sử làm bài)

```
GET /api/subjects/{subject}/history
```
Lấy toàn bộ lịch sử làm bài của một môn. Trả về `[]` nếu chưa có lịch sử.

---

```
POST /api/subjects/{subject}/history
Content-Type: application/json
```
Ghi thêm một lần làm bài vào `history.json`. Sử dụng **atomic write** (ghi qua file tạm, sau đó rename) để tránh mất dữ liệu.

**Request body:**
```json
{
  "attemptId": "string",
  "timestamp": "2026-05-12T16:00:00Z",
  "summary": { "score": 3, "total": 5, "correct": 3, "wrong": 2, "pendingEssay": 0 },
  "snapshot": [ ... ]
}
```

**Response:** `{ "ok": true, "length": 5 }`

---

### Stats (Thống kê sai)

```
GET /api/subjects/{subject}/stats
```
Phân tích `history.json` và trả về:
- `mostMissed` — top 10 câu sai nhiều lần nhất (kèm số lần sai).
- `recentErrors` — top 10 câu sai gần đây nhất (mỗi câu chỉ xuất hiện 1 lần, không trùng lặp).

**Response:**
```json
{
  "mostMissed": [
    { "count": 5, "question": { "id": 2, "type": "single", ... } }
  ],
  "recentErrors": [
    { "id": 3, "type": "multiple", ... }
  ]
}
```

---

### Comprehensive Quiz (Ôn tập tổng hợp)

```
GET /api/subjects/{subject}/comprehensive-quiz?single=5&multi=2&essay=1
```
Gom toàn bộ câu hỏi từ tất cả đề thi của môn học, sau đó chọn ngẫu nhiên theo từng loại và trộn đề.

| Query param | Mặc định | Mô tả |
|------------|----------|-------|
| `single` | `5` | Số câu trắc nghiệm 1 đáp án |
| `multi` | `2` | Số câu trắc nghiệm nhiều đáp án |
| `essay` | `1` | Số câu tự luận |

**Response:** Mảng câu hỏi đã được xáo trộn ngẫu nhiên.

---

## Biến môi trường

Dự án sử dụng file `.env` chung tại **thư mục gốc** (root) để quản lý cấu hình cho cả Frontend và Backend.

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `BACKEND_PORT` | `8000` | Cổng chạy của FastAPI server |
| `FRONTEND_PORT` | `3000` | Cổng chạy của Vite server |
| `GEMINI_API_KEY` | `""` | Key dùng để chấm điểm tự luận bằng AI |
| `CORS_ORIGINS` | `...` | Danh sách origin được phép |

---

## Ghi chú kỹ thuật

### Atomic Write
File `history.json` được ghi theo cơ chế **atomic**: dữ liệu mới được ghi vào file `.tmp` trước, sau đó mới `rename` thay thế file gốc. Cơ chế này đảm bảo file không bị corrupt nếu tiến trình bị gián đoạn giữa chừng.

### Path Traversal Protection
Tất cả các đường dẫn được resolve và kiểm tra bằng `Path.relative_to(DATA_ROOT)` trước khi truy cập, ngăn chặn tấn công directory traversal.

### LaTeX trong JSON
Dấu `\` trong chuỗi JSON phải được escape thành `\\`. Ví dụ: `$\\ln(x)$`, `$\\int_a^b f(x)dx$`.
