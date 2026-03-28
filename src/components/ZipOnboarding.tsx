import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { LocationResult } from '../types';
import zipLookup from '../data/zipLookup.json';

export default function ZipOnboarding() {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<LocationResult | null>(null);
  const { setLocation } = useAppContext();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setConfirmed(null);
    setLoading(true);

    if (!/^\d{5}$/.test(zip)) {
      setError('Please enter a valid 5-digit ZIP code.');
      setLoading(false);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const location = zipLookup[zip as keyof typeof zipLookup];
    
    if (!location) {
      setError('ZIP code not found in our database. We currently support major U.S. cities.');
      setLoading(false);
      return;
    }

    setConfirmed(location);
    setLocation(location);
    setLoading(false);
  }

  function handleContinue() {
    navigate('/vibe-check');
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-light tracking-tight text-cream">
            Where do you vote?
          </h1>
          <p className="text-base text-slate leading-relaxed">
            Enter your ZIP code to see candidates on your ballot
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
              placeholder="12345"
              aria-label="ZIP code"
              disabled={loading}
              className="w-full rounded-xl border border-glass-border bg-glass-bg px-6 py-4 text-center text-2xl font-light tracking-widest text-cream placeholder-lavender/50 outline-none backdrop-blur-sm transition focus:border-lavender/40 focus:bg-glass-hover disabled:opacity-50"
            />
          </div>

          {error && (
            <p role="alert" className="text-center text-sm text-disagree">{error}</p>
          )}

          {confirmed && (
            <p className="text-center text-sm font-medium text-agree">
              ✓ {confirmed.city}, {confirmed.state}
            </p>
          )}

          {!confirmed ? (
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[52px] rounded-xl border border-slate/30 bg-slate/20 px-6 py-3.5 font-medium text-cream backdrop-blur-sm transition hover:border-slate/50 hover:bg-slate/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full min-h-[52px] rounded-xl border border-agree/30 bg-agree/20 px-6 py-3.5 font-medium text-cream backdrop-blur-sm transition hover:border-agree/50 hover:bg-agree/30 active:scale-[0.98]"
            >
              Start Vibe Check →
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
