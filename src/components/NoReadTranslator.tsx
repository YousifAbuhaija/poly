import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { explainPolicy, explainPolicyPdf } from '../services/NoReadTranslatorService';
import type { PolicyExplanation } from '../types';
import ExplanationCard from './ExplanationCard';

export default function NoReadTranslator() {
  const { location } = useAppContext();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PolicyExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmpty = text.trim() === '' && file === null;

  async function handleSubmit() {
    if (!location || isEmpty) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let explanation: PolicyExplanation;
      if (file) {
        explanation = await explainPolicyPdf(file, location);
      } else {
        explanation = await explainPolicy(text.trim(), location);
      }
      setResult(explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process document');
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    handleSubmit();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  }

  const cards: { icon: string; title: string; key: keyof PolicyExplanation }[] = [
    { icon: '📋', title: 'What it does', key: 'whatItDoes' },
    { icon: '💡', title: 'Why it matters', key: 'whyItMatters' },
    { icon: '🏛', title: 'Who decides', key: 'whoDecides' },
  ];

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-12 pb-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-xl font-semibold text-text-primary text-center">Translator</h1>
        <p className="mt-1 mb-2 text-center text-sm text-text-secondary">
          Paste policy text or upload a PDF for a plain-language breakdown.
        </p>
        {location && (
          <p className="mb-6 text-center text-xs text-text-muted">
            Tailored for {location.city}, {location.state}
          </p>
        )}

        {/* Text input */}
        <label htmlFor="policy-text" className="block text-xs font-medium text-text-muted mb-1.5">
          Policy text
        </label>
        <textarea
          id="policy-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste policy text here…"
          rows={5}
          className="w-full rounded-[var(--radius-md)] bg-surface-input border border-border-default p-4 text-sm text-text-primary placeholder-text-muted resize-none transition"
        />

        {/* File upload */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] rounded-[var(--radius-md)] bg-surface-input border border-border-default px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover transition"
          >
            {file ? file.name : 'Upload PDF'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {file && (
            <button
              type="button"
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="text-xs text-text-muted hover:text-text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || loading}
          className="mt-4 w-full min-h-[48px] rounded-[var(--radius-md)] bg-poly-primary text-white text-sm font-medium py-3 transition-colors hover:bg-poly-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing…' : 'Explain this policy'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 card bg-disagree-subtle border-disagree/20 p-4">
            <p className="text-sm text-disagree">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 min-h-[44px] rounded-[var(--radius-sm)] bg-disagree-subtle px-4 py-2 text-xs font-medium text-disagree hover:bg-disagree/20 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Explanation cards */}
        {(loading || result) && (
          <div className="mt-6 space-y-3">
            {cards.map((card) => (
              <ExplanationCard
                key={card.key}
                icon={card.icon}
                title={card.title}
                body={result ? result[card.key] : ''}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
