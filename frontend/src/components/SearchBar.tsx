import { memo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
  size = 'md',
}: SearchBarProps) {
  const isSm = size === 'sm';

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-700 placeholder-slate-400 font-medium ${
          isSm
            ? 'pl-8 pr-7 py-1.5 rounded-xl text-xs'
            : 'pl-12 pr-10 py-3 rounded-2xl text-sm'
        }`}
      />
      <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isSm ? 'left-2.5' : 'left-4'}`}>
        <Search size={isSm ? 13 : 18} />
      </div>
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ${isSm ? 'right-2' : 'right-4'}`}
          type="button"
        >
          <X size={isSm ? 12 : 16} />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
