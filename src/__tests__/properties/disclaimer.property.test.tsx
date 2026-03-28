// Feature: dynamic-civic-data, Property 9: AI disclaimer rendering
import { describe, it, expect, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import CandidateCard from '../../components/CandidateCard';
import type { Candidate, IssueScore, IssueStatement, MatchResult } from '../../types';

// Stable issue pool
const issuePool: IssueStatement[] = Array.from({ length: 10 }, (_, i) => ({
  id: `issue-${String(i + 1).padStart(3, '0')}`,
  text: `Issue statement ${i + 1}`,
  category: `Category${i + 1}`,
}));

const issueIds = issuePool.map((i) => i.id);

// Mock react-router-dom for CandidateDetail
const mockNavigate = vi.fn();
let mockParamId = '';
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: mockParamId }),
  useNavigate: () => mockNavigate,
}));

// Mock DataLoader for CandidateDetail
let mockCandidates: Candidate[] = [];
vi.mock('../../services/DataLoader', () => ({
  loadCandidates: () => mockCandidates,
  loadElections: () => [],
  loadIssues: () => issuePool,
}));

// Mock AppContext for CandidateDetail
vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    issueProfile: {},
    location: null,
  }),
}));

const DISCLAIMER_TEXT =
  'Issue positions were inferred by AI from public information and may not reflect this candidate\'s actual stated positions.';

// Arbitraries
const issueScoreArb: fc.Arbitrary<IssueScore> = fc.constantFrom(1 as const, -1 as const, 0 as const);

const inferredCandidateArb: fc.Arbitrary<Candidate> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  office: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  district: fc.stringMatching(/^[A-Za-z0-9][A-Za-z0-9 ]{0,13}[A-Za-z0-9]$/),
  state: fc.stringMatching(/^[A-Z]{2}$/),
  county: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  bio: fc.stringMatching(/^[A-Za-z][A-Za-z .,]{4,48}[A-Za-z.]$/),
  positions: fc.dictionary(fc.constantFrom(...issueIds), issueScoreArb, { minKeys: 1 }) as fc.Arbitrary<
    Record<string, IssueScore>
  >,
  positionsInferred: fc.constant(true as const),
});

const matchResultArb: fc.Arbitrary<MatchResult> = inferredCandidateArb.chain((candidate) =>
  fc.record({
    candidate: fc.constant(candidate),
    matchPercentage: fc.integer({ min: 0, max: 100 }),
    agreements: fc.shuffledSubarray(issueIds, { minLength: 0, maxLength: 3 }),
    disagreements: fc.shuffledSubarray(issueIds, { minLength: 0, maxLength: 2 }),
  }),
);

afterEach(() => {
  cleanup();
  mockCandidates = [];
  mockParamId = '';
  mockNavigate.mockReset();
});

describe('Property 9: AI disclaimer rendering', () => {
  /**
   * Validates: Requirements 4.1, 4.2, 4.3
   *
   * For any candidate with positionsInferred === true, both CandidateCard
   * and CandidateDetail should render the AI disclaimer text.
   */
  it('CandidateCard renders AI disclaimer when positionsInferred is true', () => {
    fc.assert(
      fc.property(matchResultArb, (result: MatchResult) => {
        cleanup();

        const { getByTestId } = render(
          <CandidateCard result={result} issues={issuePool} onTap={() => {}} />,
        );

        const disclaimer = getByTestId('ai-disclaimer');
        expect(disclaimer).toBeTruthy();
        expect(disclaimer.textContent).toContain(DISCLAIMER_TEXT);
      }),
      { numRuns: 100 },
    );
  });

  it('CandidateDetail renders AI disclaimer when positionsInferred is true', async () => {
    const { default: CandidateDetail } = await import('../../components/CandidateDetail');

    fc.assert(
      fc.property(inferredCandidateArb, (candidate: Candidate) => {
        cleanup();

        mockParamId = candidate.id;
        mockCandidates = [candidate];

        const { getByTestId } = render(<CandidateDetail />);

        const disclaimer = getByTestId('ai-disclaimer');
        expect(disclaimer).toBeTruthy();
        expect(disclaimer.textContent).toContain(DISCLAIMER_TEXT);
      }),
      { numRuns: 100 },
    );
  });
});
