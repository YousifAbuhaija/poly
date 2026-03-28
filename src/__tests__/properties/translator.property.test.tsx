import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup, within } from '@testing-library/react';
import ExplanationCard from '../../components/ExplanationCard';
import type { PolicyExplanation } from '../../types';

// Arbitrary for PolicyExplanation with non-empty string fields
const policyExplanationArb: fc.Arbitrary<PolicyExplanation> = fc.record({
  whatItDoes: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .,;:!?'-]{4,98}[A-Za-z.]$/),
  whyItMatters: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .,;:!?'-]{4,98}[A-Za-z.]$/),
  whoDecides: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 .,;:!?'-]{4,98}[A-Za-z.]$/),
});

// Card configuration matching the NoReadTranslator component pattern
const cardConfig = [
  { icon: '📋', title: 'What it does', field: 'whatItDoes' as const },
  { icon: '💡', title: 'Why it matters to you', field: 'whyItMatters' as const },
  { icon: '🏛️', title: 'Who decides', field: 'whoDecides' as const },
];

afterEach(() => {
  cleanup();
});

// Feature: poly-mvp, Property 11: Policy Explanation Structure
describe('Property 11: Policy Explanation Structure', () => {
  /**
   * Validates: Requirements 5.3, 5.4
   *
   * For any PolicyExplanation with non-empty whatItDoes, whyItMatters, and
   * whoDecides fields, rendering three ExplanationCards (one per field) should
   * produce exactly three cards, and each card should contain its respective
   * body text.
   */
  it('renders exactly three ExplanationCards with correct content for any PolicyExplanation', () => {
    fc.assert(
      fc.property(policyExplanationArb, (explanation: PolicyExplanation) => {
        cleanup();

        const { container, getAllByTestId } = render(
          <>
            {cardConfig.map((card) => (
              <ExplanationCard
                key={card.field}
                icon={card.icon}
                title={card.title}
                body={explanation[card.field]}
                loading={false}
              />
            ))}
          </>,
        );

        // Requirement 5.4: exactly three ExplanationCards are rendered
        const cards = getAllByTestId('explanation-card');
        expect(cards).toHaveLength(3);

        // Requirement 5.3: each card contains its respective body text
        for (let i = 0; i < cardConfig.length; i++) {
          const cardEl = cards[i];
          const cardText = cardEl.textContent ?? '';
          const expectedBody = explanation[cardConfig[i].field];
          expect(cardText).toContain(expectedBody);
        }
      }),
      { numRuns: 100 },
    );
  });
});
