import type { PolicyExplanation, LocationResult } from '../types';

const API_URL = '/api/translate';

function getErrorMessage(status: number): string {
  switch (status) {
    case 422:
      return 'Could not read document';
    case 429:
      return 'Please try again in a moment';
    case 500:
    default:
      return 'Could not process document';
  }
}

export async function explainPolicy(
  content: string,
  location: LocationResult,
): Promise<PolicyExplanation> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, location }),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  const data = await response.json();
  return {
    whatItDoes: data.whatItDoes,
    whyItMatters: data.whyItMatters,
    whoDecides: data.whoDecides,
  };
}

export async function explainPolicyPdf(
  file: File,
  location: LocationResult,
): Promise<PolicyExplanation> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('location', JSON.stringify(location));

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  const data = await response.json();
  return {
    whatItDoes: data.whatItDoes,
    whyItMatters: data.whyItMatters,
    whoDecides: data.whoDecides,
  };
}
