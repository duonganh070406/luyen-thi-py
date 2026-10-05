import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, AppState } from '../types.ts';
import { appendHistory, getAIConfig } from '../services/api.ts';
import { attemptFromHistory } from '../mapBackend.ts';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface FlashcardViewProps {
  questions: Question[];
  isLoading: boolean;
  subjectId: string;
  examName: string;
  onClose: () => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export default function FlashcardView({
  questions,
  isLoading,
  subjectId,
  examName,
  onClose,
  setState,
}: FlashcardViewProps) {
  const location = useLocation();

  // Parse frontPercent from URL query params: ?frontPercent=50
  const parsedFrontPercent = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get('frontPercent');
    if (p) {
      const val = parseInt(p, 10);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        return val;
      }
    }
    return 100; // Default is 100
  }, [location.search]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [assessments, setAssessments] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [aiFeedbacks, setAiFeedbacks] = useState<Record<string, string>>({});
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Per-card initial flip state, computed once when session starts
  const [initialFlipStates, setInitialFlipStates] = useState<boolean[]>([]);

  const currentQuestion = questions[currentIndex];

  // Keyboard shortcuts listener
  useEffect(() => {
    if (isFinished || isLoading || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering shortcuts when typing in a textarea or input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, questions, isFinished, isLoading, currentQuestion]);

  /** Fisher-Yates shuffle to compute per-card initial flip states.
   * Returns array where `false` = front-first, `true` = back-first.
   */
  const computeFlipStates = (count: number, percent: number): boolean[] => {
    const frontCount = Math.round(count * percent / 100);
    // Build array: first `frontCount` entries are front-first (false), rest are back-first (true)
    const states = Array.from({ length: count }, (_, i) => i >= frontCount);
    // Fisher-Yates shuffle for unbiased random distribution
    for (let i = states.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [states[i], states[j]] = [states[j], states[i]];
    }
    return states;
  };

  // Initialize flip states once questions are loaded
  useEffect(() => {
    if (!isLoading && questions.length > 0 && initialFlipStates.length === 0) {
      const states = computeFlipStates(questions.length, parsedFrontPercent);
      setInitialFlipStates(states);
      setIsFlipped(states[0] ?? false);
    }
  }, [isLoading, questions, parsedFrontPercent, initialFlipStates.length]);

  const handleNextCard = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      // Set both flip state and index together — no animation delay needed
      setCurrentIndex(nextIdx);
      setIsFlipped(initialFlipStates[nextIdx] ?? false);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsFlipped(initialFlipStates[prevIdx] ?? false);
    }
  };

  const handleAssess = (status: 'correct' | 'incorrect') => {
    setAssessments(prev => ({ ...prev, [currentQuestion.id]: status }));
    handleNextCard();
  };

  // Call Gemini API directly for essay feedback
  const handleGetAIFeedback = async (q: Question) => {
    const draft = draftAnswers[q.id] || '';
    if (!draft.trim()) {
      alert("Vui lòng nhập câu trả lời nháp trước khi nhận xét AI!");
      return;
    }

    setAiFeedbackLoading(prev => ({ ...prev, [q.id]: true }));
    try {
      const aiConfig = await getAIConfig();
      if (!aiConfig.enableAIGrading) {
        setAiFeedbacks(prev => ({ ...prev, [q.id]: "Tính năng AI chấm điểm đang bị tắt trong cài đặt." }));
        return;
      }

      const activeId = aiConfig.activeProfileId;
      let activeProfile = aiConfig.profiles?.find(p => p.id === activeId);
      if (!activeProfile && aiConfig.profiles?.length > 0) {
        activeProfile = aiConfig.profiles[0];
      }

      if (!activeProfile || !activeProfile.aiApiKey) {
        setAiFeedbacks(prev => ({ ...prev, [q.id]: "Lỗi: Chưa cấu hình API Key cho AI chấm điểm." }));
        return;
      }

      const apiKey = activeProfile.aiApiKey;
      const baseUrl = (activeProfile.aiBaseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/').replace(/\/$/, '') + '/chat/completions';
      const model = activeProfile.aiModel || 'gemini-2.5-flash';

      const prompt = `
Bạn là một giáo viên đang chấm bài tự luận. 
Câu hỏi: "${q.text}"
Câu trả lời của học sinh: "${draft}"
${q.referenceAnswer ? `Câu trả lời tham khảo: "${q.referenceAnswer}"` : ""}

Hãy đưa ra phản hồi ngắn gọn bằng tiếng Việt:
1. Đánh giá câu trả lời có đúng trọng tâm không.
2. Chỉ ra các ý còn thiếu hoặc sai.
3. Gợi ý cách cải thiện.
`;

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || response.statusText);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || "Không thể lấy nhận xét từ AI.";
      setAiFeedbacks(prev => ({ ...prev, [q.id]: text }));
    } catch (e) {
      console.error(e);
      setAiFeedbacks(prev => ({ ...prev, [q.id]: `Lỗi khi gọi AI chấm điểm: ${e instanceof Error ? e.message : e}` }));
    } finally {
      setAiFeedbackLoading(prev => ({ ...prev, [q.id]: false }));
    }
  };

  // Silently save results to backend history
  const handleSaveAndClose = async () => {
    setIsSaving(true);

    const attemptId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `att_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Prepare answers payload map
    const payloadAnswers: Record<string, any> = {};

    // Prepare modified questions array
    const payloadQuestions = questions.map(q => {
      const isCorrect = assessments[q.id] === 'correct';
      let mappedId = q.id;
      let mappedType = q.type;

      if (q.type === 'essay') {
        mappedId = q.id + '_essay';
        if (!isCorrect) {
          mappedType = 'short_answer'; // Force short_answer type on backend to register isCorrect: false
        }
      }

      // Map answers to the correct format for backend grading strategy
      if (q.type === 'single') {
        const caIdx = q.correctAnswers?.[0] ?? 0;
        payloadAnswers[mappedId] = isCorrect ? caIdx : -1;
      } else if (q.type === 'multi') {
        payloadAnswers[mappedId] = isCorrect ? q.correctAnswers ?? [] : [];
      } else if (q.type === 'short_answer') {
        payloadAnswers[mappedId] = isCorrect ? q.referenceAnswer : '__incorrect_flashcard_answer__';
      } else if (q.type === 'matching') {
        payloadAnswers[mappedId] = isCorrect ? q.correctAnswers ?? [] : [9999];
      } else if (q.type === 'essay') {
        if (isCorrect) {
          payloadAnswers[mappedId] = draftAnswers[q.id] || '__correct_essay_draft__';
        } else {
          payloadAnswers[mappedId] = '__incorrect_flashcard_answer__';
        }
      }

      return {
        ...q,
        id: mappedId,
        type: mappedType === 'multi' ? 'multiple' : mappedType, // Map to backend format
      };
    });

    const payload = {
      attemptId,
      examName: `${examName.replace('.json', '')} (Flashcard)`,
      questions: payloadQuestions,
      answers: payloadAnswers,
      enableAIGrading: false // Disable re-grading on backend save to save costs and run instantly
    };

    try {
      const res = await appendHistory(subjectId, payload);
      if (res.ok && res.attempt) {
        const newAttempt = attemptFromHistory(subjectId, res.attempt);
        setState((prev) => ({
          ...prev,
          attempts: [...prev.attempts, newAttempt],
        }));

        // Redirect to history detail view
        window.location.hash = ''; // Ensure no hash interferes with path routing
        window.location.pathname = `/subject/${subjectId}/history/${attemptId}`;
      } else {
        alert("Lỗi khi ghi lịch sử học tập.");
      }
    } catch (e) {
      console.error(e);
      alert(`Không ghi được lịch sử lên máy chủ: ${e}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    // Re-randomise flip states with the same percentage chosen this session
    const newStates = computeFlipStates(questions.length, parsedFrontPercent);
    setInitialFlipStates(newStates);
    setCurrentIndex(0);
    setIsFlipped(newStates[0] ?? false);
    setAssessments({});
    setDraftAnswers({});
    setAiFeedbacks({});
    setIsFinished(false);
  };

  // Compute stats
  const totalCount = questions.length;
  const correctCount = Object.values(assessments).filter(v => v === 'correct').length;
  const incorrectCount = totalCount - correctCount;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700 italic font-serif">Đang tải câu hỏi...</h2>
      </div>
    );
  }



  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy câu hỏi</h2>
        <p className="text-slate-500 mb-6">Đề thi này không có câu hỏi nào để ôn tập.</p>
        <button onClick={onClose} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 pb-3 sm:px-6 sm:py-4 flex items-center justify-between z-10 shrink-0 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thẻ Ghi Nhớ</span>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-[40vw] sm:max-w-xs md:max-w-md">{examName.replace('.json', '')}</h1>
          </div>
        </div>

        {!isFinished && (
          <div className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg">
            <span className="hidden sm:inline">Tiến độ: </span><span className="font-bold text-indigo-600">{currentIndex + 1}</span> / {totalCount}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 relative">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key="active-deck"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-full sm:max-w-xl md:max-w-2xl px-0 sm:px-4 flex flex-col items-center gap-4 sm:gap-8 py-3 sm:py-8"
            >
              {/* Card — conditionally shows front or back face, no animation */}
              <div className="w-full h-[60vh] supports-[height:100dvh]:h-[60dvh] min-h-[380px] max-h-[600px]">
                {!isFlipped ? (
                  /* FRONT FACE */
                  <div
                    className="w-full h-full bg-white rounded-2xl sm:rounded-[32px] border border-slate-200 shadow-md p-5 sm:p-8 md:p-10 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-shadow"
                  >
                    <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1">
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                          Mặt trước: Câu hỏi
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {currentQuestion.type === 'single' ? 'Một đáp án' :
                            currentQuestion.type === 'multi' ? 'Nhiều đáp án' :
                              currentQuestion.type === 'short_answer' ? 'Đáp án ngắn' :
                                currentQuestion.type === 'matching' ? 'Ghép đôi' : 'Tự luận'}
                        </span>
                      </div>

                      <div className="pt-4 flex-1">
                        {currentQuestion.type === 'essay' ? (
                          <MarkdownRenderer content={currentQuestion.text} className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed" />
                        ) : currentQuestion.type === 'matching' ? (
                          <div className="space-y-4">
                            <MarkdownRenderer content={currentQuestion.text} className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed" />
                            <div className="space-y-2">
                              {currentQuestion.leftOptions?.map((leftOpt, idx) => (
                                <div key={idx} className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                                  <span className="font-bold text-indigo-500 mr-2">{idx + 1}.</span>
                                  <MarkdownRenderer content={leftOpt} className="inline" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <MarkdownRenderer content={currentQuestion.text} className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed" />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 flex items-center justify-between border-t border-slate-100 pt-4 sm:pt-5 shrink-0 text-slate-400 text-xs font-semibold">
                      <span className="hidden sm:block">
                        Nhấn <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-500">Space</kbd> hoặc nút <span className="font-bold text-slate-500">Lật thẻ</span> để lật • Nhấn <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-500">←</kbd> để lùi, <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-500">→</kbd> để tiến
                      </span>
                      <span className="sm:hidden text-slate-400 text-xs">Chạm lật thẻ xem đáp án</span>
                      <button type="button" className="text-indigo-600 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0 shrink-0 ml-3 text-xs sm:text-sm" onClick={() => setIsFlipped(true)}>Lật xem đáp án →</button>
                    </div>
                  </div>
                ) : (
                  /* BACK FACE */
                  <div
                    className="w-full h-full bg-white rounded-2xl sm:rounded-[32px] border border-slate-200 shadow-md p-5 sm:p-8 md:p-10 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-shadow"
                  >
                    <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1">
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                          Mặt sau: Đáp án chi tiết
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Đề: {examName.replace('.json', '')}
                        </span>
                      </div>

                      <div className="pt-4 flex-1 space-y-4">
                        {currentQuestion.type === 'single' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-2xl">
                              <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Đáp án đúng</span>
                              <MarkdownRenderer content={currentQuestion.options[currentQuestion.correctAnswers?.[0] ?? 0]} className="font-semibold text-base" />
                            </div>
                          </div>
                        )}

                        {currentQuestion.type === 'multi' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-2xl">
                              <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Các đáp án đúng</span>
                              <ul className="space-y-2">
                                {currentQuestion.correctAnswers?.map((idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm font-semibold">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <MarkdownRenderer content={currentQuestion.options[idx]} className="inline" />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {currentQuestion.type === 'short_answer' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-2xl font-mono">
                              <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Đáp án chính xác</span>
                              <div className="text-lg font-bold">{currentQuestion.referenceAnswer}</div>
                            </div>
                          </div>
                        )}

                        {currentQuestion.type === 'matching' && (
                          <div className="space-y-3">
                            <span className="block text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5">Liên kết ghép đôi đúng</span>
                            <div className="grid grid-cols-1 gap-2">
                              {currentQuestion.leftOptions?.map((leftOpt, lIdx) => {
                                const correctRIdx = currentQuestion.correctAnswers?.[lIdx];
                                const rightOpt = correctRIdx !== undefined && currentQuestion.rightOptions ? currentQuestion.rightOptions[correctRIdx] : '';
                                return (
                                  <div key={lIdx} className="flex items-center justify-between p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 text-xs">
                                    <span className="font-semibold text-slate-700">
                                      {lIdx + 1}. <MarkdownRenderer content={leftOpt} className="inline" />
                                    </span>
                                    <span className="text-slate-400 font-bold px-2">➔</span>
                                    <span className="font-bold text-emerald-700 text-right">
                                      {String.fromCharCode(65 + (correctRIdx ?? 0))}. <MarkdownRenderer content={rightOpt} className="inline" />
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {currentQuestion.type === 'essay' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 text-slate-700 rounded-2xl border border-slate-200">
                                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest mb-1">Bản nháp của bạn</span>
                                <div className="text-sm font-sans italic whitespace-pre-wrap leading-relaxed">
                                  {draftAnswers[currentQuestion.id] || '(Không có câu trả lời nháp)'}
                                </div>
                              </div>
                              <div className="p-4 bg-indigo-50 text-indigo-900 rounded-2xl border border-indigo-100">
                                <span className="font-bold block text-[9px] text-indigo-500 uppercase tracking-widest mb-1">Đáp án tham khảo</span>
                                <MarkdownRenderer content={currentQuestion.referenceAnswer || currentQuestion.explanation || 'Không có đáp án mẫu.'} className="text-sm leading-relaxed" />
                              </div>
                            </div>

                            {/* Direct AI Feedback Panel */}
                            {aiFeedbacks[currentQuestion.id] ? (
                              <div className="p-5 bg-emerald-50/55 border border-emerald-100 rounded-2xl">
                                <span className="font-bold text-[9px] text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <Sparkles size={12} /> Nhận xét từ AI (Gemini):
                                </span>
                                <MarkdownRenderer content={aiFeedbacks[currentQuestion.id]} className="text-xs text-slate-600 leading-relaxed font-sans" />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleGetAIFeedback(currentQuestion)}
                                disabled={aiFeedbackLoading[currentQuestion.id]}
                                className="w-full py-3 border border-dashed border-indigo-200 bg-indigo-50/20 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {aiFeedbackLoading[currentQuestion.id] ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang nhận xét câu trả lời nháp...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={12} /> Nhận xét câu trả lời nháp bằng AI (Gemini)
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {/* General explanation */}
                        {currentQuestion.explanation && currentQuestion.type !== 'essay' && (
                          <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giải thích chi tiết</span>
                            <MarkdownRenderer content={currentQuestion.explanation} className="text-sm leading-relaxed" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Self-Assessment Buttons */}
                    <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 border-t border-slate-100 pt-4 sm:pt-5 shrink-0">
                      <button
                        onClick={() => handleAssess('incorrect')}
                        className="flex-1 min-h-[48px] py-3 sm:py-3.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-50/50"
                      >
                        🔴 Chưa thuộc / Sai
                      </button>
                      <button
                        onClick={() => handleAssess('correct')}
                        className="flex-1 min-h-[48px] py-3 sm:py-3.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-50/50"
                      >
                        🟢 Đã thuộc / Đúng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between w-full max-w-xs shrink-0 pt-2 select-none">
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="w-12 h-12 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  title="Thẻ trước (←)"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-6 py-2.5 rounded-full border border-indigo-100 bg-indigo-50/30 text-indigo-600 text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  Lật thẻ
                </button>

                <button
                  onClick={handleNextCard}
                  className="w-12 h-12 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer"
                  title="Thẻ sau (→)"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </motion.div>
          ) : (
            /* COMPLETION SCREEN */
            <motion.div
              key="completion-screen"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-lg text-center space-y-8 select-none"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-[28px] text-indigo-600 flex items-center justify-center mx-auto shadow-md shadow-indigo-50/20">
                <Check size={40} className="stroke-[3]" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-serif italic text-slate-800 leading-tight">Hoàn thành bộ thẻ!</h2>
                <p className="text-sm text-slate-400 font-medium">Bạn đã học xong toàn bộ thẻ ghi nhớ trong đề thi này.</p>
              </div>

              {/* Progress Summary Card */}
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Mức độ ghi nhớ</span>
                  <span className="text-indigo-600 text-lg font-serif italic">{scorePercent}%</span>
                </div>

                <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-100/50 rounded-2xl text-center">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Đã thuộc</span>
                    <span className="text-xl font-bold text-emerald-700">{correctCount}</span>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-100/50 rounded-2xl text-center">
                    <span className="block text-[10px] font-bold text-red-600 uppercase tracking-widest mb-0.5">Cần học lại</span>
                    <span className="text-xl font-bold text-red-700">{incorrectCount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveAndClose}
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-150 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu lịch sử học tập...
                    </>
                  ) : (
                    <>
                      Lưu kết quả & Xem chi tiết
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    disabled={isSaving}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    Học lại
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    Thoát
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
