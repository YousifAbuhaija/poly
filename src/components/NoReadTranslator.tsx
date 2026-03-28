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
    { icon: '🏛️', title: 'Who decides', key: 'whoDecides' },
  ];

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="mb-1 text-center text-2xl font-bold" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>No-Read Translator</h1>
        <p className="mb-2 text-center text-sm" style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Paste policy text or upload a PDF to get a plain-language breakdown.
        </p>
        {location && (
          <p className="mb-6 text-center text-xs" style={{ color: '#E7ECEF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Results tailored for {location.city}, {location.state} ({location.county} County)
          </p>
        )}

        <label htmlFor="policy-text" className="sr-only">Policy text</label>
        <textarea
          id="policy-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste policy text here…"
          rows={5}
          className="w-full rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#6096BA] shadow-sm"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            {file ? file.name : 'Upload PDF'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          {file && (
            <button type="button"
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="text-xs text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Remove file">✕</button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || loading}
          className="mt-4 w-full min-h-[44px] rounded-xl bg-[#274C77] text-white font-semibold text-sm py-3 transition hover:bg-[#6096BA] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing…' : 'Explain This Policy'}
        </button>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}
              className="mt-2 min-h-[44px] min-w-[44px] rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-200 transition">
              Retry
            </button>
          </div>
        )}

        {(loading || result) && (
          <div className="mt-6 space-y-4">
            {cards.map((card) => (
              <ExplanationCard key={card.key} icon={card.icon} title={card.title}
                body={result ? result[card.key] : ''} loading={loading} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
