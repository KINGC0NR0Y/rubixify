export interface Solve {
  id: string;
  time: number;       // ms
  scramble: string;
  dnf: boolean;
  plusTwo: boolean;
  timestamp: number;  // epoch ms
}

export interface QuizResult {
  caseId: string;
  attempts: number;
  correct: number;
  totalResponseMs: number;
}

const SOLVES_KEY = 'algently-solves';
const QUIZ_KEY = 'algently-quiz-results';

// One-time carry-over from the pre-rename keys so existing users keep their data.
function migrateLegacy(key: string, legacyKey: string) {
  if (typeof window === 'undefined') return;
  try {
    const legacy = localStorage.getItem(legacyKey);
    if (legacy === null) return;
    if (localStorage.getItem(key) === null) localStorage.setItem(key, legacy);
    localStorage.removeItem(legacyKey);
  } catch {
    /* storage unavailable — nothing to migrate */
  }
}

// ── Solves ──────────────────────────────────────────

export function getSolves(): Solve[] {
  if (typeof window === 'undefined') return [];
  migrateLegacy(SOLVES_KEY, 'cubopedia-solves');
  try { return JSON.parse(localStorage.getItem(SOLVES_KEY) ?? '[]'); }
  catch { return []; }
}

export function addSolve(solve: Solve): Solve[] {
  const all = getSolves();
  all.push(solve);
  if (all.length > 1000) all.splice(0, all.length - 1000);
  localStorage.setItem(SOLVES_KEY, JSON.stringify(all));
  return all;
}

export function deleteSolve(id: string): Solve[] {
  const all = getSolves().filter(s => s.id !== id);
  localStorage.setItem(SOLVES_KEY, JSON.stringify(all));
  return all;
}

export function updateSolve(id: string, patch: Partial<Solve>): Solve[] {
  const all = getSolves().map(s => s.id === id ? { ...s, ...patch } : s);
  localStorage.setItem(SOLVES_KEY, JSON.stringify(all));
  return all;
}

export function clearSolves(): void {
  localStorage.removeItem(SOLVES_KEY);
}

// ── Quiz results ────────────────────────────────────

export function getQuizResults(): Record<string, QuizResult> {
  if (typeof window === 'undefined') return {};
  migrateLegacy(QUIZ_KEY, 'cubopedia-quiz-results');
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY) ?? '{}'); }
  catch { return {}; }
}

export function recordQuizAttempt(caseId: string, correct: boolean, responseMs: number): void {
  const results = getQuizResults();
  const r = results[caseId] ?? { caseId, attempts: 0, correct: 0, totalResponseMs: 0 };
  r.attempts++;
  if (correct) r.correct++;
  r.totalResponseMs += responseMs;
  results[caseId] = r;
  localStorage.setItem(QUIZ_KEY, JSON.stringify(results));
}

export function clearQuizResults(): void {
  localStorage.removeItem(QUIZ_KEY);
}

// ── Time helpers ────────────────────────────────────

export function effectiveTime(s: Solve): number {
  if (s.dnf) return Infinity;
  return s.time + (s.plusTwo ? 2000 : 0);
}

export function formatTime(ms: number): string {
  if (!isFinite(ms)) return 'DNF';
  if (ms >= 60000) {
    const m = Math.floor(ms / 60000);
    const s = ((ms % 60000) / 1000).toFixed(2);
    return `${m}:${s.padStart(5, '0')}`;
  }
  return (ms / 1000).toFixed(2);
}

// Ao5/Ao12/Ao100 with trimmed mean (trim 1 best + 1 worst for n≥5)
export function calcAo(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  const recent = solves.slice(-n).map(effectiveTime);
  const sorted = [...recent].sort((a, b) => a - b);
  const trimmed = n >= 5 ? sorted.slice(1, -1) : sorted;
  if (trimmed.some(t => !isFinite(t))) return Infinity;
  return trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
}
