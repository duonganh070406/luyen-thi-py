import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { QuestionStrategy } from './QuestionStrategy.ts';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

export const MultiChoiceStrategy: QuestionStrategy = {
  type: 'multi',

  hasAnswer(value: any): boolean {
    return value && Array.isArray(value) && value.length > 0;
  },

  isCorrect(value: any, question): boolean {
    const ca = [...(question.correctAnswers ?? [])].sort((a: number, b: number) => a - b);
    const ua = Array.isArray(value) ? [...value].sort((a: number, b: number) => a - b) : [];
    return ca.length === ua.length && ca.every((val: number, i: number) => val === ua[i]);
  },

  renderInput({ question, value, onChange }) {
    const currList = Array.isArray(value) ? value : [];
    return (
      <>
        {question.options?.map((opt: string, oIdx: number) => {
          const isSelected = currList.includes(oIdx);
          return (
            <label key={oIdx} className="flex items-start gap-3 cursor-pointer group py-1">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      onChange(currList.filter((i: number) => i !== oIdx));
                    } else {
                      onChange([...currList, oIdx]);
                    }
                  }}
                  className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
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
          const isSelectedOption = Array.isArray(userAnswer) && userAnswer.includes(oIdx);

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
