import type { LocationResult, IssueProfile } from '../types';

const API_BASE = 'https://v2hjkw2n4g.execute-api.us-east-1.amazonaws.com/prod';

interface UserRecord {
  userId: string;
  userName: string;
  email: string;
  location: LocationResult | null;
  issueProfile: IssueProfile;
  quizComplete: boolean;
  updatedAt: string;
}

export async function fetchUser(userId: string): Promise<UserRecord | null> {
  try {
    const res = await fetch(`${API_BASE}/user/${userId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GET failed: ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn('Failed to fetch user from API:', err);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ user: UserRecord | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 401) {
      const body = await res.json();
      return { user: null, error: body.error || 'Invalid email or password.' };
    }
    if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
    const user = await res.json();
    return { user, error: null };
  } catch (err) {
    console.warn('Sign-in failed:', err);
    return { user: null, error: 'Something went wrong. Please try again.' };
  }
}

interface SaveUserData {
  userName: string;
  email: string;
  location: LocationResult | null;
  issueProfile: IssueProfile;
  quizComplete: boolean;
  password?: string;
}

export async function saveUser(userId: string, data: SaveUserData): Promise<void> {
  try {
    await fetch(`${API_BASE}/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('Failed to save user to API:', err);
  }
}
