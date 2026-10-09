import { Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs text-center">
        <h1 className="text-base font-bold text-slate-900 tracking-wider mb-1">
          THÔNG TIN LIÊN HỆ
        </h1>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Phòng Đào tạo — Hệ thống luyện thi A05<br />
          <span className="text-slate-500">(bản chạy local)</span>
        </p>

        <div className="flex flex-col items-center gap-3 text-xs text-slate-800">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#8B0000]" />
            <span>Email: <b className="font-semibold text-slate-900">hotro@a05.gov.vn</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-[#8B0000]" />
            <span>Điện thoại: <b className="font-semibold text-slate-900">0123 456 789</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
