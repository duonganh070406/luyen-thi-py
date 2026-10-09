import { useEffect, useMemo, useState } from 'react';
import { Play, Flag, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';
import CompetencyChart, { DIFF_LABEL } from '../components/CompetencyChart.tsx';
import { questionFromApi } from '../mapBackend.ts';
import type { Question } from '../types.ts';
import {
  appendHistory, getBankTopics, getCompetency, getPracticeQuiz,
  getSubjectStats, listSubjects, reportQuestion,
} from '../services/api.ts';

const DIFFS = [
  { v: 'Hon hop', label: 'Hỗn hợp (tất cả độ khó)', hint: 'Lấy đều các mức độ' },
  { v: 'De', label: 'Dễ', hint: 'Trộn: 50% Dễ · 30% TB · 20% Khó' },
  { v: 'Trung binh', label: 'Trung bình', hint: 'Trộn: 30% Dễ · 40% TB · 30% Khó' },
  { v: 'Kho', label: 'Khó', hint: 'Trộn: 20% Dễ · 30% TB · 50% Khó' },
];

interface ResultRow { q: Question; user: number; ok: boolean; }

export default function PracticePage() {
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('Hon hop');
  const [count, setCount] = useState(10);
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleO, setShuffleO] = useState(true);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ResultRow[] | null>(null);
  const [competency, setCompetency] = useState<any>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [reportMsg, setReportMsg] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    listSubjects().then((s) => {
      setSubjects(s.map((x) => ({ id: x.id, name: x.name })));
      if (s.length > 0) setSubject(s[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!subject) return;
    getBankTopics(subject).then((r) => {
      setTopics(r.topics || []);
      setTopicCounts(r.counts?.byTopic || {});
      setPicked([]);
    }).catch(() => setTopics([]));
    getCompetency(subject).then(setCompetency).catch(() => setCompetency(null));
    getSubjectStats(subject).then((st) => setRecentErrors(st.recentErrors || [])).catch(() => setRecentErrors([]));
  }, [subject]);

  const toggleTopic = (t: string) => {
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  };

  const start = async () => {
    if (!subject) return;
    setLoading(true);
    setResult(null);
    setNotice('');
    try {
      const raw = await getPracticeQuiz(subject, {
        topics: picked, difficulty, count,
        shuffle_questions: shuffleQ, shuffle_options: shuffleO,
      });
      const qs = raw.map((r) => questionFromApi(subject, r as Record<string, unknown>));
      if (qs.length === 0) {
        setNotice('Không tìm thấy câu hỏi phù hợp. Quản trị viên cần import đề trước.');
        return;
      }
      setQuestions(qs);
      setAnswers({});
      window.scrollTo({ top: 0 });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (questions.length === 0) return;
    const rows: ResultRow[] = questions.map((q) => {
      const u = answers[q.id] ?? -1;
      const ok = (q.correctAnswers || [0])[0] === u;
      return { q, user: u, ok };
    });
    setResult(rows);
    // Luu lich su de co bieu do nang luc + cau sai gan day (khong can dang nhap)
    try {
      const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await appendHistory(subject, {
        attemptId,
        examName: `Luyện: ${picked.length ? picked.join(',') : 'Hỗn hợp'} - ${difficulty}`,
        questions: questions.map((q) => ({
          id: q.id, type: 'single', text: q.text, options: q.options,
          correctAnswers: q.correctAnswers, explanation: q.explanation,
          topic: q.topic, difficulty: q.difficulty,
        })),
        answers,
        enableAIGrading: false,
      });
      getCompetency(subject).then(setCompetency).catch(() => {});
      getSubjectStats(subject).then((st) => setRecentErrors(st.recentErrors || [])).catch(() => {});
    } catch { /* luyen van hien ket qua du luu lich su loi */ }
    window.scrollTo({ top: 0 });
  };

  const sendReport = async (qid: string) => {
    if (!reportMsg.trim()) return;
    try {
      await reportQuestion(subject, qid, reportMsg.trim(), 'người luyện');
      setNotice('Đã gửi báo lỗi. Cảm ơn bạn!');
      setReportFor(null);
      setReportMsg('');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
    }
  };

  const score = useMemo(() => (result ? result.filter((r) => r.ok).length : 0), [result]);

  // ---- Man hinh lam bai ----
  if (questions.length > 0 && !result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-slate-900">Đang ôn tập: {subject} · {questions.length} câu</h1>
          <button type="button" onClick={() => { setQuestions([]); setAnswers({}); }} className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer">Thoát</button>
        </div>
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[11px] mb-2">
                <span className="font-bold text-slate-500">Câu {i + 1}</span>
                {q.topic && <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">{q.topic}</span>}
                {q.difficulty && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{DIFF_LABEL[q.difficulty] ?? q.difficulty}</span>}
              </div>
              <div className="text-sm text-slate-800 font-medium mb-3"><MarkdownRenderer content={q.text} /></div>
              <div className="flex flex-col gap-2">
                {(q.options || []).map((opt, oi) => {
                  const active = answers[q.id] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${active ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-800' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <b className="mr-2">{'ABCDE'[oi]}.</b><MarkdownRenderer content={opt} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button" onClick={submit}
          className="mt-5 w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 cursor-pointer"
        >
          Nộp bài ({Object.keys(answers).length}/{questions.length} đã làm)
        </button>
      </div>
    );
  }

  // ---- Man hinh ket qua ----
  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-2xl bg-slate-900 text-white p-5 mb-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="font-bold text-lg">Kết quả: {score}/{result.length} câu đúng</h1>
            <p className="text-xs text-slate-300">Đã lưu lịch sử — xem biểu đồ năng lực và câu sai gần đây bên dưới.</p>
          </div>
          <button type="button" onClick={() => { setResult(null); setQuestions([]); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold cursor-pointer">
            <RotateCcw size={15} /> Luyện tiếp
          </button>
        </div>
        {notice && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">{notice}</p>}
        <div className="flex flex-col gap-3">
          {result.map((r, i) => (
            <div key={r.q.id} className={`rounded-2xl border p-4 bg-white ${r.ok ? 'border-green-200' : 'border-red-200'}`}>
              <div className="flex items-center gap-2 text-[11px] mb-1.5">
                <span className="font-bold text-slate-500">Câu {i + 1}</span>
                {r.ok
                  ? <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 size={13} /> Đúng</span>
                  : <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle size={13} /> Sai</span>}
                {r.q.topic && <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">{r.q.topic}</span>}
              </div>
              <div className="text-sm text-slate-800 font-medium"><MarkdownRenderer content={r.q.text} /></div>
              <div className="text-xs mt-2 flex flex-col gap-1">
                {(r.q.options || []).map((opt, oi) => {
                  const isC = (r.q.correctAnswers || [0])[0] === oi;
                  const isU = r.user === oi;
                  return (
                    <div key={oi} className={`px-2.5 py-1.5 rounded-lg ${isC ? 'bg-green-50 text-green-700 font-bold' : isU ? 'bg-red-50 text-red-600' : 'text-slate-500'}`}>
                      {'ABCDE'[oi]}. {opt} {isC ? '← đáp án đúng' : isU ? '← bạn chọn' : ''}
                    </div>
                  );
                })}
              </div>
              {r.q.explanation && <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-2.5 py-2">Giải thích: {r.q.explanation}</p>}
              <div className="mt-2">
                {reportFor === r.q.id ? (
                  <div className="flex gap-2">
                    <input
                      value={reportMsg} onChange={(e) => setReportMsg(e.target.value)}
                      placeholder="Mô tả lỗi sai của câu hỏi..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-400"
                    />
                    <button type="button" onClick={() => sendReport(r.q.id)} className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer">Gửi</button>
                    <button type="button" onClick={() => setReportFor(null)} className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">Hủy</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setReportFor(r.q.id)} className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer">
                    <Flag size={12} /> Báo lỗi câu hỏi này
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Man hinh cau hinh luyen ----
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 font-serif italic">Ôn tập</h1>
      <p className="text-xs text-slate-500 mt-1 mb-5">Không cần đăng nhập. Chọn chủ đề hỗn hợp, độ khó, số lượng — đề sẽ trộn thông minh.</p>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
          <label className="block mb-4">
            <span className="text-sm font-bold text-slate-700">Bộ câu hỏi</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <div className="mb-4">
            <span className="text-sm font-bold text-slate-700">Chủ đề (chọn nhiều = hỗn hợp)</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {topics.length === 0 && <span className="text-xs text-slate-400">Chưa có chủ đề — quản trị viên cần import đề trước.</span>}
              {topics.map((t) => (
                <button
                  key={t} type="button" onClick={() => toggleTopic(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${picked.includes(t) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                >
                  {t} ({topicCounts[t] || 0} câu)
                </button>
              ))}
            </div>
            {picked.length > 0 && (
              <button type="button" onClick={() => setPicked([])} className="mt-2 text-[11px] text-slate-400 underline cursor-pointer">Bỏ chọn (về Hỗn hợp)</button>
            )}
          </div>
          <div className="mb-4">
            <span className="text-sm font-bold text-slate-700">Độ khó</span>
            <div className="mt-2 grid sm:grid-cols-2 gap-2">
              {DIFFS.map((d) => (
                <button
                  key={d.v} type="button" onClick={() => setDifficulty(d.v)}
                  className={`text-left px-3 py-2.5 rounded-xl border cursor-pointer ${difficulty === d.v ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                >
                  <div className="text-sm font-bold text-slate-800">{d.label}</div>
                  <div className="text-[11px] text-slate-500">{d.hint}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Số câu</span>
              <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
              <input type="checkbox" checked={shuffleQ} onChange={(e) => setShuffleQ(e.target.checked)} className="w-4 h-4 accent-indigo-600" /> Trộn câu hỏi
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
              <input type="checkbox" checked={shuffleO} onChange={(e) => setShuffleO(e.target.checked)} className="w-4 h-4 accent-indigo-600" /> Đảo đáp án
            </label>
          </div>
          {notice && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">{notice}</p>}
          <button
            type="button" onClick={start} disabled={loading || !subject}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={16} /> {loading ? 'Đang tạo đề...' : `Bắt đầu ôn tập (${picked.length ? picked.length + ' chủ đề' : 'hỗn hợp'} · ${DIFFS.find((x) => x.v === difficulty)?.label ?? difficulty} · ${count} câu)`}
          </button>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Ẩn biểu đồ năng lực theo yêu cầu */}
          {/* <CompetencyChart title="Năng lực theo chủ đề (sai nhiều → ôn lại)" data={competency?.byTopic || {}} />
          <CompetencyChart title="Năng lực theo độ khó" data={competency?.byDifficulty || {}} /> */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Các câu sai gần đây</h3>
            {recentErrors.length === 0
              ? <p className="text-xs text-slate-400">Chưa có câu sai nào. Làm bài để hệ thống ghi nhận.</p>
              : <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                {recentErrors.slice(0, 10).map((s: any, i: number) => (
                  <div key={i} className="text-xs rounded-xl bg-red-50/60 border border-red-100 px-3 py-2">
                    <div className="text-slate-700 font-medium line-clamp-2"><MarkdownRenderer content={String(s.question || '')} /></div>
                    <div className="text-slate-400 mt-1">Đáp án đúng: <b className="text-green-600">{JSON.stringify(s.correctAnswer)}</b></div>
                  </div>
                ))}
              </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
