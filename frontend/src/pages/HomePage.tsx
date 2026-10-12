import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, BookMarked } from 'lucide-react';

const CARDS = [
  {
    icon: <BookOpen size={22} />,
    title: 'Ôn luyện',
    desc: 'Tự ôn tập theo chủ đề và mức độ, xem đáp án, giải thích và căn dặn ngay sau khi nộp bài. Không cần đăng nhập.',
    link: 'Bắt đầu ôn luyện →',
    to: '/luyen-thi',
  },
  {
    icon: <ClipboardList size={22} />,
    title: 'Tham gia kiểm tra',
    desc: 'Nhập họ tên, đơn vị, số căn cước/công dân và mã kỳ kiểm tra do cán bộ phụ trách cung cấp. Bài làm được lưu tự động sau mỗi câu.',
    link: 'Vào kỳ kiểm tra →',
    to: '/phong-thi',
  },
  {
    icon: <BookMarked size={22} />,
    title: 'Hướng dẫn sử dụng',
    desc: 'Quy trình tham gia kiểm tra, quy định trong thời gian làm bài và hướng dẫn dành cho cán bộ quản trị.',
    link: 'Xem hướng dẫn →',
    to: '/gioi-thieu',
  },
];

const NOTES = [
  'Khi tham gia kiểm tra, ghi đúng họ tên, đơn vị công tác và số căn cước công dân để kết quả được tổng hợp chính xác.',
  'Không chuyển sang cửa sổ hoặc ứng dụng khác trong thời gian làm bài; hệ thống ghi nhận mỗi lần rời màn hình.',
  'Phát hiện câu hỏi có sai sót, đề nghị phản ánh tại màn hình kết quả ôn luyện để cán bộ quản trị rà soát.',
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary-dark via-primary to-primary-dark px-4 pt-10 pb-14 text-center shadow-inner">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-light font-bold mb-3">
          Bộ Công an – Cục An ninh mạng
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white uppercase tracking-wide leading-snug max-w-4xl mx-auto">
          Hệ thống kiểm tra nhận thức nghiệp vụ cơ bản
        </h1>
        <p className="mt-2 text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-white">
          Lực lượng an ninh
        </p>
        <div className="mx-auto mt-2 h-[3px] w-24 rounded bg-gold" />
        <p className="mt-4 text-white/80 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Phục vụ ôn tập, củng cố và kiểm tra nhận thức về kiến thức pháp luật, nghiệp vụ cơ bản cho cán bộ, chiến sĩ
          và đoàn viên thanh niên.
        </p>
      </div>

      {/* 3 the chuc nang */}
      <div className="max-w-6xl w-full mx-auto px-4 -mt-8 pb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {CARDS.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => navigate(c.to)}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-md text-left hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  {c.icon}
                </span>
                <h3 className="font-extrabold text-[13px] text-slate-800 uppercase tracking-wide">{c.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed min-h-[54px]">{c.desc}</p>
              <span className="inline-block mt-3 text-xs font-bold text-primary group-hover:underline underline-offset-2">
                {c.link}
              </span>
            </button>
          ))}
        </div>

        {/* Luu y */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-extrabold text-[13px] text-primary uppercase tracking-wide mb-3">
            <span className="w-1 h-4 rounded bg-primary inline-block" /> Lưu ý khi sử dụng
          </h2>
          <ul className="flex flex-col gap-2">
            {NOTES.map((n, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                <span className="text-primary font-bold">•</span> {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
