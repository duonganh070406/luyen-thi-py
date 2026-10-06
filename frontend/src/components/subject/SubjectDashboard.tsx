import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  Folder,
  FolderOpen,
  History,
  Loader2,
  Settings2,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Attempt, Question, Subject, QuizParams } from '../../types.ts';
import MarkdownRenderer from '../MarkdownRenderer.tsx';
import Pagination from '../Pagination.tsx';
import RecentErrorItem from '../RecentErrorItem.tsx';
import MostMissedItem from '../MostMissedItem.tsx';

import { ContextMenuState } from '../modals/HistoryContextMenu.tsx';
import SearchBar from '../SearchBar.tsx';

const SECTION_ITEMS = [
  { id: 'most-missed', label: 'Hay sai nhất' },
  { id: 'recent-errors', label: 'Sai gần đây' },
  { id: 'exam-bank', label: 'Đề thi' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'comprehensive', label: 'Ôn tập' },
  { id: 'notes', label: 'Ghi chú' },
] as const;

const SECTION_IDS = SECTION_ITEMS.map((item) => item.id);
const EXAM_PAGE_SIZE = 6;

interface SubjectDashboardProps {
  activeSubject: Subject;
  selectedSubjectId: string;
  subjectStats: { mostMissed: any[]; recentErrors: any[] } | null;
  isLoadingStats: boolean;
  mostMissedPage: number;
  setMostMissedPage: (page: number) => void;
  recentErrorsPage: number;
  setRecentErrorsPage: (page: number) => void;
  historyPage: number;
  setHistoryPage: (page: number) => void;
  pageSize: number;
  exams: string[];
  isLoadingExams: boolean;
  selectedExam: string | null;
  setSelectedExam: (exam: string | null) => void;
  examQuestions: Question[];
  isLoadingExamData: boolean;
  timeLimit: number;
  setTimeLimit: (value: number) => void;
  onStartExam: () => void;
  attempts: Attempt[];
  onOpenHistory: (attemptId: string) => void;
  onContextMenu: (menu: ContextMenuState) => void;
  quizParams: QuizParams;
  onStartQuiz: (subjectId: string, params: QuizParams) => void;
  notes: string[];
  isLoadingNotes: boolean;
  onOpenNote: (noteName: string) => void;
}

export default function SubjectDashboard({
  activeSubject,
  selectedSubjectId,
  subjectStats,
  isLoadingStats,
  mostMissedPage,
  setMostMissedPage,
  recentErrorsPage,
  setRecentErrorsPage,
  historyPage,
  setHistoryPage,
  pageSize,
  exams,
  isLoadingExams,
  selectedExam,
  setSelectedExam,
  examQuestions,
  isLoadingExamData,
  timeLimit,
  setTimeLimit,
  onStartExam,
  attempts,
  onOpenHistory,
  onContextMenu,
  quizParams,
  onStartQuiz,
  notes,
  isLoadingNotes,
  onOpenNote,
}: SubjectDashboardProps) {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'exam' | 'flashcard' | null>(null);
  const [frontPercent, setFrontPercent] = useState<number | string>(100);
  const [localTimeLimit, setLocalTimeLimit] = useState<string>(String(timeLimit));

  const [activeSection, setActiveSection] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const intersectionHeights: Record<string, number> = {};

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        entries.forEach((entry) => {
          intersectionHeights[entry.target.id] = entry.isIntersecting ? entry.intersectionRect.height : 0;
        });

        let currentActive = '';
        let maxHeight = 0;

        for (const sectionId of SECTION_IDS) {
          const height = intersectionHeights[sectionId] || 0;
          if (height > maxHeight) {
            maxHeight = height;
            currentActive = sectionId;
          }
        }

        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 20;
        if (isAtBottom) {
          for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
            const el = document.getElementById(SECTION_IDS[i]);
            if (el) {
              currentActive = SECTION_IDS[i];
              break;
            }
          }
        }

        if (currentActive) {
          setActiveSection(currentActive);
        }
      },
      {
        root: container,
        rootMargin: '0px 0px 0px 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );

    SECTION_IDS.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) {
        observer.observe(el);
      }
    });

    const handleScrollBottom = () => {
      if (isScrollingRef.current) return;

      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 25;
      if (isAtBottom) {
        for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
          const el = document.getElementById(SECTION_IDS[i]);
          if (el) {
            setActiveSection(SECTION_IDS[i]);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScrollBottom);
    handleScrollBottom();

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScrollBottom);
    };
  }, [isLoadingStats, isLoadingExams, isLoadingNotes, notes.length, attempts.length, selectedSubjectId]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      isScrollingRef.current = true;
      setActiveSection(id);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  const presetTemplate = `{
  "num_questions": 40,
  "single": 0.7,
  "multi": 0.2,
  "essay": 0,
  "short_answer": 0.1,
  "matching": 0,
  "sources": []
}`;

  const [jsonText, setJsonText] = useState(() => {
    try {
      if (quizParams && Object.keys(quizParams).length > 0) {
        return JSON.stringify(quizParams, null, 2);
      }
    } catch (e) {
      // ignore
    }
    return presetTemplate;
  });

  useEffect(() => {
    try {
      if (quizParams && Object.keys(quizParams).length > 0) {
        setJsonText(JSON.stringify(quizParams, null, 2));
      }
    } catch (e) {
      // ignore
    }
  }, [quizParams]);

  const handleStartClick = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onStartQuiz(activeSubject.id, parsed);
    } catch (e) {
      alert("Lỗi cú pháp JSON: " + (e as Error).message);
    }
  };

  useEffect(() => {
    setLocalTimeLimit(String(timeLimit));
  }, [timeLimit]);

  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examPage, setExamPage] = useState(1);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedFolderTab, setSelectedFolderTab] = useState<string>('all');

  // Extract folder and file display information
  const examItems = useMemo(() => {
    return exams.map((fullPath) => {
      const lastSlash = fullPath.lastIndexOf('/');
      const folder = lastSlash !== -1 ? fullPath.slice(0, lastSlash) : '';
      const fileName = lastSlash !== -1 ? fullPath.slice(lastSlash + 1) : fullPath;
      const displayName = fileName.replace(/\.md$/i, '').replace('.json', '');
      return {
        fullPath,
        folder,
        fileName,
        displayName,
      };
    });
  }, [exams]);

  // Unique folders list (sorted with Vietnamese collation)
  const availableFolders = useMemo(() => {
    const folderSet = new Set<string>();
    let hasRootFiles = false;
    for (const item of examItems) {
      if (item.folder) {
        folderSet.add(item.folder);
      } else {
        hasRootFiles = true;
      }
    }
    const sorted = Array.from(folderSet).sort((a, b) =>
      a.localeCompare(b, 'vi', { sensitivity: 'base' })
    );
    return {
      folders: sorted,
      hasRootFiles,
      hasSubfolders: sorted.length > 0,
    };
  }, [examItems]);

  // Reset page, query, and folder tab on subject change
  useEffect(() => {
    setExamPage(1);
    setExamSearchQuery('');
    setSelectedFolderTab('all');
    setHistoryPage(1);
    setHistorySearchQuery('');
  }, [selectedSubjectId]);

  // Reset exam page on search query change or folder tab change
  useEffect(() => {
    setExamPage(1);
  }, [examSearchQuery, selectedFolderTab]);

  // Reset history page on search query change
  useEffect(() => {
    setHistoryPage(1);
  }, [historySearchQuery]);

  useEffect(() => {
    setSelectedMode(null);
  }, [selectedExam]);

  // 1. Filter by folder tab
  const tabFilteredExams = useMemo(() => {
    if (selectedFolderTab === 'all') return examItems;
    if (selectedFolderTab === '__root__') return examItems.filter(item => !item.folder);
    return examItems.filter(item => item.folder === selectedFolderTab);
  }, [examItems, selectedFolderTab]);

  // 2. Sort alphabetically (case-insensitive, local compare for Vietnamese support)
  const sortedExams = useMemo(() => {
    return [...tabFilteredExams].sort((a, b) =>
      a.fullPath.localeCompare(b.fullPath, 'vi', { sensitivity: 'base' })
    );
  }, [tabFilteredExams]);

  // 3. Filter by search query
  const filteredExams = useMemo(() => {
    if (!examSearchQuery.trim()) return sortedExams;
    const query = examSearchQuery.toLowerCase();
    return sortedExams.filter(item =>
      item.displayName.toLowerCase().includes(query) ||
      item.folder.toLowerCase().includes(query) ||
      item.fullPath.toLowerCase().includes(query)
    );
  }, [sortedExams, examSearchQuery]);

  const paginatedExams = useMemo(() => {
    return filteredExams.slice((examPage - 1) * EXAM_PAGE_SIZE, examPage * EXAM_PAGE_SIZE);
  }, [filteredExams, examPage]);

  const totalExamPages = useMemo(() => {
    return Math.ceil(filteredExams.length / EXAM_PAGE_SIZE);
  }, [filteredExams]);

  const selectedItem = useMemo(() => {
    if (!selectedExam) return null;
    return (
      examItems.find(i => i.fullPath === selectedExam) || {
        fullPath: selectedExam,
        folder: selectedExam.includes('/') ? selectedExam.slice(0, selectedExam.lastIndexOf('/')) : '',
        fileName: selectedExam.includes('/') ? selectedExam.slice(selectedExam.lastIndexOf('/') + 1) : selectedExam,
        displayName: (selectedExam.includes('/') ? selectedExam.slice(selectedExam.lastIndexOf('/') + 1) : selectedExam).replace(/\.md$/i, '').replace('.json', ''),
      }
    );
  }, [selectedExam, examItems]);

  const subjectAttempts = useMemo(() => {
    return attempts
      .filter((attempt) => attempt.subjectId === selectedSubjectId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [attempts, selectedSubjectId]);

  const filteredHistoryAttempts = useMemo(() => {
    if (!historySearchQuery.trim()) {
      return subjectAttempts;
    }

    const query = historySearchQuery.toLowerCase();
    return subjectAttempts.filter((attempt) => (
      (attempt.examName || 'Đề ngẫu nhiên').toLowerCase().includes(query) ||
      attempt.id.toLowerCase().includes(query)
    ));
  }, [subjectAttempts, historySearchQuery]);

  const totalHistoryPages = useMemo(() => {
    return Math.ceil(filteredHistoryAttempts.length / pageSize);
  }, [filteredHistoryAttempts.length, pageSize]);

  const pagedHistoryAttempts = useMemo(() => {
    return filteredHistoryAttempts.slice((historyPage - 1) * pageSize, historyPage * pageSize);
  }, [filteredHistoryAttempts, historyPage, pageSize]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar pb-32"
      >
        <div className="relative max-w-4xl mx-auto px-4 py-6 sm:p-8 md:p-10">
          {/* Sticky Anchor Navigation Wrapper (chi hien khi du cho trong: man hinh >= 2xl) */}
          <div className="absolute left-0 top-0 h-full hidden 2xl:block pointer-events-none">
            <div className="sticky top-4 z-30 -ml-44 w-36 space-y-2 bg-white/85 backdrop-blur-md p-3.5 rounded-3xl border border-slate-100 shadow-lg pointer-events-auto">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Mục lục nhanh</p>
              {SECTION_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-12">
            {/* 1. Bắt đầu ôn tập */}
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32"></div>
          <div className="flex-1 relative z-10 w-full">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 italic font-serif mb-3 sm:mb-4 leading-tight">{activeSubject.name}</h2>
            <p className="text-slate-500 leading-relaxed max-w-xl text-sm sm:text-base">{activeSubject.description}</p>

            {activeSubject.other_information && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-slate-50/80 border border-slate-100 rounded-2xl sm:rounded-3xl text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-slate-700 block mb-1">Thông tin bổ sung:</span>
                <span className="whitespace-pre-line leading-relaxed">{activeSubject.other_information}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Câu hỏi hay sai nhất */}
        <div id="most-missed" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-2xl text-slate-800 tracking-tight italic font-serif">Câu hỏi hay sai nhất</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoadingStats ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : subjectStats?.mostMissed.length ? (
              <>
                {subjectStats.mostMissed
                  .slice((mostMissedPage - 1) * pageSize, mostMissedPage * pageSize)
                  .map((item: any, i: number) => (
                    <MostMissedItem key={item.question.id} item={item} i={(mostMissedPage - 1) * pageSize + i} />
                  ))}
                <Pagination
                  current={mostMissedPage}
                  total={Math.ceil(subjectStats.mostMissed.length / pageSize)}
                  onChange={setMostMissedPage}
                />
              </>
            ) : (
              <p className="py-10 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-3xl">Bạn chưa sai câu nào ở môn này.</p>
            )}
          </div>
        </div>

        {/* 3. Sai gần đây */}
        <div id="recent-errors" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-2xl text-slate-800 tracking-tight italic font-serif">Sai gần đây</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoadingStats ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : subjectStats?.recentErrors.length ? (
              <>
                {subjectStats.recentErrors
                  .slice((recentErrorsPage - 1) * pageSize, recentErrorsPage * pageSize)
                  .map((q: any, i: number) => (
                    <RecentErrorItem key={q.id} q={q} i={(recentErrorsPage - 1) * pageSize + i} />
                  ))}
                <Pagination
                  current={recentErrorsPage}
                  total={Math.ceil(subjectStats.recentErrors.length / pageSize)}
                  onChange={setRecentErrorsPage}
                />
              </>
            ) : (
              <p className="py-10 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-3xl">Bạn chưa sai câu nào gần đây.</p>
            )}
          </div>
        </div>

        {/* 4. Ngân hàng đề thi */}
        <div id="exam-bank" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-slate-800 tracking-tight italic font-serif">Ngân hàng đề thi</h3>
                {availableFolders.hasSubfolders && (
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {examItems.length} đề thi trong {availableFolders.folders.length} thư mục
                  </p>
                )}
              </div>
            </div>

            {/* Thanh tìm kiếm đề thi */}
            {!isLoadingExams && exams.length > 0 && (
              <SearchBar
                value={examSearchQuery}
                onChange={setExamSearchQuery}
                placeholder="Tìm kiếm đề thi hoặc thư mục..."
                className="sm:max-w-xs md:max-w-md"
              />
            )}
          </div>

          {/* Thanh Tab Thư mục (nếu môn học có chứa thư mục con) */}
          {!isLoadingExams && availableFolders.hasSubfolders && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => setSelectedFolderTab('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFolderTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                <Folder size={14} />
                <span>Tất cả ({examItems.length})</span>
              </button>

              {availableFolders.hasRootFiles && (
                <button
                  onClick={() => setSelectedFolderTab('__root__')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedFolderTab === '__root__'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <FileText size={14} />
                  <span>Đề chung ({examItems.filter(i => !i.folder).length})</span>
                </button>
              )}

              {availableFolders.folders.map((folderName) => {
                const count = examItems.filter(i => i.folder === folderName).length;
                const isSelected = selectedFolderTab === folderName;
                return (
                  <button
                    key={folderName}
                    onClick={() => setSelectedFolderTab(folderName)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                    }`}
                  >
                    {isSelected ? <FolderOpen size={14} /> : <Folder size={14} />}
                    <span>{folderName} ({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingExams ? (
              <div className="col-span-full py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : paginatedExams.length ? (
              paginatedExams.map((item) => (
                <button
                  key={item.fullPath}
                  onClick={() => setSelectedExam(item.fullPath)}
                  className={`p-6 rounded-[32px] border transition-all text-left group relative overflow-hidden ${
                    selectedExam === item.fullPath
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100'
                      : 'border-slate-100 bg-white hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex-1 min-w-0">
                      {item.folder && selectedFolderTab === 'all' && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-1.5">
                          <Folder size={10} />
                          <span className="truncate max-w-[200px]">{item.folder}</span>
                        </div>
                      )}
                      <h4 className={`whitespace-normal break-words font-medium ${selectedExam === item.fullPath ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
                        {item.displayName}
                      </h4>
                    </div>
                    {selectedExam === item.fullPath && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse flex-shrink-0"></div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-[40px]">
                {examSearchQuery ? 'Không tìm thấy đề thi phù hợp.' : 'Chưa có đề thi nào trong thư mục này.'}
              </div>
            )}
          </div>

          {filteredExams.length > EXAM_PAGE_SIZE && (
            <Pagination
              current={examPage}
              total={totalExamPages}
              onChange={setExamPage}
            />
          )}

          <AnimatePresence mode="wait">
            {selectedExam && (
              <motion.div
                key={selectedExam}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pt-4"
              >
                {selectedMode === null ? (
                  <div className="bg-white p-5 sm:p-8 md:p-10 border border-slate-200 rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-sm space-y-6 sm:space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Đề thi đã chọn</h4>
                        {selectedItem?.folder ? (
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider inline-flex items-center gap-1">
                              <Folder size={12} /> {selectedItem.folder}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 italic font-serif leading-tight">{selectedItem.displayName}</h3>
                          </div>
                        ) : (
                          <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 italic font-serif leading-tight">{selectedItem?.displayName}</h3>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedExam(null)}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        Đóng
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <button
                        onClick={() => setSelectedMode('exam')}
                        className="p-5 sm:p-8 rounded-2xl sm:rounded-[36px] border-2 border-slate-100 hover:border-indigo-600 bg-white hover:shadow-xl transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-800 font-serif mb-1.5 sm:mb-2">Làm đề thi (Exam Mode)</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">Làm đề thi chính thức với giới hạn thời gian tự chọn và chấm điểm tự động từ hệ thống.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMode('flashcard');
                        }}
                        className="p-5 sm:p-8 rounded-2xl sm:rounded-[36px] border-2 border-slate-100 hover:border-amber-500 bg-white hover:shadow-xl transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
                          <Layers size={24} />
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-800 font-serif mb-1.5 sm:mb-2">Thẻ ghi nhớ (Flashcard Mode)</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">Ôn tập bằng phương pháp lật thẻ ghi nhớ, tự đánh giá kết quả và thống kê tiến độ.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedMode(null)}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <ArrowLeft size={12} /> Quay lại chọn chế độ
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-5 sm:p-8 bg-indigo-900 rounded-2xl sm:rounded-3xl md:rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                      <div className="relative z-10">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2">
                          {selectedMode === 'exam' ? 'Chế độ làm đề thi' : 'Chế độ thẻ ghi nhớ'}
                        </h4>
                        {selectedItem?.folder && (
                          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Folder size={12} /> {selectedItem.folder}
                          </p>
                        )}
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold italic font-serif leading-tight">{selectedItem?.displayName || selectedExam.replace('.json', '')}</h3>
                        <p className="text-indigo-200 text-sm mt-2 font-medium">Tổng cộng {examQuestions.length} câu hỏi trong đề này.</p>
                      </div>
                      <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
                        {selectedMode === 'exam' ? (
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-indigo-300/30">
                            <label className="text-xs font-bold text-indigo-100 whitespace-nowrap">Thời gian (phút):</label>
                            <input
                              type="number"
                              min="0"
                              value={localTimeLimit}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalTimeLimit(val);
                                setTimeLimit(parseInt(val, 10) || 0);
                              }}
                              className="w-16 bg-transparent text-white font-bold outline-none border-b border-indigo-300 focus:border-white text-center"
                              placeholder="0"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-indigo-300/30">
                            <label className="text-xs font-bold text-indigo-100 whitespace-nowrap">Tỷ lệ mặt trước (%):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={frontPercent}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  setFrontPercent('');
                                } else {
                                  const parsed = parseInt(val, 10);
                                  if (!isNaN(parsed)) {
                                    setFrontPercent(Math.max(0, Math.min(100, parsed)));
                                  }
                                }
                              }}
                              className="w-16 bg-transparent text-white font-bold outline-none border-b border-indigo-300 focus:border-white text-center"
                              placeholder="100"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (selectedMode === 'exam') {
                              onStartExam();
                            } else {
                              const percent = frontPercent === '' ? 100 : Number(frontPercent);
                              navigate(`/subject/${encodeURIComponent(selectedSubjectId)}/flashcard/${encodeURIComponent(selectedExam)}?frontPercent=${percent}`);
                            }
                          }}
                          disabled={isLoadingExamData || examQuestions.length === 0}
                          className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-indigo-900 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-3 italic font-serif cursor-pointer"
                        >
                          Bắt đầu ôn tập <ArrowLeft className="rotate-180" size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {isLoadingExamData ? (
                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-200" size={32} /></div>
                      ) : (
                        examQuestions.map((q, idx) => (
                          <div key={q.id} className="bg-white p-6 rounded-[28px] border border-slate-100 flex items-center gap-6 hover:border-indigo-100 transition-all group shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <MarkdownRenderer content={q.text} className="font-medium text-slate-800 line-clamp-1" />
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {q.type === 'single' ? 'Một đáp án' : q.type === 'multi' ? 'Nhiều đáp án' : q.type === 'short_answer' ? 'Điền đáp án' : 'Tự luận'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. Lịch sử làm bài */}
        <div id="history" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <History size={20} />
              </div>
              <h3 className="font-bold text-2xl text-slate-800 tracking-tight italic font-serif">Lịch sử làm bài</h3>
            </div>
            {subjectAttempts.length > 0 && (
              <SearchBar
                value={historySearchQuery}
                onChange={setHistorySearchQuery}
                placeholder="Tìm kiếm lịch sử làm bài..."
                className="sm:max-w-xs md:max-w-md"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {subjectAttempts.length === 0 ? (
              <p className="py-10 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-3xl">
                Bạn chưa có lịch sử làm bài cho môn này.
              </p>
            ) : filteredHistoryAttempts.length > 0 ? (
                <>
                  {pagedHistoryAttempts.map((att, i) => (
                    <div
                      key={att.id}
                      onClick={() => onOpenHistory(att.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          attemptId: att.id,
                          subjectId: att.subjectId,
                        });
                      }}
                      className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all shadow-sm cursor-pointer group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {(historyPage - 1) * pageSize + i + 1}
                        </div>
                        <div>
                          <h4 className="text-slate-800">{att.examName || 'Đề ngẫu nhiên'}</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Lần làm bài #{att.id.slice(0, 8)} • {new Date(att.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Điểm số</p>
                          <p className="text-xl font-bold text-indigo-600 italic font-serif">{att.score}/{att.total}</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                  <Pagination
                    current={historyPage}
                    total={totalHistoryPages}
                    onChange={setHistoryPage}
                  />
                </>
            ) : (
              <p className="py-10 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-3xl">
                Không tìm thấy lịch sử làm bài phù hợp.
              </p>
            )}
          </div>
        </div>

        {/* 6. Ôn tập tổng hợp */}
        <div id="comprehensive" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Settings2 size={20} />
            </div>
            <h3 className="font-bold text-2xl text-slate-800 tracking-tight italic font-serif">Ôn tập tổng hợp</h3>
          </div>

          <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm hover:border-indigo-100 transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-500 text-sm max-w-xl mb-8">Hệ thống sẽ lấy tất cả câu hỏi từ các đề thi của môn học này và tạo một đề ngẫu nhiên theo cấu hình JSON của bạn.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cấu hình Đề thi (JSON)</label>
                  <button
                    type="button"
                    onClick={() => setJsonText(presetTemplate)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Cấu hình mặc định
                  </button>
                </div>

                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full h-48 px-5 py-4 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-mono text-sm leading-relaxed"
                  placeholder="Nhập cấu hình JSON tại đây..."
                />
              </div>

              <div className="pt-8">
                <button
                  onClick={handleStartClick}
                  className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all italic font-serif flex items-center justify-center gap-3 cursor-pointer"
                >
                  Bắt đầu tạo đề <ArrowLeft className="rotate-180" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Ghi chú */}
        <div id="notes" className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-2xl text-slate-800 tracking-tight italic font-serif">Ghi chú</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingNotes ? (
              <div className="col-span-full py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : notes.length > 0 ? (
              notes.map((noteName) => (
                <button
                  key={noteName}
                  onClick={() => onOpenNote(noteName)}
                  className="p-6 rounded-[32px] border border-slate-100 bg-white hover:border-amber-200 shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-slate-700 group-hover:text-amber-900">
                        {noteName.replace(/\.md$/i, '')}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ghi chú Markdown</p>
                    </div>
                    <ArrowLeft className="rotate-180 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" size={18} />
                  </div>
                </button>
              ))
            ) : (
              <p className="col-span-full py-10 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-[32px]">
                Chưa có ghi chú nào cho môn học này.
              </p>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
