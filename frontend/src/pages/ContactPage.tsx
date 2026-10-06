import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 font-serif italic mb-4">Lien he</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Mail size={16} className="text-indigo-600" /> Thong tin lien he
          </div>
          <p>Phong dao tao — He thong luyen thi EduQuest (ban chay local).</p>
          <p className="mt-2">Email: <b className="text-slate-800">hotro@eduquest.local</b></p>
          <p>Dien thoai: <b className="text-slate-800">0123 456 789</b></p>
          <p className="mt-2 text-xs text-slate-400">
            Gap cau hoi sai? Hay dung nut “Bao loi” ngay duoi moi cau hoi khi luyen thi —
            bao cao se chuyen thang cho quan tri vien.
          </p>
        </div>
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-3"
          onSubmit={(e) => { e.preventDefault(); if (name.trim() && msg.trim()) setSent(true); }}
        >
          <h2 className="font-bold text-slate-800 text-sm">Gui loi nhan</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ho ten cua ban"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
          />
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Noi dung can ho tro..."
            rows={4}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 resize-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 cursor-pointer"
          >
            <Send size={15} /> Gui
          </button>
          {sent && <p className="text-xs text-green-600 font-semibold">Da ghi nhan! Chung toi se phan hoi som (demo local).</p>}
        </form>
      </div>
    </div>
  );
}
