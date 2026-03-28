import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppState, LocationResult, IssueProfile, ChatMessage } from '../types';

interface AppContextValue extends AppState {
  setLocation: (location: LocationResult) => void;
  setIssueProfile: (profile: IssueProfile) => void;
  setChatHistory: (history: ChatMessage[]) => void;
}

const initialState: AppState = {
  location: null,
  issueProfile: {},
  chatHistory: [],
  isOnboarded: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const setLocation = useCallback((location: LocationResult) => {
    setState(prev => ({ ...prev, location, isOnboarded: true }));
  }, []);

  const setIssueProfile = useCallback((issueProfile: IssueProfile) => {
    setState(prev => ({ ...prev, issueProfile }));
  }, []);

  const setChatHistory = useCallback((chatHistory: ChatMessage[]) => {
    setState(prev => ({ ...prev, chatHistory }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, setLocation, setIssueProfile, setChatHistory }}>
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
