import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const features = [
  { icon: '🗳️', title: 'Match your values', body: 'Take a quick quiz and discover which candidates align with what matters most to you.' },
  { icon: '📋', title: 'Your ballot, simplified', body: "See only the candidates running in your district - no clutter, just what's relevant." },
  { icon: '💬', title: 'Ask anything', body: 'Chat with AI to explore policies, positions, and candidate backgrounds in plain language.' },
  { icon: '📖', title: 'Decode the jargon', body: 'Paste political text and get clear, accessible summaries without the spin.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { quizIndex, quizComplete, location } = useAppContext();

  const handleGetStarted = () => {
    if (!location) navigate('/onboarding');
    else if (quizIndex > 0 && !quizComplete) navigate('/vibe-check');
    else if (quizComplete) navigate('/results');
    else navigate('/vibe-check');
  };

  const ctaText = !location ? 'Get Started'
    : quizIndex > 0 && !quizComplete ? 'Resume Quiz'
    : quizComplete ? 'View Results'
    : 'Take Quiz';

  return (
    <div className="min-h-dvh relative">
      {/* Solid white nav */}
      <div className="relative z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button type="button" onClick={() => navigate('/')}
            className="text-2xl font-bold text-[#274C77] hover:opacity-80 transition">
            Poly
          </button>
          <button type="button" onClick={handleGetStarted}
            className="px-6 py-2.5 rounded-lg bg-[#274C77] text-white text-sm font-semibold hover:bg-[#6096BA] transition shadow-sm">
            {ctaText}
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: text directly on globe — white with shadow */}
          <motion.div className="flex-1 max-w-xl"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block mb-5 px-3 py-1.5 rounded-full bg-white text-[#274C77] text-xs font-bold tracking-wide uppercase shadow-sm">
              Civic Tech for Everyone
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              Vote with <span style={{ color: '#A3CEF1' }}>confidence</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8"
              style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              Know your candidates. Match your values. Poly makes it simple to understand who's on your ballot and where they stand.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button type="button" onClick={handleGetStarted}
                className="px-8 py-3.5 rounded-xl bg-white text-[#274C77] font-semibold text-base hover:shadow-lg hover:scale-105 transition-all">
                {ctaText}
              </button>
              <span className="text-sm flex items-center gap-2" style={{ color: '#E7ECEF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free · No account needed
              </span>
            </div>
          </motion.div>

          {/* Right: solid white card */}
          <motion.div className="flex-1 w-full max-w-lg"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-3 text-xs text-gray-500 font-semibold">Your matches</span>
              </div>
              {[
                { name: 'Jane Smith', office: 'State Senate', match: 87, color: '#22c55e' },
                { name: 'Carlos Rivera', office: 'City Council', match: 74, color: '#f59e0b' },
                { name: 'Pat Johnson', office: 'School Board', match: 61, color: '#f59e0b' },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-12 rounded-full bg-[#274C77] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.office}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-bold" style={{ color: c.color }}>{c.match}%</span>
                    <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.match}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features — solid white cards */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Everything you need to vote informed
            </h2>
            <p style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }} className="max-w-2xl mx-auto">
              Poly brings clarity to the voting process with tools designed to help you understand candidates and issues without the noise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-lg bg-[#A3CEF1] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              How it works
            </h2>
            <p style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>Three simple steps to find your match</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Enter your ZIP', body: 'Tell us where you vote so we can show your local candidates.' },
              { step: '2', title: 'Take the quiz', body: 'Answer quick questions about issues that matter to you.' },
              { step: '3', title: 'See your matches', body: 'Get personalized match scores and explore candidate positions.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-white text-[#274C77] text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#E7ECEF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            Ready to find your match?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            Takes about 3 minutes. No sign-up, no spam — just clarity.
          </p>
          <button type="button" onClick={handleGetStarted}
            className="px-10 py-4 rounded-xl bg-white text-[#274C77] font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all">
            {ctaText}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm" style={{ color: '#E7ECEF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Poly is a civic tech tool. Match scores are not endorsements.
          </p>
        </div>
      </footer>
    </div>
  );
}
