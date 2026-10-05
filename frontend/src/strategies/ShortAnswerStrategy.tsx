import React from 'react';
import { QuestionStrategy } from './QuestionStrategy.ts';

export const ShortAnswerStrategy: QuestionStrategy = {
  type: 'short_answer',

  hasAnswer(value: any): boolean {
    return value !== undefined && value !== null && typeof value === 'string' && value.trim() !== '';
  },

  isCorrect(value: any, question): boolean {
    const ua = typeof value === 'string' ? value.trim().toLowerCase() : '';
    const ca = typeof question.referenceAnswer === 'string' ? question.referenceAnswer.trim().toLowerCase() : '';
    return ua === ca;
  },

  renderInput({ question, value, onChange }) {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập đáp án..."
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
      />
    );
  },

  renderReview({ question, userAnswer, isCorrect }) {
    return (
      <div className="space-y-3">
        <div
          className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
            isCorrect ? 'border-green-400 bg-green-50/50' : 'border-red-300 bg-red-50/30'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
            }`}
          >
            {isCorrect ? '✓' : '✗'}
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Bài làm của bạn
            </p>
            <p className="font-mono font-bold text-slate-800">
              {String(userAnswer) || '(Không có câu trả lời)'}
            </p>
          </div>
        </div>
        {!isCorrect && (
          <div className="p-5 rounded-2xl border-2 border-green-400 bg-green-50/50 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-green-500 text-white">
              ✓
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Đáp án đúng
              </p>
              <p className="font-mono font-bold text-green-700">{question.referenceAnswer}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
};
