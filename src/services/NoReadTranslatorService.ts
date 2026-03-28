import type { PolicyExplanation, LocationResult } from '../types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(content: string, location: LocationResult): Promise<PolicyExplanation> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Configuration error: API key is missing.');

  const prompt = `You are a policy explainer for young voters in ${location.city}, ${location.state}.
A user has submitted the following policy text. Break it down into exactly 3 parts.
Respond ONLY with valid JSON in this exact format, no extra text:
{
  "whatItDoes": "1-2 sentence plain English summary of what the policy does",
  "whyItMatters": "1-2 sentences on how this affects a young person or local resident in ${location.city}",
  "whoDecides": "1 sentence on which government body or authority controls this"
}

Policy text:
${content}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 429) throw new Error('Please try again in a moment');
    throw new Error(err?.error?.message || 'Could not process document');
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      whatItDoes: parsed.whatItDoes ?? '',
      whyItMatters: parsed.whyItMatters ?? '',
      whoDecides: parsed.whoDecides ?? '',
    };
  } catch {
    throw new Error('Could not parse response. Please try again.');
  }
}

export async function explainPolicy(
  content: string,
  location: LocationResult,
): Promise<PolicyExplanation> {
  return callGemini(content, location);
}

export async function explainPolicyPdf(
  file: File,
  location: LocationResult,
): Promise<PolicyExplanation> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Configuration error: API key is missing.');

  // Read PDF as base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

  const prompt = `You are a policy explainer for young voters in ${location.city}, ${location.state}.
A user has submitted a policy document. Break it down into exactly 3 parts.
Respond ONLY with valid JSON in this exact format, no extra text:
{
  "whatItDoes": "1-2 sentence plain English summary of what the policy does",
  "whyItMatters": "1-2 sentences on how this affects a young person or local resident in ${location.city}",
  "whoDecides": "1 sentence on which government body or authority controls this"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data
            }
          }
        ]
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 429) throw new Error('Please try again in a moment');
    throw new Error(err?.error?.message || 'Could not process document');
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      whatItDoes: parsed.whatItDoes ?? '',
      whyItMatters: parsed.whyItMatters ?? '',
      whoDecides: parsed.whoDecides ?? '',
    };
  } catch {
    throw new Error('Could not parse response. Please try again.');
  }
}
