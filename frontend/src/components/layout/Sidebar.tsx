import { useEffect, useState } from 'react';
import { ChevronRight, Settings2, X, BookOpen } from 'lucide-react';
import { Subject } from '../../types.ts';

interface SidebarProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  activeTab: string;
  onSelectSubject: (subjectId: string) => void;
  onOpenSettings: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  subjects,
  selectedSubjectId,
  activeTab,
  onSelectSubject,
  onOpenSettings,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        aria-hidden={isMobile && !isOpen ? true : undefined}
        inert={isMobile && !isOpen ? true : undefined}
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col p-6 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex md:w-64 ${
          isOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="flex md:hidden items-center justify-between pb-4 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <BookOpen size={16} />
            </div>
            <span className="font-bold text-slate-800 text-base font-serif italic">EduQuest</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng danh sách môn học"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Danh sách môn học</p>
          <div className="space-y-1">
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectSubject(s.id);
                  onClose?.();
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors text-left cursor-pointer ${
                  selectedSubjectId === s.id && activeTab === 'subject'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="italic font-serif truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              onClose?.();
            }}
            className="w-full p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Settings2 size={16} className="group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-700">Cấu hình hệ thống</h4>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
}

