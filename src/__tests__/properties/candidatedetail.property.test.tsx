import { describe, it, expect, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import type { Candidate, IssueScore, IssueStatement } from '../../types';

// Stable issue pool for generating positions
const issuePool: IssueStatement[] = Array.from({ length: 10 }, (_, i) => ({
  id: `issue-${String(i + 1).padStart(3, '0')}`,
  text: `Issue statement ${i + 1}`,
  category: `Category${i + 1}`,
}));

const issueIds = issuePool.map((i) => i.id);

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockParamId = '';
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: mockParamId }),
  useNavigate: () => mockNavigate,
}));

// Mock DataLoader
vi.mock('../../services/DataLoader', () => ({
  loadCandidates: () => mockCandidates,
  loadElections: () => [],
  loadIssues: () => issuePool,
}));

// Mock AppContext
vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    issueProfile: {},
    location: null,
  }),
}));

let mockCandidates: Candidate[] = [];

// Arbitraries
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
  bio: fc.stringMatching(/^[A-Za-z][A-Za-z .,]{4,48}[A-Za-z.]$/),
  positions: fc.dictionary(
    fc.constantFrom(...issueIds),
    issueScoreArb,
    { minKeys: 1 },
  ) as fc.Arbitrary<Record<string, IssueScore>>,
});


afterEach(() => {
  cleanup();
  mockCandidates = [];
  mockParamId = '';
  mockNavigate.mockReset();
});

// Feature: poly-mvp, Property 9: Candidate Detail Completeness
describe('Property 9: Candidate Detail Completeness', () => {
  /**
   * Validates: Requirements 4.1, 4.3, 4.4
   *
   * For any candidate from Candidate_Data, the CandidateDetailView should
   * display the candidate's name, office, district, bio, and all issue
   * positions held by that candidate.
   */
  it('rendered CandidateDetail contains name, office, district, bio, and all issue positions', async () => {
    // Dynamic import so mocks are in place
    const { default: CandidateDetail } = await import('../../components/CandidateDetail');

    fc.assert(
      fc.property(candidateArb, (candidate: Candidate) => {
        cleanup();

        // Set up mocks for this iteration
        mockParamId = candidate.id;
        mockCandidates = [candidate];

        const { getByTestId } = render(<CandidateDetail />);

        // Requirement 4.1: name, office, and district are displayed
        const nameEl = getByTestId('candidate-name');
        expect(nameEl.textContent).toBe(candidate.name);

        const officeEl = getByTestId('candidate-office');
        expect(officeEl.textContent).toContain(candidate.office);
        expect(officeEl.textContent).toContain(candidate.district);

        // Requirement 4.3: bio is displayed
        const bioEl = getByTestId('candidate-bio');
        expect(bioEl.textContent).toBe(candidate.bio);

        // Requirement 4.4: all issue positions are displayed
        const positionsEl = getByTestId('candidate-positions');
        const positionsText = positionsEl.textContent ?? '';

        for (const [issueId, score] of Object.entries(candidate.positions)) {
          // Each position should have its label rendered
          const issue = issuePool.find((i) => i.id === issueId);
          if (issue) {
            expect(positionsText).toContain(issue.category);
          }

          // Each position should show the score label
          const expectedLabel = score === 1 ? 'Agree' : score === -1 ? 'Disagree' : 'No position';
          expect(positionsText).toContain(expectedLabel);
        }
      }),
      { numRuns: 100 },
    );
  });
});
