import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

    if (!isValidZip(zip)) {
      setError('Please enter a valid 5-digit ZIP code.');
      return;
    }

    const result = resolve(zip);
    if (!result) {
      setError('ZIP code not recognized. Please try another.');
      return;
    }

    setConfirmed(result);
    setLocation(result);
  }

  function handleContinue() {
    navigate('/vibe-check');
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 backdrop-blur-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">Where do you vote?</h1>
        <p className="mb-6 text-center text-sm text-slate-300">
          Enter your ZIP code so we can show candidates on your ballot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="zip-input" className="sr-only">ZIP code</label>
          <input
            id="zip-input"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 90210"
            aria-label="ZIP code"
            className="w-full rounded-lg bg-white/20 px-4 py-3 text-center text-lg text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {error && (
            <p role="alert" className="text-center text-sm text-red-400">{error}</p>
          )}

          {confirmed && (
            <p className="text-center text-sm text-emerald-400">
              {formatLocation(confirmed)}
            </p>
          )}

          {!confirmed ? (
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              Look up my area
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full min-h-[44px] rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              Continue to Vibe Check
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
