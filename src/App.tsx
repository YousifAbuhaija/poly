import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import LandingPage from './components/LandingPage';
import ZipOnboarding from './components/ZipOnboarding';
import VibeCheck from './components/VibeCheck';
import CivicMatchResults from './components/CivicMatchResults';
import CandidateDetail from './components/CandidateDetail';
import NoReadTranslator from './components/NoReadTranslator';
import AskPolyChat from './components/AskPolyChat';

const NO_NAV_PATHS = ['/', '/onboarding', '/vibe-check'];

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { location } = useAppContext();
  if (!location) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function BottomNav() {
  const { location: appLocation } = useAppContext();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  if (!appLocation || NO_NAV_PATHS.includes(routerLocation.pathname)) return null;

  const tabs = [
    { label: 'Matches', path: '/results', icon: MatchesIcon },
    { label: 'Translate', path: '/translator', icon: TranslateIcon },
    { label: 'Chat', path: '/chat', icon: ChatIcon },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border-default"
      style={{ background: 'rgba(10, 10, 18, 0.92)', backdropFilter: 'blur(12px)' }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-sm items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const active = routerLocation.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-4 py-1 transition-colors ${
                active ? 'text-poly-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Icons — clean, consistent stroke style ──────────────────────── */

function MatchesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Main App ────────────────────────────────────────────────────── */

export default function App() {
  const { location: appLocation } = useAppContext();
  const routerLocation = useLocation();
  const showNav = !!appLocation && !NO_NAV_PATHS.includes(routerLocation.pathname);

  return (
    <div className={`min-h-dvh ${showNav ? 'pb-16' : ''}`}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<ZipOnboarding />} />
        <Route
          path="/vibe-check"
          element={
            <RequireOnboarding>
              <VibeCheck />
            </RequireOnboarding>
          }
        />
        <Route
          path="/results"
          element={
            <RequireOnboarding>
              <CivicMatchResults />
            </RequireOnboarding>
          }
        />
        <Route
          path="/candidate/:id"
          element={
            <RequireOnboarding>
              <CandidateDetail />
            </RequireOnboarding>
          }
        />
        <Route
          path="/translator"
          element={
            <RequireOnboarding>
              <NoReadTranslator />
            </RequireOnboarding>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireOnboarding>
              <AskPolyChat />
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
