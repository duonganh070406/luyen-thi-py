import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Question, Attempt, AppState, QuizParams } from '../types.ts';
import { appendHistory, getExamData, getComprehensiveQuiz } from '../services/api.ts';
import { attemptFromHistory, questionFromApi } from '../mapBackend.ts';

interface UseQuizSessionParams {
  selectedSubjectId: string | null;
  decodedExamName: string | null;
  selectedAttemptId: string | null;
  attempts: Attempt[];
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoadingExamData: React.Dispatch<React.SetStateAction<boolean>>;
  enableAIGrading: boolean;
  selectedExam: string | null;
  defaultQuizConfig: QuizParams;
}

export function useQuizSession({
  selectedSubjectId,
  decodedExamName,
  selectedAttemptId,
  attempts,
  setState,
  setIsLoadingData,
  setIsLoadingExamData,
  enableAIGrading,
  selectedExam,
  defaultQuizConfig,
}: UseQuizSessionParams) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();


  const [quizParams, setQuizParams] = useState<QuizParams>(() => {
    const saved = localStorage.getItem("defaultQuizConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultQuizConfig;
  });

  useEffect(() => {
    if (defaultQuizConfig) {
      setQuizParams(defaultQuizConfig);
    }
  }, [defaultQuizConfig]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [activeExamName, setActiveExamName] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [essayFeedbacks, setEssayFeedbacks] = useState<Record<string, string>>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [justSubmittedAttemptId, setJustSubmittedAttemptId] = useState<string | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);

  // 1. Tải đề thi cụ thể từ URL
  useEffect(() => {
    const isExamPath = location.pathname.includes('/exam/') || location.pathname.includes('/flashcard/');
    if (!selectedSubjectId || !isExamPath || !decodedExamName) return;

    const limit = parseInt(searchParams.get('timeLimit') || '0');

    async function fetchQuestions() {
      const saved = localStorage.getItem("active_quiz_session");
      if (saved) {
        try {
          const session = JSON.parse(saved);
          if (session.subjectId === selectedSubjectId && session.url === (location.pathname + location.search)) {
            setActiveQuizQuestions(session.questions);
            setActiveExamName(session.examName);
            setQuizAnswers(session.answers);
            setEssayFeedbacks(session.essayFeedbacks || {});
            setQuizStartTime(session.quizStartTime);
            setTimeLimit(session.timeLimit);
            setTimeLeft(session.timeLeft);
            setCurrentQuestionIndex(session.currentQuestionIndex || 0);
            setShowResult(false);
            return;
          }
        } catch (e) {
          console.error("Lỗi khôi phục session", e);
        }
      }

      setIsLoadingExamData(true);
      try {
        const raw = await getExamData(selectedSubjectId!, decodedExamName!);
        const qs = raw.map(r => questionFromApi(selectedSubjectId!, r as Record<string, unknown>));
        setActiveQuizQuestions(qs);
        setActiveExamName(decodedExamName!.replace('.json', ''));
        setCurrentQuestionIndex(0);
        setQuizAnswers({});
        setEssayFeedbacks({});
        setQuizStartTime(Date.now());
        setShowResult(false);
        if (limit > 0) {
          setTimeLimit(limit);
          setTimeLeft(limit * 60);
        } else {
          setTimeLimit(0);
          setTimeLeft(0);
        }
      } catch (e) {
        console.error("Error fetching exam questions:", e);
        navigate(`/subject/${selectedSubjectId}`);
      } finally {
        setIsLoadingExamData(false);
      }
    }

    if (activeQuizQuestions.length === 0 || activeExamName !== decodedExamName.replace('.json', '')) {
      fetchQuestions();
    }
  }, [selectedSubjectId, decodedExamName, location.pathname, searchParams]);

  // 2. Tạo đề ngẫu nhiên từ URL
  useEffect(() => {
    const isRandomQuizPath = location.pathname.endsWith('/quiz/random');
    if (!selectedSubjectId || !isRandomQuizPath) return;

    const configStr = searchParams.get('config');
    let configObj: QuizParams = {
      num_questions: 40,
      single: 0.7,
      multi: 0.2,
      essay: 0,
      short_answer: 0.1,
      matching: 0,
      sources: []
    };
    if (configStr) {
      try {
        configObj = JSON.parse(decodeURIComponent(configStr));
      } catch (e) {
        console.error("Lỗi parse config từ URL", e);
      }
    }
    const limit = parseInt(searchParams.get('timeLimit') || '0');

    async function generateQuiz() {
      const saved = localStorage.getItem("active_quiz_session");
      if (saved) {
        try {
          const session = JSON.parse(saved);
          if (session.subjectId === selectedSubjectId && session.url === (location.pathname + location.search)) {
            setActiveQuizQuestions(session.questions);
            setActiveExamName(session.examName);
            setQuizAnswers(session.answers);
            setEssayFeedbacks(session.essayFeedbacks || {});
            setQuizStartTime(session.quizStartTime);
            setTimeLimit(session.timeLimit);
            setTimeLeft(session.timeLeft);
            setCurrentQuestionIndex(session.currentQuestionIndex || 0);
            setShowResult(false);
            return;
          }
        } catch (e) {
          console.error("Lỗi khôi phục session ngẫu nhiên", e);
        }
      }

      setIsLoadingData(true);
      try {
        const raw = await getComprehensiveQuiz(selectedSubjectId!, configObj);
        const selected = raw.map(r => questionFromApi(selectedSubjectId!, r as Record<string, unknown>));
        if (selected.length === 0) {
          alert("Không tìm thấy câu hỏi phù hợp để tạo đề!");
          navigate(`/subject/${selectedSubjectId}`);
          return;
        }
        setActiveQuizQuestions(selected);
        setActiveExamName('Đề ngẫu nhiên');
        setCurrentQuestionIndex(0);
        setQuizAnswers({});
        setEssayFeedbacks({});
        setQuizStartTime(Date.now());
        setShowResult(false);
        if (limit > 0) {
          setTimeLimit(limit);
          setTimeLeft(limit * 60);
        } else {
          setTimeLimit(0);
          setTimeLeft(0);
        }
      } catch (e) {
        console.error(e);
        alert("Lỗi khi tạo đề ôn tập tổng hợp");
        navigate(`/subject/${selectedSubjectId}`);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (activeQuizQuestions.length === 0 || activeExamName !== 'Đề ngẫu nhiên') {
      generateQuiz();
    }
  }, [selectedSubjectId, location.pathname, searchParams]);

  // 3. Tải attempt lịch sử từ URL
  useEffect(() => {
    const isHistoryPath = location.pathname.includes('/history/');
    if (!selectedSubjectId || !isHistoryPath || !selectedAttemptId || attempts.length === 0) return;

    const att = attempts.find(a => a.id === selectedAttemptId && a.subjectId === selectedSubjectId);
    if (att) {
      const qs = (att.snapshot || []).map(s => questionFromApi(selectedSubjectId!, s));
      setActiveQuizQuestions(qs);
      setQuizAnswers(att.answers);
      setEssayFeedbacks(att.feedbacks || {});
      setShowResult(true);
      setActiveExamName(att.examName || 'Đề ngẫu nhiên');
      setActiveAttempt(att);

      if (justSubmittedAttemptId === selectedAttemptId) {
        setJustSubmittedAttemptId(null);
      }
    } else {
      if (justSubmittedAttemptId === selectedAttemptId) {
        return;
      }
      console.warn("Attempt not found");
      navigate(`/subject/${selectedSubjectId}`);
    }
  }, [selectedSubjectId, selectedAttemptId, attempts, location.pathname, justSubmittedAttemptId]);

  // Auto-save quiz session state to localStorage
  useEffect(() => {
    const isQuizPath = location.pathname.includes('/exam/') ||
      location.pathname.includes('/quiz/');

    if (isQuizPath && selectedSubjectId && activeQuizQuestions.length > 0 && !showResult) {
      const session = {
        subjectId: selectedSubjectId,
        examName: activeExamName,
        url: location.pathname + location.search,
        questions: activeQuizQuestions,
        answers: quizAnswers,
        essayFeedbacks,
        quizStartTime,
        timeLimit,
        timeLeft,
        currentQuestionIndex
      };
      localStorage.setItem("active_quiz_session", JSON.stringify(session));
    }
  }, [
    selectedSubjectId,
    location.pathname,
    location.search,
    activeQuizQuestions,
    activeExamName,
    quizAnswers,
    essayFeedbacks,
    quizStartTime,
    timeLimit,
    timeLeft,
    currentQuestionIndex,
    showResult
  ]);

  // 4. Dọn dẹp trạng thái thi khi thoát khỏi màn hình thi
  useEffect(() => {
    const isQuizPath = location.pathname.includes('/exam/') ||
      location.pathname.includes('/quiz/') ||
      location.pathname.includes('/history/');
    if (!isQuizPath) {
      setActiveQuizQuestions([]);
      setActiveExamName(null);
      setShowResult(false);
      setQuizAnswers({});
      setEssayFeedbacks({});
      setActiveAttempt(null);
      localStorage.removeItem("active_quiz_session");
    }
  }, [location.pathname]);

  const handleStartQuiz = (subjId: string, params: QuizParams) => {
    const configStr = encodeURIComponent(JSON.stringify(params));
    navigate(`/subject/${subjId}/quiz/random?config=${configStr}&timeLimit=${timeLimit}`);
  };

  const handleStartExam = () => {
    if (!selectedExam || !selectedSubjectId) return;
    navigate(`/subject/${encodeURIComponent(selectedSubjectId)}/exam/${encodeURIComponent(selectedExam)}?timeLimit=${timeLimit}`);
  };

  const handleFinishQuiz = async () => {
    if (!selectedSubjectId) return;
    setIsGrading(true);

    const attemptId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `att_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const payload = {
      attemptId,
      examName: activeExamName || 'Đề ngẫu nhiên',
      questions: activeQuizQuestions,
      answers: quizAnswers,
      enableAIGrading
    };

    try {
      const res = await appendHistory(selectedSubjectId, payload);
      if (res.ok && res.attempt) {
        const newAttempt = attemptFromHistory(selectedSubjectId, res.attempt);

        setState((prev) => ({
          ...prev,
          attempts: [...prev.attempts, newAttempt],
        }));

        localStorage.removeItem("active_quiz_session");
        setJustSubmittedAttemptId(attemptId);
        setActiveAttempt(newAttempt);
        navigate(`/subject/${selectedSubjectId}/history/${attemptId}`, { replace: true });
      } else {
        alert("Lỗi khi chấm bài thi.");
      }
    } catch (e) {
      console.error(e);
      alert(`Không ghi được lịch sử lên máy chủ: ${e}`);
    } finally {
      setIsGrading(false);
    }
  };

  return {

    activeAttempt,
    quizParams,
    timeLimit,
    setTimeLimit,
    timeLeft,
    setTimeLeft,
    activeQuizQuestions,
    activeExamName,
    quizAnswers,
    setQuizAnswers,
    essayFeedbacks,
    showResult,
    isGrading,
    handleStartQuiz,
    handleStartExam,
    handleFinishQuiz,
  };
}
