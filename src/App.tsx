import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import LandingPage from './components/LandingPage';
import ZipOnboarding from './components/ZipOnboarding';
import VibeCheck from './components/VibeCheck';
import CivicMatchResults from './components/CivicMatchResults';
import CandidateDetail from './components/CandidateDetail';
import NoReadTranslator from './components/NoReadTranslator';
import AskPolyChat from './components/AskPolyChat';

/** Paths where the bottom nav is hidden */
const NO_NAV_PATHS = ['/', '/onboarding', '/vibe-check'];

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { location } = useAppContext();
  if (!location) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

/** Bottom navigation bar — only visible after onboarding on non-landing routes. */
function BottomNav() {
  const { location: appLocation } = useAppContext();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // Hide on landing and onboarding, or if not onboarded
  if (!appLocation || NO_NAV_PATHS.includes(routerLocation.pathname)) return null;

  const tabs = [
    { label: 'Results', path: '/results', icon: resultsIcon },
    { label: 'Translator', path: '/translator', icon: translatorIcon },
    { label: 'Chat', path: '/chat', icon: chatIcon },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-glass-border bg-poly-dark/90 backdrop-blur-lg"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = routerLocation.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 transition ${
                active ? 'text-poly-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon active={active} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Icon components ─────────────────────────────────────────────── */

function resultsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      {active && <path d="M9 14l2 2 4-4" />}
    </svg>
  );
}

function translatorIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? '2.2' : '2'} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function chatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? '2.2' : '2'} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        {/* Catch-all: redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
