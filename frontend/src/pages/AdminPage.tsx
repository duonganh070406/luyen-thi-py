import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Plus, Trash2, Monitor, Lock, Download, Pencil, Sparkles, Flag, Building2, KeyRound } from 'lucide-react';
import { DIFF_LABEL } from '../components/CompetencyChart.tsx';
import {
  currentUser, listSubjects, getBank,
  updateBankQuestion, previewImportFile, replaceBank, createRoom, listRooms, closeRoom,
  getMonitor, getFullLeaderboard, editScore, listReports, updateReport,
  suggestDifficulty, getBankTopics, exportRoomCsv, getUnits, addUnit, deleteUnit,
  getContact, updateContact, listUsers, adminCreateUser, adminResetPassword, adminDeleteUser,
  deleteBank,
} from '../services/api.ts';

const TABS = [
  { id: 'bank', label: 'Ngân hàng câu hỏi' },
  { id: 'rooms', label: 'Kỳ kiểm tra' },
  { id: 'reports', label: 'Phản ánh câu hỏi' },
  { id: 'units', label: 'Đơn vị' },
  { id: 'users', label: 'Tài khoản' },
  { id: 'ml', label: 'ML độ khó' },
  { id: 'contact', label: 'Liên hệ' },
];

const TAB_IDS = TABS.map((t) => t.id);

export default function AdminPage() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const tab = TAB_IDS.includes(tabParam ?? '') ? tabParam! : 'rooms';
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
      navigate('/dang-nhap', { state: { needAdmin: true } });
      return;
    }
    reloadSubjects();
  }, [navigate, reloadSubjects]);

  // Doi tab luon ve dau trang: HashRouter giu nguyen vi tri cuon cu
  // lam noi dung "nhay" doc khi tab moi ngan/dai hon tab cu.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-extrabold text-primary uppercase tracking-wide">Quản trị hệ thống</h1>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-1 mt-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`relative pb-2.5 pt-1 px-0.5 text-[13px] cursor-pointer transition-colors ${
              tab === t.id ? 'text-primary font-extrabold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            {t.label}
            <span className={`absolute left-0 right-0 -bottom-px h-[2.5px] rounded-t bg-primary transition-opacity ${tab === t.id ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        ))}
        <div className="flex-1" />
        {/* Luon render de hang tab giu chieu cao on dinh o moi tab (tranh nhay doc):
            chi an bang invisible thay vi go khoi DOM. */}
        <label className={`flex items-center gap-2 text-xs font-bold text-slate-600 pb-2 ${(tab === 'reports' || tab === 'ml') ? 'visible' : 'invisible'}`}>
          Bộ câu hỏi:
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none bg-white">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      {/* Vung noi dung cuon NOI BO voi chieu cao co dinh theo viewport:
          cua so trinh duyet khong bao gio phai hien scrollbar khi doi tab,
          nen be rong trang admin luon on dinh (rong nhu tab ML).
          340px ≈ SiteNav (~130) + tieu de/tab (~110) + padding + SiteFooter (~70). */}
      <div className="pt-4 h-[calc(100dvh-340px)] min-h-[420px] overflow-y-auto overscroll-contain pr-1">
      {tab === 'bank' && <BankTab subjects={subjects} onChanged={(id) => { reloadSubjects(); if (id) setSubject(id); }} />}
      {tab === 'rooms' && <RoomsTab subjects={subjects} />}
      {tab === 'units' && <UnitsTab />}
      {tab === 'reports' && subject && <ReportsTab key={`rp-${subject}`} subject={subject} />}
      {tab === 'ml' && subject && <MlTab key={`ml-${subject}`} subject={subject} />}
      {tab === 'contact' && <ContactTab />}
      {tab === 'users' && <UsersTab />}
      </div>
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
              <div className="mt-1"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{q.topic}</span></div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={doSavePreview} disabled={busy || !pv.name.trim()} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-primary-dark disabled:opacity-50">
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
          <h2 className="font-bold text-sm text-primary flex-1">Bộ "{bankId}" · {items.length} câu{dirty ? ' · (chưa lưu)' : ''}</h2>
          <button type="button" onClick={() => void loadBank(bankId)} disabled={!dirty || busy} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 disabled:opacity-40">
            Hủy thay đổi
          </button>
          <button type="button" onClick={doSaveBank} disabled={!dirty || busy} className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark disabled:opacity-40">
            {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

        <div className="flex items-center gap-2 mb-3">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Tìm câu hỏi / chủ đề..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="button" onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer">
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
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{q.topic}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{DIFF_LABEL[q.difficulty] ?? q.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => { setEditingId(q.id); setEditForm(stagedToForm(q)); }}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 cursor-pointer" title="Sửa">
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
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-4">
        <h2 className="flex items-center gap-2 font-bold text-sm text-primary-deep mb-1"><Upload size={15} /> Import file Excel / CSV</h2>
        <p className="text-xs text-primary-deep/80 mb-3">
          Header: <b>Câu hỏi | A | B | C | D | E | Đáp án | Độ khó | Chủ đề | Giải thích</b> ·
          Tên bộ đề tự lấy theo <b>tên file</b> · Chỉ lưu vào database khi bạn bấm <b>Lưu bộ đề</b>.
        </p>
        <label className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark">
          {busy ? 'Đang đọc file...' : 'Chọn file .xlsx / .csv'}
          <input type="file" accept=".xlsx,.xlsm,.csv" className="hidden" onChange={(e) => { void doPreview(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-sm text-primary mb-2">Các bộ câu hỏi ({subjects.length})</h2>
        <div className="flex flex-col gap-2 max-h-96 overflow-auto">
          {subjects.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-100 px-4 py-3 text-xs flex items-center gap-2 hover:border-primary transition-colors">
              <button
                type="button" onClick={() => openBank(s.id)}
                className="flex-1 flex items-center gap-2 cursor-pointer text-left hover:bg-primary/5 rounded-lg -m-1 p-1"
              >
                <span className="font-bold text-slate-800 flex-1 text-sm">{s.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{counts[s.id] ?? '…'} câu</span>
                <span className="text-primary font-bold">Mở →</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Xóa CẢ BỘ ĐỀ "${s.name}" (${counts[s.id] ?? '?'} câu)? Không thể hoàn tác.`)) return;
                  try {
                    await deleteBank(s.id);
                    setMsg(`Đã xóa bộ đề "${s.name}".`);
                    onChanged();
                  } catch (e) {
                    setMsg(e instanceof Error ? e.message : String(e));
                  }
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                title="Xóa cả bộ đề"
              >
                <Trash2 size={15} />
              </button>
            </div>
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
        <button type="button" onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer">{saveLabel}</button>
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
        <h2 className="flex items-center gap-2 font-bold text-sm text-primary mb-2"><Building2 size={15} /> Thêm đơn vị mới</h2>
        <div className="flex gap-2">
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="Tên đơn vị (vd: Khoa Công nghệ)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button type="button" onClick={doAdd} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark">
            Thêm
          </button>
        </div>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-sm text-primary mb-2">Danh sách đơn vị ({units.length})</h2>
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
      <h2 className="font-bold text-sm text-primary mb-1">Thông tin liên hệ</h2>
      <p className="text-[11px] text-slate-500 mb-3">Hiển thị ở trang Liên hệ cho mọi người xem.</p>
      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}
      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
      <input
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vd: hotro@a05.gov.vn"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary mb-3"
      />
      <label className="block text-xs font-bold text-slate-700 mb-1">Điện thoại</label>
      <input
        value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="vd: 0123 456 789"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary mb-4"
      />
      <button type="button" onClick={doSave} disabled={busy} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-primary-dark disabled:opacity-50">
        {busy ? 'Đang lưu...' : 'Lưu liên hệ'}
      </button>
    </div>
  );
}

/* ---------------- Quan ly tai khoan ---------------- */

function UsersTab() {
  const [users, setUsers] = useState<{ username: string; role: string; created_at: number }[]>([]);
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('user');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPass, setResetPass] = useState('');

  const doReset = async (username: string) => {
    if (!resetPass || resetPass.length < 3) { setMsg('Mật khẩu mới phải từ 3 ký tự trở lên.'); return; }
    try {
      await adminResetPassword(username, resetPass);
      setResetFor(null);
      setResetPass('');
      setMsg(`Đã đặt lại mật khẩu cho "${username}". Lưu ý: phiên đăng nhập cũ của họ vẫn dùng được đến khi hết hạn.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const doDelete = async (username: string) => {
    if (!confirm(`Xóa tài khoản "${username}"? (Token cũ của họ vẫn dùng được đến khi hết hạn.)`)) return;
    try {
      await adminDeleteUser(username);
      setMsg(`Đã xóa tài khoản "${username}".`);
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const reload = () => {
    listUsers().then((r) => setUsers(r.users || [])).catch((e) => setMsg(String(e)));
  };
  useEffect(() => { reload(); }, []);

  const doCreate = async () => {
    if (!name.trim() || !pass) { setMsg('Cần nhập tên đăng nhập và mật khẩu (mật khẩu >= 3 ký tự).'); return; }
    setBusy(true);
    try {
      const r = await adminCreateUser(name.trim(), pass, role);
      setName('');
      setPass('');
      setRole('user');
      setMsg(`Đã tạo tài khoản "${r.username}" (${r.role}).`);
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4 max-w-xl">
        <h2 className="font-bold text-sm text-primary mb-2">Tạo tài khoản mới</h2>
        <div className="grid sm:grid-cols-3 gap-2 mb-3">
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên đăng nhập"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mật khẩu"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="user">Người dùng (user)</option>
            <option value="admin">Quản trị viên (admin)</option>
          </select>
        </div>
        <button type="button" onClick={doCreate} disabled={busy} className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark disabled:opacity-50">
          {busy ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3">{msg}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-sm text-primary mb-2">Danh sách tài khoản ({users.length})</h2>
        <div className="flex flex-col gap-2 max-h-96 overflow-auto">
          {users.map((u) => (
            <div key={u.username}>
              <div className="rounded-xl border border-slate-100 px-3 py-2.5 text-xs flex items-center gap-2">
                <b className="flex-1 text-slate-800">{u.username}</b>
                {u.role === 'admin'
                  ? <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">admin</span>
                  : <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">user</span>}
                <button
                  type="button" onClick={() => { setResetFor(resetFor === u.username ? null : u.username); setResetPass(''); }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer"
                  title="Đặt lại mật khẩu"
                >
                  <KeyRound size={11} /> Đặt lại MK
                </button>
                <button
                  type="button" onClick={() => doDelete(u.username)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  title="Xóa tài khoản"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {resetFor === u.username && (
                <div className="flex gap-2 mt-1.5 mb-1 ml-4">
                  <input
                    type="password" value={resetPass} onChange={(e) => setResetPass(e.target.value)}
                    placeholder="Mật khẩu mới (≥3 ký tự)"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="button" onClick={() => doReset(u.username)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold cursor-pointer hover:bg-primary-dark"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>
          ))}
          {users.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có tài khoản nào.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Ky kiem tra ---------------- */

function fmtRoomTime(ts: number): string {
  try {
    const d = new Date(Number(ts || 0) * 1000);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return '';
  }
}

function RoomsTab({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, { total: number; submitted: number }>>({});
  const [subjCounts, setSubjCounts] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '', subject: '', topics: [] as string[], difficulty: 'Hon hop',
    count: 20, time_limit: 30, max_violations: 3,
    shuffle_questions: true, shuffle_options: true, auto_submit: false, show_answers: true,
  });
  const [bankItems, setBankItems] = useState<any[]>([]);
  const [monitorId, setMonitorId] = useState('');
  const [monitor, setMonitor] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [editScores, setEditScores] = useState<Record<string, number>>({});

  const reload = useCallback(() => {
    listRooms().then(async (r) => {
      const list = r.rooms || [];
      setRooms(list);
      // dem thi sinh tung ky de hien "3 (2)"
      const entries = await Promise.all(
        list.map(async (rm: any) => {
          try {
            const m = await getMonitor(rm.id);
            const parts = m.participants || [];
            return [rm.id, { total: parts.length, submitted: parts.filter((p: any) => p.submitted).length }] as const;
          } catch {
            return [rm.id, { total: 0, submitted: 0 }] as const;
          }
        })
      );
      setStats(Object.fromEntries(entries));
    }).catch((e) => setMsg(String(e)));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // dem so cau moi bo de (hien trong select)
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
      if (!stop) {
        setSubjCounts(Object.fromEntries(entries));
        setForm((f) => (!f.subject && subjects.length > 0 ? { ...f, subject: subjects[0].id, topics: [] } : f));
      }
    })();
    return () => { stop = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects]);

  // nap bank cua bo dang chon de lay chu de + dem cau theo lua chon
  useEffect(() => {
    if (!form.subject) { setBankItems([]); return; }
    let stop = false;
    getBank(form.subject).then((r) => {
      if (!stop) setBankItems(r.items || []);
    }).catch(() => { if (!stop) setBankItems([]); });
    return () => { stop = true; };
  }, [form.subject]);

  // poll giám sát liên tục
  useEffect(() => {
    if (!monitorId) { setMonitor(null); return; }
    let stop = false;
    const tick = async () => {
      try {
        const m = await getMonitor(monitorId);
        if (!stop) {
          setMonitor(m);
          const lb = await getFullLeaderboard(monitorId).catch(() => null);
          if (!stop && lb) setRanking(lb.ranking || []);
        }
      } catch { /* ignore */ }
      if (!stop) setTimeout(tick, 3000);
    };
    tick();
    return () => { stop = true; };
  }, [monitorId]);

  const topicCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of bankItems) {
      const t = String((q as any)?.topic || 'Chung').trim() || 'Chung';
      m.set(t, (m.get(t) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'vi'));
  }, [bankItems]);

  const selectedCount = form.topics.length === 0
    ? bankItems.length
    : bankItems.filter((q) => form.topics.includes(String((q as any)?.topic || 'Chung').trim() || 'Chung')).length;

  const toggleTopic = (t: string) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(t) ? f.topics.filter((x) => x !== t) : [...f.topics, t],
    }));
  };

  const doCreate = async () => {
    if (!form.subject) { setMsg('Cần chọn bộ câu hỏi.'); return; }
    setBusy(true);
    try {
      const r = await createRoom({
        name: form.name.trim() || 'Kỳ kiểm tra',
        subject: form.subject,
        unit: '',
        topics: form.topics,
        difficulty: form.difficulty,
        count: Number(form.count) || 20,
        time_limit: Number(form.time_limit) || 30,
        shuffle_questions: form.shuffle_questions,
        shuffle_options: form.shuffle_options,
        max_violations: Number(form.max_violations) || 3,
        auto_submit: form.auto_submit,
        show_answers: form.show_answers,
      });
      setMsg(`Đã tạo kỳ "${r.room.name}" — mã: ${r.room.code}`);
      setForm((f) => ({ ...f, name: '', topics: [] }));
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const doExport = (roomId: string) => {
    exportRoomCsv(roomId);
  };

  const DIFFS = ['Hon hop', 'De', 'Trung binh', 'Kho'];

  return (
    <div>
      {/* Tao ky kiem tra */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 mb-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-[13px] text-primary uppercase tracking-wide mb-4">
          <span className="w-1 h-4 rounded bg-primary inline-block" /> Tạo kỳ kiểm tra
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên kỳ kiểm tra</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Kiểm tra nhận thức quý IV/2026"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary bg-slate-50/50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bộ câu hỏi</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, topics: [] })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary bg-slate-50/50">
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({subjCounts[s.id] ?? '…'} câu)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary bg-slate-50/50">
              {DIFFS.map((d) => <option key={d} value={d}>{DIFF_LABEL[d] ?? d}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Chủ đề (để trống = tất cả)</label>
          {topicCounts.length === 0 ? (
            <p className="text-[11px] text-slate-400">Bộ câu hỏi chưa có chủ đề nào.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {topicCounts.map(([t, n]) => {
                const on = form.topics.includes(t);
                return (
                  <button
                    key={t} type="button" onClick={() => toggleTopic(t)}
                    className={`px-2.5 py-1.5 rounded-md border text-[11px] cursor-pointer transition-colors ${
                      on ? 'border-primary bg-primary text-white font-bold' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/50'
                    }`}
                  >
                    {t} ({n})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-1.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số câu</label>
            <input type="number" min={1} max={200} value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary bg-slate-50/50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian làm bài (phút)</label>
            <input type="number" min={1} max={300} value={form.time_limit} onChange={(e) => setForm({ ...form, time_limit: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary bg-slate-50/50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số lần rời màn hình cho phép</label>
            <input type="number" min={1} max={20} value={form.max_violations} onChange={(e) => setForm({ ...form, max_violations: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary bg-slate-50/50" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600"><input type="checkbox" checked={form.auto_submit} onChange={(e) => setForm({ ...form, auto_submit: e.target.checked })} className="accent-primary w-3.5 h-3.5" /> Tự thu bài khi vượt số lần</label>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">Số câu hiện có theo lựa chọn: {selectedCount}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-600 border-t border-slate-100">
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={form.shuffle_questions} onChange={(e) => setForm({ ...form, shuffle_questions: e.target.checked })} className="accent-primary w-3.5 h-3.5" /> Trộn thứ tự câu hỏi</label>
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={form.shuffle_options} onChange={(e) => setForm({ ...form, shuffle_options: e.target.checked })} className="accent-primary w-3.5 h-3.5" /> Đảo thứ tự phương án</label>
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={form.show_answers} onChange={(e) => setForm({ ...form, show_answers: e.target.checked })} className="accent-primary w-3.5 h-3.5" /> Cho thí sinh xem đáp án sau khi nộp</label>
          <div className="flex-1" />
          <button type="button" onClick={doCreate} disabled={busy} className="px-5 py-2.5 rounded-md bg-primary text-white text-xs font-bold cursor-pointer hover:bg-primary-dark disabled:opacity-50 flex items-center gap-1.5">
            <Plus size={14} /> {busy ? 'Đang tạo...' : 'Tạo kỳ kiểm tra'}
          </button>
        </div>
      </div>

      {msg && <p className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">{msg}</p>}

      {/* Danh sach ky kiem tra */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 mb-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-[13px] text-primary uppercase tracking-wide mb-3">
          <span className="w-1 h-4 rounded bg-primary inline-block" /> Danh sách kỳ kiểm tra
        </h2>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100">
                <th className="py-2 pr-2 font-semibold">Tên kỳ kiểm tra</th>
                <th className="py-2 pr-2 font-semibold">Mã</th>
                <th className="py-2 pr-2 font-semibold">Bộ câu hỏi</th>
                <th className="py-2 pr-2 font-semibold">Số câu / phút</th>
                <th className="py-2 pr-2 font-semibold">Thí sinh (đã nộp)</th>
                <th className="py-2 pr-2 font-semibold">Trạng thái</th>
                <th className="py-2 pr-2 font-semibold">Tạo lúc</th>
                <th className="py-2 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => {
                const st = stats[r.id] || { total: 0, submitted: 0 };
                const open = r.status === 'open';
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-2 font-bold text-slate-800">{r.name}</td>
                    <td className="py-2.5 pr-2 font-mono font-extrabold text-primary">{r.code}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{r.subject}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{r.count} / {r.time_limit}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{st.total} ({st.submitted})</td>
                    <td className="py-2.5 pr-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${open ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
                        {open ? 'Đang diễn ra' : 'Đã kết thúc'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-slate-500 whitespace-nowrap">{fmtRoomTime(r.created_at)}</td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => setMonitorId(r.id)} title="Theo dõi trực tiếp"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer">
                          <Monitor size={12} /> Theo dõi
                        </button>
                        {open && (
                          <button type="button" title="Kết thúc kỳ kiểm tra (thu toàn bộ bài)"
                            onClick={async () => { if (confirm(`Kết thúc kỳ "${r.name}" (${r.code})? Tất cả bài sẽ bị thu.`)) { await closeRoom(r.id); reload(); } }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer">
                            <Lock size={12} /> Kết thúc
                          </button>
                        )}
                        <button type="button" onClick={() => doExport(r.id)} title="Xuất báo cáo CSV"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer">
                          <Download size={12} /> Báo cáo
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rooms.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Chưa có kỳ kiểm tra nào.</p>}
        </div>
      </div>

      {/* Giam sat truc tiep + BXH */}
      {monitor && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <h2 className="font-extrabold text-[13px] text-primary uppercase tracking-wide mb-3">
            Giám sát trực tiếp: {monitor.room?.name} ({monitor.room?.code}) — {monitor.total} thí sinh
          </h2>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-auto mb-4">
            {monitor.participants?.map((p: any) => (
              <div key={`${p.participant}__${p.id_number || ''}`} className="text-xs rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <b className="flex-1 truncate min-w-[120px]">{p.participant}{p.unit ? ` · ${p.unit}` : ''}{p.id_number ? ` · ${p.id_number}` : ''}</b>
                <span className="text-slate-500">{p.answered}/{p.total} câu</span>
                <span className="text-slate-500">điểm hiện tại <b className="text-slate-800">{p.current_score}</b></span>
                {p.violations > 0 && <span className="text-amber-600 font-bold">rời màn hình ×{p.violations}</span>}
                {(p.joins ?? 1) > 1 && <span className="text-sky-600 font-bold">vào lại ×{p.joins}</span>}
                <span className={p.submitted ? 'text-green-600 font-bold' : 'text-slate-400'}>{p.submitted ? 'Đã nộp' : 'Đang làm'}</span>
              </div>
            ))}
          </div>
          <h3 className="font-bold text-xs text-slate-700 mb-1.5">Bảng xếp hạng (sửa được)</h3>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-auto">
            {ranking.map((r: any, i: number) => (
              <div key={`${r.participant}__${r.id_number || ''}`} className="text-xs rounded-lg border border-slate-100 px-3 py-2 flex items-center gap-2">
                <span className="font-bold text-slate-400 w-6">{i + 1}</span>
                <b className="flex-1 truncate">{r.participant}{r.id_number ? ` · ${r.id_number}` : ''}</b>
                <span>{r.score}/{r.total}</span>
                <input
                  type="number" min={0} max={r.total}
                  value={editScores[`${r.participant}__${r.id_number || ''}`] ?? r.score}
                  onChange={(e) => setEditScores((s) => ({ ...s, [`${r.participant}__${r.id_number || ''}`]: Number(e.target.value) }))}
                  className="w-16 rounded-md border border-slate-200 px-1.5 py-1 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={async () => { await editScore(monitor.room.id, r.participant, editScores[`${r.participant}__${r.id_number || ''}`] ?? r.score, r.id_number || ''); const lb = await getFullLeaderboard(monitor.room.id).catch(() => null); if (lb) setRanking(lb.ranking || []); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold cursor-pointer"
                >
                  <Pencil size={11} /> Sửa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
      <h2 className="flex items-center gap-2 font-bold text-sm text-primary mb-2"><Flag size={14} /> Báo lỗi từ người dùng ({items.length})</h2>
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
      <h2 className="flex items-center gap-2 font-bold text-sm text-primary mb-1"><Sparkles size={14} /> ML tự động đánh giá độ khó (50 câu đầu)</h2>
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
                  {r && <> · ML gợi ý: <b className="text-primary">{DIFF_LABEL[r.suggested] ?? r.suggested}</b> (sai {r.wrong_rate === null ? '?' : Math.round(r.wrong_rate * 100) + `%`}/{r.attempts} lượt, tin cậy {r.confidence})</>}
                </div>
              </div>
              <button type="button" onClick={() => check(q)} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold cursor-pointer">Đánh giá</button>
              {r && r.suggested !== q.difficulty && (
                <button
                  type="button"
                  onClick={async () => { await updateBankQuestion(subject, q.id, { difficulty: r.suggested }); setItems((list) => list.map((x) => (x.id === q.id ? { ...x, difficulty: r.suggested } : x))); }}
                  className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold cursor-pointer"
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
