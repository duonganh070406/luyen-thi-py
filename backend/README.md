# EduQuest — Backend (FastAPI)

REST API cho dự án EduQuest. Toàn bộ dữ liệu nằm trong **SQLite** (`DATA_DIR/app.db`,
mặc định `data/app.db`), chế độ **WAL** + `busy_timeout` + khóa ghi `BEGIN IMMEDIATE`.

---

## Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu |
|------------|-------------------|
| Python | 3.11+ |
| pip | 22+ |

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python main.py            # → http://127.0.0.1:8000 (đổi bằng BACKEND_PORT)
```

Tài liệu API tương tác **tắt mặc định** (tránh lộ sơ đồ endpoint);
bật khi debug bằng `ENABLE_DOCS=1` (`/swagger`, `/redoc`).

---

## Cấu trúc thư mục

```
backend/
├── main.py              # Entrypoint uvicorn
├── requirements.txt
├── src/
│   ├── app.py           # FastAPI app, CORS, routers
│   ├── config.py        # DATA_ROOT: DATA_DIR > data/ > backend/data > ./data
│   ├── db.py            # Schema + DAO + migrate 1 lần + backup xoay vòng
│   ├── auth.py          # PBKDF2 200k+salt, token 12h, lockout 5 lần/5 phút, ticket thi
│   ├── bank.py          # Ngân hàng đề + parse Excel/CSV + trộn + ML độ khó
│   ├── examrooms.py     # Logic phòng thi (deadline server, chấm, BXH)
│   ├── markdown_parser.py  # Parser đề .md (đọc từ chuỗi trong DB)
│   ├── grading_strategies.py  # Chấm single/multi/short_answer/essay/matching
│   ├── models.py        # Pydantic models
│   ├── config_manager.py   # Đọc/ghi cấu hình AI + liên hệ
│   ├── utils.py         # require_subject, parse_exam_content (cache), ảnh assets
│   └── routes/
│       ├── auth.py      # /api/auth/* (users: admin)
│       ├── bank.py      # bank/topics/preview/replace/practice-quiz/competency/reports
│       ├── rooms.py     # rooms CRUD + join/answer/violation/submit/monitor/export + units
│       ├── subjects.py  # subjects/exams/notes/history/stats/comprehensive/ai-feedback/config
│       ├── browse.py    # GET /data/{path} (ảnh public, còn lại admin)
│       └── health.py    # GET /health
└── Dockerfile
```

---

## Lưu trữ: SQLite `app.db` (13 bảng)

| Bảng | Nội dung |
|------|----------|
| `users` | username (PK), password_hash PBKDF2, role, created_at |
| `login_attempts` | đếm sai + khóa đăng nhập 5 phút |
| `rooms` | phòng thi: mã code, môn, số câu, giờ, trộn/đảo, max_violations, auto_submit, show_answers |
| `room_sessions` | phiên thí sinh, PK `(room_id, participant, id_number)` + ticket + deadline server |
| `subjects` | tên môn (PK), active, description, other_information |
| `subject_exams` | đề thi `.md` theo môn, PK `(subject, name)` + content + updated_at |
| `subject_notes` | ghi chú `.md` theo môn, PK `(subject, name)` + content + updated_at |
| `bank_questions` | ngân hàng A–E từ import Excel/CSV |
| `history_attempts` | lượt làm bài (summary + snapshot, gắn username) |
| `reports` | báo lỗi câu hỏi (kèm người gửi, trạng thái) |
| `units` | danh sách đơn vị |
| `settings` | cấu hình key-value (AI, liên hệ) |
| `ai_profiles` | profile AI (key chỉ admin thấy) |

**Quy ước:**
- DB là nguồn sự thật duy nhất cho nội dung text. Lúc khởi động, nếu bảng
  `subject_exams`/`subject_notes` còn rỗng thì tự nạp 1 lần từ `data/<môn>/markdown/`
  và `data/<môn>/note*/` rồi thôi (idempotent; không ghi đè dòng `subjects`).
- Ảnh minh họa (nếu có) đặt ở `data/assets/<Tên môn>/`, phục vụ qua `/data/...`.
- Backup: SQLite backup API lúc khởi động (1 bản/ngày, giữ 7 bản trong `data/backups/`).
- Boolean = INTEGER, list/object = TEXT JSON. Không còn file JSON runtime nào.

---

## API Reference

**Base URL:** `http://127.0.0.1:8000` · Chi tiết đủ ở `README.md` gốc.

Quyền: **mở** (không cần token) / **login** (Bearer của mọi tài khoản) / **admin**.

- `GET /health` (mở) → `{"ok": true}`
- `GET /data/{path}` — ảnh public; `.md`/`.json`/nhạy cảm chỉ admin (chặn traversal)
- Auth (JWT stateless HS256, hết hạn 12h — production đặt `JWT_SECRET` riêng): `POST /api/auth/register|login` (mở) · `GET /me` · `PUT /password` · `POST /logout` (login) · `/api/auth/users...` (admin)
- Môn học: `GET /api/subjects` (mở) · `PUT .../config` (admin)
- Ôn luyện (login): `exams`, `exams/{name}`, `notes`, `history` + `history/{id}`,
  `stats`, `comprehensive-quiz`, `ai-feedback`, `bank`, `practice-quiz`,
  `competency`, `ml-difficulty`, `POST reports`
- Quản trị (admin): `DELETE history/{id}`, `PUT/DELETE bank`, `POST /api/import/preview`,
  `GET/PUT reports`, `GET/PUT /api/config/ai`, `PUT /api/config/contact`
- Phòng thi: `POST /api/rooms`, `GET /api/rooms`, `POST .../close` (admin);
  `join/answer/violation/submit` (mở, bằng mã phòng + ticket);
  `monitor`, `leaderboard/full`, `PUT leaderboard`, `export` (admin);
  `GET leaderboard` (mở, ẩn CCCD); `GET/POST/DELETE /api/units` (mở xem/admin sửa)

---

## Biến môi trường

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `DATA_DIR` | (tự dò) | Thư mục dữ liệu — Docker mount `/data` |
| `PORT` / `BACKEND_PORT` | `8000` | Cổng FastAPI |
| `GEMINI_API_KEY` | `""` | Key chấm tự luận AI (server-side, không rời máy chủ) |
| `CORS_ORIGINS` | localhost:5173,3000 | Origin cho phép (cộng regex `*.vercel.app`) |
| `ENABLE_DOCS` | (tắt) | `=1` để bật `/swagger`, `/redoc`, `/openapi.json` |

---

## Ghi chú kỹ thuật

### Đồng thời & WAL
`journal_mode=WAL`, `busy_timeout=30000`, mọi cụm ghi dùng `BEGIN IMMEDIATE`
dưới lock tiến trình (`_WRITE` / `transaction()`).

### Chấm tự luận fail-closed
`EssayGrading` luôn trả `is_correct=None`; lỗi AI (hết key/timeout/sự cố) cho
feedback là chuỗi `"Lỗi..."/"Không thể..."` → `append_history` ghi **pending**,
tuyệt đối không +điểm. Nhận xét AI cho flashcard chạy qua `POST .../ai-feedback`
phía server — key không bao giờ xuống trình duyệt.

### Path Traversal Protection
Mọi tên môn/tên đề đi qua `require_subject` (check DB) và `store.exam_get/note_get`
(truy vấn tham số hóa) — không còn đọc file theo đường dẫn người dùng.
Route `/data` vẫn resolve + `relative_to(DATA_ROOT)`.

### Parse đề thi
`parse_md_content(text)` tách khỏi đọc file; cache `lru` theo hash nội dung.
Hỗ trợ 5 loại: `single`, `multiple` (`multi`), `short_answer`, `matching`, `essay`;
ảnh tương đối `img/...` được rewrite sang `/data/assets/<môn>/...` khi tồn tại.
