import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { sendMessage } from '../services/AskPolyChatService';
import type { ChatMessage } from '../types';

const EXAMPLE_PROMPTS = [
  "What's on my ballot?",
  'Explain ranked choice voting',
  'Who represents me?',
];

export default function AskPolyChat() {
  const { location, chatHistory, setChatHistory } = useAppContext();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastQuestionRef = useRef<string>('');

  const canSend = input.trim() !== '' && !loading;

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, error]);

  async function handleSend(question?: string) {
    const q = (question ?? input).trim();
    if (!q || !location) return;
    const userMessage: ChatMessage = { role: 'user', content: q, timestamp: Date.now() };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);
    setError(null);
    lastQuestionRef.current = q;
    try {
      const assistantMessage = await sendMessage(q, location, chatHistory);
      setChatHistory([...updatedHistory, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    if (!lastQuestionRef.current) return;
    handleSend(lastQuestionRef.current);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && canSend) handleSend();
  }

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <h1 className="mb-1 text-center text-2xl font-bold" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Ask Poly</h1>
        <p className="mb-2 text-center text-sm" style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Ask questions about policies, candidates, or civic topics.
        </p>
        {location && (
          <p className="mb-6 text-center text-xs" style={{ color: '#E7ECEF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Answers informed by your location: {location.city}, {location.state}
          </p>
        )}

        {chatHistory.length === 0 && !loading && (
          <div className="mb-6 space-y-2">
            <p className="text-xs font-medium" style={{ color: '#E7ECEF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>Try asking:</p>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => handleSend(prompt)}
                className="block w-full min-h-[44px] rounded-xl bg-white border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm">
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto pb-4" role="log" aria-live="polite">
          {chatHistory.map((msg, i) => (
            <div key={`${msg.timestamp}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#6096BA] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-900 shadow-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-400 shadow-md">
                Thinking…
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <p>{error}</p>
              <button type="button" onClick={handleRetry}
                className="mt-2 min-h-[44px] min-w-[44px] rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-200 transition">
                Retry
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Poly a question…"
            className="min-h-[44px] flex-1 rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6096BA] shadow-sm"
          />
          <button type="button" onClick={() => handleSend()} disabled={!canSend}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#274C77] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6096BA] disabled:opacity-40 disabled:cursor-not-allowed">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
