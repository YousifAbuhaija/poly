// Feature: dynamic-civic-data, Property 10: Successful API response stored in state
import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../../context/AppContext';
import type { LocationResult, Candidate, IssueScore } from '../../types';
import { useState } from 'react';

// Arbitraries
const issueScoreArb: fc.Arbitrary<IssueScore> = fc.constantFrom(
  1 as const, -1 as const, 0 as const,
);

const locationArb: fc.Arbitrary<LocationResult> = fc.record({
  city: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  county: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  state: fc.stringMatching(/^[A-Z]{2}$/),
});

const candidateArb: fc.Arbitrary<Candidate> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  office: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  district: fc.stringMatching(/^[A-Za-z0-9][A-Za-z0-9 ]{0,13}[A-Za-z0-9]$/),
  state: fc.stringMatching(/^[A-Z]{2}$/),
  county: fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,18}[A-Za-z]$/),
  bio: fc.string({ minLength: 0, maxLength: 50 }),
  positions: fc.dictionary(
    fc.stringMatching(/^issue-\d{1,3}$/),
    issueScoreArb,
  ) as fc.Arbitrary<Record<string, IssueScore>>,
});

const civicDataResultArb = fc.record({
  location: locationArb,
  candidates: fc.array(candidateArb, { minLength: 0, maxLength: 8 }),
  isFallback: fc.constant(false as const),
});

afterEach(() => {
  cleanup();
});

describe('Property 10: Successful API response stored in state', () => {
  /**
   * Validates: Requirements 5.3
   *
   * For any CivicDataResult with isFallback === false, when the location
   * and candidates are stored in AppContext via setCandidates, setLocation,
   * and setFallbackMode, the resulting state should contain the exact same
   * location, candidates, and isFallbackMode === false.
   */
  it('AppContext state matches the stored CivicDataResult when isFallback is false', () => {
    // Captured state from inside the provider
    let capturedState: {
      location: LocationResult | null;
      candidates: Candidate[];
      isFallbackMode: boolean;
    } | null = null;

    // Triggers to call context setters from outside React render
    let triggerStore: ((data: {
      location: LocationResult;
      candidates: Candidate[];
    }) => void) | null = null;

    function TestConsumer() {
      const ctx = useAppContext();
      const [ready, setReady] = useState(false);

      // Expose a trigger function on first render
      if (!triggerStore) {
        triggerStore = (data) => {
          act(() => {
            ctx.setLocation(data.location);
            ctx.setCandidates(data.candidates);
            ctx.setFallbackMode(false);
          });
          setReady(true);
        };
      }

      // Capture state after updates
      capturedState = {
        location: ctx.location,
        candidates: ctx.candidates,
        isFallbackMode: ctx.isFallbackMode,
      };

      return <div data-testid="ready">{ready ? 'yes' : 'no'}</div>;
    }

    fc.assert(
      fc.property(civicDataResultArb, (result) => {
        cleanup();
        capturedState = null;
        triggerStore = null;

        render(
          <AppProvider>
            <TestConsumer />
          </AppProvider>,
        );

        // Simulate storing the successful API response in context
        act(() => {
          triggerStore!({
            location: result.location,
            candidates: result.candidates,
          });
        });

        // Verify state matches the input
        expect(capturedState).not.toBeNull();
        expect(capturedState!.location).toEqual(result.location);
        expect(capturedState!.candidates).toEqual(result.candidates);
        expect(capturedState!.isFallbackMode).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
