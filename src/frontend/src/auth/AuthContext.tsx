import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionRole, SessionData, saveSession, loadSession, clearSession } from './session';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface AuthContextValue {
  sessionRole: SessionRole;
  username?: string;
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  login: (role: SessionRole, username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionRole, setSessionRole] = useState<SessionRole>('unauthenticated');
  const [username, setUsername] = useState<string | undefined>(undefined);
  const { clear: clearII } = useInternetIdentity();

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setSessionRole(session.role);
      setUsername(session.username);
    }
  }, []);

  const login = (role: SessionRole, user?: string) => {
    const sessionData: SessionData = {
      role,
      username: user,
      timestamp: Date.now()
    };
    saveSession(sessionData);
    setSessionRole(role);
    setUsername(user);
  };

  const logout = () => {
    clearSession();
    setSessionRole('unauthenticated');
    setUsername(undefined);
    clearII();
  };

  const isAdmin = sessionRole === 'admin';
  const isEditor = sessionRole === 'studentEditor' || sessionRole === 'admin';
  const canEdit = isEditor;

  return (
    <AuthContext.Provider value={{ sessionRole, username, isAdmin, isEditor, canEdit, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
