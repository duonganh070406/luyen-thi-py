
export type QuestionType = 'single' | 'multi' | 'essay' | 'short_answer' | 'matching';

export interface Question {
  id: string;
  name?: string;
  subjectId: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For single/multi/matching
  leftOptions?: string[]; // For matching
  rightOptions?: string[]; // For matching
  correctAnswers?: number[]; // indices of correct options
  /** Đáp án tham khảo (essay) — map từ trường answer của JSON backend */
  referenceAnswer?: string;
  explanation?: string;
  addedAt: number;
  /** Muc do kho: De | Trung binh | Kho (ngan hang de moi) */
  difficulty?: string;
  /** Linh vuc / chu de (ngan hang de moi) */
  topic?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  other_information?: string;
}

export interface Attempt {
  id: string;
  subjectId: string;
  timestamp: number;
  score: number;
  total: number;
  answers: Record<string, any>; // questionId -> answer
  feedbacks?: Record<string, string>; // AI feedback for essay questions
  snapshot?: any[]; // The full question data at the time of the attempt
  examName?: string;
  correct?: number;
  wrong?: number;
  pendingEssay?: number;
  unanswered?: number;
  questionTypes?: Record<string, number>;
}

export interface AppState {
  subjects: Subject[];
  attempts: Attempt[];
}

export interface CopyConfig {
  format: 'json' | 'markdown';
  fields: {
    id: boolean;
    name: boolean;
    type: boolean;
    question: boolean;
    options: boolean;
    correctAnswer: boolean;
    userAnswer: boolean;
    isCorrect: boolean;
    explanation: boolean;
    feedback: boolean;
  };
}

export interface QuizParams {
  num_questions?: number; // Total number of questions (int), -1 = random
  single?: number; // Proportion of single questions (float), -1 = random
  multi?: number; // Proportion of multi questions (float), -1 = random
  essay?: number; // Proportion of essay questions (float), -1 = random
  short_answer?: number; // Proportion of short_answer questions (float), -1 = random
  matching?: number; // Proportion of matching questions (float), -1 = random
  sources?: string[]; // Sources for retrieving material, empty = retrieved from all questions
}

