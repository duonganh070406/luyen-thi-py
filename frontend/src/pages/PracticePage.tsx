import { useEffect, useMemo, useState } from 'react';
import { Play, Flag, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';
import CompetencyChart, { DIFF_LABEL } from '../components/CompetencyChart.tsx';
import { attemptFromHistory, questionFromApi } from '../mapBackend.ts';
import type { Attempt, Question } from '../types.ts';
import {
  appendHistory, getBankTopics, getCompetency, getHistory, getPracticeQuiz,
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
  const [history, setHistory] = useState<Attempt[]>([]);
  const [histQuery, setHistQuery] = useState('');
  const [histSort, setHistSort] = useState<'newest' | 'oldest' | 'best' | 'worst'>('newest');

  useEffect(() => {
    listSubjects().then((s) => {
      const list = Array.isArray(s) ? s : [];
      setSubjects(list.map((x) => ({ id: x.id, name: x.name })));
      if (list.length > 0) setSubject(list[0].id);
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
    getHistory(subject)
      .then((h) => setHistory((Array.isArray(h) ? h : []).map((r) => attemptFromHistory(subject, r as Record<string, unknown>))))
      .catch(() => setHistory([]));
  }, [subject]);

  const reloadHistory = () => {
    if (!subject) return;
    getHistory(subject)
      .then((h) => setHistory((Array.isArray(h) ? h : []).map((r) => attemptFromHistory(subject, r as Record<string, unknown>))))
      .catch(() => {});
  };

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
      const qs = (Array.isArray(raw) ? raw : []).map((r) => questionFromApi(subject, r as Record<string, unknown>));
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
      reloadHistory();
    } catch { /* luyen van hien ket qua du luu lich su loi */ }
    window.scrollTo({ top: 0 });
  };

  const viewHistory = (att: Attempt) => {
    const snaps = Array.isArray(att.snapshot) ? att.snapshot : [];
    if (snaps.length === 0) {
      setNotice('Bài làm này không còn chi tiết câu hỏi để xem lại.');
      return;
    }
    const qs = snaps.map((s) => questionFromApi(subject, s as Record<string, unknown>));
    const rows: ResultRow[] = snaps.map((s: any, i: number) => {
      const u = typeof s.userAnswer === 'number' ? s.userAnswer : -1;
      const ok = typeof s.isCorrect === 'boolean' ? s.isCorrect : ((qs[i].correctAnswers || [0])[0] === u);
      return { q: qs[i], user: u, ok };
    });
    setQuestions(qs);
    setAnswers({});
    setResult(rows);
    setNotice('');
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

  const shownHistory = useMemo(() => {
    const q = histQuery.trim().toLowerCase();
    const list = q
      ? history.filter((h) => {
          const hay = `${h.examName || ''} ${h.score}/${h.total} ${
            h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : ''
          }`.toLowerCase();
          return hay.includes(q);
        })
      : [...history];
    switch (histSort) {
      case 'oldest':
        list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        break;
      case 'best':
        list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || (b.total ?? 0) - (a.total ?? 0));
        break;
      case 'worst':
        list.sort((a, b) => (a.score ?? 0) - (b.score ?? 0) || (a.total ?? 0) - (b.total ?? 0));
        break;
      default:
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        break;
    }
    return list;
  }, [history, histQuery, histSort]);

  // ---- Man hinh lam bai ----
  if (questions.length > 0 && !result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-slate-900 text-lg">Đang ôn tập: {subject} · {questions.length} câu</h1>
          <button type="button" onClick={() => { setQuestions([]); setAnswers({}); }} className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer">Thoát</button>
        </div>
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="font-bold text-slate-500">Câu {i + 1}</span>
                {q.topic && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{q.topic}</span>}
                {q.difficulty && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{DIFF_LABEL[q.difficulty] ?? q.difficulty}</span>}
              </div>
              <div className="text-sm text-slate-800 font-medium mb-4"><MarkdownRenderer content={q.text} /></div>
              <div className="flex flex-col gap-2">
                {(q.options || []).map((opt, oi) => {
                  const active = answers[q.id] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors cursor-pointer ${active ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-slate-200 hover:border-primary'}`}
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
          className="mt-5 w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-dark cursor-pointer transition-colors"
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
        <div className="rounded-2xl bg-primary text-white p-6 mb-4 flex items-center gap-4 shadow-sm">
          <div className="flex-1">
            <h1 className="font-bold text-xl">Kết quả: {score}/{result.length} câu đúng</h1>
            <p className="text-sm text-white/90 mt-1">Đã lưu lịch sử — xem biểu đồ năng lực và câu sai gần đây bên dưới.</p>
          </div>
          <button type="button" onClick={() => { setResult(null); setQuestions([]); }} className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gold text-primary text-sm font-bold cursor-pointer hover:bg-gold-light transition-colors">
            <RotateCcw size={16} /> Luyện tiếp
          </button>
        </div>
        {notice && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">{notice}</p>}
        <div className="flex flex-col gap-3">
          {result.map((r, i) => (
            <div key={r.q.id} className={`rounded-2xl border p-5 bg-white shadow-sm ${r.ok ? 'border-green-200' : 'border-red-200'}`}>
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="font-bold text-slate-500">Câu {i + 1}</span>
                {r.ok
                  ? <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 size={14} /> Đúng</span>
                  : <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle size={14} /> Sai</span>}
                {r.q.topic && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{r.q.topic}</span>}
              </div>
              <div className="text-sm text-slate-800 font-medium mb-3"><MarkdownRenderer content={r.q.text} /></div>
              <div className="text-xs mt-2 flex flex-col gap-1">
                {(r.q.options || []).map((opt, oi) => {
                  const isC = (r.q.correctAnswers || [0])[0] === oi;
                  const isU = r.user === oi;
                  return (
                    <div key={oi} className={`px-3 py-2 rounded-lg ${isC ? 'bg-green-50 text-green-700 font-bold' : isU ? 'bg-red-50 text-red-600' : 'text-slate-500'}`}>
                      {'ABCDE'[oi]}. {opt} {isC ? '← đáp án đúng' : isU ? '← bạn chọn' : ''}
                    </div>
                  );
                })}
              </div>
              {r.q.explanation && <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded-lg px-3 py-2">Giải thích: {r.q.explanation}</p>}
              <div className="mt-3">
                {reportFor === r.q.id ? (
                  <div className="flex gap-2">
                    <input
                      value={reportMsg} onChange={(e) => setReportMsg(e.target.value)}
                      placeholder="Mô tả lỗi sai của câu hỏi..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <button type="button" onClick={() => sendReport(r.q.id)} className="px-4 py-2 rounded-xl bg-gold text-primary text-xs font-bold cursor-pointer hover:bg-gold-light transition-colors">Gửi</button>
                    <button type="button" onClick={() => setReportFor(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">Hủy</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setReportFor(r.q.id)} className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-5">Luyện thi</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        {/* Môn học */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Môn học</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {subjects.length === 0 && <option value="">Đang tải danh sách môn học...</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Chủ đề */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2.5">
            Chủ đề (chọn nhiều = hỗn hợp)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPicked([])}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                picked.length === 0
                  ? 'bg-primary-deep text-white border border-primary-deep'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
              }`}
            >
              Tất cả các chủ đề
            </button>
            {topics.map((t) => {
              const isSelected = picked.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-deep text-white border border-primary-deep'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Số câu + Trộn câu hỏi + Đảo đáp án */}
        <div className="flex flex-wrap items-end gap-6 mb-8">
          <div className="w-24">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Số câu</label>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 text-center outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pb-2.5 select-none">
            <input
              type="checkbox"
              checked={shuffleQ}
              onChange={(e) => setShuffleQ(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
            />
            <span>Trộn câu hỏi</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pb-2.5 select-none">
            <input
              type="checkbox"
              checked={shuffleO}
              onChange={(e) => setShuffleO(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
            />
            <span>Đảo đáp án</span>
          </label>
        </div>

        {notice && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5 mb-5">
            {notice}
          </p>
        )}

        {/* Nút Bắt đầu luyện thi */}
        <button
          type="button"
          onClick={start}
          disabled={loading || !subject}
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play size={13} fill="currentColor" />
          <span>{loading ? 'Đang chuẩn bị đề...' : 'Bắt đầu luyện thi'}</span>
        </button>
      </div>

      {/* Lịch sử làm bài */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mt-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Lịch sử làm bài ({history.length})</h2>
        <p className="text-xs text-slate-500 mb-4">Bấm vào một lượt để xem lại chi tiết bài làm.</p>
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={histQuery}
              onChange={(e) => setHistQuery(e.target.value)}
              placeholder="Tìm theo tên đề, điểm (vd: 8/10), ngày..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <select
              value={histSort}
              onChange={(e) => setHistSort(e.target.value as typeof histSort)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-primary bg-white cursor-pointer"
              title="Sắp xếp lịch sử"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Lâu nhất</option>
              <option value="best">Đúng nhiều nhất</option>
              <option value="worst">Đúng ít nhất</option>
            </select>
          </div>
        )}
        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Chưa có lượt làm bài nào ở môn này.</p>
        ) : shownHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy lượt nào khớp "{histQuery}".</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-auto">
            {shownHistory.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => viewHistory(h)}
                className="rounded-xl border border-slate-100 px-4 py-3 text-xs flex items-center gap-3 hover:border-primary hover:bg-primary/5 cursor-pointer text-left transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-slate-800 truncate">{h.examName || 'Đề ngẫu nhiên'}</span>
                  <span className="block text-slate-400 mt-0.5">
                    {h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : ''}
                  </span>
                </span>
                <span className={`font-bold px-2.5 py-1 rounded-lg ${h.score >= h.total / 2 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {h.score}/{h.total}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
