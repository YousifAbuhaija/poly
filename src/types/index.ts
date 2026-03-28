export interface LocationResult {
  city: string;
  county: string;
  state: string;
}

export interface IssueStatement {
  id: string;
  text: string;
  category: string;
}

export type IssueScore = 1 | -1 | 0;

export interface IssueProfile {
  [issueId: string]: IssueScore;
}

export interface Candidate {
  id: string;
  name: string;
  office: string;
  district: string;
  state: string;
  county: string;
  bio: string;
  positions: { [issueId: string]: IssueScore };
  positionsInferred?: boolean;
}

export interface MatchResult {
  candidate: Candidate;
  matchPercentage: number;
  agreements: string[];
  disagreements: string[];
}

export interface PolicyExplanation {
  whatItDoes: string;
  whyItMatters: string;
  whoDecides: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AppState {
  location: LocationResult | null;
  issueProfile: IssueProfile;
  chatHistory: ChatMessage[];
  isOnboarded: boolean;
  candidates: Candidate[];
  isFallbackMode: boolean;
}

export interface Election {
  id: string;
  name: string;
  date: string;
  state: string;
  county: string;
  offices: string[];
}

export interface Policy {
  id: string;
  title: string;
  text: string;
  category: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface CivicDataResult {
  location: LocationResult;
  candidates: Candidate[];
  isFallback: boolean;
}

export interface CivicApiSuccessResponse {
  location: LocationResult;
  candidates: Candidate[];
  source: "api" | "cache";
}

export interface CivicApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}
