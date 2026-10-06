interface Cell {
  correct: number;
  wrong: number;
}

interface Props {
  title: string;
  data: Record<string, Cell>;
  emptyText?: string;
}

/** Nhan tieng Viet cho enum do kho cua API (De/Trung binh/Kho/Hon hop). */
export const DIFF_LABEL: Record<string, string> = {
  De: 'Dễ',
  'Trung binh': 'Trung bình',
  Kho: 'Khó',
  'Hon hop': 'Hỗn hợp',
};

/** Bieu do nang luc: chu de / do kho nao sai nhieu - sai it (thuan CSS, khong can lib). */
export default function CompetencyChart({ title, data, emptyText }: Props) {
  const rows = Object.entries(data || {}).map(([name, v]) => {
    const total = (v.correct || 0) + (v.wrong || 0);
    const wrongRate = total ? (v.wrong || 0) / total : 0;
    return { name: DIFF_LABEL[name] ?? name, ...v, total, wrongRate };
  }).sort((a, b) => b.wrongRate - a.wrongRate);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-400">{emptyText || 'Chưa có dữ liệu. Làm bài để hiển thị biểu đồ.'}</p>
      </div>
    );
  }
  const maxWrong = Math.max(1, ...rows.map((r) => r.wrong));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="font-bold text-slate-800 text-sm mb-3">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <div key={`${r.name}-${i}`}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 truncate max-w-[60%]">{r.name}</span>
              <span className="text-slate-500">
                đúng <b className="text-green-600">{r.correct}</b> · sai <b className="text-red-500">{r.wrong}</b>
                {' '}({Math.round(r.wrongRate * 100)}% sai)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500"
                style={{ width: `${Math.max(2, (r.wrong / maxWrong) * (r.wrongRate * 100))}%` }}
                title={`Ty le sai ${Math.round(r.wrongRate * 100)}%`}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mt-3">Sắp xếp giảm dần theo tỉ lệ sai — chủ đề trên cùng là điểm yếu cần ôn lại.</p>
    </div>
  );
}
