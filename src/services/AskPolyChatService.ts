import type { ChatMessage, LocationResult } from '../types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const CURRENTS_API_URL = 'https://api.currentsapi.services/v1/search';

// Cache news results to avoid burning through the 20/day limit
const newsCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

// Only fetch news for civic/political questions, not every message
function isCivicQuestion(question: string): boolean {
  const keywords = ['law', 'bill', 'election', 'vote', 'ballot', 'candidate', 'policy',
    'congress', 'senate', 'mayor', 'council', 'tax', 'housing', 'transit', 'budget',
    'proposition', 'measure', 'governor', 'president', 'legislation', 'news'];
  const q = question.toLowerCase();
  return keywords.some((k) => q.includes(k));
}

async function fetchNewsContext(question: string, location: LocationResult): Promise<string> {
  const apiKey = import.meta.env.VITE_CURRENTS_API_KEY;
  if (!apiKey || apiKey === 'your_currents_key_here') return '';
  if (!isCivicQuestion(question)) return '';

  // Use a simplified cache key based on key terms + location
  const cacheKey = `${question.slice(0, 40)}-${location.state}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.result;

  try {
    const params = new URLSearchParams({
      keywords: `${question} ${location.state}`,
      language: 'en',
      limit: '3',
      type: '1',
    });

    const res = await fetch(`${CURRENTS_API_URL}?${params}`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) return '';
    const data = await res.json();
    if (!data.news?.length) return '';

    const summaries = data.news
      .map((a: { title: string; description: string }) => `- ${a.title}: ${a.description}`)
      .join('\n');

    const result = `\nRecent news for context:\n${summaries}\n`;
    newsCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  } catch {
    return '';
  }
}

export async function sendMessage(
  question: string,
  location: LocationResult,
  history: ChatMessage[],
): Promise<ChatMessage> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Configuration error: API key is missing.');

  // Rate limiting check
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  const newsContext = await fetchNewsContext(question, location);

  const systemPrompt = `You are Poly, a civic assistant for Gen Z users. The user is in ${location.city}, ${location.state}.
Keep responses short, simple, and conversational — like texting a knowledgeable friend.
- No long paragraphs. Use 2-3 sentences max per point.
- Avoid markdown formatting like bold or headers. Plain text only.
- Skip the disclaimers and filler. Get to the point.
- Stay neutral and factual. Never tell users who to vote for.
${newsContext ? `Use the following recent news to inform your answer if relevant:${newsContext}` : ''}`;

  const mappedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const contents = [
    ...mappedHistory,
    { role: 'user', parts: [{ text: question }] },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error('Rate limit reached. Please wait 60 seconds before trying again.');
    }
    throw new Error(errorData?.error?.message || 'Could not generate a response. Please try again.');
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';

  return { role: 'assistant', content, timestamp: Date.now() };
}
