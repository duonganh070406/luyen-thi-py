import { useState } from 'react';
import { ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface RecentErrorItemProps {
  q: {
    question: string;
    options?: string[];
    correctAnswer?: number | number[];
    explanation?: string;
  };
  i: number;
}

export default function RecentErrorItem({ q, i }: RecentErrorItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-amber-200">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start gap-6 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {i + 1}
        </div>
        <div className="flex-1 pr-8 relative">
          <MarkdownRenderer content={q.question} className="font-medium text-slate-800 leading-relaxed line-clamp-2" />
          <div className="mt-3 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit uppercase tracking-widest">
            Cần ôn tập
          </div>
          <div className={`absolute top-1/2 right-0 -translate-y-1/2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronRight size={20} className="text-slate-300" />
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 bg-slate-50/30 overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung câu hỏi</p>
                <MarkdownRenderer content={q.question} className="quiz-question-text" />
              </div>

              {q.options && (
                <div className="grid grid-cols-1 gap-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Các lựa chọn</p>
                  {q.options.map((opt: string, idx: number) => {
                    const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(idx) : q.correctAnswer === idx;
                    return (
                      <div key={idx} className={`p-4 rounded-2xl border ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-white'} flex items-center gap-3`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <MarkdownRenderer content={opt} className={`text-sm ${isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}`} />
                        {isCorrect && <CheckCircle2 size={16} className="text-green-500 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.explanation && (
                <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                      <MessageSquare size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Giải thích chi tiết</p>
                  </div>
                  <MarkdownRenderer content={q.explanation} className="text-sm text-slate-600 leading-relaxed" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
