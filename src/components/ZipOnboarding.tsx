import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { resolve, isValidZip, formatLocation } from '../engines/LocationResolver';
import type { LocationResult } from '../types';

export default function ZipOnboarding() {
  const [step, setStep] = useState<'info' | 'zip'>('info');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [infoError, setInfoError] = useState('');
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState('');
  const [confirmed, setConfirmed] = useState<LocationResult | null>(null);
  const { setLocation, setUserName, setEmail: saveEmail, setPassword: savePassword } = useAppContext();
  const navigate = useNavigate();

  function handleInfoSubmit(e: FormEvent) {
    e.preventDefault();
    setInfoError('');
    if (!fullName.trim()) { setInfoError('Please enter your name.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInfoError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setInfoError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setInfoError('Passwords do not match.');
      return;
    }
    setUserName(fullName.trim());
    saveEmail(email.trim());
    savePassword(password);
    setStep('zip');
  }

  function handleZipSubmit(e: FormEvent) {
    e.preventDefault();
    setZipError('');
    setConfirmed(null);
    if (!isValidZip(zip)) { setZipError('Please enter a valid 5-digit ZIP code.'); return; }
    const result = resolve(zip);
    if (!result) { setZipError('ZIP code not recognized. Please try another.'); return; }
    setConfirmed(result);
    setLocation(result);
  }

  const activeStep = step === 'info' ? 0 : 1;

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-gradient-to-br from-[#6096BA]/20 to-[#A3CEF1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#274C77]/15 to-[#6096BA]/10 rounded-full blur-3xl pointer-events-none" />

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
            {[
              { label: 'About You', idx: 0 },
              { label: 'Location', idx: 1 },
              { label: 'Quiz', idx: 2 },
            ].map((s, i, arr) => (
              <span key={s.label} className="contents">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold shadow-sm ${
                    s.idx <= activeStep ? 'bg-[#274C77] text-white' : 'bg-white/30 text-white'
                  }`}>{s.idx + 1}</div>
                  <span className={`text-xs ${s.idx <= activeStep ? 'font-medium text-white' : 'text-white/70'}`}
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 h-px bg-white/40" />}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-surface-border p-8 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            key={step}
          >
            {step === 'info' ? (
              <>
                <h1 className="text-2xl font-bold text-text-primary">Tell us about yourself</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  This stays on your device. We don't send it anywhere.
                </p>
                <form onSubmit={handleInfoSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name-input" className="block text-sm font-medium text-text-primary mb-1.5">Full name</label>
                    <input
                      id="name-input"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email-input" className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="password-input" className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                    <input
                      id="password-input"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password-input" className="block text-sm font-medium text-text-primary mb-1.5">Confirm password</label>
                    <input
                      id="confirm-password-input"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                    />
                  </div>
                  {infoError && <p role="alert" className="text-sm text-disagree">{infoError}</p>}
                  <button type="submit" className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-violet text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all">
                    Continue
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-text-primary">Where do you vote?</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Enter your ZIP code so we can show the candidates on your ballot.
                </p>
                <form onSubmit={handleZipSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="zip-input" className="block text-sm font-medium text-text-primary mb-1.5">ZIP code</label>
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
                  {zipError && <p role="alert" className="text-sm text-disagree">{zipError}</p>}
                  {confirmed && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                      <span className="text-agree text-base">✓</span>
                      <p className="text-sm text-green-700 font-medium">{formatLocation(confirmed)}</p>
                    </div>
                  )}
                  {!confirmed ? (
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep('info')} className="px-4 py-2.5 rounded-lg border border-surface-border text-text-secondary text-sm font-medium hover:bg-gray-50 transition">
                        Back
                      </button>
                      <button type="submit" className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-violet text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all">
                        Look up my area
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => navigate('/vibe-check')} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-violet text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all">
                      Continue to Quiz
                    </button>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
