import { describe, it, expect } from 'vitest';
import {
  buildPrompt,
  validateScore,
  parseBedrockResponse,
  createPositionInferrer,
  type BedrockClient,
} from '../../services/PositionInferrer';

const sampleIssues = [
  { id: 'issue-001', text: 'Increase funding for public schools' },
  { id: 'issue-002', text: 'Invest in public transportation' },
  { id: 'issue-003', text: 'Raise the minimum wage' },
];

const sampleCandidate = {
  name: 'Jane Doe',
  office: 'State Senator',
  bio: 'Jane Doe has served as a state legislator for 8 years.',
};

describe('buildPrompt', () => {
  it('includes candidate name, office, and bio', () => {
    const prompt = buildPrompt(sampleCandidate, sampleIssues);
    expect(prompt).toContain('Candidate: Jane Doe');
    expect(prompt).toContain('Office: State Senator');
    expect(prompt).toContain('Bio: Jane Doe has served');
  });

  it('includes nonpartisan framing', () => {
    const prompt = buildPrompt(sampleCandidate, sampleIssues);
    expect(prompt).toContain('nonpartisan political analyst');
    expect(prompt).toContain('based solely on publicly available information');
  });

  it('formats each issue as issueId: issueText', () => {
    const prompt = buildPrompt(sampleCandidate, sampleIssues);
    expect(prompt).toContain('issue-001: Increase funding for public schools');
    expect(prompt).toContain('issue-002: Invest in public transportation');
    expect(prompt).toContain('issue-003: Raise the minimum wage');
  });

  it('requests JSON output format', () => {
    const prompt = buildPrompt(sampleCandidate, sampleIssues);
    expect(prompt).toContain('Respond as JSON');
  });
});

describe('validateScore', () => {
  it('accepts 1, -1, and 0', () => {
    expect(validateScore(1)).toBe(1);
    expect(validateScore(-1)).toBe(-1);
    expect(validateScore(0)).toBe(0);
  });

  it('clamps invalid numbers to 0', () => {
    expect(validateScore(2)).toBe(0);
    expect(validateScore(-2)).toBe(0);
    expect(validateScore(0.5)).toBe(0);
  });

  it('clamps non-numeric values to 0', () => {
    expect(validateScore('1')).toBe(0);
    expect(validateScore(null)).toBe(0);
    expect(validateScore(undefined)).toBe(0);
  });
});

describe('parseBedrockResponse', () => {
  it('parses valid JSON response', () => {
    const response = '{ "issue-001": 1, "issue-002": -1, "issue-003": 0 }';
    const result = parseBedrockResponse(response, sampleIssues);
    expect(result).toEqual({
      'issue-001': 1,
      'issue-002': -1,
      'issue-003': 0,
    });
  });

  it('extracts JSON from markdown code fences', () => {
    const response = '```json\n{ "issue-001": 1, "issue-002": 0, "issue-003": -1 }\n```';
    const result = parseBedrockResponse(response, sampleIssues);
    expect(result).toEqual({
      'issue-001': 1,
      'issue-002': 0,
      'issue-003': -1,
    });
  });

  it('clamps invalid scores to 0', () => {
    const response = '{ "issue-001": 5, "issue-002": "yes", "issue-003": -1 }';
    const result = parseBedrockResponse(response, sampleIssues);
    expect(result).toEqual({
      'issue-001': 0,
      'issue-002': 0,
      'issue-003': -1,
    });
  });

  it('sets missing issue IDs to 0', () => {
    const response = '{ "issue-001": 1 }';
    const result = parseBedrockResponse(response, sampleIssues);
    expect(result).toEqual({
      'issue-001': 1,
      'issue-002': 0,
      'issue-003': 0,
    });
  });

  it('throws on completely invalid JSON', () => {
    expect(() => parseBedrockResponse('not json', sampleIssues)).toThrow();
  });
});

describe('createPositionInferrer', () => {
  it('returns inferred positions from Bedrock response', async () => {
    const mockClient: BedrockClient = {
      invokeModel: async () => '{ "issue-001": 1, "issue-002": -1, "issue-003": 0 }',
    };
    const inferrer = createPositionInferrer(mockClient);
    const result = await inferrer.inferPositions(sampleCandidate, sampleIssues);
    expect(result).toEqual({
      'issue-001': 1,
      'issue-002': -1,
      'issue-003': 0,
    });
  });

  it('returns all zeros on Bedrock failure', async () => {
    const mockClient: BedrockClient = {
      invokeModel: async () => { throw new Error('Bedrock unavailable'); },
    };
    const inferrer = createPositionInferrer(mockClient);
    const result = await inferrer.inferPositions(sampleCandidate, sampleIssues);
    expect(result).toEqual({
      'issue-001': 0,
      'issue-002': 0,
      'issue-003': 0,
    });
  });

  it('returns all zeros when Bedrock returns invalid JSON', async () => {
    const mockClient: BedrockClient = {
      invokeModel: async () => 'This is not JSON at all',
    };
    const inferrer = createPositionInferrer(mockClient);
    const result = await inferrer.inferPositions(sampleCandidate, sampleIssues);
    expect(result).toEqual({
      'issue-001': 0,
      'issue-002': 0,
      'issue-003': 0,
    });
  });

  it('passes the correct prompt to the Bedrock client', async () => {
    let capturedPrompt = '';
    const mockClient: BedrockClient = {
      invokeModel: async (prompt: string) => {
        capturedPrompt = prompt;
        return '{ "issue-001": 0, "issue-002": 0, "issue-003": 0 }';
      },
    };
    const inferrer = createPositionInferrer(mockClient);
    await inferrer.inferPositions(sampleCandidate, sampleIssues);
    expect(capturedPrompt).toContain('Candidate: Jane Doe');
    expect(capturedPrompt).toContain('nonpartisan');
  });
});
