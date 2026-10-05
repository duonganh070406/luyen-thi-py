import { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';
import { Question, CopyConfig } from '../types.ts';
import { QuestionRegistry } from '../strategies/QuestionStrategy.ts';

interface CopySnapshotButtonProps {
  q: Question;
  answers: Record<string, any>;
  feedbacks: Record<string, string>;
  copyConfig: CopyConfig;
}

export default function CopySnapshotButton({ q, answers, feedbacks, copyConfig }: CopySnapshotButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const userAns = answers[q.id];
    const apiType = q.type === 'multi' ? 'multiple' : q.type;

    const strategy = QuestionRegistry.get(q.type);
    const hasAns = strategy ? strategy.hasAnswer(userAns, q) : false;

    let correctAnswer: number | number[] | string;
    if (q.type === 'single') {
      correctAnswer = q.correctAnswers?.[0] ?? 0;
    } else if (q.type === 'multi') {
      correctAnswer = [...(q.correctAnswers ?? [])].sort((a: number, b: number) => a - b);
    } else if (q.type === 'matching') {
      correctAnswer = q.correctAnswers ?? [];
    } else {
      correctAnswer = q.referenceAnswer ?? q.explanation ?? '';
    }

    let isCorrectSnapshot: boolean | null = null;
    if (q.type === 'essay') {
      isCorrectSnapshot = null;
    } else if (!hasAns) {
      isCorrectSnapshot = null;
    } else if (q.type === 'short_answer') {
      const ua = typeof userAns === 'string' ? (userAns as string).trim().toLowerCase() : '';
      const ca = typeof q.referenceAnswer === 'string' ? q.referenceAnswer.trim().toLowerCase() : '';
      isCorrectSnapshot = ua === ca;
    } else if (q.type === 'single') {
      isCorrectSnapshot = userAns === q.correctAnswers?.[0];
    } else if (q.type === 'multi') {
      const ca = [...(q.correctAnswers ?? [])].sort((a: number, b: number) => a - b);
      const ua = Array.isArray(userAns) ? [...(userAns as number[])].sort((a: number, b: number) => a - b) : [];
      isCorrectSnapshot = ca.length === ua.length && ca.every((v: number, i: number) => v === ua[i]);
    } else if (q.type === 'matching') {
      const ca = q.correctAnswers ?? [];
      const ua = Array.isArray(userAns) ? userAns : [];
      isCorrectSnapshot = ca.length === ua.length && ca.every((v: number, i: number) => v === ua[i]);
    }

    let userOut: number | number[] | string;
    if (q.type === 'essay' || q.type === 'short_answer') {
      userOut = typeof userAns === 'string' ? userAns : '';
    } else if (q.type === 'multi') {
      userOut = Array.isArray(userAns) ? [...(userAns as number[])].sort((a: number, b: number) => a - b) : [];
    } else if (q.type === 'matching') {
      userOut = Array.isArray(userAns) ? userAns : [];
    } else {
      userOut = typeof userAns === 'number' ? userAns : -1;
    }

    let textToCopy = '';

    if (copyConfig.format === 'markdown') {
      let md = '';
      const fields = copyConfig.fields;

      if (fields.name) {
        md += `# ${q.name || `Câu hỏi #${q.id.slice(0, 6)}`}\n`;
      }

      if (fields.id) {
        md += `- **id:** ${q.id}\n`;
      }

      if (fields.type) {
        md += `- **type:** ${apiType}\n`;
      }

      if (fields.question) {
        md += `- **question:** ${q.text}\n`;
      }

      if (fields.options && q.options && q.options.length > 0 && q.type !== 'essay' && q.type !== 'short_answer') {
        md += `- **options:**\n`;
        q.options.forEach((opt) => {
          md += `  - ${opt}\n`;
        });
      }

      if (fields.correctAnswer) {
        const caVal = Array.isArray(correctAnswer) ? JSON.stringify(correctAnswer) : (correctAnswer !== undefined ? correctAnswer : '');
        md += `- **correctAnswer:** ${caVal}\n`;
      }

      if (fields.userAnswer) {
        const uaVal = Array.isArray(userOut) ? JSON.stringify(userOut) : (userOut !== undefined ? userOut : '');
        md += `- **userAnswer:** ${uaVal}\n`;
      }

      if (fields.isCorrect) {
        let isCorrectText = 'Đang chờ';
        if (q.type !== 'essay') {
          if (!hasAns) {
            isCorrectText = 'Chưa làm';
          } else {
            isCorrectText = isCorrectSnapshot ? 'Đúng' : 'Sai';
          }
        } else {
          isCorrectText = hasAns ? 'Đang chờ' : 'Chưa làm';
        }
        md += `- **isCorrect:** ${isCorrectText}\n`;
      }

      if (fields.explanation && q.explanation) {
        md += `- **explanation:** ${q.explanation}\n`;
      }

      if (fields.feedback && feedbacks?.[q.id]) {
        md += `- **feedback:** ${feedbacks[q.id]}\n`;
      }

      textToCopy = md.trim();
    } else {
      // JSON format
      const rawFields: Record<string, any> = {
        id: isNaN(Number(q.id)) ? q.id : Number(q.id),
        name: q.name || null,
        type: apiType,
        question: q.text,
        options: (q.type === 'essay' || q.type === 'short_answer') ? null : (q.options ?? []),
        correctAnswer,
        userAnswer: userOut,
        isCorrect: isCorrectSnapshot,
        explanation: q.explanation ?? '',
        feedback: feedbacks?.[q.id] || null,
      };

      const snapshotObj: Record<string, any> = {};
      Object.keys(rawFields).forEach((key) => {
        if (copyConfig.fields[key as keyof typeof copyConfig.fields]) {
          snapshotObj[key] = rawFields[key];
        }
      });

      textToCopy = JSON.stringify(snapshotObj, null, 4);
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Lỗi copy', err));
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 relative z-10"
      title={`Sao chép dữ liệu dạng ${copyConfig.format.toUpperCase()}`}
    >
      {copied ? (
        <>
          <CheckCircle2 size={14} className="text-green-500" /> <span className="text-green-600">Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} /> {copyConfig.format === 'markdown' ? 'Copy Markdown' : 'Copy JSON'}
        </>
      )}
    </button>
  );
}
