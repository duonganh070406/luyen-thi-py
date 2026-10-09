import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, BarChart3, Upload, Timer, Users } from 'lucide-react';

const FEATURES = [
  { icon: <BookOpen size={20} />, title: 'Ôn tập không cần đăng nhập', desc: 'Chọn chủ đề hỗn hợp, độ khó, số lượng câu — đề tự trộn câu hỏi và đảo đáp án.' },
  { icon: <Timer size={20} />, title: 'Phòng thi online', desc: 'Vào thi chỉ cần nhập tên + mã phòng. Tự động lưu từng câu, tự động thu bài khi hết giờ.' },
  { icon: <ShieldCheck size={20} />, title: 'Chống gian lận', desc: 'Phát hiện chuyển tab, đếm số lần vi phạm, quản trị viên quyết định khi thu bài.' },
  { icon: <BarChart3 size={20} />, title: 'Biểu đồ năng lực', desc: 'Thống kê chủ đề nào sai nhiều / sai ít, câu sai gần đây, gợi ý độ khó bằng ML.' },
  { icon: <Upload size={20} />, title: 'Import Excel / CSV', desc: 'Quản trị viên nạp ngân hàng đề theo mẫu: Câu hỏi, A-E, Đáp án, Độ khó, Chủ đề, Giải thích.' },
  { icon: <Users size={20} />, title: 'Giám sát + Báo cáo', desc: 'Dashboard theo dõi người tham gia trực tiếp, bảng xếp hạng sửa được, xuất báo cáo CSV.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 mb-4">
          Hệ thống ôn tập trắc nghiệm · chạy local
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif italic mb-3">
          Ôn luyện chủ động, thi thật tự tin
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mb-6">
          Ngân hàng đề có chủ đề và độ khó, trộn đề thông minh theo tỉ lệ (Dễ: 50-30-20),
          phòng thi online có giám sát chống gian lận và báo cáo đầy đủ cho quản trị viên.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/luyen-thi')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 cursor-pointer"
          >
            Bắt đầu ôn tập
          </button>
          <button
            type="button"
            onClick={() => navigate('/phong-thi')}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Vào phòng thi (nhập mã)
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tài khoản quản trị mặc định: <b>admin</b> / <b>admin123</b> — đổi mật khẩu sau khi đăng nhập.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {FEATURES.map((f, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              {f.icon}
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="font-bold text-lg mb-1">Dành cho quản trị viên</h2>
          <p className="text-sm text-slate-300">
            Import đề Excel/CSV, tạo phòng thi, giám sát trực tiếp, sửa bảng xếp hạng và xuất báo cáo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dang-nhap')}
          className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 cursor-pointer"
        >
          Đăng nhập quản trị
        </button>
      </div>
    </div>
  );
}
