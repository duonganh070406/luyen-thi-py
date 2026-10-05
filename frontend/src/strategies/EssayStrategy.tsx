import React from 'react';
import { Sparkles } from 'lucide-react';
import { QuestionStrategy } from './QuestionStrategy.ts';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

export const EssayStrategy: QuestionStrategy = {
  type: 'essay',

  hasAnswer(value: any): boolean {
    return value !== undefined && value !== null && typeof value === 'string' && value.trim() !== '';
  },

  isCorrect(): boolean {
    return true; // Essay questions are graded by AI or informative
  },

  renderInput({ question, value, onChange }) {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập nội dung câu trả lời..."
        className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
      />
    );
  },

  renderReview({ question, userAnswer, feedback }) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 italic text-slate-600 text-sm">
          <p className="font-bold mb-2 text-slate-400 uppercase tracking-widest text-[9px]">
            Bài làm của bạn:
          </p>
          {userAnswer || 'Không có câu trả lời.'}
        </div>

        {feedback && (
          <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-sm">
            <p className="font-bold mb-2 text-green-600 uppercase tracking-widest text-[9px] flex items-center gap-2">
              <Sparkles size={12} /> Nhận xét từ AI:
            </p>
            <MarkdownRenderer content={feedback} className="text-slate-700" />
          </div>
        )}

        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm">
          <p className="font-bold mb-2 text-indigo-400 uppercase tracking-widest text-[9px]">
            Đáp án tham khảo:
          </p>
          <MarkdownRenderer
            content={question.referenceAnswer || question.explanation || 'Không có đáp án mẫu.'}
          />
        </div>
      </div>
    );
  }
};
