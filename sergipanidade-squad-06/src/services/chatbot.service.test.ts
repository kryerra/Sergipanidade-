import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchChatBotReply, setChatBotApiKeyForTest } from './chatbot.service';

describe('ChatBot service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    setChatBotApiKeyForTest(null);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('returns error when API key is missing', async () => {
    setChatBotApiKeyForTest('');

    const result = await fetchChatBotReply('hello');

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'NO_API_KEY' }),
      }),
    );
  });

  it('returns error when fetch response is not ok', async () => {
    setChatBotApiKeyForTest('test-key');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: vi.fn().mockResolvedValue({ error: { message: 'Invalid token' } }),
    } as unknown as Response);

    const result = await fetchChatBotReply('hello');

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({
          code: 'HTTP_401',
          message: expect.stringContaining('Invalid token'),
        }),
      }),
    );
  });

  it('returns the first chat choice content when response is ok', async () => {
    setChatBotApiKeyForTest('test-key');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Olá, eu sou o Serginho!' } }],
      }),
    } as unknown as Response);

    const result = await fetchChatBotReply('hello');

    expect(result).toEqual({ ok: true, data: 'Olá, eu sou o Serginho!' });
  });

  it('returns error when response body is invalid JSON', async () => {
    setChatBotApiKeyForTest('test-key');
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Response);

    const result = await fetchChatBotReply('hello');

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({
          code: 'NO_RESPONSE_CONTENT',
          message: 'ChatBot returned an empty or invalid response.',
        }),
      }),
    );
  });

  it('returns error when fetch throws a network error', async () => {
    setChatBotApiKeyForTest('test-key');
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network failure'));

    const result = await fetchChatBotReply('hello');

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({
          code: 'Error',
          message: 'Network failure',
        }),
      }),
    );
  });
});
