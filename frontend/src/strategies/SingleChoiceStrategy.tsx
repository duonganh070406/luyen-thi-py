import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { QuestionStrategy } from './QuestionStrategy.ts';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

export const SingleChoiceStrategy: QuestionStrategy = {
  type: 'single',

  hasAnswer(value: any): boolean {
    return value !== undefined && value !== null && value !== -1;
  },

  isCorrect(value: any, question): boolean {
    return question.correctAnswers?.[0] === value;
  },

  renderInput({ question, value, onChange }) {
    return (
      <>
        {question.options?.map((opt: string, oIdx: number) => {
          const isSelected = value === oIdx;
          return (
            <label key={oIdx} className="flex items-start gap-3 cursor-pointer group py-1">
              <div className="pt-0.5">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={isSelected}
                  onChange={() => onChange(oIdx)}
                  className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <MarkdownRenderer
                  content={opt}
                  className={`text-base ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}
                />
              </div>
            </label>
          );
        })}
      </>
    );
  },

  renderReview({ question, userAnswer }) {
    return (
      <>
        {question.options?.map((opt, oIdx) => {
          const isCorrectOption = question.correctAnswers?.includes(oIdx);
          const isSelectedOption = userAnswer === oIdx;

          return (
            <div
              key={oIdx}
              className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                isCorrectOption
                  ? 'border-green-500 bg-green-50/30'
                  : isSelectedOption && !isCorrectOption
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-slate-100 bg-slate-50/30 opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isCorrectOption
                    ? 'bg-green-500 text-white'
                    : isSelectedOption
                    ? 'bg-red-400 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {String.fromCharCode(65 + oIdx)}
              </div>
              <MarkdownRenderer content={opt} className="flex-1 text-slate-700" />
              {isCorrectOption && <CheckCircle2 size={18} className="text-green-600" />}
            </div>
          );
        })}
      </>
    );
  }
};
