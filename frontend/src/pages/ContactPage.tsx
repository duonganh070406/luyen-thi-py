import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 font-serif italic mb-4">Liên hệ</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Mail size={16} className="text-indigo-600" /> Thông tin liên hệ
          </div>
          <p>Phòng đào tạo — Hệ thống luyện thi EduQuest (bản chạy local).</p>
          <p className="mt-2">Email: <b className="text-slate-800">hotro@eduquest.local</b></p>
          <p>Điện thoại: <b className="text-slate-800">0123 456 789</b></p>
          <p className="mt-2 text-xs text-slate-400">
            Gặp câu hỏi sai? Hãy dùng nút “Báo lỗi” ngay dưới mỗi câu hỏi khi luyện thi —
            báo cáo sẽ chuyển thẳng cho quản trị viên.
          </p>
        </div>
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-3"
          onSubmit={(e) => { e.preventDefault(); if (name.trim() && msg.trim()) setSent(true); }}
        >
          <h2 className="font-bold text-slate-800 text-sm">Gửi lời nhắn</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Họ tên của bạn"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
          />
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Nội dung cần hỗ trợ..."
            rows={4}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 resize-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 cursor-pointer"
          >
            <Send size={15} /> Gửi
          </button>
          {sent && <p className="text-xs text-green-600 font-semibold">Đã ghi nhận! Chúng tôi sẽ phản hồi sớm (demo local).</p>}
        </form>
      </div>
    </div>
  );
}
