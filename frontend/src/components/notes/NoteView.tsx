import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Loader2, Copy, Check, ListTree } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MarkdownRenderer from '../MarkdownRenderer.tsx';
import NoteOutline from './NoteOutline.tsx';
import { extractToc } from './tocUtils.ts';

interface NoteViewProps {
  notes: string[];
  selectedNote: string | null;
  noteContent: string;
  isLoadingNoteContent: boolean;
  subjectName?: string;
  onBack: () => void;
  onSelectNote: (noteName: string) => void;
  onBackToList?: () => void;
}

export default function NoteView({
  notes,
  selectedNote,
  noteContent,
  isLoadingNoteContent,
  subjectName,
  onBack,
  onSelectNote,
  onBackToList,
}: NoteViewProps) {
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState<boolean>(() => {
    const saved = localStorage.getItem('eduquest_show_toc');
    return saved !== null ? saved === 'true' : window.innerWidth >= 1024;
  });
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Trích xuất danh sách TOC tự động
  const tocItems = useMemo(() => extractToc(noteContent), [noteContent]);

  useEffect(() => {
    setCopied(false);
    setMobileTocOpen(false);
    setActiveHeadingId('');
  }, [selectedNote]);

  // Phím Esc để đóng drawer mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileTocOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scrollspy: theo dõi heading trong viewport của container đọc
  useEffect(() => {
    if (!noteContent || tocItems.length === 0 || isLoadingNoteContent) return;
    const container = contentScrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
            break;
          }
        }
      },
      {
        root: container,
        rootMargin: '0px 0px -75% 0px',
        threshold: 0,
      }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [noteContent, tocItems, isLoadingNoteContent]);

  const toggleToc = () => {
    setShowToc((prev) => {
      const next = !prev;
      localStorage.setItem('eduquest_show_toc', String(next));
      return next;
    });
  };

  const handleScrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    const container = contentScrollRef.current;
    if (container && el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = elRect.top - containerRect.top + container.scrollTop - 24;
      container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setActiveHeadingId(id);
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
    setMobileTocOpen(false);
  };

  const handleCopy = async () => {
    if (!noteContent) return;
    try {
      await navigator.clipboard.writeText(noteContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex">
      {/* Aside Notes List */}
      <aside
        className={`${
          selectedNote ? 'hidden' : 'flex'
        } md:flex w-full md:w-64 bg-slate-50 border-slate-200 md:border-r flex-col shrink-0 h-full`}
      >
        <div className="h-14 sm:h-16 border-b border-slate-200 flex items-center px-4 shrink-0 [padding-top:max(0.5rem,env(safe-area-inset-top))]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Quay lại môn học</span>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {notes.map((noteName) => {
            const lastSlash = noteName.lastIndexOf('/');
            const folder = lastSlash !== -1 ? noteName.slice(0, lastSlash) : '';
            const fileName =
              lastSlash !== -1 ? noteName.slice(lastSlash + 1) : noteName;
            const displayName = fileName.replace(/\.md$/i, '');
            return (
              <button
                key={noteName}
                onClick={() => onSelectNote(noteName)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  selectedNote === noteName
                    ? 'bg-amber-50 text-amber-950 font-bold'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                {folder && (
                  <span className="block text-[10px] font-bold text-amber-800/70 uppercase tracking-wider mb-0.5 truncate">
                    {folder}
                  </span>
                )}
                <span className="truncate block">{displayName}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Content View */}
      <div
        className={`${
          selectedNote ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col min-w-0 h-full`}
      >
        {/* Top Header */}
        <div className="h-14 sm:h-16 border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 [padding-top:max(0.5rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2 min-w-0">
            {onBackToList && (
              <button
                type="button"
                onClick={onBackToList}
                className="md:hidden flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Danh sách</span>
              </button>
            )}
            <h2 className="font-bold text-sm sm:text-xl text-slate-800 italic font-serif truncate max-w-[45vw] sm:max-w-none">
              {selectedNote
                ? selectedNote.includes('/')
                  ? `${selectedNote.slice(
                      0,
                      selectedNote.lastIndexOf('/')
                    )} / ${selectedNote
                      .slice(selectedNote.lastIndexOf('/') + 1)
                      .replace(/\.md$/i, '')}`
                  : selectedNote.replace(/\.md$/i, '')
                : 'Ghi chú'}{' '}
              — {subjectName}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile TOC Trigger Button */}
            {selectedNote && tocItems.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileTocOpen(true)}
                className="md:hidden flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                aria-label="Mở mục lục"
              >
                <ListTree size={14} className="text-amber-600" />
                <span>Mục lục</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                  {tocItems.length}
                </span>
              </button>
            )}

            {/* Desktop TOC Toggle Button */}
            {selectedNote && tocItems.length > 0 && (
              <button
                type="button"
                onClick={toggleToc}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                  showToc
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
                title={showToc ? 'Ẩn mục lục' : 'Hiện mục lục'}
              >
                <ListTree size={14} className={showToc ? 'text-amber-600' : ''} />
                <span>Mục lục</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                  {tocItems.length}
                </span>
              </button>
            )}

            {/* Copy Button */}
            {selectedNote && noteContent && !isLoadingNoteContent && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span className="hidden sm:inline">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span className="hidden sm:inline">Sao chép</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content Body & Desktop TOC */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Reading Container */}
          <div
            ref={contentScrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar"
          >
            <div
              className={`mx-auto transition-all ${
                showToc && tocItems.length > 0 ? 'max-w-3xl' : 'max-w-4xl'
              }`}
            >
              {isLoadingNoteContent ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-amber-400" size={32} />
                </div>
              ) : noteContent ? (
                <MarkdownRenderer
                  content={noteContent}
                  className="prose prose-slate max-w-none"
                />
              ) : (
                <p className="text-slate-400 text-center py-20 italic">
                  Chọn một ghi chú để xem nội dung.
                </p>
              )}
            </div>
          </div>

          {/* Desktop Right TOC Sidebar (Push Layout, w-60) */}
          {selectedNote && showToc && tocItems.length > 0 && (
            <aside className="hidden md:flex w-60 shrink-0 border-l border-slate-200 flex-col h-full bg-white">
              <NoteOutline
                items={tocItems}
                activeId={activeHeadingId}
                onSelectItem={handleScrollToHeading}
                onClose={toggleToc}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Bottom-sheet Drawer */}
      <AnimatePresence>
        {mobileTocOpen && tocItems.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileTocOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl h-[75vh] max-h-[85dvh] flex flex-col overflow-hidden"
            >
              <NoteOutline
                items={tocItems}
                activeId={activeHeadingId}
                onSelectItem={handleScrollToHeading}
                onClose={() => setMobileTocOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
