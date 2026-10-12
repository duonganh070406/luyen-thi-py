import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Plus, Trash2, Monitor, Lock, Download, Pencil, Sparkles, Flag, Building2 } from 'lucide-react';
import { DIFF_LABEL } from '../components/CompetencyChart.tsx';
import {
  currentUser, listSubjects, getBank,
  updateBankQuestion, previewImportFile, replaceBank, createRoom, listRooms, closeRoom,
  getMonitor, getLeaderboard, editScore, listReports, updateReport,
  suggestDifficulty, getBankTopics, exportRoomCsv, getUnits, addUnit, deleteUnit,
  getContact, updateContact,
} from '../services/api.ts';

const TABS = [
  { id: 'bank', label: 'Ngân hàng đề + Import' },
  { id: 'rooms', label: 'Phòng thi + Giám sát' },
  { id: 'units', label: 'Quản lý đơn vị' },
  { id: 'reports', label: 'Báo lỗi' },
  { id: 'ml', label: 'ML độ khó' },
  { id: 'contact', label: 'Liên hệ' },
];

const TAB_IDS = TABS.map((t) => t.id);

export default function AdminPage() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const tab = TAB_IDS.includes(tabParam ?? '') ? tabParam! : 'bank';
  const setTab = (id: string) => navigate(`/admin/${id}`);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState('');

  const reloadSubjects = useCallback(() => {
    listSubjects(true).then((s) => {
      const list = Array.isArray(s) ? s : [];
      setSubjects(list.map((x) => ({ id: x.id, name: x.name })));
      setSubject((cur) => (cur && list.some((x) => x.id === cur)) ? cur : (list.length > 0 ? list[0].id : ''));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const u = currentUser();
    if (!u || u.role !== 'admin') {
      navigate('/dang-nhap');
      return;
    }
    reloadSubjects();
  }, [navigate, reloadSubjects]);

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
          Bộ câu hỏi:
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs outline-none">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      {tab === 'bank' && <BankTab subjects={subjects} onChanged={(id) => { reloadSubjects(); if (id) setSubject(id); }} />}
      {tab === 'rooms' && <RoomsTab subjects={subjects} />}
      {tab === 'units' && <UnitsTab />}
      {tab === 'reports' && subject && <ReportsTab key={`rp-${subject}`} subject={subject} />}
      {tab === 'ml' && subject && <MlTab key={`ml-${subject}`} subject={subject} />}
      {tab === 'contact' && <ContactTab />}
    </div>
  );
}

/* ---------------- Ngan hang de + Import (list bo de -> preview -> luu) ---------------- */

interface StagedQ {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
  topic: string;
  explanation: string;
}

const EMPTY_QFORM = { question: '', A: '', B: '', C: '', D: '', E: '', answer: 'A', difficulty: 'Trung binh', topic: 'Chung', explanation: '' };

function toStaged(q: any, fallbackId: string): StagedQ {
  const opts = Array.isArray(q?.options) ? q.options.map((o: any) => String(o ?? '')) : [];
  const first = String(q?.answer ?? 'A').toUpperCase()[0] ?? 'A';
  return {
    id: String(q?.id ?? fallbackId),
    question: String(q?.question ?? ''),
    options: opts,
    answer: 'ABCDE'.includes(first) ? first : 'A',
    difficulty: String(q?.difficulty ?? 'Trung binh'),
    topic: String(q?.topic ?? 'Chung'),
    explanation: String(q?.explanation ?? ''),
  };
}

function formToStaged(id: string, f: typeof EMPTY_QFORM): StagedQ {
  const opts = [f.A, f.B, f.C, f.D, f.E].map((o) => o.trim()).filter(Boolean);
  let ans = (f.answer || 'A').toUpperCase();
  if (!'ABCDE'.slice(0, Math.max(2, opts.length)).includes(ans)) ans = 'A';
  return { id, question: f.question.trim(), options: opts, answer: ans, difficulty: f.difficulty, topic: f.topic.trim() || 'Chung', explanation: f.explanation };
}

function stagedToForm(q: StagedQ): typeof EMPTY_QFORM {
  const o = [...q.options, '', '', '', '', ''].slice(0, 5);
  return { question: q.question, A: o[0], B: o[1], C: o[2], D: o[3], E: o[4], answer: q.answer, difficulty: q.difficulty, topic: q.topic, explanation: q.explanation };
}

function BankTab({ subjects, onChanged }: { subjects: { id: string; name: string }[]; onChanged: (newId?: string) => void }) {
  const [bankId, setBankId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [pv, setPv] = useState<{ file: string; name: string; items: StagedQ[]; errors: string[] } | null>(null);
  const [items, setItems] = useState<StagedQ[]>([]);
  const [dirty, setDirty] = useState(false);
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_QFORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_QFORM });

  // dem so cau moi bo de (chi hien ten + so luong)
  useEffect(() => {
    let stop = false;
    (async () => {
      const entries = await Promise.all(
        subjects.map(async (s) => {
          try {
            const r = await getBank(s.id);
            return [s.id, r.total ?? (r.items || []).length] as const;
          } catch {
            return [s.id, 0] as const;
          }
        })
      );
      if (!stop) setCounts(Object.fromEntries(entries));
    })();
    return () => { stop = true; };
  }, [subjects]);

  const loadBank = useCallback(async (id: string) => {
    setBusy(true);
    try {
      const r = await getBank(id);
      setItems((r.items || []).map((q: any, i: number) => toStaged(q, `q_${i}`)));
      setDirty(false);
      setFilter('');
      setEditingId(null);
      setShowAdd(false);
      setForm({ ...EMPTY_QFORM });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const openBank = (id: string) => {
    setBankId(id);
    setPv(null);
    setMsg('');
    void loadBank(id);
  };

  // import: chon file -> chi xem truoc, ten bo de mac dinh = ten file
  const doPreview = async (f: File | undefined) => {
    if (!f) return;
    setMsg('');
    setBusy(true);
    try {
      const r = await previewImportFile(f);
      if (!r.items || r.items.length === 0) {
        setMsg('Không đọc được câu hỏi nào. ' + (r.errors || []).slice(0, 3).join(' | '));
        return;
      }
      setPv({
        file: r.filename,
        name: (r.suggested || '').trim(),
        items: r.items.map((q: any, i: number) => toStaged(q, `pv_${Date.now()}_${i}`)),
        errors: r.errors || [],
      });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  // Luu bo de sau preview -> moi ghi vao database
  const doSavePreview = async () => {
    if (!pv || pv.items.length === 0) return;
    const name = pv.name.trim();
    if (!name) { setMsg('Cần đặt tên bộ câu hỏi.'); return; }
    setBusy(true);
    try {
      const r = await replaceBank(name, pv.items);
      setPv(null);
      onChanged(name);
      setBankId(name);
      setMsg(`Đã lưu bộ "${name}" với ${r.saved} câu.` + (r.errors?.length ? ` Lưu ý: ${r.errors.slice(0, 2).join(' | ')}` : ''));
      await loadBank(name);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  // chi tiet: them/sua/xoa tren ban nhap, bam Luu moi ghi xuong server
  const doAddStaged = () => {
    const opts = [form.A, form.B, form.C, form.D, form.E].filter((o) => o.trim());
    if (!form.question.trim() || opts.length < 2) { setMsg('Cần nội dung + ít nhất 2 phương án.'); return; }
    setItems((list) => [...list, formToStaged(`new_${Date.now()}_${list.length}`, form)]);
    setForm({ ...EMPTY_QFORM });
    setShowAdd(false);
    setDirty(true);
  };

  const doSaveEdit = () => {
    if (!editingId) return;
    const opts = [editForm.A, editForm.B, editForm.C, editForm.D, editForm.E].filter((o) => o.trim());
    if (!editForm.question.trim() || opts.length < 2) { setMsg('Cần nội dung + ít nhất 2 phương án.'); return; }
    setItems((list) => list.map((q) => (q.id === editingId ? formToStaged(q.id, editForm) : q)));
    setEditingId(null);
    setDirty(true);
  };

  const doDeleteStaged = (id: string) => {
    if (!confirm('Xóa câu này khỏi bản nháp? (chỉ xóa thật khi bạn bấm Lưu thay đổi)')) return;
    setItems((list) => list.filter((q) => q.id !== id));
    setDirty(true);
  };

  const doSaveBank = async () => {
    if (!bankId) return;
    setBusy(true);
    try {
      const r = await replaceBank(bankId, items);
      await loadBank(bankId);
      onChanged();
      setMsg(`Đã lưu ${r.saved} câu vào bộ "${bankId}".` + (r.errors?.length ? ` Lưu ý: ${r.errors.slice(0, 2).join(' | ')}` : ''));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const shown = items.filter((q) =>
    !filter.trim() ||
    q.question.toLowerCase().includes(filter.toLowerCase()) ||
    (q.topic || '').toLowerCase().includes(filter.toLowerCase())
  );

  /* ---------- Man hinh xem truoc file import ---------- */
  if (pv) {
    return (
      <div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 mb-4">
          <h2 className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-1"><Upload size={15} /> Xem trước file {pv.file} — chưa lưu</h2>
          <p className="text-xs text-amber-800/80 mb-3">
            Tên bộ câu hỏi lấy theo <b>tên file</b>. Đọc được <b>{pv.items.length}</b> câu. Bấm <b>Lưu bộ đề</b> mới ghi vào database.
          </p>
          <label className="block text-xs font-bold text-amber-900 mb-1">Tên bộ câu hỏi</label>
          <input
            value={pv.name} onChange={(e) => setPv({ ...pv, name: e.target.value })}
            placeholder="Tên bộ câu hỏi"
            className="w-full sm:w-96 rounded-xl border border-amber-200 px-3 py-2 text-sm outline-none bg-white focus:border-amber-400"
          />
        </div>

        {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}
        {pv.errors.length > 0 && (
          <p className="text-xs text-amber-700 bg-white border border-amber-200 rounded-xl px-3 py-2 mb-3">
            Lưu ý: {pv.errors.slice(0, 4).join(' | ')}
          </p>
        )}

        <div className="flex flex-col gap-2 max-h-[420px] overflow-auto mb-3">
          {pv.items.slice(0, 200).map((q, i) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs">
              <div className="font-semibold text-slate-800">Câu {i + 1}: {q.question}</div>
              <div className="text-slate-500 mt-1">
                {q.options.map((o, oi) => (
                  <span key={oi} className={q.answer === 'ABCDE'[oi] ? 'font-bold text-green-600' : ''}>
                    {'ABCDE'[oi]}.{o}{oi < q.options.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
              <div className="mt-1"><span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">{q.topic}</span></div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={doSavePreview} disabled={busy || !pv.name.trim()} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer hover:bg-indigo-700 disabled:opacity-50">
            {busy ? 'Đang lưu...' : `Lưu bộ đề (${pv.items.length} câu)`}
          </button>
          <button type="button" onClick={() => setPv(null)} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold cursor-pointer hover:bg-slate-50">
            Hủy bỏ
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Man hinh chi tiet 1 bo de ---------- */
  if (bankId) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button type="button" onClick={() => { setBankId(null); setDirty(false); setMsg(''); }} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50">
            ← Danh sách bộ đề
          </button>
          <h2 className="font-bold text-sm text-slate-800 flex-1">Bộ "{bankId}" · {items.length} câu{dirty ? ' · (chưa lưu)' : ''}</h2>
          <button type="button" onClick={() => void loadBank(bankId)} disabled={!dirty || busy} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 disabled:opacity-40">
            Hủy thay đổi
          </button>
          <button type="button" onClick={doSaveBank} disabled={!dirty || busy} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 disabled:opacity-40">
            {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

        <div className="flex items-center gap-2 mb-3">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Tìm câu hỏi / chủ đề..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          <button type="button" onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer">
            <Plus size={14} /> Thêm câu
          </button>
        </div>

        {showAdd && (
          <QuestionForm
            form={form} setForm={setForm}
            onSave={doAddStaged} saveLabel="Thêm vào bản nháp"
            onCancel={() => setShowAdd(false)}
          />
        )}

        <div className="flex flex-col gap-2 max-h-[480px] overflow-auto">
          {shown.slice(0, 200).map((q) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs">
              {editingId === q.id ? (
                <QuestionForm
                  form={editForm} setForm={setEditForm}
                  onSave={doSaveEdit} saveLabel="Cập nhật bản nháp"
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{q.question}</div>
                    <div className="text-slate-500 mt-1">
                      {q.options.map((o, i) => (
                        <span key={i} className={q.answer === 'ABCDE'[i] ? 'font-bold text-green-600' : ''}>
                          {'ABCDE'[i]}.{o}{i < q.options.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">{q.topic}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{DIFF_LABEL[q.difficulty] ?? q.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => { setEditingId(q.id); setEditForm(stagedToForm(q)); }}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer" title="Sửa">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => doDeleteStaged(q.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Xóa">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {shown.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có câu hỏi nào. Hãy thêm câu mới.</p>}
          {shown.length > 200 && <p className="text-[11px] text-slate-400 text-center">Hiển thị 200/{shown.length} câu — hãy dùng ô tìm kiếm.</p>}
        </div>
      </div>
    );
  }

  /* ---------- Man hinh danh sach bo de ---------- */
  return (
    <div>
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 mb-4">
        <h2 className="flex items-center gap-2 font-bold text-sm text-indigo-900 mb-1"><Upload size={15} /> Import file Excel / CSV</h2>
        <p className="text-xs text-indigo-800/80 mb-3">
          Header: <b>Câu hỏi | A | B | C | D | E | Đáp án | Độ khó | Chủ đề | Giải thích</b> ·
          Tên bộ đề tự lấy theo <b>tên file</b> · Chỉ lưu vào database khi bạn bấm <b>Lưu bộ đề</b>.
        </p>
        <label className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700">
          {busy ? 'Đang đọc file...' : 'Chọn file .xlsx / .csv'}
          <input type="file" accept=".xlsx,.xlsm,.csv" className="hidden" onChange={(e) => { void doPreview(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-sm text-slate-800 mb-2">Các bộ câu hỏi ({subjects.length})</h2>
        <div className="flex flex-col gap-2 max-h-96 overflow-auto">
          {subjects.map((s) => (
            <button
              key={s.id} type="button" onClick={() => openBank(s.id)}
              className="rounded-xl border border-slate-100 px-4 py-3 text-xs flex items-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer text-left transition-colors"
            >
              <span className="font-bold text-slate-800 flex-1 text-sm">{s.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{counts[s.id] ?? '…'} câu</span>
              <span className="text-indigo-600 font-bold">Mở →</span>
            </button>
          ))}
          {subjects.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có bộ câu hỏi nào. Hãy import file ở trên.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Form them/sua cau hoi (dung chung) ---------------- */

function QuestionForm({ form, setForm, onSave, saveLabel, onCancel }: {
  form: typeof EMPTY_QFORM;
  setForm: (f: typeof EMPTY_QFORM) => void;
  onSave: () => void;
  saveLabel: string;
  onCancel: () => void;
}) {
  return (
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
      <div className="sm:col-span-2 flex gap-2">
        <button type="button" onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer">{saveLabel}</button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold cursor-pointer">Hủy</button>
      </div>
    </div>
  );
}

/* ---------------- Quan ly don vi (Phong ban/Khoa) ---------------- */

function UnitsTab() {
  const [units, setUnits] = useState<any[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [msg, setMsg] = useState('');

  const reload = () => {
    getUnits().then((r) => setUnits(r.units || [])).catch((e) => setMsg(String(e)));
  };
  useEffect(() => { reload(); }, []);

  const doAdd = async () => {
    if (!newUnit.trim()) return;
    try {
      await addUnit(newUnit.trim());
      setNewUnit('');
      setMsg('Đã thêm đơn vị.');
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const doDelete = async (name: string) => {
    if (!confirm('Xóa đơn vị này?')) return;
    try {
      await deleteUnit(name);
      setMsg('Đã xóa đơn vị.');
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
        <h2 className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2"><Building2 size={15} /> Thêm đơn vị mới</h2>
        <div className="flex gap-2">
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="Tên đơn vị (vd: Khoa Công nghệ)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button type="button" onClick={doAdd} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700">
            Thêm
          </button>
        </div>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-sm text-slate-800 mb-2">Danh sách đơn vị ({units.length})</h2>
        <div className="flex flex-col gap-2 max-h-96 overflow-auto">
          {units.map((u) => (
            <div key={u.name} className="rounded-xl border border-slate-100 px-3 py-2.5 text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-800">{u.name}</span>
              <button
                type="button" onClick={() => doDelete(u.name)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                title="Xóa"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {units.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có đơn vị nào.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Thong tin lien he (hien o trang Lien he) ---------------- */

function ContactTab() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getContact().then((c) => { setEmail(c.email); setPhone(c.phone); }).catch((e) => setMsg(String(e)));
  }, []);

  const doSave = async () => {
    if (!email.trim() || !phone.trim()) { setMsg('Cần nhập cả email và điện thoại.'); return; }
    setBusy(true);
    try {
      const r = await updateContact({ email: email.trim(), phone: phone.trim() });
      setEmail(r.email);
      setPhone(r.phone);
      setMsg('Đã lưu thông tin liên hệ.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 max-w-xl">
      <h2 className="font-bold text-sm text-slate-800 mb-1">Thông tin liên hệ</h2>
      <p className="text-[11px] text-slate-500 mb-3">Hiển thị ở trang Liên hệ cho mọi người xem.</p>
      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}
      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
      <input
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vd: hotro@a05.gov.vn"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 mb-3"
      />
      <label className="block text-xs font-bold text-slate-700 mb-1">Điện thoại</label>
      <input
        value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="vd: 0123 456 789"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 mb-4"
      />
      <button type="button" onClick={doSave} disabled={busy} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer hover:bg-indigo-700 disabled:opacity-50">
        {busy ? 'Đang lưu...' : 'Lưu liên hệ'}
      </button>
    </div>
  );
}

/* ---------------- Phong thi + Giam sat ---------------- */

function RoomsTab({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', subject: '', unit: '', topics: '', difficulty: 'Hon hop', count: 10, time_limit: 30, max_violations: 3, shuffle_questions: true, shuffle_options: true });
  const [monitorId, setMonitorId] = useState('');
  const [monitor, setMonitor] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [editScores, setEditScores] = useState<Record<string, number>>({});

  const reload = () => listRooms().then((r) => setRooms(r.rooms || [])).catch((e) => setMsg(String(e)));
  const reloadUnits = () => getUnits().then((r) => setUnits(r.units || [])).catch(() => setUnits([]));

  useEffect(() => {
    reload();
    reloadUnits();
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
      if (!form.subject) { setMsg('Cần chọn bộ câu hỏi.'); return; }
      const selectedUnit = units.find((u) => (typeof u === 'string' ? u : u?.name) === form.unit);
      const r = await createRoom({
        name: form.name.trim() || 'Phòng thi',
        subject: form.subject,
        unit: selectedUnit?.name || '',
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
        <h2 className="font-bold text-sm text-slate-800 mb-3">Tạo phòng thi online</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên phòng</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="vd: Thi giữa kỳ"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bộ câu hỏi</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400">
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400">
              <option value="">-- Chọn đơn vị --</option>
              {units.map((u: any, idx: number) => {
                const label = typeof u === 'string' ? u : (u?.name ?? '');
                return <option key={label || idx} value={label}>{label}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề</label>
            <input value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} placeholder="cách nhau dấu phẩy, trống = hỗn hợp"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Độ khó</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400">
              {['Hon hop', 'De', 'Trung binh', 'Kho'].map((d) => <option key={d} value={d}>{DIFF_LABEL[d] ?? d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số câu</label>
            <input type="number" min={1} max={200} value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (phút)</label>
            <input type="number" min={1} max={300} value={form.time_limit} onChange={(e) => setForm({ ...form, time_limit: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giới hạn chuyển tab</label>
            <input type="number" min={1} max={20} value={form.max_violations} onChange={(e) => setForm({ ...form, max_violations: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.shuffle_questions} onChange={(e) => setForm({ ...form, shuffle_questions: e.target.checked })} className="accent-indigo-600" /> Trộn đề</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.shuffle_options} onChange={(e) => setForm({ ...form, shuffle_options: e.target.checked })} className="accent-indigo-600" /> Đảo đáp án</label>
          <div className="flex-1" />
          <button type="button" onClick={doCreate} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700">Tạo phòng</button>
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
                <div className="text-slate-500 mt-1">{r.subject} · {r.unit ? r.unit : ''} · {r.count} câu · {r.time_limit} phút · {DIFF_LABEL[r.difficulty] ?? r.difficulty}</div>
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
            {monitor ? `Giám sát trực tiếp: ${monitor.room?.name} (${monitor.room?.code}) — ${monitor.total} người tham gia` : 'Chọn phòng để giám sát (tự làm mới 3s)'}
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
