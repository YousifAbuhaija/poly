import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { resolve, isValidZip, formatLocation } from '../engines/LocationResolver';
import type { LocationResult } from '../types';

export default function ZipOnboarding() {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<LocationResult | null>(null);
  const { setLocation } = useAppContext();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setConfirmed(null);
    if (!isValidZip(zip)) { setError('Please enter a valid 5-digit ZIP code.'); return; }
    const result = resolve(zip);
    if (!result) { setError('ZIP code not recognized. Please try another.'); return; }
    setConfirmed(result);
    setLocation(result);
  }

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Decorative orbs */}
      <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-gradient-to-br from-[#6096BA]/20 to-[#A3CEF1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#274C77]/15 to-[#6096BA]/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top bar */}
      <header className="relative z-10 bg-white/20 backdrop-blur-xl border-b border-white/20 px-6 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-violet bg-clip-text text-transparent hover:opacity-80 transition"
        >
          Poly
        </button>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Step indicator */}
          <motion.div 
            className="flex items-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-purple to-brand-violet text-white text-xs flex items-center justify-center font-semibold shadow-sm">1</div>
              <span className="text-xs font-medium text-brand-purple">Location</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-surface-border to-transparent" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-surface-border text-text-muted text-xs flex items-center justify-center font-semibold">2</div>
              <span className="text-xs text-text-muted">Quiz</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-surface-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-surface-border text-text-muted text-xs flex items-center justify-center font-semibold">3</div>
              <span className="text-xs text-text-muted">Results</span>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border p-8 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-text-primary">Where do you vote?</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Enter your ZIP code so we can show the candidates on your ballot.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="zip-input" className="block text-sm font-medium text-text-primary mb-1.5">
                  ZIP code
                </label>
                <input
                  id="zip-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 90210"
                  className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                />
              </div>

              {error && <p role="alert" className="text-sm text-disagree">{error}</p>}

              {confirmed && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <span className="text-agree text-base">✓</span>
                  <p className="text-sm text-green-700 font-medium">{formatLocation(confirmed)}</p>
                </div>
              )}

              {!confirmed ? (
                <button type="submit" className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-violet text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all">
                  Look up my area
                </button>
              ) : (
                <button type="button" onClick={() => navigate('/vibe-check')} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-violet text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all">
                  Continue to Quiz
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
