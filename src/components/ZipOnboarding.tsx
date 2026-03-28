import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { isValidZip, formatLocation } from '../engines/LocationResolver';
import { fetchCivicData } from '../services/CandidateService';
import type { LocationResult } from '../types';

export default function ZipOnboarding() {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<LocationResult | null>(null);
  const { setLocation, setCandidates } = useAppContext();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setConfirmed(null);

    if (!isValidZip(zip)) {
      setError('Please enter a valid 5-digit ZIP code.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await fetchCivicData(zip);

      setCandidates(result.candidates);
      setLocation(result.location);
      setConfirmed(result.location);
    } catch {
      setError('ZIP code not available yet. Try one of our demo ZIPs like 90210 or 10001.');
    } finally {
      setIsLoading(false);
    }
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

          {isLoading ? (
            <div className="flex justify-center py-3" role="status" aria-label="Loading">
              <svg className="h-8 w-8 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : !confirmed ? (
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
