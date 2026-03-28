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

export async function saveUser(userId: string, data: Omit<UserRecord, 'userId' | 'updatedAt'>): Promise<void> {
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
