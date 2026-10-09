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

// ---------- Auth (admin/user, token Bearer) ----------

function authHeaders(): Record<string, string> {
  const t = localStorage.getItem('eq_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface AuthResult {
  ok: boolean;
  token: string;
  username: string;
  role: string;
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const r = await fetchJson<AuthResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('eq_token', r.token);
  localStorage.setItem('eq_user', JSON.stringify({ username: r.username, role: r.role }));
  return r;
}

export async function register(username: string, password: string): Promise<AuthResult> {
  const r = await fetchJson<AuthResult>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('eq_token', r.token);
  localStorage.setItem('eq_user', JSON.stringify({ username: r.username, role: r.role }));
  return r;
}

export function logout() {
  const t = localStorage.getItem('eq_token');
  localStorage.removeItem('eq_token');
  localStorage.removeItem('eq_user');
  // Thu hoi token phia server (fire-and-forget, khong chan UI)
  if (t) {
    fetch(url('/api/auth/logout'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    }).catch(() => {});
  }
}

export function currentUser(): { username: string; role: string } | null {
  try {
    const raw = localStorage.getItem('eq_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchMe(): Promise<{ username: string; role: string }> {
  return fetchJson('/api/auth/me', { headers: authHeaders() });
}

// ---------- Ngan hang de + import ----------

export interface BankItem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
  topic: string;
  explanation: string;
}

export async function getBank(subject: string): Promise<{ items: BankItem[]; total: number; counts: any }> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/bank`);
}

export async function getBankTopics(subject: string): Promise<{ topics: string[]; counts: any }> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/bank/topics`);
}

export async function addBankQuestion(subject: string, body: Omit<BankItem, 'id'>): Promise<any> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/bank`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

export async function updateBankQuestion(subject: string, qid: string, body: Partial<BankItem>): Promise<any> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/bank/${encodeURIComponent(qid)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

export async function deleteBankQuestion(subject: string, qid: string): Promise<any> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/bank/${encodeURIComponent(qid)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function importBankFile(subject: string, file: File): Promise<{ ok: boolean; added: number; total: number; errors: string[] }> {
  const s = encodeURIComponent(subject);
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(url(`/api/subjects/${s}/import`), {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}

// ---------- Luyen thi nang cao ----------

export interface PracticeConfig {
  topics: string[];
  difficulty: string;
  count: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
}

export async function getPracticeQuiz(subject: string, cfg: PracticeConfig): Promise<unknown[]> {
  const s = encodeURIComponent(subject);
  return fetchJson<unknown[]>(`/api/subjects/${s}/practice-quiz`, {
    method: 'POST',
    body: JSON.stringify(cfg),
  });
}

export async function getCompetency(subject: string): Promise<{ byTopic: Record<string, { correct: number; wrong: number }>; byDifficulty: Record<string, { correct: number; wrong: number }> }> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/competency`);
}

export async function suggestDifficulty(subject: string, questionId?: string, question?: string): Promise<any> {
  const s = encodeURIComponent(subject);
  const q = `?question_id=${encodeURIComponent(questionId ?? '')}&question=${encodeURIComponent(question ?? '')}`;
  return fetchJson(`/api/subjects/${s}/ml-difficulty${q}`);
}

// ---------- Bao loi ----------

export async function reportQuestion(subject: string, question_id: string, message: string, reporter?: string): Promise<any> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/reports`, {
    method: 'POST',
    body: JSON.stringify({ question_id, message, reporter }),
  });
}

export async function listReports(subject: string): Promise<{ items: any[]; total: number }> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/reports`, { headers: authHeaders() });
}

export async function updateReport(subject: string, rid: string, status: string): Promise<any> {
  const s = encodeURIComponent(subject);
  return fetchJson(`/api/subjects/${s}/reports/${encodeURIComponent(rid)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

// ---------- Phong thi ----------

export interface RoomPayload {
  name: string;
  subject: string;
  unit: string;
  topics: string[];
  difficulty: string;
  count: number;
  time_limit: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  max_violations: number;
}

export async function createRoom(body: RoomPayload): Promise<{ ok: boolean; room: any }> {
  return fetchJson('/api/rooms', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
}

export async function listRooms(): Promise<{ rooms: any[] }> {
  return fetchJson('/api/rooms', { headers: authHeaders() });
}

export async function closeRoom(roomId: string): Promise<any> {
  return fetchJson(`/api/rooms/${encodeURIComponent(roomId)}/close`, { method: 'POST', headers: authHeaders() });
}

export async function getMonitor(roomId: string): Promise<{ room: any; participants: any[]; total: number }> {
  return fetchJson(`/api/rooms/${encodeURIComponent(roomId)}/monitor`, { headers: authHeaders() });
}

export async function getLeaderboard(roomId: string): Promise<{ room: any; ranking: any[] }> {
  return fetchJson(`/api/rooms/${encodeURIComponent(roomId)}/leaderboard`);
}

export async function editScore(roomId: string, participant: string, score: number): Promise<any> {
  return fetchJson(`/api/rooms/${encodeURIComponent(roomId)}/leaderboard`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ participant, score }),
  });
}

export function exportRoomCsv(roomId: string): void {
  // Tai bao cao CSV kem token admin (endpoint yeu cau quyen admin).
  const t = localStorage.getItem('eq_token');
  fetch(url(`/api/rooms/${encodeURIComponent(roomId)}/export`), {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bao-cao-${roomId}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch((e) => alert(`Khong tai duoc bao cao: ${e instanceof Error ? e.message : e}`));
}

export async function joinRoom(code: string, participant: string): Promise<any> {
  return fetchJson('/api/rooms/join', { method: 'POST', body: JSON.stringify({ code, participant }) });
}

export async function saveRoomAnswer(code: string, participant: string, question_id: string, answer: any, ticket = ''): Promise<any> {
  return fetchJson('/api/rooms/answer', { method: 'POST', body: JSON.stringify({ code, participant, question_id, answer, ticket }) });
}

export async function reportViolation(code: string, participant: string, ticket = ''): Promise<any> {
  return fetchJson('/api/rooms/violation', { method: 'POST', body: JSON.stringify({ code, participant, ticket }) });
}

export async function submitRoom(code: string, participant: string, ticket = ''): Promise<any> {
  return fetchJson('/api/rooms/submit', { method: 'POST', body: JSON.stringify({ code, participant, ticket }) });
}

// ---------- Units (Phòng ban/Khoa) ----------

export interface Unit {
  name: string;
}

export async function getUnits(): Promise<{ units: Unit[] }> {
  return fetchJson('/api/units', { headers: authHeaders() });
}

export async function addUnit(name: string): Promise<{ ok: boolean; unit: Unit }> {
  return fetchJson('/api/units', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
}

export async function deleteUnit(unitName: string): Promise<{ ok: boolean; total: number }> {
  return fetchJson(`/api/units/${encodeURIComponent(unitName)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
