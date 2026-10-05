import { useMemo, useState } from 'react';
import { Search, X, ListTree } from 'lucide-react';
import { TocItem } from './tocUtils';

interface NoteOutlineProps {
  items: TocItem[];
  activeId?: string;
  onSelectItem: (id: string) => void;
  onClose?: () => void;
}

export default function NoteOutline({
  items,
  activeId,
  onSelectItem,
  onClose,
}: NoteOutlineProps) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter((item) => item.text.toLowerCase().includes(trimmed));
  }, [items, query]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-white">
      {/* Drag Indicator Bar for Mobile */}
      <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 shrink-0 md:hidden" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <ListTree size={16} className="text-amber-600 shrink-0" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Mục lục
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {items.length}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng mục lục"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Search Input */}
      {items.length > 5 && (
        <div className="p-2 border-b border-slate-100 shrink-0">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lọc tiêu đề..."
              className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Heading List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar overscroll-contain touch-pan-y pb-8">
        {filteredItems.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 italic">
            {query ? 'Không tìm thấy mục nào.' : 'Chưa có đề mục.'}
          </p>
        ) : (
          filteredItems.map((item) => {
            const isActive = activeId === item.id;
            const indentClass =
              item.level === 1
                ? 'pl-2 font-bold text-xs sm:text-[13px]'
                : item.level === 2
                ? 'pl-4 font-medium text-xs'
                : item.level === 3
                ? 'pl-6 text-[11px]'
                : 'pl-8 text-[11px]';

            const levelColor =
              item.level === 1
                ? 'text-slate-800'
                : item.level === 2
                ? 'text-slate-700'
                : item.level === 3
                ? 'text-slate-600'
                : 'text-slate-500';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`w-full text-left py-1.5 pr-2 rounded-md transition-all cursor-pointer truncate block ${indentClass} ${
                  isActive
                    ? 'bg-amber-100/70 text-amber-950 font-bold border-l-2 border-amber-600'
                    : `${levelColor} hover:bg-slate-100/70 border-l-2 border-transparent`
                }`}
                title={item.text}
              >
                {item.text}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
