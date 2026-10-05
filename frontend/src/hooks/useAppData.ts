import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AppState, Subject, Attempt } from '../types.ts';
import { getHistory, listSubjects } from '../services/api.ts';
import { attemptFromHistory } from '../mapBackend.ts';

export function useAppData() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId } = useParams();

  const [state, setState] = useState<AppState>({ subjects: [], attempts: [] });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError(null);
      setIsLoadingData(true);
      try {
        const rawSubjects = await listSubjects();
        const iconChoices = ['Calculator', 'Code', 'BookOpen', 'FileText'];
        const subjects: Subject[] = rawSubjects.map((s, i) => ({
          id: s.id,
          name: s.name,
          icon: iconChoices[i % iconChoices.length],
          description: s.config.description || 'Ngân hàng đề và lịch sử được đọc/ghi qua API backend.',
          other_information: s.config.other_information,
        }));
        const subjectIds = rawSubjects.map(s => s.id);
        const historyChunks = await Promise.all(
          subjectIds.map((n) => getHistory(n).catch(() => [] as unknown[]))
        );
        if (cancelled) return;
        const attempts: Attempt[] = [];
        subjectIds.forEach((name, i) => {
          for (const raw of historyChunks[i]) {
            attempts.push(attemptFromHistory(name, raw as Record<string, unknown>));
          }
        });
        setState({ subjects, attempts });

        if (subjects.length > 0 && !subjectId && (location.pathname === '/' || location.pathname === '')) {
          navigate(`/subject/${subjects[0].id}`, { replace: true });
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoadingData && state.subjects.length > 0 && (location.pathname === '/' || location.pathname === '')) {
      navigate(`/subject/${state.subjects[0].id}`, { replace: true });
    }
  }, [isLoadingData, state.subjects, location.pathname, navigate]);

  return {
    state,
    setState,
    isLoadingData,
    setIsLoadingData,
    loadError,
  };
}
