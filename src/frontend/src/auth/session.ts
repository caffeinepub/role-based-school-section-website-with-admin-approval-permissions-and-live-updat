export type SessionRole = 'visitor' | 'admin' | 'student' | 'studentEditor' | 'pending' | 'unauthenticated';

export interface SessionData {
  role: SessionRole;
  username?: string;
  timestamp: number;
}

const SESSION_KEY = 'school_session';

export function saveSession(data: SessionData): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession(): SessionData | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as SessionData;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}
