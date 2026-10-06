import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LogIn, Send } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';
import { joinRoom, saveRoomAnswer, reportViolation, submitRoom, getLeaderboard } from '../services/api.ts';

export default function ExamRoomPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [violations, setViolations] = useState(0);
  const [maxV, setMaxV] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [done, setDone] = useState<{ score: number; total: number } | null>(null);
  const [detail, setDetail] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [warn, setWarn] = useState('');
  const doneRef = useRef(false);
  const credRef = useRef({ code: '', participant: '', ticket: '' });

  // restore session
  useEffect(() => {
    const raw = localStorage.getItem('eq_exam_session');
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s.code && s.participant) {
          setCode(s.code);
          setName(s.participant);
          credRef.current = { code: s.code, participant: s.participant, ticket: s.ticket || '' };
        }
      } catch { /* ignore */ }
    }
  }, []);

  // countdown -> tu dong thu bai
  useEffect(() => {
    if (!room || done || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    if (timeLeft === 1) void doSubmit(true);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, room, done]);

  // chong gian lan: chuyen tab / mat focus
  useEffect(() => {
    if (!room || done) return;
    const onHide = async () => {
      if (document.hidden && !doneRef.current) {
        try {
          const r = await reportViolation(credRef.current.code, credRef.current.participant, credRef.current.ticket);
          setViolations(r.violations ?? 0);
          if (r.submitted) {
            setWarn(r.expired
              ? 'Đã hết giờ làm bài — hệ thống tự động thu bài!'
              : `Bạn đã chuyển tab ${r.violations}/${r.max} lần — bài thi bị tự động thu!`);
            void doSubmit(true);
          } else {
            setWarn(`Cảnh báo chống gian lận: phát hiện chuyển tab (${r.violations}/${r.max}). Vượt giới hạn sẽ tự động thu bài!`);
          }
        } catch { /* ignore */ }
      }
    };
    const onBlur = () => { if (!doneRef.current) onHide(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, done]);

  const doJoin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    try {
      const r = await joinRoom(code.trim().toUpperCase(), name.trim());
      setRoom(r.room);
      setQuestions(r.questions || []);
      setAnswers(r.answers || {});
      setViolations(r.violations || 0);
      setMaxV(r.room?.max_violations || 3);
      setTimeLeft((r.room?.time_limit || 30) * 60);
      setDone(r.submitted ? { score: 0, total: (r.questions || []).length } : null);
      setDetail(r.detail || []);
      credRef.current = { code: code.trim().toUpperCase(), participant: name.trim(), ticket: r.ticket || '' };
      localStorage.setItem('eq_exam_session', JSON.stringify(credRef.current));
      if (r.submitted) {
        const lb = await getLeaderboard(r.room.id).catch(() => null);
        if (lb) {
          setRanking(lb.ranking || []);
          const me = (lb.ranking || []).find((x: any) => x.participant === name.trim());
          if (me) setDone({ score: me.score, total: me.total });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const choose = async (qid: string, val: number) => {
    if (done) return;
    setAnswers((a) => ({ ...a, [qid]: val }));
    // luu lien tuc: bam cau nao luu ngay cau do
    try {
      await saveRoomAnswer(credRef.current.code, credRef.current.participant, qid, val, credRef.current.ticket);
    } catch (err) {
      // het gio giua chung -> server da tu thu, keo ket qua ve
      if (err instanceof Error && err.message.includes('Hết giờ')) {
        void doSubmit(true);
      }
    }
  };

  const doSubmit = async (auto = false) => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      // submit luy thua (idempotent): bai da nop van tra lai detail day du
      const r = await submitRoom(credRef.current.code, credRef.current.participant, credRef.current.ticket);
      setDone({ score: r.score ?? 0, total: r.total ?? questions.length });
      setDetail(r.detail || []);
      const lb = await getLeaderboard(room.id).catch(() => null);
      if (lb) setRanking(lb.ranking || []);
      if (auto) setWarn((w) => w || 'Đã tự động thu bài.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      doneRef.current = false;
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!room) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Vào phòng thi</h1>
          <p className="text-xs text-slate-500 mb-5">Không cần mật khẩu — chỉ cần nhập <b>tên + mã phòng</b> do quản trị viên cấp.</p>
          <form onSubmit={doJoin} className="flex flex-col gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Họ tên</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="vd: Nguyễn Văn A"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Mã phòng thi</span>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="vd: X7K2PQ"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 font-mono tracking-widest font-bold" />
            </label>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" className="mt-1 w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 cursor-pointer">
              <LogIn size={16} /> Vào thi
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-slate-900 text-white p-6 mb-4 text-center">
          <h1 className="font-bold text-xl">Đã nộp bài: {done.score}/{done.total}</h1>
          <p className="text-xs text-slate-300 mt-1">Phòng {room.name} · Mã {room.code} · Thí sinh {credRef.current.participant}</p>
        </div>
        {detail.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
            <h2 className="font-bold text-sm text-slate-800 mb-2">Xem lại bài làm</h2>
            <div className="flex flex-col gap-2 max-h-96 overflow-auto">
              {detail.map((d: any, i: number) => (
                <div key={String(d.id)} className={`text-xs rounded-xl border px-3 py-2 ${d.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                  <b>Câu {i + 1}:</b> {String(d.question || '').slice(0, 140)}
                  <div className="mt-1 text-slate-500">
                    Bạn chọn: <b>{d.userAnswer === undefined || d.userAnswer === null ? 'bỏ trống' : 'ABCDE'[Number(d.userAnswer)] ?? String(d.userAnswer)}</b> ·
                    Đáp án: <b className="text-green-600">{'ABCDE'[Number(d.correctAnswer)]}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-sm text-slate-800 mb-2">Bảng xếp hạng phòng thi</h2>
          {ranking.length === 0 ? <p className="text-xs text-slate-400">Chưa có dữ liệu.</p> : (
            <table className="w-full text-xs">
              <thead><tr className="text-slate-400 text-left"><th className="py-1">Hạng</th><th>Thí sinh</th><th>Điểm</th><th>Vi phạm</th></tr></thead>
              <tbody>
                {ranking.map((r: any, i: number) => (
                  <tr key={r.participant} className={`border-t border-slate-100 ${r.participant === credRef.current.participant ? 'bg-indigo-50 font-bold' : ''}`}>
                    <td className="py-1.5">{i + 1}</td><td>{r.participant}</td>
                    <td>{r.score}/{r.total}</td><td>{r.violations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button type="button" onClick={() => navigate('/phong-thi')} className="mt-3 text-xs font-bold text-indigo-600 cursor-pointer">← Về trang phòng thi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-800">{room.name} · {credRef.current.participant}</div>
          <div className="text-[11px] text-slate-500">Đã làm {Object.keys(answers).length}/{questions.length} · Vi phạm tab {violations}/{maxV} · Tự lưu từng câu</div>
        </div>
        <div className={`font-mono font-bold px-3 py-1.5 rounded-xl text-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
          {fmt(timeLeft)}
        </div>
      </div>
      {warn && <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> {warn}</p>}
      <div className="flex flex-col gap-4">
        {questions.map((q: any, i: number) => (
          <div key={String(q.id)} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-bold text-slate-500 mb-2">Câu {i + 1}{q.topic ? ` · ${q.topic}` : ''}</div>
            <div className="text-sm text-slate-800 font-medium mb-3"><MarkdownRenderer content={String(q.question || q.text || '')} /></div>
            <div className="flex flex-col gap-2">
              {(q.options || []).map((opt: string, oi: number) => (
                <button
                  key={oi} type="button" onClick={() => choose(String(q.id), oi)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-sm cursor-pointer ${(answers as any)[String(q.id)] === oi ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-800' : 'border-slate-200 hover:border-indigo-300'}`}
                >
                  <b className="mr-2">{'ABCDE'[oi]}.</b><MarkdownRenderer content={String(opt)} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => doSubmit(false)} className="mt-5 w-full py-3.5 rounded-2xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2 cursor-pointer">
        <Send size={15} /> Nộp bài
      </button>
    </div>
  );
}
