import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 font-serif italic mb-4">Giới thiệu</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 leading-relaxed flex flex-col gap-3">
        <p>
          <b className="text-slate-800">EduQuest</b> là hệ thống luyện thi trắc nghiệm chạy local (không cần máy chủ
          phức tạp), gồm 2 chế độ rõ ràng:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li><b className="text-slate-800">Luyện thi:</b> không cần đăng nhập. Người dùng chọn môn, chủ đề (có thể hỗn hợp nhiều chủ đề), độ khó, số lượng câu. Hệ thống trộn đề theo tỉ lệ độ khó, đảo thứ tự đáp án.</li>
          <li><b className="text-slate-800">Thi thật (phòng thi online):</b> thí sinh chỉ cần nhập <b>tên + mã phòng</b>. Bài làm được tự động lưu từng câu, tự động thu bài khi hết giờ hoặc vi phạm chuyển tab quá giới hạn.</li>
          <li><b className="text-slate-800">Quản trị viên:</b> đăng nhập bằng tài khoản, import đề Excel/CSV, tạo và giám sát phòng thi trực tiếp, đóng bài thi, sửa bảng xếp hạng, xuất báo cáo CSV.</li>
        </ul>
        <p>
          Mỗi câu hỏi trong ngân hàng đề gồm: <b className="text-slate-800">câu hỏi, phương án A-E, đáp án, độ khó (Dễ / Trung bình / Khó), chủ đề, giải thích</b>.
          Khi chọn 1 mức độ khó, hệ thống vẫn pha trộn theo tỉ lệ để đảm bảo độ khó đồng đều giữa các lượt (ví dụ chọn Dễ: 50% Dễ – 30% Trung bình – 20% Khó).
        </p>
        <p>
          Tiện ích kèm theo: báo lỗi câu hỏi sai, biểu đồ năng lực theo chủ đề, câu sai gần đây, gợi ý độ khó tự động
          (rule-based trên tỉ lệ sai lịch sử — kiến trúc mở, có thể thay bằng model ML thật sau này).
        </p>
        <div>
          <button
            type="button"
            onClick={() => navigate('/luyen-thi')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 cursor-pointer"
          >
            Thử luyện thi ngay
          </button>
        </div>
      </div>
    </div>
  );
}
