import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useAppContext } from './context/AppContext';
import PolyLogo from './components/PolyLogo';
import LandingPage from './components/LandingPage';
import ZipOnboarding from './components/ZipOnboarding';
import VibeCheck from './components/VibeCheck';
import CivicMatchResults from './components/CivicMatchResults';
import CandidateDetail from './components/CandidateDetail';
import NoReadTranslator from './components/NoReadTranslator';
import AskPolyChat from './components/AskPolyChat';
import ProfilePage from './components/ProfilePage';

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { location } = useAppContext();
  if (!location) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function RequireQuizComplete({ children }: { children: React.ReactNode }) {
  const { quizComplete } = useAppContext();
  if (!quizComplete) return <Navigate to="/vibe-check" replace />;
  return <>{children}</>;
}

function TopNav() {
  const { location: appLocation, quizComplete, quizIndex } = useAppContext();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const isOnboarded = !!appLocation;
  const isQuizRoute = routerLocation.pathname === '/vibe-check';
  const isOnboardingRoute = routerLocation.pathname === '/onboarding';

  // State A: not onboarded — logo + CTA
  // State B: onboarded, on quiz — logo + progress hint
  // State C: onboarded, anywhere else — logo + tabs

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCta = () => {
    if (!isOnboarded) navigate('/onboarding');
    else if (quizIndex > 0 && !quizComplete) navigate('/vibe-check');
    else if (quizComplete) navigate('/results');
    else navigate('/vibe-check');
  };

  const ctaText = !isOnboarded
    ? 'Get Started'
    : quizIndex > 0 && !quizComplete
    ? 'Resume Quiz'
    : quizComplete
    ? 'View Results'
    : 'Take Quiz';

  const tabs = [
    { label: 'Results', path: '/results', blocked: !quizComplete },
    { label: 'Translator', path: '/translator', blocked: false },
    { label: 'Chat', path: '/chat', blocked: false },
    { label: 'Profile', path: '/profile', blocked: false },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo — always present */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <PolyLogo size={28} />
          <span className="text-xl font-bold text-[#274C77] tracking-tight">Poly</span>
        </button>

        {/* Right side — depends on state */}
        {!isOnboarded || isOnboardingRoute ? (
          /* State A: CTA button */
          <button
            type="button"
            onClick={handleCta}
            className="px-6 py-2 rounded-lg bg-[#274C77] text-white text-sm font-semibold hover:bg-[#6096BA] transition shadow-sm"
          >
            {ctaText}
          </button>
        ) : isQuizRoute ? (
          /* State B: quiz progress hint */
          <span className="text-sm text-gray-500">Vibe Check in progress</span>
        ) : (
          /* State C: full tab nav */
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {tabs.map((tab) => {
              const active = routerLocation.pathname.startsWith(tab.path);
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => !tab.blocked && navigate(tab.path)}
                  disabled={tab.blocked}
                  title={tab.blocked ? 'Complete the quiz first' : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    tab.blocked
                      ? 'text-gray-400 cursor-not-allowed opacity-40'
                      : active
                      ? 'bg-[#A3CEF1]/20 text-[#274C77]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const routerLocation = useLocation();
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<unknown>(null);

  useEffect(() => {
    const win = window as unknown as Record<string, unknown>;
    if (!vantaEffect.current && win.VANTA) {
      const VANTA = win.VANTA as { GLOBE: (opts: unknown) => unknown };
      vantaEffect.current = VANTA.GLOBE({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x6096ba,
        color2: 0xa3cef1,
        backgroundColor: 0x274c77,
      });
    }
    return () => {
      if (vantaEffect.current) {
        (vantaEffect.current as { destroy: () => void }).destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      {/* Fixed Vanta globe background */}
      <div
        ref={vantaRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />
      {/* App content above the globe */}
      <div style={{ position: 'relative', zIndex: 1, height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopNav />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        <Routes location={routerLocation} key={routerLocation.pathname}>
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage />
            </motion.div>
          } />
          <Route path="/onboarding" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ZipOnboarding />
            </motion.div>
          } />
          <Route path="/vibe-check" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RequireOnboarding><VibeCheck /></RequireOnboarding>
            </motion.div>
          } />
          <Route path="/results" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RequireOnboarding><RequireQuizComplete><CivicMatchResults /></RequireQuizComplete></RequireOnboarding>
            </motion.div>
          } />
          <Route path="/candidate/:id" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RequireOnboarding><CandidateDetail /></RequireOnboarding>
            </motion.div>
          } />
          <Route path="/translator" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RequireOnboarding><NoReadTranslator /></RequireOnboarding>
            </motion.div>
          } />
          <Route path="/chat" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              <RequireOnboarding><AskPolyChat /></RequireOnboarding>
            </motion.div>
          } />
          <Route path="/profile" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RequireOnboarding><ProfilePage /></RequireOnboarding>
            </motion.div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
