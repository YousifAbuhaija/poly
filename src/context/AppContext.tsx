import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppState, LocationResult, IssueProfile, ChatMessage } from '../types';

const STORAGE_KEY = 'poly-app-state';
const QUIZ_KEY = 'poly-quiz';

interface AppContextValue extends AppState {
  setLocation: (location: LocationResult) => void;
  setIssueProfile: (profile: IssueProfile) => void;
  setChatHistory: (history: ChatMessage[]) => void;
  setUserName: (name: string) => void;
  setEmail: (email: string) => void;
  quizIndex: number;
  setQuizIndex: (index: number) => void;
  quizComplete: boolean;
  setQuizComplete: (complete: boolean) => void;
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

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

function loadQuiz(): { quizIndex: number; quizComplete: boolean } {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    if (!raw) return { quizIndex: 0, quizComplete: false };
    return JSON.parse(raw);
  } catch {
    return { quizIndex: 0, quizComplete: false };
  }
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const savedQuiz = loadQuiz();
  const [quizIndex, setQuizIndex] = useState(savedQuiz.quizIndex);
  const [quizComplete, setQuizComplete] = useState(savedQuiz.quizComplete);

  // Persist app state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Persist quiz progress
  useEffect(() => {
    localStorage.setItem(QUIZ_KEY, JSON.stringify({ quizIndex, quizComplete }));
  }, [quizIndex, quizComplete]);

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

  return (
    <AppContext.Provider value={{ ...state, setLocation, setIssueProfile, setChatHistory, setUserName, setEmail, quizIndex, setQuizIndex, quizComplete, setQuizComplete }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
