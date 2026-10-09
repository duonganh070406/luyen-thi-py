import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, BarChart3, Upload, Timer, Users } from 'lucide-react';

const FEATURES = [
  { icon: <BookOpen size={20} />, title: 'Luyện thi không cần đăng nhập', desc: 'Chọn chủ đề hỗn hợp, độ khó, số lượng câu — đề tự trộn câu hỏi và đảo đáp án.' },
  { icon: <Timer size={20} />, title: 'Phòng thi online', desc: 'Vào thi chỉ cần nhập tên + mã phòng. Tự động lưu từng câu, tự động thu bài khi hết giờ.' },
  { icon: <ShieldCheck size={20} />, title: 'Chống gian lận', desc: 'Phát hiện chuyển tab, đếm số lần vi phạm, quản trị viên quyết định khi thu bài.' },
  { icon: <BarChart3 size={20} />, title: 'Biểu đồ năng lực', desc: 'Thống kê chủ đề nào sai nhiều / sai ít, câu sai gần đây, gợi ý độ khó bằng ML.' },
  { icon: <Upload size={20} />, title: 'Import Excel / CSV', desc: 'Quản trị viên nạp ngân hàng đề theo mẫu: Câu hỏi, A-E, Đáp án, Độ khó, Chủ đề, Giải thích.' },
  { icon: <Users size={20} />, title: 'Giám sát + Báo cáo', desc: 'Dashboard theo dõi người tham gia trực tiếp, bảng xếp hạng sửa được, xuất báo cáo CSV.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      <div>
        {/* Hero Banner */}
        <div className="bg-[#8B0000] py-12 px-4 shadow-inner">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-[#FFDF73] font-bold mb-3 opacity-90">
              HỆ THỐNG LUYỆN THI TRẮC NGHIỆM A05 - CHẠY LOCAL
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Ôn luyện chủ động, thi thật tự tin
            </h1>
            <p className="text-white/85 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Ngân hàng đề có chủ đề và độ khó, trộn đề thông minh theo tỉ lệ (Dễ: 50-30-20),
              phòng thi online có giám sát chống gian lận và báo cáo đầy đủ cho quản trị viên.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                onClick={() => {
                  if (i === 0) navigate('/luyen-thi');
                  else if (i === 1) navigate('/phong-thi');
                }}
                className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#8B0000] text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Section */}
      <div className="max-w-6xl w-full mx-auto px-4 pb-10">
        <div className="rounded-xl bg-[#2A0505] border border-[#4A1010] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-white text-center sm:text-left">
            <h2 className="font-bold text-sm text-white mb-0.5">Dành cho quản trị viên</h2>
            <p className="text-white/70 text-xs">
              Import đề Excel/CSV, tạo phòng thi, giám sát trực tiếp, sửa bảng xếp hạng và xuất báo cáo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dang-nhap')}
            className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#4A1010] font-bold text-xs cursor-pointer transition-colors whitespace-nowrap shadow-xs"
          >
            Đăng nhập quản trị
          </button>
        </div>
      </div>
    </div>
  );
}
