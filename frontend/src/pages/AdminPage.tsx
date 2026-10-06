import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, Monitor, Lock, Download, Pencil, Sparkles, Flag } from 'lucide-react';
import { DIFF_LABEL } from '../components/CompetencyChart.tsx';
import {
  currentUser, listSubjects, getBank, addBankQuestion, deleteBankQuestion,
  updateBankQuestion, importBankFile, createRoom, listRooms, closeRoom,
  getMonitor, getLeaderboard, editScore, listReports, updateReport,
  suggestDifficulty, getBankTopics, exportRoomCsv,
} from '../services/api.ts';

const TABS = [
  { id: 'bank', label: 'Ngân hàng đề + Import' },
  { id: 'rooms', label: 'Phòng thi + Giám sát' },
  { id: 'reports', label: 'Báo lỗi' },
  { id: 'ml', label: 'ML độ khó' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('bank');
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const u = currentUser();
    if (!u || u.role !== 'admin') {
      navigate('/dang-nhap');
      return;
    }
    listSubjects(true).then((s) => {
      setSubjects(s.map((x) => ({ id: x.id, name: x.name })));
      if (s.length > 0) setSubject(s[0].id);
    }).catch(() => {});
  }, [navigate]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 font-serif italic">Quản trị viên</h1>
      <p className="text-xs text-slate-500 mt-1 mb-4">Import đề Excel/CSV · Tạo phòng thi · Giám sát trực tiếp · Bảng xếp hạng · Báo cáo.</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${tab === t.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          Môn:
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs outline-none">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      {tab === 'bank' && subject && <BankTab key={`bank-${subject}`} subject={subject} />}
      {tab === 'rooms' && <RoomsTab subjects={subjects} />}
      {tab === 'reports' && subject && <ReportsTab key={`rp-${subject}`} subject={subject} />}
      {tab === 'ml' && subject && <MlTab key={`ml-${subject}`} subject={subject} />}
    </div>
  );
}

/* ---------------- Ngan hang de + Import ---------------- */

function BankTab({ subject }: { subject: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ question: '', A: '', B: '', C: '', D: '', E: '', answer: 'A', difficulty: 'Trung binh', topic: 'Chung', explanation: '' });
  const [newSubject, setNewSubject] = useState('');

  const reload = () => {
    getBank(subject).then((r) => { setItems(r.items || []); setCounts(r.counts); }).catch((e) => setMsg(String(e)));
  };
  useEffect(() => { reload(); }, [subject]);

  const doImport = async (f: File | undefined) => {
    if (!f) return;
    setMsg('Đang import...');
    try {
      const target = newSubject.trim() || subject;
      const r = await importBankFile(target, f);
      setMsg(`Đã import +${r.added} câu (tổng ${r.total}).` + (r.errors?.length ? ` Cảnh báo: ${r.errors.slice(0, 2).join(' | ')}` : ''));
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const doAdd = async () => {
    try {
      const options = [form.A, form.B, form.C, form.D, form.E].filter((o) => o.trim());
      if (!form.question.trim() || options.length < 2) { setMsg('Cần nội dung + ít nhất 2 phương án.'); return; }
      await addBankQuestion(subject, { question: form.question.trim(), options, answer: form.answer, difficulty: form.difficulty, topic: form.topic.trim() || 'Chung', explanation: form.explanation });
      setShowAdd(false);
      setForm({ question: '', A: '', B: '', C: '', D: '', E: '', answer: 'A', difficulty: 'Trung binh', topic: 'Chung', explanation: '' });
      setMsg('Đã thêm câu hỏi.');
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const shown = items.filter((q) =>
    !filter.trim() ||
    String(q.question).toLowerCase().includes(filter.toLowerCase()) ||
    String(q.topic || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 mb-4">
        <h2 className="flex items-center gap-2 font-bold text-sm text-indigo-900 mb-1"><Upload size={15} /> Import file Excel / CSV (mẫu như image.png)</h2>
        <p className="text-xs text-indigo-800/80 mb-3">
          Header: <b>Câu hỏi | A | B | C | D | E | Đáp án | Độ khó | Chủ đề | Giải thích</b> ·
          Đáp án = chữ cái (A-E) · Độ khó = Dễ / Trung bình / Khó · Cột E có thể để trống.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder={`Môn mới? gõ tên để tạo (trống = ${subject})`}
            className="rounded-xl border border-indigo-200 px-3 py-2 text-xs w-64 outline-none bg-white"
          />
          <label className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700">
            Chọn file .xlsx / .csv
            <input type="file" accept=".xlsx,.xlsm,.csv" className="hidden" onChange={(e) => doImport(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}
      {counts && (
        <p className="text-xs text-slate-500 mb-3">
          Tổng <b>{counts.total}</b> câu · Dễ <b>{counts.byDifficulty?.De ?? 0}</b> · Trung bình <b>{counts.byDifficulty?.['Trung binh'] ?? 0}</b> · Khó <b>{counts.byDifficulty?.Kho ?? 0}</b>
        </p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Tìm câu hỏi / chủ đề..."
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
        <button type="button" onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">
          <Plus size={14} /> Thêm tay
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-3 grid sm:grid-cols-2 gap-2">
          <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Nội dung câu hỏi" rows={2}
            className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          {(['A', 'B', 'C', 'D', 'E'] as const).map((k) => (
            <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={`Phương án ${k}${k === 'E' ? ' (có thể trống)' : ''}`}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          ))}
          <select value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {['A', 'B', 'C', 'D', 'E'].map((a) => <option key={a} value={a}>Đáp án {a}</option>)}
          </select>
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {['De', 'Trung binh', 'Kho'].map((d) => <option key={d} value={d}>{DIFF_LABEL[d] ?? d}</option>)}
          </select>
          <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Chủ đề (vd: Pháp luật)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <input value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Giải thích"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <button type="button" onClick={doAdd} className="sm:col-span-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer">Lưu câu hỏi</button>
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-[480px] overflow-auto">
        {shown.slice(0, 200).map((q) => (
          <div key={q.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{q.question}</div>
                <div className="text-slate-500 mt-1">
                  {(q.options || []).map((o: string, i: number) => (
                    <span key={i} className={q.answer === 'ABCDE'[i] ? 'font-bold text-green-600' : ''}>
                      {'ABCDE'[i]}.{o}{i < q.options.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">{q.topic}</span>
                  <DifficultyEdit subject={subject} q={q} onDone={reload} />
                </div>
              </div>
              <button type="button" onClick={async () => { if (confirm('Xóa câu này?')) { await deleteBankQuestion(subject, q.id); reload(); } }}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Xóa">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có câu hỏi. Hãy import file Excel/CSV.</p>}
        {shown.length > 200 && <p className="text-[11px] text-slate-400 text-center">Hiển thị 200/{shown.length} câu — hãy dùng ô tìm kiếm.</p>}
      </div>
    </div>
  );
}

function DifficultyEdit({ subject, q, onDone }: { subject: string; q: any; onDone: () => void }) {
  const [v, setV] = useState(q.difficulty || 'Trung binh');
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-slate-400">Độ khó:</span>
      <select
        value={v}
        onChange={async (e) => {
          setV(e.target.value);
          try { await updateBankQuestion(subject, q.id, { difficulty: e.target.value }); onDone(); } catch { /* ignore */ }
        }}
        className="rounded-lg border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold outline-none"
      >
        {['De', 'Trung binh', 'Kho'].map((d) => <option key={d} value={d}>{DIFF_LABEL[d] ?? d}</option>)}
      </select>
    </span>
  );
}

/* ---------------- Phong thi + Giam sat ---------------- */

function RoomsTab({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', subject: '', topics: '', difficulty: 'Hon hop', count: 10, time_limit: 30, max_violations: 3, shuffle_questions: true, shuffle_options: true });
  const [monitorId, setMonitorId] = useState('');
  const [monitor, setMonitor] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [editScores, setEditScores] = useState<Record<string, number>>({});

  const reload = () => listRooms().then((r) => setRooms(r.rooms || [])).catch((e) => setMsg(String(e)));
  useEffect(() => {
    reload();
    if (subjects.length > 0 && !form.subject) setForm((f) => ({ ...f, subject: subjects[0].id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects]);

  // poll giám sát liên tục
  useEffect(() => {
    if (!monitorId) { setMonitor(null); return; }
    let stop = false;
    const tick = async () => {
      try {
        const m = await getMonitor(monitorId);
        if (!stop) {
          setMonitor(m);
          const lb = await getLeaderboard(monitorId).catch(() => null);
          if (!stop && lb) setRanking(lb.ranking || []);
        }
      } catch { /* ignore */ }
      if (!stop) setTimeout(tick, 3000);
    };
    tick();
    return () => { stop = true; };
  }, [monitorId]);

  const doCreate = async () => {
    try {
      if (!form.subject) { setMsg('Cần chọn môn.'); return; }
      const r = await createRoom({
        name: form.name.trim() || 'Phòng thi',
        subject: form.subject,
        topics: form.topics.split(',').map((s) => s.trim()).filter(Boolean),
        difficulty: form.difficulty,
        count: Number(form.count) || 10,
        time_limit: Number(form.time_limit) || 30,
        shuffle_questions: form.shuffle_questions,
        shuffle_options: form.shuffle_options,
        max_violations: Number(form.max_violations) || 3,
      });
      setMsg(`Đã tạo phòng "${r.room.name}" — mã: ${r.room.code}`);
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const doExport = (roomId: string) => {
    exportRoomCsv(roomId);
  };

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
        <h2 className="font-bold text-sm text-slate-800 mb-2">Tạo phòng thi online</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên phòng (vd: Thi giữa kỳ)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} placeholder="Chủ đề (cách nhau dấu phẩy, trống = hỗn hợp)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {['Hon hop', 'De', 'Trung binh', 'Kho'].map((d) => <option key={d} value={d}>{DIFF_LABEL[d] ?? d}</option>)}
          </select>
          <input type="number" min={1} max={200} value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })} placeholder="Số câu"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <input type="number" min={1} max={300} value={form.time_limit} onChange={(e) => setForm({ ...form, time_limit: Number(e.target.value) })} placeholder="Thời gian (phút)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.shuffle_questions} onChange={(e) => setForm({ ...form, shuffle_questions: e.target.checked })} className="accent-indigo-600" /> Trộn đề</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.shuffle_options} onChange={(e) => setForm({ ...form, shuffle_options: e.target.checked })} className="accent-indigo-600" /> Đảo đáp án</label>
          <label className="flex items-center gap-1.5">Giới hạn chuyển tab:
            <input type="number" min={1} max={20} value={form.max_violations} onChange={(e) => setForm({ ...form, max_violations: Number(e.target.value) })} className="w-14 rounded-lg border border-slate-200 px-2 py-1 outline-none" />
          </label>
          <button type="button" onClick={doCreate} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">Tạo phòng</button>
        </div>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-sm text-slate-800 mb-2">Danh sách phòng ({rooms.length})</h2>
          <div className="flex flex-col gap-2 max-h-96 overflow-auto">
            {rooms.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-100 px-3 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <b className="text-slate-800">{r.name}</b>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{r.code}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${r.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    {r.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                </div>
                <div className="text-slate-500 mt-1">{r.subject} · {r.count} câu · {r.time_limit} phút · {DIFF_LABEL[r.difficulty] ?? r.difficulty}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button type="button" onClick={() => setMonitorId(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold cursor-pointer">
                    <Monitor size={12} /> Giám sát
                  </button>
                  {r.status === 'open' && (
                    <button type="button" onClick={async () => { if (confirm(`Đóng phòng ${r.code}? Tất cả bài sẽ bị thu.`)) { await closeRoom(r.id); reload(); } }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer">
                      <Lock size={12} /> Đóng + thu bài
                    </button>
                  )}
                  <button type="button" onClick={() => doExport(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold cursor-pointer">
                    <Download size={12} /> Báo cáo CSV
                  </button>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <p className="text-xs text-slate-400">Chưa có phòng thi.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-sm text-slate-800 mb-2">
            {monitor ? `Giám sát trực tiếp: ${monitor.room?.name} (${monitor.room?.code}) — ${monitor.total} thí sinh` : 'Chọn phòng để giám sát (tự làm mới 3s)'}
          </h2>
          {monitor && (
            <>
              <div className="flex flex-col gap-1.5 max-h-56 overflow-auto mb-3">
                {monitor.participants?.map((p: any) => (
                  <div key={p.participant} className="text-xs rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 flex items-center gap-2">
                    <b className="flex-1 truncate">{p.participant}</b>
                    <span>{p.answered}/{p.total} câu</span>
                    <span>điểm hiện tại <b>{p.current_score}</b></span>
                    {p.violations > 0 && <span className="text-amber-600 font-bold">tab ×{p.violations}</span>}
                    <span className={p.submitted ? 'text-green-600 font-bold' : 'text-slate-400'}>{p.submitted ? 'Đã nộp' : 'Đang làm'}</span>
                  </div>
                ))}
              </div>
              <h3 className="font-bold text-xs text-slate-700 mb-1.5">Bảng xếp hạng (sửa được)</h3>
              <div className="flex flex-col gap-1.5 max-h-56 overflow-auto">
                {ranking.map((r: any, i: number) => (
                  <div key={r.participant} className="text-xs rounded-xl border border-slate-100 px-3 py-2 flex items-center gap-2">
                    <span className="font-bold text-slate-400 w-6">{i + 1}</span>
                    <b className="flex-1 truncate">{r.participant}</b>
                    <span>{r.score}/{r.total}</span>
                    <input
                      type="number" min={0} max={r.total}
                      value={editScores[r.participant] ?? r.score}
                      onChange={(e) => setEditScores((s) => ({ ...s, [r.participant]: Number(e.target.value) }))}
                      className="w-16 rounded-lg border border-slate-200 px-1.5 py-1 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => { await editScore(monitor.room.id, r.participant, editScores[r.participant] ?? r.score); const lb = await getLeaderboard(monitor.room.id).catch(() => null); if (lb) setRanking(lb.ranking || []); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold cursor-pointer"
                    >
                      <Pencil size={11} /> Sửa
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Bao loi ---------------- */

function ReportsTab({ subject }: { subject: string }) {
  const [items, setItems] = useState<any[]>([]);
  const reload = () => listReports(subject).then((r) => setItems(r.items || [])).catch(() => setItems([]));
  useEffect(() => { reload(); }, [subject]);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2"><Flag size={14} /> Báo lỗi từ người dùng ({items.length})</h2>
      <div className="flex flex-col gap-2">
        {items.map((r) => (
          <div key={r.id} className="text-xs rounded-xl border border-slate-100 px-3 py-2.5 flex items-start gap-2">
            <div className="flex-1">
              <div className="font-bold text-slate-700">Câu {r.question_id} · bởi {r.reporter}</div>
              <div className="text-slate-600 mt-0.5">{r.message}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full font-bold ${r.status === 'moi' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{r.status === 'moi' ? 'mới' : r.status}</span>
            {r.status === 'moi' && (
              <button type="button" onClick={async () => { await updateReport(subject, r.id, 'da_xu_ly'); reload(); }}
                className="px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-bold cursor-pointer">Đã xử lý</button>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-400">Chưa có báo lỗi nào.</p>}
      </div>
    </div>
  );
}

/* ---------------- ML do kho ---------------- */

function MlTab({ subject }: { subject: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [res, setRes] = useState<Record<string, any>>({});
  useEffect(() => {
    getBank(subject).then((r) => setItems((r.items || []).slice(0, 50))).catch(() => {});
    getBankTopics(subject).then((r) => setTopics(r.topics || [])).catch(() => {});
  }, [subject]);

  const check = async (q: any) => {
    try {
      const r = await suggestDifficulty(subject, q.id, q.question);
      setRes((s) => ({ ...s, [q.id]: r }));
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-1"><Sparkles size={14} /> ML tự động đánh giá độ khó (50 câu đầu)</h2>
      <p className="text-[11px] text-slate-500 mb-3">
        Phương pháp hiện tại: <b>tỉ lệ làm sai lịch sử + độ dài câu hỏi</b> (sai ≥60% → Khó, 30–60% → Trung bình, {'<'}30% → Dễ).
        Kiến trúc mở — có thể thay bằng model ML thật mà không đổi API. Chủ đề hiện có: {topics.join(', ') || 'chưa có'}.
      </p>
      <div className="flex flex-col gap-2 max-h-[480px] overflow-auto">
        {items.map((q) => {
          const r = res[q.id];
          return (
            <div key={q.id} className="text-xs rounded-xl border border-slate-100 px-3 py-2.5 flex items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold text-slate-700">{q.question}</div>
                <div className="text-slate-500 mt-1">Hiện tại: <b>{DIFF_LABEL[q.difficulty] ?? q.difficulty}</b>
                  {r && <> · ML gợi ý: <b className="text-indigo-600">{DIFF_LABEL[r.suggested] ?? r.suggested}</b> (sai {r.wrong_rate === null ? '?' : Math.round(r.wrong_rate * 100) + `%`}/{r.attempts} lượt, tin cậy {r.confidence})</>}
                </div>
              </div>
              <button type="button" onClick={() => check(q)} className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold cursor-pointer">Đánh giá</button>
              {r && r.suggested !== q.difficulty && (
                <button
                  type="button"
                  onClick={async () => { await updateBankQuestion(subject, q.id, { difficulty: r.suggested }); setItems((list) => list.map((x) => (x.id === q.id ? { ...x, difficulty: r.suggested } : x))); }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold cursor-pointer"
                >
                  Áp dụng
                </button>
              )}
            </div>
          );
        })}
        {items.length === 0 && <p className="text-xs text-slate-400">Chưa có câu hỏi.</p>}
      </div>
    </div>
  );
}
