import type { QuizParams } from '../types.ts';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function url(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const isBody = method !== 'GET' && method !== 'HEAD';
  const res = await fetch(url(path), {
    ...init,
    headers: {
      ...(isBody ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface SubjectConfig {
  active: boolean;
  description: string;
  other_information: string;
}

export interface SubjectDetail {
  id: string;
  name: string;
  config: SubjectConfig;
}

export async function listSubjects(includeInactive = false): Promise<SubjectDetail[]> {
  const q = includeInactive ? '?include_inactive=true' : '';
  return fetchJson<SubjectDetail[]>(`/api/subjects${q}`);
}

export async function updateSubjectConfig(
  subjectFolderName: string,
  config: SubjectConfig
): Promise<{ ok: boolean }> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson<{ ok: boolean }>(`/api/subjects/${s}/config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function listExams(subjectFolderName: string): Promise<string[]> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson<string[]>(`/api/subjects/${s}/exams`);
}

export async function getExamData(subjectFolderName: string, examName: string): Promise<unknown[]> {
  const s = encodeURIComponent(subjectFolderName);
  const e = encodeURIComponent(examName);
  return fetchJson<unknown[]>(`/api/subjects/${s}/exams/${e}`);
}

export async function getHistory(subjectFolderName: string): Promise<unknown[]> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson<unknown[]>(`/api/subjects/${s}/history`);
}

export interface HistoryAppendPayload {
  attemptId: string;
  examName: string;
  questions: any[];
  answers: Record<string, any>;
  enableAIGrading: boolean;
}

export interface AIProfile {
  id: string;
  name: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
}

export interface AIConfig {
  enableAIGrading: boolean;
  activeProfileId: string | null;
  profiles: AIProfile[];
}

export async function getAIConfig(): Promise<AIConfig> {
  return fetchJson<AIConfig>('/api/config/ai');
}

export async function updateAIConfig(config: AIConfig): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>('/api/config/ai', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function testAIConfig(profile: AIProfile): Promise<{ success: boolean; response: string; error?: string }> {
  return fetchJson<{ success: boolean; response: string; error?: string }>('/api/config/ai/test', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function appendHistory(
  subjectFolderName: string,
  payload: HistoryAppendPayload
): Promise<{ ok: boolean; length: number; attempt: any }> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson<{ ok: boolean; length: number; attempt: any }>(`/api/subjects/${s}/history`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteHistoryAttempt(
  subjectFolderName: string,
  attemptId: string
): Promise<{ ok: boolean; length: number }> {
  const s = encodeURIComponent(subjectFolderName);
  const a = encodeURIComponent(attemptId);
  return fetchJson(`/api/subjects/${s}/history/${a}`, {
    method: 'DELETE',
  });
}


export async function getSubjectStats(subjectFolderName: string): Promise<any> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson(`/api/subjects/${s}/stats`);
}

export async function listNotes(subjectFolderName: string): Promise<string[]> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson<string[]>(`/api/subjects/${s}/notes`);
}

export async function getNoteData(subjectFolderName: string, noteName: string): Promise<{ content: string }> {
  const s = encodeURIComponent(subjectFolderName);
  const n = encodeURIComponent(noteName);
  return fetchJson<{ content: string }>(`/api/subjects/${s}/notes/${n}`);
}

export async function getComprehensiveQuiz(
  subjectFolderName: string,
  params: QuizParams
): Promise<unknown[]> {
  const s = encodeURIComponent(subjectFolderName);
  return fetchJson<unknown[]>(`/api/subjects/${s}/comprehensive-quiz`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
