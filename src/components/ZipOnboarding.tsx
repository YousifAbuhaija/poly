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
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <p className="mb-8 text-center text-xs font-medium tracking-widest uppercase text-text-muted">
          Step 1 of 3
        </p>

        <h1 className="text-2xl font-semibold text-text-primary text-center">
          Where do you vote?
        </h1>
        <p className="mt-2 mb-8 text-center text-sm text-text-secondary">
          We'll show candidates and elections on your ballot.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="zip-input" className="block text-xs font-medium text-text-muted mb-1.5">
              ZIP Code
            </label>
            <input
              id="zip-input"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 90210"
              aria-label="ZIP code"
              className="w-full rounded-[var(--radius-md)] bg-surface-input border border-border-default px-4 py-3 text-base text-text-primary placeholder-text-muted transition"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-disagree">{error}</p>
          )}

          {confirmed && (
            <div className="rounded-[var(--radius-md)] bg-agree-subtle border border-agree/20 px-4 py-3">
              <p className="text-sm text-agree">{formatLocation(confirmed)}</p>
            </div>
          )}

          {!confirmed ? (
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-[var(--radius-md)] bg-poly-primary py-3 text-sm font-medium text-white transition-colors hover:bg-poly-primary-hover active:scale-[0.99]"
            >
              Look up my area
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full min-h-[48px] rounded-[var(--radius-md)] bg-poly-primary py-3 text-sm font-medium text-white transition-colors hover:bg-poly-primary-hover active:scale-[0.99]"
            >
              Continue
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
