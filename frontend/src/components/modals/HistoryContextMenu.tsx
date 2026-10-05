import { Trash2 } from 'lucide-react';

export interface ContextMenuState {
  x: number;
  y: number;
  attemptId: string;
  subjectId: string;
}

interface HistoryContextMenuProps {
  contextMenu: ContextMenuState;
  onDelete: (subjectId: string, attemptId: string) => void;
  onClose: () => void;
}

export default function HistoryContextMenu({
  contextMenu,
  onDelete,
  onClose,
}: HistoryContextMenuProps) {
  return (
    <div
      className="fixed z-[9999] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-1.5 min-w-[160px] overflow-hidden"
      style={{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        onClick={() => {
          onDelete(contextMenu.subjectId, contextMenu.attemptId);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
      >
        <Trash2 size={16} />
        <span>Xóa lịch sử</span>
      </button>
    </div>
  );
}
