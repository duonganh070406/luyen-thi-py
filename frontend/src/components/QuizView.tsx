import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, CheckCircle2, FileText, MessageSquare, HelpCircle, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, CopyConfig, Attempt } from '../types.ts';
import { QuestionRegistry } from '../strategies/QuestionStrategy.ts';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import CopySnapshotButton from './CopySnapshotButton.tsx';

interface StatusConfig {
  badgeText: string;
  badgeClass: string;
  circleBgClass: string;
  circleIcon: React.ReactNode;
  btnClass: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  unanswered: {
    badgeText: 'Chưa làm',
    badgeClass: 'bg-slate-100 text-slate-500',
    circleBgClass: 'bg-slate-300',
    circleIcon: <HelpCircle size={32} className="text-slate-500" />,
    btnClass: 'bg-slate-100 text-slate-400 border border-slate-200',
  },
  correct: {
    badgeText: 'Chính xác',
    badgeClass: 'bg-green-50 text-green-600',
    circleBgClass: 'bg-green-500',
    circleIcon: <CheckCircle2 size={32} />,
    btnClass: 'bg-green-600 text-white shadow-md shadow-green-100',
  },
  incorrect: {
    badgeText: 'Chưa đúng',
    badgeClass: 'bg-red-50 text-red-600',
    circleBgClass: 'bg-red-500',
    circleIcon: <HelpCircle size={32} />,
    btnClass: 'bg-red-500 text-white shadow-md shadow-red-100',
  },
  graded: {
    badgeText: 'Đã chấm',
    badgeClass: 'bg-green-50 text-green-600',
    circleBgClass: 'bg-green-500',
    circleIcon: <CheckCircle2 size={32} />,
    btnClass: 'bg-green-600 text-white shadow-md shadow-green-100',
  },
  ungraded: {
    badgeText: 'Chưa chấm',
    badgeClass: 'bg-amber-50 text-amber-600',
    circleBgClass: 'bg-amber-500',
    circleIcon: <HelpCircle size={32} />,
    btnClass: 'bg-amber-500 text-white shadow-md shadow-amber-100',
  },
};

interface QuizViewProps {
  questions: Question[];
  onFinish: () => Promise<void> | void;
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  showResult: boolean;
  onClose: () => void;
  isGrading: boolean;
  feedbacks: Record<string, string>;
  copyConfig: CopyConfig;
  timeLimit: number;
  examName: string;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  activeAttempt?: Attempt | null;
}

interface QuizQuestionCardProps {
  question: Question;
  index: number;
  isLast: boolean;
  answer: unknown;
  onAnswerChange: (questionId: string, value: unknown) => void;
}

const QuizQuestionCard = memo(function QuizQuestionCard({
  question,
  index,
  isLast,
  answer,
  onAnswerChange,
}: QuizQuestionCardProps) {
  const strategy = QuestionRegistry.get(question.type);
  const handleChange = useCallback((newValue: unknown) => {
    onAnswerChange(question.id, newValue);
  }, [onAnswerChange, question.id]);

  return (
    <div id={`question-${index}`} className="relative">
      <div className="mb-4">
        <span className="inline-block bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
          {question.name || `Câu hỏi #${question.id.slice(0, 6)}`}
        </span>
      </div>

      <MarkdownRenderer content={question.text} className="quiz-question-text" />

      <div className="space-y-3">
        {strategy ? (
          strategy.renderInput({
            question,
            value: answer,
            onChange: handleChange
          })
        ) : (
          <div className="text-red-500">Dạng câu hỏi không hỗ trợ</div>
        )}
      </div>

      {!isLast && <div className="mt-12 border-b border-slate-100 w-full" />}
    </div>
  );
});

interface QuestionPaletteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  questionMetaById: Map<string, { hasAnswer: boolean; status: string }>;
  isResult?: boolean;
  answeredCount?: number;
  onSelectQuestion: (idx: number) => void;
  onFinish?: () => Promise<void> | void;
}

function QuestionPaletteSheet({
  isOpen,
  onClose,
  questions,
  questionMetaById,
  isResult = false,
  answeredCount = 0,
  onSelectQuestion,
  onFinish,
}: QuestionPaletteSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-6 max-h-[75vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {isResult ? 'Kết quả từng câu hỏi' : 'Danh sách câu hỏi'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isResult
                    ? 'Chạm vào câu để xem giải thích chi tiết'
                    : `Đã trả lời ${answeredCount}/${questions.length} câu`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 content-start mb-6">
              {questions.map((q, idx) => {
                const meta = questionMetaById.get(q.id);
                const btnClass = isResult
                  ? (STATUS_CONFIGS[meta?.status ?? 'unanswered'] || STATUS_CONFIGS.unanswered).btnClass
                  : meta?.hasAnswer
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onClose();
                      onSelectQuestion(idx);
                    }}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {isResult ? (
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-green-600 shrink-0"></span>
                  <span>Đúng / Đã chấm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 shrink-0"></span>
                  <span>Chưa đúng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0"></span>
                  <span>Chưa chấm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-slate-200 shrink-0"></span>
                  <span>Chưa làm</span>
                </div>
              </div>
            ) : onFinish ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFinish();
                }}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                Nộp bài ngay
              </button>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function QuizView({
  questions,
  onFinish,
  answers,
  setAnswers,
  showResult,
  onClose,
  isGrading,
  feedbacks,
  copyConfig,
  timeLimit,
  examName,
  timeLeft,
  setTimeLeft,
  activeAttempt,
}: QuizViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Refs for tracking mouse drag offsets
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(256);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = mouseDownEvent.clientX;
    startWidthRef.current = sidebarWidth;
    mouseDownEvent.preventDefault();
  };

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Throttle updating state using requestAnimationFrame for 60fps smooth dragging
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - startXRef.current;
        let newWidth = startWidthRef.current + deltaX;
        if (newWidth < 120) {
          newWidth = 0; // Hide completely
        } else {
          newWidth = Math.max(120, Math.min(800, newWidth)); // drag wider up to 800px
        }
        setSidebarWidth(newWidth);
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Enforce cursor locking and disable selections across document body during dragging
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (showResult || isGrading || timeLimit <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinishRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, isGrading, timeLimit]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const scrollToQuestion = (idx: number) => {
    const el = document.getElementById(`question-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAnswerChange = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => {
      if (Object.is(prev[questionId], value)) {
        return prev;
      }

      return {
        ...prev,
        [questionId]: value,
      };
    });
  }, [setAnswers]);

  const questionMetaById = useMemo(() => {
    const meta = new Map<string, { hasAnswer: boolean; status: string }>();

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const strategy = QuestionRegistry.get(question.type);
      const hasAnswer = strategy
        ? strategy.hasAnswer(userAnswer, question)
        : !(
          userAnswer === undefined ||
          userAnswer === null ||
          (Array.isArray(userAnswer) && userAnswer.length === 0) ||
          (typeof userAnswer === 'string' && userAnswer.trim() === '')
        );

      let status = 'unanswered';

      if (hasAnswer) {
        if (question.type === 'essay') {
          status = feedbacks?.[question.id] ? 'graded' : 'ungraded';
        } else {
          status = strategy?.isCorrect(userAnswer, question) ? 'correct' : 'incorrect';
        }
      }

      meta.set(question.id, { hasAnswer, status });
    });

    return meta;
  }, [questions, answers, feedbacks]);

  const questionTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      single: 0,
      multiple: 0,
      essay: 0,
      short_answer: 0,
      matching: 0,
    };

    questions.forEach((question) => {
      const typeKey = question.type === 'multi' ? 'multiple' : question.type;
      if (typeKey in counts) {
        counts[typeKey] += 1;
      }
    });

    return counts;
  }, [questions]);

  const answeredCount = useMemo(() => {
    let count = 0;
    questions.forEach((q) => {
      if (questionMetaById.get(q.id)?.hasAnswer) {
        count += 1;
      }
    });
    return count;
  }, [questions, questionMetaById]);

  useEffect(() => {
    if (!isSheetOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSheetOpen]);

  if (isGrading) {
    return (
      <div className="inset-0 absolute z-[100] bg-white flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-slate-800 italic font-serif">Đang chấm điểm...</h2>
        <p className="text-sm text-slate-400">Hệ thống AI đang phân tích nội dung bài làm của bạn.</p>
      </div>
    );
  }

  if (showResult) {
    const correctCount = activeAttempt?.correct ?? 0;
    const wrongCount = activeAttempt?.wrong ?? 0;
    const pendingCount = activeAttempt?.pendingEssay ?? 0;
    const unansweredCount = activeAttempt?.unanswered ?? 0;
    const totalGraded = (activeAttempt?.total ?? questions.length) - pendingCount;

    return (
      <div className={`fixed inset-0 z-50 md:absolute md:inset-0 flex flex-col md:flex-row h-full max-h-[100dvh] bg-slate-50 overflow-hidden w-full ${isResizing ? 'select-none' : ''}`}>
        {/* Sidebar */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className={`hidden md:flex bg-white border-r border-slate-200 flex-col p-6 shadow-sm z-10 h-full shrink-0 relative transition-all duration-75 ${sidebarWidth === 0 ? '!p-0 !border-r-0 !w-0 overflow-hidden' : ''
            }`}
        >
          <div className="mb-4 pb-4 border-b border-slate-100 shrink-0">
            <div className="text-sm font-bold text-slate-700 truncate">{examName}</div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4">
            <div className="grid grid-cols-5 gap-2 content-start">
              {questions.map((q, idx) => {
                const status = questionMetaById.get(q.id)?.status ?? 'unanswered';
                const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.unanswered;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowDetails(true);
                      setTimeout(() => scrollToQuestion(idx), 50);
                    }}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${config.btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chú thích màu sắc */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] space-y-2 text-slate-500 font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-green-600"></span>
              <span>Đúng / Đã chấm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
              <span>Chưa đúng</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Chưa chấm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span>
              <span>Chưa làm</span>
            </div>
          </div>
        </div>

        {/* Resizer bar (desktop only) */}
        <div
          onMouseDown={startResizing}
          className={`hidden md:flex w-3 cursor-col-resize hover:bg-indigo-500/80 bg-slate-200/40 transition-all z-20 h-full shrink-0 items-center justify-center group ${isResizing ? 'bg-indigo-600 w-1.5' : ''
            }`}
        >
          <div className="w-[1.5px] h-8 bg-slate-300 rounded group-hover:bg-indigo-300 transition-colors" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 py-6 sm:p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto w-full py-6 sm:py-10 pb-32">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-slate-800 tracking-tight italic font-serif">{examName}</h2>
              <p className="text-slate-500">
                {activeAttempt?.timestamp
                  ? `Thời gian nộp bài: ${new Date(activeAttempt.timestamp).toLocaleString('vi-VN')}`
                  : 'Bạn đã hoàn thành tất cả các nội dung ôn tập.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Thống kê bài làm */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 italic font-serif border-b border-slate-100 pb-3">Thống kê bài làm</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-indigo-505 text-indigo-500 uppercase font-bold tracking-widest mb-1">Điểm trắc nghiệm</p>
                    <p className="text-4xl font-bold text-indigo-700 italic font-serif">
                      {correctCount}
                      <span className="text-xl text-indigo-300 font-sans mx-1.5">/</span>
                      {totalGraded}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-green-600 uppercase font-bold tracking-widest mb-0.5">Đúng</p>
                    <p className="text-xl font-bold text-green-700">{correctCount}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-red-600 uppercase font-bold tracking-widest mb-0.5">Sai</p>
                    <p className="text-xl font-bold text-red-700">{wrongCount}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-amber-600 uppercase font-bold tracking-widest mb-0.5">Chưa chấm</p>
                    <p className="text-xl font-bold text-amber-700">{pendingCount}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Chưa làm</p>
                    <p className="text-xl font-bold text-slate-700">{unansweredCount}</p>
                  </div>
                </div>
              </div>

              {/* Thống kê đề bài */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 italic font-serif border-b border-slate-100 pb-3 mb-4">Cấu trúc đề thi</h3>
                  <div className="space-y-2.5">
                    {[
                      { key: 'single', label: 'Trắc nghiệm 1 đáp án' },
                      { key: 'multiple', label: 'Trắc nghiệm nhiều đáp án' },
                      { key: 'essay', label: 'Câu hỏi tự luận' },
                      { key: 'short_answer', label: 'Điền đáp án ngắn' },
                      { key: 'matching', label: 'Câu hỏi ghép đôi' },
                    ].map(({ key, label }) => {
                      const count = activeAttempt?.questionTypes?.[key] ?? questionTypeCounts[key] ?? 0;

                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 transition-colors">
                          <span className="text-xs font-semibold text-slate-600">{label}</span>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">{count} câu</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
                  Tổng số câu: {questions.length} câu
                </div>
              </div>
            </div>

            {showDetails && (
              <div className="mb-12 space-y-12">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 italic font-serif border-b border-slate-200 pb-4">
                  <FileText size={24} className="text-indigo-600" /> Chi tiết đáp án
                </h3>
                <div className="space-y-10">
                  {questions.map((q, idx) => {
                    const userAns = answers[q.id];
                    const strategy = QuestionRegistry.get(q.type);
                    const isCorrect = strategy ? strategy.isCorrect(userAns, q) : q.type === 'essay';

                    const status = questionMetaById.get(q.id)?.status ?? 'unanswered';
                    const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.unanswered;

                    return (
                      <div
                        key={q.id}
                        id={`question-${idx}`}
                        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        <div
                          className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 flex items-center justify-center pt-8 pr-8 ${config.circleBgClass}`}
                        >
                          {config.circleIcon}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                            {idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${config.badgeClass}`}
                          >
                            {config.badgeText}
                          </span>

                          <CopySnapshotButton q={q} answers={answers} feedbacks={feedbacks} copyConfig={copyConfig} />
                        </div>

                        <MarkdownRenderer
                          content={q.text}
                          className="quiz-question-text"
                        />

                        <div className="grid grid-cols-1 gap-6 mb-8">
                          {strategy ? (
                            strategy.renderReview({
                              question: q,
                              userAnswer: userAns,
                              isCorrect,
                              feedback: feedbacks[q.id]
                            })
                          ) : (
                            <div className="text-red-500">Dạng câu hỏi không hỗ trợ</div>
                          )}
                        </div>

                        {q.explanation && (
                          <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MessageSquare size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                                  Giải thích chi tiết
                                </p>
                                <MarkdownRenderer content={q.explanation} className="text-sm text-slate-600 leading-relaxed" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-10 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all text-sm cursor-pointer"
              >
                Về bảng điều khiển
              </button>
              <button
                className={`px-10 py-4 rounded-lg font-bold transition-all text-sm border cursor-pointer ${showDetails
                  ? 'bg-slate-900 text-white border-black'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-800'
                  }`}
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết đáp án'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Result Bottom Bar */}
        <div className="shrink-0 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 md:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] z-20 shadow-xs">
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span className="text-green-600">{correctCount}Đ</span>
                <span className="text-slate-300">/</span>
                <span className="text-red-500">{wrongCount}S</span>
              </div>
              <span className="text-slate-500 font-medium ml-1">Bảng câu hỏi</span>
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showDetails
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              }`}
            >
              {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </button>
          </div>
        </div>

        {/* Mobile Bottom Sheet for Result Questions Palette */}
        <QuestionPaletteSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          questions={questions}
          questionMetaById={questionMetaById}
          isResult
          onSelectQuestion={(idx) => {
            setShowDetails(true);
            setTimeout(() => scrollToQuestion(idx), 100);
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 md:absolute md:inset-0 flex flex-col md:flex-row h-full max-h-[100dvh] bg-slate-50 overflow-hidden w-full">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 shadow-sm z-10 h-full shrink-0">
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4">
          <div className="grid grid-cols-5 gap-2 content-start">
            {questions.map((q, idx) => {
              const hasAnswer = questionMetaById.get(q.id)?.hasAnswer ?? false;
              return (
                <button
                  key={idx}
                  onClick={() => scrollToQuestion(idx)}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${hasAnswer ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onFinish}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Nộp bài
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 pb-3 sm:px-8 sm:py-5 shadow-sm z-10 flex justify-between items-center shrink-0 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
          <div>
            <h2 className="text-base sm:text-2xl font-bold text-slate-800 tracking-tight truncate max-w-[50vw]">{examName}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">Đang làm bài</span>
            </div>
          </div>
          {timeLimit > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</span>
              <span
                className={`text-lg sm:text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-600'
                  }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-white">
          <div className="max-w-3xl mx-auto space-y-12 pb-32 pt-4">
            {questions.map((q, idx) => {
              return (
                <QuizQuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  isLast={idx === questions.length - 1}
                  answer={answers[q.id]}
                  onAnswerChange={handleAnswerChange}
                />
              );
            })}

            {/* Mobile End-of-Quiz Submit Card */}
            <div className="md:hidden pt-6 pb-6 flex flex-col items-center text-center gap-3 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Đã đến câu hỏi cuối cùng</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đã làm {answeredCount}/{questions.length} câu. Hãy nộp bài để xem kết quả!
                </p>
              </div>
              <button
                type="button"
                onClick={onFinish}
                className="w-full max-w-xs py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sibling Footer */}
        <div className="shrink-0 bg-white/95 backdrop-blur border-t border-slate-200 px-4 pt-3 flex items-center justify-between gap-3 md:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] z-20">
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Câu hỏi: {answeredCount}/{questions.length}</span>
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            Nộp bài
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal for Questions Palette */}
      <QuestionPaletteSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        questions={questions}
        questionMetaById={questionMetaById}
        answeredCount={answeredCount}
        onSelectQuestion={(idx) => {
          setTimeout(() => scrollToQuestion(idx), 100);
        }}
        onFinish={onFinish}
      />
    </div>
  );
}
