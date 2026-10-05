# EduQuest — Frontend (React + Vite)

Giao diện người dùng cho dự án EduQuest — ứng dụng học tập cá nhân hỗ trợ trắc nghiệm, tự luận, và ôn tập tổng hợp.

---

## Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt & Khởi động](#cài-đặt--khởi-động)
3. [Biến môi trường](#biến-môi-trường)
4. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
5. [Kiến trúc ứng dụng](#kiến-trúc-ứng-dụng)
6. [Tech Stack](#tech-stack)
7. [Tính năng UI](#tính-năng-ui)
8. [Kết nối với Backend](#kết-nối-với-backend)

---

## Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu |
|------------|-------------------|
| Node.js | 18+ |
| npm | 9+ |

---

## Cài đặt & Khởi động

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình biến môi trường (xem phần bên dưới)
cp .env.example .env   # hoặc tạo file .env thủ công

# 4. Khởi động dev server
npm run dev

# Ứng dụng chạy tại: http://localhost:3000
```

### Các lệnh có sẵn

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi động dev server (port 3000, expose ra mọi interface) |
| `npm run build` | Build production bundle vào thư mục `dist/` |
| `npm run preview` | Xem trước bản build production |
| `npm run lint` | Kiểm tra lỗi TypeScript (`tsc --noEmit`) |
| `npm run clean` | Xóa thư mục `dist/` |

> **Lưu ý:** Backend FastAPI phải đang chạy tại `http://127.0.0.1:8000` trước khi khởi động frontend, vì Vite proxy sẽ forward các request `/api/*` và `/health` tới backend.

---

## Biến môi trường

Dự án sử dụng file `.env` chung tại **thư mục gốc** (root) của dự án. Bạn không cần tạo file `.env` riêng trong thư mục `frontend/`.

```env
# Cổng chạy ứng dụng
FRONTEND_PORT=3000
BACKEND_PORT=8000

# Bắt buộc: API key của Google Gemini (dùng để chấm tự luận)
GEMINI_API_KEY="your_gemini_api_key_here"

# Tùy chọn: URL nơi ứng dụng được deploy
APP_URL="http://localhost:3000"
```

**Cách lấy `GEMINI_API_KEY`:**
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Tạo API key mới
3. Dán vào file `.env` ở **thư mục gốc**.

> Nếu không cấu hình `GEMINI_API_KEY`, ứng dụng vẫn hoạt động bình thường nhưng tính năng **chấm tự luận bằng AI** sẽ bị vô hiệu hóa.

---

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── App.tsx                  # Component gốc — toàn bộ UI & logic chính
│   ├── main.tsx                 # Entry point React
│   ├── index.css                # Global styles (Tailwind + custom)
│   ├── types.ts                 # TypeScript interfaces (Question, Subject, Attempt...)
│   ├── mapBackend.ts            # Hàm chuyển đổi dữ liệu API → UI types
│   ├── components/
│   │   └── MarkdownRenderer.tsx # Render Markdown + LaTeX (KaTeX)
│   └── services/
│       ├── api.ts               # Tất cả các hàm gọi backend API
│       └── geminiService.ts     # Tích hợp Gemini AI (chấm tự luận)
├── index.html                   # HTML template
├── vite.config.ts               # Cấu hình Vite (proxy, alias, plugins)
├── tsconfig.json                # Cấu hình TypeScript
├── package.json                 # Dependencies & scripts
└── .env                         # Biến môi trường (không commit)
```

---

## Kiến trúc ứng dụng

### Luồng dữ liệu

```
backend/data/*.json
        │
        ▼
  FastAPI Backend (port 8000)
        │  REST API (/api/...)
        ▼
  Vite Dev Server (port 3000)
     [proxy /api → :8000]
        │
        ▼
  React App (App.tsx)
        │
        ├── services/api.ts         ← fetch dữ liệu
        ├── mapBackend.ts           ← transform sang UI types
        └── Component Tree         ← render UI
```

### State management

Toàn bộ state được quản lý trong `App.tsx` bằng React `useState` và `useEffect` — không dùng thư viện state management bên ngoài (Redux, Zustand, v.v.).

**Các state chính:**

| State | Kiểu | Mô tả |
|-------|------|-------|
| `state` | `AppState` | Dữ liệu gốc: subjects, questions, attempts |
| `activeTab` | `string` | Tab đang hiển thị: `dashboard`, `subject`, `quiz` |
| `selectedSubjectId` | `string` | Môn học đang được chọn |
| `activeQuizQuestions` | `Question[]` | Danh sách câu hỏi của buổi làm bài hiện tại |
| `quizAnswers` | `Record<string, any>` | Đáp án người dùng theo questionId |
| `subjectStats` | `object` | Dữ liệu thống kê sai (mostMissed, recentErrors) |
| `selectedExam` | `string` | File đề thi đang được chọn |
| `showResult` | `boolean` | Trạng thái hiển thị màn hình kết quả |

### Chuyển đổi kiểu dữ liệu (`mapBackend.ts`)

File `mapBackend.ts` đóng vai trò là lớp **adapter** giữa API schema và UI types:

| Hàm | Mô tả |
|-----|-------|
| `questionFromApi(subjectId, raw)` | Chuyển câu hỏi từ JSON API → `Question` (đặc biệt: `"multiple"` → `'multi'`) |
| `attemptFromHistory(subjectId, raw)` | Chuyển lịch sử làm bài từ JSON → `Attempt` |
| `buildHistoryPayload(params)` | Tạo payload `POST /history` từ kết quả làm bài |
| `subjectFromFolderName(name, index)` | Tạo object `Subject` từ tên thư mục |

> **Lưu ý quan trọng:** Trong file JSON data, câu nhiều đáp án dùng `type: "multiple"`, nhưng trong UI (React) lại dùng `type: 'multi'`. Sự chuyển đổi này được xử lý bởi `questionFromApi()`.

---

## Tech Stack

| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| [React](https://react.dev/) | ^19.0.1 | UI framework |
| [Vite](https://vitejs.dev/) | ^6.2.3 | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org/) | ~5.8.2 | Type safety |
| [TailwindCSS](https://tailwindcss.com/) | ^4.1.14 | Styling (utility-first CSS) |
| [Motion (Framer Motion)](https://motion.dev/) | ^12.23.24 | Animations & transitions |
| [Lucide React](https://lucide.dev/) | ^0.546.0 | Icon library |
| [React Markdown](https://github.com/remarkjs/react-markdown) | ^10.1.0 | Render Markdown |
| [KaTeX](https://katex.org/) | ^0.16.45 | Render công thức LaTeX |
| [remark-math](https://github.com/remarkjs/remark-math) | ^6.0.0 | Parse `$...$` trong Markdown |
| [rehype-katex](https://github.com/remarkjs/remark-math) | ^7.0.1 | Kết hợp Markdown + KaTeX |
| [@google/genai](https://ai.google.dev/) | ^1.29.0 | Gemini AI SDK |

---

## Tính năng UI

### Dashboard môn học

Khi chọn một môn học từ sidebar, dashboard hiển thị các khối thông tin theo thứ tự:

1. **Header môn học** — Tên, mô tả, thông tin tổng quan.
2. **Câu hỏi hay sai nhất** — Top 10 câu sai nhiều lần nhất. Click để xem đầy đủ câu hỏi, đáp án, giải thích.
3. **Sai gần đây** — Top 10 câu sai mới nhất. Click để expand xem chi tiết.
4. **Ngân hàng đề thi** — Danh sách các file đề thi. Click chọn đề để xem danh sách câu hỏi và bắt đầu làm.
5. **Lịch sử làm bài** — Danh sách các lần đã làm theo thời gian. Click để xem lại chi tiết.
6. **Ôn tập tổng hợp** — Nhập số lượng câu theo từng loại, hệ thống tự chọn ngẫu nhiên và trộn đề.

### Luồng làm bài (Quiz Flow)

```
Chọn đề / Ôn tập tổng hợp
         │
         ▼
   [Quiz View]
   - Điều hướng câu trước/sau
   - Chọn đáp án (single / multi)
   - Nhập câu trả lời (essay)
         │
         ▼ Nộp bài
   [Grading — AI chấm tự luận]
         │
         ▼
   [Kết quả]
   - Điểm trắc nghiệm
   - Xem chi tiết đáp án từng câu
   - Về bảng điều khiển
```

### Render LaTeX & Markdown (`MarkdownRenderer.tsx`)

Component `MarkdownRenderer` sử dụng pipeline:
- `react-markdown` + `remark-gfm` + `remark-math` → parse Markdown với LaTeX
- `rehype-katex` → render công thức toán học (inline `$...$` và block `$$...$$`)

### Chấm tự luận bằng AI (`geminiService.ts`)

Sau khi nộp bài, với mỗi câu tự luận có câu trả lời:
1. Gọi `getEssayFeedback(question, userAnswer, referenceAnswer)`.
2. Prompt được gửi đến Gemini API (`gemini-2.0-flash`).
3. Kết quả nhận xét được lưu vào `essayFeedbacks` state và hiển thị trong màn hình kết quả.

---

## Kết nối với Backend

Vite dev server được cấu hình proxy tại `vite.config.ts`:

```typescript
proxy: {
  '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/data': { target: 'http://127.0.0.1:8000', changeOrigin: true }
}
```

Toàn bộ request tới `/api/*`, `/health`, `/data/*` từ frontend sẽ được tự động forward tới backend.

Biến `VITE_API_BASE_URL` (trong `services/api.ts`) mặc định là chuỗi rỗng — tức là dùng relative URL, hoàn toàn phụ thuộc vào proxy của Vite.

### Danh sách API được sử dụng

| Hàm trong `api.ts` | Endpoint | Mô tả |
|--------------------|----------|-------|
| `listSubjects()` | `GET /api/subjects` | Lấy danh sách môn học |
| `listExams(subject)` | `GET /api/subjects/{s}/exams` | Lấy danh sách đề thi |
| `getExamData(subject, exam)` | `GET /api/subjects/{s}/exams/{e}` | Lấy câu hỏi một đề |
| `getSubjectData(subject)` | `GET /api/subjects/{s}/data` | Lấy câu hỏi (legacy) |
| `getHistory(subject)` | `GET /api/subjects/{s}/history` | Lấy lịch sử làm bài |
| `appendHistory(subject, payload)` | `POST /api/subjects/{s}/history` | Lưu lịch sử làm bài |
| `getSubjectStats(subject)` | `GET /api/subjects/{s}/stats` | Lấy thống kê sai |
| `getComprehensiveQuiz(subject, params)` | `GET /api/subjects/{s}/comprehensive-quiz` | Tạo đề tổng hợp |
