import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import CandidateCard from '../../components/CandidateCard';
import type { MatchResult, IssueStatement, IssueScore, Candidate } from '../../types';

// Stable issue pool for generating agreements/disagreements
const issuePool: IssueStatement[] = Array.from({ length: 10 }, (_, i) => ({
  id: `issue-${String(i + 1).padStart(3, '0')}`,
  text: `Issue statement ${i + 1}`,
  category: `Category${i + 1}`,
}));

const issueIds = issuePool.map((i) => i.id);

// Arbitraries — use alphanumeric names without leading/trailing spaces
const issueScoreArb: fc.Arbitrary<IssueScore> = fc.constantFrom(
  1 as const, -1 as const, 0 as const,
);

const candidateArb: fc.Arbitrary<Candidate> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  office: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  district: fc.stringMatching(/^[A-Za-z0-9][A-Za-z0-9 ]{0,13}[A-Za-z0-9]$/),
  state: fc.stringMatching(/^[A-Z]{2}$/),
  county: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  bio: fc.string({ minLength: 0, maxLength: 50 }),
  positions: fc.dictionary(
    fc.constantFrom(...issueIds),
    issueScoreArb,
  ) as fc.Arbitrary<Record<string, IssueScore>>,
});

const matchResultArb: fc.Arbitrary<MatchResult> = fc.record({
  candidate: candidateArb,
  matchPercentage: fc.integer({ min: 0, max: 100 }),
  agreements: fc.shuffledSubarray(issueIds, { minLength: 0, maxLength: 3 }),
  disagreements: fc.shuffledSubarray(issueIds, { minLength: 0, maxLength: 2 }),
});

afterEach(() => {
  cleanup();
});

// Feature: poly-mvp, Property 8: Match Result Display Completeness
describe('Property 8: Match Result Display Completeness', () => {
  /**
   * Validates: Requirements 3.4
   *
   * For any MatchResult, the rendered CandidateCard should contain the
   * candidate's name, office, district, match percentage value, up to 3
   * agreement issue labels, and up to 2 disagreement issue labels.
   */
  it('rendered CandidateCard contains name, office, district, match percentage, agreements, and disagreements', () => {
    fc.assert(
      fc.property(matchResultArb, (result: MatchResult) => {
        cleanup();

        const { container } = render(
          <CandidateCard result={result} issues={issuePool} onTap={() => {}} />,
        );

        const text = container.textContent ?? '';

        // Name is rendered
        expect(text).toContain(result.candidate.name);

        // Office is rendered
        expect(text).toContain(result.candidate.office);

        // District is rendered
        expect(text).toContain(result.candidate.district);

        // Match percentage is rendered
        expect(text).toContain(`${result.matchPercentage}%`);

        // Up to 3 agreements rendered with their category labels
        for (const issueId of result.agreements) {
          const label = issuePool.find((i) => i.id === issueId)?.category ?? issueId;
          expect(text).toContain(label);
        }

        // Up to 2 disagreements rendered with their category labels
        for (const issueId of result.disagreements) {
          const label = issuePool.find((i) => i.id === issueId)?.category ?? issueId;
          expect(text).toContain(label);
        }
      }),
      { numRuns: 100 },
    );
  });
});
