import { describe, it, expect, vi, beforeEach } from 'vitest';
import { explainPolicy, explainPolicyPdf } from '../../services/NoReadTranslatorService';
import type { LocationResult } from '../../types';

const mockLocation: LocationResult = {
  city: 'Beverly Hills',
  county: 'Los Angeles',
  state: 'CA',
};

const mockExplanation = {
  whatItDoes: 'Increases school funding by 10%',
  whyItMatters: 'Affects local schools in Los Angeles',
  whoDecides: 'State legislature votes on this bill',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('explainPolicy', () => {
  it('sends POST with JSON body and returns parsed PolicyExplanation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockExplanation), { status: 200 }),
    );

    const result = await explainPolicy('Some policy text', mockLocation);

    expect(fetch).toHaveBeenCalledWith('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Some policy text', location: mockLocation }),
    });
    expect(result).toEqual(mockExplanation);
  });

  it('throws user-friendly message on 500 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 500 }),
    );

    await expect(explainPolicy('text', mockLocation)).rejects.toThrow(
      'Could not process document',
    );
  });

  it('throws user-friendly message on 422 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 422 }),
    );

    await expect(explainPolicy('text', mockLocation)).rejects.toThrow(
      'Could not read document',
    );
  });

  it('throws user-friendly message on 429 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 429 }),
    );

    await expect(explainPolicy('text', mockLocation)).rejects.toThrow(
      'Please try again in a moment',
    );
  });
});

describe('explainPolicyPdf', () => {
  it('sends POST with FormData and returns parsed PolicyExplanation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockExplanation), { status: 200 }),
    );

    const file = new File(['pdf content'], 'policy.pdf', { type: 'application/pdf' });
    const result = await explainPolicyPdf(file, mockLocation);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/translate');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);

    const formData = options.body as FormData;
    expect(formData.get('file')).toBeInstanceOf(File);
    expect(formData.get('location')).toBe(JSON.stringify(mockLocation));

    expect(result).toEqual(mockExplanation);
  });

  it('throws user-friendly message on API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('', { status: 500 }),
    );

    const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    await expect(explainPolicyPdf(file, mockLocation)).rejects.toThrow(
      'Could not process document',
    );
  });
});
