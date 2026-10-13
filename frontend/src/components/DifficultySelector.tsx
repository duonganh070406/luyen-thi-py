export interface DifficultyOption {
  key: string;
  title: string;
  desc?: string;
  breakdown?: { label: string; pct: string; dot: string }[];
}

export const EXAM_DIFF_LABEL: Record<string, string> = {
  'Hon hop': 'Hỗn hợp',
  De: 'Cơ bản',
  'Trung binh': 'Trung bình',
  Kho: 'Nâng cao',
};

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    key: 'Hon hop',
    title: 'Hỗn hợp',
    desc: 'Lấy ngẫu nhiên câu hỏi ở mọi mức độ.',
  },
  {
    key: 'De',
    title: 'Cơ bản',
    breakdown: [
      { label: 'Dễ', pct: '50%', dot: 'bg-emerald-600' },
      { label: 'Trung bình', pct: '30%', dot: 'bg-amber-500' },
      { label: 'Khó', pct: '20%', dot: 'bg-rose-600' },
    ],
  },
  {
    key: 'Trung binh',
    title: 'Trung bình',
    breakdown: [
      { label: 'Dễ', pct: '30%', dot: 'bg-emerald-600' },
      { label: 'Trung bình', pct: '40%', dot: 'bg-amber-500' },
      { label: 'Khó', pct: '30%', dot: 'bg-rose-600' },
    ],
  },
  {
    key: 'Kho',
    title: 'Nâng cao',
    breakdown: [
      { label: 'Dễ', pct: '20%', dot: 'bg-emerald-600' },
      { label: 'Trung bình', pct: '30%', dot: 'bg-amber-500' },
      { label: 'Khó', pct: '50%', dot: 'bg-rose-600' },
    ],
  },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export default function DifficultySelector({ value, onChange, label = 'Mức độ' }: Props) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-2">{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const isSelected = value === opt.key;
          return (
            <div
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`cursor-pointer rounded-md border p-3.5 transition-all select-none flex flex-col justify-start min-h-[110px] ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Header: Radio + Title */}
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-primary' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="text-[13px] font-bold text-slate-800">
                  {opt.title}
                </span>
              </div>

              {/* Description or Breakdown */}
              {opt.desc ? (
                <p className="text-xs text-slate-500 leading-relaxed pr-1">
                  {opt.desc}
                </p>
              ) : (
                <div className="space-y-1 text-xs">
                  {opt.breakdown?.map((b) => (
                    <div key={b.label} className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${b.dot} shrink-0`} />
                        <span>{b.label}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{b.pct}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
