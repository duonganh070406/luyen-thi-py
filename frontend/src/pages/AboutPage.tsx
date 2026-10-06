import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 font-serif italic mb-4">Gioi thieu</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 leading-relaxed flex flex-col gap-3">
        <p>
          <b className="text-slate-800">EduQuest</b> la he thong luyen thi trac nghiem chay local (khong can may chu
          phuc tap), gom 2 che do ro rang:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li><b className="text-slate-800">Luyen thi:</b> khong can dang nhap. Nguoi dung chon mon, chu de (co the hon hop nhieu chu de), do kho, so luong cau. He thong tron de theo ty le do kho, dao thu tu dap an.</li>
          <li><b className="text-slate-800">Thi that (phong thi online):</b> thi sinh chi can nhap <b>ten + ma phong</b>. Bai lam duoc tu dong luu tung cau, tu dong thu bai khi het gio hoac vi pham chuyen tab qua gioi han.</li>
          <li><b className="text-slate-800">Quan tri vien:</b> dang nhap bang tai khoan, import de Excel/CSV, tao va giam sat phong thi truc tiep, dong bai thi, sua bang xep hang, xuat bao cao CSV.</li>
        </ul>
        <p>
          Moi cau hoi trong ngan hang de gom: <b className="text-slate-800">cau hoi, phuong an A-E, dap an, do kho (De / Trung binh / Kho), chu de, giai thich</b>.
          Khi chon 1 muc do kho, he thong van pha tron theo ty le de dam bao do kho dong deu giua cac luot (vi du chon De: 50% De – 30% Trung binh – 20% Kho).
        </p>
        <p>
          Tien ich kem theo: bao loi cau hoi sai, bieu do nang luc theo chu de, cau sai gan day, goi y do kho tu dong
          (rule-based tren ty le sai lich su — kien truc mo, co the thay bang model ML that sau nay).
        </p>
        <div>
          <button
            type="button"
            onClick={() => navigate('/luyen-thi')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 cursor-pointer"
          >
            Thu luyen thi ngay
          </button>
        </div>
      </div>
    </div>
  );
}
