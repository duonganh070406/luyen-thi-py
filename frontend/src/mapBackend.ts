import type { HistoryAppendPayload } from './services/api.ts';
import type { Attempt, Question, QuestionType, Subject } from './types.ts';



export function questionFromApi(subjectId: string, raw: Record<string, unknown>): Question {
  let id = String(raw.id ?? '');
  const apiType = raw.type;
  let type: QuestionType;

  const isEssayOverride = id.endsWith('_essay');
  if (isEssayOverride) {
    id = id.slice(0, -6);
  }

  if (isEssayOverride) {
    type = 'essay';
  } else if (apiType === 'multiple') {
    type = 'multi';
  } else if (apiType === 'single') {
    type = 'single';
  } else if (apiType === 'short_answer') {
    type = 'short_answer';
  } else if (apiType === 'matching') {
    type = 'matching';
  } else {
    type = 'essay';
  }

  let correctAnswers: number[] | undefined;
  let referenceAnswer: string | undefined;
  let leftOptions: string[] | undefined;
  let rightOptions: string[] | undefined;

  const ans = raw.answer ?? raw.correctAnswer;
  if (type === 'single') {
    correctAnswers = typeof ans === 'number' ? [ans] : [];
  } else if (type === 'multi') {
    correctAnswers = Array.isArray(ans)
      ? [...(ans as number[])].sort((a, b) => a - b)
      : [];
  } else if (type === 'matching') {
    correctAnswers = Array.isArray(ans) ? (ans as number[]) : [];
    leftOptions = Array.isArray(raw.options)
      ? (raw.options as string[]).filter(o => typeof o === 'string' && /^L\s*:/i.test(o)).map(o => o.replace(/^L\s*:\s*/i, ''))
      : [];
    rightOptions = Array.isArray(raw.options)
      ? (raw.options as string[]).filter(o => typeof o === 'string' && /^R\s*:/i.test(o)).map(o => o.replace(/^R\s*:\s*/i, ''))
      : [];
  } else {
    // essay và short_answer đều lưu referenceAnswer
    referenceAnswer = typeof ans === 'string' ? ans : '';
  }

  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    subjectId,
    type,
    text: typeof raw.question === 'string' ? raw.question : (typeof raw.text === 'string' ? raw.text : ''),
    options: Array.isArray(raw.options) ? (raw.options as string[]) : [],
    leftOptions,
    rightOptions,
    correctAnswers,
    referenceAnswer,
    explanation: typeof raw.explanation === 'string' ? raw.explanation : '',
    addedAt: Date.now(),
    difficulty: typeof raw.difficulty === 'string' ? raw.difficulty : undefined,
    topic: typeof raw.topic === 'string' ? raw.topic : undefined,
  };
}

export function attemptFromHistory(subjectId: string, raw: Record<string, unknown>): Attempt {
  const summary = raw.summary as Record<string, any> | undefined;
  const ts = raw.timestamp;
  let timestamp = 0;
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    timestamp = Number.isFinite(parsed) ? parsed : 0;
  } else if (typeof ts === 'number') {
    timestamp = ts;
  }

  const snapshot = Array.isArray(raw.snapshot) ? raw.snapshot : [];
  const answers: Record<string, any> = {};
  const feedbacks: Record<string, string> = {};
  
  snapshot.forEach((s: any) => {
    if (s.id) {
      let sid = String(s.id);
      if (sid.endsWith('_essay')) {
        sid = sid.slice(0, -6);
      }
      answers[sid] = s.userAnswer;
      if (s.feedback) {
        feedbacks[sid] = s.feedback;
      }
    }
  });

  let questionTypes = summary?.questionTypes;
  if (snapshot.length > 0) {
    const counts: Record<string, number> = { single: 0, multiple: 0, essay: 0, short_answer: 0, matching: 0 };
    snapshot.forEach((q: any) => {
      const qid = String(q.id ?? '');
      let t = q.type === 'multi' ? 'multiple' : q.type;
      if (qid.endsWith('_essay')) {
        t = 'essay';
      }
      if (counts[t] !== undefined) counts[t]++;
    });
    questionTypes = counts;
  }

  let unanswered = summary?.unanswered;
  if (unanswered === undefined && snapshot) {
    let count = 0;
    snapshot.forEach((q: any) => {
      const userAns = q.userAnswer;
      let isAns = false;
      if (userAns !== undefined && userAns !== null) {
        if (q.type === 'single') {
          isAns = (userAns !== -1);
        } else if (q.type === 'multi' || q.type === 'multiple' || q.type === 'matching') {
          isAns = Array.isArray(userAns) && userAns.length > 0 && userAns.some((v: any) => v !== -1);
        } else {
          isAns = String(userAns).trim() !== "";
        }
      }
      if (!isAns) count++;
    });
    unanswered = count;
  }

  let wrong = summary?.wrong ?? 0;
  if (summary?.unanswered === undefined && unanswered !== undefined) {
    wrong = Math.max(0, (summary?.total ?? 0) - (summary?.correct ?? summary?.score ?? 0) - (summary?.pendingEssay ?? 0) - unanswered);
  }

  return {
    id: String(raw.attemptId ?? ''),
    subjectId,
    timestamp,
    score: summary?.score ?? 0,
    total: summary?.total ?? 0,
    answers,
    feedbacks,
    snapshot,
    examName: summary?.examName,
    correct: summary?.correct ?? summary?.score ?? 0,
    wrong,
    pendingEssay: summary?.pendingEssay ?? 0,
    unanswered: unanswered ?? 0,
    questionTypes,
  };
}


