import type { PositionInferrer } from './CivicDataLambda';
import type { IssueScore } from '../types';

/**
 * Bedrock client interface — injected for testability.
 */
export interface BedrockClient {
  invokeModel(prompt: string): Promise<string>;
}

/**
 * Builds the structured prompt sent to Bedrock for position inference.
 */
export function buildPrompt(
  candidate: { name: string; office: string; bio: string },
  issues: { id: string; text: string }[],
): string {
  const issueLines = issues.map((i) => `${i.id}: ${i.text}`).join('\n');

  return `You are a nonpartisan political analyst. Given the following candidate information
and list of policy issues, infer the candidate's likely position on each issue
based solely on publicly available information.

Candidate: ${candidate.name}
Office: ${candidate.office}
Bio: ${candidate.bio}

For each issue below, respond with exactly one of:
  1 (likely supports)
  -1 (likely opposes)
  0 (insufficient information to determine)

Issues:
${issueLines}

Respond as JSON: { "issueId": score, ... }`;
}

/**
 * Validates and clamps a single score value to 1, -1, or 0.
 */
export function validateScore(value: unknown): IssueScore {
  if (value === 1 || value === -1 || value === 0) {
    return value as IssueScore;
  }
  return 0;
}

/**
 * Parses the Bedrock response string into a validated positions map.
 * Extracts JSON from the response (handles markdown code fences),
 * then validates each score is exactly 1, -1, or 0.
 */
export function parseBedrockResponse(
  responseText: string,
  issues: { id: string; text: string }[],
): { [issueId: string]: IssueScore } {
  // Try to extract JSON from the response — it may be wrapped in code fences
  let jsonStr = responseText.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);

  const result: { [issueId: string]: IssueScore } = {};
  for (const issue of issues) {
    result[issue.id] = validateScore(parsed[issue.id]);
  }
  return result;
}

/**
 * Returns a fallback positions map with all scores set to 0.
 */
function fallbackPositions(
  issues: { id: string; text: string }[],
): { [issueId: string]: IssueScore } {
  const result: { [issueId: string]: IssueScore } = {};
  for (const issue of issues) {
    result[issue.id] = 0;
  }
  return result;
}

/**
 * Creates a PositionInferrer backed by the given Bedrock client.
 */
export function createPositionInferrer(
  bedrockClient: BedrockClient,
): PositionInferrer {
  return {
    async inferPositions(
      candidate: { name: string; office: string; bio: string },
      issues: { id: string; text: string }[],
    ): Promise<{ [issueId: string]: IssueScore }> {
      try {
        const prompt = buildPrompt(candidate, issues);
        const responseText = await bedrockClient.invokeModel(prompt);
        return parseBedrockResponse(responseText, issues);
      } catch {
        // On any Bedrock failure, return all positions as 0
        return fallbackPositions(issues);
      }
    },
  };
}
