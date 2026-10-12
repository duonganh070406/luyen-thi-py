import { useNavigate } from 'react-router-dom';

const STEPS_TS = [
  'Mở mục “Tham gia kiểm tra”, nhập đúng họ tên, đơn vị công tác, số căn cước công dân và mã kỳ kiểm tra do cán bộ phụ trách cung cấp.',
  'Làm bài trực tiếp trên trình duyệt. Mỗi câu trả lời được tự động lưu ngay sau khi chọn.',
  'Không chuyển sang cửa sổ hoặc ứng dụng khác trong thời gian làm bài; mỗi lần rời màn hình đều được ghi nhận và có thể bị tự động thu bài (tùy cấu hình kỳ kiểm tra).',
  'Bấm “Nộp bài” khi hoàn thành. Hệ thống cũng tự động thu bài khi hết giờ.',
];

const STEPS_QT = [
  'Đăng nhập tài khoản quản trị, vào mục “Ngân hàng câu hỏi” để import bộ đề từ file Excel/CSV hoặc thêm từng câu.',
  'Vào mục “Kỳ kiểm tra” để tạo kỳ mới: chọn bộ câu hỏi, chủ đề, mức độ, số câu, thời gian, số lần rời màn hình cho phép và chia sẻ mã kỳ kiểm tra cho thí sinh.',
  'Theo dõi trực tiếp tiến độ làm bài, số lần vi phạm; kết thúc kỳ và xuất báo cáo CSV để tổng hợp kết quả.',
];

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-extrabold text-primary uppercase tracking-wide mb-1">Hướng dẫn sử dụng</h1>
      <p className="text-xs text-slate-500 mb-5">Hệ thống kiểm tra nhận thức nghiệp vụ cơ bản – Lực lượng an ninh.</p>

      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm mb-4">
        <h2 className="flex items-center gap-2 font-extrabold text-[13px] text-slate-800 uppercase tracking-wide mb-3">
          <span className="w-1 h-4 rounded bg-primary inline-block" /> Dành cho thí sinh
        </h2>
        <ol className="flex flex-col gap-2.5">
          {STEPS_TS.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="pt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/luyen-thi')}
            className="px-5 py-2.5 rounded-md bg-primary hover:bg-primary-dark text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Ôn luyện ngay
          </button>
          <button
            type="button"
            onClick={() => navigate('/phong-thi')}
            className="px-5 py-2.5 rounded-md bg-white border border-primary text-primary text-xs font-bold cursor-pointer hover:bg-primary/5 transition-colors"
          >
            Tham gia kiểm tra
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-[13px] text-slate-800 uppercase tracking-wide mb-3">
          <span className="w-1 h-4 rounded bg-primary inline-block" /> Dành cho cán bộ quản trị
        </h2>
        <ol className="flex flex-col gap-2.5">
          {STEPS_QT.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-full bg-gold text-primary-deep text-[10px] font-extrabold flex items-center justify-center">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
