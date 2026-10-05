import React from 'react';
import { QuestionStrategy } from './QuestionStrategy.ts';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

export const MatchingStrategy: QuestionStrategy = {
  type: 'matching',

  hasAnswer(value: any, question): boolean {
    return value && 
           Array.isArray(value) && 
           value.length === (question.leftOptions?.length ?? 0) && 
           value.every((v: any) => v !== undefined && v !== null && v !== -1);
  },

  isCorrect(value: any, question): boolean {
    const ca = question.correctAnswers ?? [];
    const ua = Array.isArray(value) ? value : [];
    return ca.length === ua.length && ca.every((val: number, i: number) => val === ua[i]);
  },

  renderInput({ question, value, onChange }) {
    return (
      <div className="space-y-4 border border-slate-200 rounded-2xl p-6 bg-slate-50/30">
        <div className="space-y-4">
          {question.leftOptions?.map((leftOpt, lIdx) => {
            const currentMatch = value?.[lIdx] !== undefined ? value[lIdx] : -1;
            return (
              <div key={lIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex-1 font-medium text-slate-700">
                  <MarkdownRenderer content={leftOpt} />
                </div>
                <div className="sm:w-64 shrink-0">
                  <select
                    value={currentMatch}
                    onChange={(e) => {
                      const nextMatch = parseInt(e.target.value);
                      const currentAnswers = value
                        ? [...value]
                        : Array(question.leftOptions?.length ?? 0).fill(-1);
                      currentAnswers[lIdx] = nextMatch;
                      onChange(currentAnswers);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100/75 border border-slate-350 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 px-3 text-sm font-semibold text-slate-700 outline-none transition-all cursor-pointer"
                  >
                    <option value={-1}>Chọn ghép đôi...</option>
                    {question.rightOptions?.map((rightOpt, rIdx) => (
                      <option key={rIdx} value={rIdx}>
                        {String.fromCharCode(65 + rIdx)}. {rightOpt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },

  renderReview({ question, userAnswer }) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-500 uppercase tracking-widest text-[9px] w-5/12">Cột Trái</th>
                <th className="p-4 font-bold text-slate-500 uppercase tracking-widest text-[9px] w-5/12">Ghép với</th>
                <th className="p-4 font-bold text-slate-500 uppercase tracking-widest text-[9px] w-2/12 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {question.leftOptions?.map((leftOpt, lIdx) => {
                const userMatchedIdx = userAnswer?.[lIdx];
                const correctMatchedIdx = question.correctAnswers?.[lIdx];
                const isItemCorrect = userMatchedIdx === correctMatchedIdx;
                const userMatchedText = userMatchedIdx !== undefined && userMatchedIdx !== -1 && question.rightOptions
                  ? question.rightOptions[userMatchedIdx]
                  : '(Chưa chọn)';
                const correctMatchedText = correctMatchedIdx !== undefined && question.rightOptions
                  ? question.rightOptions[correctMatchedIdx]
                  : '';

                return (
                  <tr key={lIdx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
                    <td className="p-4 font-medium text-slate-700">
                      <MarkdownRenderer content={leftOpt} className="inline-block" />
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className={`font-medium ${isItemCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {userMatchedText}
                        </div>
                        {!isItemCorrect && (
                          <div className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                            <span>Đúng: </span>
                            <MarkdownRenderer content={correctMatchedText} className="inline-block" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        isItemCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isItemCorrect ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
};
