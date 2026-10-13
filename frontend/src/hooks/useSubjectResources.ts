import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../types.ts';
import {
  getSubjectStats,
  deleteHistoryAttempt,
} from '../services/api.ts';
import { ContextMenuState } from '../components/modals/HistoryContextMenu.tsx';

interface UseSubjectResourcesParams {
  selectedSubjectId: string | null;
  activeTab: string;
  selectedAttemptId: string | null;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function useSubjectResources({
  selectedSubjectId,
  activeTab,
  selectedAttemptId,
  setState,
}: UseSubjectResourcesParams) {
  const navigate = useNavigate();

  const [subjectStats, setSubjectStats] = useState<{ mostMissed: any[]; recentErrors: any[] } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

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
    setMostMissedPage(1);
    setRecentErrorsPage(1);
    setHistoryPage(1);
  };

  return {
    subjectStats,
    isLoadingStats,
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
