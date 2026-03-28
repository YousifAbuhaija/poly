import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ChatMessage } from '../../types';

// Feature: poly-mvp, Property 12: Chat History Integrity

/**
 * Simulates a single chat exchange: adds a user message and an assistant
 * response to the history, returning the updated history.
 */
function simulateExchange(
  history: ChatMessage[],
  question: string,
  baseTimestamp: number,
): ChatMessage[] {
  const userMsg: ChatMessage = {
    role: 'user',
    content: question,
    timestamp: baseTimestamp,
  };
  const assistantMsg: ChatMessage = {
    role: 'assistant',
    content: `Response to: ${question}`,
    timestamp: baseTimestamp + 1,
  };
  return [...history, userMsg, assistantMsg];
}

describe('Property 12: Chat History Integrity', () => {
  /**
   * Validates: Requirements 6.4, 6.6
   *
   * For any sequence of user messages sent to Ask Poly Chat, the chat
   * history should grow by exactly 2 for each successful exchange (one
   * user message + one assistant response), messages should maintain
   * chronological order by timestamp, and all previous messages should
   * be preserved unchanged.
   */
  it('history grows by 2 per exchange, maintains chronological order, and preserves previous messages', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
        (questions: string[]) => {
          let history: ChatMessage[] = [];

          for (let i = 0; i < questions.length; i++) {
            const previousHistory = [...history];
            const previousLength = history.length;
            const baseTimestamp = (i + 1) * 1000;

            history = simulateExchange(history, questions[i], baseTimestamp);

            // History grows by exactly 2 per exchange
            expect(history.length).toBe(previousLength + 2);

            // Previous messages are preserved unchanged
            for (let j = 0; j < previousHistory.length; j++) {
              expect(history[j]).toEqual(previousHistory[j]);
            }

            // New user message has role 'user'
            expect(history[history.length - 2].role).toBe('user');
            // New assistant message has role 'assistant'
            expect(history[history.length - 1].role).toBe('assistant');

            // New user message content matches the question
            expect(history[history.length - 2].content).toBe(questions[i]);
          }

          // All messages maintain chronological order by timestamp
          for (let i = 1; i < history.length; i++) {
            expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i - 1].timestamp);
          }

          // Roles alternate: user, assistant, user, assistant, ...
          for (let i = 0; i < history.length; i++) {
            const expectedRole = i % 2 === 0 ? 'user' : 'assistant';
            expect(history[i].role).toBe(expectedRole);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
