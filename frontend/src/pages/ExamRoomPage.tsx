import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LogIn, Send } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';
import { joinRoom, saveRoomAnswer, reportViolation, submitRoom, getLeaderboard, getUnits } from '../services/api.ts';

export default function ExamRoomPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState<any[]>([]);
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

  // load units
  useEffect(() => {
    getUnits().then(setUnits).catch(() => setUnits([]));
  }, []);

  // countdown -> tu dong thu bai
  useEffect(() => {
    if (!room || done || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    if (timeLeft === 1) void doSubmit(true);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, room, done]);

  // chong gian lan: chuyen tab / mat focus - chi dem, khong tu dong thu
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
              : `Bạn đã chuyển tab ${r.violations} lần (đang đếm).`);
            void doSubmit(true);
          } else {
            setWarn(`Cảnh báo chống gian lận: phát hiện chuyển tab (${r.violations} lần). Quản trị viên sẽ theo dõi.`);
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
      const r = await joinRoom(code.trim().toUpperCase(), name.trim(), unit.trim());
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
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-xs">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Vào phòng thi</h1>
          <form onSubmit={doJoin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ tên</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="vd: Nguyễn Văn A"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lựa chọn đơn vị</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]"
              >
                <option value="">vd: Đội 1 - Phòng 2</option>
                {units.map((u: any) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mã phòng thi</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="vd: XRJ2PQ"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 font-mono tracking-wider outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-lg bg-[#8B0000] hover:bg-[#700000] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <span>&rarr;</span> Vào thi
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-[#8B0000] text-white p-6 mb-4 text-center shadow-sm">
          <h1 className="font-bold text-2xl">Đã nộp bài: {done.score}/{done.total}</h1>
          <p className="text-sm text-white/90 mt-2">Phòng {room.name} · Mã {room.code} · Người tham gia {credRef.current.participant}</p>
        </div>
        {detail.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-4 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 mb-3">Xem lại bài làm</h2>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-sm text-slate-800 mb-3">Bảng xếp hạng phòng thi</h2>
          {ranking.length === 0 ? <p className="text-xs text-slate-400">Chưa có dữ liệu.</p> : (
            <table className="w-full text-xs">
              <thead><tr className="text-slate-400 text-left"><th className="py-2">Hạng</th><th>Người tham gia</th><th>Điểm</th><th>Vi phạm</th></tr></thead>
              <tbody>
                {ranking.map((r: any, i: number) => (
                  <tr key={r.participant} className={`border-t border-slate-100 ${r.participant === credRef.current.participant ? 'bg-[#8B0000]/5 font-bold' : ''}`}>
                    <td className="py-2">{i + 1}</td><td>{r.participant}</td>
                    <td>{r.score}/{r.total}</td><td>{r.violations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button type="button" onClick={() => navigate('/phong-thi')} className="mt-4 text-xs font-bold text-[#8B0000] cursor-pointer">← Về trang phòng thi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 shadow-sm">
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-800">{room.name} · {credRef.current.participant}</div>
          <div className="text-xs text-slate-500">Đã làm {Object.keys(answers).length}/{questions.length} · Vi phạm tab {violations}/{maxV} · Tự lưu từng câu</div>
        </div>
        <div className={`font-mono font-bold px-3 py-1.5 rounded-xl text-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
          {fmt(timeLeft)}
        </div>
      </div>
      {warn && <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> {warn}</p>}
      <div className="flex flex-col gap-4">
        {questions.map((q: any, i: number) => (
          <div key={String(q.id)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-500 mb-2">Câu {i + 1}{q.topic ? ` · ${q.topic}` : ''}</div>
            <div className="text-sm text-slate-800 font-medium mb-3"><MarkdownRenderer content={String(q.question || q.text || '')} /></div>
            <div className="flex flex-col gap-2">
              {(q.options || []).map((opt: string, oi: number) => (
                <button
                  key={oi} type="button" onClick={() => choose(String(q.id), oi)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm cursor-pointer transition-colors ${(answers as any)[String(q.id)] === oi ? 'border-[#8B0000] bg-[#8B0000]/5 font-bold text-[#8B0000]' : 'border-slate-200 hover:border-[#8B0000]'}`}
                >
                  <b className="mr-2">{'ABCDE'[oi]}.</b><MarkdownRenderer content={String(opt)} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => doSubmit(false)} className="mt-5 w-full py-4 rounded-2xl bg-[#8B0000] text-white font-bold text-sm hover:bg-[#6B0000] flex items-center justify-center gap-2 cursor-pointer transition-colors">
        <Send size={16} /> Nộp bài
      </button>
    </div>
  );
}
