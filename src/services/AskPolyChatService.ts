import type { ChatMessage, LocationResult } from '../types';

const API_URL = '/api/chat';

function getErrorMessage(status: number): string {
  switch (status) {
    case 429:
      return 'Please try again in a moment.';
    case 500:
    default:
      return 'Could not generate a response. Please try again.';
  }
}

export async function sendMessage(
  question: string,
  location: LocationResult,
  history: ChatMessage[],
): Promise<ChatMessage> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, location, history }),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  const data = await response.json();
  return {
    role: 'assistant',
    content: data.content,
    timestamp: data.timestamp ?? Date.now(),
  };
}
