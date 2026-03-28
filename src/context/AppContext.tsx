import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { AppState, LocationResult, IssueProfile, ChatMessage } from '../types';
import { fetchUser, saveUser, signInWithEmail } from '../services/UserApiService';

const STORAGE_KEY = 'poly-app-state';
const QUIZ_KEY = 'poly-quiz';
const USER_ID_KEY = 'poly-user-id';

interface AppContextValue extends AppState {
  setLocation: (location: LocationResult) => void;
  setIssueProfile: (profile: IssueProfile) => void;
  setChatHistory: (history: ChatMessage[]) => void;
  setUserName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  quizIndex: number;
  setQuizIndex: (index: number) => void;
  quizComplete: boolean;
  setQuizComplete: (complete: boolean) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => void;
}

const initialState: AppState = {
  location: null,
  issueProfile: {},
  chatHistory: [],
  isOnboarded: false,
  candidates: [],
  isFallbackMode: false,
  userName: '',
  email: '',
};

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch { return initialState; }
}

function loadQuiz(): { quizIndex: number; quizComplete: boolean } {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    if (!raw) return { quizIndex: 0, quizComplete: false };
    return JSON.parse(raw);
  } catch { return { quizIndex: 0, quizComplete: false }; }
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const userId = useRef(getOrCreateUserId());
  const [state, setState] = useState<AppState>(loadState);
  const savedQuiz = loadQuiz();
  const [quizIndex, setQuizIndex] = useState(savedQuiz.quizIndex);
  const [quizComplete, setQuizComplete] = useState(savedQuiz.quizComplete);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);
  const pendingPassword = useRef<string | null>(null);

  // Always hydrate from DynamoDB on load — it's the source of truth
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    fetchUser(userId.current).then(remote => {
      if (!remote) return;
      setState(prev => ({
        ...prev,
        userName: remote.userName || prev.userName,
        email: remote.email || prev.email,
        location: remote.location || prev.location,
        issueProfile: (remote.issueProfile && Object.keys(remote.issueProfile).length > 0) ? remote.issueProfile : prev.issueProfile,
        isOnboarded: !!remote.location || prev.isOnboarded,
      }));
      if (remote.quizComplete) setQuizComplete(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(QUIZ_KEY, JSON.stringify({ quizIndex, quizComplete })); }, [quizIndex, quizComplete]);

  // Debounced sync to DynamoDB
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const payload: Parameters<typeof saveUser>[1] = {
        userName: state.userName,
        email: state.email,
        location: state.location,
        issueProfile: state.issueProfile,
        quizComplete,
      };
      // Include password on first sync (registration)
      if (pendingPassword.current) {
        payload.password = pendingPassword.current;
        pendingPassword.current = null;
      }
      saveUser(userId.current, payload);
    }, 500);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [state.userName, state.email, state.location, state.issueProfile, quizComplete]);

  const setLocation = useCallback((location: LocationResult) => {
    setState(prev => ({ ...prev, location, isOnboarded: true }));
  }, []);
  const setIssueProfile = useCallback((issueProfile: IssueProfile) => {
    setState(prev => ({ ...prev, issueProfile }));
  }, []);
  const setUserName = useCallback((userName: string) => {
    setState(prev => ({ ...prev, userName }));
  }, []);
  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }));
  }, []);
  const setChatHistory = useCallback((chatHistory: ChatMessage[]) => {
    setState(prev => ({ ...prev, chatHistory }));
  }, []);
  const setPassword = useCallback((password: string) => {
    pendingPassword.current = password;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { user, error } = await signInWithEmail(email, password);
    if (error || !user) return error || 'Sign-in failed.';
    userId.current = user.userId;
    localStorage.setItem(USER_ID_KEY, user.userId);
    setState({
      ...initialState,
      userName: user.userName,
      email: user.email,
      location: user.location,
      issueProfile: user.issueProfile || {},
      isOnboarded: !!user.location,
    });
    setQuizComplete(user.quizComplete);
    setQuizIndex(0);
    return null;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUIZ_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setState(initialState);
    setQuizIndex(0);
    setQuizComplete(false);
    pendingPassword.current = null;
    userId.current = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId.current);
  }, []);

  return (
    <AppContext.Provider value={{
      ...state, setLocation, setIssueProfile, setChatHistory, setUserName, setEmail, setPassword,
      quizIndex, setQuizIndex, quizComplete, setQuizComplete, signIn, signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
