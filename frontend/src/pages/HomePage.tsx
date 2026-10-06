import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, BarChart3, Upload, Timer, Users } from 'lucide-react';

const FEATURES = [
  { icon: <BookOpen size={20} />, title: 'Luyen thi khong can dang nhap', desc: 'Chon chu de hon hop, do kho, so luong cau — de tu tron cau hoi va dao dap an.' },
  { icon: <Timer size={20} />, title: 'Phong thi online', desc: 'Vao thi chi can nhap ten + ma phong. Tu dong luu tung cau, tu dong thu bai khi het gio.' },
  { icon: <ShieldCheck size={20} />, title: 'Chong gian lan', desc: 'Phat hien chuyen tab, dem so lan vi pham, vuot gioi han se tu dong thu bai.' },
  { icon: <BarChart3 size={20} />, title: 'Bieu do nang luc', desc: 'Thong ke chu de nao sai nhieu / sai it, cau sai gan day, goi y do kho bang ML.' },
  { icon: <Upload size={20} />, title: 'Import Excel / CSV', desc: 'Quan tri vien nap ngan hang de theo mau: Cau hoi, A-E, Dap an, Do kho, Chu de, Giai thich.' },
  { icon: <Users size={20} />, title: 'Giam sat + Bao cao', desc: 'Dashboard theo doi thi sinh truc tiep, bang xep hang sua duoc, xuat bao cao CSV.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 mb-4">
          He thong luyen thi trac nghiem · chay local
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif italic mb-3">
          On luyen chu dong, thi that tu tin
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mb-6">
          Ngan hang de co chu de va do kho, tron de thong minh theo ty le (De: 50-30-20),
          phong thi online co giam sat chong gian lan va bao cao day du cho quan tri vien.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/luyen-thi')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 cursor-pointer"
          >
            Bat dau luyen thi
          </button>
          <button
            type="button"
            onClick={() => navigate('/phong-thi')}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Vao phong thi (nhap ma)
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tai khoan quan tri mac dinh: <b>admin</b> / <b>admin123</b> — doi mat khau sau khi dang nhap.
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
          <h2 className="font-bold text-lg mb-1">Danh cho quan tri vien</h2>
          <p className="text-sm text-slate-300">
            Import de Excel/CSV, tao phong thi, giam sat truc tiep, sua bang xep hang va xuat bao cao.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dang-nhap')}
          className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 cursor-pointer"
        >
          Dang nhap quan tri
        </button>
      </div>
    </div>
  );
}
