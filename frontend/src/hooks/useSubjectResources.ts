import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, AppState } from '../types.ts';
import {
  getSubjectStats,
  listExams,
  getExamData,
  listNotes,
  getNoteData,
  deleteHistoryAttempt,
} from '../services/api.ts';
import { questionFromApi } from '../mapBackend.ts';
import { ContextMenuState } from '../components/modals/HistoryContextMenu.tsx';

interface UseSubjectResourcesParams {
  selectedSubjectId: string | null;
  selectedNote: string | null;
  activeTab: string;
  selectedAttemptId: string | null;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function useSubjectResources({
  selectedSubjectId,
  selectedNote,
  activeTab,
  selectedAttemptId,
  setState,
}: UseSubjectResourcesParams) {
  const navigate = useNavigate();

  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isLoadingExamData, setIsLoadingExamData] = useState(false);

  const [subjectStats, setSubjectStats] = useState<{ mostMissed: any[]; recentErrors: any[] } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [notes, setNotes] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState<string>("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingNoteContent, setIsLoadingNoteContent] = useState(false);

  const [exams, setExams] = useState<string[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  const [mostMissedPage, setMostMissedPage] = useState(1);
  const [recentErrorsPage, setRecentErrorsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 5;

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  useEffect(() => {
    if (!selectedSubjectId || activeTab !== 'subject') return;

    async function fetchStats() {
      setIsLoadingStats(true);
      try {
        const stats = await getSubjectStats(selectedSubjectId!);
        setSubjectStats(stats);
      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchStats();
  }, [selectedSubjectId, activeTab]);

  useEffect(() => {
    if (!selectedSubjectId || (activeTab !== 'subject' && activeTab !== 'note')) return;

    async function fetchNotes() {
      setIsLoadingNotes(true);
      try {
        const noteList = await listNotes(selectedSubjectId!);
        setNotes(noteList);
      } catch (e) {
        console.error("Error fetching notes:", e);
        setNotes([]);
      } finally {
        setIsLoadingNotes(false);
      }
    }

    fetchNotes();
  }, [selectedSubjectId, activeTab]);

  useEffect(() => {
    if (!selectedSubjectId || !selectedNote) {
      setNoteContent("");
      return;
    }

    async function fetchNoteContent() {
      setIsLoadingNoteContent(true);
      try {
        const data = await getNoteData(selectedSubjectId!, selectedNote!);
        setNoteContent(data.content || "");
      } catch (e) {
        console.error("Error fetching note content:", e);
        setNoteContent("");
      } finally {
        setIsLoadingNoteContent(false);
      }
    }

    fetchNoteContent();
  }, [selectedSubjectId, selectedNote]);

  useEffect(() => {
    if (!selectedSubjectId || activeTab !== 'subject') return;

    async function fetchExams() {
      setIsLoadingExams(true);
      try {
        const examList = await listExams(selectedSubjectId!);
        setExams(examList);
      } catch (e) {
        console.error("Error fetching exams:", e);
      } finally {
        setIsLoadingExams(false);
      }
    }

    fetchExams();
  }, [selectedSubjectId, activeTab]);

  useEffect(() => {
    if (!selectedSubjectId || !selectedExam) {
      setExamQuestions([]);
      return;
    }

    async function fetchExamQuestions() {
      setIsLoadingExamData(true);
      try {
        const raw = await getExamData(selectedSubjectId!, selectedExam!);
        const qs = raw.map(r => questionFromApi(selectedSubjectId!, r as Record<string, unknown>));
        setExamQuestions(qs);
      } catch (e) {
        console.error("Error fetching exam questions:", e);
      } finally {
        setIsLoadingExamData(false);
      }
    }

    fetchExamQuestions();
  }, [selectedSubjectId, selectedExam]);

  const handleDeleteAttempt = async (subjectId: string, attemptId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch sử bài làm này?")) return;

    try {
      await deleteHistoryAttempt(subjectId, attemptId);

      setState((prev) => ({
        ...prev,
        attempts: prev.attempts.filter((a) => !(a.subjectId === subjectId && a.id === attemptId)),
      }));

      const stats = await getSubjectStats(subjectId);
      setSubjectStats(stats);

      if (attemptId === selectedAttemptId) {
        navigate(`/subject/${subjectId}`);
      }
    } catch (e) {
      console.error(e);
      alert(`Không xóa được lịch sử bài làm: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const resetPagination = () => {
    setSelectedExam(null);
    setMostMissedPage(1);
    setRecentErrorsPage(1);
    setHistoryPage(1);
  };

  return {
    selectedExam,
    setSelectedExam,
    examQuestions,
    isLoadingExamData,
    setIsLoadingExamData,
    subjectStats,
    isLoadingStats,
    notes,
    noteContent,
    isLoadingNotes,
    isLoadingNoteContent,
    exams,
    isLoadingExams,
    mostMissedPage,
    setMostMissedPage,
    recentErrorsPage,
    setRecentErrorsPage,
    historyPage,
    setHistoryPage,
    PAGE_SIZE,
    contextMenu,
    setContextMenu,
    handleDeleteAttempt,
    resetPagination,
  };
}
