import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Clock,
  History,
  Loader2,
  Settings2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Attempt, Subject, QuizParams } from '../../types.ts';
import Pagination from '../Pagination.tsx';
import RecentErrorItem from '../RecentErrorItem.tsx';
import MostMissedItem from '../MostMissedItem.tsx';

import { ContextMenuState } from '../modals/HistoryContextMenu.tsx';
import SearchBar from '../SearchBar.tsx';

const SECTION_ITEMS = [
  { id: 'most-missed', label: 'Hay sai nhất' },
  { id: 'recent-errors', label: 'Sai gần đây' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'comprehensive', label: 'Ôn tập' },
] as const;

const SECTION_IDS = SECTION_ITEMS.map((item) => item.id);

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
  attempts: Attempt[];
  onOpenHistory: (attemptId: string) => void;
  onContextMenu: (menu: ContextMenuState) => void;
  quizParams: QuizParams;
  onStartQuiz: (subjectId: string, params: QuizParams) => void;
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
  attempts,
  onOpenHistory,
  onContextMenu,
  quizParams,
  onStartQuiz,
}: SubjectDashboardProps) {

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
  }, [isLoadingStats, attempts.length, selectedSubjectId]);

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

  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Reset history page on subject/search change
  useEffect(() => {
    setHistoryPage(1);
    setHistorySearchQuery('');
  }, [selectedSubjectId]);

  // Reset history page on search query change
  useEffect(() => {
    setHistoryPage(1);
  }, [historySearchQuery]);

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
            ) : (Array.isArray(subjectStats?.mostMissed) && subjectStats.mostMissed.length) ? (
              <>
                {subjectStats.mostMissed
                  .slice((mostMissedPage - 1) * pageSize, mostMissedPage * pageSize)
                  .map((item: any, i: number) => (
                    <MostMissedItem key={item?.question?.id ?? `${(mostMissedPage - 1) * pageSize + i}`} item={item} i={(mostMissedPage - 1) * pageSize + i} />
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
            ) : (Array.isArray(subjectStats?.recentErrors) && subjectStats.recentErrors.length) ? (
              <>
                {subjectStats.recentErrors
                  .slice((recentErrorsPage - 1) * pageSize, recentErrorsPage * pageSize)
                  .map((q: any, i: number) => (
                    <RecentErrorItem key={q?.id ?? `${(recentErrorsPage - 1) * pageSize + i}`} q={q} i={(recentErrorsPage - 1) * pageSize + i} />
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
                            Lần làm bài #{att.id.slice(-6)} • {new Date(att.timestamp).toLocaleString('vi-VN')}
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
              <p className="text-slate-500 text-sm max-w-xl mb-8">Hệ thống sẽ lấy câu hỏi từ ngân hàng đề của môn học này và tạo một đề ngẫu nhiên theo cấu hình JSON của bạn.</p>

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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
