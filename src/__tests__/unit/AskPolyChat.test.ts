import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessage } from '../../services/AskPolyChatService';
import type { ChatMessage, LocationResult } from '../../types';

const mockLocation: LocationResult = {
  city: 'Beverly Hills',
  county: 'Los Angeles',
  state: 'CA',
};

const mockHistory: ChatMessage[] = [
  { role: 'user', content: 'What is a ballot measure?', timestamp: 1000 },
  { role: 'assistant', content: 'A ballot measure is...', timestamp: 1001 },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('sendMessage', () => {
  it('sends POST with question, location, and history and returns assistant ChatMessage', async () => {
    const mockResponse = { content: 'Here is the answer.', timestamp: 2000 };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await sendMessage('How do I register to vote?', mockLocation, mockHistory);

    expect(fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'How do I register to vote?',
        location: mockLocation,
        history: mockHistory,
      }),
    });
    expect(result).toEqual({
      role: 'assistant',
      content: 'Here is the answer.',
      timestamp: 2000,
    });
  });

  it('uses Date.now() as fallback when response has no timestamp', async () => {
    const now = 9999;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ content: 'Response without timestamp' }), { status: 200 }),
    );

    const result = await sendMessage('Question', mockLocation, []);

    expect(result.role).toBe('assistant');
    expect(result.content).toBe('Response without timestamp');
    expect(result.timestamp).toBe(now);
  });

  it('throws user-friendly message on 500 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 500 }),
    );

    await expect(sendMessage('question', mockLocation, [])).rejects.toThrow(
      'Could not generate a response. Please try again.',
    );
  });

  it('throws user-friendly message on 429 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 429 }),
    );

    await expect(sendMessage('question', mockLocation, [])).rejects.toThrow(
      'Please try again in a moment.',
    );
  });

  it('throws default error message for unknown status codes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 503 }),
    );

    await expect(sendMessage('question', mockLocation, [])).rejects.toThrow(
      'Could not generate a response. Please try again.',
    );
  });

  it('sends empty history array when no prior messages exist', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ content: 'First response', timestamp: 3000 }), { status: 200 }),
    );

    const result = await sendMessage('First question', mockLocation, []);

    expect(fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'First question',
        location: mockLocation,
        history: [],
      }),
    });
    expect(result.role).toBe('assistant');
    expect(result.content).toBe('First response');
  });
});
